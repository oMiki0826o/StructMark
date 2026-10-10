# V1.1 Stability Maintenance

本文件說明 V1.1 語法不變的可靠性修正。修改以降低資料遺失、語義誤判與位置對映錯誤為優先。

## 已處理

| 範圍 | 修正 | 回歸測試 |
| --- | --- | --- |
| Source mapping | 正確計算 astral Unicode 字元的 UTF-8 byte offset；保留 UTF-16 位置 API | Emoji、BOM、CRLF |
| Inline positions | 預先建立行起點索引，避免每次定位重複切割來源 | 多行行內格式的 line/column/offset |
| Markdown import | 保留原樣 tilde/backtick fences、隔離 code span | `~~~js`、`` `**x**` `` |
| Markdown export | 動態 code fence、有序清單遞增、語義降級警告 | 反引號、Directive |
| HTML | 巢狀 `renderInline` 傳遞編號 Context | 粗體中的 `&ref` |
| Reference validation | 外部 `.sm#id` 只由 workspace 驗證 | valid cross-file reference |
| Pipe tables | 偵測多反引號 Code Span，避免內部 `\|` 被誤判 | ``a|b`` |
| YAML | 重複 metadata keys 產生錯誤 | duplicate `title` |
| Unicode identifiers | 帶 combining marks 的 ID 正規化為 NFC | `e` + combining acute |

## 尚未涵蓋

Markdown 完整 CommonMark / GFM 轉換、CSL 完整樣式引擎、LSP、增量解析和全部巢狀表格／清單邊界仍不在此修補版範圍。`toMarkdownDetailed` 只會針對遇到的 Directive 顯示降級診斷，並不表示其他所有非等價語法已可精確偵測。

這些變更應與上游完整測試、Fuzz 和效能測試一起驗證後，再考慮正式發布。
