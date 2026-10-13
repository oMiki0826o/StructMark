# 分層 `.md`／`.sm` Token 比較

執行：`npm run benchmark:scaled`。語料包含一般文章、技術文件、學術內容、API、數學、表格與提示區塊；每類分短、中、長，並各有低／高複雜度。每筆同時產生 Markdown、完整 `.sm`、簡化 `.sm` 三種表示，使用相同內容比較。

## 總結果

| Tokenizer | `.md` | 完整 `.sm` | 簡化 `.sm` | 完整相對 `.md` | 簡化相對 `.md` |
| --- | ---: | ---: | ---: | ---: | ---: |
| `cl100k_base` | 14,591 | 14,956 | 14,786 | +365（+2.50%） | +195（+1.34%） |
| `o200k_base` | 11,650 | 11,845 | 11,675 | +195（+1.67%） | +25（+0.21%） |

## 解讀

在這批更廣泛的語料中，完整 `.sm` 仍沒有整體 Token 優勢；簡化 `.sm` 已將差距大幅縮小，尤其在 `o200k_base` 下只多 25 Token。這表示簡化語法有效，但尚不足以證明 `.sm` 普遍低於 `.md`。

不同類型、長度與複雜度的逐筆結果見 [`benchmark/scaled-results.csv`](../benchmark/scaled-results.csv)，彙總見 [`benchmark/scaled-summary.json`](../benchmark/scaled-summary.json)。這是合成但可重現的壓力語料，不取代未來的真實專案文件測試。
