/*
 * File: playground-examples.ts
 * Modification: 2026-10-11 — 實際可解析的中英文 .sm Playground 範例。
 */
export interface PlaygroundExample {readonly id:string;readonly title:string;readonly source:string;}

// ── 文件來源預設值 ──
export const playgroundExamples: Record<'zh-tw' | 'en', readonly PlaygroundExample[]> = {
  'zh-tw': [
    {id:'start',title:'快速開始',source:'#1 StructMark Playground\n\n這是一份可以編輯的文件。\n\n*[粗體]、/[斜體]、=[重點]。'},
    {id:'inline',title:'行內格式',source:'#1 行內語法\n\n*[粗體]、/[斜體]、~[刪除線] 與 =[螢光]。\n\nH_[2]O 與 x^[2]。'},
    {id:'lists',title:'巢狀清單',source:'#1 清單範例\n\n- 第一項\n  - 內層內容\n- 第二項\n\n1. 開始\n2. 完成'},
    {id:'directives',title:'語意指令',source:'#1 指令範例\n\n&note[title="提示"]\n這裡是補充說明。\n&end\n\n&warning\n這裡需要留意。\n&end'},
    {id:'table',title:'表格資料',source:'#1 表格\n\n| 名稱 | 值 |\n| --- | --- |\n| StructMark | 1.3 |\n| 副檔名 | .sm |'},
    {id:'references',title:'參照與註腳',source:'#1 第一節 (#intro)\n\n請參考 &ref[intro]。\n\n這是一段附有註腳的文字[^1]。\n\n[^1]: 註腳說明。'},
    {id:'math',title:'數學公式',source:'#1 數學\n\n$x^[2] + y^[2] = z^[2]$\n\n$$\nE = mc^2\n$$'},
  ],
  en: [
    {id:'start',title:'Getting started',source:'#1 StructMark Playground\n\nThis document is editable.\n\n*[Bold], /[italic], and =[highlight].'},
    {id:'inline',title:'Inline formatting',source:'#1 Inline syntax\n\n*[Bold], /[italic], ~[deleted], and =[highlight].\n\nH_[2]O and x^[2].'},
    {id:'lists',title:'Nested lists',source:'#1 List example\n\n- First item\n  - Nested content\n- Second item\n\n1. Begin\n2. Finish'},
    {id:'directives',title:'Semantic directives',source:'#1 Directives\n\n&note[title="Note"]\nAdditional context.\n&end\n\n&warning\nPay attention to this.\n&end'},
    {id:'table',title:'Table data',source:'#1 Table\n\n| Name | Value |\n| --- | --- |\n| StructMark | 1.3 |\n| Extension | .sm |'},
    {id:'references',title:'References & notes',source:'#1 Section one (#intro)\n\nSee &ref[intro].\n\nA sentence with a note[^1].\n\n[^1]: Footnote text.'},
    {id:'math',title:'Mathematics',source:'#1 Mathematics\n\n$x^[2] + y^[2] = z^[2]$\n\n$$\nE = mc^2\n$$'},
  ],
};
