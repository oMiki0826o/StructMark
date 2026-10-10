# StructMark Language Core Project Rules

## Scope

- This repository contains the StructMark language core only.
- Do not add an editor, GUI, MikiEdit integration, or unrelated application code.
- Keep the public language API deterministic and preserve source ranges and diagnostics.

## Required validation

From this directory, run:

```bash
npm run check
python3 ../AI-Development-Governance/scripts/validate.py
python3 -m py_compile ../AI-Development-Governance/scripts/*.py
```

Changes to syntax, AST, diagnostics, public APIs, dependencies, or release metadata must update the relevant README and `docs/` files in the same change.
