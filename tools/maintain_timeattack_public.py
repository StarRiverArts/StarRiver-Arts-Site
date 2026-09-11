from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TA = ROOT / "play" / "RacingClub" / "TimeAttack"
DATA = TA / "data"
BASE_URL = "https://starriverarts.github.io/StarRiver-Arts-Site/play/RacingClub/TimeAttack/"
DISCORD_URL = "https://discord.gg/HJSB5D93yp"

DETAIL_PAGES = {
    "event.html": "events.html",
    "player.html": "players.html",
    "team.html": "teams.html",
    "track.html": "tracks.html",
    "vehicle.html": "vehicles.html",
}

TITLE_CATEGORIES = {
    "catalog.html": "Index",
    "event.html": "Events",
    "events.html": "Events",
    "index.html": "",
    "info.html": "Info",
    "player.html": "Racers",
    "players.html": "Racers",
    "review.html": "Review",
    "team.html": "Teams",
    "teams.html": "Teams",
    "track.html": "Worlds",
    "tracks.html": "Worlds",
    "vehicle.html": "Cars",
    "vehicles.html": "Cars",
}

DESCRIPTIONS = {
    "catalog.html": "Racing Hub 的世界、車手、車輛、車隊、活動與紀錄資料索引。",
    "event.html": "Racing Hub 活動詳情模板；請由活動列表開啟指定活動。",
    "events.html": "Racing Hub 的活動公告、賽事規則與人工確認結果。",
    "index.html": "Racing Hub 賽事中心，提供 VRChat 可駕駛世界、車手、車輛、車隊、活動與 Time Attack 紀錄。",
    "info.html": "Racing Hub 與 VRRCTW 的社群、投稿、資料更新、收錄與驗證資訊。",
    "player.html": "Racing Hub 車手檔案模板；請由車手列表開啟指定車手。",
    "players.html": "Racing Hub 車手索引、個人最佳與參賽資料。",
    "review.html": "Racing Hub 紀錄審核資料。",
    "team.html": "Racing Hub 車隊檔案模板；請由車隊列表開啟指定車隊。",
    "teams.html": "Racing Hub 車隊、成員與參賽資料索引。",
    "track.html": "Racing Hub 單一駕駛世界、路線與 Time Attack 紀錄詳情。",
    "tracks.html": "Racing Hub 可駕駛世界、路線與 Time Attack 紀錄索引。",
    "vehicle.html": "Racing Hub 車輛檔案模板；請由車輛列表開啟指定車輛。",
    "vehicles.html": "Racing Hub 車輛、變體、世界使用與紀錄分析。",
}


def load_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: object) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def browser_title(name: str) -> str:
    category = TITLE_CATEGORIES.get(name, "")
    return "Racing Hub" if not category else f"Racing Hub | {category}"


def normalize_title(raw: str, title: str) -> str:
    if re.search(r"<title>.*?</title>", raw, flags=re.DOTALL):
        return re.sub(r"<title>.*?</title>", f"<title>{title}</title>", raw, count=1, flags=re.DOTALL)
    return raw.replace("</head>", f"  <title>{title}</title>\n</head>", 1)


def upsert_metadata(raw: str, name: str) -> str:
    description = DESCRIPTIONS[name]
    canonical = BASE_URL if name == "index.html" else BASE_URL + name
    title = browser_title(name)
    robots = (
        '<meta name="robots" content="noindex,follow">\n  '
        if name in DETAIL_PAGES
        else ""
    )
    metadata = (
        f'  <meta name="description" content="{description}">\n'
        f"  {robots}"
        f'  <link rel="canonical" href="{canonical}">\n'
        '  <meta property="og:type" content="website">\n'
        f'  <meta property="og:title" content="{title}">\n'
        f'  <meta property="og:description" content="{description}">\n'
        f'  <meta property="og:url" content="{canonical}">\n'
        '  <meta property="og:image" content="https://starriverarts.github.io/StarRiver-Arts-Site/assets/logos/starriver-primary.png">\n'
        '  <meta name="twitter:card" content="summary">\n'
    )
    raw = normalize_title(raw, title)
    raw = re.sub(
        r'\s*<meta name="description"[^>]*>\s*',
        "\n",
        raw,
        count=1,
    )
    raw = re.sub(r'\s*<meta name="robots"[^>]*>\s*', "\n", raw, count=1)
    raw = re.sub(r'\s*<link rel="canonical"[^>]*>\s*', "\n", raw, count=1)
    raw = re.sub(r'\s*<meta property="og:[^>]*>\s*', "\n", raw)
    raw = re.sub(r'\s*<meta name="twitter:[^>]*>\s*', "\n", raw)
    return raw.replace('<link rel="icon"', metadata + '  <link rel="icon"', 1)


def add_teams_nav(raw: str, prefix: str) -> str:
    if 'data-view-link="teams"' in raw:
        return raw
    events = re.search(
        r'(<a class="ta-navlink" href="[^"]*events\.html" data-view-link="events">.*?</a>)',
        raw,
        flags=re.DOTALL,
    )
    if not events:
        raise RuntimeError("events navigation anchor not found")
    teams = (
        f'<a class="ta-navlink" href="{prefix}teams.html" data-view-link="teams">'
        '<span class="zh">車隊</span><span class="en">Teams</span>'
        '<span class="jp">チーム</span></a>'
    )
    return raw[: events.end()] + "\n        " + teams + raw[events.end() :]


def normalize_return_link(raw: str, prefix: str) -> str:
    return re.sub(
        r'<a class="pt-toplink" href="\.\./\.\./"><span class="zh">返回 Project T</span>'
        r'<span class="en">Back to Project T</span><span class="jp">Project T へ</span></a>',
        f'<a class="pt-toplink" href="{prefix}../"><span class="zh">返回 VRC 賽車俱樂部</span>'
        '<span class="en">Back to VR Racing Club</span><span class="jp">レーシングクラブへ</span></a>',
        raw,
    )


def normalize_footer(raw: str, prefix: str) -> str:
    footer = f"""<footer class="ta-footer ta-community-footer">
        <span>VRRCTW · Racing Hub</span>
        <a href="{prefix}../"><span class="zh">關於俱樂部</span><span class="en">About the Club</span><span class="jp">クラブ情報</span></a>
        <a href="{DISCORD_URL}" target="_blank" rel="noopener noreferrer"><span class="zh">加入／投稿／回報錯誤</span><span class="en">Join / Submit / Report</span><span class="jp">参加・投稿・報告</span></a>
      </footer>"""
    return re.sub(
        r'<footer class="ta-footer">.*?</footer>',
        footer,
        raw,
        count=1,
        flags=re.DOTALL,
    )


def maintain_html() -> None:
    for path in sorted(TA.glob("*.html")):
        if path.name not in DESCRIPTIONS:
            continue
        raw = path.read_text(encoding="utf-8")
        prefix = "./"
        raw = upsert_metadata(raw, path.name)
        raw = add_teams_nav(raw, prefix)
        raw = normalize_return_link(raw, prefix)
        raw = normalize_footer(raw, prefix)
        path.write_text(raw, encoding="utf-8")

    trackmap = TA / "TrackMap" / "index.html"
    raw = trackmap.read_text(encoding="utf-8")
    raw = normalize_title(raw, "Racing Hub | Map")
    raw = re.sub(
        r'<meta property="og:title" content="[^"]*">',
        '<meta property="og:title" content="Racing Hub | Map">',
        raw,
        count=1,
    )
    raw = add_teams_nav(raw, "../")
    raw = normalize_return_link(raw, "../")
    raw = normalize_footer(raw, "../")
    trackmap.write_text(raw, encoding="utf-8")


def proof_id(value: str) -> str:
    return "proof_" + hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def move_proofs() -> None:
    proof_path = DATA / "proofs.json"
    existing = load_json(proof_path) if proof_path.exists() else {}
    registry: dict[str, dict[str, str]] = dict(
        existing.get("proofs", {}) if isinstance(existing, dict) else {}
    )

    def visit(node: object) -> None:
        if isinstance(node, dict):
            for key in ("proof_text", "submission_note"):
                value = node.get(key)
                if not isinstance(value, str) or not value.startswith(("http://", "https://")):
                    continue
                ref = proof_id(value)
                registry.setdefault(ref, {"href": value, "kind": "external"})
                node["proof_ref"] = ref
                node[key] = ""
            for value in node.values():
                visit(value)
        elif isinstance(node, list):
            for value in node:
                visit(value)

    for name in ("summary.json", "tracks.json", "players.json", "vehicles.json", "review.json"):
        path = DATA / name
        payload = load_json(path)
        visit(payload)
        write_json(path, payload)

    write_json(
        proof_path,
        {
            "schema_version": "1.0.0",
            "description_zh": "公開紀錄使用的外部證明連結索引；主要排行榜只保存 proof_ref。",
            "description_en": "External evidence-link registry; primary leaderboard payloads keep proof_ref only.",
            "proofs": registry,
        },
    )

    manifest_path = DATA / "manifest.json"
    manifest = load_json(manifest_path)
    assert isinstance(manifest, dict)
    manifest.setdefault("routes", {})["proofs"] = "proofs.json"
    write_json(manifest_path, manifest)


def clean_public_notes() -> None:
    path = DATA / "events.json"
    payload = load_json(path)
    assert isinstance(payload, dict)
    payload["sidebar_zh"] = [
        "活動結果由主辦單位人工確認，不從一般排行榜自動推斷。",
        "各活動頁依現有資料呈現時程、規則、參賽方式與正式結果。",
    ]
    payload["sidebar_en"] = [
        "Event results are confirmed by the organizer and are not inferred from general leaderboards.",
        "Each event page presents the available schedule, rules, registration details, and official results.",
    ]
    payload["sections"] = []
    write_json(path, payload)


def maintain_public_info() -> None:
    path = DATA / "info.json"
    payload = load_json(path)
    assert isinstance(payload, dict)
    payload["title_zh"] = "VRRCTW 與站台資訊"
    payload["title_en"] = "VRRCTW & Site Info"
    payload["description_zh"] = "認識 VRRCTW、加入社群、投稿成績、了解收錄規則與資料更新狀態。"
    payload["description_en"] = "About VRRCTW, joining the community, submitting runs, record eligibility, and data freshness."
    public_labels = {"關於社群", "加入與投稿", "收錄規則"}
    technical = [
        section
        for section in payload.get("sections", [])
        if isinstance(section, dict) and section.get("label_zh") not in public_labels
    ]
    payload["sections"] = [
        {
            "label_zh": "關於社群",
            "label_en": "About",
            "title_zh": "VRC 賽車俱樂部（VRRCTW）",
            "title_en": "VR Racing Club Taiwan (VRRCTW)",
            "body_zh": "VRRCTW 是以 VRChat 賽車、夜跑、計時挑戰與社群活動為核心的玩家社群；Racing Hub 整理俱樂部與更廣泛 VRChat 賽車生態的公開世界、車手、車輛、活動與計時資料。",
            "body_en": "VRRCTW is a player community centered on VRChat racing, night runs, time attacks, and club events. Racing Hub organizes public worlds, racers, cars, events, and timing data across the club and the wider VRChat racing ecosystem.",
            "items_zh": ["俱樂部活動與賽事", "世界、車手、車隊與車輛資料", "公開排行榜與活動結果"],
            "items_en": ["Club sessions and races", "Worlds, racers, teams, and cars", "Public leaderboards and event results"],
        },
        {
            "label_zh": "加入與投稿",
            "label_en": "Join & Submit",
            "title_zh": "投稿計時成績必須先加入俱樂部 Discord",
            "title_en": "Join the club Discord before submitting a timed run",
            "body_zh": "請在 Discord 依指定格式提交玩家名稱、賽道世界、路線、車輛、圈速與可用的截圖、影片或原始計時訊息。需要更正玩家名稱、合併資料或回報錯誤時，也使用同一入口。",
            "body_en": "Submit your player name, track world, route, vehicle, lap time, and available screenshot, video, or original timing message through Discord. Use the same entry point for corrections and data issues.",
            "items_zh": ["加入 Discord", "依頻道格式投稿", "管理員確認後進入資料站"],
            "items_en": ["Join Discord", "Use the channel submission format", "Records appear after organizer review"],
        },
        {
            "label_zh": "收錄規則",
            "label_en": "Eligibility",
            "title_zh": "有效紀錄與驗證標記",
            "title_en": "Valid runs and verification",
            "body_zh": "有效紀錄是格式與必要欄位可進入資料站的紀錄；已驗證標記代表另有可追溯證明。未驗證不等於無效，但後續更正或審核可能調整公開內容。",
            "body_en": "Valid runs meet the site's required record fields. A verified mark means traceable evidence is available. Unverified does not mean invalid, but later review or correction may change the public record.",
            "items_zh": ["TR：路線最快", "CR：指定車輛最快", "PR：玩家個人最快"],
            "items_en": ["TR: route record", "CR: vehicle record", "PR: personal record"],
        },
        *technical,
    ]
    write_json(path, payload)


def integrate_vrc_resources() -> None:
    vrc = TA / "vrc"
    required = ("players.json", "teams.json", "vehicles.json")
    for name in required:
        payload = load_json(vrc / name)
        if not isinstance(payload, dict) or not payload.get("contract") or not payload.get("version"):
            raise RuntimeError(f"invalid VRC directory contract: {name}")

    site_players = load_json(DATA / "players.json")
    player_ids = {
        str(item.get("player_id", ""))
        for item in site_players.get("player_cards", [])
        if isinstance(item, dict)
    }
    player_contract_path = vrc / "players.json"
    player_contract = load_json(player_contract_path)
    for item in player_contract.get("data", {}).get("players", []):
        item["site_id"] = item.get("player_id", "") if item.get("player_id") in player_ids else ""
    write_json(player_contract_path, player_contract)

    site_vehicles = load_json(DATA / "vehicles.json")
    vehicle_by_name = {
        str(item.get("title", "")).casefold(): str(item.get("vehicle_model_code", ""))
        for item in site_vehicles.get("vehicle_cards", [])
        if isinstance(item, dict) and item.get("title")
    }
    vehicle_contract_path = vrc / "vehicles.json"
    vehicle_contract = load_json(vehicle_contract_path)
    for item in vehicle_contract.get("data", {}).get("vehicles", []):
        item["site_id"] = vehicle_by_name.get(str(item.get("name", "")).casefold(), "")
    write_json(vehicle_contract_path, vehicle_contract)

    path = vrc / "index.json"
    index = load_json(path)
    assert isinstance(index, dict)
    index["resources"] = {
        "players": "players.json",
        "teams": "teams.json",
        "vehicles": "vehicles.json",
    }
    write_json(path, index)


def main() -> None:
    maintain_html()
    move_proofs()
    clean_public_notes()
    maintain_public_info()
    integrate_vrc_resources()
    print("maintained Racing Hub public surfaces")


if __name__ == "__main__":
    main()
