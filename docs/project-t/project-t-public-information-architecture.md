# ProjectT 公開網站資訊架構草案

- 文件狀態：Draft for review
- 適用範圍：StarRiver Arts Site／ProjectT 公開網站
- 更新日期：2026-07-27
- 目的：定義 ProjectT 的對外定位、核心組成、內容邊界、命名方式、文章分類與公開網站導覽層級。

## 1. ProjectT 的對外定位

ProjectT 是一項以臺灣為出發點的 VRChat 賽車社群計畫。

計畫從臺灣道路、地景與駕駛文化出發，連結 VRChat 世界製作、繁體中文賽車社群、賽車資料系統與賽事工具，建立一套能持續舉辦活動、保存與驗證紀錄、整理知識，並回饋世界與社群發展的 VRChat 賽車生態。

ProjectT 不是單一世界、單一社群網站或單一排行榜。它是一個由世界、社群、資料與工具共同構成的上位計畫。

### 建議首頁主述句

> ProjectT 是一項以臺灣為出發點的 VRChat 賽車社群計畫，連結 ProjectT Worlds、VRRCTW、Racing 與 VRChat Racing Toolkit，建立可持續運作的世界、活動、資料與工具生態。

## 2. 核心生態架構

ProjectT 目前由四個核心部分構成：

1. ProjectT Worlds
2. VRRCTW
3. Racing
4. VRChat Racing Toolkit

Articles 為跨越上述系統的內容與知識層，不視為第五個營運核心，但在網站資訊架構中可擁有獨立入口。

```text
ProjectT
├─ ProjectT Worlds
├─ VRRCTW
├─ Racing
├─ VRChat Racing Toolkit
└─ Articles（內容與知識層）
```

### 生態閉環

```text
ProjectT Worlds
    ↓ 提供駕駛、探索與活動場地
VRRCTW
    ↓ 組織玩家、活動、賽事與社群關係
VRChat Racing Toolkit
    ↓ 協助執行賽事、收集與整理結果
Racing
    ↓ 保存、驗證、查詢與呈現結構化資料
Articles
    ↓ 解釋世界、賽道、活動、社群與開發脈絡
資料與社群回饋
    ↺ 回到世界、活動、工具與內容改善
```

## 3. ProjectT Worlds

### 定義

ProjectT Worlds 是由 StarRiver 製作，並正式納入 ProjectT 的 VRChat 世界集合。

這些世界主要以臺灣道路、地景與駕駛文化為出發點，可承擔駕駛、探索、聚會、活動與計時挑戰等用途。

### 邊界

ProjectT Worlds 不等於 Racing 資料庫中收錄的全部 VRChat 世界。

- ProjectT Worlds：由 StarRiver 製作並正式納入 ProjectT 的世界。
- Racing Worlds：所有被 Racing 收錄的相關世界，可包含其他作者的世界。

外部作者世界即使被 Racing 收錄、曾被 VRRCTW 使用，或有 ProjectT Articles 介紹，也不因此成為 ProjectT Worlds。

### World Page 與賽道資訊

ProjectT 不另建立獨立 Track Page。賽道與路線資訊歸在所屬 World Page 內，由文章明確標示目前描述的是哪一條路線。

```text
World Page
├─ 世界基礎資訊
├─ 世界內路線列表
├─ 各路線的簡短性格與方向說明
├─ Time Attack／Racing 入口
├─ 活動與社群關係
└─ 相關 Articles
```

若同一世界包含多條賽道，文章 metadata 至少應標示：

- `world_id`
- `route_name` 或 `route_id`
- `direction`
- `article_type`

### 建議狀態標記

- Public／已公開
- Testing／測試中
- In Development／開發中
- Rebuilding／重製中
- Legacy／歷史版本
- Maintenance Ended／停止維護

## 4. VRRCTW

### 定義

VRRCTW 是 ProjectT 的繁體中文 VRChat 賽車社群與活動層。

社群以繁體中文為主要交流語言，連結玩家、世界作者、車輛作者與活動組織者，持續舉辦駕駛活動、計時挑戰、交流與賽事。

### 建議對外名稱

中文：

> VRRCTW｜繁體中文 VRChat 賽車社群

英文：

> VRRCTW | Traditional Chinese VRChat Racing Community

「Traditional Chinese」描述主要使用語言與內容環境，不代表國籍限制。

## 5. Racing

### 定義

Racing 是 ProjectT 的賽車資料與資訊系統。

它整理與呈現世界、世界內路線、玩家、車輛、車隊、活動、賽事與計時紀錄，並逐步承接投稿、驗證、個人頁面與統計分析等功能。

### Time Attack 的從屬關係

Time Attack 是 Racing 之下已投入使用的計時紀錄模組，不是與 Racing 或 VRRCTW 同層的獨立核心系統。

```text
Racing
├─ Time Attack
├─ Worlds（包含世界內路線）
├─ Players
├─ Vehicles
├─ Teams
├─ Events
└─ 未來模組
   ├─ Submission
   ├─ Verification
   ├─ Profiles
   └─ Statistics
```

### Racing Worlds 與 ProjectT Worlds

Racing Worlds 是資料庫中的世界實體，可能包含：

- ProjectT Worlds
- VRRCTW 常用的外部世界
- 曾舉辦活動的世界
- 具有 Time Attack 紀錄的世界
- 已停止維護但仍具有歷史資料的世界

建議在 Racing 世界資料中標示：

- `creator`
- `project_affiliation`
- `is_project_t_world`
- `community_relation`
- `racing_status`
- `article_ids`

## 6. VRChat Racing Toolkit

### 定義

VRChat Racing Toolkit 是 ProjectT 正在開發的賽事工具組。

其目標是協助活動組織者設定與執行賽事、收集與整理成績、處理驗證流程，並將結果串接至 Racing 資料系統。

### 公開狀態描述原則

不使用容易過期且難以驗證的固定完成百分比。

建議描述：

> 部分核心工具與流程已完成或投入內部使用，完整資料串接與公開發行仍在開發中。

## 7. ProjectT Articles

### 定義

ProjectT Articles 是 ProjectT 的綜合內容與知識層，可跨越 ProjectT Worlds、VRRCTW、Racing 與 Toolkit。

它不是單純的開發日誌。內容可同時包含世界與路線介紹、使用說明、熟練指南、玩家觀點、社群評論、賽事紀錄與評論，以及 ProjectT 開發紀錄。

文章不只介紹 ProjectT 自有世界，也可以介紹其他作者製作、但與 Racing 或 VRRCTW 有直接關係的世界與賽道。

因此，外部世界出現在文章中不代表該世界由 ProjectT 所有或屬於 ProjectT Worlds。

### 建議分類

#### Guides／指南

- 世界使用方式
- 路線熟練與駕駛節奏
- 關鍵彎角與常見失誤
- 車輛選擇
- 新手學習順序
- 活動參加與 Time Attack 投稿說明

#### Reviews & Community／評論與社群

- 玩家評論
- 世界與 VRRCTW 的關係
- 社群使用方式
- 重要活動與共同記憶
- 世界、車輛或版本體驗

玩家評論與主觀文章必須標示作者、觀點來源與發布日期，避免被誤認為 ProjectT 的客觀官方結論。

#### Events／活動與賽事

- 活動介紹
- 賽事預覽
- 賽事紀錄
- 賽制說明
- 賽後評論
- 結果與 Racing 資料的敘事整理

#### ProjectT Development／ProjectT 開發

- ProjectT Worlds 製作
- 路線研究
- Racing 資料系統演進
- Toolkit 開發
- 架構與治理
- 技術實驗與版本更新

開發紀錄是可選內容，不要求每次開發都公開記錄。

### Articles 與 World／Racing 的互連

```text
World Page
├─ 世界與路線基礎資訊
├─ Time Attack／Racing 入口
├─ 活動紀錄
└─ 相關 Articles

Article Page
├─ 文章類型與作者
├─ 所屬世界
├─ 所描述的路線
├─ 正文與觀點來源
├─ World Page 入口
└─ Racing／Time Attack 入口
```

Articles 提供解釋、脈絡、經驗與評論；World Page 與 Racing 提供穩定、可查詢的基礎資料。彼此互相連結，但不互相取代。

## 8. 三區內容模型

StarRiver Arts Site 的三個大區不應被強迫使用同一種 Article 分類。

### Studio

Studio 是 Gallery + Portfolio，不視為 Article 系統。

其內容應保持：

- 精選
- 簡短
- 必要資訊優先
- 不要求相關閱讀或跨頁內容網絡

Studio 主要使用 Project／Work／Case Study 內容模型，而不是 Article。

### ProjectT

ProjectT 使用 World Page、Racing 結構化資料與綜合 Articles。

### Museum

Museum 使用 Exhibition／Gallery 與 Columns／Essays。

## 9. Museum 內容分類

Museum 的內容核心是策展、作品解讀、時事評論與 VRChat 社群文化，而不是完整展品資料庫。

### Exhibition／Gallery

Gallery Page 可承擔展品基礎資訊：

- 展品名稱
- 作者
- 年份與媒材（需要時）
- 圖像或預覽
- 一句說明
- 所屬展覽或展區
- 相關 Essay 入口

不是每件展品都必須擁有獨立詳情頁或專欄。

### Exhibit Essay／展品專欄

Essay 可對應：

- 單一展品
- 多個展品
- 一組作品
- 一個展區
- 整場展覽中的共同主題

因此 Essay 與 Exhibit 應為多對多關係，而不是預設一篇文章只屬於一件作品。

```text
Museum Essay
├─ 0..n Exhibits
├─ 0..n Exhibitions／Sections
├─ 主題與策展觀點
└─ 相關內容
```

建議關聯欄位：

- `exhibit_ids[]`
- `exhibition_ids[]`
- `section_ids[]`
- `article_type`

### Current Commentary／時事評論

- VRChat 平台與文化事件
- 數位藝術與虛擬展覽趨勢
- AI 創作與展示
- 虛擬社群治理與平台政策

### VRC Community & Culture／VRC 社群與文化

- VRChat 創作者生態
- 世界作者與展覽活動
- 中文圈與海外圈的內容文化
- 虛擬空間中的觀看、展示與社群使用方式

## 10. 共用與分離原則

目前不預先決定 ProjectT 與 Museum Articles 是否完全共用同一套前台。

已確定：

1. Studio 不需要 Article 系統。
2. ProjectT 與 Museum 可共用底層文章資料欄位、搜尋、語言處理與基礎元件。
3. ProjectT 與 Museum 必須保留不同的內容分類與視覺外殼。
4. Museum Essay 必須支援多展品關聯。
5. ProjectT Article 必須支援世界與世界內路線關聯。
6. 是否共用 URL、模板與編輯流程，留待後續技術設計。

## 11. AI 佔位符與語義污染風險

目前多個未公開頁面包含 AI 生成的佔位文案、假分類、假標題、語義不明的定位框架與「建置中」內容。這些內容即使原意只是視覺原型，也可能被搜尋索引、網站生成器、LLM 索引或後續協作 Agent 誤讀為已確認事實。

ProjectT 首頁與 Articles 原型中的抽象定位、製作筆記分類及其他未經人工確認的描述，不得自動視為正式 public copy 或內容 SSOT。

### 污染控制規則

- AI 生成的 placeholder copy 一律視為非權威草稿。
- 頁面已存在不代表其文案、分類或 IA 已獲批准。
- `noindex` 只能降低公開搜尋風險，不能阻止 repo search、LLM、Agent 或內部索引讀取。
- 未確認頁面不得被加入 sitemap、search index、LLM index、主要導覽或公開推薦。
- 產生公開 index 前，必須先完成逐頁人工審查。
- Placeholder 應使用明確、不可被誤認為內容的標記，例如 `PLACEHOLDER — NOT PUBLIC COPY`，而不是撰寫看似完整的假文章或假定位。
- Agent 在使用頁面內容前，應先比對 `docs/CONTENT_SSOT.md` 與本文件。
- 若頁面與 SSOT 衝突，以 SSOT 與最新 owner decision 為準。

### 公開前最低 Gate

頁面必須同時符合以下條件才能解除 `noindex` 或加入公開導覽：

1. 定位與分類已由 owner 確認。
2. 佔位文案已移除。
3. 文章或資料是真實內容，不是 AI 模擬內容。
4. 所有權、作者、世界與展品關聯清楚。
5. 連結、語言與視覺主題完成基本檢查。
6. 搜尋與 LLM 索引已由乾淨來源重新生成。

## 12. 語言命名與技術代碼

### 對外顯示

- 繁體中文
- English

英文介面可顯示：

- Traditional Chinese
- English

### 社群描述

使用：

> Traditional Chinese VRChat Racing Community

避免只使用 `Chinese`，以免語言環境與國籍概念混淆。

### HTML 與程式代碼

HTML 建議使用：

```html
<html lang="zh-Hant-TW">
```

目前的 `zh-TW` 亦可繼續使用。

程式內部可維持簡短代碼：

```js
{ code: "zh", label: "繁體中文", htmlLang: "zh-Hant-TW" }
{ code: "en", label: "English", htmlLang: "en" }
```

若未來需要同時支援簡體中文，再拆分為 `zh-Hant` 與 `zh-Hans`。

## 13. 建議公開導覽

### ProjectT

```text
Overview
ProjectT Worlds
VRRCTW
Racing
Toolkit
Articles
```

繁體中文對應：

```text
總覽
ProjectT Worlds
VRRCTW
Racing
工具組
文章
```

Time Attack 不再與 Racing 並列為頂層系統，但可保留為首頁與 Racing 頁面的強入口。

### Museum

```text
Entry
Exhibitions
Gallery
Columns
```

實際上 Gallery 可包含在 Exhibition Page 內，不一定需要獨立頂層入口。

## 14. 建議 ProjectT 首頁順序

1. Hero：ProjectT 完整定位
2. Ecosystem：四個核心系統與 Articles 關係
3. Current Access：目前可以直接使用的入口
4. ProjectT Worlds：自有世界精選與索引
5. VRRCTW：社群、活動與參與方式
6. Racing：資料系統與 Time Attack
7. Toolkit：工具現況與開發方向
8. Articles：指南、評論、賽事與開發內容
9. Current Status：已上線、持續擴充與開發中項目

## 15. 路徑與遷移原則

目前 Time Attack 實際位於：

```text
/play/RacingClub/TimeAttack/
```

短期不應為了修正公開資訊架構而直接搬動實體檔案或資料庫，以免破壞既有連結與工具。

建議長期公開結構：

```text
/play/
├─ worlds/
├─ vrrctw/
├─ racing/
│  └─ time-attack/
├─ toolkit/
└─ articles/
```

遷移策略：

1. 先修正首頁與公開從屬關係。
2. 新增 Racing 入口頁，連至既有 Time Attack。
3. 保留既有 `/RacingClub/TimeAttack/` 路徑。
4. 新路徑先以 redirect、adapter 或入口別名銜接。
5. 等資料庫與工具遷移成熟後，再處理實體路徑。

## 16. 本階段決策摘要

已確定：

- ProjectT 是上位 VRChat 賽車社群計畫。
- 四個核心系統為 ProjectT Worlds、VRRCTW、Racing 與 VRChat Racing Toolkit。
- Time Attack 從屬於 Racing。
- ProjectT Worlds 只包含 StarRiver 製作並正式納入計畫的世界。
- Racing 可收錄其他作者的世界。
- 賽道資訊歸在 World Page，不建立獨立 Track Page。
- ProjectT Articles 是介紹、指南、評論、賽事與開發內容的綜合文章集。
- Studio 不使用 Article 系統。
- Museum 以 Exhibition／Gallery 與 Columns／Essays 為主。
- Museum Essay 可同時對應多個展品、展區或展覽。
- AI 佔位符與原型文案不得被當成正式 public copy 或 SSOT。
- 繁體中文對外英文名稱使用 Traditional Chinese。
- 現有 Time Attack 路徑短期保留。

待後續決定：

- ProjectT 與 Museum Articles 的資料、模板、URL、搜尋與視覺主題共享邊界。
- 跨區文章與跨區推薦如何呈現。
- World Page、ProjectT Article、Museum Essay 與 Commentary 的實際資料 schema。
- 清理現有 AI placeholder 頁面的順序與發布 Gate。
