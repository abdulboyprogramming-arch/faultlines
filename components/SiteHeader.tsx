"use client";
import Link from "next/link";
import Logo from "./Logo";
import { t } from "@/lib/i18n";

export default function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-display text-lg sm:text-xl hover:opacity-85">
          <Logo className="w-7 h-7" /> <span>{t("title")}</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4 text-sm font-ui">
          <Link href="/tool" className="hover:underline underline-offset-4">{t("map")}</Link>
          <Link href="/play" className="hover:underline underline-offset-4 hidden sm:inline">{t("playGame")}</Link>
          <Link href="/settings" className="hover:underline underline-offset-4">{t("settings")}</Link>
          <a href="https://github.com/abdulboyprogramming-arch/faultlines" target="_blank" rel="noreferrer" className="hover:underline underline-offset-4">GitHub</a>
        </div>
      </nav>
    </header>
  );
}
