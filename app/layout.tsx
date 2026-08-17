import type { Metadata } from "next";
import { Cormorant, Work_Sans } from "next/font/google";
import Link from "next/link";
import Nav from "./Nav";
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