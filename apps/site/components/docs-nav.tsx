"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "../lib/content-types";
import { docGroups, docLabels, type DocSlug } from "../lib/docs";

export default function DocsNav({ locale, slug, playgroundLabel }: { locale: Locale; slug: DocSlug; playgroundLabel: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <aside className={`docs-nav${open ? " is-open" : ""}`}>
      <div className="docs-nav-heading">
        <Link className="docs-home" href={`/${locale}/`} onClick={close}>StructMark</Link>
        <button className="docs-menu-toggle" type="button" aria-expanded={open} aria-controls="docs-menu" onClick={() => setOpen((value) => !value)}>
          <span aria-hidden="true">{open ? "×" : "☰"}</span>
          <span className="sr-only">{open ? "Close documentation menu" : "Open documentation menu"}</span>
        </button>
      </div>
      <div className="docs-nav-links" id="docs-menu">
        <Link href={`/${locale}/docs/`} onClick={close}>{locale === "zh-tw" ? "文件首頁" : "Documentation"}</Link>
        {docGroups[locale].map((group) => <div key={group.title}><div className="docs-group-title">{group.title}</div>{group.slugs.map((item) => <Link className={item === slug ? "active" : ""} key={item} href={`/${locale}/docs/${item}/`} onClick={close}>{docLabels[locale][item]}</Link>)}</div>)}
        <Link href={`/${locale}/playground/`} onClick={close}>{playgroundLabel}</Link>
      </div>
    </aside>
  );
}
