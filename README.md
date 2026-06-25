# StarRiver — 入口頁更新 (drop-in, 正確 repo 路徑)

直接覆蓋／新增到 `StarRiver-Arts-Site` repo 對應路徑即可 commit。路徑已對齊 repo,不需再改相對路徑。

## 檔案對應 repo 路徑

| 本資料夾路徑 | repo 路徑 | 動作 |
|---|---|---|
| `index.html` | `index.html` | **覆蓋** — 新版首頁(方案 A) |
| `ds-additions.css` | `ds-additions.css` | **新增** — 首頁按鈕/流體字級用 |
| `landing.css` | `landing.css` | **新增** — 首頁樣式 |
| `play/index.html` | `play/index.html` | **覆蓋** — 只加 1 行 link + `sr-fluid` |
| `play/play-readability.css` | `play/play-readability.css` | **新增** — Play 可讀性(淺色) |
| `play/RacingClub/index.html` | `play/RacingClub/index.html` | **覆蓋** — 只加 1 行 link + `sr-fluid` |
| `play/RacingClub/racingclub-night.css` | `play/RacingClub/racingclub-night.css` | **新增** — Club 轉夜色 |
| `play/RacingClub/TimeAttack/index.html` | `play/RacingClub/TimeAttack/index.html` | **覆蓋** — 只加 1 行 link + `sr-fluid` |
| `play/RacingClub/TimeAttack/timeattack-readability.css` | `同左` | **新增** — Time Attack 可讀性(含站台內 `sr-fluid`) |
| `…/TimeAttack/tracks.html`、`track.html`、`players.html`、`player.html`、`vehicles.html`、`vehicle.html`、`events.html`、`catalog.html`、`info.html` | `同左` | **覆蓋** — 站台 9 個子頁,各加 1 行 link + `sr-fluid` |
| `…/TimeAttack/TrackMap/index.html` | `同左` | **覆蓋** — 賽道地圖頁,加 link(`../timeattack-readability.css`) + `sr-fluid` |
| `play/worlds/index.html` | `play/worlds/index.html` | **覆蓋** — 只加 1 行 link + `sr-fluid` |
| `play/worlds/9turns.html` | `play/worlds/9turns.html` | **覆蓋** — 只加 1 行 link + `sr-fluid` |
| `play/articles/index.html` | `play/articles/index.html` | **覆蓋** — 只加 1 行 link + `sr-fluid` |
| `play/articles/course-notes/9turns-course-guide.html` | `同左` | **覆蓋** — 只加 1 行 link + `sr-fluid` |

## 每頁實際改了什麼

- **首頁 `index.html`**:換成方案 A(深色星空、三明確卡片、填色按鈕、移除巨型 01/02/03 hover 欄)。保留原本的 Clarity analytics 與多語切換。
- **Play `play/index.html`**:維持淺色(閱讀面)。只在 `play-landing.css` 後加 `play-readability.css`、html 加 `sr-fluid`。放大小字、大螢幕流體標題。**HTML 內容一字未動**。
- **Club `play/RacingClub/index.html`**:轉夜色,消除 Play(亮)→Club→Time Attack(暗) 的跳動。只加 `racingclub-night.css` 一行 + `sr-fluid`。**HTML 內容一字未動**。
- **Time Attack `…/TimeAttack/index.html`**:站台本來就是夜色,只加 `timeattack-readability.css` 一行。把最淡的兩個文字 token 提一階(全站對比)、9–11px 小字微調。**HTML 內容一字未動,行為不變**。
- **Worlds `play/worlds/index.html`、`9turns.html`**:淺色閱讀面,共用 `play/play-readability.css`(從 worlds 目錄以 `../play-readability.css` 引用)。只加 1 行 link + `sr-fluid`。**HTML 內容一字未動**。
- **Articles `play/articles/index.html`、`course-notes/9turns-course-guide.html`**:同為淺色閱讀面,共用 `play-readability.css`(course-notes 以 `../../play-readability.css` 引用)。只加 1 行 link + `sr-fluid`。**HTML 內容一字未動**。

每個覆蓋的 HTML 與 repo 原檔的差異只有:`<html …class="lang-zh">` → `class="lang-zh sr-fluid"`,以及多一行 `<link rel="stylesheet" …>`。可用 git diff 確認。

## 本次修正(對前一包的兩個缺陷)

1. **`sr-fluid` 在站台上原本是空操作** — 站台不載入 `ds-additions.css`,而 `html.sr-fluid` 的規則住在那支裡。現已把 fluid root + `.ta-title`/`.ta-desc`/section 標題的 clamp **直接寫進 `timeattack-readability.css`**,站台自含、不再依賴外部檔。
2. **原本只套了 1/12 頁** — 現已把 `timeattack-readability.css` 連同 `sr-fluid` 補到**全部 Time Attack 站台頁**(overview＋9 子頁＋TrackMap 共 11 頁;`review.html` 你已移除故不含)。TrackMap 在子目錄,link 以 `../timeattack-readability.css` 引用同一份檔。

## 共用同一支 override

Worlds、Articles 與 Play hub 都是淺色閱讀面,**共用同一個 `play/play-readability.css`**(只放一份,各頁用相對路徑引用)。不需要為每頁複製不同檔案。

## 仍可一併補上(未包含)

其餘 Time Attack 子頁(tracks/players/vehicles/events/catalog/info/TrackMap)共用同一支 `timeattack.css` + `project-t.css`,只要在各自 `<head>` 也加上 `timeattack-readability.css` 一行即可一併受惠(本次只放了 overview `index.html`,因為你指定的是 Time Attack 入口)。

## 注意

- 我無法直接 push(對此 repo 為唯讀權限),請你 commit。若要我直接推送,需為 repo 安裝具寫入權限的 GitHub App。
- `colors_and_type.css`、`play-landing.css`、`project-t.css`、`timeattack.css` 都是 repo 既有檔,**不要覆蓋**。
