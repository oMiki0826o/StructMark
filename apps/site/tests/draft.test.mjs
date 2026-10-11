/*
 * File: draft.test.mjs
 * Modification: 2026-10-11 — 自動儲存及異常 storage 可回復。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadDraft, saveDraft, resetDraft, draftStorageAvailable, DRAFT_KEY} from '../lib/draft.ts';
function storage() {
  const map = new Map();
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: key => map.delete(key),
  };
}
test('draft is shared across locales and survives a fresh load', () => {
  const memory = storage();
  assert.equal(loadDraft(memory), null);
  assert.equal(saveDraft('#1 我的文件\n*[內容]', memory), true);
  assert.equal(memory.getItem(DRAFT_KEY), '#1 我的文件\n*[內容]');
  assert.equal(loadDraft(memory), '#1 我的文件\n*[內容]');
  resetDraft(memory);
  assert.equal(loadDraft(memory), null);
});
test('empty content is stored, not mistaken for missing', () => {
  const memory = storage();
  assert.equal(saveDraft('', memory), true);
  assert.equal(loadDraft(memory), '');
  resetDraft(memory);
});
test('storage exceptions do not crash the editor', () => {
  const denied = {
    getItem(){throw new Error('blocked')},
    setItem(){throw new Error('blocked')},
    removeItem(){throw new Error('blocked')},
  };
  assert.equal(loadDraft(denied), null);
  assert.equal(saveDraft('content', denied), false);
  assert.doesNotThrow(() => resetDraft(denied));
});
test('oversized input is rejected before quota errors', () => {
  assert.equal(saveDraft('x'.repeat(300001), storage()), false);
});

test('blocked storage is reported unavailable instead of falsely claiming a saved draft', () => {
  const blocked = {getItem() {throw Error('blocked')}, setItem() {throw Error('blocked')}, removeItem() {throw Error('blocked')}};
  assert.equal(draftStorageAvailable(blocked), false);
  saveDraft('Unsaved but kept during navigation', blocked);
  assert.equal(loadDraft(blocked), 'Unsaved but kept during navigation');
  resetDraft(blocked);
});

test('writable storage is detected and in-memory draft mirrors successful persistence', () => {
  const memory = storage();
  assert.equal(draftStorageAvailable(memory), true);
  assert.equal(saveDraft('ready', memory), true);
  assert.equal(loadDraft(memory), 'ready');
  resetDraft(memory);
  assert.equal(loadDraft(memory), null);
});
