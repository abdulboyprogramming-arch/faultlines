"use client";
import { useState } from "react";
import type { Cluster } from "@/lib/schema";

/** Selected band detail: evidence (verbatim quotes) + reteach card + diagnostic (PRD). */
export default function BandDetail({ cluster, total }: { cluster: Cluster; total: number }) {
  const [copied, setCopied] = useState(false);
  const pct = total ? Math.round((cluster.count / total) * 100) : 0;

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
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard requires secure context */ }
  }

  return (
    <article className="border border-ink/15 rounded-md p-5 space-y-4 bg-white/40 dark:bg-white/5" aria-label={`Detail for ${cluster.plain_name}`}>
      <div>
        <h2 className="font-display text-2xl">{cluster.plain_name}</h2>
        <p className="text-sm text-ink/60 mt-1">
          <strong className="text-ink">{cluster.count} of {total}</strong> ({pct}%) · {cluster.risk} risk
        </p>
        <p className="text-sm mt-2"><span className="text-ink/50">The belief:</span> {cluster.label}</p>
        <p className="text-sm text-ink/70 mt-1">{cluster.why_it_matters}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">In their own words (verbatim)</p>
        {cluster.quotes.map((q, i) => (
          <blockquote key={i} className="italic text-sm border-l-2 border-rust pl-3 my-1.5">“{q}”</blockquote>
        ))}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Reteach · {cluster.reteach.minutes} min</p>
        <p className="font-display text-lg">{cluster.reteach.title}</p>
        <ol className="list-decimal pl-5 text-sm space-y-1 mt-1">
          {cluster.reteach.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        <p className="text-sm mt-3"><span className="text-ink/50">Check question:</span> {cluster.reteach.check_question}</p>
        <p className="text-sm"><span className="text-ink/50">Follow-up diagnostic:</span> {cluster.diagnostic_question}</p>
        <button type="button" onClick={copyReteach} className="mt-3 px-3 py-1.5 border border-ink/30 rounded-md text-xs font-ui no-print hover:bg-ink/5">
          {copied ? "Copied ✓" : "Copy this reteach card"}
        </button>
      </div>
    </article>
  );
}
