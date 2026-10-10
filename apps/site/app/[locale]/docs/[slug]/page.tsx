import Link from "next/link";
import { contentHtml, copy } from "../../../../lib/content";
import { isLocale, locales, type Locale } from "../../../../lib/content-types";
import { docGroups, docLabels, docSlugs, type DocSlug } from "../../../../lib/docs";

export function generateStaticParams() { return locales.flatMap((locale) => docSlugs.map((slug) => ({ locale, slug }))); }
export default function DocumentPage({ params }: { params: { locale: string; slug: string } }) { const locale: Locale = isLocale(params.locale) ? params.locale : "en"; const slug = docSlugs.includes(params.slug as DocSlug) ? params.slug as DocSlug : "why-sm"; const text = copy[locale]; return <div className="container docs-shell"><aside className="docs-nav"><Link className="docs-home" href={`/${locale}/`}>StructMark</Link><div className="docs-nav-links"><Link href={`/${locale}/docs/`}>{locale === "zh-tw" ? "文件首頁" : "Documentation"}</Link>{docGroups[locale].map((group) => <div key={group.title}><div className="docs-group-title">{group.title}</div>{group.slugs.map((item) => <Link className={item === slug ? "active" : ""} key={item} href={`/${locale}/docs/${item}/`}>{docLabels[locale][item]}</Link>)}</div>)}<Link href={`/${locale}/playground/`}>{text.playground}</Link></div></aside><article className="docs-content content-rendered" dangerouslySetInnerHTML={{ __html: contentHtml(locale, slug) }} /></div>; }
