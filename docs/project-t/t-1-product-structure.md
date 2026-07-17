# Project T T-1 產品結構（Owner 收斂版）

**版本：** 1.0
**日期：** 2026-07-17
**來源：** Owner 口述收斂（本檔為 SSOT；與其他 t-1 文件衝突時，產品定位以本檔為準，工程細節以 migration/adapter/schema-map 為準）

一句話定位：

> **T-1 是一套由 Project T 維護，讓玩家投稿紀錄、主辦者登記賽事、世界作者接入榜單的單一平台。**

拆分為 **6 個產品大區 + 1 個底層維護區**。

---

# 1. 世界與路線

所有資料的空間基礎。

小區：World Index／World Detail／Route Index／Route Detail／路線規則／支援車輛與計時系統／VRChat World ID、作者、版本、PC-Quest／世界作者接入資訊／榜單 URL。

```text
World
└─ Route
```

一個世界可有多條路線，一條路線只屬於一個世界。
（canonical 對應：`track_worlds`／`routes` 複合 PK，已驗證。）

---

# 2. 投稿與計時紀錄

T-1 最核心的玩家使用區。

## Submission（玩家原始投稿）

玩家／路線／車輛／時間／日期／證據／投稿來源／聯絡或修正資訊。

## Receipt（投稿即時回執）

submission ID／收件時間／查詢代碼／目前狀態／隱私說明。

## Submission Status

```text
received / needs_info / under_review / accepted / rejected / withdrawn
```

## Record（正式榜單紀錄）

record ID／玩家／車輛／路線／時間／日期／審核狀態／來源／修訂版本。

## Leaderboard

Route Leaderboard／Player Best／Vehicle Best／TR-CR-PR／Record Detail。

## 關鍵區分

```text
Submission ≠ Record
```

Submission 是「有人投稿了什麼」；Record 是「Project T 正式保存與發布的紀錄」。
Submission 可能：尚未接受／被拒絕／接受後產生 Record。

---

# 3. 玩家、車輛與車隊

身分與索引區。

- **Player**：Index／Detail／display name／alias／紀錄／活動戰績／車隊關係。
- **Vehicle**：Index／Detail／model code／display name／系統／車輛紀錄／使用玩家。
- **Team**：Index／Detail／成員／成員有效期間／活動與比賽結果／車隊紀錄。

```text
Player ── Submission / Record / Event Entry / Match Result / Team Membership
Vehicle ── Record / Match Entry-Result
Team ── Team Membership ── Player
```

Team 不是玩家資料上的文字欄位，而是正式 `team_id` + 成員關係。

---

# 4. 活動、比賽與結果

賽事歷史區，不是 Time Attack 的替代品。

- **Event**：名稱／日期與時區／主辦者／世界-路線／賽制／報名資訊／狀態／事後補登／活動頁與封存。
- **Event Entry**：玩家或車隊／車輛／seed-組別／報名狀態。
- **Match**：回合／對戰／路線／開始時間／狀態。
- **Match Result**：勝負／名次／時間／積分／淘汰結果／證據。

```text
Event
├─ Event Entry ── Player / Team
└─ Match
   ├─ Match Entry ── Player / Team / Vehicle
   └─ Match Result ──(optional)→ Record
```

部分 Match Result 可同時形成 Time Attack Record，但不是全部。

---

# 5. 證據、審核與修正

資料可信度與生命週期區。

- **Evidence**：FPS 截圖／完整錄影／活動現場確認／世界計時器輸出／直播存檔／主辦方確認。可附著在 Submission／Record／Event／Match／Match Result。
- **Review**：審核狀態／審核者／審核時間／公開備註／私密維護備註。
- **Revision**：修改前後內容／修改者／時間／理由。
- **Record Lifecycle**：`accepted / needs_review / invalidated / superseded / removed`。

重要原則：

```text
未驗證 ≠ 無效
```

`verified = false` 不能解釋成作弊或錯誤。

---

# 6. 網站與 VRChat 輸出

使用者真正看到的產品表面。

- **網站**：World-Route 頁／Leaderboard／Submission Receipt-Status／Player-Vehicle-Team／Event-Match／Record Detail／Review 顯示／搜尋與索引。
- **VRChat**：World Index JSON／Route-specific JSON／Player-Vehicle Top N／更新時間／錯誤-離線狀態／世界作者接入文件／Unity-UdonSharp 模組。

網站與 VRChat 都不能直接維護資料：

```text
Canonical Data ── Website JSON ── Website
              └─ Compact VRChat JSON ── Udon Consumer
```

---

# 7. 底層資料與維護流程

SQLite canonical store／Submission importer／Validator／ID-Alias mapping／Generator／Website adapter／VRChat adapter／Migration／Backup／Audit report／Build-deploy。

```text
表單 / Discord / CSV / 人工輸入
        ↓ Submission Importer → Validator
Canonical SQLite
        ↓ Generator / Adapter
   ├─ Website JSON
   └─ VRChat JSON
```

---

# 實作優先順序

## 第一個 thin vertical slice

```text
World / Route → Player / Vehicle → Submission → Receipt / Status
→ Minimal Evidence / Review → Record → Website Leaderboard → VRChat Leaderboard
```

## 第二階段

```text
Event → Entry → Match → Result → Event Archive
```

## 第三階段

```text
Team／Advanced Evidence／完整 Revision UI／更多世界與路線
```

核心驗收：

> **一個玩家在一條路線跑完，投稿後能被正式處理，最後在網站與 VRChat 世界內看到同一筆紀錄。**
