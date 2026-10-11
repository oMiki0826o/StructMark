/*
 * File: home-sections-v13.test.mjs
 * Modification: 2026-10-11 — 首頁依 AST 區塊分組，不依賴 HTML 字串。
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {partitionHomeBlocks} from '../lib/home-sections.ts';
const heading={type:'heading',level:1};const paragraph={type:'paragraph'};
const note={type:'directive',name:'note'};
const warning={type:'directive',name:'warning'};
test('three opening notes become feature rows, later note remains in body',()=>{
 const nodes=[heading,paragraph,note,note,note,warning,paragraph,note];
 const {intro,features,rest}=partitionHomeBlocks(nodes);
 assert.deepEqual(intro,[heading,paragraph]);assert.equal(features.length,3);assert.deepEqual(rest,[warning,paragraph,note]);
});
test('missing features does not erase introductory content',()=>{
 const nodes=[heading,paragraph];const parts=partitionHomeBlocks(nodes);
 assert.deepEqual(parts.intro,nodes);assert.deepEqual(parts.features,[]);assert.deepEqual(parts.rest,[]);
});
