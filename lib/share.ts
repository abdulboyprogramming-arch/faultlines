import { AnalysisResultSchema, type AnalysisResult } from "./schema";

/**
 * Shareable reports via URL hash (ARCHITECTURE.md). The hash is never sent to
 * a server, but it IS bearer data: anyone with the link sees the (anonymised)
 * quotes. The UI must say so. Decoding validates with Zod — the original
 * `JSON.parse(atob(hash))` trusted arbitrary input and could crash the page.
 */

export function encodeShare(result: AnalysisResult): string {
  const json = JSON.stringify(result);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShare(hash: string): AnalysisResult | null {
  try {
    const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = AnalysisResultSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function shareUrl(result: AnalysisResult): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${encodeShare(result)}`;
}
