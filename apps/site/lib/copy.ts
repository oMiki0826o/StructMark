import type { Locale } from "./content-types";

export const copy = {
  "zh-tw": { docs: "文件", playground: "Playground", github: "GitHub", readDocs: "閱讀文件", openPlayground: "開啟 Playground", language: "語言核心", source: "來源", preview: "HTML 預覽", edit: "編輯 StructMark，查看語言核心直接產生的結果。", version: "StructMark v1.1.0", license: "MIT · 僅包含語言核心" },
  en: { docs: "Docs", playground: "Playground", github: "GitHub", readDocs: "Read the docs", openPlayground: "Open Playground", language: "language core", source: "Source", preview: "HTML preview", edit: "Edit StructMark and inspect the result produced directly by the language core.", version: "StructMark v1.1.0", license: "MIT · language core only" },
} as const satisfies Record<Locale, Record<string, string>>;
