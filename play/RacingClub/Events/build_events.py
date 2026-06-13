#!/usr/bin/env python3
"""Build Events JSON artifacts from hand-authored source/*.json.

Data model (per the Events plan):
    Series (賽季/系列賽, optional集合) ──binds──▶ Event (一場活動)
                                                  └─ Match (單場勝負/計時) ─ Result (玩家成績)

Events is the entry point for ALL activities; Series only groups the points
events. Standings only apply to events whose series_id is set + is_points_event.

Run:  python build_events.py   (writes ./data/*.json)
Edit source/*.json then rebuild; the static pages + (future) Discord feed only
ever read this output. No database, no external network.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "source"
OUT = ROOT / "data"
SCHEMA_VERSION = "0.1.0"

ROUTE_FILE_MAP = {
    "overview": "summary.json",
    "calendar": "events.json",
    "series": "series.json",
    "matches": "matches.json",
    "results": "results.json",
    "standings": "standings.json",
    "players": "players_stats.json",
    "tracks": "tracks_stats.json",
    "vehicles": "vehicles_stats.json",
    "teams": "teams_stats.json",
}

EVENT_TYPE_LABELS = {
    "time_attack": ("計時賽", "Time Attack"),
    "single_elimination": ("單淘汰賽", "Single Elimination"),
    "casual_meet": ("休閒車聚", "Casual Meet"),
    "exhibition": ("表演賽", "Exhibition"),
}
STATUS_LABELS = {
    "finished": ("已結束", "Finished"),
    "scheduled": ("排定中", "Scheduled"),
    "live": ("進行中", "Live"),
    "cancelled": ("取消", "Cancelled"),
}
ROUND_LABELS = {
    "final": ("決賽", "Final"),
    "semi_final": ("準決賽", "Semi-final"),
    "quarter_final": ("八強", "Quarter-final"),
    "ro16": ("十六強", "Round of 16"),
    "group": ("分組", "Group"),
}


def load(name: str) -> Any:
    path = SRC / name
    if not path.exists():
        return [] if name != "meta.json" else {}
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(name: str, payload: Any) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / name).open("w", encoding="utf-8", newline="\n") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def fmt_lap(ms: int | None) -> str:
    if not ms:
        return "-"
    m, rem = divmod(int(ms), 60000)
    s, mil = divmod(rem, 1000)
    return f"{m}:{s:02d}.{mil:03d}"


def date_only(iso: str | None) -> str:
    return (iso or "")[:10]


def type_label(code: str) -> tuple[str, str]:
    return EVENT_TYPE_LABELS.get(code, (code, code))


def status_label(code: str) -> tuple[str, str]:
    return STATUS_LABELS.get(code, (code, code))


def round_label(code: str) -> tuple[str, str]:
    return ROUND_LABELS.get(code, (code or "", code or ""))


def main() -> None:
    meta = load("meta.json")
    players_meta = meta.get("players", {})
    teams_meta = meta.get("teams", {})
    tracks_meta = meta.get("tracks", {})
    vehicles_meta = meta.get("vehicles", {})

    series_list = load("series.json")
    events = load("events.json")
    matches = load("matches.json")
    results = load("results.json")

    def player_name(pid: str) -> str:
        return (players_meta.get(pid) or {}).get("name") or pid

    def team_name(tid: str) -> str:
        return (teams_meta.get(tid) or {}).get("name") or tid

    def track_name(tid: str) -> str:
        return (tracks_meta.get(tid) or {}).get("name") or tid

    def vehicle_name(vid: str) -> str:
        return (vehicles_meta.get(vid) or {}).get("name") or vid

    events_by_id = {e["event_id"]: e for e in events}
    matches_by_event: dict[str, list] = defaultdict(list)
    for m in matches:
        matches_by_event[m["event_id"]].append(m)
    results_by_match: dict[str, list] = defaultdict(list)
    for r in results:
        results_by_match[r["match_id"]].append(r)
    match_event = {m["match_id"]: m["event_id"] for m in matches}

    # ── enrich results / matches ──
    enriched_results = []
    for r in results:
        ev = events_by_id.get(match_event.get(r["match_id"], ""), {})
        enriched_results.append({
            **r,
            "event_id": match_event.get(r["match_id"], ""),
            "series_id": ev.get("series_id"),
            "player_name": player_name(r.get("player_id", "")),
            "team_name": team_name(r.get("team_id", "")) if r.get("team_id") else "",
            "vehicle_name": vehicle_name(r.get("vehicle_id", "")) if r.get("vehicle_id") else "",
            "time_text": fmt_lap(r.get("time_ms")),
        })
    er_by_match: dict[str, list] = defaultdict(list)
    for r in enriched_results:
        er_by_match[r["match_id"]].append(r)

    enriched_matches = []
    for m in matches:
        rows = sorted(er_by_match.get(m["match_id"], []), key=lambda x: x.get("position") or 99)
        rl_zh, rl_en = round_label(m.get("round", ""))
        enriched_matches.append({
            **m,
            "round_label_zh": rl_zh,
            "round_label_en": rl_en,
            "track_name": track_name(m.get("track_id", "")),
            "winner_name": player_name(m["winner_id"]) if m.get("winner_id") else "",
            "results": rows,
        })
    em_by_event: dict[str, list] = defaultdict(list)
    for m in enriched_matches:
        em_by_event[m["event_id"]].append(m)

    # ── per-event derived (participants, podium, winner) ──
    def event_participants(eid: str) -> list[str]:
        seen, order = set(), []
        for m in em_by_event.get(eid, []):
            for r in m["results"]:
                pid = r.get("player_id")
                if pid and pid not in seen:
                    seen.add(pid)
                    order.append(pid)
        return order

    def event_winner(eid: str) -> dict[str, Any]:
        # final match winner, else position-1 of the richest match
        ms = em_by_event.get(eid, [])
        final = next((m for m in ms if m.get("round") == "final"), None)
        target = final or (max(ms, key=lambda m: len(m["results"])) if ms else None)
        if not target:
            return {}
        if target.get("winner_id"):
            return {"player_id": target["winner_id"], "name": player_name(target["winner_id"])}
        top = next((r for r in target["results"] if r.get("position") == 1), None)
        return {"player_id": top["player_id"], "name": top["player_name"]} if top else {}

    enriched_events = []
    for e in events:
        eid = e["event_id"]
        tl_zh, tl_en = type_label(e.get("event_type", ""))
        sl_zh, sl_en = status_label(e.get("status", ""))
        winner = event_winner(eid)
        parts = event_participants(eid)
        series = next((s for s in series_list if s["series_id"] == e.get("series_id")), None)
        enriched_events.append({
            **e,
            "type_label_zh": tl_zh, "type_label_en": tl_en,
            "status_label_zh": sl_zh, "status_label_en": sl_en,
            "date": date_only(e.get("start_time")),
            "track_names": [track_name(t) for t in (e.get("track_ids") or [])],
            "series_name": series["display_name"] if series else "",
            "participant_count": len(parts),
            "participant_names": [player_name(p) for p in parts],
            "winner_name": winner.get("name", ""),
            "winner_id": winner.get("player_id", ""),
            "match_count": len(em_by_event.get(eid, [])),
            "href": f"./event.html?id={eid}",
        })
    ee_by_id = {e["event_id"]: e for e in enriched_events}

    # ── standings (only series + points events) ──
    standings_by_series: dict[str, dict[str, Any]] = {}
    for s in series_list:
        sid = s["series_id"]
        player_pts: Counter = Counter()
        team_pts: Counter = Counter()
        player_team: dict[str, str] = {}
        for r in enriched_results:
            ev = ee_by_id.get(r["event_id"], {})
            if ev.get("series_id") != sid or not ev.get("is_points_event"):
                continue
            pts = r.get("points") or 0
            player_pts[r["player_id"]] += pts
            if r.get("team_id"):
                team_pts[r["team_id"]] += pts
                player_team[r["player_id"]] = r["team_id"]
        players_rows = [
            {"rank": i, "player_id": pid, "name": player_name(pid),
             "team_id": player_team.get(pid, ""), "team_name": team_name(player_team.get(pid, "")) if player_team.get(pid) else "",
             "points": pts}
            for i, (pid, pts) in enumerate(player_pts.most_common(), start=1)
        ]
        teams_rows = [
            {"rank": i, "team_id": tid, "name": team_name(tid), "points": pts}
            for i, (tid, pts) in enumerate(team_pts.most_common(), start=1)
        ]
        standings_by_series[sid] = {"players": players_rows, "teams": teams_rows}

    # ── series (meta + event list + progress + standings) ──
    enriched_series = []
    for s in series_list:
        sid = s["series_id"]
        evs = sorted([e for e in enriched_events if e.get("series_id") == sid],
                     key=lambda e: e.get("start_time") or "")
        done = sum(1 for e in evs if e.get("status") == "finished")
        nxt = next((e for e in evs if e.get("status") == "scheduled"), None)
        last = next((e for e in reversed(evs) if e.get("status") == "finished"), None)
        enriched_series.append({
            **s,
            "event_ids": [e["event_id"] for e in evs],
            "events": [{"event_id": e["event_id"], "title": e["title"], "title_en": e.get("title_en", ""),
                        "date": e["date"], "status": e["status"],
                        "status_label_zh": e["status_label_zh"], "status_label_en": e["status_label_en"],
                        "type_label_zh": e["type_label_zh"], "type_label_en": e["type_label_en"],
                        "winner_name": e["winner_name"], "href": e["href"]} for e in evs],
            "progress_done": done, "progress_total": len(evs),
            "next_event": ({"title": nxt["title"], "date": nxt["date"], "href": nxt["href"]} if nxt else None),
            "last_event": ({"title": last["title"], "date": last["date"], "winner_name": last["winner_name"], "href": last["href"]} if last else None),
            "standings": standings_by_series.get(sid, {"players": [], "teams": []}),
            "href": f"./series.html?id={sid}",
        })

    # ── player / team / track / vehicle stats ──
    p_part: dict[str, set] = defaultdict(set)
    p_win = Counter(); p_loss = Counter(); p_podium = Counter(); p_pts = Counter()
    p_veh: dict[str, Counter] = defaultdict(Counter)
    p_team: dict[str, str] = {}
    for r in enriched_results:
        pid = r["player_id"]
        p_part[pid].add(r["event_id"])
        if r.get("status") == "win" or r.get("position") == 1:
            p_win[pid] += 1
        if r.get("status") == "loss":
            p_loss[pid] += 1
        if (r.get("position") or 99) <= 3:
            p_podium[pid] += 1
        p_pts[pid] += r.get("points") or 0
        if r.get("vehicle_id"):
            p_veh[pid][vehicle_name(r["vehicle_id"])] += 1
        if r.get("team_id"):
            p_team[pid] = r["team_id"]

    def win_rate(w: int, l: int) -> str:
        tot = w + l
        return f"{round(w / tot * 100)}%" if tot else "-"

    players_stats = sorted([
        {"player_id": pid, "name": player_name(pid),
         "team_id": p_team.get(pid, ""), "team_name": team_name(p_team.get(pid, "")) if p_team.get(pid) else "",
         "events": len(p_part[pid]), "wins": p_win[pid], "losses": p_loss[pid],
         "podiums": p_podium[pid], "points": p_pts[pid],
         "win_rate": win_rate(p_win[pid], p_loss[pid]),
         "top_vehicle": (p_veh[pid].most_common(1)[0][0] if p_veh[pid] else ""),
         "href": f"./players.html?id={pid}",
         "ta_href": f"../TimeAttack/player.html?id={pid}"}
        for pid in p_part
    ], key=lambda x: (-x["points"], -x["wins"], x["name"]))

    t_events: dict[str, set] = defaultdict(set)
    t_pts = Counter(); t_win = Counter(); t_members: dict[str, set] = defaultdict(set)
    for r in enriched_results:
        tid = r.get("team_id")
        if not tid:
            continue
        t_events[tid].add(r["event_id"])
        t_pts[tid] += r.get("points") or 0
        if r.get("status") == "win" or r.get("position") == 1:
            t_win[tid] += 1
        t_members[tid].add(r["player_id"])
    teams_stats = sorted([
        {"team_id": tid, "name": team_name(tid), "events": len(t_events[tid]),
         "points": t_pts[tid], "wins": t_win[tid],
         "members": [player_name(p) for p in sorted(t_members[tid])],
         "member_count": len(t_members[tid]),
         "href": f"./teams.html?id={tid}"}
        for tid in t_events
    ], key=lambda x: (-x["points"], -x["wins"], x["name"]))

    tr_events: dict[str, set] = defaultdict(set)
    tr_best: dict[str, int] = {}
    tr_matches = Counter()
    for m in enriched_matches:
        tid = m.get("track_id")
        if tid:
            tr_events[tid].add(m["event_id"])
            tr_matches[tid] += 1
    for r in enriched_results:
        m = next((mm for mm in enriched_matches if mm["match_id"] == r["match_id"]), None)
        if m and m.get("track_id") and r.get("time_ms"):
            tid = m["track_id"]
            if tid not in tr_best or r["time_ms"] < tr_best[tid]:
                tr_best[tid] = r["time_ms"]
    tracks_stats = sorted([
        {"track_id": tid, "name": track_name(tid), "events": len(tr_events[tid]),
         "matches": tr_matches[tid], "best_time_ms": tr_best.get(tid),
         "best_time_text": fmt_lap(tr_best.get(tid)),
         "href": f"./tracks.html?id={tid}",
         "ta_href": f"../TimeAttack/track.html?id={tid}"}
        for tid in tr_events
    ], key=lambda x: (-x["events"], x["name"]))

    v_use = Counter(); v_win = Counter(); v_best: dict[str, int] = {}; v_players: dict[str, set] = defaultdict(set)
    for r in enriched_results:
        vid = r.get("vehicle_id")
        if not vid:
            continue
        v_use[vid] += 1
        if r.get("status") == "win" or r.get("position") == 1:
            v_win[vid] += 1
        v_players[vid].add(r["player_id"])
        if r.get("time_ms") and (vid not in v_best or r["time_ms"] < v_best[vid]):
            v_best[vid] = r["time_ms"]
    vehicles_stats = sorted([
        {"vehicle_id": vid, "name": vehicle_name(vid), "uses": v_use[vid], "wins": v_win[vid],
         "win_rate": win_rate(v_win[vid], v_use[vid] - v_win[vid]),
         "best_time_text": fmt_lap(v_best.get(vid)),
         "drivers": [player_name(p) for p in sorted(v_players[vid])],
         "href": f"./vehicles.html?id={vid}",
         "ta_href": f"../TimeAttack/vehicle.html?id={vid}"}
        for vid in v_use
    ], key=lambda x: (-x["uses"], x["name"]))

    # ── overview summary (NOT points-first) ──
    finished = sorted([e for e in enriched_events if e.get("status") == "finished"],
                      key=lambda e: e.get("end_time") or e.get("start_time") or "", reverse=True)
    upcoming = sorted([e for e in enriched_events if e.get("status") == "scheduled"],
                      key=lambda e: e.get("start_time") or "")
    active_series = [s for s in enriched_series if s.get("status") == "active"]

    def result_line(e: dict) -> tuple[str, str]:
        if e.get("winner_name"):
            return (f"{e['winner_name']} 奪冠", f"{e['winner_name']} won")
        return ("已結束", "Finished")

    recent_results = []
    for e in finished[:5]:
        zh, en = result_line(e)
        recent_results.append({
            "event_id": e["event_id"], "title": e["title"], "title_en": e.get("title_en", ""),
            "date": e["date"], "type_label_zh": e["type_label_zh"], "type_label_en": e["type_label_en"],
            "summary_zh": zh, "summary_en": en, "href": e["href"]})

    upcoming_cards = [{
        "event_id": e["event_id"], "title": e["title"], "title_en": e.get("title_en", ""),
        "date": e["date"], "start_time": e.get("start_time"), "host": e.get("host", ""),
        "type_label_zh": e["type_label_zh"], "type_label_en": e["type_label_en"],
        "is_points_event": e.get("is_points_event", False), "href": e["href"]} for e in upcoming[:5]]

    series_cards = [{
        "series_id": s["series_id"], "display_name": s["display_name"], "display_name_en": s.get("display_name_en", ""),
        "status": s["status"], "progress_done": s["progress_done"], "progress_total": s["progress_total"],
        "next_event": s["next_event"], "last_event": s["last_event"],
        "standings_top": s["standings"]["players"][:3], "href": s["href"]} for s in active_series]

    summary = {
        "title_zh": "活動總覽", "title_en": "Events Overview",
        "description_zh": "Racing Club 所有活動、賽事與戰績的入口。系列賽(賽季)只是其中一種活動集合,不是所有活動的上位。",
        "description_en": "Entry point for every Racing Club activity, match, and record. Series (seasons) only group the points events — they are not above all activities.",
        "sidebar_zh": [
            "Events 收錄所有活動:計時賽、單淘汰賽、休閒車聚等。",
            "只有 series_id 不為空且為積分賽事,才會進入賽季積分榜。",
            "戰績重點在勝負/名次/賽制;開放計時紀錄請看 TimeAttack。",
        ],
        "sidebar_en": [
            "Events lists every activity: time attacks, knockouts, casual meets.",
            "Only points events with a series_id feed the season standings.",
            "Standings focus on wins/placement/format; open lap records live in TimeAttack.",
        ],
        "metric_cards": [
            {"label_zh": "活動總數", "label_en": "Events", "value": str(len(enriched_events)),
             "note_zh": "所有已排定與已完成活動", "note_en": "All scheduled and finished activities"},
            {"label_zh": "已完成", "label_en": "Finished", "value": str(len(finished)),
             "note_zh": "已結束並有結果的活動", "note_en": "Activities with final results"},
            {"label_zh": "進行中系列賽", "label_en": "Active Series", "value": str(len(active_series)),
             "note_zh": "目前進行中的賽季/系列賽", "note_en": "Seasons/series currently running"},
            {"label_zh": "即將舉辦", "label_en": "Upcoming", "value": str(len(upcoming)),
             "note_zh": "已排定尚未舉辦的活動", "note_en": "Scheduled, not yet held"},
        ],
        "recent_results": recent_results,
        "upcoming_events": upcoming_cards,
        "active_series": series_cards,
    }

    manifest = {
        "schema_version": SCHEMA_VERSION,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "build_state": "seed",
        "source_label": "play/RacingClub/Events/source/*.json",
        "routes": ROUTE_FILE_MAP,
        "event_types": [{"code": k, "label_zh": v[0], "label_en": v[1]} for k, v in EVENT_TYPE_LABELS.items()],
    }

    write_json("manifest.json", manifest)
    write_json("summary.json", summary)
    write_json("events.json", {"title_zh": "賽事日曆", "title_en": "Event Calendar",
                               "description_zh": "Racing Club 所有活動列表,可依主辦/語言/系列賽篩選。",
                               "description_en": "Every Racing Club activity; filter by host, language, or series.",
                               "events": sorted(enriched_events, key=lambda e: e.get("start_time") or "", reverse=True)})
    write_json("series.json", {"title_zh": "系列賽 / 賽季", "title_en": "Series / Seasons",
                               "series": enriched_series})
    write_json("matches.json", {"matches": enriched_matches})
    write_json("results.json", {"results": enriched_results})
    write_json("standings.json", {"standings": standings_by_series})
    write_json("players_stats.json", {"title_zh": "玩家戰績", "title_en": "Driver Records", "players": players_stats})
    write_json("teams_stats.json", {"title_zh": "車隊戰績", "title_en": "Team Records", "teams": teams_stats})
    write_json("tracks_stats.json", {"title_zh": "賽道戰績", "title_en": "Track Records", "tracks": tracks_stats})
    write_json("vehicles_stats.json", {"title_zh": "車輛戰績", "title_en": "Vehicle Records", "vehicles": vehicles_stats})

    print(f"events={len(enriched_events)} matches={len(enriched_matches)} results={len(enriched_results)} "
          f"series={len(enriched_series)} players={len(players_stats)} teams={len(teams_stats)}")


if __name__ == "__main__":
    main()
