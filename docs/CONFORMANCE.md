# StructMark 1.1 Conformance

This document is the executable checklist for the stable `.sm` core. The canonical syntax is defined in `docs/SPECIFICATION.md`; these checks make the most important compatibility promises easy to verify.

## Required commands

```bash
npm run check
npm run fuzz
python3 benchmark/tokens.py
```

`npm test` covers the parser, lexer, AST, diagnostics, registry, tables, renderer, source ranges, aliases, and the `.sm` examples. `npm run fuzz` runs 500 deterministic malformed inputs and asserts that parsing does not throw or emit executable `<script>` output. The token benchmark reports real tokenizer counts when `tiktoken` is installed and otherwise reports characters, UTF-8 bytes, and `n/a` token fields without presenting them as token counts.

## Stable syntax promises

| Area | Promise |
| --- | --- |
| File extension | `.sm` is the official StructMark source extension. |
| Block marker | `&name` and `&name[attrs]` are supported. |
| Attribute spacing | `&name[attrs]` and `&name [attrs]` are equivalent. |
| Boolean attributes | `[typing]` is equivalent to `[typing=true]`. |
| Compact aliases | `&n`, `&t`, `&w`, and `&e` expand to their canonical block forms. |
| AST version | Parsed documents expose language version `1.1`. |
| Safety | Source content is escaped and is never executed by the parser or renderer. |
| Determinism | The same source and registry produce the same AST and HTML. |
| Cross-file references | `validateWorkspace` resolves explicit `path#id` references without changing single-document parsing. |
| Optional numbering | `renderHtml(document, { numbering: true })` labels identified sections, figures, tables, and equations and resolves their reference text. |

## Explicitly outside 1.1

The editor, GUI, cross-file index, complete YAML 1.2, CSL engine, Markdown converter, and round-trip formatter are separate follow-up projects. They must not change the stable core syntax without a compatibility proposal and new conformance cases.

## Large-document performance check

`npm run benchmark:perf` parses and renders a deterministic 12,000-section document. It checks that every heading survives, diagnostics remain empty, the output contains the final section, and the complete run stays below the conservative 10-second regression limit. Timings are machine-dependent and are reported for comparison rather than as a universal performance promise.
