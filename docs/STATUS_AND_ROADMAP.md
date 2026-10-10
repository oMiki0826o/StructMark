# StructMark 1.1 開發狀態與後續規劃

本頁依**實際程式**區分完成、部分完成與未支援。StructMark 1.1 是目前穩定的語言核心版本；`.sm` 是正式副檔名，`&name[attrs]` 與 `&name [attrs]`、官方短別名、診斷代碼與相容性承諾已定稿於 `docs/SPECIFICATION.md`。目前工作完全不包含編輯器。

| 系統 | 目前程度 | 尚缺內容 |
|---|---|---|
| 標題 `#1`～`#6`、`(#id)` | 1.1 穩定 | 不承諾 CommonMark 全部方言 |
| Compact 行內格式、上下標 | 1.1 穩定 | 複雜數學巨集由可選 renderer 處理 |
| 行內位置與區間 | 已覆蓋行內 AST | CRLF 原始 offset 對映、UTF-8 位元組位址 |
| `&` 行內／區塊指令 | 基礎 registry/schema 可用 | 行內 parser 完整 registry 注入、擴充啟用流程 |
| 清單、`.` 自動編號、任務 | 改進完成主要案例 | 完整 CommonMark 等級容器與縮排文法 |
| 圖片、連結、Wiki | 基礎解析 | 跨檔索引、資源管理 |
| GFM Pipe Table | 基礎可用 | 無標頭表格、區塊儲存格、全部邊界 |
| CSV、TSV | 解析與驗證可用 | 更完整的標準相容案例與大型資料測試 |
| JSON 表格格位占用 | 驗證可用 | 巢狀 StructMark 儲存格、圖說／語義資料型別 |
| Front Matter | YAML 1.2 parser | Metadata Schema 與更完整的 StructMark-specific validation |
| `&equation`、`$...$` | TeX source 與可選 KaTeX HTML | 完整 LaTeX macro/schema 驗證與樣式控制 |
| `[&key]`、註腳 | 建立 AST 節點 | BibTeX、CSL、APA 7 真正格式化 |
| 交叉參照語義驗證 | 基礎可用 | 圖表自動編號、跨文件參照 |
| HTML Renderer | 基礎安全輸出 | 進階語義呈現、樣式、更多格式 |
| Markdown 匯入／匯出 | 已支援文件化 common subset | 不承諾完整 CommonMark/GFM 等價 |
| Round-trip Writer / Formatter | 已支援安全邊界正規化 | 不改寫 raw/data/code/未知區塊 |
| 大規模 Token 基準 | 真實 tokenizer CI 基準 | tokenizer 版本與語料會隨 CI 更新 |

## 1.1 已完成的核心工作

目前已完成：正式 `.sm` 副檔名與 `&` 指令規範、行級 Lexer、Block/Inline Parser 的 Registry 注入、預設指令 Registry、可注入自訂指令、Unicode NFC ID、跨文件 workspace 驗證、YAML 1.2、BibTeX／CSL JSON 資料 API、可選 KaTeX、圖表公式編號、Markdown common subset 轉換、保守 Formatter、來源 offset 對映、穩定 AST JSON 序列化、效能／token／fuzz 測試與 CI。

## 後續規劃（非 1.1 相容性承諾）

1. 完整 CommonMark/GFM 容器等價與更多縮排邊界案例。
2. 完整 CSL 樣式引擎與完整 LaTeX schema 驗證。
3. 更多 renderer、語言伺服器與編輯器整合；這些不屬於語言核心 1.1。
