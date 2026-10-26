import { describe, expect, it } from "vitest";
import { MockProvider } from "@/lib/llm/mock";
import { AnalysisResultSchema } from "@/lib/schema";
import { isVerbatim, resultTotal } from "@/lib/validate";

const seasons = [
  "Because the earth moves nearer to the sun in June",
  "The earth is closer to the sun during summer",
  "Summer happens when we are nearer to the sun",
  "The earth tilts on its axis so sunlight hits at a different angle",
  "Because of the tilt of the earth the sunlight angle changes",
  "idk",
  "I don't know",
  "Photosynthesis makes oxygen from sunlight and air in green leaves",
  "Plants use photosynthesis to turn sunlight into food in their leaves",
];

describe("MockProvider (generic heuristic)", () => {
  it("produces schema-valid output whose counts sum to the input", async () => {
    const r = await new MockProvider().analyze(seasons, { question: "Why do we have seasons?" });
    expect(AnalysisResultSchema.safeParse(r).success).toBe(true);
    expect(resultTotal(r)).toBe(seasons.length);
    expect(r.meta?.source).toBe("mock");
  });

  it("quotes are always verbatim and never duplicated within a cluster", async () => {
    const r = await new MockProvider().analyze(seasons);
    for (const c of r.clusters) {
      for (const q of c.quotes) expect(isVerbatim(q, seasons)).toBe(true);
      expect(new Set(c.quotes.map((q) => q.toLowerCase())).size).toBe(c.quotes.length);
    }
  });

  it("routes claim-free answers to unsure instead of inventing a belief", async () => {
    const r = await new MockProvider().analyze(seasons);
    const unsureTexts = r.unsure.map((u) => u.answer);
    expect(unsureTexts).toContain("idk");
    expect(unsureTexts).toContain("I don't know");
  });

  it("groups an off-topic cluster separately from the seasons talk", async () => {
    const r = await new MockProvider().analyze(seasons);
    expect(r.clusters.length).toBeGreaterThanOrEqual(2);
  });

  it("is deterministic", async () => {
    const a = await new MockProvider().analyze(seasons);
    const b = await new MockProvider().analyze(seasons);
    expect(JSON.stringify(a.clusters)).toBe(JSON.stringify(b.clusters));
    expect(JSON.stringify(a.unsure)).toBe(JSON.stringify(b.unsure));
  });

  it("handles a tiny class without forcing everything into unsure", async () => {
    const r = await new MockProvider().analyze(["Because water expands when it gets hotter and rises up"]);
    expect(resultTotal(r)).toBe(1);
    expect(r.clusters.length).toBe(1);
  });
});
