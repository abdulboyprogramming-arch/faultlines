"use client";
import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [size, setSize] = useState("md");

  useEffect(() => {
    const t = localStorage.getItem("faultlines-theme") as any;
    const s = localStorage.getItem("faultlines-size");
    if (t) setTheme(t);
    if (s) setSize(s);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => {
      root.classList.toggle("dark", dark);
    };
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
    localStorage.setItem("faultlines-size", size);
  }, [size]);

  useEffect(() => {
    localStorage.setItem("faultlines-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
