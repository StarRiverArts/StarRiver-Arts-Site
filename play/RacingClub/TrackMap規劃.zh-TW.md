# TrackMap 賽道地圖規劃(zh-TW)

日期:2026-06-13。承接《格局調整與Phase0規劃.zh-TW.md》與 2026-06-13 完成的賽道地理標記
(`track_worlds.country/region/locality` 三欄 + Tab④ combo + builder 已輸出進 tracks.json)。

> **2026-06-13 增補**:細部實作規格已獨立成《TrackMap實作規格.zh-TW.md》(供 LLM/代理直接實作)。
> 決策變更:**路線軌跡(GeoJSON)為優先顯示、點位為 fallback**,且編輯器需能編輯軌跡
> (新表 `geo_traces` + Tab④「路線軌跡」子頁,貼 geojson.io 輸出)。本文件 §3.3/§7 的
> 「路線=選配 Phase C」描述以規格書為準(軌跡提前進 Phase B)。
> 另:`world_url` 其實已可在 Tab④ 編輯(record_entry_ui.py track_cfg 末欄),§2 該待辦撤銷。

## 1. 目標

在 `play/RacingClub/TimeAttack/TrackMap/` 做一個「地球 → 國家 → 區域 → 地名 → 賽道」的
地理瀏覽頁:

- 範例層級:`地球 → 日本Japan → 群馬Gunma → 榛名Haruna → HarunaG`
  或 `地球 → 臺灣Taiwan → 東部East → 宜蘭Yilan → 九彎十八拐`
- 賽道卡要有 `world_url`(VRChat 世界連結)與通往 `track.html?id=` 的站內連結
- 大致位置用點位(經緯度)表示;整條路線降級為賽道海報,GeoJSON 路線列為選配
- **資料維護難易度是第一優先**:沿用「record_entry_ui 編輯 → 重建 JSON → 使用者 push」迴圈

## 2. 現況盤點(規劃依據)

| 項目 | 現況 |
| --- | --- |
| DB | `track_worlds` 15 欄,含 `world_url`、`country/region/locality`(格式 `日本Japan` 中英合寫) |
| 地理值 | 已開始填(Akagi/Akina 等已有 國家/區域/地名);多數仍空 |
| world_url | 抽樣為空 — 需確認 Tab④ 能否編輯此欄,不能就補欄位 |
| builder | `build_track_pages` 已把三欄寫進 tracks.json;`manifest.routes` 驅動前端取檔 |
| 前端 | `timeattack.js` 依 `body[data-view]` 分派 `renderPageModules`;fetch 寫死 `./data/` |
| 編輯器 | Tab④ `IndexEditorTab` 為 config 驅動(entry/combo/tags),加欄位成本極低 |
| 已發布 data/ | 舊 schema,等地理值填完後重建 + push 才會帶上 |

## 3. 資訊架構

### 3.1 層級與資料來源

```text
地球視圖
└─ country   「日本Japan」      ← track_worlds.country(已有)
   └─ region 「群馬Gunma」      ← track_worlds.region(已有)
      └─ locality 「榛名Haruna」 ← track_worlds.locality(已有)+ 點位經緯度(新增)
         └─ track  「HarunaG」   ← track_worlds 本體(world_url、海報、route 數、紀錄數)
```

- **點位掛在 locality 層,不掛在賽道層**。理由:53 條賽道實際地點遠少於 53 個
  (秋名/秋名雪、同地多版本共用一點),掛 locality 一個點只填一次;
  賽道層保留選配覆寫(同地多賽道想分開標時才用)。
- country/region 不需要座標:真實地圖用子節點 bounds 自動縮放(fitBounds)。
- **虛構/未定位賽道**:country 留空或填 `虛構Fictional` → 不上地圖,
  顯示在頁面側欄「未定位 / 虛構世界」清單,功能不缺、資料不被迫造假。
- 中英合寫字串維持原樣儲存(編輯最省事);builder 在組 JSON 時以
  「CJK 前綴 + Latin 後綴」切開供雙語顯示,切不開就整串原樣顯示。

### 3.2 Schema 變更(最小)

新表 `geo_places`(冪等 migration,比照 `ensure_track_geo_columns` 寫法):

```sql
CREATE TABLE IF NOT EXISTS geo_places (
  country   TEXT NOT NULL,
  region    TEXT NOT NULL DEFAULT '',
  locality  TEXT NOT NULL,
  latitude  REAL,
  longitude REAL,
  note      TEXT DEFAULT '',
  PRIMARY KEY (country, region, locality)
);
```

選配(可後補,不擋 Phase B):`track_worlds` 加 `latitude/longitude`(個別賽道覆寫用)。

曾考慮直接在 `track_worlds` 加經緯度、不開新表 — 編輯介面最省,
但同地多賽道要重複填且會漂移(同地兩條賽道座標不一致),不採。

字串三元組當 join key 的風險:改地名字串會讓 geo_places 變孤兒。
緩解:① Tab④ 的 combo 本來就吸 distinct 現值,打錯字機率低;
② builder 重建時輸出兩張警告清單 —「有地名沒座標的賽道」與「沒人引用的 geo_places 列」。

### 3.3 海報與路線

- **海報用檔名約定,不進 DB**:`TimeAttack/assets/trackmap/<track_world_code>.jpg|png|webp`。
  builder 掃資料夾把 `has_poster`/副檔名寫進 JSON(前端不用試 404)。
  維護動作 = 丟一張命名正確的圖 + 重建 + push,零欄位編輯。
- **GeoJSON 路線(選配,Phase C)**:`assets/trackmap/routes/<track_world_code>.geojson`。
  製作流程意外地不難:geojson.io 在真地圖上沿著山路畫線 → 下載/貼上存檔。
  一條約 10–15 分鐘,想做哪條做哪條,缺檔就 fallback 海報,海報也缺就只有點位。

## 4. 呈現方案比較

| 方案 | 視覺 | 編輯成本 | 相依 | 結論 |
| --- | --- | --- | --- | --- |
| A. 階層卡片下鑽(無地圖) | 中 | **零新資料**(三欄已有) | 無 | **Phase A 先上** |
| B. Leaflet + 暗色底圖 + 點位 | 高,真地理縮放 | 每地點貼一次座標 | Leaflet(自帶入庫)+ 線上圖磚 | **Phase B 主推** |
| C. 自製 SVG 風格化地圖 | 最高(全手作感) | 每國家/區域要備一張 SVG + 手工標 % 座標 | 無 | 與「容易編輯」牴觸,不採;留作日後美術升級 |

方案 B 細節:
- Leaflet(~150KB)**下載一次進 repo**(`assets/vendor/leaflet/`),不用 runtime CDN;
  下載屬外部網路動作,實作時先報備一次。
- 底圖建議 CARTO dark_all 免金鑰圖磚(配站上暗色美術),需保留 attribution;
  圖磚是瀏覽者端載入的外部資源,GitHub Pages 公開站可接受。
  若日後想完全離線,降級路徑 = 換成方案 C 的單張世界底圖,點位資料不用改。
- 互動:地球視圖起手 → 點 country/region 聚合標記或麵包屑 → fitBounds 下鑽 →
  locality 標記 popup 列出該地賽道卡(名稱/系統/紀錄數/`world_url` 按鈕/詳情連結)。
  側欄常駐樹狀清單(country → region → locality → track),與地圖雙向連動 —
  清單本身就是 Phase A 的產物,地圖壞了清單仍可用。

## 5. 管線設計(沿用既有迴圈)

```text
record_entry_ui.py(VR_RacingClubTW)          build_timeattack.py                前端
┌──────────────────────────────┐   重建   ┌─────────────────────────┐   fetch  ┌──────────────────┐
│ Tab④ 賽道:country/region/    │ ──────→ │ build_trackmap()         │ ───────→ │ TrackMap/index.html│
│   locality(已有)+ world_url │          │ → data/trackmap.json     │          │ data-view=trackmap │
│ Tab④ 新子頁「地理點位」:      │          │ 掃 assets/trackmap/      │          │ 樹狀清單+Leaflet   │
│   geo_places 經緯度           │          │ manifest.routes 註冊     │          │                  │
└──────────────────────────────┘          └─────────────────────────┘          └──────────────────┘
                                   使用者自己 git push(agent 無 SSH 金鑰)
```

### 5.1 編輯器(record_entry_ui.py)

- Tab④ 內層 notebook 加第 5 子頁「地理點位」:
  picker 列 `geo_places` 全列 + 「從 track_worlds 同步缺漏地點」按鈕
  (掃 distinct 三元組,沒有對應列就建空座標列 — 填座標前不用手動建列)。
- 座標輸入做成**單一欄位貼上即可**:Google Maps 對地點按右鍵 → 點座標即複製
  「36.4744, 138.8810」→ 整串貼進「座標」欄,存檔時自動拆 lat/lng 並驗證範圍。
  一個地點的維護成本 ≈ 30 秒。
- 確認/補上 track 子頁的 `world_url` 欄位(kind=entry)。

### 5.2 builder(build_timeattack.py)

- 新增 `build_trackmap(records, lookup)` → `data/trackmap.json`:
  - 樹:country → region → locality(含 lat/lng)→ tracks
    (code/顯示名/world_url/route 數/紀錄數/TR 摘要/has_poster/has_route_geojson)
  - `unlocated`:無 country 或無座標的賽道清單(前端側欄 + 你的補資料 checklist)
  - `warnings`:孤兒 geo_places 列
- `manifest.routes` 加 `trackmap` 條目。
- 讀 `geo_places` 失敗(舊 DB 沒這表)要 graceful:照樣產出、全部進 unlocated。

### 5.3 前端

- `TimeAttack/TrackMap/index.html`,`body[data-view="trackmap"]`。
  在子資料夾所以 fetch 基底要可調:body 加 `data-base="../"`,
  `initTimeAttack` 讀它組 `${base}data/manifest.json`(預設 `./` 不影響現有頁)。
- `renderPageModules` 加 `trackmap` case;地圖初始化獨立成小模組,
  Leaflet 載入失敗時整頁退化為純樹狀清單(Phase A 形態)。
- 樣式沿用 `timeattack.css` 體系,地圖容器配暗色磚。

## 6. 維護成本總表(規劃驗收標準)

| 動作 | 流程 | 單次成本 |
| --- | --- | --- |
| 新賽道進地圖 | 登記時照舊填 country/region/locality(Tab④ combo) | 既有流程,+0 |
| 新地點上點位 | 地理點位子頁 →(自動同步建列)→ 貼 Google Maps 座標 → 存檔 | ~30 秒 |
| 掛海報 | 圖丟 `assets/trackmap/<code>.jpg` | ~10 秒 |
| 整條路線(選配) | geojson.io 畫線 → 存 `routes/<code>.geojson` | 10–15 分/條 |
| 發布 | UI 重建 JSON → 使用者 push(新檔記得 `git add`,看 `git status` 的 `??`) | 既有流程 |

## 7. 分期

- **Phase A — 樹狀下鑽頁(零新資料)**:trackmap.json(無座標版)+ TrackMap 頁
  純清單下鑽 + unlocated 清單。立即可上線,同時當「地理欄位補完進度表」用。
- **Phase B — 點位地圖**:geo_places + 地理點位子頁 + Leaflet 入庫 + 地圖渲染。
  Phase A 的樹直接變側欄。
- **Phase C — 海報/路線**:assets 約定掃描 + popup 海報 lightbox + geojson polyline。
  逐條補,不擋前兩期。

## 8. 風險與守則

- **跨專案範圍**:本案同時動 `VR_RacingClubTW`(編輯器)與 `StarRiver-Arts-Site`
  (builder/前端/資料),屬既定協作模式,但實作各階段開工時仍照根規範重述一次範圍。
- **CJK 編碼**:country/region/locality 是中文,終端輸出一律先套 UTF-8 四行;
  檔案讀寫只用 Read/Write/Edit 工具,不信任 mojibake 輸出(本次規劃調查已踩到 CP950 亂碼)。
- **真 DB 變更**:加 geo_places 前先備份(比照 `ta_data.backup_20260613.sqlite` 慣例)。
- **xlsx_to_sqlite.py 仍是 8 欄舊 schema**(非現行寫入路徑):geo_places 不經過它,
  但若日後重新匯入,舊坑 + 新表都要一起修。
- **push 陷阱**:TrackMap/ 整資料夾、assets/trackmap/、trackmap.json 全是新檔 —
  push 前 `git status` 確認 `??` 已 add(已踩三次的坑)。
