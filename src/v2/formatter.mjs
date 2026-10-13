/* Shared AST-based canonical and compact writers; raw payloads stay untouched. */
import {encodeAttribute,directiveDefinitions} from './registry.mjs';
const terminator=/^&(?:e|end)[ \t]*$/;
const escapedTerminator=/^\\*&(?:e|end)[ \t]*$/;
const cell=value=>'['+value.replace(/\\/g,'\\\\').replace(/\]/g,'\\]').replace(/\[/g,'\\[')+']';

export function writeDocument(document,{compact=false,styleFor}={}){
  const result=[];
  function write(node){
    if(node.type==='heading'){result.push(`#${node.level} ${node.text}${node.id?' (#'+node.id+')':''}`);return;}
    if(node.type==='text'){result.push(terminator.test(node.text)?'\\'+node.text:node.text);return;}
    if(node.type!=='directive')throw new TypeError(`Unsupported AST node: ${node.type}`);
    const definition=directiveDefinitions[node.name];if(!definition)throw new TypeError(`Unknown directive in AST: ${node.name}`);
    const short=typeof styleFor==='function'?Boolean(styleFor(node)):compact;
    const attrs=Object.entries(node.attributes);let encoded='';
    if(attrs.length)encoded=short&&attrs.length===1&&attrs[0][0]===definition.defaultAttribute?encodeAttribute(attrs[0][1]):attrs.map(([key,value])=>key+'='+encodeAttribute(value)).join(',');
    result.push('&'+(short&&definition.alias?definition.alias:node.name)+(attrs.length?'['+encoded+']':''));
    if(node.mode==='table')for(const row of node.rows)result.push(row.map(cell).join(''));
    else if(node.mode==='raw'||node.mode==='data')result.push(...node.raw.map(value=>escapedTerminator.test(value)?'\\'+value:value));
    else if(node.mode==='normal')node.children.forEach(write);
    else throw new TypeError(`Unknown directive mode: ${node.mode}`);
    result.push(short?'&e':'&end');
  }
  document.nodes.forEach(write);
  const output=result.join('\n');
  return document.nodes.length>1&&document.nodes.at(-1)?.type==='text'&&document.nodes.at(-1).text===''?output+'\n':output;
}
export function format(document){return writeDocument(document);}
