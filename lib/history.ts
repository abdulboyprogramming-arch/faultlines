import { AnalysisResultSchema, type AnalysisResult } from "./schema";
import { notifyStorageChange } from "./use-local-store";
import { resultTotal } from "./validate";

/** Local-only history (browser storage). Labelled, validated, deletable. */
export interface HistoryEntry {
  id: string;
  at: string; // ISO
  question?: string;
  total: number;
  result: AnalysisResult;
}

export const HISTORY_KEY = "faultlines-history-v2";
const KEY = HISTORY_KEY;
const LEGACY_KEY = "faultlines-history";
export const MAX_HISTORY = 8;

export function loadHistory(): HistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const arr = JSON.parse(raw) as HistoryEntry[];
      return Array.isArray(arr)
        ? arr.filter((e) => e?.result && AnalysisResultSchema.safeParse(e.result).success)
        : [];
    }
    // Migrate v1 (bare results, no metadata) instead of discarding teacher work.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const arr = JSON.parse(legacy) as AnalysisResult[];
      const migrated = (Array.isArray(arr) ? arr : [])
        .filter((r) => AnalysisResultSchema.safeParse(r).success)
        .map((r, i) => entryFor(r, new Date(Date.now() - i * 1000).toISOString()));
      if (migrated.length) saveHistory(migrated);
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }
  } catch { /* storage unavailable — history is best-effort */ }
  return [];
}

export function entryFor(result: AnalysisResult, at = new Date().toISOString()): HistoryEntry {
  return {
    id: `${Date.parse(at) || Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at,
    question: result.question,
    total: resultTotal(result),
    result,
  };
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
  } catch { /* quota */ }
  notifyStorageChange();
}

export function clearAllLocalData(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith("faultlines-")) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
  notifyStorageChange();
}
