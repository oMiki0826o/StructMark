/*
 * File: html.ts
 * Modification: 2026-10-10 — V0.4 結構化表格共用驗證器與命名空間指令保留。
 */
import type {Attributes, BlockNode, Document, InlineNode} from "./types.js";
import {parseStructuredTable} from "./structured_table.js";

// ── 基礎跳脫與資源安全 ──
export function escapeHtml(raw: string): string {
  return raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function safeUrl(target: string, image = false): string | null {
  const url = target.trim();
  if (/[\u0000-\u001F\u007F]/.test(url) || url.startsWith("//")) return null;
  // URL 不准許 javascript:, data:, vbscript:, file: 等可執行或高風險協定。
  const scheme = /^([a-zA-Z][a-zA-Z\d+.-]*):/.exec(url)?.[1]?.toLowerCase();
  if (scheme && !((scheme === "http" || scheme === "https") || (!image && scheme === "mailto"))) return null;
  return url;
}
function htmlAttrs(attrs: Attributes, forImage = false): string {
  const allowed = forImage ? ["id", "class", "width", "height", "title"] : ["id", "class", "title", "lang"];
  let html = "";
  for (const name of allowed) {
    const val = attrs[name];
    if (val === undefined) continue;
    if ((name === "width" || name === "height") && (typeof val !== "number" || val < 1 || val > 10000)) continue;
    if (name === "id" && !/^[\p{L}_][\p{L}\p{N}_.:-]*$/u.test(String(val))) continue;
    if (name === "class" && !/^[\w\s-]+$/.test(String(val))) continue;
    if (name === "lang" && !/^[a-zA-Z\d-]+$/.test(String(val))) continue;
    html += ` ${name}="${escapeHtml(String(val))}"`;
  }
  return html;
}
function textOf(nodes: InlineNode[]): string {
  return nodes.map(n => {
    if (n.type === "text" || n.type === "code" || n.type === "math") return n.value;
    if ("children" in n) return textOf(n.children);
    if ("label" in n) return typeof n.label === "string" ? n.label : textOf(n.label);
    return "";
  }).join("");
}

// ── 行內語義呈現 ──
export function renderInline(nodes: InlineNode[]): string {
  return nodes.map(node => {
    switch (node.type) {
      case "text": return escapeHtml(node.value);
      case "comment": return "";
      case "code": return `<code>${escapeHtml(node.value)}</code>`;
      case "math": return `<span class="math" data-tex="${escapeHtml(node.value)}">\\(${escapeHtml(node.value)}\\)</span>`;
      case "softbreak": return "\n";
      case "hardbreak": return "<br>\n";
      case "wiki": return `<span class="wiki" data-target="${escapeHtml(node.target)}">${escapeHtml(node.label)}</span>`;
      case "ref": return `<a class="xref" href="#${escapeHtml(node.target)}">${escapeHtml(node.target)}</a>`;
      case "footnoteRef": return `<sup><a href="#fn-${escapeHtml(node.target)}">${escapeHtml(node.target)}</a></sup>`;
      case "inlineDirective": return `<span data-structmark-directive="${escapeHtml(node.name)}"${htmlAttrs(node.attrs)}>${renderInline(node.children)}</span>`;
      case "citation": return `<span class="citation" data-keys="${escapeHtml(node.keys.join(" "))}">[${escapeHtml(node.keys.map(k => "&" + k).join("; "))}${node.locator ? ", " + escapeHtml(node.locator) : ""}]</span>`;
      case "link": {
        const url = safeUrl(node.target);
        return url ? `<a href="${escapeHtml(url)}"${htmlAttrs(node.attrs)}>${renderInline(node.label)}</a>` : renderInline(node.label);
      }
      case "image": {
        const url = safeUrl(node.target, true);
        return url ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(textOf(node.label))}"${htmlAttrs(node.attrs, true)}>` : escapeHtml(textOf(node.label));
      }
      default: {
        const tag: Record<string, string> = {strong:"strong", em:"em", underline:"u", delete:"del", highlight:"mark", sup:"sup", sub:"sub", kbd:"kbd", abbr:"abbr", term:"dfn", var:"var", lang:"span"};
        const element = tag[node.type] ?? "span";
        return `<${element}${htmlAttrs(node.attrs)}>${renderInline(node.children)}</${element}>`;
      }
    }
  }).join("");
}

// ── 表格資料解析（RFC 4180 型式 CSV，允許引號中的換行與逗號）──
export function parseDelimited(text: string, delimiter: "," | "\t"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closedQuote = false;
  for (let p = 0; p < text.length; p++) {
    const ch = text[p]!;
    if (quoted) {
      if (ch === '"' && text[p + 1] === '"') {field += '"'; p++;}
      else if (ch === '"') {quoted = false; closedQuote = true;}
      else field += ch;
      continue;
    }
    if (ch === '"' && field === "" && !closedQuote) {quoted = true; continue;}
    if (ch === delimiter) {row.push(field); field = ""; closedQuote = false; continue;}
    if (ch === "\n") {row.push(field); rows.push(row); row = []; field = ""; closedQuote = false; continue;}
    if (closedQuote && !/\s/.test(ch)) throw new Error("CSV 引號結束後出現不合法文字");
    if (!closedQuote) field += ch;
  }
  if (quoted) throw new Error("CSV 引號未閉合");
  if (field !== "" || row.length || !text.endsWith("\n")) {row.push(field); rows.push(row);}
  return rows;
}
function renderTableCells(header: string[], body: string[][]): string {
  if (header.length === 0 || header.length > 128 || body.length > 10000) return "<p>表格超出限制</p>";
  const th = header.map(s => `<th>${escapeHtml(s)}</th>`).join("");
  const tr = body.map(row => `<tr>${Array.from({length: header.length}, (_, i) => `<td>${escapeHtml(row[i] ?? "")}</td>`).join("")}</tr>`).join("\n");
  return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}
function renderStructuredTable(raw: string): string {
  const result = parseStructuredTable(raw);
  if (!result.value) return `<pre class="invalid-data">${escapeHtml(raw)}</pre>`;
  const data = result.value;
  const heading = `<tr>${data.columns.map(x => `<th>${escapeHtml(x)}</th>`).join("")}</tr>`;
  const body = data.rows.map(row => `<tr>${row.map(c => {
    const colspan = c.colspan > 1 ? ` colspan="${c.colspan}"` : "";
    const rowspan = c.rowspan > 1 ? ` rowspan="${c.rowspan}"` : "";
    return `<td${colspan}${rowspan}>${escapeHtml(c.text)}</td>`;
  }).join("")}</tr>`).join("\n");
  return `<table><thead>${heading}</thead><tbody>${body}</tbody></table>`;
}

// ── 區塊語義呈現 ──
export function renderHtml(document: Document): string {
  function block(node: BlockNode): string {
    switch (node.type) {
      case "heading": return `<h${node.level}${node.id ? ` id="${escapeHtml(node.id)}"` : ""}>${renderInline(node.children)}</h${node.level}>`;
      case "paragraph": return `<p>${renderInline(node.children)}</p>`;
      case "thematicBreak": return "<hr>";
      case "commentBlock": return "";
      case "codeBlock": return `<pre><code${node.lang && /^[a-zA-Z\d_.+-]+$/.test(node.lang) ? ` class="language-${escapeHtml(node.lang)}"` : ""}>${escapeHtml(node.value)}</code></pre>`;
      case "footnoteDef": return `<p class="footnote" id="fn-${escapeHtml(node.id)}"><sup>${escapeHtml(node.id)}</sup> ${renderInline(node.children)}</p>`;
      case "blockquote": return `<blockquote>\n${node.children.map(block).join("\n")}\n</blockquote>`;
      case "list": {
        const tag = node.ordered ? "ol" : "ul";
        const start = node.ordered && node.start !== null && node.start !== 1 ? ` start="${node.start}"` : "";
        const content = node.items.map(item => {
          const checkbox = item.task !== null ? `<input type="checkbox" disabled${item.task ? " checked" : ""}> ` : "";
          const parts = item.children.map(block);
          if (parts[0]?.startsWith("<p>")) parts[0] = parts[0].replace(/^<p>/, "").replace(/<\/p>$/, "");
          return `<li>${checkbox}${parts.join("\n")}</li>`;
        }).join("\n");
        return `<${tag}${start}>\n${content}\n</${tag}>`;
      }
      case "table": {
        const attr = (i: number): string => node.aligns[i] ? ` class="align-${node.aligns[i]}"` : "";
        const head = `<tr>${node.header.map((h, i) => `<th${attr(i)}>${renderInline(h)}</th>`).join("")}</tr>`;
        const body = node.rows.map(row => `<tr>${row.map((cell, i) => `<td${attr(i)}>${renderInline(cell)}</td>`).join("")}</tr>`).join("\n");
        return `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
      }
      case "directive": {
        const attrs = htmlAttrs(node.attrs);
        const label = typeof node.attrs.title === "string" ? `<p class="directive-title">${escapeHtml(node.attrs.title)}</p>` : "";
        if (node.name === "equation" || node.name === "math") return `<div class="equation"${attrs}><pre class="math" data-tex="${escapeHtml(node.raw ?? "")}">${escapeHtml(node.raw ?? "")}</pre></div>`;
        if (node.name === "raw") return `<pre${attrs}>${escapeHtml(node.raw ?? "")}</pre>`;
        if (node.name === "data") return `<pre class="structured-data"${attrs}>${escapeHtml(node.raw ?? "")}</pre>`;
        if (node.name === "table") {
          const mode = node.attrs.format;
          if (mode === "json") return `<div class="data-table"${attrs}>${renderStructuredTable(node.raw ?? "")}</div>`;
          if (mode === "csv" || mode === "tsv") {
            try {
              const data = parseDelimited(node.raw ?? "", mode === "csv" ? "," : "\t");
              const header = data.shift() ?? [];
              return `<div class="data-table"${attrs}>${renderTableCells(header, data)}</div>`;
            } catch {return `<pre class="invalid-data">${escapeHtml(node.raw ?? "")}</pre>`;}
          }
          return `<pre class="invalid-data">${escapeHtml(node.raw ?? "")}</pre>`;
        }
        const safeClass = node.name.replace(/[^a-z0-9_:-]/g, "-");
        const element = node.name === "details" ? "details" : "aside";
        return `<${element} class="directive directive-${safeClass}"${attrs}>${label}${node.children.map(block).join("\n")}</${element}>`;
      }
    }
  }
  return document.children.map(block).filter(Boolean).join("\n") + "\n";
}
