/*
 * File: page.tsx
 * Modification: 2026-10-11 — 各語系 Playground 靜態路由。
 */
import Playground from "../../playground/playground";
import {isLocale, locales, type Locale} from "../../../lib/content-types";

export function generateStaticParams() { return locales.map(locale => ({locale})); }
export default function LocalePlayground({params}: {params: {locale: string}}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "zh-tw";
  return <Playground key={locale} locale={locale} />;
}
