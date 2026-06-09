# RacingClub 網站格局調整規劃 + Phase 0 落地

> 本文承接 [規劃.md](./規劃.md)。目標:把 `play/RacingClub` 的站台格局,對齊
> (1) 設計系統參照 `downloads_Museum/VR Gallery Spatial System`、
> (2) ProjectT 賽車俱樂部規劃書、
> (3) 已改好欄位的 `VR_RacingClubTW` 資料庫。
>
> 兩個已定方向:
> - **元件策略:沿用現站 `ta-*` 殼**(保留 timeattack.css,不整套搬設計系統元件,只在新詳情頁套既有樣式)。
> - **本輪交付:規劃 + 直接做 Phase 0**(資料語彙對齊)。

---

## 1. 三層現狀

| 層 | 位置 | 狀態 |
|---|---|---|
| 資料層 | `VR_RacingClubTW/` + `TimeAttack/ta_data.sqlite` | DB 已加新欄位 `verified` / `proof_text` / `is_tr` / `is_cr` / `is_pr` / `verified_by` / `verified_at`;**舊欄位 `record_channel` / `review_status` 仍physically保留**。699 筆全部 `verified=0`、`review_status=pending`。`record_manager_v2.py` 改到一半、暫停。 |
| 已發佈站 | `play/RacingClub/TimeAttack/` | JSON 餵養多頁殼:index / tracks / players / vehicles / events / review / catalog / info。真實資料:699 紀錄 / 53 賽道世界 / 77 玩家 / 150 車型。Builder = `build_timeattack.py`。 |
| 設計系統參照 | `downloads_Museum/VR Gallery Spatial System/` | 已有成熟賽車頁:`Time Attack.html`(單賽道計時塔)、`Driver Records.html`(車手頁)、`Events.html`,元件 `.board/.tbl/.bdg/.seg/.active-strip/.theme-toggle`。 |

---

## 2. 三方比對:差距

### 2.1 頁面格局:聚合頁 vs 清單→詳情(最大差距)
規劃書要的是「清單頁 → 單一實體詳情頁」,現站是「一類一聚合頁」。

| 實體 | 規劃書 | 現站 | 缺口 |
|---|---|---|---|
| 賽道 | `tracks` 清單 + `track/:id/:route` 單榜 | 一頁 `tracks`(53 board 全塞) | **缺單賽道詳情頁** |
| 玩家 | `players` 清單 + `player/:id` | 一頁 `players`(全卡片) | **缺個人詳情頁** |
| 車輛 | `vehicles` 清單 + `vehicle/:id` | 一頁 `vehicles`(全卡片) | **缺車輛詳情頁** |
| 賽事 | `events` + `matches` 分離 | 只有 `events` | **缺 matches** |

### 2.2 資料語彙不同步(本輪要修)
DB 已改成 `verified` / `proof_text`,但 builder→JSON→前端三段仍只講舊語彙
(`record_channel=approved_record`、`review_status=approved`、「Approved Record / Normal Time Attack」)。
這是會造成顯示與資料模型脫節的硬傷,**Phase 0 處理**。

### 2.3 TR/CR/PR(已正確)
Builder 自己用 `build_route_badge_index` 計算 TR/CR/PR 徽章,優先級 TR>CR>PR,前端 `renderRecordBadge` 顯示。
DB 的 `is_tr/cr/pr` 欄位目前全 0、未被使用 — builder 計算為準,DB 欄位視為未來回寫用,本階段不依賴。

---

## 3. 分階段格局計畫

### Phase 0 — 資料語彙對齊(本輪執行)
讓 builder / JSON / 前端用 `verified` + `proof_text` 取代 `record_channel`/`review_status` 的對外語彙。
詳見 §4。

### Phase 1 — 補詳情頁,格局改成清單→詳情(沿用 ta-* 殼)
- ✅ `tracks.html`(清單)→ 已新增 `track.html?id=&route=` 單賽道榜,套既有 `ta-*` 表格 + 三模式切換(賽道榜/車輛榜/玩家榜)+ 平台篩選 + TR/CR/PR。
  - tracks.html 由「全 53 board dump」改成**清單**:每個賽道世界一張卡,列出路線 pill,連到 `track.html?id=&route=`。
  - track.html 共用 `tracks.json`(無需 builder 改動),用 `?id` 過濾單一賽道、`?route` 聚焦單條路線;router 以 `view==="track"` 接 `tracks.json`,nav 沿用 Tracks。
- ✅ `players.html`(清單)→ 已新增 `player.html?id=`(完整個人檔案卡:個人最佳路線 + 常用車輛 + TR/CR/PR + 歷程)。共用 `players.json`,router `view==="player"`,nav 沿用 Players,清單卡片用共用 `renderProfileListCard`。
- ✅ `vehicles.html`(清單)→ 已新增 `vehicle.html?id=`(車型檔案卡:車型最佳路線 + 世界變體 + 常見車手 + CR/TR + 歷程)。共用 `vehicles.json`,router `view==="vehicle"`,nav 沿用 Vehicles,主鍵 `vehicle_model_code`。
- 之後若資料量大可再讓 builder 輸出 per-entity JSON;目前共用既有彙整 JSON 即可。

> **Phase 1 完成**:track / player / vehicle 三組「清單→詳情」全部上線,共用 `renderProfileListCard` 與 `*_PROFILE_CONFIG`,router 用 `DETAIL_DATA_KEY` 對照表收斂。11 個 view 全數 render 通過無 throw。剩 Event/Match 為 Phase 2。

### Phase 2 — 賽事架構與第二階段
- `events`(容器)/ 新增 `matches`(單場對戰),Event/Match 分離(規劃書 §19–25)。
- 預留 `teams` / `seasons` / `map`(地區階層索引)。

### 貫穿原則(規劃書 §30–31)
- 平台 `platform` 高優先顯示,不藏在備註。
- TR/CR/PR 為 builder 預算好的榮耀標籤,前端只顯示。
- 所有進階分析標樣本數,樣本不足顯示「資料不足」。

---

## 4. Phase 0 具體規格(本輪改動)

### 4.1 資料模型對齊
- 每筆 record 由 sqlite 載入時,新增公開欄位:
  - `verified`(bool)← DB `verified`
  - `proof_text`(str)← DB `proof_text`
- 公開語彙改為「有效紀錄 / 已驗證 / 未驗證」:
  - 有效池 `is_general_pool` = 未被拒絕(維持,目前=全部)→ 驅動所有排行榜。
  - `is_approved_board` 重新定義為 `verified`(保留鍵名,換語意 → 影響 Official→Verified 計數)。
  - `is_normal_board` 重新定義為「有效且未驗證」。
  - `channel_label_*` → 「已驗證 / 未驗證」(Verified / Unverified)。

### 4.2 各頁文案/卡片改寫
- **summary / overview**:描述、sidebar、board_cards 改講 verified 模型 + proof。
- **count_cards / metric_cards**:總輸入 / 有效紀錄 / 已驗證 / 未驗證 / 賽道世界 / 車輛母型。
- **player / vehicle stats**:「正式紀錄 Official Runs」→「已驗證 Verified Runs」。
- **events**:「正式提交」改以 `verified` 計。
- **review.html → 驗證頁**:metric 改有效/已驗證/未驗證;清單列未驗證紀錄並顯示 `proof_text`;timeline 列最近已驗證。
- **build_badged_row** 輸出加 `verified` + `proof_text`(供前端列顯示驗證標記)。
- **manifest** `channels` → 驗證狀態;`SCHEMA_VERSION` → 0.5.0。

### 4.3 前端(timeattack.js)
- 排行榜列(active row renderer, ~L385)在 `row.verified` 為真時顯示「已驗證 ✓」小標,`proof_text` 作 title。
- 既有 dead board 區塊(L575–608,引用 builder 已不輸出的 `approved_fastest`/`normal_fastest`)本輪不啟用、保留待 Phase 1 清理。

### 4.4 驗收
- `python build_timeattack.py` 重建成功。
- `summary.json` 不再出現 `record_channel=approved_record` / `review_status` 對外字串;出現「已驗證/未驗證」。
- 排行榜資料量不變(53 board、699 有效),TR/CR/PR 徽章維持。

---

## 5. 本輪不動(明確邊界)
- 不修 `record_manager_v2.py`(改到一半、另案處理)。
- 不丟棄 DB 舊欄位 `record_channel`/`review_status`(physically保留,只改對外語彙)。
- 不整套搬設計系統元件(沿用 ta-* 殼)。
- 不新增詳情頁(Phase 1)。
