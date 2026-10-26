"use client";
import { useState } from "react";
import type { AnalysisResult } from "@/lib/schema";
import { download, toCsv, toMarkdown, toPlainPlan } from "@/lib/export";
import { shareUrl } from "@/lib/share";
import { t } from "@/lib/i18n";

/** Export + share actions for a result (PRD: one-page plan via copy/print; spec: ExportPlan). */
export default function ExportBar({ result }: { result: AnalysisResult }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  function note(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  }
  async function copy(text: string, msg: string) {
    try { await navigator.clipboard.writeText(text); note(msg); }
    catch { note("Copy failed — your browser blocked clipboard access."); }
  }

  const btn = "px-4 py-2 border border-ink/30 rounded-md text-sm font-ui hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust";
  return (
    <div className="no-print">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Export options">
        <button type="button" className="px-4 py-2 bg-rust text-paper rounded-md text-sm font-ui hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink" onClick={() => copy(toPlainPlan(result), "Reteach plan copied ✓")}>
          {t("export")}
        </button>
        <button type="button" className={btn} onClick={() => window.print()}>Print / PDF</button>
        <button type="button" className={btn} onClick={() => download("fault-lines-report.md", toMarkdown(result), "text/markdown")}>Markdown</button>
        <button type="button" className={btn} onClick={() => download("fault-lines-report.csv", toCsv(result), "text/csv")}>CSV</button>
        <button type="button" className={btn} onClick={() => download("fault-lines-report.json", JSON.stringify(result, null, 2), "application/json")}>JSON</button>
        <button type="button" className={btn} onClick={() => copy(shareUrl(result), "Shareable link copied ✓")}>{t("share")}</button>
      </div>
      <p className="text-xs text-ink/50 mt-2 min-h-4" aria-live="polite">{feedback ?? "Share links contain this report (including anonymised quotes) in the link itself — anyone with the link can view it."}</p>
    </div>
  );
}
