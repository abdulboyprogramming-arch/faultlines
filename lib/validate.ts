import { RISK_ORDER, type AnalysisResult } from "./schema";

/** Normalise whitespace/case/punctuation for verbatim comparison. */
export function normalizeText(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** True when `quote` matches one of the source answers (faithful quotation, PRD). */
export function isVerbatim(quote: string, answers: string[]): boolean {
  const q = normalizeText(quote);
  return answers.some((a) => {
    const na = normalizeText(a);
    return na === q || na.includes(q);
  });
}

function dedupeQuotes(quotes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of quotes) {
    const key = normalizeText(q);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(q.trim());
  }
  return out.slice(0, 3);
}

/**
 * Normalise any provider output before render/return:
 * - quotes deduplicated (never show the same sentence twice as "two quotes")
 * - when source answers are provided, quotes that are not verbatim are dropped;
 *   a cluster left with no faithful quote is dropped and its would-be members
 *   cannot be invented — its count is folded into "unsure" only via the
 *   membership-aware builder (see llm/real.ts). For quote-only results we keep
 *   the cluster but only with verbatim quotes.
 * - clusters sorted high→low risk, then largest first (PRD results order)
 * - counts clamped to ≥1 integers
 */
export function normalizeAnalysis(result: AnalysisResult, answers?: string[]): AnalysisResult {
  const clusters = result.clusters
    .map((c) => {
      let quotes = dedupeQuotes(c.quotes);
      if (answers && answers.length > 0) {
        quotes = quotes.filter((q) => isVerbatim(q, answers));
      }
      return { ...c, count: Math.max(1, Math.round(c.count)), quotes };
    })
    .filter((c) => c.quotes.length > 0)
    .sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || b.count - a.count);

  const unsure = result.unsure.filter((u) => u.answer.trim().length > 0);
  return { ...result, clusters, unsure };
}

/** Total answers accounted for by a result (clusters + unsure). */
export function resultTotal(result: AnalysisResult): number {
  return result.clusters.reduce((s, c) => s + c.count, 0) + result.unsure.length;
}
