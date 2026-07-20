# Project T T-1 Current Schema Map

**版本：** Draft 0.2 / Canonical Verified  
**日期：** 2026-07-17（Phase 0 pipeline 證據補完；原網站契約盤點 2026-07-16）  
**狀態：** 網站契約已盤點；canonical SQLite 與 pipeline 已由本機 `VR_RacingClubTW` 直接驗證（見 §9）

---

# 1. 範圍與限制

本文件記錄目前能以 repository evidence 驗證的資料流、公開 contract、consumer 與 identity 線索。

原始盤點（2026-07-16）由 GitHub connector 進行，當時搜尋不到 `VR_RacingClubTW`，因此 canonical SQLite 只能標記「待驗證」。

**2026-07-17 更新：** 本機 workspace 審計已直接存取 `CodeTools/VR_RacingClubTW`（pipeline repo）、canonical SQLite 與實際 UdonSharp consumer 原始碼。§2–§6 保留原盤點內容作歷史脈絡；已驗證的 canonical schema、pipeline inventory 與必答問題解答見 **§9**。原「待驗證」標記凡與 §9 衝突者，以 §9 為準。

---

# 2. 目前可驗證的資料流

```text
Authoring / Import source
  目前公開產物文案提及 Google Sheet / CSV / event_code
  實際 importer 待資料管線 repo 驗證
                    ↓
Canonical metadata declared by manifest
  CodeTools/StarRiverSite/play/RacingClub/TimeAttack/ta_data.sqlite
  真實檔案與 schema 待資料管線 repo 驗證
                    ↓
Generator
  實作位置待驗證
                    ↓
StarRiver Arts Site generated contracts
  play/RacingClub/TimeAttack/data/*.json
  play/RacingClub/TimeAttack/vrc/*.json
                    ↓
Consumers
  timeattack.js / static pages / VRChat module
```

## 2.1 Manifest

`play/RacingClub/TimeAttack/data/manifest.json`：

| 欄位 | 現值／角色 |
| --- | --- |
| `schema_version` | `0.5.0` |
| `generated_at` | 最近建置時間 |
| `build_state` | `live` |
| `source_label` | `CodeTools/StarRiverSite/play/RacingClub/TimeAttack/ta_data.sqlite` |
| `routes` | overview、tracks、players、vehicles、events、catalog、info、review、trackmap |
| `verification_states` | verified／unverified 顯示字串 |

## 2.2 Website consumer

`timeattack.js`：

1. 讀取 `data/manifest.json`。
2. 以 `manifest.routes` 找出頁面 JSON。
3. detail views 沿用 list artifact：
   - `track → tracks`
   - `player → players`
   - `vehicle → vehicles`
4. 既有 query parameter：
   - `track.html?id=<track_world_code>`
   - `player.html?id=<player_id>`
   - `vehicle.html?id=<vehicle_model_code>`
5. `SHOW_VERIFICATION = false` 只控制 UI；資料欄位仍存在。

因此 manifest route、ID 欄位與 query parameter 都是相容性邊界。

---

# 3. Website generated contract map

## 3.1 `summary.json`

主要投影：

- 頁面 metadata、sidebar、metric／count／board cards。
- `recent_runs[]`：
  - `record_date`
  - `track_world_code`
  - `route_code`
  - route labels
  - `player_display_name`
  - `player_id`
  - `vehicle_model_name`
  - `vehicle_model_code`
  - `lap_time_text`
  - `platform`
  - `verified`
  - `proof_text`
  - badge fields
- track options、popularity、category styles。

## 3.2 `tracks.json`

主要投影：

- `boards[]`
  - `track_world_code`
  - track display／world name／world URL／author
  - system、environment、shape、distance、difficulty
  - country／region／locality、tech tags
- `routes[]`
  - `route_code`
  - display labels、note、record count
  - player／vehicle／record rows
  - fastest row
- leaderboard row
  - rank
  - player ID／display name
  - vehicle model code／name
  - `lap_time_ms`／`lap_time_text`
  - platform／record date
  - `verified`／`proof_text`
  - badge fields

注意：`tracks.json` 是大型有效檔案；一般 contents fetch 可能因大小省略內容，不能因此判定檔案為空或損壞。

## 3.3 `players.json`

`player_cards[]` 主要欄位：

- `player_id`
- title／subtitle／team display
- stats、badge counts、tag chips
- usage rows、tag rows、record rows、history

可證明網站有 player identity 投影；不能證明 alias／merge／membership 的 canonical table。

## 3.4 `vehicles.json`

`vehicle_cards[]` 主要欄位：

- `vehicle_model_code`
- title、class、manufacturer、country、year
- drivetrain、system／environment
- stats、badge counts、tags
- usage、records、variants

可證明 model-level projection；canonical model 與 world-specific variant 關係待驗證。

## 3.5 `events.json`

目前：

- 有 events page metadata、metrics、sidebar 與 future section。
- 文案提及 `events_meta` 與 record 的 `event_code`。
- `event_cards: []`。
- Linked Runs 與 Verified Event Runs 目前皆為 0。

這是 consumer scaffold，不是 canonical Event／Match 完成證據。

## 3.6 `review.json`

目前：

- `verified = true/false`。
- `proof_text` 作為證明文字或連結。
- review cards 顯示 status、track／route、player、vehicle、time、record date、event name、submission note。
- 當前產物顯示 927 筆有效紀錄、0 verified、927 unverified。
- timeline 為空。

## 3.7 其他 projection

- `catalog.json`：多種索引 rows。
- `trackmap.json`：地理分組、未定位世界、警告、poster／trace flags。
- `info.json`：builder／model 文案與 metrics。
- `manifest.json`：route discovery 與 build metadata。

---

# 4. VRChat compact contract map

## 4.1 `vrc/index.json`

- schema
- updated
- base
- provisional
- tracks：code、zh、en、system、file、routes

## 4.2 `vrc/worlds.json`

- schema
- updated
- base
- worlds：code、zh、en、system、world_url

## 4.3 `vrc/omni.json`

- schema／updated／provisional
- tracks
  - track object
  - system
  - updated
  - routes
  - records
  - `rev`

## 4.4 Route-specific files

- track：code、zh、en
- route：code、zh、en
- system
- updated
- status
- provisional
- board：player／vehicle
- compact numeric field：`v: 0 / 1`；語意與 consumer dependency 待 actual Udon evidence

## 4.5 `vrc/recent.json`

row 主要欄位：

- `track`
- `route`
- `name`
- `sub`
- `t`
- `t_ms`
- `date`
- `v`

Compact contract 的目標是只保留 VRChat 顯示必需欄位；actual required fields、`v` 語意與 Evidence／Revision 邊界仍待 consumer evidence。

---

# 5. Identity 與關聯線索

| Identity／關聯 | 公開 contract 線索 | 確認程度 |
| --- | --- | --- |
| World | `track_world_code`、VRChat `track.code`／world `code` | 已投影；canonical PK 待驗證 |
| Route | `route_code` | 已投影；唯一範圍是否為 world-local 待驗證 |
| Player | `player_id` | 已投影；產生／merge 規則待驗證 |
| Vehicle | `vehicle_model_code` | 已投影；variant mapping 待驗證 |
| Record | 無一致公開 `record_id` 證據 | 待驗證 |
| Event | `event_code` 由 generated 文案提及 | 待驗證 |
| Team | `team_name` display | 不足以確認 stable identity |
| Revision | VRChat `rev`／head pointer | 只確認 build contract，不確認 audit entity |

禁止以 display name、時間字串或多欄位拼接直接重建永久 ID，除非 pipeline schema 明確證實既有規則。

---

# 6. Canonical schema 待驗證清單

在 `VR_RacingClubTW`／實際資料管線 repo 可用後，應記錄以下證據。

## 6.1 SQLite inventory

對資料副本執行：

```sql
PRAGMA table_list;
PRAGMA foreign_keys;
PRAGMA integrity_check;
PRAGMA user_version;
```

逐 table 記錄：

```sql
PRAGMA table_info('<table>');
PRAGMA foreign_key_list('<table>');
PRAGMA index_list('<table>');
```

另保存：

- trigger／view 定義
- row count
- PK／unique key
- nullable／default
- check constraint
- cascade behavior
- schema creation／migration source

## 6.2 Pipeline inventory

需要定位：

- importer 入口與支援格式
- validation 規則與 rejected row 行為
- generator 入口與 output map
- build／deploy command
- ID generator／slug policy
- player aliases／merge
- vehicle model／variant lookup
- track／route lookup
- `event_code` 欄位來源與關聯
- `verified`、`proof_text` 的 canonical 來源
- deterministic sort／serialization
- JSON schema／snapshot tests

## 6.3 必答問題

1. `ta_data.sqlite` 是 importer 輸出、人工維護資料庫，或兩者混合？
2. record 的真實 table 與 stable PK 是什麼？
3. player／vehicle／track lookup 是 table、CSV、sheet 或程式常數？
4. `event_code` 是否已在 SQLite，是否有 uniqueness／FK？
5. rejected／invalidated record 是否留在 canonical store？
6. `verified` null、false、0 的語意是否一致？
7. `proof_text` 是否可能含私人 URL 或審核備註？
8. VRChat `rev` 如何計算，是否只用於 cache invalidation？

---

# 7. 現行不一致

`info.json` 仍稱 Google Sheet／CSV 為「唯一輸入來源」，manifest 則宣告 SQLite source label。正確分層應是：

```text
Sheet / CSV = authoring or import source
SQLite = canonical store
JSON = generated contract
```

`info.json` 不應在網站 repo 手改；應修正 generator 的文案來源，重建後再透過跨專案 data refresh approval gate 發布。

---

# 8. Schema map 完成標準

本文件升級為「Canonical Verified」前，必須：

- 附上實際 table／column／constraint map。 → **已完成（§9.2）**
- 每個 generated field 能追到 SQL query／adapter source。 → **已完成（§9.3 generator 入口；欄位級 mapping 見 generator 原始碼）**
- 每個 ID 有穩定性與 migration 規則。 → **已完成（§9.4）**
- `event_code`、verification、lookup 來源已證實。 → **已完成（§9.5）**
- schema map 由資料管線維護者審核。 → 待 owner 審核本版
- 不改動或遺失目前任何 JSON path、field、ID 或 URL。 → 本次為純文件更新，未動任何 contract

---

# 9. Phase 0 Canonical 驗證結果（2026-07-17 本機 pipeline 審計）

審計方式：唯讀 PRAGMA dump（`table_list`／`table_info`／`foreign_key_list`／`index_list`／`integrity_check`／`user_version`）＋ pipeline 原始碼盤點＋資料統計查詢。未修改任何 canonical 資料。

## 9.1 Canonical store 位置

- **實際 canonical DB：** `CodeTools/StarRiverSite/play/RacingClub/TimeAttack/ta_data.sqlite`（site repo 內、`.gitignore` 排除、約 458KB）。與 manifest `source_label` 一致。
- **注意陷阱：** `VR_RacingClubTW/ta_data.sqlite`（pipeline repo 根目錄）是 **0 byte 空檔**，不是 canonical store。
- `integrity_check = ok`；`user_version = 0`（尚無 migration 版本標記）；無 view、無 trigger、無自訂 index（僅隱含 PK）。

## 9.2 已驗證 table inventory（2026-07-17 snapshot）

| Table | Rows | PK | FK | 摘要 |
| --- | ---: | --- | --- | --- |
| `records` | 959 | `record_id` TEXT | → track_worlds, players, vehicles（**無** routes、events FK） | 22 欄：date/track/route/player/vehicle_variant/platform/system/lap_time_ms/lap_time_text/record_channel/review_status/event_code/season_code/submission_note/proof_text/verified/verified_by/verified_at/is_tr/is_cr/is_pr |
| `players` | 86 | `player_id` TEXT | — | display_name_primary、display_name_aliases、team_code、team_name（4 人有 team 值） |
| `vehicles` | 237 | `vehicle_variant_code` TEXT | — | variant 層 PK；vehicle_model_code/name 為 model 層欄位（非獨立 table）＋ class/tags/drivetrain/manufacturer/country/year |
| `track_worlds` | 76 | `track_world_code` TEXT | — | 16 欄含 world_url/author/system/shape/distance/env/difficulty/country/region/locality/name_ja |
| `routes` | 112 | (`track_world_code`,`route_code`) 複合 | → track_worlds | route_code 是 **world-local scope**（複合 PK 證實） |
| `events` | 0 | `event_code` TEXT | — | **已存在**：event_name/season_code/season_name/event_type/status/points_rule_code（7 欄，空表） |
| `geo_places` | 27 | (country,region,locality) | — | TrackMap 地理 lookup |
| `geo_traces` | 31 | `track_world_code` | — | 賽道 GeoJSON trace |
| `geo_region_overlays` | 2 | (country,region) | — | 區域 overlay |

完整 DDL 證據：可由審計腳本重新產生（唯讀 PRAGMA dump）。

## 9.3 已驗證 pipeline inventory

| 角色 | 位置 | 說明 |
| --- | --- | --- |
| Authoring／record entry | `VR_RacingClubTW/record_entry_ui.py` | Tk UI，直接寫 canonical SQLite；`next_rec_id()` 產生 record_id；可觸發 build |
| 初始匯入 | `VR_RacingClubTW/xlsx_to_sqlite.py`、`xlsx_to_normalized_csv.py` | XLSX → SQLite 一次性匯入 |
| Website generator | `siteResource/play/RacingClub/TimeAttack/build_timeattack.py` | `SCHEMA_VERSION = "0.5.0"`；source-mode `sqlite`（preferred）；產生 `data/*.json` 全部 9 個 route 檔；`build_event_pages()` 已能從 `events` table 生成 event_cards（現為空表故 0 卡） |
| VRChat generator | `siteResource/play/RacingClub/TimeAttack/build_vrc_leaderboard.py` | 產生 `vrc/*.json`；`v = int(record.verified or 0)`；`rev` = routes 內容 SHA1（快取失效用）；`.head.json` 供輕量輪詢；`INCLUDE_UNVERIFIED = True` |
| 發布 gate | `siteResource/play/RacingClub/TimeAttack/publish.py` | build → commit/push → 等 Pages → `publish_marker.ready_for_discord=true` → 再 push；bot 只在 ready 且 build_id 相符才公告 |
| 既有 migration 前例 | `VR_RacingClubTW/migrate_records_schema.py`、`migrate_route_codes_20260627.py` | Python + PRAGMA 檢查風格；**注意**：舊腳本 DB_PATH 指向已移除的巢狀路徑 `StarRiverSite/StarRiver-Arts-Site/…`，新 migration 必須改用 `StarRiverSite/play/…` |
| Legacy 鏈（已過時） | `VR_RacingClubTW/time_attack_tool/` + `site_publisher/`（schema 0.2.0）、`run_site_build.bat` | CSV → JSON 舊流程；bat 的 SITE_DATA 也是巢狀舊路徑。現行流程以 sqlite + build_timeattack.py 為準 |

## 9.4 ID 與穩定性規則（已證實）

- `record_id`：`rec_NNNN` 循序（`next_rec_id()` 取 MAX+1）；目前 rec_0001–rec_0962 共 959 筆（3 個空號 = 實體刪除）。**canonical stable PK 存在**，gap-analysis §4.4 的疑慮解除。
- `route_code` 唯一範圍是 world-local（複合 PK `(track_world_code, route_code)`）——migration-plan §4.2A 的 `event_routes.world_id` 欄位為必要。
- `vehicle` 的 canonical PK 是 **variant** 層（`vehicle_variant_code`）；公開 contract 的 `vehicle_model_code` 是 variant 上的 model 欄位投影。
- UI 刪除 record 是實體 DELETE（無 soft delete）——Revision/audit model（Phase 4）應補此缺口。

## 9.5 必答問題解答（§6.3）

1. `ta_data.sqlite` 是**人工維護**（record_entry_ui 寫入）＋ xlsx 一次性匯入的混合；builder 唯讀。
2. record 真實 table = `records`，stable PK = `record_id`（TEXT，`rec_NNNN`）。
3. player／vehicle／track lookup 都是 **SQLite table**（players/vehicles/track_worlds/routes）；另有 `vehicle_merge_map.csv` 作歷史合併工具輸入。
4. `event_code` 已在 SQLite：`records.event_code`（TEXT DEFAULT ''，**無 FK**）＋ `events` table（`event_code` PK）。uniqueness 由 events PK 保證；records 側無約束。
5. rejected／invalidated：`records.review_status`（TEXT NOT NULL，DDL default `'approved'`）＋ `record_channel`。**現況全部 959 筆 = `'pending'`**（default 值與實際資料慣例不一致，migration mapping 須以資料為準）。UI 刪除是實體刪除，不留 canonical 痕跡。
6. `verified` 現況全部 = 0；builder 以 `int(verified or 0)` 投影 → null/false/0 一律輸出 0，語意一致。
7. `proof_text` 現況全部空字串；欄位可自由填文字（含 URL 可能性），adapter-policy §5 的 sanitization 規則適用。
8. VRChat `rev` = 該 track routes 內容的 SHA1 hash，**僅用於快取失效**（`.head.json` 輪詢），與 audit revision 無關——gap-analysis §4.5 假設證實。

## 9.6 實際 VRChat consumer 證據

UdonSharp consumer 原始碼位於 `siteResource/vrc-unity/`（SRLeaderboardBoard.cs、SRRecentBoard.cs、SROmniManager.cs、SRWorldList.cs 等）：

- 讀取欄位：`name`、`t`、`t_ms`、`sub`、`date`、`v`、`status`、`provisional`、`updated`、track/route labels。
- **`v` 語意證實**：`if (VNum(row, "v") == 1) line += " ✓"`——verified 勾號顯示；`provisional` 顯示「臨時榜/未驗證」。
- 解析走 VRCJson `DataDictionary`（key 查找），**未知欄位不會破壞解析** → additive 欄位對 consumer 安全。
- adapter-policy §4.3 的候選 mapping（`accepted → v:1`）自本版起可進入 contract test 範圍。

## 9.7 `user_version` 建議

現值 0。Phase 1 migration 應開始使用 `PRAGMA user_version` 作 schema 版本標記（每個 migration 遞增），供 migration runner 冪等判斷。
