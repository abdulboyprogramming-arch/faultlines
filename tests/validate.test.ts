import { describe, expect, it } from "vitest";
import { normalizeAnalysis, isVerbatim } from "@/lib/validate";
import type { AnalysisResult } from "@/lib/schema";

const base = (over: Partial<AnalysisResult> = {}): AnalysisResult => ({
  clusters: [
    { label: "Low one", plain_name: "Low", count: 2, risk: "low", why_it_matters: "w", quotes: ["real answer one here"], reteach: { title: "T", minutes: 5, steps: ["s"], check_question: "q" }, diagnostic_question: "d" },
    { label: "High one", plain_name: "High", count: 3, risk: "high", why_it_matters: "w", quotes: ["real answer two here", "real answer two here", "invented quote not present"], reteach: { title: "T", minutes: 5, steps: ["s"], check_question: "q" }, diagnostic_question: "d" },
  ],
  unsure: [],
  ...over,
});
const answers = ["real answer one here", "real answer two here"];

describe("normalizeAnalysis", () => {
  it("sorts high risk first (PRD results order)", () => {
    const r = normalizeAnalysis(base(), answers);
    expect(r.clusters[0].risk).toBe("high");
  });
  it("dedupes quotes and drops non-verbatim ones", () => {
    const r = normalizeAnalysis(base(), answers);
    const high = r.clusters.find((c) => c.risk === "high")!;
    expect(high.quotes).toEqual(["real answer two here"]);
  });
  it("drops clusters left with no faithful quote", () => {
    const r = normalizeAnalysis(base(), ["totally different text"]);
    expect(r.clusters.length).toBe(0);
  });
  it("isVerbatim tolerates case and punctuation", () => {
    expect(isVerbatim("Real answer ONE, here!", answers)).toBe(true);
    expect(isVerbatim("fabricated", answers)).toBe(false);
  });
});
