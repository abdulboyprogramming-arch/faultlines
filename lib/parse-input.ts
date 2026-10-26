import { MAX_ANSWERS } from "./schema";

/** Split pasted text into answers (one per line), trimming and dropping blanks. */
export function parseLines(text: string): string[] {
  return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

/** Minimal RFC4180-ish CSV parser (handles quotes, commas and newlines in cells). */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      rows.push(row); row = [];
    } else cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

const ANSWER_HEADER = /(answer|response|text|réponse|respuesta)/i;

/**
 * Extract answers from CSV text: if a header row names an answer-ish column
 * use it, otherwise use the LAST column (exports usually put free text last),
 * otherwise column 1. Single-column CSV = one answer per row.
 */
export function answersFromCsv(text: string): string[] {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];
  if (rows.every((r) => r.length === 1)) return rows.map((r) => r[0].trim()).filter(Boolean);
  const header = rows[0];
  const idx = header.findIndex((h) => ANSWER_HEADER.test(h));
  const col = idx >= 0 ? idx : header.length - 1;
  const body = idx >= 0 || header.some((h) => /[a-z]/i.test(h)) ? rows.slice(1) : rows;
  return body.map((r) => (r[col] ?? "").trim()).filter(Boolean);
}

/** Heuristic: does this file text look like CSV (vs plain lines)? */
export function looksLikeCsv(text: string, filename = ""): boolean {
  if (/\.csv$/i.test(filename)) return true;
  const first = text.split(/\r?\n/)[0] ?? "";
  return first.includes(",") && (first.includes('"') || ANSWER_HEADER.test(first));
}

export interface PreparedInput {
  answers: string[];
  duplicates: number;
  truncated: boolean;
}

/** Apply the product cap with a calm, visible notice (never silent). */
export function prepareAnswers(raw: string[]): PreparedInput {
  const seen = new Map<string, number>();
  for (const a of raw) {
    const key = a.toLowerCase().replace(/\s+/g, " ");
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const duplicates = [...seen.values()].reduce((s, n) => s + Math.max(0, n - 1), 0);
  return {
    answers: raw.slice(0, MAX_ANSWERS),
    duplicates,
    truncated: raw.length > MAX_ANSWERS,
  };
}
