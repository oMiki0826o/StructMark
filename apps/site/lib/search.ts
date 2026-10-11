/*
 * File: search.ts
 * Modification: 2026-10-11 — 無網路請求的雙語文件全文搜尋與排序。
 */
export interface SearchEntry {
  readonly slug: string;
  readonly title: string;
  readonly headings: readonly string[];
  readonly body: string;
}

// ── 純函式搜尋 ──
export function searchDocuments<T extends SearchEntry>(entries: readonly T[], query: string, limit = 8): T[] {
  const parts = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean);
  if (!parts.length || limit <= 0) return [];
  const score = (entry: SearchEntry): number => {
    const title = entry.title.toLocaleLowerCase();
    const headings = entry.headings.join(' ').toLocaleLowerCase();
    const body = entry.body.toLocaleLowerCase();
    let value = 0;
    for (const word of parts) {
      if (title.includes(word)) value += 12;
      else if (headings.includes(word)) value += 6;
      else if (body.includes(word)) value += 2;
      else return 0;
    }
    return value;
  };
  return entries.map((entry, order) => ({entry, order, weight: score(entry)}))
    .filter(result => result.weight > 0)
    .sort((a,b) => b.weight-a.weight || a.order-b.order)
    .slice(0, Math.max(0, Math.trunc(limit))).map(item=>item.entry);
}
