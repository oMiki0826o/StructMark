# StructMark V1.0 詞法與來源規範

## 來源

- 輸入視為 UTF-16 JavaScript 字串；輸出 AST 的既有 `range` offset 仍是正規化 LF 後的 UTF-16 code-unit offset。
- `normalizeSource` 將 UTF-8 BOM 移除政策交由文件 parser 實作；換行統一為 LF，CRLF 視為一個換行符號。
- `normalizeSource` 額外提供 normalized UTF-16 offset ↔ original UTF-16 offset，以及 normalized text offset → original UTF-8 byte offset 的查詢。
- Unicode combining mark 不被切成語法標記；行首縮排只接受 ASCII 空格，Tab 不被轉成視覺欄位。

## 行級 Lexer

`lexLine` 將單行分類為 `heading`、`fence`、`directive`、`directiveEnd`、`list`、`quote`、`tableCandidate`、`thematicBreak`、`footnoteDefinition`、`commentFence`、`mathFence`、`blank` 或 `text`。它只辨識區塊起點，不解析行內內容；因此 `*[文字]` 仍是 `text`，由 Inline Parser 處理。

`lexDocument` 先將 CRLF／CR 正規化為 LF，再為每個 token 保留 1-based line、ASCII 空格縮排與 normalized UTF-16 `start`／`end`。圍欄內的內容仍由 Block Parser 的保護狀態處理，Lexer 不執行或解讀 raw 內容。

## 指令分類

`DirectiveRegistry` 是指令分類的唯一資料入口：

- `inline`：`&kbd[...]`、`&abbr[...]`、`&term[...]`、`&var[...]`、`&lang[...]`、`&ref[...]`。
- `block`：`&note`、`&tip`、`&warning`、`&quote`、`&example`、`&figure`、`&details`、`&definition`、`&theorem`、`&proof`。
- `rawBlock`：`&table`、`&data`、`&raw`、`&equation`。正文不再做一般區塊解析；`&end` 只在 raw 容器層級關閉。

未知指令不執行、不存取外部資源；既有 parser 保留內容並產生診斷。registry 可由上層建立副本後註冊擴充，不能覆蓋同名內建指令。

Inline Parser 同樣接受 `DirectiveRegistry`。已註冊的 inline 指令會產生語義化節點或 `InlineDirective`；未知命名空間仍保留為 `InlineDirective`。指令 schema 的未知屬性產生 `MMK-A003`，但內容與來源 range 都保留。

## 配對與恢復

`&end` 必須是最多三個 ASCII 空格後的獨立行。孤立 `&end` 產生既有 `MMK-B011`，並只消耗該行；後續文件照常解析。未閉合區塊產生 `MMK-B010`，診斷範圍從開啟指令開始，不吞掉文件外的後續輸入。
