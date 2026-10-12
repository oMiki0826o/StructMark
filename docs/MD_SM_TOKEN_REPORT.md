# Markdown 與 StructMark（`.sm`）比較報告

日期：2026-10-12  
範圍：只比較 Markdown（`.md`）與 StructMark（`.sm`），不包含 `@Doc`。

## 結論

本次使用真實 `tiktoken` tokenizer 測試 10 組語義對照語料：

| Tokenizer | Markdown | StructMark | 差異 | StructMark 節省 |
| --- | ---: | ---: | ---: | ---: |
| `cl100k_base` | 187 | 181 | -6 | 3.21% |
| `o200k_base` | 163 | 155 | -8 | 4.91% |

在這份語料中，`.sm` 的總 Token 數較少；但優勢不是每個小範例都成立。語法相同的表格、引用、圖片與部分標題，兩者 Token 數相同；簡單標題範例中 Markdown 反而少 2 Token。因此不能把結果宣稱成所有文件都一定節省。

## 測試方式

語料來源：[`benchmark/corpus.json`](../benchmark/corpus.json)  
逐筆結果：[`benchmark/results.csv`](../benchmark/results.csv)  
執行指令：

```sh
python3 benchmark/tokens.py --require-tokenizer
```

使用的 tokenizer：

- `cl100k_base`
- `o200k_base`

比較欄位包含字元數、UTF-8 位元組數與 tokenizer 實際產生的 Token 數。字元數和位元組數只作為輔助資料，不當作 Token 數。

## 逐筆結果

| 案例 | `cl100k` Markdown | `cl100k` `.sm` | `o200k` Markdown | `o200k` `.sm` |
| --- | ---: | ---: | ---: | ---: |
| basic | 29 | 31 | 22 | 24 |
| inline | 16 | 14 | 15 | 13 |
| math | 23 | 20 | 23 | 20 |
| heading | 24 | 24 | 18 | 18 |
| images | 13 | 13 | 13 | 13 |
| list | 22 | 20 | 20 | 18 |
| table | 16 | 16 | 16 | 16 |
| quote | 15 | 15 | 13 | 13 |
| note | 15 | 14 | 13 | 10 |
| citation | 14 | 14 | 10 | 10 |

## 解讀

`.sm` 的主要優勢不是把所有 Markdown 符號換成更短的符號，而是把標題層級、指令區塊、屬性與結構化內容用固定語法表達。當文件包含數學、清單、提示區塊或其他結構時，這些明確語法比較容易維持穩定的 AST、診斷與工具整合。

因此目前較準確的說法是：

> StructMark 在這組 10 筆 `.md`／`.sm` 對照語料與兩種真實 tokenizer 下，總 Token 數較低；實際差異取決於文件內容與所使用的 tokenizer。

本報告沒有納入 `@Doc`，也沒有將未經 parser 驗證的第三方格式比較寫成結論。
