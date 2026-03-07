import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

// Playfair Display — display headings (h1, h2), editorial titles
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

// DM Sans — body text, UI elements, navigation, buttons
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimuwangu.com"
  ),
  title: {
    default: "Mwalimu Wangu — Your Gateway to Swahili Fluency",
    template: "%s | Mwalimu Wangu",
  },
  description:
    "Connect with qualified native Swahili teachers for personalised online lessons. Learn Swahili authentically — for travel, business, or culture.",
  keywords: [
    "learn Swahili",
    "Swahili tutor",
    "Swahili lessons online",
    "native Swahili teacher",
    "Swahili course",
    "mwalimu",
    "East Africa language",
  ],
  authors: [{ name: "Mwalimu Wangu" }],
  creator: "Mwalimu Wangu",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimuwangu.com",
    siteName: "Mwalimu Wangu",
    title: "Mwalimu Wangu — Your Gateway to Swahili Fluency",
    description:
      "Connect with qualified native Swahili teachers for personalised online lessons.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mwalimu Wangu — Learn Swahili from Native Speakers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mwalimu Wangu — Your Gateway to Swahili Fluency",
    description:
      "Connect with qualified native Swahili teachers for personalised online lessons.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
