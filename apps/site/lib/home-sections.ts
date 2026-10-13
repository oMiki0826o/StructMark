/*
 * File: home-sections.ts
 * Modification: 2026-10-11 — 首頁介紹和特性以 AST 節點分類。
 */
type BlockNode = {type:string; name?:string};

// ── 區塊分組 ──
export function partitionHomeBlocks<T extends Pick<BlockNode,'type'> & {name?:string}>(children:readonly T[]): {intro:T[];features:T[];rest:T[]} {
  const first=children.findIndex(node=>node.type==='directive' && node.name==='note');
  if(first<0)return {intro:[...children],features:[],rest:[]};
  let end=first;
  while(end<children.length && end-first<3 && children[end]?.type==='directive' && children[end]?.name==='note') end++;
  return {intro:children.slice(0,first),features:children.slice(first,end),rest:children.slice(end)};
}
