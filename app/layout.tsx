import type { Metadata } from "next";
import { Cormorant, Work_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Beauty by Kale",
  description: "Book Now",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${workSans.variable}`}>
      <body className="bg-white text-[var(--ink)]">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--sage)] border-b border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-[0.2em] uppercase">
          Beauty by Kale
        </Link>
        <nav className="hidden sm:flex items-center gap-8 text-sm tracking-wide">
          <Link href="/book" className="hover:opacity-60 transition-opacity">Book</Link>
          <Link href="/policies" className="hover:opacity-60 transition-opacity">Policies</Link>
        </nav>
        <button className="sm:hidden flex flex-col gap-1.5" aria-label="Menu">
          <span className="block w-6 h-px bg-[var(--ink)]" />
          <span className="block w-6 h-px bg-[var(--ink)]" />
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/10 py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-black/60">
        <p>&copy; {new Date().getFullYear()} Beauty by Kale</p>
        <Link href="/admin/login" className="hover:text-black transition-colors underline underline-offset-4">
          Admin login
        </Link>
      </div>
    </footer>
  );
}