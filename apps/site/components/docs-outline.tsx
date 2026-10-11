/*
 * File: docs-outline.tsx
 * Modification: 2026-10-11 — 長篇 .sm 文件的可展開章節索引，保留原始 ID。
 */
"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import type {Locale} from "../lib/content-types";

interface OutlineEntry {id: string; title: string; level: 2 | 3}

// ── 章節定位 ──
function headingSlug(title: string): string {
  const slug = title.normalize("NFC").toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return `section-${slug || "untitled"}`;
}

export default function DocsOutline({locale}: {locale: Locale}) {
  const pathname = usePathname();
  const [entries, setEntries] = useState<OutlineEntry[]>([]);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".docs-content");
    if (!article) return;
    const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2, h3"));
    const used = new Set(Array.from(document.querySelectorAll<HTMLElement>("[id]"), node => node.id));
    const next: OutlineEntry[] = [];
    for (const heading of headings) {
      const title = heading.textContent?.trim() ?? "";
      if (!title) continue;
      let id = heading.id;
      if (!id) {
        const base = headingSlug(title);
        id = base;
        for (let index = 2; used.has(id); index++) id = `${base}-${index}`;
        heading.id = id;
      }
      used.add(id);
      next.push({id, title, level: heading.tagName === "H3" ? 3 : 2});
    }
    setEntries(next);
  }, [pathname]);

  if (entries.length < 2) return null;
  const english = locale === "en";
  return (
    <nav className="docs-outline" aria-label={english ? "On this page" : "本頁章節"}>
      <details>
        <summary>{english ? "On this page" : "本頁目錄"}<span aria-hidden="true">↓</span></summary>
        <ol>
          {entries.map(entry => (
            <li key={entry.id} className={entry.level === 3 ? "is-subsection" : undefined}>
              <a href={`#${entry.id}`}>{entry.title}</a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
