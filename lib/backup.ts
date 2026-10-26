/**
 * Local data backup / restore.
 *
 * Everything Fault Lines keeps lives in this browser (`faultlines-*` keys):
 * appearance, saved maps, install/update memory. That is the right default for
 * student privacy, but it also means clearing site data — or moving to the
 * staffroom laptop — silently loses a teacher's maps. This module turns those
 * keys into a portable JSON file and validates it on the way back in.
 *
 * It never talks to a server and never imports keys it does not recognise.
 */

export const BACKUP_APP = "fault-lines";
export const BACKUP_VERSION = 1;
export const BACKUP_KEY_PREFIX = "faultlines-";
export const MAX_BACKUP_BYTES = 2_000_000;
const MAX_KEYS = 60;

export interface LocalBackup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  /** key → raw string value, exactly as stored. */
  data: Record<string, string>;
}

export interface BackupParseResult {
  ok: boolean;
  backup?: LocalBackup;
  keyCount?: number;
  error?: string;
}

/** Minimal shape of the storage we touch, so this is testable without a browser. */
export interface KeyValueStore {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function buildBackup(data: Record<string, string>, now: Date = new Date()): LocalBackup {
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

/** Snapshot every `faultlines-*` key currently in the store. */
export function collectLocalData(store: Pick<KeyValueStore, "length" | "key" | "getItem">): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < store.length; i += 1) {
    const key = store.key(i);
    if (!key || !key.startsWith(BACKUP_KEY_PREFIX)) continue;
    const value = store.getItem(key);
    if (typeof value === "string") data[key] = value;
  }
  return data;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate a backup file before anything touches localStorage. */
export function parseBackup(raw: string): BackupParseResult {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (raw.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: "That backup is too large to be a Fault Lines backup." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  if (!isPlainObject(parsed)) return { ok: false, error: "That file doesn't look like a Fault Lines backup." };
  if (parsed.app !== BACKUP_APP) return { ok: false, error: "That backup was made by a different app." };
  if (typeof parsed.version !== "number" || parsed.version > BACKUP_VERSION) {
    return { ok: false, error: "That backup comes from a newer version of Fault Lines." };
  }
  if (!isPlainObject(parsed.data)) return { ok: false, error: "That backup has no data section." };

  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    // Only our own keys, only strings: a backup is data, never code.
    if (!key.startsWith(BACKUP_KEY_PREFIX)) continue;
    if (typeof value !== "string") continue;
    data[key] = value;
    if (Object.keys(data).length >= MAX_KEYS) break;
  }

  const keyCount = Object.keys(data).length;
  if (keyCount === 0) return { ok: false, error: "That backup contains no Fault Lines data." };

  return {
    ok: true,
    keyCount,
    backup: {
      app: BACKUP_APP,
      version: typeof parsed.version === "number" ? parsed.version : BACKUP_VERSION,
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
      data,
    },
  };
}

/** Write a validated backup into the store. Returns the number of keys restored. */
export function restoreLocalData(
  backup: LocalBackup,
  store: Pick<KeyValueStore, "setItem">,
): number {
  let restored = 0;
  for (const [key, value] of Object.entries(backup.data)) {
    if (!key.startsWith(BACKUP_KEY_PREFIX) || typeof value !== "string") continue;
    try {
      store.setItem(key, value);
      restored += 1;
    } catch {
      /* quota or private mode — report what did land */
    }
  }
  return restored;
}

/** Human-readable filename, e.g. `fault-lines-backup-2026-10-26.json`. */
export function backupFilename(now: Date = new Date()): string {
  return `fault-lines-backup-${now.toISOString().slice(0, 10)}.json`;
}
