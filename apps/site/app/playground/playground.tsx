/*
 * File: playground.tsx
 * Modification: 2026-10-11 — 保存草稿、切換語言不遺失內容、延遲解析與明確診斷。
 */
"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {parseDocument, renderHtml, serializeAst} from "../../../../src/index";
import AstTree from "../../components/ast-tree";
import {editorOffset} from "../../lib/ast-tree";
import type {SourceRange} from "../../../../src/types";
import {playgroundExamples} from "../../lib/playground-examples";
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
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [activeExample, setActiveExample] = useState('custom');
  const [view, setView] = useState<'preview' | 'ast' | 'tree'>('preview');
  const [source, setSource] = useState(initial[locale]);
  const [parsedSource, setParsedSource] = useState(initial[locale]);
  const [storageReady, setStorageReady] = useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const previous = loadDraft();
    let transferred: string | null = null;
    try {
      transferred = window.sessionStorage.getItem("structmark.playground.pending.v1");
      window.sessionStorage.removeItem("structmark.playground.pending.v1");
    } catch { /* 仍然允許一般編輯。 */ }
    if (transferred !== null && transferred.length <= MAX_DRAFT_LENGTH &&
      (previous === null || window.confirm(locale === "en" ? "Replace your draft with the example from the docs?" : "要用文件範例取代目前草稿嗎？"))) {
      setSource(transferred);
      setParsedSource(transferred);
      setSaved(saveDraft(transferred));
    } else if (previous !== null) {
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
      return {document: null,html: "", ast: "", diagnostics: [] as {code: string; message: string; position: {line: number; column: number; offset?: number}}[], error: english
        ? "The document exceeds the live preview limit (150,000 characters). Its source remains intact."
        : "文件超過即時預覽上限（150,000 字元），來源內容仍會保留。"};
    }
    try {
      const document = parseDocument(parsedSource);
      return {document,html: renderHtml(document, {math: "katex"}), ast: serializeAst(document, 2), diagnostics: document.diagnostics, error: ""};
    } catch {
      return {document: null,html: "", ast: "", diagnostics: [] as {code: string; message: string; position: {line: number; column: number; offset?: number}}[], error: english
        ? "Unable to render this input. The original source was retained."
        : "目前無法渲染這份輸入，原始文字已保留。"};
    }
  }, [parsedSource, english]);

  function handleReset(): void {
    const approved = window.confirm(english ? "Replace the current draft with the default example?" : "要捨棄目前草稿並恢復預設範例嗎？");
    if (!approved) return;
    resetDraft();
    setActiveExample("start");
    setSource(initial[locale]);
    setSaved(saveDraft(initial[locale]));
  }

  // ── 載入範例與跳至來源 ──
  function chooseExample(id: string): void {
    const chosen = playgroundExamples[locale].find(item => item.id === id);
    if (!chosen) return;
    if (source !== chosen.source && !window.confirm(english ? 'Replace your current draft with this example?' : '要以此範例取代目前草稿嗎？')) return;
    setSource(chosen.source);
    setActiveExample(id);
    setSaved(saveDraft(chosen.source));
  }
  function jumpTo(line: number, column: number, offset?: number): void {
    const editor = editorRef.current;
    if (!editor) return;
    const lines = source.split('\n');
    const start = lines.slice(0, Math.max(0, line - 1)).reduce((count, item) => count + item.length + 1, 0);
    const index = typeof offset === 'number' && offset >= 0 && offset <= source.length ? offset : start + Math.max(0, column - 1);
    editor.focus();
    editor.setSelectionRange(Math.min(index, source.length), Math.min(index, source.length));
    const ratio = source.length ? index / source.length : 0;
    editor.scrollTop = ratio * Math.max(0, editor.scrollHeight - editor.clientHeight);
  }

  function selectAstSource(range: SourceRange): void {
    const editor=editorRef.current;
    if(!editor)return;
    const start=editorOffset(source,range.start);
    const end=editorOffset(source,range.end);
    editor.focus();
    editor.setSelectionRange(start,Math.max(start,end));
    editor.scrollTop=Math.max(0,(start/Math.max(1,source.length))*Math.max(0,editor.scrollHeight-editor.clientHeight));
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
        <div className="playground-presets">
          <label htmlFor="example-select">{english ? 'Load syntax example' : '載入語法範例'}</label>
          <select id="example-select" value={activeExample} onChange={event => chooseExample(event.target.value)}>
            <option value="custom">{english ? 'Current document' : '目前文件'}</option>
            {playgroundExamples[locale].map(example => <option key={example.id} value={example.id}>{example.title}</option>)}
          </select>
          <span className="playground-stat">{english ? `${source.length} characters` : `${source.length} 字元`}</span>
        </div>
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
          <textarea ref={editorRef} id="source-input" className="editor" value={source} onChange={event => {setSource(event.target.value); setActiveExample("custom"); setSaved(saveDraft(event.target.value));}}
            disabled={!storageReady} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" aria-describedby="editor-help" />
          <div className="no-diagnostics" id="editor-help">{english ? "Edit the source. The preview updates below or to the right." : "編輯原始碼；預覽會在下方或右側更新。"}</div>
        </section>
        <section className="editor-panel" aria-label={english ? "Preview" : "預覽"}>
          <div className="panel-label">
            <div className="panel-tabs" role="tablist" aria-label={english ? 'Output view' : '輸出檢視'}>
              <button type="button" role="tab" aria-selected={view === 'preview'} aria-controls="output-panel" onClick={() => setView('preview')}>{text.preview}</button>
              <button type="button" role="tab" aria-selected={view === 'tree'} aria-controls="output-panel" onClick={() => setView('tree')}>{english ? 'AST Tree' : 'AST 樹狀圖'}</button>
              <button type="button" role="tab" aria-selected={view === 'ast'} aria-controls="output-panel" onClick={() => setView('ast')}>AST JSON</button>
            </div>
            <span className="panel-meta">{view === 'preview' ? 'HTML' : view === 'tree' ? 'TREE' : 'JSON'}</span>
          </div>
          {result.error ? <div className="preview-error" role="alert">{result.error}</div> :
            <div role="tabpanel" id="output-panel" aria-label={view === 'preview' ? text.preview : 'AST JSON'}>
              {view === 'tree' && result.document ? <AstTree document={result.document} onPick={selectAstSource} english={english} /> :
              view === 'ast' ? <pre className="ast-output"><code>{result.ast}</code></pre> :
                <div className="preview content-rendered" dangerouslySetInnerHTML={{__html: result.html}} />}
            </div>}
          {result.error ? (
            <div className="no-diagnostics" role="status">{english ? "Preview paused" : "預覽已暫停"}</div>
          ) : result.diagnostics.length > 0 ? (
            <div className="diagnostic" role="status" aria-live="polite">
              <p>{english ? `${result.diagnostics.length} diagnostic(s)` : `${result.diagnostics.length} 項診斷`}</p>
              <ul>{result.diagnostics.map((d, index) => <li key={`${d.code}-${index}`}><button type="button" onClick={() => jumpTo(d.position.line, d.position.column, d.position.offset)}>
                <strong>{d.code}</strong> · {english ? `Line ${d.position.line}` : `第 ${d.position.line} 行`}：{d.message}
              </button></li>)}</ul>
            </div>
          ) : <div className="no-diagnostics" role="status">{english ? "No diagnostics" : "沒有診斷訊息"}</div>}
        </section>
      </div>
    </div>
  );
}
