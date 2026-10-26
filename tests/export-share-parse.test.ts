import { describe, expect, it } from "vitest";
import { toCsv, toMarkdown, toPlainPlan } from "@/lib/export";
import { decodeShare, encodeShare } from "@/lib/share";
import { answersFromCsv, parseLines, prepareAnswers } from "@/lib/parse-input";
import { EXAMPLES } from "@/data/examples";
import { AnalysisResultSchema, MAX_ANSWERS } from "@/lib/schema";

const seasons = EXAMPLES[0].result;

describe("exports", () => {
  it("plain plan uses real newlines (regression: literal \\n bug)", () => {
    const plan = toPlainPlan(seasons);
    expect(plan).not.toContain("\\n");
    expect(plan.split("\n").length).toBeGreaterThan(10);
    expect(plan).toContain("18 of 28");
  });
  it("markdown has headings and verbatim quotes", () => {
    const md = toMarkdown(seasons);
    expect(md).toContain("# Fault Lines Report");
    expect(md).toContain("Because the earth moves nearer to the sun in June");
  });
  it("csv has a header row and one row per belief + unsure", () => {
    const rows = toCsv(seasons).split("\n");
    expect(rows[0]).toContain("belief");
    expect(rows.length).toBe(1 + seasons.clusters.length + seasons.unsure.length);
  });
});

describe("share codec", () => {
  it("round-trips unicode", () => {
    const r = { ...seasons, question: "Pourquoi les saisons ? — l'été ☀" };
    expect(decodeShare(encodeShare(r))?.question).toBe(r.question);
  });
  it("rejects garbage and wrong shapes", () => {
    expect(decodeShare("not-base64!!!")).toBeNull();
    expect(decodeShare(btoa(JSON.stringify({ evil: true })))).toBeNull();
  });
});

describe("input parsing", () => {
  it("extracts the answer column from CSV with quoted commas", () => {
    const csv = 'student,answer\nA,"Earth is closer, obviously"\nB,"It tilts"';
    expect(answersFromCsv(csv)).toEqual(["Earth is closer, obviously", "It tilts"]);
  });
  it("caps answers and counts duplicates (kept, but reported)", () => {
    const many = Array.from({ length: MAX_ANSWERS + 5 }, (_, i) => `answer ${i}`);
    const p = prepareAnswers([...many, "same", "same"]);
    expect(p.answers.length).toBe(MAX_ANSWERS);
    expect(p.truncated).toBe(true);
  });
  it("parseLines trims blank lines", () => {
    expect(parseLines(" a \n\n b ")).toEqual(["a", "b"]);
  });
});

describe("example classrooms", () => {
  it("all validate and their counts account for every answer", () => {
    for (const ex of EXAMPLES) {
      const parsed = AnalysisResultSchema.safeParse(ex.result);
      expect(parsed.success, ex.id).toBe(true);
      const total = ex.result.clusters.reduce((s, c) => s + c.count, 0) + ex.result.unsure.length;
      expect(total, ex.id).toBe(ex.answers.length);
    }
  });
});
