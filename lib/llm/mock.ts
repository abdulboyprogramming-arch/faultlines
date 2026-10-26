import type { AnalysisResult, Cluster } from "../schema";
import type { AnalyzeOptions, LLMProvider } from "./provider";

/**
 * Deterministic, topic-agnostic heuristic provider.
 *
 * This replaces the original seasons-only stub. It groups answers by lexical
 * similarity (leader clustering over content-token Jaccard), routes
 * low-signal answers to the honest "unsure" bucket, quotes members verbatim
 * and derives counts from membership — so counts always sum to the total and
 * quotes are faithful by construction. It is a *preview* engine: it can see
 * that answers resemble each other, not whether they are correct. Risk is a
 * prevalence proxy and is labelled as such in the UI. For judgement of
 * correctness, configure the real provider (lib/llm/real.ts).
 */

const STOPWORDS = new Set(
  ("the a an and or but of to in on at for with by from is are was were be been it its this that these those i we they you he she as not no yes do does did have has had can could will would there their then than so such into about over under more most very just also because when which who what why how all any each other some one two le la les de des du un une et est dans pour pas que qui sur au aux ce cette il elle nous vous ils elles être avoir".split(" "))
);

const UNSURE_PHRASES =
  /(^(i )?(don'?t know|dunno|no idea|not sure|idk|pass|none|nothing|je ne sais pas|no sé)\b)|^[\s?.!…-]+$/i;

function stem(w: string): string {
  if (w.length > 4 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && /(s|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) return w.slice(0, -1);
  return w;
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    .map(stem)
    .filter((w) => !STOPWORDS.has(w));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}


interface Group {
  members: string[];
  tokenSets: Set<string>[];
}

function topKeywords(group: Group, n = 3): string[] {
  const freq = new Map<string, number>();
  for (const set of group.tokenSets) for (const t of set) freq.set(t, (freq.get(t) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([t]) => t);
}

/** Most central member (highest mean similarity to the rest) — the representative answer. */
function medoid(group: Group): string {
  let best = group.members[0];
  let bestScore = -1;
  group.members.forEach((m, i) => {
    let score = 0;
    group.tokenSets.forEach((s, j) => {
      if (i !== j) score += jaccard(group.tokenSets[i], s);
    });
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  });
  return best;
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export class MockProvider implements LLMProvider {
  async analyze(answers: string[], opts: AnalyzeOptions = {}): Promise<AnalysisResult> {
    const cleaned = answers.map((a) => a.trim()).filter(Boolean);
    const unsure: AnalysisResult["unsure"] = [];
    const groups: Group[] = [];
    const SIMILARITY = 0.15;

    for (const answer of cleaned) {
      const tokens = tokenize(answer);
      if (UNSURE_PHRASES.test(answer) || new Set(tokens).size < 2) {
        unsure.push({
          answer,
          why: UNSURE_PHRASES.test(answer) ? "Says they don't know yet" : "Too brief to show a belief",
        });
        continue;
      }
      const set = new Set(tokens);
      let bestIdx = -1;
      let bestSim = SIMILARITY;
      groups.forEach((g, i) => {
        // Leader clustering: compare with each group's first member. Tuned
        // against the three example classrooms (see docs/recovery/RECOVERY_LOG.md).
        const sim = jaccard(set, g.tokenSets[0]);
        if (sim >= bestSim) {
          bestSim = sim;
          bestIdx = i;
        }
      });
      if (bestIdx === -1) {
        groups.push({ members: [answer], tokenSets: [set] });
      } else {
        const g = groups[bestIdx];
        g.members.push(answer);
        g.tokenSets.push(set);
      }
    }

    // Singleton groups with no resemblance to anything else are honest "unsure"
    // unless the whole class is tiny (then a single belief is still a belief).
    const keepSingletons = cleaned.length <= 4;
    const clusters: Cluster[] = [];
    const sorted = groups.sort((a, b) => b.members.length - a.members.length);
    const largest = sorted[0]?.members.length ?? 1;

    for (const g of sorted) {
      if (g.members.length === 1 && !keepSingletons) {
        unsure.push({ answer: g.members[0], why: "Unlike any other answer — needs your eyes" });
        continue;
      }
      const keywords = topKeywords(g);
      const rep = medoid(g);
      const share = g.members.length / Math.max(1, cleaned.length);
      const risk: Cluster["risk"] =
        g.members.length === largest && share >= 0.25 ? "high" : share >= 0.15 ? "med" : "low";
      const quotePool = [rep, ...g.members.filter((m) => m !== rep)];
      const q = opts.question?.trim();
      clusters.push({
        label: titleCase(rep.length > 140 ? `${rep.slice(0, 137)}…` : rep),
        plain_name: keywords.length ? `Centred on “${keywords.join(" · ")}”` : "Shared wording",
        count: g.members.length,
        risk,
        why_it_matters:
          `${g.members.length} of ${cleaned.length} answers share this way of putting it. ` +
          "Grouped by wording similarity (heuristic preview) — read the quotes to judge whether the underlying idea is sound, partial, or a misconception.",
        quotes: quotePool.slice(0, Math.min(2, quotePool.length)),
        reteach: {
          title: keywords.length ? `Test the “${keywords[0]}” idea out loud` : "Surface and test this idea",
          minutes: 5,
          steps: [
            `Put a representative answer on the board (anonymised): “${rep.length > 90 ? `${rep.slice(0, 87)}…` : rep}”`,
            "Ask the class: what would have to be true for this to be right? Where does it break?",
            "Give the missing/correct mechanism in two sentences, then have students rewrite the answer using it.",
          ],
          check_question: q
            ? `Answer again: ${q} — this time explain the mechanism, not just the keyword.`
            : "Rewrite your answer explaining the mechanism, not just the keyword.",
        },
        diagnostic_question: q
          ? `${q} (Re-check: explain your reasoning step by step so a younger student could follow it.)`
          : "Explain your reasoning step by step so a younger student could follow it — where does each claim come from?",
      });
    }

    return {
      clusters,
      unsure,
      question: opts.question,
      meta: { source: "mock", total: cleaned.length, generatedAt: new Date().toISOString() },
    };
  }
}
