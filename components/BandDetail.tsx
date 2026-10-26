"use client";

import { useEffect, useState } from "react";
import type { Cluster } from "@/lib/schema";
import { useT } from "@/lib/use-i18n";

const RISK: Record<Cluster["risk"], { chip: string; dot: string }> = {
  high: { chip: "border-rust/35 bg-rust/10 text-rust", dot: "bg-rust" },
  med: { chip: "border-ochre/45 bg-ochre/15 text-ink/75", dot: "bg-ochre" },
  low: { chip: "border-slate/35 bg-slate/12 text-slate", dot: "bg-slate" },
};

/** Selected band detail: verbatim evidence + reteach card + follow-up diagnostic. */
export default function BandDetail({
  cluster,
  total,
  onPrev,
  onNext,
  position,
}: {
  cluster: Cluster;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  /** e.g. "2 of 3" */
  position?: string;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const pct = total ? Math.round((cluster.count / total) * 100) : 0;
  const risk = RISK[cluster.risk];
  const riskLabel =
    cluster.risk === "high" ? t("riskHigh") : cluster.risk === "med" ? t("riskMed") : t("riskLow");

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function copyReteach() {
    const text = [
      `${cluster.reteach.title} (${cluster.reteach.minutes} min)`,
      ...cluster.reteach.steps.map((s, i) => `${i + 1}. ${s}`),
      `Check: ${cluster.reteach.check_question}`,
      `Follow-up diagnostic: ${cluster.diagnostic_question}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* clipboard requires a secure context */
    }
  }

  return (
    <article
      key={cluster.plain_name + cluster.count}
      className="card animate-fade-up overflow-hidden"
      aria-label={cluster.plain_name}
    >
      <header className="border-b border-ink/10 bg-card-deep/40 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`chip border ${risk.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} aria-hidden="true" />
              {riskLabel}
            </span>
            <h2 className="mt-2.5 font-display text-[1.4rem] leading-tight">{cluster.plain_name}</h2>
            <p className="mt-1 text-sm text-ink/55">
              <strong className="font-semibold text-ink/80">
                {cluster.count} of {total}
              </strong>{" "}
              {pct}%
            </p>
          </div>
          {(onPrev || onNext) && (
            <div className="no-print flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onPrev}
                disabled={!onPrev}
                aria-label={t("prevBelief")}
                className="rounded-md border border-ink/15 p-1.5 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14.5 6 9 12l5.5 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!onNext}
                aria-label={t("nextBelief")}
                className="rounded-md border border-ink/15 p-1.5 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9.5 6 15 12l-5.5 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {position && <p className="mt-2 text-[0.7rem] uppercase tracking-[0.12em] text-ink/40">{position}</p>}
      </header>

      <div className="space-y-5 p-5">
        <div>
          <p className="eyebrow">{t("theBelief")}</p>
          <p className="mt-1.5 text-sm leading-relaxed">{cluster.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">{cluster.why_it_matters}</p>
        </div>

        <div>
          <p className="eyebrow">{t("verbatimLabel")}</p>
          <ul className="mt-2 space-y-2">
            {cluster.quotes.map((q, i) => (
              <li key={i} className="rounded-r-md border-l-2 border-rust bg-rust/[0.04] py-1.5 pl-3 pr-2">
                <p className="font-display text-[0.95rem] italic leading-relaxed text-ink/85">“{q}”</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-ink/12 bg-paper/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="eyebrow">{t("reteachPlan")}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/8 px-2 py-0.5 text-[0.7rem] font-medium text-ink/65">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7.5V12l3 1.8" strokeLinecap="round" />
              </svg>
              {cluster.reteach.minutes} min
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg leading-snug">{cluster.reteach.title}</h3>
          <ol className="mt-2.5 space-y-1.5 text-sm">
            {cluster.reteach.steps.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink/8 text-[0.65rem] font-semibold tabular-nums text-ink/70">
                  {i + 1}
                </span>
                <span className="leading-relaxed text-ink/80">{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 space-y-2.5 border-t border-ink/10 pt-3">
            <div>
              <p className="eyebrow">{t("checkQuestion")}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/80">{cluster.reteach.check_question}</p>
            </div>
            <div className="rounded-md bg-slate/8 p-2.5">
              <p className="eyebrow">{t("followUp")}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/80">{cluster.diagnostic_question}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyReteach}
            className={`btn btn-sm mt-4 no-print ${copied ? "btn-primary" : "btn-outline"}`}
          >
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5 9.5 17 19 7" />
                </svg>
                {t("copied")}
              </>
            ) : (
              t("copyCard")
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
