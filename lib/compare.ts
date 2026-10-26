import type { AnalysisResult } from "./schema";

/**
 * "Did the reteach work?" — the question a teacher asks the next week.
 *
 * There are no accounts and no server, so continuity comes from local history:
 * when a result's question matches an earlier saved run, we can diff the two
 * maps and show which beliefs shrank. Matching is by `plain_name`, which the
 * engines derive from the answers themselves, so the same class question
 * produces comparable band names. It is a heuristic, and the UI says so.
 */

export interface BeliefDelta {
  plainName: string;
  risk: "high" | "med" | "low";
  before: number;
  after: number;
  /** after − before (negative = the belief shrank, which is the good news) */
  change: number;
}

export interface Comparison {
  previousAt: string;
  /** Answers counted in the earlier run. */
  previousTotal: number;
  deltas: BeliefDelta[];
  /** True when at least one belief genuinely changed. */
  changed: boolean;
}

function totalOf(result: AnalysisResult): number {
  return result.clusters.reduce((sum, c) => sum + c.count, 0) + result.unsure.length;
}

function normalizeQuestion(question?: string): string {
  return (question ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** A stable, comparable name for a belief: its plain name, whitespace-normalised. */
function keyOf(plainName: string): string {
  return plainName.trim().toLowerCase();
}

/**
 * Compare the current result with the most recent earlier run of the same
 * question. Returns null when there is nothing honest to compare.
 */
export function compareRuns(
  current: AnalysisResult,
  history: { id: string; at: string; question?: string; result: AnalysisResult }[],
  currentId?: string,
): Comparison | null {
  const question = normalizeQuestion(current.question);
  if (!question) return null;

  const previous = history.find(
    (entry) =>
      entry.id !== currentId &&
      normalizeQuestion(entry.question) === question &&
      entry.result?.clusters?.length > 0,
  );
  if (!previous) return null;

  const currentTotal = totalOf(current);
  const previousTotal = totalOf(previous.result);
  // A class of 12 verses a class of 28 is not a reteach, it is a different set.
  if (currentTotal === 0 || previousTotal === 0) return null;
  if (Math.abs(currentTotal - previousTotal) > Math.max(6, previousTotal * 0.4)) return null;

  const beforeByName = new Map<string, number>();
  for (const cluster of previous.result.clusters) {
    beforeByName.set(keyOf(cluster.plain_name), cluster.count);
  }

  const deltas: BeliefDelta[] = [];
  for (const cluster of current.clusters) {
    const before = beforeByName.get(keyOf(cluster.plain_name));
    if (before === undefined) continue;
    deltas.push({
      plainName: cluster.plain_name,
      risk: cluster.risk,
      before,
      after: cluster.count,
      change: cluster.count - before,
    });
  }

  return {
    previousAt: previous.at,
    previousTotal,
    // Biggest movement first; unchanged beliefs are noise.
    deltas: deltas.filter((d) => d.change !== 0).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)),
    changed: deltas.some((d) => d.change !== 0),
  };
}

/** One-line summary for screen readers and the UI header. */
export function describeComparison(comparison: Comparison): string {
  const shrunk = comparison.deltas.filter((d) => d.change < 0).length;
  const grew = comparison.deltas.filter((d) => d.change > 0).length;
  if (!comparison.changed) return "No change in any belief since your last run of this question.";
  const parts: string[] = [];
  if (shrunk) parts.push(`${shrunk} belief${shrunk === 1 ? "" : "s"} shrank`);
  if (grew) parts.push(`${grew} grew`);
  return `Compared with your run on ${new Date(comparison.previousAt).toLocaleDateString()}: ${parts.join(", ")}.`;
}
