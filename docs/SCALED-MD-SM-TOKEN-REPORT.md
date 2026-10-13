# 分層 `.md`／`.sm` Token 比較

執行：`npm run benchmark:scaled`。語料包含一般文章、技術文件、學術內容、API、數學、表格與提示區塊；每類分短、中、長，並各有低／高複雜度。每筆同時產生 Markdown、完整 `.sm`、簡化 `.sm` 三種表示，使用相同內容比較。

## 總結果

| Tokenizer | `.md` | 完整 `.sm` | 簡化 `.sm` | 完整相對 `.md` | 簡化相對 `.md` |
| --- | ---: | ---: | ---: | ---: | ---: |
| `cl100k_base` | 14,591 | 15,228 | 15,058 | +637（+4.37%） | +467（+3.20%） |
| `o200k_base` | 11,650 | 12,117 | 11,947 | +467（+4.01%） | +297（+2.55%） |

## 解讀

在修正表格資料列遺失後，完整 `.sm` 與簡化 `.sm` 的成本都上升；完整 `.sm` 仍沒有整體 Token 優勢。簡化語法相對完整語法固定少 170 Token，但在這批語料中仍高於 `.md`。這表示簡化語法有效，但尚不足以證明 `.sm` 普遍低於 `.md`。

不同類型、長度與複雜度的逐筆結果見 [`benchmark/scaled-results.csv`](../benchmark/scaled-results.csv)，彙總見 [`benchmark/scaled-summary.json`](../benchmark/scaled-summary.json)。這是合成但可重現的壓力語料，不取代未來的真實專案文件測試。
