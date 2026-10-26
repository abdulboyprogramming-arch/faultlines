import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenAICompatibleProvider, buildPrompt } from "@/lib/llm/real";
import { getProvider, providerMode } from "@/lib/llm";
import { MockProvider } from "@/lib/llm/mock";
import { resultTotal } from "@/lib/validate";

const ANSWERS = ["Earth is closer to the sun in summer", "The tilt changes sunlight angle", "idk"];

function llmResponse(content: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => ({ choices: [{ message: { content: typeof content === "string" ? content : JSON.stringify(content) } }] }),
  } as Response;
}
const GOOD = {
  clusters: [{ label: "Distance myth", plain_name: "Distance myth", risk: "high", why_it_matters: "w", member_indexes: [0, 1], reteach: { title: "T", minutes: 5, steps: ["s"], check_question: "q" }, diagnostic_question: "d" }],
  unsure: [{ index: 2, why: "vague" }],
};

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("buildPrompt", () => {
  it("numbers answers, includes the question, demands indexes not quotes", () => {
    const p = buildPrompt(ANSWERS, "Why do we have seasons?");
    expect(p).toContain("0: Earth is closer");
    expect(p).toContain("Why do we have seasons?");
    expect(p).toContain("member_indexes");
    expect(p).toContain("Never invent a belief");
  });
});

describe("OpenAICompatibleProvider (fetch stubbed — no network in tests)", () => {
  it("returns a faithful result from well-formed output (incl. code fences)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => llmResponse("```json\n" + JSON.stringify(GOOD) + "\n```")));
    const r = await new OpenAICompatibleProvider("test-key").analyze(ANSWERS, { question: "Q?" });
    expect(r.meta?.source).toBe("llm");
    expect(resultTotal(r)).toBe(3);
    expect(r.clusters[0].quotes).toEqual([ANSWERS[0], ANSWERS[1]]);
  });

  it("throws on HTTP errors, junk JSON and schema violations (caller falls back)", async () => {
    const p = new OpenAICompatibleProvider("k");
    vi.stubGlobal("fetch", vi.fn(async () => llmResponse({}, false, 401)));
    await expect(p.analyze(ANSWERS)).rejects.toThrow(/401/);
    vi.stubGlobal("fetch", vi.fn(async () => llmResponse("not json at all")));
    await expect(p.analyze(ANSWERS)).rejects.toThrow();
    vi.stubGlobal("fetch", vi.fn(async () => llmResponse({ clusters: [{ nonsense: true }] })));
    await expect(p.analyze(ANSWERS)).rejects.toThrow(/schema/);
  });

  it("never sends the API key anywhere except the Authorization header of its own request", async () => {
    const fetchMock = vi.fn(async () => llmResponse(GOOD));
    vi.stubGlobal("fetch", fetchMock);
    await new OpenAICompatibleProvider("SECRET-KEY-123", "m", "https://llm.example/v1").analyze(ANSWERS);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://llm.example/v1/chat/completions");
    expect(String(init.body)).not.toContain("SECRET-KEY-123");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer SECRET-KEY-123");
  });
});

describe("provider selection (env matrix)", () => {
  it("mock by default, mock when real requested without a key, llm when key set", () => {
    vi.stubEnv("LLM_PROVIDER", "mock"); vi.stubEnv("LLM_API_KEY", "");
    expect(providerMode()).toBe("mock");
    expect(getProvider()).toBeInstanceOf(MockProvider);
    vi.stubEnv("LLM_PROVIDER", "openai"); vi.stubEnv("LLM_API_KEY", "");
    expect(providerMode()).toBe("mock");
    vi.stubEnv("LLM_API_KEY", "sk-test");
    expect(providerMode()).toBe("llm");
    expect(getProvider()).not.toBeInstanceOf(MockProvider);
  });

  it("degrades VISIBLY to the heuristic when the LLM fails (meta.degraded)", async () => {
    vi.stubEnv("LLM_PROVIDER", "openai");
    vi.stubEnv("LLM_API_KEY", "sk-test");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network down"); }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await getProvider().analyze(ANSWERS);
    expect(r.meta?.source).toBe("mock");
    expect(r.meta?.degraded).toBe(true);
    expect(resultTotal(r)).toBe(3);
  });
});
