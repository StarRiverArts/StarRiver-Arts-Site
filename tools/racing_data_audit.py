#!/usr/bin/env python3
"""Read-only checks for public Racing Hub JSON identities and contracts.

No fixed record totals: counts follow the current published snapshot.
Editorial gaps are warnings, not invented validation failures.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def current_route_rows(route_pairs, period_data):
    """Consume DATA's published membership; never infer completion times here."""
    scopes = period_data.get("scopes", [])
    scoped_routes = {(s["track_world_code"], s["route_code"]) for s in scopes}
    current_ids = {r["record_id"] for s in scopes for r in s["records"]
                   if r.get("period_id") == s["current_period_id"]}
    return [(world, route, [row for row in route.get("route_rows", [])
                           if (world, route["route_code"]) not in scoped_routes
                           or row["record_id"] in current_ids])
            for world, route in route_pairs]


def audit(root: Path) -> dict:
    base = root / "play/RacingClub/TimeAttack"
    data_dir = base / "data"
    load = lambda name: json.loads((data_dir / name).read_text(encoding="utf-8"))
    manifest, summary, tracks = (load(n) for n in ("manifest.json", "summary.json", "tracks.json"))
    trackmap, players, vehicles = (load(n) for n in ("trackmap.json", "players.json", "vehicles.json"))
    teams, generated, editorial = (load(n) for n in ("teams.json", "events.json", "event-editorial.json"))
    catalog = load("catalog.json")
    vrc = json.loads((base / "vrc/index.json").read_text(encoding="utf-8"))
    checks, warnings = [], []

    def check(code: str, ok: bool, **details):
        checks.append({"code": code, "pass": bool(ok), **details})

    def warn(code: str, **details):
        warnings.append({"code": code, **details})

    def unique(rows):
        return len(rows) == len(set(rows))

    map_rows = [
        track
        for country in trackmap["countries"]
        for region in country["regions"]
        for locality in region["localities"]
        for track in locality["tracks"]
    ] + trackmap.get("unlocated", [])
    map_ids = [x["track_world_code"] for x in map_rows]
    boards = tracks["boards"]
    board_ids = [x["track_world_code"] for x in boards]
    vrc_ids = [x["code"] for x in vrc["tracks"]]
    map_by_id = {x["track_world_code"]: x for x in map_rows}

    check("unique_world_ids", unique(map_ids) and unique(board_ids) and unique(vrc_ids))
    check("board_is_map_subset", set(board_ids) <= set(map_ids),
          missing=sorted(set(board_ids) - set(map_ids)))
    check("vrc_board_identity", set(vrc_ids) == set(board_ids),
          vrc_only=sorted(set(vrc_ids)-set(board_ids)),
          board_only=sorted(set(board_ids)-set(vrc_ids)))

    route_pairs = [(board["track_world_code"], route)
                   for board in boards for route in board["routes"]]
    period_file = manifest["routes"].get("leaderboard_periods")
    current_routes = current_route_rows(route_pairs, load(period_file) if period_file else {})
    route_keys = [(world, route["route_code"]) for world, route in route_pairs]
    check("unique_world_local_routes", unique(route_keys))
    inconsistent = [(world, route["route_code"])
                    for world, route in route_pairs
                    if route["record_count"] != len(route.get("route_rows", []))]
    check("route_counts_match_rows", not inconsistent, mismatches=inconsistent[:20])
    active_route_counts = {world: sum(bool(rows) for w, _, rows in current_routes if w == world)
                           for world in board_ids}
    map_mismatch = [(board["track_world_code"], active_route_counts[board["track_world_code"]])
                    for board in boards
                    if map_by_id[board["track_world_code"]].get("route_count")
                    != active_route_counts[board["track_world_code"]]]
    check("map_route_counts_match_boards", not map_mismatch, mismatches=map_mismatch[:20])
    current_rows = [row for _, _, rows in current_routes for row in rows]
    map_run_mismatch = [world for world in board_ids
                        if map_by_id[world].get("record_count") !=
                        sum(len(rows) for w, _, rows in current_routes if w == world)]
    check("map_current_run_counts", not map_run_mismatch, mismatches=map_run_mismatch[:20])

    record_rows = [row for _, route in route_pairs for row in route.get("route_rows", [])]
    check("unique_record_ids", unique([row["record_id"] for row in record_rows]))
    bad_ranks = [(world, route["route_code"])
                 for world, route in route_pairs
                 if any(row.get("rank") != i+1
                        for i, row in enumerate(route.get("route_rows", [])))]
    check("sequential_route_ranks", not bad_ranks, mismatches=bad_ranks[:20])
    bad_sort = [(world, route["route_code"]) for world, route in route_pairs
                if any(route["route_rows"][i]["lap_time_ms"] <
                       route["route_rows"][i-1]["lap_time_ms"]
                       for i in range(1, len(route.get("route_rows", []))))]
    check("nondescending_lap_times", not bad_sort, mismatches=bad_sort[:20])

    summary_numbers = {
        x["label_en"]: int(x["value"].replace(",", ""))
        for x in summary["count_cards"] if x["value"].replace(",", "").isdigit()
    }
    check("summary_valid_runs", summary_numbers.get("Valid Runs") == len(current_rows),
          summary=summary_numbers.get("Valid Runs"), records=len(current_rows), scope="current")
    popularity = summary.get("popularity_chart", {})
    popularity_counts = {x["code"]: x["count"] for x in popularity.get("tracks", [])}
    historical_counts = {world: sum(len(route.get("route_rows", []))
                                    for w, route in route_pairs if w == world)
                         for world in board_ids}
    check("popularity_all_time_runs", popularity.get("scope") == "all_time_valid_runs"
          and popularity_counts == historical_counts)
    check("summary_track_worlds", summary_numbers.get("Track Worlds") == len(map_ids),
          summary=summary_numbers.get("Track Worlds"), map=len(map_ids))
    players_ids = [x["player_id"] for x in players["player_cards"]]
    model_ids = [x["vehicle_model_code"] for x in vehicles["vehicle_cards"]]
    teams_ids = [x["team_id"] for x in teams["teams"]]
    check("unique_profile_ids", all(unique(ids) for ids in (players_ids, model_ids, teams_ids)))
    missing_members = [(team["team_id"], member)
                       for team in teams["teams"] for member in team["member_ids"]
                       if member not in players_ids]
    check("team_members_have_player_profiles", not missing_members, missing=missing_members)
    missing_manifest = [path for path in manifest["routes"].values()
                        if not (data_dir / path).is_file()]
    check("manifest_files_exist", not missing_manifest, missing=missing_manifest)

    editorial_ids = [x["event_id"] for x in editorial["events"]]
    generated_ids = [x["event_code"] for x in generated["event_cards"]]
    check("unique_event_ids", unique(editorial_ids) and unique(generated_ids))
    catalog_worlds = next(x for x in catalog["indexes"] if x["key"] == "worlds")["rows"]
    warn("index_scopes_are_distinct", map=len(map_ids), boards=len(boards),
         catalog=len(catalog_worlds), vrc=len(vrc_ids))
    unspecified = [x["track_world_code"] for x in map_rows
                   if not any(x.get(k) for k in ("timing_support", "timing_capability", "timing_state"))]
    if unspecified:
        warn("timing_capability_unspecified", count=len(unspecified))
    missing_urls = [x["track_world_code"] for x in map_rows if not x.get("world_url")]
    if missing_urls:
        warn("missing_world_urls_not_necessarily_public",
             count=len(missing_urls), ids=missing_urls)
    if set(editorial_ids) != set(generated_ids):
        warn("editorial_generated_event_sets_differ",
             editorial_only=sorted(set(editorial_ids)-set(generated_ids)),
             generated_only=sorted(set(generated_ids)-set(editorial_ids)))
    model_set = set(model_ids)
    variant_parents = {variant.get("variant_code"): model["vehicle_model_code"]
                       for model in vehicles["vehicle_cards"]
                       for variant in model.get("variants", [])}
    bad_vehicle_links = [
        {"event":event["event_id"], "id":vehicle,
         "suggested_model":variant_parents.get(vehicle)}
        for event in editorial["events"]
        for vehicle in event.get("vehicle_model_codes", [])
        if vehicle not in model_set
    ]
    if bad_vehicle_links:
        warn("event_vehicle_model_link_unresolved", links=bad_vehicle_links)
    missing_participants = [
        {"event":event["event_id"], "id":player}
        for event in editorial["events"]
        for player in event.get("participant_player_ids", [])
        if player not in players_ids
    ]
    if missing_participants:
        warn("event_participant_has_no_current_player_profile", links=missing_participants)

    pages = [
        "index.html", "tracks.html", "track.html", "TrackMap/index.html",
        "players.html", "player.html", "vehicles.html", "vehicle.html",
        "teams.html", "team.html", "events.html", "event.html",
        "catalog.html", "info.html",
    ]
    shell_errors = []
    for page in pages:
        html = (base / page).read_text(encoding="utf-8")
        if not all(token in html for token in ('data-view="', 'data-page-root', 'rel="canonical"')):
            shell_errors.append(page)
    check("page_shell_contract", not shell_errors, missing=shell_errors)

    return {
        "schema": "racing-qa-audit/1",
        "snapshot_generated_at": manifest.get("generated_at"),
        "schema_version": manifest.get("schema_version"),
        "passed": all(c["pass"] for c in checks),
        "counts": {
            "track_worlds": len(map_ids), "board_worlds": len(boards),
            "world_routes": len(route_pairs), "valid_records": len(record_rows),
            "current_valid_records": len(current_rows),
            "players_with_records": len(players_ids),
            "vehicle_models_with_records": len(model_ids),
            "teams": len(teams_ids), "editorial_events": len(editorial_ids),
        },
        "checks": checks, "warnings": warnings,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, default=Path("racing-qa-artifacts/data-audit.json"))
    args = parser.parse_args()
    try:
        report = audit(args.site_root)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        report = {"schema": "racing-qa-audit/1", "passed": False,
                  "error": f"{type(exc).__name__}: {exc}", "checks": [], "warnings": []}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Racing data audit: {'PASS' if report['passed'] else 'FAIL'}")
    for check in report["checks"]:
        if not check["pass"]:
            print("FAIL", check)
    for warning in report["warnings"]:
        print("WARN", warning["code"])
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
