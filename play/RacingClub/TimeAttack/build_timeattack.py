from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "0.3.0"
ROUTE_FILE_MAP = {
    "overview": "summary.json",
    "tracks": "tracks.json",
    "players": "players.json",
    "vehicles": "vehicles.json",
    "events": "events.json",
    "review": "review.json",
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
        choices=("auto", "normalized", "legacy-json"),
        default="auto",
        help="Choose between the normalized local CSV source and a legacy JSON source.",
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


def load_normalized_source_data(
    source_dir: Path,
) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    track_world_rows = read_csv_rows(source_dir / "tracks_meta.sample.csv")
    route_rows = read_csv_rows(source_dir / "routes_meta.sample.csv")
    player_rows = read_csv_rows(source_dir / "players_meta.sample.csv")
    vehicle_rows = read_csv_rows(source_dir / "vehicles_meta.sample.csv")
    event_rows = read_csv_rows(source_dir / "events_meta.sample.csv")
    record_rows = read_csv_rows(source_dir / "records_input.sample.csv")

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

        channel_label_zh = "Approved Record" if row["record_channel"] == "approved_record" else "Normal Time Attack"
        channel_label_en = channel_label_zh
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
                "is_approved_board": row["record_channel"] == "approved_record" and review_status == "approved",
                "is_normal_board": row["record_channel"] == "normal_time_attack" and review_status != "rejected",
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
                "channel_label_zh": "Approved Record",
                "channel_label_en": "Approved Record",
                "is_approved_board": review_status == "approved",
                "is_normal_board": False,
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


def resolve_source(
    args: argparse.Namespace,
) -> tuple[str, list[dict[str, Any]], dict[str, Any], dict[str, Any], str]:
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
        "channels": [
            {"code": "approved_record", "label_zh": "Approved Record", "label_en": "Approved Record"},
            {"code": "normal_time_attack", "label_zh": "Normal Time Attack", "label_en": "Normal Time Attack"},
        ],
    }


def build_summary(
    records: list[dict[str, Any]],
    lookup: dict[str, Any],
    extra_review_cards: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    approved_board = [record for record in records if record["is_approved_board"]]
    pending_review = [
        record
        for record in records
        if record["record_channel"] == "approved_record" and record["review_status"] == "pending"
    ]
    normal_board = [record for record in records if record["is_normal_board"]]
    extra_pending = len(extra_review_cards or [])

    return {
        "title_zh": "Time Attack 計時紀錄",
        "title_en": "Time Attack Records",
        "description_zh": (
            "VR Racing Club 的計時頁面以單一輸入表為核心，拆出正式審核的 Approved Record、"
            "一般練習用的 Normal Time Attack，以及玩家、車輛、賽道和活動分析。"
        ),
        "description_en": (
            "VR Racing Club time-attack hub built around a single input sheet, split into the formal "
            "Approved Record board, the regular Normal Time Attack board, and analysis views for tracks, "
            "players, vehicles, events, and review."
        ),
        "build_state": "live",
        "sidebar_zh": [
            "正式榜單只吃 `record_channel = approved_record` 且 `review_status = approved` 的紀錄。",
            "一般計時榜只吃 `record_channel = normal_time_attack` 的社群練習成績。",
            "個人頁與車輛頁可以吸收未審核但未被否決的紀錄，用來做趨勢與使用分析。",
        ],
        "sidebar_en": [
            "Formal boards only include `record_channel = approved_record` plus `review_status = approved`.",
            "Normal boards include community practice runs under `record_channel = normal_time_attack`.",
            "Player and vehicle analysis can still use unreviewed-but-not-rejected runs for trend tracking.",
        ],
        "count_cards": [
            {
                "label_zh": "總輸入筆數",
                "label_en": "All Runs",
                "value": str(len(records)),
                "note_zh": "輸入表中所有紀錄列",
                "note_en": "All imported rows from the input sheet",
            },
            {
                "label_zh": "Approved 上榜",
                "label_en": "Approved Board",
                "value": str(len(approved_board)),
                "note_zh": "正式榜單可見紀錄",
                "note_en": "Runs visible on the formal board",
            },
            {
                "label_zh": "待審核",
                "label_en": "Pending Review",
                "value": str(len(pending_review) + extra_pending),
                "note_zh": "已送審但尚未完成人工確認",
                "note_en": "Approved-record submissions still waiting for manual review",
            },
            {
                "label_zh": "一般計時",
                "label_en": "Normal Board",
                "value": str(len(normal_board)),
                "note_zh": "一般 Time Attack 練習紀錄",
                "note_en": "Community practice runs on the normal board",
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
        ],
        "board_cards": [
            {
                "label_zh": "正式榜單",
                "label_en": "Formal Board",
                "title_zh": "Approved Record",
                "title_en": "Approved Record",
                "description_zh": "只收錄通過人工審核的正式提交，用來承擔最嚴格的賽道紀錄頁與對外輸出。",
                "description_en": "Only manually approved formal submissions appear here. This is the strict board for official track records and outward-facing exports.",
                "href": "./review.html",
                "href_label_zh": "前往審核頁",
                "href_label_en": "Open Review",
            },
            {
                "label_zh": "社群練習",
                "label_en": "Open Practice",
                "title_zh": "Normal Time Attack",
                "title_en": "Normal Time Attack",
                "description_zh": "一般玩家練跑與社群活動使用的主榜，不要求正式見證條件，但仍保留時間分析價值。",
                "description_en": "Main board for practice laps and community runs. It does not require formal witness rules but still feeds player and vehicle analysis.",
                "href": "./tracks.html",
                "href_label_zh": "看賽道路線",
                "href_label_en": "Open Tracks",
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
        "sections": [
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
        ],
    }


def build_track_pages(records: list[dict[str, Any]], lookup: dict[str, Any]) -> dict[str, Any]:
    approved_board = [record for record in records if record["is_approved_board"]]
    normal_board = [record for record in records if record["is_normal_board"]]

    catalog_cards = []
    for track_world_code, track in sorted(lookup["track_worlds"].items(), key=lambda item: item[1]["track_display_name"]):
        routes = [
            route
            for route in lookup["routes"].values()
            if route["track_world_code"] == track_world_code
        ]
        catalog_cards.append(
            {
                "label_zh": track["system_name"],
                "label_en": track["system_name"],
                "title_zh": track["track_display_name"],
                "title_en": track["world_name"],
                "body_zh": f"作者 {track['track_author']}，共 {len(routes)} 條可分析路線。",
                "body_en": f"Author {track['track_author']}, with {len(routes)} analyzable routes in this world.",
                "meta_zh": "標籤：" + " / ".join(track["track_tags"]),
                "meta_en": "Tags: " + " / ".join(track["track_tags"]),
                "chips": [route["route_display_name"] for route in routes],
                "href": track["world_url"],
                "href_label_zh": "VRChat 世界",
                "href_label_en": "VRChat World",
            }
        )

    leaderboards = []
    approved_route_bests = best_by(approved_board, "route_key")
    normal_route_bests = best_by(normal_board, "route_key")

    for route_id, route in sorted(lookup["routes"].items(), key=lambda item: (lookup["track_worlds"][item[1]["track_world_code"]]["track_display_name"], item[1]["route_display_name"])):
        track = lookup["track_worlds"][route["track_world_code"]]
        route_approved = [record for record in approved_board if record["route_key"] == route_id]
        route_normal = [record for record in normal_board if record["route_key"] == route_id]
        approved_best = best_by(route_approved, "player_id")
        approved_vehicle_best = best_by(route_approved, "vehicle_model_code")
        normal_best = best_by(route_normal, "player_id")
        normal_vehicle_best = best_by(route_normal, "vehicle_model_code")

        for record in approved_best.values():
            record["delta_to_best_text"] = record.get("is_approved_board_delta_text", "-")
        for record in approved_vehicle_best.values():
            record["delta_to_best_text"] = record.get("is_approved_board_delta_text", "-")
        for record in normal_best.values():
            record["delta_to_best_text"] = record.get("is_normal_board_delta_text", "-")
        for record in normal_vehicle_best.values():
            record["delta_to_best_text"] = record.get("is_normal_board_delta_text", "-")

        leaderboards.append(
            {
                "variant_name": track["track_display_name"],
                "route_name": route["route_display_name"],
                "world_name": track["world_name"],
                "route_note_zh": route["route_note_zh"],
                "route_note_en": route["route_note_en"],
                "approved_fastest": (
                    {
                        "lap_time_text": approved_route_bests[route_id]["lap_time_text"],
                        "racer_display_name": approved_route_bests[route_id]["player_display_name"],
                        "vehicle_display_name": approved_route_bests[route_id]["vehicle_model_name"],
                    }
                    if route_id in approved_route_bests
                    else None
                ),
                "approved_player_best": rank_rows(
                    list(approved_best.values()),
                    "player_display_name",
                    "vehicle_model_name",
                ),
                "approved_vehicle_best": rank_rows(
                    list(approved_vehicle_best.values()),
                    "vehicle_model_name",
                    "player_display_name",
                ),
                "normal_fastest": (
                    {
                        "lap_time_text": normal_route_bests[route_id]["lap_time_text"],
                        "racer_display_name": normal_route_bests[route_id]["player_display_name"],
                        "vehicle_display_name": normal_route_bests[route_id]["vehicle_model_name"],
                    }
                    if route_id in normal_route_bests
                    else None
                ),
                "normal_player_best": rank_rows(
                    list(normal_best.values()),
                    "player_display_name",
                    "vehicle_model_name",
                ),
                "normal_vehicle_best": rank_rows(
                    list(normal_vehicle_best.values()),
                    "vehicle_model_name",
                    "player_display_name",
                ),
                "pending_submissions": sum(
                    1
                    for record in records
                    if record["route_key"] == route_id
                    and record["record_channel"] == "approved_record"
                    and record["review_status"] == "pending"
                ),
            }
        )

    timeline_items = []
    for route_id, route_records in defaultdict(list, ((record["route_key"], []) for record in approved_board)).items():
        pass

    route_histories: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in approved_board:
        route_histories[record["route_key"]].append(record)

    for route_id, route_records in route_histories.items():
        current_best: dict[str, Any] | None = None
        for record in sorted(route_records, key=lambda item: (item["record_date"], item["lap_time_ms"], item["record_id"])):
            if current_best is None or record["lap_time_ms"] < current_best["lap_time_ms"]:
                route = lookup["routes"][route_id]
                track = lookup["track_worlds"][route["track_world_code"]]
                timeline_items.append(
                    {
                        "date": record["record_date"],
                        "label_zh": "賽道紀錄變化",
                        "label_en": "Record Change",
                        "title_zh": f"{track['track_display_name']} / {route['route_display_name']}",
                        "title_en": f"{track['world_name']} / {route['route_display_name']}",
                        "meta_zh": f"{record['player_display_name']} 以 {record['vehicle_model_name']} 跑出 {record['lap_time_text']}",
                        "meta_en": f"{record['player_display_name']} set {record['lap_time_text']} in {record['vehicle_model_name']}",
                        "body_zh": "Approved Record 路線榜單更新。",
                        "body_en": "Approved Record route benchmark updated.",
                    }
                )
                current_best = record

    timeline_items.sort(key=lambda item: item["date"], reverse=True)

    return {
        "title_zh": "賽道路線分析",
        "title_en": "Track And Route Analysis",
        "description_zh": "以賽道世界和路線為單位，分開展示 Approved Record 與 Normal Time Attack 兩種榜單。",
        "description_en": "Track-world and route analysis split into separate Approved Record and Normal Time Attack boards.",
        "sidebar_zh": [
            "賽道以世界為主鍵，同名道路但不同世界不會混在一起。",
            "車輛榜以母型統計，子列仍保留玩家名稱與目前最快成績。",
            "待審核的正式提交不會直接進 Approved Record 榜單，但會進審核頁。",
        ],
        "sidebar_en": [
            "Tracks are keyed at the world level; same roads in different worlds stay separate.",
            "Vehicle boards are grouped by canonical model while still showing the current driver and fastest time.",
            "Pending formal submissions do not enter the Approved board until review is complete.",
        ],
        "metric_cards": [
            {
                "label_zh": "賽道世界",
                "label_en": "Track Worlds",
                "value": str(len(lookup["track_worlds"])),
                "note_zh": "以世界識別的路線集合",
                "note_en": "World-level route families",
            },
            {
                "label_zh": "路線數",
                "label_en": "Routes",
                "value": str(len(lookup["routes"])),
                "note_zh": "可產生榜單的 route 組合",
                "note_en": "Route combinations that produce boards",
            },
            {
                "label_zh": "Approved 路線榜",
                "label_en": "Approved Routes",
                "value": str(len({record["route_key"] for record in approved_board})),
                "note_zh": "已有正式審核紀錄的路線",
                "note_en": "Routes that already have approved formal records",
            },
            {
                "label_zh": "待審送件",
                "label_en": "Pending Formal",
                "value": str(
                    len(
                        {
                            record["record_id"]
                            for record in records
                            if record["record_channel"] == "approved_record"
                            and record["review_status"] == "pending"
                        }
                    )
                ),
                "note_zh": "等待人工審核的正式提交",
                "note_en": "Formal submissions waiting for manual review",
            },
        ],
        "catalog_cards": catalog_cards,
        "leaderboards": leaderboards,
        "timeline": timeline_items[:8],
        "sections": [
            {
                "label_zh": "後續擴充",
                "label_en": "Next Analysis",
                "title_zh": "預留的賽道分析",
                "title_en": "Reserved Track Analysis",
                "body_zh": "這個頁面接下來可以再補賽道熱門車種、紀錄刷新頻率、車輛與賽道標籤的關係。",
                "body_en": "This page can later expand into route popularity, record refresh frequency, and correlations between vehicles and track tags.",
                "items_zh": [
                    "賽道紀錄變化時間線",
                    "賽道熱門車種 / 車輛比例",
                    "車種與 uphill / downhill / night 等標籤關聯",
                ],
                "items_en": [
                    "Track-record change timeline",
                    "Popular vehicle classes and models per route",
                    "Vehicle correlations against uphill / downhill / night-style tags",
                ],
            }
        ],
    }


def build_player_pages(records: list[dict[str, Any]], lookup: dict[str, Any]) -> dict[str, Any]:
    general_pool = [record for record in records if record["is_general_pool"]]
    approved_route_leaders = best_by([record for record in records if record["is_approved_board"]], "route_key")
    general_route_leaders = best_by(general_pool, "route_key")

    player_cards = []
    for player_id, player in sorted(lookup["players"].items(), key=lambda item: item[1]["display_name_primary"]):
        player_records = [record for record in general_pool if record["player_id"] == player_id]
        if not player_records:
            continue

        best_times = best_by(player_records, "route_key")
        vehicle_counter = Counter(record["vehicle_model_name"] for record in player_records)
        tag_counter = Counter(tag for record in player_records for tag in record["track_tags"])
        approved_holds = sum(1 for record in approved_route_leaders.values() if record["player_id"] == player_id)
        general_holds = sum(1 for record in general_route_leaders.values() if record["player_id"] == player_id)

        best_rows = []
        for index, record in enumerate(
            sorted(best_times.values(), key=lambda item: (item["track_display_name"], item["route_display_name"])),
            start=1,
        ):
            best_rows.append(
                {
                    "rank": index,
                    "route_label": record["route_label_zh"],
                    "sub_label": f"{record['vehicle_model_name']} / {record['channel_label_zh']}",
                    "lap_time_text": record["lap_time_text"],
                }
            )

        player_cards.append(
            {
                "player_id": player_id,
                "title": player["display_name_primary"],
                "subtitle_zh": player["team_name"] or "未分隊",
                "subtitle_en": player["team_name"] or "Unassigned",
                "stats": [
                    {"label_zh": "有效紀錄", "label_en": "Valid Runs", "value": str(len(player_records))},
                    {"label_zh": "個人最佳路線", "label_en": "Route PBs", "value": str(len(best_times))},
                    {"label_zh": "一般路線奪榜", "label_en": "Open Route Leads", "value": str(general_holds)},
                    {"label_zh": "Approved 奪榜", "label_en": "Approved Leads", "value": str(approved_holds)},
                ],
                "tags": [
                    f"常用車種：{favorite_label(vehicle_counter)}",
                    f"偏好標籤：{favorite_label(tag_counter)}",
                ],
                "usage_rows": top_counter_items(vehicle_counter),
                "tag_rows": top_counter_items(tag_counter),
                "best_times": best_rows,
            }
        )

    player_cards.sort(
        key=lambda card: (
            -int(card["stats"][2]["value"]),
            -int(card["stats"][3]["value"]),
            card["title"],
        )
    )

    return {
        "title_zh": "玩家個人頁",
        "title_en": "Player Analysis",
        "description_zh": "玩家頁吸收未被否決的所有有效紀錄，用來看個人最佳、常用車種與賽道性質關係。",
        "description_en": "Player pages absorb all non-rejected runs so they can track personal bests, favorite vehicles, and track-tag tendencies.",
        "sidebar_zh": [
            "玩家唯一值使用 `player_id`，顯示名稱只是 lookup 對應。",
            "這裡的個人最佳會吸收未審核但未被拒絕的紀錄。",
            "如果後續加入隊伍積分或賽季表現，會優先從這頁延伸。",
        ],
        "sidebar_en": [
            "Players are keyed by `player_id`; display names only come from lookup.",
            "Personal-best analysis can include runs that are still unreviewed as long as they were not rejected.",
            "Future team points and season-performance layers should extend from this page.",
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
                "label_zh": "一般路線領跑",
                "label_en": "Open Leaders",
                "value": str(len(best_by([record for record in records if record["is_general_pool"]], "route_key"))),
                "note_zh": "一般池內目前已有領跑者的路線",
                "note_en": "Routes that already have an open-pool leader",
            },
            {
                "label_zh": "Approved 領跑",
                "label_en": "Approved Leaders",
                "value": str(len(best_by([record for record in records if record["is_approved_board"]], "route_key"))),
                "note_zh": "正式榜單已建立的路線領跑",
                "note_en": "Routes with established leaders on the approved board",
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
    approved_route_leaders = best_by([record for record in records if record["is_approved_board"]], "route_key")
    general_route_leaders = best_by(general_pool, "route_key")

    vehicle_cards = []
    for model_code, model in sorted(lookup["vehicle_models"].items(), key=lambda item: item[1]["vehicle_model_name"]):
        model_records = [record for record in general_pool if record["vehicle_model_code"] == model_code]
        if not model_records:
            continue

        best_times = best_by(model_records, "route_key")
        variant_counter = Counter(record["vehicle_variant_name"] for record in model_records)
        driver_counter = Counter(record["player_display_name"] for record in model_records)
        tag_counter = Counter(tag for record in model_records for tag in record["track_tags"])
        approved_holds = sum(1 for record in approved_route_leaders.values() if record["vehicle_model_code"] == model_code)
        general_holds = sum(1 for record in general_route_leaders.values() if record["vehicle_model_code"] == model_code)

        best_rows = []
        for index, record in enumerate(
            sorted(best_times.values(), key=lambda item: (item["track_display_name"], item["route_display_name"])),
            start=1,
        ):
            best_rows.append(
                {
                    "rank": index,
                    "route_label": record["route_label_zh"],
                    "sub_label": f"{record['player_display_name']} / {record['vehicle_variant_name']}",
                    "lap_time_text": record["lap_time_text"],
                }
            )

        vehicle_cards.append(
            {
                "vehicle_model_code": model_code,
                "title": model["vehicle_model_name"],
                "subtitle_zh": model["vehicle_class"],
                "subtitle_en": model["vehicle_class"],
                "stats": [
                    {"label_zh": "有效紀錄", "label_en": "Valid Runs", "value": str(len(model_records))},
                    {"label_zh": "母型變體", "label_en": "Variants", "value": str(len(model["variant_names"]))},
                    {"label_zh": "一般路線奪榜", "label_en": "Open Route Leads", "value": str(general_holds)},
                    {"label_zh": "Approved 奪榜", "label_en": "Approved Leads", "value": str(approved_holds)},
                ],
                "tags": [
                    f"常見駕駛：{favorite_label(driver_counter)}",
                    f"偏好賽道：{favorite_label(tag_counter)}",
                ],
                "usage_rows": top_counter_items(variant_counter),
                "tag_rows": top_counter_items(driver_counter),
                "best_times": best_rows,
            }
        )

    vehicle_cards.sort(
        key=lambda card: (
            -int(card["stats"][2]["value"]),
            -int(card["stats"][3]["value"]),
            card["title"],
        )
    )

    return {
        "title_zh": "車輛統計頁",
        "title_en": "Vehicle Analysis",
        "description_zh": "車輛頁以母型合併多個世界變體，同時保留最常用變體與目前最快車手資訊。",
        "description_en": "Vehicle pages merge multiple world variants into canonical models while still retaining the fastest drivers and most-used variants.",
        "sidebar_zh": [
            "輸入層保留 `vehicle_variant_code`，統計層再映射到 `vehicle_model_code`。",
            "這樣可以同時看見世界內的改裝差異，也能統整同一台車的母型表現。",
            "如果未來要補車種熱門度與賽道性質關係，這頁會是主承載點。",
        ],
        "sidebar_en": [
            "Input keeps `vehicle_variant_code`, while analysis maps variants back to `vehicle_model_code`.",
            "That preserves world-specific tuning differences while still showing canonical car performance.",
            "This page will eventually carry popularity and track-property correlations for vehicle classes.",
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
                "label_zh": "母型奪榜",
                "label_en": "Open Model Leads",
                "value": str(sum(int(card["stats"][2]["value"]) for card in vehicle_cards)),
                "note_zh": "所有一般池路線奪榜總和",
                "note_en": "Total open-pool route leads across all models",
            },
            {
                "label_zh": "Approved 奪榜",
                "label_en": "Approved Model Leads",
                "value": str(sum(int(card["stats"][3]["value"]) for card in vehicle_cards)),
                "note_zh": "正式榜單中的母型路線奪榜總和",
                "note_en": "Total approved-board route leads across all models",
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
                    {"label_zh": "正式提交", "label_en": "Formal Submissions", "value": str(len([record for record in event_records if record['record_channel'] == 'approved_record']))},
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
                "label_zh": "正式活動提交",
                "label_en": "Formal Event Runs",
                "value": str(len([record for record in records if record["event_code"] and record["record_channel"] == "approved_record"])),
                "note_zh": "活動下的正式送審紀錄",
                "note_en": "Formal approved-record submissions linked to an event",
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
    formal_records = [record for record in records if record["record_channel"] == "approved_record"]
    approved_records = [record for record in formal_records if record["review_status"] == "approved"]
    pending_records = [record for record in formal_records if record["review_status"] == "pending"]
    rejected_records = [record for record in formal_records if record["review_status"] == "rejected"]

    review_cards = []
    for record in sorted(
        [*pending_records, *rejected_records],
        key=lambda item: (item["review_status"] != "pending", item["record_date"], item["lap_time_ms"]),
        reverse=True,
    ):
        status_label = {
            "pending": ("待審核", "Pending"),
            "rejected": ("已退回", "Rejected"),
            "approved": ("已通過", "Approved"),
        }[record["review_status"]]
        review_cards.append(
            {
                "status_zh": status_label[0],
                "status_en": status_label[1],
                "title_zh": record["route_label_zh"],
                "title_en": record["route_label_en"],
                "player_display_name": record["player_display_name"],
                "vehicle_display_name": record["vehicle_variant_name"],
                "lap_time_text": record["lap_time_text"],
                "record_date": record["record_date"],
                "event_name": record["event_name"] or "Independent submission",
                "submission_note": record["submission_note"],
            }
        )

    extra_review_cards = extra_review_cards or []
    if extra_review_cards:
        review_cards.extend(extra_review_cards)

    extra_pending_count = sum(1 for card in extra_review_cards if card["status_en"] in {"Pending", "Submitted", "Needs Info"})
    extra_rejected_count = sum(1 for card in extra_review_cards if card["status_en"] == "Rejected")

    timeline = []
    for record in sorted(approved_records, key=lambda item: item["record_date"], reverse=True)[:8]:
        timeline.append(
            {
                "date": record["record_date"],
                "label_zh": "已核准紀錄",
                "label_en": "Approved Run",
                "title_zh": record["route_label_zh"],
                "title_en": record["route_label_en"],
                "meta_zh": f"{record['player_display_name']} / {record['vehicle_variant_name']} / {record['lap_time_text']}",
                "meta_en": f"{record['player_display_name']} / {record['vehicle_variant_name']} / {record['lap_time_text']}",
                "body_zh": record["submission_note"],
                "body_en": record["submission_note"],
            }
        )

    return {
        "title_zh": "審核與正式榜單",
        "title_en": "Review And Formal Board",
        "description_zh": "審核頁負責區分正式榜單資格，並保留待審、退回與已核准紀錄的人工處理入口。",
        "description_en": "The review page separates formal-board eligibility and keeps the manual processing surface for pending, rejected, and approved submissions.",
        "sidebar_zh": [
            "正式榜單只接受 `approved_record` 類型，且必須通過人工確認。",
            "審核條件之後可以補上 FPS、見證人、錄影與規則版本等欄位。",
            "被拒絕的正式提交不會再進個人頁與車輛頁的統計池。",
        ],
        "sidebar_en": [
            "Formal boards only accept `approved_record` entries and they must pass manual review.",
            "Future review fields can include FPS, witness, footage, and rule-version requirements.",
            "Rejected formal submissions are excluded from player and vehicle analysis pools.",
        ],
        "metric_cards": [
            {
                "label_zh": "正式送審",
                "label_en": "Formal Submissions",
                "value": str(len(formal_records) + len(extra_review_cards)),
                "note_zh": "所有走正式送審流程的紀錄",
                "note_en": "All runs sent through the formal submission flow",
            },
            {
                "label_zh": "已核准",
                "label_en": "Approved",
                "value": str(len(approved_records)),
                "note_zh": "已進 Approved Record 榜單",
                "note_en": "Already visible on the Approved Record board",
            },
            {
                "label_zh": "待審核",
                "label_en": "Pending",
                "value": str(len(pending_records) + extra_pending_count),
                "note_zh": "等待人工確認",
                "note_en": "Waiting for manual review",
            },
            {
                "label_zh": "已退回",
                "label_en": "Rejected",
                "value": str(len(rejected_records) + extra_rejected_count),
                "note_zh": "不符合正式榜單規格",
                "note_en": "Rejected from the formal board flow",
            },
        ],
        "review_cards": review_cards,
        "timeline": timeline,
        "sections": [
            {
                "label_zh": "審核規格",
                "label_en": "Review Criteria",
                "title_zh": "預留的人工審核項目",
                "title_en": "Reserved Manual Review Fields",
                "body_zh": "目前只先保留審核狀態，之後可以補上見證人、錄影連結、FPS、版本與備註欄位。",
                "body_en": "Only the review status is stored for now, but witness, footage, FPS, build version, and extra notes can be added later.",
                "items_zh": [
                    "FPS 或效能門檻",
                    "見證人 / 裁定人",
                    "錄影或原始證據連結",
                ],
                "items_en": [
                    "FPS or performance thresholds",
                    "Witness or steward fields",
                    "Video or raw evidence links",
                ],
            }
        ],
    }


def build_all(args: argparse.Namespace) -> None:
    _, records, lookup, extras, source_label = resolve_source(args)
    compute_delta_text(records)

    manifest = build_manifest(source_label)
    summary = build_summary(records, lookup, extras.get("review_cards"))
    tracks = build_track_pages(records, lookup)
    players = build_player_pages(records, lookup)
    vehicles = build_vehicle_pages(records, lookup)
    events = build_event_pages(records, lookup)
    review = build_review_pages(records, extras.get("review_cards"))

    write_json(args.output_dir / ROUTE_FILE_MAP["overview"], summary)
    write_json(args.output_dir / ROUTE_FILE_MAP["tracks"], tracks)
    write_json(args.output_dir / ROUTE_FILE_MAP["players"], players)
    write_json(args.output_dir / ROUTE_FILE_MAP["vehicles"], vehicles)
    write_json(args.output_dir / ROUTE_FILE_MAP["events"], events)
    write_json(args.output_dir / ROUTE_FILE_MAP["review"], review)
    write_json(args.output_dir / "manifest.json", manifest)


def main() -> None:
    args = parse_args()
    build_all(args)


if __name__ == "__main__":
    main()
