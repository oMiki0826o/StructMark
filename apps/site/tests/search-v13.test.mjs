/*
 * File: search-v13.test.mjs
 * Modification: 2026-10-11 — 靜態雙語文件搜尋相關度與容錯測試。
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchDocuments} from '../lib/search.ts';
const items=[
 {slug:'inline-syntax',title:'行內語法',body:'*[粗體] /[斜體]',headings:['文字格式']},
 {slug:'api',title:'TypeScript API',body:'parseDocument creates AST',headings:['Parser']},
 {slug:'tables',title:'表格',body:'CSV 表格 與 JSON',headings:['CSV 資料']},
];
test('search finds CJK body text and ranks title matches higher',()=>{
 assert.equal(searchDocuments(items,'表格')[0].slug,'tables');
 assert.equal(searchDocuments(items,'粗體')[0].slug,'inline-syntax');
});
test('search is case-insensitive and limits results',()=>{
 assert.deepEqual(searchDocuments(items,'TYPESCRIPT').map(x=>x.slug),['api']);
 assert.equal(searchDocuments(items,' ',1).length,0);
 assert.equal(searchDocuments(items,'a',1).length,1);
});
test('search treats user punctuation as literal, not a regex',()=>{
 assert.deepEqual(searchDocuments(items,'[***').map(x=>x.slug),[]);
});
