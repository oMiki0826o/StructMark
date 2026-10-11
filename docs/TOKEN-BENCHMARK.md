# StructMark Token 測試紀錄與優化規劃

## 文件目的

本文件記錄 StructMark 與 Markdown 的 Token 對照測試, 並整理降低複雜文件 Token 消耗的後續規劃。

Token 數量會受到 tokenizer、語言、文件內容與標記方式影響。以下結果只能代表指定語料與 tokenizer 的實測, 不代表所有文件都一定更省。

## 測試環境

- Tokenizer: `cl100k_base`
- Tokenizer: `o200k_base`
- 工具: Python `tiktoken`
- 對照格式: Markdown 與 StructMark
- 測試範圍: 基本文字、行內格式、數學、標題、圖片、清單、表格、引用、提示區塊與學術引用

## 官方基準語料結果

| 類型 | cl100k Markdown | cl100k `.sm` | o200k Markdown | o200k `.sm` |
| --- | ---: | ---: | ---: | ---: |
| 基本文字 | 29 | 31 | 22 | 24 |
| 行內格式 | 16 | 14 | 15 | 13 |
| 數學 | 23 | 20 | 23 | 20 |
| 標題 | 24 | 24 | 18 | 18 |
| 圖片 | 13 | 13 | 13 | 13 |
| 清單 | 22 | 20 | 20 | 18 |
| 表格 | 16 | 16 | 16 | 16 |
| 引用 | 15 | 13 | 13 | 13 |
| 提示區塊 | 15 | 14 | 13 | 10 |
| 學術引用 | 14 | 14 | 10 | 10 |
| **總計** | **187** | **181** | **163** | **155** |

### 結果

- `cl100k_base`: StructMark 少 6 tokens, 約少 3.2%。
- `o200k_base`: StructMark 少 8 tokens, 約少 4.9%。
- 行內格式、數學、清單、引用與提示區塊是目前較有優勢的項目。
- 基本文字在這組語料中反而多 2 tokens。
- 標題、圖片、表格與學術引用在這組語料中沒有差異。

## 複合文件測試

第二組測試包含標題、行內格式、`&note`、學術引用與 CSV 表格。

| Tokenizer | Markdown | StructMark | 差異 | StructMark 比例 |
| --- | ---: | ---: | ---: | ---: |
| `cl100k_base` | 114 | 127 | +13 | 111.4% |
| `o200k_base` | 85 | 97 | +12 | 114.1% |

### 造成增加的原因

目前完整區塊語法會增加：

```sm
&note[title="提示"]
內容
&end
```

以及：

```sm
&table[format=csv]
Name,Version
StructMark,1.6
&end
```

增加的內容主要來自：

- 指令名稱
- 屬性名稱
- `title="..."`
- `format=...`
- 區塊結束標記

## 目前已支援的簡化語法

目前 registry 已有以下別名:

```text
&n  = &note
&w  = &warning
&t  = &test
&e  = &end
```

例如:

```sm
&n[title="提示"]
內容
&e
```

等同於:

```sm
&note[title="提示"]
內容
&end
```

`&t` 已經代表 `&test`, 因此不能再拿來代表 `&table`。

## Token 優化規劃

### 第一階段: 完善現有別名

- 補齊 `&n`、`&w`、`&t`、`&e` 的語法文件。
- 為每個別名補上 AST 等價性測試。
- 確認完整語法與簡化語法產生完全相同的 AST。
- 在錯誤訊息中顯示展開後的正式指令名稱。

### 第二階段: 新增表格簡寫

由於 `&t` 已被使用, 表格可以採用不衝突的 `&tbl`:

```sm
&tbl[csv]
Name,Version
StructMark,1.6
&e
```

等同於:

```sm
&table[format=csv]
Name,Version
StructMark,1.6
&end
```

JSON 與 TSV 也可以使用相同形式:

```sm
&tbl[json]
{"columns":["Name"],"rows":[["StructMark"]]}
&e
```

這項功能尚未實作, 目前只是規劃。

### 第三階段: 屬性值簡寫

目前:

```sm
&note[title="補充資訊"]
```

可規劃為:

```sm
&n["補充資訊"]
```

目前:

```sm
&table[format=csv]
```

可規劃為:

```sm
&tbl[csv]
```

簡寫應該只在 parser 前端展開, AST 與 renderer 不應增加另一套語義。

### 第四階段: 保留低冗餘資料格式

大量資料應優先使用 CSV 或 TSV:

```sm
&tbl[csv]
Name,Version
StructMark,1.6
&e
```

JSON 適合需要 `colspan`、`rowspan` 或其他結構化欄位的資料, 不應為了追求 Token 數量而取代所有格式。

### 第五階段: 建立完整回歸基準

後續基準測試應包含:

1. 完整語法與現有簡化語法。
2. 新增表格簡寫前後的差異。
3. CSV、TSV 與 JSON 的對照。
4. 短文件、中型文件與大型文件。
5. 中文、英文與混合語言。
6. `cl100k_base` 與 `o200k_base`。
7. Token 數量、字元數、UTF-8 位元組數與解析診斷。

驗證條件:

- 簡單文件不應因使用 StructMark 而大幅增加 Token。
- 常見提示區塊應比完整寫法更短。
- 結構化表格應提供簡潔寫法, 但不能犧牲資料驗證。
- 所有簡化寫法都必須與完整寫法產生相同 AST。
- 測試結果必須區分「實測結果」與「設計目標」。

## 結論

目前實測顯示, StructMark 在官方基準語料中比 Markdown 少約 3.2% 至 4.9% Token, 但在包含複雜提示區塊與 CSV 表格的複合文件中多約 11.4% 至 14.1%。

因此目前最準確的產品描述是:

> StructMark 透過簡潔標記與結構化語法, 降低常見文件中的標記冗餘與 Token 消耗, 並提供簡化語法在可讀性與資料結構之間取得平衡。

不能宣稱 StructMark 在所有文件中都比 Markdown 更省 Token。

## 執行測試

在專案根目錄執行:

```bash
python3 benchmark/tokens.py --require-tokenizer
```

測試結果會寫入:

```text
benchmark/results.csv
```
