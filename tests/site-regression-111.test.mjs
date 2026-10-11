/*
 * File: site-regression-111.test.mjs
 * Modification: 2026-10-11 — 文件索引、語法導覽與版本承諾的整合檢查。
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const base = 'apps/site';

test('the two new 1.1.1 reference chapters are accessible from navigation', () => {
  const nav = read(`${base}/lib/docs.ts`);
  for (const name of ['diagnostics', 'math-references']) {
    assert.match(nav, new RegExp(`"${name}"`, 'g'));
    for (const lang of ['zh-tw', 'en']) {
      const path = `${base}/content/${lang}/${name}.sm`;
      assert.ok(existsSync(path), path);
      assert.match(read(path), /^#1 /);
    }
  }
});

test('heading outline uses existing heading IDs and creates stable anchors', () => {
  const code = read(`${base}/components/docs-outline.tsx`);
  assert.match(code, /querySelectorAll.*h2.*h3/);
  assert.match(code, /heading\.id/);
  assert.match(code, /aria-label/);
  for (const path of [`${base}/app/[locale]/docs/page.tsx`, `${base}/app/[locale]/docs/[slug]/page.tsx`]) {
    assert.match(read(path), /<DocsOutline.*locale=/);
  }
});

test('small-screen document outline does not compete with the main navigation', () => {
  const css = read(`${base}/app/globals.css`);
  assert.match(css, /\.docs-outline/);
  assert.match(css, /\.docs-outline summary/);
});

test('playground has named input and a reset action', () => {
  const source = read(`${base}/app/playground/playground.tsx`);
  assert.match(source, /id="source-input"/);
  assert.match(source, /handleReset/);
});
