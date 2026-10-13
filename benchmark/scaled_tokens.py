#!/usr/bin/env python3
"""Compare .md and .sm across document types, sizes, and complexity levels."""
import csv, hashlib, json, platform
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "scaled-results.csv"
SUMMARY = ROOT / "scaled-summary.json"
ENCODINGS = ("cl100k_base", "o200k_base")

def pairs():
    cases=[]
    for kind in ("article", "technical", "academic", "api", "math", "table", "notice"):
        for size, repeat in (("short", 1), ("medium", 4), ("long", 12)):
            for complexity in ("low", "high"):
                md, sm = [], []
                for i in range(repeat):
                    title=f"第 {i+1} 節：{kind} 文件"
                    md.append(f"## {title}")
                    sm.append(f"#2 {title}")
                    if kind == "article":
                        text="這是一段說明文件內容，描述背景、目的與實際使用方式。" if complexity=="low" else "這是一段較完整的說明，包含背景、限制、取捨、驗證方式，以及不同情境下的實際使用建議。"
                        md.append(text); sm.append(text)
                    elif kind == "technical":
                        md += ["先安裝依賴，再執行測試。", "```sh", "npm install", "npm test", "```"]
                        sm += ["先安裝依賴，再執行測試。", "```sh", "npm install", "npm test", "```"]
                        if complexity=="high": md += ["> 注意：正式環境必須固定版本。", "- 保留 lockfile", "- 記錄環境"]; sm += ["> 注意：正式環境必須固定版本。", "- 保留 lockfile", "- 記錄環境"]
                    elif kind == "academic":
                        md.append("本研究比較兩種文件表示法，並以可重現的流程記錄結果。相關研究見 [Smith 2024](https://example.com/paper)。")
                        sm.append("本研究比較兩種文件表示法，並以可重現的流程記錄結果。相關研究見 [Smith 2024](https://example.com/paper)。")
                        if complexity=="high": md += ["### 限制", "結果受語料、解析器與 tokenizer 版本影響。"]; sm += ["#3 限制", "結果受語料、解析器與 tokenizer 版本影響。"]
                    elif kind == "api":
                        md += ["### parse(source)", "解析來源並回傳 AST。", "- `source`: UTF-8 字串", "- `return`: 文件節點"]
                        sm += ["#3 parse(source)", "解析來源並回傳 AST。", "- `source`: UTF-8 字串", "- `return`: 文件節點"]
                        if complexity=="high": md += ["- `error`: 診斷集合", "```ts", "const result = parse(source);", "```"]; sm += ["- `error`: 診斷集合", "```ts", "const result = parse(source);", "```"]
                    elif kind == "math":
                        formula="$x=(-b\\pm\\sqrt{b^2-4ac})/(2a)$" if complexity=="high" else "$E=mc^2$"
                        md.append(f"公式為 {formula}，其中變數需符合定義。" ); sm.append(f"公式為 {formula}，其中變數需符合定義。")
                    elif kind == "table":
                        rows=3 if complexity=="low" else 12
                        md += ["| Name | Type | Required |", "| --- | --- | --- |"]
                        sm += ["#3 欄位", "&table", "[Name][Type][Required]"]
                        for n in range(rows):
                            row=f"Field{n+1} | string | yes"
                            md.append(f"| {row} |" ); sm.append(f"[Field{n+1}][string][yes]")
                        sm[-1] = "&end"
                    else:
                        md += ["> [!WARNING]", "> 請先備份資料，再開始操作。"]
                        sm += ["&warning[title=警告]", "請先備份資料，再開始操作。", "&end"]
                        if complexity=="high": md += ["> 這項操作可能需要較長時間。", "> 請保留完整紀錄。"]; sm += ["這項操作可能需要較長時間。", "請保留完整紀錄。"]
                    md.append(""); sm.append("")
                full="\n".join(sm).strip()
                compact=(full.replace("&warning[title=警告]", "&w[警告]")
                    .replace("&warning[title=警告]", "&w[警告]")
                    .replace("&table", "&tbl")
                    .replace("&end", "&e"))
                cases.append({"id":f"{kind}-{size}-{complexity}","kind":kind,"size":size,"complexity":complexity,"markdown":"\n".join(md).strip(),"structmark":full,"structmark_compact":compact})
    return cases

def main():
    try:
        import tiktoken
    except ImportError as exc: raise SystemExit("需要 tiktoken") from exc
    encs={n:tiktoken.get_encoding(n) for n in ENCODINGS}; rows=[]
    for case in pairs():
        for fmt in ("markdown","structmark","structmark_compact"):
            text=case[fmt]; row={k:case[k] for k in ("id","kind","size","complexity")}; row["format"]=fmt; row["characters"]=len(text); row["utf8_bytes"]=len(text.encode());
            for name,enc in encs.items(): row[f"tokens_{name}"]=len(enc.encode(text))
            rows.append(row)
    fields=list(rows[0]);
    with OUT.open("w",encoding="utf-8",newline="") as f: w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)
    summary={"cases":len(pairs()),"tokenizers":list(encs),"tiktoken":tiktoken.__version__,"python":platform.python_version(),"corpus_sha256":hashlib.sha256(json.dumps(pairs(),ensure_ascii=False,sort_keys=True).encode()).hexdigest(),"groups":{}}
    for kind in ("article","technical","academic","api","math","table","notice"):
        for size in ("short","medium","long"):
            key=f"{kind}-{size}"; summary["groups"][key]={}
            for name in encs:
                values={fmt:sum(r[f"tokens_{name}"] for r in rows if r["kind"]==kind and r["size"]==size and r["format"]==fmt) for fmt in ("markdown","structmark","structmark_compact")}
                summary["groups"][key][name]={**values,"full_delta":values["structmark"]-values["markdown"],"compact_delta":values["structmark_compact"]-values["markdown"],"compact_vs_full":values["structmark_compact"]-values["structmark"]}
    SUMMARY.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Wrote {OUT} and {SUMMARY}")
    for name in encs:
        m=sum(r[f"tokens_{name}"] for r in rows if r["format"]=="markdown"); s=sum(r[f"tokens_{name}"] for r in rows if r["format"]=="structmark"); c=sum(r[f"tokens_{name}"] for r in rows if r["format"]=="structmark_compact")
        print(f"{name}: Markdown={m}, full.sm={s} ({s-m:+d}), compact.sm={c} ({c-m:+d}; compact-vs-full={c-s:+d})")

if __name__=="__main__": main()
