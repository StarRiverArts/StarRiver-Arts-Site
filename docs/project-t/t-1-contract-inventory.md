# Project T T-1 Contract Inventory

**版本：** Draft 0.1 / Producer Contract Freeze  
**日期：** 2026-07-16  
**範圍：** StarRiver Arts Site 現行 Website／VRChat generated contracts

---

# 1. 目的與 SSOT 邊界

本文件凍結 T-1 Phase 0 所需的 public path、discovery、identity key 與 legacy compatibility surface。

它不重複列出所有資料欄位：

- 完整 projection map：`t-1-current-schema-map.md`
- 欄位轉換與 deprecation：`t-1-adapter-policy.md`
- 缺口與優先級：`t-1-gap-analysis.md`
- database proposal：`t-1-migration-plan.md`

目前可驗證的是 **producer output 與 Site consumer**。實際 VRChat／UdonSharp consumer source 不在 connector 可見範圍，因此「payload 中存在」不等於「已證實 consumer 讀取」。

---

# 2. Baseline

| 項目 | 2026-07-14 generated snapshot |
| --- | --- |
| Website schema | `0.5.0` |
| build state | `live` |
| source label | `CodeTools/StarRiverSite/play/RacingClub/TimeAttack/ta_data.sqlite` |
| valid runs | 927 |
| verified runs | 0 |
| unverified valid runs | 927 |
| event cards | 0 |

數量只用於 migration snapshot comparison，不是固定產品規格。

---

# 3. Website discovery contract

## 3.1 Manifest path

```text
play/RacingClub/TimeAttack/data/manifest.json
```

Required top-level fields：

- `schema_version`
- `generated_at`
- `build_state`
- `source_label`
- `routes`
- `verification_states`

## 3.2 Manifest route keys

| Key | Current target | Freeze |
| --- | --- | --- |
| overview | `summary.json` | path／key 不改名 |
| tracks | `tracks.json` | path／key 不改名 |
| players | `players.json` | path／key 不改名 |
| vehicles | `vehicles.json` | path／key 不改名 |
| events | `events.json` | 保留並 additive 擴充 |
| catalog | `catalog.json` | path／key 不改名 |
| info | `info.json` | path／key 不改名 |
| review | `review.json` | 保留 legacy fields |
| trackmap | `trackmap.json` | path／key 不改名 |

新增 route 必須 additive，並由 manifest discovery；不得只在 frontend 硬編檔名。

## 3.3 Site fetch behavior

`timeattack.js`：

- 先 fetch manifest。
- 再由 `manifest.routes[dataKey]` fetch page data。
- detail view 共用 list artifact：
  - `track → tracks`
  - `player → players`
  - `vehicle → vehicles`
- nested page 可透過 `data-base` 調整相對路徑。
- fetch／parse 失敗會進入 data load error。

這些行為是 integration test 的 baseline。

---

# 4. Identity 與 URL freeze

| Surface | Current key／pattern | Policy |
| --- | --- | --- |
| Track detail | `track.html?id=<track_world_code>` | key 與 query parameter 保留 |
| Player detail | `player.html?id=<player_id>` | key 與 query parameter 保留 |
| Vehicle detail | `vehicle.html?id=<vehicle_model_code>` | key 與 query parameter 保留 |
| World／track | `track_world_code` | 不因 display name 改變 |
| Route | `route_code` | scope／uniqueness 待 canonical 驗證，現值不重命名 |
| Player | `player_id` | 不以 display name 重建 |
| Vehicle | `vehicle_model_code` | 不因 model display rename 改變 |
| Event | `event_code` 僅有 generated 文案證據 | 不在驗證前定義為 stable canonical ID |

Event detail 若新增，優先沿用 `event.html?id=<event_id>`；正式 pattern 須在 sample contract review 固定後實作。

---

# 5. Website payload freeze

## 5.1 `summary.json`

Consumer-relevant surfaces：

- page metadata／sidebar。
- metric、count、board cards。
- `recent_runs[]`。
- track options／category styles。

Record projection 目前依賴：

- track／route code。
- player ID／display name。
- vehicle model code／name。
- time／date／platform。
- `verified`／`proof_text`。
- record badge fields。

新 record ID 可 additive 輸出，但不得要求舊 consumer 立即使用。

## 5.2 `tracks.json`

Required surfaces：

- `boards[]`。
- board 的 `track_world_code`。
- `routes[]` 與 `route_code`。
- route／player／vehicle rows。
- numeric time 與 display time。
- rank／delta／date／platform。
- `verified`／`proof_text`。
- badge fields。

`tracks.json` 為大型 artifact；inventory 工具必須支援 blob／stream，不能把 contents API 的省略回應判成空檔。

## 5.3 `players.json`

Freeze：

- `player_cards[]`。
- `player_id`。
- profile／stats／usage／record rows 的現行 shape 在 minor version 只可 additive。
- team display 不是 stable team identity。

## 5.4 `vehicles.json`

Freeze：

- `vehicle_cards[]`。
- `vehicle_model_code`。
- model／variant 投影只能 additive 擴充，不能在未有 lookup migration 下合併 code。

## 5.5 `events.json`

目前是 scaffold：

- page metadata／metrics／sections。
- `event_cards: []`。
- 文案提及 `events_meta` 與 `event_code`。

Policy：

- 保留現有 path 與 manifest route。
- 新 event fields additive。
- placeholder 文案不是 canonical schema。
- Event 資料先進 SQLite，再由 generator 產生。
- design／future notes 在正式 Event UI 上線時應改由文件保存，不繼續作公開內容。

## 5.6 `review.json`

Legacy freeze：

- `verified`。
- `proof_text`。
- verified／unverified metrics。
- review cards／timeline／sections 的現行 consumer shape。

`SHOW_VERIFICATION = false` 是 presentation policy，不代表欄位可移除。

## 5.7 Supporting artifacts

- `catalog.json`
- `info.json`
- `trackmap.json`

`info.json` 目前把 Sheet／CSV 描述為唯一輸入，但 manifest 宣告 SQLite source label。這是 generator copy gap；不得在 Site repo 手改產物，應由 pipeline 修正後重建。

---

# 6. VRChat producer contract freeze

## 6.1 Stable paths

```text
play/RacingClub/TimeAttack/vrc/index.json
play/RacingClub/TimeAttack/vrc/worlds.json
play/RacingClub/TimeAttack/vrc/omni.json
play/RacingClub/TimeAttack/vrc/recent.json
play/RacingClub/TimeAttack/vrc/*.head.json
play/RacingClub/TimeAttack/vrc/<route-specific>.json
```

實際 route filenames、base URL 與 index references 不可在 consumer inventory 前改名。

## 6.2 Observed producer fields

### Index

- schema
- updated
- base
- provisional
- tracks：code／zh／en／system／file／routes

### Worlds

- schema
- updated
- base
- worlds：code／zh／en／system／world_url

### Omni／head

- schema
- track
- system
- updated
- routes／records
- `rev`
- provisional／status

### Route board

- track／route bilingual identity
- system
- updated
- status／provisional
- player／vehicle board

### Recent row

- `track`
- `route`
- `name`
- `sub`
- `t`
- `t_ms`
- `date`
- `v`

## 6.3 `v` Evidence Status（已證實，2026-07-17）

- producer：`build_vrc_leaderboard.py` 輸出 `v = int(record.verified or 0)`。
- consumer：`siteResource/vrc-unity/SRLeaderboardBoard.cs`／`SRRecentBoard.cs` 讀 `v == 1` 顯示 ✓。
- **`v` = verified compact flag，語意證實**；mapping 規則由 Adapter Policy §4.3 固定。

`v` 仍屬 Frozen class：不可移除、改名、改型別。

## 6.4 Consumer evidence（2026-07-17 已補完）

實際 UdonSharp consumer（`siteResource/vrc-unity/`）盤點結果：

- 讀取欄位：`name`、`t`、`t_ms`、`sub`、`date`、`v`、`status`、`provisional`、`updated`、track/route bilingual labels。
- 解析方式：VRCJson `DataDictionary` key 查找——**unknown field tolerant**，additive 欄位安全。
- `provisional = true` 顯示「臨時榜/未驗證」字樣；`status` 缺值 fallback `"live"`。
- `rev`／`.head.json` 用於輕量輪詢與快取失效（producer 端為 routes 內容 SHA1）。
- URL 由 Unity Inspector 設定（`SerializeField`），非硬編路徑常數；路徑變更仍需逐世界重設，Frozen 政策不變。

timeout／offline 細部行為與 Top N 上限的 world 內實測，留在 Phase 7 integration test 完成；不阻擋 schema formalization 前置作業。

---

# 7. Compatibility classes

| Class | 定義 | 例子 |
| --- | --- | --- |
| Frozen | 不可在 minor version 移除／改名／改型別 | paths、manifest route、identity keys、`verified`、`proof_text`、`v` |
| Additive | 可新增 optional field／route | Event fields、新 record ID、public review summary |
| Generated-only | 只能由 pipeline 修改 | `data/*.json`、`vrc/*.json` |
| Pending evidence | 不得先承諾 | SQLite table names、Event ID、actual Udon required fields |
| Private | 絕不進 public payload | private evidence、tokens、local paths、audit private notes |

---

# 8. Contract test baseline

每次 generator／migration 變更至少測試：

1. manifest route target 全部存在且可解析。
2. Website JSON schema／shape validation。
3. `timeattack.js` overview、track、player、vehicle、events、review loading。
4. 既有 ID query parameter 仍能定位同一 entity。
5. record count、ranking、time、date 與 baseline 的預期差異。
6. `verified`／`proof_text` mapping，以及 `v` producer baseline；`v` 語意須由 pipeline／consumer evidence 補完。
7. VRC index → route file reference 完整。
8. Top N、offline／missing behavior。
9. private Evidence leakage scan。
10. 相同 canonical snapshot 的 deterministic rebuild。

Volatile `generated_at` 可在 semantic snapshot test 中正規化，不應掩蓋其他差異。

---

# 9. 不得直接修改

- `play/RacingClub/TimeAttack/data/*.json`
- `play/RacingClub/TimeAttack/vrc/*.json`
- 既有 identity code
- manifest route／URL／query parameter
- `verified`／`proof_text`／`v`
- generated search／LLM index

正確修改點：

```text
canonical data / importer / lookup / generator / adapter
                    ↓ rebuild + validate
generated contracts
                    ↓ reviewed cross-project refresh
Site repo
```

---

# 10. Phase 0 剩餘 Gate（2026-07-17 更新）

- SQLite schema dump。 → ✅ schema-map §9.2
- importer／generator／validator source map。 → ✅ schema-map §9.3
- public field → query／adapter map。 → ✅ schema-map §9.3
- stable record ID 與 lookup strategy。 → ✅ schema-map §9.4
- `event_code` source。 → ✅ schema-map §9.5
- actual VRChat consumer field inventory。 → ✅ 本文件 §6.4
- pipeline maintainer review。 → 待 owner 審核本版

**Phase 0 證據補完；Phase 1 migration 可以開始。** Event UI 仍依 implementation plan 的順序（canonical data 先行）。
