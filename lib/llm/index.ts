import type { LLMProvider } from "./provider";

export function getProvider(): LLMProvider {
  const mode = process.env.LLM_PROVIDER ?? "mock";
  if (mode === "mock") {
    const { MockProvider } = require("./mock");
    return new MockProvider();
  }
  // Real providers not wired yet; fall back to mock to keep demo working.
  const { MockProvider } = require("./mock");
  return new MockProvider();
}
