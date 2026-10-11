/*
 * File: v15-docs.test.mjs
 * Modification: 2026-10-11 — `.sm` bilingual docs validation regression tests.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkWebsiteDocs} from '../scripts/docs-check.mjs';

test('documentation checker rejects missing translation without mutating sources',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'sm-docs-'));
 try {mkdirSync(join(dir,'zh-tw'));mkdirSync(join(dir,'en'));
   writeFileSync(join(dir,'zh-tw','a.sm'),'#1 文本\n');
   const output=await checkWebsiteDocs(dir);
   assert.ok(output.errors.some(x=>x.includes('en/a.sm')));
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('documentation checker accepts matching .sm document pairs',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'sm-docs-'));
 try {mkdirSync(join(dir,'zh-tw'));mkdirSync(join(dir,'en'));
  writeFileSync(join(dir,'zh-tw','a.sm'),'#1 中文\n');writeFileSync(join(dir,'en','a.sm'),'#1 English\n');
  const output=await checkWebsiteDocs(dir);
  assert.equal(output.errors.length,0);
  assert.equal(output.files,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
