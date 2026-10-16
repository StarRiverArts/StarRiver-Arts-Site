# Museum 已公開資訊盤點與編目規範

日期：2026-10-16  
範圍：StarRiver Museum 網站現有公開內容。**本檔位於公開 GitHub Repo，不記錄未公布展覽、個人資料、私有授權、內部時程或未批准的作品敘事。**

## 本次確認

Museum 的內容關係是 `programme / 展示集合` → `公開設計資料` 與 `相關互動工具集合` → `兩項工具`，而非自動假定兩檔互不相干的正式展覽。

| ID | 實際身份 | 路徑 | 證據 |
| --- | --- | --- | --- |
| `preseason-2026` | 2026 季前展示的集合標籤（無固定展期欄位） | `museum/exhibitions.html` | Museum 公開頁現有文案 |
| `vr-gallery-spatial-system` | 空間設計、字體與標識的網頁參考展示 | `museum/interactive/vr-gallery-spatial-system/` | 頁面目錄含 Color, Materials, Ergonomics, Lighting, Typography, Signage 等 |
| `gallery-study-modules` | 與前項關聯的互動工具集合 | `museum/interactive/design-system-visualize/` | 自身首頁明列兩個相關模組 |
| `gallery-spatial-planner` | 平面／立面空間配置工具 | `museum/interactive/design-system-visualize/spatial-planner.html` | 其父頁提供可開啟連結及功能說明 |
| `light-falloff-viewer` | 光衰減與材質顏色觀察工具 | `museum/interactive/design-system-visualize/falloff-predictor.html` | 其父頁提供可開啟連結及功能說明 |

上述皆為網頁可到達的現有內容。**可到達 ≠ 物理驗證已完成，也不表示虛擬美術館建築已竣工**。如果作品內的設計參數使用「approved」之類字眼，屬該展示內部的設計規則，而非業界標準、建築法規或實地量測結果。

## 資料與資訊身份

- `content/museum/catalog.json` 僅收錄可公開且來源可追溯的內容；`id` 在同一 Museum 內容空間內保持穩定。
- `programme` 是聚合關係，不預設年展、季展或展期制度。
- `design-reference`、`interactive-collection` 與 `interactive-tool` 是內容角色，不是藝術／學術價值認定，亦非對所有新展覽的強制分類。
- `parent_id` 表示直接從屬關係；`related_ids` 表示可互相連結但並不互相包含。
- `entry_path` 是已確認可進入的公開網頁，且由網站根目錄起算。不能把草稿路徑放入公開登錄。
- `listed: true` 的項目出現在 Museum 主要展示卡片；內層工具只在其父集合頁與適當的快捷連結出現。
- 創作者、策展者、發布日期、展期、版本、授權、對外可用性等欄位**未經來源確認就省略**，不要寫推估值或自動填入目前日期。

## 暫不建立的公開記錄

現有 `museum/articles.html`、`museum/article.html`、`museum/curatorial-note.html`、`museum/exhibition.html` 均是含佔位內容的 `noindex` 版型，不代表真實已出版文章。Museum 建築、庭園、常設／輪替展廳的具體量體及啟用日期未定，也不列成已開放的 Venue。

未來獨立展覽子站有實際網址及作者、主題、發布狀態等資訊獲確認後，可新增 `entry_path` 或未來適用的外部 URL；母站只記錄索引關係，不強制嵌入展覽本體或改掉它自己的 CSS。

## 人工發布閘門

1. 明確區分「已存在」「可公開」「屬於 Museum」「經過驗證」四種判斷。
2. 新增內容時，優先確認作者與使用授權、真實入口、語言、狀態；缺欄就保留待審，不可憑空補齊。
3. 確認公開層的標題和描述只依核准內容撰寫，且中英兩種版本表意一致。
4. 只把 `listed: true` 的已公開項目加入母站索引；獨立展覽允許不同版型。
5. 使用 `python tools/check_museum_catalog.py` 檢查網址和展覽目錄是否一致，再以站點的固定 builder 重建搜尋／AI 索引。
