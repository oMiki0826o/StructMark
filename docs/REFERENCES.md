# 設計參考資料

以下為 StructMark 設計與實作時的重要公開原始規格，供後續逐項對照，不代表 StructMark 宣稱符合全部規格。

| 專案／標準 | 連結 | 參考內容 |
|---|---|---|
| CommonMark | https://spec.commonmark.org/0.31.2/ | 區塊及行內文法、列表容器、來源位置、跳脫 |
| GitHub Flavored Markdown | https://github.github.com/gfm/ | Pipe Table、Task List、語法擴充的定義方式 |
| Pandoc Markdown | https://pandoc.org/MANUAL.html | 引文、Metadata、表格、數學與文件轉換 |
| MyST | https://mystmd.org/guide/syntax-overview | Directive、Figure、學術文件與交叉參照 |
| Djot | https://djot.net/ | 行內語法簡潔度與消除歧義的設計取捨 |
| AsciiDoc | https://docs.asciidoctor.org/asciidoc/latest/tables/table-ref/ | 表格資料格式、儲存格合併與欄位屬性 |
| CSL | https://citationstyles.org/ | 文獻引用樣式的標準化表示 |
| AtDoc | https://github.com/WEDC-Studio-Official/AtDoc | 明確結構節點的語法設計與解析器規劃 |
| YAML | https://yaml.org/spec/1.2.2/ | 完整 Front Matter 格式的後續驗證依據 |
| OpenAI tiktoken | https://github.com/openai/tiktoken | 實際 tokenizer 基準測試 |

StructMark V1.0 的 Parser 未聲稱與上述任一語言的完整 AST、Token 數或語法完全相容。
