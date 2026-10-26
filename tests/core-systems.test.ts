import { describe, expect, it } from "vitest";
import { MockProvider, tokenize } from "@/lib/llm/mock";
import { resultTotal, isVerbatim } from "@/lib/validate";
import { AnalyzeRequestSchema, AnalysisResultSchema, MAX_ANSWERS } from "@/lib/schema";
import { answersFromCsv, looksLikeCsv } from "@/lib/parse-input";
import { decodeAnswersPayload, encodeAnswersPayload } from "@/lib/share";
import { toCsv } from "@/lib/export";
import { GET as healthGET } from "@/app/api/health/route";
import { FRENCH_ANSWERS, UNICODE_ANSWERS, DUPLICATES, ALL_VAGUE, ONE_WORD_VS_LONG, BIG_CLASS, CSV_QUOTED, CSV_NO_HEADER } from "./fixtures";
import { EXAMPLES } from "@/data/examples";
import { readFileSync, existsSync } from "node:fs";

describe("heuristic on messy real-world data", () => {
  it("handles French answers and French 'je ne sais pas' -> unsure", async () => {
    const r = await new MockProvider().analyze(FRENCH_ANSWERS, { question: "Pourquoi avons-nous des saisons ?" });
    expect(resultTotal(r)).toBe(FRENCH_ANSWERS.length);
    expect(r.unsure.map((u) => u.answer)).toContain("Je ne sais pas");
    expect(r.clusters.length).toBeGreaterThanOrEqual(1);
  });

  it("keeps unicode/emoji answers verbatim and never loses one", async () => {
    const r = await new MockProvider().analyze(UNICODE_ANSWERS);
    expect(resultTotal(r)).toBe(UNICODE_ANSWERS.length);
    for (const c of r.clusters) for (const q of c.quotes) expect(isVerbatim(q, UNICODE_ANSWERS)).toBe(true);
  });

  it("groups exact duplicates together (duplicates are evidence)", async () => {
    const r = await new MockProvider().analyze(DUPLICATES);
    const biggest = r.clusters.reduce((a, b) => (b.count > a.count ? b : a), r.clusters[0]);
    expect(biggest.count).toBeGreaterThanOrEqual(2);
    expect(resultTotal(r)).toBe(DUPLICATES.length);
  });

  it("all-vague class -> zero invented beliefs, everything unsure", async () => {
    const r = await new MockProvider().analyze(ALL_VAGUE);
    expect(r.clusters.length).toBe(0);
    expect(r.unsure.length).toBe(ALL_VAGUE.length);
  });

  it("one-word vs essay answers don't crash and all are accounted", async () => {
    const r = await new MockProvider().analyze(ONE_WORD_VS_LONG);
    expect(resultTotal(r)).toBe(3);
  });

  it("120-answer class completes fast and accounts for everyone", async () => {
    const start = Date.now();
    const r = await new MockProvider().analyze(BIG_CLASS);
    expect(Date.now() - start).toBeLessThan(1500);
    expect(resultTotal(r)).toBe(120);
    expect(r.clusters.length).toBeGreaterThanOrEqual(2);
  });

  it("tokenize stems safely (mass/photosynthesis not mangled)", () => {
    const toks = tokenize("The mass comes from photosynthesis in leaves");
    expect(toks).toContain("mass");
    expect(toks).toContain("photosynthesis");
    expect(toks).not.toContain("the");
  });
});

describe("schema limits (shared client/server contract)", () => {
  it("enforces answer caps at every boundary", () => {
    expect(AnalyzeRequestSchema.safeParse({ answers: Array(MAX_ANSWERS).fill("ok answer here") }).success).toBe(true);
    expect(AnalyzeRequestSchema.safeParse({ answers: Array(MAX_ANSWERS + 1).fill("ok answer here") }).success).toBe(false);
    expect(AnalyzeRequestSchema.safeParse({ answers: ["x".repeat(2001)] }).success).toBe(false);
    expect(AnalyzeRequestSchema.safeParse({ answers: ["fine"], question: "q".repeat(301) }).success).toBe(false);
  });
  it("rejects clusters with zero/negative counts or no quotes", () => {
    const good = EXAMPLES[0].result;
    const bad = structuredClone(good);
    bad.clusters[0].count = 0;
    expect(AnalysisResultSchema.safeParse(bad).success).toBe(false);
    const bad2 = structuredClone(good);
    bad2.clusters[0].quotes = [];
    expect(AnalysisResultSchema.safeParse(bad2).success).toBe(false);
  });
});

describe("CSV ingestion edge cases", () => {
  it("parses quoted commas, embedded newlines and doubled quotes", () => {
    const out = answersFromCsv(CSV_QUOTED);
    expect(out[0]).toBe("Earth is closer, obviously");
    expect(out[1]).toContain("on its axis");
    expect(out[2]).toBe('He said "closer" loudly');
  });
  it("handles headerless CSV and BOM", () => {
    expect(answersFromCsv(CSV_NO_HEADER).length).toBe(2);
    expect(answersFromCsv("\uFEFFanswer\nHello world answer")).toEqual(["Hello world answer"]);
  });
  it("looksLikeCsv discriminates plain pastes", () => {
    expect(looksLikeCsv("Earth is closer\nIt tilts")).toBe(false);
    expect(looksLikeCsv("student,answer\nA,x")).toBe(true);
    expect(looksLikeCsv("anything", "class.csv")).toBe(true);
  });
  it("CSV export neutralises spreadsheet formula injection", () => {
    const evil = structuredClone(EXAMPLES[0].result);
    evil.clusters[0].quotes = ["=SUM(1+1)", "+cmd|' /C calc'!A0"];
    const csv = toCsv(evil);
    expect(csv).not.toContain(",=SUM");
    expect(csv).toContain("'=SUM(1+1)");
  });
});

describe("extension payload codec (must match extension/*.js)", () => {
  it("round-trips unicode question + answers and caps sizes", () => {
    const p = { q: "Pourquoi les saisons ? ☀", answers: FRENCH_ANSWERS };
    const back = decodeAnswersPayload(encodeAnswersPayload(p));
    expect(back?.q).toBe(p.q);
    expect(back?.answers).toEqual(FRENCH_ANSWERS);
  });
  it("rejects garbage, wrong shapes and oversized payloads safely", () => {
    expect(decodeAnswersPayload("%%junk%%")).toBeNull();
    expect(decodeAnswersPayload(btoa(JSON.stringify({ answers: "nope" })))).toBeNull();
    const big = decodeAnswersPayload(encodeAnswersPayload({ answers: Array(500).fill("an answer with words") }));
    expect(big?.answers.length).toBe(120);
  });
  it("extension manifest is valid MV3 with minimal permissions and existing icons", () => {
    const m = JSON.parse(readFileSync("extension/manifest.json", "utf8"));
    expect(m.manifest_version).toBe(3);
    expect(m.permissions).not.toContain("<all_urls>");
    expect(m.host_permissions).toBeUndefined();
    for (const icon of Object.values(m.icons) as string[]) expect(existsSync(`extension/${icon}`)).toBe(true);
  });
});

describe("health endpoint + PWA/security assets", () => {
  it("health exposes only ok+provider (no secrets)", async () => {
    const res = await healthGET();
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(["ok", "provider"]);
    expect(body.provider).toBe("mock");
  });
  it("PWA manifest has cross-device icons, shortcuts and standalone display", () => {
    const m = JSON.parse(readFileSync("public/manifest.json", "utf8"));
    expect(m.display).toBe("standalone");
    expect(m.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
    expect(m.icons.map((i: { sizes: string }) => i.sizes)).toContain("192x192");
    expect(m.shortcuts.length).toBeGreaterThanOrEqual(2);
    for (const icon of m.icons) expect(existsSync(`public${icon.src}`), icon.src).toBe(true);
  });
  it("service worker precaches /offline and never caches /api", () => {
    const sw = readFileSync("public/sw.js", "utf8");
    expect(sw).toContain('"/offline"');
    expect(sw).toContain('startsWith("/api/")');
  });
  it("security.txt exists for responsible disclosure", () => {
    expect(readFileSync("public/.well-known/security.txt", "utf8")).toContain("Contact:");
  });
  it("all four example classrooms are present and consistent", () => {
    expect(EXAMPLES.map((e) => e.id)).toEqual(["seasons", "fractions", "photosynthesis", "ww1"]);
  });
});
