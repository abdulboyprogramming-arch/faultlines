import { describe, expect, it } from "vitest";
import { compareRuns, describeComparison } from "@/lib/compare";
import type { AnalysisResult, Cluster } from "@/lib/schema";

function cluster(plain_name: string, count: number, risk: Cluster["risk"] = "high"): Cluster {
  return {
    label: `${plain_name} belief`,
    plain_name,
    count,
    risk,
    why_it_matters: "matters",
    quotes: [`quote for ${plain_name}`],
    reteach: { title: "card", minutes: 5, steps: ["step"], check_question: "check?" },
    diagnostic_question: "diagnostic?",
  };
}

function result(clusters: Cluster[], question = "Why do we have seasons?"): AnalysisResult {
  return { clusters, unsure: [], question };
}

const entry = (id: string, at: string, r: AnalysisResult) => ({ id, at, question: r.question, result: r });

describe("compareRuns", () => {
  it("reports shrink and growth against the previous run of the same question", () => {
    const before = result([cluster("The distance myth", 18), cluster("Tilt without cause", 7, "med")]);
    const after = result([cluster("The distance myth", 12), cluster("Tilt without cause", 9, "med")]);
    const comparison = compareRuns(after, [entry("prev", "2026-10-01T10:00:00Z", before)]);
    expect(comparison).not.toBeNull();
    expect(comparison!.changed).toBe(true);
    const distance = comparison!.deltas.find((d) => d.plainName === "The distance myth")!;
    expect(distance.change).toBe(-6);
    const tilt = comparison!.deltas.find((d) => d.plainName === "Tilt without cause")!;
    expect(tilt.change).toBe(2);
    // biggest movement first
    expect(comparison!.deltas[0].plainName).toBe("The distance myth");
    expect(describeComparison(comparison!)).toContain("shrank");
  });

  it("needs a matching question", () => {
    const before = result([cluster("A", 5)], "Why is the sky blue?");
    const after = result([cluster("A", 3)]);
    expect(compareRuns(after, [entry("prev", "2026-10-01T10:00:00Z", before)])).toBeNull();
    expect(compareRuns(result([cluster("A", 3)], ""), [entry("prev", "2026-10-01T10:00:00Z", before)])).toBeNull();
  });

  it("refuses to compare classes of very different sizes", () => {
    const before = result([cluster("A", 40)]);
    const after = result([cluster("A", 4)]);
    expect(compareRuns(after, [entry("prev", "2026-10-01T10:00:00Z", before)])).toBeNull();
  });

  it("ignores the current run and reports no change honestly", () => {
    const same = result([cluster("A", 5)]);
    const comparison = compareRuns(same, [entry("current", "2026-10-26T10:00:00Z", same), entry("prev", "2026-10-01T10:00:00Z", same)], "current");
    expect(comparison).not.toBeNull();
    expect(comparison!.changed).toBe(false);
    expect(describeComparison(comparison!)).toContain("No change");
  });

  it("returns null when there is no history", () => {
    expect(compareRuns(result([cluster("A", 5)]), [])).toBeNull();
  });
});
