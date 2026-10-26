import { MockProvider } from "./mock";
import { OpenAICompatibleProvider } from "./real";
import type { AnalyzeOptions, LLMProvider } from "./provider";
import type { AnalysisResult } from "../schema";

/** Which analysis engine is configured (safe to expose: contains no secrets). */
export type ProviderMode = "mock" | "llm";

export function providerMode(): ProviderMode {
  const mode = (process.env.LLM_PROVIDER ?? "mock").toLowerCase();
  return mode !== "mock" && Boolean(process.env.LLM_API_KEY) ? "llm" : "mock";
}

/**
 * Wraps the real provider: on any failure (bad key, timeout, junk JSON) it
 * falls back to the deterministic heuristic and marks the result
 * `meta.degraded = true` so the UI can tell the teacher honestly — the
 * previous version silently returned mock output for every configuration.
 */
class ResilientProvider implements LLMProvider {
  constructor(private readonly primary: LLMProvider) {}
  async analyze(answers: string[], opts: AnalyzeOptions = {}): Promise<AnalysisResult> {
    try {
      return await this.primary.analyze(answers, opts);
    } catch (err) {
      console.error("[faultlines] LLM provider failed, falling back to heuristic:", err);
      const fallback = await new MockProvider().analyze(answers, opts);
      return {
        ...fallback,
        meta: { ...(fallback.meta ?? { source: "mock" as const, total: answers.length, generatedAt: new Date().toISOString() }), degraded: true },
      };
    }
  }
}

export function getProvider(): LLMProvider {
  const mode = (process.env.LLM_PROVIDER ?? "mock").toLowerCase();
  const key = process.env.LLM_API_KEY;
  if (mode !== "mock" && key) {
    return new ResilientProvider(
      new OpenAICompatibleProvider(
        key,
        process.env.LLM_MODEL || "gpt-4o-mini",
        process.env.LLM_BASE_URL || "https://api.openai.com/v1",
      ),
    );
  }
  if (mode !== "mock" && !key) {
    console.warn(`[faultlines] LLM_PROVIDER="${mode}" but LLM_API_KEY is not set — using heuristic mock.`);
  }
  return new MockProvider();
}
