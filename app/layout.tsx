import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/inter/wght.css";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";
import ThemeProvider from "@/components/ThemeProvider";

/**
 * Fonts are self-hosted from `@fontsource-variable/*` instead of fetched from
 * Google Fonts at build time. That removes a network dependency from every
 * deploy (a blocked `fonts.googleapis.com` fails the whole build) and lets the
 * PWA render its real typography offline.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://faultlines-kappa.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F1EA" },
    { media: "(prefers-color-scheme: dark)", color: "#12100D" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Fault Lines",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Fault Lines" },
  title: {
    default: "Fault Lines — see what your class actually misunderstands",
    template: "%s · Fault Lines",
  },
  description:
    "For teachers marking written answers: paste a class's answers to one question and see the beliefs underneath, ranked by exam risk, with verbatim evidence and 5-minute reteach plans. No accounts, no stored student data, works offline.",
  manifest: "/manifest.json",
  keywords: [
    "misconceptions",
    "formative assessment",
    "teaching",
    "diagnostic",
    "reteach",
    "classroom",
    "marking",
    "teacher tool",
  ],
  authors: [{ name: "Abdulrahman Adeeyo", url: "https://github.com/abdulboyprogramming-arch" }],
  creator: "Abdulrahman Adeeyo",
  category: "education",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Fault Lines — every class has fault lines",
    description:
      "Paste your class's answers to one question. See the beliefs underneath, sized by how many share them and ranked by exam risk — with their own words as evidence and a five-minute reteach plan each.",
    type: "website",
    url: "/",
    siteName: "Fault Lines",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fault Lines — see what your class actually misunderstands",
    description: "Misconception mapping for teachers. Verbatim evidence, exact counts, 5-minute reteach plans.",
  },
  formatDetection: { telephone: false },
};

/** Applied before first paint: theme class, text size, language direction. */
const bootScript = `(function(){try{
var d=document.documentElement;
d.classList.add('has-js');
var t=localStorage.getItem('faultlines-theme')||'system';
var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
if(dark)d.classList.add('dark');
var s=localStorage.getItem('faultlines-size');
if(s)d.dataset.size=s;
var l=localStorage.getItem('faultlines-locale')||((navigator.language||'en').slice(0,2).toLowerCase());
if(l){d.lang=l;d.dir=l==='ar'?'rtl':'ltr';}
}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Fault Lines",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Misconception mapping for teachers: paste a class's written answers to one question and see the beliefs underneath, ranked by exam risk, with verbatim evidence and five-minute reteach plans.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  author: { "@type": "Person", name: "Abdulrahman Adeeyo" },
  license: "https://opensource.org/licenses/MIT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
        <OfflineBanner />
        <InstallPrompt />
      </body>
    </html>
  );
}
