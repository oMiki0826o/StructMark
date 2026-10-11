/*
 * File: code-blocks.tsx
 * Modification: 2026-10-11 — 文件程式碼語言標籤、複製按鈕與安全高亮。
 */
"use client";

import {useEffect} from "react";
import {usePathname} from "next/navigation";

// ── 程式碼類型 ──
const LANGUAGE_LABELS: Record<string, [string, string]> = {
  sm: ["StructMark · .sm", "StructMark · .sm"],
  html: ["HTML 輸出", "HTML output"],
  typescript: ["TypeScript", "TypeScript"],
  ts: ["TypeScript", "TypeScript"],
  javascript: ["JavaScript", "JavaScript"],
  js: ["JavaScript", "JavaScript"],
  bash: ["終端機", "Terminal"],
  shell: ["終端機", "Terminal"],
  json: ["JSON 資料", "JSON data"],
  text: ["純文字", "Plain text"],
  ebnf: ["EBNF 文法", "EBNF grammar"],
};

function highlight(code: HTMLElement, language: string): void {
  const input = code.textContent ?? "";
  let pattern: RegExp | null = null;
  if (language === "sm") {
    pattern = /(&[a-z][a-z\d_:-]*|#[1-6](?=[ \t])|\/\*\[|\*\[|\/\[|~\[|-\[|=\[|\^\[|_\[)/gi;
  } else if (language === "html") {
    pattern = /(<\/?[a-z][\w:-]*|\b[a-z-]+(?==)|"[^"\n]*"|>)/gi;
  }
  if (!pattern) return;
  const fragment = document.createDocumentFragment();
  let offset = 0;
  for (const match of input.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > offset) fragment.append(document.createTextNode(input.slice(offset, index)));
    const element = document.createElement("span");
    element.className = language === "html"
      ? (match[0].startsWith('"') ? "code-token-string" : "code-token-tag")
      : match[0].startsWith("&") ? "code-token-directive" : "code-token-marker";
    element.textContent = match[0];
    fragment.append(element);
    offset = index + match[0].length;
  }
  if (offset === 0) return;
  fragment.append(document.createTextNode(input.slice(offset)));
  code.replaceChildren(fragment);
}

// ── 文件內 code fence 漸進增強 ──
export default function CodeBlocks(): null {
  const pathname = usePathname();
  const english = pathname?.startsWith("/en/") || pathname === "/en";

  useEffect(() => {
    const controllers: AbortController[] = [];
    const decorated: Array<{wrapper: HTMLElement; pre: HTMLElement; code: HTMLElement; source: string}> = [];
    for (const pre of document.querySelectorAll<HTMLElement>(".docs-content pre")) {
      if (pre.parentElement?.hasAttribute("data-sm-code-block")) continue;
      const code = pre.querySelector<HTMLElement>("code");
      if (!code) continue;
      const source = code.textContent ?? "";
      const language = code.className.match(/\blanguage-([\w-]+)/)?.[1]?.toLowerCase() ?? "text";
      const [zhName, enName] = LANGUAGE_LABELS[language] ?? [language.toUpperCase(), language.toUpperCase()];
      const wrapper = document.createElement("div");
      wrapper.className = `code-block code-block--${/^[\w-]+$/.test(language) ? language : "text"}`;
      wrapper.setAttribute("data-sm-code-block", "");
      const toolbar = document.createElement("div");
      toolbar.className = "code-block-toolbar";
      const label = document.createElement("span");
      label.className = "code-language";
      label.textContent = english ? enName : zhName;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.setAttribute("aria-label", english ? `Copy ${enName} code` : `複製${zhName}程式碼`);
      button.textContent = english ? "Copy" : "複製";
      const controller = new AbortController();
      controllers.push(controller);
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(source);
          button.textContent = english ? "Copied" : "已複製";
          window.setTimeout(() => {
            if (button.isConnected) button.textContent = english ? "Copy" : "複製";
          }, 1700);
        } catch {
          button.textContent = english ? "Copy unavailable" : "複製失敗";
        }
      }, {signal: controller.signal});
      highlight(code, language);
      toolbar.append(label, button);
      pre.before(wrapper);
      wrapper.append(toolbar, pre);
      decorated.push({wrapper, pre, code, source});
    }
    return () => {
      controllers.forEach(controller => controller.abort());
      // React development strict mode runs effect cleanup + setup twice.
      // Restore original DOM so the second setup can register a live copy button.
      for (const {wrapper, pre, code, source} of decorated) {
        if (!wrapper.isConnected) continue;
        wrapper.before(pre);
        wrapper.remove();
        code.textContent = source;
      }
    };
  }, [pathname, english]);

  return null;
}
