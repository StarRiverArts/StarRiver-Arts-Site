#!/usr/bin/env python3
"""Build article pages from Markdown sources.

Authors write one Markdown file per language under `content/`; this renders each
article to a single HTML page carrying both languages, matching how the rest of
the site switches language in-page. Generated pages are outputs — edit the
Markdown, never the HTML.

    content/projectt/articles/wuling-guide.zh.md   ← source
    content/projectt/articles/wuling-guide.en.md   ← source (optional)
    play/articles/wuling-guide.html                ← output

The list page keeps its hand-authored hero and intro; only the region between
the GENERATED markers belongs to this script, so StarRiverCMS can continue to
edit everything around it without the two tools overwriting each other.

Run `tools/build_site_index.py` afterwards to refresh the discovery outputs; it
reads the generated HTML and needs no changes.

Usage:
    python tools/build_content.py                     # publish
    python tools/build_content.py --check             # report only, write nothing
    python tools/build_content.py --preview-dir DIR   # render everything, drafts
                                                      # included, into DIR
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from datetime import date as Date
from pathlib import Path

try:
    import markdown as markdown_lib
    import yaml
    from jinja2 import Environment, FileSystemLoader, StrictUndefined
except ImportError as exc:  # pragma: no cover - dependency guidance
    sys.exit(f"missing dependency: {exc.name}. Install with: pip install markdown pyyaml jinja2")

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
TEMPLATES = Path(__file__).resolve().parent / "templates"

BASE_URL = "https://starriverarts.github.io/StarRiver-Arts-Site/"
CLARITY_ID = "x5w0rbr4n3"

# A category only earns a navigation chip once it holds this many published
# articles. Every article is always listed regardless — the threshold governs
# the filter row, not visibility.
CATEGORY_NAV_THRESHOLD = 2

MARKER_START = "<!-- GENERATED:articles START — built by tools/build_content.py; do not edit by hand -->"
MARKER_END = "<!-- GENERATED:articles END -->"

# Every generated page carries this marker, so cleanup can remove pages whose
# source was unpublished or deleted without ever touching a hand-written file.
PAGE_MARKER = "<!-- GENERATED-PAGE:"

LANGUAGES = ("zh", "en")
REQUIRED_FIELDS = ("slug", "site", "category", "title", "summary", "date", "checked_at", "status")
VALID_STATUS = ("draft", "published")


@dataclass(frozen=True)
class SiteConfig:
    key: str
    label_zh: str
    out_dir: str
    list_page: str
    categories: dict[str, tuple[str, str]]


SITES: dict[str, SiteConfig] = {
    "projectt": SiteConfig(
        key="projectt",
        label_zh="專欄",
        out_dir="play/articles",
        list_page="play/articles/index.html",
        categories={
            "guides": ("指南", "Guides"),
            "worlds_places": ("世界與地方", "Worlds & Places"),
            "community_ecosystem": ("社群與生態", "Community & Ecosystem"),
            "events_records": ("活動與紀錄", "Events & Records"),
            "development_technology": ("開發與技術", "Development & Technology"),
        },
    ),
    "studio": SiteConfig(
        key="studio",
        label_zh="Studio",
        out_dir="studio/cases",
        list_page="studio.html",
        categories={
            "case_studies": ("案例研究", "Case Studies"),
        },
    ),
    "museum": SiteConfig(
        key="museum",
        label_zh="Museum",
        out_dir="museum/essays",
        list_page="museum/articles.html",
        categories={
            "exhibit_essays": ("展覽與作品論述", "Exhibition & Exhibit Essays"),
            "curatorial_notes": ("策展筆記", "Curatorial Notes"),
            "vrc_community_culture": ("社群與文化", "VRC Community & Culture"),
            "current_commentary": ("時事評論", "Current Commentary"),
            "research": ("研究", "Research"),
        },
    ),
}

RESEARCH_STATUS_ZH = {
    "proposal": "研究提案",
    "in_progress": "進行中",
    "preliminary_findings": "初步發現",
    "published_research": "已發表研究",
}

# Rows shown in the article metadata table when the field is present.
OPTIONAL_SPEC_ROWS = (
    ("world_id", "世界", "World"),
    ("route", "路線", "Route"),
    ("event_id", "活動", "Event"),
    ("project_id", "專案", "Project"),
)


class ContentError(Exception):
    """A source file is invalid; the build stops rather than publishing it."""


@dataclass
class Article:
    slug: str
    site: SiteConfig
    meta: dict
    bodies: dict[str, str] = field(default_factory=dict)
    sources: dict[str, Path] = field(default_factory=dict)

    @property
    def status(self) -> str:
        return str(self.meta.get("status", "draft"))

    @property
    def category(self) -> str:
        return str(self.meta["category"])


def read_source(path: Path) -> tuple[dict, str]:
    """Split a Markdown file into its YAML front matter and body."""
    with path.open("r", encoding="utf-8") as handle:
        raw = handle.read()
    if not raw.lstrip().startswith("---"):
        raise ContentError(f"{path.name}: missing YAML front matter (file must start with ---)")
    stripped = raw.lstrip()
    parts = stripped.split("---", 2)
    if len(parts) < 3:
        raise ContentError(f"{path.name}: front matter is not closed with ---")
    try:
        meta = yaml.safe_load(parts[1]) or {}
    except yaml.YAMLError as exc:
        raise ContentError(f"{path.name}: front matter is not valid YAML — {exc}") from exc
    if not isinstance(meta, dict):
        raise ContentError(f"{path.name}: front matter must be a mapping")
    return meta, parts[2].strip()


def check_list_indent(text: str, source_name: str) -> None:
    """Reject 1-3 space list indentation, which silently renders as a flat list.

    python-markdown follows the original Markdown spec and nests at four spaces.
    A two-space indent produces a flat list with no error, so the author would
    never notice the structure was lost. Catching it here is the whole point.
    """
    fenced = False
    for number, line in enumerate(text.split("\n"), start=1):
        if line.lstrip().startswith("```"):
            fenced = not fenced
            continue
        if fenced:
            continue
        if re.match(r"^ {1,3}(?:[-*+]|\d+\.)\s+\S", line):
            raise ContentError(
                f"{source_name} line {number}: list item indented by fewer than four spaces "
                f"would render as a flat list. Use four spaces per nesting level."
            )


def render_markdown(text: str, source_name: str) -> str:
    check_list_indent(text, source_name)
    # `extra` covers tables, fenced code, attribute lists, and definition lists.
    # `smarty` is deliberately omitted: it rewrites "--" in prose, which would
    # silently mangle CSS custom properties and CLI flags this site writes about.
    html = markdown_lib.markdown(
        text,
        extensions=["extra"],
        output_format="html5",
    )
    if re.search(r"<h1[\s>]", html):
        raise ContentError(
            f"{source_name}: body contains an H1. The page title is already an H1 — "
            f"start body headings at '##'."
        )
    # Wide tables scroll inside their own container so the page body never does.
    html = re.sub(r"<table>", '<div class="pa-table-scroll"><table>', html)
    html = re.sub(r"</table>", "</table></div>", html)
    return indent_block(html, 8)


def indent_block(html: str, spaces: int) -> str:
    pad = " " * spaces
    return "\n".join(pad + line if line.strip() else line for line in html.split("\n"))


def collect(content_root: Path) -> list[Article]:
    """Load every Markdown source and group the language variants by slug."""
    if not content_root.exists():
        return []

    grouped: dict[tuple[str, str], Article] = {}
    errors: list[str] = []

    for path in sorted(content_root.rglob("*.md")):
        match = re.fullmatch(r"(?P<slug>.+)\.(?P<lang>[a-z]{2})", path.stem)
        if not match:
            errors.append(f"{path.name}: filename must be <slug>.<lang>.md")
            continue
        slug, lang = match.group("slug"), match.group("lang")
        if lang not in LANGUAGES:
            errors.append(f"{path.name}: unsupported language '{lang}'")
            continue

        try:
            meta, body = read_source(path)
        except ContentError as exc:
            errors.append(str(exc))
            continue

        site_key = str(meta.get("site", ""))
        if site_key not in SITES:
            errors.append(f"{path.name}: unknown site '{site_key}' (expected one of {', '.join(SITES)})")
            continue
        site = SITES[site_key]

        key = (site_key, slug)
        article = grouped.get(key)
        if article is None:
            article = Article(slug=slug, site=site, meta={})
            grouped[key] = article

        # The zh file owns the shared metadata; en supplies only its own strings.
        if lang == "zh":
            article.meta.update(meta)
        else:
            for shared in ("title", "summary", "disclosure", "viewpoint"):
                if shared in meta:
                    article.meta[f"{shared}_en"] = meta[shared]
        article.bodies[lang] = body
        article.sources[lang] = path

    for (site_key, slug), article in grouped.items():
        if "zh" not in article.sources:
            errors.append(f"{slug}: no .zh.md source; the Chinese file carries the shared metadata")
            continue
        errors.extend(validate(article))

    if errors:
        raise ContentError("\n".join(f"  - {message}" for message in errors))
    return sorted(grouped.values(), key=lambda a: (a.site.key, str(a.meta.get("date", "")), a.slug))


def validate(article: Article) -> list[str]:
    problems: list[str] = []
    name = article.sources["zh"].name
    for required in REQUIRED_FIELDS:
        if not article.meta.get(required):
            problems.append(f"{name}: missing required field '{required}'")
    if article.meta.get("slug") and article.meta["slug"] != article.slug:
        problems.append(f"{name}: front-matter slug '{article.meta['slug']}' does not match the filename")
    status = article.meta.get("status")
    if status and status not in VALID_STATUS:
        problems.append(f"{name}: status must be one of {', '.join(VALID_STATUS)}")
    category = article.meta.get("category")
    if category and category not in article.site.categories:
        valid = ", ".join(article.site.categories)
        problems.append(f"{name}: category '{category}' is not valid for {article.site.key} (expected: {valid})")
    for datefield in ("date", "checked_at"):
        value = article.meta.get(datefield)
        if value and not isinstance(value, Date) and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(value)):
            problems.append(f"{name}: {datefield} must be an ISO date (YYYY-MM-DD)")
    research_status = article.meta.get("research_status")
    if research_status and research_status not in RESEARCH_STATUS_ZH:
        problems.append(f"{name}: research_status must be one of {', '.join(RESEARCH_STATUS_ZH)}")
    # Articles about other people's communities must carry their disclosure.
    if article.meta.get("category") == "community_ecosystem":
        for required in ("disclosure", "viewpoint"):
            if not article.meta.get(required):
                problems.append(
                    f"{name}: '{required}' is required for community_ecosystem articles "
                    f"(relationship and viewpoint must be stated)"
                )
    return problems


def build_context(article: Article) -> dict:
    meta = article.meta
    site = article.site
    label_zh, label_en = site.categories[article.category]
    depth = len(Path(site.out_dir).parts)
    root = "../" * depth
    out_name = f"{article.slug}.html"
    canonical = f"{BASE_URL}{site.out_dir}/{out_name}"

    title_zh = str(meta["title"])
    summary_zh = str(meta["summary"])
    title_en = str(meta.get("title_en") or title_zh)
    summary_en = str(meta.get("summary_en") or summary_zh)

    has_en = "en" in article.bodies
    body_zh = render_markdown(article.bodies["zh"], article.sources["zh"].name)
    body_en = (
        render_markdown(article.bodies["en"], article.sources["en"].name)
        if has_en
        else body_zh          # fall back to Chinese rather than an empty page
    )

    spec_rows = []
    for key, key_zh, key_en in OPTIONAL_SPEC_ROWS:
        value = meta.get(key)
        if value:
            spec_rows.append({"key_zh": key_zh, "key_en": key_en, "value": str(value)})

    json_ld = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title_zh,
            "description": summary_zh,
            "url": canonical,
            "datePublished": str(meta["date"]),
            "dateModified": str(meta["checked_at"]),
            "inLanguage": ["zh-TW", "en"] if has_en else ["zh-TW"],
            "author": {"@type": "Organization", "name": "StarRiver Arts"},
            "publisher": {"@type": "Organization", "name": "StarRiver Arts"},
        },
        ensure_ascii=False,
        indent=2,
    )

    return {
        "slug": article.slug,
        "out_name": out_name,
        "site_label_zh": site.label_zh,
        "category": article.category,
        "category_label_zh": label_zh,
        "category_label_en": label_en,
        "title_zh": title_zh,
        "title_en": title_en,
        "summary_zh": summary_zh,
        "summary_en": summary_en,
        "date": str(meta["date"]),
        "checked_at": str(meta["checked_at"]),
        "noindex": bool(meta.get("noindex", False)),
        "canonical_url": canonical,
        "base_url": BASE_URL,
        "root": root,
        "list_href": "index.html" if site.key == "projectt" else f"{root}{site.list_page}",
        "clarity_id": CLARITY_ID,
        "json_ld": indent_block(json_ld, 0),
        "spec_rows": spec_rows,
        "disclosure_zh": meta.get("disclosure") or "",
        "disclosure_en": meta.get("disclosure_en") or meta.get("disclosure") or "",
        "viewpoint_zh": meta.get("viewpoint") or "",
        "viewpoint_en": meta.get("viewpoint_en") or meta.get("viewpoint") or "",
        "research_status": meta.get("research_status") or "",
        "research_status_zh": RESEARCH_STATUS_ZH.get(str(meta.get("research_status")), ""),
        "has_en": has_en,
        "body_zh": body_zh,
        "body_en": body_en,
    }


def render_list_region(site: SiteConfig, contexts: list[dict]) -> str:
    """Build the article list, plus the category chips that cleared the threshold."""
    if not contexts:
        return ""

    newest_first = sorted(contexts, key=lambda c: c["date"], reverse=True)

    counts: dict[str, int] = {}
    for context in newest_first:
        counts[context["category"]] = counts.get(context["category"], 0) + 1

    lines: list[str] = []
    # Every article is listed. The chips only appear for categories that have
    # enough articles to tell a reader what the category actually is.
    chips = [key for key in site.categories if counts.get(key, 0) >= CATEGORY_NAV_THRESHOLD]
    if chips:
        lines.append('      <div class="pa-chips">')
        for key in chips:
            label_zh, label_en = site.categories[key]
            lines.append(
                f'        <span class="pa-chip"><span class="zh">{label_zh}</span>'
                f'<span class="en">{label_en}</span> <b>{counts[key]}</b></span>'
            )
        lines.append("      </div>")

    lines.append('      <div class="card-grid">')
    for context in newest_first:
        lines.append(f'        <a class="card pa-card" href="{context["out_name"]}">')
        lines.append(
            f'          <div class="card-label"><span class="zh">{context["category_label_zh"]}</span>'
            f'<span class="en">{context["category_label_en"]}</span></div>'
        )
        lines.append(
            f'          <h3 class="pa-card-title"><span class="zh">{context["title_zh"]}</span>'
            f'<span class="en">{context["title_en"]}</span></h3>'
        )
        lines.append(
            f'          <p class="pa-card-summary"><span class="zh">{context["summary_zh"]}</span>'
            f'<span class="en">{context["summary_en"]}</span></p>'
        )
        lines.append(f'          <time class="pa-card-date" datetime="{context["date"]}">{context["date"]}</time>')
        lines.append("        </a>")
    lines.append("      </div>")
    return "\n".join(lines)


def prune_orphans(site: SiteConfig, keep: set[str], dry_run: bool) -> list[str]:
    """Delete generated pages whose source is gone or no longer published.

    Only files carrying PAGE_MARKER are considered, so hand-written pages in the
    same directory — the list page, the old prototype — are never at risk.
    """
    out_dir = ROOT / site.out_dir
    if not out_dir.exists():
        return []
    removed: list[str] = []
    for path in sorted(out_dir.glob("*.html")):
        if path.name in keep:
            continue
        with path.open("r", encoding="utf-8") as handle:
            head = handle.read(400)
        if PAGE_MARKER not in head:
            continue
        removed.append(f"{site.out_dir}/{path.name}")
        if not dry_run:
            path.unlink()
    return removed


def write_list_region(list_path: Path, region: str) -> str:
    """Replace the generated region in place, leaving the rest of the page alone."""
    if not list_path.exists():
        return f"list page missing, skipped: {list_path.name}"
    with list_path.open("r", encoding="utf-8", newline="") as handle:
        raw = handle.read()
    if MARKER_START not in raw or MARKER_END not in raw:
        return f"no GENERATED markers in {list_path.name}, skipped"

    newline = "\r\n" if "\r\n" in raw else "\n"
    body = region.replace("\n", newline)
    pattern = re.compile(
        re.escape(MARKER_START) + r".*?" + re.escape(MARKER_END),
        re.DOTALL,
    )
    replacement = MARKER_START + newline + body + newline + "      " + MARKER_END
    updated = pattern.sub(lambda _: replacement, raw, count=1)
    if updated == raw:
        return f"{list_path.name} already current"
    with list_path.open("w", encoding="utf-8", newline="") as handle:
        handle.write(updated)
    return f"updated {list_path.name}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate and report; write nothing")
    parser.add_argument(
        "--preview-dir",
        metavar="DIR",
        help="render every article including drafts into DIR; the site is not touched",
    )
    args = parser.parse_args()

    try:
        articles = collect(CONTENT)
    except ContentError as exc:
        print("content errors:", file=sys.stderr)
        print(exc, file=sys.stderr)
        return 1

    if not articles:
        print(json.dumps({"articles": 0, "note": "no sources under content/"}, ensure_ascii=False))
        return 0

    environment = Environment(
        loader=FileSystemLoader(str(TEMPLATES)),
        undefined=StrictUndefined,
        keep_trailing_newline=True,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    template = environment.get_template("article.html.j2")

    preview = bool(args.preview_dir)
    selected = articles if preview else [a for a in articles if a.status == "published"]
    skipped = len(articles) - len(selected)

    rendered: dict[str, list[dict]] = {}
    written: list[str] = []
    for article in selected:
        context = build_context(article)
        html = template.render(**context)

        if preview:
            out_path = Path(args.preview_dir) / article.site.out_dir / context["out_name"]
        else:
            out_path = ROOT / article.site.out_dir / context["out_name"]

        if not args.check:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with out_path.open("w", encoding="utf-8", newline="\n") as handle:
                handle.write(html)
        written.append(str(out_path.relative_to(ROOT if not preview else Path(args.preview_dir))).replace("\\", "/"))
        rendered.setdefault(article.site.key, []).append(context)

    notes: list[str] = []
    removed: list[str] = []
    if not preview:
        # Every site is visited, not just the ones with output, so unpublishing
        # the last article still clears its page and its list region.
        for site_key, site in SITES.items():
            contexts = rendered.get(site_key, [])
            removed.extend(
                prune_orphans(site, {c["out_name"] for c in contexts}, dry_run=args.check)
            )
            if not (ROOT / site.list_page).exists():
                continue
            region = render_list_region(site, contexts)
            if args.check:
                notes.append(f"{site.list_page}: would write {len(contexts)} entries")
            else:
                notes.append(write_list_region(ROOT / site.list_page, region))

    print(
        json.dumps(
            {
                "articles": len(selected),
                "drafts_skipped": skipped,
                "mode": "check" if args.check else ("preview" if preview else "publish"),
                "written": written,
                "removed": removed,
                "lists": notes,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
