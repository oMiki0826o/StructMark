import Link from "next/link";
import { contentHtml, copy } from "../../../lib/content";
import { isLocale, locales, type Locale } from "../../../lib/content-types";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export default function LocaleDocs({ params }: { params: { locale: string } }) { const locale: Locale = isLocale(params.locale) ? params.locale : "en"; const text = copy[locale]; return <div className="container docs-shell"><aside className="docs-nav"><div className="eyebrow">{text.docs}</div><Link href={`/${locale}/`}>{locale === "zh-tw" ? "首頁" : "Home"}</Link><Link href={`/${locale}/playground/`}>{text.playground}</Link><a href="https://github.com/oMiki0826o/StructMark">GitHub</a></aside><article className="docs-content content-rendered" dangerouslySetInnerHTML={{ __html: contentHtml(locale, "docs") }} /></div>; }
