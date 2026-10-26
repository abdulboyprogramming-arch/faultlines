import { NextResponse } from "next/server";
import { providerMode } from "@/lib/llm";

/** Safe status for the Settings page: which engine is active. Exposes no secrets. */
export async function GET() {
  return NextResponse.json({ ok: true, provider: providerMode() });
}
