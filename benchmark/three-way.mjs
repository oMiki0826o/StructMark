#!/usr/bin/env node
/* Build a reproducible .md / @Doc / .sm comparison corpus.
 * @Doc is generated with the supplied AtDoc Markdown importer and reparsed
 * with the supplied AtDoc parser. It is therefore a conversion comparison,
 * not a claim that the two languages have identical feature sets.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const atdocRoot = process.argv[2];
if (!atdocRoot) {
  console.error('用法：node benchmark/three-way.mjs /path/to/AtDoc/dist');
  process.exit(2);
}
const atdoc = await import(resolve(atdocRoot, 'index.js'));
const root = resolve(import.meta.dirname);
const corpus = JSON.parse(await readFile(resolve(root, 'corpus.json'), 'utf8'));
const output = resolve(root, 'three-way-corpus.json');
const validationOutput = resolve(root, 'three-way-validation.json');

function canonical(value, key = '') {
  if (key === 'diagnostics' || key === 'position' || key === 'range' || key === 'start' || key === 'end') return undefined;
  if (Array.isArray(value)) return value.map(item => canonical(item)).filter(item => item !== undefined);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([name, item]) => [name, canonical(item, name)])
      .filter(([, item]) => item !== undefined),
  );
  return value;
}

const results = corpus.map(sample => {
  const converted = atdoc.convertMarkdownToAtDoc(sample.markdown);
  let diagnostics = [];
  let reparsed = false;
  if (converted.ok) {
    const parser = new atdoc.DocParser(atdoc.tokenize(converted.text));
    parser.parse();
    diagnostics = parser.diagnostics;
    reparsed = diagnostics.length === 0;
  }
  return {
    id: sample.id,
    markdown: sample.markdown,
    atdoc: converted.ok ? converted.text : null,
    structmark: sample.structmark,
    atdoc_converted: converted.ok,
    atdoc_reparsed_without_diagnostics: reparsed,
    atdoc_notes: converted.notes ?? [],
    atdoc_diagnostics: diagnostics.map(item => item.message),
  };
});

const validation = {
  source: 'AtDoc Markdown importer + AtDoc parser',
  cases: results.length,
  converted: results.filter(item => item.atdoc_converted).length,
  reparsed_without_diagnostics: results.filter(item => item.atdoc_reparsed_without_diagnostics).length,
  failed: results.filter(item => !item.atdoc_reparsed_without_diagnostics).map(item => item.id),
};
await writeFile(output, JSON.stringify(results, null, 2) + '\n', 'utf8');
await writeFile(validationOutput, JSON.stringify(validation, null, 2) + '\n', 'utf8');
console.log(`Three-way source corpus: ${results.length} cases`);
console.log(`AtDoc conversion and reparse: ${validation.reparsed_without_diagnostics}/${validation.cases}`);
if (validation.failed.length) process.exitCode = 1;
