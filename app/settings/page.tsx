"use client";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { getLocale, setLocale, t, LOCALE_NAMES, locales, type Locale } from "@/lib/i18n";
import { clearAllLocalData, loadHistory } from "@/lib/history";

type Theme = "light" | "dark" | "system";
type Size = "sm" | "md" | "lg";

export default function Settings() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "system" : ((localStorage.getItem("faultlines-theme") as Theme) || "system"));
  const [size, setSize] = useState<Size>(() =>
    typeof window === "undefined" ? "md" : ((localStorage.getItem("faultlines-size") as Size) || "md"));
  const [locale, setLoc] = useState<Locale>(() => getLocale());
  const [provider, setProvider] = useState<string>("…");
  const [savedCount, setSavedCount] = useState(() => loadHistory().length);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d: { provider?: string }) => setProvider(d.provider === "llm" ? "AI provider (server-configured)" : "Built-in heuristic"))
      .catch(() => setProvider("Built-in heuristic (static deployment)"));
  }, []);

  function save(t: Theme, s: Size) {
    localStorage.setItem("faultlines-theme", t);
    localStorage.setItem("faultlines-size", s);
    setTheme(t);
    setSize(s);
    location.reload();
  }

  const selectCls = "border border-ink/20 bg-white dark:bg-ink rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-rust";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="max-w-xl mx-auto px-6 py-10">
        <h1 className="font-display text-4xl">{t("settings")}</h1>
        {message && <p role="status" className="mt-4 border border-ochre bg-ochre/10 rounded-md px-4 py-3 text-sm">{message}</p>}

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="theme" className="block text-sm mb-1 font-ui">Theme</label>
            <select id="theme" value={theme} onChange={(e) => save(e.target.value as Theme, size)} className={selectCls} suppressHydrationWarning>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label htmlFor="size" className="block text-sm mb-1 font-ui">Text size</label>
            <select id="size" value={size} onChange={(e) => save(theme, e.target.value as Size)} className={selectCls} suppressHydrationWarning>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
          <div>
            <label htmlFor="language" className="block text-sm mb-1 font-ui">Language</label>
            <select id="language" value={locale} onChange={(e) => { setLoc(e.target.value as Locale); setLocale(e.target.value as Locale); }} className={selectCls} suppressHydrationWarning>
              {(Object.keys(locales) as Locale[]).map((l) => (
                <option key={l} value={l}>{LOCALE_NAMES[l]}</option>
              ))}
            </select>
            <p className="text-xs text-ink/50 mt-1">Translates the main tool labels. Analysis works in any language you paste.</p>
          </div>
        </div>

        <section className="mt-10 border-t border-ink/10 pt-6 space-y-3" aria-label="Analysis and privacy">
          <h2 className="font-display text-2xl">Analysis & privacy</h2>
          <p className="text-sm text-ink/70">
            Analysis engine on this deployment: <strong className="text-ink">{provider}</strong>.
            The heuristic groups similar wording and always quotes verbatim; a server-configured AI provider
            additionally judges correctness and exam risk. API keys, if any, live on the server — never in your browser.
          </p>
          <p className="text-sm text-ink/70">
            Locally saved reports in this browser: <strong className="text-ink">{savedCount}</strong>. Nothing is stored on a server.
            On a shared or school computer, clear everything when you finish:
          </p>
          <button
            type="button"
            className="px-4 py-2 border border-rust text-rust rounded-md text-sm font-ui hover:bg-rust/10"
            onClick={() => {
              if (confirm("Delete all Fault Lines data stored in this browser (settings + saved reports)?")) {
                clearAllLocalData();
                setSavedCount(0);
                setMessage("All local Fault Lines data deleted. Settings will reset on reload.");
              }
            }}
          >
            Clear all local data
          </button>
        </section>
      </main>
    </div>
  );
}
