import type { Metadata } from "next";
import Link from "next/link";
import MobileNav from "../components/mobile-nav";
import "./globals.css";

export const metadata: Metadata = { title: { default: "StructMark", template: "%s · StructMark" }, description: "A deterministic structural markup language for documents and data." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body><header className="site-header"><Link className="wordmark" href="/zh-tw/">StructMark<span> / language core</span></Link><MobileNav /></header><main>{children}</main><footer className="site-footer"><span>StructMark v1.1.0</span><span>MIT · language core only</span></footer></body></html>;
}
