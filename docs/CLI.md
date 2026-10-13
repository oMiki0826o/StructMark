# StructMark CLI（v1.5.0）

StructMark 是 `.sm` 文件的語言核心。v1.3 起提供不依賴服務端的 Node.js 指令工具；指令不會傳送文件到網路。

## 安裝

```bash
npm ci
npm run build
node bin/sm2.mjs --help
```

套件發布後，`bin` 欄位會提供 `structmark` 指令。從本倉庫執行時可直接用 `node bin/sm2.mjs`。

## 檔案操作

```bash
structmark check examples/spec-sample.sm
structmark check examples/spec-sample.sm --json
structmark render examples/spec-sample.sm --output output.html
structmark ast examples/spec-sample.sm --output ast.json
structmark convert examples/spec-sample.sm --to md --output exported.md
structmark convert article.md --from markdown --to sm --output article.sm
structmark format examples/spec-sample.sm
structmark format examples/spec-sample.sm --write
structmark workspace examples/
```

`--output` 僅建立尚不存在的新檔案。`format` 預設輸出 stdout，只有明確設定 `--write` 才覆寫輸入檔；v1.5 採用同目錄暫存與替換流程，拒絕覆寫來源符號連結，並保留檔案權限模式。轉換器僅承諾文件化的 Markdown 子集；無法保留的格式以 diagnostics 表示。對大型資料請先保留原檔備份。

## 退出碼

| Code | 意義 |
| --- | --- |
| `0` | 指令成功，或 `check`/`workspace` 無診斷 |
| `1` | 解析、驗證或檔案操作失敗；在 `check` 中包含警告 |
| `2` | 指令名稱、選項或參數不合法 |

`render`、`ast` 和 `convert` 預設允許有非致命警告的輸出，`--strict` 會把警告標記為失敗，並在有診斷時避免建立新的轉換輸出檔。`workspace` 遞迴檢查 `.sm`，略過隱藏目錄、`node_modules`、`dist`、`out` 和符號連結，不會下載外部檔案。

## 相對參照

從 `chapters/one.sm` 參照同資料夾 `two.sm`：

```sm
&ref[two.sm#target]
```

參照上層 `index.sm`：

```sm
&ref[../index.sm#intro]
```

超出工作區根目錄的路徑被視為無效參照。現有語言 AST 的 `version: "1.1"` 維持相容，套件版本與 AST 語法版本是不同概念。

## 工作區 JSON 診斷

`structmark workspace examples/ --json` 的每筆診斷包含 `file`（相對於工作區）、`code`、`severity`、`message` 以及 `position.line` / `position.column`。跨文件參照不再籠統標成 `workspace`，方便在編輯器與 CI 直接定位。
