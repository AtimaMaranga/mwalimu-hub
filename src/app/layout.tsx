import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthHashHandler from "@/components/auth/AuthHashHandler";
import ThemeProvider from "@/components/ThemeProvider";

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
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Learn Swahili Online | Expert Native Tutors | Swahili Tutors",
    template: "%s | Swahili Tutors",
  },
  description:
    "Connect with certified native Swahili tutors for personalized 1-on-1 online lessons. Learn conversational, business, or travel Swahili from expert teachers from Kenya and Tanzania. Book a trial lesson today.",
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
    "Swahili for travel",
    "business Swahili",
    "conversational Swahili",
  ],
  authors: [{ name: "Swahili Tutors" }],
  creator: "Swahili Tutors",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE,
    siteName: "Swahili Tutors",
    title: "Learn Swahili Online with Native Tutors | Swahili Tutors",
    description:
      "Personalized 1-on-1 Swahili lessons with certified native speakers. Flexible scheduling, affordable rates.",
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
    site: "@swahilitutors",
    title: "Learn Swahili Online with Native Tutors | Swahili Tutors",
    description:
      "Personalized 1-on-1 Swahili lessons with certified native speakers. Flexible scheduling, affordable rates.",
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
  other: {
    "theme-color": "#4f46e5",
    "google-site-verification": process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Resource hints for Supabase */}
        {SUPABASE_URL && (
          <>
            <link rel="dns-prefetch" href={SUPABASE_URL} />
            <link rel="preconnect" href={SUPABASE_URL} />
          </>
        )}
      </head>
      <body className="antialiased">
        <ThemeProvider>
        <AuthHashHandler />
        {children}

        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        </ThemeProvider>
      </body>
    </html>
  );
}
