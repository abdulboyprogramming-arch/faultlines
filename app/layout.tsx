import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import ThemeProvider from "@/components/ThemeProvider";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-ui", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Fault Lines — see what your class actually misunderstands", template: "%s · Fault Lines" },
  description: "For teachers marking written answers: paste a class's answers to one question and see the beliefs underneath, ranked by exam risk, with verbatim evidence and 5-minute reteach plans.",
  manifest: "/manifest.json",
  keywords: ["misconceptions", "formative assessment", "teaching", "diagnostic", "reteach"],
  authors: [{ name: "Abdulrahman Adeeyo" }],
  openGraph: {
    title: "Fault Lines",
    description: "Every class has fault lines. See them before the exam does.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-paper text-ink antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
