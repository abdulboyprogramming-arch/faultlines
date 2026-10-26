"use client";
import { useEffect, useState } from "react";
import { getLocale, setLocale, locales } from "@/lib/i18n";

export default function Settings() {
  const [theme, setTheme] = useState("system");
  const [size, setSize] = useState("md");

  const [locale, setL] = useState("en");
  useEffect(() => {
    setTheme(localStorage.getItem("faultlines-theme") || "system");
    setSize(localStorage.getItem("faultlines-size") || "md");
    setL(getLocale());
  }, []);

  const save = (t: string, s: string) => {
    localStorage.setItem("faultlines-theme", t);
    localStorage.setItem("faultlines-size", s);
    setTheme(t);
    setSize(s);
    location.reload();
  };

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl">Settings</h1>
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Theme</label>
          <select value={theme} onChange={(e) => save(e.target.value, size)} className="border border-ink/20 bg-white dark:bg-ink rounded px-3 py-2">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Text size</label>
          <select value={size} onChange={(e) => save(theme, e.target.value)} className="border border-ink/20 bg-white dark:bg-ink rounded px-3 py-2">
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>
        <div>
          <label className="block text-sm mb-1">Language</label>
          <select value={locale} onChange={(e) => setLocale(e.target.value as any)} className="border border-ink/20 bg-white dark:bg-ink rounded px-3 py-2">
            {Object.keys(locales).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
    </main>
  );
}
