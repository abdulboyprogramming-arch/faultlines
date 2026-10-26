import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-ui" });

export const metadata: Metadata = {
  title: "Fault Lines",
  description: "See what your class actually misunderstands. For teachers marking written answers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
