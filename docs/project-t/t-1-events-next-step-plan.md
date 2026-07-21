# T-1 Events 下一步實作規劃

日期：2026-07-21  
狀態：E0、E1、E2 shell 已實作；E3 待 canonical 關聯  
範圍：`StarRiverSite/play/RacingClub/TimeAttack/` 內的活動 index、detail 與反向連結

## 1. 結論

活動功能採 **TimeAttack-native additive path**：沿用 `data/events.json`、`manifest.routes.events` 與現有 Time Attack shell，不直接恢復 2026-06-26 已下架的 `play/RacingClub/Events/` 子站。

公開路由固定為：

- 活動清單：`events.html`
- 活動詳情：`event.html?id=<event_id>`
- 玩家、車輛、賽道與車隊反向連結：仍回到各自既有 detail page，不建立第二套 entity 頁。

本次落地（2026-07-21）：

- E0：已移除 player、vehicle、track 三處指向下架 `../Events/` 子站的連結。
- E1：`events.html` 已改為資料驅動清單，以 7/18 定峰與 7/19 Momiji 為測試內容。
- E2：已新增 `event.html?id=<event_id>`、活動切換器、時程、規則與人工結果表。
- 人工結果維護方式見 [t-1-event-result-entry-guide.md](./t-1-event-result-entry-guide.md)。

## 2. 現況與缺口

- `events.html` 是 `noindex` 的 Coming soon 頁，沒有 `data-view="events"`、`data-page-root` 或 `timeattack.js`。
- `data/events.json` 已有 5 張 event card，但 card 沒有 detail `href`。
- `timeattack.js` 仍產生 `../Events/players.html` 與 `../Events/vehicles.html`；目標子站已下架，現在會 404。
- 尚無 `event.html`、Event detail renderer、活動狀態校正與 entity reverse index。
- 2026-07-18、2026-07-19 兩場活動在 2026-07-21 snapshot 仍標為 `upcoming`。
- 目前所有活動的 `Linked Runs` 都是 0，不能宣稱已有成績關聯。

## 3. 不在本階段做的事

- 不從 Git history 整套復原舊 Events builder、bot、source JSON 與平行 entity pages。
- 不直接人工修改 generated `data/events.json` 作為永久來源。
- 不在尚無關聯資料時顯示虛構的玩家、車輛、車隊活動戰績。
- 不修改 canonical SQLite；若後續需要補 event／match／entry／result 關聯，另走 governed-data write approval。

## 4. 公開資料契約

`events.json` 保持 additive 相容，event card 至少提供：

- `event_id`：穩定公開 ID；過渡期可由現有 `event_code` 等值映射，但輸出層統一使用 `event_id`。
- `title`、`subtitle_zh`、`subtitle_en`。
- `status`：`upcoming | ongoing | completed | archived`。
- `starts_at`、`ends_at`、`timezone`。
- `format`、`source_mode`、`completeness`。
- `world_ids`、`route_ids`、`player_ids`、`vehicle_ids`、`team_ids`。
- `stats`、`matches`／`results` 摘要與 `source_refs`。

前端只從 manifest discovery 讀取 JSON，不硬編 per-event JSON 路徑。

## 5. 實作順序

### E0｜連結安全

1. 移除或隱藏目前指向不存在 `../Events/` 的玩家／車輛按鈕。
2. 在 reverse index 尚未產生前，不輸出 entity activity CTA。
3. 新增本地 link check，禁止 `play/RacingClub/Events/` 死路重新出現。

完成條件：活動相關可見連結沒有 404。

### E1｜活動清單

1. 將 `events.html` 換成標準 Time Attack data shell，設定 `data-view="events"`。
2. 由 `manifest.routes.events` 載入 `events.json`。
3. 活動卡顯示狀態、日期、賽制、資料完整度與主要統計。
4. 卡片連到 `event.html?id=<event_id>`。
5. 狀態排序固定為 ongoing、upcoming、completed、archived；同組依日期排序。

完成條件：目前 5 場活動皆可從清單辨識、排序並進入 detail。

### E2｜活動詳情

1. 新增 `event.html`，沿用共同 header、local nav、sidebar 與語言切換。
2. 新增 `renderEventDetail` 與 event detail switcher。
3. 顯示活動摘要、時間／時區、主辦、世界／路線、賽制、資料來源與完整度。
4. 有 matches／results 才顯示對戰或名次；無資料時明示「尚未綁定」，不顯示 0 成績假象。
5. 無效 `id` 回到 `events.html` 並顯示 not-found state。

完成條件：直接開啟、切換、返回與無效 ID 均有可預期行為。

### E3｜反向連結

1. publisher 由 canonical event／match／entry／result 關係產生 player、vehicle、track、team reverse indexes。
2. 玩家、車輛、賽道與車隊 detail 只有在存在關聯時才顯示活動 CTA。
3. CTA 先連到 `events.html?<entity>=<id>`；若需要獨立聚合頁，再另立 contract，不恢復舊平行頁面。

完成條件：每個 CTA 都能找到至少一筆對應活動，且雙向 ID 一致。

### E4｜發布與可發現性

1. 移除 `events.html` 的 `noindex`；新增 `event.html` 到 sitemap 與搜尋索引。
2. 更新 `site-index.json`、`search-index.json`、`llm-index.json`、`llms.txt` 與 `sitemap.xml`。
3. 確認 Racing Club hub、Time Attack nav、活動清單與詳情形成完整閉環。

## 6. 預計修改範圍

- `play/RacingClub/TimeAttack/events.html`
- `play/RacingClub/TimeAttack/event.html`（新增）
- `play/RacingClub/TimeAttack/timeattack.js`
- `play/RacingClub/TimeAttack/timeattack.css`
- `play/RacingClub/TimeAttack/data/manifest.json`
- publisher／adapter 的 event projection（位置確認後再列入實作 brief）
- 站內 index 與 sitemap 生成產物

## 7. 驗證矩陣

- JSON schema／required field check。
- 5 張活動卡與 5 個 detail route smoke check。
- 無效 event ID、缺日期、缺 result、空 reverse index 等 fallback。
- 所有本地 `href` 與動態 route target 存在。
- 玩家／車輛／賽道／車隊 ID 可雙向解析。
- 2026-07-18、19 活動狀態依日期或 canonical status 正確呈現。
- 中文 UTF-8 重讀、`node --check`、`git diff --check`。

## 8. Approval gates

- E0～E2 純前端與 derived JSON contract 可在 StarRiverSite 範圍內進行。
- 若要寫入 `ta_data.sqlite`、補活動關聯或修正 canonical status，必須先備份、dry-run 並取得 governed-data write 批准。
- 不需要外部安裝、連網、公開服務或恢復已下架 Events 子站。

## 9. 下一個可執行 milestone

下一步是 **E3 reverse index**：先確認 canonical event／match／entry／result 關聯，再為 player、vehicle、track、team 產生有資料才顯示的活動 CTA。不得由顯示名稱或排行榜推測參賽關係。
