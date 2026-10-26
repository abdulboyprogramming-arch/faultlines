"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnalysisResult, Cluster } from "@/lib/schema";
import { resultTotal } from "@/lib/validate";

type Filter = "all" | Cluster["risk"];

const RISK_STYLE: Record<Cluster["risk"], { bar: string; chip: string; label: string }> = {
  high: { bar: "bg-rust", chip: "border-rust/35 bg-rust/10 text-rust", label: "High risk" },
  med: { bar: "bg-ochre", chip: "border-ochre/45 bg-ochre/15 text-ink/75", label: "Medium" },
  low: { bar: "bg-slate", chip: "border-slate/35 bg-slate/12 text-slate", label: "Low risk" },
};

/**
 * The strata map: one band per belief, sized by share of class and ordered by
 * exam risk. Bars animate in from zero (staggered) on every new result; the
 * whole list is a group of real buttons, so keyboard and screen-reader users
 * get the same interaction as a mouse.
 */
export default function StrataMap({
  result,
  selected,
  onSelect,
  onShowUnsure,
  unsureOpen = false,
}: {
  result: AnalysisResult;
  selected: number | null;
  onSelect: (i: number) => void;
  onShowUnsure?: () => void;
  unsureOpen?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const total = resultTotal(result);

  const [prevResult, setPrevResult] = useState(result);
  if (prevResult !== result) {
    setPrevResult(result);
    setReady(false);
    setFilter("all");
  }

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(id);
  }, [result]);

  const counts = useMemo(() => {
    const c = { high: 0, med: 0, low: 0 };
    for (const cluster of result.clusters) c[cluster.risk] += 1;
    return c;
  }, [result.clusters]);

  const visible = result.clusters
    .map((cluster, index) => ({ cluster, index }))
    .filter(({ cluster }) => filter === "all" || cluster.risk === filter);

  const pct = (n: number) => (total ? (n / total) * 100 : 0);

  return (
    <section className="card overflow-hidden" aria-label="Belief map — bands sized by share of class">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-card-deep/40 px-4 py-3">
        <h2 className="font-display text-base font-semibold">The map</h2>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by risk">
          {(
            [
              ["all", "All", result.clusters.length],
              ["high", "High", counts.high],
              ["med", "Med", counts.med],
              ["low", "Low", counts.low],
            ] as const
          ).map(([value, label, n]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              disabled={n === 0}
              className={`rounded-full px-2.5 py-1 text-[0.7rem] font-medium transition-colors disabled:opacity-40 ${
                filter === value
                  ? "bg-ink text-paper"
                  : "border border-ink/15 text-ink/60 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {label}
              <span className="ml-1 tabular-nums opacity-60">{n}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-ink/8">
        {visible.map(({ cluster: c, index: i }) => {
          const risk = RISK_STYLE[c.risk];
          const isSelected = selected === i;
          return (
            <li key={`${c.plain_name}-${i}`}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={isSelected}
                aria-label={`${c.plain_name}: ${c.count} of ${total} answers (${Math.round(pct(c.count))}%), ${risk.label}`}
                className={`group relative w-full px-4 py-3.5 text-left transition-colors ${
                  isSelected ? "bg-ink/[0.045]" : "hover:bg-ink/[0.025]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-2 left-0 w-[3px] rounded-full ${risk.bar} transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  }`}
                />
                <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${risk.bar}`} aria-hidden="true" />
                    <span className="font-display text-[0.98rem] font-semibold leading-tight">{c.plain_name}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`chip hidden border sm:inline-flex ${risk.chip}`}>{risk.label}</span>
                    <span className="text-xs tabular-nums text-ink/60">
                      <strong className="font-semibold text-ink/85">{c.count}</strong> of {total} ·{" "}
                      {Math.round(pct(c.count))}%
                    </span>
                  </span>
                </span>
                <span className="mt-2.5 block h-2 overflow-hidden rounded-full bg-ink/8" aria-hidden="true">
                  <span
                    className={`block h-full rounded-full ${risk.bar} transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none`}
                    style={{ width: ready ? `${Math.max(pct(c.count), 2)}%` : "0%", transitionDelay: `${i * 90}ms` }}
                  />
                </span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-ink/50">No beliefs at this risk level.</li>
        )}
      </ul>

      {result.unsure.length > 0 && (
        <button
          type="button"
          onClick={onShowUnsure}
          aria-expanded={unsureOpen}
          className="flex w-full items-center justify-between gap-3 border-t border-ink/10 bg-ink/[0.015] px-4 py-3 text-left text-sm transition-colors hover:bg-ink/[0.04]"
        >
          <span className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm border border-dashed border-ink/40" aria-hidden="true" />
            <span className="text-ink/70">Not sure — needs your eyes</span>
          </span>
          <span className="flex items-center gap-2 text-xs text-ink/55">
            <span className="tabular-nums">{result.unsure.length} unclassified</span>
            <span
              aria-hidden="true"
              className={`inline-block transition-transform duration-300 ${unsureOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </span>
        </button>
      )}

      <p className="border-t border-ink/10 px-4 py-2.5 text-xs text-ink/45" aria-live="polite">
        {total} answers · {result.clusters.length} beliefs
        {result.unsure.length ? ` · ${result.unsure.length} not sure` : ""} · ordered by exam risk
      </p>
    </section>
  );
}
