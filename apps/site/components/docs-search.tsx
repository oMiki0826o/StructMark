/*
 * File: docs-search.tsx
 * Modification: 2026-10-11 — 日式極簡離線文件搜尋元件。
 */
'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {searchDocuments,type SearchEntry} from '../lib/search';
import type {Locale} from '../lib/content-types';

// ── 搜尋顯示 ──
export default function DocsSearch({locale, entries}: {locale:Locale;entries:readonly SearchEntry[]}) {
  const english=locale==='en';
  const [term,setTerm]=useState('');
  const results=useMemo(()=>searchDocuments(entries,term,7),[entries,term]);
  return <section className="docs-search" role="search" aria-label={english?'Search documentation':'搜尋文件'}>
    <label className="docs-search-label" htmlFor="docs-search-input">{english?'Search syntax and docs':'搜尋語法與文件'}</label>
    <div className="docs-search-field">
      <input id="docs-search-input" type="search" value={term} onChange={event=>setTerm(event.target.value)}
        placeholder={english?'Syntax, API, diagnostics…':'語法、指令、API、診斷…'} autoComplete="off" />
      <span aria-hidden="true">/</span>
    </div>
    {term.trim() && <div className="docs-search-results" aria-live="polite">
      {results.length ? <ul>{results.map(item=><li key={item.slug}><Link href={`/${locale}/docs/${item.slug}/`}>
        <span>{item.title}</span><small>{item.headings.slice(0,2).join(' · ')}</small>
      </Link></li>)}</ul> : <p>{english?'No matching documents.':'沒有符合的文件。'}</p>}
    </div>}
  </section>;
}
