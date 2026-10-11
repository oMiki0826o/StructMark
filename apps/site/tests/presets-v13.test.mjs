/*
 * File: presets-v13.test.mjs
 * Modification: 2026-10-11 — Playground 雙語範例的完整性測試。
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {playgroundExamples} from '../lib/playground-examples.ts';
test('examples have stable identifiers in both languages',()=>{
 const zh=playgroundExamples['zh-tw'],en=playgroundExamples.en;
 assert.deepEqual(zh.map(x=>x.id),en.map(x=>x.id));
 assert.equal(new Set(zh.map(x=>x.id)).size,zh.length);
 assert.ok(zh.length>=6);
 for(const preset of [...zh,...en])assert.ok(preset.source.trim().length>5);
});
