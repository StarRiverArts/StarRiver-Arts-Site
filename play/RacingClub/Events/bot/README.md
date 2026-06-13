# VRRCTW Events — Discord 公告 bot(唯讀骨架)

> 本輪只建立**骨架**,尚未部署。它只讀公開的 `Events/data/bot_feed.json`,
> 用 Discord webhook 發公告,**不會寫回網站**。state 只存本機 `state.json`。

## 運作

`build_events.py` 每次重建時會輸出 `data/bot_feed.json`:

```jsonc
{
  "generated_at": "...", "digest": "781dea65a4ba",
  "announcements": [ { "id", "type", "title_zh/en", "message_zh/en", "url", "created_at" } ],
  "pins": { "season_standings": {"title","lines"}, "next_events": {"title","lines"} }
}
```

`bot.py` 每次跑:digest 沒變就跳過;有新 announcement(id 沒發過)就發;
固定訊息(積分榜 / 近期活動)用 webhook 編輯自己的訊息更新。

## 啟用(最簡 webhook 版)

1. Discord 頻道 → 編輯頻道 → 整合 → Webhook → 複製 URL。
2. `cp config.example.json config.json`,把 `webhook_url` 換成你的。
3. 測跑:`python bot.py`(只用標準函式庫,免裝套件)。
4. 定時跑(擇一):

   - **A. 本機常駐**:工作排程器每 5–10 分鐘跑 `python bot.py`(電腦關機就停)。
   - **B. 小型 VPS / Railway / Fly.io / Render**:cron 或 worker 定時跑(穩定)。
   - **C. GitHub Actions**:排程 workflow 定時 `python bot.py`(免常駐;
     但 `state.json` 需 commit 回 repo 或改存外部,否則每次都從零)。

## 升級路線(本版刻意不做)

- Slash command / 互動查詢 → 改用 `discord.py`(需 bot token + gateway + intents)。
- 寫回資料(報名、登記成績) → 需後端,超出靜態站範圍。
- 多頻道 / 多語言分流 → 擴充 config。

## 安全

- 不需要 bot token,只用 webhook(權限最小)。
- 不讀任何本機密鑰或瀏覽器資料;唯一輸入是公開 JSON。
- `config.json`(含 webhook)請勿提交;見同層 `.gitignore`。
