#!/usr/bin/env node
/* Compare Markdown's imported AST with the AST produced by its .sm source. */
import {readFile, writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {fromMarkdown, parseDocument} from "../dist/index.js";

const root = resolve(import.meta.dirname);
const corpus = JSON.parse(await readFile(resolve(root, "corpus.json"), "utf8"));
const output = resolve(root, "semantic-equivalence.json");

function canonical(value, key = "") {
  if (key === "diagnostics" || key === "position" || key === "range") return undefined;
  if (Array.isArray(value)) return value.map(item => canonical(item)).filter(item => item !== undefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([name, item]) => [name, canonical(item, name)])
      .filter(([, item]) => item !== undefined));
  }
  return value;
}

const results = corpus.map(sample => {
  const imported = fromMarkdown(sample.markdown);
  const native = parseDocument(sample.structmark);
  const importedAst = canonical(imported);
  const nativeAst = canonical(native);
  const diagnostics = [...imported.diagnostics, ...native.diagnostics];
  return {
    id: sample.id,
    equivalent: JSON.stringify(importedAst) === JSON.stringify(nativeAst) && diagnostics.length === 0,
    diagnostics: diagnostics.map(item => item.code),
    markdown_sha256: createHash("sha256").update(sample.markdown).digest("hex"),
    structmark_sha256: createHash("sha256").update(sample.structmark).digest("hex"),
  };
});

const summary = {
  corpus: "corpus.json",
  cases: results.length,
  passed: results.filter(item => item.equivalent).length,
  failed: results.filter(item => !item.equivalent).length,
  results,
};
await writeFile(output, JSON.stringify(summary, null, 2) + "\n", "utf8");
console.log(`Semantic equivalence: ${summary.passed}/${summary.cases} passed`);
console.log(`Wrote ${output}`);
if (summary.failed) process.exitCode = 1;
