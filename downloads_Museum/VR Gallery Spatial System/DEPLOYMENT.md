# 部署說明 · VR Gallery Spatial System
**虛擬實境美術館・空間設計系統 — Deployment Guide**

本文件說明如何把整套系統接進你的網頁或專案。從最簡單的「掛一個 CSS」到整合進建置工具,以及生產環境(Unity / Unreal / WebXR)的用法,都涵蓋在內。

---

## 0. 這包裡有什麼

```
VR-Gallery-Spatial-System/
│
├── styles.css                  ← ★ 單一入口。掛這一個就有全部 token
├── colors_and_type.css         ← 空間系統 token(色彩 / 字體 / 字級 / 曲線 / 虛擬光…)
├── signage/
│   ├── signage_tokens.css      ← 標識系統 token(字級 / 浮凸 / 安裝高度 / 尋路色碼)
│   ├── index.html              ← 標識系統文件(可直接當網頁範本)
│   └── image-slot.js           ← 文件用的圖片佔位元件
│
├── README.md / README.html     ← 系統總覽、設計原則、色彩語意
├── SKILL.md                    ← 系統使用準則(給設計 / AI agent 參考)
├── DEPLOYMENT.md               ← 你正在讀的這份
│
├── preview/                    ← 30+ 張規範卡片,每張都是活的 HTML 範例
│   ├── colors-*.html               色票 / 材質目標vs實際色
│   ├── type-specimen.html          字體樣本
│   ├── materials-*.html            霧面 / 緞面 / 亮面 / 紋理
│   ├── space-*.html                avatar 基準 / 視距 / 視角 / 安裝高度
│   ├── whitespace-*.html           留白(展品間距 / 群組)規則
│   ├── exhibit-reserve-*.html      S / M / L / XL 預留量體
│   ├── curves-radii.html           核可曲線半徑
│   ├── plan-sample.html            平面圖範例
│   ├── elevation-sample.html       立面圖範例
│   └── virtual-*.html              虛擬光 / 粒子 / 互動區 / 浮空高度 / 資訊浮層
│
├── ui_kits/
│   ├── spatial-planner/        ← 互動工具:平面+立面,可拖放展品並驗證視錐
│   └── falloff-predictor/      ← 光衰減預測工具
│
├── site/                       ← 系統入口網站(總覽頁)
├── downloads/                  ← 工具的獨立打包版
│
└── 編譯產物(自動生成,勿手動編輯):
    ├── _ds_bundle.js
    ├── _ds_manifest.json
    └── _adherence.oxlintrc.json
```

> **重點:** 真正要「接上系統」你只需要 `styles.css` 以及它連帶的兩個 CSS。其餘是文件、範例與工具。

---

## 1. 系統架構 — 為什麼是兩層

這套系統刻意分成兩層,靠 `@import` 串接,你永遠只需指向最上面那一個入口:

```
styles.css                        ← 你 link 這個
   │
   ├─ @import colors_and_type.css     空間本體:四角色色、材質、字體、曲線、虛擬光/粒子/互動
   │
   └─ @import signage/signage_tokens.css   標識層:字級(cm)、浮凸深度、安裝高度、尋路色碼
            │
            └─ @import ../colors_and_type.css  (標識層自己也吃空間 token)
```

好處:**標識系統繼承空間系統的所有 token**,顏色與字體永遠一致;你只要更新一處,整套同步。

---

## 2. 快速開始(純靜態網頁)

把整包放到網站任一資料夾,在你的 HTML `<head>` 裡指向 `styles.css`:

```html
<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- ★ 這一行就接上整套系統 -->
  <link rel="stylesheet" href="/path/to/styles.css">
</head>
<body>
  <div class="card">
    <div class="card__hd">
      <h2>北翼・沉思空間</h2>
      <span class="label">ZONE / COOL</span>
    </div>
    <hr class="rule">
    <p>展品中心線設於 <span class="dim num">130 cm</span>,落在 avatar 視線高度上。</p>
  </div>
</body>
</html>
```

**注意路徑:** `styles.css` 用相對路徑去 `@import` 其他 CSS,所以 `colors_and_type.css` 必須留在 `styles.css` 旁邊、`signage/signage_tokens.css` 必須留在 `signage/` 子資料夾。**別把這三個檔案拆開搬走。**

字體會自動從 Google Fonts CDN 載入(Noto Sans TC / Sora / JetBrains Mono),需要對外網路。離線環境見第 6 節。

---

## 3. 整合進現有專案(建置工具 / 框架)

### Vite / Webpack / Next.js 等

把這三個檔案(連同 `signage/` 資料夾結構)複製進專案,例如 `src/styles/vr-gallery/`,然後在進入點 import:

```js
// main.js / _app.tsx / layout.tsx
import "./styles/vr-gallery/styles.css";
```

CSS 變數是全域 `:root`,所以任何元件都能直接 `var(--col-env)`、`font: var(--t-h1)`,不需要額外設定。

### 只想要某一層

- 只要空間色彩/字體 → import `colors_and_type.css`
- 只要標識層(會連帶吃到空間層)→ import `signage/signage_tokens.css`

### 與框架的 CSS scope 共存

所有 token 都掛在 `:root`,工具 class(`.card`、`.label`、`.tier`…)是全域。若你的框架做 CSS Modules / scoped styles,token 仍可直接用 `var(...)` 取用;若擔心工具 class 命名衝突,只取用 `var(--token)`、自己寫 class 即可。

---

## 4. Token 與 class 使用速查

### 顏色(可直接上網頁)
```css
var(--col-env)    /* #689F38 周邊・自然 */
var(--col-body)   /* #EEEEEE 本體・建築 */
var(--col-cool)   /* #E8EAF6 冷色調 */
var(--col-warm)   /* #FFF8E1 暖色調 */

var(--paper)      /* #FAFAF7 紙白底 */
var(--ink)        /* #1A1A1A 墨字 */
var(--rule)       /* #E0DED7 細線 */

/* 標識尋路色碼 */
var(--zone-cool) var(--zone-warm) var(--zone-env)
var(--you-here)   /* #D5462F 「現在位置」唯一允許的高彩標記 */
```

### 字體 / 字級(可直接上網頁)
```css
var(--font-en)    /* TASA Orbiter Deck → Sora 備援 */
var(--font-tc)    /* Noto Sans TC 思源黑體 */
var(--font-mono)  /* JetBrains Mono — 尺寸與 token 用 */

font: var(--t-display)  /* 40px 標題 */
font: var(--t-h1)       /* 28px */
font: var(--t-body)     /* 14px 內文 */
font: var(--sign-plate) /* 30px 標牌字 */
```

### 工具 class(文件層,可直接上網頁)
```
.card / .card__hd   卡片骨架(1px 邊框、0 圓角、無陰影)
.label              全大寫小標(mono、字距 0.08em)
.dim / .num         尺寸數字(drafting ochre、tabular 數字)
.mono               等寬
.rule / .rule-thick 建築用分隔線
.tier / .tier__no   0–3 階梯標記(標識用)
.stage              樣本展示台(可加 --dark / --cool)
```

> 直接打開 `preview/` 與 `signage/index.html` 看原始碼,每個區塊都是可複製的範本。

---

## 5. ⚠️ 關鍵分辨:哪些能直接上網頁,哪些是「參考數據」

這**不是**一般 web UI kit,務必區分兩類 token:

| 類別 | 範例 | 用法 |
|---|---|---|
| ✅ **視覺層** | `--col-*`、`--paper`、`--ink`、`--font-*`、`--t-*`、工具 class | 直接用在 CSS,所見即所得 |
| ⚠️ **空間數據(cm)** | `--avatar-h-cm: 130`、`--cap-mega: 60`、`--mh-eye: 130`、`--reach-grab: 55`、`--float-eye: 130`、`--r-m: 60` | 這些是 **VR 實體空間的公分數值**,不是 CSS px。**不要**寫成 `width: var(--cap-mega)`(會變成 60px)。它們是給你規劃 VR 場景、算字級與安裝高度用的數據 |

一句話:**顏色 / 字體 / 文件樣式可直接做成網頁;cm 尺寸是規範數據,需經你的換算才落到畫面或 3D 場景。**

---

## 6. 字體設定

| 用途 | 字體 | 來源 |
|---|---|---|
| 英文 / 數字主字體 | **TASA Orbiter Deck** | justfont 商用授權 — **未打包** |
| 英文備援(目前生效) | **Sora** | Google Fonts(OFL),已從 CDN 載入 |
| 中文 | **思源黑體 / Noto Sans TC** | Google Fonts(OFL) |
| 尺寸 / token | **JetBrains Mono** | Google Fonts(OFL) |

**換上正式英文字體:** 取得 TASA Orbiter Deck 授權後,在 `styles.css` 旁建立 `fonts/` 資料夾,放入
`TASAOrbiterDeck-Light.woff2` / `-Regular.woff2` / `-Medium.woff2`,
`colors_and_type.css` 內的 `@font-face`(`src: local(...)`)會自動接上,**不需改任何 code**。若要從檔案載入而非 `local()`,把對應 `@font-face` 的 `src` 改成 `url("fonts/TASAOrbiterDeck-Regular.woff2")` 即可。

**離線 / 內網部署:** 預設字體走 Google Fonts CDN。若環境不能對外:
1. 自行下載 Noto Sans TC / Sora / JetBrains Mono 的 woff2,放進 `fonts/`;
2. 把 `colors_and_type.css` 開頭那行 `@import url("https://fonts.googleapis.com/…")` 改成本地 `@font-face` 宣告。

---

## 7. 編譯產物(自動生成檔)

`_ds_bundle.js`、`_ds_manifest.json`、`_adherence.oxlintrc.json` 是設計系統工具**自動生成**的索引/檢查檔。

- 一般網頁部署:**不需要**這些檔,可不放上線。
- 它們只服務於「把這個專案當設計系統來消費」的工具鏈與 Design System 檢視面板。
- **請勿手動編輯** — 每次系統更新會重新生成並覆寫。

---

## 8. 互動工具部署

`ui_kits/spatial-planner/`(平面+立面規劃器)與 `ui_kits/falloff-predictor/`(光衰減預測)是 React + Babel 的獨立 HTML 工具,直接用瀏覽器開 `index.html` 即可,需對外網路載入 React/Babel CDN。

若要**離線單檔版**,`downloads/` 內已有打包好的 `spatial-planner.html` 與 `falloff-predictor.html`,雙擊即開、無外部相依。

---

## 9. 生產環境(Unity / Unreal / WebXR)

token 在 3D 引擎裡是**規範數值**,不是 CSS:

- 四個調色盤色 = **目標 albedo**。先用預設 5000K key + 漫射 fill 跑一次,擷取**實際**算圖色,再對照 `preview/colors-target-actual.html` 校正後鎖定。
- 先放 `S / M / L / XL` 預留量體,通過視錐驗證後再擺真實資產。
- 用 centroid-at-eye 規則:計算每件展品幾何中心,調整基座高度讓中心落在 `avatarEye = 130 cm`。
- cm token(`--reach-*`、`--float-*`、`--mh-*`、`--cap-*`)直接當引擎裡的世界座標數值使用。

---

## 10. 上線前檢查清單

- [ ] `styles.css`、`colors_and_type.css`、`signage/signage_tokens.css` 三者相對位置維持不變
- [ ] `<head>` 已 link `styles.css`(或在進入點 import)
- [ ] 環境可連 Google Fonts;否則已改本地字體
- [ ] 確認沒有把 cm 數據 token 誤當 px 寫進版面
- [ ] 不需要 `_ds_*` 編譯產物上線(可省略)
- [ ] (選用)TASA Orbiter Deck 授權字檔已放進 `fonts/`

---

## 授權與出處備註

- 調色盤四色(#689F38 / #EEEEEE / #E8EAF6 / #FFF8E1)來自設計 brief,視為錨點,實際安裝依算圖引擎可能需微調。
- 開源字體(Noto Sans TC / Sora / JetBrains Mono)皆 OFL 授權,可自由打包散布。
- **TASA Orbiter Deck 為商用授權,未含於本包**,使用前須自行取得授權。

---

*所有尺寸以公分(cm)為空間單位、px 僅用於文件 UI。本系統規範空間本體;視覺識別與導覽 UI 由另一套系統負責。*
