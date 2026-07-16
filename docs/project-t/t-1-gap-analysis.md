# Project T T-1 資料架構 Gap Analysis

**版本：** Draft 0.2 / Product Goal Aligned  
**日期：** 2026-07-16  
**範圍：** T-1 產品目標、使用者旅程、現行網站 generated contracts、待擴充 canonical model

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
| Submission／Receipt | 未觀察；canonical 位置待 Phase 0 證據 | 無投稿收件／狀態 contract | 不適用 | 缺 opaque receipt、status、private contact、idempotency、withdrawal 與 accepted Record relation | token 或私密欄位若進 public JSON 會造成隱私風險 | P0 |
| World | canonical table 待驗證；generator 已能輸出世界層資料 | `tracks.json` board、`trackmap.json`、`worlds.json` | `worlds.json`、route files 的 `track` | 缺穩定 World entity contract、作者／平台／revision 的一致模型 | 變更 world code 或 URL 會破壞既有連結 | P0 |
| Route | canonical table 待驗證；generator 已能按 route 分榜 | `tracks.json` 的 `routes[]` | route-specific JSON、`index.json`、`omni.json` | 缺獨立 Route detail contract 與明確 version 關係 | route code 是 consumer key，不可重命名 | P0 |
| Player | lookup／canonical table 待驗證 | `players.json`、record row 的 `player_id` | compact 輸出主要保留顯示名稱 | Alias、merge history、隱私與穩定 ID 規則未證實 | display name 不可取代 stable ID | P0 |
| Vehicle | lookup／canonical table 待驗證 | `vehicles.json`、`vehicle_model_code` | compact 輸出保留顯示名／縮寫 | model、variant、system 與世界變體界線需確認 | 合併 vehicle code 會改變歷史統計 | P0 |
| Team | 玩家投影有 `team_name`，canonical entity 待驗證 | 玩家卡片只有部分 team display | 未觀察 | 缺 team ID、membership history、manager、links | 由文字直接升格為 ID 容易誤合併 | P2 |
| Organization | 未觀察；待新增 | 未觀察 | 未觀察 | 主辦方、維護者、社群來源缺正式 identity | event organizer 與 team 不應共用語意 | P1 |
| Event | `event_code` 與 `events_meta` 只由生成文案暗示，待驗證 | `events.json` 骨架，`event_cards: []` | 未觀察 | 缺 event ID、status、type、organizer、time、source、recording mode | 現有空頁不可被誤判為正式 event schema | P1 |
| Match | 未觀察 | 未觀察 | 未觀察 | 缺 event FK、route、participant、status、result | 若直接把 leaderboard row 當 match result，語意會混淆 | P1 |
| Event Entry | 未觀察 | 未觀察 | 未觀察 | 缺 player/team/vehicle snapshot、registration status、seed | 參賽當時名稱與現行 profile 不可混為一談 | P1 |
| Match Result | 未觀察；現有 time rows 僅為計時榜投影 | 無 event match result contract | 無 | 缺 position、outcome、score、points、qualification、finality | 計時紀錄不一定等於活動結果 | P1 |
| Record | canonical table 名稱與 PK 待驗證；generator 已穩定輸出 | track／summary／player／vehicle 多重投影 | route boards、recent、omni | 公開投影未觀察穩定 `record_id`；review 狀態仍為舊模型 | 新 ID 不可改變排序、URL 或 dedup 結果 | P0 |
| Evidence | canonical entity 未觀察 | `proof_text` 扁平摘要；review 文案預留更多欄位 | 觀察到 numeric `v: 0 / 1`；語意待 Udon／pipeline 證據 | thin slice 缺最小 evidence attachment；完整 type、visibility、review metadata 後移 | 私密 evidence URL 不可直接公開 | P0 minimal／P1 advanced |
| Record Evidence | 未觀察 | 未觀察 | 未觀察 | 缺 record 與多個 evidence 的關聯、排序與角色 | 直接塞入 record 欄位會限制一對多 | P1 |
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
v: 0 / 1  # producer observation; semantics pending
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

## 4.6 Submission／Receipt、狀態與隱私缺口

現行公開 contract 沒有可驗證的投稿收件與狀態模型。Record 的 `review_status` 不能同時代表「使用者是否已成功送出」與「正式紀錄是否有效」。

最小目標必須分開：

```text
Submission status:
received → queued → needs_information / accepted / rejected / withdrawn

Record review status:
submitted → accepted / needs_review / invalidated / removed / superseded
```

**必須補齊：**

- 不可預測的 receipt token，不由 player ID、聯絡方式或內容推導。
- public status allowlist；private contact、private Evidence URL、internal note 不得投影。
- accepted submission → canonical Record 的明確關聯。
- duplicate／idempotency、withdrawal、token loss、retention 與 deletion 規則。
- 無登入情境下的最小查詢安全性與 rate／abuse control。
- status 更新與 canonical write 的 transaction／recovery 行為。

欄位與 table 最終位置仍待 pipeline evidence，不在文件中假定現有 SQLite 已支援。

---

# 5. 風險排序

## P0A｜Production 變更前的 Evidence Gate

- 取得實際 SQLite schema：tables、columns、PK、FK、indexes、triggers、row counts。
- 定位 importer、generator、validator、transaction boundary 與 lookup。
- 確認 stable ID、alias、dedupe、`event_code`、`verified`、`proof_text` 的來源。
- 取得 actual Udon consumer 對 `v`、null、size、cache、offline 與 schema mismatch 的直接證據。
- 建立 Website／VRChat contract fixtures。
- 明確判定 ready／conditionally ready／blocked；conditionally ready 必須有 blocking condition、owner、due date，且禁止 production SQL。

## P0B｜第一個 Thin Vertical Slice

- 單一路線 Submission／Receipt／Status contract。
- private contact、Evidence 與 internal note 的 public exclusion。
- 最小 review 與 accepted submission → Record。
- canonical snapshot → Website leaderboard。
- 同一路線既有 VRChat output preservation 與實際顯示驗證。
- 世界作者接入文件與非核心測試。
- 玩家、維護者、世界作者端到端 journey test。

## P1｜Thin slice 穩定後

- 多路線 submission、correction、withdrawal、retention 與完整 Review／Revision。
- Event／Match／Entry／Result。
- advanced Evidence entity／relationships。
- Event detail 與反向索引。
- generator 公開資料流文案修正。

## P2｜T-1 完整頁面前

- Team canonical entity 與 membership history。
- Search／Index 與統計。
- 世界／路線 metadata 正規化與大規模作者接入。
- PostgreSQL portability review。

---

# 6. 不在本次變更內

- 不修改 `ta_data.sqlite`。
- 不刷新 `data/*.json` 或 `vrc/*.json`。
- 不重新命名資料夾、ID、URL、query parameter 或 manifest route。
- 不推測或宣稱尚未看見的 SQLite table 已存在。
- 不把 Event 頁面骨架視為已完成活動系統。
- 不宣稱 compact `v` 一定代表 verification。
- 不把 docs-only goal alignment 當成 Phase 0 evidence 完成。

---

# 7. 完成條件

Gap 關閉至少需要：

- canonical schema map 由實際 pipeline repo 證據補完。
- migration 在資料副本通過前後 row count、FK、legacy output snapshot 測試。
- 玩家能完成投稿 → receipt／status → 最小審核 → accepted Record → 網站榜單。
- 世界作者能依文件把同一路線榜單接入實際 VRChat consumer。
- private contact、private Evidence 與 internal note 未進任何 public output。
- Website JSON 與 VRChat compact JSON 都由同一 canonical snapshot 生成。
- 所有既有 consumer 在新增欄位後仍可運作。
- 新 verification model 可完整回推出 `verified` 與 `proof_text`；`v` 只有在 pipeline／Udon evidence 證實語意後才納入 mapping。
