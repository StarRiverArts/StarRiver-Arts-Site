#!/usr/bin/env python3
"""VRRCTW Events — 唯讀 Discord 公告 bot(最簡 webhook 版)。

只做三件事(對應 Events 規劃 Phase 4):
  1. 抓公開的 Events/data/bot_feed.json
  2. 有新公告(announcement id 沒發過)就用 webhook 發到頻道
  3. 維護兩則固定訊息:賽季積分榜 / 近期活動(用 webhook 編輯自己的訊息)

特性:
  - 唯讀網站資料,絕不寫回站台;state 只存在本機 state.json。
  - 只用 Python 標準函式庫(urllib),不需 pip install。
  - 沒有 Discord bot token / gateway / slash command — 只有 webhook。
    要 slash command / 更豐富互動再升級成 discord.py(見 README)。

用法:
  cp config.example.json config.json   # 填 webhook_url
  python bot.py                          # 跑一次(發新公告 + 更新固定訊息)
  # 要定時:用系統排程器 / cron / GitHub Actions 每隔幾分鐘跑一次 bot.py
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
CONFIG = HERE / "config.json"
STATE = HERE / "state.json"


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def http(url: str, method: str = "GET", body: dict | None = None) -> dict:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Content-Type": "application/json", "User-Agent": "vrrctw-bot/0.1"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw.strip() else {}


def post_message(webhook: str, content: str) -> str | None:
    """發訊息;回傳 message_id(用 ?wait=true 取回)。"""
    try:
        res = http(webhook + ("&" if "?" in webhook else "?") + "wait=true", "POST", {"content": content})
        return res.get("id")
    except urllib.error.HTTPError as e:
        print(f"post failed: {e}", file=sys.stderr)
        return None


def edit_message(webhook: str, message_id: str, content: str) -> bool:
    base = webhook.split("?")[0]
    try:
        http(f"{base}/messages/{message_id}", "PATCH", {"content": content})
        return True
    except urllib.error.HTTPError as e:
        print(f"edit failed ({message_id}): {e}", file=sys.stderr)
        return False


def pin_block(lang: str, pin: dict) -> str:
    lines = "\n".join(pin.get("lines", []))
    return f"**{pin.get('title', '')}**\n{lines}"


def ann_text(lang: str, ann: dict) -> str:
    title = ann.get(f"title_{lang}") or ann.get("title_zh") or ""
    msg = ann.get(f"message_{lang}") or ann.get("message_zh") or ""
    url = ann.get("url", "")
    return f"📣 **{title}**\n{msg}\n{url}".strip()


def main() -> int:
    cfg = load_json(CONFIG, None)
    if not cfg or "your-webhook" in (cfg.get("webhook_url") or ""):
        print("請先 cp config.example.json config.json 並填入 webhook_url。", file=sys.stderr)
        return 1
    lang = cfg.get("lang", "zh")
    webhook = cfg["webhook_url"]
    feed_url = cfg["feed_url"]

    feed = http(feed_url)
    state = load_json(STATE, {"last_digest": None, "announced_ids": [], "pin_message_ids": {}})

    if feed.get("digest") == state.get("last_digest"):
        print("digest 未變,沒有新內容。")
        return 0

    announced = set(state.get("announced_ids", []))
    new = [a for a in feed.get("announcements", []) if a["id"] not in announced]
    for a in new:
        if post_message(webhook, ann_text(lang, a)):
            announced.add(a["id"])
            print("公告:", a["id"])

    pin_ids = state.get("pin_message_ids", {})
    for key, pin in (feed.get("pins") or {}).items():
        content = pin_block(lang, pin)
        mid = pin_ids.get(key)
        if mid and edit_message(webhook, mid, content):
            print("更新固定訊息:", key)
        else:
            new_id = post_message(webhook, content)
            if new_id:
                pin_ids[key] = new_id
                print("建立固定訊息:", key)

    save_json(STATE, {"last_digest": feed.get("digest"),
                      "announced_ids": sorted(announced), "pin_message_ids": pin_ids})
    print(f"完成。新公告 {len(new)} 則。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
