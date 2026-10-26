import { NextResponse } from "next/server";
import { z } from "zod";
import { AnalysisResultSchema } from "@/lib/schema";
import { getProvider } from "@/lib/llm";

const BodySchema = z.object({ answers: z.array(z.string()).min(1).max(60) });

export async function POST(req: Request) {
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
