import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { portfolioConfig } from "@/config/portfolio";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(portfolioConfig.seo.siteUrl),
  title: portfolioConfig.seo.title,
  description: portfolioConfig.seo.description,
  keywords: [...portfolioConfig.seo.keywords],
  authors: [{ name: portfolioConfig.identity.name }],
  openGraph: {
    title: portfolioConfig.seo.title,
    description: portfolioConfig.seo.description,
    url: portfolioConfig.seo.siteUrl,
    siteName: portfolioConfig.identity.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: portfolioConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: portfolioConfig.seo.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: portfolioConfig.seo.title,
    description: portfolioConfig.seo.description,
    images: [portfolioConfig.seo.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0e11",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${beVietnam.variable} ${jetbrains.variable} dark`}
    >
      <body className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-ink)] antialiased">
        <div className="film-grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
