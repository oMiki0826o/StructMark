# StructMark Token 測試與優化規劃

本文件是導覽頁, 唯一的最新 Token 數據以 [MD_SM_TOKEN_REPORT.md](./MD_SM_TOKEN_REPORT.md)、`benchmark/results.csv` 與 `benchmark/results.metadata.json` 為準.

## 目前結果

測試只比較 `.md` 與 `.sm`, 不包含 `@Doc`.

| Tokenizer | Markdown | StructMark | 差異 |
| --- | ---: | ---: | ---: |
| `cl100k_base` | 517 | 526 | +9 |
| `o200k_base` | 405 | 414 | +9 |

16 組原始語料的 AST 對照為 16/16 通過. 目前結果不能支持 StructMark 比 Markdown 更省 Token 的結論.

## 可重現指令

```bash
npm run benchmark:semantic
python3 benchmark/tokens.py --require-tokenizer
```

Benchmark 會檢查語料欄位、重複 ID、AST 對照、tokenizer、環境版本與語料 SHA-256.

## 優化原則

### Canonical

給人閱讀、編輯與版本控制. 優先考慮語法清楚、穩定 diff 與確定性 AST.

### Compact

給機器交換或 AI 輸入. 應由語義 AST 產生, 並通過重新解析後的語義相等測試. 不應修改現有 Canonical Formatter 的職責.

### Context

給 AI 問答與 Agent. 先從文件索引擷取必要章節與參照, 再計算 Token budget. 只縮短符號而把整份無關文件送入模型, 不是有效的上下文優化.

## 下一階段

1. 建立 v2 專用 Semantic IR, 讓 v2 Parser 與 Markdown 匯入器使用同一套比較語義.
2. 為 v2 原生表格、Schema、CSV/TSV 與資料列建立獨立 benchmark.
3. 新增 Compact Serializer, 驗證 `parse(serialize(AST, profile))` 的語義不變.
4. 延伸 Workspace Index, 建立章節、參照、Schema 與來源位置索引.
5. 在索引基礎上建立 Context Extractor 與 Token budget.

在有可重現數據前, 不新增只為縮短字元而設計的單字母指令, 也不宣稱任何固定 Token 節省比例.
