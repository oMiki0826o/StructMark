# StructMark

> **2.0.0-rc.1 原始碼候選版。** `.sm` 的 v2 引擎已具備解析、驗證、格式化、安全 HTML 輸出與 CLI；原有 1.6 工具鏈仍保留作為相容層。RC 不是正式 `2.0.0` 發行，建置限制與驗證結果列於 [驗證報告](docs/STRUCTMARK_V2_RELEASE_EVIDENCE.md)。

StructMark 是一套以語義結構為核心的文字標記語言。它希望將簡潔的日常寫作語法，與可檢查的引用、型別化資料及文件工具結合；減少 Token 是設計目標，但**尚未完成相同語義語料的真實 Tokenizer 驗證，因此不宣稱全面優於 Markdown**。

[English introduction](#english) · [v2 語法契約](docs/STRUCTMARK_V2_LANGUAGE_CONTRACT.md) · [v2 CLI](docs/STRUCTMARK_V2_CLI.md) · [版本狀態](V2_RELEASE_STATUS.md)

## StructMark 2.0 範例

```sm
#1 實驗報告 (#report)

&w[實驗限制]
量測結果僅供範例。
&e

&tbl
[樣本:string][反應速率:number]
[A][1.2]
[B][1.8]
&e

&schema[Record]
{"name":"string","value":"number"}
&e

&data[format=json,schema=Record]
{"name":"A","value":1.2}
&e

結論參考 (#report)。
```

上面的 `&w[實驗限制]` 與 `&warning[title=實驗限制]` 具有相同意義；`&e` 與 `&end` 都可以關閉區塊。短寫法會轉為相同的語義 AST，而不是由 Renderer 另行猜測。

## 主要能力

- **語義區塊**：標題、說明、警告、範例、引文、程式碼及數學原文。
- **原生表格**：相鄰的 `[儲存格]`，可在欄名後標註 `:number`、`:boolean`、`:date`。
- **資料 Schema 子集**：使用 `&schema` 宣告欄位型別，`&data` 儲存 JSON 並檢查必填/選填欄位。
- **文件參照**：`(#id)`、`(#path/to/file.sm#id)`；可由 CLI 跨檔案驗證，拒絕超出工作區的路徑。
- **行內格式**：`*[粗體]`、`/[斜體]`、`=[螢光]` 及巢狀標記。
- **安全渲染**：文字與屬性跳脫；僅允許安全 URL 類型，不執行程式碼或遠端資源。

## 安裝與使用

Node.js **22+**。只使用 `sm2` v2 CLI 時，不需要安裝第三方依賴：

```bash
node bin/sm2.mjs check examples/v2-introduction.sm
node bin/sm2.mjs ast examples/v2-introduction.sm
node bin/sm2.mjs html examples/v2-introduction.sm
node bin/sm2.mjs format examples/v2-introduction.sm
node bin/sm2.mjs workspace examples/workspace
npm run check:v2
```

`format` 預設輸出至標準輸出，不會覆寫來源；使用 `--write` 才修改檔案，`--check` 則檢查是否符合標準格式。

也能從 v2 ESM API 使用：

```js
import {parse,format,renderHtml,validateWorkspace} from './src/v2/index.mjs';
const document=parse('#1 Hello (#hello)\nSee (#hello)');
if (!document.valid) console.error(document.diagnostics);
else console.log(renderHtml(document));
```

npm 發布後的 subpath API 預定為 `structmark-language-core/v2`；本原始碼包尚未進行 Registry 發布。

## 專案結構

| 路徑 | 功能 |
| --- | --- |
| `src/v2/` | v2 獨立 ESM 引擎與宣告檔；所有 v2 工具共用 |
| `bin/sm2.mjs` | v2 CLI |
| `experimental/v2/tests/` | v2 回歸、CLI 與安全測試 |
| `src/`（其他檔案） | v1.6 相容核心及既有 TypeScript 工具 |
| `apps/site/` | 雙語文件站與可切換版本的 Playground |
| `packages/language-server/`、`packages/vscode/` | VS Code/LSP 原始碼與打包流程 |
| `docs/` | 語法、設計、CLI、版本與驗證文件 |

## 開發與驗證

```bash
npm run check:v2                     # 無須第三方依賴
node scripts/validate-vscode-assets.mjs
npm ci && npm test                    # 需要 npm 套件
npm run docs:check                    # 需要 TypeScript、yaml、katex
npm run fuzz
cd apps/site && npm ci && npm test && npm run build
```

VS Code 專案請參閱 [VS Code README](packages/vscode/README.md)。在缺乏 npm Registry 或編輯器執行環境時，不能將尚未執行的 TypeScript / Next.js / VSIX 驗收列為通過。

## 相容性與版本

既有 `parseDocument()`、`renderHtml()` 與 `structmark` CLI 仍維持 v1.6 路徑，舊 AST 版本為 `1.1`；**v2 API 是 `parse()`、`format()`、`renderHtml()`，AST `version: "2.0"`**。此階段採明確版本介面，避免默默改變現有文件。正式 `2.0.0` 要通過 [發行檢查點](docs/STRUCTMARK_V2_RELEASE_GATES.md)。

## 授權

MIT License，詳見 [LICENSE](LICENSE)。

## English

StructMark is a semantic-first `.sm` markup language intended for readable writing, typed data, checked references, and deterministic tooling. This archive is the **2.0.0-rc.1 source candidate**, not a final stable release. The v2 ESM engine lives in `src/v2/` and is shared by the CLI, playground integration, and editor source. The previous v1.6 API remains available separately.

Run `node bin/sm2.mjs check examples/v2-introduction.sm` and `npm run check:v2` without additional npm packages. A complete TypeScript, Next.js, or VSIX build requires installing the corresponding dependencies; see the [verification report](docs/STRUCTMARK_V2_RELEASE_EVIDENCE.md). No Token savings over Markdown or @Doc are claimed without comparable tokenizer results.
