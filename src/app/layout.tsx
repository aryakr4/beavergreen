import type { Metadata } from "next";
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
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-semibold text-green-800">
              beavergreen
            </a>
            <nav className="flex gap-4 text-sm text-stone-600">
              <a href="/" className="hover:text-green-800">
                Explore
              </a>
              <a href="/passport" className="hover:text-green-800">
                Passport
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
