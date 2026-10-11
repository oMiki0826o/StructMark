/*
 * File: page.tsx
 * Modification: 2026-10-11 — 具備麵包屑與閱讀行寬的文件首頁。
 */
import Link from "next/link";
import {contentHtml, copy} from "../../../lib/content";
import {isLocale, locales, type Locale} from "../../../lib/content-types";
import CodeBlocks from "../../../components/code-blocks";
import DocsOutline from "../../../components/docs-outline";
import DocsNav from "../../../components/docs-nav";

export function generateStaticParams() { return locales.map(locale => ({locale})); }

export default function LocaleDocs({params}: {params: {locale: string}}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "zh-tw";
  return (
    <div className="container docs-shell">
      <DocsNav locale={locale} playgroundLabel={copy[locale].playground} />
      <div className="docs-article">
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <Link href={`/${locale}/`}>StructMark</Link><span className="separator" aria-hidden="true">/</span>
          <span aria-current="page">{locale === "en" ? "Documentation" : "文件總覽"}</span>
        </nav>
        <DocsOutline locale={locale} />
        <article className="docs-content content-rendered" dangerouslySetInnerHTML={{__html: contentHtml(locale, "docs")}} />
        <CodeBlocks />
      </div>
    </div>
  );
}
