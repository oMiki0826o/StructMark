/* Deterministic source profiles built from the same v2 AST. */
import {format,writeDocument} from './formatter.mjs';
import {parse} from './parser.mjs';
import {normalizeSemantic} from './semantic.mjs';

const aliases = Object.freeze({note:'n',warning:'w',tip:'p',quote:'q',important:'i',table:'tbl',equation:'eq',code:'c',data:'d'});
const directiveLine = /^(&)([a-z][a-z0-9_-]*)(?=\[|$)/;

/**
 * Serialize a parsed document without changing its meaning.
 * canonical delegates to the stable formatter; compact only uses registered
 * aliases and the registered short closing marker.
 */
export function serialize(document,{profile='canonical',tokenize}={}){
  if(document?.valid===false)throw new TypeError('Cannot serialize an invalid document');
  const source=writeDocument?writeDocument(document):format(document);
  if(profile==='canonical')return source;
  if(profile==='optimized'){
    if(typeof tokenize!=='function')throw new TypeError('optimized serialization requires a tokenize(text) function');
    const canonical=writeDocument(document),compact=writeDocument(document,{compact:true});
    const count=text=>{const value=tokenize(text);if(!Number.isSafeInteger(value)||value<0)throw new TypeError('tokenize(text) must return a non-negative integer');return value;};
    let best=count(canonical)<count(compact)?canonical:compact;
    const directives=[];const walk=nodes=>nodes.forEach(node=>{if(node.type==='directive'){directives.push(node);if(node.mode==='normal')walk(node.children);}});walk(document.nodes);
    const chosen=new Set();
    for(const directive of directives.slice(0,96)){
      chosen.add(directive);const candidate=writeDocument(document,{styleFor:node=>chosen.has(node)});
      if(count(candidate)<count(best))best=candidate;else chosen.delete(directive);
    }
    const reparsed=parse(best);
    if(!reparsed.valid||JSON.stringify(normalizeSemantic(reparsed))!==JSON.stringify(normalizeSemantic(document)))throw new Error('Optimized serialization is not semantically equivalent');
    return best;
  }
  if(profile!=='compact')throw new RangeError(`Unknown serialization profile: ${profile}`);
  return source.split('\n').map(line=>{
    if(/^&end[ \t]*$/.test(line))return line.replace(/^&end/,'&e');
    const match=directiveLine.exec(line);
    if(!match)return line;
    const alias=aliases[match[2]];
    return alias?line.replace(directiveLine,`&${alias}`):line;
  }).join('\n');
}
