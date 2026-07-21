# Project T T-1 差異分析與實作規劃

**文件代號：** D3-B  
**版本：** Draft 0.2 / Evidence Aligned  
**狀態：** Agent Handoff / Implementation Planning  
**日期：** 2026-07-16

**上位與配套文件：**

- `MASTER-CHARTER`
- `docs/project-t/t-1-product-spec.md`
- `docs/project-t/t-1-gap-analysis.md`
- `docs/project-t/t-1-current-schema-map.md`
- `docs/project-t/t-1-contract-inventory.md`
- `docs/project-t/t-1-migration-plan.md`
- `docs/project-t/t-1-adapter-policy.md`

---

# 0. 文件目的

本文件把 T-1 產品規格、現有 Site repo 狀態與資料架構決策轉成可執行的 roadmap。它不重新定義 T-1 願景，也不取代 schema、migration 或 adapter SSOT。

本文件回答：

1. 現有系統已完成、部分完成或尚未完成什麼。
2. Phase 0–8 應依什麼順序執行。
3. 每個工作包可修改哪一層、不可修改哪一層。
4. 如何避免破壞既有 Time Attack 與 VRChat contract。
5. 何時可從 planning 進入 database／frontend implementation。

---

# 1. 不可違反的前提

## 1.1 資料權責

```text
投稿 / Form / CSV / YAML / External JSON
                    ↓ Importer + Validator
VR_RacingClubTW / ta_data.sqlite
                    ↓ Generator + Adapter
StarRiver-Arts-Site
├─ play/RacingClub/TimeAttack/data/*.json
└─ play/RacingClub/TimeAttack/vrc/*.json
                    ↓
Website + VRChat
```

- SQLite 是 T-1 canonical store。
- Site JSON 是 generated website artifact。
- VRC JSON 是 compact generated contract。
- YAML 是概念模型、匯入模板、設定或 fixture。
- 不得人工同時維護 SQLite、YAML 與 generated JSON。
- Site repo 不反向定義 canonical record，也不把 generated JSON 寫回 SQLite。

## 1.2 相容性邊界

原則上不得直接破壞：

- 現有頁面與 JSON URL。
- `player_id`。
- `vehicle_model_code`。
- `track_world_code`。
- `route_code`。
- detail page 的 `?id=` query parameter。
- `data/*.json` 與 `vrc/*.json` 路徑。
- manifest route。
- VRChat compact schema。
- `verified`、`proof_text`，以及 producer payload 中已觀察但語意待驗證的 compact `v`。

新模型先採 additive migration 與 adapter。破壞性改動只能進入新的 major schema，且須完成 consumer inventory、平行遷移與 rollback。

## 1.3 公開語言

T-1 新功能完成條件涵蓋：

- 繁體中文。
- 英文。

現有日文欄位與 copy 可為相容保留，但不是新功能的完成條件，也不應讓新資料流程必須依賴日文內容。

## 1.4 證據邊界

截至本文件版本：

- Site repo 的 generated contract 與 `timeattack.js` 已完成 evidence-scoped 盤點。
- `VR_RacingClubTW`／實際 pipeline repo 不在目前 GitHub connector 可見範圍。
- SQLite tables、importer、generator、lookup 與實際 VRChat/Udon consumer 仍待直接證據。
- 不得把公開 projection 反推為已確認的 canonical table。

---

# 2. 現況判定

完整欄位矩陣以 `t-1-gap-analysis.md` 與 `t-1-current-schema-map.md` 為 SSOT；本節只保留 roadmap 所需摘要。

## 2.1 已有可用 surface

- Time Attack 靜態頁與 manifest-based JSON loading。
- 世界／路線、玩家、車輛與計時排行榜投影。
- `player_id`、`vehicle_model_code`、`track_world_code`、`route_code`。
- 日期、平台、time、TR／CR／PR、`verified`、`proof_text`。
- Player／Vehicle index 與 detail。
- Track index、detail 與 route leaderboard。
- VRChat index、world／route-specific compact payload、Top N、`provisional`、`v`。
- 靜態 GitHub Pages、中英頁面架構、search／machine-readable indexes。

目前 manifest snapshot 為 `schema_version: 0.5.0`，generated data 顯示 927 筆有效紀錄。數量是 2026-07-14 build snapshot，不是永久規格值。

## 2.2 部分完成

### Event

已有 `events.html`、`events.json`、navigation 與 `event_code`／`events_meta` 文案；目前 `event_cards` 為空。缺 Event canonical schema、資料、detail、反向索引與正式 result。

### Team

公開 player projection 有 team display 線索，但 stable `team_id`、membership history、Team index／detail 與 canonical table 待驗證或新增。不可由名稱字串直接推導 identity。

### Verification

已有 `verified`、`proof_text`、Review page、metrics 與呈現開關；缺 Evidence entity、`review_status`、reviewer metadata、invalidated／removed／superseded 與 audit revision。

### World／Route

已有 code、名稱、system、route 與 leaderboard；作者、VRChat world identity、version、platform、status 與 canonical normalization 的完整度待 pipeline inventory。

### Schema audit

`t-1-current-schema-map.md` 已存在 evidence-scoped 草稿；Site/VRC producer contracts 已盤點，SQLite／pipeline／actual Udon consumer 部分尚未完成。

## 2.3 尚未形成正式能力

- Match。
- Event／Match Entry。
- Match Result。
- Organization。
- Evidence relationship。
- Record Detail。
- Event／Match validator。
- retrospective workflow。
- canonical Revision／Audit。
- Team canonical relationship。
- 可執行 database migration。
- canonical-to-public adapter implementation。

Bracket renderer 是後續 UI 能力，不應阻擋第一批 Match／Result canonical model。

---

# 3. Phase Roadmap

# Phase 0｜契約凍結與現況盤點

## 目標

在新增功能前，完成 SQLite、pipeline、public JSON 與 consumer 的可追溯 mapping，避免從 projection 猜 schema 或由多個 Agent 各自設計 migration。

## 任務

1. 盤點 `ta_data.sqlite` tables、columns、PK、FK、indexes、views、triggers。
2. 定位 importer、generator、validator 與 build／deploy command。
3. 追蹤每個公開欄位的 SQL／lookup／adapter source。
4. 確認 record stable ID、`event_code`、`verified`、`proof_text`。
5. 盤點 player／vehicle／track／route lookup 與 alias／merge 規則。
6. 凍結 Website JSON 與 VRChat producer contract。
7. 取得至少一個實際 VRChat/Udon consumer 的 field access inventory。
8. 確認 Site repo 與 pipeline repo 的修改責任。

## 交付物

- `docs/project-t/t-1-current-schema-map.md`
- `docs/project-t/t-1-contract-inventory.md`
- pipeline repo 內的 schema dump／mapping evidence，位置由該 repo governance 決定

## 現況（2026-07-17 更新）

- Site／VRC producer contract：已完成第一版。
- SQLite／importer／generator／actual consumer：**已完成**——本機 workspace 審計直接存取 `VR_RacingClubTW`、canonical SQLite 與 `siteResource/vrc-unity` Udon consumer；證據記錄於 `t-1-current-schema-map.md` §9。
- **Phase 0 標記 complete**（除 owner 審核外全部驗收項通過）。Phase 1 可開始。

## 驗收

- 任一公開 required field 可追溯至 canonical／generator source。
- 每個 repo 的 owner 與可修改範圍明確。
- 不再以手改 generated JSON 修資料。
- migration engineer 不需猜既有 table 或 key。

---

# Phase 1｜Canonical Schema Migration

## 目標

以 additive migration 加入 T-1 實體，保留既有 table、field、ID 與 generated contract。

## 候選新增實體

```text
organizations
events
event_worlds
event_routes
event_entries
matches
match_entries
match_results
evidence
record_evidence
event_evidence
match_evidence
revisions
teams
team_members
```

Record review 可採 nullable additive columns，或在既有 record table 不適合修改時採 `record_reviews` companion table。最終命名與 FK 型別必須依 Phase 0 evidence 決定。

## 交付物

- pipeline repo 的版本化 SQL migration。
- migration tests。
- backup／rollback note。
- unresolved identity report。
- 更新後的 migration notes 與 schema map。

## 驗收

- migration 在資料副本可重複驗證。
- integrity／FK／row count 檢查通過。
- 舊 Website／VRChat snapshot 無非預期變化。
- `verified` 與 `proof_text` 未移除。

---

# Phase 2｜Event MVP

現行頁面落地順序、失效連結處置與驗收細節見：

- [t-1-events-next-step-plan.md](./t-1-events-next-step-plan.md)

## 目標

讓 Event index 從空骨架成為可瀏覽的活動資料 surface。

## MVP

- Upcoming／Ongoing／Completed／Archived。
- Event card 與 detail。
- 世界、路線、主辦、日期、時區。
- 賽制、報名資訊、result status。
- prospective／retrospective／imported。
- public source／completeness。
- Player／World／Route reverse links。

## 第一批候選資料

1. 2026-07-18 Sacc 定峰錦標賽。
2. 2026-07-19 CVS Momiji 計時賽。
3. 一場有來源證據的歷史活動作 retrospective 測試。

這些資料必須先進 canonical store；不能直接填入 `events.json`。

## Contract

保留 `events.json` 與 manifest route，以 additive fields 擴充。Event detail 優先沿用 query pattern：

```text
event.html?id=<event_id>
```

若採 per-event JSON，必須由 manifest／index discovery，不在 frontend 硬編路徑。

## 驗收

- 三場已核實活動可瀏覽。
- retrospective 與資料完整度可辨識。
- Event 能連回 World、Route、Player。
- 既有空頁文案不再代替正式資料。

---

# Phase 3｜Match、Entry 與 Result

## 第一批支援

- Time Attack。
- Win／Loss。
- Ranking。
- Single Elimination。

Points、Team Battle、Multiple Legs 與 Championship Round 保留可擴充性，但不阻擋 MVP。

## 核心關係

```text
Event
├─ Event Entry
└─ Match
   ├─ Match Entry
   └─ Match Result
```

Entry 保存比賽當下 player／team／vehicle snapshot；profile rename 不應改寫歷史事實。

## 驗收

- 一個 Event 可有多個 Match。
- Match 可連 Player、Team、Vehicle、World、Route。
- Result 支援 time、outcome、rank 與 qualification。
- 修正 result 時新增 Revision。
- Result 與 Time Attack Record 可關聯但不混為同一實體。

---

# Phase 4｜Evidence、Review 與 Revision

## 目標

將 `verified + proof_text` 升級為可追溯 canonical model，同時保持 legacy output。

Evidence types 與 Review Status 以產品規格、migration plan、adapter policy 為 SSOT。

## 公開策略

- 真實 workflow 穩定前保持 `SHOW_VERIFICATION = false`。
- Valid 與 Verified 分開。
- private／restricted evidence 不進 public JSON。
- 至少有實際 accepted record 與審核流程後，才另行決定公開呈現。

## 驗收

- 一筆 Record 可連多筆 Evidence。
- 至少四種 Evidence type 可在測試資料登記。
- submitted、accepted、needs_review、invalidated、removed、superseded 可區分。
- Revision 保存 actor、reason、entity、changed fields 與前後值。
- Website `verified`／`proof_text` contract tests 通過；VRChat `v` 先通過 baseline preservation，語意 mapping 待 Phase 0 證實後測試。

---

# Phase 5｜Team 與反向索引

## Team MVP

- `team_id`。
- bilingual name。
- status。
- managers／members。
- public links。
- Event／Match result。
- team records。

Logo、description、Discord 等可選欄位不應阻擋 identity 與 membership model。

## Reverse indexes

- Player → Event／Match／Team。
- Team → Member／Event／Match Result。
- World／Route／Vehicle → Event。

## 驗收

- 現有 team display 值完成 unresolved／matched report。
- 已確認的 Team 能建立正式頁面。
- Team rename 不破壞 relation。
- 未確認名稱不自動合併。

---

# Phase 6｜World／Route Metadata 正規化

保留 `track_world_code` 與 `route_code` 作 public／legacy key。若內部新增 canonical ID，必須保存 deterministic lookup。

## 驗收

- 新資料不再產生未說明的 `unknown` world。
- 舊 unknown values 有清理報告，不靜默重寫。
- Website Track Index 與 VRC Index 使用同一 mapping snapshot。
- Author、world identity、platform、version、status 的來源可追溯。

---

# Phase 7｜VRChat Contract 正式化

## 應做

- 文件化 schema version、Top N、missing／offline behavior。
- 保持 route-specific compact JSON。
- 加入 compatibility version／generated timestamp 時採 additive field。
- 建立 producer fixture 與 actual consumer integration test。
- 新世界可由設定 URL 接入，不複製整套資料。

## 不應做

- 不讓 VRChat 讀完整 Website JSON。
- 不在 VRChat 執行多來源 aggregation。
- 不一次載入全部世界。
- 不在 T-1 切換 T0 federation。

目前 contract 命名與 major version 不先改。只有證明需要破壞性變更時，才提出新的 major schema 與 parallel output。

---

# Phase 8｜T-1 Release Candidate

## 必備

- Event index／detail。
- Match／Result。
- Evidence／Review canonical data。
- Revision。
- Team entity。
- World／Route metadata。
- Validator。
- Website／VRChat generated contract。
- 兩場新活動與一場 retrospective 活動。
- 維護文件、verified schema map、contract inventory。
- 至少一條從投稿到發布的完整演練。

## 不要求

- 登入後台。
- Federation／Source Registry／Board Builder。
- 完整 Discord Bot。
- PostgreSQL。
- 即時 API。
- 多租戶權限。

---

# 4. Agent 工作包

| 工作包 | 可修改 | 不可越界 |
| --- | --- | --- |
| Schema Auditor | 只讀 SQLite／pipeline／consumer；更新 schema map／inventory | 不先改功能或 migration |
| Migration Engineer | SQL migration、migration test、backup／rollback | 不改 frontend；不猜 schema |
| Event／Match Data | importer、model、generator、validator | 不手改 Site JSON；不改 VRC schema |
| Event Frontend | Event／Match pages、CSS、中英 copy | 只讀 generated contract |
| Evidence／Review | Evidence、review status、Revision、legacy adapter | 不自行公開 SHOW_VERIFICATION |
| Team／Reverse Index | Team entity、pages、reverse indexes | 不以名稱自動 merge identity |
| VRChat Contract | compact schema、fixtures、consumer tests | 不改 Event frontend；不做 federation |

同一時間只允許一個工作包擁有 migration files；跨工作包欄位先透過 contract review 固定。

---

# 5. 執行順序

```text
Phase 0 Schema / Contract Audit
        ↓
Phase 1 Database Migration
        ↓
Phase 2 Event canonical data + Phase 4 backend
        ↓
Phase 3 Match / Entry / Result
        ↓
Phase 2 Event frontend
        ↓
Phase 5 Team / reverse indexes
        ↓
Phase 6 World / Route normalization
        ↓
Phase 7 VRChat contract formalization
        ↓
Phase 8 Release Candidate
```

可平行：

- Event frontend 可在 sample contract 固定後開始。
- VRChat inventory 可在不改舊欄位下進行。
- Team UI 可在 Team schema 固定後開始。

不可平行：

- Phase 0 前由多個 Agent 各自設計 migration。
- adapter 未固定前移除 legacy verification fields。
- canonical source 未確認前手改 generated JSON。

---

# 6. Branch 與 Commit

建議 branch 依 repo 慣例使用 `agent/<scope>`：

```text
agent/t1-schema-audit
agent/t1-events
agent/t1-matches
agent/t1-evidence
agent/t1-teams
agent/t1-vrc-contract
```

Commit 只處理一種責任：

```text
docs: map current time attack contracts
db: add event and match tables
build: generate event index payload
feat: render event index
feat: add evidence model and legacy adapter
test: validate vrc track contract
```

---

# 7. 主要風險

| 風險 | 控制 |
| --- | --- |
| 手改 generated JSON | canonical-first；加入 generated-file warning／build check |
| Event schema 過度設計 | MVP 只保證 time、win-loss、ranking、single elimination |
| Verification 過早公開 | 維持 UI flag；先建立 workflow；Valid 與 Verified 分離 |
| ID 重構破壞舊連結 | 保留 legacy code、lookup、URL 與 query parameter |
| 多 Agent 衝突 | Phase 0 SSOT；單一 migration owner；固定工作包 |
| T0 需求拖慢 T-1 | federation／registry／multi-tenant 延後 |
| projection 被誤認 canonical | schema map 標記 evidence level；禁止反向寫回 |
| 私密 Evidence 外洩 | visibility gate、allowlist、public summary adapter |

---

# 8. Definition of Done

T-1 應完成：

```text
建立活動
↓
加入玩家／車隊
↓
建立比賽與結果
↓
加入 Evidence
↓
審核、修正或歸檔
↓
生成 Event / Player / Team / World 頁面
↓
生成 Website JSON
↓
生成 VRChat compact JSON
↓
經 approval gate 發布 GitHub Pages
```

同時：

- 舊 Time Attack、玩家、車輛與 VRChat 榜單正常。
- 不需直接修改 generated JSON。
- Event／Match／Evidence／Revision 可追溯至 canonical store。
- 至少一場活動完成端到端演練。
- Schema map 已由 pipeline evidence 補完。
- Contract tests 與 rollback rehearsal 通過。

---

# 9. 下一個立即任務

**Phase 0 已於 2026-07-17 完成**（本機 pipeline 審計；證據見 `t-1-current-schema-map.md` §9）：

1. SQLite schema。 → ✅ §9.2
2. Importer／generator／validator 入口。 → ✅ §9.3
3. Existing ID／lookup map。 → ✅ §9.4
4. `event_code` 與 verification source。 → ✅ §9.5
5. Public field → query／adapter mapping。 → ✅ §9.3（generator 入口與投影規則）
6. Actual VRChat consumer field access。 → ✅ §9.6
7. Recommended migration points。 → ✅ §9.7（`user_version` 起版）＋ migration-plan §4 候選設計可轉正式

下一步進入：

```text
Phase 1｜Canonical Schema Migration（additive；pipeline repo 為 migration owner）
```

執行注意：新 migration 腳本的 DB_PATH 必須指向 `CodeTools/StarRiverSite/play/RacingClub/TimeAttack/ta_data.sqlite`（舊腳本的巢狀路徑已失效，見 §9.3 陷阱欄）；dry run 一律在資料副本執行。
