"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <nav className="desktop-nav" aria-label="主要導覽">
        <Link href="/zh-tw/docs/">繁中</Link>
        <Link href="/en/docs/">EN</Link>
        <a href="https://github.com/oMiki0826o/StructMark">GitHub</a>
      </nav>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "關閉導覽選單" : "開啟導覽選單"}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
        <span className="sr-only">{open ? "關閉選單" : "開啟選單"}</span>
      </button>
      {open && (
        <div className="mobile-menu" id="mobile-menu">
          <Link href="/zh-tw/docs/" onClick={close}>繁中</Link>
          <Link href="/en/docs/" onClick={close}>EN</Link>
          <a href="https://github.com/oMiki0826o/StructMark" onClick={close}>GitHub</a>
        </div>
      )}
    </>
  );
}
