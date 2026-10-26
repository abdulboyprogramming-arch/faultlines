"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Cluster } from "@/lib/schema";
import { useT } from "@/lib/use-i18n";

const RISK: Record<Cluster["risk"], { bar: string; chip: string; text: string }> = {
  high: { bar: "bg-rust", chip: "border-rust/35 bg-rust/10 text-rust", text: "text-rust" },
  med: { bar: "bg-ochre", chip: "border-ochre/40 bg-ochre/15 text-ink", text: "text-ochre" },
  low: { bar: "bg-slate", chip: "border-slate/35 bg-slate/12 text-slate", text: "text-slate" },
};

/**
 * Interactive preview of a real result, used on the landing page.
 * Renders one cached example classroom so the first thing a teacher sees is
 * the actual product mechanic — bands sized by share of class, click for
 * verbatim evidence — not a marketing illustration of it.
 */
export default function DemoMap({
  clusters,
  unsureCount,
  question,
  total,
}: {
  clusters: Cluster[];
  unsureCount: number;
  question: string;
  total: number;
}) {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const cluster = clusters[active];
  const pct = (n: number) => Math.round((n / Math.max(total, 1)) * 100);

  return (
    <div className="card overflow-hidden shadow-[var(--shadow-pop)]">
      <div className="flex items-start justify-between gap-4 border-b border-ink/10 bg-card-deep/60 px-5 py-4">
        <div>
          <p className="eyebrow">{t("liveExample", { n: total })}</p>
          <p className="mt-1.5 font-display text-lg leading-snug">{question}</p>
        </div>
        <span className="chip shrink-0 border-ink/15 bg-paper/70 text-ink/60">{t("cached")}</span>
      </div>

      <ul className="divide-y divide-ink/8 px-2 py-1">
        {clusters.map((c, i) => {
          const risk = RISK[c.risk];
          const riskLabel = c.risk === "high" ? t("riskHigh") : c.risk === "med" ? t("riskMed") : t("riskLow");
          const isActive = i === active;
          return (
            <li key={`${c.plain_name}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`group w-full rounded-lg px-3 py-3 text-left transition-colors ${
                  isActive ? "bg-ink/5" : "hover:bg-ink/4"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${risk.bar} ${isActive ? "" : "opacity-70"}`}
                      aria-hidden="true"
                    />
                    {c.plain_name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink/55">
                    {t("shareOfClass", { count: c.count, total, pct: pct(c.count) })}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/8">
                    <div
                      className={`h-full rounded-full ${risk.bar} transition-[width] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none`}
                      style={{
                        width: mounted ? `${Math.max(pct(c.count), 3)}%` : "0%",
                        transitionDelay: `${i * 110}ms`,
                      }}
                    />
                  </div>
                  <span className={`chip hidden shrink-0 border ${risk.chip} sm:inline-flex`}>{riskLabel}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/8 px-5 py-2.5">
        <p className="text-xs text-ink/50">
          {t("notSureLine", { n: unsureCount })}
        </p>
        <span className="text-[0.65rem] uppercase tracking-[0.14em] text-ink/35">{t("clickBand")}</span>
      </div>

      {cluster && (
        <div key={active} className="animate-fade-up border-t border-ink/10 bg-paper/60 px-5 py-4">
          <p className="eyebrow">{t("verbatimLabel")}</p>
          <blockquote className="mt-2 border-l-2 border-rust pl-3 font-display text-[0.95rem] italic leading-relaxed text-ink/80">
            “{cluster.quotes[0]}”
          </blockquote>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/60">
            <span>
              <span className="text-ink/40">{t("reteachPlan")}:</span> {cluster.reteach.title}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 1.8" strokeLinecap="round" />
              </svg>
              {cluster.reteach.minutes} min
            </span>
            <Link href="/tool" className="ml-auto font-medium text-rust underline-offset-2 hover:underline">
              {t("openFullMap")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
