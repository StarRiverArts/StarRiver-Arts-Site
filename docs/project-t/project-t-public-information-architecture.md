# ProjectT 公開網站資訊架構草案

- 文件狀態：Draft for review
- 適用範圍：StarRiver Arts Site／ProjectT 公開網站
- 更新日期：2026-07-27
- 目的：定義 ProjectT 的對外定位、核心組成、內容邊界、命名方式與公開網站導覽層級。

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

它整理與呈現世界、賽道、玩家、車輛、車隊、活動、賽事與計時紀錄，並逐步承接投稿、驗證、個人頁面與統計分析等功能。

### Time Attack 的從屬關係

Time Attack 是 Racing 之下已投入使用的計時紀錄模組，不是與 Racing 或 VRRCTW 同層的獨立核心系統。

```text
Racing
├─ Time Attack
├─ Worlds
├─ Tracks
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

## 7. Articles

### 定義

Articles 是 ProjectT 的內容與知識層，可跨越 ProjectT Worlds、VRRCTW、Racing 與 Toolkit。

文章不只介紹 ProjectT 自有世界，也可以介紹其他作者製作、但與 Racing 或 VRRCTW 有直接關係的世界與賽道。

因此，外部世界出現在文章中不代表該世界由 ProjectT 所有或屬於 ProjectT Worlds。

### 建議內容分類

#### Track Guides／賽道指南

- 賽道整體性格
- 關鍵彎角與節奏
- 容易失誤的位置
- 車輛選擇
- 新手熟練順序
- Racing／Time Attack 入口

#### World & Community／世界與社群

- 世界作者與背景
- 世界與 VRRCTW 的關係
- 社群使用方式
- 重要活動與共同記憶
- 世界在繁體中文 VRChat 賽車社群中的意義

#### Events／活動與賽事

- 活動介紹
- 賽後回顧
- 賽制說明
- 歷史賽事
- 結果與資料的敘事整理

#### ProjectT Development／ProjectT 開發

- ProjectT Worlds 製作
- Racing 資料系統演進
- Toolkit 開發
- 架構與願景
- 技術實驗與版本更新

### Articles 與 Racing 的互連

```text
Racing World / Track Page
├─ 結構化世界與賽道資料
├─ Time Attack 紀錄
├─ 活動紀錄
└─ 相關文章

Article Page
├─ 世界與賽道脈絡
├─ 駕駛或社群內容
├─ Racing 世界／賽道資料入口
└─ Time Attack 排行榜入口
```

Articles 提供解釋、脈絡與知識；Racing 提供可查詢、可驗證的結構化資料。兩者互相連結，但不互相取代。

## 8. Articles 系統的未決架構

目前 StarRiver Arts Site 基本上存在三套對應三個大區的 Article 呈現方式：

- Studio Articles
- ProjectT Articles
- Museum Articles

原始設計將三個大區視為相對獨立的網站，因此各自具有不同的視覺主題與內容情境。當三區被整合至同一個 StarRiver Arts Site 後，若直接共用同一套 Article 頁面，可能產生以下問題：

- 文章頁無法判斷應套用哪一區的品牌與視覺主題。
- 跨區文章或共用文章可能沒有單一合理的主題歸屬。
- 共用模板可能削弱 Studio、ProjectT 與 Museum 的獨立辨識度。
- 完全分離可能造成模板、功能與資料維護重複。
- URL、搜尋、分類、推薦與語言系統可能出現三套實作。

### 本文件暫定原則

本階段只確定：

1. Articles 可作為 ProjectT 的獨立頂層內容入口。
2. ProjectT Articles 可介紹 ProjectT 自有世界與外部相關世界。
3. Articles 與 Racing 應互相連結。
4. ProjectT Worlds 與文章主題必須維持所有權邊界。
5. 是否共用資料來源、模板、URL 與視覺主題，留待下一階段獨立決策。

本文件不預先決定三站 Articles 應完全共用或完全分離。

## 9. 語言命名與技術代碼

### 對外顯示

建議語言選單顯示：

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

不建議將 `TraditionalChinese` 作為 HTML 標準語言代碼；它適合對外文字或內部可讀名稱，但不是標準 BCP 47 語言標籤。

## 10. 建議公開導覽

### 桌面頂層導覽

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

### 手機導覽

手機版不應直接隱藏全部主要導覽。建議使用漢堡選單、可橫向捲動導覽，或首頁固定核心入口面板。

## 11. 建議 ProjectT 首頁順序

1. Hero：ProjectT 完整定位
2. Ecosystem：四個核心系統與 Articles 關係
3. Current Access：目前可以直接使用的入口
4. ProjectT Worlds：自有世界精選與索引
5. VRRCTW：社群、活動與參與方式
6. Racing：資料系統與 Time Attack
7. Toolkit：工具現況與開發方向
8. Articles：賽道指南、世界與社群、活動與開發內容
9. Current Status：已上線、持續擴充與開發中項目

## 12. 路徑與遷移原則

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

## 13. 本階段決策摘要

已確定：

- ProjectT 是上位 VRChat 賽車社群計畫。
- 四個核心系統為 ProjectT Worlds、VRRCTW、Racing 與 VRChat Racing Toolkit。
- Time Attack 從屬於 Racing。
- ProjectT Worlds 只包含 StarRiver 製作並正式納入計畫的世界。
- Racing 可收錄其他作者的世界。
- Articles 是獨立內容與知識層，可介紹自有或外部世界。
- 外部世界的文章與資料收錄不代表 ProjectT 所有權。
- 繁體中文對外英文名稱使用 Traditional Chinese。
- 現有 Time Attack 路徑短期保留。

待下一階段決定：

- Studio、ProjectT、Museum 三套 Articles 應共用或分離到什麼程度。
- Article 資料、模板、URL、搜尋與視覺主題的共享邊界。
- 跨區文章與跨區推薦如何呈現。
- ProjectT 首頁與各子入口的實際視覺稿。
