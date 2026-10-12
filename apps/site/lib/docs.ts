/*
 * File: docs.ts
 * Modification: 2026-10-11 — 分開呈現語法類別、範例及 API。
 */
import type {Locale} from "./content-types";

export const docSlugs = [
  "why-sm", "quick-start", "v2-guide", "block-syntax", "inline-syntax", "directives",
  "attributes", "tables", "math-references", "diagnostics", "examples", "api", "roadmap",
] as const;
export type DocSlug = (typeof docSlugs)[number];

export const docLabels: Record<Locale, Record<DocSlug, string>> = {
  "zh-tw": {
    "why-sm": "為什麼使用 .sm", "quick-start": "快速開始", "v2-guide": "2.0 候選版", "block-syntax": "區塊語法",
    "inline-syntax": "行內語法", directives: "語意指令", attributes: "屬性與 ID",
    tables: "表格與資料", "math-references": "數學與參照", diagnostics: "診斷與錯誤", examples: "實際範例", api: "TypeScript API", roadmap: "設計邊界與路線圖",
  },
  en: {
    "why-sm": "Why .sm", "quick-start": "Quick start", "v2-guide": "2.0 candidate", "block-syntax": "Block syntax",
    "inline-syntax": "Inline syntax", directives: "Semantic directives", attributes: "Attributes & IDs",
    tables: "Tables & data", "math-references": "Math & references", diagnostics: "Diagnostics", examples: "Examples", api: "TypeScript API", roadmap: "Boundaries & roadmap",
  },
};

export const docGroups: Record<Locale, {title: string; slugs: DocSlug[]}[]> = {
  "zh-tw": [
    {title: "入門", slugs: ["why-sm", "quick-start", "v2-guide"]},
    {title: "語法參考", slugs: ["block-syntax", "inline-syntax", "directives", "attributes", "tables", "math-references"]},
    {title: "示例與開發", slugs: ["diagnostics", "examples", "api", "roadmap"]},
  ],
  en: [
    {title: "Introduction", slugs: ["why-sm", "quick-start", "v2-guide"]},
    {title: "Syntax reference", slugs: ["block-syntax", "inline-syntax", "directives", "attributes", "tables", "math-references"]},
    {title: "Examples & development", slugs: ["diagnostics", "examples", "api", "roadmap"]},
  ],
};
