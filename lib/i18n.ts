import en, { type Dict, type I18nKey } from "./i18n/en";
import fr from "./i18n/fr";
import es from "./i18n/es";
import de from "./i18n/de";
import pt from "./i18n/pt";
import yo from "./i18n/yo";
import ar from "./i18n/ar";

/**
 * UI localisation.
 *
 * Every locale is a *complete* dictionary: there is no `...en` spread, so a
 * missing translation is a TypeScript error rather than a silent English
 * string in the middle of a French page. `tests/i18n-and-history.test.ts`
 * double-checks key parity at runtime and fills any gap with English as a last
 * resort (so a shipped bug degrades to English, never to a raw key).
 *
 * Copy lives in `lib/i18n/<locale>.ts`; see `docs/i18n.md` for how to add one.
 *
 * Interpolation: `t("reportAnswers", { n: 12 })` fills `{n}`. Values are
 * numbers or strings; placeholders with no value are left as-is so a typo is
 * visible in review instead of silently blank.
 */

export type { I18nKey, Dict };
export type Interpolation = Record<string, string | number>;

export const locales = { en, fr, es, de, pt, yo, ar } as const;
export type Locale = keyof typeof locales;

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
  yo: "Yorùbá",
  ar: "العربية",
};

/** Short codes for compact pickers. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
  de: "DE",
  pt: "PT",
  yo: "YO",
  ar: "AR",
};

const RTL: Locale[] = ["ar"];
export function localeDir(l: Locale): "ltr" | "rtl" {
  return RTL.includes(l) ? "rtl" : "ltr";
}

export const LOCALE_KEY = "faultlines-locale";

export function detectLocale(): Locale {
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(LOCALE_KEY);
      if (stored && stored in locales) return stored as Locale;
    }
  } catch {
    /* storage blocked (private mode) — fall through to detection */
  }
  if (typeof navigator !== "undefined") {
    const candidates = [navigator.language, ...(navigator.languages ?? [])];
    for (const tag of candidates) {
      if (!tag) continue;
      const base = tag.slice(0, 2).toLowerCase();
      if (base in locales) return base as Locale;
    }
  }
  return "en";
}

export function getLocale(): Locale {
  return detectLocale();
}

/** Broadcast so mounted components can re-render without a full page reload. */
export const LOCALE_EVENT = "faultlines:locale";

export function setLocale(l: Locale) {
  try {
    localStorage.setItem(LOCALE_KEY, l);
  } catch {
    /* storage blocked — still apply for this session */
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = l;
    document.documentElement.dir = localeDir(l);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<Locale>(LOCALE_EVENT, { detail: l }));
  }
}

/** Fill `{placeholders}`. Missing values are left untouched (visible in review). */
export function interpolate(template: string, vars?: Interpolation): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? match : String(value);
  });
}

/** Translate for an explicit locale — the hydration-safe path used by `useT()`. */
export function tFor(locale: Locale, key: I18nKey, vars?: Interpolation): string {
  const dict = (locales[locale] ?? en) as Dict;
  const template = dict[key] ?? en[key] ?? key;
  return interpolate(template, vars);
}

/** Translate using the current (browser) locale. Prefer `useT()` in components. */
export function t(key: I18nKey, vars?: Interpolation): string {
  return tFor(getLocale(), key, vars);
}

/** Locale-aware number formatting (e.g. Arabic-Indic digits where expected). */
export function formatNumber(value: number, locale: Locale = getLocale()): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}

/** Locale-aware short date. */
export function formatDate(value: string | number | Date, locale: Locale = getLocale()): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Locale-aware date + time for history rows. */
export function formatDateTime(value: string | number | Date, locale: Locale = getLocale()): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(date);
  } catch {
    return date.toISOString();
  }
}

/** Best-effort browser locale for `<html lang>` when nothing is stored. */
export function preferredLocale(): Locale {
  return detectLocale();
}
