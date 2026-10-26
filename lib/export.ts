import type { AnalysisResult } from "./schema";
import { resultTotal } from "./validate";
import { t as translate, type I18nKey, type Interpolation } from "./i18n";

/**
 * Exports are localised too.
 *
 * A reteach plan copied into a staff briefing, printed for the staffroom or
 * downloaded as Markdown should read in the same language as the report the
 * teacher is looking at — so every label here comes from the dictionary and the
 * translator is passed in. The default keeps server-side/test calls working
 * (English), while `ExportBar` passes the live `t()`.
 *
 * CSV column names stay in English on purpose: they are machine-readable keys
 * consumed by spreadsheets and department databases, not prose.
 */
export type Tr = (key: I18nKey, vars?: Interpolation) => string;

const en: Tr = (key, vars) => translate(key, vars);

/** One-page reteach plan as plain text (for clipboard). Real newlines — the
 *  original used "\n" literals, so exports arrived as one garbled line. */
export function toPlainPlan(result: AnalysisResult, tr: Tr = en): string {
  const total = resultTotal(result);
  const lines: string[] = [
    tr("expPlanTitle"),
    result.question ? tr("expQuestion", { q: result.question }) : "",
    tr("expSummary", { a: total, b: result.clusters.length }),
    "",
  ].filter(Boolean);
  for (const c of result.clusters) {
    lines.push(
      tr("expCluster", {
        name: c.plain_name,
        n: c.count,
        total,
        risk: c.risk === "high" ? tr("riskHigh") : c.risk === "med" ? tr("riskMed") : tr("riskLow"),
      }),
      `  ${tr("expBelief", { v: c.label })}`,
      `  ${tr("expWhy", { v: c.why_it_matters })}`,
      `  ${tr("expEvidence", { v: c.quotes.map((q) => `“${q}”`).join(" · ") })}`,
      `  ${tr("expReteach", { n: c.reteach.minutes, title: c.reteach.title })}`,
      ...c.reteach.steps.map((s, i) => `    ${i + 1}. ${s}`),
      `  ${tr("expCheck", { v: c.reteach.check_question })}`,
      `  ${tr("expFollow", { v: c.diagnostic_question })}`,
      "",
    );
  }
  if (result.unsure.length) {
    lines.push(`■ ${tr("expUnsure", { n: result.unsure.length })}`);
    for (const u of result.unsure) lines.push(`  - “${u.answer}” (${u.why})`);
  }
  return lines.join("\n");
}

export function toMarkdown(result: AnalysisResult, tr: Tr = en): string {
  const total = resultTotal(result);
  const out: string[] = [
    `# ${tr("expReportTitle")}`,
    "",
    ...(result.question ? [`**${tr("expQuestion", { q: result.question })}**`, ""] : []),
    tr("expSummary", { a: total, b: result.clusters.length }),
    "",
  ];
  for (const c of result.clusters) {
    out.push(
      `## ${c.plain_name} — ${tr("expShare", { n: c.count, total })}`,
      "",
      `- **${tr("expBelief", { v: c.label })}**`,
      `- **${tr("expRisk", { v: c.risk === "high" ? tr("riskHigh") : c.risk === "med" ? tr("riskMed") : tr("riskLow") })}**`,
      `- **${tr("expWhy", { v: c.why_it_matters })}**`,
      ...c.quotes.map((q) => `> ${q}`),
      "",
      `**${tr("expReteach", { n: c.reteach.minutes, title: c.reteach.title })}**`,
      ...c.reteach.steps.map((s, i) => `${i + 1}. ${s}`),
      "",
      `- ${tr("expCheck", { v: c.reteach.check_question })}`,
      `- ${tr("expFollow", { v: c.diagnostic_question })}`,
      "",
    );
  }
  if (result.unsure.length) {
    out.push(`## ${tr("unsureTitle")}`, "");
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
export function toCsv(result: AnalysisResult, tr: Tr = en): string {
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
    rows.push([tr("unsureTitle"), u.why, 1, total, total ? Math.round((1 / total) * 1000) / 10 : 0, "", "", u.answer, "", "", "", ""]);
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
