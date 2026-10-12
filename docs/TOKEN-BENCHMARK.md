# StructMark Token 測試與優化規劃

本文件是導覽頁. `.md`／`.sm` 的最新數據以 [MD_SM_TOKEN_REPORT.md](./MD_SM_TOKEN_REPORT.md)、`benchmark/results.csv`、`benchmark/summary.json` 與 `benchmark/results.metadata.json` 為準；三方數據則以 `benchmark/three-way-summary.json` 與 `benchmark/three-way-results.csv` 為準.

## 目前結果

測試只比較 `.md` 與 `.sm`, 不包含 `@Doc`.

| Tokenizer | Markdown | StructMark | 差異 |
| --- | ---: | ---: | ---: |
| `cl100k_base` | 517 | 526 | +9 |
| `o200k_base` | 405 | 414 | +9 |

16 組原始語料的 AST 對照為 16/16 通過. 目前結果不能支持 StructMark 比 Markdown 更省 Token 的結論.

## 三方比較：Markdown、AtDoc、StructMark

使用同一批 16 組 Markdown 語料：Markdown 保留原文，AtDoc 由 AtDoc 的 `convertMarkdownToAtDoc` 產生，StructMark 使用 benchmark 中的原始 `.sm`。AtDoc 產生後再交給 AtDoc parser 重新解析；本次 16/16 通過且沒有診斷。

| Tokenizer | Markdown | AtDoc | StructMark | 最短 → 最長 |
| --- | ---: | ---: | ---: | --- |
| `cl100k_base` | 517 | 625 | 526 | Markdown → StructMark → AtDoc |
| `o200k_base` | 405 | 514 | 414 | Markdown → StructMark → AtDoc |

這不是「所有文件」的普遍結論，也不是 AtDoc 的完整語法能力比較：AtDoc 端是由 Markdown importer 產生的共同語義子集。它能回答目前這批相同內容的 Token 成本，但不能代表使用 AtDoc 原生元件、或 StructMark 原生 Schema／資料表示時的成本。

可重跑三方測試：

```bash
npm run build
ATDOC_DIST=/path/to/AtDoc/dist npm run benchmark:three-way
python3 benchmark/three-way-tokens.py --require-tokenizer
```

`three-way.mjs` 的 AtDoc 路徑必須指向已建置的 AtDoc `dist` 目錄；這避免偷偷使用不同版本的 parser。正式結果會記錄 AtDoc 轉換驗證、tokenizer 版本、平台與語料 SHA-256。

## 可重現指令

```bash
npm run benchmark:semantic
python3 benchmark/tokens.py --require-tokenizer
```

Benchmark 會檢查語料欄位、重複 ID、AST 對照、tokenizer、環境版本與語料 SHA-256.

執行後會另外產生 `benchmark/summary.json`，集中記錄總 Token、差異、相對比例，以及 StructMark 在逐筆案例中較短或相同的數量。報告不以字元數推論 Token 優勢。

## AtDoc 參考後採用的量測原則

本專案參考 AtDoc 提出的分層 Benchmark 方法，但只把可在本機重現的部分納入正式結果：

- **正確性獨立量測**：先確認 `.md` 與 `.sm` 解析後的語義等價，再比較 Token。
- **效率分開記錄**：字元、UTF-8 位元組與 tokenizer Token 不混為同一指標。
- **可重現性完整記錄**：保存 tokenizer、套件版本、Python／平台資訊與語料 SHA-256。
- **逐筆而非只看總和**：保留每個案例的差異，才能找出真正造成成本的語法。
- **限制先寫清楚**：AtDoc 文件本身將 Cloudflare、Colab 與模型測試列為後續階段；本專案不把未執行的測試寫成結果，也不把 AtDoc 當作 StructMark 的 Token 對照格式。

這讓優化方向從「縮短符號」改成可驗證的問題：哪一類文件、哪一種 tokenizer、在多少資料量後才值得使用結構化表示。

## 優化原則

### Canonical

給人閱讀、編輯與版本控制. 優先考慮語法清楚、穩定 diff 與確定性 AST.

### Compact

給機器交換或 AI 輸入. 應由語義 AST 產生, 並通過重新解析後的語義相等測試. 不應修改現有 Canonical Formatter 的職責.

### Context

給 AI 問答與 Agent. 先從文件索引擷取必要章節與參照, 再計算 Token budget. 只縮短符號而把整份無關文件送入模型, 不是有效的上下文優化.

## 下一階段

1. 建立 v2 專用 Semantic IR, 讓 v2 Parser 與 Markdown 匯入器使用同一套比較語義.
2. 為 v2 原生表格、Schema、CSV/TSV 與資料列建立獨立 benchmark, 並計算 Schema 的損益平衡點.
3. 新增 Compact Serializer, 驗證 `parse(serialize(AST, profile))` 的語義不變.
4. 延伸 Workspace Index, 建立章節、參照、Schema 與來源位置索引.
5. 在索引基礎上建立 Context Extractor 與 Token budget.

在有可重現數據前, 不新增只為縮短字元而設計的單字母指令, 也不宣稱任何固定 Token 節省比例.
