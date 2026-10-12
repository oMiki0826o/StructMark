/* Deterministic source profiles built from the same v2 AST. */
import {format} from './formatter.mjs';

const aliases = Object.freeze({note:'n',warning:'w',tip:'p',quote:'q',important:'i',table:'tbl',equation:'eq',code:'c',data:'d'});
const directiveLine = /^(&)([a-z][a-z0-9_-]*)(?=\[|$)/;

/**
 * Serialize a parsed document without changing its meaning.
 * canonical delegates to the stable formatter; compact only uses registered
 * aliases and the registered short closing marker.
 */
export function serialize(document,{profile='canonical'}={}){
  const source=format(document);
  if(profile==='canonical')return source;
  if(profile!=='compact')throw new RangeError(`Unknown serialization profile: ${profile}`);
  return source.split('\n').map(line=>{
    if(/^&end[ \t]*$/.test(line))return line.replace(/^&end/,'&e');
    const match=directiveLine.exec(line);
    if(!match)return line;
    const alias=aliases[match[2]];
    return alias?line.replace(directiveLine,`&${alias}`):line;
  }).join('\n');
}
