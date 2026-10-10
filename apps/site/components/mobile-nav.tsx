"use client";

import Link from "next/link";

export default function MobileNav() {
  return (
    <nav className="desktop-nav" aria-label="主要導覽">
      <Link href="/zh-tw/docs/">繁中</Link>
      <Link href="/en/docs/">EN</Link>
      <a href="https://github.com/oMiki0826o/StructMark">GitHub</a>
    </nav>
  );
}
