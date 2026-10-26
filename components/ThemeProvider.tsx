"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { getLocale, localeDir } from "@/lib/i18n";
import { notifyStorageChange, useMediaQuery, useStoredChoice } from "@/lib/use-local-store";

export type Theme = "light" | "dark" | "system";
export type TextSize = "sm" | "md" | "lg";

interface ThemeContextValue {
  theme: Theme;
  size: TextSize;
  /** What is actually on screen right now (system resolved). */
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  setSize: (s: TextSize) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "faultlines-theme";
const SIZE_KEY = "faultlines-size";

/**
 * Owns appearance settings (theme, text size, document language/direction).
 *
 * A tiny inline script in `app/layout.tsx` applies the stored theme before the
 * first paint, so dark-mode users never see a white flash. This provider keeps
 * React in sync afterwards and applies changes live — changing theme or text
 * size no longer reloads the page (it used to).
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Both values come from an external store, so hydration is clean and a change
  // in another tab (or on the Settings page) updates every consumer at once.
  const theme = useStoredChoice<Theme>(THEME_KEY, "system", ["light", "dark", "system"]);
  const size = useStoredChoice<TextSize>(SIZE_KEY, "md", ["sm", "md", "lg"]);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");

  const resolved: "light" | "dark" = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // Paint the theme class (DOM write only — no state, no extra render).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);

  // Text size is a root font-size, so every rem-based space scales with it.
  useEffect(() => {
    document.documentElement.dataset.size = size;
  }, [size]);

  // Language + direction (the boot script does this too; this covers switches).
  useEffect(() => {
    const l = getLocale();
    document.documentElement.lang = l;
    document.documentElement.dir = localeDir(l);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode */
    }
    notifyStorageChange();
  }, []);

  const setSize = useCallback((next: TextSize) => {
    try {
      localStorage.setItem(SIZE_KEY, next);
    } catch {
      /* private mode */
    }
    notifyStorageChange();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, size, resolved, setTheme, setSize, toggleTheme }),
    [theme, size, resolved, setTheme, setSize, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Safe outside the provider (returns light defaults) so isolated components —
 * the error boundary, the game — can theme themselves without crashing.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return {
    theme: "system",
    size: "md",
    resolved: "light",
    setTheme: () => {},
    setSize: () => {},
    toggleTheme: () => {},
  };
}
