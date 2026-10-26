import { describe, expect, it } from "vitest";
import { describeScan, scanForPersonalData } from "@/lib/privacy";
import {
  BACKUP_APP,
  backupFilename,
  buildBackup,
  collectLocalData,
  parseBackup,
  restoreLocalData,
} from "@/lib/backup";

describe("privacy scan", () => {
  it("finds nothing in ordinary science answers", () => {
    const scan = scanForPersonalData([
      "Because the earth moves nearer to the sun in June",
      "The earth tilts on its axis so we get more sunlight",
      "It is because of the seasons",
    ]);
    expect(scan.answers).toBe(0);
    expect(describeScan(scan)).toBe("");
  });

  it("flags names, emails and phone-shaped numbers", () => {
    const scan = scanForPersonalData([
      "Adeola Balogun thinks it is closer to the sun",
      "email me at student.one@school.example",
      "call 0803 123 4567",
    ]);
    expect(scan.counts.name).toBeGreaterThan(0);
    expect(scan.counts.email).toBe(1);
    expect(scan.counts.phone).toBe(1);
    expect(scan.answers).toBe(3);
    expect(describeScan(scan)).toContain("email address");
  });

  it("flags explicit name labels", () => {
    const scan = scanForPersonalData(["Name: Tunde — the earth tilts"]);
    expect(scan.counts.label).toBe(1);
  });

  it("does not treat place names or determiners as names", () => {
    const scan = scanForPersonalData(["The Earth and the Sun in June", "World War One started in Europe"]);
    expect(scan.counts.name).toBe(0);
  });

  it("caps the samples it returns", () => {
    const many = Array.from({ length: 12 }, (_, i) => `Fatima Yusuf ${i} says the sun is closer`);
    const scan = scanForPersonalData(many);
    expect(scan.findings.length).toBeLessThanOrEqual(5);
    expect(scan.counts.name).toBeGreaterThan(5);
  });
});

describe("local data backup", () => {
  function fakeStore(seed: Record<string, string>) {
    const map = new Map(Object.entries(seed));
    return {
      get length() {
        return map.size;
      },
      key: (i: number) => Array.from(map.keys())[i] ?? null,
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
  }

  it("collects only faultlines keys", () => {
    const store = fakeStore({
      "faultlines-history-v2": "[]",
      "faultlines-theme": "dark",
      "other-app": "nope",
      "faultlines-locale": "fr",
    });
    const data = collectLocalData(store);
    expect(Object.keys(data).sort()).toEqual(["faultlines-history-v2", "faultlines-locale", "faultlines-theme"]);
  });

  it("round-trips a backup", () => {
    const backup = buildBackup({ "faultlines-theme": "dark" }, new Date("2026-10-26T10:00:00Z"));
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.ok).toBe(true);
    expect(parsed.keyCount).toBe(1);

    const target = fakeStore({});
    const restored = restoreLocalData(parsed.backup!, target);
    expect(restored).toBe(1);
    expect(target.getItem("faultlines-theme")).toBe("dark");
  });

  it("rejects foreign, empty, oversized and future backups", () => {
    expect(parseBackup("").ok).toBe(false);
    expect(parseBackup("not json").ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: "other", version: 1, data: {} })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: BACKUP_APP, version: 99, data: { "faultlines-theme": "dark" } })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: BACKUP_APP, version: 1, data: {} })).ok).toBe(false);
  });

  it("ignores keys outside our namespace on restore", () => {
    const parsed = parseBackup(
      JSON.stringify({
        app: BACKUP_APP,
        version: 1,
        exportedAt: "2026-10-26T10:00:00Z",
        data: { "faultlines-theme": "dark", "evil-key": "x", "faultlines-num": 5 },
      }),
    );
    expect(parsed.ok).toBe(true);
    expect(Object.keys(parsed.backup!.data)).toEqual(["faultlines-theme"]);
  });

  it("names files by date", () => {
    expect(backupFilename(new Date("2026-10-26T23:00:00Z"))).toBe("fault-lines-backup-2026-10-26.json");
  });
});
