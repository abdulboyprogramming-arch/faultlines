/**
 * Suggestion engine — pure, testable, dependency-free.
 *
 * Two jobs, one matcher:
 *  - **Answer autocomplete** in the composer: as a teacher types a line, offer
 *    answers they have used (or that appear in an example classroom / a past
 *    map's quotes) so they can fill a demo or re-use a phrasing without retyping.
 *  - **History search suggestions**: as a teacher types in the "saved maps"
 *    search box, offer past questions and belief names.
 *
 * Everything is local: the pools are built from `data/examples.ts` and the
 * browser's own history. Nothing is uploaded, and both features can be switched
 * off in Settings.
 */

export type SuggestionSource = "question" | "answer" | "belief" | "example";

export interface Suggestion {
  /** The full text to insert. */
  value: string;
  /** Where it came from — used for the little label in the dropdown. */
  source: SuggestionSource;
}

const MIN_QUERY = 2;

function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Rank candidates against what the teacher has typed.
 *
 * Scoring: exact prefix of the whole string beats prefix of a later word, which
 * beats a substring match. Shorter candidates win ties, so the cheapest useful
 * completion is offered first.
 */
export function rankMatches(query: string, pool: readonly string[], limit = 6): string[] {
  const q = normalise(query);
  if (q.length < MIN_QUERY) return [];
  const seen = new Set<string>();
  const scored: { value: string; score: number }[] = [];

  for (const raw of pool) {
    const value = raw.trim();
    if (!value) continue;
    const key = normalise(value);
    if (seen.has(key) || key === q) continue;
    seen.add(key);

    let score = -1;
    if (key.startsWith(q)) score = 3;
    else if (key.includes(` ${q}`)) score = 2;
    else if (key.includes(q)) score = 1;
    if (score < 0) continue;
    // Prefer the tightest completion: a 40-character answer beats a 300-word one.
    scored.push({ value, score: score * 1000 - Math.min(value.length, 400) });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.value);
}

/** Suggestions for the question field (example questions + questions from history). */
export function suggestQuestions(
  query: string,
  pools: { questions: readonly string[] },
  limit = 4,
): Suggestion[] {
  return rankMatches(query, pools.questions, limit).map((value) => ({
    value,
    source: "question" as const,
  }));
}

/**
 * Suggestions for the answers box.
 *
 * Looks at the *current line only* — the teacher is typing an answer, so the
 * useful completion is a whole answer that starts the way they started, not a
 * mid-sentence fragment. A trailing newline means they have moved on, so no
 * suggestions are offered.
 */
export function suggestAnswers(
  draft: string,
  pools: { answers: readonly string[] },
  limit = 4,
): { line: string; partial: string; suggestions: Suggestion[] } {
  const text = draft.replace(/\r\n?/g, "\n");
  const lineStart = text.lastIndexOf("\n") + 1;
  const line = text.slice(lineStart);
  const partial = line.trim();
  if (!partial || partial.length < MIN_QUERY || /\n$/.test(draft)) {
    return { line, partial, suggestions: [] };
  }
  const matches = rankMatches(partial, pools.answers, limit).filter(
    // A completion that is only marginally longer than what is typed is noise.
    (m) => normalise(m).length > normalise(partial).length,
  );
  return {
    line,
    partial,
    suggestions: matches.map((value) => ({ value, source: "answer" as const })),
  };
}

/** Suggested search terms for the history box: past questions first, then belief names. */
export function suggestHistory(
  query: string,
  pools: { questions: readonly string[]; beliefs: readonly string[] },
  limit = 6,
): Suggestion[] {
  const qs = rankMatches(query, pools.questions, Math.ceil(limit / 2)).map((value) => ({
    value,
    source: "question" as const,
  }));
  const bs = rankMatches(query, pools.beliefs, limit - qs.length).map((value) => ({
    value,
    source: "belief" as const,
  }));
  return [...qs, ...bs].slice(0, limit);
}

/**
 * Free-text filter used by the history list itself. Every term must match
 * somewhere in the entry (question, belief name, plain-language label, date) so
 * "seasons high" narrows rather than widens.
 */
export function matchesHistoryQuery(
  query: string,
  entry: { question?: string; at: string; result: { clusters: { plain_name: string; label: string }[] } },
): boolean {
  const q = normalise(query);
  if (!q) return true;
  const haystack = normalise(
    [entry.question ?? "", entry.at, ...entry.result.clusters.map((c) => `${c.plain_name} ${c.label}`)].join(" "),
  );
  return q.split(" ").every((term) => haystack.includes(term));
}
