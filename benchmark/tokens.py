#!/usr/bin/env python3
"""
File: benchmark/tokens.py
Modification: 2026-10-10 — 實際 tokenizer 基準測試及無 tiktoken 時的明確降級。
"""

# ── 套件及資料 ──
import argparse
import csv
import hashlib
import json
import platform
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CORPUS = ROOT / "corpus.json"
OUTPUT = ROOT / "results.csv"
METADATA = ROOT / "results.metadata.json"
SUMMARY = ROOT / "summary.json"
ENCODINGS = ("cl100k_base", "o200k_base")


def main() -> None:
    """比較語義對等的兩種來源文件，不把字元數混稱為 Token。"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--require-tokenizer", action="store_true", help="缺少 tiktoken 時使基準測試失敗")
    args = parser.parse_args()
    corpus_text = CORPUS.read_text(encoding="utf-8")
    samples = json.loads(corpus_text)
    required = {"id", "description", "markdown", "structmark"}
    if not isinstance(samples, list) or not samples:
        raise SystemExit("語料必須是非空陣列")
    ids = set()
    for index, item in enumerate(samples, start=1):
        if not isinstance(item, dict) or not required.issubset(item):
            raise SystemExit(f"語料第 {index} 筆缺少必要欄位")
        if not all(isinstance(item[key], str) for key in required):
            raise SystemExit(f"語料第 {index} 筆欄位必須是文字")
        if item["id"] in ids:
            raise SystemExit(f"語料 ID 重複：{item['id']}")
        ids.add(item["id"])
    try:
        import tiktoken
    except ImportError:
        tiktoken = None

    tokenizers = {}
    if tiktoken is not None:
        for name in ENCODINGS:
            try:
                tokenizers[name] = tiktoken.get_encoding(name)
            except Exception as exc:
                print(f"無法載入 {name}：{exc}")
    else:
        if args.require_tokenizer:
            raise SystemExit("需要 tiktoken 才能執行真實 Token 基準測試")
        print("未安裝 tiktoken，本次僅提供字元數與 UTF-8 位元組數；Token 欄位標示為 n/a。")
    if args.require_tokenizer and len(tokenizers) != len(ENCODINGS):
        missing = ", ".join(name for name in ENCODINGS if name not in tokenizers)
        raise SystemExit(f"無法載入真實 tokenizer：{missing}")

    columns = ["id", "format", "characters", "utf8_bytes", *[f"tokens_{name}" for name in ENCODINGS]]
    results = []
    for item in samples:
        for fmt in ("markdown", "structmark"):
            content = item[fmt]
            row = {"id": item["id"], "format": fmt,
                   "characters": len(content), "utf8_bytes": len(content.encode("utf-8"))}
            for name in ENCODINGS:
                row[f"tokens_{name}"] = len(tokenizers[name].encode(content)) if name in tokenizers else "n/a"
            results.append(row)
    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, lineterminator="\n")
        writer.writeheader()
        writer.writerows(results)

    summary = {
        "corpus": CORPUS.name,
        "cases": len(samples),
        "formats": {},
        "comparisons": {},
    }
    for fmt in ("markdown", "structmark"):
        group = [x for x in results if x["format"] == fmt]
        summary["formats"][fmt] = {
            "characters": sum(x["characters"] for x in group),
            "utf8_bytes": sum(x["utf8_bytes"] for x in group),
            "tokens": {name: sum(x[f"tokens_{name}"] for x in group) for name in tokenizers},
        }
    for name in tokenizers:
        markdown_tokens = summary["formats"]["markdown"]["tokens"][name]
        structmark_tokens = summary["formats"]["structmark"]["tokens"][name]
        delta = structmark_tokens - markdown_tokens
        summary["comparisons"][name] = {
            "markdown_tokens": markdown_tokens,
            "structmark_tokens": structmark_tokens,
            "delta_tokens": delta,
            "structmark_saving_ratio": round(-delta / markdown_tokens, 6) if markdown_tokens else None,
            "cases_structmark_lower": sum(
                1 for item in samples
                if next(x for x in results if x["id"] == item["id"] and x["format"] == "structmark")[f"tokens_{name}"]
                < next(x for x in results if x["id"] == item["id"] and x["format"] == "markdown")[f"tokens_{name}"]
            ),
            "cases_equal": sum(
                1 for item in samples
                if next(x for x in results if x["id"] == item["id"] and x["format"] == "structmark")[f"tokens_{name}"]
                == next(x for x in results if x["id"] == item["id"] and x["format"] == "markdown")[f"tokens_{name}"]
            ),
        }

    metadata = {
        "corpus": CORPUS.name,
        "corpus_sha256": hashlib.sha256(corpus_text.encode("utf-8")).hexdigest(),
        "cases": len(samples),
        "formats": ["markdown", "structmark"],
        "tokenizers": list(tokenizers),
        "tokenizer_versions": {"tiktoken": getattr(__import__("tiktoken"), "__version__", "unknown")} if tokenizers else {},
        "python": platform.python_version(),
        "platform": platform.platform(),
        "script": "benchmark/tokens.py",
        "summary": SUMMARY.name,
    }
    (ROOT / "results.metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summary["metadata"] = METADATA.name
    SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"已建立 {OUTPUT}")
    print(f"已建立 {METADATA}")
    print(f"已建立 {SUMMARY}")
    for fmt in ("markdown", "structmark"):
        group = [x for x in results if x["format"] == fmt]
        print(f"{fmt}: 字元={sum(x['characters'] for x in group)}, UTF-8 位元組={sum(x['utf8_bytes'] for x in group)}")
        for name in tokenizers:
            print(f"  {name}={sum(x[f'tokens_{name}'] for x in group)}")
    print("注意：結果是語料集上的實測，不代表所有文件的 Token 優勢。")


if __name__ == "__main__":
    main()
