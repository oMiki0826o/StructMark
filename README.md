> **v1.6.0 開發快照：** 核心與網站已完成本地驗證；LSP／VS Code 尚未完成正式建置及 VSIX 驗收。詳見 [VALIDATION.md](VALIDATION.md)。

# StructMark Language Core

## v1.6.0：核心工具鏈與工作區能力

在 v1.5 的 CLI、Visitor、Workspace Index、AST Tree 與雙語文件驗證基礎上，v1.6 延伸工作區參照 API、CLI 文件檢查與安全轉換流程，並提供獨立的 VS Code／LSP 開發專案。語言 AST 仍是 `version: "1.1"`。

- 完整更新與限制：[`docs/STATUS_AND_ROADMAP.md`](docs/STATUS_AND_ROADMAP.md)
- CLI 操作：[`docs/CLI.md`](docs/CLI.md)
- 驗證結果：[`VALIDATION.md`](VALIDATION.md)

```bash
npm ci
npm test
npm run docs:check
npm run fuzz
cd apps/site && npm ci && npm test && npm run build
```

---

![Version](https://img.shields.io/badge/version-1.6.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tech](https://img.shields.io/badge/stack-TypeScript%20%2B%20Node.js-lightgrey)
![Node](https://img.shields.io/badge/node-22%2B-orange)
[![CI](https://github.com/oMiki0826o/StructMark/actions/workflows/check.yml/badge.svg)](https://github.com/oMiki0826o/StructMark/actions/workflows/check.yml)

[中文](#中文) | [English](#english)

---

## 中文

### 目錄

- [關於](#關於)
- [功能](#功能)
- [安裝](#安裝)
- [使用方式](#使用方式)
- [網站](#網站)
- [授權](#授權)

### 關於

StructMark Language Core 是 StructMark 輕量、可讀、可擴充標記語言的 TypeScript 語言核心。專案提供 Lexer、Block/Inline Parser、AST、diagnostics 與安全 HTML 輸出；不包含編輯器或 GUI。

目前工具與 npm 套件版本為 V1.6.0，穩定語法／AST 版本仍為 1.1。`.sm` 是正式副檔名；語法邊界與相容性規則記錄於 `docs/`。

### 功能

- `#1`～`#6` 標題、段落、引用、分隔線與 fenced code block。
- 無序、數字、自動編號與任務清單，支援巢狀與續行。
- 粗體、斜體、底線、刪除線、螢光、上下標、行內程式碼與數學。
- 連結、圖片、Wiki link、註腳、學術引用與 `&` 語義指令。
- GFM pipe table、CSV/TSV 與 JSON structured table 驗證。
- `DirectiveRegistry`、自訂指令、屬性 schema 與可定位 diagnostics。
- normalized UTF-16、原始 offset 與 UTF-8 byte offset 對映。
- 穩定 AST JSON 序列化與安全 HTML renderer。
- `visitAst`、`buildWorkspaceIndex` 與安全的跨文件參照解析。
- CLI 的 `check`、`render`、`ast`、`convert`、`format`、`workspace` 與文件檢查工具。
- `toMarkdownDetailed` 與 strict conversion 的語義損失診斷。

### 安裝

需要 Node.js 22 或相容版本，以及 TypeScript 5.8+ 開發工具鏈。

```bash
npm install
npm test
npm run fuzz
```

### 使用方式

解析 `.sm` 範例並輸出 HTML：

```bash
npm run demo -- examples/v04-specimen.sm
```

輸出 AST JSON：

```bash
npm run demo -- examples/v04-specimen.sm --ast
```

遇到 diagnostics 時以非零狀態結束：

```bash
npm run demo -- examples/v04-specimen.sm --strict
```

程式中可從 `src/index.ts` 使用 `parseDocument`, `parseInline`, `lexDocument`, `renderHtml`, `serializeAst`, `visitAst`, `validateWorkspace`, `buildWorkspaceIndex`, `fromMarkdown`, `toMarkdownDetailed`, `toMarkdown` 與 `formatSource`。Parser 不會執行 raw/data/code 內容，也不會存取網路或檔案。

穩定的 `.sm` 語法與可執行的相容性承諾記錄於 [`docs/CONFORMANCE.md`](./docs/CONFORMANCE.md)。

### 網站

StructMark 的文件網站與瀏覽器 Playground 位於 [GitHub Pages](https://omiki0826o.github.io/StructMark/)。網站原始碼在 `apps/site`，每次推送到 `main` 都會由 GitHub Actions 執行核心測試、Next.js 靜態建置並部署。

### 開發路線

目前優先維護語言核心的相容性、diagnostics、Formatter、CLI 與工作區工具。VS Code／LSP 位於獨立的 `StructMark-VSCode` 專案；進度與明確限制請見 [`docs/v1.6.0-status.md`](./docs/v1.6.0-status.md) 與 [`VALIDATION.md`](./VALIDATION.md)。

### 授權

本專案採用 [MIT License](./LICENSE)，著作權所有者為 `omiki0826o`。

---

## English

### Table of Contents

- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Website](#website)
- [License](#license)

### About

StructMark Language Core is a TypeScript language core for a lightweight, readable, and extensible markup language. It provides a lexer, block and inline parsers, an AST, diagnostics, and safe HTML output. It does not include an editor or GUI.

The current tooling and npm package release is 1.6.0. The stable language syntax and AST version remain 1.1. `.sm` is the official StructMark file extension.

### Features

- Headings `#1` to `#6`, paragraphs, quotes, thematic breaks, and fenced code blocks.
- Unordered, numbered, automatic, and task lists with nesting and continuation lines.
- Strong, emphasis, underline, delete, highlight, superscript, subscript, code, and math spans.
- Links, images, wiki links, footnotes, citations, and semantic `&` directives.
- BibTeX／CSL JSON data loading, deterministic citation profiles, and basic math-environment diagnostics.
- GFM pipe tables, CSV/TSV tables, and JSON structured-table validation.
- `DirectiveRegistry`, custom directives, attribute schemas, and source-located diagnostics.
- Normalized UTF-16, original-source, and UTF-8 byte offset mapping.
- Stable AST JSON serialization and safe HTML rendering.
- `visitAst`, `buildWorkspaceIndex`, and safe cross-file reference resolution.
- CLI commands for checking, rendering, AST output, conversion, formatting, workspace analysis, and docs validation.
- `toMarkdownDetailed` and strict conversion diagnostics for semantic loss.

### Installation

Node.js 22 or a compatible version is recommended. TypeScript 5.8+ is installed as a development dependency.

```bash
npm install
npm test
```

### Usage

Parse an example and render HTML:

```bash
npm run demo -- examples/v04-specimen.sm
```

Print AST JSON:

```bash
npm run demo -- examples/v04-specimen.sm --ast
```

Exit with a non-zero status when diagnostics are present:

```bash
npm run demo -- examples/v04-specimen.sm --strict
```

The public API is exported from `src/index.ts`, including `parseDocument`, `parseInline`, `lexDocument`, `renderHtml`, `serializeAst`, `visitAst`, `validateWorkspace`, `buildWorkspaceIndex`, `fromMarkdown`, `toMarkdownDetailed`, `toMarkdown`, and `formatSource`. The parser does not execute raw/data/code content or access the network or filesystem.

The stable `.sm` syntax and executable compatibility promises are documented in [`docs/CONFORMANCE.md`](./docs/CONFORMANCE.md).

### Website

The StructMark documentation site and browser Playground are available on [GitHub Pages](https://omiki0826o.github.io/StructMark/). The site source lives in `apps/site`; every push to `main` runs the language-core tests, builds the Next.js static export, and deploys it through GitHub Actions.

### Roadmap

The current priority is compatibility, diagnostics, the formatter, CLI, workspace tools, and executable test coverage. VS Code/LSP lives in the independent `StructMark-VSCode` project. See [`docs/v1.6.0-status.md`](./docs/v1.6.0-status.md) and [`VALIDATION.md`](./VALIDATION.md) for current limits and progress.

### License

This project is licensed under the [MIT License](./LICENSE). Copyright (c) `omiki0826o`.

---

## StructMark 1.3.0 — 開發工具與文件體驗（歷史）

本版本包含 1.2 與 1.3 系列功能，**維持原有 `.sm` 語法及 AST `version: "1.1"` 相容性**。語言核心現在提供 Visitor、CLI、工作區參照解析；網站提供可搜尋的雙語文件、範例與 AST 檢視。

### CLI

```bash
npm ci && npm run build
node bin/structmark.mjs check examples/spec-sample.sm
node bin/structmark.mjs ast examples/spec-sample.sm
node bin/structmark.mjs render examples/spec-sample.sm --output result.html
node bin/structmark.mjs workspace examples
```

使用 `format --write` 才會覆寫來源；一般 `--output` 不會覆蓋已存在的檔案。完整指令與退出碼見 [CLI 使用手冊](./docs/CLI.md)。

### AST Visitor

```typescript
import {parseDocument, visitAst} from "structmark-language-core";
const document = parseDocument("#1 Title\n\n*[Hello]");
visitAst(document, {
  enter(node) { console.log(node.type); }
});
```

### Playground 與文件

Playground 可選語法範例、切換 HTML / AST JSON，診斷可點擊跳到來源位置。文件提供本機即時搜尋、雙語導覽及部分 `.sm` 程式碼直接試用。所有搜尋資料來自儲存在 `apps/site/content` 的原始 `.sm`，不使用線上搜尋服務。

[1.3 功能與限制](./docs/V1.3_FEATURES.md) · [規範與相容性](./docs/CONFORMANCE.md)

### v1.3.0 Developer tools (English)

StructMark 1.3 ships a Node CLI (`check`, `render`, `ast`, `convert`, `format`, `workspace`) and `visitAst()`. The bilingual docs provide offline client-side search and editable code examples in Playground. The public language grammar remains v1.1; the package release version is v1.3.0. See [CLI](./docs/CLI.md) and [features / limitations](./docs/V1.3_FEATURES.md).
