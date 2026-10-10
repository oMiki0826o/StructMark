# StructMark Language Specification V1.1

日期：2026-10-11｜狀態：V1.1 穩定規範。本文定義 `.sm` 文件的核心語法與相容性承諾；未列入的進階功能仍屬後續版本。

## 1. 文件、字元與換行

- 原始資料使用 UTF-8，允許 UTF-8 BOM，內部換行標準化為 LF。
- StructMark 文件的正式副檔名為 `.sm`；工具不得依副檔名以外的資源 URL 猜測內容語義。
- 最前面的 `---` 若符合 Front Matter 判定，表示 Metadata；其他 `---` 表示分隔線。
- 段落由空白行分隔；單一換行為 Softbreak，行尾 `\` 加換行為 Hardbreak。
- `\` 可以跳脫一般 ASCII 標點；被跳脫的標記不啟動格式。
- 行內程式碼、程式碼區塊及原始資料區塊保留原始內容，不解析一般標記。
- 原始 HTML 不被視為可信任輸出指令；HTML Renderer 必須跳脫使用者文字。

## 2. 標題與文件區塊

| 類別 | 寫法 | 解析條件 |
|---|---|---|
| H1～H6 | `#1 標題`～`#6 標題` | 行首（最多三格空白），`#` 後跟 1–6、再接空白 |
| 明確 ID | `#2 標題 (#section)` | 僅標題行尾且 ID 合法時成立 |
| 分隔線 | `---` | 獨立行；文件開頭的 Front Matter 例外 |
| 引用 | `> 文字` | 行首引用標記 |
| 程式碼區塊 | 三個以上反引號圍欄 | 語言標籤在開頭圍欄後 |
| 註解區塊 | 獨立行 `%%` ... `%%` | 不巢狀 |
| 公式區塊 | `$$` ... `$$` | 獨立行，不包含一般行內文法 |
| 註腳定義 | `[^id]: 說明` | 行首定義，簡易版只處理單行 |

**不支援 Setext 標題**。例如 `文字\n---` 的第二行是分隔線，而非替代標題。

## 3. 行內語法

| 語義 | 語法 | 備註 |
|---|---|---|
| 粗體 | `*[文字]` | Strong |
| 斜體 | `/[文字]` | Emphasis |
| 粗斜體 | `/*[文字]` | 對應 Strong + Emphasis |
| 底線 | `-[文字]` | 不同於清單的 `- ` |
| 刪除線 | `~[文字]` | — |
| 螢光標記 | `=[文字]` | — |
| 上標 / 下標 | `^[文字]` / `_[文字]` | 一般文字的結構化上下標 |
| 行內程式碼 | `` `code` `` | 不解析格式 |
| 行內數學 | `$latex$` | `^[x]`、`_[x]` 有限轉寫為 LaTeX |
| 註解 | `%%內容%%` | 同一行內成對出現 |
| 連結 | `[文字](URL)` | URL 確定性解析，不看副檔名 |
| 圖片 | `![替代文字](URL)` | `!` 區分嵌入語義 |
| Wiki 連結 | `[[文件|顯示]]` | 單檔解析保留 AST；跨檔目標由 workspace API 驗證 |
| 學術引用 | `[&smith2024]` | 建立 Citation AST，可搭配 BibTeX／CSL JSON 資料 API |
| 註腳參照 | `[^1]` | 引用已定義的註腳 |
| 行內指令 | `&kbd[Ctrl+C]`、`&ref[id]` | 以已註冊指令類型區分 |

巢狀格式例如 `*[外層 /[內層]]`。核心限制最大區塊深度為 40；未閉合格式保留字面文字並產生診斷。

### 3.1 基礎文法（摘要）

```ebnf
heading        = "#", heading-level, space, inline-text, [space, "(#", identifier, ")"] ;
heading-level  = "1" | "2" | "3" | "4" | "5" | "6" ;
style          = ("/*" | "*" | "/" | "-" | "~" | "="), "[", inline-text, "]", [attributes] ;
script         = ("^" | "_"), "[", inline-text, "]" ;
inline-command = "&", identifier, "[", inline-text, "]", [attributes] ;
link           = "[", inline-text, "]", "(", resource-target, ")", [attributes] ;
image          = "!", link ;
block-command  = "&", identifier, [space], [attributes], newline, block-content, block-end ;
block-end      = "&end" | "&e" ;
compact-name   = "&n" | "&t" | "&w" ;
attributes     = "[", ("#", identifier | ".", identifier | key, "=", value), {space, attribute}, "]" ;
```

以上 EBNF 是易讀摘要；完整剖析器還必須考慮跳脫、引號、巢狀、行首條件與同一標記優先順序。區塊指令支援完整名稱與固定短別名；別名在建立 AST 前展開。

## 4. 清單

```text
- 無序項目
- [o] 已完成
- [ ] 未完成

1. 指定數字有序項
2. 下一項

. 自動編號
. 自動編號
```

- `. 項目` 與 `1. 項目` 可分別形成有序清單；若相鄰而模式不同，形成兩個清單。
- 清單項目延續行須縮排至項目內容起點；可透過相同規則加入子清單、多段落與程式碼區塊。
- 任務完成狀態正式使用小寫 `o`；`x` 不在此版本的原生語法中。
- 同模式同縮排的相鄰項目，即使中間有空白行仍屬同一清單；完整 CommonMark/GFM 等價不在相容性承諾內。

## 5. 屬性（原生語法不使用大括號）

```text
#2 紅石系統 (#redstone)

![星雲](m42.jpg)[#fig:m42 width=600]

&abbr[HTML][title="HyperText Markup Language"]

&note[title="重要訊息"]
文字。
&end
```

- `#name` 表示 ID、`.name` 表示類別、`key=value` 為具名屬性；空白分隔多個項目。
- 支援帶引號字串、數字與布林值，未知鍵保留在 AST；重複鍵需診斷。
- 屬性只能附在文法允許的位置，例如圖片之後、行內指令之後、區塊起始指令之後。
- **`{width=600}` 不作為原生推薦寫法。** JSON、LaTeX、程式碼等嵌入格式中的 `{}` 完全不受這個限制。
- ID 先以 NFC 正規化，再接受 Unicode 字母、數字、底線、連字號、冒號與句點；重複 ID 產生語義診斷。

## 6. `&` 區塊指令

```text
&note[title="補充"]
外層內容。

&warning
內層內容。
&end

&end
```

- 區塊起始行使用 `&name`、`&name[attrs]` 或 `&name [attrs]`；結尾使用獨立行 `&end` 或 `&e`。
- `&n`、`&t`、`&w` 分別展開為 `&note`、`&test`、`&warning`；以堆疊配對最近的開啟區塊。
- `&note`、`&warning`、`&tip` 等會繼續解析一般文件區塊。
- `&table`、`&data`、`&raw`、`&equation` 以原始內容處理，不在正文內辨識其他 StructMark 格式。
- 原始資料中的 `\&end` 表示字面文字 `&end`；未跳脫的獨立行 `&end` 仍會結束原始區塊。
- 行首的 `&kbd[Ctrl+C]` 是行內指令，不應強制當作區塊容器。

## 7. 表格

## 6.1 跨文件參照

單文件的 `&ref[id]` 由 `validateSemantics` 驗證。工具處理多份來源時，可使用 `&ref[path.sm#id]` 並將文件交給 `validateWorkspace`；路徑必須是 workspace 提供的相對 `.sm` 路徑，ID 使用 NFC 正規化後比對。不存在的文件或 ID 產生 `MMK-S005` warning，不會讓 parser 丟出例外。

### 7.1 GFM 型簡易表格

```text
| Name | Version |
|:---|---:|
| StructMark | 1.0 |
```

標頭行、分隔行與資料列；行內格式可用，但儲存格內不能直接有完整區塊。對欄數不一致發出診斷。

### 7.2 CSV / TSV

```text
&table[format=csv #tbl:projects]
Name,Version
StructMark,1.0
&end
```

CSV 在欄位中含逗號、引號或換行時遵守引號轉義規則。TSV 以 Tab 分欄。這種模式是「資料表格」，**不是**自動具備跨列、跨欄的複雜表格。

### 7.3 JSON 結構表格（正式可執行子集）

```text
&table[format=json]
{"columns":["A","B"],"rows":[[{"text":"合併欄位","colspan":2}]]}
&end
```

目前能表示及輸出基本 `colspan`、`rowspan`，並已驗證欄位數、span 範圍、跨列占位、格位重疊與缺格；仍不支援完整巢狀 StructMark 儲存格內容。

## 8. 數學與學術

```text
H_[2]O
$E=mc^[2]$

&equation[#eq:energy]
E=mc^[2]
&end

&ref[eq:energy]
[&smith2024]
[^note]

[^note]: 補充說明。
```

- 數學採 LaTeX 表示；僅對簡式 `^[...]`、`_[...]` 做有限轉換，不重新實作 LaTeX。
- 公式 ID 能供 `&ref` 引用；使用 `renderHtml(document, {numbering: true})` 時會依文件順序建立穩定公式編號。
- Citation 節點可透過 BibTeX／CSL JSON API 取得資料；`formatCitation` 與 `formatBibliography` 提供 deterministic `author-year`／`apa` 與 `ieee` profiles，不宣稱完整 APA 7／CSL 樣式引擎。
- 初步預設未來引用樣式為 APA 7；語法與排版格式分離。

## 9. Metadata

```yaml
---
title: Language Specification
lang: zh-TW
version: "1.0"
bibliography: references.bib
citation-style: apa-7
---
```

Front Matter 使用 YAML 1.2 parser。核心接受 YAML 1.2 的常用巢狀 mapping、sequence 與 block scalar；metadata 的 StructMark-specific schema 驗證仍由使用端決定。版本號等可加引號以保留字串語義。

## 10. 解析與驗證優先順序

1. 來源正規化，辨識檔首 Metadata。
2. 區塊容器與原始範圍（程式碼、註解、數學、`&...&end`）。
3. 標題、表格、引用、清單、註腳、段落。
4. 行內受保護範圍（行內程式碼、跳脫、註解、數學）。
5. Wiki、學術引用、註腳、連結、圖片、`&` 行內指令、修飾標記。
6. 屬性只附於有效 AST 節點，然後做重複 ID、未找到參照與未找到註腳的語義診斷。

HTML 輸出只使用安全白名單 URL 協定；不依據網路或 MIME 類型決定語法。輸入原始碼不會作為可執行腳本直接輸出。

## 11. 1.1 解析契約

### 11.1 原始位置

- 每個行內 AST 節點帶有 `range.start` 與 `range.end`；二者表示半開區間 `[start, end)`。
- `line`、`column` 為由 1 開始的行列，`offset` 為由 0 開始、換行正規化後的 JavaScript UTF-16 offset。
- 對清單、引用、GFM 表格中的節點，行列應反映實際來源文字而不是去縮排後的暫存字串。
- 原始輸入的 CRLF 會正規化為 LF；文件同時提供 JavaScript UTF-16 offset 與 UTF-8 byte offset 映射。

### 11.2 `&` 指令辨識

- 已註冊的 `&kbd`、`&abbr` 等屬於行內指令，即使出現在行首也不變成區塊。
- 已知區塊名稱在完整起始行且符合格式時啟動容器；未知名稱若僅有合法屬性或單獨行，也可啟動區塊但須產生診斷。
- 未知區塊指令保留內容並產生 `MMK-B013` warning；具命名空間的未知行內指令視為可擴充 `inlineDirective`，不產生語法錯誤。
- `&end` 關閉最近的開放容器。原始資料中的非跳脫 `&end` 仍具有結束作用。
- 在非原始 `&` 容器內，程式碼圍欄及多行註解中的 `&end` 不構成結束標記。

### 11.3 JSON Structured Table Schema（可執行子集）

```json
{
  "columns": ["A", "B", "C"],
  "rows": [
    [{"text":"X", "colspan":2, "rowspan":2}, "Y"],
    ["Z"]
  ]
}
```

- `columns` 必須是非空字串陣列；`rows` 必須是陣列。
- 儲存格可為字串、數字、布林值，或包含 `text` 字串的物件。
- `colspan`、`rowspan` 為大於等於 1 的整數，省略時皆為 1。
- 由左往右尋找每列尚未被 rowspan 占據的位置，向右及下占據指定格位；禁止越界、重疊與缺格。
- 受上方 rowspan 占據的位置，在後續 `rows` 中不應另外補上占位符號。
- 安全限制：欄數上限 128、列數 10,000、總格位上限 100,000；超出則診斷並拒絕渲染結構表格。
- 此階段的單一儲存格內容仍是純文字，不能以巢狀 Block AST 表示，未來需要另外設計。

### 11.4 清單容器

- 清單項目延續行須向右縮排到項目內容開始的位置，例如 `10. ` 的續行至少需要四格縮排。
- 同一種清單模式、同一縮排的相鄰項目，即使中間有空白行，也屬於同一份清單。
- 數字清單（`10. `）與自動清單（`. `）不互相混用為同一清單。
- 可放入多段落、子清單和程式碼；完整 CommonMark/GFM 相容行為不是 1.1 的承諾。
