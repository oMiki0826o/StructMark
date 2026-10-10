import Link from "next/link";
import { contentHtml, copy } from "../../lib/content";
import { isLocale, locales, type Locale } from "../../lib/content-types";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default function LocaleHome({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const text = copy[locale];
  const html = contentHtml(locale, "home");
  const sections = html.split(/(?=<aside class="directive directive-note")/);
  const intro = sections[0] ?? "";
  const features = sections.slice(1, 4).join("");
  const rest = sections.slice(4).join("");
  return <div className="container"><section className="hero"><div><div className="eyebrow">{text.language}</div><div className="content-rendered hero-copy" dangerouslySetInnerHTML={{ __html: intro }} /><div className="actions"><Link className="button primary" href={`/${locale}/docs/`}>{text.readDocs}</Link><Link className="button" href={`/${locale}/playground/`}>{text.openPlayground}</Link></div></div><pre className="code-card"><span className="comment"># A small, inspectable source{`\n\n`}</span>{locale === "zh-tw" ? "# 文件保留結構\n\n@note\n清楚、可測試、可組合。\n@end" : "# Keep structure intact\n\n@note\nClear, testable, composable.\n@end"}</pre></section><section className="section"><div className="eyebrow">{locale === "zh-tw" ? "核心原則" : "Core principles"}</div><div className="feature-grid content-rendered" dangerouslySetInnerHTML={{ __html: features }} /></section><section className="section content-rendered" dangerouslySetInnerHTML={{ __html: rest }} /></div>;
}
