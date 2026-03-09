import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Outfit — geometric, modern headings
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Plus Jakarta Sans — highly readable body & UI text
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Learn Swahili Online with Native Teachers | Swahili Tutors",
    template: "%s | Swahili Tutors",
  },
  description:
    "Connect with verified native Swahili teachers for personalised 1-on-1 online lessons. Learn Swahili for travel, business, family or culture — from $15/hour. Start today.",
  keywords: [
    "learn Swahili online",
    "Swahili tutor",
    "Swahili lessons online",
    "native Swahili teacher",
    "online Swahili classes",
    "Swahili teacher",
    "Kiswahili lessons",
    "learn Kiswahili",
    "Swahili for beginners",
    "Swahili private tutor",
    "East Africa language",
    "mwalimu",
  ],
  authors: [{ name: "Swahili Tutors" }],
  creator: "Swahili Tutors",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE,
    siteName: "Swahili Tutors",
    title: "Learn Swahili Online with Native Teachers | Swahili Tutors",
    description:
      "Connect with verified native Swahili teachers for personalised 1-on-1 online lessons. Learn Swahili for travel, business, family or culture — from $15/hour.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Swahili Tutors — Learn Swahili from Native Speakers Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Swahili Online with Native Teachers | Swahili Tutors",
    description:
      "Connect with verified native Swahili teachers for personalised 1-on-1 online lessons — from $15/hour.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE,
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
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
