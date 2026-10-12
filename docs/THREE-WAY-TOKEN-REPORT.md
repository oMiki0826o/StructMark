# Markdown、AtDoc 與 StructMark 三方 Token 報告

## 結果

本次使用 16 組共同語義案例與 `tiktoken 0.14.0`：

| Tokenizer | Markdown | AtDoc | StructMark |
| --- | ---: | ---: | ---: |
| `cl100k_base` | 517 | 625 | 526 |
| `o200k_base` | 405 | 514 | 414 |

排名在兩種 tokenizer 都相同：`Markdown < StructMark < AtDoc`。

相較 Markdown：

- StructMark：兩種 tokenizer 都多 9 Token。
- AtDoc：`cl100k_base` 多 108 Token，`o200k_base` 多 109 Token。

## 測試可信度

- 共 16 組案例。
- Markdown 與 StructMark 的原始語料直接比較，原有語義等價測試為 16/16。
- AtDoc 由 AtDoc 官方 importer 從同一份 Markdown 產生，再由 AtDoc parser 重新解析；16/16 無診斷。
- Token 數由真實 `cl100k_base` 與 `o200k_base` tokenizer 計算。
- 完整逐筆結果見 [`benchmark/three-way-results.csv`](../benchmark/three-way-results.csv)。
- 產生資料與環境見 [`benchmark/three-way-summary.json`](../benchmark/three-way-summary.json) 和 [`benchmark/three-way-validation.json`](../benchmark/three-way-validation.json)。

## 正確解讀

這份測試只表示目前共同語義子集的來源成本。AtDoc 在這批案例中因完整節點名稱、括號參數與段落包裝而較長；StructMark 則介於兩者之間。這不能推論 AtDoc 或 StructMark 在所有原生功能、長表格、Schema、資料列或 AI 上下文擷取上都必然較差。

因此目前最可靠的產品說法是：StructMark 的主要價值仍是可驗證的結構與工具整合；在這批三方共同語料中，它比 AtDoc 短，但尚未比 Markdown 短。

## 限制

AtDoc 端不是人工撰寫的完整 AtDoc 語料，而是由 Markdown importer 轉出的可解析結果。下一階段若要比較原生能力，應另建三方人工對照案例，並為每個案例保存三種語言各自的語義 fixture。
