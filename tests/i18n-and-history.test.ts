import { beforeEach, describe, expect, it, vi } from "vitest";
import { locales, detectLocale, localeDir, t } from "@/lib/i18n";
import { clearAllLocalData, entryFor, loadHistory, saveHistory, MAX_HISTORY } from "@/lib/history";
import { EXAMPLES } from "@/data/examples";

class MemStorage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

beforeEach(() => {
  vi.stubGlobal("localStorage", new MemStorage());
});

describe("i18n system", () => {
  it("every locale has exactly the same keys as English", () => {
    const enKeys = Object.keys(locales.en).sort();
    for (const [name, dict] of Object.entries(locales)) {
      expect(Object.keys(dict).sort(), name).toEqual(enKeys);
      for (const [k, v] of Object.entries(dict)) expect(v.length, `${name}.${k}`).toBeGreaterThan(0);
    }
  });
  it("ships at least 7 locales including Yoruba and Arabic", () => {
    expect(Object.keys(locales)).toEqual(expect.arrayContaining(["en", "fr", "es", "de", "pt", "yo", "ar"]));
  });
  it("Arabic is RTL, others LTR", () => {
    expect(localeDir("ar")).toBe("rtl");
    expect(localeDir("en")).toBe("ltr");
    expect(localeDir("yo")).toBe("ltr");
  });
  it("honours a stored locale and falls back to en for junk", () => {
    localStorage.setItem("faultlines-locale", "yo");
    expect(detectLocale()).toBe("yo");
    expect(t("map")).toBe(locales.yo.map);
    localStorage.setItem("faultlines-locale", "xx");
    expect(detectLocale()).toBe("en");
  });
});

describe("local history system", () => {
  const result = EXAMPLES[0].result;

  it("round-trips entries and enforces the cap", () => {
    const many = Array.from({ length: MAX_HISTORY + 4 }, (_, i) =>
      entryFor(result, new Date(Date.now() - i * 1000).toISOString()));
    saveHistory(many);
    const loaded = loadHistory();
    expect(loaded.length).toBe(MAX_HISTORY);
    expect(loaded[0].total).toBeGreaterThan(0);
  });

  it("migrates v1 bare results instead of discarding teacher work", () => {
    localStorage.setItem("faultlines-history", JSON.stringify([result]));
    const loaded = loadHistory();
    expect(loaded.length).toBe(1);
    expect(localStorage.getItem("faultlines-history")).toBeNull();
    expect(localStorage.getItem("faultlines-history-v2")).not.toBeNull();
  });

  it("drops corrupt entries instead of crashing", () => {
    localStorage.setItem("faultlines-history-v2", JSON.stringify([{ id: "x", result: { nope: 1 } }, entryFor(result)]));
    expect(loadHistory().length).toBe(1);
    localStorage.setItem("faultlines-history-v2", "{not json");
    expect(loadHistory()).toEqual([]);
  });

  it("clearAllLocalData removes only faultlines keys", () => {
    localStorage.setItem("faultlines-theme", "dark");
    localStorage.setItem("faultlines-history-v2", "[]");
    localStorage.setItem("someone-elses-key", "keep me");
    clearAllLocalData();
    expect(localStorage.getItem("faultlines-theme")).toBeNull();
    expect(localStorage.getItem("someone-elses-key")).toBe("keep me");
  });
});
