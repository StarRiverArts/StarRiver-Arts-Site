#!/usr/bin/env python3
"""Fail when Git tracks local browser QA output or browser user-data profiles.

This checks paths only. It does not inspect private browser databases or tokens.
"""
from __future__ import annotations

import subprocess
import sys


LOCAL_PREFIXES = (
    "content-review-artifacts/",
    "local-review/",
    "playwright-report/",
    "test-results/",
)
PROFILE_PREFIXES = (
    "edge-profile-",
    "chrome-profile-",
    "chromium-profile-",
    "browser-profile-",
)
PROFILE_DIRS = {"user-data-dir"}
SENSITIVE_BASENAMES = {
    "login data",
    "login data for account",
    "cookies",
    "history",
    "web data",
}


def is_forbidden(path: str) -> bool:
    normalized = path.replace("\\", "/").casefold().lstrip("./")
    parts = normalized.split("/")
    if any(normalized.startswith(prefix) for prefix in LOCAL_PREFIXES):
        return True
    if any(part.startswith(PROFILE_PREFIXES) for part in parts):
        return True
    if any(part in PROFILE_DIRS for part in parts):
        return True
    if "playwright" in parts and ".auth" in parts:
        return True
    if "default" in parts and parts[-1] in SENSITIVE_BASENAMES:
        return True
    return False


def main() -> int:
    try:
        data = subprocess.check_output(["git", "ls-files", "-z"])
    except (OSError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: cannot inspect Git tracked paths: {exc}", file=sys.stderr)
        return 2

    tracked = [item.decode("utf-8", "surrogateescape") for item in data.split(b"\0") if item]
    bad = sorted(path for path in tracked if is_forbidden(path))
    if bad:
        print(f"ERROR: {len(bad)} local/browser artifact(s) tracked in Git.")
        for path in bad[:20]:
            print(f"  - {path}")
        if len(bad) > 20:
            print(f"  ... plus {len(bad) - 20} more")
        print("Remove from tracking, then rerun. .gitignore alone is insufficient.")
        return 1
    print(f"OK: {len(tracked)} tracked paths checked; no forbidden local browser artifacts.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
