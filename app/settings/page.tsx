"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { localeDir, LOCALE_NAMES, LOCALE_SHORT, locales, setLocale, type I18nKey, type Locale } from "@/lib/i18n";
import { useLocale, useT } from "@/lib/use-i18n";
import { clearAllLocalData, HISTORY_KEY, loadHistory } from "@/lib/history";
import { useStoredString } from "@/lib/use-local-store";
import { useTheme, type TextSize, type Theme } from "@/components/ThemeProvider";
import { backupFilename, buildBackup, collectLocalData, MAX_BACKUP_BYTES, parseBackup, restoreLocalData } from "@/lib/backup";
import { download } from "@/lib/export";
import { notifyStorageChange } from "@/lib/use-local-store";

const THEMES: { value: Theme; label: I18nKey; hint: I18nKey }[] = [
  { value: "light", label: "themeLight", hint: "themeLightHint" },
  { value: "system", label: "themeSystem", hint: "themeSystemHint" },
  { value: "dark", label: "themeDark", hint: "themeDarkHint" },
];

const SIZES: { value: TextSize; label: I18nKey; sample: string }[] = [
  { value: "sm", label: "sizeSmall", sample: "Aa" },
  { value: "md", label: "sizeMedium", sample: "Aa" },
  { value: "lg", label: "sizeLarge", sample: "Aa" },
];

export default function Settings() {
  const t = useT();
  const locale = useLocale();
  const { theme, size, setTheme, setSize } = useTheme();
  const [provider, setProvider] = useState<I18nKey | string>("engineChecking");
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
      say(t("backupEmpty"), "warn");
      return;
    }
    download(backupFilename(), JSON.stringify(buildBackup(data), null, 2), "application/json");
    say(t("backupDone", { n: keys }));
  }

  async function restoreBackup(file: File) {
    if (file.size > MAX_BACKUP_BYTES) {
      say(t("fileTooBig"), "warn");
      return;
    }
    const parsed = parseBackup(await file.text());
    if (!parsed.ok || !parsed.backup) {
      say(t("restoreRejected"), "warn");
      return;
    }
    const when = t.dateTime(parsed.backup.exportedAt);
    if (!confirm(t("restoreConfirm", { n: parsed.keyCount ?? 0, date: when }))) {
      return;
    }
    const restored = restoreLocalData(parsed.backup, localStorage);
    notifyStorageChange();
    say(t("restoreDone", { n: restored }));
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
        setProvider(d.provider === "llm" ? "engineAi" : "engineHeuristic"),
      )
      .catch(() => setProvider("engineHeuristicOffline"));
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
          <nav aria-label={t("breadcrumbHome")} className="mb-3 flex items-center gap-1.5 text-xs text-ink/45">
            <Link href="/" className="transition-colors hover:text-ink">
              {t("breadcrumbHome")}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink/70">{t("settings")}</span>
          </nav>
          <h1 className="text-[clamp(1.9rem,4vw,2.6rem)]">{t("settingsTitle")}</h1>
          <p className="mt-2 max-w-xl leading-relaxed text-ink/65">{t("settingsSubtitle")}</p>
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
            <h2 id="appearance-heading" className="font-display text-lg">
              {t("appearance")}
            </h2>
            <p className="mt-1 text-sm text-ink/55">{t("appearanceSub")}</p>

            <div className="mt-5 space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium">{t("theme")}</p>
                <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label={t("theme")}>
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
                          <span className="text-sm font-medium">{t(option.label)}</span>
                          {active && <span className="text-xs text-rust" aria-hidden="true">●</span>}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink/45">{t(option.hint)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">{t("textSize")}</p>
                <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label={t("textSize")}>
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
                        <span className="text-sm font-medium">{t(option.label)}</span>
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
                <p className="mt-2 text-xs text-ink/45">{t("textSizeSub")}</p>
              </div>
            </div>
          </section>

          {/* language */}
          <section className="card p-5" aria-labelledby="language-heading">
            <h2 id="language-heading" className="font-display text-lg">{t("language")}</h2>
            <p className="mt-1 text-sm text-ink/55">{t("languageSub")}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={t("language")}>
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
                    dir={localeDir(code)}
                    lang={code}
                  >
                    <span className="block">{LOCALE_NAMES[code]}</span>
                    <span className="mt-0.5 block text-[0.65rem] uppercase tracking-[0.12em] text-ink/40">
                      {LOCALE_SHORT[code]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* engine */}
          <section className="card p-5" aria-labelledby="engine-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="engine-heading" className="font-display text-lg">
                {t("engineTitle")}
              </h2>
              <span className="chip border-moss/40 bg-moss/12 text-moss">
                {provider === "engineChecking" || provider === "engineAi" || provider === "engineHeuristic" || provider === "engineHeuristicOffline"
                  ? t(provider as I18nKey)
                  : provider}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{t("engineBody")}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{t("savedLocal", { n: savedCount })}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={downloadBackup}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 4v11" />
                  <path d="M7.5 10.5 12 15l4.5-4.5" />
                  <path d="M5 19.5h14" />
                </svg>
                {t("backupBtn")}
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => restoreRef.current?.click()}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 15V4" />
                  <path d="M7.5 8.5 12 4l4.5 4.5" />
                  <path d="M5 19.5h14" />
                </svg>
                {t("restoreBtn")}
              </button>
              <input
                ref={restoreRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label={t("downloadAria")}
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
                  if (confirm(t("clearConfirm"))) {
                    clearAllLocalData();
                    say(t("clearedMsg"), "warn");
                  }
                }}
              >
                {t("clearBtn")}
              </button>
              <Link href="/tool" className="btn btn-ghost btn-sm">
                {t("backToTool")}
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink/45">{t("backupNote")}</p>
          </section>

          {/* about */}
          <section className="card p-5" aria-labelledby="about-heading">
            <h2 id="about-heading" className="font-display text-lg">
              {t("aboutTitle")}
            </h2>
            <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[9rem_1fr]">
              <dt className="text-ink/45">{t("aboutVersion")}</dt>
              <dd>1.3.0 · MVP</dd>
              <dt className="text-ink/45">{t("aboutBuiltBy")}</dt>
              <dd>Abdulrahman Adeeyo</dd>
              <dt className="text-ink/45">{t("aboutLicence")}</dt>
              <dd>{t("aboutLicenceValue")}</dd>
              <dt className="text-ink/45">{t("aboutSource")}</dt>
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
