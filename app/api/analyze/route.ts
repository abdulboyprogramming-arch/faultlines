import { NextResponse } from "next/server";
import { AnalysisResultSchema, AnalyzeRequestSchema } from "@/lib/schema";
import { normalizeAnalysis } from "@/lib/validate";
import { getProvider } from "@/lib/llm";

/**
 * POST /api/analyze — the single serverless endpoint.
 * Validates input (question + capped answers), runs the configured provider
 * (heuristic mock by default; env-gated LLM otherwise), normalises and
 * validates the result before returning it. Never leaks stack traces.
 */

const MAX_BODY_BYTES = 300_000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const MAX_TRACKED_IPS = 5_000;

const rateMap = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateMap.size > MAX_TRACKED_IPS) {
    for (const [k, hits] of rateMap) {
      if (hits.every((t) => now - t >= WINDOW_MS)) rateMap.delete(k);
    }
  }
  const hits = (rateMap.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  return false;
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return fail(429, "Too many requests — wait a minute and try again.");

  const ctype = req.headers.get("content-type") ?? "";
  if (!ctype.includes("application/json")) return fail(415, "Send JSON (Content-Type: application/json).");
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) return fail(413, "That paste is too large.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid JSON.");
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Invalid input — send { answers: string[] } with at most 120 answers.");
  }
  const answers = parsed.data.answers.map((a) => a.trim()).filter(Boolean);
  if (answers.length === 0) return fail(400, "No answers provided.");
  const question = parsed.data.question?.trim() || undefined;

  try {
    const provider = getProvider();
    const raw = await provider.analyze(answers, { question });
    const withMeta = {
      ...raw,
      question: raw.question ?? question,
      meta: raw.meta ?? {
        source: "mock" as const,
        total: answers.length,
        generatedAt: new Date().toISOString(),
      },
    };
    const normalized = normalizeAnalysis(withMeta, answers);
    const validated = AnalysisResultSchema.safeParse(normalized);
    if (!validated.success) {
      console.error("[faultlines] Provider output failed validation", validated.error.issues);
      return fail(502, "The analysis came back in a shape we can't trust. Please try again.");
    }
    return NextResponse.json(validated.data);
  } catch (err) {
    console.error("[faultlines] analyze failed:", err);
    return fail(500, "Analysis failed. Your answers are still in the box — please try again.");
  }
}
