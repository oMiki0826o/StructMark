/*
 * File: ast-tree-v2.tsx
 * Modification: 2026-10-12 — Separate v2 AST tree without legacy node-type assumptions.
 */
'use client';
import type {StructMarkDocument,StructMarkNode} from '../../../src/v2/index.mjs';

// ── 與 v2 語義節點直接對應，無需轉換為舊版 AST ──
function Branch({node,depth,onPick}:{node:StructMarkNode;depth:number;onPick:(line:number)=>void}){
  const children=node.type==='directive'&&node.mode==='normal'?node.children:[];
  const name=node.type==='heading'?`Heading H${node.level}`:node.type==='directive'?`&${node.name}`:'Text';
  const detail=node.type==='heading'?(node.id?`#${node.id} · ${node.text}`:node.text):
    node.type==='directive'?(node.mode==='table'?`${node.rows?.length??0} row(s)`:
      node.mode==='raw'||node.mode==='data'?`${node.raw?.length??0} raw line(s)`:
      Object.entries(node.attributes).map(([k,v])=>`${k}=${v}`).join(', ')):
      node.text.slice(0,72);
  const title=<><span className="ast-tree-kind">{name}</span>{detail&&<span className="ast-tree-detail">{detail}</span>}</>;
  return <li className="ast-tree-item">{children.length>0?
    <details open={depth<2}><summary onClick={()=>onPick(node.line)}>{title}</summary>
      <ul>{children.map((child,i)=><Branch key={`${child.line}-${i}`} node={child} depth={depth+1} onPick={onPick}/>)}</ul>
    </details>:
    <button type="button" className="ast-tree-leaf" onClick={()=>onPick(node.line)}>{title}</button>}</li>;
}
export default function AstTreeV2({document,onPick,english}:{document:StructMarkDocument;onPick:(line:number)=>void;english:boolean}){
  return <div className="ast-tree" aria-label={english?'StructMark v2 syntax tree':'StructMark v2 語法樹'}>
    <p className="ast-tree-hint">{english?'Select a node to locate its source line.':'選取節點可跳至對應原始碼行。'}</p>
    <ul>{document.nodes.slice(0,600).map((node,i)=><Branch key={`${node.line}-${i}`} node={node} depth={0} onPick={onPick}/>)}</ul>
    {document.nodes.length>600&&<p>{english?'Only the first 600 top-level nodes are shown.':'僅顯示前 600 個最上層節點。'}</p>}
  </div>;
}
