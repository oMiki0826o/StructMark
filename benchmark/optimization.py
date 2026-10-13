#!/usr/bin/env python3
"""Measure where StructMark's structural and context optimizations pay off."""
import json
import platform
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "optimization-results.json"
ENCODINGS = ("cl100k_base", "o200k_base")

def make_cases():
    cases = []
    for lines in (1, 3, 10, 50, 100):
        body = [f"第 {i} 行內容，說明這個區塊的用途。" for i in range(1, lines + 1)]
        canonical = "&warning[title=警告]\n" + "\n".join(body) + "\n&end"
        compact = "&w[警告]\n" + "\n".join(body) + "\n&e"
        cases.append({"group": "directive-alias", "id": f"lines-{lines}", "markdown": canonical, "structmark": compact})
    for lines in (1, 3, 10, 50, 100):
        body = [f"第 {i} 行內容，說明這個區塊的用途。" for i in range(1, lines + 1)]
        markdown = "> [!WARNING]\n" + "\n".join(f"> {line}" for line in body)
        structmark = "&w[警告]\n" + "\n".join(body) + "\n&e"
        cases.append({"group": "alert", "id": f"lines-{lines}", "markdown": markdown, "structmark": structmark})
    for rows in (2, 10, 50, 100):
        md = ["| Name | Count |", "| --- | ---: |"]
        sm = ["&tbl", "[Name][Count]"]
        for i in range(rows):
            name, count = f"Item-{i+1}", i + 1
            md.append(f"| {name} | {count} |")
            sm.append(f"[{name}][{count}]")
        sm.append("&e")
        cases.append({"group": "table", "id": f"rows-{rows}", "markdown": "\n".join(md), "structmark": "\n".join(sm)})
    for rows in (2, 10, 50, 100):
        objects = [f'{{"name":"Item-{i+1}","count":{i+1}}}' for i in range(rows)]
        markdown = "\n".join(objects)
        structmark = "&schema[Item]\n{\"name\":\"string\",\"count\":\"number\"}\n&e\n&data[format=rows,schema=Item]\n" + "\n".join(f"Item-{i+1},{i+1}" for i in range(rows)) + "\n&e"
        cases.append({"group": "schema-rows", "id": f"rows-{rows}", "markdown": markdown, "structmark": structmark})
    sections = [f"#2 Section {i}\n\nThis section contains unrelated background information and examples." for i in range(1, 11)]
    full = "\n\n".join(sections)
    selected = sections[6]
    cases.append({"group": "context", "id": "full-vs-selected", "markdown": full, "structmark": selected})
    return cases

def main():
    try:
        import tiktoken
    except ImportError as exc:
        raise SystemExit("需要 tiktoken 才能執行優化基準測試") from exc
    tokenizers = {name: tiktoken.get_encoding(name) for name in ENCODINGS}
    results = []
    for case in make_cases():
        row = {"group": case["group"], "id": case["id"]}
        for name, enc in tokenizers.items():
            left, right = len(enc.encode(case["markdown"])), len(enc.encode(case["structmark"]))
            row[name] = {"baseline": left, "optimized": right, "delta": right - left, "saving_ratio": round((left-right)/left, 6) if left else None}
        results.append(row)
    output = {"script": "benchmark/optimization.py", "python": platform.python_version(), "tokenizers": list(tokenizers), "tiktoken": tiktoken.__version__, "cases": results}
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    for group in ("directive-alias", "alert", "table", "schema-rows", "context"):
        rows = [r for r in results if r["group"] == group]
        print(group)
        for name in tokenizers:
            base = sum(r[name]["baseline"] for r in rows)
            opt = sum(r[name]["optimized"] for r in rows)
            print(f"  {name}: {base} -> {opt} ({base-opt:+d}, {(base-opt)/base:.2%})")

if __name__ == "__main__":
    main()
