/*
 * File: playground.tsx
 * Modification: 2026-10-11 — 保存草稿、切換語言不遺失內容、延遲解析與明確診斷。
 */
"use client";

import {useEffect, useMemo, useState} from "react";
import {parseDocument, renderHtml} from "../../../../src/index";
import {copy} from "../../lib/copy";
import {MAX_DRAFT_LENGTH, draftStorageAvailable, loadDraft, resetDraft, saveDraft} from "../../lib/draft";
import type {Locale} from "../../lib/content-types";

const initial = {
  "zh-tw": `#1 StructMark Playground\n\n這是一份可以編輯的文件。\n\n*[粗體] 與 /[斜體]。\n\n&note[title="提示"]\n右側會即時顯示 HTML 結果。\n&end`,
  en: `#1 StructMark Playground\n\nThis document is editable.\n\n*[Bold] and /[italic] text.\n\n&note[title="Note"]\nThe HTML preview updates as you type.\n&end`,
};
const MAX_PARSE_LENGTH = 150_000;

// ── 編輯器、草稿與延遲解析 ──
export default function Playground({locale = "zh-tw"}: {locale?: Locale}) {
  const english = locale === "en";
  const text = copy[locale];
  const [source, setSource] = useState(initial[locale]);
  const [parsedSource, setParsedSource] = useState(initial[locale]);
  const [storageReady, setStorageReady] = useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const previous = loadDraft();
    if (previous !== null) {
      setSource(previous);
      setParsedSource(previous);
      setSaved(draftStorageAvailable());
    } else {
      // 預設範例也納入儲存，以免切換語系時誤以為草稿已被保存。
      setSaved(saveDraft(initial[locale]));
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setParsedSource(source), 180);
    return () => window.clearTimeout(timer);
  }, [source]);

  const result = useMemo(() => {
    if (parsedSource.length > MAX_PARSE_LENGTH) {
      return {html: "", diagnostics: [] as {code: string; message: string; position: {line: number}}[], error: english
        ? "The document exceeds the live preview limit (150,000 characters). Its source remains intact."
        : "文件超過即時預覽上限（150,000 字元），來源內容仍會保留。"};
    }
    try {
      const document = parseDocument(parsedSource);
      return {html: renderHtml(document, {math: "katex"}), diagnostics: document.diagnostics, error: ""};
    } catch {
      return {html: "", diagnostics: [] as {code: string; message: string; position: {line: number}}[], error: english
        ? "Unable to render this input. The original source was retained."
        : "目前無法渲染這份輸入，原始文字已保留。"};
    }
  }, [parsedSource, english]);

  function handleReset(): void {
    const approved = window.confirm(english ? "Replace the current draft with the default example?" : "要捨棄目前草稿並恢復預設範例嗎？");
    if (!approved) return;
    resetDraft();
    setSource(initial[locale]);
    setSaved(saveDraft(initial[locale]));
  }

  const draftStatus = source.length > MAX_DRAFT_LENGTH ?
    (english ? "Too large to auto-save" : "內容過大，無法自動儲存") : !storageReady ?
    (english ? "Loading draft" : "載入草稿中") : saved ?
    (english ? "Saved locally" : "已儲存在本機") : (english ? "Saving unavailable" : "無法使用本機儲存");

  return (
    <div className="container playground">
      <div className="playground-heading">
        <span className="eyebrow">{english ? "Try the language" : "試用語言"}</span>
        <h1>Playground</h1>
        <p className="lead">{text.edit}</p>
        <div className="playground-actions">
          <span className="draft-state" role="status" aria-live="polite">{draftStatus}</span>
          <button className="reset-button" type="button" onClick={handleReset} aria-label={english ? "Reset to sample" : "重設為預設範例"}>
            {english ? "Reset example" : "恢復範例"}
          </button>
        </div>
      </div>
      <div className="playground-grid">
        <section className="editor-panel" aria-label={english ? "Source code" : "原始碼"}>
          <div className="panel-label"><label htmlFor="source-input">{text.source} · .sm</label><span className="panel-meta">UTF-8</span></div>
          <textarea id="source-input" className="editor" value={source} onChange={event => {setSource(event.target.value); setSaved(saveDraft(event.target.value));}}
            disabled={!storageReady} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" aria-describedby="editor-help" />
          <div className="no-diagnostics" id="editor-help">{english ? "Edit the source. The preview updates below or to the right." : "編輯原始碼；預覽會在下方或右側更新。"}</div>
        </section>
        <section className="editor-panel" aria-label={english ? "Preview" : "預覽"}>
          <div className="panel-label"><span>{text.preview}</span><span className="panel-meta">HTML</span></div>
          {result.error ? <div className="preview-error" role="alert">{result.error}</div> :
            <div className="preview content-rendered" dangerouslySetInnerHTML={{__html: result.html}} />}
          {result.error ? (
            <div className="no-diagnostics" role="status">{english ? "Preview paused" : "預覽已暫停"}</div>
          ) : result.diagnostics.length > 0 ? (
            <div className="diagnostic" role="status" aria-live="polite">
              <p>{english ? `${result.diagnostics.length} diagnostic(s)` : `${result.diagnostics.length} 項診斷`}</p>
              <ul>{result.diagnostics.map((d, index) => <li key={`${d.code}-${index}`}><strong>{d.code}</strong> ·
                {english ? ` Line ${d.position.line}` : ` 第 ${d.position.line} 行`}：{d.message}</li>)}</ul>
            </div>
          ) : <div className="no-diagnostics" role="status">{english ? "No diagnostics" : "沒有診斷訊息"}</div>}
        </section>
      </div>
    </div>
  );
}
