import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "beavergreen",
  description: "A visual nature-exploration map for Oregon and Washington.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment text-basalt antialiased">
        <header className="bg-basalt">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold text-glacial">
              beavergreen
            </Link>
            <nav className="flex gap-4 text-sm text-fog">
              <Link href="/" className="hover:text-glacial">
                Explore
              </Link>
              <Link href="/passport" className="hover:text-glacial">
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
