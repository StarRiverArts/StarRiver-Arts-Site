# Project T T-1 Adapter Policy

**版本：** Draft 0.1  
**日期：** 2026-07-16  
**適用範圍：** Canonical SQLite → Website JSON → VRChat compact JSON

---

# 1. 目的

Adapter 是 canonical model 與既有 consumer contract 之間的唯一轉換層。它負責：

- 從同一個 canonical snapshot 生成網站與 VRChat 輸出。
- 將新 Event／Match／Evidence／Review model 投影為公開資料。
- 在 consumer 遷移期間保留既有欄位。
- 阻止 private／restricted 資料進入公開 JSON。
- 產生可重現、可測試、具版本的輸出。

Adapter 不負責修正 canonical data，也不把 generated JSON 反寫為主資料。

---

# 2. 權責邊界

```text
Authoring / External JSON
        ↓ importer + validation
Canonical SQLite
        ↓ adapter / generator
Website generated JSON
        ↓ compact projection
VRChat generated JSON
```

規則：

- import adapter 與 output adapter 是不同入口。
- 外部 JSON 必須經 schema validation、identity normalization、provenance 保存後才可寫入 canonical store。
- Website JSON 是 rich public projection，不含 private audit data。
- VRChat JSON 是 route-specific compact projection，只含顯示必需欄位。
- output adapter 不做人工判決；review result 必須先存在 canonical store。

---

# 3. Contract stability

## 3.1 現行不可破壞邊界

- `play/RacingClub/TimeAttack/data/manifest.json`
- `play/RacingClub/TimeAttack/data/*.json`
- `play/RacingClub/TimeAttack/vrc/*.json`
- manifest 的 route key 與相對檔名
- `track_world_code`
- `route_code`
- `player_id`
- `vehicle_model_code`
- detail page 的 `?id=` query parameter
- `verified`
- `proof_text`
- compact `v`
- VRChat `rev`／updated／schema 欄位

新增能力預設採 additive field／new route。不能為了欄位名稱更漂亮而重命名現有 key。

## 3.2 Version policy

- 相容新增：schema minor version。
- 只修 metadata／排序 bug 且 contract 不變：patch version。
- 移除、改名、型別改變、null semantics 改變：major version。
- major version 必須提供 parallel output 或明確遷移期。
- manifest 必須能讓 consumer discovery，而不是在前端硬編新檔名。

---

# 4. Verification mapping

## 4.1 Canonical model

候選 canonical 欄位：

- `review_status`
- `verified_by`
- `verified_at`
- `evidence[]`
- `revision`

Review status：

```text
submitted
accepted
needs_review
invalidated
removed
superseded
```

Evidence status：

```text
submitted
accepted
rejected
inconclusive
missing
```

兩者不可合併。Evidence 說明「提供了什麼與審查結果」，Review Status 說明 record 是否被 T-1 採納。

## 4.2 Website legacy mapping

| Canonical | `verified` | `proof_text` | 預設榜單 |
| --- | ---: | --- | --- |
| `accepted` | `true` | accepted public evidence 的 deterministic summary | 顯示 |
| `submitted` | `false` | 可為空或公開 submission summary | 依既有有效紀錄規則 |
| `needs_review` | `false` | 可為公開「待審」摘要，不含 private note | 依既有規則 |
| `invalidated` | `false` | 公開原因只有在 visibility 允許時輸出 | 預設排除 |
| `removed` | `false` | 不輸出 private reason | 排除 |
| `superseded` | `false` | 可輸出公開 replacement note | 排除或指向新 record |

關鍵規則：

- 只有 `accepted` 產生 `verified = true`。
- false 不等於 invalid。
- `proof_text` 是相容摘要，不是 canonical evidence storage。
- 若 `review_status` 尚未回填，沿用舊 `verified`／`proof_text`，並在 build report 記錄 fallback；不得默認改為 true。
- 現行榜單是否包含 unverified valid runs 必須保持不變，直到產品規則另行核准。

## 4.3 VRChat compact mapping

```text
review_status = accepted  → v: 1
其他已知 status           → v: 0
migration null            → 既有 verified ? 1 : 0
```

VRChat 不直接接收完整 `evidence[]`、private notes、reviewer identity 或 audit payload。若世界內需要 evidence hint，只能新增短、安全、可選欄位，並先確認 Udon consumer 的 payload 與 parser 限制。

---

# 5. Evidence summary policy

`proof_text` 生成順序應固定：

1. accepted 且 public 的 evidence。
2. 依 `display_order`，其次依 evidence ID 排序。
3. 使用穩定 type label。
4. public URL 只在 visibility 允許且通過 URL allowlist／sanitization 時加入。
5. 多筆 evidence 以固定 separator 組合。
6. 無 public evidence 時輸出空字串，不暴露「有私密證據」的內部細節。

不得輸出：

- `private_ref`
- private／restricted URL
- private note
- 未公開 reviewer identity
- access token、Discord 私訊連結或本機 path
- before／after audit snapshot

同一 canonical snapshot 的 `proof_text` 必須 deterministic。

---

# 6. Core entity mapping

## 6.1 World／Route

| Canonical | Website JSON | VRChat compact |
| --- | --- | --- |
| world stable ID | `track_world_code` | `track.code`／world `code` |
| route stable ID | `route_code` | `route.code` |
| bilingual name | display／world／route labels | `zh`、`en` |
| VRChat URL | `world_url` | worlds contract 的 `world_url` |
| system | `system_name`／system fields | `system` |
| revision／updated | page metadata as needed | `rev`／`updated` |

既有 codes 不因 display name 或 slug policy 改變。

## 6.2 Player

| Canonical | Website JSON | VRChat compact |
| --- | --- | --- |
| player ID | `player_id` | 通常省略；route board 依現行 contract |
| display name snapshot | `player_display_name` | `name` |
| profile／aliases | player card | 不輸出 |
| privacy fields | 不輸出 | 不輸出 |

Leaderboard 應使用 record／entry 當時的 display snapshot；profile rename 不應改寫歷史事實，除非產品規則明確要求全站同步顯示現名。

## 6.3 Vehicle

| Canonical | Website JSON | VRChat compact |
| --- | --- | --- |
| model ID | `vehicle_model_code` | 依現行 `sub`／board 欄位 |
| display name | `vehicle_model_name` | compact display string |
| variants／metadata | vehicle card | 不輸出或縮減 |

## 6.4 Record

| Canonical | Website JSON | VRChat compact |
| --- | --- | --- |
| record ID | 新欄可 additive 輸出；既有 row 不依賴 | 預設不輸出 |
| time ms | `lap_time_ms` | `t_ms` |
| display time | `lap_time_text` | `t` |
| record date | `record_date` | `date` |
| player／vehicle／route | 既有 verbose fields | compact name／sub／track／route |
| review | `verified`／`proof_text` 加新欄 | `v` |

排序必須以 canonical numeric time 與既有 tie-breaker 進行，不以 display string 排序。

## 6.5 Event／Match

新增 Website contract 時建議：

- `event_id` 與可選 `legacy_event_code`
- status／type／time／timezone
- organizer public projection
- world／route references
- entry／match／result summaries
- recording mode／completeness
- public revision summary

VRChat 預設不輸出完整 Event／Match。只有明確世界內功能需要時新增 route-specific event summary，避免擴大 payload。

---

# 7. Null、缺值與 fallback

- 缺值使用 JSON `null` 或省略，必須按 field contract 固定，不可同一欄混用空字串、0、false 表示未知。
- `0` time、position、points 不可自動視為 null。
- `verified = false` 表示未被映射為 accepted，不表示 record 無效。
- unknown ID 不可用 display name 暫代 stable ID。
- 找不到 lookup 時輸出 build warning；若欄位是 consumer 必要 key，該 build 應失敗，不生成半套 contract。
- legacy fallback 每次 build 都要統計，直到 coverage 為 100%。

---

# 8. Determinism 與排序

相同 canonical snapshot、generator version 與設定必須產生 semantic-equivalent output。

固定：

- object key serialization policy
- array sort key
- tie-breaker
- timestamp normalization
- number formatting
- bilingual fallback
- evidence summary order
- null／omission policy

`generated_at` 可變，但 contract snapshot test 應能排除或固定 volatile metadata。

---

# 9. Build failure policy

以下情況 fail closed，不發布新產物：

- canonical DB integrity／FK 檢查失敗。
- stable ID 缺失或重複。
- manifest 指向不存在檔案。
- JSON schema validation 失敗。
- Website 與 VRChat 對同一 record 的 time／route／verification 映射不一致。
- private evidence 洩漏檢查失敗。
- 既有 required field 或 route 消失。
- generated artifact 只有部分完成。

生成應先寫入 staging directory，全部驗證通過後再原子替換 publish set。

---

# 10. Contract tests

最低測試矩陣：

| Test | Website | VRChat |
| --- | --- | --- |
| manifest route 可解析 | 必要 | index／base 必要 |
| legacy fields 存在 | `verified`、`proof_text` | `v` |
| accepted mapping | true | 1 |
| non-accepted mapping | false | 0 |
| migration null fallback | 與 baseline 相同 | 與 baseline 相同 |
| record count／ranking | 與 baseline 相同 | Top N 與 baseline 相同 |
| ID stability | track／route／player／vehicle | track／route |
| privacy | 無 private evidence | 無 evidence payload |
| schema validation | rich contract | compact contract |
| deterministic rebuild | semantic diff = 0 | semantic diff = 0 |

另外需以實際 `timeattack.js` 與至少一個 VRChat consumer 版本做 integration test，不能只驗證 JSON parse。

---

# 11. Deprecation

移除 legacy 欄位前必須同時滿足：

1. 有完整 consumer inventory。
2. 網站與所有已知 VRChat world 已支援新 schema。
3. 至少一個明確遷移期內提供 parallel output。
4. metrics／build report 顯示無 legacy fallback。
5. 提供 rollback。
6. 使用 major schema version。
7. 經資料管線與網站發布 gate 核准。

在此之前，`verified`、`proof_text` 與 `v` 是正式相容 contract，不是可任意清理的舊欄位。

---

# 12. 禁止事項

- 手改 generated JSON 以修正 canonical data。
- 從 Website JSON 反向覆寫 SQLite。
- 讓 Site repo 自行發明新的 canonical ID。
- 把 private Evidence 塞入 `proof_text`。
- 把 VRChat `rev` 當 audit revision。
- 在同一 release 新增新模型並移除 legacy 欄位。
- 以 display name 作跨來源 identity merge。
- 在 schema 未驗證時承諾錯誤的 FK 或 table 名稱。
