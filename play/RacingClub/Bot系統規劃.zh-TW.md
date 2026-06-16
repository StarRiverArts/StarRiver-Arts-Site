# Discord Bot 系統規劃(zh-TW)

日期:2026-06-15。定位:**bot 不是另一套資料庫,而是現有靜態站生成流程的發布器 / 轉發器 / 截圖器 / 變更監聽器。**

## 核心原則

```txt
本機資料生成器(build_timeattack.py)= 唯一資料源
GitHub Pages                          = 靜態展示層
Discord bot                           = 讀 builder 產出的資料/log,負責公告、截圖、查詢
```

分工(最重要):**builder 負責判斷資料變化;bot 負責公告與截圖;網站負責展示。**
`/track-record` 這類指令可繼續用 Playwright 截網站圖,但「是否破紀錄」由 builder 判斷,不靠 bot 看圖。

## 資料契約(已鎖定 — TimeAttack)

builder 每次 build 輸出到 `play/RacingClub/TimeAttack/data/bot/`(會 commit、bot 從 GitHub Pages 讀):

- `record_updates.json` — bot 公告核心。`{schema_version, generated_at, build_id, updates:[…]}`。
  每筆 update:`update_id`(去重用)、`update_type`(track_record)、track_id/track_name/route_code/route_label、
  board/platform、`previous`/`current`(player/vehicle/time)、`delta_ms`/`delta_text`、`page_url`、
  `screenshot`(command/track/route/board/platform)、created_at。
- `bot_feed.json` — 入口:build_id、site_base_url、latest_update_file、update_count。
- `publish_marker.json` — `{build_id, published_at, ready_for_discord}`。bot **只在 build_id 相符且 ready_for_discord=true 時公告**
  (避免 GitHub Pages 還沒更新就公告)。push 後由發布步驟把 ready 設 true。

builder 本地狀態(**不服務、gitignore**):`TimeAttack/snapshot_cache.json` — 上一版各 route 最快紀錄,供 diff。

bot 自己的檔(在 bot 的 repo,不在網站 repo):`bot-state.json`(announced_update_ids / pin_messages)、`config.json`(guild/channels/watch/site/screenshot)。

## 偵測邏輯(builder)

`build_bot_updates(records, lookup, output_dir)`(已實作於 build_timeattack.py,接在 build_all):
1. 有效池 = `is_general_pool`(**目前無 verified 紀錄,故用與網站榜單同一池**;日後開驗證再切 verified=true)。
2. 算每條 **route** 的最快紀錄(`best_by(general_pool, "route_key")`)= track_record。
3. 讀 `snapshot_cache.json` 前快照比對:新路線首見→不公告;current.time_ms < prev→產 track_record update;相同→略過。
4. **第一次建立(無前快照)只記基準、不公告**,避免一次洗版。
5. 寫 record_updates/bot_feed/publish_marker,更新 snapshot_cache。

**本版只偵測 track_record。** car_record(route×車型)/player_record(route×玩家)之後再加(且建議只 log、不自動推播,量太大)。

## 落地路線

- **Phase 1**:bot 手動查榜/截圖(`/track-record` board/platform 參數、`/ta-update` 發到指定頻道)。≈ 既有 bot。
- **Phase 2(✅ 已做)**:builder 輸出 record_updates/bot_feed/publish_marker + snapshot_cache,只支援 track_record。
- **Phase 3**:bot 每 30 秒輪詢 record_updates.json → 比對 bot-state → 公告未公告的 track_record(去重)。
- **Phase 4**:publish_marker — build 後不立刻公告,push 等 GitHub Pages 更新、marker ready 才公告。
- **Phase 5**:固定榜單訊息(`/ta-pin-board` → 存 message_id → 每次 build 後 edit 截圖)。
- **Phase 6**:Events 同模式輸出 `Events/data/bot/event_updates.json`(新活動/提醒/賽事結果/賽季階段)。

## 觸發方式(Phase 3)

預設**方案 A:輪詢檔案**(每 30 秒讀 record_updates.json,免套件、穩,最多延遲 30 秒)。
方案 B(chokidar 監聽,要處理半寫入,builder 改成寫 .tmp 再 rename)、方案 C(builder 打 bot localhost API)先不用。

## bot 位置

現有 bot 在 `D:\CreationProject\CodeTools\DiscordBots\VRRCTW\discord-example-app`,先不移動;
只要讓它讀到網站輸出的 `…/TimeAttack/data/bot/record_updates.json`(線上 URL)即可。

## 適配說明(實際環境 vs 規劃範例)

- builder 是 **Python `build_timeattack.py`**,非 Node `build.js`;bot 資料輸出在 `TimeAttack/data/bot/`。
- record 粒度用 **route(賽道+路線)**,因 TimeAttack 紀錄是 per-route。
- 偵測有效池暫用 `is_general_pool`(無 verified 資料)。
