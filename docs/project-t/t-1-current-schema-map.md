# Project T T-1 Current Schema Map

**版本：** Draft 0.1 / Evidence Scoped  
**日期：** 2026-07-16  
**狀態：** 網站契約已盤點；canonical SQLite 待資料管線 repo 驗證

---

# 1. 範圍與限制

本文件記錄目前能以 repository evidence 驗證的資料流、公開 contract、consumer 與 identity 線索。

本次 GitHub connector 可存取 `StarRiverArts/StarRiver-Arts-Site`，但搜尋不到 `VR_RacingClubTW` 或實際資料管線 repo。因此：

- 可確認 generated JSON 的實際欄位與前端依賴。
- 可確認 manifest 宣告的 SQLite source label。
- **不可確認** SQLite 的真實 table／column／constraint、generator／importer 檔名或執行入口。
- 下列「canonical 候選」只用來指引盤點，不是已確認 schema。

這個限制很重要：projection 不足以安全反推 canonical database。

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

- 附上實際 table／column／constraint map。
- 每個 generated field 能追到 SQL query／adapter source。
- 每個 ID 有穩定性與 migration 規則。
- `event_code`、verification、lookup 來源已證實。
- schema map 由資料管線維護者審核。
- 不改動或遺失目前任何 JSON path、field、ID 或 URL。
