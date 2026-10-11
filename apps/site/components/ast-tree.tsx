/*
 * File: ast-tree.tsx
 * Modification: 2026-10-11 — 可展開且支援來源定位的 AST Tree。
 */
'use client';
import {useMemo} from 'react';
import type {Document,SourceRange} from '../../../src/types';
import {projectAstTree,type AstTreeItem} from '../lib/ast-tree';

function Branch({item,onPick,depth=0}: {item:AstTreeItem;onPick:(range:SourceRange)=>void;depth?:number}) {
  const title=<><span className="ast-tree-kind">{item.label}</span>{item.detail&&<span className="ast-tree-detail">{item.detail}</span>}</>;
  const select=()=>{if(item.range)onPick(item.range);};
  return <li className="ast-tree-item">{item.children.length>0 ?
    <details open={depth<2}><summary onClick={select} title={item.range?'Select this node in source':''}>{title}</summary>
      <ul>{item.children.map((child,i)=><Branch key={`${i}-${child.label}`} item={child} onPick={onPick} depth={depth+1}/>)}</ul>
    </details> :
    <button type="button" className="ast-tree-leaf" onClick={select} disabled={!item.range} title={item.range?'Select this node in source':''}>{title}</button>}
  </li>;
}
export default function AstTree({document,onPick,english}: {document:Document;onPick:(range:SourceRange)=>void;english:boolean}) {
  const tree=useMemo(()=>projectAstTree(document),[document]);
  return <div className="ast-tree" aria-label={english?'AST hierarchy':'AST 階層'}>
    <p className="ast-tree-hint">{english?'Select any node to highlight its source; expand or collapse branches.':'選取節點可標示對應原始碼，也能展開或收合分支。'}</p>
    <ul><Branch item={tree} onPick={onPick}/></ul>
  </div>;
}
