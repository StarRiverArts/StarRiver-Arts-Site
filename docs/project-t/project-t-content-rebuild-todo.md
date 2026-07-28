# ProjectT／Articles 後續 Agent 待辦

- 文件狀態：Active TODO / reconciled with current site and owner decisions
- 更新日期：2026-07-28
- 適用範圍：StarRiver Arts Site 的 ProjectT、VRRCTW、Racing、Worlds、Articles，以及後續與 Studio／Museum 的內容架構整合
- 權威參考：
  - `docs/CONTENT_SSOT.md`
  - `docs/project-t/project-t-public-information-architecture.md`
  - `docs/project-t/project-t-homepage-copy-v0.1.md`

## 0. Agent 開始工作前

- [ ] 先讀 `docs/CONTENT_SSOT.md`。
- [ ] 再讀 ProjectT IA 與首頁核准文案。
- [ ] 不得把現有 HTML 原型、placeholder、AI 生成文案或舊導覽結構視為正式需求。
- [ ] 若頁面內容與 SSOT 衝突，以最新 owner decision 與 SSOT 為準。
- [ ] 未通過內容清理 Gate 前，不得重建公開索引。
- [ ] 不得為純前台 IA 任務搬動 Time Attack canonical data、JSON 路徑、IDs、query parameters 或資料管線契約。

## 1. 目前已完成

### 1.1 文件與定位

- [x] 已定義四個核心：ProjectT Worlds／VRRCTW／Racing／VRChat Racing Toolkit。
- [x] Articles 已定義為內容與知識層。
- [x] Time Attack 已明確從屬於 Racing。
- [x] ProjectT Worlds 與 Racing Worlds 的邊界已定義。
- [x] 路線資訊歸在 World Page，不建立獨立 Track Page。
- [x] VRRCTW 對外定位為「中文圈主要的 VRChat 賽車社群」。
- [x] ProjectT Hero 名稱為 ProjectT／Taiwan Touge Project／臺灣山道計畫。
- [x] ProjectT 首頁 P01–P12 核准文案已存入 repo。

### 1.2 ProjectT 首頁實作

- [x] `play/index.html` 已套用新版 SEO、Hero、CTA、四核心與 Articles。
- [x] 已保留 layered color-block mountain hero。
- [x] 手機版主要導覽已恢復可用。
- [x] Toolkit 已使用符合現況的保守文案。

### 1.3 VRRCTW／Racing Club

- [x] Racing Club 已新增 Discord 投稿入口。
- [x] 投稿入口未暴露內部指令細節。

## 2. 已確認的語言處理規則

- [x] 目前公開可選語言為繁體中文與英文。
- [ ] 所有 ProjectT 相關頁面的語言按鈕只顯示繁體中文與 English。
- [x] repo 內既有 `.jp` 文字可暫時部分保留。
- [ ] 公開語言選單與切換按鈕不得顯示日本語。
- [ ] 預設流程不得切換到日文。
- [ ] `.jp` 內容不得進入搜尋、sitemap 或 LLM-facing indexes。
- [ ] 不因隱藏日文按鈕而全面刪除可保留的日文內容。
- [ ] 防止 localStorage 舊值或 fallback 意外顯示日文。

## 3. 已確認的 ProjectT Worlds 決策

### 3.1 第一批公開世界

- [x] 觀星山／StarSight Mt.
- [x] 九彎十八拐／9 Turns
- [x] 武嶺／Wuling

補充規則：

- [x] 九彎十八拐的 CVS 與 Sacc 版本不拆成兩個獨立 ProjectT World。
- [x] ARTC 目前定位為測試用場景，不以公開世界身分列入第一批 Worlds。
- [x] ARTC 未來可發展為 ProjectT 世界觀中的特定地點，原型來自臺灣車輛測試中心；現階段不對外承諾為正式公開世界。

### 3.2 Worlds 頁公開策略

- [x] 採用精簡公開版。
- [ ] Worlds 頁完成三個真實世界介紹、正確連結與基本 Gate 後解除 `noindex`。
- [ ] 在完成前維持 `noindex`。

### 3.3 世界卡片最低資訊

必須顯示：

- [x] 世界名稱
- [x] 作者
- [x] 一句短述
- [x] 公開狀態
- [x] 支援平台
- [x] 主要用途
- [x] Time Attack 連結（可先放）

不列為卡片固定欄位：

- [x] 維護狀態：需要持續追蹤，第一版不放。
- [x] 重製計畫：不建立固定欄位，必要時寫在自然語言描述內。
- [x] 世界版本：可保留但權重低。
- [x] Update Log：比世界版本更有價值，後續 World Page 優先提供更新紀錄。

## 4. ProjectT Worlds 頁：P0

目前 `play/worlds/index.html` 仍是舊原型。

- [ ] 修正錯誤相對路徑與 `.dc.html` 草稿連結。
- [ ] 隱藏日本語選項，但保留可用 `.jp` 內容。
- [ ] 將 Hero 改成 ProjectT Worlds 的完整定位，不把分類限縮為山道。
- [ ] 移除過度 placeholder 化的公開敘述。
- [ ] 加入觀星山、九彎十八拐、武嶺三張真實卡片。
- [ ] 每張卡包含作者、短述、狀態、平台、主要用途與 Time Attack 入口。
- [ ] 九彎十八拐不拆 CVS／Sacc 卡片。
- [ ] ARTC 不列入第一批公開世界卡片。
- [ ] 建立三個世界的介紹文案。
- [ ] 加入 Update Log 的後續入口設計，不以版本號作為主要展示。
- [ ] 通過 Gate 後改為精簡公開版並解除 `noindex`。

## 5. 已確認的 ProjectT Articles 決策

### 5.1 公開狀態

- [x] Articles 頁目前維持 `noindex`。
- [ ] 即使先修正分類與頁面結構，在真實文章與 metadata 未完成前仍不公開索引。

### 5.2 規劃文章

目前規劃四篇：

1. [ ] 操作指南：系統 A
2. [ ] 操作指南：系統 B
3. [ ] 賽車社群概述與推薦世界介紹
4. [ ] ProjectT 創作理念與世界介紹；可由觀星山作為主要案例

優先順序：

- [x] 前三篇優先。
- [ ] 第四篇後續製作。

注意：兩種操作指南的具體系統名稱與操作內容尚待 owner 補充，不得由 Agent 自行假設。

## 6. ProjectT Articles 頁：P0

- [ ] 修正錯誤相對路徑與 `.dc.html` 草稿連結。
- [ ] 隱藏日本語選項，但可保留部分 `.jp` 草稿。
- [ ] 將 Hero 定位改為綜合內容與知識層。
- [ ] 分類改為 Guides／Reviews & Community／Events／ProjectT Development。
- [ ] 移除公開頁上的內部編輯說明。
- [ ] 不建立假文章卡、假作者、假日期或假正文。
- [ ] 在尚無文章時顯示清楚空狀態與四類內容說明。
- [ ] 維持 `noindex`。

## 7. Racing 架構與路徑：P1

### 7.1 已確認現況

- [x] Time Attack 內部大多頁面已可使用。
- [x] Time Attack 底下現有 Worlds／tracks 類頁面，作為計時資料與路線紀錄檢視已足夠。
- [x] Events 仍有擴充空間，包含投稿與活動登記。
- [x] Toolkit 未來可能公開販售或開源；目前公開文案只描述為內部使用，不公開未定發行方式。
- [x] 投稿與驗證目前只公開說明「在 Discord 群組內投稿」，不公開更多未定流程。

### 7.2 為什麼仍需要 Racing 上位入口

Time Attack 是「計時紀錄模組」，但 Racing 的定義更廣，還包含世界、路線、玩家、車輛、隊伍、活動與未來投稿／驗證。若首頁的 Racing 永久直接指向 Time Attack，使用者會把 Racing 誤認為排行榜本身，後續 Events、投稿或其他資料頁也沒有清楚的上位入口。

但建立 Racing 入口不等於立刻搬動 Time Attack：

- 先建立上位入口，可在不破壞既有連結與資料契約的前提下改善 IA。
- Time Attack 舊路徑已有外部連結、資料載入與相容性價值，不應只為名稱整齊而搬動。
- 若整組搬去新的 Racing 路徑，需要處理 redirect、相對路徑、JS fetch、資料端點、canonical URL、索引與外部書籤，成本與風險顯著較高。

### 7.3 待決策方案

**方案 A：上位入口＋保留既有模組路徑（建議）**

- 新增 `/play/racing/` 作為 Racing landing page。
- Time Attack 保留 `/play/RacingClub/TimeAttack/`。
- Racing landing page 連到 Time Attack、Players、Vehicles、Events 等現有頁。
- 未來若要遷移，再以 redirect／adapter 分階段處理。

**方案 B：整組遷移到 Racing**

- 將 Time Attack 與相關頁面移至 `/play/racing/...`。
- 必須同時完成完整路徑盤點、redirect、資料 fetch 與外部契約測試。
- 只有在確定要做路徑重構，而且有足夠測試時間時才建議採用。

目前尚未決定 A 或 B。Agent 不得自行搬動整組路徑。

## 8. ProjectT 首頁 P13／P14：部分已決策

### P13｜目前可以使用

可列：

- [x] VRRCTW 社群入口
- [x] Time Attack 與其大多數資料頁
- [x] Discord 群組內投稿
- [x] ProjectT 公開世界（待 Worlds 精簡公開版完成後正式列出）

### P14｜目前開發狀態

可列：

- [x] Events：持續擴充投稿與活動登記能力。
- [x] VRChat Racing Toolkit：核心流程供內部使用；不公開販售或開源計畫。
- [ ] 其他投稿、驗證、個人頁與資料功能下次再決策。

## 9. VRRCTW 頁：延後決策

- [x] 本輪不處理解除 `noindex`。
- [ ] 下一次由 owner 提供 VRRCTW 詳細資訊後，再決定正式文案、最低公開內容、手機導覽與解除 `noindex` 條件。

## 10. 索引與文件同步

- [ ] 更新 `project-t-public-information-architecture.md` 中殘留的舊 VRRCTW 名稱與語言規則。
- [ ] 更新 `tools/build_site_index.py` 的 ProjectT 描述與 tags。
- [ ] 保持 `.jp` 排除於索引。
- [ ] Worlds／Articles 清理完成前，不重建公開索引。

## 11. World Page 與內容模型：P2

- [ ] World Page 支援世界名稱、作者、狀態、平台、介紹、路線、Time Attack、社群／活動關係、相關 Articles、Update Log。
- [ ] 不建立獨立 Track Page。
- [ ] 第一個 vertical slice 使用觀星山。
- [ ] 不直接把 Studio `projects/*.html` 當成完整 World Page。

## 12. Studio 與 Museum 後續

- [ ] Studio 維持 Gallery + Portfolio，不建立 Studio Article 系統。
- [ ] 釐清 canonical project data 與 Studio Project View 的邊界。
- [ ] Museum Gallery 承擔展品基礎資訊。
- [ ] Museum Essays 支援多對多 Exhibit／Exhibition 關係。
- [ ] 評估 ProjectT 與 Museum 共用 base article schema 的程度。

## 13. 發布 Gate

任何原型頁解除 `noindex` 或進入公開索引前，必須確認：

- [ ] 定位與分類已確認。
- [ ] placeholder、假文章與內部待辦文字已移除。
- [ ] 內容描述真實世界、資料、活動或具名觀點。
- [ ] 作者、世界、路線與資料關係清楚。
- [ ] 連結可用且無 `.dc.html` 草稿路徑。
- [ ] 日文按鈕未顯示，保留 `.jp` 不會意外顯示或進入索引。
- [ ] 桌面與手機完成基本檢查。
- [ ] 最後才重建 sitemap、search 與 LLM-facing indexes。

## 14. 仍需要 owner 決策

- [ ] 觀星山、九彎十八拐、武嶺的正式短述、平台、公開狀態與主要用途文字。
- [ ] 兩篇操作指南分別對應哪兩個系統，以及各自的操作流程。
- [ ] 第三篇文章要以「賽車社群概述」與「推薦世界」合併為一篇，或拆成兩篇。
- [ ] 第一篇實際發布文章與作者／觀點來源。
- [ ] Racing 採方案 A（上位入口＋保留舊路徑）或方案 B（整組搬遷）。
- [ ] `/play/racing/` 是否作為正式 Racing URL。
- [ ] 首頁 Racing 卡片何時停止直接連 Time Attack。
- [ ] VRRCTW 詳細資訊與解除 `noindex` 條件。
- [ ] 日文未來恢復按鈕的條件。
- [ ] World Page 與 Studio project page 的 URL／資料共用方式。

## 15. 禁止事項

- [ ] 不得把 AI 示例正文微調後直接發布。
- [ ] 不得把 ARTC 在現階段誤列為正式公開 ProjectT World。
- [ ] 不得把九彎十八拐 CVS／Sacc 拆成兩個 ProjectT World。
- [ ] 不得把外部世界誤標為 ProjectT World。
- [ ] 不得自行搬動 Time Attack 路徑或資料契約。
- [ ] 不得因日文按鈕隱藏而誤刪所有可保留日文內容。
