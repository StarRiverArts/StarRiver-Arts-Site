# TrackMap 實作規格書(zh-TW)— 供 LLM/工程代理直接實作

日期:2026-06-13。上位文件:《TrackMap規劃.zh-TW.md》(背景與方案取捨)。
本文件是**可直接照做的實作規格**:每個環節的檔案、函式、schema、插入點、驗收條件都寫死。
規劃階段後的決策變更:**路線軌跡(GeoJSON)為優先顯示,點位為 fallback;編輯器必須能維護軌跡。**

---

## 0. 名詞表(先讀,避免撞名)

| 名詞 | 指什麼 | 不要混淆 |
| --- | --- | --- |
| **路線 / route** | DB `routes` 表:賽道的計時路線變體(如 Tsukuba 的 Double Course),主鍵 `track_world_code + route_code` | 這是計時單位,**不是**地理線條 |
| **軌跡 / trace** | 新概念:賽道在真實地圖上的整條線(GeoJSON LineString),存新表 `geo_traces`,一條賽道世界最多一筆 | UI 一律稱「路線軌跡」 |
| **點位 / place point** | 新表 `geo_places`:以 (country, region, locality) 為鍵的經緯度 | 掛在「地名」層,不是賽道層 |
| **track world** | DB `track_worlds` 表:一個 VRChat 賽道世界,主鍵 `track_world_code` | |

GeoJSON 座標順序是 **[lng, lat]**;Google Maps 複製出來的字串是 **「lat, lng」**。兩處解析不可搞反。

## 1. 既有程式碼事實(實作前先核對,行號為 2026-06-13 快照)

涉及兩個專案(跨專案範圍,開工時向使用者重述一次):

- 站點:`d:\CreationProject\CodeTools\StarRiverSite\StarRiver-Arts-Site\play\RacingClub\TimeAttack\`
- 編輯器:`d:\CreationProject\CodeTools\VR_RacingClubTW\record_entry_ui.py`

| 事實 | 位置 |
| --- | --- |
| DB 實體路徑(編輯器與 builder 共用同一顆) | `TimeAttack/ta_data.sqlite`;編輯器經 `DB_PATH`(record_entry_ui.py:31) |
| `track_worlds` 15 欄,含 `world_url`、`country/region/locality`(中英合寫如 `日本Japan`) | — |
| `world_url` 已可在 Tab④ 編輯 | record_entry_ui.py:1192 |
| 冪等 migration 範本 `ensure_track_geo_columns(conn)` | record_entry_ui.py:75–86,App.__init__ 呼叫於 :867 |
| 通用編輯元件 `IndexEditorTab(parent, app, config)`,config 驅動(kind=entry/combo/tags),`_save(rebuild)` 會 UPDATE+commit,rebuild=True 時呼叫 `app._sync_site_json_after_db_change(...)` | record_entry_ui.py:628–854 |
| Tab④ 組裝點 `_build_tab_index`,現有 4 子頁 config:track/vehicle/player/route | record_entry_ui.py:1158–1262 |
| 重建+commit 用 `_sync_site_json_after_db_change`(:1633);`git add *BUILD_PATHS`(:1644);`BUILD_PATHS` 含 `play/RacingClub/TimeAttack/data/`(:42)→ **data/ 下新增檔案會被自動 stage** | — |
| builder `build_timeattack.py`:`ROUTE_FILE_MAP`(:14)、`build_manifest` 把它寫進 manifest `routes`(:781)、`build_all` 統一 `write_json`(:1886–1908) | — |
| 前端 `timeattack.js`:`TA_ROUTE_LABELS`(:1)、`renderPageModules(view, data)` 分派(:1409)、`initTimeAttack`(:1508)fetch 寫死 `./data/`(:1514,1518,1519)、view 後處理鉤子模式(:1542–1543)、`activateNav`(:1492) | — |
| 頁面骨架:見 `tracks.html`(`body[data-view]`、`[data-page-root]`、`ta-localnav`、相對路徑站根=`../../../`) | — |
| 部署:使用者自己 push(agent 無 SSH 金鑰);新檔未 `git add` 會造成線上 404(已踩三次) | — |

## 2. 顯示優先序(本系統核心規則)

每條賽道世界在地圖上的呈現,依序取第一個可用者:

1. **軌跡**:`geo_traces` 有該 `track_world_code` → 畫整條 polyline;標記點 = 軌跡中點(最長 LineString 的中位座標,builder 預算好)
2. **地名點位**:所屬 (country, region, locality) 在 `geo_places` 有座標 → 該地名一顆標記,popup 列出同地所有賽道
3. **未定位**:country 為空、或地名無座標且無軌跡 → 不上地圖,進側欄「未定位/虛構」清單

推論性質(實作時要保持成立):**只畫了軌跡、沒填地名座標的賽道也要能上地圖**
(builder 用軌跡中點回填該地名的顯示座標,標 `point_source: "trace"`)。

## 3. DB Schema(Phase B 第一步)

加進 record_entry_ui.py,緊跟在 `ensure_track_geo_columns` 之後,並於 `App.__init__`
的 :867 之後呼叫。**動真 DB 前先備份**:複製 `ta_data.sqlite` → `ta_data.backup_YYYYMMDD.sqlite`(沿用現慣例)。

```python
def ensure_geo_tables(conn) -> None:
    """geo_places: 地名層點位;geo_traces: 賽道整條軌跡。冪等,啟動時呼叫。"""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS geo_places (
            country   TEXT NOT NULL,
            region    TEXT NOT NULL DEFAULT '',
            locality  TEXT NOT NULL,
            latitude  REAL,
            longitude REAL,
            note      TEXT NOT NULL DEFAULT '',
            PRIMARY KEY (country, region, locality)
        )""")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS geo_traces (
            track_world_code TEXT PRIMARY KEY,
            trace_geojson    TEXT NOT NULL,
            updated_at       TEXT NOT NULL DEFAULT ''
        )""")
    conn.commit()
```

- `geo_places` 的鍵是**字串三元組原樣**(含中英合寫),與 `track_worlds` 三欄逐字 join。
- `geo_traces.trace_geojson` 存正規化後的 FeatureCollection 字串(§4.2)。
- `region` 允許空字串(有些國家直接 country→locality)。
- 不在 `track_worlds` 加經緯度欄(賽道層覆寫由軌跡承擔;將來真有需求再另案)。

## 4. 編輯器規格(record_entry_ui.py)

Tab④「索引編輯」內層 notebook 由 4 子頁擴成 6 子頁,在 `_build_tab_index`(:1255–1262)
的迴圈後追加兩個**專用類別**(不硬塞 IndexEditorTab,因為都有客製行為):

```python
inner.add(GeoPlaceTab(inner, self), text="地理點位")
inner.add(GeoTraceTab(inner, self), text="路線軌跡")
```

兩個類別都比照 IndexEditorTab 的外型:上方 `FilterCombobox` picker + 「重新整理」,
中段表單,下方「儲存」「儲存並重建 JSON」按鈕列(重建一律走
`self.app._sync_site_json_after_db_change("地理編輯")`),並在儲存後 `self.app._log(...)`。

### 4.1 GeoPlaceTab(地理點位)

**清單(picker 內容)**:`geo_places` 全列 ∪ `track_worlds` 的 distinct 非空三元組,每列顯示:

```
{●|○} {country} / {region} / {locality}（{n} 條賽道）     ● 有座標  ○ 缺座標
```

排序:缺座標在前(待辦優先),再依 country/region/locality。

**「同步缺漏地點」按鈕**(放 picker 旁):

```sql
INSERT OR IGNORE INTO geo_places (country, region, locality)
SELECT DISTINCT country, COALESCE(region,''), locality
FROM track_worlds
WHERE COALESCE(country,'') <> '' AND COALESCE(locality,'') <> '';
```

執行後 reload。意義:使用者在賽道子頁填完三欄後,到本頁按一下就有待填列,不用手建。

**表單欄位**:

| 欄位 | 元件 | 行為 |
| --- | --- | --- |
| 座標 | 單一 Entry | 接受 Google Maps 右鍵複製的整串 `36.4744, 138.8810`;解析規則 §4.3 |
| 備註 | Entry | 寫 `note` |
| 同地賽道 | 唯讀 Label | 列出該三元組下的 `track_display_name`,給使用者確認沒選錯地 |

**儲存**:`UPDATE geo_places SET latitude=?, longitude=?, note=? WHERE country=? AND region=? AND locality=?`。
座標欄留空 = 存 NULL(允許先建列後補座標)。

**刪除列**:「刪除此地點」按鈕 + confirm;只刪 `geo_places` 列,不動 `track_worlds`。

### 4.2 GeoTraceTab(路線軌跡)

**清單(picker 內容)**:全部賽道(同 track_cfg 的 list_sql),每列顯示:

```
{●|○} {track_display_name}  [{track_world_code}]     ● 已有軌跡  ○ 無
```

**版面**:picker 下方一行狀態列(有無軌跡/點數/概略長度 km/更新日),
中段 `tk.Text`(等寬字型,高約 14 行,貼 GeoJSON 用),下方按鈕列:

| 按鈕 | 行為 |
| --- | --- |
| 開啟 geojson.io | `webbrowser.open("https://geojson.io")`(使用者在真地圖上沿路畫線後把 JSON 貼回來) |
| 從檔案匯入 | `filedialog.askopenfilename`(*.geojson;*.json)→ 以 `encoding="utf-8"` 讀入填進 Text |
| 驗證 | 跑 §4.2.1 驗證,結果(feature 數/點數/長度/bbox 或錯誤訊息)寫進狀態列,不存檔 |
| 儲存 / 儲存並重建 JSON | 驗證 → 正規化 → `INSERT OR REPLACE INTO geo_traces VALUES (?,?,date('now'))` |
| 刪除軌跡 | confirm 後 `DELETE FROM geo_traces WHERE track_world_code=?` |

#### 4.2.1 GeoJSON 驗證與正規化(獨立純函式,方便測試)

```python
def normalize_trace_geojson(raw: str) -> tuple[str, dict]:
    """驗證並正規化貼入的 GeoJSON。回傳 (存檔用字串, 統計資訊)。失敗 raise ValueError(中文訊息)。"""
```

規則:

1. `json.loads` 失敗 → `ValueError("不是合法 JSON")`。
2. 接受三種頂層形態:`FeatureCollection`(取其中 geometry 為 LineString/MultiLineString 的
   features,其他類型 feature 丟棄並計入統計)、單一 `Feature`、裸 `geometry`。
3. 取完後若無任何 LineString/MultiLineString → `ValueError("沒有線段資料(需要 LineString)")`。
4. 每個座標:長度≥2 的陣列,`lng∈[-180,180]`、`lat∈[-90,90]`(GeoJSON 順序 [lng, lat]);
   出界 → 報錯並提示「注意 GeoJSON 是 [經度, 緯度] 順序」。多餘維度(高程)截掉只留前二。
5. 總點數 < 2 → 報錯;> 20000 → 報錯(防呆,正常山路幾百點)。
6. 正規化輸出:`FeatureCollection`,features 只留線段,properties 清空為 `{}`,
   `json.dumps(..., ensure_ascii=False, separators=(",", ":"))`。
7. 統計資訊:`{"features": n, "points": n, "length_km": haversine 累加, "bbox": [w,s,e,n], "dropped": n}`。

`haversine` 小工具一併實作(球半徑 6371.0088 km)。

### 4.3 座標字串解析(共用純函式)

```python
def parse_latlng(text: str) -> tuple[float, float] | None:
    """接受 '36.4744, 138.8810' / '36.4744 138.8810' / '36.4744,138.8810'。
    全空白回 None(代表清除);格式錯或出界 raise ValueError(中文訊息)。
    順序為 lat, lng(Google Maps 複製格式)。"""
```

範圍檢查 lat∈[-90,90]、lng∈[-180,180]。注意:這裡是 **lat 在前**,與 GeoJSON 相反。

### 4.4 編輯器驗收條件

- [ ] 舊 DB(無兩新表)啟動不報錯,表自動建立;重複啟動冪等
- [ ] 真 DB 操作前已留 `ta_data.backup_YYYYMMDD.sqlite`
- [ ] 同步缺漏地點後,賽道子頁填過三欄的組合都出現在點位清單且標 ○
- [ ] 貼 Google Maps 座標 → 儲存 → 重開 app 仍在;座標欄清空儲存 = NULL(回到 ○)
- [ ] 貼 geojson.io 匯出的 FeatureCollection → 驗證顯示點數/長度 → 儲存後 picker 變 ●
- [ ] 貼 [lat,lng] 反序的線(日本緯度 36 經度 139 寫反)會被範圍檢查擋下
- [ ] 「儲存並重建 JSON」走完後 `data/trackmap.json` 與 `data/geo/*.geojson` 有更新
- [ ] 中文(地名三欄)經 UI 寫入後,用 Read 工具讀 DB 匯出值驗證無 mojibake

## 5. Builder 規格(build_timeattack.py)

### 5.1 掛載點

1. `ROUTE_FILE_MAP`(:14)加 `"trackmap": "trackmap.json"`(manifest 會自動帶到,:781 不用改)。
2. `build_all`(:1886)加:

```python
trackmap = build_trackmap(records, lookup, args.output_dir)
write_json(args.output_dir / ROUTE_FILE_MAP["trackmap"], trackmap)
```

3. `build_trackmap` 需要讀 `geo_places`/`geo_traces`:沿用 sqlite source 的連線方式
   (參考 `load_lookup_sqlite` 的做法);**兩表不存在時必須 graceful**
   (`sqlite3.OperationalError` → 視為空表,全部賽道走 fallback),因為 Phase A 先於 schema 上線。

### 5.2 `build_trackmap(records, lookup, output_dir)` 邏輯

1. 從 lookup 的 tracks 取每條賽道的:code、顯示名、world_name、world_url、system_name、
   difficulty、country/region/locality;從 records 彙整 route 數與紀錄數(比照 `build_track_pages` 的算法)。
2. 讀 `geo_traces`:對每筆解析 JSON,算**中點** = 點數最多的 LineString 的
   `coords[len//2]`,得 `(trace_lat, trace_lng)`;並把原文寫出成
   `output_dir / "geo" / f"{track_world_code}.geojson"`(UTF-8,無 BOM)。
   寫出前**清掉 `output_dir/geo/` 裡 DB 沒有的孤兒 .geojson**(data/ 是生成物,可放心整理)。
3. 讀 `geo_places` 成 dict:`(country, region, locality) → (lat, lng, note)`。
4. 地名顯示座標:`geo_places` 有值用之(`point_source:"place"`);
   無值但成員賽道有軌跡 → 用第一條軌跡中點(`point_source:"trace"`);都沒有 → `has_point:false`。
5. 分組成 country → region → locality 樹;country 為空的賽道進 `unlocated`;
   country 有值但地名無座標且無軌跡的賽道**也留在樹裡**(清單導覽用),該地名 `has_point:false`。
6. 中英拆分:`split_bilingual("日本Japan") → ("日本","Japan")`,
   規則 = 開頭連續非 ASCII 字元為 zh,其餘為 en;無非 ASCII 前綴則 zh=en=原字串。
7. `warnings`:(a) 孤兒 `geo_places` 列(沒有任何賽道引用該三元組);
   (b) 孤兒 `geo_traces` 列(code 不在 track_worlds)。寫進 JSON 並 `print` 到 stdout。

### 5.3 trackmap.json 輸出 schema(前端契約,鍵名照抄)

```jsonc
{
  "title_zh": "賽道地圖", "title_en": "Track Map",
  "description_zh": "…", "description_en": "…",
  "sidebar_zh": ["…"], "sidebar_en": ["…"],
  "metric_cards": [ /* 比照他頁:已定位賽道/地點數/軌跡數/未定位數 */ ],
  "countries": [
    {
      "name": "日本Japan", "name_zh": "日本", "name_en": "Japan",
      "regions": [
        {
          "name": "群馬Gunma", "name_zh": "群馬", "name_en": "Gunma",
          "localities": [
            {
              "name": "榛名Haruna", "name_zh": "榛名", "name_en": "Haruna",
              "has_point": true, "lat": 36.4744, "lng": 138.881,
              "point_source": "place",            // "place" | "trace"
              "tracks": [
                {
                  "track_world_code": "akina_jintei",
                  "track_display_name": "秋名",
                  "world_name": "Akina",
                  "world_url": "",                 // 空字串=前端不顯示 VRChat 按鈕
                  "system_name": "Sacc",
                  "difficulty": "中等",
                  "route_count": 2, "record_count": 31,
                  "has_trace": true,
                  "trace_lat": 36.47, "trace_lng": 138.88,   // 無軌跡時省略
                  "trace_file": "geo/akina_jintei.geojson",  // 相對 data/;無軌跡時省略
                  "has_poster": false, "poster_ext": null    // Phase C 前固定 false/null
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "unlocated": [ /* 與 tracks[] 同形的卡片陣列(無 trace_* 欄) */ ],
  "warnings": ["geo_places(日本Japan/群馬Gunma/妙義Myogi) 無賽道引用"]
}
```

排序:country/region/locality 依 `name` 字串排序;tracks 依 `track_display_name`。

### 5.4 Builder 驗收條件

- [ ] 對舊 DB(無 geo 表)跑 builder:不噴錯,`countries` 樹照樣輸出(全部 `has_point:false`),
      `unlocated` 收 country 空者,manifest 含 `trackmap`
- [ ] 加了座標與一條軌跡後重跑:`data/geo/<code>.geojson` 出現、JSON 內 `has_trace/trace_*` 正確、
      刪掉 DB 軌跡再跑檔案會被清掉
- [ ] 只有軌跡、沒地名座標的賽道:其地名 `has_point:true, point_source:"trace"`
- [ ] `trackmap.json` 用 Read 工具抽查中文欄位無 mojibake
- [ ] 其餘 8 個 JSON 與重構前 byte 級不變(不能動到既有頁)

## 6. 前端規格

### 6.1 新頁 `TimeAttack/TrackMap/index.html`

複製 `tracks.html` 骨架改造,差異:

- `body` 屬性:`data-view="trackmap" data-base="../"`
- 所有相對路徑**加一層**:站根資源 `../../../../`、TimeAttack 內 `../timeattack.css`、`../timeattack.js`、`../project-t.js` 對應調整(project-t 在 `../../` 即 RacingClub 上層 play/,實際= `../../../project-t.css`,照 tracks.html 的相對關係 +1 層換算)
- `ta-localnav` 連結全部加 `../` 前綴(`../index.html`、`../tracks.html`…),並含自身
  `<a class="ta-navlink" href="./" data-view-link="trackmap">…</a>`
- 額外載入(在 timeattack.js 之前):
  `../assets/vendor/leaflet/leaflet.css`、`../assets/vendor/leaflet/leaflet.js`、`./trackmap-view.js`
- `[data-page-root]` 上方不需特別容器;地圖容器由 renderer 產出

同步把 TrackMap 連結加進**現有 7 個 list 頁**的 `ta-localnav`
(index/tracks/players/vehicles/events/catalog/info;detail 頁 track/player/vehicle 共用版型也要):
`<a class="ta-navlink" href="./TrackMap/" data-view-link="trackmap"><span class="zh">地圖</span><span class="en">Map</span></a>`。

### 6.2 timeattack.js 修改(共 4 處,全部向下相容)

1. `TA_ROUTE_LABELS`(:1)加 `trackmap: { zh: "賽道地圖", en: "Track Map" }`。
2. `initTimeAttack`(:1508)開頭加 `const base = document.body.dataset.base || "./";`,
   三處 fetch(:1514、:1518、:1519)改用 `${base}data/...`。預設 `"./"` → 既有頁行為不變。
3. `renderPageModules`(:1409)加:

```js
if (view === "trackmap") {
  return [renderPageSnapshot(data.metric_cards), '<div data-trackmap-root></div>'].filter(Boolean).join("");
}
```

4. view 後處理鉤子(:1542–1543 旁)加:

```js
if (view === "trackmap" && typeof window.initTrackMap === "function") {
  window.initTrackMap(pageData, base);
}
```

`typeof` 防護 → 其他頁沒載 trackmap-view.js 也不會錯。

### 6.3 `TrackMap/trackmap-view.js`(新檔,全部地圖邏輯住這裡)

對外只暴露 `window.initTrackMap = (data, base) => {…}`。內部行為:

**a. 樹狀側欄(無條件渲染,是地圖掛掉時的完整 fallback)**
在 `[data-trackmap-root]` 渲染兩欄版面:左 = country→region→locality→track 可折疊樹
(`<details>` 即可,免 JS 狀態),右 = 地圖容器 `<div id="ta-map">`。
樹節點顯示 `name_zh`/`name_en` 雙語 span(沿用 `.zh`/`.en` class 機制)+ 賽道數。
賽道列含:站內連結 `../track.html?id=<code>`、`world_url` 非空時的 VRChat 按鈕(`target="_blank"`)、
`has_trace` 標記。樹下方固定渲染「未定位/虛構」區塊(`data.unlocated`)。

**b. 地圖初始化(防禦式)**
`if (typeof L === "undefined" || !document.getElementById("ta-map"))` → 隱藏右欄、樹轉單欄、return。
否則:

```js
const map = L.map("ta-map", { worldCopyJump: true }).setView([23.5, 121], 3);
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  subdomains: "abcd", maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
}).addTo(map);
```

**c. 標記與下鑽**
- 每個 `has_point` 的 locality 放一顆 `L.marker`(divIcon 配 timeattack 視覺,顯示賽道數徽章)。
- 全部標記進 `L.featureGroup`,初始 `map.fitBounds(group.getBounds().pad(0.2))`(空群組則維持預設視野)。
- 點標記 → popup:地名雙語標題 + 該地賽道卡(同樹的賽道列)。
- popup 開啟時,對其中每條 `has_trace` 賽道**懶載**
  `loadJson(`${base}data/${track.trace_file}`)` → `L.geoJSON(geojson, { style: { color: "#4cc2ff", weight: 3 } })`,
  快取於 `Map` 物件(code→layer),重複開 popup 不重抓;載入失敗僅 console.warn,不破版。
- popup 內賽道列加「聚焦軌跡」動作:`map.fitBounds(traceLayer.getBounds())`。
- 樹側欄的 locality/track 點擊 → `map.setView([lat,lng], 12)` + 開該標記 popup(無點位者不動作)。

**d. 麵包屑**
地圖上方一條 `地球 › 日本Japan › 群馬Gunma › 榛名Haruna`,點任一層 = fitBounds 到該層
所有子標記;純顯示輔助,狀態存在 closure 變數即可,不寫 URL(分享深連結列為將來加分項)。

### 6.4 CSS(timeattack.css 追加)

`.ta-trackmap-layout`(兩欄 grid,窄幅單欄)、`#ta-map`(高 min(70vh, 640px)、圓角、邊框
沿用 `.ta-content-card` 視覺)、`.ta-map-marker`(divIcon)、popup 內卡片字級。
Leaflet 預設 css 已由 vendor 檔提供,只需覆寫配色細節。

### 6.5 Leaflet vendor(一次性)

- 目標:`TimeAttack/assets/vendor/leaflet/`(`leaflet.js`、`leaflet.css`、`images/` 三個 marker png)
- 版本 1.9.4;來源 unpkg 或官方 release zip
- **下載屬外部網路動作 → 先向使用者報備取得同意**;入庫後 runtime 零 CDN 依賴
- 圖磚(CARTO)是瀏覽者端載入的外部資源;頁面本已掛 MS Clarity,屬同級外部呼叫,可接受;
  attribution 必須保留(授權條件)

### 6.6 前端驗收條件

- [ ] 既有 7+3 頁全部行為不變(`data-base` 預設路徑、`renderPageModules` 新分支不影響舊 view)
- [ ] TrackMap 頁直開:樹完整、地圖出現、初始視野涵蓋所有標記
- [ ] 把 leaflet.js 改名模擬載入失敗:頁面仍可用(單欄樹 + 未定位清單),console 無未捕捉錯誤
- [ ] 點榛名標記 → popup 列出秋名/秋名雪等;有軌跡者線條出現且「聚焦軌跡」可縮放到線
- [ ] `world_url` 空字串時不出現 VRChat 按鈕;有值時 `target="_blank"` 開新分頁
- [ ] 壞 id/缺檔軌跡:console.warn 但 popup 正常
- [ ] 中英切換(`data-lang-toggle`)在樹與 popup 都正確(`.zh`/`.en` span)
- [ ] 手機寬度(≤720px)單欄堆疊可操作

## 7. 分期與依賴順序

| Phase | 內容 | 依賴 | 上線即有價值 |
| --- | --- | --- | --- |
| **A** | builder `build_trackmap`(無 geo 表,graceful)+ manifest + `data-base` + TrackMap 頁(純樹模式,先不掛 Leaflet 檔)+ 各頁 nav 連結 | 無 schema 變更 | 下鑽導覽 + 「未定位」= 補資料進度表 |
| **B** | `ensure_geo_tables` + GeoPlaceTab + GeoTraceTab + builder 座標/軌跡輸出 + Leaflet vendor(需使用者同意下載)+ trackmap-view.js 地圖模式 | A | 點位地圖 + 軌跡優先顯示 |
| **C** | 海報:`TimeAttack/assets/trackmap/<code>.{jpg,png,webp}` 檔名約定,builder 掃描填 `has_poster/poster_ext`,popup 加海報縮圖+lightbox | B | 視覺補完;軌跡與海報可並存(海報放 popup,軌跡在圖上) |

每期完成定義:該期驗收清單全綠 + builder 重跑後其餘 JSON 不變 + 使用者 push 前
`git status` 無漏網 `??`(TrackMap/、assets/vendor/、trackmap-view.js 都是新檔,
**不在 BUILD_PATHS,要手動 git add**;data/ 下的新檔則會被自動 stage)。

## 8. 環境與安全守則(實作代理必讀)

1. **CJK 編碼**:本案資料充滿中文。終端要碰中文前先套 CLAUDE.md 的 UTF-8 四行;
   驗證檔案內容一律用 Read 工具;出現 `ä¸­æ–‡`/`????`/`�` 即丟棄該輸出重讀。
   Python 檔案 IO 一律顯式 `encoding="utf-8"`。
2. **真 DB**:ALTER/CREATE 前備份;先用 DB 副本驗證寫入路徑(編輯器有此前例)再碰真檔。
3. **外部網路**:僅 Leaflet 下載一次,先報備;不引入其他 runtime CDN。
4. **跨專案**:動 `VR_RacingClubTW`(編輯器)與 `StarRiver-Arts-Site`(其餘)兩個 repo/目錄,
   開工時重述範圍;`record_entry_ui.py` 的變更在 VR_RacingClubTW 自己的版控。
5. **push 由使用者執行**(agent 無 SSH 金鑰);交付時列出「需要 git add 的新檔清單」。
6. **不動的東西**:`routes` 表語意、既有 8 個 JSON 輸出、`xlsx_to_sqlite.py`(已知 8 欄舊
   schema 壞路徑,本案不經過它,也不修它)。
