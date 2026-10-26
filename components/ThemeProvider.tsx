"use client";
import { useEffect, useState } from "react";
import { getLocale, localeDir } from "@/lib/i18n";

type Theme = "light" | "dark" | "system";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>(() =>
    typeof window === "undefined" ? "system" : ((localStorage.getItem("faultlines-theme") as Theme) || "system"));
  const [size] = useState<string>(() =>
    typeof window === "undefined" ? "md" : localStorage.getItem("faultlines-size") || "md");

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    apply(theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.size = size;
  }, [size]);

  useEffect(() => {
    const l = getLocale();
    document.documentElement.lang = l;
    document.documentElement.dir = localeDir(l);
  }, []);

  return <>{children}</>;
}
