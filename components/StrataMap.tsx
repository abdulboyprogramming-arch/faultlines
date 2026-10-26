"use client";
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
  const total = result.clusters.reduce((s, c) => s + c.count, 0) + result.unsure.length;
  const all = [...result.clusters, ...result.unsure.map((u) => ({ count: 1, plain_name: "Not sure — needs your eyes", risk: "low" as const, _unsure: true }))];
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
            <div className="flex-1">
              <div className="h-3 bg-rust/80 rounded-sm" style={{ width: `${Math.max(pct, 2)}%` }} />
            </div>
            <div className="w-8 text-right font-ui text-sm">{c.count}</div>
            <div className="w-48 text-sm font-display">{c.plain_name}</div>
            <div className="w-12 text-xs uppercase tracking-wide">{c.risk}</div>
          </button>
        );
      })}
      {result.unsure.length > 0 && (
        <div className="flex items-center gap-3 py-3 px-4 text-sm text-ink/60">
          <div className="flex-1">
            <div className="h-1 bg-ink/20 rounded-sm" style={{ width: "4%" }} />
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
