import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/analyze/route";

/** Isolated file: the rate-limit map is module-level, so these run in order. */
function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://test/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.99", ...headers },
    body: JSON.stringify(body),
  });
}

describe("API hardening", () => {
  it("rejects oversized bodies via Content-Length (413)", async () => {
    const res = await POST(req({ answers: ["ok answer words here"] }, { "content-length": "999999" }));
    expect(res.status).toBe(413);
  });

  it("rate-limits after 30 requests/min per IP (429) with a calm message", async () => {
    let lastStatus = 0;
    let bodyText = "";
    for (let i = 0; i < 32; i++) {
      const res = await POST(req({ answers: ["The earth tilts and changes the sunlight angle seasonally"] }));
      lastStatus = res.status;
      if (res.status === 429) { bodyText = JSON.stringify(await res.json()); break; }
    }
    expect(lastStatus).toBe(429);
    expect(bodyText).toContain("Too many requests");
  });

  it("a different IP is unaffected by another IP's limit", async () => {
    const res = await POST(req({ answers: ["The earth tilts and changes the sunlight angle seasonally"] }, { "x-forwarded-for": "198.51.100.7" }));
    expect(res.status).toBe(200);
  });
});
