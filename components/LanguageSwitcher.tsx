"use client";

import { localeDir, LOCALE_NAMES, LOCALE_SHORT, locales, setLocale, type Locale } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/use-i18n";

/**
 * Compact language picker for the header.
 *
 * A native `<select>` on purpose: it is keyboard- and screen-reader-friendly
 * everywhere, works on iOS without a custom sheet, and never traps focus. The
 * full, described list lives in Settings; this is the discoverable shortcut so
 * nobody has to hunt for it after a language change.
 */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useT();
  const locale = useLocale();

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t("language")}</span>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute start-2 h-3.5 w-3.5 text-ink/50"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5S14.4 18.2 12 20.5c-2.4-2.3-3.6-5.3-3.6-8.5S9.6 5.8 12 3.5Z" />
      </svg>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t("language")}
        title={LOCALE_NAMES[locale]}
        className="cursor-pointer appearance-none rounded-md border border-ink/15 bg-card/70 py-1.5 ps-7 pe-2 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-ink/30 hover:text-ink focus:border-rust"
        dir={localeDir(locale)}
      >
        {(Object.keys(locales) as Locale[]).map((code) => (
          <option key={code} value={code} lang={code} dir={localeDir(code)}>
            {LOCALE_SHORT[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
