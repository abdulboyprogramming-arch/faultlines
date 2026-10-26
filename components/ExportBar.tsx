"use client";

import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/schema";
import { download, toCsv, toMarkdown, toPlainPlan } from "@/lib/export";
import { shareUrl } from "@/lib/share";
import { useT } from "@/lib/use-i18n";

/** Export + share actions for a result (one-page plan via copy/print, files, link). */
export default function ExportBar({ result }: { result: AnalysisResult }) {
  const t = useT();
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 2600);
    return () => clearTimeout(id);
  }, [feedback]);

  async function copy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(msg);
    } catch {
      setFeedback("Copy failed — your browser blocked clipboard access. Try the print or download option.");
    }
  }

  return (
    <section className="no-print card p-4" aria-label="Export and share">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">Take it with you</h2>
          <p className="mt-0.5 text-xs text-ink/50">One-page plan, files for your records, or a link to share.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-accent btn-sm" onClick={() => copy(toPlainPlan(result), "Reteach plan copied to your clipboard ✓")}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6a2 2 0 0 0-2 2v8.5A2.5 2.5 0 0 0 6.5 16" />
            </svg>
            {t("export")}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>
            Print / PDF
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => download("fault-lines-report.md", toMarkdown(result), "text/markdown")}>
            Markdown
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => download("fault-lines-report.csv", toCsv(result), "text/csv")}>
            CSV
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => download("fault-lines-report.json", JSON.stringify(result, null, 2), "application/json")}>
            JSON
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => copy(shareUrl(result), "Shareable link copied ✓")}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1.5 1.5" />
              <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1.5-1.5" />
            </svg>
            {t("share")}
          </button>
        </div>
      </div>
      <p className="mt-3 min-h-4 text-xs text-ink/50" aria-live="polite">
        {feedback ?? "Share links carry the report inside the link itself — anyone with the link can open it. Nothing is uploaded."}
      </p>
    </section>
  );
}
