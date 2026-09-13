#!/usr/bin/env python3
"""Validate generated public Racing Toolkit projections."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
TA = ROOT / "play" / "RacingClub" / "TimeAttack"
OUT = TA / "vrc" / "toolkit"
REGISTRY = ROOT / "content" / "racing-toolkit" / "owned-worlds.json"
FORBIDDEN = {"submission_note", "proof_text", "verified_by", "verified_at", "review_status", "moderation_note", "image_sha256", "access_token", "token"}
SCOPES = {"global", "project_t", "world", "route", "event"}
KINDS = {"announcement", "update", "record", "event"}
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def walk(value: Any, path: str = "$") -> list[str]:
    hits: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            if str(key).casefold() in FORBIDDEN:
                hits.append(f"{path}.{key}")
            hits.extend(walk(child, f"{path}.{key}"))
    elif isinstance(value, list):
        for i, child in enumerate(value):
            hits.extend(walk(child, f"{path}[{i}]"))
    return hits


def envelope(path: Path, contract: str, world_id: str | None = None) -> dict[str, Any]:
    obj = load(path)
    if not isinstance(obj, dict) or obj.get("contract") != contract:
        raise AssertionError(f"{path}: invalid {contract} envelope")
    version = obj.get("version")
    if not isinstance(version, str) or not SEMVER.match(version) or not version.startswith("1."):
        raise AssertionError(f"{path}: version must remain 1.x semver")
    if obj.get("source_id") != "project-t":
        raise AssertionError(f"{path}: source_id must be project-t")
    if world_id is not None and obj.get("world_id") != world_id:
        raise AssertionError(f"{path}: world_id mismatch")
    if not isinstance(obj.get("data"), dict):
        raise AssertionError(f"{path}: data must be an object")
    return obj


def validate_news(path: Path, world_id: str) -> None:
    obj = envelope(path, "news", world_id)
    items = obj["data"].get("items")
    if not isinstance(items, list):
        raise AssertionError(f"{path}: items must be a list")
    for i, item in enumerate(items):
        if not isinstance(item, dict):
            raise AssertionError(f"{path}: items[{i}] must be object")
        for key in ("id", "scope", "text", "at"):
            if not isinstance(item.get(key), str) or not item[key]:
                raise AssertionError(f"{path}: items[{i}].{key} missing")
        if item["scope"] not in SCOPES:
            raise AssertionError(f"{path}: items[{i}] invalid scope")
        if item.get("kind") is not None and item["kind"] not in KINDS:
            raise AssertionError(f"{path}: items[{i}] invalid kind")


def main() -> None:
    registry = load(REGISTRY)
    worlds = registry.get("worlds") if isinstance(registry, dict) else None
    if not isinstance(worlds, list) or not worlds:
        raise SystemExit("owned-worlds.json contains no worlds")

    for world in worlds:
        wid = str(world.get("world_id") or "")
        routes = [str(r.get("route_id")) for r in world.get("routes", []) if isinstance(r, dict) and r.get("route_id")]
        wp = envelope(OUT / "worlds" / f"{wid}.json", "world", wid)
        if wp["data"].get("status") not in {"development", "testing", "released"}:
            raise AssertionError(f"{wid}: invalid world status")
        generated_routes = {str(r.get("route_id") or "") for r in wp["data"].get("routes", []) if isinstance(r, dict)}
        missing = [rid for rid in routes if rid not in generated_routes]
        if missing:
            raise AssertionError(f"{wid}: missing routes {missing}")
        for rid in routes:
            rp = envelope(OUT / "routes" / f"{wid}__{rid}.json", "route", wid)
            if rp["data"].get("route_id") != rid or not isinstance(rp["data"].get("points"), list):
                raise AssertionError(f"{wid}/{rid}: invalid route projection")
        validate_news(OUT / "news" / f"{wid}.json", wid)

    validate_news(OUT / "news" / "global.json", "project-t")
    current = OUT / "events" / "current.json"
    if current.exists():
        envelope(current, "event")

    directory = load(OUT / "worlds.json")
    if directory.get("schema") != "srvrc-worlds/1" or not isinstance(directory.get("worlds"), list):
        raise AssertionError("toolkit/worlds.json: invalid world-directory contract")

    manifest = load(OUT / "manifest.json")
    if manifest.get("schema") != "project-t-toolkit-manifest/1":
        raise AssertionError("toolkit/manifest.json: invalid manifest")
    if manifest.get("runtime_refresh", {}).get("status") != "TODO":
        raise AssertionError("runtime refresh must stay explicitly TODO until implemented")

    hits: list[str] = []
    for path in OUT.rglob("*.json"):
        for hit in walk(load(path)):
            hits.append(f"{path.relative_to(ROOT)}:{hit}")
    if hits:
        raise SystemExit("forbidden private fields in public Toolkit data:\n" + "\n".join(hits[:50]))

    print(f"Validated Racing Toolkit public projection for {len(worlds)} owned worlds")


if __name__ == "__main__":
    main()
