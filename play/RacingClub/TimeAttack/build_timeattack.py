from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sqlite3
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "0.5.0"
ROUTE_FILE_MAP = {
    "overview": "summary.json",
    "tracks": "tracks.json",
    "players": "players.json",
    "vehicles": "vehicles.json",
    "events": "events.json",
    "catalog": "catalog.json",
    "info": "info.json",
    "review": "review.json",
    "trackmap": "trackmap.json",
}
WORKSPACE_ROOT = Path(__file__).resolve().parents[5]
LEGACY_RECORDS_CANDIDATE = WORKSPACE_ROOT / "VR_RacingClubTW" / "time_attack_tool" / "out_manual_check" / "records.json"
LEGACY_REVIEW_CANDIDATE = WORKSPACE_ROOT / "VR_RacingClubTW" / "time_attack_tool" / "out_manual_check" / "review_summary.json"


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(
        description="Build TimeAttack JSON artifacts from CSV exports.",
    )
    parser.add_argument(
        "--source-mode",
        choices=("auto", "normalized", "legacy-json", "sqlite"),
        default="auto",
        help="Data source: sqlite (preferred), normalized CSV, or legacy JSON.",
    )
    parser.add_argument(
        "--sqlite",
        type=Path,
        default=None,
        help="Path to ta_data.sqlite (defaults to ta_data.sqlite next to this script).",
    )
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=root / "source",
        help="Directory containing the normalized CSV exports.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=root / "data",
        help="Directory where JSON artifacts will be written.",
    )
    parser.add_argument(
        "--records-json",
        type=Path,
        help="Path to a legacy time_attack_tool records.json export.",
    )
    parser.add_argument(
        "--review-json",
        type=Path,
        help="Path to a legacy time_attack_tool review_summary.json export.",
    )
    parser.add_argument(
        "--source-label",
        default=None,
        help="Human-readable label written into manifest.json.",
    )
    return parser.parse_args()


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _find_csv(source_dir: Path, stem: str) -> Path:
    for suffix in ("", ".sample"):
        candidate = source_dir / f"{stem}{suffix}.csv"
        if candidate.exists():
            return candidate
    return source_dir / f"{stem}.sample.csv"


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def make_source_label(path: Path | None, fallback: str) -> str:
    if path is None:
        return fallback
    try:
        return str(path.relative_to(WORKSPACE_ROOT)).replace("\\", "/")
    except ValueError:
        return str(path)


def route_key(track_world_code: str, route_code: str) -> str:
    return f"{track_world_code}:{route_code}"


def parse_list(value: str) -> list[str]:
    return [item.strip() for item in (value or "").split("|") if item.strip()]


def parse_time_to_ms(text: str) -> int:
    text = (text or "").strip()
    if not text:
        raise ValueError("lap_time_text is required")

    parts = text.split(":")
    if len(parts) == 1:
        seconds = float(parts[0])
        return round(seconds * 1000)
    if len(parts) != 2:
        raise ValueError(f"Unsupported time format: {text}")

    minutes = int(parts[0])
    seconds = float(parts[1])
    return round(((minutes * 60) + seconds) * 1000)


def format_ms(milliseconds: int | None) -> str:
    if milliseconds is None:
        return "-"
    minutes, remainder = divmod(int(milliseconds), 60_000)
    seconds, millis = divmod(remainder, 1000)
    return f"{minutes:02d}:{seconds:02d}.{millis:03d}"


def safe_date(date_text: str) -> datetime:
    return datetime.fromisoformat(date_text).replace(tzinfo=timezone.utc)


def pick_better(a: dict[str, Any] | None, b: dict[str, Any]) -> dict[str, Any]:
    if a is None:
        return b
    a_key = (a["lap_time_ms"], a["record_date"], a["record_id"])
    b_key = (b["lap_time_ms"], b["record_date"], b["record_id"])
    return b if b_key < a_key else a


def best_by(records: list[dict[str, Any]], key_name: str) -> dict[str, dict[str, Any]]:
    best: dict[str, dict[str, Any]] = {}
    for record in records:
        key = record[key_name]
        best[key] = pick_better(best.get(key), record)
    return best


def rank_rows(
    records: list[dict[str, Any]],
    name_field: str,
    sub_field: str,
    *,
    limit: int | None = 8,
) -> list[dict[str, Any]]:
    ranked: list[dict[str, Any]] = []
    for index, record in enumerate(
        sorted(records, key=lambda item: (item["lap_time_ms"], item["record_date"], item["record_id"])),
        start=1,
    ):
        ranked.append(
            {
                "rank": index,
                name_field: record[name_field],
                sub_field: record[sub_field],
                "lap_time_text": record["lap_time_text"],
                "delta_to_best_text": record.get("delta_to_best_text", "-"),
                "channel_label_zh": record["channel_label_zh"],
                "channel_label_en": record["channel_label_en"],
            }
        )
        if limit and index >= limit:
            break
    return ranked


def top_counter_items(counter: Counter[str], *, limit: int = 3) -> list[dict[str, Any]]:
    return [{"label": key, "value": value} for key, value in counter.most_common(limit)]


def favorite_label(counter: Counter[str], fallback: str = "-") -> str:
    if not counter:
        return fallback
    return counter.most_common(1)[0][0]


BADGE_META = {
    "TR": {
        "label_zh": "賽道紀錄",
        "label_en": "Track Record",
        "tone": "tr",
    },
    "CR": {
        "label_zh": "車輛紀錄",
        "label_en": "Car Record",
        "tone": "cr",
    },
    "PR": {
        "label_zh": "個人紀錄",
        "label_en": "Personal Record",
        "tone": "pr",
    },
}


def normalize_tags(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return parse_list(str(value or ""))


def sort_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(records, key=lambda item: (item["lap_time_ms"], item["record_date"], item["record_id"]))


def build_route_badge_index(records: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        grouped[record["route_key"]].append(record)

    route_badges: dict[str, dict[str, Any]] = {}
    for route_id, route_records in grouped.items():
        ranked = sort_records(route_records)
        tr_record_id = ranked[0]["record_id"] if ranked else None
        cr_record_ids: dict[str, str] = {}
        pr_record_ids: dict[str, str] = {}

        for record in ranked:
            cr_record_ids.setdefault(record["vehicle_model_code"], record["record_id"])
            pr_record_ids.setdefault(record["player_id"], record["record_id"])

        route_badges[route_id] = {
            "tr_record_id": tr_record_id,
            "cr_record_ids": cr_record_ids,
            "pr_record_ids": pr_record_ids,
        }

    return route_badges


def badge_code_for_record(record: dict[str, Any], route_badges: dict[str, dict[str, Any]]) -> str:
    route_meta = route_badges.get(record["route_key"], {})
    if route_meta.get("tr_record_id") == record["record_id"]:
        return "TR"
    if route_meta.get("cr_record_ids", {}).get(record["vehicle_model_code"]) == record["record_id"]:
        return "CR"
    if route_meta.get("pr_record_ids", {}).get(record["player_id"]) == record["record_id"]:
        return "PR"
    return ""


def badge_payload(code: str) -> dict[str, str]:
    meta = BADGE_META.get(code)
    if not meta:
        return {
            "badge_code": "",
            "badge_label_zh": "",
            "badge_label_en": "",
            "badge_tone": "",
        }
    return {
        "badge_code": code,
        "badge_label_zh": meta["label_zh"],
        "badge_label_en": meta["label_en"],
        "badge_tone": meta["tone"],
    }


def build_badged_row(
    record: dict[str, Any],
    route_badges: dict[str, dict[str, Any]],
    *,
    rank: int,
    peer_label: str,
) -> dict[str, Any]:
    badge_code = badge_code_for_record(record, route_badges)
    return {
        "rank": rank,
        "route_label_zh": record["route_label_zh"],
        "route_label_en": record["route_label_en"],
        "player_display_name": record["player_display_name"],
        "player_id": record.get("player_id", ""),
        "vehicle_model_name": record["vehicle_model_name"],
        "vehicle_model_code": record.get("vehicle_model_code", ""),
        "lap_time_ms": record["lap_time_ms"],
        "lap_time_text": record["lap_time_text"],
        "delta_to_best_text": record.get("delta_to_best_text", "-"),
        "platform": record["platform_code"] or "unknown",
        "record_date": record["record_date"],
        "track_env": record.get("track_env") or "其他",
        "track_tags": normalize_tags(record.get("track_tags")),
        "peer_label": peer_label,
        "verified": bool(record.get("verified")),
        "proof_text": record.get("proof_text") or "",
        **badge_payload(badge_code),
    }


def popularity_bucket(run_count: int) -> dict[str, str]:
    if run_count >= 10:
        return {
            "key": "spotlight",
            "label_zh": "熱門車種",
            "label_en": "Spotlight Cars",
        }
    if run_count >= 4:
        return {
            "key": "active",
            "label_zh": "活躍車種",
            "label_en": "Active Cars",
        }
    return {
        "key": "rare",
        "label_zh": "少量紀錄",
        "label_en": "Rare Cars",
    }


def load_normalized_source_data(
    source_dir: Path,
) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    track_world_rows = read_csv_rows(_find_csv(source_dir, "tracks_meta"))
    route_rows = read_csv_rows(_find_csv(source_dir, "routes_meta"))
    player_rows = read_csv_rows(_find_csv(source_dir, "players_meta"))
    vehicle_rows = read_csv_rows(_find_csv(source_dir, "vehicles_meta"))
    event_rows = read_csv_rows(_find_csv(source_dir, "events_meta"))
    record_rows = read_csv_rows(_find_csv(source_dir, "records_input"))

    track_worlds = {
        row["track_world_code"]: {
            **row,
            "track_tags": parse_list(row["track_tags"]),
        }
        for row in track_world_rows
    }
    routes = {
        route_key(row["track_world_code"], row["route_code"]): row
        for row in route_rows
    }
    players = {row["player_id"]: row for row in player_rows}
    vehicle_variants = {row["vehicle_variant_code"]: row for row in vehicle_rows}
    events = {row["event_code"]: row for row in event_rows if row["event_code"]}

    vehicle_models: dict[str, dict[str, Any]] = {}
    for row in vehicle_rows:
        model = vehicle_models.setdefault(
            row["vehicle_model_code"],
            {
                "vehicle_model_code": row["vehicle_model_code"],
                "vehicle_model_name": row["vehicle_model_name"],
                "vehicle_class": row["vehicle_class"],
                "vehicle_tags": set(),
                "variant_names": [],
            },
        )
        model["variant_names"].append(row["vehicle_variant_name"])
        model["vehicle_tags"].update(parse_list(row["vehicle_tags"]))

    records: list[dict[str, Any]] = []
    for row in record_rows:
        track_world = track_worlds[row["track_world_code"]]
        route = routes[route_key(row["track_world_code"], row["route_code"])]
        player = players[row["player_id"]]
        vehicle_variant = vehicle_variants[row["vehicle_variant_code"]]
        event = events.get(row["event_code"])
        key = route_key(row["track_world_code"], row["route_code"])
        lap_time_ms = parse_time_to_ms(row["lap_time_text"])

        verified = str(row.get("verified") or "").strip().lower() in {"1", "true", "yes"}
        channel_label_zh = "已驗證" if verified else "未驗證"
        channel_label_en = "Verified" if verified else "Unverified"
        review_status = row["review_status"] or "pending"

        records.append(
            {
                **row,
                "route_key": key,
                "route_label_zh": f"{track_world['track_display_name']} / {route['route_display_name']}",
                "route_label_en": f"{track_world['world_name']} / {route['route_display_name']}",
                "lap_time_ms": lap_time_ms,
                "lap_time_text": format_ms(lap_time_ms),
                "track_display_name": track_world["track_display_name"],
                "world_name": track_world["world_name"],
                "world_url": track_world["world_url"],
                "track_author": track_world["track_author"],
                "system_name": track_world["system_name"],
                "track_tags": track_world["track_tags"],
                "route_display_name": route["route_display_name"],
                "player_display_name": player["display_name_primary"],
                "team_name": player["team_name"],
                "vehicle_variant_name": vehicle_variant["vehicle_variant_name"],
                "vehicle_model_code": vehicle_variant["vehicle_model_code"],
                "vehicle_model_name": vehicle_variant["vehicle_model_name"],
                "vehicle_class": vehicle_variant["vehicle_class"],
                "vehicle_tags": parse_list(vehicle_variant["vehicle_tags"]),
                "event_name": event["event_name"] if event else "",
                "event_type": event["event_type"] if event else "",
                "season_name": event["season_name"] if event else row["season_code"],
                "channel_label_zh": channel_label_zh,
                "channel_label_en": channel_label_en,
                "review_status": review_status,
                "verified": verified,
                "proof_text": row.get("proof_text") or "",
                "verified_by": row.get("verified_by") or "",
                "verified_at": row.get("verified_at") or "",
                "is_approved_board": verified and review_status != "rejected",
                "is_normal_board": (not verified) and review_status != "rejected",
                "is_general_pool": review_status != "rejected",
            }
        )

    lookup = {
        "track_worlds": track_worlds,
        "routes": routes,
        "players": players,
        "vehicle_variants": vehicle_variants,
        "vehicle_models": vehicle_models,
        "events": events,
    }
    return records, lookup, {"review_cards": []}


def load_legacy_json_data(
    records_json_path: Path,
    review_json_path: Path | None,
) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    records_payload = json.loads(records_json_path.read_text(encoding="utf-8"))
    review_payload = (
        json.loads(review_json_path.read_text(encoding="utf-8"))
        if review_json_path and review_json_path.exists()
        else {}
    )

    track_worlds: dict[str, dict[str, Any]] = {}
    routes: dict[str, dict[str, Any]] = {}
    players: dict[str, dict[str, Any]] = {}
    vehicle_variants: dict[str, dict[str, Any]] = {}
    vehicle_models: dict[str, dict[str, Any]] = {}
    records: list[dict[str, Any]] = []

    for row in records_payload.get("records", []):
        track_world_code = row["track_variant_id"]
        route_code = row["track_route_id"]
        key = route_key(track_world_code, route_code)
        track_worlds.setdefault(
            track_world_code,
            {
                "track_world_code": track_world_code,
                "track_display_name": row["track_variant_name"],
                "world_name": row["track_family_name"],
                "world_url": "",
                "track_author": "Imported",
                "system_code": "legacy_time_attack_tool",
                "system_name": "Legacy Approved Import",
                "track_tags": [],
            },
        )
        routes.setdefault(
            key,
            {
                "track_world_code": track_world_code,
                "route_code": route_code,
                "route_display_name": row["track_route_name"],
                "route_note_zh": "由舊版 records.json 匯入",
                "route_note_en": "Imported from a legacy records.json artifact",
            },
        )
        players.setdefault(
            row["racer_id"],
            {
                "player_id": row["racer_id"],
                "display_name_primary": row["racer_display_name"],
                "display_name_aliases": "",
                "team_code": "",
                "team_name": "",
            },
        )
        vehicle_variants.setdefault(
            row["vehicle_id"],
            {
                "vehicle_variant_code": row["vehicle_id"],
                "vehicle_variant_name": row["vehicle_display_name"],
                "vehicle_model_code": row["vehicle_id"],
                "vehicle_model_name": row["vehicle_display_name"],
                "vehicle_class": "Imported Vehicle",
                "vehicle_tags": "",
            },
        )
        vehicle_models.setdefault(
            row["vehicle_id"],
            {
                "vehicle_model_code": row["vehicle_id"],
                "vehicle_model_name": row["vehicle_display_name"],
                "vehicle_class": "Imported Vehicle",
                "vehicle_tags": set(),
                "variant_names": [row["vehicle_display_name"]],
            },
        )

        recorded_at = row.get("recorded_at") or row.get("approved_at") or records_payload.get("generated_at", "")
        record_date = recorded_at[:10] if recorded_at else ""
        review_status = row.get("review_status") or "approved"

        records.append(
            {
                "record_id": row["record_id"],
                "record_date": record_date,
                "track_world_code": track_world_code,
                "route_code": route_code,
                "player_id": row["racer_id"],
                "vehicle_variant_code": row["vehicle_id"],
                "platform_code": row.get("platform") or "",
                "system_code": "legacy_time_attack_tool",
                "lap_time_text": row["lap_time_text"],
                "record_channel": "approved_record",
                "review_status": review_status,
                "event_code": row.get("event_id") or "",
                "season_code": "",
                "submission_note": row.get("notes") or "",
                "route_key": key,
                "route_label_zh": f"{row['track_variant_name']} / {row['track_route_name']}",
                "route_label_en": f"{row['track_family_name']} / {row['track_route_name']}",
                "lap_time_ms": int(row.get("lap_time_ms") or parse_time_to_ms(row["lap_time_text"])),
                "track_display_name": row["track_variant_name"],
                "world_name": row["track_family_name"],
                "world_url": "",
                "track_author": "Imported",
                "system_name": "Legacy Approved Import",
                "track_tags": [],
                "route_display_name": row["track_route_name"],
                "player_display_name": row["racer_display_name"],
                "team_name": "",
                "vehicle_variant_name": row["vehicle_display_name"],
                "vehicle_model_code": row["vehicle_id"],
                "vehicle_model_name": row["vehicle_display_name"],
                "vehicle_class": "Imported Vehicle",
                "vehicle_tags": [],
                "event_name": row.get("event_id") or "",
                "event_type": "",
                "season_name": "",
                "channel_label_zh": "已驗證" if review_status == "approved" else "未驗證",
                "channel_label_en": "Verified" if review_status == "approved" else "Unverified",
                "verified": review_status == "approved",
                "proof_text": row.get("notes") or "",
                "verified_by": "",
                "verified_at": "",
                "is_approved_board": review_status == "approved",
                "is_normal_board": review_status not in {"approved", "rejected"},
                "is_general_pool": review_status != "rejected",
            }
        )

    extra_review_cards = []
    for item in review_payload.get("pending_items", []):
        status = item.get("review_status") or "submitted"
        status_map = {
            "submitted": ("已送件", "Submitted"),
            "needs_info": ("待補件", "Needs Info"),
            "rejected": ("已退回", "Rejected"),
            "approved": ("已核准", "Approved"),
        }
        labels = status_map.get(status, ("待審核", "Pending"))
        extra_review_cards.append(
            {
                "status_zh": labels[0],
                "status_en": labels[1],
                "title_zh": item.get("track_input") or "Legacy submission",
                "title_en": item.get("track_input") or "Legacy submission",
                "player_display_name": item.get("racer_name_input") or "",
                "vehicle_display_name": item.get("vehicle_input") or "",
                "lap_time_text": item.get("lap_time_text") or "",
                "record_date": (review_payload.get("generated_at") or "")[:10],
                "event_name": "Legacy Review Queue",
                "submission_note": "Imported from legacy review_summary.json",
            }
        )

    lookup = {
        "track_worlds": track_worlds,
        "routes": routes,
        "players": players,
        "vehicle_variants": vehicle_variants,
        "vehicle_models": vehicle_models,
        "events": {},
    }
    return records, lookup, {"review_cards": extra_review_cards}


def load_sqlite_data(
    db_path: Path,
) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row

    track_worlds = {
        row["track_world_code"]: dict(row)
        for row in conn.execute("SELECT * FROM track_worlds")
    }
    routes = {
        route_key(row["track_world_code"], row["route_code"]): dict(row)
        for row in conn.execute("SELECT * FROM routes")
    }
    players = {row["player_id"]: dict(row) for row in conn.execute("SELECT * FROM players")}
    vehicle_variants = {
        row["vehicle_variant_code"]: dict(row)
        for row in conn.execute("SELECT * FROM vehicles")
    }
    events = {
        row["event_code"]: dict(row)
        for row in conn.execute("SELECT * FROM events WHERE event_code != ''")
    }

    vehicle_models: dict[str, dict[str, Any]] = {}
    for row in vehicle_variants.values():
        model = vehicle_models.setdefault(
            row["vehicle_model_code"],
            {
                "vehicle_model_code": row["vehicle_model_code"],
                "vehicle_model_name": row["vehicle_model_name"],
                "vehicle_class": row["vehicle_class"],
                "vehicle_tags": set(),
                "variant_names": [],
                "manufacturer": "",
                "country": "",
                "year": "",
            },
        )
        model["variant_names"].append(row["vehicle_variant_name"])
        model["vehicle_tags"].update(parse_list(row.get("vehicle_tags") or ""))
        # 車廠 / 國籍 / 年份:取該車型第一個非空值(同車型應一致)。
        for key in ("manufacturer", "country", "year"):
            if not model[key] and (row.get(key) or "").strip():
                model[key] = row[key].strip()

    sql = """
        SELECT r.record_id, r.record_date, r.track_world_code, r.route_code,
               r.player_id, r.vehicle_variant_code, r.platform_code, r.system_code,
               r.lap_time_ms, r.lap_time_text, r.record_channel, r.review_status,
               r.verified, r.proof_text, r.verified_by, r.verified_at,
               r.event_code, r.season_code, r.submission_note,
               t.track_display_name, t.world_name, t.world_url, t.track_author,
               t.system_name, t.track_tags,
               rt.route_display_name, rt.route_note_zh, rt.route_note_en,
               p.display_name_primary, p.team_name,
               v.vehicle_variant_name, v.vehicle_model_code, v.vehicle_model_name,
               v.vehicle_class, v.vehicle_tags AS vehicle_tags_raw
        FROM records r
        JOIN track_worlds t  ON r.track_world_code = t.track_world_code
        JOIN routes rt        ON r.track_world_code = rt.track_world_code
                             AND r.route_code = rt.route_code
        JOIN players p        ON r.player_id = p.player_id
        JOIN vehicles v       ON r.vehicle_variant_code = v.vehicle_variant_code
    """
    records: list[dict[str, Any]] = []
    for raw in conn.execute(sql):
        row = dict(raw)
        rk = route_key(row["track_world_code"], row["route_code"])
        channel = row["record_channel"]
        review_status = row["review_status"]
        verified = bool(row.get("verified"))
        proof_text = row.get("proof_text") or ""
        verified_by = row.get("verified_by") or ""
        verified_at = row.get("verified_at") or ""
        not_rejected = review_status != "rejected"
        event = events.get(row.get("event_code") or "")
        records.append(
            {
                "record_id": row["record_id"],
                "record_date": row["record_date"],
                "track_world_code": row["track_world_code"],
                "route_code": row["route_code"],
                "player_id": row["player_id"],
                "vehicle_variant_code": row["vehicle_variant_code"],
                "platform_code": row["platform_code"],
                "system_code": row["system_code"],
                "lap_time_ms": row["lap_time_ms"],
                "lap_time_text": row["lap_time_text"],
                "record_channel": channel,
                "review_status": review_status,
                "verified": verified,
                "proof_text": proof_text,
                "verified_by": verified_by,
                "verified_at": verified_at,
                "event_code": row.get("event_code") or "",
                "season_code": row.get("season_code") or "",
                "submission_note": row.get("submission_note") or "",
                "route_key": rk,
                "route_label_zh": f"{row['track_display_name']} / {row['route_display_name']}",
                "route_label_en": f"{row['world_name']} / {row['route_display_name']}",
                "track_display_name": row["track_display_name"],
                "world_name": row["world_name"],
                "world_url": row["world_url"],
                "track_author": row["track_author"],
                "system_name": row["system_name"],
                "track_tags": parse_list(row["track_tags"]),
                "route_display_name": row["route_display_name"],
                "player_display_name": row["display_name_primary"],
                "team_name": row.get("team_name") or "",
                "vehicle_variant_name": row["vehicle_variant_name"],
                "vehicle_model_code": row["vehicle_model_code"],
                "vehicle_model_name": row["vehicle_model_name"],
                "vehicle_class": row["vehicle_class"],
                "vehicle_tags": parse_list(row.get("vehicle_tags_raw") or ""),
                "event_name": event["event_name"] if event else "",
                "event_type": event["event_type"] if event else "",
                "season_name": event["season_name"] if event else (row.get("season_code") or ""),
                "channel_label_zh": "已驗證" if verified else "未驗證",
                "channel_label_en": "Verified" if verified else "Unverified",
                "is_approved_board": verified and not_rejected,
                "is_normal_board": (not verified) and not_rejected,
                "is_general_pool": not_rejected,
            }
        )

    # TrackMap geo layers. Older DBs may not have these tables yet (Phase A
    # ships before the editor migration) — treat a missing table as empty.
    try:
        geo_places = {
            (row["country"], row["region"], row["locality"]): dict(row)
            for row in conn.execute("SELECT * FROM geo_places")
        }
    except sqlite3.OperationalError:
        geo_places = {}
    try:
        geo_traces = {
            row["track_world_code"]: row["trace_geojson"]
            for row in conn.execute("SELECT * FROM geo_traces")
        }
    except sqlite3.OperationalError:
        geo_traces = {}
    try:
        geo_region_overlays = {
            ((row["country"] or "").strip(), (row["region"] or "").strip()): row["overlay_geojson"]
            for row in conn.execute("SELECT * FROM geo_region_overlays")
        }
    except sqlite3.OperationalError:
        geo_region_overlays = {}

    conn.close()
    lookup = {
        "track_worlds": track_worlds,
        "routes": routes,
        "players": players,
        "vehicle_variants": vehicle_variants,
        "vehicle_models": vehicle_models,
        "events": events,
        "geo_places": geo_places,
        "geo_traces": geo_traces,
        "geo_region_overlays": geo_region_overlays,
    }
    return records, lookup, {"review_cards": []}


DEFAULT_SQLITE = Path(__file__).resolve().parent / "ta_data.sqlite"


def resolve_source(
    args: argparse.Namespace,
) -> tuple[str, list[dict[str, Any]], dict[str, Any], dict[str, Any], str]:
    sqlite_path = args.sqlite or DEFAULT_SQLITE
    if args.source_mode in {"auto", "sqlite"} and sqlite_path.exists():
        label = args.source_label or make_source_label(sqlite_path, "ta_data.sqlite")
        records, lookup, extras = load_sqlite_data(sqlite_path)
        return "sqlite", records, lookup, extras, label

    if args.source_mode == "sqlite":
        raise FileNotFoundError(f"SQLite database not found: {sqlite_path}")

    records_json = args.records_json or LEGACY_RECORDS_CANDIDATE
    review_json = args.review_json or LEGACY_REVIEW_CANDIDATE

    if args.source_mode in {"auto", "legacy-json"} and records_json.exists():
        label = args.source_label or make_source_label(records_json, "legacy records.json")
        records, lookup, extras = load_legacy_json_data(records_json, review_json if review_json.exists() else None)
        return "legacy-json", records, lookup, extras, label

    if args.source_mode == "legacy-json":
        raise FileNotFoundError(f"Legacy records.json not found: {records_json}")

    label = args.source_label or make_source_label(args.source_dir, "source/*.csv")
    records, lookup, extras = load_normalized_source_data(args.source_dir)
    return "normalized", records, lookup, extras, label


def compute_delta_text(records: list[dict[str, Any]]) -> None:
    for predicate in ("is_approved_board", "is_normal_board", "is_general_pool"):
        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for record in records:
            if record[predicate]:
                grouped[record["route_key"]].append(record)

        for route_records in grouped.values():
            best = min(route_records, key=lambda item: (item["lap_time_ms"], item["record_date"], item["record_id"]))
            for record in route_records:
                delta = record["lap_time_ms"] - best["lap_time_ms"]
                record[f"{predicate}_delta_text"] = "+0.000" if delta <= 0 else f"+{delta / 1000:.3f}"

    for record in records:
        record["delta_to_best_text"] = record.get("is_general_pool_delta_text", "-")


def build_manifest(source_label: str) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "build_state": "live",
        "source_label": source_label,
        "routes": ROUTE_FILE_MAP,
        "verification_states": [
            {"code": "verified", "label_zh": "已驗證", "label_en": "Verified"},
            {"code": "unverified", "label_zh": "未驗證", "label_en": "Unverified"},
        ],
    }


def compute_count_cards(
    records: list[dict[str, Any]],
    lookup: dict[str, Any],
    extra_pending: int = 0,
) -> list[dict[str, Any]]:
    valid_pool = [record for record in records if record["is_general_pool"]]
    verified_runs = [record for record in valid_pool if record["verified"]]
    unverified_runs = [record for record in valid_pool if not record["verified"]]

    return [
        {
            "label_zh": "總輸入筆數",
            "label_en": "All Runs",
            "value": str(len(records)),
            "note_zh": "輸入表中所有紀錄列",
            "note_en": "All imported rows from the input sheet",
        },
        {
            "label_zh": "有效紀錄",
            "label_en": "Valid Runs",
            "value": str(len(valid_pool)),
            "note_zh": "未被拒絕、可進排行榜的紀錄",
            "note_en": "Non-rejected runs eligible for the leaderboards",
        },
        {
            "label_zh": "已驗證",
            "label_en": "Verified",
            "value": str(len(verified_runs)),
            "note_zh": "已標記 verified 的紀錄",
            "note_en": "Runs marked verified",
        },
        {
            "label_zh": "未驗證",
            "label_en": "Unverified",
            "value": str(len(unverified_runs) + extra_pending),
            "note_zh": "尚未驗證的有效紀錄",
            "note_en": "Valid runs that are not verified yet",
        },
        {
            "label_zh": "賽道世界",
            "label_en": "Track Worlds",
            "value": str(len(lookup["track_worlds"])),
            "note_zh": "以世界為準的賽道識別",
            "note_en": "World-level track identities",
        },
        {
            "label_zh": "車輛母型",
            "label_en": "Vehicle Models",
            "value": str(len(lookup["vehicle_models"])),
            "note_zh": "以統計母型合併多個世界變體",
            "note_en": "Canonical vehicle models merged across multiple world variants",
        },
    ]


DATA_MODEL_SECTIONS = [
    {
        "label_zh": "資料流",
        "label_en": "Data Flow",
        "title_zh": "單一輸入表到靜態頁",
        "title_en": "Single Sheet To Static Pages",
        "body_zh": "Builder 讀取輸入表與 lookup 索引，先產生分析 JSON，再由這些靜態頁直接讀取。",
        "body_en": "The builder reads the input sheet plus lookup indexes, generates analysis JSON, and the static pages consume those artifacts directly.",
        "items_zh": [
            "Google Sheet 或 CSV 匯出作為唯一輸入來源",
            "本機 builder 重建所有排行榜與分析頁資料",
            "最終只修改 `play/RacingClub/TimeAttack/data/*.json` 後再推上 GitHub Pages",
        ],
        "items_en": [
            "Google Sheet or CSV export remains the single input source",
            "A local builder regenerates every board and analysis artifact",
            "Only `play/RacingClub/TimeAttack/data/*.json` needs to change before pushing to GitHub Pages",
        ],
    }
]


def build_overview_extras(
    records: list[dict[str, Any]],
    lookup: dict[str, Any],
) -> dict[str, Any]:
    """Overview-only payload: leaderboard highlights, recent runs, track jump options.

    The overview page (data-view="overview") renders these via renderOverview in
    timeattack.js. Without them the home page shows only the portal cards and no
    actual timing records.
    """
    general_pool = [record for record in records if record["is_general_pool"]]
    route_badges = build_route_badge_index(general_pool)

    tr_player_counter: Counter[str] = Counter()
    cr_vehicle_counter: Counter[str] = Counter()
    vehicle_run_counter: Counter[str] = Counter()
    track_run_counter: Counter[str] = Counter()

    for record in general_pool:
        code = badge_code_for_record(record, route_badges)
        if code == "TR":
            tr_player_counter[record["player_display_name"]] += 1
        elif code == "CR":
            cr_vehicle_counter[record["vehicle_model_name"]] += 1
        vehicle_run_counter[record["vehicle_model_name"]] += 1
        track_run_counter[record["track_world_code"]] += 1

    def _top(counter: Counter[str]) -> tuple[str | None, int]:
        return counter.most_common(1)[0] if counter else (None, 0)

    tr_player, tr_count = _top(tr_player_counter)
    cr_vehicle, cr_count = _top(cr_vehicle_counter)
    pop_vehicle, pop_vehicle_runs = _top(vehicle_run_counter)
    pop_track_code, pop_track_runs = _top(track_run_counter)
    pop_track_name = (
        lookup["track_worlds"].get(pop_track_code, {}).get("track_display_name") or pop_track_code
        if pop_track_code
        else None
    )

    highlights: list[dict[str, Any]] = []
    if tr_player:
        highlights.append({"label_zh": "最多賽道紀錄", "label_en": "Most Track Records",
                           "name": tr_player, "value": f"{tr_count} TR"})
    if cr_vehicle:
        highlights.append({"label_zh": "最多車輛紀錄", "label_en": "Most Car Records",
                           "name": cr_vehicle, "value": f"{cr_count} CR"})
    if pop_vehicle:
        highlights.append({"label_zh": "最熱門車型", "label_en": "Most Used Car",
                           "name": pop_vehicle, "value": f"{pop_vehicle_runs} 筆"})
    if pop_track_name:
        highlights.append({"label_zh": "最熱門賽道", "label_en": "Busiest Track",
                           "name": pop_track_name, "value": f"{pop_track_runs} 筆"})

    # Newest first; record_date is ISO YYYY-MM-DD so lexical sort is chronological.
    recent_runs: list[dict[str, Any]] = []
    for record in sorted(
        general_pool,
        key=lambda item: (item["record_date"], item["record_id"]),
        reverse=True,
    )[:8]:
        code = badge_code_for_record(record, route_badges)
        recent_runs.append(
            {
                "record_date": record["record_date"],
                "track_world_code": record["track_world_code"],
                "route_code": record["route_code"],
                "route_label_zh": record["route_label_zh"],
                "route_label_en": record["route_label_en"],
                "player_display_name": record["player_display_name"],
                "player_id": record.get("player_id", ""),
                "vehicle_model_name": record["vehicle_model_name"],
                "vehicle_model_code": record.get("vehicle_model_code", ""),
                "lap_time_text": record["lap_time_text"],
                "platform": record["platform_code"] or "unknown",
                "verified": bool(record.get("verified")),
                "proof_text": record.get("proof_text") or "",
                **badge_payload(code),
            }
        )

    track_codes_with_runs = {record["track_world_code"] for record in general_pool}
    track_options = sorted(
        (
            {
                "code": code,
                "name": lookup["track_worlds"].get(code, {}).get("track_display_name") or code,
            }
            for code in track_codes_with_runs
        ),
        key=lambda option: (option["name"], option["code"]),
    )

    # 熱門度頻率圖:賽道依跑次降序,各帶 (country, system) 供著色(與地圖頁同色)。
    popularity_tracks = []
    for code, count in track_run_counter.most_common():
        tw = lookup["track_worlds"].get(code, {})
        country = (tw.get("country") or "").strip()
        system = (tw.get("system_name") or "").strip()
        popularity_tracks.append({
            "code": code,
            "name": tw.get("track_display_name") or code,
            "count": count,
            "country": country,
            "system": system,
            "category_key": category_key(country, system),
        })

    return {
        "highlights": highlights,
        "recent_runs": recent_runs,
        "track_options": track_options,
        "popularity_chart": {"tracks": popularity_tracks},
        "category_style": build_category_style(lookup),
    }


def build_summary(
    records: list[dict[str, Any]],
    lookup: dict[str, Any],
    extra_review_cards: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    extra_pending = len(extra_review_cards or [])

    return {
        **build_overview_extras(records, lookup),
        "title_zh": "Time Attack 計時紀錄",
        "title_en": "Time Attack Records",
        "description_zh": (
            "VR Racing Club 的計時頁面以單一輸入表為核心。所有有效紀錄都能進排行榜，"
            "其中標記 `verified` 的紀錄會額外顯示已驗證標記，並可附上 `proof_text` 證明，"
            "另有玩家、車輛、賽道與活動分析。"
        ),
        "description_en": (
            "VR Racing Club time-attack hub built around a single input sheet. Every valid run enters "
            "the leaderboards; runs marked `verified` also carry a verified mark plus an optional "
            "`proof_text`, alongside analysis views for tracks, players, vehicles, and events."
        ),
        "build_state": "live",
        "sidebar_zh": [
            "排行榜吃所有未被拒絕的有效紀錄（`is_general_pool`）。",
            "`verified = true` 的紀錄會顯示已驗證標記，`proof_text` 提供證明說明或連結。",
            "TR / CR / PR 為 builder 預先計算的榮耀標籤，前端只負責顯示。",
        ],
        "sidebar_en": [
            "Leaderboards include every non-rejected valid run (`is_general_pool`).",
            "Runs with `verified = true` show a verified mark, and `proof_text` carries the evidence note or link.",
            "TR / CR / PR are builder-computed honor badges; the frontend only renders them.",
        ],
        "count_cards": compute_count_cards(records, lookup, extra_pending),
        "board_cards": [
            {
                "label_zh": "排行榜",
                "label_en": "Leaderboards",
                "title_zh": "賽道計時榜",
                "title_en": "Track Leaderboards",
                "description_zh": "所有有效紀錄的賽道榜，提供全紀錄、車輛、玩家三種視角，並直接標示 TR / CR / PR。",
                "description_en": "Track boards over every valid run, with full / vehicle / player views and direct TR / CR / PR badges.",
                "href": "./tracks.html",
                "href_label_zh": "看賽道榜單",
                "href_label_en": "Open Tracks",
            },
            {
                "label_zh": "驗證",
                "label_en": "Verification",
                "title_zh": "已驗證 / 未驗證",
                "title_en": "Verified / Unverified",
                "description_zh": "標記 `verified` 的紀錄會顯示已驗證標記並可附 `proof_text` 證明，未驗證紀錄仍進排行榜與分析。",
                "description_en": "Runs marked `verified` show a verified mark plus optional `proof_text`; unverified runs still feed the boards and analysis.",
                "href": "./review.html",
                "href_label_zh": "看驗證頁",
                "href_label_en": "Open Verification",
            },
            {
                "label_zh": "頁面拆分",
                "label_en": "Page Split",
                "title_zh": "Tracks / Players / Vehicles",
                "title_en": "Tracks / Players / Vehicles",
                "description_zh": "賽道頁負責榜單，玩家頁負責個人表現，車輛頁負責母型與變體統計，活動頁再承接賽季和積分系統。",
                "description_en": "Tracks own the boards, players own individual performance, vehicles own model-and-variant stats, and events will later carry season and points systems.",
                "href": "./players.html",
                "href_label_zh": "看玩家頁",
                "href_label_en": "Open Players",
            },
        ],
        "sections": DATA_MODEL_SECTIONS,
    }


def build_catalog_pages(records: list[dict[str, Any]], lookup: dict[str, Any]) -> dict[str, Any]:
    general_pool = [record for record in records if record["is_general_pool"]]

    # World index: one row per track world that has runs.
    world_run_counts: Counter[str] = Counter(r["track_world_code"] for r in general_pool)
    world_route_counts: dict[str, set[str]] = defaultdict(set)
    for r in general_pool:
        world_route_counts[r["track_world_code"]].add(r["route_key"])

    world_rows = []
    for tw_code, count in world_run_counts.most_common():
        track = lookup["track_worlds"].get(tw_code, {})
        world_rows.append(
            {
                "name": track.get("track_display_name") or track.get("world_name") or tw_code,
                "sub": track.get("track_author") or "",
                "meta": f"{len(world_route_counts[tw_code])} 路線",
                "value": f"{count} 筆",
                "href": track.get("world_url") or "",
            }
        )

    # Player index: one row per player that has runs.
    player_run_counts: Counter[str] = Counter(r["player_id"] for r in general_pool)
    player_rows = []
    for player_id, count in player_run_counts.most_common():
        player = lookup["players"].get(player_id, {})
        player_rows.append(
            {
                "name": player.get("display_name_primary") or player_id,
                "sub": player.get("team_name") or "",
                "value": f"{count} 筆",
            }
        )

    # Vehicle index: one row per canonical model that has runs.
    vehicle_run_counts: Counter[str] = Counter(r["vehicle_model_code"] for r in general_pool)
    vehicle_rows = []
    for model_code, count in vehicle_run_counts.most_common():
        model = lookup["vehicle_models"].get(model_code, {})
        vehicle_rows.append(
            {
                "name": model.get("vehicle_model_name") or model_code,
                "sub": model.get("vehicle_class") or "",
                "meta": f"{len(model.get('variant_names', []))} 變體" if model.get("variant_names") else "",
                "value": f"{count} 筆",
            }
        )

    return {
        "title_zh": "索引",
        "title_en": "Index",
        "description_zh": "賽道世界、玩家與車輛的快速索引，依紀錄筆數排序，方便直接查找而不必逐頁翻找。",
        "description_en": "A fast directory of track worlds, players, and vehicles, ranked by run count so you can look things up without paging through the analysis views.",
        "sidebar_zh": [
            "索引只列出目前有有效紀錄的項目。",
            "排序依紀錄筆數由多到少。",
            "點世界名稱（若有連結）可直接前往該賽道世界。",
        ],
        "sidebar_en": [
            "The index only lists entries that currently have valid runs.",
            "Ordering is by run count, most runs first.",
            "World names link out to their source world when a URL is available.",
        ],
        "indexes": [
            {
                "key": "worlds",
                "label_zh": "世界索引",
                "label_en": "World Index",
                "rows": world_rows,
            },
            {
                "key": "players",
                "label_zh": "玩家索引",
                "label_en": "Player Index",
                "rows": player_rows,
            },
            {
                "key": "vehicles",
                "label_zh": "車輛索引",
                "label_en": "Vehicle Index",
                "rows": vehicle_rows,
            },
        ],
    }


def build_info_page(
    records: list[dict[str, Any]],
    lookup: dict[str, Any],
    source_label: str,
    extra_review_cards: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    extra_pending = len(extra_review_cards or [])
    return {
        "title_zh": "資訊",
        "title_en": "Info",
        "description_zh": "本站的核心指標、builder 狀態與資料模型說明集中在這頁，讓各分析頁專心呈現紀錄。",
        "description_en": "Core metrics, builder status, and the data-model notes live here so the analysis pages can stay focused on records.",
        "build_state": "live",
        "source_label": source_label,
        "sidebar_zh": [
            "核心指標每次 builder 重建時更新。",
            "builder 狀態顯示最近建置時間與 schema 版本。",
            "資料模型說明本站如何從單一輸入表產生靜態頁。",
        ],
        "sidebar_en": [
            "Core metrics refresh every time the builder runs.",
            "Builder status shows the last build time and schema version.",
            "The data model explains how a single input sheet feeds the static pages.",
        ],
        "metric_cards": compute_count_cards(records, lookup, extra_pending),
        "sections": DATA_MODEL_SECTIONS,
    }


def build_track_pages(records: list[dict[str, Any]], lookup: dict[str, Any]) -> dict[str, Any]:
    general_pool = [record for record in records if record["is_general_pool"]]
    route_badges = build_route_badge_index(general_pool)

    boards: list[dict[str, Any]] = []
    for tw_code, track in sorted(
        lookup["track_worlds"].items(),
        key=lambda item: item[1]["track_display_name"],
    ):
        track_routes = sorted(
            [r for r in lookup["routes"].values() if r["track_world_code"] == tw_code],
            key=lambda r: r["route_display_name"],
        )
        route_boards = []
        for route in track_routes:
            rk = route_key(tw_code, route["route_code"])
            route_records = sort_records([r for r in general_pool if r["route_key"] == rk])
            if not route_records:
                continue

            player_bests = best_by(route_records, "player_id")
            vehicle_bests = best_by(route_records, "vehicle_model_code")

            route_rows = []
            for index, record in enumerate(route_records, start=1):
                route_rows.append(
                    build_badged_row(
                        {
                            **record,
                            "track_env": track.get("track_env") or "其他",
                        },
                        route_badges,
                        rank=index,
                        peer_label=record["vehicle_model_name"],
                    )
                )

            player_rows = []
            for index, record in enumerate(sort_records(list(player_bests.values())), start=1):
                player_rows.append(
                    build_badged_row(
                        {
                            **record,
                            "track_env": track.get("track_env") or "其他",
                        },
                        route_badges,
                        rank=index,
                        peer_label=record["vehicle_model_name"],
                    )
                )

            vehicle_rows = []
            for index, record in enumerate(sort_records(list(vehicle_bests.values())), start=1):
                vehicle_rows.append(
                    build_badged_row(
                        {
                            **record,
                            "track_env": track.get("track_env") or "其他",
                        },
                        route_badges,
                        rank=index,
                        peer_label=record["player_display_name"],
                    )
                )

            route_boards.append({
                "route_code": route["route_code"],
                "route_display_name": route["route_display_name"],
                "route_note_zh": route.get("route_note_zh") or "",
                "route_note_en": route.get("route_note_en") or "",
                "record_count": len(route_records),
                "route_rows": route_rows,
                "player_rows": player_rows,
                "vehicle_rows": vehicle_rows,
                "fastest": route_rows[0],
            })

        if not route_boards:
            continue

        tech_tags = normalize_tags(track.get("track_tags"))
        boards.append({
            "track_world_code": tw_code,
            "track_display_name": track["track_display_name"],
            "world_name": track["world_name"],
            "world_url": track.get("world_url") or "",
            "track_author": track.get("track_author") or "",
            "system_name": track.get("system_name") or "",
            "track_env": track.get("track_env") or "",
            "track_shape": track.get("track_shape") or "",
            "track_distance": track.get("track_distance") or "",
            "difficulty": track.get("difficulty") or "",
            "country": track.get("country") or "",
            "region": track.get("region") or "",
            "locality": track.get("locality") or "",
            "tech_tags": tech_tags,
            "routes": route_boards,
        })

    # Most-popular tracks first, ranked by total run count across the world's routes.
    boards.sort(key=lambda b: -sum(route["record_count"] for route in b["routes"]))

    all_platforms = sorted({
        r["platform_code"] for r in records
        if r["platform_code"] and r["platform_code"] not in ("", "unknown")
    })

    active_routes = len({rk for r in general_pool for rk in [r["route_key"]]})

    return {
        "title_zh": "賽道計時排行榜",
        "title_en": "Track Leaderboards",
        "description_zh": "賽道頁改以 leaderboard demo 的結構顯示三種視角：全紀錄榜、車輛榜、玩家榜，並直接標示 TR / CR / PR。",
        "description_en": "The tracks page now follows the leaderboard-demo structure: full route board, car board, and player board, with direct TR / CR / PR badges.",
        "sidebar_zh": [
            "TR：該路線全部有效紀錄裡最快的一筆。",
            "CR：該路線中，同一車型的最快一筆；若同時是 TR，則只顯示 TR。",
            "PR：該路線中，同一玩家的最快一筆；若同時是 TR 或 CR，則由高優先級覆蓋。",
        ],
        "sidebar_en": [
            "TR is the single fastest valid run on a route.",
            "CR is the fastest run for a vehicle model on that route, unless the same run is already TR.",
            "PR is the fastest run for a player on that route, unless a higher-priority badge already applies.",
        ],
        "metric_cards": [
            {
                "label_zh": "賽道世界",
                "label_en": "Track Worlds",
                "value": str(len(boards)),
                "note_zh": "有計時紀錄的世界數",
                "note_en": "Worlds that have at least one timed run",
            },
            {
                "label_zh": "活躍路線",
                "label_en": "Active Routes",
                "value": str(active_routes),
                "note_zh": "有至少一筆紀錄的路線",
                "note_en": "Routes with at least one recorded run",
            },
            {
                "label_zh": "有效紀錄",
                "label_en": "Valid Runs",
                "value": str(len(general_pool)),
                "note_zh": "未被拒絕、可進 leaderboard 的紀錄總數",
                "note_en": "All non-rejected runs that can enter the leaderboard",
            },
            {
                "label_zh": "平台數",
                "label_en": "Platforms",
                "value": str(len(all_platforms)),
                "note_zh": "有紀錄的平台種類",
                "note_en": "Distinct platforms with records",
            },
        ],
        "platforms": all_platforms,
        "boards": boards,
    }


def build_player_pages(records: list[dict[str, Any]], lookup: dict[str, Any]) -> dict[str, Any]:
    general_pool = [record for record in records if record["is_general_pool"]]
    route_badges = build_route_badge_index(general_pool)

    player_cards = []
    for player_id, player in sorted(lookup["players"].items(), key=lambda item: item[1]["display_name_primary"]):
        player_records = [record for record in general_pool if record["player_id"] == player_id]
        if not player_records:
            continue

        best_times = best_by(player_records, "route_key")
        route_best_records = sort_records(list(best_times.values()))
        official_records = [record for record in records if record["is_approved_board"] and record["player_id"] == player_id]
        vehicle_counter = Counter(record["vehicle_model_name"] for record in player_records)
        tag_counter = Counter(tag for record in player_records for tag in record["track_tags"])
        env_counter = Counter(
            lookup["track_worlds"].get(record["track_world_code"], {}).get("track_env") or "其他"
            for record in player_records
        )
        badge_counts = Counter(badge_code_for_record(record, route_badges) for record in route_best_records)

        record_rows = []
        for index, record in enumerate(route_best_records, start=1):
            record_rows.append(
                build_badged_row(
                    {
                        **record,
                        "track_env": lookup["track_worlds"].get(record["track_world_code"], {}).get("track_env") or "其他",
                    },
                    route_badges,
                    rank=index,
                    peer_label=record["vehicle_model_name"],
                )
            )

        # Build chronological history per route (only routes with >=2 runs)
        route_runs: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for rec in sorted(
            player_records,
            key=lambda r: (r["record_date"], r["record_id"]),
        ):
            route_runs[rec["route_key"]].append(rec)

        history: list[dict[str, Any]] = []
        for rk, runs in sorted(
            route_runs.items(),
            key=lambda item: -len(item[1]),  # most-run routes first
        ):
            if len(runs) < 2:
                continue
            pb_ms: int | None = None
            run_items = []
            for run in runs:
                is_pb = pb_ms is None or run["lap_time_ms"] < pb_ms
                if is_pb:
                    pb_ms = run["lap_time_ms"]
                run_items.append(
                    {
                        "date": run["record_date"],
                        "lap_time_ms": run["lap_time_ms"],
                        "lap_time_text": run["lap_time_text"],
                        "vehicle": run["vehicle_model_name"],
                        "is_pb": is_pb,
                    }
                )
            history.append(
                {
                    "route_key": rk,
                    "route_label": runs[0]["route_label_zh"],
                    "run_count": len(runs),
                    "runs": run_items,
                }
            )

        player_cards.append(
            {
                "player_id": player_id,
                "title": player["display_name_primary"],
                "team_name": player["team_name"] or "",
                "subtitle_zh": player["team_name"] or "未分隊車手",
                "subtitle_en": player["team_name"] or "Independent Driver",
                "stats": [
                    {"label_zh": "有效紀錄", "label_en": "Valid Runs", "value": str(len(player_records))},
                    {"label_zh": "已驗證", "label_en": "Verified Runs", "value": str(len(official_records))},
                    {"label_zh": "賽道最佳", "label_en": "Track Records", "value": str(badge_counts["TR"])},
                    {"label_zh": "車種最佳", "label_en": "Car Records", "value": str(badge_counts["CR"])},
                ],
                "badge_counts": {
                    "TR": badge_counts["TR"],
                    "CR": badge_counts["CR"],
                    "PR": badge_counts["PR"],
                },
                "tag_chips": [
                    {"label": player["team_name"] or "未分隊", "tone": "team"},
                    {"label": f"主力車種 {favorite_label(vehicle_counter)}", "tone": "vehicle"},
                    {"label": f"偏好環境 {favorite_label(env_counter)}", "tone": "env"},
                    {"label": f"路線標籤 {favorite_label(tag_counter)}", "tone": "skill"},
                ],
                "usage_rows": top_counter_items(vehicle_counter, limit=4),
                "tag_rows": top_counter_items(tag_counter, limit=4),
                "record_rows": record_rows,
                "history": history,
            }
        )

    player_cards.sort(
        key=lambda card: (
            -card["badge_counts"]["TR"],
            -card["badge_counts"]["CR"],
            -card["badge_counts"]["PR"],
            -int(card["stats"][1]["value"]),
            -int(card["stats"][0]["value"]),
            card["title"],
        )
    )

    return {
        "title_zh": "玩家個人頁",
        "title_en": "Player Analysis",
        "description_zh": "玩家頁改成滿版直排檔案卡。每條路線保留該玩家的最快一筆，並直接標示 TR / CR / PR。",
        "description_en": "Player pages are now full-width profile cards. Each route keeps that player's fastest valid run and marks it as TR / CR / PR directly.",
        "sidebar_zh": [
            "玩家唯一值使用 `player_id`，顯示名稱只是 lookup 對應。",
            "這裡的 PR 是該玩家在該路線的最快一筆；若同時滿足車輛或賽道路線最高，會被 CR / TR 覆蓋。",
            "「已驗證」只計入 `verified = true` 的紀錄，未驗證的有效紀錄仍會進個人頁。",
        ],
        "sidebar_en": [
            "Players are keyed by `player_id`; display names only come from lookup.",
            "PR is the player's fastest valid run on that route; it is overridden when the same run is also CR or TR.",
            "Verified counts only include `verified = true` runs, while unverified valid runs still feed the player profile.",
        ],
        "metric_cards": [
            {
                "label_zh": "玩家數",
                "label_en": "Players",
                "value": str(len(player_cards)),
                "note_zh": "有至少一筆有效紀錄的玩家",
                "note_en": "Players with at least one valid run",
            },
            {
                "label_zh": "隊伍數",
                "label_en": "Teams",
                "value": str(len({row['team_name'] for row in lookup['players'].values() if row['team_name']})),
                "note_zh": "目前 lookup 中已有的隊伍標示",
                "note_en": "Teams currently assigned in lookup",
            },
            {
                "label_zh": "TR 數量",
                "label_en": "Track Records",
                "value": str(len(best_by([record for record in records if record["is_general_pool"]], "route_key"))),
                "note_zh": "一般有效池內已確立的賽道路線最快數",
                "note_en": "Route-level fastest runs established in the valid pool",
            },
            {
                "label_zh": "CR 數量",
                "label_en": "Car Records",
                "value": str(
                    sum(
                        1
                        for record in best_by([record for record in records if record["is_general_pool"]], "record_id").values()
                        if badge_code_for_record(record, route_badges) == "CR"
                    )
                ),
                "note_zh": "目前一般有效池內的車輛路線紀錄數",
                "note_en": "Vehicle-model route records currently present in the valid pool",
            },
        ],
        "player_cards": player_cards,
        "sections": [
            {
                "label_zh": "後續擴充",
                "label_en": "Next Analysis",
                "title_zh": "可再加入的個人頁模組",
                "title_en": "Next Player Modules",
                "body_zh": "玩家頁後續可以加入成績變化圖、賽季積分、隊伍貢獻與賽道標籤勝率。",
                "body_en": "Player pages can later grow into performance-change charts, season points, team contribution, and win rates across track tags.",
                "items_zh": [
                    "個人成績變化時間線",
                    "車種 / 車輛使用頻次",
                    "對 uphill / downhill / technical 標籤的表現偏向",
                ],
                "items_en": [
                    "Personal performance-change timeline",
                    "Vehicle class / model usage frequency",
                    "Performance tendencies against uphill / downhill / technical tags",
                ],
            }
        ],
    }


def build_vehicle_pages(records: list[dict[str, Any]], lookup: dict[str, Any]) -> dict[str, Any]:
    general_pool = [record for record in records if record["is_general_pool"]]
    route_badges = build_route_badge_index(general_pool)

    vehicle_cards = []
    for model_code, model in sorted(lookup["vehicle_models"].items(), key=lambda item: item[1]["vehicle_model_name"]):
        model_records = [record for record in general_pool if record["vehicle_model_code"] == model_code]
        if not model_records:
            continue

        best_times = best_by(model_records, "route_key")
        route_best_records = sort_records(list(best_times.values()))
        official_records = [record for record in records if record["is_approved_board"] and record["vehicle_model_code"] == model_code]
        variant_counter = Counter(record["vehicle_variant_name"] for record in model_records)
        driver_counter = Counter(record["player_display_name"] for record in model_records)
        tag_counter = Counter(tag for record in model_records for tag in record["track_tags"])
        env_counter = Counter(
            lookup["track_worlds"].get(record["track_world_code"], {}).get("track_env") or "其他"
            for record in model_records
        )
        badge_counts = Counter(badge_code_for_record(record, route_badges) for record in route_best_records)

        record_rows = []
        for index, record in enumerate(route_best_records, start=1):
            record_rows.append(
                build_badged_row(
                    {
                        **record,
                        "track_env": lookup["track_worlds"].get(record["track_world_code"], {}).get("track_env") or "其他",
                    },
                    route_badges,
                    rank=index,
                    peer_label=record["player_display_name"],
                )
            )

        # 同母型不同變體:各自的最佳路線榜,供車輛頁「變體選單」切換(預設看全部)。
        variant_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for record in model_records:
            variant_groups[record["vehicle_variant_code"]].append(record)
        variants_payload: list[dict[str, Any]] = []
        if len(variant_groups) > 1:
            for vcode, vrecords in variant_groups.items():
                vbest = sort_records(list(best_by(vrecords, "route_key").values()))
                vrows = [
                    build_badged_row(
                        {**rec, "track_env": lookup["track_worlds"].get(rec["track_world_code"], {}).get("track_env") or "其他"},
                        route_badges, rank=i, peer_label=rec["player_display_name"])
                    for i, rec in enumerate(vbest, start=1)
                ]
                variants_payload.append({
                    "variant_code": vcode,
                    "variant_name": vrecords[0]["vehicle_variant_name"],
                    "record_count": len(vrecords),
                    "record_rows": vrows,
                })
            variants_payload.sort(key=lambda v: -v["record_count"])

        # drivetrain from the first variant (1:1 mapping currently)
        first_variant = lookup["vehicle_variants"].get(
            model_records[0]["vehicle_variant_code"] if model_records else model_code, {}
        )
        drivetrain = first_variant.get("drivetrain") or ""
        popularity = popularity_bucket(len(model_records))

        # 車廠 / 國籍 / 年份 + 特殊標記(賽事款/拉力款/渦輪改裝)。
        maker = model.get("manufacturer") or ""
        country = model.get("country") or ""
        year = model.get("year") or ""
        origin = " · ".join(p for p in (maker, country, year) if p)
        subtitle = " · ".join(p for p in (model["vehicle_class"], origin) if p)
        special_marks = [t for t in ("賽事款", "拉力款", "渦輪改裝") if t in model["vehicle_tags"]]

        vehicle_cards.append(
            {
                "vehicle_model_code": model_code,
                "title": model["vehicle_model_name"],
                "vehicle_class": model["vehicle_class"],
                "subtitle_zh": subtitle,
                "subtitle_en": subtitle,
                "manufacturer": maker,
                "country": country,
                "year": year,
                "special_marks": special_marks,
                "drivetrain": drivetrain,
                "popularity_bucket_key": popularity["key"],
                "popularity_bucket_zh": popularity["label_zh"],
                "popularity_bucket_en": popularity["label_en"],
                "stats": [
                    {"label_zh": "有效紀錄", "label_en": "Valid Runs", "value": str(len(model_records))},
                    {"label_zh": "已驗證", "label_en": "Verified Runs", "value": str(len(official_records))},
                    {"label_zh": "賽道最佳", "label_en": "Track Records", "value": str(badge_counts["TR"])},
                ],
                "badge_counts": {
                    "TR": badge_counts["TR"],
                    "CR": badge_counts["CR"],
                    "PR": badge_counts["PR"],
                },
                "tag_chips": [
                    *([{"label": origin, "tone": "team"}] if origin else [{"label": popularity["label_zh"], "tone": "team"}]),
                    *[{"label": mark, "tone": "skill"} for mark in special_marks],
                    {"label": model["vehicle_class"], "tone": "vehicle"},
                    {"label": f"驅動型式 {drivetrain or '-'}", "tone": "meta"},
                    {"label": f"偏好環境 {favorite_label(env_counter)}", "tone": "env"},
                    {"label": f"常見車手 {favorite_label(driver_counter)}", "tone": "skill"},
                ],
                "usage_rows": top_counter_items(variant_counter, limit=4),
                "tag_rows": top_counter_items(driver_counter, limit=4),
                "record_rows": record_rows,
                # 頁尾分析:環境適性(此車跑在哪些環境)。涵蓋率由前端用
                # record_rows 長度 + badge_counts 即時算,不另存。
                "env_rows": top_counter_items(env_counter, limit=6),
                # 同母型多變體時的各變體最佳路線榜(>1 才有);前端做變體選單。
                "variants": variants_payload,
            }
        )

    bucket_order = {"spotlight": 0, "active": 1, "rare": 2}
    vehicle_cards.sort(
        key=lambda card: (
            bucket_order.get(card["popularity_bucket_key"], 99),
            -int(card["stats"][0]["value"]),
            -card["badge_counts"]["TR"],
            -card["badge_counts"]["CR"],
            -int(card["stats"][1]["value"]),
            card["title"],
        )
    )

    return {
        "title_zh": "車輛統計頁",
        "title_en": "Vehicle Analysis",
        "description_zh": "車輛頁改成依熱門度分段的滿版卡。每條路線保留該車型的最快一筆，並直接標示 TR / CR。",
        "description_en": "Vehicle pages are now full-width cards grouped by popularity. Each route keeps the fastest valid run for that car model and marks it as TR / CR.",
        "sidebar_zh": [
            "輸入層保留 `vehicle_variant_code`，統計層再映射到 `vehicle_model_code`。",
            "這頁的 CR 是該車型在該路線的最快一筆；若同時也是整條路線最快，則升級顯示為 TR。",
            "熱門度先以有效紀錄數粗分，讓熱門車型優先顯示在前段。",
        ],
        "sidebar_en": [
            "Input keeps `vehicle_variant_code`, while analysis maps variants back to `vehicle_model_code`.",
            "CR is the fastest run for that model on a route; it upgrades to TR when the same run is also the route's fastest overall.",
            "Popularity is currently bucketed by valid-run volume so heavily used cars surface first.",
        ],
        "metric_cards": [
            {
                "label_zh": "車輛母型",
                "label_en": "Vehicle Models",
                "value": str(len(vehicle_cards)),
                "note_zh": "有至少一筆有效紀錄的母型",
                "note_en": "Canonical models with at least one valid run",
            },
            {
                "label_zh": "世界變體",
                "label_en": "Variants",
                "value": str(len(lookup["vehicle_variants"])),
                "note_zh": "lookup 內已登記的變體碼",
                "note_en": "Variant codes defined in lookup",
            },
            {
                "label_zh": "已驗證",
                "label_en": "Verified Runs",
                "value": str(sum(int(card["stats"][1]["value"]) for card in vehicle_cards)),
                "note_zh": "所有母型累積的已驗證紀錄",
                "note_en": "Verified runs across all models",
            },
            {
                "label_zh": "賽道最佳",
                "label_en": "Track Records",
                "value": str(sum(card["badge_counts"]["TR"] for card in vehicle_cards)),
                "note_zh": "車型紀錄中，同時也是整條路線最快的筆數",
                "note_en": "Runs that are both a model best and the fastest overall route record",
            },
        ],
        "vehicle_cards": vehicle_cards,
        "sections": [
            {
                "label_zh": "後續擴充",
                "label_en": "Next Analysis",
                "title_zh": "可再加入的車輛頁模組",
                "title_en": "Next Vehicle Modules",
                "body_zh": "接下來可補車種熱門度、不同賽道性質上的表現差異，以及同母型不同變體的對照。",
                "body_en": "Next steps include vehicle-class popularity, performance by track property, and variant-vs-variant comparisons inside the same canonical model.",
                "items_zh": [
                    "車種與賽道標籤關聯",
                    "賽道車種熱門度",
                    "不同世界變體的相對表現",
                ],
                "items_en": [
                    "Vehicle-class correlations against track tags",
                    "Track-side vehicle popularity",
                    "Relative performance across world-specific variants",
                ],
            }
        ],
    }


def build_event_pages(records: list[dict[str, Any]], lookup: dict[str, Any]) -> dict[str, Any]:
    general_pool = [record for record in records if record["is_general_pool"]]
    event_cards = []
    for event_code, event in sorted(lookup["events"].items(), key=lambda item: item[1]["event_name"]):
        event_records = [record for record in records if record["event_code"] == event_code]
        event_general = [record for record in general_pool if record["event_code"] == event_code]
        recent_rows = []
        for index, record in enumerate(
            sorted(event_records, key=lambda item: (item["record_date"], item["lap_time_ms"]), reverse=True)[:4],
            start=1,
        ):
            recent_rows.append(
                {
                    "rank": index,
                    "route_label": record["route_label_zh"],
                    "sub_label": f"{record['player_display_name']} / {record['channel_label_zh']}",
                    "lap_time_text": record["lap_time_text"],
                }
            )

        event_cards.append(
            {
                "event_code": event_code,
                "title": event["event_name"],
                "subtitle_zh": f"{event['season_name']} / {event['event_type']}",
                "subtitle_en": f"{event['season_name']} / {event['event_type']}",
                "stats": [
                    {"label_zh": "綁定紀錄", "label_en": "Linked Runs", "value": str(len(event_records))},
                    {"label_zh": "參與玩家", "label_en": "Players", "value": str(len({record['player_id'] for record in event_general}))},
                    {"label_zh": "涵蓋路線", "label_en": "Routes", "value": str(len({record['route_key'] for record in event_general}))},
                    {"label_zh": "已驗證", "label_en": "Verified", "value": str(len([record for record in event_records if record['verified']]))},
                ],
                "tags": [
                    f"狀態：{event['status']}",
                    f"積分規則：{event['points_rule_code']}",
                ],
                "usage_rows": [],
                "tag_rows": [],
                "best_times": recent_rows,
            }
        )

    season_names = {event["season_name"] for event in lookup["events"].values()}
    return {
        "title_zh": "活動與賽季頁",
        "title_en": "Events And Seasons",
        "description_zh": "活動頁先承接賽季、排位賽與錦標賽的索引，未來再逐步接上積分系統與賽程結果。",
        "description_en": "The events page starts as an index for seasons, qualifiers, and championships, and can later grow into a full points system and results archive.",
        "sidebar_zh": [
            "事件欄位會比計時頁複雜，第一版先保留活動索引與最近提交紀錄。",
            "後續若加入積分規則、分組或 heat 設計，建議都從 `events_meta` 延伸。",
            "如果輸入表未指定 event_code，該紀錄仍可進一般分析，但不會掛到活動頁。",
        ],
        "sidebar_en": [
            "Event data will become more complex than raw time-attack records, so v1 only keeps the event index and recent linked submissions.",
            "Points rules, class splits, and heat structures should later extend from `events_meta`.",
            "Runs without an `event_code` can still enter general analysis, but they will not appear inside event cards.",
        ],
        "metric_cards": [
            {
                "label_zh": "賽季數",
                "label_en": "Seasons",
                "value": str(len(season_names)),
                "note_zh": "目前 metadata 已定義的賽季",
                "note_en": "Seasons currently defined in metadata",
            },
            {
                "label_zh": "活動數",
                "label_en": "Events",
                "value": str(len(event_cards)),
                "note_zh": "已建立索引的活動項目",
                "note_en": "Indexed events currently in metadata",
            },
            {
                "label_zh": "活動綁定紀錄",
                "label_en": "Linked Runs",
                "value": str(len([record for record in records if record["event_code"]])),
                "note_zh": "目前有 event_code 的紀錄",
                "note_en": "Runs that currently carry an event code",
            },
            {
                "label_zh": "活動已驗證",
                "label_en": "Verified Event Runs",
                "value": str(len([record for record in records if record["event_code"] and record["verified"]])),
                "note_zh": "活動下已驗證的紀錄",
                "note_en": "Verified runs linked to an event",
            },
        ],
        "event_cards": event_cards,
        "sections": [
            {
                "label_zh": "積分系統",
                "label_en": "Points Layer",
                "title_zh": "預留賽季與積分擴充",
                "title_en": "Reserved Season And Points Expansion",
                "body_zh": "等活動頁資料穩定後，可以再接上分組、資格賽、積分規則與每站名次結果。",
                "body_en": "Once event metadata stabilizes, this page can expand into grids, qualifiers, points rules, and full round-by-round standings.",
                "items_zh": [
                    "排位賽 / 錦標賽格式",
                    "站別積分與總積分",
                    "車隊分數與賽季結算",
                ],
                "items_en": [
                    "Qualifier and championship formats",
                    "Round points and season totals",
                    "Team scoring and season wrap-ups",
                ],
            }
        ],
    }


def build_review_pages(records: list[dict[str, Any]], extra_review_cards: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    valid_records = [record for record in records if record["is_general_pool"]]
    verified_records = [record for record in valid_records if record["verified"]]
    unverified_records = [record for record in valid_records if not record["verified"]]

    # Verification queue: valid-but-unverified runs, newest/fastest first.
    review_cards = []
    for record in sorted(
        unverified_records,
        key=lambda item: (item["record_date"], -item["lap_time_ms"]),
        reverse=True,
    )[:60]:
        review_cards.append(
            {
                "status_zh": "未驗證",
                "status_en": "Unverified",
                "title_zh": record["route_label_zh"],
                "title_en": record["route_label_en"],
                "player_display_name": record["player_display_name"],
                "vehicle_display_name": record["vehicle_variant_name"],
                "lap_time_text": record["lap_time_text"],
                "record_date": record["record_date"],
                "event_name": record["event_name"] or "Independent run",
                "submission_note": record["proof_text"] or record["submission_note"],
            }
        )

    extra_review_cards = extra_review_cards or []
    if extra_review_cards:
        review_cards.extend(extra_review_cards)

    timeline = []
    for record in sorted(verified_records, key=lambda item: (item["verified_at"] or item["record_date"]), reverse=True)[:8]:
        timeline.append(
            {
                "date": record["verified_at"] or record["record_date"],
                "label_zh": "已驗證紀錄",
                "label_en": "Verified Run",
                "title_zh": record["route_label_zh"],
                "title_en": record["route_label_en"],
                "meta_zh": f"{record['player_display_name']} / {record['vehicle_variant_name']} / {record['lap_time_text']}",
                "meta_en": f"{record['player_display_name']} / {record['vehicle_variant_name']} / {record['lap_time_text']}",
                "body_zh": record["proof_text"] or record["submission_note"],
                "body_en": record["proof_text"] or record["submission_note"],
            }
        )

    return {
        "title_zh": "驗證頁",
        "title_en": "Verification",
        "description_zh": "驗證頁集中呈現已驗證與未驗證紀錄。所有有效紀錄都進排行榜，驗證只是額外的可信度標記與證明（proof_text）。",
        "description_en": "The verification page surfaces verified and unverified runs. Every valid run still enters the leaderboards; verification only adds a credibility mark plus proof_text evidence.",
        "sidebar_zh": [
            "`verified = true` 的紀錄會在各頁顯示已驗證標記。",
            "`proof_text` 記錄證明方式或連結，未驗證紀錄仍可進排行榜與分析。",
            "後續可再補見證人（verified_by）、驗證時間（verified_at）與更細的證明層級。",
        ],
        "sidebar_en": [
            "Runs with `verified = true` show a verified mark across the views.",
            "`proof_text` stores the evidence note or link; unverified runs still enter boards and analysis.",
            "Witness (verified_by), verification time (verified_at), and finer proof levels can be added later.",
        ],
        "metric_cards": [
            {
                "label_zh": "有效紀錄",
                "label_en": "Valid Runs",
                "value": str(len(valid_records)),
                "note_zh": "未被拒絕、可進排行榜的紀錄",
                "note_en": "Non-rejected runs eligible for the leaderboards",
            },
            {
                "label_zh": "已驗證",
                "label_en": "Verified",
                "value": str(len(verified_records)),
                "note_zh": "已標記 verified 的紀錄",
                "note_en": "Runs marked verified",
            },
            {
                "label_zh": "未驗證",
                "label_en": "Unverified",
                "value": str(len(unverified_records) + len(extra_review_cards)),
                "note_zh": "尚未驗證的有效紀錄",
                "note_en": "Valid runs not verified yet",
            },
            {
                "label_zh": "驗證率",
                "label_en": "Verified Rate",
                "value": (f"{round(100 * len(verified_records) / len(valid_records))}%" if valid_records else "-"),
                "note_zh": "已驗證佔有效紀錄比例",
                "note_en": "Share of valid runs that are verified",
            },
        ],
        "review_cards": review_cards,
        "timeline": timeline,
        "sections": [
            {
                "label_zh": "驗證規格",
                "label_en": "Verification Criteria",
                "title_zh": "預留的驗證欄位",
                "title_en": "Reserved Verification Fields",
                "body_zh": "目前以 `verified` 布林與 `proof_text` 為主，之後可補見證人、錄影連結、FPS 與版本欄位。",
                "body_en": "Verification currently uses the `verified` boolean plus `proof_text`; witness, footage, FPS, and build-version fields can be added later.",
                "items_zh": [
                    "證明說明 / 連結（proof_text）",
                    "見證人 / 裁定人（verified_by）",
                    "驗證時間（verified_at）",
                ],
                "items_en": [
                    "Proof note or link (proof_text)",
                    "Witness or steward (verified_by)",
                    "Verification timestamp (verified_at)",
                ],
            }
        ],
    }


TRACKMAP_GEO_DIR = "geo"
TRACKMAP_REGION_OVERLAY_SUBDIR = "regions"
TRACKMAP_REGION_OVERLAY_DIR = f"{TRACKMAP_GEO_DIR}/{TRACKMAP_REGION_OVERLAY_SUBDIR}"
TRACKMAP_POSTER_DIR = Path(__file__).resolve().parent / "assets" / "trackmap"
TRACKMAP_POSTER_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def split_bilingual(value: str) -> tuple[str, str]:
    """'日本Japan' -> ('日本', 'Japan'); pure-ASCII value -> (value, value)."""
    value = (value or "").strip()
    if not value:
        return "", ""
    idx = 0
    while idx < len(value) and ord(value[idx]) > 127:
        idx += 1
    if idx == 0 or idx == len(value):
        return value, value
    return value[:idx].strip(), value[idx:].strip()


def slug_fragment(value: str) -> str:
    """Stable ASCII slug fragment for file names derived from bilingual labels."""
    _, english = split_bilingual(value)
    base = english or (value or "").strip()
    slug = re.sub(r"[^0-9A-Za-z]+", "-", base).strip("-").lower()
    if slug:
        return slug
    digest = hashlib.sha1((value or "_").encode("utf-8")).hexdigest()[:10]
    return f"r{digest}"


def region_overlay_code(country: str, region: str) -> str:
    return f"{slug_fragment(country)}__{slug_fragment(region)}"


# 共用色彩規則(首頁頻率圖 + 地圖頁共用):
#   色相 hue = 國家(現有國家集合上均分),彩度 saturation = 系統(CVS 高 / Sacc 低)。
# builder 一次算好 (country, system) → 色碼,兩頁查同一份 colors,保證顏色對齊。
CATEGORY_SYSTEM_STYLE = {
    "CVS": (78, 62),    # 高彩度
    "Sacc": (28, 64),   # 低彩度
}
CATEGORY_DEFAULT_STYLE = (45, 62)         # 其他系統
CATEGORY_NEUTRAL = "hsl(150, 6%, 52%)"    # 未定位 / 無國家或系統


def category_key(country: str, system: str) -> str:
    return f"{(country or '').strip()}|{(system or '').strip()}"


def build_category_style(lookup: dict[str, Any]) -> dict[str, Any]:
    """色相=國家、彩度=系統(CVS 高/Sacc 低)的共用色碼表 + 圖例。

    色相在現有國家集合上均分,規則化且可重現;只輸出實際存在的
    (國家, 系統) 組合。首頁與地圖頁都帶這份,顏色必然一致。
    """
    track_worlds = lookup["track_worlds"].values()
    countries = sorted({
        (t.get("country") or "").strip()
        for t in track_worlds
        if (t.get("country") or "").strip()
    })
    n = max(len(countries), 1)
    hues = {country: round(i * 360 / n) for i, country in enumerate(countries)}

    combos = sorted({
        ((t.get("country") or "").strip(), (t.get("system_name") or "").strip())
        for t in track_worlds
        if (t.get("country") or "").strip() and (t.get("system_name") or "").strip()
    })

    colors: dict[str, str] = {}
    legend: list[dict[str, Any]] = []
    for country, system in combos:
        sat, light = CATEGORY_SYSTEM_STYLE.get(system, CATEGORY_DEFAULT_STYLE)
        color = f"hsl({hues[country]}, {sat}%, {light}%)"
        key = category_key(country, system)
        colors[key] = color
        czh, cen = split_bilingual(country)
        legend.append({
            "key": key, "color": color, "country": country, "system": system,
            "label_zh": f"{czh}·{system}", "label_en": f"{cen}·{system}",
        })
    return {"colors": colors, "neutral": CATEGORY_NEUTRAL, "legend": legend}


TRACE_CONNECTOR_ROLES = {"connector", "shared", "link", "approach"}


def trace_feature_lines(
    trace: dict[str, Any], *, prefer_focus: bool = False
) -> list[list[Any]]:
    lines: list[list[Any]] = []
    fallback: list[list[Any]] = []
    for feature in trace.get("features") or []:
        geometry = (feature or {}).get("geometry") or {}
        props = (feature or {}).get("properties") or {}
        role = str(props.get("ta_role") or props.get("role") or "").strip().lower()
        focus_flag = props.get("ta_focus")
        is_connector = role in TRACE_CONNECTOR_ROLES
        use_for_focus = focus_flag is not False and not is_connector
        if geometry.get("type") == "LineString":
            current = [geometry.get("coordinates") or []]
        elif geometry.get("type") == "MultiLineString":
            current = geometry.get("coordinates") or []
        else:
            continue
        fallback.extend(current)
        if not prefer_focus or use_for_focus:
            lines.extend(current)
    return lines or fallback


def trace_midpoint(trace: dict[str, Any]) -> tuple[float, float] | None:
    """Marker anchor for a traced track: midpoint of its longest focus line, as (lat, lng)."""
    best: list[Any] = []
    for line in trace_feature_lines(trace, prefer_focus=True):
        if len(line) > len(best):
            best = line
    if len(best) < 2:
        return None
    lng, lat = best[len(best) // 2][:2]
    return float(lat), float(lng)


def trace_bounds_payload(
    trace: dict[str, Any], *, prefer_focus: bool = False,
) -> list[list[float]] | None:
    min_lat = min_lng = float("inf")
    max_lat = max_lng = float("-inf")
    found = False
    for line in trace_feature_lines(trace, prefer_focus=prefer_focus):
        for point in line:
            if not isinstance(point, (list, tuple)) or len(point) < 2:
                continue
            lng, lat = point[:2]
            try:
                lat_f = float(lat)
                lng_f = float(lng)
            except (TypeError, ValueError):
                continue
            min_lat = min(min_lat, lat_f)
            max_lat = max(max_lat, lat_f)
            min_lng = min(min_lng, lng_f)
            max_lng = max(max_lng, lng_f)
            found = True
    if not found:
        return None
    return [[min_lat, min_lng], [max_lat, max_lng]]


def normalize_region_overlay_feature(
    feature: dict[str, Any], *, default_role: str = "main",
) -> dict[str, Any] | None:
    geometry = (feature or {}).get("geometry") or {}
    if geometry.get("type") not in {"LineString", "MultiLineString"}:
        return None
    props = (feature or {}).get("properties") or {}
    role = str(props.get("ta_role") or props.get("role") or "").strip().lower() or default_role
    normalized_props: dict[str, Any] = {"ta_role": role, "ta_focus": False}
    for src, dest in (
        ("ta_opacity", "ta_opacity"),
        ("opacity", "ta_opacity"),
        ("ta_weight", "ta_weight"),
        ("weight", "ta_weight"),
        ("ta_dash", "ta_dash"),
        ("dash", "ta_dash"),
        ("dashArray", "ta_dash"),
    ):
        value = props.get(src)
        if value is not None and value != "" and dest not in normalized_props:
            normalized_props[dest] = value
    return {"type": "Feature", "properties": normalized_props, "geometry": geometry}


def build_auto_region_overlay(
    cards: list[dict[str, Any]], traces: dict[str, dict[str, Any]],
) -> dict[str, Any] | None:
    features: list[dict[str, Any]] = []
    seen_geometries: set[str] = set()
    for card in cards:
        trace = traces.get(card.get("track_world_code") or "")
        if not trace:
            continue
        for feature in trace.get("features") or []:
            normalized = normalize_region_overlay_feature(feature)
            if not normalized:
                continue
            geometry_key = json.dumps(
                normalized["geometry"], ensure_ascii=False, separators=(",", ":"),
            )
            if geometry_key in seen_geometries:
                continue
            seen_geometries.add(geometry_key)
            features.append(normalized)
    if not features:
        return None
    return {"type": "FeatureCollection", "features": features}


def build_trackmap(
    records: list[dict[str, Any]], lookup: dict[str, Any], output_dir: Path,
) -> dict[str, Any]:
    """country → region → locality → tracks 樹 + 點位/軌跡。

    顯示優先序:軌跡(整條線)→ 地名點位 → 未定位清單。
    同時把每條軌跡輸出成 data/geo/<code>.geojson 供前端懶載,並清掉孤兒檔。
    """
    general_pool = [record for record in records if record["is_general_pool"]]
    run_counts = Counter(record["track_world_code"] for record in general_pool)
    route_counts: dict[str, set] = defaultdict(set)
    for record in general_pool:
        route_counts[record["track_world_code"]].add(record["route_key"])

    geo_places: dict[tuple, dict[str, Any]] = lookup.get("geo_places") or {}
    warnings: list[str] = []

    traces: dict[str, dict[str, Any]] = {}
    for code, raw in (lookup.get("geo_traces") or {}).items():
        if code not in lookup["track_worlds"]:
            warnings.append(f"geo_traces 孤兒列:{code} 不在 track_worlds")
            continue
        try:
            traces[code] = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            warnings.append(f"geo_traces 解析失敗:{code}")

    parsed_region_overlays: dict[tuple[str, str], dict[str, Any]] = {}
    for key, raw in (lookup.get("geo_region_overlays") or {}).items():
        country_key = (key[0] or "").strip()
        region_key = (key[1] or "").strip()
        if not country_key or not region_key:
            warnings.append(
                "geo_region_overlays key missing country / region:" + " / ".join(
                    filter(None, (country_key, region_key)),
                ),
            )
            continue
        try:
            parsed_region_overlays[(country_key, region_key)] = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            warnings.append(f"geo_region_overlays decode failed: {country_key} / {region_key}")

    geo_dir = output_dir / TRACKMAP_GEO_DIR
    geo_dir.mkdir(parents=True, exist_ok=True)
    for stale in geo_dir.glob("*.geojson"):
        if stale.stem not in traces:
            stale.unlink()
    for code, parsed in traces.items():
        (geo_dir / f"{code}.geojson").write_text(
            json.dumps(parsed, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )

    posters: dict[str, str] = {}
    if TRACKMAP_POSTER_DIR.exists():
        for poster in sorted(TRACKMAP_POSTER_DIR.iterdir()):
            if poster.suffix.lower() in TRACKMAP_POSTER_EXTS:
                posters.setdefault(poster.stem, poster.suffix.lower().lstrip("."))

    def track_card(track: dict[str, Any]) -> dict[str, Any]:
        code = track["track_world_code"]
        card = {
            "track_world_code": code,
            "track_display_name": track["track_display_name"],
            "world_name": track.get("world_name") or "",
            "world_url": track.get("world_url") or "",
            "system_name": track.get("system_name") or "",
            "track_env": track.get("track_env") or "",
            "difficulty": track.get("difficulty") or "",
            "route_count": len(route_counts.get(code, ())),
            "record_count": run_counts.get(code, 0),
            "has_trace": code in traces,
            "has_poster": code in posters,
            "poster_ext": posters.get(code),
        }
        if code in traces:
            midpoint = trace_midpoint(traces[code])
            if midpoint:
                card["trace_lat"], card["trace_lng"] = midpoint
            card["trace_file"] = f"{TRACKMAP_GEO_DIR}/{code}.geojson"
        return card

    # 分組:country → region → locality
    grouped: dict[str, dict[str, dict[tuple, list[dict[str, Any]]]]] = {}
    unlocated: list[dict[str, Any]] = []
    used_triples: set[tuple] = set()
    for code, track in sorted(
        lookup["track_worlds"].items(),
        key=lambda item: item[1]["track_display_name"],
    ):
        country = (track.get("country") or "").strip()
        region = (track.get("region") or "").strip()
        locality = (track.get("locality") or "").strip()
        if not country or not locality:
            if country or locality:
                warnings.append(f"{code} 的國家/地名只填了一半,先列入未定位")
            unlocated.append(track_card(track))
            continue
        used_triples.add((country, region, locality))
        grouped.setdefault(country, {}).setdefault(region, {}).setdefault(
            (country, region, locality), []).append(track_card(track))

    for triple in geo_places:
        if triple not in used_triples:
            warnings.append(
                "geo_places 孤兒列(無賽道引用):" + " / ".join(filter(None, triple)))

    # 國家排序:臺灣置頂、日本第二,其餘按名稱。
    def country_sort_key(name: str) -> tuple:
        for rank, token in enumerate(("Taiwan", "Japan")):
            if token in name:
                return (0, rank, "")
        return (1, 0, name)

    region_overlay_files: dict[str, dict[str, Any]] = {}
    used_region_keys: set[tuple[str, str]] = set()
    countries = []
    for country_name in sorted(grouped, key=country_sort_key):
        zh, en = split_bilingual(country_name)
        regions = []
        for region_name in sorted(grouped[country_name]):
            if region_name:
                used_region_keys.add((country_name, region_name))
            rzh, ren = split_bilingual(region_name)
            localities = []
            traced_locality_count = 0
            for triple, cards in sorted(
                grouped[country_name][region_name].items(), key=lambda item: item[0][2],
            ):
                if any(card.get("has_trace") for card in cards):
                    traced_locality_count += 1
                lzh, len_ = split_bilingual(triple[2])
                place = geo_places.get(triple) or {}
                lat, lng = place.get("latitude"), place.get("longitude")
                point_source = "place"
                if lat is None or lng is None:
                    # 點位 fallback:地名沒填座標時,借用成員軌跡的中點。
                    lat = lng = None
                    point_source = ""
                    for card in cards:
                        if "trace_lat" in card:
                            lat, lng = card["trace_lat"], card["trace_lng"]
                            point_source = "trace"
                            break
                locality_node = {
                    "name": triple[2], "name_zh": lzh, "name_en": len_,
                    "has_point": lat is not None and lng is not None,
                    "tracks": cards,
                }
                if locality_node["has_point"]:
                    locality_node["lat"] = lat
                    locality_node["lng"] = lng
                    locality_node["point_source"] = point_source
                localities.append(locality_node)
            region_node = {
                "name": region_name, "name_zh": rzh, "name_en": ren,
                "localities": localities,
            }
            region_cards = [card for cards in grouped[country_name][region_name].values() for card in cards]
            traced_cards = [card for card in region_cards if card.get("has_trace")]
            overlay_payload = parsed_region_overlays.get((country_name, region_name))
            auto_overlay_enabled = traced_locality_count >= 2 or len(traced_cards) >= 4
            overlay_source = ""
            if overlay_payload:
                overlay_source = "manual"
            elif region_name and auto_overlay_enabled:
                overlay_payload = build_auto_region_overlay(region_cards, traces)
                if overlay_payload:
                    overlay_source = "auto"
            if overlay_payload and region_name:
                overlay_code = region_overlay_code(country_name, region_name)
                region_overlay_files[overlay_code] = overlay_payload
                region_node["has_overlay"] = True
                region_node["overlay_file"] = (
                    f"{TRACKMAP_REGION_OVERLAY_DIR}/{overlay_code}.geojson"
                )
                region_node["overlay_source"] = overlay_source or "manual"
                overlay_bounds = (
                    trace_bounds_payload(overlay_payload, prefer_focus=True)
                    or trace_bounds_payload(overlay_payload)
                )
                if overlay_bounds:
                    region_node["overlay_bounds"] = overlay_bounds
            regions.append(region_node)
        countries.append({
            "name": country_name, "name_zh": zh, "name_en": en,
            "regions": regions,
        })

    region_geo_dir = geo_dir / TRACKMAP_REGION_OVERLAY_SUBDIR
    region_geo_dir.mkdir(parents=True, exist_ok=True)
    for stale in region_geo_dir.glob("*.geojson"):
        if stale.stem not in region_overlay_files:
            stale.unlink()
    for code, parsed in region_overlay_files.items():
        (region_geo_dir / f"{code}.geojson").write_text(
            json.dumps(parsed, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
    for country_key, region_key in sorted(parsed_region_overlays):
        if (country_key, region_key) not in used_region_keys:
            warnings.append(
                f"geo_region_overlays references unknown region: {country_key} / {region_key}",
            )

    located_tracks = sum(
        len(loc["tracks"])
        for country in countries for region in country["regions"]
        for loc in region["localities"]
    )
    pointed_places = sum(
        1 for country in countries for region in country["regions"]
        for loc in region["localities"] if loc["has_point"]
    )
    for warning in warnings:
        print(f"[trackmap] WARNING: {warning}")

    return {
        "title_zh": "賽道地圖",
        "title_en": "Track Map",
        "description_zh": "依 國家 → 區域 → 地名 下鑽的賽道地理視圖。有整條路線軌跡的賽道直接畫線,其餘以地名點位標示;虛構與未定位世界列在側欄清單。",
        "description_en": "Geographic view of every track world: country → region → locality. Tracks with a drawn route render the full line; others fall back to a locality marker. Fictional or unlocated worlds stay in the sidebar list.",
        "sidebar_zh": [
            "顯示優先序:整條軌跡 → 地名點位 → 未定位清單。",
            "點位掛在「地名」層:同一地點的多個賽道版本共用一顆標記。",
            "資料在登錄工具「索引編輯 → 地理點位 / 路線軌跡」維護,重建 JSON 後生效。",
        ],
        "sidebar_en": [
            "Display priority: full route trace, then locality marker, then the unlocated list.",
            "Markers live at the locality level — track variants of the same place share one marker.",
            "Edit geo data in the record tool (Index Edit → Geo Points / Route Traces), then rebuild JSON.",
        ],
        "metric_cards": [
            {"label_zh": "已定位賽道", "label_en": "Located Tracks",
             "value": str(located_tracks),
             "note_zh": "已掛在地圖樹上的賽道世界", "note_en": "Track worlds placed in the map tree"},
            {"label_zh": "地點", "label_en": "Places",
             "value": str(pointed_places),
             "note_zh": "有座標可上圖的地名", "note_en": "Localities with map coordinates"},
            {"label_zh": "路線軌跡", "label_en": "Route Traces",
             "value": str(len(traces)),
             "note_zh": "已畫整條線的賽道", "note_en": "Tracks with a full drawn route"},
            {"label_zh": "未定位", "label_en": "Unlocated",
             "value": str(len(unlocated)),
             "note_zh": "虛構或尚未標地理位置的世界", "note_en": "Fictional or not-yet-tagged worlds"},
        ],
        "countries": countries,
        "unlocated": unlocated,
        "warnings": warnings,
        "category_style": build_category_style(lookup),
    }


TA_SITE_BASE = "https://starriverarts.github.io/StarRiver-Arts-Site/play/RacingClub/TimeAttack"


def build_bot_updates(records: list[dict[str, Any]], lookup: dict[str, Any], output_dir: Path) -> dict[str, Any]:
    """Builder = 變更偵測器。比對上一版快照,輸出 Discord bot 用的資料契約:
       data/bot/{record_updates,bot_feed,publish_marker}.json + snapshot_cache.json(builder 旁,本地)。

    本版只偵測 track_record(每條路線最快有效紀錄;有效池 = is_general_pool,與網站榜單一致)。
    第一次建立(無前快照)只記基準、不產生公告,避免一次洗版。
    """
    bot_dir = output_dir / "bot"
    bot_dir.mkdir(parents=True, exist_ok=True)
    cache_path = output_dir.parent / "snapshot_cache.json"  # 不在 data/(不被服務),gitignore

    general_pool = [r for r in records if r["is_general_pool"]]
    best = best_by(general_pool, "route_key")

    def snap(rec: dict[str, Any]) -> dict[str, Any]:
        return {
            "record_id": rec["record_id"],
            "player_id": rec["player_id"], "player_name": rec["player_display_name"],
            "vehicle_model_code": rec["vehicle_model_code"], "vehicle_name": rec["vehicle_model_name"],
            "time_ms": rec["lap_time_ms"], "time_text": rec["lap_time_text"],
            "track_world_code": rec["track_world_code"], "track_name": rec["track_display_name"],
            "route_code": rec["route_code"], "route_label": rec["route_label_zh"],
        }

    current = {rk: snap(rec) for rk, rec in best.items()}

    try:
        prior = json.loads(cache_path.read_text(encoding="utf-8")).get("track_records", {})
    except (OSError, json.JSONDecodeError):
        prior = {}
    first_build = not prior

    build_id = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    def delta_text(ms: int) -> str:
        return f"{ms / 1000:+.3f}"

    cur_fields = ("player_id", "player_name", "vehicle_model_code", "vehicle_name", "time_ms", "time_text")
    updates: list[dict[str, Any]] = []
    if not first_build:
        for rk, cur in current.items():
            prev = prior.get(rk)
            if prev is None:
                continue  # 新路線首次有紀錄,不公告
            if cur["time_ms"] < prev["time_ms"]:  # 變快 = 破賽道紀錄
                delta = cur["time_ms"] - prev["time_ms"]
                updates.append({
                    "update_id": f"tr_{rk}_{cur['record_id']}".replace(":", "_"),
                    "update_type": "track_record",
                    "track_id": cur["track_world_code"], "track_name": cur["track_name"],
                    "route_code": cur["route_code"], "route_label": cur["route_label"],
                    "board": "track", "platform": "all",
                    "previous": {k: prev.get(k) for k in cur_fields},
                    "current": {**{k: cur[k] for k in cur_fields}, "proof_url": ""},
                    "delta_ms": delta, "delta_text": delta_text(delta),
                    "page_url": f"{TA_SITE_BASE}/track.html?id={cur['track_world_code']}&route={cur['route_code']}",
                    "screenshot": {"command": "track-record", "track": cur["track_world_code"],
                                   "route": cur["route_code"], "board": "track", "platform": "all"},
                    "created_at": generated_at,
                })

    write_json(bot_dir / "record_updates.json",
               {"schema_version": 1, "generated_at": generated_at, "build_id": build_id, "updates": updates})
    write_json(bot_dir / "bot_feed.json", {
        "schema_version": 1, "generated_at": generated_at, "build_id": build_id,
        "site_base_url": TA_SITE_BASE,
        "latest_update_file": "./record_updates.json",
        "update_count": len(updates),
    })
    write_json(bot_dir / "publish_marker.json", {
        "build_id": build_id, "published_at": None, "ready_for_discord": False,
        "_note": "push 上站後由發布步驟把 ready_for_discord 設 true;bot 只在 build_id 相符且 ready 時公告。",
    })
    cache_path.write_text(
        json.dumps({"build_id": build_id, "track_records": current}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")
    print(f"[bot] build_id={build_id} track_record updates={len(updates)}"
          f"{' (baseline, no announce)' if first_build else ''}")
    return {"build_id": build_id, "updates": updates}


def build_all(args: argparse.Namespace) -> None:
    _, records, lookup, extras, source_label = resolve_source(args)
    compute_delta_text(records)

    manifest = build_manifest(source_label)
    summary = build_summary(records, lookup, extras.get("review_cards"))
    tracks = build_track_pages(records, lookup)
    players = build_player_pages(records, lookup)
    vehicles = build_vehicle_pages(records, lookup)
    events = build_event_pages(records, lookup)
    catalog = build_catalog_pages(records, lookup)
    info = build_info_page(records, lookup, source_label, extras.get("review_cards"))
    review = build_review_pages(records, extras.get("review_cards"))
    trackmap = build_trackmap(records, lookup, args.output_dir)
    build_bot_updates(records, lookup, args.output_dir)

    write_json(args.output_dir / ROUTE_FILE_MAP["overview"], summary)
    write_json(args.output_dir / ROUTE_FILE_MAP["tracks"], tracks)
    write_json(args.output_dir / ROUTE_FILE_MAP["players"], players)
    write_json(args.output_dir / ROUTE_FILE_MAP["vehicles"], vehicles)
    write_json(args.output_dir / ROUTE_FILE_MAP["events"], events)
    write_json(args.output_dir / ROUTE_FILE_MAP["catalog"], catalog)
    write_json(args.output_dir / ROUTE_FILE_MAP["info"], info)
    write_json(args.output_dir / ROUTE_FILE_MAP["review"], review)
    write_json(args.output_dir / ROUTE_FILE_MAP["trackmap"], trackmap)
    write_json(args.output_dir / "manifest.json", manifest)


def main() -> None:
    args = parse_args()
    build_all(args)


if __name__ == "__main__":
    main()
