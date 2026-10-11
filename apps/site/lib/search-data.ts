/*
 * File: search-data.ts
 * Modification: 2026-10-11 — 從真實 .sm 文件建置離線搜尋目錄。
 */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {Locale} from './content-types';
import {docLabels, docSlugs} from './docs';
import type {SearchEntry} from './search';

// ── 建置期間來源 ──
export function createSearchEntries(locale: Locale): SearchEntry[] {
  return docSlugs.map(slug=>{
    const source = readFileSync(join(process.cwd(),'content',locale,`${slug}.sm`),'utf8');
    const headings = [...source.matchAll(/^ {0,3}#[1-6]\s+([^\n]+)$/gm)].map(m=>m[1]!.replace(/\s*\(#[^\n)]+\)\s*$/,'').trim());
    const body = source.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g,' ').replace(/\s+/g,' ').slice(0,9000);
    return {slug,title:docLabels[locale][slug],headings,body};
  });
}
