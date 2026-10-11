/*
 * File: draft.ts
 * Modification: 2026-10-11 — 草稿本機保存、不可用儲存空間偵測及分頁內回退。
 */
export const DRAFT_KEY = "structmark.playground.draft.v1";
export const MAX_DRAFT_LENGTH = 300_000;

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

// ── 跨語系切換備援 ──
// 儲存空間被阻擋時，保留當前分頁中的編輯內容；重新整理後不承諾持久保存。
let sessionDraft: string | null = null;
let preferSession = false;

function availableStorage(): DraftStorage | null {
  try { return typeof window === "undefined" ? null : window.localStorage; }
  catch { return null; }
}

export function draftStorageAvailable(storage: DraftStorage | null = availableStorage()): boolean {
  if (!storage) return false;
  const key = `${DRAFT_KEY}.check`;
  try {
    storage.setItem(key, "ok");
    storage.removeItem(key);
    return true;
  } catch { return false; }
}

// ── 草稿讀取、儲存與重設 ──
export function loadDraft(storage: DraftStorage | null = availableStorage()): string | null {
  if (preferSession) return sessionDraft;
  if (storage) {
    try {
      const stored = storage.getItem(DRAFT_KEY);
      if (stored !== null) { sessionDraft = stored; return stored; }
      return null;
    } catch { /* 儲存空間不可用，退回分頁暫存。 */ }
  }
  return sessionDraft;
}

export function saveDraft(value: string, storage: DraftStorage | null = availableStorage()): boolean {
  if (value.length > MAX_DRAFT_LENGTH) return false;
  sessionDraft = value;
  if (!storage) { preferSession = true; return false; }
  try { storage.setItem(DRAFT_KEY, value); preferSession = false; return true; }
  catch { preferSession = true; return false; }
}

export function resetDraft(storage: DraftStorage | null = availableStorage()): void {
  sessionDraft = null;
  preferSession = false;
  try { storage?.removeItem(DRAFT_KEY); }
  catch { /* 即使瀏覽器停用 localStorage，也可以清除暫存狀態。 */ }
}
