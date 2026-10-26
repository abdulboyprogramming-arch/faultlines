import type { AnalysisResult } from "../schema";
import type { LLMProvider } from "./provider";

function words(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export class MockProvider implements LLMProvider {
  async analyze(answers: string[]): Promise<AnalysisResult> {
    const cleaned = answers.map((a) => a.trim()).filter(Boolean);
    const clusters: AnalysisResult["clusters"] = [];
    const unsure: AnalysisResult["unsure"] = [];

    const buckets: { key: string; items: string[] }[] = [
      { key: "distance", items: [] },
      { key: "tilt", items: [] },
      { key: "correct", items: [] },
    ];

    for (const a of cleaned) {
      if (words(a) < 4) {
        unsure.push({ answer: a, why: "No identifiable claim" });
        continue;
      }
      const low = a.toLowerCase();
      if (low.includes("sun") || low.includes("closer") || low.includes("nearer") || low.includes("distance")) {
        buckets[0].items.push(a);
      } else if (low.includes("tilt")) {
        buckets[1].items.push(a);
      } else {
        buckets[2].items.push(a);
      }
    }

    const meta = [
      {
        label: "Thinks summer happens because Earth is closer to the Sun",
        plain_name: "The distance myth",
        risk: "high" as const,
        why: "Survives into adulthood; blocks later understanding of seasons or climate.",
        reteach: {
          title: "Same distance, different tilt",
          minutes: 6,
          steps: ["Show orbit is nearly circular.", "Demonstrate axial tilt with a globe.", "Ask: if distance caused summer, why winter in Sydney now?"],
          check_question: "If distance caused summer, why is it winter in Sydney right now?",
        },
        diagnostic: "Explain why Australia has winter when the UK has summer, using tilt not distance.",
      },
      {
        label: "Mentions tilt but cannot connect it to seasons",
        plain_name: "Tilt without cause",
        risk: "med" as const,
        why: "Partial model; needs the mechanism linking tilt to sunlight angle.",
        reteach: {
          title: "Tilt and sunlight angle",
          minutes: 5,
          steps: ["Model sunlight angle with a lamp.", "Connect angle to intensity.", "Check with a latitude example."],
          check_question: "Why does tilted sunlight feel weaker?",
        },
        diagnostic: "Describe how tilt changes the angle of sunlight hitting a location.",
      },
      {
        label: "Correct idea, weakly explained",
        plain_name: "Correct, unexplained",
        risk: "low" as const,
        why: "Understanding present but fragile; needs articulation practice.",
        reteach: {
          title: "Put the mechanism in words",
          minutes: 4,
          steps: ["Have students write the causal chain.", "Peer review for missing links.", "Revise."],
          check_question: "Write two sentences explaining seasons without using 'closer'.",
        },
        diagnostic: "Write a two-sentence explanation of seasons without the word 'closer'.",
      },
    ];

    buckets.forEach((b, i) => {
      if (b.items.length === 0) return;
      const m = meta[i];
      clusters.push({
        label: m.label,
        plain_name: m.plain_name,
        count: b.items.length,
        risk: m.risk,
        why_it_matters: m.why,
        quotes: [b.items[0], b.items[1] ?? b.items[0]],
        reteach: m.reteach,
        diagnostic_question: m.diagnostic,
      });
    });

    return { clusters, unsure };
  }
}
