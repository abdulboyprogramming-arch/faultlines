"use client";
import { useEffect, useState } from "react";
import type { AnalysisResult, Cluster } from "@/lib/schema";
import { resultTotal } from "@/lib/validate";

const RISK_STYLE: Record<Cluster["risk"], { bar: string; chip: string; label: string }> = {
  high: { bar: "bg-rust", chip: "bg-rust/15 text-rust", label: "High risk" },
  med: { bar: "bg-ochre", chip: "bg-ochre/20 text-ink", label: "Med risk" },
  low: { bar: "bg-slate", chip: "bg-slate/15 text-slate", label: "Low risk" },
};

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
  const total = resultTotal(result);

  const [prevResult, setPrevResult] = useState(result);
  if (prevResult !== result) {
    setPrevResult(result);
    setReady(false);
  }
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, [result]);

  return (
    <div className="space-y-1" role="group" aria-label="Belief map — bands sized by share of class">
      {result.clusters.map((c, i) => {
        const pct = total ? (c.count / total) * 100 : 0;
        const risk = RISK_STYLE[c.risk];
        return (
          <button
            key={`${c.plain_name}-${i}`}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={selected === i}
            aria-label={`${c.plain_name}: ${c.count} of ${total} answers, ${Math.round(pct)}%, ${risk.label}`}
            className={`w-full text-left grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_3.5rem_11rem_5.5rem] items-center gap-x-3 gap-y-1 py-3 px-4 border-b border-ink/10 transition-colors hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust ${selected === i ? "bg-ink/5" : ""}`}
          >
            <div className="h-3.5 bg-ink/5 rounded-sm overflow-hidden" aria-hidden="true">
              <div
                className={`h-full ${risk.bar} rounded-sm transition-all duration-[900ms] ease-out motion-reduce:transition-none`}
                style={{ width: ready ? `${Math.max(pct, 2)}%` : "0%", transitionDelay: `${i * 120}ms` }}
              />
            </div>
            <div className="text-right font-ui text-sm tabular-nums">
              {c.count} <span className="text-ink/50 text-xs">/ {total} · {Math.round(pct)}%</span>
            </div>
            <div className="text-sm font-display leading-tight">{c.plain_name}</div>
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-ui uppercase tracking-wide ${risk.chip}`}>
                {risk.label}
              </span>
            </div>
          </button>
        );
      })}
      {result.unsure.length > 0 && (
        <button
          type="button"
          onClick={onShowUnsure}
          aria-expanded={unsureOpen}
          className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_3.5rem_11rem_5.5rem] items-center gap-x-3 py-3 px-4 text-left text-sm text-ink/70 hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust"
        >
          <div className="h-1.5 bg-ink/5 rounded-sm overflow-hidden" aria-hidden="true">
            <div
              className="h-full bg-ink/30 rounded-sm transition-all duration-[900ms] ease-out motion-reduce:transition-none"
              style={{ width: ready ? `${Math.max((result.unsure.length / Math.max(total, 1)) * 100, 2)}%` : "0%" }}
            />
          </div>
          <div className="text-right font-ui text-sm tabular-nums">{result.unsure.length}</div>
          <div className="leading-tight">Not sure — needs your eyes {onShowUnsure ? (unsureOpen ? "▲" : "▼") : ""}</div>
          <div className="text-xs text-ink/50">unclassified</div>
        </button>
      )}
      <p className="text-xs text-ink/50 pt-2" aria-live="polite">
        {total} answers · {result.clusters.length} beliefs{result.unsure.length ? ` · ${result.unsure.length} not sure` : ""}
      </p>
    </div>
  );
}
