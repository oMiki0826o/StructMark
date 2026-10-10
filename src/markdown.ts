import {parseDocument} from "./parser.js";
import type {BlockNode, Document, InlineNode} from "./types.js";

/** Convert the documented Markdown subset to StructMark source, then parse it. */
export function fromMarkdown(source: string): Document {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];
  let inFence = false;
  for (const line of lines) {
    const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      output.push(inFence ? fence[1]! : "```" + fence[2]!.trim());
      inFence = !inFence;
      continue;
    }
    if (inFence) {output.push(line); continue;}
    const heading = /^( {0,3})(#{1,6})[ \t]+(.+?)(?:\s+\{#([\p{L}_][\p{L}\p{N}_:.-]*)\})?\s*$/u.exec(line);
    if (heading) {output.push(`${heading[1]}#${heading[2]!.length} ${heading[3]}${heading[4] ? ` (#${heading[4]})` : ""}`); continue;}
    if (/^ {0,3}>[ \t]?/.test(line)) {output.push(line.replace(/^ {0,3}>[ \t]?/, "> ")); continue;}
    const task = /^(\s*)-[ \t]+\[([ xXoO])\][ \t]+(.*)$/.exec(line);
    if (task) {output.push(`${task[1]}- [${/[xX]/.test(task[2]!) ? "o" : " "}] ${task[3]}`); continue;}
    output.push(line
      .replace(/\*\*([^*\n]+)\*\*/g, "*[$1]")
      .replace(/__([^_\n]+)__/g, "*[$1]")
      .replace(/~~([^~\n]+)~~/g, "~[$1]"));
  }
  return parseDocument(output.join("\n"));
}

function inline(nodes: InlineNode[]): string {
  return nodes.map(node => {
    switch (node.type) {
      case "text": return node.value;
      case "code": return `\`${node.value.replace(/`/g, "\\`")}\``;
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

/** Serialize the representable AST subset as readable Markdown. */
export function toMarkdown(document: Pick<Document, "children">): string {
  function block(node: BlockNode): string {
    switch (node.type) {
      case "heading": return `${"#".repeat(node.level)} ${inline(node.children)}${node.id ? ` {#${node.id}}` : ""}`;
      case "paragraph": return inline(node.children);
      case "thematicBreak": return "---";
      case "codeBlock": return `\`\`\`${node.lang ?? ""}\n${node.value}\n\`\`\``;
      case "blockquote": return node.children.map(block).join("\n").split("\n").map(line => `> ${line}`).join("\n");
      case "list": return node.items.map(item => {
        const marker = node.ordered ? `${node.start ?? 1}.` : "-";
        const body = item.children.map(block).join("\n");
        return `${marker} ${item.task === null ? body : `[${item.task ? "x" : " "}] ${body}`}`;
      }).join("\n");
      case "table": return [
        `| ${node.header.map(inline).join(" | ")} |`,
        `| ${node.header.map(() => "---").join(" | ")} |`,
        ...node.rows.map(row => `| ${row.map(inline).join(" | ")} |`),
      ].join("\n");
      case "footnoteDef": return `[^${node.id}]: ${inline(node.children)}`;
      case "commentBlock": return "";
      case "directive": return node.raw ? node.raw : node.children.map(block).join("\n");
    }
  }
  return document.children.map(block).filter(Boolean).join("\n\n") + "\n";
}
