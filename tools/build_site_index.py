from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://starriverarts.github.io/StarRiver-Arts-Site/"
TZ = timezone(timedelta(hours=8))
SKIP_DIRS = {".git", ".github", ".claude", "downloads_Museum"}
SKIP_FILES = {"404.html", "play.html", "museum.html"}

SITE = {
    "name": "StarRiver Arts",
    "zh_name": "星河 StarRiver Arts",
    "description": (
        "StarRiver Arts is a trilingual portfolio and project site for VR environment design, "
        "Taiwan landscape digital twins, Project T mountain-road worlds, VR Racing Club Time Attack, "
        "and VR museum / exhibition systems."
    ),
    "languages": ["zh-TW", "en", "ja"],
    "creator": "StarRiver / 星河",
    "base_url": BASE_URL,
}

KEY_TOPICS = [
    "StarRiver Arts",
    "星河",
    "VRChat world design",
    "VR environment design",
    "Taiwan landscape digital twin",
    "Project T",
    "VR Racing Club",
    "Time Attack leaderboard",
    "VR museum",
    "interactive exhibition system",
]

DATA_ENDPOINTS = [
    "play/RacingClub/TimeAttack/data/summary.json",
    "play/RacingClub/TimeAttack/data/manifest.json",
    "play/RacingClub/TimeAttack/data/tracks.json",
    "play/RacingClub/TimeAttack/data/vehicles.json",
    "play/RacingClub/TimeAttack/data/players.json",
    "play/RacingClub/TimeAttack/data/catalog.json",
    "play/RacingClub/TimeAttack/data/trackmap.json",
]

TAG_HINTS = {
    "studio": ["portfolio", "selected works", "VR design"],
    "project": ["project case study", "environment design"],
    "project-t": ["Project T", "Taiwan mountain road", "VRChat"],
    "time-attack": ["VR Racing Club", "leaderboard", "records", "Time Attack"],
    "museum": ["VR museum", "exhibition", "gallery"],
    "interactive": ["interactive design system", "spatial system", "museum tool"],
}

PAGE_OVERRIDES = {
    "index.html": {
        "description": "星河 StarRiver Arts 的入口頁，連到 Studio 作品集、Project T 台灣山道 VR 世界與 StarRiver Museum。",
        "tags": ["星河", "StarRiver Arts", "Studio", "Project T", "Museum"],
    },
    "studio.html": {
        "description": "StarRiver / 星河的作品集：VR 環境設計、台灣地景數位孿生、VRChat 世界與沉浸式展覽空間。",
        "tags": ["portfolio", "VRChat", "Taiwan creator", "environment design"],
    },
    "play/index.html": {
        "description": "Project T 山道世界內容系統入口，連到 VR Racing Club、Time Attack 紀錄站與台灣山路世界。",
        "tags": ["Project T", "Taiwan mountain road", "VRChat", "Racing Club"],
    },
    "projects/9turns.html": {
        "description": "Project T 九彎十八拐：以台灣台9線石牌公園至頭城段為基礎的 VRChat 山道路線場景。",
        "tags": ["Project T", "Taiwan road", "VRChat", "9 Turns"],
    },
    "projects/beyond-gravity.html": {
        "description": "Beyond Gravity：以 VRChat 空間呈現 Skyhook 軌道運輸與太空站尺度的沉浸式概念作品。",
        "tags": ["Beyond Gravity", "Skyhook", "space station", "VRChat"],
    },
    "projects/free-trajectory.html": {
        "description": "Free Trajectory：NCHU 相關 VR 景觀提案與街道改善視覺紀錄，聚焦自行車道、街道與城市空間。",
        "tags": ["Free Trajectory", "landscape proposal", "street design", "VR"],
    },
    "projects/starsight-mt.html": {
        "description": "StarSight Mt. 觀星山：Project T 的 VRChat 山地觀星與台灣地景世界專案。",
        "tags": ["StarSight Mt.", "觀星山", "Project T", "VRChat"],
    },
    "projects/wuling.html": {
        "description": "Project T 武嶺：以台灣高山道路與武嶺地景為題的 VRChat 山道世界製作紀錄。",
        "tags": ["武嶺", "Wuling", "Project T", "Taiwan mountain road", "VRChat"],
    },
    "museum/index.html": {
        "description": "StarRiver Museum 線上入口，整理 VR 空間、台灣地景、科學概念與互動展覽。",
        "tags": ["StarRiver Museum", "VR museum", "online museum", "exhibition"],
    },
    "museum/about.html": {
        "description": "StarRiver Museum 關於頁，說明美術館如何把 VR、網頁與空間敘事視為展覽媒介。",
        "tags": ["museum about", "VR exhibition", "spatial narrative"],
    },
    "museum/exhibitions.html": {
        "description": "StarRiver Museum 展覽資訊頁，整理正式展覽狀態、展覽形式與參觀入口。",
        "tags": ["exhibitions", "VR museum", "web exhibition"],
    },
    "museum/web-exhibitions.html": {
        "description": "StarRiver Museum 網頁展覽頁，整理可在線上觀看的數位展覽與互動模組。",
        "tags": ["web exhibitions", "interactive modules", "digital exhibition"],
    },
    "museum/support.html": {
        "description": "StarRiver Museum 支持頁，說明合作、提案、贊助洽談與技術協作方式。",
        "tags": ["support", "collaboration", "museum partnership"],
    },
    "museum/contact.html": {
        "description": "StarRiver Museum 聯絡頁，供合作邀請、展覽提案、支持洽談或一般詢問使用。",
        "tags": ["contact", "collaboration", "proposal"],
    },
    "museum/interactive/vr-gallery-spatial-system/index.html": {
        "description": "VR Gallery Spatial System：虛擬實境美術館的空間、文字標識與展場設計系統網頁展覽。",
        "tags": ["VR Gallery Spatial System", "signage", "spatial design", "VR museum"],
    },
    "museum/interactive/design-system-visualize/index.html": {
        "description": "Gallery Study Modules：整理空間規劃與光衰減預估兩個 VR 展場研究互動模組。",
        "tags": ["gallery study", "spatial planner", "falloff predictor", "interactive module"],
    },    "play/RacingClub/TimeAttack/index.html": {
        "description": "VR Racing Club Time Attack 的總覽頁，聚合賽道、玩家、車輛、活動、索引與站台資訊。",
        "tags": ["Time Attack", "leaderboard", "VR Racing Club", "records"],
    },
    "play/RacingClub/TimeAttack/tracks.html": {
        "description": "Time Attack 賽道分析與賽道排行榜入口，依路線檢視紀錄、玩家與車輛表現。",
        "tags": ["tracks", "leaderboard", "route analysis", "Time Attack"],
    },
    "play/RacingClub/TimeAttack/track.html": {
        "description": "單一賽道詳情頁，可由查詢參數載入特定路線的紀錄榜、車輛與玩家表現。",
        "tags": ["track detail", "route records", "leaderboard"],
    },
    "play/RacingClub/TimeAttack/players.html": {
        "description": "Time Attack 玩家索引與玩家表現分析，整理 PB、參與路線與排行榜資料。",
        "tags": ["players", "driver records", "PB", "Time Attack"],
    },
    "play/RacingClub/TimeAttack/player.html": {
        "description": "單一玩家檔案頁，可由查詢參數載入個人 PB、參與賽道、車輛與紀錄歷史。",
        "tags": ["player profile", "PB", "driver file"],
    },
    "play/RacingClub/TimeAttack/vehicles.html": {
        "description": "Time Attack 車輛索引與車種表現分析，整理車輛、變體、紀錄與使用趨勢。",
        "tags": ["vehicles", "car records", "vehicle analysis", "Time Attack"],
    },
    "play/RacingClub/TimeAttack/vehicle.html": {
        "description": "單一車輛檔案頁，可由查詢參數載入車輛變體、使用玩家、路線紀錄與表現。",
        "tags": ["vehicle profile", "car variants", "records"],
    },
    "play/RacingClub/TimeAttack/catalog.html": {
        "description": "Time Attack 索引頁，整合賽道、地點、車輛、玩家與資料目錄。",
        "tags": ["catalog", "index", "tracks", "vehicles", "players"],
    },
    "play/RacingClub/TimeAttack/info.html": {
        "description": "Time Attack 站台資訊頁，包含資料摘要、builder 狀態、更新資訊與資料來源說明。",
        "tags": ["site info", "builder status", "data summary"],
    },
    "play/RacingClub/TimeAttack/events.html": {
        "description": "VR Racing Club 活動頁，預留給 Time Attack 活動、賽事與社群事件資訊。",
        "tags": ["events", "racing club", "community"],
    },
    "play/RacingClub/TimeAttack/TrackMap/index.html": {
        "description": "Time Attack 賽道地圖頁，以地理視角整理賽道路線、地點與紀錄資料。",
        "tags": ["track map", "geography", "route location", "Time Attack"],
    },
    "museum/interactive/design-system-visualize/spatial-planner.html": {
        "description": "VR Gallery Spatial System 的空間規劃互動工具，用於理解展場尺度、觀看距離與配置。",
        "tags": ["spatial planner", "VR gallery", "interactive tool"],
    },
    "museum/interactive/design-system-visualize/falloff-predictor.html": {
        "description": "VR Gallery Spatial System 的光衰減預估工具，用於比較虛擬展場光線距離與可讀性。",
        "tags": ["falloff predictor", "lighting", "VR gallery", "interactive tool"],
    },
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.meta: dict[str, str] = {}
        self.headings: list[str] = []
        self.text_parts: list[str] = []
        self.image_alts: list[str] = []
        self._tag_stack: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attrs_dict = {name.lower(): value or "" for name, value in attrs}
        self._tag_stack.append(tag)
        if tag in {"script", "style", "svg", "noscript"}:
            self._skip_depth += 1
        if tag == "meta":
            key = attrs_dict.get("name") or attrs_dict.get("property")
            content = attrs_dict.get("content", "").strip()
            if key and content:
                self.meta[key.lower()] = content
        if tag == "img":
            alt = normalize_space(attrs_dict.get("alt", ""))
            if alt:
                self.image_alts.append(alt)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "svg", "noscript"} and self._skip_depth:
            self._skip_depth -= 1
        if self._tag_stack:
            self._tag_stack.pop()

    def handle_data(self, data: str) -> None:
        text = normalize_space(data)
        if not text or self._skip_depth:
            return
        current = self._tag_stack[-1] if self._tag_stack else ""
        if current == "title":
            self.title_parts.append(text)
        elif current in {"h1", "h2"}:
            self.headings.append(text)
            self.text_parts.append(text)
        elif current not in {"option"}:
            self.text_parts.append(text)


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def slug_for_path(rel_path: str) -> str:
    slug = rel_path.replace("\\", "/").replace("/index.html", "").replace(".html", "")
    slug = slug.strip("/") or "home"
    return re.sub(r"[^a-zA-Z0-9]+", "-", slug).strip("-").lower() or "home"


def url_for_path(rel_path: str) -> str:
    rel = rel_path.replace("\\", "/")
    if rel == "index.html":
        return BASE_URL
    if rel.endswith("/index.html"):
        rel = rel[: -len("index.html")]
    return BASE_URL + quote(rel, safe="/-_.~")


def section_for_path(rel_path: str) -> tuple[str, str]:
    rel = rel_path.replace("\\", "/")
    if rel == "index.html":
        return "home", "StarRiver Arts"
    if rel == "studio.html":
        return "studio", "Studio"
    if rel.startswith("projects/"):
        return "project", "Studio Projects"
    if rel.startswith("play/RacingClub/TimeAttack/"):
        return "time-attack", "VR Racing Club Time Attack"
    if rel.startswith("play/") or rel == "play.html":
        return "project-t", "Project T"
    if rel.startswith("museum/interactive/"):
        return "interactive", "Museum Interactive Systems"
    if rel.startswith("museum/") or rel == "museum.html":
        return "museum", "Museum"
    return "site", "Site"


def should_index(path: Path) -> bool:
    rel_parts = path.relative_to(ROOT).parts
    if any(part in SKIP_DIRS for part in rel_parts):
        return False
    if path.name in SKIP_FILES:
        return False
    if path.suffix.lower() != ".html":
        return False
    # Honour <meta name="robots" content="noindex"> — keeps templates and
    # not-yet-live pages out of every index (sitemap / llms / site + search index).
    try:
        head = path.read_text(encoding="utf-8", errors="ignore")[:4000].lower()
    except OSError:
        return True
    if 'name="robots"' in head and "noindex" in head:
        return False
    return True


def page_priority(section: str, rel_path: str) -> float:
    if rel_path == "index.html":
        return 1.0
    if section in {"studio", "project-t", "museum", "time-attack"}:
        return 0.9
    if section in {"project", "interactive"}:
        return 0.8
    return 0.6


def parse_page(path: Path, generated_date: str) -> dict[str, object]:
    raw = path.read_text(encoding="utf-8", errors="ignore")
    parser = PageParser()
    parser.feed(raw)
    rel_path = path.relative_to(ROOT).as_posix()
    section, section_label = section_for_path(rel_path)
    override = PAGE_OVERRIDES.get(rel_path, {})
    title = str(
        override.get("title")
        or normalize_space(" ".join(parser.title_parts))
        or normalize_space(parser.headings[0] if parser.headings else rel_path)
    )
    description = (
        override.get("description")
        or parser.meta.get("description")
        or parser.meta.get("og:description")
        or first_sentence(" ".join(parser.text_parts))
        or SITE["description"]
    )
    body_text = normalize_space(" ".join(parser.text_parts + parser.image_alts))
    headings = unique(parser.headings)[:8]
    tags = unique([section_label, section, *TAG_HINTS.get(section, []), *list(override.get("tags", [])), *infer_tags(title + " " + body_text)])[:16]
    return {
        "id": slug_for_path(rel_path),
        "path": rel_path,
        "url": url_for_path(rel_path),
        "title": title,
        "description": truncate(description, 260),
        "section": section,
        "section_label": section_label,
        "languages": SITE["languages"],
        "tags": tags,
        "headings": headings,
        "lastmod": generated_date,
        "priority": page_priority(section, rel_path),
        "search_text": truncate(body_text, 2200),
    }


def first_sentence(text: str) -> str:
    text = normalize_space(text)
    if not text:
        return ""
    parts = re.split(r"(?<=[。.!?])\s+", text)
    return parts[0] if parts else text


def truncate(text: str, length: int) -> str:
    text = normalize_space(text)
    return text if len(text) <= length else text[: length - 1].rstrip() + "…"


def unique(values: list[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        item = normalize_space(value)
        key = item.casefold()
        if item and key not in seen:
            seen.add(key)
            out.append(item)
    return out


def infer_tags(text: str) -> list[str]:
    checks = [
        ("VRChat", "VRChat"),
        ("Taiwan", "Taiwan"),
        ("台灣", "Taiwan"),
        ("臺灣", "Taiwan"),
        ("mountain", "mountain road"),
        ("山", "mountain road"),
        ("racing", "racing"),
        ("leaderboard", "leaderboard"),
        ("museum", "museum"),
        ("美術館", "museum"),
        ("exhibition", "exhibition"),
        ("展", "exhibition"),
    ]
    folded = text.casefold()
    return [tag for needle, tag in checks if needle.casefold() in folded]


def collect_pages(generated_date: str) -> list[dict[str, object]]:
    pages = [parse_page(path, generated_date) for path in sorted(ROOT.rglob("*.html")) if should_index(path)]
    pages.sort(key=lambda page: (-float(page["priority"]), str(page["path"])))
    return pages


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_sitemap(pages: list[dict[str, object]]) -> str:
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for page in pages:
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(str(page['url']))}</loc>")
        lines.append(f"    <lastmod>{escape(str(page['lastmod']))}</lastmod>")
        lines.append(f"    <priority>{float(page['priority']):.1f}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def build_robots() -> str:
    return "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            "",
            f"Sitemap: {BASE_URL}sitemap.xml",
            "",
            "# Machine-readable discovery files for search, browsers, and LLM tools:",
            f"# LLM guide: {BASE_URL}llms.txt",
            f"# LLM JSON index: {BASE_URL}llm-index.json",
            f"# Site JSON index: {BASE_URL}site-index.json",
            f"# Browser/client search index: {BASE_URL}search-index.json",
            "",
        ]
    )


def build_llms_txt(pages: list[dict[str, object]], generated_at: str) -> str:
    by_section: dict[str, list[dict[str, object]]] = defaultdict(list)
    for page in pages:
        by_section[str(page["section_label"])].append(page)
    lines = [
        "# StarRiver Arts",
        "",
        "> Public static site for StarRiver Arts — VR environment design, Taiwan landscape digital twins, Project T mountain-road worlds, VR Racing Club Time Attack records, and VR museum / exhibition systems.",
        "",
        f"Generated: {generated_at}",
        f"Canonical site: {BASE_URL}",
        "Languages: Traditional Chinese / English / Japanese.",
        "",
        "## Machine-readable indexes",
        "",
        f"- [site-index.json]({BASE_URL}site-index.json): full page inventory with titles, descriptions, tags, headings, and search text.",
        f"- [search-index.json]({BASE_URL}search-index.json): compact browser/client search cache.",
        f"- [llm-index.json]({BASE_URL}llm-index.json): compact LLM-oriented context map.",
        f"- [sitemap.xml]({BASE_URL}sitemap.xml): canonical crawl URLs.",
        "",
        "## Primary sections",
        "",
        f"- [Home]({BASE_URL}): three entrances into Studio, Project T, and Museum.",
        f"- [Studio]({BASE_URL}studio.html): creator portfolio and selected VR / environment design works.",
        f"- [Project T]({BASE_URL}play/): VR mountain-road and Taiwan landscape world hub.",
        f"- [Time Attack]({BASE_URL}play/RacingClub/TimeAttack/): VR Racing Club records station with tracks, players, vehicles, events, and catalog pages.",
        f"- [Museum]({BASE_URL}museum/): exhibitions, web exhibitions, and interactive museum design-system tools.",
        "",
        "## Data endpoints",
        "",
    ]
    for endpoint in DATA_ENDPOINTS:
        lines.append(f"- [{endpoint}]({BASE_URL}{endpoint})")
    lines.extend(["", "## Indexed pages", ""])
    for section in sorted(by_section):
        lines.append(f"### {section}")
        lines.append("")
        for page in by_section[section]:
            lines.append(f"- [{page['title']}]({page['url']}): {page['description']}")
        lines.append("")
    lines.extend(
        [
            "## Notes for LLM consumers",
            "",
            "- Prefer `llm-index.json` for a compact context map and `site-index.json` when page-level search text is useful.",
            "- Time Attack pages load JSON client-side; use the data endpoints above for structured records and catalog data.",
            "- The site represents StarRiver / 星河, a Taiwan creator working around VRChat worlds, Project T, VR racing, and VR museum systems.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    now = datetime.now(TZ).replace(microsecond=0)
    generated_at = now.isoformat()
    generated_date = now.date().isoformat()
    pages = collect_pages(generated_date)
    compact_pages = [
        {
            key: page[key]
            for key in ["id", "url", "title", "description", "section", "section_label", "languages", "tags", "headings", "lastmod"]
        }
        for page in pages
    ]
    site_index = {
        "schema": "https://starriverarts.github.io/StarRiver-Arts-Site/site-index.schema.json",
        "generated_at": generated_at,
        "site": SITE,
        "key_topics": KEY_TOPICS,
        "data_endpoints": [{"path": endpoint, "url": BASE_URL + quote(endpoint, safe="/-_.~")} for endpoint in DATA_ENDPOINTS],
        "pages": pages,
    }
    search_index = {
        "generated_at": generated_at,
        "base_url": BASE_URL,
        "pages": [
            {
                "id": page["id"],
                "url": page["url"],
                "title": page["title"],
                "description": page["description"],
                "section": page["section_label"],
                "tags": page["tags"],
                "text": page["search_text"],
            }
            for page in pages
        ],
    }
    llm_index = {
        "generated_at": generated_at,
        "site": SITE,
        "summary": SITE["description"],
        "key_topics": KEY_TOPICS,
        "entry_points": [
            {"label": "Home", "url": BASE_URL},
            {"label": "Studio", "url": BASE_URL + "studio.html"},
            {"label": "Project T", "url": BASE_URL + "play/"},
            {"label": "Time Attack", "url": BASE_URL + "play/RacingClub/TimeAttack/"},
            {"label": "Museum", "url": BASE_URL + "museum/"},
        ],
        "data_endpoints": [{"path": endpoint, "url": BASE_URL + quote(endpoint, safe="/-_.~")} for endpoint in DATA_ENDPOINTS],
        "pages": compact_pages,
    }
    write_json(ROOT / "site-index.json", site_index)
    write_json(ROOT / "search-index.json", search_index)
    write_json(ROOT / "llm-index.json", llm_index)
    (ROOT / "sitemap.xml").write_text(build_sitemap(pages), encoding="utf-8")
    (ROOT / "robots.txt").write_text(build_robots(), encoding="utf-8")
    (ROOT / "llms.txt").write_text(build_llms_txt(pages, generated_at), encoding="utf-8")
    print(json.dumps({"pages": len(pages), "generated_at": generated_at}, ensure_ascii=False))


if __name__ == "__main__":
    main()