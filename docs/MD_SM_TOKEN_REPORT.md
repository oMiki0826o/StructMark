# Markdown 與 StructMark（`.sm`）比較報告

日期：2026-10-12  
範圍：只比較 Markdown（`.md`）與 StructMark（`.sm`），不包含 `@Doc`。

## 結論

本次使用真實 `tiktoken` tokenizer 測試 16 組語義對照語料：

| Tokenizer | Markdown | StructMark | 差異 | StructMark 節省 |
| --- | ---: | ---: | ---: | ---: |
| `cl100k_base` | 517 | 526 | +9 | -1.74% |
| `o200k_base` | 405 | 414 | +9 | -2.22% |

在通過 AST 對照的共同語義子集中，`.sm` 分別多 9 Token。這代表目前語料沒有顯示 Token 優勢；網站與 README 不應把 Token 節省當成主要賣點。

## 測試方式

語料來源：[`benchmark/corpus.json`](../benchmark/corpus.json)  
逐筆結果：[`benchmark/results.csv`](../benchmark/results.csv)  
執行環境與語料雜湊：[`benchmark/results.metadata.json`](../benchmark/results.metadata.json)
執行指令：

```sh
python3 benchmark/tokens.py --require-tokenizer
```

使用的 tokenizer：

- `cl100k_base`
- `o200k_base`

比較欄位包含字元數、UTF-8 位元組數與 tokenizer 實際產生的 Token 數。字元數和位元組數只作為輔助資料，不當作 Token 數。

本次執行使用 `tiktoken 0.14.0`、Python 3.11.9；最新語料 SHA-256 與完整環境資料見 `benchmark/results.metadata.json`。腳本會檢查語料為非空集合、必要欄位完整、ID 不重複，避免基準資料悄悄失真。

## 逐筆結果

| 案例 | `cl100k` Markdown | `cl100k` `.sm` | `o200k` Markdown | `o200k` `.sm` |
| --- | ---: | ---: | ---: | ---: |
| basic | 21 | 23 | 16 | 18 |
| inline | 10 | 10 | 9 | 9 |
| math | 16 | 16 | 15 | 15 |
| heading | 24 | 24 | 18 | 18 |
| images | 9 | 9 | 9 | 9 |
| list | 17 | 17 | 15 | 15 |
| table | 16 | 16 | 16 | 16 |
| quote | 15 | 15 | 13 | 13 |
| note | 10 | 10 | 8 | 8 |
| citation | 14 | 14 | 10 | 10 |
| technical | 52 | 53 | 39 | 40 |
| academic | 83 | 85 | 56 | 58 |
| api | 50 | 51 | 42 | 43 |
| math-notes | 45 | 46 | 39 | 40 |
| article | 91 | 92 | 59 | 60 |
| structured-data | 44 | 45 | 41 | 42 |

擴充語料包含 `technical`、`academic`、`api`、`math-notes`、`article` 與 `structured-data` 六類較完整文件案例；逐筆 Token 與字元資料以 CSV 為準。

## 解讀

`.sm` 的主要優勢不是把所有 Markdown 符號換成更短的符號，而是把標題層級、指令區塊、屬性與結構化內容用固定語法表達。當文件包含數學、清單、提示區塊或其他結構時，這些明確語法比較容易維持穩定的 AST、診斷與工具整合。

因此目前較準確的說法是：

> StructMark 在目前 16 組共同語義 `.md`／`.sm` 語料中沒有顯示 Token 優勢；實際差異取決於文件內容與所使用的 tokenizer。

本報告沒有納入 `@Doc`，也沒有將未經 parser 驗證的第三方格式比較寫成結論。`npm run benchmark:semantic` 會直接讀取每筆原始 Markdown 與 `.sm`，分別解析後做規範化 AST 比較；目前 16/16 通過，結果見 `benchmark/semantic-equivalence.json`。

## 失敗案例與下一階段

本次基準沒有 tokenizer 執行失敗、語料結構檢查失敗或 AST 對照失敗案例。這項 AST 檢查驗證的是 StructMark 已支援的 Markdown 匯入子集，不等於完整 CommonMark 等價。

下一階段仍應加入更長的真實文件與固定 AST fixture；新增語料後，必須重新產生 CSV、metadata 與本報告，才能更新效能結論。
