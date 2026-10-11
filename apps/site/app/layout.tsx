/*
 * File: layout.tsx
 * Modification: 2026-10-11 — 日式極簡全站版型與無障礙主內容地標。
 */
import type { Metadata } from "next";
import SiteHeader from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "StructMark", template: "%s · StructMark" },
  description: "A structured markup language for readable, verifiable documents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <span className="footer-brand">StructMark</span>
            <span>v1.5.0 · MIT License · Language Core</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
