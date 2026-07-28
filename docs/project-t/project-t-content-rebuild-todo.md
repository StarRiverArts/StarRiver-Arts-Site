# ProjectT／Articles 後續 Agent 待辦

- 文件狀態：Active TODO / reconciled with current site
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
- [ ] 不得因為頁面視覺完整，就假設內容已可公開。
- [ ] 未通過內容清理 Gate 前，不得重建公開 `site-index.json`、`search-index.json`、`llm-index.json`、`sitemap.xml` 或 `llms.txt`。
- [ ] 不得為純前台 IA 任務搬動 Time Attack canonical data、JSON 路徑、IDs、query parameters 或資料管線契約。

## 1. 目前已完成

### 1.1 文件與定位

- [x] `CONTENT_SSOT.md` 已同步 ProjectT 上位架構。
- [x] 已明確定義四個核心：ProjectT Worlds／VRRCTW／Racing／VRChat Racing Toolkit。
- [x] Articles 已定義為內容與知識層，不是第五個營運核心。
- [x] Time Attack 已明確從屬於 Racing。
- [x] ProjectT Worlds 與 Racing Worlds 的邊界已定義。
- [x] 賽道與路線資訊歸在 World Page，不建立獨立 Track Page。
- [x] VRRCTW 對外定位已改為「中文圈主要的 VRChat 賽車社群」。
- [x] 繁體中文已定義為主要官方文字標準，不是參與資格限制。
- [x] ProjectT Hero 名稱已確認：ProjectT／Taiwan Touge Project／臺灣山道計畫。
- [x] ProjectT 首頁 P01–P12 核准文案已存入 repo。

### 1.2 ProjectT 首頁實作

- [x] `play/index.html` 已套用新版 SEO title 與 description。
- [x] 已套用 ProjectT／Taiwan Touge Project／臺灣山道計畫 Hero。
- [x] 已保留 layered color-block mountain hero。
- [x] 已套用新版 Hero 定位句。
- [x] 已加入 VRRCTW 與參加活動 CTA。
- [x] 已呈現 ProjectT Worlds／VRRCTW／Racing／Toolkit 四個核心。
- [x] 已將 Articles 放在核心系統後方作為內容層。
- [x] ProjectT 首頁手機版主要導覽已恢復可用。
- [x] Toolkit 已使用保守、符合現況的狀態文案。

### 1.3 VRRCTW／Racing Club

- [x] Racing Club 已新增 Discord 投稿入口。
- [x] 投稿入口未暴露內部指令細節。

## 2. 已確認的語言處理規則

### 2.1 公開顯示

- [x] 目前公開可選語言為繁體中文與英文。
- [ ] 所有 ProjectT 相關頁面的語言按鈕只顯示繁體中文與 English。
- [ ] 使用者可見名稱使用 `繁體中文`／`Traditional Chinese`。
- [ ] HTML 可使用 `zh-Hant-TW` 或保留既有 `zh-TW`。
- [ ] 程式內部短碼可保留 `zh`。

### 2.2 日文內容

- [x] 日文不是目前公開承諾的完整語言版本。
- [x] repo 內既有 `.jp` 文字可暫時部分保留，作為未來翻譯草稿或歷史內容。
- [ ] 公開語言選單與切換按鈕不得顯示日本語。
- [ ] 預設流程不得切換到日文。
- [ ] `.jp` 內容不得進入搜尋、sitemap 或 LLM-facing indexes。
- [ ] 不要求為了本輪清理全面刪除 `.jp` 節點；只有污染、錯誤或不再需要的日文 placeholder 才移除。
- [ ] 若保留 `.jp`，應確保沒有因 localStorage 舊值或腳本 fallback 而被意外顯示。

## 3. 目前網站與核准架構的主要差距

### 3.1 ProjectT Worlds 頁：P0

目前 `play/worlds/index.html` 仍是舊原型。

- [ ] 修正錯誤相對路徑與 `.dc.html` 草稿連結。
- [ ] 導覽改為 Overview／ProjectT Worlds／VRRCTW／Racing／Toolkit／Articles。
- [ ] 隱藏日本語選項，但可保留部分 `.jp` 內容。
- [ ] 將 Hero 的「山道世界一覽」改成 `ProjectT Worlds` 的完整定位。
- [ ] 品牌仍可使用「臺灣山道計畫」，但 Worlds 分類不得只容納山道。
- [ ] 移除「世界名單・詳情建置中」等過度 placeholder 化的公開敘述。
- [ ] 世界卡片至少使用真實短述、狀態與平台，不只顯示「詳情建置中」。
- [ ] 第一輪至少盤點並確認是否納入：觀星山、九彎十八拐、武嶺、ARTC，以及其他 ProjectT 自有世界。
- [ ] 明確區分 ProjectT Worlds 與 Racing 收錄的外部世界。
- [ ] 在內容尚未通過 Gate 前維持 `noindex`。

### 3.2 ProjectT Articles 頁：P0

目前 `play/articles/index.html` 仍把 Articles 限縮為製作筆記／路線研究／技術拆解。

- [ ] 修正錯誤相對路徑與 `.dc.html` 草稿連結。
- [ ] 隱藏日本語選項，但可保留部分 `.jp` 翻譯草稿。
- [ ] 將 Hero 定位改為綜合內容與知識層。
- [ ] 分類改為：Guides／Reviews & Community／Events／ProjectT Development。
- [ ] 移除公開頁上的內部編輯說明，例如「這頁需要的內容」。
- [ ] 不建立看似真實的假文章卡、假作者、假日期或假正文。
- [ ] 在尚無文章時，可顯示清楚的空狀態與四類內容說明。
- [ ] 在真實文章與 metadata 尚未完成前維持 `noindex`。

### 3.3 ProjectT IA 文件：P0

- [ ] 更新 `project-t-public-information-architecture.md` 中殘留的「繁體中文 VRChat 賽車社群」。
- [ ] 中文改為「中文圈主要的 VRChat 賽車社群」。
- [ ] 英文改為 `A leading Chinese-language VRChat racing community`。
- [ ] 加入日文內容可保留但不公開顯示切換入口的規則。

### 3.4 VRRCTW／Racing Club 頁：P1

- [ ] 對外主要名稱逐步收斂為 `VRRCTW`，`Racing Club` 可保留為舊路徑或次要說明。
- [ ] Worlds／Articles 的 `soon` 文字改為真實連結。
- [ ] 隱藏日本語選項，但不必全面刪除 `.jp` 內容。
- [ ] 修正手機版直接隱藏全部 `.rc-links` 的問題。
- [ ] 手機版改用選單、可捲動導覽或其他可用方案。
- [ ] 確認頁面定位與真實內容通過 Gate 後，再決定是否解除 `noindex`。

### 3.5 Racing 入口：P1

目前首頁 Racing 卡片直接進入 Time Attack。

- [ ] 建立輕量 Racing landing page，作為上位資訊入口。
- [ ] 不搬動 `/play/RacingClub/TimeAttack/`。
- [ ] Racing landing page 可先連到：Time Attack／Worlds & Routes／Players／Vehicles／Teams／Events。
- [ ] 未完成模組需清楚標示狀態，不建立假功能頁。
- [ ] 決定首頁 Racing 卡片何時由 Time Attack 改連 Racing landing page。

### 3.6 ProjectT 首頁尚未完成：P1

- [ ] P13｜目前可以使用。
- [ ] P14｜目前開發狀態。
- [ ] 精選世界短介紹與真實入口。
- [ ] Racing／Time Attack 快捷入口文字。
- [ ] 近期活動區或活動空狀態。
- [ ] 頁尾 ProjectT 簡短定義是否需要補充。

### 3.7 索引產生器：P1

`tools/build_site_index.py` 仍使用舊 ProjectT 定位。

- [ ] 更新 SITE description 中的 ProjectT 描述。
- [ ] 更新 `play/index.html` PAGE_OVERRIDES。
- [ ] 更新 ProjectT tags，不再只用 Taiwan landscape／mountain road／Racing Club／Time Attack。
- [ ] 將 ProjectT Worlds／VRRCTW／Racing／Toolkit／Articles 納入穩定語義。
- [ ] 保持 `.jp` 內容排除於索引。
- [ ] 在 Worlds／Articles 清理完成前，不重建公開索引。

## 4. World Page 與內容模型

### 4.1 ProjectT World Page：P2

- [ ] 定義 World Page schema：
  - 世界名稱與作者
  - 狀態與平台
  - 世界基礎介紹
  - 世界內路線列表
  - 路線方向與簡短特性
  - Racing／Time Attack 入口
  - 社群與活動關係
  - 相關 Articles
- [ ] 不建立獨立 Track Page。
- [ ] 若文章談特定路線，使用 world + route metadata。
- [ ] 不直接把 `projects/*.html` Studio 作品頁當成完整 World Page。
- [ ] 第一個 vertical slice 建議使用觀星山。

### 4.2 ProjectT Articles schema：P2

- [ ] metadata 至少支援：
  - article type
  - author／viewpoint source
  - publish date
  - world relationship
  - route／direction within world
  - event relationship
  - Racing／Time Attack links
- [ ] 玩家評論與主觀內容必須標示作者、觀點來源與日期。
- [ ] 外部作者世界可被介紹，但不得因此標成 ProjectT World。
- [ ] Article Page 反向連到 World Page 與 Racing／Time Attack。
- [ ] World Page 顯示相關文章列表。

## 5. Studio 與 Museum 後續

### 5.1 Studio

- [ ] 維持 Studio 為 Gallery + Portfolio。
- [ ] 不建立 Studio Article 系統。
- [ ] 釐清 canonical project data 與 Studio Project View 的邊界。
- [ ] 同一世界可在 Studio 與 ProjectT 使用不同前台呈現，但不複製底層事實。

### 5.2 Museum

- [ ] Gallery Page 承擔展品基礎資訊，不要求每件展品有獨立詳情頁。
- [ ] Columns／Essays 支援 Exhibit Essays／Current Commentary／VRC Community & Culture。
- [ ] Essay 與 Exhibit／Exhibition 使用多對多關係。
- [ ] 現有 `museum/article.html` 只視為單件展品型 Essay 原型。
- [ ] 另設計通用 Commentary／Culture 文章結構。

### 5.3 共用 Articles 基礎架構

- [ ] 比較 ProjectT 與 Museum 是否共用 base article schema、author/date/language、editor workflow、search indexing、typography components。
- [ ] 不強制共用分類、導覽外殼、Hero、視覺主題與 subject relationships。
- [ ] 決定 URL 策略、跨區文章規則與推薦機制。

## 6. 發布 Gate

任何原型頁解除 `noindex`、加入主要導覽或進入公開索引前，必須確認：

- [ ] 定位與分類已由 owner 確認。
- [ ] AI placeholder、假標題、假正文與語義不明框架已移除。
- [ ] 內容描述真實存在的世界、資料、展覽、展品、事件或具名觀點。
- [ ] 所有權、作者、世界、路線、展覽與展品關係清楚。
- [ ] 連結可用且不依賴 `href="#"` 或 `.dc.html` 草稿路徑。
- [ ] 繁中與英文內容狀態清楚。
- [ ] 日文切換入口未顯示；保留的 `.jp` 不會意外顯示或進入索引。
- [ ] 桌面與手機完成基本檢查。
- [ ] 搜尋、sitemap 與 LLM-facing indexes 從清理後來源重新生成。
- [ ] 生成後人工抽查，確認沒有 placeholder、舊 IA 或日文草稿污染。

## 7. 建議執行順序

### Phase A：立即修復斷裂

- [ ] 同步 ProjectT IA 文件中的 VRRCTW 與語言規則。
- [ ] 修正 Worlds／Articles 的錯誤連結。
- [ ] 隱藏 Worlds／Articles／VRRCTW 的日本語選項。
- [ ] 防止 localStorage 或 fallback 意外切到日文。
- [ ] 更新 Worlds 定位與 Articles 四分類。
- [ ] 移除公開頁上的內部待辦文字。

### Phase B：建立可用入口

- [ ] 補 Worlds 真實卡片與狀態。
- [ ] 修正 VRRCTW 手機導覽。
- [ ] 建立 Racing landing page。
- [ ] 補 ProjectT 首頁 P13／P14。

### Phase C：建立內容 vertical slice

- [ ] 建立觀星山 World Page。
- [ ] 建立第一篇真實 ProjectT Article。
- [ ] 驗證 World／Route／Article／Racing 互連。

### Phase D：清理索引與公開

- [ ] 更新 index builder。
- [ ] 完成逐頁污染盤點。
- [ ] 通過發布 Gate。
- [ ] 最後重建 sitemap、search 與 LLM indexes。

## 8. 需要 owner 決策

以下事項不得由 Agent 自行決定：

- [ ] ProjectT Worlds 第一批正式收錄名單。
- [ ] 每個世界的公開狀態、平台與短述。
- [ ] Worlds 頁在只有少量真實資料時，是維持 `noindex` 還是先公開精簡版。
- [ ] Articles 頁在尚無真實文章時，是否公開四分類空狀態頁。
- [ ] 第一篇 ProjectT Article 的主題與作者／觀點來源。
- [ ] Racing landing page 的正式 URL 與名稱。
- [ ] 首頁 Racing 卡片何時停止直接連 Time Attack。
- [ ] P13「目前可以使用」要列哪些入口。
- [ ] P14「目前開發狀態」哪些項目可公開。
- [ ] VRRCTW 頁是否解除 `noindex`，以及解除前所需的最低內容。
- [ ] 日文未來恢復條件：何時重新顯示日本語按鈕、哪些頁面先恢復。
- [ ] ProjectT 與 Museum 共用 Articles schema 的程度。
- [ ] World Page 與 Studio project page 的 URL／資料共用方式。

## 9. 禁止事項

- [ ] 不得把 AI 示例正文微調後直接發布。
- [ ] 不得把 placeholder category 當成已確認產品需求。
- [ ] 不得把外部世界誤標為 ProjectT World。
- [ ] 不得建立獨立 Track Page，除非 owner 明確推翻目前決策。
- [ ] 不得直接搬動 Time Attack 現有路徑或資料契約。
- [ ] 不得讓 Studio、ProjectT、Museum 強制共用同一分類或視覺模板。
- [ ] 不得因日文按鈕隱藏而誤刪所有可保留的日文草稿。
