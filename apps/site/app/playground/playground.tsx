/*
 * File: playground.tsx
 * Modification: 2026-10-11 — 清爽雙欄 Playground、明確編輯器標籤與診斷清單。
 */
"use client";

import {useMemo, useState} from "react";
import {parseDocument, renderHtml} from "../../../../src/index";
import {copy} from "../../lib/copy";
import type {Locale} from "../../lib/content-types";

const initial = {
  "zh-tw": `#1 StructMark Playground\n\n這是一份可以編輯的文件。\n\n*[粗體] 與 /[斜體]。\n\n&note[title="提示"]\n右側會即時顯示 HTML 結果。\n&end`,
  en: `#1 StructMark Playground\n\nThis document is editable.\n\n*[Bold] and /[italic] text.\n\n&note[title="Note"]\nThe HTML preview updates as you type.\n&end`,
};

// ── 編輯器與即時預覽 ──
export default function Playground({locale = "zh-tw"}: {locale?: Locale}) {
  const [source, setSource] = useState(initial[locale]);
  const {html, diagnostics} = useMemo(() => {
    const document = parseDocument(source);
    return {html: renderHtml(document, {math: "katex"}), diagnostics: document.diagnostics};
  }, [source]);
  const text = copy[locale];
  const english = locale === "en";
  return (
    <div className="container playground">
      <div className="playground-heading">
        <span className="eyebrow">STRUCTMARK / LIVE EDITOR</span>
        <h1>Playground</h1>
        <p className="lead">{text.edit}</p>
      </div>
      <div className="playground-grid">
        <section className="editor-panel" aria-label={english ? "Source code" : "原始碼"}>
          <div className="panel-label">
            <label htmlFor="source-input">{text.source} · .sm</label>
            <span className="panel-meta">UTF-8</span>
          </div>
          <textarea id="source-input" className="editor" value={source} onChange={event => setSource(event.target.value)}
            spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" aria-describedby="editor-help" />
          <div className="no-diagnostics" id="editor-help">
            {english ? "Edit the source above. Changes appear on the right." : "編輯上方來源，右側即時預覽。"}
          </div>
        </section>
        <section className="editor-panel" aria-label={english ? "Preview" : "預覽"}>
          <div className="panel-label">
            <span>{text.preview}</span><span className="panel-meta">HTML</span>
          </div>
          <div className="preview content-rendered" dangerouslySetInnerHTML={{__html: html}} />
          {diagnostics.length > 0 ? (
            <div className="diagnostic" role="status" aria-live="polite">
              <p>{english ? `${diagnostics.length} diagnostic(s)` : `${diagnostics.length} 項診斷`}</p>
              <ul>{diagnostics.map((d, index) => <li key={`${d.code}-${index}`}>
                <strong>{d.code}</strong> · {english ? "Line" : "第"} {d.position.line}{english ? "" : " 行"}：{d.message}
              </li>)}</ul>
            </div>
          ) : <div className="no-diagnostics" role="status">{english ? "No diagnostics" : "沒有診斷訊息"}</div>}
        </section>
      </div>
    </div>
  );
}
