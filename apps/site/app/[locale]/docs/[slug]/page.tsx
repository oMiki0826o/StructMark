/*
 * File: page.tsx
 * Modification: 2026-10-11 — 文件內頁統一版型與目前章節導覽。
 */
import Link from "next/link";
import {contentHtml, copy} from "../../../../lib/content";
import {isLocale, locales, type Locale} from "../../../../lib/content-types";
import {docSlugs, docLabels, type DocSlug} from "../../../../lib/docs";
import CodeBlocks from "../../../../components/code-blocks";
import DocsOutline from "../../../../components/docs-outline";
import DocsNav from "../../../../components/docs-nav";
import DocsSearch from "../../../../components/docs-search";
import {createSearchEntries} from "../../../../lib/search-data";

export function generateStaticParams() { return locales.flatMap(locale => docSlugs.map(slug => ({locale, slug}))); }

export default function DocumentPage({params}: {params: {locale: string; slug: string}}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "zh-tw";
  const slug: DocSlug = docSlugs.includes(params.slug as DocSlug) ? params.slug as DocSlug : "why-sm";
  return (
    <div className="container docs-shell">
      <DocsNav locale={locale} slug={slug} playgroundLabel={copy[locale].playground} />
      <div className="docs-article">
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <Link href={`/${locale}/`}>StructMark</Link><span className="separator" aria-hidden="true">/</span>
          <Link href={`/${locale}/docs/`}>{locale === "en" ? "Docs" : "文件"}</Link>
          <span className="separator" aria-hidden="true">/</span>
          <span aria-current="page">{docLabels[locale][slug]}</span>
        </nav>
        <DocsSearch locale={locale} entries={createSearchEntries(locale)} />
        <DocsOutline locale={locale} />
        <article className="docs-content content-rendered" dangerouslySetInnerHTML={{__html: contentHtml(locale, slug)}} />
        <CodeBlocks />
      </div>
    </div>
  );
}
