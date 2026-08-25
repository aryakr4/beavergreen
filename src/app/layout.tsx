import type { Metadata } from "next";
import { Bungee } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import BackgroundTexture from "@/components/BackgroundTexture";
import "./globals.css";

const logoFont = Bungee({ subsets: ["latin"], weight: "400" });

const description = "Hand-picked nature spots across Oregon and Washington — pictures, notes, and how far they are from you.";

export const metadata: Metadata = {
  title: {
    default: "BeaverGreen",
    template: "%s | BeaverGreen",
  },
  description,
  applicationName: "BeaverGreen",
  keywords: [
    "Pacific Northwest",
    "Oregon hikes",
    "Washington hikes",
    "waterfalls",
    "hot springs",
    "PNW travel",
  ],
  openGraph: {
    title: "BeaverGreen",
    description,
    siteName: "BeaverGreen",
    images: [{ url: "/images/logo.jpg", width: 320, height: 320 }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BeaverGreen",
    description,
    images: ["/images/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-steel-light text-oregon-blue antialiased">
        <BackgroundTexture />
        <header className="relative z-10 gloss-sheen bevel-raised bg-gradient-to-b from-washington-green-light via-washington-green to-washington-green-dark">
          <div className="relative z-[2] mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="bevel-raised flex items-center gap-2 rounded-md border border-gold/70 bg-gradient-to-br from-oregon-blue-light via-oregon-blue to-oregon-blue-dark py-1.5 pl-1.5 pr-3"
            >
              <span className="bevel-raised relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gold/80">
                <Image src="/images/logo.jpg" alt="" fill sizes="28px" className="object-cover" />
              </span>
              <span className={`${logoFont.className} text-emboss text-lg tracking-wide text-gold`}>
                beavergreen
              </span>
            </Link>
            <nav className="flex gap-2 text-sm font-medium">
              <Link
                href="/"
                className="bevel-raised rounded border border-oregon-blue-dark/40 bg-gradient-to-b from-oregon-blue-light to-oregon-blue-dark px-3 py-1.5 text-gold-light transition hover:from-oregon-blue hover:to-oregon-blue-dark"
              >
                Explore
              </Link>
            </nav>
          </div>
        </header>
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
