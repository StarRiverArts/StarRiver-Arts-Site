# Project T T-1 差異分析與實作規劃

**文件代號：** D3-B  
**版本：** Draft 0.3 / Product Goal Aligned  
**狀態：** Agent Handoff / Implementation Planning  
**日期：** 2026-07-16

**上位與配套文件：**

- `docs/SSOT.md`（repo 治理）
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

# 0A. Goal Guardrail

所有 phase 與工作包都必須能說明它改善哪一個端到端旅程：

- 玩家：投稿、receipt／status、處理結果與榜單可見。
- 活動主辦方：提供可追溯來源與結果。
- 世界作者：依穩定 contract 把 Project T 榜單接入 VRChat。
- 維護者：審核、生成、驗證、發布與回復。

Phase 0 是 production change 的保護 gate，不是產品完成證據。第一個產品成果固定為「單一路線 thin vertical slice」；Event、完整 Match、Team 與進階 Evidence 不得提前成為阻塞條件。

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

# Phase 0｜Evidence Gate 與契約凍結

## 目標

取得足以保護第一個 production slice 的直接證據，避免從 projection 猜 schema、破壞跨 repo 引用或誤改實際 Udon contract。

## 任務

1. 盤點 `ta_data.sqlite` tables、columns、PK、FK、indexes、views、triggers 與 row counts。
2. 定位 importer、generator、validator 與 build／deploy command。
3. 追蹤 required public field 的 input → function／query → canonical column → output path。
4. 確認 stable ID、alias、dedupe、transaction boundary 與 legacy verification flow。
5. 凍結 Website JSON、VRChat producer contract、URL、query parameter 與 generated 路徑。
6. 取得至少一個實際 VRChat/Udon consumer 的 field access、null、size、cache、offline 與 schema mismatch 行為。
7. 確認 Submission／Receipt 可加入的位置、private contact 儲存方式與 retention 邊界。
8. 明確記錄各 repo owner 與可修改範圍。

## Gate 結果

### `ready`

第一個 production slice 所需證據完整；approved migration、generator、frontend 與 consumer change 可以依已凍結 contract 開始。

### `conditionally ready`

只允許：

- docs。
- fixture。
- mock contract。
- read-only audit／validation tooling。

禁止：

- production SQL migration。
- production canonical write。
- generated contract 或正式 consumer 行為修改。
- 用假設補齊未知 schema／`v` 語意。

每一項 condition 必須記錄：

```yaml
blocking_condition: "尚缺的直接證據或外部狀態"
owner: "負責解除條件的角色或帳號"
due_date: "YYYY-MM-DD"
allowed_work: []
forbidden_work: []
```

缺少 blocking condition、owner 或 due date 時，不得標示 `conditionally ready`。

### `blocked`

目前無法進行有意義的允許工作，且需外部權限、資料或狀態改變才能繼續。必須記錄阻塞原因與解除條件。

## 驗收

- 任一 required output field 可追溯至 canonical／producer source。
- Website 與實際 VRChat consumer contract 均有直接證據。
- Submission private／public boundary 可落實。
- Gate decision 與限制有 owner、日期與證據連結。
- 只有 `ready` 可進入 production Phase 1。

---

# Phase 1｜單一路線 Thin Vertical Slice

## 目標

以一條既有且穩定運作的路線完成第一個可用產品成果：

```text
玩家投稿
→ opaque receipt / status
→ 最小審核
→ canonical write
→ 網站榜單輸出
→ 單一路線 VRChat 顯示
→ 世界作者接入文件
```

## 範圍

1. 固定一條 route 與既有 ID／URL／output path。
2. 提供公開 submission contract；實作可採最小 endpoint、form 或受控 importer，但必須真實可執行。
3. 產生不可預測 receipt token 與最小 status lookup。
4. 將 private contact、private evidence、internal note 排除於 public JSON。
5. 支援 received、queued、needs_information、accepted、rejected、withdrawn。
6. 完成最小 review，accepted submission 連結正式 Record。
7. 由 canonical snapshot 重建網站榜單。
8. 保留現有 route-specific VRC output，並在實際 consumer 驗證該路線顯示。
9. 建立世界作者接入文件，含 URL、required fields、更新、快取、離線與錯誤行為。
10. 由非核心維護者依文件完成一次接入測試。

## 明確不包含

- Event／Match canonical system。
- Team。
- 進階 Evidence 關聯與公開 verification UI。
- federation、Source Registry 或 Board Builder。
- 全站 responsive rebuild。

## 驗收

- 玩家可從投稿走到可理解的結果。
- 維護者不手改 generated JSON。
- accepted submission 可追溯至 canonical Record。
- Website 與 VRChat 顯示同一 canonical snapshot 的相容 projection。
- receipt/status 不洩露聯絡資訊或私密 Evidence。
- 舊 Time Attack、ID、URL、路徑與跨專案引用無非預期變化。

---

# Phase 2｜Submission、Review 與 Privacy 強化

- 擴充至多路線。
- idempotency、duplicate detection、withdrawal、correction 與 token recovery policy。
- Evidence visibility、review metadata 與 Revision。
- private retention／deletion policy。
- legacy `verified`／`proof_text` adapter；compact `v` 僅在 consumer evidence 證實後 mapping。
- 可選通知，不以前置登入系統為必要條件。

---

# Phase 3｜Event MVP

- Event index／detail。
- 世界、路線、主辦、日期、時區、status、source 與 recording mode。
- prospective／retrospective／imported。
- 第一批資料必須先進 canonical store，不直接填 `events.json`。
- 保留既有 manifest route 與 query pattern。

---

# Phase 4｜Match、Entry 與 Result

- Event Entry、Match Entry、Match Result。
- 第一批支援 time、win／loss、ranking、single elimination。
- 保存參賽當下 player／team／vehicle snapshot。
- Result 可關聯 Time Attack Record，但不混為同一實體。

---

# Phase 5｜Team 與反向索引

- stable `team_id`、membership history、manager 與 public links。
- Player → Event／Match／Team。
- Team → Member／Event／Match Result。
- World／Route／Vehicle → Event。
- 未確認 team 名稱只進 unresolved report，不自動 merge。

---

# Phase 6｜World／Route 正規化與作者接入擴張

- 保留 `track_world_code` 與 `route_code`。
- 盤點 Author、VRChat world identity、platform、version、status provenance。
- 擴張 route coverage 與世界作者接入測試。
- unknown value 產生清理報告，不靜默重寫。

---

# Phase 7｜VRChat Contract 正式化

- 文件化 schema version、Top N、missing／offline／cache／schema mismatch。
- 保持 route-specific compact JSON。
- 建立 producer fixture 與 actual consumer integration test。
- 新世界由設定 URL 接入，不複製資料管線。
- `v` 語意在直接證據前保持 pending。

---

# Phase 8｜T-1 Release Candidate

## 必備

- 玩家投稿、receipt／status、privacy 與 review。
- Event、Match、Result、Team、Evidence／Revision。
- World／Route metadata 與世界作者接入。
- Website／VRChat generated contracts。
- Validator、contract tests、rollback／recovery。
- 中英主要旅程。
- 四類角色各至少一次端到端驗收。

## 不要求

- 完整登入後台。
- Federation／Source Registry／Board Builder。
- 完整 Discord Bot。
- PostgreSQL、即時 API 或多租戶權限。

---

# 4. Agent 工作包

| 工作包 | 可修改 | 不可越界 |
| --- | --- | --- |
| Evidence Auditor | 只讀 SQLite／pipeline／consumer；更新 schema map／inventory／gate decision | 不改 production schema、generator 或 consumer |
| Submission Slice | submission／receipt／status、最小 review、adapter、journey test | 不引入 Event／Team；不公開 private metadata |
| Migration Engineer | 已核准 SQL migration、migration test、backup／rollback | 未達 ready 不執行；不猜 schema |
| Website Output | generator、Website contract、thin-slice UI | 不手改 generated JSON；不重命名舊 URL／ID |
| VRChat Contract | compact fixtures、actual consumer test、作者接入文件 | 不猜 `v`；不做 federation |
| Event／Match | importer、model、generator、validator、pages | 不阻塞 Phase 1 |
| Evidence／Review | 完整 Evidence、review、Revision、legacy adapter | 不自行開啟公開 verification |
| Team／Reverse Index | Team entity、pages、reverse indexes | 不以名稱自動 merge identity |

同一時間只允許一個工作包擁有 migration files。跨工作包欄位先經 contract review 固定。

---

# 5. 執行順序

```text
Phase 0 Evidence Gate
        ↓ ready
Phase 1 One-route Thin Vertical Slice
        ↓
Phase 2 Submission / Review / Privacy Hardening
        ↓
Phase 3 Event MVP
        ↓
Phase 4 Match / Entry / Result
        ↓
Phase 5 Team / Reverse Index
        ↓
Phase 6 World / Route + Author Onboarding
        ↓
Phase 7 VRChat Contract Formalization
        ↓
Phase 8 Release Candidate
```

可平行：

- `conditionally ready` 時可做 docs、fixtures、mock contracts 與 read-only tooling。
- VRChat consumer inventory 可與 SQLite／pipeline inventory 平行。
- Phase 1 mock UI 可在 contract 固定後準備，但 production write 仍須 `ready`。

不可平行：

- 未達 `ready` 即執行 production SQL 或修改正式 generated contract。
- adapter 未固定前移除 legacy verification fields。
- canonical source 未確認前手改 generated JSON。
- 以 Event、Team 或完整 Evidence 擴張 Phase 1。

---

# 6. Branch 與 Commit

建議 branch 依 repo 慣例使用 `agent/<scope>`：

```text
agent/t1-evidence-gate
agent/t1-submission-slice
agent/t1-events
agent/t1-matches
agent/t1-evidence
agent/t1-teams
agent/t1-vrc-contract
```

Commit 只處理一種責任：

```text
docs: record T-1 gate evidence
db: add submission receipt tables
build: project accepted record to route board
feat: expose opaque submission status
test: validate one-route vrc contract
docs: add world-author integration guide
```

---

# 7. 主要風險

| 風險 | 控制 |
| --- | --- |
| receipt token 洩露身分或可猜測 | cryptographically random opaque token；public projection allowlist |
| private contact／Evidence 進 generated JSON | private/public 欄位分層；contract snapshot 與 leak test |
| thin slice 膨脹為完整後台 | 固定單一路線與最小 status；Event／Team／進階 Evidence 後移 |
| 手改 generated JSON | canonical-first；generated-file warning／build check |
| ID 或路徑重構破壞跨 repo 引用 | 保留 legacy code、URL、query parameter、manifest route |
| projection 被誤認 canonical | schema map 標記 evidence level；禁止反向寫回 |
| `conditionally ready` 被當成開工許可 | 明列 allowed／forbidden work 與 blocking condition、owner、due date |
| Verification 過早公開 | 維持 UI flag；Valid 與 Verified 分離 |
| 多 Agent 衝突 | 單一 migration owner；固定工作包與 contract review |
| T0 需求拖慢 T-1 | T0 authority 另規格；federation 不進 Phase 1 |

---

# 8. Definition of Done

## 第一個產品切片

```text
玩家依公開規則投稿
↓
取得 opaque receipt 並查詢狀態
↓
維護者完成最小審核
↓
accepted submission 寫入 canonical Record
↓
生成並驗證網站榜單
↓
同一路線在實際 VRChat consumer 顯示
↓
非核心維護者依接入文件完成測試
```

同時：

- private contact、private Evidence 與 internal note 未進 public output。
- Submission status 與 Record review status 分離。
- 舊 Time Attack、玩家、車輛與 VRChat 榜單正常。
- 不直接修改 generated JSON。
- contract test、rollback／recovery rehearsal 與跨 repo 引用檢查通過。

## 完整 T-1

- 玩家、主辦方、世界作者與維護者旅程均可端到端完成。
- Event／Match／Result／Team／Evidence／Revision 可追溯至 canonical store。
- 世界作者接入可擴張至多條路線。
- Schema map 與 contract inventory 由直接證據補完。
- 中英主要頁面與維護文件完成。

---

# 9. 下一個立即任務

下一步是完成 `Phase 0｜Evidence Gate`，目的只在判斷並解鎖 Phase 1，不把 audit 本身當成產品完成。

需要唯讀取得 `VR_RacingClubTW`／實際 pipeline repo 與真正 Udon consumer，補完：

1. SQLite schema、row counts 與 canonical Record 主表。
2. importer／generator／validator 入口與 transaction boundary。
3. existing ID、alias、dedupe 與 lookup mapping。
4. `verified`／`proof_text`／`v` 的完整流向。
5. Website required field → producer mapping。
6. actual VRChat consumer field access、size、null、cache、offline 與 schema mismatch。
7. Submission／Receipt／private contact 的 additive migration 候選點。

若證據不足，只能標示 `conditionally ready` 並附 blocking condition、owner、due date；不得進行 production SQL migration。取得 `ready` 後，下一支 production PR 只實作 Phase 1 thin vertical slice，不混入 Event frontend。
