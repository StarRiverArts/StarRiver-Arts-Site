#!/usr/bin/env python3
"""Audit public pages for search and external-LLM discovery signals."""

from __future__ import annotations

import argparse
from collections import Counter
import json
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

PLACEHOLDERS = (
    "unpacking...",
    "loading...",
    "霈?葉",
    "頛銝?,
    "lorem ipsum",
    "todo",
    "placeholder",
)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.lang = ""
        self.metas: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.h1: list[str] = []
        self.json_ld = 0
        self._capture: str | None = None
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        values = {key.casefold(): value or "" for key, value in attrs}
        tag = tag.casefold()
        if tag == "html":
            self.lang = values.get("lang", "")
        elif tag == "meta":
            self.metas.append(values)
        elif tag == "link":
            self.links.append(values)
        elif tag in {"title", "h1"}:
            self._capture = tag
            self._buffer = []
        elif tag == "script" and values.get("type", "").casefold() == "application/ld+json":
            self.json_ld += 1

    def handle_endtag(self, tag: str) -> None:
        tag = tag.casefold()
        if tag == self._capture:
            value = re.sub(r"\s+", " ", "".join(self._buffer)).strip()
            if tag == "title":
                self.title = value
            elif tag == "h1" and value:
                self.h1.append(value)
            self._capture = None
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buffer.append(data)


def fetch(url: str) -> tuple[int, str, str]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "StarRiverDiscoveryAudit/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            content_type = response.headers.get_content_charset() or "utf-8"
            return response.status, response.geturl(), response.read().decode(content_type, "replace")
    except urllib.error.HTTPError as error:
        return error.code, error.geturl(), error.read().decode("utf-8", "replace")


def meta_value(parser: PageParser, key: str, value: str) -> str:
    key = key.casefold()
    value = value.casefold()
    for item in parser.metas:
        if item.get(key, "").casefold() == value:
            return item.get("content", "").strip()
    return ""


def link_value(parser: PageParser, rel: str, hreflang: str | None = None) -> list[str]:
    values = []
    for item in parser.links:
        rels = {part.casefold() for part in item.get("rel", "").split()}
        if rel.casefold() not in rels:
            continue
        if hreflang is not None and not item.get("hreflang"):
            continue
        if item.get("href"):
            values.append(item["href"].strip())
    return values


def sitemap_urls(xml_text: str) -> list[str]:
    root = ET.fromstring(xml_text)
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [item.text.strip() for item in root.findall(".//sm:loc", namespace) if item.text]


def audit_page(url: str) -> dict:
    status, final_url, text = fetch(url)
    parser = PageParser()
    parser.feed(text)
    description = meta_value(parser, "name", "description")
    robots = meta_value(parser, "name", "robots")
    canonicals = [urljoin(final_url, item) for item in link_value(parser, "canonical")]
    alternates = link_value(parser, "alternate", "hreflang")
    lower = text.casefold()
    placeholders = [item for item in PLACEHOLDERS if item in lower]
    issues = []
    if status != 200:
        issues.append(f"http:{status}")
    if final_url.rstrip("/") != url.rstrip("/"):
        issues.append("redirect")
    if not parser.title:
        issues.append("missing-title")
    elif len(parser.title) > 65:
        issues.append("long-title")
    if not description:
        issues.append("missing-description")
    elif len(description) > 180:
        issues.append("long-description")
    if len(canonicals) != 1:
        issues.append("canonical-count")
    elif canonicals[0].rstrip("/") != final_url.rstrip("/"):
        issues.append("canonical-mismatch")
    if not parser.lang:
        issues.append("missing-lang")
    if len(parser.h1) != 1:
        issues.append(f"h1-count:{len(parser.h1)}")
    if not meta_value(parser, "property", "og:title"):
        issues.append("missing-og-title")
    if not meta_value(parser, "property", "og:description"):
        issues.append("missing-og-description")
    if not meta_value(parser, "property", "og:image"):
        issues.append("missing-og-image")
    if parser.json_ld == 0:
        issues.append("missing-jsonld")
    if "noindex" in robots.casefold():
        issues.append("noindex")
    if placeholders:
        issues.append("placeholder-text")
    return {
        "url": url,
        "status": status,
        "final_url": final_url,
        "title": parser.title,
        "description": description,
        "canonical": canonicals,
        "lang": parser.lang,
        "hreflang_count": len(alternates),
        "h1": parser.h1,
        "json_ld_count": parser.json_ld,
        "robots": robots,
        "placeholders": placeholders,
        "issues": issues,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--sitemap",
        default="https://starriverarts.github.io/StarRiver-Arts-Site/sitemap.xml",
    )
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    status, _, xml_text = fetch(args.sitemap)
    if status != 200:
        print(f"Sitemap fetch failed: HTTP {status}", file=sys.stderr)
        return 2
    results = [audit_page(url) for url in sitemap_urls(xml_text)]
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for item in results:
            issues = ", ".join(item["issues"]) or "ok"
            print(f"{item['status']}\t{issues}\t{item['url']}")
        print(f"\nPages: {len(results)}")
        print(f"Clean: {sum(not item['issues'] for item in results)}")
        print(f"With issues: {sum(bool(item['issues']) for item in results)}")
        counts = Counter(issue for item in results for issue in item["issues"])
        print("\nIssue counts:")
        for issue, count in counts.most_common():
            print(f"{count}\t{issue}")
    return 1 if any(item["issues"] for item in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())

