# StructMark

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tech](https://img.shields.io/badge/stack-TypeScript-lightgrey)
![Runtime](https://img.shields.io/badge/runtime-Node.js%2022%2B-orange)

[中文](#中文) | [English](#english)

---

## 中文

### 目錄

- [關於](#關於)
- [功能](#功能)
- [展示 Demo](#展示-demo)
- [安裝](#安裝)
- [使用方式](#使用方式)
- [授權](#授權)

### 關於

StructMark 是一套以語義結構為核心的通用標記語言, 使用 `.sm` 作為正式副檔名.

它保留純文字寫作的直接感, 同時讓標題、指令、資料、參照與診斷成為 Parser 可以明確理解的結構. 同一份文件可以交給 CLI、TypeScript API、網站、索引器或編輯器使用, 不必為每個工具重新改寫格式.

目前主分支是 `2.0.0`。StructMark 只提供 `src/v2/` 的單一語言核心；過時的 1.6 核心、CLI 與測試已移除，不再維護兩套語義不同的實作。

StructMark 的主要目標不是宣稱每份文件都比 Markdown 短, 而是用簡潔且一致的語法提供可預測解析、語義診斷、安全輸出與工具整合. 目前 16 組 `.md` / `.sm` 共同語義語料已完成 AST 對照, 結果為 16/16 通過. 真實 tokenizer 測試顯示目前沒有穩定的 Token 優勢, 詳細結果見 [Token 測試報告](docs/MD_SM_TOKEN_REPORT.md).

### 功能

- **語義區塊**: 標題、提示、警告、範例、引用、程式碼與資料區塊.
- **原生結構化資料**: 方括號表格、欄位型別、`schema` 與 `data` 驗證.
- **可驗證參照**: 支援文件內與工作區內的 `.sm#id` 參照, 並拒絕越出工作區的路徑.
- **確定性 AST**: 相同來源產生相同的 AST, 方便測試、格式化、索引與轉換.
- **安全 HTML**: 文字、屬性與 URL 經過跳脫和白名單處理.
- **完整工具鏈**: CLI、TypeScript API、雙語文件網站、Playground、Language Server 與 VS Code 擴充套件來源.

### 展示 Demo

- 文件網站: [StructMark documentation](https://omiki0826o.github.io/StructMark/)
- 線上 Playground: [Open Playground](https://omiki0826o.github.io/StructMark/zh-tw/playground/)
- VS Code 專案: [StructMark-VSCode](https://github.com/oMiki0826o/StructMark-VSCode)

一份 `.sm` 文件可以像這樣表達結構:

```sm
#1 實驗報告 (#report)

&w[實驗限制]
量測結果僅供範例.
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
```

短別名會正規化為相同的語義指令, 例如 `&w` 對應 `&warning`, `&e` 對應 `&end`.

### 安裝

需求: Node.js 22 或更新版本.

```bash
git clone https://github.com/oMiki0826o/StructMark.git
cd StructMark
npm ci
```

### 使用方式

不安裝第三方依賴時, 可以直接使用 v2 CLI:

```bash
node bin/sm2.mjs check examples/v2-introduction.sm
node bin/sm2.mjs ast examples/v2-introduction.sm
node bin/sm2.mjs html examples/v2-introduction.sm
node bin/sm2.mjs format examples/v2-introduction.sm
```

完整工作區檢查:

```bash
node bin/sm2.mjs workspace examples/workspace
```

使用 v2 ESM API:

```js
import {parse, format, renderHtml} from './src/v2/index.mjs';

const document = parse('#1 Hello (#hello)\n\nSee (#hello)');
if (!document.valid) {
  console.error(document.diagnostics);
} else {
  console.log(renderHtml(document));
}
```

執行完整驗證:

```bash
npm run check:v2
npm test
npm run docs:check
npm run fuzz
python3 benchmark/tokens.py --require-tokenizer
npm run benchmark:semantic
```

網站與 VS Code 的建置方式請分別參考 `apps/site/package.json` 與 [VS Code README](packages/vscode/README.md). 目前 VS Code VSIX 的實機安裝與瀏覽器 Chromium E2E 需要在具備對應執行環境的 CI 或開發機完成.

### 授權

本專案採用 MIT License 授權, 詳見 [LICENSE](./LICENSE).

---

## English

### Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

### About

StructMark is a semantic-first general-purpose markup language with `.sm` as its official file extension.

It keeps plain-text writing direct while making headings, directives, data, references, and diagnostics explicit to a parser. The same source can feed a CLI, TypeScript API, website, indexer, or editor without being rewritten for each tool.

The current main branch is `2.0.0`. StructMark now ships one language engine from `src/v2/`; the obsolete 1.6 core, CLI, and tests have been removed so every tool uses the same semantics.

StructMark does not claim that every document uses fewer tokens than Markdown. Its main value is predictable parsing, semantic diagnostics, safe output, and tooling integration. A 16-pair `.md` / `.sm` corpus now passes AST comparison 16/16; the real tokenizer benchmark currently shows no stable token advantage. See the [token report](docs/MD_SM_TOKEN_REPORT.md).

### Features

- **Semantic blocks**: headings, notes, warnings, examples, quotes, code, and data blocks.
- **Structured data**: native tables, typed columns, `schema`, and `data` validation.
- **Checked references**: document-local and workspace-relative `.sm#id` references with traversal protection.
- **Deterministic AST**: identical source produces identical structure for testing, formatting, indexing, and conversion.
- **Safe HTML**: text, attributes, and URLs are escaped and filtered through allowlists.
- **Tooling**: CLI, TypeScript API, bilingual documentation site, Playground, Language Server, and VS Code extension sources.

### Demo

- Documentation site: [StructMark documentation](https://omiki0826o.github.io/StructMark/)
- Playground: [Open Playground](https://omiki0826o.github.io/StructMark/zh-tw/playground/)
- VS Code project: [StructMark-VSCode](https://github.com/oMiki0826o/StructMark-VSCode)

### Installation

Requirements: Node.js 22 or later.

```bash
git clone https://github.com/oMiki0826o/StructMark.git
cd StructMark
npm ci
```

### Usage

Run the v2 CLI:

```bash
node bin/sm2.mjs check examples/v2-introduction.sm
node bin/sm2.mjs ast examples/v2-introduction.sm
node bin/sm2.mjs html examples/v2-introduction.sm
node bin/sm2.mjs format examples/v2-introduction.sm
```

Run the complete validation suite:

```bash
npm run check:v2
npm test
npm run docs:check
npm run fuzz
python3 benchmark/tokens.py --require-tokenizer
npm run benchmark:semantic
```

See `apps/site/package.json` and the [VS Code README](packages/vscode/README.md) for their respective build flows. VS Code installation testing and Chromium browser E2E require a suitable CI runner or development machine.

### License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
