import { describe, expect, it } from "vitest";
import { resultFromIndexes } from "@/lib/llm/real";
import { resultTotal } from "@/lib/validate";
import { POST } from "@/app/api/analyze/route";

describe("resultFromIndexes (LLM faithfulness by construction)", () => {
  const answers = ["alpha belief text", "beta belief text", "alpha again text", "vague"];
  it("derives counts/quotes from membership and sends leftovers to unsure", () => {
    const r = resultFromIndexes({
      clusters: [{ label: "Alpha", plain_name: "Alpha", risk: "high", why_it_matters: "w", member_indexes: [0, 2, 2, 99], reteach: { title: "T", minutes: 5, steps: ["s"], check_question: "q" }, diagnostic_question: "d" }],
      unsure: [{ index: 3, why: "vague" }],
    }, answers);
    expect(r.clusters[0].count).toBe(2);
    expect(r.clusters[0].quotes).toEqual(["alpha belief text", "alpha again text"]);
    expect(resultTotal(r)).toBe(4); // index 1 unassigned -> unsure, never lost
    expect(r.unsure.map((u) => u.answer)).toContain("beta belief text");
  });
});

function req(body: unknown) {
  return new Request("http://test/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

describe("POST /api/analyze", () => {
  it("analyses with the default mock and accounts for every answer", async () => {
    const res = await POST(req({ question: "Why do we have seasons?", answers: ["Earth is closer to the sun in summer months", "The earth is nearer the sun in June always", "idk"] }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(resultTotal(data)).toBe(3);
    expect(data.question).toBe("Why do we have seasons?");
  });
  it("rejects empty/invalid input with 400, not a stack trace", async () => {
    expect((await POST(req({ answers: [] }))).status).toBe(400);
    expect((await POST(req({ answers: ["  "] }))).status).toBe(400);
    expect((await POST(req({ nope: true }))).status).toBe(400);
    const bad = await POST(new Request("http://test/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }));
    expect(bad.status).toBe(400);
    const wrongType = await POST(new Request("http://test/api/analyze", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" }));
    expect(wrongType.status).toBe(415);
  });
  it("rejects over-cap payloads", async () => {
    const res = await POST(req({ answers: Array.from({ length: 121 }, () => "some answer text here") }));
    expect(res.status).toBe(400);
  });
});
