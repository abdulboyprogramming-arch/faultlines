"use client";

import Logo from "./Logo";
import { useT } from "@/lib/use-i18n";

/**
 * Programmatic loading object: a core sample being read top-to-bottom, with a
 * scan line and strata bands that breathe in sequence. Pure CSS (zero assets),
 * so it works offline and inside the service worker cache. Reduced-motion users
 * get the static version automatically via globals.css.
 */
export default function StrataLoader({
  label,
  fullPage = false,
}: {
  label?: string;
  fullPage?: boolean;
}) {
  const t = useT();
  const text = label ?? t("loaderReading");
  const bands = [
    { color: "bg-rust", width: "94%", delay: "0ms" },
    { color: "bg-ochre", width: "78%", delay: "120ms" },
    { color: "bg-slate", width: "88%", delay: "240ms" },
    { color: "bg-ink/60", width: "52%", delay: "360ms" },
    { color: "bg-rust/70", width: "68%", delay: "480ms" },
  ];

  const inner = (
    <div className="flex flex-col items-center gap-6" role="status" aria-live="polite" aria-label={text}>
      <div className="relative">
        <Logo className="h-14 w-14" variant="animated" />
      </div>

      <div className="relative w-60 overflow-hidden rounded-lg border border-ink/10 bg-card p-2 shadow-[var(--shadow-card)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-12 animate-scan bg-gradient-to-b from-transparent via-rust/12 to-transparent"
        />
        <div className="space-y-1.5" aria-hidden="true">
          {bands.map((b, i) => (
            <div key={i} className="h-2.5 overflow-hidden rounded-sm bg-ink/6">
              <div
                className={`h-full origin-left animate-strata-load rounded-sm ${b.color}`}
                style={{ width: b.width, animationDelay: b.delay }}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="animate-pulse-soft text-sm text-ink/60">{text}</p>
    </div>
  );

  return fullPage ? (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-paper px-6 text-ink">
      {inner}
    </main>
  ) : (
    inner
  );
}
