/**
 * Privacy guard for pasted answers.
 *
 * Fault Lines promises that nothing is stored server-side — but quotes are
 * shown and shared verbatim, so a student's name in the paste still travels
 * wherever the report goes. This is a deliberately conservative scan: it only
 * flags things that look unambiguous (emails, phone-shaped numbers, name
 * labels, two capitalised words in a row). False positives are cheap — the
 * teacher dismisses the note — a missed name is not.
 */

export type PrivacyKind = "email" | "phone" | "label" | "name";

export interface PrivacyFinding {
  kind: PrivacyKind;
  /** Short, non-reversible sample to show in the UI. */
  sample: string;
}

export interface PrivacyScan {
  /** Number of distinct answers that tripped the scan. */
  answers: number;
  findings: PrivacyFinding[];
  counts: Record<PrivacyKind, number>;
}

/**
 * Capitalised words that are not names: determiners, months, weekdays, common
 * subject nouns and places. Keeping this list tight avoids warning on
 * "The Earth" or "World War".
 */
const NOT_A_NAME = new Set([
  "the", "a", "an", "this", "that", "these", "those", "it", "they", "he", "she", "we", "i",
  "in", "on", "at", "so", "because", "when", "if", "but", "and", "or", "also", "then",
  "however", "yes", "no", "not", "why", "what", "how", "where", "who", "which",
  "earth", "sun", "moon", "mars", "jupiter", "saturn", "venus", "mercury",
  "january", "february", "march", "april", "may", "june", "july", "august",
  "september", "october", "november", "december",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "world", "war", "new", "york", "united", "states", "britain", "england", "scotland",
  "wales", "ireland", "london", "paris", "france", "germany", "europe", "africa",
  "asia", "america", "australia", "sydney", "nigeria", "lagos", "canada", "india",
  "photosynthesis", "science", "history", "maths", "math", "biology", "chemistry",
  "physics", "geography", "english", "christmas", "easter", "god",
  "sir", "miss", "mrs", "ms", "mr", "dr",
]);

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]{2,}/g;
const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const LABEL = /^\s*(?:name|student|pupil|learner|id)\s*[:\-–]/i;
const WORD_PAIR = /\b([A-Z][a-z]{1,14})\s+([A-Z][a-z]{1,14})\b/g;

function clip(value: string, max = 42): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function isNameWord(word: string): boolean {
  return !NOT_A_NAME.has(word.toLowerCase());
}

/** Scan the answers a teacher is about to send (or share). */
export function scanForPersonalData(answers: string[]): PrivacyScan {
  const counts: Record<PrivacyKind, number> = { email: 0, phone: 0, label: 0, name: 0 };
  const findings: PrivacyFinding[] = [];
  const seen = new Set<string>();
  let flaggedAnswers = 0;

  const push = (kind: PrivacyKind, sample: string) => {
    counts[kind] += 1;
    const key = `${kind}:${sample.toLowerCase()}`;
    if (seen.has(key) || findings.length >= 5) return;
    seen.add(key);
    findings.push({ kind, sample });
  };

  for (const answer of answers) {
    if (!answer || answer.length < 3) continue;
    let flagged = false;

    for (const match of answer.matchAll(EMAIL)) {
      push("email", clip(match[0]));
      flagged = true;
    }

    for (const match of answer.matchAll(PHONE)) {
      const digits = match[0].replace(/\D/g, "");
      // 9+ digits: enough to be a phone number, short enough to be ignored.
      if (digits.length >= 9 && digits.length <= 15) {
        push("phone", clip(match[0]));
        flagged = true;
      }
    }

    if (LABEL.test(answer)) {
      push("label", clip(answer.split(/[:\-–]/)[0]) + ": …");
      flagged = true;
    }

    for (const match of answer.matchAll(WORD_PAIR)) {
      const [, first, second] = match;
      if (isNameWord(first) && isNameWord(second)) {
        push("name", clip(`${first} ${second}`));
        flagged = true;
      }
    }

    if (flagged) flaggedAnswers += 1;
  }

  return { answers: flaggedAnswers, findings, counts };
}

/** Human summary used in the composer warning. */
export function describeScan(scan: PrivacyScan): string {
  const parts: string[] = [];
  if (scan.counts.name) parts.push(`${scan.counts.name} name-like phrase${scan.counts.name === 1 ? "" : "s"}`);
  if (scan.counts.email) parts.push(`${scan.counts.email} email address${scan.counts.email === 1 ? "" : "es"}`);
  if (scan.counts.phone) parts.push(`${scan.counts.phone} phone-like number${scan.counts.phone === 1 ? "" : "s"}`);
  if (scan.counts.label) parts.push(`${scan.counts.label} “Name:” label${scan.counts.label === 1 ? "" : "s"}`);
  if (parts.length === 0) return "";
  return `Possible personal data in ${scan.answers} answer${scan.answers === 1 ? "" : "s"}: ${parts.join(", ")}.`;
}
