Exit code: 0
Wall time: 0.3 seconds
Output:
#!/usr/bin/env python3
"""Build deterministic, low-token repository indexes for coding agents."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

DEFAULT_EXTENSIONS = {
    ".css", ".csv", ".html", ".js", ".json", ".md", ".py", ".ts", ".tsx",
    ".xml", ".yaml", ".yml",
}


def load_config(root: Path, path: Path) -> dict:
    config = json.loads((root / path).read_text(encoding="utf-8"))
    config.setdefault("output_dir", ".agent-index")
    config.setdefault("exclude_dirs", [".git", "node_modules", "__pycache__"])
    config.setdefault("source_extensions", sorted(DEFAULT_EXTENSIONS))
    config.setdefault("max_file_bytes", 2_000_000)
    config.setdefault("authoritative_docs", [])
    config.setdefault("modules", [])
    return config


def tracked_files(root: Path) -> list[Path]:
    try:
        top_level = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        git_root = Path(top_level.stdout.strip()).resolve()
        result = subprocess.run(
            ["git", "ls-files", "-z"],
            cwd=root,
            check=True,
            capture_output=True,
        )
        files = [
            git_root / item.decode("utf-8")
            for item in result.stdout.split(b"\0")
            if item
        ]
        scoped = [path for path in files if path.is_relative_to(root)]
        if scoped:
            return scoped
        return [path for path in root.rglob("*") if path.is_file()]
    except (FileNotFoundError, subprocess.CalledProcessError):
        return [path for path in root.rglob("*") if path.is_file()]


def select_sources(root: Path, config: dict) -> list[Path]:
    excluded = set(config["exclude_dirs"]) | {config["output_dir"]}
    extensions = {item.casefold() for item in config["source_extensions"]}
    selected = []
    for path in tracked_files(root):
        relative = path.relative_to(root)
        if any(part in excluded for part in relative.parts):
            continue
        if path.suffix.casefold() not in extensions:
            continue
        try:
            if path.stat().st_size > config["max_file_bytes"]:
                continue
        except FileNotFoundError:
            continue
        selected.append(path)
    return sorted(selected, key=lambda item: item.relative_to(root).as_posix())


def source_digest(root: Path, sources: list[Path]) -> str:
    digest = hashlib.sha256()
    for path in sources:
        relative = path.relative_to(root).as_posix()
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(hashlib.sha256(path.read_bytes()).digest())
    return digest.hexdigest()


def markdown_headings(path: Path, limit: int = 12) -> list[str]:
    if not path.exists() or path.suffix.casefold() != ".md":
        return []
    headings = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("#"):
            heading = line.lstrip("#").strip()
            if heading:
                headings.append(heading)
        if len(headings) >= limit:
            break
    return headings


def build_payload(root: Path, config: dict) -> tuple[dict, str]:
    sources = select_sources(root, config)
    docs = []
    for item in config["authoritative_docs"]:
        path = root / item["path"]
        docs.append(
            {
                "path": item["path"],
                "purpose": item["purpose"],
                "headings": markdown_headings(path),
            }
        )

    payload = {
        "schema_version": 1,
        "project": config["project_name"],
        "purpose": config.get("project_purpose", ""),
        "source_digest": source_digest(root, sources),
        "source_file_count": len(sources),
        "reading_order": config.get("reading_order", []),
        "authoritative_docs": docs,
        "modules": config["modules"],
        "generated_files": config.get("generated_files", []),
        "commands": config.get("commands", {}),
    }

    lines = [
        f"# {config['project_name']} ??Agent Context",
        "",
        f"> {config.get('project_purpose', '').strip()}",
        "",
        "Read only the module needed for the current task. Do not crawl the full repository first.",
        "",
        "## Reading order",
        "",
    ]
    lines.extend(f"{index}. `{path}`" for index, path in enumerate(payload["reading_order"], 1))
    lines.extend(["", "## Modules", ""])
    for module in payload["modules"]:
        lines.append(
            f"- **{module['name']}** ??`{module['path']}`: {module['purpose']}"
        )
        if module.get("read_first"):
            lines.append(f"  - Read first: `{module['read_first']}`")
    lines.extend(["", "## Generated discovery files", ""])
    for item in payload["generated_files"]:
        lines.append(f"- `{item['path']}` ??{item['audience']}")
    lines.extend(
        [
            "",
            "## Update commands",
            "",
            f"- Rebuild: `{payload['commands'].get('build', '')}`",
            f"- Check: `{payload['commands'].get('check', '')}`",
            "",
            f"Source digest: `{payload['source_digest']}`",
            "",
        ]
    )
    return payload, "\n".join(lines)


def render(root: Path, config: dict, output_dir: Path) -> None:
    payload, markdown = build_payload(root, config)
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "repo-map.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (output_dir / "context.md").write_text(markdown, encoding="utf-8")


def check(root: Path, config: dict) -> int:
    committed = root / config["output_dir"]
    with tempfile.TemporaryDirectory() as temp:
        generated = Path(temp)
        render(root, config, generated)
        stale = []
        for name in ("repo-map.json", "context.md"):
            expected = generated / name
            actual = committed / name
            if not actual.exists() or actual.read_bytes() != expected.read_bytes():
                stale.append(name)
        if stale:
            print("Agent index is stale: " + ", ".join(stale))
            return 1
    print("Agent index is current.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--config", type=Path, default=Path("agent-index.config.json"))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    config = load_config(root, args.config)
    if args.check:
        return check(root, config)
    render(root, config, root / config["output_dir"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

