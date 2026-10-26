import { z } from "zod";
import type { AnalysisResult } from "../schema";
import type { AnalyzeOptions, LLMProvider } from "./provider";

/**
 * Real LLM provider — OpenAI-compatible Chat Completions (works with OpenAI,
 * OpenRouter, Groq, Together, Azure OpenAI gateways, or a local server).
 * Server-side only: the API key is read from env here and never reaches the
 * browser (no NEXT_PUBLIC_*). See .env.example and SECURITY.md.
 *
 * Faithfulness by construction: the model returns *member indexes* per
 * cluster, never counts or quotes. Counts and quotes are derived here from
 * the teacher's actual input, so quotes are verbatim and counts sum exactly.
 * Any answer the model does not classify lands in "unsure".
 */

const LlmCluster = z.object({
  label: z.string().min(1),
  plain_name: z.string().min(1),
  risk: z.enum(["high", "med", "low"]),
  why_it_matters: z.string().min(1),
  member_indexes: z.array(z.number().int().nonnegative()).min(1),
  reteach: z.object({
    title: z.string().min(1),
    minutes: z.number().int().positive().max(60),
    steps: z.array(z.string().min(1)).min(1),
    check_question: z.string().min(1),
  }),
  diagnostic_question: z.string().min(1),
});
const LlmOutput = z.object({
  clusters: z.array(LlmCluster),
  unsure: z
    .array(z.object({ index: z.number().int().nonnegative(), why: z.string().min(1) }))
    .default([]),
});

export function buildPrompt(answers: string[], question?: string): string {
  const numbered = answers.map((a, i) => `${i}: ${a}`).join("\n");
  return [
    "You help a teacher see what a class actually misunderstands. Group the student answers below by the UNDERLYING BELIEF they express (not by mark or wording alone).",
    question ? `Question the class answered: ${question}` : "The teacher did not supply the question; infer cautiously from the answers.",
    "Rules:",
    "- Every answer index must appear in exactly one cluster's member_indexes, or in unsure.",
    "- Put answers that are blank, vague, off-topic or claim-free in unsure with a short why. Never invent a belief for them.",
    "- risk = likely exam damage if this belief is not fixed (high/med/low). Correct and secure beliefs are low risk.",
    "- plain_name: short memorable name for the belief (e.g. 'The distance myth').",
    "- reteach: a practical ~5 minute whole-class reteach (title, minutes, 2-4 steps, one check_question).",
    "- diagnostic_question: one follow-up question that would reveal whether the belief has changed.",
    "- Return ONLY JSON: {\"clusters\":[{\"label\",\"plain_name\",\"risk\",\"why_it_matters\",\"member_indexes\":[..],\"reteach\":{\"title\",\"minutes\",\"steps\":[..],\"check_question\"},\"diagnostic_question\"}],\"unsure\":[{\"index\",\"why\"}]}",
    `Answers:\n${numbered}`,
  ].join("\n");
}

/** Convert index-based model output into a faithful AnalysisResult. Exported for tests. */
export function resultFromIndexes(
  output: z.infer<typeof LlmOutput>,
  answers: string[],
  question?: string,
): AnalysisResult {
  const assigned = new Set<number>();
  const clusters: AnalysisResult["clusters"] = [];
  for (const c of output.clusters) {
    const members = [...new Set(c.member_indexes)].filter(
      (i) => i >= 0 && i < answers.length && !assigned.has(i),
    );
    if (members.length === 0) continue;
    members.forEach((i) => assigned.add(i));
    clusters.push({
      label: c.label,
      plain_name: c.plain_name,
      count: members.length,
      risk: c.risk,
      why_it_matters: c.why_it_matters,
      quotes: members.slice(0, 2).map((i) => answers[i]),
      reteach: c.reteach,
      diagnostic_question: c.diagnostic_question,
    });
  }
  const unsure: AnalysisResult["unsure"] = [];
  for (const u of output.unsure) {
    if (u.index >= 0 && u.index < answers.length && !assigned.has(u.index)) {
      assigned.add(u.index);
      unsure.push({ answer: answers[u.index], why: u.why });
    }
  }
  answers.forEach((a, i) => {
    if (!assigned.has(i)) unsure.push({ answer: a, why: "Not classified — needs your eyes" });
  });
  return {
    clusters,
    unsure,
    question,
    meta: { source: "llm", total: answers.length, generatedAt: new Date().toISOString() },
  };
}

function stripFences(s: string): string {
  return s.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}

export class OpenAICompatibleProvider implements LLMProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = "gpt-4o-mini",
    private readonly baseUrl: string = "https://api.openai.com/v1",
    private readonly timeoutMs: number = 45_000,
  ) {}

  async analyze(answers: string[], opts: AnalyzeOptions = {}): Promise<AnalysisResult> {
    const cleaned = answers.map((a) => a.trim()).filter(Boolean);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: buildPrompt(cleaned, opts.question) }],
        }),
      });
      if (!res.ok) throw new Error(`LLM provider responded ${res.status}`);
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error("LLM provider returned no content");
      const parsed = LlmOutput.safeParse(JSON.parse(stripFences(content)));
      if (!parsed.success) throw new Error("LLM output failed schema validation");
      return resultFromIndexes(parsed.data, cleaned, opts.question);
    } finally {
      clearTimeout(timer);
    }
  }
}
