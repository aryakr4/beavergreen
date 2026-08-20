import type { Metadata } from "next";
import { Bungee } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const logoFont = Bungee({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "beavergreen",
  description: "A visual nature-exploration map for Oregon and Washington.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-oregon-blue antialiased">
        <header className="bg-oregon-blue">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className={`${logoFont.className} text-lg tracking-wide text-gold`}>
              beavergreen
            </Link>
            <nav className="flex gap-4 text-sm text-white/70">
              <Link href="/" className="hover:text-gold">
                Explore
              </Link>
              <Link href="/passport" className="hover:text-gold">
                Passport
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
