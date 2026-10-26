import { beforeEach, describe, expect, it } from "vitest";
import { buildPrompt, resultFromIndexes } from "@/lib/llm/real";
import { MockProvider } from "@/lib/llm/mock";
import { locales } from "@/lib/i18n";
import { REPORT_LOCALES } from "@/lib/schema";

const ANSWERS = [
  "Because the earth is closer to the sun in June",
  "The earth tilts towards the sun in summer",
  "It is nearer to the sun so it gets hotter",
  "I don't know",
];

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

describe("report prose language", () => {
  it("asks the model to write prose in the requested language", () => {
    const prompt = buildPrompt(ANSWERS, "Why do we have seasons?", "fr");
    expect(prompt).toContain("in French");
    // The instruction must also protect the quotes.
    expect(prompt).toMatch(/verbatim/i);
  });

  it("says nothing about language when no locale is supplied", () => {
    expect(buildPrompt(ANSWERS, "Why do we have seasons?")).not.toContain("in French");
  });

  it("covers every supported interface locale", () => {
    for (const code of REPORT_LOCALES) {
      expect(Object.keys(locales)).toContain(code);
      expect(buildPrompt(["x"], undefined, code)).toContain("in ");
    }
  });

  it("keeps results faithful no matter which language is requested", () => {
    const output = {
      clusters: [
        {
          label: "Earth is closer in June",
          plain_name: "La distance",
          risk: "high" as const,
          why_it_matters: "Beaucoup d'élèves le pensent.",
          member_indexes: [0, 2],
          reteach: { title: "Tester l'orbite", minutes: 5, steps: ["a", "b"], check_question: "Pourquoi ?" },
          diagnostic_question: "Explique ton raisonnement.",
        },
      ],
      unsure: [{ index: 3, why: "Trop vague" }],
    };
    const result = resultFromIndexes(output, ANSWERS, "Pourquoi les saisons ?");
    expect(result.clusters[0].count).toBe(2);
    expect(result.clusters[0].quotes).toEqual([ANSWERS[0], ANSWERS[2]]);
    const total = result.clusters.reduce((s, c) => s + c.count, 0) + result.unsure.length;
    expect(total).toBe(ANSWERS.length);
  });
});

describe("heuristic prose follows the interface language", () => {
  it("writes English by default and French when asked", async () => {
    const provider = new MockProvider();
    const en = await provider.analyze(ANSWERS, { question: "Why do we have seasons?" });
    const fr = await provider.analyze(ANSWERS, { question: "Pourquoi les saisons ?", locale: "fr" });

    expect(en.clusters.length).toBeGreaterThan(0);
    expect(fr.clusters.length).toBe(en.clusters.length);

    // Same grouping, different prose.
    expect(fr.clusters[0].why_it_matters).not.toBe(en.clusters[0].why_it_matters);
    expect(fr.clusters[0].why_it_matters).toContain("Regroupées par similarité");
    expect(fr.clusters[0].reteach.steps[1]).toContain("Demandez");

    // …and the quotes are still the students' exact words in both.
    expect(fr.clusters[0].quotes).toEqual(en.clusters[0].quotes);
    for (const q of fr.clusters[0].quotes) expect(ANSWERS).toContain(q);
  });

  it("falls back to English for an unknown locale instead of crashing", async () => {
    const provider = new MockProvider();
    const result = await provider.analyze(ANSWERS, { locale: "klingon" });
    expect(result.clusters.length).toBeGreaterThan(0);
    expect(result.clusters[0].why_it_matters).toContain("answers share this way");
  });

  it("still sums to the class size in every locale", async () => {
    const provider = new MockProvider();
    for (const locale of REPORT_LOCALES) {
      const r = await provider.analyze(ANSWERS, { question: "Q", locale });
      const sum = r.clusters.reduce((s, c) => s + c.count, 0) + r.unsure.length;
      expect(sum, locale).toBe(ANSWERS.length);
    }
  });
});
