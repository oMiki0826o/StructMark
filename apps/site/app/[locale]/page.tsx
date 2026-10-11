/*
 * File: page.tsx
 * Modification: 2026-10-11 — 保留 .sm 來源內容的極簡首頁。
 */
import Link from "next/link";
import {contentHtml, copy} from "../../lib/content";
import {isLocale, locales, type Locale} from "../../lib/content-types";

export function generateStaticParams() { return locales.map(locale => ({locale})); }

export default function LocaleHome({params}: {params: {locale: string}}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "zh-tw";
  const text = copy[locale];
  const html = contentHtml(locale, "home");
  // ── 原始文稿的前三個 note 是語言特性，不建立另一套內容來源 ──
  const sections = html.split(/(?=<aside class="directive directive-note")/);
  const intro = sections[0] ?? "";
  const features = sections.slice(1, 4).join("");
  const rest = sections.slice(4).join("");
  const english = locale === "en";

  return (
    <div className="container">
      <section className={`hero hero--${locale}`} aria-label={english ? "Introduction" : "語言簡介"}>
        <div className="hero-main">
          <span className="eyebrow">{english ? "Language core" : "語言核心"}</span>
          <div className="content-rendered hero-copy" dangerouslySetInnerHTML={{__html: intro}} />
          <div className="actions">
            <Link className="button primary" href={`/${locale}/docs/`}>{text.readDocs} <span aria-hidden="true">&nbsp;→</span></Link>
            <Link className="button" href={`/${locale}/playground/`}>{text.openPlayground}</Link>
          </div>
        </div>
        <figure className="specimen">
          <figcaption><span>example.sm</span><span>v1.1</span></figcaption>
          <pre><code>{english ? `#1 A simple document\n\nThis is a paragraph.\n\n*[Structure] makes text clear.\n\n&note[title="Note"]\nContent stays readable.\n&end` : `#1 一份簡單的文件\n\n這是一段普通文字。\n\n*[結構]，讓文字更清楚。\n\n&note[title="提示"]\n內容保持可讀。\n&end`}</code></pre>
        </figure>
      </section>
      <section className="home-section" aria-label={english ? "Core qualities" : "核心特性"}>
        <span className="eyebrow">01 / {english ? "FOUNDATIONS" : "核心原則"}</span>
        <h2 className="section-heading">{english ? "A language that values clarity." : "清楚、簡潔、有結構。"}</h2>
        <div className="feature-grid content-rendered" dangerouslySetInnerHTML={{__html: features}} />
        <div className="home-body content-rendered" dangerouslySetInnerHTML={{__html: rest}} />
      </section>
    </div>
  );
}
