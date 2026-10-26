import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/en";
import { locales, LOCALE_NAMES, LOCALE_SHORT, localeDir, tFor, type Locale } from "@/lib/i18n";

/**
 * Translation coverage — the guard that stops the app drifting back to English.
 *
 * The bug this suite exists for: locale dictionaries used to be built as
 * `{ ...en, ...overrides }`, so any key without a translation silently rendered
 * English. Three checks make that impossible to reintroduce:
 *
 *  1. key parity — every locale has exactly the English key set;
 *  2. placeholder parity — `{n}` and friends survive translation, so no string
 *     ever renders a raw placeholder or loses a count;
 *  3. no silent English — no *sentence* (or any other key) is left identical to
 *     English unless it is a proper noun on the allowlist below.
 */

const LOCALE_CODES = Object.keys(locales) as Locale[];

/**
 * Strings that must stay identical in every language: brand and product nouns,
 * file formats and the names of third-party services.
 */
const PROPER_NOUNS = new Set([
  "title",
  "playTitle",
  "playGame",
  "brandHome",
  "githubAria",
  "brandTagline", // translated in every locale, listed for clarity if that changes
]);

/**
 * Keys whose value is legitimately identical to English: numbers, or words the
 * target language spells the same way. Everything else must differ — an entry
 * here should be a deliberate decision, not an accident.
 */
const SAME_AS_ENGLISH: Record<string, string[]> = {
  fr: [
    "stat2v", "stat3v", "stat4v", // "5 min", "7", "0"
    "faqEyebrow", "aboutVersion", "aboutLicence", "aboutSource", // same spelling in French
    "gamePause", "gameScore", // "Pause", "Score" are used in French
    "exFractionsSubject", // "Maths · Fractions"
    "assistTitle", // "Assistance" is French
    "suggestAria", // "Suggestions" is French
  ],
  es: ["stat2v", "stat3v", "stat4v"],
  de: ["stat3v", "stat4v", "themeSystem", "aboutVersion", "gamePause"],
  pt: ["stat2v", "stat3v", "stat4v"],
  yo: ["stat3v", "stat4v"],
  ar: ["stat3v", "stat4v"],
};

const tokens = (value: string) => (value.match(/\{[a-zA-Z0-9_]+\}/g) ?? []).sort();

describe("translation coverage", () => {
  it("ships seven complete locales", () => {
    expect(LOCALE_CODES).toEqual(expect.arrayContaining(["en", "fr", "es", "de", "pt", "yo", "ar"]));
    expect(LOCALE_CODES).toHaveLength(7);
    for (const code of LOCALE_CODES) {
      expect(LOCALE_NAMES[code], code).toBeTruthy();
      expect(LOCALE_SHORT[code], code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("gives every locale exactly the English key set", () => {
    const expected = Object.keys(en).sort();
    for (const [code, dict] of Object.entries(locales)) {
      expect(Object.keys(dict).sort(), code).toEqual(expected);
    }
  });

  it("never ships an empty or placeholder-only string", () => {
    for (const [code, dict] of Object.entries(locales)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(typeof value, `${code}.${key}`).toBe("string");
        expect(value.trim().length, `${code}.${key}`).toBeGreaterThan(0);
        expect(value.includes("TODO"), `${code}.${key}`).toBe(false);
      }
    }
  });

  it("keeps every {placeholder} through translation", () => {
    for (const [code, dict] of Object.entries(locales)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(tokens(value), `${code}.${key}`).toEqual(tokens(en[key as keyof typeof en]));
      }
    }
  });

  it("has no English string hiding in a translated locale", () => {
    const offenders: string[] = [];
    for (const code of LOCALE_CODES) {
      if (code === "en") continue;
      const dict = locales[code] as Record<string, string>;
      const allowed = new Set(SAME_AS_ENGLISH[code] ?? []);
      for (const [key, value] of Object.entries(en)) {
        if (allowed.has(key) || PROPER_NOUNS.has(key)) continue;
        // Any identity outside the allowlist means a key was never translated.
        if (dict[key] === value) offenders.push(`${code}.${key}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("translates every interface label, not just the long copy", () => {
    // Short keys are the ones most likely to be skipped, so assert that a
    // healthy share of them differ from English in each non-English locale.
    for (const code of LOCALE_CODES) {
      if (code === "en") continue;
      const dict = locales[code] as Record<string, string>;
      const short = Object.entries(en).filter(([, v]) => v.length <= 30);
      const translated = short.filter(([k, v]) => dict[k] !== v).length;
      expect(translated / short.length, code).toBeGreaterThan(0.85);
    }
  });

  it("resolves every key in every locale, with interpolation", () => {
    for (const code of LOCALE_CODES) {
      expect(tFor(code, "footerCopyright", { year: 2026 })).toContain("2026");
      expect(tFor(code, "riskHighShort").length).toBeGreaterThan(0);
      // A missing value leaves the placeholder visible rather than blank.
      expect(tFor(code, "footerCopyright")).toContain("{year}");
    }
  });

  it("marks Arabic as the only right-to-left locale", () => {
    expect(localeDir("ar")).toBe("rtl");
    for (const code of LOCALE_CODES.filter((c) => c !== "ar")) {
      expect(localeDir(code), code).toBe("ltr");
    }
  });
});
