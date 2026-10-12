# StructMark Development Guide

StructMark includes a TypeScript **language core** and an independent Next.js **documentation/Playground site** in `apps/site`. Keep the core deterministic and usable without any browser or Node filesystem dependency; the site must import public core APIs instead of reimplementing grammar rules.

## Development constraints

- The source file extension is `.sm`; language AST compatibility is currently `1.1`, independent of the npm release number (`1.3.0`).
- Do not add an unrelated desktop editor, backend service, or AI-generated decorative illustration.
- Keep Source Range and Diagnostic semantics stable; do not execute untrusted source as HTML.
- New conversion behaviors should have regression tests, especially for lossy Markdown conversions.
- Use actual `.sm` content as the canonical website docs source.

## Validation

```bash
npm ci && npm test && npm run fuzz && npm run benchmark:perf
cd apps/site
npm ci && npm test && npm run build
```

Run `python3 scripts/browser_smoke.py --base-url ...` against the served Next.js static output when Chromium and Playwright are available. Changes to language syntax, public APIs, diagnostics, dependencies, or versions require updating `README.md`, `docs/` and relevant tests.

## StructMark v2.0.0-rc.1

新開發的語法契約以 `docs/STRUCTMARK_V2_LANGUAGE_CONTRACT.md` 為準；v2 僅能使用 `src/v2/index.mjs` 公開入口。執行 `npm run check:v2`，並依 `docs/STRUCTMARK_V2_RELEASE_GATES.md` 驗證；不可將既有 v1.6 API 擅自改成 v2 或宣稱尚未執行的測試通過。
