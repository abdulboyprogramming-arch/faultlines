"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import StrataMap from "@/components/StrataMap";
import BandDetail from "@/components/BandDetail";
import ExportBar from "@/components/ExportBar";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StrataLoader from "@/components/StrataLoader";
import { MAX_ANSWERS, type AnalysisResult } from "@/lib/schema";
import { normalizeAnalysis, resultTotal } from "@/lib/validate";
import { MockProvider } from "@/lib/llm/mock";
import { EXAMPLES } from "@/data/examples";
import { answersFromCsv, looksLikeCsv, parseLines, prepareAnswers } from "@/lib/parse-input";
import { decodeAnswersPayload, decodeShare } from "@/lib/share";
import { entryFor, HISTORY_KEY, loadHistory, saveHistory } from "@/lib/history";
import { useT } from "@/lib/use-i18n";
import { useStoredString } from "@/lib/use-local-store";
import { describeScan, scanForPersonalData } from "@/lib/privacy";
import { compareRuns, describeComparison } from "@/lib/compare";

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
        setNotice(`${payload.answers.length} answers received — check names are removed, then map your class.`);
      } else {
        setError("That incoming link didn't contain usable answers.");
      }
      return;
    }
    const shared = decodeShare(hash);
    if (shared) {
      setResult(normalizeAnalysis(shared));
      setSelected(0);
      setNotice("Viewing a shared report. Nothing was sent to a server to open it.");
    } else if (hash.length > 40) {
      // Long enough to be a report payload, but it did not validate.
      setError("That share link doesn't contain a valid report.");
    }
    // Short hashes are just in-page anchors (#examples) — leave them alone.
    /* eslint-enable react-hooks/set-state-in-effect */
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
        `Map ready. ${resultTotal(clean)} answers sorted into ${clean.clusters.length} beliefs` +
          (clean.unsure.length ? `, ${clean.unsure.length} unclassified.` : "."),
      );
      if (clean.meta?.degraded) {
        setNotice("The AI provider didn't respond, so this map uses the built-in heuristic instead. Quotes and counts are still exact.");
      }
      const entry = entryFor(clean);
      setLastSavedId(entry.id);
      saveHistory([entry, ...loadHistory()].slice(0, 8));
    },
    [],
  );

  const analyze = useCallback(async () => {
    if (live.answers.length === 0) {
      setError("Paste at least one answer, one per line — or load an example classroom instead.");
      return;
    }
    setError(null);
    setNotice(live.truncated ? `Only the first ${MAX_ANSWERS} answers were analysed (calm cap, by design).` : null);
    setLoading(true);
    const payload = { answers: live.answers, question: question.trim() || undefined };
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
    } catch (err) {
      // Static deploy fallback (e.g. GitHub Pages has no API route): run the
      // same heuristic in-browser, and SAY so.
      try {
        const data = await new MockProvider().analyze(live.answers, { question: payload.question });
        setNotice("The analysis service was unreachable, so this map was produced in your browser with the built-in heuristic.");
        finish(data, live.answers);
      } catch {
        setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [live, question, finish]);

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
    setAnnouncement(
      `Example loaded. ${resultTotal(normalized)} answers sorted into ${normalized.clusters.length} beliefs.`,
    );
  }

  function onFile(file: File) {
    if (file.size > 1_000_000) {
      setError("That file is over 1 MB — paste the answers instead.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result);
      const answers = looksLikeCsv(content, file.name) ? answersFromCsv(content) : parseLines(content);
      if (answers.length === 0) {
        setError("No answers found in that file.");
        return;
      }
      setText(answers.join("\n"));
      setError(null);
      setNotice(`Loaded ${answers.length} answers from ${file.name}. Check names are removed before mapping.`);
    };
    reader.onerror = () => setError("Couldn't read that file.");
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
      ? "AI analysis"
      : result?.meta?.source === "example"
        ? "Cached example analysis"
        : "Heuristic preview";
  const sourceHint =
    result && result.meta?.source !== "llm" && result.meta?.source !== "example"
      ? "Grouped by wording similarity — configure an LLM for misconception judgement"
      : isSample
        ? `${isSample} · illustrative data`
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
              <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink/45">
                <Link href="/" className="transition-colors hover:text-ink">Home</Link>
                <span aria-hidden="true">/</span>
                <span className="text-ink/70">{t("map")}</span>
              </nav>
              <h1 className="text-[clamp(2rem,4.5vw,3rem)]">Map a class</h1>
              <p className="mt-2 max-w-xl leading-relaxed text-ink/65">{t("subtitle")}</p>
            </header>

            {(error || notice) && (
              <div className="mb-6 space-y-2">
                {error && (
                  <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-rust/40 bg-rust/8 px-4 py-3 text-sm">
                    <span className="text-rust">{error}</span>
                    <button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="shrink-0 text-rust/60 hover:text-rust">✕</button>
                  </div>
                )}
                {notice && !error && (
                  <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-ochre/45 bg-ochre/10 px-4 py-3 text-sm text-ink/75">
                    <span>{notice}</span>
                    <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="shrink-0 text-ink/40 hover:text-ink">✕</button>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="mb-6 py-10 animate-fade-in">
                <StrataLoader label={`${t("reading")} ${live.answers.length} ${t("answers")}…`} />
              </div>
            )}

            {!loading && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
                {/* input card */}
                <div className="card overflow-hidden animate-fade-up">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 bg-card-deep/40 px-5 py-3">
                    <h2 className="font-display text-base font-semibold">Your class</h2>
                    <span className="text-[0.7rem] uppercase tracking-[0.1em] text-ink/40">
                      Step 1 of 2 · paste
                    </span>
                  </div>

                  <div className="space-y-5 p-5">
                    <div>
                      <label htmlFor="question" className="mb-1.5 block text-sm font-medium">
                        {t("questionLabel")}
                      </label>
                      <input
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        maxLength={300}
                        placeholder="e.g. Why do we have seasons?"
                        className="field"
                        list="question-presets"
                        aria-describedby="question-hint"
                      />
                      <datalist id="question-presets">
                        {questionPresets.map((q) => (
                          <option key={q} value={q} />
                        ))}
                      </datalist>
                      <p id="question-hint" className="mt-1.5 text-xs text-ink/45">
                        Optional — but naming the question sharpens the reteach wording and diagnostic.
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
                        className={`rounded-lg transition-shadow ${
                          dragging ? "ring-2 ring-rust ring-offset-2 ring-offset-paper" : ""
                        }`}
                      >
                        <textarea
                          id="answers"
                          aria-describedby="answers-hint"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          rows={11}
                          placeholder={"Paste answers, one per line…\nBecause the earth moves nearer to the sun in June\nThe earth tilts on its axis…"}
                          className="field min-h-[11rem] font-ui leading-relaxed"
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
                        {t("paste")} Answers are analysed and never stored on a server. You can also drop a{" "}
                        <abbr title="plain text">.txt</abbr> or{" "}
                        <abbr title="comma separated values">.csv</abbr> file here.
                      </p>
                      {live.truncated && (
                        <p className="mt-1 text-xs text-rust">
                          Over the cap — only the first {MAX_ANSWERS} answers will be analysed.
                        </p>
                      )}
                      {live.duplicates > 0 && (
                        <p className="mt-1 text-xs text-ink/50">
                          {live.duplicates} duplicate answer{live.duplicates === 1 ? "" : "s"} detected — kept, because
                          duplicates are evidence too.
                        </p>
                      )}
                    </div>

                    {showPrivacyWarning && (
                      <div className="rounded-lg border border-ochre/50 bg-ochre/10 p-3.5 text-xs animate-fade-in">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium text-ink/85">
                            <span aria-hidden="true">⚠ </span>
                            {describeScan(privacy)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setPrivacyDismissedFor(live.answers.length)}
                            className="shrink-0 text-ink/40 hover:text-ink"
                            aria-label="Dismiss name warning"
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
                          Nothing is stored on a server, but quotes appear verbatim in the report, exports and
                          share links. Replace names with initials before mapping — this warning clears itself
                          when the answers change.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 border-t border-ink/10 pt-4">
                      <button type="button" onClick={analyze} disabled={loading} className="btn btn-primary">
                        {loading ? `${t("reading")} ${live.answers.length} ${t("answers")}…` : "Map my class"}
                        <span aria-hidden="true">→</span>
                      </button>
                      <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline">
                        {t("upload")}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".txt,.csv,text/plain,text/csv"
                        className="hidden"
                        aria-label="Upload answers file"
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
                          {t("clear")}
                        </button>
                      )}
                      <span className="ml-auto hidden text-[0.7rem] text-ink/40 sm:inline">
                        <kbd className="rounded border border-ink/20 bg-card px-1 py-0.5 font-ui text-[0.65rem]">⌘</kbd>
                        {" + "}
                        <kbd className="rounded border border-ink/20 bg-card px-1 py-0.5 font-ui text-[0.65rem]">↵</kbd>{" "}
                        to map
                      </span>
                    </div>
                  </div>
                </div>

                {/* right rail */}
                <div className="space-y-4">
                  <div className="card overflow-hidden">
                    <div className="border-b border-ink/10 bg-card-deep/40 px-4 py-3">
                      <h2 className="font-display text-base font-semibold">{t("example")}</h2>
                      <p className="mt-0.5 text-xs text-ink/50">No typing, no API key, works offline.</p>
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
                              <span className="block text-[0.7rem] uppercase tracking-[0.1em] text-ink/40">{ex.subject}</span>
                              <span className="mt-0.5 block truncate text-sm font-medium">{ex.name}</span>
                              <span className="mt-0.5 block text-xs text-ink/45">{ex.answers.length} answers</span>
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
                    <div className="card overflow-hidden">
                      <div className="flex items-center justify-between border-b border-ink/10 bg-card-deep/40 px-4 py-3">
                        <h2 className="font-display text-base font-semibold">{t("recent")}</h2>
                        <button
                          type="button"
                          className="text-xs text-rust underline underline-offset-2"
                          onClick={() => {
                            if (confirm("Delete all locally saved reports?")) persist([]);
                          }}
                        >
                          Delete all
                        </button>
                      </div>
                      <ul className="divide-y divide-ink/8">
                        {history.map((h) => (
                          <li key={h.id} className="group flex items-center gap-2 px-4 py-2.5">
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left text-sm"
                              onClick={() => {
                                setResult(normalizeAnalysis(h.result));
                                setSelected(0);
                                setIsSample(null);
                                setNotice("Restored from this browser's local history.");
                              }}
                            >
                              <span className="block truncate text-ink/85">
                                {h.question ? `“${h.question}”` : "Untitled question"}
                              </span>
                              <span className="mt-0.5 block text-xs text-ink/45">
                                {h.result.clusters.length} {t("beliefs")} · {h.total} {t("answers")} ·{" "}
                                {new Date(h.at).toLocaleDateString()}
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-label="Delete this report"
                              className="shrink-0 rounded p-1 text-ink/30 transition-colors hover:text-rust"
                              onClick={() => persist(history.filter((x) => x.id !== h.id))}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                      <p className="border-t border-ink/10 px-4 py-2.5 text-[0.7rem] leading-relaxed text-ink/45">
                        Stored in this browser only. Delete it on shared computers —{" "}
                        <Link href="/settings" className="underline underline-offset-2 hover:text-ink">
                          Settings
                        </Link>{" "}
                        clears everything at once.
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border border-dashed border-ink/20 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/70">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M12 3.5 4.5 7v5.4c0 4.2 3 7.2 7.5 8.1 4.5-.9 7.5-3.9 7.5-8.1V7L12 3.5Z" strokeLinejoin="round" />
                      </svg>
                      Remove student names
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/50">
                      Nothing is stored server-side, but quotes are shown verbatim — strip names before pasting, especially
                      if you plan to share or print the report.
                    </p>
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
                <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-ink/45">
                  <Link href="/" className="transition-colors hover:text-ink">Home</Link>
                  <span aria-hidden="true">/</span>
                  <span className="text-ink/70">Report</span>
                </nav>
                <h1 className="text-[clamp(1.6rem,3.4vw,2.25rem)]">
                  {result.question ? <span className="italic">“{result.question}”</span> : "Your class map"}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink/60">
                  <span className="tabular-nums">
                    <strong className="font-semibold text-ink">{total}</strong> answers
                  </span>
                  <span aria-hidden="true" className="text-ink/25">·</span>
                  <span className="tabular-nums">
                    <strong className="font-semibold text-ink">{result.clusters.length}</strong> beliefs
                  </span>
                  <span aria-hidden="true" className="text-ink/25">·</span>
                  <span className="tabular-nums">
                    <strong className="font-semibold text-ink">{highCount}</strong> high risk
                  </span>
                  <span className="chip border-ink/15 bg-card/70 text-ink/55" title={sourceHint}>
                    {isSample ? "Example" : sourceLabel}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={startOver} className="btn btn-primary">
                  New map
                </button>
                <Link href="/settings" className="btn btn-outline">
                  {t("settings")}
                </Link>
              </div>
            </div>

            {isSample && (
              <p className="no-print mb-5 rounded-lg border border-slate/30 bg-slate/8 px-4 py-2.5 text-xs text-ink/65">
                You&apos;re viewing an example classroom. Everything below is real output from a cached run — replace it
                with your own class whenever you&apos;re ready.
              </p>
            )}

            {/* Risk mix: one glance at how the class is distributed. */}
            <div className="no-print card mb-5 px-4 py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="eyebrow">Risk mix · share of class</p>
                <p className="text-[0.7rem] text-ink/40">
                  {total} answers · ordered high → low
                </p>
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
                      title={`${c.plain_name} — ${c.count} of ${total}`}
                    />
                  );
                })}
                {result.unsure.length > 0 && (
                  <span
                    className="h-full bg-ink/25"
                    style={{ width: `${(result.unsure.length / Math.max(total, 1)) * 100}%` }}
                    title={`Not sure — ${result.unsure.length} of ${total}`}
                  />
                )}
              </div>
              <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-ink/55">
                <li className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rust" aria-hidden="true" /> {highCount} high risk
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-ochre" aria-hidden="true" />
                  {result.clusters.filter((c) => c.risk === "med").length} medium
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate" aria-hidden="true" />
                  {result.clusters.filter((c) => c.risk === "low").length} low
                </li>
                {result.unsure.length > 0 && (
                  <li className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-ink/25" aria-hidden="true" /> {result.unsure.length} not sure
                  </li>
                )}
              </ul>
            </div>

            {comparison && (
              <div className="no-print card mb-5 px-4 py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="eyebrow">Since your last run of this question</p>
                  <p className="text-[0.7rem] text-ink/40">
                    {new Date(comparison.previousAt).toLocaleDateString()} · {comparison.previousTotal} answers then
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
                    No belief moved since last time — worth re-checking whether the reteach target was the right one.
                  </p>
                )}
                <p className="sr-only">{describeComparison(comparison)}</p>
                <p className="mt-2 text-[0.7rem] leading-relaxed text-ink/45">
                  Matched by belief name on the same question, from this browser&apos;s history. A shrinking band is
                  the signal that a reteach landed — falls here are good news.
                </p>
              </div>
            )}

            {topRisk && (
              <div className="no-print mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-rust/30 bg-rust/[0.06] px-5 py-4">
                <span className="chip border-rust/40 bg-rust/12 text-rust">{t("startHere")}</span>
                <p className="text-sm leading-relaxed text-ink/80">
                  <strong className="font-semibold">“{topRisk.plain_name}”</strong> — {topRisk.count} of {total} students.
                  Reteach first: <em>{topRisk.reteach.title}</em> ({topRisk.reteach.minutes} min).
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(result.clusters.indexOf(topRisk))}
                  className="btn btn-sm btn-outline ml-auto"
                >
                  Show this band
                </button>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-start">
              <div className="space-y-5">
                <StrataMap
                  result={result}
                  selected={selected}
                  onSelect={setSelected}
                  unsureOpen={unsureOpen}
                  onShowUnsure={() => setUnsureOpen((v) => !v)}
                />
                <p className="no-print text-[0.7rem] text-ink/40">
                  Press{" "}
                  <kbd className="rounded border border-ink/20 bg-card px-1 font-ui text-[0.65rem]">j</kbd>{" "}
                  <kbd className="rounded border border-ink/20 bg-card px-1 font-ui text-[0.65rem]">k</kbd>{" "}
                  to move between beliefs · every band is a button, so Tab works too.
                </p>

                {unsureOpen && result.unsure.length > 0 && (
                  <section className="card animate-fade-up p-5" aria-label={t("unsure")}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-lg">
                        {t("unsure")} <span className="text-ink/40">({result.unsure.length})</span>
                      </h2>
                      <button type="button" onClick={() => setUnsureOpen(false)} className="btn btn-ghost btn-sm no-print">
                        Close
                      </button>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                      These answers weren&apos;t turned into a belief — on purpose. Inventing a misconception would be
                      worse than showing you the raw answers.
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

                <ExportBar result={result} />

                <div className="no-print flex flex-wrap items-center gap-4 text-sm">
                  <button type="button" onClick={startOver} className="text-ink/55 underline underline-offset-2 hover:text-ink">
                    {t("startOver")}
                  </button>
                  <Link href="/play" className="text-ink/55 underline underline-offset-2 hover:text-ink">
                    Take a drilling break
                  </Link>
                  <span className="ml-auto text-xs text-ink/35" title={sourceHint}>
                    {sourceHint}
                  </span>
                </div>
              </div>

              <div className="no-print lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-1">
                {selectedCluster && (
                  <BandDetail
                    cluster={selectedCluster}
                    total={total}
                    position={`Belief ${selected + 1} of ${result.clusters.length}`}
                    onPrev={selected > 0 ? () => setSelected(selected - 1) : undefined}
                    onNext={
                      selected < result.clusters.length - 1 ? () => setSelected(selected + 1) : undefined
                    }
                  />
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
