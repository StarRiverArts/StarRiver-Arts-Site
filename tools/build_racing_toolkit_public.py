#!/usr/bin/env python3
"""Build website-side VRChat Racing Toolkit public projections.

Scope: website public/editorial data -> play/RacingClub/TimeAttack/vrc/toolkit/**.
The canonical SQLite database is deliberately out of scope.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

ROOT = Path(__file__).resolve().parents[1]
TA = ROOT / "play" / "RacingClub" / "TimeAttack"
DATA = TA / "data"
VRC = TA / "vrc"
OUT = VRC / "toolkit"
SOURCE = ROOT / "content" / "racing-toolkit"
REGISTRY = SOURCE / "owned-worlds.json"
INFO = SOURCE / "information.json"
EVENTS = DATA / "event-editorial.json"
BASE_URL = "https://starriverarts.github.io/StarRiver-Arts-Site/play/RacingClub/TimeAttack/vrc/"
SOURCE_ID = "project-t"
UTC = timezone.utc
FORBIDDEN = {"submission_note", "proof_text", "verified_by", "verified_at", "review_status", "moderation_note", "image_sha256", "access_token", "token"}
DEFAULT_POLICY = {"max_items_global": 6, "max_items_per_world": 6, "record_lifetime_days": 3, "completed_event_lifetime_days": 7, "upcoming_event_window_days": 7}


def load(path: Path, default: Any = None) -> Any:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else copy.deepcopy(default)


def now() -> datetime:
    return datetime.now(UTC).replace(microsecond=0)


def iso(dt: datetime) -> str:
    return dt.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_dt(value: Any, tz_name: str = "UTC") -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    raw = value.strip()
    try:
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw):
            return datetime.combine(date.fromisoformat(raw), time.min, ZoneInfo(tz_name)).astimezone(UTC)
        if raw.endswith("Z"):
            raw = raw[:-1] + "+00:00"
        dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=ZoneInfo(tz_name))
        return dt.astimezone(UTC)
    except (ValueError, TypeError, ZoneInfoNotFoundError):
        return None


def semantic(value: Any, root: bool = True) -> Any:
    if isinstance(value, dict):
        ignored = {"generated_at"}
        if root and value.get("schema") == "srvrc-worlds/1":
            ignored.add("updated")
        return {k: semantic(v, False) for k, v in value.items() if k not in ignored}
    if isinstance(value, list):
        return [semantic(v, False) for v in value]
    return value


def stable(path: Path, payload: dict[str, Any], stamp: datetime) -> dict[str, Any]:
    old = load(path, {})
    if isinstance(old, dict) and semantic(old) == semantic(payload):
        if isinstance(old.get("generated_at"), str):
            payload["generated_at"] = old["generated_at"]
        if payload.get("schema") == "srvrc-worlds/1" and isinstance(old.get("updated"), str):
            payload["updated"] = old["updated"]
        return payload
    payload["generated_at"] = iso(stamp)
    if payload.get("schema") == "srvrc-worlds/1":
        payload["updated"] = stamp.date().isoformat()
    return payload


def write(path: Path, payload: dict[str, Any], stamp: datetime, check: bool) -> int:
    payload = stable(path, payload, stamp)
    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == text:
        return 0
    if check:
        raise SystemExit(f"stale generated Racing Toolkit data: {path.relative_to(ROOT)}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return 1


def leaks(value: Any, p: str = "$") -> list[str]:
    out: list[str] = []
    if isinstance(value, dict):
        for k, v in value.items():
            if str(k).casefold() in FORBIDDEN:
                out.append(f"{p}.{k}")
            out.extend(leaks(v, f"{p}.{k}"))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            out.extend(leaks(v, f"{p}[{i}]"))
    return out


def sr_track(world_id: str) -> dict[str, Any]:
    obj = load(VRC / f"{world_id}.json", {})
    return obj if isinstance(obj, dict) and obj.get("schema") == "srvrc-track/1" else {}


def route_code(row: dict[str, Any]) -> str:
    if isinstance(row.get("route_id"), str):
        return row["route_id"]
    inner = row.get("route") if isinstance(row.get("route"), dict) else {}
    return str(inner.get("code") or "")


def route_name(row: dict[str, Any]) -> str:
    inner = row.get("route") if isinstance(row.get("route"), dict) else {}
    return str(inner.get("zh") or inner.get("en") or inner.get("code") or route_code(row))


def event_world(event: dict[str, Any]) -> str:
    return str(event.get("track_world_code") or "")


def normalize_routes(world: dict[str, Any], events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sr = sr_track(world["world_id"])
    sr_rows = sr.get("routes", []) if isinstance(sr.get("routes"), list) else []
    by_code = {route_code(r): r for r in sr_rows if isinstance(r, dict) and route_code(r)}
    configured = world.get("routes", []) if isinstance(world.get("routes"), list) else []
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for src in configured:
        if not isinstance(src, dict) or not src.get("route_id"):
            continue
        code = str(src["route_id"]); sr_row = by_code.get(code)
        item: dict[str, Any] = {"route_id": code, "name": str(src.get("name") or route_name(sr_row or {}) or code)}
        for key in ("direction", "type", "length_m", "difficulty", "from", "to"):
            if src.get(key) not in (None, ""):
                item[key] = src[key]
        item["has_leaderboard"] = bool(sr_row) or bool(src.get("has_leaderboard", False))
        item["has_event"] = any(event_world(e) == world["world_id"] and str(e.get("route_code") or "") in ("", code) for e in events)
        out.append(item); seen.add(code)
    for code, sr_row in by_code.items():
        if code in seen:
            continue
        out.append({"route_id": code, "name": route_name(sr_row), "direction": "other", "has_leaderboard": True, "has_event": any(event_world(e) == world["world_id"] and str(e.get("route_code") or "") in ("", code) for e in events)})
    return out


def world_payload(world: dict[str, Any], events: list[dict[str, Any]]) -> dict[str, Any]:
    sr = sr_track(world["world_id"])
    data: dict[str, Any] = {"name": world.get("name") or world["world_id"], "author": world.get("author", "StarRiver Arts"), "world_version": world.get("world_version", ""), "status": world.get("status", "development"), "vehicle_system": sr.get("system") or world.get("vehicle_system", "Unknown"), "description": world.get("description", ""), "routes": normalize_routes(world, events)}
    for key in ("project_t_link", "location", "access"):
        if world.get(key) not in (None, "", {}, []):
            data[key] = world[key]
    return {"contract": "world", "version": "1.0.0", "generated_at": "", "source_id": SOURCE_ID, "world_id": world["world_id"], "data": data}


def route_payload(world: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    data: dict[str, Any] = {"route_id": route["route_id"], "name": route.get("name") or route["route_id"], "direction": route.get("direction", "other"), "elevation_source": route.get("elevation_source", "draft"), "points": [], "checkpoints": []}
    for key in ("length_m", "total_ascent_m", "total_descent_m", "from", "to"):
        if route.get(key) not in (None, ""):
            data[key] = route[key]
    return {"contract": "route", "version": "1.0.0", "generated_at": "", "source_id": SOURCE_ID, "world_id": world["world_id"], "data": data}


def policy(info: dict[str, Any]) -> dict[str, int]:
    out = dict(DEFAULT_POLICY); src = info.get("policy", {}) if isinstance(info, dict) else {}
    for k in out:
        if isinstance(src.get(k), int) and src[k] >= 0:
            out[k] = src[k]
    return out


def manual_items(info: dict[str, Any], stamp: datetime) -> list[dict[str, Any]]:
    out = []
    for item in info.get("items", []) if isinstance(info, dict) and isinstance(info.get("items"), list) else []:
        if not isinstance(item, dict):
            continue
        start, end = parse_dt(item.get("valid_from")), parse_dt(item.get("valid_until"))
        if start and stamp < start or end and stamp > end:
            continue
        if all(isinstance(item.get(k), str) and item[k] for k in ("id", "scope", "text", "at")):
            out.append(copy.deepcopy(item))
    return out


def record_item(world: dict[str, Any], stamp: datetime, days: int) -> dict[str, Any] | None:
    sr = sr_track(world["world_id"]); records = sr.get("records") if isinstance(sr.get("records"), dict) else {}; tr = records.get("tr") if isinstance(records.get("tr"), dict) else None
    if not tr:
        return None
    at = parse_dt(tr.get("date"))
    if not at or stamp - at > timedelta(days=days + 1):
        return None
    label = str(tr.get("route") or ""); code = ""
    for row in sr.get("routes", []) if isinstance(sr.get("routes"), list) else []:
        if isinstance(row, dict) and route_name(row) == label:
            code = route_code(row); break
    text = f"TR: {tr.get('name', '')} 在 {world.get('name', world['world_id'])}" + (f" / {label}" if label else "") + (f" 以 {tr['t']} 打破賽道紀錄" if tr.get("t") else "")
    return {"id": f"auto-tr-{world['world_id']}-{tr.get('date','')}-{tr.get('t_ms','')}", "scope": "world", "kind": "record", "text": text, "at": iso(at), "priority": 50, "valid_from": iso(at), "valid_until": iso(at + timedelta(days=days + 1)), "target": {"world_id": world["world_id"], "route_id": code or None}, "record": {"route_id": code, "player": str(tr.get("name") or ""), "vehicle": str(tr.get("sub") or ""), "time_display": str(tr.get("t") or "")}}


def event_times(event: dict[str, Any]) -> tuple[datetime | None, datetime | None]:
    tz = str(event.get("timezone") or "Asia/Taipei")
    return parse_dt(event.get("starts_at"), tz), parse_dt(event.get("ends_at"), tz)


def event_news(event: dict[str, Any], stamp: datetime, pol: dict[str, int]) -> dict[str, Any] | None:
    event_id = str(event.get("event_id") or ""); title = str(event.get("title_zh") or event.get("title_en") or event_id)
    if not event_id:
        return None
    start, end = event_times(event); status = str(event.get("status") or "upcoming")
    if status == "ongoing":
        priority, text, until = 90, f"活動進行中：{title}", end or (start + timedelta(hours=12) if start else stamp + timedelta(hours=12))
    elif status == "upcoming":
        if not start or start < stamp or start - stamp > timedelta(days=pol["upcoming_event_window_days"]):
            return None
        priority, text, until = 80, f"即將舉行：{title}", start + timedelta(hours=6)
    elif status == "completed":
        if not start or stamp - start > timedelta(days=pol["completed_event_lifetime_days"] + 1):
            return None
        priority, text, until = 55, f"活動結果：{title}（已結束）", start + timedelta(days=pol["completed_event_lifetime_days"] + 1)
        results = event.get("results") if isinstance(event.get("results"), list) else []
        if results and isinstance(results[0], dict) and results[0].get("display_name"):
            text += f"｜冠軍 {results[0]['display_name']}"
    else:
        return None
    at = start or stamp; target: dict[str, Any] = {"event_id": event_id}
    if event.get("track_world_code"): target["world_id"] = event["track_world_code"]
    if event.get("route_code"): target["route_id"] = event["route_code"]
    return {"id": f"auto-event-{event_id}-{status}", "scope": "global", "kind": "event", "text": text, "at": iso(at), "priority": priority, "valid_from": iso(stamp if status == "ongoing" else at - timedelta(days=pol["upcoming_event_window_days"]) if status == "upcoming" else at), "valid_until": iso(until), "target": target}


def sort_key(item: dict[str, Any]) -> tuple[int, float]:
    at = parse_dt(item.get("at")) or datetime(1970, 1, 1, tzinfo=UTC)
    return int(item.get("priority") or 0), at.timestamp()


def limit(items: Iterable[dict[str, Any]], n: int) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for item in items:
        key = str(item.get("id") or "")
        if key and (key not in by_id or sort_key(item) > sort_key(by_id[key])):
            by_id[key] = item
    return sorted(by_id.values(), key=sort_key, reverse=True)[:n]


def targets(item: dict[str, Any], world_id: str) -> bool:
    if item.get("scope") in ("global", "project_t"):
        return True
    target = item.get("target") if isinstance(item.get("target"), dict) else {}
    return target.get("world_id") == world_id


def news_payload(world_id: str, items: list[dict[str, Any]]) -> dict[str, Any]:
    return {"contract": "news", "version": "1.0.0", "generated_at": "", "source_id": SOURCE_ID, "world_id": world_id, "data": {"items": items}}


def event_payload(event: dict[str, Any]) -> dict[str, Any]:
    tz = str(event.get("timezone") or "Asia/Taipei"); start = parse_dt(event.get("starts_at"), tz); results = event.get("results") if isinstance(event.get("results"), list) else []
    status = str(event.get("status") or "upcoming"); status = status if status in {"upcoming", "ongoing", "completed"} else "upcoming"
    data: dict[str, Any] = {"event_id": str(event.get("event_id") or ""), "name": str(event.get("title_zh") or event.get("title_en") or event.get("event_id") or "活動"), "status": status, "route_id": str(event.get("route_code") or ""), "host": str(event.get("organizer_zh") or event.get("organizer_en") or "VRRCTW"), "format": str(event.get("format_zh") or event.get("format_en") or ""), "rules_summary": str(event.get("summary_zh") or event.get("summary_en") or ""), "entrant_count": len(event.get("participant_player_ids") or []) or len(results), "schedule": [], "results": []}
    if start: data["starts_at"] = iso(start)
    for row in results:
        if isinstance(row, dict) and isinstance(row.get("rank"), int) and (row.get("display_name") or row.get("name")):
            out = {"place": row["rank"], "name": str(row.get("display_name") or row.get("name"))}
            if row.get("vehicle") or row.get("vehicle_name"): out["vehicle"] = str(row.get("vehicle") or row.get("vehicle_name"))
            data["results"].append(out)
    data["location"] = {"world_id": str(event.get("track_world_code") or ""), "world_name": str(event.get("track_zh") or event.get("track_en") or ""), "track_name": str(event.get("track_zh") or event.get("track_en") or ""), "route_id": str(event.get("route_code") or ""), "group_id": str(event.get("group_id") or ""), "world_url": str(event.get("world_url") or "")}
    reg = event.get("registration_zh") if isinstance(event.get("registration_zh"), list) else []
    data["participation"] = {"registration_required": False, "check_in_required": False, "join_method": "；".join(str(x) for x in reg if x), "notes": ""}
    data["vehicle_rules"] = {"system": str(event.get("system") or ""), "allowed": list(event.get("vehicle_model_codes") or []) if isinstance(event.get("vehicle_model_codes"), list) else [], "restricted": [], "notes": ""}
    return {"contract": "event", "version": "1.0.0", "generated_at": "", "source_id": SOURCE_ID, "world_id": "project-t", "data": data}


def select_event(events: list[dict[str, Any]], stamp: datetime) -> dict[str, Any] | None:
    ranked = []
    for event in events:
        start, _ = event_times(event)
        if not start or not event.get("event_id"): continue
        status = str(event.get("status") or "upcoming")
        if status == "ongoing": rank, order = 3, -abs((start - stamp).total_seconds())
        elif status == "upcoming" and start >= stamp: rank, order = 2, -(start - stamp).total_seconds()
        else: rank, order = 1, start.timestamp()
        ranked.append((rank, order, event))
    return max(ranked, key=lambda x: (x[0], x[1]))[2] if ranked else None


def manifest(worlds: list[dict[str, Any]]) -> dict[str, Any]:
    rows = []
    for world in worlds:
        wid = world["world_id"]
        routes = {r["route_id"]: f"toolkit/routes/{wid}__{r['route_id']}.json" for r in world.get("routes", []) if isinstance(r, dict) and r.get("route_id")}
        rows.append({"source_id": SOURCE_ID, "world_id": wid, "track_id": wid, "endpoints": {"world": f"toolkit/worlds/{wid}.json", "leaderboard": f"{wid}.json", "news": f"toolkit/news/{wid}.json", "event": "toolkit/events/current.json", "routes": routes, "players": "players.json", "vehicles": "vehicles.json", "teams": "teams.json", "world_directory": "toolkit/worlds.json"}})
    return {"schema": "project-t-toolkit-manifest/1", "generated_at": "", "base": BASE_URL, "worlds": rows, "runtime_refresh": {"status": "TODO", "note": "Periodic in-world polling is not implemented yet."}}


def directory(worlds: list[dict[str, Any]]) -> dict[str, Any]:
    rows = []
    for world in worlds:
        sr = sr_track(world["world_id"])
        rows.append({"code": world["world_id"], "zh": str(world.get("name") or world["world_id"]), "en": str(world.get("name_en") or world.get("name") or world["world_id"]), "system": str(sr.get("system") or world.get("vehicle_system") or "unknown").lower()})
    return {"schema": "srvrc-worlds/1", "generated_at": "", "updated": "", "worlds": rows}


def main() -> None:
    ap = argparse.ArgumentParser(); ap.add_argument("--check", action="store_true"); args = ap.parse_args(); stamp = now()
    registry = load(REGISTRY, {}); info = load(INFO, {}); raw_worlds = registry.get("worlds") if isinstance(registry, dict) else None
    if not isinstance(raw_worlds, list) or not raw_worlds: raise SystemExit("owned-worlds.json: worlds must be non-empty")
    worlds = [] ; seen: set[str] = set()
    for world in raw_worlds:
        if not isinstance(world, dict) or not world.get("world_id"): raise SystemExit("owned-worlds.json: every world needs world_id")
        wid = str(world["world_id"])
        if wid in seen: raise SystemExit(f"owned-worlds.json: duplicate {wid}")
        if world.get("status") not in {"development", "testing", "released"}: raise SystemExit(f"owned-worlds.json: invalid status for {wid}")
        seen.add(wid); worlds.append(world)
    event_doc = load(EVENTS, {}); events = event_doc.get("events", []) if isinstance(event_doc, dict) and isinstance(event_doc.get("events"), list) else []; events = [e for e in events if isinstance(e, dict)]
    pol = policy(info); changed = 0
    normalized: dict[str, list[dict[str, Any]]] = {}
    for world in worlds:
        wp = world_payload(world, events); changed += write(OUT / "worlds" / f"{world['world_id']}.json", wp, stamp, args.check); normalized[world["world_id"]] = wp["data"]["routes"]
        configured = {r.get("route_id"): r for r in world.get("routes", []) if isinstance(r, dict)}
        for route in normalized[world["world_id"]]:
            merged = dict(route); merged.update(configured.get(route["route_id"], {})); changed += write(OUT / "routes" / f"{world['world_id']}__{route['route_id']}.json", route_payload(world, merged), stamp, args.check)
    items = manual_items(info, stamp)
    for event in events:
        item = event_news(event, stamp, pol)
        if item: items.append(item)
    for world in worlds:
        item = record_item(world, stamp, pol["record_lifetime_days"])
        if item: items.append(item)
    changed += write(OUT / "news" / "global.json", news_payload("project-t", limit((x for x in items if x.get("scope") in {"global", "project_t", "event"}), pol["max_items_global"])), stamp, args.check)
    for world in worlds:
        changed += write(OUT / "news" / f"{world['world_id']}.json", news_payload(world["world_id"], limit((x for x in items if targets(x, world["world_id"])), pol["max_items_per_world"])), stamp, args.check)
    for event in events:
        if event.get("event_id"): changed += write(OUT / "events" / f"{event['event_id']}.json", event_payload(event), stamp, args.check)
    selected = select_event(events, stamp)
    if selected:
        ep = event_payload(selected); changed += write(OUT / "events" / "latest.json", copy.deepcopy(ep), stamp, args.check); changed += write(OUT / "events" / "current.json", copy.deepcopy(ep), stamp, args.check)
    changed += write(OUT / "manifest.json", manifest(worlds), stamp, args.check)
    changed += write(OUT / "index.json", {"contract": "project-t-toolkit-index", "version": "1.0.0", "generated_at": "", "source_id": SOURCE_ID, "manifest": "manifest.json", "worlds": "worlds.json", "records": "news/global.json", "event": "events/current.json", "players": "../players.json", "vehicles": "../vehicles.json", "teams": "../teams.json"}, stamp, args.check)
    changed += write(OUT / "worlds.json", directory(worlds), stamp, args.check)
    found = []
    for folder in ("worlds", "routes", "news", "events"):
        for path in (OUT / folder).glob("*.json") if (OUT / folder).exists() else []:
            for hit in leaks(load(path, {})): found.append(f"{path.relative_to(ROOT)}:{hit}")
    if found: raise SystemExit("forbidden private keys in public projection:\n" + "\n".join(found[:20]))
    print(f"Racing Toolkit public projection current; changed files: {changed}")


if __name__ == "__main__":
    main()
