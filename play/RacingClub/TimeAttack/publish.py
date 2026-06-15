#!/usr/bin/env python3
"""TimeAttack 發布流程(Phase 4):build → push → 等 GitHub Pages → 標 ready → push。

解決「bot 點連結/截圖時 Pages 還沒更新」:
  1. 重建 JSON(build_timeattack.py),publish_marker.ready_for_discord=false
  2. commit + push(網站開始部署)
  3. 等 --wait 秒讓 GitHub Pages 上線
  4. publish_marker.ready_for_discord=true(同一 build_id)
  5. 再 commit + push(只動 marker)

bot 從 Pages 讀 record_updates.json + publish_marker.json,只在 ready 且 build_id 相符才公告。

用法(在你自己的終端機,git push 需要 SSH 金鑰):
  python publish.py            # 預設等 90 秒
  python publish.py --wait 120
  python publish.py --no-push  # 只 build + 標 ready,不 push(自己手動 push)
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]  # …/StarRiver-Arts-Site
MARKER = HERE / "data" / "bot" / "publish_marker.json"
PUSH_PATHS = ["play/RacingClub/TimeAttack/data", "play/RacingClub/TimeAttack/build_timeattack.py"]


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    print("›", " ".join(cmd))
    return subprocess.run(cmd, cwd=str(REPO), text=True, encoding="utf-8", errors="replace", **kw)


def git_commit_push(message: str, do_push: bool) -> None:
    run(["git", "add", *PUSH_PATHS])
    r = run(["git", "commit", "-m", message], capture_output=True)
    print((r.stdout or "") + (r.stderr or ""))
    if do_push:
        r2 = run(["git", "push"])
        if r2.returncode != 0:
            print("⚠ push 失敗(可能沒設 SSH 金鑰),請手動 push。", file=sys.stderr)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--wait", type=int, default=90, help="push 後等 GitHub Pages 上線的秒數")
    ap.add_argument("--no-push", action="store_true", help="不執行 git push(只 build + 標 ready)")
    args = ap.parse_args()
    do_push = not args.no_push

    # 1. build
    r = subprocess.run([sys.executable, str(HERE / "build_timeattack.py")],
                       text=True, encoding="utf-8", errors="replace", capture_output=True)
    print(r.stdout)
    if r.returncode != 0:
        print("build 失敗:", r.stderr, file=sys.stderr)
        return 1
    build_id = json.loads(MARKER.read_text(encoding="utf-8")).get("build_id")
    print(f"build_id = {build_id}")

    # 2. push build
    git_commit_push(f"publish time attack {build_id}", do_push)

    # 3. wait for Pages
    if do_push and args.wait > 0:
        print(f"等 GitHub Pages 上線 {args.wait}s…")
        time.sleep(args.wait)

    # 4. mark ready
    marker = json.loads(MARKER.read_text(encoding="utf-8"))
    marker["ready_for_discord"] = True
    marker["published_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    MARKER.write_text(json.dumps(marker, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("publish_marker.ready_for_discord = true")

    # 5. push marker
    git_commit_push(f"mark ready {build_id}", do_push)
    print("✓ 發布完成。bot 下一次輪詢就會公告(若有破紀錄)。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
