#!/usr/bin/env python3
"""Measure Markdown, AtDoc and StructMark with the same real tokenizers."""
import argparse, csv, hashlib, json, platform
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CORPUS = ROOT / 'three-way-corpus.json'
OUT = ROOT / 'three-way-results.csv'
SUMMARY = ROOT / 'three-way-summary.json'
ENCODINGS = ('cl100k_base', 'o200k_base')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--require-tokenizer', action='store_true')
    args = parser.parse_args()
    raw = CORPUS.read_text(encoding='utf-8')
    samples = json.loads(raw)
    if any(not item.get('atdoc_reparsed_without_diagnostics') for item in samples):
        raise SystemExit('AtDoc 語料未通過重新解析，拒絕產生三方總結')
    try:
        import tiktoken
    except ImportError:
        if args.require_tokenizer: raise SystemExit('需要 tiktoken 才能執行真實 Token 基準測試')
        tiktoken = None
    tokenizers = {}
    if tiktoken:
        for name in ENCODINGS:
            tokenizers[name] = tiktoken.get_encoding(name)
    rows = []
    for item in samples:
        for fmt in ('markdown', 'atdoc', 'structmark'):
            text = item[fmt]
            row = {'id': item['id'], 'format': fmt, 'characters': len(text), 'utf8_bytes': len(text.encode('utf-8'))}
            for name, enc in tokenizers.items(): row[f'tokens_{name}'] = len(enc.encode(text))
            rows.append(row)
    fields = list(rows[0])
    with OUT.open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator='\n'); writer.writeheader(); writer.writerows(rows)
    summary = {'cases': len(samples), 'formats': {}, 'comparisons': {}, 'validation': 'three-way-validation.json'}
    for fmt in ('markdown', 'atdoc', 'structmark'):
        group = [row for row in rows if row['format'] == fmt]
        summary['formats'][fmt] = {'characters': sum(row['characters'] for row in group), 'utf8_bytes': sum(row['utf8_bytes'] for row in group), 'tokens': {name: sum(row[f'tokens_{name}'] for row in group) for name in tokenizers}}
    for name in tokenizers:
        totals = {fmt: summary['formats'][fmt]['tokens'][name] for fmt in ('markdown', 'atdoc', 'structmark')}
        summary['comparisons'][name] = {'totals': totals, 'ranked_low_to_high': sorted(totals, key=totals.get), 'delta_vs_markdown': {fmt: totals[fmt] - totals['markdown'] for fmt in ('atdoc', 'structmark')}}
    summary['corpus_sha256'] = hashlib.sha256(raw.encode('utf-8')).hexdigest()
    summary['python'] = platform.python_version(); summary['platform'] = platform.platform()
    if tiktoken: summary['tokenizer_versions'] = {'tiktoken': getattr(tiktoken, '__version__', 'unknown')}
    SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(summary['comparisons'], ensure_ascii=False, indent=2))
    print(f'已建立 {OUT}'); print(f'已建立 {SUMMARY}')

if __name__ == '__main__': main()
