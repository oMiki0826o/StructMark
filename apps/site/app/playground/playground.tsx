"use client";
import { useMemo, useState } from "react";
import { parseDocument, renderHtml } from "../../../../src/index";
import { copy } from "../../lib/copy";
import type { Locale } from "../../lib/content-types";

const initialSource = `#1 StructMark Playground\n\nWrite StructMark here.\n\n- deterministic\n- composable\n\n&n [title="Live preview"]\nThe preview uses the language core directly.\n&e`;

export default function Playground({ locale = "en" as Locale }: { locale?: Locale }) { const [source, setSource] = useState(initialSource); const result = useMemo(() => { const document = parseDocument(source); return { html: renderHtml(document, { math: "katex" }), diagnostics: document.diagnostics }; }, [source]); const text = copy[locale]; return <div className="container playground"><div className="eyebrow">{text.language}</div><h1>{text.playground}</h1><p className="lead">{text.edit}</p><div className="playground-grid"><section className="editor-panel"><div className="panel-label">{text.source}</div><textarea className="editor" value={source} onChange={(event) => setSource(event.target.value)} spellCheck={false} /></section><section className="editor-panel"><div className="panel-label">{text.preview}</div><div className="preview" dangerouslySetInnerHTML={{ __html: result.html }} />{result.diagnostics.length > 0 && <div className="diagnostic">{result.diagnostics.map((item, index) => <div key={`${item.code}-${index}`}>{item.code}: {item.message} (line {item.position.line})</div>)}</div>}</section></div></div>; }
