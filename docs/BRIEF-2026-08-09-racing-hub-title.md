# Racing Hub 賽事中心標題更新 Brief

- target project: `StarRiverSite`
- in-scope projects: `StarRiverSite` only
- objective: 將 `/play/RacingClub/TimeAttack/` 資料站的品牌式頁面標題更新為 `Racing Hub 賽事中心`，並同步相關子頁及站內入口。
- source files / inputs: Time Attack 站台 HTML、`timeattack.js`、站內連結頁、`tools/maintain_timeattack_public.py`。
- expected output: 瀏覽器／分享標題、首頁 H1、站台 kicker／footer、導向此站的入口標籤一致使用 Racing Hub 品牌。
- constraints: 不搬動既有 URL；不修改 JSON 資料契約、計時紀錄、來源資料庫或跨專案資料管線；`Time Attack` 作為賽制、投稿與資料內容用語時保留。
- acceptance criteria: 首頁載入動態資料後仍顯示 `Racing Hub 賽事中心`；各子頁不再以 `Time Attack` 作為站台品牌標題；站台索引可成功重建；diff 無編碼與空白錯誤。
- approval gates: 發布、推送、部署與任何跨專案寫入不在本次授權範圍。

