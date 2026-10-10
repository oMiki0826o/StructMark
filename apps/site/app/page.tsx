import Link from "next/link";

const sample = `# Project note

This is **StructMark**.

:::note [title="Deterministic"]
The same source produces the same AST.
:::`;

export default function HomePage() { return <div className="container"><section className="hero"><div><div className="eyebrow">A structural markup language</div><h1>Write documents with structure intact.</h1><p className="lead">StructMark is a deterministic, TypeScript language core for documents, data blocks, and safe HTML output. No editor dependency. No hidden runtime.</p><div className="actions"><Link className="button primary" href="/docs/">Read the docs</Link><Link className="button" href="/playground/">Open Playground</Link></div></div><pre className="code-card"><span className="comment">{`# A small, inspectable source\n\n`}</span>{sample}</pre></section><section className="section"><div className="eyebrow">Core principles</div><div className="feature-grid"><article className="feature"><h3>Deterministic</h3><p>Lexer, parser, AST, and serializer are explicit and testable. Identical input yields identical structure.</p></article><article className="feature"><h3>Composable</h3><p>Headings, lists, directives, tables, inline syntax, and metadata can be combined without an editor.</p></article><article className="feature"><h3>Safe by default</h3><p>HTML rendering escapes text and filters unsafe URLs before it reaches the output.</p></article></div></section><section className="section"><div className="eyebrow">What ships in v1.0</div><h2>A language core you can embed.</h2><p className="lead">Use the TypeScript API in documentation tooling, static site generators, tests, and future editors. The current release intentionally focuses on the language—not an editor.</p></section></div>; }
