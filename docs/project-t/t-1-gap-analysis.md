# Project T T-1 資料架構 Gap Analysis

**版本：** Draft 0.1  
**日期：** 2026-07-16  
**範圍：** T-1 產品規格、現行網站 generated contracts、待擴充 canonical model

---

# 1. 文件目的

本文件比較三個層次：

1. `t-1-product-spec.md` 定義的目標實體。
2. StarRiver Arts Site 目前可驗證的 generated JSON 與前端 consumer。
3. `VR_RacingClubTW`／實際資料管線尚待驗證或實作的 canonical schema。

本文件不把公開 JSON 的欄位反推成已確認的 SQLite table。實際資料管線 repo 目前未出現在本次 GitHub connector 可見範圍，因此 SQLite table、foreign key、index、importer 與 generator 檔名一律標記為「待管線 repo 驗證」。

---

# 2. 證據基準

本次可直接驗證：

- `play/RacingClub/TimeAttack/data/manifest.json`
  - `schema_version: 0.5.0`
  - `source_label: CodeTools/StarRiverSite/play/RacingClub/TimeAttack/ta_data.sqlite`
  - 路由至 summary、tracks、players、vehicles、events、catalog、info、review、trackmap。
- `play/RacingClub/TimeAttack/timeattack.js`
  - 先讀 manifest，再依 manifest route 讀 generated JSON。
  - detail 頁使用既有 ID query parameter。
  - `SHOW_VERIFICATION = false` 只隱藏呈現，不移除資料契約。
- `play/RacingClub/TimeAttack/data/*.json`
  - 已有世界／路線、玩家、車輛、計時投影。
  - `events.json` 有頁面骨架與 `event_code` 說明，但目前 `event_cards` 為空。
  - 驗證仍採 `verified` 與 `proof_text`。
- `play/RacingClub/TimeAttack/vrc/*.json`
  - 已有路線別 compact contract。
  - compact 紀錄使用 `v: 0 / 1`。
  - 部分輸出包含 `rev`，但不等同完整 Revision entity。

---

# 3. 實體缺口矩陣

狀態定義：

- **已投影：** 公開 JSON 可直接觀察到主要欄位。
- **部分投影：** 有顯示或彙整欄位，但不足以證明 canonical entity 完整存在。
- **骨架：** 頁面或 contract 已預留，尚無正式資料。
- **未觀察：** 在本次可見契約中沒有可確認對應。
- **待驗證：** 必須進入資料管線 repo／SQLite 才能確認。

| 規格實體 | 現行 SQLite／generator 對應 | 現行 Website JSON | 現行 VRChat JSON | 主要缺口 | 相容性風險 | 優先級 |
| --- | --- | --- | --- | --- | --- | --- |
| World | canonical table 待驗證；generator 已能輸出世界層資料 | `tracks.json` board、`trackmap.json`、`worlds.json` | `worlds.json`、route files 的 `track` | 缺穩定 World entity contract、作者／平台／revision 的一致模型 | 變更 world code 或 URL 會破壞既有連結 | P0 |
| Route | canonical table 待驗證；generator 已能按 route 分榜 | `tracks.json` 的 `routes[]` | route-specific JSON、`index.json`、`omni.json` | 缺獨立 Route detail contract 與明確 version 關係 | route code 是 consumer key，不可重命名 | P0 |
| Player | lookup／canonical table 待驗證 | `players.json`、record row 的 `player_id` | compact 輸出主要保留顯示名稱 | Alias、merge history、隱私與穩定 ID 規則未證實 | display name 不可取代 stable ID | P0 |
| Vehicle | lookup／canonical table 待驗證 | `vehicles.json`、`vehicle_model_code` | compact 輸出保留顯示名／縮寫 | model、variant、system 與世界變體界線需確認 | 合併 vehicle code 會改變歷史統計 | P0 |
| Team | 玩家投影有 `team_name`，canonical entity 待驗證 | 玩家卡片只有部分 team display | 未觀察 | 缺 team ID、membership history、manager、links | 由文字直接升格為 ID 容易誤合併 | P1 |
| Organization | 未觀察；待新增 | 未觀察 | 未觀察 | 主辦方、維護者、社群來源缺正式 identity | event organizer 與 team 不應共用語意 | P1 |
| Event | `event_code` 與 `events_meta` 只由生成文案暗示，待驗證 | `events.json` 骨架，`event_cards: []` | 未觀察 | 缺 event ID、status、type、organizer、time、source、recording mode | 現有空頁不可被誤判為正式 event schema | P0 |
| Match | 未觀察 | 未觀察 | 未觀察 | 缺 event FK、route、participant、status、result | 若直接把 leaderboard row 當 match result，語意會混淆 | P0 |
| Event Entry | 未觀察 | 未觀察 | 未觀察 | 缺 player/team/vehicle snapshot、registration status、seed | 參賽當時名稱與現行 profile 不可混為一談 | P0 |
| Match Result | 未觀察；現有 time rows 僅為計時榜投影 | 無 event match result contract | 無 | 缺 position、outcome、score、points、qualification、finality | 計時紀錄不一定等於活動結果 | P0 |
| Record | canonical table 名稱與 PK 待驗證；generator 已穩定輸出 | track／summary／player／vehicle 多重投影 | route boards、recent、omni | 公開投影未觀察穩定 `record_id`；review 狀態仍為舊模型 | 新 ID 不可改變排序、URL 或 dedup 結果 | P0 |
| Evidence | canonical entity 未觀察 | `proof_text` 扁平摘要；review 文案預留更多欄位 | `v` 只有布林結果 | 缺 evidence ID、type、status、visibility、review metadata | 私密 evidence URL 不可直接公開 | P0 |
| Record Evidence | 未觀察 | 未觀察 | 未觀察 | 缺 record 與多個 evidence 的關聯、排序與角色 | 直接塞入 record 欄位會限制一對多 | P0 |
| Revision | canonical audit model 未觀察 | 未觀察 | 部分檔案有 `rev`／head pointer | 缺 actor、reason、before/after、entity type／ID | build revision 不等於資料修正紀錄 | P1 |

---

# 4. 欄位與語意缺口

## 4.1 SSOT 敘述不一致

`manifest.json` 將來源標示為 `ta_data.sqlite`，但現行 `info.json` 文案仍稱「Google Sheet 或 CSV 匯出作為唯一輸入來源」與「單一輸入表」。這兩者可同時存在於匯入流程，但不能同時被描述為 canonical source。

**處理：**

- 產品規格以 SQLite 為 canonical。
- Sheet／CSV 改稱 authoring/import source。
- `info.json` 是 generated artifact，不在本次文件 PR 手改；待 generator 文案來源修正後重建。

## 4.2 Verification 語意過窄

現況：

```text
verified: boolean
proof_text: string
v: 0 / 1
```

目標：

```text
review_status
evidence[]
verified_by
verified_at
revision
```

布林欄位無法區分 submitted、needs_review、invalidated、removed、superseded。Evidence 也不能只靠一段公開文字保存。

**處理：** canonical 新增狀態與 evidence entity，adapter 繼續產生 legacy 欄位。

## 4.3 Event 目前只有投影骨架

`events.json` 已描述 `event_code` 與 `events_meta`，但沒有 event card。這證明 consumer surface 已預留，不證明 canonical event model 完成。

**處理：** 先盤點 `event_code` 的實際來源、唯一性與 nullable 規則，再建立 Event／Match migration；不得直接從文案猜 table。

## 4.4 缺少穩定 Record ID 的公開證據

目前 record row 能用 track、route、player、vehicle、date、time 組合顯示，但這不是安全的永久 identity。更正、同秒紀錄或來源合併都可能碰撞。

**處理：** 確認 canonical PK；若現況無穩定 ID，以 additive migration 補上，不以顯示欄位重算舊 ID。

## 4.5 Revision 與 build revision 混淆

VRChat contract 中的 `rev` 可用於快取／版本更新，但不能代替「誰在何時因何理由修改哪個 entity」。

**處理：** 保留 `rev` 的 consumer 意義，另建 revisions audit entity。

---

# 5. 風險排序

## P0｜進入任何資料 migration 前

- 取得實際 SQLite schema：tables、columns、PK、FK、indexes、triggers。
- 定位 importer、generator 與 lookup 檔。
- 確認 record stable ID、event_code、verified、proof_text 的來源與 null semantics。
- 建立現行 Website JSON 與 VRChat JSON 的 contract fixture／snapshot。
- 禁止手改 generated JSON 作為 migration 方式。

## P1｜Event／Evidence 第一階段

- 新增 organizations、events、matches、event_entries、match_results。
- 新增 evidence、record_evidence、revisions。
- 建立 adapter dual output，保留 legacy 欄位。
- 修正 generator 的公開資料流文案。

## P2｜T-1 完整頁面前

- Team canonical entity 與 membership history。
- Event／Match detail JSON contract。
- Player／Team／World 反向索引。
- Search／Index 對新實體的 deterministic build。
- PostgreSQL portability review。

---

# 6. 不在本次變更內

- 不修改 `ta_data.sqlite`。
- 不刷新 `data/*.json` 或 `vrc/*.json`。
- 不重新命名資料夾、ID、URL、query parameter 或 manifest route。
- 不推測或宣稱尚未看見的 SQLite table 已存在。
- 不把 Event 頁面骨架視為已完成活動系統。

---

# 7. 完成條件

Gap 關閉至少需要：

- canonical schema map 由實際 pipeline repo 證據補完。
- migration 在資料副本通過前後 row count、FK、legacy output snapshot 測試。
- Website JSON 與 VRChat compact JSON 都由同一 canonical snapshot 生成。
- 所有既有 consumer 在新增欄位後仍可運作。
- 新 verification model 可完整回推出 `verified`、`proof_text` 與 `v`。
