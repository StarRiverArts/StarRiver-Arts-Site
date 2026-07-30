# StarRiver Social Hub 新頁面規劃 v0.1

Date baseline: `2026-07-30`
Status: `approved planning baseline`
Owner: `StarRiver Arts`
Target repository: `StarRiver-Arts-Site`

## 1. 規劃目的

目前 StarRiver Arts 的 Facebook 粉絲專頁、Instagram、YouTube、VRChat、Discord 與網站各自具有內容與功能，但彼此較像獨立頁面，訪客不容易理解：

- 各平台分別發布什麼內容；
- 哪裡可以觀看、閱讀、體驗或參與；
- StarRiver Arts、Studio、ProjectT、Museum 與 VRRCTW 之間的關係；
- 最近有哪些作品、實驗、文章、世界或社群活動正在進行。

本規劃新增一個獨立的 `Social Hub` 資訊頁，作為個人品牌、內容站、社群平台與 VRChat 體驗之間的中介層。

Social Hub 不取代目前首頁，也不成為與 Studio、ProjectT、Museum 平行的第四個內容品牌。

## 2. 頁面定位

### 2.1 首頁職責

首頁主要回答：

> StarRiver Arts 是誰，以及有哪些主要創作領域？

首頁保留三個主要入口：

- Studio
- ProjectT
- Museum

首頁可在首屏以下增加少量跨站資訊，包括近期動態、代表內容與 Social Hub 入口，但不承擔完整的跨平台說明。

### 2.2 Social Hub 職責

Social Hub 主要回答：

> 我可以在哪裡觀看、閱讀、體驗、參與或聯絡 StarRiver？

其角色為：

- 跨平台導覽；
- 個人品牌關係說明；
- 近期活動與內容索引；
- 社群、世界與網站之間的行動入口。

Social Hub 應依訪客想採取的行動組織內容，而不是依內部專案分類排列。

## 3. 建議資訊架構

### 3.1 Hero / Page Introduction

必要內容：

- 頁面名稱：`StarRiver Social Hub`
- 簡短中文定位
- 簡短英文定位
- 一句說明本頁可用來觀看作品、進入世界、追蹤更新與參與社群

導覽列可使用較短的 `Connect` 作為連結名稱，頁面 H1 使用完整名稱 `StarRiver Social Hub`。

### 3.2 Watch｜觀看

包含以動態與視覺內容為主的平台：

- YouTube：世界展示、作品導覽、開發紀錄與較長影片；
- Instagram：視覺片段、建模進度、局部成果與短內容；
- Facebook：繁體中文公告、活動資訊與較完整的近況更新。

每個平台卡片應包含：

- 平台名稱；
- 內容角色；
- 適合追蹤的內容；
- 明確 CTA；
- 必要時顯示近期代表內容。

### 3.3 Experience｜體驗

包含可直接進入或觀看的虛擬體驗：

- VRChat 個人頁面；
- 已公開世界；
- ProjectT Worlds；
- Museum 展覽或可體驗頁面。

此區重點是讓訪客從「知道作品」前往「實際進入作品」。

### 3.4 Join｜參與

包含具有互動、投稿或社群關係的入口：

- VRRCTW Discord；
- 賽事與活動；
- Racing Hub / Time Attack 投稿入口；
- 合作或社群聯絡方式。

VRRCTW 應維持社群品牌的公共性，不應呈現成單純的個人粉絲群或 Studio 子頁面。

### 3.5 Read｜閱讀

包含網站內的長期內容入口：

- Studio Projects / Case Studies；
- ProjectT Articles；
- Museum Essays / Columns；
- 未來經核准公開的實驗札記或研究合輯。

Social Hub 只提供導覽與代表內容，不應複製各站完整文章索引。

### 3.6 Current / Featured｜近期與精選

可選擇顯示少量近期內容，例如 3 至 6 項：

- 新作品；
- 新世界或版本更新；
- 新文章；
- 技術或視覺實驗；
- 社群活動；
- YouTube 新影片。

若資料尚未具有穩定的聚合來源，可先由靜態設定維護，不應為了 Social Hub 立即建立新的 CMS 或動態後端。

## 4. 首頁配套調整

首頁若改為垂直入口頁，首屏中的三個主要入口容易被誤認為完整頁面終點，因此必須新增向下捲動的視覺與文字提示。

### 4.1 必要提示

首屏底部應包含明確文字，例如：

- `往下查看最新動態`
- `Explore what’s happening now`

箭頭只能作為輔助，不能只使用沒有文字的抽象圖示。

### 4.2 下一區露出

首屏應刻意露出下一區的一部分，例如：

- `Latest / 最近動態` 標題；
- 一張內容卡片上緣；
- 不同背景區塊的開頭；
- Social Hub 摘要區的視覺元素。

不得讓三張入口卡剛好完整收在首屏下緣，造成頁面已結束的錯覺。

### 4.3 首頁建議順序

1. Hero：StarRiver Arts 與個人定位；
2. 三個主要入口：Studio / ProjectT / Museum；
3. 向下捲動提示與下一區露出；
4. Now：3 至 6 項近期跨站內容；
5. Featured：目前最值得理解的一項作品、系統或活動；
6. Connect：各平台摘要與 Social Hub CTA；
7. Footer。

首頁的 Connect 區只提供摘要，不重複 Social Hub 的完整平台說明。

## 5. 品牌關係

建議維持以下關係：

```text
StarRiver Arts
├─ Studio / Works
├─ ProjectT
├─ Museum
└─ Social Hub / Connect
```

其中：

- `StarRiver Arts` 是創作者母品牌；
- `Studio` 是專業作品與能力展示；
- `ProjectT` 是以臺灣為出發點的 VRChat 賽車社群計畫；
- `Museum` 是虛擬策展、文化紀錄與創作敘事空間；
- `Social Hub` 是跨平台導覽與活動中介，不是第四個內容品牌；
- `VRRCTW` 是由 StarRiver 建立與參與營運的社群品牌，與 ProjectT、Racing Hub 合作，但保留公共社群定位。

## 6. 各平台內容分工

| 平台 | 主要角色 | 不應承擔的責任 |
| --- | --- | --- |
| 網站 | 正式來源、索引、長期保存與完整脈絡 | 不必模仿所有社群即時互動 |
| YouTube | 動態展示、作品導覽、開發過程與較長內容 | 不作為唯一正式資料來源 |
| Instagram | 強視覺片段、進度與短期導流 | 不承載完整技術或策展論述 |
| Facebook | 繁中公告、活動紀錄與社群傳播 | 不取代網站長期文章 |
| VRChat | 作品與世界被實際體驗的場域 | 不承擔完整外部資訊索引 |
| Discord | 社群互動、活動、投稿與治理入口 | 不作為網站內容或資料的唯一保存位置 |

各平台不需要發布完全相同的內容，但應使用一致的母品牌名稱、核心識別、簡介關係與網站入口。

## 7. 頁面視覺與互動原則

- 延續 StarRiver Arts 母站視覺，不另建與三站競爭的新品牌系統；
- 以清楚的平台角色與行動 CTA 為主，不做只有圖示的 Linktree；
- 每個平台卡片應優先說明「在這裡可以得到什麼」；
- 支援繁體中文與英文；
- 手機版需保持清楚的單欄閱讀與 CTA 點擊區；
- 外部連結應清楚標示離站；
- 社群圖示不可成為唯一識別，需搭配文字標籤；
- 避免自動嵌入過多外部 feed，以免造成載入、隱私與維護問題。

## 8. 資料與維護策略

第一版應採低維護、靜態優先：

- 平台連結與說明由單一設定來源維護；
- 近期內容可手動選入，不要求即時同步所有平台；
- 若未來已有共用 Article 資料與索引，再考慮自動聚合；
- 不手動修改 `site-index.json`、`search-index.json`、`llm-index.json`、`sitemap.xml` 或 `llms.txt`；
- 公開頁面完成並核准後，再依現有工具重新產生索引。

## 9. 第一版範圍

### 必做

- 新增獨立 Social Hub 頁面；
- 導覽列新增 `Connect` 或同等入口；
- 建立 Watch / Experience / Join / Read 四區；
- 整理並驗證現有 Facebook、Instagram、YouTube、VRChat、Discord 與站內入口；
- 首頁新增向下捲動提示；
- 首頁讓下一區部分露出；
- 首頁新增簡化版 Connect 摘要與 Social Hub CTA；
- 繁中與英文基礎文案；
- 手機版檢查。

### 可延後

- 自動抓取社群貼文；
- 完整跨站動態時間軸；
- 帳號數據、訂閱數或追蹤數顯示；
- 第三方嵌入 feed；
- 新 CMS；
- 個人品牌全面改名；
- 將三站或 VRRCTW 合併成同一品牌。

## 10. 驗收條件

完成第一版後，應符合：

1. 首次進入首頁的訪客能看出三個入口以下仍有內容；
2. 訪客可在兩次點擊內抵達主要社群平台或 VRChat 體驗；
3. Social Hub 能說明各平台的用途，而不只呈現連結；
4. Studio、ProjectT、Museum 的既有定位不被改寫；
5. VRRCTW 不被錯誤併入個人作品集；
6. 首頁與 Social Hub 沒有大量重複內容；
7. 手機版 CTA 清楚且不依賴 hover；
8. 外部連結、語言內容與平台名稱經人工確認；
9. 新頁面核准公開後才加入導覽、搜尋、Sitemap 與 LLM 索引；
10. 第一版不依賴新的後端服務或社群 API。

## 11. 非目標

本規劃不處理：

- 全面 rebrand 或更換 StarRiver Arts 名稱；
- 將所有平台內容同步為完全相同；
- 建立第四套內容站；
- 取代 Studio、ProjectT 或 Museum 的內容索引；
- 重新定義 VRRCTW 的會員資格或治理規則；
- 新增社群媒體自動發布系統；
- 直接公開尚未核准的實驗、產品路線或內部對話。

## 12. 後續實作順序

1. 盤點並驗證所有平台 URL、名稱與公開狀態；
2. 確認頁面路徑與導覽名稱；
3. 建立低保真資訊架構與手機順序；
4. 撰寫繁中與英文頁面文案；
5. 實作 Social Hub 靜態頁；
6. 調整首頁首屏高度、捲動提示與下一區露出；
7. 新增首頁 Connect 摘要；
8. 驗證外部連結、RWD、鍵盤操作與基本無障礙；
9. 經人工內容審查後公開；
10. 重新產生網站搜尋、Sitemap 與 LLM 索引。
