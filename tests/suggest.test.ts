import { beforeEach, describe, expect, it } from "vitest";
import {
  matchesHistoryQuery,
  rankMatches,
  suggestAnswers,
  suggestHistory,
  suggestQuestions,
} from "@/lib/suggest";
import { EXAMPLES } from "@/data/examples";

/** Minimal localStorage so the preference helpers can be exercised. */
class MemStorage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemStorage() as unknown as Storage;
});

describe("suggestion engine", () => {
  const questions = [
    "Why do we have seasons?",
    "Adding fractions (½ + ⅓)",
    "Why do we have seasons?",
    "What caused the First World War?",
  ];

  it("needs at least two characters before suggesting anything", () => {
    expect(rankMatches("w", questions)).toEqual([]);
    expect(rankMatches("", questions)).toEqual([]);
  });

  it("prefers prefix matches and dedupes the pool", () => {
    expect(rankMatches("season", questions)).toEqual(["Why do we have seasons?"]);
    // The duplicate in the pool collapses to one suggestion.
    expect(rankMatches("why do", questions)).toEqual(["Why do we have seasons?"]);
  });

  it("matches inside a word as well, ranked below a prefix", () => {
    const out = rankMatches("fractions", ["Adding fractions (½ + ⅓)", "Fractions as division"]);
    expect(out[0]).toBe("Fractions as division");
    expect(out).toContain("Adding fractions (½ + ⅓)");
  });

  it("never suggests the exact string already typed", () => {
    expect(rankMatches("adding fractions (½ + ⅓)", ["Adding fractions (½ + ⅓)"])).toEqual([]);
  });

  it("suggestAnswers looks only at the line being typed", () => {
    const answers = EXAMPLES[0].answers;
    const draft = `${answers[0]}\nBecause the earth mov`;
    const { partial, suggestions } = suggestAnswers(draft, { answers });
    expect(partial.toLowerCase()).toContain("because the earth");
    for (const s of suggestions) {
      expect(s.value.toLowerCase().startsWith("because the earth")).toBe(true);
      expect(s.source).toBe("answer");
    }
  });

  it("offers nothing on an empty line or right after a newline", () => {
    const answers = ["Because the earth moves nearer to the sun in June"];
    expect(suggestAnswers("", { answers }).suggestions).toEqual([]);
    expect(suggestAnswers("so", { answers }).suggestions).toEqual([]);
    expect(suggestAnswers("Because\n", { answers }).suggestions).toEqual([]);
  });

  it("suggestQuestions labels its results and respects the limit", () => {
    const out = suggestQuestions("why", { questions }, 2);
    expect(out.length).toBeLessThanOrEqual(2);
    expect(out.every((s) => s.source === "question")).toBe(true);
  });

  it("suggestHistory mixes questions and belief names", () => {
    const out = suggestHistory(
      "dist",
      { questions: ["Why do we have seasons?"], beliefs: ["The distance myth", "Earth is flat"] },
      4,
    );
    expect(out.map((s) => s.value)).toContain("The distance myth");
  });

  it("filters history by question, belief name and date, with every term required", () => {
    const entry = {
      question: "Why do we have seasons?",
      at: "2026-10-26T10:00:00.000Z",
      result: { clusters: [{ plain_name: "The distance myth", label: "Earth is closer in June" }] },
    };
    expect(matchesHistoryQuery("", entry)).toBe(true);
    expect(matchesHistoryQuery("seasons", entry)).toBe(true);
    expect(matchesHistoryQuery("distance", entry)).toBe(true);
    expect(matchesHistoryQuery("2026-10", entry)).toBe(true);
    expect(matchesHistoryQuery("seasons distance", entry)).toBe(true);
    expect(matchesHistoryQuery("seasons fractions", entry)).toBe(false);
  });
});

describe("history fixtures stay compatible with the search", () => {
  it("finds every example question through the same matcher the UI uses", () => {
    for (const ex of EXAMPLES) {
      const entry = {
        question: ex.question,
        at: "2026-10-26T00:00:00.000Z",
        result: ex.result,
      };
      const word = ex.question.split(" ").find((w) => w.length > 4) ?? ex.question;
      expect(matchesHistoryQuery(word, entry), word).toBe(true);
    }
  });
});
