# ProjectT／Articles 後續 Agent 待辦

- 文件狀態：Active TODO
- 更新日期：2026-07-27
- 適用範圍：StarRiver Arts Site 的 Studio、ProjectT、Museum 與 Articles 相關頁面
- 權威參考：
  - `docs/CONTENT_SSOT.md`
  - `docs/project-t/project-t-public-information-architecture.md`

## 0. Agent 開始工作前

- [ ] 先讀 `docs/CONTENT_SSOT.md`。
- [ ] 再讀 `docs/project-t/project-t-public-information-architecture.md`。
- [ ] 不得直接把現有 HTML 原型、placeholder、AI 生成文案或舊導覽結構視為正式需求。
- [ ] 若頁面內容與 SSOT 衝突，以最新 owner decision 與 SSOT 為準。
- [ ] 不得因為頁面視覺完整，就假設內容已可公開。
- [ ] 不得直接重建 `site-index.json`、`search-index.json`、`llm-index.json`、`sitemap.xml` 或 `llms.txt`，直到來源頁通過內容清理 Gate。

## 1. 全站污染盤點

目標：找出所有可能被搜尋、索引工具或後續 Agent 誤認為正式內容的 AI 佔位符與舊定位。

- [ ] 逐頁盤點 Studio、ProjectT、Museum、Projects 與 Articles 相關 HTML。
- [ ] 使用以下標籤分類每個頁面或區塊：
  - `keep`
  - `rewrite`
  - `remove/defer`
  - `contaminated-placeholder`
- [ ] 特別檢查：
  - 看似完整但語義空泛的定位文案。
  - 模擬文章標題、作者、日期或正文。
  - AI 推測出的分類與功能。
  - 「建置中」但具有真實文章外觀的內容。
  - 已過時的 ProjectT＝臺灣地景展示頁定位。
  - 把 Time Attack、Racing Club、Racing 當成錯誤同層關係的文案。
  - 日文選單與未完成日文內容。
- [ ] 產出逐頁清單，記錄檔案路徑、區塊、問題、建議處置與依據。
- [ ] 未清理頁面維持 `noindex`，不得加入主要導覽。

## 2. ProjectT 首頁重寫

目標：將目前狹窄或語義不明的 ProjectT 首頁改為完整生態入口。

- [ ] 保留 ProjectT 的 layered color-block mountain hero 視覺。
- [ ] 使用 SSOT 中的完整定位，不再只用 `臺灣地景 VR 體驗` 作為完整定義。
- [ ] 明確呈現四個核心系統：
  - ProjectT Worlds
  - VRRCTW
  - Racing
  - VRChat Racing Toolkit
- [ ] 將 Articles 呈現為內容與知識層，不當成第五個營運核心。
- [ ] 加入目前可直接使用的入口：VRRCTW、Racing／Time Attack、公開世界。
- [ ] Toolkit 使用保守狀態文案，不寫固定完成百分比。
- [ ] 檢查手機導覽，不得直接隱藏全部主要入口。
- [ ] 清除首頁上所有未經 owner 確認的抽象框架與 AI 生成定位。

## 3. ProjectT 導覽與從屬關係

- [ ] 頂層導覽調整為：Overview／ProjectT Worlds／VRRCTW／Racing／Toolkit／Articles。
- [ ] Time Attack 不再與 Racing 並列為頂層系統。
- [ ] 保留現有 `/play/RacingClub/TimeAttack/` 實體路徑與資料契約。
- [ ] 以入口頁、redirect 或 adapter 方式逐步建立 Racing 公開入口。
- [ ] 不在未完成資料遷移前搬動 canonical DB、JSON 路徑、IDs 或 query parameters。

## 4. ProjectT Worlds

目標：建立真正的 ProjectT 自有世界索引與 World Page。

- [ ] 將 `VRChat Worlds`／`山道世界`定位改為 `ProjectT Worlds`。
- [ ] 不把 ProjectT Worlds 限縮為山道；需容納道路、測試設施、城市或其他計畫世界。
- [ ] 明確區分：
  - ProjectT Worlds：StarRiver 製作並正式納入 ProjectT。
  - Racing Worlds：Racing 收錄的所有相關世界，可包含外部作者世界。
- [ ] 每個 World Page 至少支援：
  - 世界名稱與作者
  - 狀態與平台
  - 世界基礎介紹
  - 世界內路線列表
  - 路線方向與簡短特性
  - Racing／Time Attack 入口
  - 社群與活動關係
  - 相關 Articles
- [ ] 不建立獨立 Track Page。
- [ ] 若文章談特定路線，使用 world + route metadata 清楚標示。
- [ ] 不直接把 `projects/*.html` 的 Studio 作品頁當成完整 World Page。

## 5. ProjectT Articles

目標：將現有「製作筆記／路線研究／技術拆解」原型擴充為綜合文章集。

- [ ] 將分類調整為：
  - Guides
  - Reviews & Community
  - Events
  - ProjectT Development
- [ ] Guides 支援：世界使用、路線熟練、駕駛節奏、常見失誤、活動參與、投稿說明。
- [ ] Reviews & Community 支援：玩家觀點、世界與 VRRCTW 關係、共同記憶、版本或車輛體驗。
- [ ] Events 支援：活動介紹、賽事預覽、賽事紀錄、賽制、結果與賽後評論。
- [ ] ProjectT Development 支援：世界製作、路線研究、Racing、Toolkit、治理與技術實驗。
- [ ] 開發紀錄為可選，不要求所有開發都公開。
- [ ] 玩家評論與主觀內容必須標示作者、觀點來源與日期。
- [ ] 文章 metadata 至少支援：
  - article type
  - author／viewpoint source
  - publish date
  - world relationship
  - route／direction within world
  - event relationship
  - Racing／Time Attack links
- [ ] 外部作者世界可被介紹，但不得因此標成 ProjectT World。
- [ ] 文章頁應反向連到 World Page 與 Racing／Time Attack。
- [ ] World Page 應顯示相關文章列表。

## 6. Studio

- [ ] 維持 Studio 為 Gallery + Portfolio。
- [ ] 不建立 Studio Article 系統。
- [ ] 作品頁保持精簡、視覺優先、必要資訊優先。
- [ ] 不強迫加入相關閱讀、社群評論或內容網絡。
- [ ] 釐清共用 canonical project data 與 Studio Project View 的邊界。
- [ ] 若同一世界同時出現在 Studio 與 ProjectT，保留不同前台呈現，不複製所有底層事實。

## 7. Museum Gallery／Exhibitions

- [ ] Gallery Page 承擔展品基礎資訊，不要求每件展品建立獨立詳情頁。
- [ ] 展品卡可包含：名稱、作者、年份／媒材（需要時）、圖片、短述、展區、相關 Essay。
- [ ] 沒有足夠內容的展品只需要畫廊卡，不建立假文章。
- [ ] 保留 Museum 獨立視覺主題與導覽外殼。

## 8. Museum Columns／Essays

- [ ] 分類至少支援：
  - Exhibit Essays
  - Current Commentary
  - VRC Community & Culture
- [ ] Essay 必須支援：
  - 單一展品
  - 多個展品
  - 一組作品
  - 展區
  - 整場展覽主題
  - 不綁任何展品的評論或文化分析
- [ ] Essay 與 Exhibit／Exhibition 使用多對多關係。
- [ ] 建議 metadata：
  - `exhibit_ids[]`
  - `exhibition_ids[]`
  - `section_ids[]`
  - `article_type`
  - author
  - publish date
- [ ] 現有 `museum/article.html` 只視為單件／展品型 Essay 原型。
- [ ] 另設計通用 Museum Commentary／Culture 文章開頭結構。
- [ ] 不強迫時事評論或社群文章填入媒材、年份、作者、所屬展覽等展品欄位。

## 9. Articles 共用基礎架構評估

目標：避免三套功能完全重複，同時保留不同內容模型與視覺主題。

- [ ] 比較 ProjectT 與 Museum 是否共用：
  - base article schema
  - author/date/language fields
  - editor workflow
  - search indexing
  - reusable typography/content components
- [ ] 不共用或不可強制共用：
  - 頂層分類
  - 導覽外殼
  - hero／lede 結構
  - 視覺主題
  - subject relationships
- [ ] 決定 URL 策略：同資料不同 theme route，或分區固定 route。
- [ ] 決定跨區文章是否允許，以及跨區時的 primary section 與 theme 規則。
- [ ] 決定推薦機制是否預設只推薦同區內容。

## 10. 語言清理

- [ ] 公開語言目前只保留繁體中文與英文。
- [ ] 使用者可見名稱使用 `繁體中文`／`Traditional Chinese`。
- [ ] HTML 使用 `zh-Hant-TW` 或保留既有 `zh-TW`。
- [ ] 程式內部短碼可用 `zh`。
- [ ] 未完成日文內容與控制不得出現在公開頁面。
- [ ] 清理頁面中的 `.jp` 佔位內容，或確保其完全不進入索引。

## 11. 發布 Gate

任何原型頁解除 `noindex`、加入主要導覽或進入公開索引前，必須確認：

- [ ] 定位與分類已由 owner 確認。
- [ ] 所有 AI placeholder、假標題、假正文與語義不明框架已移除。
- [ ] 內容描述真實存在的世界、資料、展覽、展品、事件或具名觀點。
- [ ] 所有權、作者、世界、路線、展覽與展品關係清楚。
- [ ] 連結可用且不依賴 `href="#"` 或 `.dc.html` 草稿路徑。
- [ ] 繁中與英文內容狀態清楚。
- [ ] 桌面與手機視覺完成基本檢查。
- [ ] 搜尋、sitemap 與 LLM-facing indexes 從清理後來源重新生成。
- [ ] 生成後人工抽查 index，確認沒有 placeholder 或 stale IA。

## 12. 建議執行順序

### Phase A：防止繼續污染

- [ ] 完成全站污染盤點。
- [ ] 將高風險 placeholder 改成明確的非公開標記，或從可解析正文移除。
- [ ] 確認原型頁仍為 `noindex` 且未進入主要導覽。
- [ ] 暫停從污染頁面重建公開與 LLM 索引。

### Phase B：ProjectT 公開入口

- [ ] 重寫 ProjectT 首頁。
- [ ] 修正導覽與四核心系統關係。
- [ ] 建立 Racing 入口但保持 Time Attack 相容路徑。
- [ ] 完成 ProjectT Worlds 索引的真實內容版本。

### Phase C：內容模型

- [ ] 定義 World Page schema。
- [ ] 定義 ProjectT Article schema。
- [ ] 定義 Museum Essay／Commentary schema。
- [ ] 決定 ProjectT 與 Museum 共用基礎架構的邊界。

### Phase D：實際內容與公開

- [ ] 先建立少量真實內容作為 vertical slice。
- [ ] ProjectT：至少一個 World Page + 一篇 Guide／Community／Event 文章。
- [ ] Museum：至少一個 Gallery + 一篇可對應多展品的 Essay 或 Commentary。
- [ ] 通過發布 Gate 後，再解除個別頁面 `noindex`。
- [ ] 最後重建 search、sitemap 與 LLM indexes。

## 13. 禁止事項

- [ ] 不得把 AI 生成的示例正文改幾個字後直接發布。
- [ ] 不得把 placeholder category 當成已確認產品需求。
- [ ] 不得把外部世界誤標成 ProjectT World。
- [ ] 不得建立獨立 Track Page，除非 owner 之後明確推翻目前決策。
- [ ] 不得把 Time Attack 從現有路徑直接搬走而不做契約盤點。
- [ ] 不得直接修改 canonical DB、generated JSON、IDs 或 pipeline contract 來配合純前台 IA。
- [ ] 不得讓 Studio、ProjectT、Museum 強制共用同一種內容分類或同一個視覺模板。
