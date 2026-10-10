/*
 * File: site-header.tsx
 * Modification: 2026-10-11 — 保留路徑的雙語導覽與鍵盤跳轉。
 */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "../lib/content-types";

// ── 語系與路由 ──
export default function SiteHeader() {
  const pathname = usePathname() ?? "/zh-tw/";
  const locale: Locale = pathname.startsWith("/en/") || pathname === "/en" ? "en" : "zh-tw";
  const suffix = pathname.replace(/^\/(?:en|zh-tw)(?=\/|$)/, "") || "/";
  const localized = (target: Locale) => `/${target}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
  const isDocs = suffix.startsWith("/docs");
  const isPlayground = suffix.startsWith("/playground");
  const english = locale === "en";

  useEffect(() => {
    document.documentElement.lang = english ? "en" : "zh-Hant";
  }, [english]);

  return (
    <>
      <a className="skip-link" href="#main-content">{english ? "Skip to content" : "跳至主要內容"}</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="wordmark" href={`/${locale}/`} aria-label={english ? "StructMark home" : "StructMark 首頁"}>
            StructMark<span className="wordmark-dot" aria-hidden="true" />
            <span className="wordmark-sub">LANGUAGE CORE</span>
          </Link>
          <nav className="primary-nav" aria-label={english ? "Primary navigation" : "主要導覽"}>
            <Link href={`/${locale}/docs/`} aria-current={isDocs ? "page" : undefined}>{english ? "Docs" : "文件"}</Link>
            <Link href={`/${locale}/playground/`} aria-current={isPlayground ? "page" : undefined}>Playground</Link>
          </nav>
          <div className="header-actions">
            <div className="locale-switch" aria-label={english ? "Language" : "語言切換"}>
              <Link href={localized("zh-tw")} hrefLang="zh-Hant" lang="zh-Hant" aria-current={!english ? "page" : undefined}>繁中</Link>
              <span className="locale-divider" aria-hidden="true">/</span>
              <Link href={localized("en")} hrefLang="en" lang="en" aria-current={english ? "page" : undefined}>EN</Link>
            </div>
            <a className="github-link" href="https://github.com/oMiki0826o/StructMark" target="_blank" rel="noopener noreferrer">GitHub<span className="sr-only"> ({english ? "opens in a new tab" : "在新分頁開啟"})</span></a>
          </div>
        </div>
      </header>
    </>
  );
}
