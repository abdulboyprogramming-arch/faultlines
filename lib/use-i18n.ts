"use client";

import { useCallback, useEffect, useState } from "react";
import { getLocale, LOCALE_EVENT, tFor, type I18nKey, type Locale } from "@/lib/i18n";

/**
 * Hydration-safe translation hook.
 *
 * `t()` reads `localStorage` during render. On the server there is no storage,
 * so it always answers in English — which meant every non-English visitor got a
 * React hydration mismatch (and React then threw the tree away and re-rendered,
 * which is what "the page looks broken for a second" usually is).
 *
 * Here the first client render also uses English, then a mount effect switches
 * to the stored/detected locale and re-renders — matching the server output and
 * keeping SSR correct.
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
    return () => window.removeEventListener(LOCALE_EVENT, onChange);
  }, []);

  return useCallback((key: I18nKey) => tFor(locale, key), [locale]);
}

/** Current UI locale (English until mounted), for `<html lang>` style decisions. */
export function useLocale(): Locale {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    const sync = () => setLocaleState(getLocale());
    sync();
    const onChange = (e: Event) => setLocaleState((e as CustomEvent<Locale>).detail ?? getLocale());
    window.addEventListener(LOCALE_EVENT, onChange);
    return () => window.removeEventListener(LOCALE_EVENT, onChange);
  }, []);
  return locale;
}
