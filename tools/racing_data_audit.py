#!/usr/bin/env python3
"""Read-only checks for public Racing Hub JSON identities and contracts.

No fixed record totals: counts follow the current published snapshot.
Editorial gaps are warnings, not invented validation failures.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import hashlib


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



def event_projection_status_drifts(editorial_events, vrc_events):
    """Find shared event IDs whose published status differs between outputs.

    This is a read-only discrepancy detector. It does not infer event outcomes
    from the calendar, and must not rewrite generated VRChat JSON or canonical
    data. Differences are advisory until the owning exporter is inspected.
    """
    by_id = {
        event["id"]: event
        for event in vrc_events
        if isinstance(event, dict) and isinstance(event.get("id"), str)
    }
    drifts = []
    for event in editorial_events:
        if not isinstance(event, dict):
            continue
        event_id = event.get("event_id")
        other = by_id.get(event_id)
        if other is None:
            continue
        editorial_status = event.get("status")
        vrc_status = other.get("status")
        if editorial_status != vrc_status:
            drifts.append({
                "event_id": event_id,
                "editorial_status": editorial_status,
                "vrc_status": vrc_status,
            })
    return drifts


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

    # vrc/events.json is a separate canonical/exporter projection, not the
    # site-owned Toolkit event output. Never silently patch it from editorial.
    vrc_events_file = base / "vrc/events.json"
    if vrc_events_file.is_file():
        vrc_event_doc = json.loads(vrc_events_file.read_text(encoding="utf-8"))
        vrc_event_rows = vrc_event_doc.get("events", [])
        if not isinstance(vrc_event_rows, list):
            warn("vrc_events_projection_invalid", reason="events is not a list")
        else:
            drifts = event_projection_status_drifts(editorial["events"], vrc_event_rows)
            if drifts:
                warn("editorial_vrc_event_status_drift", count=len(drifts),
                     cases=drifts[:20], remediation="check the canonical VRChat events exporter")
            editorial_set = {x.get("event_id") for x in editorial["events"] if isinstance(x, dict)}
            vrc_set = {x.get("id") for x in vrc_event_rows if isinstance(x, dict)}
            if editorial_set != vrc_set:
                warn("editorial_vrc_event_identity_sets_differ",
                     editorial_only=sorted(x for x in editorial_set-vrc_set if isinstance(x, str))[:20],
                     vrc_only=sorted(x for x in vrc_set-editorial_set if isinstance(x, str))[:20])
    else:
        warn("vrc_events_projection_unavailable", path="vrc/events.json")

    # Alert for organizer review; a passed date is not proof of completion.
    today_taipei = datetime.now(ZoneInfo("Asia/Taipei")).date().isoformat()
    past_upcoming = [
        {"event_id": e.get("event_id"), "starts_at": e.get("starts_at")}
        for e in editorial["events"] if isinstance(e, dict)
        and e.get("status") == "upcoming"
        and isinstance(e.get("starts_at"), str)
        and len(e["starts_at"]) >= 10
        and e["starts_at"][:10] < today_taipei
    ]
    if past_upcoming:
        warn("editorial_past_upcoming_requires_review",
             count=len(past_upcoming), cases=past_upcoming[:20],
             note="Date elapsed; event outcome remains unverified")

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



# Steward is an internal data export only: never write it into Pages' public roots.
# All inputs originate from already-public Racing Hub projections.
STEWARD_SCHEMA = "project-t-steward/1"
DATA_ROOT = "play/RacingClub/TimeAttack/data/"
VRC_ROOT = "play/RacingClub/TimeAttack/vrc/"
STATUS_ORDER = ("PASS", "UNKNOWN", "ACTION_REQUIRED", "BLOCKED")

AUDIT_SOURCES = {
    "map_current_run_counts": [DATA_ROOT + "trackmap.json", DATA_ROOT + "tracks.json",
                               DATA_ROOT + "leaderboard-periods.json"],
    "summary_valid_runs": [DATA_ROOT + "summary.json", DATA_ROOT + "tracks.json",
                           DATA_ROOT + "leaderboard-periods.json"],
    "editorial_generated_event_sets_differ": [DATA_ROOT + "event-editorial.json",
                                              DATA_ROOT + "events.json"],
}


def steward_check(rule_id: str, subject_id: str, status: str,
                  *, expected: dict, observed: dict, sources: list[str]) -> dict:
    """Stable identity and fingerprint for change-only notifications later.

    Deliberately omit generated_at from the fingerprint.
    """
    evidence = {
        "rule_id": rule_id, "subject_id": subject_id, "status": status,
        "expected": expected, "observed": observed,
        "source_paths": sorted(set(sources)),
    }
    canonical = json.dumps(evidence, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return {
        "issue_key": rule_id + ":" + subject_id,
        "fingerprint": hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16],
        **evidence,
    }


def steward_report_from_audit(report: dict, *, generated_at: str | None = None) -> dict:
    """Lossless status-focused projection of the existing read-only audit.

    Do not mark events completed based on dates; statuses represent the
    state of a check, not the status of a race or the world release.
    """
    generated_at = generated_at or datetime.now(timezone.utc).isoformat(timespec="seconds")
    checks = []

    if report.get("error"):
        checks.append(steward_check(
            "racing_audit_input", "public_projection", "BLOCKED",
            expected={"readable_public_sources": True},
            observed={"error": str(report["error"])[:400]},
            sources=[DATA_ROOT + "manifest.json", VRC_ROOT + "index.json"],
        ))
    else:
        for check in report.get("checks", []):
            code = check.get("code")
            if not isinstance(code, str) or not code:
                continue
            ok = check.get("pass") is True
            # Existing validation semantics are preserved; no recomputation.
            sources = AUDIT_SOURCES.get(code, [DATA_ROOT + "manifest.json"])
            observed = {"pass": ok}
            for key in ("mismatches", "missing", "summary", "records", "map", "scope",
                        "vrc_only", "board_only"):
                if key in check:
                    observed[key] = check[key]
            checks.append(steward_check(
                "racing_audit_" + code, "public_projection",
                "PASS" if ok else "ACTION_REQUIRED",
                expected={"pass": True}, observed=observed, sources=sources,
            ))

        for warning in report.get("warnings", []):
            code = warning.get("code")
            if code == "editorial_vrc_event_status_drift":
                for case in warning.get("cases", []):
                    eid = str(case.get("event_id") or "")
                    if not eid:
                        continue
                    checks.append(steward_check(
                        "event_status_consistency", eid, "ACTION_REQUIRED",
                        expected={"relation": "consistent statuses across exports"},
                        observed={"editorial_status": case.get("editorial_status"),
                                  "vrc_status": case.get("vrc_status")},
                        sources=[DATA_ROOT + "event-editorial.json", VRC_ROOT + "events.json"],
                    ))
            elif code == "editorial_vrc_event_identity_sets_differ":
                for provenance, ids in (
                    ("editorial_only", warning.get("editorial_only", [])),
                    ("vrc_only", warning.get("vrc_only", [])),
                ):
                    for eid in ids:
                        checks.append(steward_check(
                            "event_identity_consistency", str(eid), "ACTION_REQUIRED",
                            expected={"present_in_both_exports": True},
                            observed={"present_only_in": provenance},
                            sources=[DATA_ROOT + "event-editorial.json", VRC_ROOT + "events.json"],
                        ))
            elif code == "editorial_past_upcoming_requires_review":
                for case in warning.get("cases", []):
                    eid = str(case.get("event_id") or "")
                    if not eid:
                        continue
                    checks.append(steward_check(
                        "past_upcoming_review", eid, "ACTION_REQUIRED",
                        expected={"organizer_review": "required; no inferred outcome"},
                        observed={"editorial_status": "upcoming",
                                  "starts_at": case.get("starts_at")},
                        sources=[DATA_ROOT + "event-editorial.json"],
                    ))
            elif code in {"vrc_events_projection_invalid", "vrc_events_projection_unavailable"}:
                checks.append(steward_check(
                    "vrc_event_projection_readability", "events", "BLOCKED",
                    expected={"valid_events_array": True},
                    observed={"warning_code": code},
                    sources=[VRC_ROOT + "events.json"],
                ))
            # Other original warnings remain in the full racing data audit;
            # they are not Steward incidents without an approved policy.

        event_checks_present = any(
            c["rule_id"] in ("event_status_consistency", "event_identity_consistency",
                            "vrc_event_projection_readability")
            for c in checks
        )
        if not event_checks_present:
            checks.append(steward_check(
                "event_projection_consistency", "shared_event_ids", "PASS",
                expected={"status_and_identity_agree": True},
                observed={"exceptions": 0},
                sources=[DATA_ROOT + "event-editorial.json", VRC_ROOT + "events.json"],
            ))

    checks.sort(key=lambda x: (x["rule_id"], x["subject_id"], x["status"]))
    counts = {status: sum(c["status"] == status for c in checks) for status in STATUS_ORDER}
    overall = next((status for status in ("BLOCKED", "ACTION_REQUIRED", "UNKNOWN")
                    if counts[status]), "PASS")
    return {
        "schema": STEWARD_SCHEMA,
        "generated_at": generated_at,
        "producer": "tools/racing_data_audit.py",
        "scope": "public_racing_projections",
        "read_only": True,
        "overall_status": overall,
        "summary": {"total": len(checks), **counts},
        "checks": checks,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, default=Path("racing-qa-artifacts/data-audit.json"))
    parser.add_argument("--steward-output", type=Path,
                        default=Path("racing-qa-artifacts/steward-report.json"))
    args = parser.parse_args()
    try:
        report = audit(args.site_root)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        report = {"schema": "racing-qa-audit/1", "passed": False,
                  "error": f"{type(exc).__name__}: {exc}", "checks": [], "warnings": []}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    steward = steward_report_from_audit(report)
    args.steward_output.parent.mkdir(parents=True, exist_ok=True)
    args.steward_output.write_text(json.dumps(steward, ensure_ascii=False, indent=2) + "\n",
                                  encoding="utf-8")
    print(f"Steward internal report: {steward['overall_status']} "
          f"({steward['summary']['ACTION_REQUIRED']} action, "
          f"{steward['summary']['BLOCKED']} blocked)")
    print(f"Racing data audit: {'PASS' if report['passed'] else 'FAIL'}")
    for check in report["checks"]:
        if not check["pass"]:
            print("FAIL", check)
    for warning in report["warnings"]:
        print("WARN", warning["code"])
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
