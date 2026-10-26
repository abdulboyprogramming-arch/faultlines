"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useT } from "@/lib/use-i18n";
import { useTheme } from "./ThemeProvider";

const NAV = [
  { href: "/tool", key: "map" as const },
  { href: "/play", key: "playGame" as const },
  { href: "/settings", key: "settings" as const },
];

const GITHUB = "https://github.com/abdulboyprogramming-arch/faultlines";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 17M7 17l-1.6 1.6" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.8 8.8 0 1 0 11.1 11.1Z" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.06 10.06 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export default function SiteHeader() {
  const t = useT();
  const pathname = usePathname();
  const { resolved, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the mobile sheet on Escape (route changes close it via onClick).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // A hairline + shadow that only appears once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href));

  const themeLabel = resolved === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <header
      className={`no-print sticky top-0 z-40 border-b transition-shadow duration-300 ${
        scrolled
          ? "border-ink/12 bg-paper/85 shadow-[0_10px_30px_-24px_rgba(20,17,14,0.6)] backdrop-blur-md"
          : "border-transparent bg-paper/60 backdrop-blur-sm"
      }`}
    >
      <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-md py-1 transition-opacity hover:opacity-90"
          aria-label="Fault Lines — home"
        >
          <Logo className="h-8 w-8 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.15rem] font-semibold tracking-tight">{t("title")}</span>
            <span className="mt-1 hidden text-[0.65rem] uppercase tracking-[0.18em] text-ink/45 sm:block">
              Misconception map
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`relative rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive(item.href)
                      ? "text-ink"
                      : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {t(item.key)}
                  {isActive(item.href) && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-rust" aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <span className="mx-1 hidden h-5 w-px bg-ink/12 md:block" aria-hidden="true" />

          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            aria-label="Fault Lines on GitHub"
            className="hidden rounded-md p-2 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink sm:inline-flex"
          >
            <GithubIcon />
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="rounded-md p-2 text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <Link href="/tool" className="btn btn-primary btn-sm ml-1 hidden lg:inline-flex">
            {t("map")}
          </Link>

          <button
            type="button"
            className="ml-0.5 rounded-md p-2 text-ink/70 transition-colors hover:bg-ink/5 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="animate-fade-in border-t border-ink/10 bg-paper/95 backdrop-blur-md md:hidden"
        >
          <ul className="shell flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm ${
                    isActive(item.href) ? "bg-ink/6 text-ink" : "text-ink/75 hover:bg-ink/5"
                  }`}
                >
                  {t(item.key)}
                  <span aria-hidden="true" className="text-ink/35">→</span>
                </Link>
              </li>
            ))}
            <li>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm text-ink/75 hover:bg-ink/5"
              >
                GitHub <GithubIcon />
              </a>
            </li>
            <li className="pt-1">
              <Link href="/tool" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                {t("map")}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
