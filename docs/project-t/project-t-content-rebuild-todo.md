# ProjectT／Racing Hub／Articles 後續 Agent 待辦

- 文件狀態：Active TODO / reconciled with current site and owner decisions
- 更新日期：2026-09-11
- 適用範圍：StarRiver Arts Site 的 ProjectT、VRRCTW、Racing Hub、Worlds、Vehicles、Articles，以及後續與 Studio／Museum 的內容架構整合
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
- [ ] 不得為純前台 IA 任務搬動 Racing Hub canonical data、JSON 路徑、IDs、query parameters 或資料管線契約。
- [ ] `/play/RacingClub/TimeAttack/` 目前視為既有 compatibility path；任何物理搬遷必須獨立執行 migration。

## 1. 目前已確認的上位架構

### 1.1 站點角色

- [x] **ProjectT**：創作、策展、世界、車輛設計、Articles 與開發敘事的內容／品牌站。
- [x] **VRRCTW / Racing Club**：社群、活動、參與、規範與玩家關係層；不是車隊。
- [x] **Racing Hub 賽事中心**：資料與應用站，具有獨立視覺、外部 deep links 與可直接使用的資料頁。
- [x] **Time Attack**：Racing Hub 裡的核心競技／紀錄資料域，也是目前歷史 filesystem / URL path 名稱；不得再把 Time Attack 當整個資料站的品牌名稱。
- [x] ProjectT 可以是 Racing Hub 的主要策展／discovery 入口之一，但 Racing Hub 必須維持第一級 deep-link 能力，不要求使用者先經 ProjectT。
- [x] ProjectT 與 Racing Hub 可以在前台視為兩個不同 site shell；品牌從屬、導覽關係與資料 authority 不必綁成同一棵頁面樹。

### 1.2 ProjectT 與 Racing Hub 的資料 authority

- [x] 優先以既有 Racing Hub / Time Attack canonical database 與 generation pipeline 作為可共用 racing entity 的真實索引來源，因其目前最容易維護且已承擔實際營運資料。
- [x] 不另外建立一套獨立 Shared Entity Registry 來複製 Racing Hub 已有的 world／vehicle identity。
- [x] 原則：**可以大量 cross-reference，但同一事實只保留一個 authority；跨站以穩定 ID 關聯，不複製 authority。**
- [x] Racing Hub canonical data 優先負責：world identity、VRChat identity/URL（已知時）、routes、racing systems、vehicle model/variant identity、records、players、teams、events、既有 geography / map data。
- [x] ProjectT 只補 Racing Hub 不應負責的內容：策展短述、體驗定位、開發／發布階段敘事、目標平台、creator/contributor credit、asset provenance、設計目的、車輛調整意圖、featured media、Articles。
- [ ] ProjectT Worlds／Vehicles authoring schema 實作時，優先引用 Racing Hub stable IDs；不得再以名稱／URL 重建第二份 authoritative index。

### 1.3 既有 ProjectT 定位

- [x] Articles 定義為內容與知識層。
- [x] ProjectT Worlds 與 Racing Hub Worlds 的邊界仍成立：ProjectT Worlds 是正式納入 ProjectT 的創作／合作世界；Racing Hub 可索引外部 creator 的可駕駛／競技世界。
- [x] 路線資訊歸在 World Page，不建立獨立 ProjectT Track Page；Racing Hub 的 track / route detail 是資料型 detail，不衝突。
- [x] VRRCTW 對外定位為「中文圈主要的 VRChat 賽車社群」。
- [x] ProjectT Hero 名稱為 ProjectT／Taiwan Touge Project／臺灣山道計畫。
- [x] ProjectT／VRRCTW 核心方向為「創作生態 × 繁體中文社群」；繁中是主要公共語言與文化中心，不是以繁簡字形或國籍作參與排他條件。

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

## 3. ProjectT Worlds：已確認策展決策

### 3.1 Worlds 頁的主要工作

- [x] Worlds 頁第一問題是 **「可以去哪？」**，不是完整專案歷史或 portfolio inventory。
- [x] Public / 可直接前往的 destinations 必須比 Closed Test / 未公開世界有更高視覺權重。
- [x] Closed Test 世界可放在清楚分隔的 development / coming-soon 區域，或成熟前暫不列出；不得假裝所有世界都同等可用。
- [x] Time Attack 是所有目前主要 ProjectT Worlds 的重要 capability，但在 Worlds 頁仍是次於 destination / experience 的第二層資訊。
- [x] 現階段不鎖定四個世界的永久顯示順序。

### 3.2 目前四個主要世界

- [x] **觀星山／StarSight Mt.**：公開、PC + Quest；定位為「在虛構的臺灣山道一路急馳向下」。原創虛構臺灣山道；另包含 VRRCTW clubhouse／café 等 home-base 功能。owner 目前視為四者中最成熟的完成作品。
- [x] **九彎十八拐／9 Turns**：公開、PC + Quest；定位為「宜蘭公路地景」。目前處於待重置／重製狀態；Sacc 與 CVS 版本在 ProjectT curation 中視為同一個 World。
- [x] **玉長公路／Yuli–Changbin**：Closed Test，目前測試入口為 PC；原則上最終仍以 PC + Quest 雙平台為目標。定位為「穿越海岸山脈的公路旅行」。預定成為主要 curated recommendation / onboarding hero，公開前不提供不存在的 public world URL。
- [x] **武嶺／Wuling**：Closed Test，目前測試入口為 PC；最終目標 PC + Quest。定位為「陡峭的高山景觀，探索臺灣公路最高點」。
- [x] **ARTC**：現階段是測試場景，不列入第一批正式 ProjectT Worlds；未來是否轉為正式世界另行決策。

### 3.3 平台資訊必須具有階段語意

- [x] 不再用一個 timeless `platform` 欄位同時表示目前測試狀態與最終目標。
- [ ] 至少能區分：`current/test availability`、`public/release availability`、`target platform support`，或等價資料模型。
- [x] ProjectT worlds 原則上以 **PC + Quest 雙平台**為目標，除非個別世界另有例外。
- [x] 公開 UI 的一般 platform label 中，`PC` 同時涵蓋 PC Desktop 與 PCVR；只有存在特殊 mode-specific limitation 時才拆開說明。
- [x] 不得因 Closed Test 暫時只有 PC build，就把最終目標錯寫成 PC-only。

### 3.4 Creator / contributor / provenance

- [x] 不把 ProjectT schema 寫死成 StarRiver 單一作者；未來可能有其他 creator、共同創作或合作世界。
- [ ] world metadata 支援 `creators[]` 與 `contributors[]`（或等價模型），每筆可帶 role 與公開 attribution link/profile。
- [x] creator 是世界作為作品的創作者／整合者；asset/model provider 等來源應以 contributor / provenance 表達，不混成單一 author 字串。
- [x] 玉長現有確認案例：基礎模型由 **廢凱授權提供**；公開資訊只陳述這個已確認事實，不自行推論商用、轉授權或其他未記錄的 license scope。

### 3.5 世界卡片最低資訊

建議支援：

- [x] 世界名稱
- [x] creators / credit（視覺可弱化，但資料模型不得省略）
- [x] 一句 experience summary
- [x] 公開／開發狀態
- [x] 目前可用平台與必要時的 target platform
- [x] 主要用途／capabilities
- [x] Time Attack / Racing Hub 關聯（適用時）
- [ ] VRChat 世界入口；若未公開則顯示清楚狀態而非空白。

不列為卡片固定欄位：

- [x] 重製計畫：必要時寫入自然語言狀態／描述，不建立每張卡必填欄位。
- [x] 世界版本：可保留但權重低。
- [x] Update Log：後續 World Page 優先提供更新紀錄。

## 4. ProjectT Worlds 頁：P0

目前 `play/worlds/index.html` 仍是舊原型；現有 HTML、`project-t-hub-data.js` 與 owner 實際專案狀態已有漂移，下一輪不得直接以任一份舊頁面當 SSOT。

- [x] 第一輪 owner 策展訪談已取得四個主要世界的定位、公開狀態、平台語意與策展角色。
- [ ] ProjectT authoring source 僅保存 ProjectT-specific overlay，world identity / Racing facts 優先 reference Racing Hub canonical IDs。
- [ ] 修正錯誤相對路徑與 `.dc.html` 草稿連結。
- [ ] 隱藏日本語選項，但保留可用 `.jp` 內容。
- [ ] 將 Hero 改成 ProjectT Worlds 的完整定位，不把分類限縮為山道。
- [ ] 移除過度 placeholder 化的公開敘述。
- [ ] public destination 與 Closed Test / development destination 建立不同視覺權重。
- [ ] 加入 owner 確認的真實世界卡片；Closed Test 世界不放不存在的 public VRChat URL。
- [ ] 九彎十八拐不拆 CVS／Sacc 卡片。
- [ ] ARTC 不列入第一批公開世界卡片。
- [ ] 加入 Update Log 的後續入口設計，不以版本號作為主要展示。
- [ ] Worlds 頁完成真實內容、正確 link 與基本 Gate 後再評估解除 `noindex`；目前維持 `noindex`。

## 5. ProjectT Vehicles：方向已確認，第一版不急著做滿

### 5.1 Registry 與 editorial card 分離

- [x] 「登錄於 ProjectT vehicle inventory」不等於「需要完整策展卡／detail page」。
- [x] 長期可以登錄 ProjectT Worlds 中的所有相關車輛，包括沒有 TA 紀錄者，以及 provenance 有價值的不可駕駛／場景車。
- [x] ProjectT 應優先替能掌控、修改、說明來源或說明設計目的的車輛提供更完整 metadata／editorial treatment。
- [x] 完整 inventory 可以很廣；前台大卡與 detail 必須選擇性呈現，避免複製整個 Racing Hub vehicle database。

### 5.2 Vehicle identity 不得只剩一層

- [x] 同一 real-world vehicle/model 可能存在多個 ProjectT implementation，甚至在不同 world 具有不同配置；不得假設一個 model row 等於一台 in-world vehicle。
- [x] Racing Hub / TA canonical 目前 variant-level identity 為 `vehicle_variant_code`，`vehicle_model_code` 為 model projection；ProjectT 不應把 world-only / non-timed vehicles 硬塞成假的 TA variant。
- [ ] 實作時至少保留以下 conceptual layers（名稱未鎖 schema）：
  1. `vehicle_model`：現實／概念母型；
  2. `asset_source`：模型／資產 provenance；
  3. `project_vehicle`：ProjectT 實際整合／調整的 build / implementation；
  4. `world_vehicle`：世界中的 placement / configuration，多對多；
  5. optional Racing Hub / TA `vehicle_variant_code[]` mapping。
- [ ] `world_vehicle` 支援 role，例如 `drivable`、`static/scenery`、`traffic/ambient` 等。
- [x] 車輛策展資訊可包含：模型來源、授權／credit、整合者、使用系統、調整摘要、handling / tuning intent、出現世界、Racing Hub / TA 關聯。

## 6. ProjectT Articles

### 6.1 公開狀態

- [x] Articles 頁目前維持 `noindex`。
- [ ] 即使先修正分類與頁面結構，在真實文章與 metadata 未完成前仍不公開索引。

### 6.2 第一批文章方向

優先順序採循序推廣：

1. [ ] **第一次玩 VRChat 賽車／Getting Started with VRChat Racing**：Discovery → 找世界 → 進世界 → 找車／生車 → 上車 → 能把車開出去；不處理進階駕駛。
2. [ ] **Sacc 快速上手**：UI、設定、車內 UI、基本按鍵、HUD、計時與 reset。
3. [ ] **CVS 快速上手**：UI、設定、車內 UI、車庫／選車、基本按鍵、HUD、計時與 reset。
4. [ ] 賽車社群概述與推薦世界介紹。
5. [ ] ProjectT 創作理念與世界介紹；可由觀星山作主要案例。

第一篇最低完成目標：

- [x] 不重寫完整 VRChat 安裝／帳號教學；優先連官方或可靠現成教學，未來若有缺口再自行補寫。
- [x] 讓沒玩過 VRChat 的讀者知道 VRC 有大量可駕駛／賽車世界，並能從熟悉作品、地名或類型開始找。
- [x] 用 Racing Hub Track Map 展示目前資料庫規模；不得把資料庫收錄量寫成整個 VRChat 的總量。
- [x] 第一篇只需讓新人理解 Sacc／CVS 是兩套常見系統；NASCVR 與外國 creator 名單不在第一篇展開。
- [x] 最低按鍵／功能涵蓋：上車、油門、煞車、轉向、排檔、開／關燈、喇叭、重置、HUD。
- [x] 常見斷點：不知道車在哪、不知道怎麼生車、不知道怎麼開、不知道怎麼改設定、不知道 HUD／計時在哪。
- [x] 第一篇結尾提供三種出口：直接進 curated world、去 Racing Hub Map／Worlds 找更多世界、去 VRRCTW 找人一起玩。
- [x] curated entry 候選：玉長公路（公開後啟用）、Akina / Jintei（Sacc）、雙鏡湖 / Calme（CVS）；這不是 Top 3 排名。

### 6.3 人物／社群專欄編輯原則

- [x] 人物專欄定位偏簡介、專欄報導與故事整理，不以封神、領地化或誇張競爭敘事為主要文風。
- [x] 賽道「主場」與競技稱號不得混同世界著作權／所有權。
- [ ] 以具名玩家為主要主體的文章，發布前原則上先提供本人預覽，尤其涉及社交關係、師徒、個人背景或可能造成誤解的敘事。

### 6.4 Articles index：P0

- [ ] 修正錯誤相對路徑與 `.dc.html` 草稿連結。
- [ ] 隱藏日本語選項，但可保留部分 `.jp` 草稿。
- [ ] Hero 定位為綜合內容與知識層。
- [ ] 分類改為 Guides／Reviews & Community／Events／ProjectT Development。
- [ ] index 增加明確新手入口：第一次玩 VRChat 賽車、Sacc、CVS。
- [ ] 移除公開頁上的內部編輯說明。
- [ ] 不建立假文章卡、假作者、假日期或假正文。
- [ ] 維持 `noindex` 直到有真實文章與 metadata。

## 7. Racing Hub：架構、資料與 discovery

### 7.1 Racing Hub 是目前資料站的正式站點身份

- [x] `/play/RacingClub/TimeAttack/` 現有頁面公開品牌已是 **Racing Hub 賽事中心**。
- [x] Racing Hub 具有與 ProjectT 不同的視覺 shell；這個差異應保留，不需要硬套 ProjectT theme。
- [x] Racing Hub 具有外部直通與 deep-link 使用情境；ProjectT 不得成為唯一技術入口。
- [x] `TimeAttack` 目前保留為歷史 URL / filesystem path，不代表整站 public identity。
- [x] `賽事中心` 不必成為完整分類學名稱；它可以保留作有個性的品牌副標，精確功能由 IA、分類與 meta description 補足。

### 7.2 路徑策略：現在凍結，未來獨立 migration

- [x] 目前不搬 `/play/RacingClub/TimeAttack/`。
- [x] 不再把 `/play/racing/` landing page 視為已確認必要中介層；Racing Hub 本身已可承擔資料／應用站角色。
- [x] 現有 compatibility path 已被 canonical/OG、sitemap、LLM/search index、build scripts、`tools/maintain_timeattack_public.py`、內部連結、文件與外部 deep links 依賴。
- [ ] 新程式碼逐步集中 Racing Hub base path / base URL / data endpoints，避免新增 literal `/play/RacingClub/TimeAttack/` hard-code。
- [ ] 完整 migration inventory：HTML links、JS fetch、JSON endpoints、canonical/OG、sitemap/search/LLM indexes、query parameters、Discord／外部 links、跨 repo generators/bots/bookmarks。
- [ ] 未來選定新 canonical path 後，設計 old → new mapping 與最強可行 redirect / adapter；IDs、query parameters、JSON contracts 必須保持相容。
- [ ] 搬遷與一般內容更新分離成獨立 PR / migration project，並完成桌面、手機、資料載入與 external deep-link regression。

### 7.3 Browser title / site identity 規則：先於 URL migration 可實作

- [x] 所有子站採 **站點主題在最前面** 的 browser title 原則。
- [x] Racing Hub detail 建議格式：`Racing Hub | 類別 | 名稱`。
- [x] Racing Hub index 建議格式：`Racing Hub | 類別`。
- [x] 類別可用對使用者自然的 UI vocabulary，例如 `Cars / Worlds / Racers / Teams / Events`；不要求與 canonical schema table 名稱一致。
- [x] ProjectT、VRRCTW、Museum 等其他站也應採「site identity first」的相同原則。
- [x] 避免每頁堆疊 `Racing Hub | VR Racing Club | StarRiver Arts`；StarRiver Arts 是 global parent brand，不必在每個 browser title 重複。
- [ ] 實作 title cleanup 時先修改 generator / maintenance logic（尤其 `maintain_timeattack_public.py`），不要逐頁手改；canonical URL 此階段不變。

範例：

- `Racing Hub | Worlds`
- `Racing Hub | Worlds | StarSight Mt.`
- `Racing Hub | Cars | Veryca`
- `Racing Hub | Racers | StarRiver`
- `Racing Hub | Teams | THDK`
- `Racing Hub | Events | {Event name}`
- `ProjectT | Worlds | 玉長公路`
- `ProjectT | Vehicles | Veryca`
- `VRRCTW | Guidelines`

### 7.4 Racing World capability model：P0

- [x] 概念層級採 **Driveable → Timed → Recorded**：可駕駛、有計時、已有本站紀錄是三種不同狀態。
- [ ] `track_worlds` 明確允許收錄可駕駛但沒有計時功能的世界；不得因沒有 route／record 就排除於 discovery layer。
- [ ] canonical world metadata additive 增加 `drivable` 與 timing capability（例如 `timing_support = none / built_in / unknown`，或等價 schema）。
- [ ] 不以 `route_count > 0` 推導世界一定有計時，不以 `record_count > 0` 推導 timing support。
- [ ] 無計時世界不得為了 UI 一致生成假的 route。
- [ ] World detail 區分：① 可駕駛但無計時；② 有計時但尚無投稿；③ 已有紀錄。
- [ ] 無計時 world 第一版可由 owner／管理者低摩擦補錄；需求足夠再考慮公開推薦流程。

### 7.5 World platform metadata：P0

- [ ] platform compatibility 必須是 world-level metadata，不得由 record `platform` 推導。
- [ ] canonical / ProjectT overlay 能區分目前可用與 target platform；Racing Hub discovery 主要顯示目前 public compatibility。
- [x] 公開 UI 一般使用 `PC` / `PC + Quest`；PC 同時涵蓋 Desktop 與 PCVR，特殊限制另註。
- [ ] Map、Worlds、ProjectT cross-links 共享同一 canonical identity，不再各自複製 authoritative platform facts。

### 7.6 Track Map discovery UX：P0

- [ ] 新增自由文字搜尋，可搜 world／track name、地名、別名、reference tags。
- [ ] world row 直接顯示 vehicle system（至少 Sacc／CVS／Other）。
- [ ] 新增 system filter：全部 / Sacc / CVS / 其他。
- [ ] 新增 capability filter：全部可駕駛 / 有計時 / 已有紀錄；可額外顯示無計時。
- [ ] 全球縮放顯示大型 country/region aggregate 與數量；中尺度顯示 region/locality cluster；近距離才顯示單一 world / trace。
- [ ] aggregate 由 canonical/generated data 計算，不另行手寫。
- [ ] 單一 world action：前往 VRChat（primary）→ detail（secondary）→ 聚焦軌跡（tertiary）。
- [ ] URL 缺失顯示封閉測試／未公開／連結待補等明確狀態。
- [x] Map 角色：探索、看規模、從地理與文化入口找 world。

### 7.7 Worlds / Tracks index discovery UX：P0

- [ ] 新增 world／track 自由文字搜尋。
- [ ] 新增 Sacc／CVS system filter。
- [ ] 新增 capability filter：全部可駕駛／有計時／已有紀錄／無計時。
- [ ] 後續可增加 environment filter：山道／賽道／高速公路／Kart／其他。
- [ ] card 增加直接 VRChat World CTA，不要求先進 detail。
- [x] index 角色：知道自己想找什麼時的快速搜尋／查表；與 Map 的地理探索用途互補。

### 7.8 Discovery Search vocabulary 與中文正規化：P0

- [ ] Map 與 Worlds/Tracks 共用同一套 query normalization／search corpus 規則。
- [ ] 支援正式名稱、中文／英文／日文羅馬字、地名與常見別名。
- [ ] metadata 至少拆 `search_aliases`（名稱／異體／俗稱）與 `reference_tags`（作品／文化關聯）。
- [ ] 第一批 vocabulary 至少盤點：頭文字D / Initial D、灣岸 / Wangan Midnight、首都高 / Shutoko、F1、臺灣 / 台灣 / 台湾 / Taiwan、Touge / 山道。
- [ ] `reference_tags` 人工策展，不因「日本山路」自動推導《頭文字 D》。
- [ ] search result 可顯示 match reason。
- [ ] acceptance test 至少保證 `臺灣`、`台灣`、`台湾` 回傳相同臺灣相關集合。
- [ ] 技術評估優先「OpenCC/opencc-js 正規化 + alias corpus + CJK search」；目前數百 world 規模若 substring 已足夠可避免過度依賴。
- [ ] 若需 tokenization / partial search，可評估 FlexSearch `Charset.CJK`；Pagefind 主要留給 Articles／整站全文搜尋。

### 7.9 新人文章發布前 discovery Gate：P0

第一篇 Getting Started 可以先撰寫，但正式公開前至少完成：

- [ ] Map 文字搜尋。
- [ ] Map system 顯示與基本篩選。
- [ ] Map 全球 aggregate／cluster。
- [ ] Map VRChat CTA 優先序調整。
- [ ] Worlds/Tracks 文字搜尋與基本 system filter。
- [ ] Map／Worlds 對 world URL 缺失有明確狀態。
- [ ] world platform metadata 有最小可用版本。

玉長仍在 Closed Test 不阻塞文章草稿；正式作 hero CTA 必須等 public URL 與 onboarding 設計一起上線。

### 7.10 主場／競技稱號：P1

- [x] `home_tracks` 主場顯示概念與可被奪取的 Home Driver / Home Team title 分開。
- [x] 主場稱號是 VRRCTW 競技制度，不代表 world ownership。
- [ ] 正式 title state 應是具 holder、track、challenge spec、held_since、defense_count、history 的 canonical entity，不塞進靜態 `manual_achievement_codes`。
- [ ] 詳細挑戰規則另開產品規格，不在 discovery P0 實作。

## 8. ProjectT 首頁目前可以使用／開發狀態

可列目前可用：

- [x] VRRCTW 社群入口
- [x] Racing Hub 與其大多數資料頁
- [x] Discord 群組內投稿
- [x] ProjectT 公開世界（待 Worlds 精簡公開版完成後正式列出）

可列開發中：

- [x] Events：持續擴充投稿與活動登記能力。
- [x] VRChat Racing Toolkit：核心流程供內部使用；不公開未決定的販售或開源計畫。
- [ ] 其他投稿、驗證、個人頁與資料功能後續再決策。

## 9. VRRCTW 頁：延後決策

- [x] 本輪不處理解除 `noindex`。
- [ ] owner 提供更完整 VRRCTW 詳細資訊後，再決定正式文案、最低公開內容、手機導覽與解除 `noindex` 條件。
- [ ] browser title 後續改為 site-first，例如 `VRRCTW | ...`；社群與 ProjectT / Racing Hub 的關係放在 navigation/body/metadata，不在每個 title 疊品牌。

## 10. 索引與文件同步

- [ ] 更新 `docs/CONTENT_SSOT.md` 與 `project-t-public-information-architecture.md`：反映 `ProjectT ↔ Racing Hub`、Time Attack module、Racing Hub canonical authority 與多 creator ProjectT Worlds。
- [ ] 更新 `.agent-index` / repo map 對 `play/` 與 Racing Hub 的描述，避免把整個資料站繼續叫 Time Attack。
- [ ] 更新 `tools/build_site_index.py` 的分類／labels，使 Racing Hub 成為 site identity。
- [ ] 更新 `llms.txt` / LLM index 的 public entry label：站名用 Racing Hub，Time Attack 只在相應資料域使用。
- [ ] 保持 `.jp` 排除於公開索引。
- [ ] Worlds／Articles 清理完成前，不重建其公開索引。
- [ ] search normalization／alias metadata 的 SSOT 與 generated index 邊界實作前寫明。

## 11. World Page 與內容模型：P2

- [ ] World Page 支援 world identity reference、creators/contributors、狀態、current/target platform、介紹、routes、Racing Hub / Time Attack、社群／活動關係、相關 Articles、Update Log。
- [ ] 顯示 drivable／timing capability；無計時 world 不顯示假排行榜。
- [ ] 不建立獨立 ProjectT Track Page。
- [ ] 第一個 vertical slice 可使用觀星山；玉長公開前可作 onboarding/world-card 設計測試但不提供 public URL。
- [ ] Studio `projects/*.html` 維持製作／portfolio 視角，不直接當完整 World Page。

## 12. Studio 與 Museum 後續

- [ ] Studio 維持 Gallery + Portfolio，不建立 Studio Article 系統。
- [ ] 釐清 canonical project data 與 Studio Project View 的邊界。
- [ ] Museum Gallery 承擔展品基礎資訊。
- [ ] Museum Essays 支援多對多 Exhibit／Exhibition 關係。
- [ ] 評估 ProjectT 與 Museum 共用 base article schema 的程度。
- [ ] 若未來自行補寫「第一次使用 VRChat」通用指南，優先設計成 ProjectT 與 Museum 均可引用的共用內容。
- [ ] Museum browser title 同樣採 site-first naming convention。

## 13. 發布 Gate

任何原型頁解除 `noindex` 或進入公開索引前，必須確認：

- [ ] 定位與分類已確認。
- [ ] placeholder、假文章與內部待辦文字已移除。
- [ ] 內容描述真實 world、資料、活動或具名觀點。
- [ ] creator、contributor、world、route 與資料關係清楚。
- [ ] 外部 world ownership 與 VRRCTW 活動／主場／稱號清楚分離。
- [ ] links 可用且無 `.dc.html` 草稿路徑。
- [ ] Closed Test／未公開 world 沒有假 public URL。
- [ ] current platform、target platform 與 timing capability 沒有由 record presence 錯誤推導。
- [ ] 日文按鈕未顯示，保留 `.jp` 不會意外顯示或進入索引。
- [ ] 桌面與手機完成基本檢查。
- [ ] 最後才重建 sitemap、search 與 LLM-facing indexes。

## 14. 仍需要 owner 決策／輸入

- [ ] 玉長正式公開時的 VRChat URL、最終 curated vehicle roster 與 onboarding hero 完成條件。
- [ ] Sacc／CVS 教學各自的實際 UI、按鍵與設定流程；第一篇只保留 quick-start 級資訊。
- [ ] 第一篇 Getting Started 的作者署名／觀點來源與發布時間。
- [ ] 第四篇「賽車社群概述」與「推薦世界」是否合併或拆分。
- [ ] VRRCTW 詳細資訊與解除 `noindex` 條件。
- [ ] 日文未來恢復按鈕的條件。
- [ ] World Page 與 Studio project page 的 URL／資料共用方式。
- [ ] ProjectT Vehicles 第一版是否正式排入近期 P0/P1，或只先建立 schema / inventory。
- [ ] Racing Hub 未來 canonical URL 是否遷移，以及新 path 的最終名稱；目前不需決定。

## 15. 禁止事項

- [ ] 不得把 AI 示例正文微調後直接發布。
- [ ] 不得把 ARTC 在現階段誤列為正式公開 ProjectT World。
- [ ] 不得把九彎十八拐 CVS／Sacc 拆成兩個 ProjectT World。
- [ ] 不得把外部 world 誤標為 ProjectT World。
- [ ] 不得因 world 出現在 VRRCTW／Racing Hub DB，就暗示 VRRCTW／ProjectT 對該 world 有著作權、所有權或官方管理權。
- [ ] 不得把無計時 world 偽造成具有 route／Time Attack。
- [ ] 不得把 record platform 當作 world platform compatibility。
- [ ] 不得把 Closed Test 的 temporary PC availability 誤寫成最終 PC-only。
- [ ] 不得把「日本山路」等模糊條件自動標成《頭文字 D》 reference。
- [ ] 不得自行推論 contributor asset 的 license scope。
- [ ] 不得讓 ProjectT 再維護一份與 Racing Hub 重疊的 authoritative world／vehicle identity table。
- [ ] 不得在 migration inventory、adapter 與 regression 計畫完成前自行搬動 `/play/RacingClub/TimeAttack/` 或資料契約。
- [ ] 不得因日文按鈕隱藏而誤刪所有可保留日文內容。
