import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: { default: "StructMark", template: "%s · StructMark" }, description: "A deterministic structural markup language for documents and data." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body><header className="site-header"><Link className="wordmark" href="/">StructMark<span> / language core</span></Link><nav aria-label="主要導覽"><Link href="/docs/">文件</Link><Link href="/playground/">Playground</Link><a href="https://github.com/oMiki0826o/StructMark">GitHub</a></nav></header><main>{children}</main><footer className="site-footer"><span>StructMark v1.0.0</span><span>MIT · language core only</span></footer></body></html>;
}
