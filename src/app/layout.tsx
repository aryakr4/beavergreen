import type { Metadata } from "next";
import { Bungee } from "next/font/google";
import BackgroundTexture from "@/components/BackgroundTexture";
import HeaderLogo from "@/components/HeaderLogo";
import { ResetBoundary } from "@/components/ResetBoundary";
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
          <div className="relative z-[2] mx-auto flex max-w-6xl items-center px-4 py-3">
            <HeaderLogo logoFontClassName={logoFont.className} />
          </div>
        </header>
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">
          <ResetBoundary>{children}</ResetBoundary>
        </main>
      </body>
    </html>
  );
}
