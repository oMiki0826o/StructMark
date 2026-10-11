/*
 * File: verify-export.mjs
 * Modification: 2026-10-11 — Next 靜態匯出的雙語頁面與路由完整性檢查。
 */
import {readFile, stat} from 'node:fs/promises';
import {join} from 'node:path';

// ── 靜態路由檢查 ──
const out=join(process.cwd(),'out');
const pages=['','docs/','docs/inline-syntax/','docs/api/','playground/'];
for (const locale of ['zh-tw','en']) {
  for (const route of pages) {
    const path=join(out,locale,route,'index.html');
    const file=await readFile(path,'utf8');
    const expected=locale==='en'?'en':'zh-Hant';
    if(!new RegExp(`<html\\b[^>]*\\blang=["']${expected}["']`,'i').test(file))
      throw new Error(`Incorrect HTML language metadata: ${path}`);
    if(!file.includes('StructMark'))throw new Error(`Missing page content: ${path}`);
    if((await stat(path)).size < 150)throw new Error(`Unexpectedly short page: ${path}`);
    console.log(`OK /${locale}/${route}`);
  }
}
console.log('Static export routes and languages verified.');
