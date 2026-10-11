# Changelog

目前套件版本：**1.5.0**；穩定語法版本：**1.1**。

## 1.5.0 — 2026-10-11

- CLI `format --write` 採取同目錄暫存檔後替換，拒絕直接覆寫符號連結，並保留原檔權限模式。
- 跨文件診斷新增可追查的 `file`、參照目標與來源位置；提供 `buildWorkspaceIndex()` API。
- Markdown 匯出對更多非等價行內格式與註解提供警告；`--strict` 不再輸出有語義遺失的檔案。
- Playground 新增 AST Tree，可展開節點並定位來源文字；JSON 檢視仍然保留。
- 官方網站的繁中／英文 `.sm` 內容加入一致性檢查；修正失效的 note 屬性。
- 加入 CLI、Workspace、AST Tree、文件驗證回歸測試及 CI 補強。

語言 AST `version: "1.1"` 不變；完整 CommonMark、CSL、增量解析與無損 AST Writer 並非本版實作承諾。真實建置狀況參考 `VALIDATION.md`。

## 1.3.0 — 2026-10-11

- AST Visitor 與工作區參照路徑修正。
- CLI 工具、雙語文件搜尋、Playground AST 和可載入範例。
- Markdown 子集轉換改善及更多自動化測試；詳見 `docs/CHANGELOG.md`。

## v1.1.1 — 2026-10-11

- 改善雙語文件的語法索引、語義區分、範例與診斷說明。
- 修正 Markdown 匯出對部分行內語義遺失時未提示的問題。
- 加強 Playground 草稿保護與行動版排版回歸測試。
- 延續日式極簡視覺，保留原有 StructMark 1.1 語法契約。

完整版本變更紀錄位於 [`docs/CHANGELOG.md`](docs/CHANGELOG.md)。
