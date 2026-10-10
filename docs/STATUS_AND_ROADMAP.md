# StructMark V1.0 開發狀態與後續規劃

本頁依**實際程式**區分完成、部分完成與尚未支援。StructMark V1.0 是可使用的語言核心版本；進階轉換與完整外部格式相容性仍列為後續規劃。目前工作完全不包含編輯器。

| 系統 | 目前程度 | 尚缺內容 |
|---|---|---|
| 標題 `#1`～`#6`、`(#id)` | 可用原型 | Unicode ID 正規化、全部語法邊界 |
| Compact 行內格式、上下標 | 可用原型 | 更完整的巢狀合法性、詞法邊界 |
| 行內位置與區間 | 已覆蓋行內 AST | CRLF 原始 offset 對映、UTF-8 位元組位址 |
| `&` 行內／區塊指令 | 基礎 registry/schema 可用 | 行內 parser 完整 registry 注入、擴充啟用流程 |
| 清單、`.` 自動編號、任務 | 改進完成主要案例 | 完整 CommonMark 等級容器與縮排文法 |
| 圖片、連結、Wiki | 基礎解析 | 跨檔索引、資源管理 |
| GFM Pipe Table | 基礎可用 | 無標頭表格、區塊儲存格、全部邊界 |
| CSV、TSV | 解析與驗證可用 | 更完整的標準相容案例與大型資料測試 |
| JSON 表格格位占用 | 驗證可用 | 巢狀 StructMark 儲存格、圖說／語義資料型別 |
| Front Matter | YAML 子集 | 完整 YAML 1.2 與 Schema |
| `&equation`、`$...$` | 保留／簡寫可用 | 完整 LaTeX 處理、公式編號與排版 |
| `[&key]`、註腳 | 建立 AST 節點 | BibTeX、CSL、APA 7 真正格式化 |
| 交叉參照語義驗證 | 基礎可用 | 圖表自動編號、跨文件參照 |
| HTML Renderer | 基礎安全輸出 | 進階語義呈現、樣式、更多格式 |
| Markdown 匯入／匯出 | 尚未支援 | 獨立轉換器與資訊流失報告 |
| Round-trip Writer / Formatter | 尚未支援 | 無損來源保留、Canonical Writer |
| 大規模 Token 基準 | 部分工具 | tiktoken 實測、更多語料與跨語系分析 |

## V1.0 後續規劃

目前已完成：行級 Lexer、Block/Inline Parser 的 Registry 注入、預設指令 Registry、可注入自訂指令、通用 `id`/`class` 屬性與指令專屬屬性診斷、來源 offset 對映、穩定 AST JSON 序列化、V1.0 回歸與符合性測試。

**P0 — 文法穩定性**

1. 完整 Lexer / Block Parser / Inline Parser 分層，設計明確的 token 分類、容器狀態與錯誤恢復機制。
2. 明確整理 `&` 指令的 inline/block 註冊表、屬性 Schema、未知類型與完整跳脫規則。
3. 完整清單容器規格：懸掛縮排、空行、引用、程式碼與表格交叉巢狀的判定。
4. 補齊原始 CRLF 與 UTF-8 Byte Offset、Unicode 組合字元之間的來源對應（若有必要）。
5. 建立真正的語法符合性測試與 Round-trip Snapshot，對語法的改動要求提供新案例。

**P1 — 文件語義**

6. 對 Metadata、屬性及資料表格採用明確 Schema，決定哪些欄位有效、哪些輸出規則可擴充。
7. 進一步設計「儲存格內容是完整文件區塊」的結構化表格語法，避免只用 JSON 字串假裝完整排版能力。
8. 完成文獻引用資料解析（BibTeX／CSL JSON）與 CSL 引用引擎介接，不自行重做 APA。
9. 研究章節、圖、表、公式的自動編號與合法參照輸出。
10. 開始 Markdown 基本功能轉換，清楚記錄 `- [x]` 與 `- [o]` 等差異。

**P2 — 性能與發布**

11. 使用真實 tokenizer 評量繁體中文、英文、日文、README、技術和學術文件。
12. 測試更長文件、惡意巢狀、多平台環境的效能與記憶體。
13. 規格確定後再討論副檔名及 V1.0 的相容性承諾。
