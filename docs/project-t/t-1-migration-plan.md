# Project T T-1 Non-Destructive Migration Plan

**版本：** Draft 0.1 / Proposal Only  
**日期：** 2026-07-16  
**執行狀態：** 未執行；須先完成 canonical schema inventory

---

# 1. 目的

本文件提出 T-1 canonical database 的 additive migration，支援 Event、Match、Evidence 與 Revision，同時保留現行 record、lookup、generated JSON 與 consumer contract。

本文件不是可直接執行的 SQL migration。因實際 SQLite schema 尚未取得，下列 table／column 名稱是候選設計；在確認既有 PK、型別與命名後，必須轉成資料管線 repo 內的正式 migration。

---

# 2. 不可違反原則

- 不 drop／rename 現有 table、column、index。
- 不重算或替換既有 ID。
- 不覆寫既有 `verified`、`proof_text`。
- 不改動 Website JSON／VRChat JSON 的既有 path、field、route、query parameter。
- 不以手改 generated JSON 代替 migration。
- migration 必須可在資料副本重複驗證。
- schema change、backfill、adapter rollout 分階段進行。
- SQLite 設計保持 PostgreSQL 可移植性；避免把核心語意綁定 SQLite 特有功能。
- 任何跨 repo 資料刷新與發布遵守既有 approval gate。

---

# 3. 前置 Gate

進入 DDL 前必須完成：

1. 保存 `ta_data.sqlite` 的不可變備份與 checksum。
2. 記錄 `PRAGMA user_version`、`integrity_check`、foreign key 狀態。
3. 輸出所有 table／column／index／trigger／view。
4. 記錄每 table row count 與關鍵 null／distinct 統計。
5. 產生現行 Website JSON 與 VRChat JSON snapshot。
6. 定位 importer、generator、adapter 與 build command。
7. 確認 record table 名稱與 stable PK。
8. 確認 player／vehicle／world／route 的真實 key。
9. 確認 `event_code`、`verified`、`proof_text` 來源。
10. 在資料副本完成 dry run；不得先對唯一正式資料庫測試。

任何一項不明，都不得把候選 FK 寫入正式 migration。

---

# 4. 候選新增實體

共通建議：

- ID 使用穩定文字 key 或沿用既有 canonical key 型別。
- timestamp 存 RFC 3339／UTC-normalized 值並另存 event timezone。
- status 使用 CHECK 或 lookup；enum 值變更採 additive。
- metadata extension 可用 JSON text，但關鍵查詢欄位不可只放 JSON。
- 每個 table 至少有 `created_at`、`updated_at`，實際命名配合既有 schema。

## 4.1 `organizations`

用途：主辦方、社群、資料來源維護組織，不與 Team 混用。

候選欄位：

- `organization_id` PK
- `display_name`
- `organization_type`
- `status`
- `url`
- `source_key`
- `created_at`
- `updated_at`

建議 unique：

- 非空 `source_key` 在來源範圍內唯一。
- display name 不作唯一 key。

## 4.2 `events`

候選欄位：

- `event_id` PK
- `legacy_event_code` nullable unique（若現況存在且規則允許）
- `name_zh_hant`
- `name_en`
- `status`
- `event_type`
- `organizer_id` nullable FK → organizations
- `start_at`
- `end_at`
- `timezone`
- `recording_mode`
- `source_type`
- `source_ref`
- `completeness`
- `created_at`
- `updated_at`

規則：

- `legacy_event_code` 只作 compatibility key，不取代 stable `event_id`。
- retrospective event 需要 original event date／source provenance。
- cancelled／archived 不物理刪除。

## 4.3 `matches`

候選欄位：

- `match_id` PK
- `event_id` FK → events
- `sequence_no`
- `name_zh_hant`
- `name_en`
- `match_type`
- `status`
- `world_id` FK → 現有 world key
- `route_id` FK → 現有 route key
- `scheduled_at`
- `started_at`
- `ended_at`
- `created_at`
- `updated_at`

建議 unique：

- `(event_id, sequence_no)`。
- route 是否必填依 match type；不可假定純展示活動一定有 route。

## 4.4 `event_entries`

用途：保存參賽當下身分 snapshot，不讓日後 profile rename 改寫歷史。

候選欄位：

- `entry_id` PK
- `event_id` FK → events
- `player_id` nullable FK → 現有 player key
- `team_id` nullable FK → 未來 teams
- `vehicle_id` nullable FK → 現有 vehicle key
- `registration_name`
- `display_name_snapshot`
- `team_name_snapshot`
- `vehicle_name_snapshot`
- `status`
- `seed`
- `notes_private`
- `created_at`
- `updated_at`

規則：

- player／team 至少一者存在，實際 constraint 待 schema 能力確認。
- private notes 不進 public JSON。

## 4.5 `match_results`

一列代表一個 match 中一個 entry 的結果。

候選欄位：

- `match_result_id` PK
- `match_id` FK → matches
- `entry_id` FK → event_entries
- `position`
- `outcome`
- `score`
- `time_ms`
- `points`
- `qualified`
- `result_status`
- `record_id` nullable FK → 既有 record table
- `notes_public`
- `created_at`
- `updated_at`

建議 unique：

- `(match_id, entry_id)`；若未來支援 legs，須先引入 leg key，不能靜默放寬。

規則：

- Event result、Match result、Time Attack record 是可關聯但不同的概念。
- `record_id` 只有在正式規則定義結果同時產生 record 時才寫入。

## 4.6 `evidence`

候選欄位：

- `evidence_id` PK
- `evidence_type`
- `status`
- `visibility`：public／restricted／private
- `public_url`
- `private_ref`
- `submitted_by_player_id` nullable
- `submitted_by_organization_id` nullable
- `reviewed_by`
- `reviewed_at`
- `public_note`
- `private_note`
- `content_hash`
- `created_at`
- `updated_at`

規則：

- public output 只可使用 `visibility = public` 的安全欄位。
- URL 與 private reference 分欄，避免 adapter 意外洩漏。
- status 不直接等於 record review status。

## 4.7 `record_evidence`

用途：record 與 evidence 的多對多關聯。

候選欄位：

- `record_id` FK → 既有 record table
- `evidence_id` FK → evidence
- `relation_type`
- `display_order`
- `created_at`

建議 PK／unique：

- `(record_id, evidence_id, relation_type)`。

若未確認 record stable PK，本 table 只能保留 proposal，不能先建立錯誤型別 FK。

## 4.8 `revisions`

候選欄位：

- `revision_id` PK
- `entity_type`
- `entity_id`
- `revision_no`
- `change_type`
- `changed_at`
- `changed_by`
- `reason`
- `fields_changed_json`
- `before_json` nullable
- `after_json` nullable
- `source_ref`
- `visibility`

建議 unique：

- `(entity_type, entity_id, revision_no)`。

規則：

- public revision summary 與 private audit payload 分離。
- VRChat `rev` 是 generated contract revision，不直接引用本 table 的 `revision_id`。

---

# 5. Record 的 additive 欄位策略

只有在確認現有 record table 後才決定是否加欄。候選欄位：

- `review_status` nullable
- `verified_by` nullable
- `verified_at` nullable
- `superseded_by_record_id` nullable
- `review_reason` nullable／private

遷移期規則：

1. 新欄先 nullable。
2. adapter 在 `review_status IS NULL` 時沿用既有 `verified`。
3. backfill 必須有明確 mapping report。
4. backfill 完成且 contract tests 通過後，才評估 default／NOT NULL。
5. 舊欄至少保留到所有 consumer 完成升級；不得同一 migration 移除。

候選初始 mapping：

| Legacy 值 | 初始 `review_status` |
| --- | --- |
| `verified = true` | `accepted` |
| `verified = false` 且紀錄有效 | `submitted` 或 `needs_review`，需依現有規則決策 |
| rejected／removed 的現行狀態 | 不可只由 verified 推導；須讀 canonical rejection 欄位 |
| null／未知 | 保持 null 並列入 migration report |

不可把所有 false 自動判定為 invalid。

---

# 6. 分階段 rollout

## Phase 0｜Inventory

- 完成 current schema map。
- 固定 baseline snapshots。
- 決定正式命名與 migration runner。
- 審核資料分類與隱私。

## Phase 1｜Add schema

- 只新增 table／nullable column／index。
- migration 包在 transaction。
- 執行後做 integrity／FK／row count 檢查。
- generator 尚不改 public output。

## Phase 2｜Dual-read adapter

- adapter 優先讀新 review model。
- 新欄缺值時沿用 legacy。
- 同時產生新欄與舊欄，但既有 consumer 仍讀舊欄。
- 產出 mapping warning／coverage report。

## Phase 3｜Controlled backfill

順序：

1. organizations
2. events
3. event entries
4. matches
5. match results
6. evidence
7. record-evidence links
8. revisions／review status

每批需記錄來源、row count、unresolved identity 與 rollback key。無法確定的資料不猜測、不自動合併。

## Phase 4｜Generated contract expansion

- Website JSON additive 新增 event／match／review 欄位。
- VRChat compact contract 只增加消費端確實需要的欄位。
- 保留 `verified`、`proof_text`、`v`。
- schema minor version 升級。
- 比對 baseline snapshot，確認非預期差異為 0。

## Phase 5｜Consumer upgrade

- 網站先支援新欄，舊欄 fallback。
- VRChat module 逐世界驗證。
- 建立 consumer inventory 與最低支援 schema。
- 只有 major version 才討論移除 legacy。

---

# 7. 驗證矩陣

每次 dry run 至少檢查：

| 類型 | 檢查 |
| --- | --- |
| Database | integrity_check、FK violations、row counts、unique conflicts |
| Identity | 舊 ID 完全保留；無 display-name merge |
| Records | 排行筆數、排序、time_ms、日期不變 |
| Website | manifest routes、JSON paths、query parameters 不變 |
| Verification | legacy verified／proof_text 與 baseline 一致 |
| VRChat | route files 可解析；`v`、`rev`、Top N 行為不變 |
| Privacy | restricted／private evidence 不出現在 public artifact |
| Determinism | 相同 DB snapshot 兩次 build byte-stable 或 semantic-stable |
| Rollback | 還原 DB 備份即可重建原 contract |

---

# 8. Rollback

Schema migration 尚未進入正式資料前，以完整 DB restore 為唯一可信 rollback。若 migration 已進入正式流程：

- 停止 importer 寫入。
- 保留失敗 DB 與 log 供調查。
- 還原 migration 前 backup。
- 用舊 generator 重建並比對 baseline。
- 不以刪除新 table 的臨時 SQL 冒充完整 rollback。
- 不回寫已發布 JSON 到 canonical database。

---

# 9. PostgreSQL 升級門檻

只有出現以下需求時啟動：

- 多人同時寫入。
- 長時間持續寫入或 background jobs。
- 複雜角色與權限。
- 高併發 API。
- 多服務部署與遠端 transaction。
- SQLite write lock 已成為可量測瓶頸。

升級前必須已完成：

- DB-neutral migration definitions。
- 明確 PK／FK／timezone／boolean semantics。
- 不依賴 SQLite rowid。
- integration tests 可同時對 SQLite 與 PostgreSQL 執行。
