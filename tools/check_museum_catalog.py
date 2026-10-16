#!/usr/bin/env python3
"""Validate public Museum catalogue relations and static entry-point links."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "content/museum/catalog.json"
MAIN_PAGES = ("museum/index.html", "museum/exhibitions.html")
HIDDEN_PROTOTYPES = (
    "museum/articles.html", "museum/article.html",
    "museum/curatorial-note.html", "museum/exhibition.html",
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def entry_file(path: str) -> Path:
    require(path.startswith("museum/") and not path.startswith("museum/../"),
            f"Not a Museum entry path: {path}")
    require(".." not in Path(path).parts, f"Traversal in path: {path}")
    target = (ROOT / path).resolve()
    require(target.is_relative_to(ROOT), f"Escapes repository: {path}")
    if target.is_dir():
        target = target / "index.html"
    require(target.is_file(), f"Missing public entry file: {path}")
    require(target.suffix == ".html", f"Not HTML: {path}")
    return target


def validate() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    require(catalog.get("schema_version") == 1, "Unknown Museum catalogue version")
    programmes = catalog["programmes"]
    entries = catalog["entries"]
    by_id = {e["id"]: e for e in entries}
    prog_ids = {p["id"] for p in programmes}
    require(len(by_id) == len(entries), "Duplicate Museum entry IDs")
    require(len(prog_ids) == len(programmes), "Duplicate programme IDs")
    require(len({e["entry_path"] for e in entries}) == len(entries),
            "Duplicate public entry paths")

    listed = set()
    for e in entries:
        eid = e["id"]
        require(e["publication"] == "public", f"Unpublished item in public registry: {eid}")
        require(e["role"] in {"design-reference", "interactive-collection", "interactive-tool"},
                f"Unrecognized entry role: {eid}")
        for field in ("title", "summary"):
            require(all(isinstance(e[field].get(lang), str) and e[field][lang].strip()
                        for lang in ("zh", "en")), f"Missing bilingual {field}: {eid}")
        path = entry_file(e["entry_path"])
        html = path.read_text(encoding="utf-8", errors="replace")
        require(not re.search(r'<meta\s+name=["\']robots["\'][^>]*noindex', html, re.I),
                f"Public record points at noindex HTML: {eid}")
        require(set(e["programme_ids"]).issubset(prog_ids), f"Unknown programme: {eid}")
        for related in e["related_ids"]:
            require(related in by_id and related != eid, f"Invalid relation: {eid} -> {related}")
        parent = e["parent_id"]
        require(parent is None or (parent in by_id and parent != eid),
                f"Invalid parent: {eid}")
        if e["listed"]:
            require(parent is None, f"Top-level listing has a parent: {eid}")
            listed.add(eid)

    for e in entries:
        if e["parent_id"]:
            require(by_id[e["parent_id"]]["role"] == "interactive-collection",
                    f"Unexpected parent type: {e['id']}")
    for p in programmes:
        require(set(p["entry_ids"]).issubset(by_id), f"Unknown programme members: {p['id']}")
        for eid in p["entry_ids"]:
            require(p["id"] in by_id[eid]["programme_ids"],
                    f"Programme membership is not reciprocal: {eid}")

    for page in MAIN_PAGES:
        html = (ROOT / page).read_text(encoding="utf-8")
        page_ids = re.findall(r'<article\s+class="museum-card"\s+data-content-id="([^"]+)"', html)
        require(set(page_ids) == listed and len(page_ids) == len(listed),
                f"{page}: catalogue and visible cards differ: {page_ids} != {listed}")
        for eid in page_ids:
            rel = "./" + by_id[eid]["entry_path"].removeprefix("museum/")
            require(f'href="{rel}"' in html,
                    f"{page}: no direct entry link to {eid}")
    directory = (ROOT / "museum/exhibitions.html").read_text(encoding="utf-8")
    for e in entries:
        if e["parent_id"]:
            rel = "./" + e["entry_path"].removeprefix("museum/")
            require(f'href="{rel}"' in directory, f"Child tool absent from directory: {e['id']}")
    for page in HIDDEN_PROTOTYPES:
        head = (ROOT / page).read_text(encoding="utf-8")[:1500]
        require(bool(re.search(r'<meta\s+name=["\']robots["\'][^>]*noindex', head, re.I)),
                f"Prototype is indexable: {page}")
    print(f"Museum catalogue: {len(programmes)} grouping(s), {len(entries)} public records, {len(listed)} top-level display(s).")


if __name__ == "__main__":
    validate()
