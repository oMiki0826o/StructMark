/*
 * File: ast-tree.ts
 * Modification: 2026-10-11 — 零相依、可設定節點上限的 AST 樹狀檢視模型。
 */
import type {Document, InlineNode, BlockNode, ListItem, Position, SourceRange} from '../../../src/types';

type SourceNode = Document | InlineNode | BlockNode | ListItem;
export interface AstTreeItem {
  readonly label: string;
  readonly detail?: string;
  readonly range?: SourceRange;
  readonly children: readonly AstTreeItem[];
}
function describe(node: SourceNode): {label:string;detail?:string} {
  switch(node.type) {
    case 'document': return {label:'Document',detail:`AST v${node.version}`};
    case 'heading': return {label:`Heading · H${node.level}`,detail:node.id ? `#${node.id}` : undefined};
    case 'paragraph': return {label:'Paragraph'};
    case 'list': return {label:node.ordered?'Ordered list':'List',detail:`${node.items.length} items`};
    case 'listItem': return {label:'List item',detail:node.task===null?undefined:node.task?'done':'pending'};
    case 'table': return {label:'Table',detail:`${node.rows.length} rows`};
    case 'directive': return {label:`Directive · &${node.name}`};
    case 'codeBlock': return {label:'Code block',detail:node.lang??undefined};
    case 'footnoteDef': return {label:'Footnote',detail:node.id};
    case 'text': return {label:'Text',detail:node.value.slice(0,72)};
    case 'code': case 'math': case 'comment': return {label:node.type[0]!.toUpperCase()+node.type.slice(1),detail:node.value.slice(0,72)};
    case 'link': case 'image': return {label:node.type==='link'?'Link':'Image',detail:node.target};
    case 'ref': case 'footnoteRef': return {label:node.type==='ref'?'Reference':'Footnote reference',detail:node.target};
    case 'wiki': return {label:'Wiki link',detail:node.target};
    case 'citation': return {label:'Citation',detail:node.keys.join(', ')};
    case 'inlineDirective': return {label:`Inline directive · &${node.name}`};
    default: return {label:node.type[0]!.toUpperCase()+node.type.slice(1)};
  }
}
function childrenOf(node: SourceNode): SourceNode[] {
  if (node.type==='document') return node.children;
  if (node.type==='list') return node.items;
  if (node.type==='listItem'||node.type==='blockquote'||node.type==='directive') return node.children;
  if (node.type==='table') return [...node.header.flat(),...node.rows.flat(2)];
  if ('children' in node) return node.children;
  if ('label' in node && Array.isArray(node.label)) return node.label;
  return [];
}
/** Build the same readable hierarchy as the parser while capping UI size. */
export function projectAstTree(document: Document, options:{maxNodes?:number}={}): AstTreeItem {
  let remaining=Math.max(2,Math.min(3000,Math.trunc(options.maxNodes??600)));
  function visit(node:SourceNode):AstTreeItem {
    remaining--;
    const {label,detail}=describe(node);
    const children:AstTreeItem[]=[];
    for(const child of childrenOf(node)) {
      if(remaining<=0){children.push({label:'… remaining nodes omitted',children:[]});break;}
      children.push(visit(child));
    }
    return {label,...(detail?{detail}:{}),...('range' in node?{range:node.range}:{}),children};
  }
  return visit(document);
}
/** Prefer parser UTF-16 offsets; clamp fallback positions to the editor buffer. */
export function editorOffset(source:string,position:Position):number {
  if(Number.isInteger(position.offset)&&position.offset!>=0&&position.offset!<=source.length)return position.offset!;
  const lines=source.split('\n');
  const index=Math.max(0,Math.min(lines.length-1,Math.trunc(position.line)-1||0));
  const start=lines.slice(0,index).reduce((count,line)=>count+line.length+1,0);
  return Math.max(0,Math.min(source.length,start+Math.max(0,Math.trunc(position.column)-1||0)));
}
