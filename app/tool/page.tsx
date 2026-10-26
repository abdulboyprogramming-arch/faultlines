"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import StrataMap from "@/components/StrataMap";
import BandDetail from "@/components/BandDetail";
import ExportBar from "@/components/ExportBar";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StrataLoader from "@/components/StrataLoader";
import T from "@/components/T";
import { MAX_ANSWERS, type AnalysisResult } from "@/lib/schema";
import { normalizeAnalysis, resultTotal } from "@/lib/validate";
import { MockProvider } from "@/lib/llm/mock";
import { EXAMPLES } from "@/data/examples";
import { answersFromCsv, looksLikeCsv, parseLines, prepareAnswers } from "@/lib/parse-input";
import { decodeAnswersPayload, decodeShare } from "@/lib/share";
import { entryFor, HISTORY_KEY, loadHistory, saveHistory } from "@/lib/history";
import { useLocale, useT } from "@/lib/use-i18n";
import SuggestionList from "@/components/SuggestionList";
import {
  matchesHistoryQuery,
  suggestAnswers,
  suggestHistory,
  suggestQuestions,
  type Suggestion,
} from "@/lib/suggest";
import { useHistorySuggestPref, useNotifyPref, useSuggestPref } from "@/lib/prefs";
import { notifyReady } from "@/lib/notify";
import { startTour } from "@/lib/tour";
import { LOCALE_NAMES } from "@/lib/i18n";
import { getLocale, tFor } from "@/lib/i18n";
import { isOn, TOGGLE_KEY } from "@/lib/prefs";
import { useStoredString } from "@/lib/use-local-store";
import { scanForPersonalData } from "@/lib/privacy";
import { compareRuns } from "@/lib/compare";

/** Example classroom copy comes from the dictionary; the answer data does not. */
const EXAMPLE_COPY: Record<string, { name: string; subject: string }> = {
  seasons: { name: "exSeasonsName", subject: "exSeasonsSubject" },
  fractions: { name: "exFractionsName", subject: "exFractionsSubject" },
  photosynthesis: { name: "exPhotoName", subject: "exPhotoSubject" },
  ww1: { name: "exWw1Name", subject: "exWw1Subject" },
};

type Tran = ReturnType<typeof useT>;

/** "Possible personal data in 3 answers: 2 name-like phrases, 1 email address." */
function describeScanLocalised(
  scan: ReturnType<typeof scanForPersonalData>,
  t: Tran,
): string {
  const parts: string[] = [];
  if (scan.counts.name) parts.push(t(scan.counts.name === 1 ? "privacyNames" : "privacyNamesPlural", { n: scan.counts.name }));
  if (scan.counts.email) parts.push(t(scan.counts.email === 1 ? "privacyEmails" : "privacyEmailsPlural", { n: scan.counts.email }));
  if (scan.counts.phone) parts.push(t(scan.counts.phone === 1 ? "privacyPhones" : "privacyPhonesPlural", { n: scan.counts.phone }));
  if (scan.counts.label) parts.push(t(scan.counts.label === 1 ? "privacyLabels" : "privacyLabelsPlural", { n: scan.counts.label }));
  if (parts.length === 0) return "";
  return t(scan.answers === 1 ? "privacyWarnOne" : "privacyWarnMany", {
    n: scan.answers,
    parts: parts.join(", "),
  });
}

/** Screen-reader summary of a run-to-run comparison, in the reader's language. */
function describeComparisonLocalised(
  comparison: NonNullable<ReturnType<typeof compareRuns>>,
  t: Tran,
): string {
  if (!comparison.changed) return t("cmpNone");
  const shrunk = comparison.deltas.filter((d) => d.change < 0).length;
  const grew = comparison.deltas.filter((d) => d.change > 0).length;
  const parts: string[] = [];
  if (shrunk) parts.push(t(shrunk === 1 ? "cmpShrunkOne" : "cmpShrunk", { n: shrunk }));
  if (grew) parts.push(t(grew === 1 ? "cmpGrewOne" : "cmpGrew", { n: grew }));
  return t("cmpSummary", { date: t.date(comparison.previousAt), parts: parts.join(", ") });
}

/** Read the notification preference outside React (called from a callback). */
function isNotifyOn(): boolean {
  return isOn(TOGGLE_KEY.notify, "off");
}

export default function Tool() {
  const t = useT();
  const [question, setQuestion] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<number>(0);
  const [unsureOpen, setUnsureOpen] = useState(false);
  const [isSample, setIsSample] = useState<string | null>(null);
  // History lives in localStorage; subscribing keeps it in sync with Settings,
  // other tabs and deletions without an extra state copy.
  const historyRaw = useStoredString(HISTORY_KEY);
  const history = useMemo(() => {
    void historyRaw; // subscription trigger: re-parse whenever storage changes
    return loadHistory();
  }, [historyRaw]);
  const [dragging, setDragging] = useState(false);
  const [privacyDismissedFor, setPrivacyDismissedFor] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [suggestOn] = useSuggestPref();
  const [historySuggestOn] = useHistorySuggestPref();
  useNotifyPref(); // subscribe so a Settings change re-renders and the next map notifies
  const locale = useLocale();
  const [questionOpen, setQuestionOpen] = useState(false);
  const [questionActive, setQuestionActive] = useState(0);
  const [answerDismissed, setAnswerDismissed] = useState<string | null>(null);
  const [answerActive, setAnswerActive] = useState(0);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historySearchOpen, setHistorySearchOpen] = useState(false);
  const [historySearchActive, setHistorySearchActive] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const live = useMemo(() => prepareAnswers(parseLines(text)), [text]);
  const privacy = useMemo(() => scanForPersonalData(live.answers), [live.answers]);
  const showPrivacyWarning =
    privacy.answers > 0 && privacyDismissedFor !== live.answers.length;

  // Question presets: the example questions, so teachers can reuse a phrasing
  // that is known to group well instead of starting from a blank field.
  const questionPresets = useMemo(
    () => Array.from(new Set(EXAMPLES.map((e) => e.question))).slice(0, 8),
    [],
  );

  // ── suggestion pools ───────────────────────────────────────────────────
  // Questions come from the examples plus every saved map; answers come from
  // the example classrooms plus every quote the teacher already has in local
  // history. Nothing new is stored to make this work — it reads what is
  // already in this browser, and both features can be switched off in Settings.
  const pools = useMemo(() => {
    const questions = new Set<string>(questionPresets);
    const beliefs = new Set<string>();
    const answers = new Set<string>();
    for (const e of EXAMPLES) e.answers.forEach((a) => answers.add(a));
    for (const h of history) {
      if (h.question) questions.add(h.question);
      for (const c of h.result.clusters) {
        beliefs.add(c.plain_name);
        c.quotes.forEach((q) => answers.add(q));
      }
      h.result.unsure.forEach((u) => answers.add(u.answer));
    }
    return { questions: [...questions], beliefs: [...beliefs], answers: [...answers] };
  }, [questionPresets, history]);

  const questionSuggestions = useMemo(
    () => (suggestOn && questionOpen ? suggestQuestions(question, pools) : []),
    [suggestOn, questionOpen, question, pools],
  );

  const answerSuggest = useMemo(
    () => (suggestOn ? suggestAnswers(text, pools) : { line: "", partial: "", suggestions: [] as Suggestion[] }),
    [suggestOn, text, pools],
  );
  const answerSuggestions =
    answerDismissed !== null && answerDismissed === answerSuggest.partial
      ? []
      : answerSuggest.suggestions;

  const historySuggestions = useMemo(
    () => (historySuggestOn && historySearchOpen ? suggestHistory(historyQuery, pools) : []),
    [historySuggestOn, historySearchOpen, historyQuery, pools],
  );

  const visibleHistory = useMemo(
    () => history.filter((h) => matchesHistoryQuery(historyQuery, h)),
    [history, historyQuery],
  );

  function applyQuestion(value: string) {
    setQuestion(value);
    setQuestionOpen(false);
  }

  /** Replace the line being typed with the accepted completion. */
  function applyAnswer(value: string) {
    setText((current) => {
      const normalised = current.replace(/\r\n?/g, "\n");
      const start = normalised.lastIndexOf("\n") + 1;
      return `${normalised.slice(0, start)}${value}`;
    });
    setAnswerActive(0);
    setAnswerDismissed(value);
  }

  /** Shared keyboard model for all three suggestion fields. */
  function suggestKeys(
    e: React.KeyboardEvent<HTMLElement>,
    items: Suggestion[],
    active: number,
    setActive: (n: number) => void,
    accept: (value: string) => void,
    close: () => void,
  ) {
    if (items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((active + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((active - 1 + items.length) % items.length);
    } else if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
      e.preventDefault();
      accept(items[active].value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // One-time sync from an external system (URL hash of a share/extension link,
  // or ?example=… from the landing page). Runs after hydration because the
  // server cannot see location.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from an external system (URL) after hydration */
    const params = new URLSearchParams(window.location.search);
    const exampleId = params.get("example");
    if (exampleId) {
      const ex = EXAMPLES.find((e) => e.id === exampleId);
      if (ex) {
        setQuestion(ex.question);
        setText(ex.answers.join("\n"));
        setResult(normalizeAnalysis(ex.result, ex.answers));
        setSelected(0);
        setIsSample(ex.name);
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
    }

    const hash = window.location.hash.slice(1);
    if (!hash) return;
    if (hash.startsWith("a=")) {
      // Prefill from the browser extension / a "send to Fault Lines" link.
      const payload = decodeAnswersPayload(hash.slice(2));
      if (payload && payload.answers.length) {
        if (payload.q) setQuestion(payload.q);
        setText(payload.answers.join("\n"));
        setNotice(t("incomingNotice", { n: payload.answers.length }));
      } else {
        setError(t("incomingError"));
      }
      return;
    }
    const shared = decodeShare(hash);
    if (shared) {
      setResult(normalizeAnalysis(shared));
      setSelected(0);
      setNotice(t("sharedNotice"));
    } else if (hash.length > 40) {
      // Long enough to be a report payload, but it did not validate.
      setError(t("badShare"));
    }
    // Short hashes are just in-page anchors (#examples) — leave them alone.
    /* eslint-enable react-hooks/set-state-in-effect */
    // One-time URL sync: `t` is intentionally excluded so a language change
    // never re-reads the hash and overwrites the teacher's current map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: Parameters<typeof saveHistory>[0]) {
    saveHistory(next);
  }

  const finish = useCallback(
    (data: AnalysisResult, answers: string[]) => {
      const clean = normalizeAnalysis(data, answers);
      setResult(clean);
      setSelected(0);
      setUnsureOpen(false);
      setIsSample(null);
      setAnnouncement(
        t("announcement", {
          a: resultTotal(clean),
          b: clean.clusters.length,
          u: clean.unsure.length ? t("announcementUnsure", { n: clean.unsure.length }) : "",
        }),
      );
      if (clean.meta?.degraded) {
        setNotice(t("providerDegraded"));
      }
      const entry = entryFor(clean);
      setLastSavedId(entry.id);
      saveHistory([entry, ...loadHistory()].slice(0, 8));

      // Optional system notification — counts only, never student words, so it
      // is safe to show on a lock screen. Silently skipped when off or denied.
      if (isNotifyOn()) {
        void notifyReady(
          tFor(getLocale(), "notifyTitle"),
          tFor(getLocale(), "notifyBody", { a: resultTotal(clean), b: clean.clusters.length }),
        );
      }
    },
    [t],
  );

  const analyze = useCallback(async () => {
    if (live.answers.length === 0) {
      setError(t("errorNoAnswers"));
      return;
    }
    setError(null);
    setNotice(live.truncated ? t("capMessage", { n: MAX_ANSWERS }) : null);
    setLoading(true);
    // `locale` asks the engine to *write* its prose in the reader's language.
    // Student quotes are returned verbatim regardless of locale.
    const payload = {
      answers: live.answers,
      question: question.trim() || undefined,
      locale: getLocale(),
    };
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Analysis failed (${res.status})`);
      }
      const data = (await res.json()) as AnalysisResult;
      finish(data, live.answers);
    } catch {
      // Static deploy fallback (e.g. GitHub Pages has no API route): run the
      // same heuristic in-browser, and SAY so.
      try {
        const data = await new MockProvider().analyze(live.answers, { question: payload.question });
        setNotice(t("analysisUnreachable"));
        finish(data, live.answers);
      } catch {
        setError(t("errorAnalysis"));
      }
    } finally {
      setLoading(false);
    }
  }, [live, question, finish, t]);

  // ⌘/Ctrl + Enter maps the class from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !result && !loading) {
        e.preventDefault();
        void analyze();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [analyze, result, loading]);

  // j / k move between beliefs once a map exists (arrow keys would fight with
  // page scrolling, and every control is still reachable with Tab).
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (e.key !== "j" && e.key !== "k") return;
      e.preventDefault();
      setSelected((current) => {
        const next = e.key === "j" ? current + 1 : current - 1;
        return Math.max(0, Math.min(result.clusters.length - 1, next));
      });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [result]);

  // Bring the result into view once it exists.
  useEffect(() => {
    if (result && resultsRef.current) {
      const node = resultsRef.current;
      const y = node.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
      // Move focus too, so keyboard and screen-reader users are not left at the
      // composer while the result appears above them.
      node.focus({ preventScroll: true });
    }
  }, [result]);

  function loadExample(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setQuestion(ex.question);
    setText(ex.answers.join("\n"));
    setResult(normalizeAnalysis(ex.result, ex.answers));
    setSelected(0);
    setUnsureOpen(false);
    setIsSample(ex.name);
    setError(null);
    setNotice(null);
    const normalized = normalizeAnalysis(ex.result, ex.answers);
    setAnnouncement(t("exampleLoadedNotice", { a: resultTotal(normalized), b: normalized.clusters.length }));
  }

  function onFile(file: File) {
    if (file.size > 1_000_000) {
      setError(t("fileTooBig"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result);
      const answers = looksLikeCsv(content, file.name) ? answersFromCsv(content) : parseLines(content);
      if (answers.length === 0) {
        setError(t("fileEmpty"));
        return;
      }
      setText(answers.join("\n"));
      setError(null);
      setNotice(t("fileLoaded", { n: answers.length, name: file.name }));
    };
    reader.onerror = () => setError(t("fileRead"));
    reader.readAsText(file);
  }

  function startOver() {
    setResult(null);
    setIsSample(null);
    setUnsureOpen(false);
    setNotice(null);
    setError(null);
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      composerRef.current?.querySelector<HTMLInputElement>("#question")?.focus();
    });
  }

  const total = result ? resultTotal(result) : 0;
  const selectedCluster = result?.clusters[selected] ?? null;
  const topRisk = result?.clusters.find((c) => c.risk === "high") ?? result?.clusters[0] ?? null;
  const highCount = result?.clusters.filter((c) => c.risk === "high").length ?? 0;
  const comparison = useMemo(
    () => (result && !isSample ? compareRuns(result, history, lastSavedId ?? undefined) : null),
    [result, history, isSample, lastSavedId],
  );
  const sourceLabel =
    result?.meta?.source === "llm"
      ? t("sourceAi")
      : result?.meta?.source === "example"
        ? t("sourceExample")
        : t("sourceHeuristic");
  const sourceHint =
    result && result.meta?.source !== "llm" && result.meta?.source !== "example"
      ? t("sourceHeuristicHint")
      : isSample
        ? t("sourceExampleHint", { name: isSample })
        : undefined;

  const filled = Math.min(live.answers.length / MAX_ANSWERS, 1);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

      <main id="main-content" className="shell py-8 sm:py-12">
        {/* ─────────────────────────────────────────────────── composer */}
        {!result && (
          <div ref={composerRef}>
            <header className="mb-8 max-w-2xl print:hidden">
              <nav aria-label={t("breadcrumbHome")} className="mb-3 flex items-center gap-1.5 text-xs text-ink/45">
                <Link href="/" className="transition-colors hover:text-ink">
                  {t("breadcrumbHome")}
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-ink/70">{t("breadcrumbTool")}</span>
              </nav>
              <h1 className="text-[clamp(2rem,4.5vw,3rem)]">{t("toolTitle")}</h1>
              <p className="mt-2 max-w-xl leading-relaxed text-ink/65">{t("toolSubtitle")}</p>
            </header>

            {(error || notice) && (
              <div className="mb-6 space-y-2">
                {error && (
                  <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-rust/40 bg-rust/8 px-4 py-3 text-sm">
                    <span className="text-rust">{error}</span>
                    <button type="button" onClick={() => setError(null)} aria-label={t("dismiss")} className="shrink-0 text-rust/60 hover:text-rust">✕</button>
                  </div>
                )}
                {notice && !error && (
                  <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-ochre/45 bg-ochre/10 px-4 py-3 text-sm text-ink/75">
                    <span>{notice}</span>
                    <button type="button" onClick={() => setNotice(null)} aria-label={t("dismiss")} className="shrink-0 text-ink/40 hover:text-ink">✕</button>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="mb-6 py-10 animate-fade-in">
                <StrataLoader label={t("readingCount", { n: live.answers.length })} />
              </div>
            )}

            {!loading && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
                {/* input card */}
                <div className="card overflow-hidden animate-fade-up">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-card-deep/40 px-5 py-3">
                    <h2 className="font-display text-base font-semibold">{t("yourClass")}</h2>
                    <span className="text-[0.7rem] uppercase tracking-[0.1em] text-ink/40">{t("step1of2")}</span>
                  </div>

                  <div className="space-y-5 p-5">
                    <div data-tour="question">
                      <label htmlFor="question" className="mb-1.5 block text-sm font-medium">
                        {t("questionLabel")}
                      </label>
                      <div className="relative">
                        <input
                          id="question"
                          value={question}
                          onChange={(e) => {
                            setQuestion(e.target.value);
                            setQuestionOpen(true);
                            setQuestionActive(0);
                          }}
                          onFocus={() => setQuestionOpen(true)}
                          onBlur={() => setQuestionOpen(false)}
                          onKeyDown={(e) =>
                            suggestKeys(
                              e,
                              questionSuggestions,
                              questionActive,
                              setQuestionActive,
                              applyQuestion,
                              () => setQuestionOpen(false),
                            )
                          }
                          maxLength={300}
                          placeholder={t("questionPlaceholder")}
                          className="field"
                          role="combobox"
                          aria-expanded={questionSuggestions.length > 0}
                          aria-controls="question-suggestions"
                          aria-autocomplete="list"
                          aria-activedescendant={
                            questionSuggestions.length ? `question-suggestions-${questionActive}` : undefined
                          }
                          aria-describedby="question-hint"
                        />
                        <SuggestionList
                          id="question-suggestions"
                          items={questionSuggestions}
                          active={questionActive}
                          label={t("suggestAria")}
                          onPick={applyQuestion}
                          onHover={setQuestionActive}
                        />
                      </div>
                      <p id="question-hint" className="mt-1.5 text-xs text-ink/45">
                        {t("questionHint")}
                      </p>
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) onFile(f);
                      }}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <label htmlFor="answers" className="text-sm font-medium">
                          {t("answersLabel")}
                        </label>
                        <span id="answers-count" className="text-xs tabular-nums text-ink/50" aria-live="polite">
                          {live.answers.length} / {MAX_ANSWERS}
                        </span>
                      </div>
                      <div
                        data-tour="answers"
                        className={`relative rounded-lg transition-shadow ${
                          dragging ? "ring-2 ring-rust ring-offset-2 ring-offset-paper" : ""
                        }`}
                      >
                        <textarea
                          id="answers"
                          aria-describedby="answers-hint"
                          value={text}
                          onChange={(e) => {
                            setText(e.target.value);
                            setAnswerActive(0);
                            setAnswerDismissed(null);
                          }}
                          onKeyDown={(e) =>
                            suggestKeys(
                              e,
                              answerSuggestions,
                              answerActive,
                              setAnswerActive,
                              applyAnswer,
                              () => setAnswerDismissed(answerSuggest.partial),
                            )
                          }
                          rows={11}
                          placeholder={t("answersPlaceholder")}
                          className="field min-h-[11rem] font-ui leading-relaxed"
                          autoComplete="off"
                        />
                        <SuggestionList
                          id="answer-suggestions"
                          items={answerSuggestions}
                          active={answerActive}
                          label={t("suggestAria")}
                          onPick={applyAnswer}
                          onHover={setAnswerActive}
                        />
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/8" aria-hidden="true">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${
                            live.truncated ? "bg-rust" : "bg-slate"
                          }`}
                          style={{ width: `${Math.max(filled * 100, live.answers.length ? 3 : 0)}%` }}
                        />
                      </div>
                      <p id="answers-hint" className="mt-2 text-xs leading-relaxed text-ink/55">
                        {t("answersHint")}
                      </p>
                      {live.truncated && (
                        <p className="mt-1 text-xs text-rust">
                          {t("capNotice", { n: MAX_ANSWERS })}
                        </p>
                      )}
                      {live.duplicates > 0 && (
                        <p className="mt-1 text-xs text-ink/50">
                          {t(live.duplicates === 1 ? "dupNoticeOne" : "dupNotice", { n: live.duplicates })}
                        </p>
                      )}
                    </div>

                    {showPrivacyWarning && (
                      <div className="rounded-lg border border-ochre/50 bg-ochre/10 p-3.5 text-xs animate-fade-in">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium text-ink/85">
                            <span aria-hidden="true">⚠ </span>
                            {describeScanLocalised(privacy, t)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setPrivacyDismissedFor(live.answers.length)}
                            className="shrink-0 text-ink/40 hover:text-ink"
                            aria-label={t("privacyDismiss")}
                          >
                            ✕
                          </button>
                        </div>
                        {privacy.findings.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {privacy.findings.map((f) => (
                              <li
                                key={`${f.kind}-${f.sample}`}
                                className="rounded border border-ink/15 bg-card/70 px-1.5 py-0.5 font-mono text-[0.65rem] text-ink/60"
                              >
                                {f.sample}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="mt-2 leading-relaxed text-ink/55">
                          {t("privacyNote")}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 border-t border-ink/10 pt-4">
                      <button type="button" onClick={analyze} disabled={loading} className="btn btn-primary">
                        {loading ? t("readingCount", { n: live.answers.length }) : t("map")}
                        <span aria-hidden="true">→</span>
                      </button>
                      <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline">
                        {t("uploadBtn")}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".txt,.csv,text/plain,text/csv"
                        className="hidden"
                        aria-label={t("uploadAria")}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onFile(f);
                          e.target.value = "";
                        }}
                      />
                      {text && (
                        <button
                          type="button"
                          onClick={() => {
                            setText("");
                            setQuestion("");
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          {t("clearInput")}
                        </button>
                      )}
                      <span className="ml-auto hidden text-[0.7rem] text-ink/40 sm:inline">
                        <kbd className="rounded border border-ink/20 bg-card px-1 py-0.5 font-ui text-[0.65rem]">⌘</kbd>
                        {" + "}
                        <kbd className="rounded border border-ink/20 bg-card px-1 py-0.5 font-ui text-[0.65rem]">↵</kbd>{" "}
                        {t("hintToMap")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* right rail */}
                <div className="space-y-4">
                  <div className="card overflow-hidden" data-tour="examples">
                    <div className="border-b border-ink/10 bg-card-deep/40 px-4 py-3">
                      <h2 className="font-display text-base font-semibold">{t("exampleTitle")}</h2>
                      <p className="mt-0.5 text-xs text-ink/50">{t("exampleSub")}</p>
                    </div>
                    <ul className="scroll-mt-24 divide-y divide-ink/8" id="examples">
                      {EXAMPLES.map((ex) => (
                        <li key={ex.id}>
                          <button
                            type="button"
                            onClick={() => loadExample(ex.id)}
                            className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-ink/[0.03]"
                          >
                            <span className="min-w-0">
                              <span className="block text-[0.7rem] uppercase tracking-[0.1em] text-ink/40">
                                <T k={EXAMPLE_COPY[ex.id].subject as never} />
                              </span>
                              <span className="mt-0.5 block truncate text-sm font-medium">
                                <T k={EXAMPLE_COPY[ex.id].name as never} />
                              </span>
                              <span className="mt-0.5 block text-xs text-ink/45">
                                {t("reportAnswers", { n: ex.answers.length })}
                              </span>
                            </span>
                            <span
                              aria-hidden="true"
                              className="shrink-0 text-ink/25 transition-transform group-hover:translate-x-0.5 group-hover:text-rust"
                            >
                              →
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {history.length > 0 && (
                    <div className="card overflow-hidden" data-tour="history">
                      <div className="flex items-center justify-between border-b border-ink/10 bg-card-deep/40 px-4 py-3">
                        <h2 className="font-display text-base font-semibold">{t("recentTitle")}</h2>
                        <button
                          type="button"
                          className="text-xs text-rust underline underline-offset-2"
                          onClick={() => {
                            if (confirm(t("deleteAllConfirm"))) persist([]);
                          }}
                        >
                          {t("deleteAll")}
                        </button>
                      </div>
                      <div className="relative border-b border-ink/10 px-3 py-2">
                        <label htmlFor="history-search" className="sr-only">
                          {t("historySearchLabel")}
                        </label>
                        <div className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 shrink-0 text-ink/35"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <circle cx="11" cy="11" r="6.5" />
                            <path d="m16 16 4 4" strokeLinecap="round" />
                          </svg>
                          <input
                            id="history-search"
                            type="search"
                            value={historyQuery}
                            onChange={(e) => {
                              setHistoryQuery(e.target.value);
                              setHistorySearchOpen(true);
                              setHistorySearchActive(0);
                            }}
                            onFocus={() => setHistorySearchOpen(true)}
                            onBlur={() => setHistorySearchOpen(false)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setHistoryQuery("");
                                setHistorySearchOpen(false);
                                return;
                              }
                              suggestKeys(
                                e,
                                historySuggestions,
                                historySearchActive,
                                setHistorySearchActive,
                                (value) => {
                                  setHistoryQuery(value);
                                  setHistorySearchOpen(false);
                                },
                                () => setHistorySearchOpen(false),
                              );
                            }}
                            placeholder={t("historySearchPlaceholder")}
                            aria-label={t("historySearchAria")}
                            role="combobox"
                            aria-expanded={historySuggestions.length > 0}
                            aria-controls="history-suggestions"
                            aria-autocomplete="list"
                            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs text-ink/80 outline-none placeholder:text-ink/35"
                          />
                          {historyQuery && (
                            <button
                              type="button"
                              onClick={() => setHistoryQuery("")}
                              className="shrink-0 text-[0.65rem] text-ink/40 hover:text-ink"
                            >
                              {t("historyClear")}
                            </button>
                          )}
                        </div>
                        <SuggestionList
                          id="history-suggestions"
                          items={historySuggestions}
                          active={historySearchActive}
                          label={t("historySearchAria")}
                          onPick={(value) => {
                            setHistoryQuery(value);
                            setHistorySearchOpen(false);
                          }}
                          onHover={setHistorySearchActive}
                        />
                      </div>
                      {historyQuery && (
                        <p className="border-b border-ink/8 px-4 py-1.5 text-[0.65rem] text-ink/45">
                          {t("historyCount", { n: visibleHistory.length, total: history.length })}
                        </p>
                      )}
                      <ul className="divide-y divide-ink/8">
                        {visibleHistory.map((h) => (
                          <li key={h.id} className="group flex items-center gap-2 px-4 py-2.5">
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left text-sm"
                              onClick={() => {
                                setResult(normalizeAnalysis(h.result));
                                setSelected(0);
                                setIsSample(null);
                                setNotice(t("restoredNotice"));
                              }}
                            >
                              <span className="block truncate text-ink/85">
                                {h.question ? `“${h.question}”` : t("untitledQuestion")}
                              </span>
                              <span className="mt-0.5 block text-xs text-ink/45">
                                {t("reportBeliefs", { n: h.result.clusters.length })} ·{" "}
                                {t("reportAnswers", { n: h.total })} · {t.date(h.at)}
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-label={t("deleteOneAria")}
                              className="shrink-0 rounded p-1 text-ink/30 transition-colors hover:text-rust"
                              onClick={() => persist(history.filter((x) => x.id !== h.id))}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                        {visibleHistory.length === 0 && (
                          <li className="px-4 py-3 text-xs text-ink/50">
                            {t("historyNoMatch", { q: historyQuery })}
                          </li>
                        )}
                      </ul>
                      <p className="border-t border-ink/10 px-4 py-2.5 text-[0.7rem] leading-relaxed text-ink/45">
                        {t("historyNote").split("{link}")[0]}
                        <Link href="/settings" className="underline underline-offset-2 hover:text-ink">
                          {t("settings")}
                        </Link>
                        {t("historyNote").split("{link}")[1]}
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border border-dashed border-ink/20 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/70">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M12 3.5 4.5 7v5.4c0 4.2 3 7.2 7.5 8.1 4.5-.9 7.5-3.9 7.5-8.1V7L12 3.5Z" strokeLinejoin="round" />
                      </svg>
                      {t("removeNamesTitle")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/50">{t("removeNamesBody")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────────────── results */}
        {result && (
          <div ref={resultsRef} tabIndex={-1} className="focus:outline-none">
            {(error || notice) && (
              <div className="no-print mb-5 space-y-2">
                {error && (
                  <div role="alert" className="rounded-lg border border-rust/40 bg-rust/8 px-4 py-3 text-sm text-rust">
                    {error}
                  </div>
                )}
                {notice && !error && (
                  <div role="status" className="rounded-lg border border-ochre/45 bg-ochre/10 px-4 py-3 text-sm text-ink/75">
                    {notice}
                  </div>
                )}
              </div>
            )}

            {/* result toolbar */}
            <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <nav aria-label={t("breadcrumbHome")} className="mb-2 flex items-center gap-1.5 text-xs text-ink/45">
                  <Link href="/" className="transition-colors hover:text-ink">
                    {t("breadcrumbHome")}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="text-ink/70">{t("breadcrumbReport")}</span>
                </nav>
                <h1 className="text-[clamp(1.6rem,3.4vw,2.25rem)]">
                  {result.question ? <span className="italic">“{result.question}”</span> : t("yourClass")}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink/60">
                  <span className="tabular-nums">
                    {t("reportAnswers", { n: total })}
                  </span>
                  <span aria-hidden="true" className="text-ink/25">·</span>
                  <span className="tabular-nums">
                    {t("reportBeliefs", { n: result.clusters.length })}
                  </span>
                  <span aria-hidden="true" className="text-ink/25">·</span>
                  <span className="tabular-nums">
                    {t("reportHigh", { n: highCount })}
                  </span>
                  <span className="chip border-ink/15 bg-card/70 text-ink/55" title={sourceHint}>
                    {isSample ? t("sourceExample") : sourceLabel}
                  </span>
                  <span
                    className="chip border-slate/30 bg-slate/8 text-slate"
                    title={t("reportLangHint")}
                  >
                    {t("reportLangLabel", { lang: LOCALE_NAMES[locale] })}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={startOver} className="btn btn-primary">
                  {t("newMap")}
                </button>
                <button
                  type="button"
                  onClick={() => startTour("report")}
                  className="btn btn-ghost btn-sm self-center"
                >
                  {t("tourBtn")}
                </button>
                <Link href="/settings" className="btn btn-outline" data-tour="settings-link">
                  {t("settings")}
                </Link>
              </div>
            </div>

            {isSample && (
              <p className="no-print mb-5 rounded-lg border border-slate/30 bg-slate/8 px-4 py-2.5 text-xs text-ink/65">
                {t("exampleBanner")}
              </p>
            )}

            {/* Risk mix: one glance at how the class is distributed. */}
            <div className="no-print card mb-5 px-4 py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="eyebrow">{t("riskMix")}</p>
                <p className="text-[0.7rem] text-ink/40">{t("riskMixSub", { n: total })}</p>
              </div>
              <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-ink/8" aria-hidden="true">
                {result.clusters.map((c, i) => {
                  const width = total ? (c.count / total) * 100 : 0;
                  const color = c.risk === "high" ? "bg-rust" : c.risk === "med" ? "bg-ochre" : "bg-slate";
                  return (
                    <span
                      key={`mix-${c.plain_name}-${i}`}
                      className={`h-full ${color}`}
                      style={{ width: `${width}%` }}
                      title={`${c.plain_name} — ${c.count} ${t("of")} ${total}`}
                    />
                  );
                })}
                {result.unsure.length > 0 && (
                  <span
                    className="h-full bg-ink/25"
                    style={{ width: `${(result.unsure.length / Math.max(total, 1)) * 100}%` }}
                    title={t("notSureOfTotal", { n: result.unsure.length, total })}
                  />
                )}
              </div>
              <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-ink/55">
                <li className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rust" aria-hidden="true" /> {t("reportHigh", { n: highCount })}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-ochre" aria-hidden="true" />
                  {t("reportMed", { n: result.clusters.filter((c) => c.risk === "med").length })}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate" aria-hidden="true" />
                  {t("reportLow", { n: result.clusters.filter((c) => c.risk === "low").length })}
                </li>
                {result.unsure.length > 0 && (
                  <li className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-ink/25" aria-hidden="true" /> {t("reportUnsure", { n: result.unsure.length })}
                  </li>
                )}
              </ul>
            </div>

            {comparison && (
              <div className="no-print card mb-5 px-4 py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="eyebrow">{t("sinceLastTitle")}</p>
                  <p className="text-[0.7rem] text-ink/40">
                    {t("sinceLastSub", { date: t.date(comparison.previousAt), n: comparison.previousTotal })}
                  </p>
                </div>
                {comparison.changed ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {comparison.deltas.slice(0, 4).map((d) => (
                      <li
                        key={d.plainName}
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                          d.change < 0
                            ? "border-moss/45 bg-moss/10 text-moss"
                            : "border-rust/40 bg-rust/8 text-rust"
                        }`}
                        title={`${d.before} of ${comparison.previousTotal} → ${d.after}`}
                      >
                        <span aria-hidden="true">{d.change < 0 ? "▼" : "▲"}</span>
                        <span className="max-w-[14rem] truncate">{d.plainName}</span>
                        <span className="tabular-nums font-medium">
                          {d.change > 0 ? "+" : ""}
                          {d.change}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1.5 text-sm text-ink/60">
                    {t("sinceNone")}
                  </p>
                )}
                <p className="sr-only">{describeComparisonLocalised(comparison, t)}</p>
                <p className="mt-2 text-[0.7rem] leading-relaxed text-ink/45">
                  {t("sinceNote")}
                </p>
              </div>
            )}

            {topRisk && (
              <div className="no-print mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-rust/30 bg-rust/[0.06] px-5 py-4">
                <span className="chip border-rust/40 bg-rust/12 text-rust">{t("startHere")}</span>
                <p className="text-sm leading-relaxed text-ink/80">
                  {t("startHereBody", {
                    name: topRisk.plain_name,
                    count: topRisk.count,
                    total,
                    title: topRisk.reteach.title,
                    minutes: topRisk.reteach.minutes,
                  })}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(result.clusters.indexOf(topRisk))}
                  className="btn btn-sm btn-outline ml-auto"
                >
                  {t("showThisBand")}
                </button>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-start">
              <div className="space-y-5">
                <div data-tour="map">
                  <StrataMap
                  result={result}
                  selected={selected}
                  onSelect={setSelected}
                  unsureOpen={unsureOpen}
                    onShowUnsure={() => setUnsureOpen((v) => !v)}
                  />
                </div>
                <p className="no-print text-[0.7rem] text-ink/40">
                  <T
                    k="keyboardHint"
                    vars={{
                      j: <kbd className="rounded border border-ink/20 bg-card px-1 font-ui text-[0.65rem]">j</kbd>,
                      k: <kbd className="rounded border border-ink/20 bg-card px-1 font-ui text-[0.65rem]">k</kbd>,
                    }}
                  />
                </p>

                {unsureOpen && result.unsure.length > 0 && (
                  <section className="card animate-fade-up p-5" aria-label={t("unsureTitle")}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-lg">
                        {t("unsureTitle")} <span className="text-ink/40">({result.unsure.length})</span>
                      </h2>
                      <button type="button" onClick={() => setUnsureOpen(false)} className="btn btn-ghost btn-sm no-print">
                        {t("close")}
                      </button>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                      {t("unsureBody")}
                    </p>
                    <ul className="mt-4 divide-y divide-ink/8">
                      {result.unsure.map((u, i) => (
                        <li key={i} className="py-2.5">
                          <p className="font-display text-sm italic text-ink/80">“{u.answer}”</p>
                          <p className="mt-0.5 text-xs text-ink/45">{u.why}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <div data-tour="export">
                  <ExportBar result={result} />
                </div>

                <div className="no-print flex flex-wrap items-center gap-4 text-sm">
                  <button type="button" onClick={startOver} className="text-ink/55 underline underline-offset-2 hover:text-ink">
                    {t("startOver")}
                  </button>
                  <Link href="/play" className="text-ink/55 underline underline-offset-2 hover:text-ink">
                    {t("drillingBreak")}
                  </Link>
                  <span className="ml-auto text-xs text-ink/35" title={sourceHint}>
                    {sourceHint}
                  </span>
                </div>
              </div>

              <div className="no-print lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-1">
                {selectedCluster && (
                  <div data-tour="detail">
                    <BandDetail
                    cluster={selectedCluster}
                    total={total}
                    position={t("beliefPosition", { n: selected + 1, total: result.clusters.length })}
                    onPrev={selected > 0 ? () => setSelected(selected - 1) : undefined}
                    onNext={
                      selected < result.clusters.length - 1 ? () => setSelected(selected + 1) : undefined
                    }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Print-only: every band, so the printed page is the full one-page plan */}
            <div className="hidden print:block space-y-4">
              {result.clusters.map((c, i) => (
                <BandDetail key={i} cluster={c} total={total} />
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
