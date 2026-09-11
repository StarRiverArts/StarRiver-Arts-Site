# ProjectT／Articles 後續 Agent 待辦

- 文件狀態：Active TODO / reconciled with current site and owner decisions
- 更新日期：2026-09-11
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
- [x] 路線資訊歸在 World Page，不建立獨立 ProjectT Track Page；Time Attack 既有 `track.html` 為資料／排行榜 detail，不與此決策衝突。
- [x] VRRCTW 對外定位為「中文圈主要的 VRChat 賽車社群」。
- [x] ProjectT Hero 名稱為 ProjectT／Taiwan Touge Project／臺灣山道計畫。
- [x] ProjectT 首頁 P01–P12 核准文案已存入 repo。
- [x] ProjectT／VRRCTW 的核心方向為「創作生態 × 繁體中文社群」；繁中是主要公共語言與文化中心，不是以繁簡字形或國籍作參與排他條件。
- [x] VRRCTW 不定位為車隊；它是公共俱樂部／賽事與社群場域，應容許獨立車手與多支車隊自行形成、競爭與跨社群參與。

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
- [x] 搜尋必須接受簡體中文輸入；這是 discovery compatibility，不代表把簡體中文加入網站主要公開 UI 語言。

## 3. 已確認的 ProjectT Worlds 決策

### 3.1 第一批世界與目前候選

已確認公開／既有主體：

- [x] 觀星山／StarSight Mt.
- [x] 九彎十八拐／9 Turns
- [x] 武嶺／Wuling

新增候選：

- [ ] 玉長公路／Yuli–Changbin：目前封閉測試，預定朝車輛較齊全、駕駛難度較低的 curated hero scene／新人入口發展；公開前不提供 public VRChat world URL，待設計完成後與 onboarding 一併上線。

補充規則：

- [x] 九彎十八拐的 CVS 與 Sacc 版本不拆成兩個獨立 ProjectT World。
- [x] ARTC 目前定位為測試用場景，不以公開世界身分列入第一批 Worlds。
- [x] ARTC 未來可發展為 ProjectT 世界觀中的特定地點，原型來自臺灣車輛測試中心；現階段不對外承諾為正式公開世界。

### 3.2 Worlds 頁公開策略

- [x] 採用精簡公開版。
- [ ] Worlds 頁完成 owner 確認的真實世界介紹、正確連結與基本 Gate 後解除 `noindex`。
- [ ] 在完成前維持 `noindex`。
- [ ] 封閉測試／未公開世界可以列狀態，但不得生成不存在的公開入口；UI 應明示「封閉測試／未公開」，不能只讓按鈕消失。

### 3.3 世界卡片最低資訊

必須顯示：

- [x] 世界名稱
- [x] 作者
- [x] 一句短述
- [x] 公開狀態
- [x] 支援平台
- [x] 主要用途
- [x] Time Attack 連結（適用時）
- [ ] VRChat 世界入口；若未公開則顯示清楚狀態而非空白。

不列為卡片固定欄位：

- [x] 維護狀態：需要持續追蹤，第一版不放。
- [x] 重製計畫：不建立固定欄位，必要時寫在自然語言描述內。
- [x] 世界版本：可保留但權重低。
- [x] Update Log：比世界版本更有價值，後續 World Page 優先提供更新紀錄。

## 4. ProjectT Worlds 頁：P0

目前 `play/worlds/index.html` 仍是舊原型；現有 HTML、`project-t-hub-data.js` 與 owner 實際專案狀態已有漂移，下一輪不得直接以任一份舊頁面當 SSOT。

- [ ] 先由 owner 以問答／策展訪談方式補齊各 ProjectT World 的真實狀態、短述、主要用途、平台與公開策略。
- [ ] 定義 ProjectT World 的單一 authoring source／SSOT，再由它投影 Worlds index 與 Racing cross-link metadata，避免 HTML、hub data、實際專案狀態三邊漂移。
- [ ] 修正錯誤相對路徑與 `.dc.html` 草稿連結。
- [ ] 隱藏日本語選項，但保留可用 `.jp` 內容。
- [ ] 將 Hero 改成 ProjectT Worlds 的完整定位，不把分類限縮為山道。
- [ ] 移除過度 placeholder 化的公開敘述。
- [ ] 加入 owner 確認的真實世界卡片；玉長公路在仍為封閉測試時只顯示狀態，不放公開 VRChat URL。
- [ ] 每張卡包含作者、短述、狀態、平台、主要用途、適用時的 Time Attack 與 VRChat 入口。
- [ ] 九彎十八拐不拆 CVS／Sacc 卡片。
- [ ] ARTC 不列入第一批公開世界卡片。
- [ ] 建立各世界正式介紹文案。
- [ ] 加入 Update Log 的後續入口設計，不以版本號作為主要展示。
- [ ] 通過 Gate 後改為精簡公開版並解除 `noindex`。

## 5. 已確認的 ProjectT Articles 決策

### 5.1 公開狀態

- [x] Articles 頁目前維持 `noindex`。
- [ ] 即使先修正分類與頁面結構，在真實文章與 metadata 未完成前仍不公開索引。

### 5.2 第一批文章方向

優先順序改為循序推廣：

1. [ ] **第一次玩 VRChat 賽車／Getting Started with VRChat Racing**：Discovery → 找世界 → 進世界 → 找車／生車 → 上車 → 能把車開出去；不處理進階駕駛。
2. [ ] **Sacc 快速上手**：UI、設定、車內 UI、基本按鍵、HUD、計時與 reset。
3. [ ] **CVS 快速上手**：UI、設定、車內 UI、車庫／選車、基本按鍵、HUD、計時與 reset。
4. [ ] 賽車社群概述與推薦世界介紹。
5. [ ] ProjectT 創作理念與世界介紹；可由觀星山作為主要案例。

第一篇的最低完成目標：

- [x] 不重寫完整 VRChat 安裝／帳號教學；優先連官方或可靠現成教學，未來若確有缺口再自行補寫，該內容亦可回用 Museum。
- [x] 讓即使原本沒玩 VRChat 的讀者知道 VRC 有大量可駕駛／賽車世界，並能從熟悉作品、地名或類型開始找。
- [x] 用 Racing Track Map 展示目前資料庫的規模；不得把資料庫收錄數量寫成整個 VRChat 的總數。
- [x] 第一篇只需讓新人理解 Sacc／CVS 是兩套常見系統，操作、設定與車內 UI 有差異；NASCVR 與外國創作者名單不在第一篇展開。
- [x] 最低按鍵／功能涵蓋：上車、油門、煞車、轉向、排檔、開／關燈、喇叭、重置、HUD；詳細操作拆到 Sacc／CVS 個別指南。
- [x] 第一篇的常見斷點：不知道車在哪、不知道怎麼生車、不知道怎麼開、不知道怎麼改設定、不知道 HUD／計時在哪。
- [x] 可以教讀者辨認 UI 的共同模式，即使沒有本站翻譯版 UI，仍應能靠相同 visual pattern 找到控制。
- [x] 第一篇結尾提供三種出口：直接進 curated world、去 Map／Tracks 找更多世界、去 VRRCTW 找人一起玩。
- [x] curated entry 候選：玉長公路（ProjectT hero onboarding scene，公開後啟用）、Akina / Jintei（Sacc 入口）、雙鏡湖 / Calme（CVS 入口）。這是 onboarding 用途，不是 Top 3／最佳世界排名。

### 5.3 人物／社群專欄編輯原則

- [x] 人物專欄定位偏簡介、專欄報導與故事整理，不以封神、領地化或誇張競爭敘事為主要文風。
- [x] 賽道「主場」與競技稱號不得混同世界著作權／所有權；外部公開世界的作者仍是原作者，VRRCTW 只描述其自身競技與社群脈絡。
- [ ] 以具名玩家為主要主體的文章，發布前原則上先提供本人預覽，尤其涉及社交關係、師徒、個人背景或可能造成誤解的敘事；公開賽果與一般教學不需要增加同等審閱摩擦。

## 6. ProjectT Articles 頁：P0

- [ ] 修正錯誤相對路徑與 `.dc.html` 草稿連結。
- [ ] 隱藏日本語選項，但可保留部分 `.jp` 草稿。
- [ ] 將 Hero 定位改為綜合內容與知識層。
- [ ] 分類改為 Guides／Reviews & Community／Events／ProjectT Development。
- [ ] 首頁／Articles index 增加清楚的新手入口，不只展示分類：第一次玩 VRChat 賽車、Sacc、CVS。
- [ ] 移除公開頁上的內部編輯說明。
- [ ] 不建立假文章卡、假作者、假日期或假正文。
- [ ] 在尚無文章時顯示清楚空狀態與四類內容說明。
- [ ] 維持 `noindex`。

## 7. Racing 架構與路徑：P1

### 7.1 已確認現況

- [x] Time Attack 內部大多頁面已可使用。
- [x] Time Attack 底下現有 Worlds／tracks 類頁面，作為計時資料與路線紀錄檢視已足夠，但 discovery / onboarding 功能仍不足。
- [x] Events 仍有擴充空間，包含投稿與活動登記。
- [x] Toolkit 未來可能公開販售或開源；目前公開文案只描述為內部使用，不公開未定發行方式。
- [x] 投稿與驗證目前只公開說明「在 Discord 群組內投稿」，不公開更多未定流程。
- [x] 中文玩家可以投稿任何帶計時功能的 VRChat 賽道成績；若賽道尚未收錄，有效成績投稿同時具有擴充世界／賽道資料庫的附加價值。現階段不另造一條高摩擦「新賽道推薦」主流程。

### 7.2 已確認遷移策略

- [x] 採用方案 A：先建立 Racing 上位入口，保留既有 Time Attack 模組路徑。
- [x] `/play/racing/` 作為目前建議的 Racing landing page 路徑。
- [x] Time Attack 短期保留 `/play/RacingClub/TimeAttack/`。
- [x] Racing landing page 先連到 Time Attack、Players、Vehicles、Events 等現有頁。
- [x] 未來目標為將整組 Racing／Time Attack 相關頁面遷移到統一的 Racing 路徑。
- [x] 未來整組搬遷必須作為獨立 migration 執行，不得和一般內容更新混在一起。

### 7.3 未來整組搬遷的必要條件

正式遷移前必須完成：

- [ ] 盤點所有 HTML 相對連結。
- [ ] 盤點 JavaScript `fetch` 與 JSON 資料端點。
- [ ] 盤點 canonical URL、sitemap、search、LLM index 與外部書籤。
- [ ] 盤點 Discord Bot、資料產生器與跨 repo 工具是否依賴舊路徑。
- [ ] 設計舊網址 redirect／adapter。
- [ ] 驗證 query parameters、IDs、資料格式與外部契約不變。
- [ ] 完成桌面、手機與資料載入回歸測試。

### 7.4 為什麼採分階段處理

Time Attack 是計時紀錄模組，Racing 則是包含世界、路線、玩家、車輛、隊伍、活動與未來投稿／驗證的上位系統。先建立 Racing 入口，可以立刻修正 IA，且不破壞既有可用頁面與資料契約。

長期整組搬到 Racing 路徑仍是目標，但必須在依賴盤點、redirect 與回歸測試齊備後執行，避免為了路徑整齊而造成既有網站、資料工具或外部連結中斷。

### 7.5 Racing World capability model：P0

目前資料多從 Time Attack 成績成長，但 Racing 世界母集合不得被「是否已有成績」綁死。

- [x] 概念層級採 **Driveable → Timed → Recorded**：可駕駛、有計時、已有本站紀錄是三種不同狀態。
- [ ] `track_worlds` 明確允許收錄可駕駛但沒有計時功能的世界；不得因沒有 route／record 就把它排除於 discovery layer。
- [ ] canonical world metadata additive 增加 `drivable` 與 timing capability（例如 `timing_support = none / built_in / unknown`，或等價 schema）。
- [ ] 不以 `route_count > 0` 推導世界一定有計時，不以 `record_count > 0` 推導 timing support。
- [ ] 無計時世界不得為了 UI 一致生成假的 route。
- [ ] World / Track detail 明確區分空狀態：① 可駕駛但無計時；② 有計時但尚無投稿；③ 已有紀錄。
- [ ] 無計時世界 discovery 第一版可先由 owner／管理者人工低摩擦補錄；等需求足夠再考慮公開「推薦可駕駛世界」流程。

### 7.6 World platform metadata：P0

- [ ] platform compatibility 必須是 world-level metadata，不得由 Time Attack record 的 `platform` 欄位推導。
- [ ] 至少記錄／顯示：PC Desktop、PCVR、Quest standalone；UI 可在第一版合併成簡單的 `PC`／`PC + Quest`，特殊限制再展開。
- [ ] 盤點現有世界：PC-only、Quest-compatible、Unknown。
- [ ] Map、Tracks、ProjectT Worlds 共用同一份 platform metadata。

### 7.7 Track Map discovery UX：P0

目前 Track Map 已能展示大量世界與地理分布，但仍偏資料庫地理檢視器；新人入口需要以下改造：

- [ ] 新增自由文字搜尋，可直接搜 world name／track name／地名／別名／reference tags。
- [ ] 賽道 row 直接顯示 vehicle system（至少 Sacc／CVS／Other），不必先進 detail。
- [ ] 新增 system filter；第一版至少 `全部 / Sacc / CVS / 其他`。
- [ ] 新增 capability filter：`全部可駕駛 / 有計時 / 已有紀錄`；可選擇額外顯示 `無計時`。
- [ ] 改善地圖縮放資訊層級：全球／最小縮放只顯示大型國家或區域 aggregate 與賽道數量；中尺度顯示 region／locality cluster；放大後才顯示單一地點、世界與 route trace。
- [ ] aggregate 數量由 canonical/generated data 計算，不另行手寫。
- [ ] 單一世界 action 優先序改為：**前往 VRChat**（primary）→ 賽道詳情（secondary）→ 聚焦軌跡（tertiary）。
- [ ] world URL 缺失時顯示狀態，例如「封閉測試／未公開／連結待補」，不得只靜默移除按鈕。
- [ ] Map 的產品角色定義為 **探索／看規模／從地理與文化入口找世界**。

### 7.8 Tracks index discovery UX：P0

- [ ] 新增 world／track 自由文字搜尋。
- [ ] 新增 Sacc／CVS system filter。
- [ ] 新增 capability filter：全部可駕駛／有計時／已有紀錄／無計時。
- [ ] 可後續增加 environment filter：山道／賽道／高速公路／Kart／其他。
- [ ] Track card 增加直接 VRChat World CTA，不要求使用者一定先進 `track.html`。
- [ ] Tracks 的產品角色定義為 **知道自己想找什麼時的快速搜尋／查表**；與 Map 的地理探索用途互補。

### 7.9 Discovery Search vocabulary 與中文正規化：P0

搜尋不得只做資料庫正式欄位字串比對；必須讓新人能用自己知道的文化語彙找到世界。

- [ ] Map 與 Tracks 共用同一套 query normalization／search corpus 規則。
- [ ] 支援正式名稱、中文／英文／常見日文羅馬字、地名與常見別名。
- [ ] additive metadata 建議至少拆為 `search_aliases`（名稱／異體／俗稱）與 `reference_tags`（作品／文化關聯），不得把作品名混成正式賽道名稱。
- [ ] 第一批 reference vocabulary 至少盤點：`頭文字D / Initial D`、`灣岸 / Wangan Midnight`、`首都高 / Shutoko`、`F1`、`臺灣 / 台灣 / 台湾 / Taiwan`、`Touge / 山道`。
- [ ] `reference_tags` 採人工／策展 metadata，不因「日本山路」等模糊條件自動推導成《頭文字 D》關聯。
- [ ] 搜尋結果可顯示 match reason，例如「作品關聯：頭文字 D」「別名：榛名」「系統：Sacc」。
- [ ] 中文搜尋 acceptance test 至少保證 `臺灣`、`台灣`、`台湾` 回傳相同的臺灣相關結果集合；同理應驗證常見繁簡輸入，而不是只依賴 display copy。
- [ ] 技術評估優先採「中文正規化 + CJK search」兩層：OpenCC / opencc-js 可處理簡繁與臺灣正體轉換；若需要真正 CJK tokenization／partial search，可評估 FlexSearch `Charset.CJK`。對目前約數百 world 的 Map／Tracks，若 normalize 後的 alias corpus + substring search 已足夠，可先避免過度引入依賴。
- [ ] Pagefind 可另行評估作 Articles／整站搜尋；其 CJK segmentation 適合文章全文檢索，但不應取代 Map／Tracks 的結構化 filter 與 metadata search。

### 7.10 新人文章發布前 discovery Gate：P0

第一篇 Getting Started 可以先撰寫，但正式公開前至少完成：

- [ ] Map 文字搜尋。
- [ ] Map system 顯示與基本篩選。
- [ ] Map 全球縮放 aggregate／cluster，避免最小縮放直接灑滿細節 marker。
- [ ] Map 的 VRChat CTA 優先序調整。
- [ ] Tracks 文字搜尋與基本 system filter。
- [ ] Map／Tracks 對 world URL 缺失有明確狀態。
- [ ] world platform metadata 有最小可用版本。

玉長仍在封閉測試不阻塞文章草稿；正式作為 hero CTA 必須等公開 world URL 與 onboarding 設計一起上線。

### 7.11 主場／競技稱號：P1

- [x] 玩家頁前端已預留 `home_tracks` 主場顯示概念；未來應接 canonical／generator，而不是只靠手寫 UI。
- [x] 「主場偏好／代表賽道」與「可被奪取的現任主場車手／主場車隊稱號」應分開。
- [x] 主場稱號是 VRRCTW 競技制度，不代表賽道／世界所有權；外部公開世界作者與 VRRCTW title holder 必須分開顯示。
- [ ] 若正式實作，主場稱號應是具狀態與歷史的 canonical entity（holder、track、challenge spec、held_since、defense_count、history），不塞進靜態 `manual_achievement_codes`。
- [ ] 車手與車隊主場規則、挑戰規格、持有上限與歷史展示另開獨立產品規格，不在本輪 discovery P0 直接實作。

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
- [ ] 搜尋正規化／alias metadata 的 SSOT 與 generated search index 邊界需在實作前寫明，避免 alias 分散在前端、JSON 與文章文案中。

## 11. World Page 與內容模型：P2

- [ ] World Page 支援世界名稱、作者、狀態、平台、介紹、路線、Time Attack、社群／活動關係、相關 Articles、Update Log。
- [ ] World Page 額外顯示 drivable／timing capability；無計時世界不顯示假排行榜。
- [ ] 不建立獨立 ProjectT Track Page。
- [ ] 第一個 vertical slice 使用觀星山；玉長公開前可作 onboarding/world-card 設計測試，但不提供 public URL。
- [ ] 不直接把 Studio `projects/*.html` 當成完整 World Page。

## 12. Studio 與 Museum 後續

- [ ] Studio 維持 Gallery + Portfolio，不建立 Studio Article 系統。
- [ ] 釐清 canonical project data 與 Studio Project View 的邊界。
- [ ] Museum Gallery 承擔展品基礎資訊。
- [ ] Museum Essays 支援多對多 Exhibit／Exhibition 關係。
- [ ] 評估 ProjectT 與 Museum 共用 base article schema 的程度。
- [ ] 若未來自行補寫「第一次使用 VRChat」通用指南，優先設計成 ProjectT 與 Museum 均可引用的共用內容，而非只服務 Racing。

## 13. 發布 Gate

任何原型頁解除 `noindex` 或進入公開索引前，必須確認：

- [ ] 定位與分類已確認。
- [ ] placeholder、假文章與內部待辦文字已移除。
- [ ] 內容描述真實世界、資料、活動或具名觀點。
- [ ] 作者、世界、路線與資料關係清楚。
- [ ] 外部世界的作者／所有權與 VRRCTW 的活動、主場、稱號或社群敘事清楚分離。
- [ ] 連結可用且無 `.dc.html` 草稿路徑。
- [ ] 封閉測試／未公開世界沒有假 public URL。
- [ ] world platform 與 timing capability 不由 record presence 錯誤推導。
- [ ] 日文按鈕未顯示，保留 `.jp` 不會意外顯示或進入索引。
- [ ] 桌面與手機完成基本檢查。
- [ ] 最後才重建 sitemap、search 與 LLM-facing indexes。

## 14. 仍需要 owner 決策／輸入

- [ ] 以問答方式取得觀星山、九彎十八拐、武嶺、玉長等 ProjectT Worlds 的正式短述、平台、公開狀態與主要用途文字。
- [ ] 確認玉長正式公開時的 VRChat URL、curated vehicle roster 與 onboarding hero scene 完成條件。
- [ ] Sacc／CVS 教學各自的實際 UI、按鍵與設定流程；第一篇只保留 quick-start 級資訊。
- [ ] 第一篇 Getting Started 的實際作者署名／觀點來源與發布時間。
- [ ] 第四篇「賽車社群概述」與「推薦世界」是否合併為一篇，或拆成兩篇。
- [ ] 首頁 Racing 卡片何時停止直接連 Time Attack，改連 `/play/racing/`。
- [ ] VRRCTW 詳細資訊與解除 `noindex` 條件。
- [ ] 日文未來恢復按鈕的條件。
- [ ] World Page 與 Studio project page 的 URL／資料共用方式。
- [ ] 未來整組 Racing migration 的執行時機與相容期長度。

## 15. 禁止事項

- [ ] 不得把 AI 示例正文微調後直接發布。
- [ ] 不得把 ARTC 在現階段誤列為正式公開 ProjectT World。
- [ ] 不得把九彎十八拐 CVS／Sacc 拆成兩個 ProjectT World。
- [ ] 不得把外部世界誤標為 ProjectT World。
- [ ] 不得因某世界出現在 VRRCTW／Racing 資料庫，就暗示 VRRCTW／ProjectT 對該世界有著作權、所有權或官方管理權。
- [ ] 不得把無計時世界偽造成具有 route／Time Attack 的世界。
- [ ] 不得把 record platform 當作 world platform compatibility。
- [ ] 不得把「日本山路」等模糊條件自動標成《頭文字 D》等作品 reference。
- [ ] 不得在 migration 計畫完成前自行搬動 Time Attack 路徑或資料契約。
- [ ] 不得因日文按鈕隱藏而誤刪所有可保留日文內容。
