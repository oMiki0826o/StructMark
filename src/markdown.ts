/*
 * File: markdown.ts
 * Modification: 2026-10-11 — Preserve inline code/fence delimiters; report lossy conversions.
 */
import {parseDocument} from "./parser.js";
import type {BlockNode, Diagnostic, Document, InlineNode} from "./types.js";

// ── Markdown 匯入 ──
interface Fence { character: string; length: number; }

function markdownInline(source: string): string {
  // Transform only spans outside paired Markdown code-span delimiters.
  const convert = (plain: string): string => plain
    .replace(/\*\*([^*\n]+)\*\*/g, "*[$1]")
    .replace(/__([^_\n]+)__/g, "*[$1]")
    .replace(/~~([^~\n]+)~~/g, "~[$1]");
  let output = "";
  let from = 0;
  for (let index = 0; index < source.length;) {
    if (source[index] === "\\" && index + 1 < source.length) {index += 2; continue;}
    if (source[index] !== "`") {index++; continue;}
    let length = 1;
    while (source[index + length] === "`") length++;
    let closing = -1;
    for (let scan = index + length; scan < source.length;) {
      if (source[scan] !== "`") {scan++; continue;}
      let run = 1;
      while (source[scan + run] === "`") run++;
      if (run === length) {closing = scan; break;}
      scan += run;
    }
    if (closing < 0) {index += length; continue;}
    output += convert(source.slice(from, index));
    output += source.slice(index, closing + length);
    index = closing + length;
    from = index;
  }
  return output + convert(source.slice(from));
}

/** Import the documented Markdown subset without modifying code-span text. */
export function fromMarkdown(source: string): Document {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];
  let fence: Fence | null = null;
  for (const line of lines) {
    const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      output.push(line);
      if (match && match[1]![0] === fence.character && match[1]!.length >= fence.length && !match[2]!.trim()) fence = null;
      continue;
    }
    if (match) {
      // StructMark already supports both tilde and backtick fences.
      output.push(line);
      fence = {character: match[1]![0]!, length: match[1]!.length};
      continue;
    }
    const heading = /^( {0,3})(#{1,6})[ \t]+(.+?)(?:\s+\{#([\p{L}_][\p{L}\p{N}\p{M}_:.-]*)\})?\s*$/u.exec(line);
    if (heading) {
      output.push(`${heading[1]}#${heading[2]!.length} ${markdownInline(heading[3]!)}${heading[4] ? ` (#${heading[4]})` : ""}`);
      continue;
    }
    if (/^ {0,3}>[ \t]?/.test(line)) {
      output.push(markdownInline(line.replace(/^ {0,3}>[ \t]?/, "> ")));
      continue;
    }
    const task = /^(\s*)-[ \t]+\[([ xXoO])\][ \t]+(.*)$/.exec(line);
    if (task) {
      output.push(`${task[1]}- [${/[xXoO]/.test(task[2]! ) ? "o" : " "}] ${markdownInline(task[3]!)}`);
      continue;
    }
    output.push(markdownInline(line));
  }
  return parseDocument(output.join("\n"));
}

// ── Markdown 匯出 ──
function backtickFence(raw: string, minimum = 3): string {
  const runs = raw.match(/`+/g) ?? [];
  return "`".repeat(Math.max(minimum, ...runs.map(part => part.length + 1)));
}
/** Escape table delimiters after inline serialization (including code spans). */
    function escapeMarkdownTableCell(value: string): string {
      return value.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
    }
    function inline(nodes: InlineNode[]): string {
  return nodes.map(node => {
    switch (node.type) {
      case "text": return node.value;
      case "code": {
        const ticks = backtickFence(node.value, 1);
        const padded = /^`|`$|^\s|\s$/.test(node.value) ? ` ${node.value} ` : node.value;
        return `${ticks}${padded}${ticks}`;
      }
      case "strong": return `**${inline(node.children)}**`;
      case "em": return `*${inline(node.children)}*`;
      case "delete": return `~~${inline(node.children)}~~`;
      case "underline": return inline(node.children);
      case "highlight": return inline(node.children);
      case "sup": return `<sup>${inline(node.children)}</sup>`;
      case "sub": return `<sub>${inline(node.children)}</sub>`;
      case "link": return `[${inline(node.label)}](${node.target})`;
      case "image": return `![${inline(node.label)}](${node.target})`;
      case "softbreak": return "\n";
      case "hardbreak": return "  \n";
      case "math": return `$${node.value}$`;
      case "comment": return "";
      case "wiki": return `[[${node.target}${node.label === node.target ? "" : `|${node.label}`}]]`;
      case "ref": return `[${node.target}](#${node.target})`;
      case "footnoteRef": return `[^${node.target}]`;
      case "citation": return `[${node.keys.map(key => `@${key}`).join("; ")}]`;
      default: return "children" in node ? inline(node.children) : "";
    }
  }).join("");
}

export interface MarkdownExportResult {
  readonly source: string;
  readonly diagnostics: readonly Diagnostic[];
}

/** Export representable nodes and report constructs that Markdown cannot preserve. */
export function toMarkdownDetailed(document: Pick<Document, "children">): MarkdownExportResult {
  const diagnostics: Diagnostic[] = [];
  function warn(node: BlockNode, message: string): void {
    diagnostics.push({code: "SMK-C001", severity: "warning", message, position: node.range.start});
  }
  function block(node: BlockNode): string {
    switch (node.type) {
      case "heading": return `${"#".repeat(node.level)} ${inline(node.children)}${node.id ? ` {#${node.id}}` : ""}`;
      case "paragraph": return inline(node.children);
      case "thematicBreak": return "---";
      case "codeBlock": {
        const fence = backtickFence(node.value);
        return `${fence}${node.lang ?? ""}\n${node.value}\n${fence}`;
      }
      case "blockquote": return node.children.map(block).join("\n").split("\n").map(line => `> ${line}`).join("\n");
      case "list": return node.items.map((item, index) => {
        const marker = node.ordered ? `${(node.start ?? 1) + index}.` : "-";
        const body = item.children.map(block).join("\n\n");
        const label = item.task === null ? body : `[${item.task ? "x" : " "}] ${body}`;
        const continuation = " ".repeat(marker.length + 1);
        return `${marker} ${label.replace(/\n/g, `\n${continuation}`)}`;
      }).join("\n");
      case "table": return [
        `| ${node.header.map(cell => escapeMarkdownTableCell(inline(cell))).join(" | ")} |`,
        `| ${node.header.map(() => "---").join(" | ")} |`,
        ...node.rows.map(row => `| ${row.map(cell => escapeMarkdownTableCell(inline(cell))).join(" | ")} |`),
      ].join("\n");
      case "footnoteDef": return `[^${node.id}]: ${inline(node.children)}`;
      case "commentBlock": return "";
      case "directive": {
        // There is no universal Markdown equivalent for arbitrary directives.
        // Keep the directive visible in a StructMark code block rather than
        // silently throwing it away; diagnostics explicitly report the loss.
        warn(node, `Markdown 無法完整表示 &${node.name} 指令；已保留可見的 StructMark 區塊`);
        const fields = Object.entries(node.attrs).map(([key, value]) => {
          if (key === "id") return `#${value}`;
          if (key === "class") return `.${value}`;
          return `${key}=${typeof value === "string" && /[\s\[\]"']/.test(value) ? JSON.stringify(value) : value}`;
        });
        const attributes = fields.length ? `[${fields.join(" ")}]` : "";
        const body = node.raw ?? node.children.map(block).join("\n\n");
        const code = `&${node.name}${attributes}\n${body}\n&end`;
        const fence = backtickFence(code);
        return `${fence}sm\n${code}\n${fence}`;
      }
    }
  }
  // Preserve the exported Markdown but report semantics that are not native Markdown.
  // Diagnostics intentionally use AST source ranges, not positions in exported text.
  function inspectInlineLoss(nodes: readonly InlineNode[]): void {
    for (const node of nodes) {
      if (node.type === "highlight" || node.type === "underline") {
        diagnostics.push({
          code: "SMK-C002", severity: "warning",
          message: `Markdown 無法完整保留 ${node.type} 行內語義`,
          position: node.range.start,
        });
      }
      if ("children" in node) inspectInlineLoss(node.children);
      if ("label" in node && Array.isArray(node.label)) inspectInlineLoss(node.label);
    }
  }
  function inspectBlockLoss(node: BlockNode): void {
    if (node.type === "heading" || node.type === "paragraph" || node.type === "footnoteDef") {
      inspectInlineLoss(node.children);
    } else if (node.type === "table") {
      node.header.forEach(inspectInlineLoss);
      node.rows.forEach(row => row.forEach(inspectInlineLoss));
    } else if (node.type === "blockquote" || node.type === "directive") {
      node.children.forEach(inspectBlockLoss);
    } else if (node.type === "list") {
      node.items.forEach(item => item.children.forEach(inspectBlockLoss));
    }
  }
  document.children.forEach(inspectBlockLoss);
  const blocks = document.children.map(block).filter(Boolean);
  return {source: blocks.length ? blocks.join("\n\n") + "\n" : "", diagnostics};
}

/** Compatibility convenience API; use toMarkdownDetailed to detect loss. */
export function toMarkdown(document: Pick<Document, "children">): string {
  return toMarkdownDetailed(document).source;
}
