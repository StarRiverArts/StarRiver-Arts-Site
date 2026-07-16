# Project T T-1 產品規格與版本路線

**文件代號：** D3  
**版本：** Draft 0.11 / Product Goal Aligned  
**狀態：** 可供實作與內部審查  
**主要維護者：** StarRiver  
**治理 SSOT：** `docs/SSOT.md`（repo 治理）；本文件為 T-1 產品規格  
**建立日期：** 2026-07-16  

---

# 0. 文件目的

本文件定義 Project T 在 **T-1 階段**的完整產品範圍、資料框架、頁面結構、維護流程、輸出格式與完成條件。

T-1 是一套由單一主要維護方管理、可以實際運作的 VRChat 賽車資訊與計時平台。  
它的任務不是先解決所有國際社群的治理與互信問題，而是先把以下能力做完整：

- 世界與路線索引
- 計時紀錄
- 玩家、車輛與車隊頁
- 活動與比賽
- 事後補登
- 證據與審核狀態
- 網站與 VRChat 共用輸出
- 穩定的資料維護與檢查流程

T-1 完成後，才作為 T0 多來源、多社群架構的實體基礎。

---

# 0A. 規範性產品目標與角色

本節是 T-1 的產品判斷基準。若後續資料模型、頁面或 phase 與本節衝突，應先修正實作規劃，不另建競爭性的 Goal 或 Charter 文件。

## 0A.1 產品目標

Project T T-1 要讓符合公開規則的玩家能投稿計時紀錄，收到不洩露個資的收件與狀態回應，經最小可行審核後出現在網站榜單，並讓世界作者能把同一份 Project T 榜單接入 VRChat 世界。

活動主辦方可以提供賽事與結果資料，但第一個產品切片不以完整 Event／Match 系統為前提。Project T 對正式資料、審核結果、網站發布與自有輸出負責。

## 0A.2 核心角色

| 角色 | 主要需求 | T-1 必須提供 |
| --- | --- | --- |
| 玩家 | 投稿紀錄並知道處理進度 | 公開規則、投稿入口、opaque receipt、最小狀態頁 |
| 活動主辦方 | 提供活動與結果資料 | 可追溯匯入方式；完整 Event／Match 於後續 phase |
| 世界作者 | 在自己的世界顯示 Project T 榜單 | 穩定 route output、接入文件、錯誤與更新行為說明 |
| 維護者 | 審核、修正、發布且不破壞舊 consumer | canonical workflow、validator、adapter、audit trail |

## 0A.3 T-1 與 T0 邊界

- T-1 是 Project T 單一營運方可完整操作的產品。
- T0 是多來源 Hub／Board 架構，另由正式 T0 規格定義。
- T-1 的 canonical store 不因 T0 聚合需求改成外部來源的 authority。
- T0 不得被用來延後 T-1 的玩家投稿與世界作者接入旅程。

---

# 1. 產品定位

## 1.1 T-1 是什麼

Project T T-1 是：

- Project T 世界與賽道的資訊入口
- 繁體中文 VRChat 賽車社群的活動與紀錄平台
- 玩家、車輛、車隊、活動、比賽與計時紀錄的索引
- VRChat 世界內排行榜模組的資料來源
- 未來 VRDP 與 VRChat Racing Hub T0 的可運作原型

## 1.2 T-1 不是什麼

T-1 不是：

- 全球唯一官方排行榜
- 國際 Source Registry
- 多社群 Record Shard 聚合器
- 完整登入與多租戶管理平台
- 所有 VRChat 賽車活動的中央裁判系統
- T0 的縮小版

T-1 是一套單一主要維護方可持續運作的完整產品。

---

# 2. 現有基礎

目前已存在或已有原型的能力：

## 2.1 計時資料

- 已維護近千筆計時紀錄
- 已有玩家、車輛、世界、路線與時間的關聯
- 可匯出靜態 JSON
- 可生成網站榜單與索引頁

## 2.2 網站頁面

- Time Attack 總覽
- 賽道頁
- 玩家頁
- 車輛頁
- 世界或專案頁
- 紀錄查詢與展示

## 2.3 VRChat 整合

- 世界內排行榜模組已能讀取 Project T 自有賽道資料
- 已證明 GitHub Pages 靜態資料可作為 VRChat 消費端
- 可沿用同一輸出方式擴張到其他世界

## 2.4 外部需求

- 已有多位玩家詢問如何投稿紀錄
- T-1 已被外部社群看過
- 擴張需求來自實際使用，而非單純概念推演

---

# 3. T-1 完成定義

T-1 可被視為完成，至少需要具備以下能力：

1. 世界與路線可以完整索引  
2. 活動可以建立、更新、進行、結束與封存  
3. 一個活動可以包含多場比賽  
4. 比賽結果可以連結玩家、車隊、世界、路線與車輛  
5. 活動與比賽可以事後補登  
6. 玩家頁可以由紀錄與活動資料自動生成  
7. 車隊頁可以連結成員、活動與成績  
8. 計時紀錄可以保存證據型態與審核狀態  
9. 網站與 VRChat 世界內模組使用相容的輸出資料  
10. 維護流程不需要完整登入後台也能日常運作  
11. 資料檢查工具可以發現缺漏、錯誤與重複  
12. 所有主要頁面都能互相導覽  
13. 舊活動與舊比賽能在不破壞現有資料的前提下補登  
14. 計時紀錄的修正、失效與刪除具備基本追溯  
15. T-1 的資料結構可以被 T0 延伸，而不需要全部重寫  

---

# 3A. 端到端產品驗收

資料表、JSON 或頁面個別存在，不等於產品旅程完成。T-1 必須以以下端到端結果驗收：

1. **玩家旅程：** 讀取規則 → 投稿 → 取得 receipt → 查詢狀態 → 紀錄被接受或收到可理解的處理結果 → 榜單可見。
2. **主辦方旅程：** 提供來源與結果 → 經 importer／validation → 可追溯至公開活動或紀錄；第一個切片可先採受控人工匯入。
3. **世界作者旅程：** 選定路線 → 依文件設定 URL／contract → 在 VRChat 顯示榜單 → 能處理更新、離線與 schema 不符。
4. **維護者旅程：** 收件 → 最小審核 → 寫入 canonical store → 生成網站與 VRChat output → 驗證 → 發布／回復。

第一個產品切片固定為單一路線的玩家投稿旅程，並包含網站榜單、VRChat 顯示與世界作者接入文件。Event、完整 Match、Team 與進階 Evidence 不得成為此切片的前置條件。

---

# 4. 資訊架構

建議網站主要結構：

```text
Project T
├─ Worlds
│  ├─ World Index
│  └─ World Detail
│
├─ Routes
│  ├─ Route Index
│  └─ Route Detail / Leaderboard
│
├─ Time Attack
│  ├─ Global Overview
│  ├─ Route Leaderboard
│  ├─ Submit Record
│  ├─ Submission Status
│  └─ Record Detail
│
├─ Events
│  ├─ Upcoming
│  ├─ Ongoing
│  ├─ Completed
│  └─ Archive
│
├─ Matches
│  └─ Match Result
│
├─ Players
│  ├─ Player Index
│  └─ Player Detail
│
├─ Teams
│  ├─ Team Index
│  └─ Team Detail
│
├─ Vehicles
│  ├─ Vehicle Index
│  └─ Vehicle Detail
│
└─ API / VRChat Output
```

---

# 4A. 資料架構與 SSOT

本章固定 T-1 的資料權責。章節編號採 4A，是為避免在 Draft 1.0 前改動既有章節引用。

## 4A.1 三層資料架構

```text
A. Authoring / Import Layer
   投稿 / 表單 / CSV / Discord Bot / YAML template / External JSON
                              ↓ Importer + Validation
B. Canonical Storage Layer
   T-1: SQLite (ta_data.sqlite)
   T0 prototype: SQLite
   T0 scaled deployment: PostgreSQL
                              ↓ Generator + Adapter
C. Generated Contract Layer
   Website JSON / Event JSON / Search Index / VRChat compact JSON
```

**只有 Canonical Storage 是內部唯一事實來源。** 投稿格式與公開輸出都不得形成第二套 SSOT。

目前網站 manifest 將資料來源標示為 `CodeTools/StarRiverSite/play/RacingClub/TimeAttack/ta_data.sqlite`。實體資料表、索引與 importer 的最終盤點仍以 `VR_RacingClubTW` 或實際資料管線 repo 為準；本網站 repo 不反向定義或覆寫該資料庫。

## 4A.2 格式權責

| 格式／層級 | 正式角色 | 可否直接修改正式資料 |
| --- | --- | --- |
| YAML | 文件範例、人工匯入模板、設定、fixture | 否；必須經 importer 與 validation |
| CSV／表單／Discord | 投稿與批次匯入來源 | 否；必須先寫入 canonical store |
| External JSON | 跨社群 versioned exchange 或匯入來源 | 否；驗證與正規化後才可寫入 |
| SQLite | T-1 與 T0 prototype canonical store | 是；須透過受控 migration／維護工具 |
| PostgreSQL | T0 多人、高併發與多服務階段 canonical store | 尚未啟用 |
| Website JSON | 網站讀取的 generated public contract | 否；由 generator 重建 |
| VRChat JSON | 路線別 compact generated contract | 否；由 adapter／generator 重建 |

JSON 可以同時是「外部匯入格式」與「公開輸出格式」，但兩者必須有不同 schema、驗證入口與資料流；任何 JSON 都不因放入 repo 而自動成為 canonical source。

## 4A.3 T0 延伸原則

T0 prototype 沿用 SQLite，並以 versioned JSON 作為 Source Shard、Record Shard 與 Board Output 的跨社群交換格式。外部社群不需交付資料庫檔案；Hub 匯入 JSON 後，須保存 provenance 並正規化至自己的 canonical store。

當系統出現多人同時寫入、持續寫入、複雜權限、高併發 API 或多服務部署需求時，再將 canonical store 遷移至 PostgreSQL。資料模型與 migration 應避免依賴無法移植的 SQLite 特有設計。

---

# 5. 核心資料實體

> 本章及後續章節的 YAML 僅用於表示概念模型、人工匯入格式與測試 fixture，不表示正式儲存必須採用 YAML。正式資料必須經 importer／validation 寫入 canonical SQLite。

---

## 5.1 World｜世界

### 用途

世界是 Project T 中最上層的空間單位，連結路線、活動、比賽與排行榜。

### 必要欄位

```yaml
id: world_sacc_sadamine
name:
  zh_hant: "Sacc 定峰"
  en: "Sacc Sadamine"
vrchat_world_id: null
vrchat_url: null
authors: []
systems:
  - sacc
status: active
routes: []
```

### 選配欄位

- 縮圖
- 世界介紹
- 世界作者介紹
- 版本資訊
- 支援平台
- PC / Quest 相容性
- 官方公告
- Project T 編輯介紹
- 相關活動
- 相關榜單
- 世界內排行榜 URL

---

## 5.2 Route｜路線

### 用途

Route 是計時紀錄、活動與比賽的主要空間單位。

### 必要欄位

```yaml
id: route_full_course_downhill
world_id: world_sacc_sadamine
name:
  zh_hant: "全程下行"
  en: "Full Course Downhill"
direction: downhill
status: active
```

### 選配欄位

- 起點
- 終點
- 路線長度
- 路線描述
- 車種限制
- 計時系統
- 版本
- 對應榜單
- 路線縮圖

---

## 5.3 Player｜玩家

### 原則

玩家頁以自動生成為主，不要求所有玩家主動維護。

### 必要欄位

```yaml
id: player_example
display_name: "Example"
aliases: []
status: active
```

### 選配欄位

- VRChat 使用者連結
- 頭像
- 自介
- 社群連結
- 所屬車隊
- 代表車輛
- 主要紀錄
- 參與活動
- 比賽結果

### 身分原則

- 玩家不被強迫標記為「中文玩家」或其他文化身分
- 社群榜的歸屬主要由紀錄維護來源決定
- Alias 不得直接覆寫玩家主名稱
- 玩家合併需要保留舊 Alias

---

## 5.4 Vehicle｜車輛

### 必要欄位

```yaml
id: vehicle_example
name: "Example Vehicle"
system: sacc
author: null
status: active
```

### 選配欄位

- 車種
- 驅動形式
- 車輛分類
- 可用世界
- 對應規則
- 車輛縮圖
- 計時紀錄
- 活動參賽結果

---

## 5.5 Team｜車隊

### 必要欄位

```yaml
id: team_example
name: "Example Team"
status: active
members: []
```

### 選配欄位

- Logo
- 介紹
- 管理者
- Discord
- 社群連結
- 成員角色
- 參與活動
- 團隊成績
- 團隊紀錄

### T-1 維護方式

- 可由 StarRiver 代為建立
- 可由車隊提供資料後人工更新
- 暫不要求完整認領與權限系統

---

## 5.6 Event｜活動

Event 是較高層級的活動容器。

一個 Event 可以包含：

- 宣傳資訊
- 活動規則
- 世界與路線
- 報名資訊
- 賽程
- 多場 Match
- 最終結果
- 影像、直播與公告
- 事後歸檔

### Event 必要欄位

```yaml
id: event_2026_sacc_sadamine_0718
name:
  zh_hant: "Sacc 定峰錦標賽"
  en: "Sacc Sadamine Tournament"
status: scheduled
event_type: tournament
organizers: []
start_time: "2026-07-18T22:00:00+08:00"
timezone: "Asia/Taipei"
worlds: []
format: {}
recording:
  mode: prospective
revision:
  created_at: "2026-07-16T00:00:00+08:00"
```

### Event 狀態

```text
draft
published
registration_open
scheduled
ongoing
completed
archived
cancelled
```

### Event 類型

```text
tournament
time_attack
race_meet
photography_meet
practice
exhibition
championship_round
community_event
other
```

---

## 5.7 Match｜比賽

Match 是 Event 底下可以獨立描述結果的競賽單位。

### Match 必要欄位

```yaml
id: match_sacc_sadamine_0718_r01
event_id: event_2026_sacc_sadamine_0718
match_type: battle
status: scheduled
world_id: world_sacc_sadamine
route_id: route_full_course_downhill
participants: []
result:
  status: pending
```

### Match 類型

```text
qualifying
time_attack
battle
race
heat
round
semifinal
final
team_battle
exhibition
other
```

### Match 狀態

```text
scheduled
ongoing
pending_result
final
corrected
cancelled
```

---

## 5.8 Participant Entry｜參賽身分

Participant Entry 是某位玩家或車隊在特定活動／比賽中的身分。

```yaml
entry_id: entry_player_a
player_id: player_a
display_name: "Player A"
team_id: team_example
vehicle_id: vehicle_example
registration_name: "Player A"
status: confirmed
seed: 1
notes: null
```

狀態：

```text
registered
confirmed
checked_in
withdrawn
disqualified
no_show
completed
```

---

## 5.9 Result｜結果

### 通用格式

```yaml
status: final
ranking:
  - entry_id: entry_player_a
    position: 1
    outcome: win
    score: null
    time_ms: null
    points: null
    qualified: true
notes: null
```

### 支援結果類型

- 計時排序
- 勝負制
- 名次制
- 積分制
- 晉級／淘汰
- 車隊對抗
- 多回合總和
- 並列
- 取消
- 失格

---

## 5.10 Record｜計時紀錄

### 必要欄位

```yaml
id: record_example
player_id: player_example
vehicle_id: vehicle_example
world_id: world_example
route_id: route_example
time_ms: 123456
record_date: "2026-07-16"
submission_date: "2026-07-16"
review_status: submitted
evidence: []
maintainer: starriver
```

### Review Status

```text
submitted
accepted
needs_review
invalidated
removed
superseded
```

### 狀態意義

- `submitted`：已收到，尚未完成審查
- `accepted`：符合 T-1 現行規則，可出現在預設榜單
- `needs_review`：資料不足或存在爭議
- `invalidated`：曾存在，但因作弊、錯誤或規則問題失效
- `removed`：因誤登、隱私、測試資料等原因移除
- `superseded`：被更正版取代

---

## 5.11 Evidence｜證據

### 目前已知型態

```text
fps_screenshot
event_live_confirmation
full_video
dedicated_observer
world_timer_output
result_screenshot
stream_archive
organizer_confirmation
other
```

### 格式

```yaml
id: evidence_001
type: full_video
status: accepted
url: null
submitted_by: player_example
reviewed_by: starriver
reviewed_at: null
notes: null
```

### Evidence 狀態

```text
submitted
accepted
rejected
inconclusive
missing
```

### 原則

Evidence 與紀錄有效性必須分開。

例如：

- 有完整錄影，但內容違規
- 有 FPS 截圖，但不足以涵蓋全程
- 活動現場認可，但之後因賽制錯誤修正

因此 Evidence 只回答「提供了什麼」，Review Status 才回答「是否被採納」。

---

## 5.12 Submission／Receipt｜投稿與收件

Submission 是「待處理請求」，Record 是「已進入正式紀錄模型的資料」。兩者狀態不得共用同一欄位，也不得以公開榜單是否出現來代替投稿狀態。

### 最小資料契約

```yaml
submission_id: submission_internal_id
receipt_token: opaque_random_token
submitted_at: "2026-07-16T12:00:00+08:00"
submission_status: received
target:
  world_id: world_example
  route_id: route_example
record_claim:
  player_id: player_example
  vehicle_id: vehicle_example
  time_ms: 123456
  record_date: "2026-07-16"
evidence_refs: []
submitter_contact_private: null
accepted_record_id: null
```

欄位名稱與 table 最終位置必須經 Phase 0 evidence gate 確認；本節先固定產品語意，不宣稱現有 SQLite 已有 Submission table。

### Submission Status

```text
received
queued
needs_information
accepted
rejected
withdrawn
```

- `received`：系統已收件，尚未排入審核。
- `queued`：已進入維護者處理佇列。
- `needs_information`：需要投稿者補充資料。
- `accepted`：已建立或連結正式 Record。
- `rejected`：本次投稿未被採納；公開狀態不顯示私密審核筆記。
- `withdrawn`：投稿者或維護者依規則撤回。

### Receipt 與隱私

- receipt token 必須不可預測，且不得由玩家 ID、Discord ID、email 或投稿內容推導。
- 公開狀態頁只顯示最小必要資訊，不輸出聯絡方式、私密 Evidence URL、內部註解或 reviewer 私密資訊。
- `submitter_contact_private` 只存在於受控資料層，不進 Website／VRChat generated JSON。
- 重複送出、token 遺失、撤回、資料保留與刪除規則必須在正式啟用投稿前定義。
- 投稿不要求先完成完整登入系統；若採無登入流程，receipt token 即為查詢憑證的一部分，但不能視為永久身分。
- `accepted_record_id` 建立後，Submission status 與 Record review status 仍各自保留。

---

# 6. 活動與比賽框架

## 6.1 Event 與 Match 關係

```text
Event
├─ 0..n Match
├─ 0..n Participant Entry
├─ 0..n Announcement
├─ 0..n Evidence
└─ 0..n Revision

Match
├─ 1 Event
├─ 1..n Participant
├─ 0..n Result
├─ 0..n Evidence
└─ 0..n Revision
```

### 原則

- 一場活動可以沒有 Match，例如純攝影會或自由計時聚會
- 一場 Match 必須屬於某個 Event
- Event 結果可以由 Match 彙整，也可以直接登記
- 舊活動可以在結束後補登

---

## 6.2 Event 頁面結構

建議公開順序：

1. 基本資訊  
2. 世界與路線  
3. 賽制與規則  
4. 報名資訊  
5. 賽程  
6. 參賽者／隊伍  
7. Matches  
8. 結果  
9. Replay／直播／相簿  
10. 公告與修正歷史  

---

## 6.3 Match 頁面結構

1. 比賽名稱與階段  
2. 所屬活動  
3. 世界、路線與車輛  
4. 參賽者  
5. 比賽結果  
6. 裁判／觀察者  
7. Evidence  
8. Replay  
9. 修正紀錄  

---

# 7. 事後補登

## 7.1 適用情境

- 活動已結束才建立頁面
- 舊活動資料重新整理
- 其他主辦方提供過往結果
- 只有部分比賽結果被保存
- 賽後補上錄影與裁判確認

## 7.2 Recording Mode

```text
prospective
retrospective
imported
```

- `prospective`：活動發生前或進行中建立
- `retrospective`：活動結束後補登
- `imported`：由舊資料表、公告或其他系統匯入

## 7.3 事後補登格式

```yaml
recording:
  mode: retrospective
  registered_at: "2026-07-20T12:00:00+08:00"
  registered_by: starriver
  original_event_date: "2026-07-18"
  organizer_confirmed: false
  completeness: partial
  missing_fields:
    - participants
    - final_result
```

完整度：

```text
complete
partial
minimal
unknown
```

## 7.4 原則

事後補登不自動等於低可信。

可信程度應由以下資料判斷：

- 是否有完整結果
- 是否有主辦確認
- 是否有直播或錄影
- 是否有原始公告
- 是否能交叉驗證

---

# 8. 修正、刪除與追溯

## 8.1 Revision Log

```yaml
revision_log:
  - revision: 1
    changed_at: "2026-07-20T12:00:00+08:00"
    changed_by: starriver
    change_type: create
    reason: "依 Discord 公告補登"
    fields_changed: []

  - revision: 2
    changed_at: "2026-07-21T09:30:00+08:00"
    changed_by: starriver
    change_type: correct
    reason: "主辦方更正冠軍名稱"
    fields_changed:
      - result.ranking
```

### Change Type

```text
create
update
correct
invalidate
remove
restore
merge
```

## 8.2 原則

紀錄可以修正、失效或刪除。

系統不要求錯誤資料永遠公開，但應盡可能保存：

- 變更時間
- 變更者
- 變更原因
- 前一狀態
- 是否屬於爭議處理

---

# 9. 頁面功能需求

## 9.1 World Index

顯示：

- 世界縮圖
- 世界名稱
- 作者
- 計時系統
- 路線數
- 最近活動
- 更新時間

## 9.2 World Detail

顯示：

- 世界介紹
- VRChat 連結
- 路線列表
- 路線紀錄
- 最近活動
- 歷史活動
- 相關比賽
- 世界內榜單資料 URL

## 9.3 Route Detail

顯示：

- 路線介紹
- 路線方向
- 世界連結
- Leaderboard
- 車輛分類
- 最新紀錄
- 歷史活動
- VRChat JSON URL

## 9.4 Event Index

分區：

- Upcoming
- Ongoing
- Completed
- Archive

顯示：

- 海報／縮圖
- 活動名稱
- 日期
- 世界
- 主辦
- 賽制
- 狀態

## 9.5 Event Detail

依第 6.2 節呈現。

## 9.6 Player Index

顯示：

- 玩家名稱
- 主要車隊
- 參賽次數
- 紀錄數
- 最近活動

## 9.7 Player Detail

自動彙整：

- 個人最佳成績
- 使用車輛
- 參與活動
- 比賽結果
- 所屬車隊
- Alias
- 選配自介

## 9.8 Team Detail

顯示：

- Logo
- 車隊介紹
- 成員
- 參與活動
- 比賽結果
- 團隊紀錄
- Discord

## 9.9 Vehicle Detail

顯示：

- 車輛資訊
- 作者
- 系統
- 主要使用者
- 計時紀錄
- 活動結果

---

# 10. 搜尋、篩選與導覽

T-1 最少需要：

## 搜尋

- 玩家名稱與 Alias
- 世界名稱
- 路線名稱
- 車輛名稱
- 車隊名稱
- 活動名稱

## 篩選

- 世界
- 路線
- 系統
- 車輛
- 活動狀態
- 日期
- 車隊
- Review Status

## 導覽

所有主要實體應能互相連回：

```text
World ↔ Route ↔ Record
Event ↔ Match ↔ Player
Player ↔ Team ↔ Vehicle
Event ↔ World ↔ Route
```

---

# 11. VRChat 輸出

## 11.1 目的

讓世界作者可以低摩擦地在自己的世界中加入排行榜。

## 11.2 優先輸出

以下為公開 JSON contract 的概念範例；實際 compact 欄位由 adapter policy 與 schema version 約束。

```json
{
  "schema_version": "t1-0.1",
  "world_id": "world_example",
  "route_id": "route_example",
  "generated_at": "2026-07-16T12:00:00+08:00",
  "records": [
    {
      "rank": 1,
      "player_name": "Player A",
      "vehicle_name": "Vehicle A",
      "time_ms": 123456,
      "record_date": "2026-07-16",
      "evidence_summary": ["fps_screenshot", "full_video"]
    }
  ]
}
```

## 11.3 輸出原則

- JSON 結構穩定
- 依世界／路線切分
- 避免一次載入所有紀錄
- 支援 Top N
- 支援快取
- 包含版本與更新時間
- 網站與 VRChat 使用同一份生成資料
- 不在 VRChat 端執行複雜聚合
- 只輸出顯示所需欄位

## 11.4 Legacy JSON 相容政策

現行網站 consumer 依賴 `verified` 與 `proof_text`；VRChat producer payload 則觀察到 numeric `v: 0 / 1`。真正 Udon consumer 是否讀取 `v`、其語意與 null／unknown 行為仍待 Phase 0 實證。以下是待驗證後採用的目標 adapter policy，不代表目前 pipeline flow 已獲證實：

```text
review_status + evidence[]
        → Website: verified + proof_text
        → VRChat target: v: 0 / 1
          (only after pipeline + consumer evidence)
```

相容規則：

- 在所有既有網站 consumer 完成升級前，保留 `verified` 與 `proof_text`；`v` 在完成 actual Udon consumer inventory 前原樣凍結，不移除、改名、改型別或重新解釋。
- 新欄位優先採 additive migration，不重新命名、不移除既有欄位，也不更動既有 URL 與 manifest route。
- Website 目標規則是只有 `review_status = accepted` 映射為 `verified = true`。VRChat 的 `v` mapping 必須先由 pipeline 與 consumer evidence 證實；遷移前 adapter 只保留現行 generator output，不得用未驗證規則重算。
- `proof_text` 是 Evidence 的相容摘要，不是 canonical evidence store；摘要必須可重現、不得洩漏非公開連結或審核備註。
- 欄位移除只可在新的 major schema version、完成 consumer inventory、提供遷移期與回退方案後進行。

完整映射與測試矩陣見 `t-1-adapter-policy.md`。

---

# 12. 維護工作流

## 12.1 T-1 建議流程

```text
投稿 / 表單 / CSV / YAML / Discord / External JSON
                         ↓
                 Importer / Validation
                         ↓
             ta_data.sqlite (Canonical)
                         ↓
                  Generator / Adapter
             ├─ Website JSON
             ├─ VRChat compact JSON
             ├─ Event JSON
             └─ Search / Index JSON
                         ↓
                StarRiver-Arts-Site
                         ↓
             Review / Git Commit / Push
                         ↓
                 GitHub Pages 部署
```

匯入失敗不得部分寫入 canonical store；生成流程應可重複執行並產生確定性輸出。跨專案刷新與發布仍須遵守 repo governance 的 approval gate。

## 12.2 可接受投稿管道

- Discord
- Google Form 或其他表單
- 私訊
- GitHub Issue
- CSV
- 人工輸入

T-1 的目標是流程穩定，不是立即建立完整後台。

---

# 13. 概念資料實體與匯入模板結構

此結構描述概念實體、人工匯入模板與測試 fixture，**不是 T-1 canonical store 的強制實作**。現有 T-1 以 SQLite 為主資料來源；YAML／CSV／外部 JSON 可作為匯入來源，公開 JSON 則是生成結果。

```text
authoring/
├─ templates/
│  ├─ worlds/
│  ├─ routes/
│  ├─ players/
│  ├─ vehicles/
│  ├─ teams/
│  ├─ records/
│  ├─ events/
│  ├─ matches/
│  ├─ organizations/
│  ├─ evidence/
│  └─ revisions/
└─ fixtures/

canonical/
└─ ta_data.sqlite

generated/
├─ site/
├─ vrchat/
│  ├─ worlds/
│  └─ routes/
└─ indexes/
```

上列路徑是責任分層示意，不要求搬動既有檔案。網站 repo 的實際輸出位置保持：

- `play/RacingClub/TimeAttack/data/*.json`：generated website artifacts
- `play/RacingClub/TimeAttack/vrc/*.json`：generated VRChat contracts

兩者皆不得作為 canonical source 手動維護。generator 更新必須保持既有欄位、ID、query parameter、manifest route 與 URL 相容；新增能力以 additive migration 為主。

## 13.1 Match 拆檔原則

- 0–8 場 Match：可嵌入 Event
- 9 場以上或需要頻繁更新：獨立 Match 檔案

---

# 14. ID 規則

建議：

```text
world_<slug>
route_<slug>
player_<slug>
vehicle_<slug>
team_<slug>
event_<year>_<slug>
match_<event-slug>_<sequence>
record_<route-slug>_<sequence>
```

規則：

- 只使用小寫英文字母、數字與底線
- ID 建立後不因名稱改動
- 同一活動不同屆次必須使用不同 ID
- 顯示名稱、Discord 名稱與世界名稱可改，但 ID 不改
- Alias 與主 ID 分開

---

# 15. 資料品質檢查

## 15.1 World

- 缺少 World URL / UUID
- 缺少作者
- 缺少縮圖
- 重複 World ID
- 未知計時系統

## 15.2 Route

- 路線代碼空白或 TBD
- 找不到所屬世界
- 重複 Route ID
- 方向不明

## 15.3 Player / Team / Vehicle

- Alias 衝突
- 不存在的 Team ID
- 不存在的 Vehicle ID
- 顯示名稱空白
- Team 成員指向不存在玩家

## 15.4 Event / Match

- Event 沒有主辦
- Match 沒有所屬 Event
- 開始時間晚於結束時間
- Completed 活動沒有結果狀態
- 比賽參賽者不存在
- retrospective 缺少原始日期
- final Match 沒有 Result
- winner 不在 participants 中

## 15.5 Record

- 時間格式錯誤
- 不存在的 World / Route / Player / Vehicle
- 可能重複紀錄
- accepted 但沒有 Evidence
- removed / invalidated 缺少原因
- submission_date 早於 record_date 且無說明

---

# 16. 第一批活動轉換範例

## 16.1 Sacc 定峰錦標賽

```yaml
id: event_2026_sacc_sadamine_0718

name:
  zh_hant: "Sacc 定峰錦標賽"
  en: "Sacc Sadamine Tournament"

status: scheduled
event_type: tournament

organizers:
  - id: org_vr_racing_club_tw
    name: "VRC 賽車俱樂部"
    role: host

start_time: "2026-07-18T22:00:00+08:00"
timezone: "Asia/Taipei"

worlds:
  - world_id: world_sacc_sadamine
    routes:
      - route_id: route_full_course_downhill

systems:
  - sacc

format:
  category: single_elimination
  description: "多彎、中高速、技術型山道；1 對 1 單淘汰錦標賽"
  participant_type: player
  scoring_method: win_loss

source:
  announcement_type: discord
  original_timestamp: "<t:1784383200>"

recording:
  mode: prospective
  registered_by: starriver

result:
  status: pending
  ranking: []
```

待補：

- 參賽名單
- 對戰表
- 各 Match
- 車輛限制
- 裁判
- 最終結果
- Replay

---

## 16.2 CVS 紅葉 Momiji 計時賽

```yaml
id: event_2026_cvs_momiji_0719

name:
  zh_hant: "CVS 紅葉 Momiji 計時賽"
  en: "CVS Momiji Time Attack"

status: scheduled
event_type: time_attack

organizers:
  - id: org_vr_racing_club_tw
    name: "VRC 賽車俱樂部"
    role: host

start_time: "2026-07-19T22:00:00+08:00"
timezone: "Asia/Taipei"

worlds:
  - world_id: world_cvs_momiji
    routes: []

systems:
  - cvs

format:
  category: time_attack
  description: "計時賽"
  participant_type: player
  scoring_method: time

source:
  announcement_type: discord
  original_timestamp: "<t:1784469600>"

recording:
  mode: prospective
  registered_by: starriver

result:
  status: pending
  ranking: []
```

---

# 17. 開發階段

## Phase A｜證據 Gate 與契約凍結

- 盤點 SQLite、importer、generator、Website consumer 與實際 VRChat/Udon consumer。
- 凍結既有 ID、URL、generated JSON 路徑與 legacy 欄位。
- 確認 Submission 可安全加入的位置與個資保存邊界。
- 只允許 docs、fixture、mock contract 與 read-only tooling；未達 ready 前不執行 production SQL migration。

**完成條件：** 每個 required output field 可追溯至 producer／canonical source，且已明確判定 ready、conditionally ready 或 blocked。

---

## Phase B｜單一路線 Thin Vertical Slice

```text
玩家投稿
→ opaque receipt / status
→ 最小審核
→ canonical write
→ 網站榜單輸出
→ 單一路線 VRChat 顯示
→ 世界作者接入文件
```

- 只選一條既有且穩定運作的路線。
- 保留現有 Time Attack contract、ID、URL 與跨專案資料引用。
- 用最小 Evidence 與審核能力完成 accepted／rejected／needs_information。
- 由非核心維護者依文件完成一次世界接入測試。

**完成條件：** 四類角色的最小旅程可端到端驗收，且舊網站與 VRChat 榜單無回歸。

---

## Phase C｜投稿與審核強化

- 多路線投稿。
- Evidence visibility 與 private metadata。
- 更正、撤回、重複投稿與 idempotency。
- Review／Revision audit。
- 狀態通知或可恢復查詢。

---

## Phase D｜活動、比賽與車隊

- Event 與 retrospective registration。
- Match／Entry／Result。
- Team 與 membership history。
- Player／Team／World／Route 反向索引。
- 進階 Evidence 關聯。

Event、完整 Match、Team 與進階 Evidence 都在 thin slice 之後實作。

---

## Phase E｜T-1 Release Candidate 與 T0 Demo 準備

- 完成中英主要旅程。
- Validator、contract test、rollback／recovery 與維護文件。
- 擴充世界作者接入與 route coverage。
- 僅在 T-1 穩定後建立有限的多來源 T0 demo；不在 T-1 內實作完整 federation。

---

# 18. 優先順序

## P0｜本版本必要

- Phase 0 evidence gate 與相容性凍結。
- 單一路線投稿入口或可執行投稿模板。
- opaque receipt 與最小 submission status。
- 投稿聯絡資訊、Evidence 與內部註解的隱私邊界。
- 最小審核與 accepted Record 建立。
- 網站榜單輸出。
- 現有 route-specific VRChat output baseline preservation。
- 單一路線實際 VRChat 顯示驗證。
- 世界作者接入文件。
- Validator 與端到端 contract test。

## P1｜Thin slice 穩定後

- 多路線投稿與狀態流程。
- Event／Match／Result canonical model 與頁面。
- 事後補登。
- Evidence／Review／Revision 完整模型。
- 活動結果與玩家／世界反向索引。

## P2｜T-1 後期

- Team canonical entity、membership 與完整頁面。
- Search／Filter 與活動統計。
- Discord Bot、表單自動匯入與主辦方認領。
- 進階賽制、bracket、Replay／Gallery。

## 明確延後至 T0

- 多社群 Source Registry。
- 多來源聚合。
- Board Builder 與來源治理。
- 完整使用者權限與多租戶後台。

---

# 19. T-1 驗收清單

## 玩家投稿

- [ ] 公開規則可理解且能指出必要欄位。
- [ ] 投稿成功後取得不可預測的 receipt token。
- [ ] 狀態頁可區分 received／queued／needs_information／accepted／rejected／withdrawn。
- [ ] accepted submission 可追溯到正式 Record。
- [ ] 聯絡方式、私密 Evidence、內部註解不進公開輸出。
- [ ] 重複投稿、撤回、token 遺失與資料保留規則已定義。

## 世界作者接入

- [ ] 一條既有路線有穩定、versioned 的 VRChat output。
- [ ] 接入文件包含 URL、required fields、更新、快取、離線與錯誤行為。
- [ ] 非核心維護者可依文件完成一次實際接入。
- [ ] 實際 Udon consumer 所需欄位已由證據確認；compact `v` 語意在實證前保持 pending。

## 資料與相容性

- [ ] SQLite／pipeline canonical schema 已由實際證據盤點。
- [ ] Submission status 與 Record review status 分離。
- [ ] SQLite 是 T-1 canonical store，匯入格式不形成第二套 SSOT。
- [ ] generated Website／VRChat JSON 可由同一 canonical snapshot 重建。
- [ ] legacy `verified`／`proof_text`／`v` 通過 baseline contract test。
- [ ] 既有 ID、URL、query parameter、資料路徑與跨專案引用未被破壞。

## 完整 T-1 後續能力

- [ ] World／Route／Player／Vehicle identity 可追溯。
- [ ] Event／Match／Result 與事後補登可驗證。
- [ ] Evidence／Review／Revision 可追溯。
- [ ] Team identity 與 membership 不以名稱猜測。
- [ ] 中英主要頁面與維護流程完成。

---

# 20. T-1 完成後的交付物

T-1 最終應包含：

1. 玩家投稿、receipt／status 與最小審核流程。
2. 世界、路線、玩家、車輛與計時榜。
3. 網站與 VRChat 共用 canonical snapshot 的 generated outputs。
4. 世界作者接入文件與至少一個非核心接入驗證。
5. Event、Match、Result、Team 與 retrospective workflow。
6. Evidence、Review、Revision 與隱私控制。
7. Validator、contract tests、部署與 recovery 文件。
8. 中英主要使用者旅程。
9. 可供 T0 引用、但不與 T0 authority 混淆的資料模型摘要。

---

# 21. 暫不決定事項

以下必須保留為 open question，不得在缺乏證據時寫成既定事實：

- Submission 最終 table／service 與通知方式。
- 無登入 receipt 的 token rotation、遺失與資料保留政策。
- compact `v` 的實際 consumer 語意。
- 單淘汰 bracket 是否獨立為實體。
- 多回合 Battle 的 legs 格式。
- 一場 Match 是否允許多條 Route。
- 主辦方與世界作者正式 ID／認領規則。
- 活動結果是否自動生成 Record。
- Player 全域 ID。
- 國際社群多來源聚合與 Board 規則語言。

---

# 22. 本文件狀態

本版直接校正正式 T-1 規格，未建立新的 Master Charter 或競爭性 review copy。repo 治理仍由 `docs/SSOT.md` 管理。

下一個產品目標不是先完成完整 Event schema，而是：

1. 完成 Phase 0 evidence gate，確認 production 修改是否 ready。
2. 選定一條既有穩定路線。
3. 固定 Submission／Receipt／Privacy contract。
4. 完成投稿到網站榜單的最小流程。
5. 保留並驗證同一路線的 VRChat 顯示。
6. 由世界作者接入文件完成一次非核心測試。

Event、完整 Match、Team 與進階 Evidence 在 thin vertical slice 驗收後進入後續 phase。
