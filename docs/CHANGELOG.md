## v1.5.0 — 2026-10-11

本次更新著重可維護性與開發工具。CLI 的來源覆寫新增同目錄原子替換流程及權限模式保留；跨文件參照診斷會攜帶來源檔案；新增 `buildWorkspaceIndex()` 索引 API，供文件工具理解來源、ID 與連結。Playground 新增 AST Tree 與選取來源範圍。Markdown 匯出會明確報告更多語義遺失案例，嚴格轉換模式不會在發生診斷時建立輸出。中英文網站 `.sm` 文件新增自動化驗證。

本版不更改穩定語法及 AST `version: "1.1"`。完整版 CommonMark/GFM、CSL、LaTeX、增量解析、AST 無損 Writer 仍是獨立議題。

# 語言核心版本變更紀錄

## V1.1.1 — 2026-10-11

- 文件章節、語法索引、行動版與 Playground 的穩定性改善。
- Markdown 行內語義遺失診斷與維護測試。
- 詳情見 `docs/RELEASE_1.1.1.md`。

## V1.1.0 — 2026-10-11

本版將 `.sm` 定為正式副檔名，正式化 `&` 指令與簡化別名，並補齊網站、治理文件、符合性測試、fuzz 安全檢查與 npm 發布設定。

### 語法與核心

- AST 文件版本穩定為 `1.1`，不再回報 `0.5-draft`。
- `&n`、`&t`、`&w` 與 `&e` 分別是 `&note`、`&test`、`&warning` 與 `&end` 的固定簡化寫法。
- 指令名稱與屬性之間允許空格，旗標屬性如 `[typing]` 會解析為 `true`。
- 範例與文件統一使用 `.sm`。

### 工程與發布

- 新增 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、Issue templates 與 Pull Request template。
- 新增 `npm run fuzz` 與 `npm run benchmark:tokens`，並建立 `docs/CONFORMANCE.md`。
- npm package metadata 已具備公開發布所需的 `exports`、`files`、repository 與 `publishConfig`。

## V0.4 — 2026-10-10

與 V0.3 比較，本版保留原有標題、格式、清單、連結、`&` 指令及標題 ID 語法，不變更副檔名策略。

### 解析與 AST

- 行內節點新增 `range`，包含 `start`/`end` 的 1-based 行與欄，以及 0-based UTF-16 `offset`；終點為半開區間。
- 依據標題、段落、清單、引用、GFM 表格儲存格實際位置建立來源範圍。
- 文書語義驗證獨立到 `src/semantic.ts`，參照錯誤指向實際 `&ref` token。
- 先建構中括號與小括號配對索引，改善大量未閉合符號時的效能。
- AST 版本標示由 `0.3-draft` 改為 `0.4-draft`；行內節點新增必要欄位 `range`，**為破壞性 API 變更**。

### 區塊

- 調整清單空白行分組、長編號（如 `10.`）續行掛靠縮排。
- `&` 容器掃描器處理一般／原始子區塊及程式碼、註解的保護範圍。
- 原始資料區塊以 `\\&end` 表示不具關閉作用的文字 `&end`。
- 行首的內建 `&kbd[...]` 不會被誤當成區塊。
- 未註冊的 `&namespace:name[...]` 保留為 `inlineDirective` 節點，供未來擴充處理。

### 表格

- JSON 格式加入 `columns`/`rows` Schema 與格位占用檢查。
- `colspan`、`rowspan` 不得跨出表格或與其他儲存格相互重疊；列內空缺亦視為資料錯誤。
- CSV/TSV 的欄位數差異、引號錯誤與未指定 `format` 有明確診斷。
- 無效結構化表格不輸出含錯誤 span 的 HTML 表格。

### 測試與限制

- 保留 V0.3 的 69 項測試，新增 42 項 V0.4 測試（合計 111 項）。
- 新增多行／容器範圍、巢狀 `&end`、表格合法與非法格位、長輸入等回歸案例。
- 仍無完整 CSL 文獻引擎、完整版 YAML 與數學排版，Token 數仍待測量。

## V0.3 — 2026-10-10

完成 `&` 指令基本原型、Compact 行內語法、標題 `(#id)`、三種資料表格輸入、Metadata 簡化解析、HTML Renderer 及初步診斷。

## V1.3.0 — 2026-10-11

- 新增 CLI `check`、`render`、`ast`、`convert`、`format`、`workspace`，含非破壞性寫入與退出碼。
- `visitAst()` 支援讀取完整語法樹與巢狀節點，加入雙語 Playground AST JSON。
- 工作區參照統一為從來源檔案目錄解析的相對 `.sm#id` 位置，禁止越界。
- 文件網站加入無後端雙語搜尋、語法範例導入 Playground。
- Markdown 匯入增加可輸出的轉換後 `.sm` 文字 API；匯出對無損轉換失敗的行內語義輸出警告。
- 增加 CLI、Visitor、文件搜尋、範例目錄與跨文件參照的測試。

## V1.2.0 — 2026-10-11

- 建立 AST Visitor、CLI 基礎、Playground 範例集與 AST 檢視設計。
- 保留原有 v1.1 相容語法，不改變核心 AST 文件版本值。
