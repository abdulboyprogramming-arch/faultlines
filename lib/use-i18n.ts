"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  getLocale,
  LOCALE_EVENT,
  tFor,
  type I18nKey,
  type Interpolation,
  type Locale,
} from "@/lib/i18n";

/**
 * Hydration-safe translation hook.
 *
 * `t()` reads `localStorage` during render. On the server there is no storage,
 * so it always answers in English — which meant every non-English visitor got a
 * React hydration mismatch. Here the first client render also uses English,
 * then a mount effect switches to the stored/detected locale and re-renders.
 *
 * Returned helpers:
 *  - `t(key, vars?)`  → translated string with `{placeholders}` filled
 *  - `locale`         → current UI locale
 *  - `num`, `date`, `dateTime` → locale-aware formatting
 */
export function useT() {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const sync = () => setLocaleState(getLocale());
    sync();
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      setLocaleState(detail ?? getLocale());
    };
    window.addEventListener(LOCALE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(LOCALE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const t = useCallback(
    (key: I18nKey, vars?: Interpolation) => tFor(locale, key, vars),
    [locale],
  );
  const num = useCallback((value: number) => formatNumber(value, locale), [locale]);
  const date = useCallback((value: string | number | Date) => formatDate(value, locale), [locale]);
  const dateTime = useCallback((value: string | number | Date) => formatDateTime(value, locale), [locale]);

  return Object.assign(t, { t, locale, num, date, dateTime });
}

/** Current UI locale (English until mounted). */
export function useLocale(): Locale {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    const sync = () => setLocaleState(getLocale());
    sync();
    const onChange = (e: Event) => setLocaleState((e as CustomEvent<Locale>).detail ?? getLocale());
    window.addEventListener(LOCALE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(LOCALE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return locale;
}
