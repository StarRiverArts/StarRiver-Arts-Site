# T-1 證據等級（Evidence Grades）

**版本：** 0.1（草案，待 owner 確認）
**日期：** 2026-07-22
**來源：** Owner 口述收斂 + `ta_data.sqlite` 現況清查
**關係：** 本檔細化 [`t-1-product-structure.md`](./t-1-product-structure.md) 第 5 區「證據、審核與修正」。公開輸出邊界以 [`t-1-adapter-policy.md`](./t-1-adapter-policy.md) 為準。

---

## 1. 為什麼要這層

清查 canonical store（1027 筆紀錄）的結果：

| 項目 | 現況 |
| --- | --- |
| `proof_text` 非空 | 18 筆，內容全部是同一句「活動現場紀錄」 |
| `verified = 1` | 18 筆，與上列完全重合 |
| `verified = 0` | 1009 筆，`proof_text` 全空 |
| `evidence` 表 | 0 筆 |
| `review_status` | 1027 筆全部 `pending` |

也就是說：

- 實務上採用的「有截圖就收」這一階，**在資料上完全不存在**。截圖在 Discord 被看過，但沒有任何欄位記下這件事。
- `verified` 這個布林目前實際只表達「是不是活動現場紀錄」，把多階證據壓成兩格，中間階層無處可放。
- 事後無法區分「當時有看過截圖」與「根本沒有證據」。

本檔的目的是把證據強度變成可擴充的一級欄位，取代布林 `verified` 的判讀功能（`verified` 欄位本身保留不動，維持既有輸出與 VRChat 契約相容）。

---

## 2. 命名原則

**等級代碼不含數字，也不含字母序。** 代碼直接描述判準，排序另外放在 `rank` 欄。

理由：證據分類預期會持續擴充，若代碼寫成 `tier1` / `tier_a`，任何插入新等級的動作都會迫使既有值改名或讓名稱與實際順序脫節。名稱管語意、`rank` 管順序，兩者分離才擴充得動。

`rank` 以 10 為間隔配置，插入新等級時只需要取中間值，不需要重編既有等級。

---

## 3. 等級詞彙

| `grade_code` | `rank` | 中文 | 判準 |
| --- | --- | --- | --- |
| `unrecorded` | 10 | 未記錄 | 入庫時沒有留下任何證據指標 |
| `screenshot` | 20 | 截圖 | 有結果截圖、審查者看過；index 可能未保存 |
| `screenshot_metered` | 30 | 截圖含幀率 | 同一張截圖同時顯示幀率數值，且達到該平台門檻 |
| `witnessed` | 40 | 現場見證 | 活動現場由主辦或管理者當場確認 |
| `run_video` | 50 | 完整錄影 | 整趟連續錄影，可重新複驗 |

預留但**先不建立**（等真的有人用再加，避免空殼等級）：`world_timer`（世界計時器輸出）、`stream_vod`（直播存檔）、`organizer_confirmed`（主辦方確認）。

### 3.1 `screenshot` 與 `screenshot_metered` 不是兩份證據

兩者是**同一張截圖的兩種判讀結果**。幀率數值與成績顯示在同一張圖的同一位置，所以升級不需要玩家補交任何東西，只需要審查者讀出圖上的幀率數值。

圖上讀得到幀率但**未達門檻**時，等級維持 `screenshot`，不是拒絕受理。

---

## 4. 幀率門檻

門檻**依平台**而定，不是單一數值：

| `standard_code` | `platform_code` | `min_fps` |
| --- | --- | --- |
| `jintei` | `pc` | 60 |
| `jintei` | `pcvr` | 120 |
| `jintei` | `quest` | 75 |

### 4.1 標準是有範圍的，不是通則

這組門檻來自 Jintei 的世界，不是全站通則。清查結果：

- Jintei 是 76 個世界中的 37 個作者，對應 **566 / 1027 筆紀錄（55%）**。
- 其餘 461 筆分屬 Calme(103)、StarRiver Arts(95)、G線上のハッチ(56)、Aiden1408(46)、FoxBG(41) 等作者的世界，**目前沒有定義幀率標準**。

因此 `evidence_fps_standards` 以 `standard_code` 分組，`track_worlds.evidence_fps_standard` 指向所採用的標準。未指派標準的世界**判不出** `screenshot_metered`，其紀錄停在 `screenshot`，這是正確行為，不是缺陷。

### 4.2 平台未知的紀錄

`platform_code` 目前分布為 pc 583 / pcvr 434 / quest 4 / **unknown 6**。那 6 筆沒有平台就沒有門檻可比，一律停在 `screenshot`，不做推測。

---

## 5. 存觀測值，不只存判決

`screenshot_metered` 的判定結果**不單獨儲存為布林**。紀錄上存的是：

- `evidence_fps_observed`：截圖上讀到的幀率數值
- `evidence_standard_code`：判定當下採用的標準
- `evidence_grade`：據前兩者推導出的等級

理由：門檻日後會調整（新平台、新世界作者、社群共識改變）。只存「達標／不達標」的話，門檻一改就無法重算，歷史紀錄全部作廢。存觀測值則可以重跑判定。

### 5.1 目前沒有任何幀率資料

現況是 0 筆紀錄帶有幀率數值，因此 `screenshot_metered` 上線時會是空的等級。這是預期狀態，不是缺陷——這一階要等入庫流程開始收幀率才會有資料。

### 5.2 OCR 的定位

**不規劃用 OCR 回讀歷史。** 卡點不在「讀數字」而在「哪張圖對哪筆紀錄」——1009 筆的 index 從未建立，OCR 讀得再準也無法把圖對回紀錄。歷史資料無解，見第 7 節。

往後的入庫流程若採 Discord 訊息右鍵登記，bot 當下手上就有附件，本機 OCR 技術上可行。但 HUD 位置、字型、使用者設定因世界而異，誤讀的代價是**錯誤升級等級**。因此若要導入：

- OCR 結果只作為**建議值預填**，由審查者確認後才寫入，`evidence_grade_source = 'review'`。
- 不接受 OCR 自動判定等級。

在此之前的低成本作法是：登記表單多一個幀率數字欄位。審查者本來就在看那張圖，讀一個數字遠比架 OCR 便宜。

---

## 6. 證據本體不入庫

**證據本身留在審查者端，不進資料庫、不進網站。** 資料庫只存指標（index）。

| 存什麼 | 放哪 | 對外 |
| --- | --- | --- |
| Discord 訊息永久連結 | `evidence.private_ref` | 否 |
| 截圖檔案雜湊（選用） | `evidence.content_hash` | 否 |
| 證據等級 | `records.evidence_grade` | 暫不輸出（見 6.3） |

即使日後開始輸出，網站與 VRChat 也**只取等級**，不輸出 `private_ref`、不輸出 `public_url`、不輸出審核備註。這與 [`t-1-adapter-policy.md`](./t-1-adapter-policy.md)「無 public evidence 時輸出空字串，不暴露內部細節」一致。

### 6.3 等級目前是內部欄位

Owner 決定**暫不在網站顯示任何驗證或等級標記**，理由是資料尚未成熟：`screenshot_metered` 與 `run_video` 為空、`screenshot` 為批次推定、只有 18 筆 `witnessed` 是逐筆確認的。此時公開等級會讓推定值看起來像判定值。

因此在 owner 另行指示前：

- `timeattack.js` 的 `SHOW_VERIFICATION` 維持 `false`。
- builder **不得**把 `evidence_grade` 寫進 `data/*.json` 或 VRChat 契約。
- 等級只服務內部審核與資料品質追蹤。

### 6.1 不要存附件 CDN 連結

Discord 的附件 URL 帶簽章參數會過期，存了等於沒存。要存的是 message link（`discord.com/channels/<guild>/<channel>/<message_id>`），只要訊息還在就永久有效。

### 6.2 index 應由動作產生，不靠手動複製

要求管理者手動複製圖片檔名或訊息連結不可行，實務上一定會被跳過。可行做法是讓 index 成為既有動作的副產品：Discord 訊息右鍵指令（context menu）在登記時自動帶入該訊息的連結、作者與附件清單，管理者只填本來就要填的技術欄位。

此項屬於 bot 端工作，與本檔的欄位設計解耦——等級欄位可以先立、先回填，index 之後補進 `evidence` 表不會動到 `records`。

---

## 7. 回填政策

歷史 1009 筆的 index **不回填**。當初就沒有建立「哪則訊息對應哪筆紀錄」的關聯，翻閱歷史頻道也還原不出來（同一玩家同日多筆的截圖無法區分歸屬）。

回填只寫等級，並且必須標記來源：

- `evidence_grade_source = 'backfill'`：批次推定，非逐筆確認
- `evidence_grade_source = 'intake'`：入庫當下判定
- `evidence_grade_source = 'review'`：審查者逐筆判定

`backfill` 這個標記是必要的：它誠實表示這批等級是依 owner 對整體實務的敘述推定而來。日後若發現個別紀錄其實沒有截圖，可單獨降級為 `unrecorded`，而且資料上分得出哪些是推定、哪些是逐筆判定。若不標記，這批資料的可信度將永久無法說明。

**回填範圍（日期區間、是否全量）尚未決定，由 owner 提供。** 現有紀錄日期跨度為 `2025-01-13` ~ `2026-07-19`。

---

## 8. 決議與待決

### 已決（2026-07-22，owner）

- 幀率標準採 scope 制，不做全站常數（第 4 節）。
- 存觀測幀率值，不存布林判決（第 5 節）。
- `screenshot` 與 `screenshot_metered` 是同一張截圖的兩種判讀（第 3.1 節）。
- `witnessed` 與 `run_video` 各有優劣，階層相近即可，維持 rank 40 / 50。**`rank` 不設 UNIQUE 限制**，保留日後把兩者並列為同一階的可能；SQLite 事後無法移除 UNIQUE（需重建表），故在無資料階段先預留。取最高等級時以 `(rank, grade_code)` 排序，並列亦有確定性結果。
- 網站暫不顯示驗證或等級（第 6.3 節）。

### 待決

1. 回填範圍（見第 7 節），由 owner 提供。
2. 非 Jintei 世界（461 筆）是否沿用同一組幀率門檻，或維持無標準。
3. 入庫流程是否加入幀率數字欄位（見第 5.2 節）；OCR 暫不規劃。
4. `submissions` 表是否同步加入等級欄位（目前 0 筆，可延後）。

---

## 9. 對應 schema

見 `VR_RacingClubTW/migrations/m0003_evidence_grades.py`（additive，`user_version` 2 → 3）。

該遷移**只建立結構與詞彙表**，不修改任何既有紀錄的欄位值。世界與標準的對應、以及第 7 節的回填，都是獨立的資料決策步驟，需要另外執行並個別留下紀錄。
