"use client";

import { useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--sage)] border-b border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-[0.2em] uppercase" onClick={() => setOpen(false)}>
          Beauty by Kale
        </Link>
        <nav className="hidden sm:flex items-center gap-8 text-sm tracking-wide">
          <Link href="/book" className="hover:opacity-60 transition-opacity">Book</Link>
          <Link href="/policies" className="hover:opacity-60 transition-opacity">Policies</Link>
        </nav>
        <button
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden flex flex-col gap-1.5"
          aria-label="Menu"
          aria-expanded={open}
        >
          <span
            className={`block w-6 h-px bg-[var(--ink)] transition-transform ${
              open ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-[var(--ink)] transition-transform ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>
      {open && (
        <nav className="animate-grow-in sm:hidden absolute top-full inset-x-0 flex flex-col bg-[var(--sage)] border-t border-b border-black/10 shadow-lg px-6 py-4 gap-4 text-sm tracking-wide">
          <Link href="/book" className="hover:opacity-60 transition-opacity" onClick={() => setOpen(false)}>
            Book
          </Link>
          <Link href="/policies" className="hover:opacity-60 transition-opacity" onClick={() => setOpen(false)}>
            Policies
          </Link>
        </nav>
      )}
    </header>
  );
}
