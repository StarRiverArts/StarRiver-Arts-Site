# VRChat Racing Hub T0 產品規格草案

**文件代號：** D4  
**版本：** Draft 0.1 / Goal Aligned  
**狀態：** Product Draft / Authority Baseline  
**日期：** 2026-07-16  
**治理 SSOT：** `docs/SSOT.md`（repo 治理）  
**相關正式文件：**

- `docs/project-t/t-1-product-spec.md`
- `docs/project-t/t-1-implementation-plan.md`
- `docs/project-t/t-1-gap-analysis.md`
- `docs/project-t/t-1-adapter-policy.md`

---

# 0. 文件目的

本文件定義 VRChat Racing Hub T0 的產品目標、角色、資料 authority、最小交換契約與完成條件。

本文件不建立新的 Master Charter，不取代 `docs/SSOT.md`，也不宣稱尚未取得證據的 pipeline、SQLite 或 Udon consumer 行為已被確認。

---

# 1. 產品目標

T0 讓彼此獨立的 VRChat 賽車資料來源保留自己的 authority，同時由 Hub 取得 versioned snapshot、保存 provenance、正規化資料，並生成可供網站與 VRChat 世界使用的 Board outputs。

T0 的成功不是「把所有資料收進同一個中央 SSOT」，而是讓使用者能知道：

1. 一筆資料來自哪個 Source。
2. Hub 讀取的是哪個 source revision。
3. 哪一套 Board 規則把資料投影成目前結果。
4. 發生衝突、更正或離線時，應向哪一層處理。

---

# 2. T-1 與 T0 邊界

| 範圍 | T-1 | T0 |
| --- | --- | --- |
| 營運模式 | Project T 單一主要維護方 | 多個獨立 Source 加上 Hub／Board |
| 正式紀錄 | Project T canonical store | 各 Source 對自己的 namespace authoritative |
| 聚合 | 非核心目標 | Hub 正規化多來源 snapshot |
| 公開輸出 | Project T Website／VRChat outputs | 多種 Board outputs |
| 第一優先 | 玩家投稿與世界作者接入 | provenance-preserving aggregation |

T-1 可以在 T0 中成為一個 Source。Hub 也可以代管一個 Hosted Source，但該 Hosted Source 只對自己的 source namespace authoritative；不能因此讓 Hub 對其他外部 Source 取得反向修改權。

---

# 3. 核心角色與旅程

| 角色 | 旅程 | 需要的保證 |
| --- | --- | --- |
| 玩家 | 從 Board 找到紀錄與來源 | source、revision、board policy 可追溯 |
| Source 維護者 | 發布與更正自己的資料 | Hub 不反向覆寫 Source |
| Board 維護者 | 選來源與規則生成榜單 | 每次 build 可重現、可版本化 |
| 世界作者 | 在 VRChat 讀取指定 Board | 穩定 URL、compact contract、更新與錯誤說明 |
| 活動主辦方 | 將活動或結果交給適當 Source | authority 與更正入口明確 |
| Hub 維護者 | 擷取、驗證、正規化與發布 | provenance、source revision、失敗狀態完整 |

---

# 4. 三層 Authority Model

```text
A. Source-authoritative data
          ↓ versioned exchange + provenance
B. Hub normalized store / build cache
          ↓ board policy + generator
C. Generated Board outputs
```

三層資料可以內容相似，但 authority、修改入口與生命週期不同。不得因欄位相同就把它們視為同一份 SSOT。

## 4.1 A｜Source-authoritative Data

每個 Source 對自己的 namespace 與 source-local facts authoritative，包括：

- source-local record／event／world／route。
- source-local ID、revision、evidence 與 validity。
- source 規則、更新與刪除狀態。
- 對來源資料的正式更正。

Source 以 versioned exchange contract 對外發布 snapshot 或增量。Hub：

- 不反向寫回外部 Source。
- 不靜默修改 Source 的原始主張。
- 不把 normalized copy 宣稱為原 Source 的新版本。
- 遇到錯誤時建立 Hub annotation、mapping decision 或 upstream correction request。
- 重新擷取後仍保存曾參與公開 build 的 source revision。

Hosted Source 可由 Project T／Hub 營運，但必須有獨立 `source_id`、revision 與更正流程；其 authority 不擴張至其他 Source。

## 4.2 B｜Hub Normalized Store／Build Cache

Hub normalized store 保存可重建 Board 的來源 snapshot、正規化結果與 mapping 決策。它不是外部 Source 的 authority。

prototype 可使用 SQLite；需要多人持續寫入、高併發 API、複雜權限或多服務部署時可評估 PostgreSQL。資料庫選型不改變 authority。

每個匯入實體至少要能追溯：

```yaml
source_id: source_example
source_entity_type: record
source_entity_id: record_123
source_revision: "rev-or-version-from-source"
source_schema_version: "1.0"
source_fetched_at: "2026-07-16T12:00:00Z"
source_payload_hash: "content-hash"
normalized_entity_id: hub_record_456
normalizer_version: "normalizer-version"
mapping_revision: "mapping-revision"
```

若 Source 不提供 entity-level revision，Hub 可記錄 snapshot revision 與 payload hash，但必須標示 evidence level，不可自行捏造 source revision。

Hub 內部應分開保存：

- immutable／versioned source snapshot metadata。
- normalized entities。
- source-to-normalized identity mappings。
- dedupe／conflict assertions。
- Hub annotations。
- Board build inputs。

Identity mapping 與 dedupe 是 Hub 判斷，不得覆寫原 Source ID。

## 4.3 C｜Generated Board Outputs

Board output 是由指定 source snapshots、normalization version 與 Board policy 生成的公開 projection。

Board output：

- 不是 SSOT。
- 不接受人工直接修資料。
- 可以完整重建。
- 必須有 schema version、build revision、generated time 與輸入 provenance。
- 必須能指出使用的 Source 與 source revision。
- 若規則或輸入改變，產生新 build，不覆寫歷史 authority。

不同 Board 可以使用同一筆 normalized data，但依不同範圍、資格、排序或呈現規則產生不同結果。性質不同的相同資訊應保留各自語意，例如 Source title、Board title 與 record description 不共用單一 copy 欄位。

---

# 5. Source Exchange 最小契約

T0 的第一版 exchange 應至少包含：

## 5.1 Source Manifest

- `source_id`。
- display name。
- schema version。
- snapshot／revision ID。
- generated／published time。
- data endpoints 或檔案清單。
- authority scope。
- contact／correction channel。
- optional signature／integrity metadata。

## 5.2 Records

- source-local record ID。
- player／vehicle／world／route references。
- result／time 與日期。
- source-local status。
- evidence summary 或受限 reference。
- record revision／updated time。
- deleted／rejected／superseded 表示方式。

## 5.3 Optional Domains

- worlds／routes。
- players／vehicles。
- events／matches／results。
- teams。

Optional domain 不得成為最小 Record Source 的強制前置條件。

## 5.4 Privacy

- private contact、private Evidence URL、moderation note 與 access token 不得進公開 exchange。
- Source manifest 的 correction channel 應能對外使用，但不暴露 private operator credential。
- Hub public output 採 allowlist，不以「未特別標 private」作為公開依據。

---

# 6. Board 與 VRChat Output

Board policy 至少固定：

- included sources 與 revisions。
- world／route／vehicle scope。
- record eligibility。
- sorting 與 tie-breaker。
- duplicate／conflict policy。
- maximum entries。
- stale source 與 offline behavior。
- build revision 與 regeneration procedure。

VRChat output 應由 Board projection 再產生 route-specific compact contract。T0 不要求 VRChat consumer 直接讀完整 Hub store，也不在世界內執行多來源 aggregation。

下列事項在取得真正 Udon consumer 證據前保持 pending：

- compact `v` 的語意。
- 欄位順序依賴。
- null 支援。
- 最大 payload／榜單筆數。
- cache、timeout、offline 與 schema mismatch 行為。
- 新增欄位是否安全。

---

# 7. T0 第一個產品切片

T0 第一個切片只驗證 authority 與可追溯聚合，不先建立完整 federation：

1. 兩個可公開測試的 versioned Sources。
2. 每個 Source 有 manifest、records 與 revision。
3. Hub 保存 source snapshot、provenance 與 normalized mapping。
4. 至少一筆 identity／duplicate 衝突以顯式 assertion 處理。
5. 生成至少兩個規則不同的 Boards。
6. 每個 Board 可追溯 sources、revisions、policy 與 build。
7. 一條 route 的 Board output 可被實際 VRChat consumer 讀取。
8. Source correction 經新 revision 進入 Hub；Hub 不反向覆寫 Source。
9. 一個 Source 離線或 schema 不符時，Board 有可預期行為。

---

# 8. 非目標

第一個 T0 切片不要求：

- 全球唯一官方排行榜。
- Hub 取得外部 Source 的寫入權。
- 全自動跨社群 identity merge。
- 完整登入、多租戶後台或即時 API。
- 所有活動、車隊與 Evidence 型態。
- 在 VRChat 內執行聚合。
- 將 T-1 canonical store 改成 Hub cache。
- 以新公開 Charter 取代 `docs/SSOT.md`。

---

# 9. 治理與變更控制

- repo governance 依 `docs/SSOT.md`。
- Source、Hub mapping 與 Board policy 必須分開審查。
- production credential、私密營運策略與 private evidence 不進公開 repo。
- 以 least privilege 管理 Source fetch、Hub build 與發布權限。
- breaking exchange／Board contract 必須使用新 major version 與平行遷移。
- 每次 release 記錄 inputs、versions、owner、rollback／recovery 與已知限制。
- 未取得直接證據的欄位或 consumer 行為必須標示 pending。

---

# 10. 完成條件

T0 authority baseline 可視為完成，至少必須證明：

- [ ] 每筆 normalized entity 可追溯 Source、source entity ID 與 revision／snapshot。
- [ ] Hub 無法透過正常資料流反向覆寫外部 Source。
- [ ] correction、deletion、rejection 與 supersession 有明確來源語意。
- [ ] identity mapping／dedupe 不改寫原 Source ID。
- [ ] Board output 可由固定 inputs 與 policy 重建。
- [ ] Board 顯示 source provenance 與 build revision。
- [ ] private metadata 未進 exchange 或 public Board。
- [ ] 一條 Board route 已由實際 VRChat consumer 驗證。
- [ ] Source 離線、schema 不符與 stale snapshot 行為已測試。
- [ ] compact `v` 與其他 Udon contract 只採用已實證語意。

---

# 11. Open Questions

- Source manifest 與 records 的正式 schema 與 major version。
- Source revision 是 snapshot-level、entity-level 或兩者並存。
- correction request 的公開協定與回覆狀態。
- Hub annotation 是否進 public Board，及其呈現規則。
- identity mapping 的人工 review 與 dispute 流程。
- Board policy 的設定格式與版本方式。
- stale source 可接受時間與 offline fallback。
- Udon payload 大小、欄位與快取限制。
- T-1 Hosted Source 與外部 Source 的共同 conformance tests。
