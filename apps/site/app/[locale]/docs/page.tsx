import Link from "next/link";
import { contentHtml, copy } from "../../../lib/content";
import { isLocale, locales, type Locale } from "../../../lib/content-types";
import { docGroups, docLabels } from "../../../lib/docs";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export default function LocaleDocs({ params }: { params: { locale: string } }) { const locale: Locale = isLocale(params.locale) ? params.locale : "en"; const text = copy[locale]; return <div className="container docs-shell"><aside className="docs-nav"><Link className="docs-home" href={`/${locale}/`}>StructMark</Link><div className="docs-nav-links"><Link href={`/${locale}/docs/`}>{locale === "zh-tw" ? "文件首頁" : "Documentation"}</Link>{docGroups[locale].map((group) => <div key={group.title}><div className="docs-group-title">{group.title}</div>{group.slugs.map((slug) => <Link key={slug} href={`/${locale}/docs/${slug}/`}>{docLabels[locale][slug]}</Link>)}</div>)}<Link href={`/${locale}/playground/`}>{text.playground}</Link><a href="https://github.com/oMiki0826o/StructMark">GitHub</a></div></aside><article className="docs-content content-rendered" dangerouslySetInnerHTML={{ __html: contentHtml(locale, "docs") }} /></div>; }
