import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, renderHtml } from "../../../src/index";
import {partitionHomeBlocks} from "./home-sections";
import { copy } from "./copy";
import { isLocale, locales, type Locale } from "./content-types";

export { copy, isLocale, locales };

export function contentHtml(locale: Locale, name: string): string {
  const source = readFileSync(join(process.cwd(), "content", locale, `${name}.sm`), "utf8");
  return renderHtml(parseDocument(source), {math: "katex"});
}

/** The homepage uses original AST nodes instead of splitting rendered HTML by CSS class. */
export function homeHtmlSections(locale: Locale): {intro: string; features: string; rest: string} {
  const source = readFileSync(join(process.cwd(), "content", locale, "home.sm"), "utf8");
  const document = parseDocument(source);
  const groups = partitionHomeBlocks(document.children);
  const render = (children: typeof document.children) => renderHtml({...document, children}, {math:"katex"});
  return {intro:render(groups.intro),features:render(groups.features),rest:render(groups.rest)};
}
