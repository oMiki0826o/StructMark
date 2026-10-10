import test from "node:test";
import assert from "node:assert/strict";
import {DirectiveRegistry, lexDocument, lexLine, parseDocument, parseInline, serializeAst, getDefaultDirectiveRegistry, normalizeSource} from "../dist/index.js";

test("V1.0 registry exposes separate inline, block, and raw-block directives", () => {
  const registry = getDefaultDirectiveRegistry();
  assert.equal(registry.get("kbd")?.kind, "inline");
  assert.equal(registry.get("note")?.kind, "block");
  assert.equal(registry.get("data")?.kind, "rawBlock");
  assert.equal(registry.get("not-real"), undefined);
});

test("V1.0 source normalization keeps CRLF mapping and UTF-8 byte offsets", () => {
  const source = normalizeSource("甲\r\n\ud83d\ude00\r\n乙");
  assert.equal(source.text, "甲\n\ud83d\ude00\n乙");
  assert.deepEqual(source.originalOffsetAt(2), 3);
  assert.equal(source.byteOffsetAt(2), 5);
  assert.equal(source.textOffsetAtOriginal(3), 2);
});

test("V1.0 parse reports an isolated closing directive without swallowing later blocks", () => {
  const document = parseDocument("&end\n\n#1 Kept");
  assert.equal(document.children[0]?.type, "heading");
  assert.ok(document.diagnostics.some((diagnostic) => diagnostic.code === "MMK-B011"));
});

test("V1.0 parser uses a caller registry for custom block directives", () => {
  const registry = new DirectiveRegistry().register({name: "custom", kind: "block", attributes: ["title"]});
  const document = parseDocument("&custom[title=ok]\nbody\n&end", {registry});
  assert.equal(document.children[0]?.type, "directive");
  assert.equal(document.children[0]?.name, "custom");
  assert.equal(document.diagnostics.length, 0);
});

test("V1.0 directive schemas diagnose unknown attributes without dropping the block", () => {
  const document = parseDocument("&note[title=ok extra=yes]\nbody\n&end");
  assert.equal(document.children[0]?.type, "directive");
  assert.ok(document.diagnostics.some((diagnostic) => diagnostic.code === "MMK-A003"));
});

test("V1.0 lexer classifies block starts without parsing inline content", () => {
  assert.equal(lexLine("#2 Title").kind, "heading");
  assert.equal(lexLine("- [ ] task").kind, "list");
  assert.equal(lexLine("&note[title=hi]").kind, "directive");
  assert.equal(lexLine("&end").kind, "directiveEnd");
  assert.equal(lexLine("*[not a block]").kind, "text");
});

test("V1.0 lexer keeps normalized LF offsets and raw protected lines identifiable", () => {
  const tokens = lexDocument("```json\r\n&note\r\n```");
  assert.deepEqual(tokens.map((token) => token.kind), ["fence", "directive", "fence"]);
  assert.equal(tokens[1]?.start, 8);
  assert.equal(tokens[1]?.line, 2);
});

test("V1.0 inline parser accepts a registered custom directive and preserves its range", () => {
  const registry = new DirectiveRegistry().register({name: "mark", kind: "inline", attributes: ["tone"]});
  const result = parseInline("前 &mark[字][tone=hot] 後", {line: 2, column: 3, offset: 10}, undefined, {registry});
  const node = result.nodes.find((candidate) => candidate.type === "inlineDirective");
  assert.equal(node?.type, "inlineDirective");
  assert.equal(node?.name, "mark");
  assert.equal(node?.range.start.line, 2);
  assert.equal(result.diagnostics.length, 0);
});

test("V1.0 inline registry reports an unknown attribute without losing custom content", () => {
  const registry = new DirectiveRegistry().register({name: "mark", kind: "inline", attributes: ["tone"]});
  const result = parseInline("&mark[字][unknown=x]", undefined, undefined, {registry});
  assert.ok(result.nodes.some((candidate) => candidate.type === "inlineDirective"));
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === "MMK-A003"));
});

test("V1.0 AST serialization is deterministic and preserves diagnostics", () => {
  const first = serializeAst(parseDocument("#1 標題\n\n&end"));
  const second = serializeAst(parseDocument("#1 標題\n\n&end"));
  assert.equal(first, second);
  const parsed = JSON.parse(first);
  assert.equal(parsed.type, "document");
  assert.equal(parsed.diagnostics[0].code, "MMK-B011");
  assert.ok(first.indexOf('"children"') < first.indexOf('"diagnostics"'));
});

test("StructMark uses ampersand block directives", () => {
  const document = parseDocument("&note[title=ok]\nBody\n&end");
  assert.equal(document.children[0]?.type, "directive");
  assert.equal(document.children[0]?.name, "note");
  assert.equal(document.diagnostics.length, 0);
});

test("ampersand directive aliases normalize to canonical names", () => {
  const document = parseDocument("&n[title=ok]\nBody\n&e");
  assert.equal(document.children[0]?.type, "directive");
  assert.equal(document.children[0]?.name, "note");
  assert.equal(document.diagnostics.length, 0);
});

test("ampersand directives allow spaced boolean attributes", () => {
  const document = parseDocument("&test [typing]\nTest\n&e");
  assert.equal(document.children[0]?.type, "directive");
  assert.equal(document.children[0]?.name, "test");
  assert.deepEqual(document.children[0]?.attrs, {typing: true});
  assert.equal(document.diagnostics.length, 0);
});

test("StructMark documents expose the stable 1.1 language version", () => {
  const document = parseDocument("#1 Stable document");
  assert.equal(document.version, "1.1");
});

test("Unicode identifiers normalize canonically before duplicate checks", () => {
  const document = parseDocument("#1 First (\u0023café)\n#1 Second (\u0023cafe\u0301)");
  assert.equal(document.children[0]?.type, "heading");
  assert.equal(document.children[1]?.type, "heading");
  assert.equal(document.children[0]?.id, "café");
  assert.equal(document.children[1]?.id, "café");
  assert.ok(document.diagnostics.some((diagnostic) => diagnostic.code === "MMK-S001"));
});
