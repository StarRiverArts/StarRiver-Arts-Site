# T-1 投稿與寫入模型（Submission & Write Model）

**版本：** 0.1（草案）
**日期：** 2026-07-26
**來源：** Owner 口述收斂
**關係：** 細化 [`t-1-product-structure.md`](./t-1-product-structure.md) 第 2 區（Submission ≠ Record）與第 7 區（維護流程）。證據等級見 [`t-1-evidence-grades.md`](./t-1-evidence-grades.md)。

---

## 1. 兩個層級

計時紀錄的來源分兩個信任層級。**目前只實作管理者層級；玩家自助層級在此預留，尚未實作。**

| 層級 | 誰輸入 | 信任 | 寫入行為 | 狀態 |
| --- | --- | --- | --- | --- |
| **管理者登記** | Record Manager 身分組 | 高（可信任寫入） | 直接寫入 `records` | **已實作** |
| **玩家自助投稿** | 一般玩家 | 低（claim） | 先寫入 `submissions`，審核通過才生 `records` | **預留，未實作** |

### 1.1 管理者可信任寫入（現行）

Discord `/ta-submit`（身分組守門 `canSubmit`）→ `racecast.submit` 直接寫入 `records`。因為管理者可信，此路徑**不設審核關卡**，寫入即成立。

每次寫入另外落一份**提交檔**存證（見第 2 節）。

### 1.2 玩家自助投稿（預留，未實作）

未來若開放一般玩家投稿：

- 走 `submissions` 表（m0002 已建），`status=received`，**一律要審**。
- 因為碰不到 `records`，審錯不污染榜單。
- 提交檔格式共用（見第 2 節），只是 `source.tier="player"`、`submission_kind="claim"`、`trusted=false`、`target` 指向 `submissions`。
- 審核可沿用第 3 節的證據多對多與 [`t-1-evidence-grades.md`](./t-1-evidence-grades.md) 的分級。

此層級的開放與否、審核介面、防濫用，都留待另行設計。設計時的既有顧慮：開放輸入端會讓投稿者從十餘人增至上千人（見產品討論），但 `submissions ≠ records` 的隔離讓這個風險可控。

---

## 2. 提交檔（Submission File）

管理者每次可信寫入，除了寫 canonical DB，另落一份 JSON 存證。**這是稽核軌跡（provenance），不是第二份 SSOT** —— 正式資料仍以 canonical DB 為準。

位置：`VR_RacingClubTW/submissions/`（含 Discord 使用者 ID，屬個資，已 gitignore）。

必要註記三項：

- **伺服器來源**：`source.guild_id` / `guild_name` / `channel_*`（哪個 Discord 伺服器與頻道）
- **寫入者**：`writer.discord_id` / `discord_name`（誰登記的）
- **寫入位置**：`target.db_path`（實際寫入的 canonical DB 絕對路徑，由 `racecast.submit` 回報，非上游猜測）

格式（`schema_version: 1`）：

```json
{
  "submission_kind": "trusted_write",
  "trusted": true,
  "written_at": "ISO-8601",
  "source":  { "platform": "discord", "tier": "manager",
               "guild_id": "...", "guild_name": "...",
               "channel_id": "...", "channel_name": "..." },
  "writer":  { "discord_id": "...", "discord_name": "...", "display_name": "..." },
  "target":  { "db_path": "…/ta_data.sqlite", "table": "records", "record_id": "rec_NNNN" },
  "claim":   { "player": "...", "track": "...", "route": "...",
               "vehicle": "...", "time": "...", "platform": "...", "proof": "..." },
  "resolved":{ "track_world_code": "...", "route_code": "...",
               "player_id": "...", "player_created": false,
               "vehicle_variant_code": "...", "lap_time_text": "..." }
}
```

`tier` / `trusted` / `submission_kind` 欄位刻意保留，供未來玩家自助層級重用同一格式。

管理頻道（`/ta-set-admin-channel`）另收一則稽核通知 embed；此為通知，非審核關卡。

---

## 3. 一份證據，多筆紀錄（Q2 / Q3）

「同一張圖有多筆成績」與「多筆紀錄指向同一份證據」是同一件事，schema 已支援，**不需新設計**：

- `evidence` 是獨立實體，有 `evidence_id`。圖的 index（訊息連結 / `content_hash`）只存在該列、存一次。
- `submission_evidence` 是多對多（`submission_id ↔ evidence_id`）。

```text
一張圖 = 1 筆 evidence
          ├─ submission / record A（秋名 DH）
          ├─ submission / record B（秋名 UH）
          └─ submission / record C（赤城 DH）
```

一張結果板截圖含多條路線成績 → 多筆紀錄各自建立，全部指向同一個 `evidence_id`。證據不複製、index 不重存。

---

## 4. 未知賽道／車輛

`racecast.submit` 目前對未知賽道／車輛**直接拒絕**（`resolve_route` / `resolve_vehicle` 拋錯）；只有玩家（名字）會自動建立 provisional。賽道／車輛是策展型參考資料（代碼、世界 ID、傳動等），不從一句 submit 生成。

Owner 已決定未來的處理方向：遇未知賽道／車輛時，送管理頻道逐項讓管理者判斷是否建立，與 record manager 審核行為一致。**此流程尚未實作**，待與投稿審核一併設計。

---

## 5. 實作狀態

| 項目 | 狀態 |
| --- | --- |
| 管理者可信寫入（`/ta-submit` → `records`） | 已實作 |
| 提交檔存證（來源／寫入者／寫入位置） | 已實作 |
| 管理頻道稽核通知 | 已實作 |
| 玩家自助投稿層級 | **預留，未實作** |
| 未知賽道／車輛送審核 | 未實作 |
| 證據多對多入庫流程 | schema 就緒，入庫流程未接 |
