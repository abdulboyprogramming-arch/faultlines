"use client";
import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/schema";

export default function StrataMap({
  result,
  selected,
  onSelect,
}: {
  result: AnalysisResult;
  selected: number | null;
  onSelect: (i: number) => void;
}) {
  const [ready, setReady] = useState(false);
  const total = result.clusters.reduce((s, c) => s + c.count, 0) + result.unsure.length;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, [result]);

  return (
    <div className="space-y-1">
      {result.clusters.map((c, i) => {
        const pct = total ? (c.count / total) * 100 : 0;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full text-left flex items-center gap-3 py-3 px-4 border-b border-ink/10 hover:bg-ink/5 ${selected === i ? "bg-ink/5" : ""}`}
          >
            <div className="flex-1 h-3 bg-ink/5 rounded-sm overflow-hidden">
              <div
                className="h-full bg-rust/80 rounded-sm transition-all duration-[900ms] ease-out"
                style={{ width: ready ? `${Math.max(pct, 2)}%` : "0%" }}
              />
            </div>
            <div className="w-8 text-right font-ui text-sm tabular-nums">{c.count}</div>
            <div className="w-48 text-sm font-display">{c.plain_name}</div>
            <div className="w-12 text-xs uppercase tracking-wide">{c.risk}</div>
          </button>
        );
      })}
      {result.unsure.length > 0 && (
        <div className="flex items-center gap-3 py-3 px-4 text-sm text-ink/60">
          <div className="flex-1 h-1 bg-ink/5 rounded-sm overflow-hidden">
            <div
              className="h-full bg-ink/30 rounded-sm transition-all duration-[900ms] ease-out"
              style={{ width: ready ? "4%" : "0%" }}
            />
          </div>
          <div className="w-8 text-right">{result.unsure.length}</div>
          <div className="w-48">Not sure — needs your eyes</div>
          <div className="w-12 text-xs">—</div>
        </div>
      )}
      <p className="text-xs text-ink/50 pt-2">{total} answers · {result.clusters.length} beliefs</p>
    </div>
  );
}
