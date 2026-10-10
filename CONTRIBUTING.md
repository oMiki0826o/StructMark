# Contributing to StructMark

StructMark is a language core. Contributions should improve the parser, AST, diagnostics, renderer, documentation, tests, or release tooling. Editor and GUI work is outside this repository.

## Before opening a change

- Read `AGENTS.md`, `docs/SPECIFICATION.md`, and `docs/STATUS_AND_ROADMAP.md`.
- Keep the language deterministic and preserve source ranges and diagnostics.
- For syntax or behavior changes, add a failing regression test first.
- Update the README and the relevant `docs/` files in the same change.

## Local checks

```bash
npm run check
python3 ../AI-Development-Governance/scripts/validate.py
python3 -m py_compile ../AI-Development-Governance/scripts/*.py
```

For website changes also run `npm run build` from `apps/site`.

## Pull requests

Describe the user-visible behavior, compatibility impact, tests run, and documentation updated. Keep commits focused and do not include `data/`, build output, dependencies, secrets, or editor files.
