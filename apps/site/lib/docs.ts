import type { Locale } from "./content-types";

export const docSlugs = ["why-sm", "quick-start", "block-syntax", "inline-syntax", "api", "roadmap"] as const;
export type DocSlug = (typeof docSlugs)[number];

export const docLabels: Record<Locale, Record<DocSlug, string>> = {
  "zh-tw": { "why-sm": "為什麼使用 .sm", "quick-start": "快速開始", "block-syntax": "區塊語法", "inline-syntax": "行內語法", api: "TypeScript API", roadmap: "設計邊界與路線圖" },
  en: { "why-sm": "Why .sm", "quick-start": "Quick start", "block-syntax": "Block syntax", "inline-syntax": "Inline syntax", api: "TypeScript API", roadmap: "Boundaries & roadmap" },
};

export const docGroups: Record<Locale, { title: string; slugs: DocSlug[] }[]> = {
  "zh-tw": [{ title: "開始使用", slugs: ["why-sm", "quick-start"] }, { title: "語法規格", slugs: ["block-syntax", "inline-syntax"] }, { title: "整合", slugs: ["api", "roadmap"] }],
  en: [{ title: "Get started", slugs: ["why-sm", "quick-start"] }, { title: "Syntax", slugs: ["block-syntax", "inline-syntax"] }, { title: "Integrate", slugs: ["api", "roadmap"] }],
};
