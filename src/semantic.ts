/*
 * File: semantic.ts
 * Modification: 2026-10-10 — V0.4 將 ID、註腳、交叉參照語義驗證自區塊解析器拆分。
 */
import type {BlockNode, Diagnostic, Document, InlineNode} from "./types.js";

export interface WorkspaceDocument { readonly path: string; readonly document: Pick<Document, "children">; }

/** POSIX-style canonicalization without Node path imports (this module also runs in browsers). */
function normalizeWorkspacePath(path: string): string {
  const parts: string[] = [];
  for (const part of path.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") { parts.pop(); continue; }
    parts.push(part);
  }
  return parts.join("/");
}

// ── 文件層識別碼與參照 ──
export function validateSemantics(document: Pick<Document, "children">): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const identifiers = new Set<string>();
  const footnotes = new Set<string>();
  const references: InlineNode[] = [];
  const footnoteReferences: InlineNode[] = [];
  function issue(code: string, message: string, line: number, column = 1, offset?: number): void {
    diagnostics.push({code, severity: "warning", message, position: {line, column, ...(offset === undefined ? {} : {offset})}});
  }
  function addId(id: string, line: number, column: number, offset?: number): void {
    if (identifiers.has(id)) issue("MMK-S001", `重複 ID：${id}`, line, column, offset);
    identifiers.add(id);
  }
  function visitInline(nodes: InlineNode[]): void {
    for (const node of nodes) {
      if (node.type === "ref") references.push(node);
      if (node.type === "footnoteRef") footnoteReferences.push(node);
      if ("attrs" in node && typeof node.attrs.id === "string") {
        addId(node.attrs.id, node.range.start.line, node.range.start.column, node.range.start.offset);
      }
      if ("children" in node) visitInline(node.children);
      if ("label" in node && Array.isArray(node.label)) visitInline(node.label);
    }
  }
  function visit(nodes: BlockNode[]): void {
    for (const node of nodes) {
      const p = node.range.start;
      if (node.type === "heading" && node.id) addId(node.id, p.line, p.column, p.offset);
      if (node.type === "footnoteDef") {
        if (footnotes.has(node.id)) issue("MMK-S002", `重複註腳定義：${node.id}`, p.line, p.column, p.offset);
        footnotes.add(node.id);
      }
      if (node.type === "directive" && typeof node.attrs.id === "string") addId(node.attrs.id, p.line, p.column, p.offset);
      if (node.type === "paragraph" || node.type === "heading" || node.type === "footnoteDef") visitInline(node.children);
      if (node.type === "table") {
        node.header.forEach(visitInline);
        node.rows.forEach(row => row.forEach(visitInline));
      }
      if (node.type === "blockquote" || node.type === "directive") visit(node.children);
      if (node.type === "list") node.items.forEach(item => visit(item.children));
    }
  }
  visit(document.children);
  for (const node of references) {
    if (node.type !== "ref" || identifiers.has(node.target)) continue;
    // Cross-document targets are validated by validateWorkspace(), not here.
    const separator = node.target.lastIndexOf("#");
    if (separator > 0 && node.target.slice(0, separator).endsWith(".sm")) continue;
    const p = node.range.start;
    issue("MMK-S003", `未找到參照目標：${node.target}`, p.line, p.column, p.offset);
  }
  for (const node of footnoteReferences) {
    if (node.type !== "footnoteRef" || footnotes.has(node.target)) continue;
    const p = node.range.start;
    issue("MMK-S004", `未找到註腳定義：${node.target}`, p.line, p.column, p.offset);
  }
  return diagnostics;
}

/** Validate references that explicitly name another .sm document: path#id. */
export function validateWorkspace(documents: readonly WorkspaceDocument[]): Diagnostic[] {
  const idsByPath = new Map<string, Set<string>>();
  const references: Array<{path: string; node: InlineNode & {type: "ref"; target: string}}> = [];
  function collectIds(path: string, nodes: readonly BlockNode[]): void {
    const ids = idsByPath.get(path) ?? new Set<string>();
    idsByPath.set(path, ids);
    const collectInline = (inline: readonly InlineNode[]): void => {
      for (const node of inline) {
        if ("attrs" in node && typeof node.attrs.id === "string") ids.add(node.attrs.id);
        if (node.type === "ref") references.push({path, node: node as InlineNode & {type: "ref"; target: string}});
        if ("children" in node) collectInline(node.children);
        if ("label" in node && Array.isArray(node.label)) collectInline(node.label);
      }
    };
    for (const node of nodes) {
      if (node.type === "heading" && node.id) ids.add(node.id);
      if (node.type === "directive" && typeof node.attrs.id === "string") ids.add(node.attrs.id);
      if (node.type === "footnoteDef") ids.add(node.id);
      if (node.type === "paragraph" || node.type === "heading" || node.type === "footnoteDef") collectInline(node.children);
      if (node.type === "table") { node.header.forEach(collectInline); node.rows.forEach(row => row.forEach(collectInline)); }
      if (node.type === "blockquote" || node.type === "directive") collectIds(path, node.children);
      if (node.type === "list") node.items.forEach(item => collectIds(path, item.children));
    }
  }
  for (const entry of documents) collectIds(normalizeWorkspacePath(entry.path), entry.document.children);
  const diagnostics: Diagnostic[] = [];
  for (const reference of references) {
    const hash = reference.node.target.lastIndexOf("#");
    const rawPath = hash > 0 ? reference.node.target.slice(0, hash) : reference.path;
    const targetPath = hash > 0 && /^\.{1,2}\//.test(rawPath)
      ? normalizeWorkspacePath(reference.path.replace(/[^/]*$/, "") + rawPath)
      : normalizeWorkspacePath(rawPath);
    const targetId = hash > 0 ? reference.node.target.slice(hash + 1) : reference.node.target;
    if (!idsByPath.get(targetPath)?.has(targetId)) {
      const p = reference.node.range.start;
      diagnostics.push({code: "MMK-S005", severity: "warning", message: `未找到跨文件參照目標：${reference.node.target}`, position: p});
    }
  }
  return diagnostics;
}
