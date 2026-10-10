import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, renderHtml } from "../../../src/index";
import { copy } from "./copy";
import { isLocale, locales, type Locale } from "./content-types";

export { copy, isLocale, locales };

export function contentHtml(locale: Locale, name: string): string {
  const source = readFileSync(join(process.cwd(), "content", locale, `${name}.sm`), "utf8");
  return renderHtml(parseDocument(source), {math: "katex"});
}
