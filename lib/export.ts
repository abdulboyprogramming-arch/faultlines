import type { AnalysisResult } from "./schema";
import { resultTotal } from "./validate";

/** One-page reteach plan as plain text (for clipboard). Real newlines — the
 *  original used "\\n" literals, so exports arrived as one garbled line. */
export function toPlainPlan(result: AnalysisResult): string {
  const total = resultTotal(result);
  const lines: string[] = [
    "Fault Lines — reteach plan",
    result.question ? `Question: ${result.question}` : "",
    `${total} answers · ${result.clusters.length} beliefs`,
    "",
  ].filter(Boolean);
  for (const c of result.clusters) {
    lines.push(
      `■ ${c.plain_name} — ${c.count} of ${total} (${c.risk} risk)`,
      `  Belief: ${c.label}`,
      `  Why it matters: ${c.why_it_matters}`,
      `  Evidence: ${c.quotes.map((q) => `“${q}”`).join(" · ")}`,
      `  Reteach (${c.reteach.minutes} min): ${c.reteach.title}`,
      ...c.reteach.steps.map((s, i) => `    ${i + 1}. ${s}`),
      `  Check: ${c.reteach.check_question}`,
      `  Follow-up diagnostic: ${c.diagnostic_question}`,
      "",
    );
  }
  if (result.unsure.length) {
    lines.push(`■ Not sure — needs your eyes (${result.unsure.length})`);
    for (const u of result.unsure) lines.push(`  - “${u.answer}” (${u.why})`);
  }
  return lines.join("\n");
}

export function toMarkdown(result: AnalysisResult): string {
  const total = resultTotal(result);
  const out: string[] = [
    "# Fault Lines Report",
    "",
    ...(result.question ? [`**Question:** ${result.question}`, ""] : []),
    `${total} answers · ${result.clusters.length} beliefs`,
    "",
  ];
  for (const c of result.clusters) {
    out.push(
      `## ${c.plain_name} — ${c.count} of ${total}`,
      "",
      `- **Belief:** ${c.label}`,
      `- **Risk:** ${c.risk}`,
      `- **Why it matters:** ${c.why_it_matters}`,
      ...c.quotes.map((q) => `> ${q}`),
      "",
      `**Reteach: ${c.reteach.title} (${c.reteach.minutes} min)**`,
      ...c.reteach.steps.map((s, i) => `${i + 1}. ${s}`),
      "",
      `- **Check question:** ${c.reteach.check_question}`,
      `- **Follow-up diagnostic:** ${c.diagnostic_question}`,
      "",
    );
  }
  if (result.unsure.length) {
    out.push("## Not sure — needs your eyes", "");
    for (const u of result.unsure) out.push(`- “${u.answer}” — ${u.why}`);
    out.push("");
  }
  return out.join("\n");
}

function csvCell(s: string | number): string {
  let v = String(s);
  // Spreadsheet formula injection: a student answer starting with = + - @
  // must never become a live formula when a teacher opens the CSV.
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Flat CSV: one row per belief (plus one per unsure answer) for spreadsheets/department tracking. */
export function toCsv(result: AnalysisResult): string {
  const total = resultTotal(result);
  const rows: (string | number)[][] = [
    ["belief", "label", "count", "total", "share_pct", "risk", "why_it_matters", "quotes", "reteach_title", "reteach_minutes", "check_question", "diagnostic_question"],
  ];
  for (const c of result.clusters) {
    rows.push([
      c.plain_name, c.label, c.count, total,
      total ? Math.round((c.count / total) * 1000) / 10 : 0,
      c.risk, c.why_it_matters, c.quotes.join(" | "), c.reteach.title, c.reteach.minutes,
      c.reteach.check_question, c.diagnostic_question,
    ]);
  }
  for (const u of result.unsure) {
    rows.push(["Not sure — needs your eyes", u.why, 1, total, total ? Math.round((1 / total) * 1000) / 10 : 0, "", "", u.answer, "", "", "", ""]);
  }
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}

export function download(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
