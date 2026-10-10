# StructMark Language Core

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tech](https://img.shields.io/badge/stack-TypeScript%20%2B%20Node.js-lightgrey)
![Node](https://img.shields.io/badge/node-22%2B-orange)

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

目前版本為 V1.0.0，`.sm` 是 StructMark 的正式副檔名。語言核心已可直接解析 `.sm` 文件；V1.0 的語法邊界與相容性規則記錄於 `docs/`。

### 功能

- `#1`～`#6` 標題、段落、引用、分隔線與 fenced code block。
- 無序、數字、自動編號與任務清單，支援巢狀與續行。
- 粗體、斜體、底線、刪除線、螢光、上下標、行內程式碼與數學。
- 連結、圖片、Wiki link、註腳、學術引用與 `&` 語義指令。
- GFM pipe table、CSV/TSV 與 JSON structured table 驗證。
- `DirectiveRegistry`、自訂指令、屬性 schema 與可定位 diagnostics。
- normalized UTF-16、原始 offset 與 UTF-8 byte offset 對映。
- 穩定 AST JSON 序列化與安全 HTML renderer。

### 安裝

需要 Node.js 22 或相容版本，以及 TypeScript 5.8+ 開發工具鏈。

```bash
npm install
npm test
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

程式中可從 `src/index.ts` 使用 `parseDocument`, `parseInline`, `lexDocument`, `renderHtml` 與 `serializeAst`。Parser 不會執行 raw/data/code 內容，也不會存取網路或檔案。

### 網站

StructMark 的文件網站與瀏覽器 Playground 位於 [GitHub Pages](https://omiki0826o.github.io/StructMark/)。網站原始碼在 `apps/site`，每次推送到 `main` 都會由 GitHub Actions 執行核心測試、Next.js 靜態建置並部署。

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

Version 1.0.0 is the first usable language-core release. `.sm` is the official StructMark file extension, and the language-core examples use `.sm` files.

### Features

- Headings `#1` to `#6`, paragraphs, quotes, thematic breaks, and fenced code blocks.
- Unordered, numbered, automatic, and task lists with nesting and continuation lines.
- Strong, emphasis, underline, delete, highlight, superscript, subscript, code, and math spans.
- Links, images, wiki links, footnotes, citations, and semantic `&` directives.
- GFM pipe tables, CSV/TSV tables, and JSON structured-table validation.
- `DirectiveRegistry`, custom directives, attribute schemas, and source-located diagnostics.
- Normalized UTF-16, original-source, and UTF-8 byte offset mapping.
- Stable AST JSON serialization and safe HTML rendering.

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

The public API is exported from `src/index.ts`, including `parseDocument`, `parseInline`, `lexDocument`, `renderHtml`, and `serializeAst`. The parser does not execute raw/data/code content or access the network or filesystem.

### Website

The StructMark documentation site and browser Playground are available on [GitHub Pages](https://omiki0826o.github.io/StructMark/). The site source lives in `apps/site`; every push to `main` runs the language-core tests, builds the Next.js static export, and deploys it through GitHub Actions.

### License

This project is licensed under the [MIT License](./LICENSE). Copyright (c) `omiki0826o`.
