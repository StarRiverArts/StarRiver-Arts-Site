# ⚠️ canonical ta_data.sqlite 已搬離此處

自 2026-07-30 起,Time Attack 的正式資料庫**不再放在這個資料夾**。

**新位置(在所有 git repo 之外):**

```
<CreationProject>/RacingHubData/canonical/ta_data.sqlite
d:\D\CreationProject\RacingHubData\canonical\ta_data.sqlite
```

所有工具透過環境變數 `RACINGHUB_CANONICAL_DB`,或由程式往上層尋找
`RacingHubData/canonical/ta_data.sqlite` 來解析路徑(fail-closed)。

**請勿**再把 `ta_data.sqlite` 放回這個資料夾 —— 現行程式會忽略這裡的檔,
但殘留/空的 DB 仍是風險來源。

備份與遷移細節見 `RacingHubData/MIGRATION_STATE.md`。
此資料夾只保留發布用的 generated 產物(data/、vrc/、*.html)。
