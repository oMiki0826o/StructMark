import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, renderHtml } from "../../../src/v2/index.mjs";
import { copy } from "./copy";
import { isLocale, locales, type Locale } from "./content-types";

export { copy, isLocale, locales };

export function contentHtml(locale: Locale, name: string): string {
  const source = readFileSync(join(process.cwd(), "content", locale, `${name}.sm`), "utf8");
  return renderHtml(parse(source));
}

/** The homepage uses original AST nodes instead of splitting rendered HTML by CSS class. */
export function homeHtmlSections(locale: Locale): {intro: string; features: string; rest: string} {
  const source = readFileSync(join(process.cwd(), "content", locale, "home.sm"), "utf8");
  const document = parse(source);
  const html = renderHtml(document);
  return {intro:html,features:"",rest:""};
}
