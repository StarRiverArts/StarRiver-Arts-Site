# T-1 活動結果人工登錄指南

活動文案與勝負結果維護檔：

```text
play/RacingClub/TimeAttack/data/event-editorial.json
```

不要直接編輯 generated `data/events.json`；下一次發布可能覆蓋它。

## 新增或更新結果

在對應 `event_id` 的 `results` 陣列依名次填入：

```json
{
  "rank": 1,
  "display_name": "Player Name",
  "player_id": "plr_example",
  "lap_time_text": "03:10.529",
  "vehicle": "X7RR",
  "result_zh": "冠軍或補充說明",
  "result_en": "Champion or result note"
}
```

規則：

- `rank`、`display_name` 必填。
- `player_id` 只有在 `players.json` 找到正式 ID 時才填；未知時留空，不猜測。
- 計時賽有確認秒數才填 `lap_time_text`；未收到精確時間時填 `未提供`。
- 淘汰賽可不填 `lap_time_text`，以 `result_zh`／`result_en` 記錄冠軍、亞軍等結果。
- `vehicle` 未確認時留空。
- `event_id` 必須和 `data/events.json` 的 `event_code`／未來 `event_id` 對應，不因活動改名而變更。
- 更新結果後將 `status` 改為 `completed`，並同步檢查 `status_zh`／`status_en`。

## 最低驗證

1. JSON 可以解析。
2. 每場 `rank` 不重複且由 1 遞增。
3. 非空 `player_id` 都存在於 `players.json`。
4. `event.html?id=<event_id>` 能顯示結果與返回活動清單。
5. 中文以 UTF-8 重讀，並執行 `node --check timeattack.js` 與 `git diff --check`。

目前兩筆測試活動：

- `vrrctw_sadamine_20260718`
- `vrrctw_momiji_20260719`


## 跨管線活動狀態檢核（2026-10）

同一場活動可能出現在兩條獨立的公開輸出：

- `data/event-editorial.json`：網站活動文案、主辦方確認的狀態與結果；`timeattack.js` 直接使用它。
- `vrc/events.json`：來自 Racing canonical/exporter 的另一份 VRChat 活動索引輸出；不由本站 Toolkit builder 維護。
- `vrc/toolkit/events/*.json`：本站 `tools/build_racing_toolkit_public.py` 根據 editorial 生成的 Toolkit 投影。

修改 editorial 不代表 `vrc/events.json` 必然同步。以 `event_id`／`id` 比對，不以活動名稱推測身分。

執行唯讀檢核：

```bash
python tools/racing_data_audit.py
```

`editorial_vrc_event_status_drift` 是需要追查來源的 **warning**，不應在未確認活動結果或 canonical 資料前自行改寫任何生成檔。發現不同步時：

1. 確認 editorial 狀態與主辦方已核准的事件事實；
2. 找到本機 canonical/exporter 如何生成 `vrc/events.json`，確認是否使用不同來源或舊快照；
3. 在有權限的原始資料／生成流程修正並重新發布；
4. 再跑唯讀檢核，並分別驗證網站與 VRChat 公開端。

已知案例：`vrrctw_ych_trackday_20261003` 的 editorial 已是 `completed`，但在 2026-10-30 檢查時 `vrc/events.json` 仍是 `upcoming`。這是跨輸出狀態差異，不應推定世界本身的公開權限。

## Steward 唯讀資料出口

執行 `python tools/racing_data_audit.py` 後，除既有 `racing-qa-artifacts/data-audit.json` 外，會在忽略追蹤的本機目錄輸出：

- `racing-qa-artifacts/steward-report.json`（`project-t-steward/1`）
- `overall_status`：`PASS`／`ACTION_REQUIRED`／`UNKNOWN`／`BLOCKED`
- `checks[]`：`rule_id`、`subject_id`、`issue_key`、`fingerprint`、`expected`、`observed`、`source_paths`、`status`

`fingerprint` 不包含執行時間，用來判斷某一個異常是否有內容變更。這不是系統向外發送通知，也不能取代真正的來源權限核對。

GitHub Actions 只把兩份報告上傳為短期 CI artifact，不提交報告至版本控制、不放入 GitHub Pages 部署樹、不加入網站前端或搜尋索引。GitHub Actions artifacts 的存取權限仍依 GitHub Repository 與 Actions 的權限控管；由於本 repo 公開，本版只從既有公開投影取材，禁止加入私密的治理紀錄、憑證或未公開來源。

## 2026-10-30：確認的上游失同步與修復順序

`leaderboard-periods.json` 記載的 `as_of_utc` 為 `2026-10-26T16:21:03Z`；新一版 `manifest.json` 為 `2026-10-29T18:27:47Z`。兩者是不同快照，不應用舊 period membership 判定新榜單計數錯誤。

依 GitHub 版本對照：玉長地圖有效紀錄從 31 變成 46（+15），`gunsai_jintei` 從 2 變成 4（+2），剛好構成跨來源的 17 筆計數差。這證明不同公開投影版本不一致，不證明新增紀錄的審查結果或期間歸屬。原始檢核 FAIL 保留；Steward 遇到已證實的舊 period 快照時，輸出單一 `refresh_period_projection` ACTION_REQUIRED，其衍生的 `map_current_run_counts`／`summary_valid_runs` 標為 UNKNOWN（而不是偽裝為 PASS）。

本機 Agent 應讀取 workspace `AGENTS.md`，在 `ProjectT-Record-Database/builders/`、`siteResource/play/RacingClub/TimeAttack/` 與資料發布管線內搜尋 `leaderboard-periods.json` 的 Writer；保持 canonical SQLite 未被手工修改，從同一個快照重建 period membership 和網站各投影後驗證，再合併發布。

活動異常為 `vrrctw_ych_trackday_20261003`：編輯來源 `completed`，舊 `vrc/events.json` 為 `upcoming`，該 VRC 檔案最後一次提交在 2026-09-26。應查 Event 的 canonical/exporter 與發布入口，核對活動實際批准狀態；不要依現在日期強行填入結果，也不要直接修改生成檔。

這兩種異常的 `checks[].handoff` 提供本機 Agent 接手的檢查與驗收條件；所有輸出仍只留在 CI artifact 或本機忽略目錄，不新增網站端點。

