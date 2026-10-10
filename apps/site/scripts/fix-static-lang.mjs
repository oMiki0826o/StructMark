/*
 * File: fix-static-lang.mjs
 * Modification: 2026-10-11 — 靜態匯出網站之英文頁面 lang 屬性。
 */
import {readFile, writeFile, readdir} from 'node:fs/promises';
import {join} from 'node:path';

// ── 語系 HTML 後製 ──
async function fix(directory, lang) {
  let changed = 0;
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { changed += await fix(path, lang); continue; }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const html = await readFile(path, 'utf8');
    if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) throw new Error(`No lang attribute in ${path}`);
    const corrected = html.replace(/(<html\b[^>]*\blang=)["'][^"']+["']/i, `$1"${lang}"`);
    if (html !== corrected) { await writeFile(path, corrected, 'utf8'); changed++; }
  }
  return changed;
}

const folder = join(process.cwd(), 'out');
const english = await fix(join(folder, 'en'), 'en');
const traditional = await fix(join(folder, 'zh-tw'), 'zh-Hant');
console.log(`static language metadata verified: en=${english}, zh-tw=${traditional}`);
