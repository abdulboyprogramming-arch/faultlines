"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { LOCALE_NAMES, locales, setLocale, type Locale } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/use-i18n";
import { clearAllLocalData, HISTORY_KEY, loadHistory } from "@/lib/history";
import { useStoredString } from "@/lib/use-local-store";
import { useTheme, type TextSize, type Theme } from "@/components/ThemeProvider";
import { backupFilename, buildBackup, collectLocalData, MAX_BACKUP_BYTES, parseBackup, restoreLocalData } from "@/lib/backup";
import { download } from "@/lib/export";
import { notifyStorageChange } from "@/lib/use-local-store";

const THEMES: { value: Theme; label: string; hint: string }[] = [
  { value: "light", label: "Light", hint: "Warm paper" },
  { value: "system", label: "System", hint: "Match device" },
  { value: "dark", label: "Dark", hint: "Low light" },
];

const SIZES: { value: TextSize; label: string; sample: string }[] = [
  { value: "sm", label: "Small", sample: "Aa" },
  { value: "md", label: "Medium", sample: "Aa" },
  { value: "lg", label: "Large", sample: "Aa" },
];

export default function Settings() {
  const t = useT();
  const locale = useLocale();
  const { theme, size, setTheme, setSize } = useTheme();
  const [provider, setProvider] = useState<string>("Checking…");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"ok" | "warn">("ok");
  const restoreRef = useRef<HTMLInputElement>(null);

  function say(text: string, tone: "ok" | "warn" = "ok") {
    setMessageTone(tone);
    setMessage(text);
  }

  function downloadBackup() {
    const data = collectLocalData(localStorage);
    const keys = Object.keys(data).length;
    if (keys === 0) {
      say("There is nothing saved in this browser yet — map a class first.", "warn");
      return;
    }
    download(backupFilename(), JSON.stringify(buildBackup(data), null, 2), "application/json");
    say(`Backup downloaded: ${keys} saved item${keys === 1 ? "" : "s"}. Keep it somewhere safe.`);
  }

  async function restoreBackup(file: File) {
    if (file.size > MAX_BACKUP_BYTES) {
      say("That file is too large to be a Fault Lines backup.", "warn");
      return;
    }
    const parsed = parseBackup(await file.text());
    if (!parsed.ok || !parsed.backup) {
      say(parsed.error ?? "That file could not be read.", "warn");
      return;
    }
    const when = new Date(parsed.backup.exportedAt).toLocaleString();
    if (!confirm(`Restore ${parsed.keyCount} saved item(s) from ${when}?\n\nThis replaces matching settings and saved maps in this browser.`)) {
      return;
    }
    const restored = restoreLocalData(parsed.backup, localStorage);
    notifyStorageChange();
    say(`Restored ${restored} item${restored === 1 ? "" : "s"} — appearance and saved maps updated.`);
  }

  const historyRaw = useStoredString(HISTORY_KEY);
  const savedCount = useMemo(() => {
    void historyRaw; // subscription trigger: re-count whenever storage changes
    return loadHistory().length;
  }, [historyRaw]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d: { provider?: string }) =>
        setProvider(d.provider === "llm" ? "AI provider (server-configured)" : "Built-in heuristic"),
      )
      .catch(() => setProvider("Built-in heuristic (offline / static deployment)"));
  }, []);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(id);
  }, [message]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main id="main-content" className="shell py-8 sm:py-12">
        <div className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink/45">
            <Link href="/" className="transition-colors hover:text-ink">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink/70">{t("settings")}</span>
          </nav>
          <h1 className="text-[clamp(1.9rem,4vw,2.6rem)]">{t("settings")}</h1>
          <p className="mt-2 max-w-xl leading-relaxed text-ink/65">
            Appearance and privacy controls. Everything here is stored in this browser only — there is no
            account and no server-side profile.
          </p>
        </div>

        {message && (
          <p
            role="status"
            className={`mt-6 max-w-3xl rounded-lg border px-4 py-3 text-sm ${
              messageTone === "ok" ? "border-moss/40 bg-moss/10" : "border-ochre/50 bg-ochre/10"
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-8 grid max-w-3xl gap-5">
          {/* appearance */}
          <section className="card p-5" aria-labelledby="appearance-heading">
            <h2 id="appearance-heading" className="font-display text-lg">Appearance</h2>
            <p className="mt-1 text-sm text-ink/55">Changes apply instantly — no reload.</p>

            <div className="mt-5 space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium">{t("theme")}</p>
                <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Theme">
                  {THEMES.map((option) => {
                    const active = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setTheme(option.value)}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          active
                            ? "border-rust bg-rust/[0.06] shadow-[0_0_0_1px_var(--color-rust)]"
                            : "border-ink/15 hover:border-ink/30 hover:bg-ink/[0.03]"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="text-sm font-medium">{option.label}</span>
                          {active && <span className="text-xs text-rust" aria-hidden="true">●</span>}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink/45">{option.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">{t("textSize")}</p>
                <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Text size">
                  {SIZES.map((option) => {
                    const active = size === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSize(option.value)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all ${
                          active
                            ? "border-rust bg-rust/[0.06] shadow-[0_0_0_1px_var(--color-rust)]"
                            : "border-ink/15 hover:border-ink/30 hover:bg-ink/[0.03]"
                        }`}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        <span
                          aria-hidden="true"
                          className={`font-display ${
                            option.value === "sm" ? "text-base" : option.value === "md" ? "text-xl" : "text-2xl"
                          }`}
                        >
                          {option.sample}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-ink/45">
                  Text size scales the whole interface, including spacing — useful on a projector or an old
                  classroom laptop.
                </p>
              </div>
            </div>
          </section>

          {/* language */}
          <section className="card p-5" aria-labelledby="language-heading">
            <h2 id="language-heading" className="font-display text-lg">{t("language")}</h2>
            <p className="mt-1 text-sm text-ink/55">
              Translates the main interface labels. Analysis works on answers in any language.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Interface language">
              {(Object.keys(locales) as Locale[]).map((code) => {
                const active = locale === code;
                return (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLocale(code)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                      active
                        ? "border-rust bg-rust/[0.06] font-medium shadow-[0_0_0_1px_var(--color-rust)]"
                        : "border-ink/15 hover:border-ink/30 hover:bg-ink/[0.03]"
                    }`}
                    dir={code === "ar" ? "rtl" : "ltr"}
                  >
                    {LOCALE_NAMES[code]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* engine */}
          <section className="card p-5" aria-labelledby="engine-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="engine-heading" className="font-display text-lg">Analysis &amp; privacy</h2>
              <span className="chip border-moss/40 bg-moss/12 text-moss">{provider}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              The built-in heuristic groups answers by wording similarity and always quotes verbatim. A
              server-configured AI provider additionally judges correctness and exam risk. API keys, if any,
              live on the server — never in your browser.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">
              Locally saved reports in this browser: <strong className="font-semibold text-ink">{savedCount}</strong>.
              Nothing is stored on a server.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={downloadBackup}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 4v11" />
                  <path d="M7.5 10.5 12 15l4.5-4.5" />
                  <path d="M5 19.5h14" />
                </svg>
                Download backup
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => restoreRef.current?.click()}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 15V4" />
                  <path d="M7.5 8.5 12 4l4.5 4.5" />
                  <path d="M5 19.5h14" />
                </svg>
                Restore backup
              </button>
              <input
                ref={restoreRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label="Restore a Fault Lines backup file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void restoreBackup(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm border-rust/50 text-rust hover:bg-rust/10"
                onClick={() => {
                  if (confirm("Delete all Fault Lines data stored in this browser (settings + saved reports)?")) {
                    clearAllLocalData();
                    say("All local Fault Lines data deleted. Reload to see default settings.", "warn");
                  }
                }}
              >
                Clear all local data
              </button>
              <Link href="/tool" className="btn btn-ghost btn-sm">
                Back to the tool
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink/45">
              A backup is a single JSON file containing only preferences and saved maps — no student answers are
              ever uploaded. Restoring validates the file first and imports nothing else.
            </p>
          </section>

          {/* about */}
          <section className="card p-5" aria-labelledby="about-heading">
            <h2 id="about-heading" className="font-display text-lg">About</h2>
            <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[9rem_1fr]">
              <dt className="text-ink/45">Version</dt>
              <dd>1.2.0 · MVP</dd>
              <dt className="text-ink/45">Built by</dt>
              <dd>Abdulrahman Adeeyo</dd>
              <dt className="text-ink/45">Licence</dt>
              <dd>MIT — free to use, fork and adapt</dd>
              <dt className="text-ink/45">Source</dt>
              <dd>
                <a
                  href="https://github.com/abdulboyprogramming-arch/faultlines"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-rust"
                >
                  github.com/abdulboyprogramming-arch/faultlines
                </a>
              </dd>
            </dl>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
