import Link from "next/link";
import { contentHtml, copy } from "../../../../lib/content";
import { isLocale, locales, type Locale } from "../../../../lib/content-types";
import { docSlugs, type DocSlug } from "../../../../lib/docs";
import DocsNav from "../../../../components/docs-nav";

export function generateStaticParams() { return locales.flatMap((locale) => docSlugs.map((slug) => ({ locale, slug }))); }
export default function DocumentPage({ params }: { params: { locale: string; slug: string } }) { const locale: Locale = isLocale(params.locale) ? params.locale : "en"; const slug = docSlugs.includes(params.slug as DocSlug) ? params.slug as DocSlug : "why-sm"; const text = copy[locale]; return <div className="container docs-shell"><DocsNav locale={locale} slug={slug} playgroundLabel={text.playground} /><article className="docs-content content-rendered" dangerouslySetInnerHTML={{ __html: contentHtml(locale, slug) }} /></div>; }
