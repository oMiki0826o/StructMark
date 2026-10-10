import { contentHtml, copy } from "../../../lib/content";
import { isLocale, locales, type Locale } from "../../../lib/content-types";
import DocsNav from "../../../components/docs-nav";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export default function LocaleDocs({ params }: { params: { locale: string } }) { const locale: Locale = isLocale(params.locale) ? params.locale : "en"; const text = copy[locale]; return <div className="container docs-shell"><DocsNav locale={locale} playgroundLabel={text.playground} /><article className="docs-content content-rendered" dangerouslySetInnerHTML={{ __html: contentHtml(locale, "docs") }} /></div>; }
