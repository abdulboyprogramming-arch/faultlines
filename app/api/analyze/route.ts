import { NextResponse } from "next/server";
import { z } from "zod";
import { AnalysisResultSchema } from "@/lib/schema";
import { getProvider } from "@/lib/llm";

const rateMap = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 30;
  const hits = (rateMap.get(ip) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  return false;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const answers = parsed.data.answers.map((a) => a.trim()).filter(Boolean);
  if (answers.length === 0) {
    return NextResponse.json({ error: "No answers" }, { status: 400 });
  }

  const provider = getProvider();
  const result = await provider.analyze(answers);
  const validated = AnalysisResultSchema.safeParse(result);
  if (!validated.success) {
    return NextResponse.json({ error: "Bad result" }, { status: 500 });
  }
  return NextResponse.json(validated.data);
}
