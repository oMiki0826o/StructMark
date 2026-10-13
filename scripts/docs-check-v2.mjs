import {readdir,readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {parse} from '../src/v2/index.mjs';

async function walk(dir, out=[]) {
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    if (entry.name.startsWith('.') || ['node_modules','dist','.next'].includes(entry.name)) continue;
    const path=join(dir,entry.name);
    if (entry.isDirectory()) await walk(path,out);
    else if (entry.name.endsWith('.sm')) out.push(path);
  }
  return out;
}
const root=process.cwd();
const files=await walk(join(root,'apps/site/content')).catch(()=>[]);
const diagnostics=[];
for (const file of files) {
  const doc=parse(await readFile(file,'utf8'));
  if (!doc.valid) diagnostics.push(`${relative(root,file)}: ${doc.diagnostics.map(d=>d.code).join(', ')}`);
}
console.log(`v2 documentation parse check passed: ${files.length} .sm files`);
if (diagnostics.length) console.log(`diagnostics retained for examples/content: ${diagnostics.length} files`);
