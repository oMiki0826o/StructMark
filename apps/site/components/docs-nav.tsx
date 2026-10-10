/*
 * File: docs-nav.tsx
 * Modification: 2026-10-11 — 分組導覽、手機展開與目前頁面語義。
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "../lib/content-types";
import { docGroups, docLabels, type DocSlug } from "../lib/docs";

// ── 文件導覽 ──
export default function DocsNav({locale, slug, playgroundLabel}: {locale: Locale; slug?: DocSlug; playgroundLabel: string}) {
  const [open, setOpen] = useState(false);
  const english = locale === "en";
  const close = () => setOpen(false);
  return (
    <aside className={`docs-nav${open ? " is-open" : ""}`} aria-label={english ? "Documentation navigation" : "文件導覽"}>
      <div className="docs-nav-heading">
        <Link className="docs-home" href={`/${locale}/docs/`} onClick={close}>
          {english ? "Documentation" : "文件導覽"}
        </Link>
        <button className="docs-menu-toggle" type="button" aria-expanded={open} aria-controls="docs-menu" onClick={() => setOpen(value => !value)}>
          {open ? (english ? "Close" : "收合") : (english ? "Browse" : "目錄")}
        </button>
      </div>
      <nav className="docs-nav-links" id="docs-menu" aria-label={english ? "Documentation sections" : "文件章節"}>
        <Link href={`/${locale}/docs/`} aria-current={!slug ? "page" : undefined} onClick={close}>
          {english ? "Overview" : "文件總覽"}
        </Link>
        {docGroups[locale].map(group => (
          <div key={group.title}>
            <div className="docs-group-title">{group.title}</div>
            {group.slugs.map(item => (
              <Link key={item} href={`/${locale}/docs/${item}/`} onClick={close}
                aria-current={item === slug ? "page" : undefined}>
                {docLabels[locale][item]}
              </Link>
            ))}
          </div>
        ))}
        <div className="docs-group-title">{english ? "Practice" : "實作"}</div>
        <Link href={`/${locale}/playground/`} onClick={close}>{playgroundLabel}</Link>
      </nav>
    </aside>
  );
}
