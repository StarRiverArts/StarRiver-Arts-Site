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
