import { MockProvider } from "./mock";
import type { LLMProvider } from "./provider";

export function getProvider(): LLMProvider {
  const mode = process.env.LLM_PROVIDER ?? "mock";
  if (mode === "mock") {
    return new MockProvider();
  }
  // Real providers not wired yet; fall back to mock to keep demo working.
  return new MockProvider();
}
