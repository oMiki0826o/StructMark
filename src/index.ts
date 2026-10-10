/*
 * File: index.ts
 * Modification: 2026-10-10 — V0.4 匯出語義與複雜表格驗證器。
 */
export {parseDocument} from "./parser.js";
export type {ParseOptions} from "./parser.js";
export {parseInline, normalizeMath} from "./inline.js";
export type {InlineParseOptions} from "./inline.js";
export {readAttributes} from "./attributes.js";
export {renderHtml, renderInline, escapeHtml, parseDelimited} from "./html.js";
export type {Document, BlockNode, InlineNode, Diagnostic, SourceRange, Attributes} from "./types.js";

export {parseStructuredTable} from "./structured_table.js";
export {validateSemantics} from "./semantic.js";
export {DirectiveRegistry, getDefaultDirectiveRegistry} from "./registry.js";
export type {DirectiveDefinition, DirectiveKind} from "./registry.js";
export {normalizeSource} from "./source.js";
export type {NormalizedSource} from "./source.js";
export {lexLine, lexDocument} from "./lexer.js";
export type {BlockToken, BlockTokenKind} from "./lexer.js";
export {serializeAst} from "./serialize.js";
