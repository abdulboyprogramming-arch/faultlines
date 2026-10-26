"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import StrataMap from "@/components/StrataMap";
import BandDetail from "@/components/BandDetail";
import ExportBar from "@/components/ExportBar";
import SiteHeader from "@/components/SiteHeader";
import { MAX_ANSWERS, type AnalysisResult } from "@/lib/schema";
import { normalizeAnalysis, resultTotal } from "@/lib/validate";
import { MockProvider } from "@/lib/llm/mock";
import { EXAMPLES } from "@/data/examples";
import { answersFromCsv, looksLikeCsv, parseLines, prepareAnswers } from "@/lib/parse-input";
import { decodeShare } from "@/lib/share";
import { entryFor, loadHistory, saveHistory, type HistoryEntry } from "@/lib/history";
import { t } from "@/lib/i18n";

export default function Tool() {
  const [question, setQuestion] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<number>(0);
  const [unsureOpen, setUnsureOpen] = useState(false);
  const [isSample, setIsSample] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const live = useMemo(() => prepareAnswers(parseLines(text)), [text]);

  // One-time sync from an external system (the URL hash of a share link)
  // after hydration — doing this during render would cause a hydration
  // mismatch, since the server cannot see location.hash.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const shared = decodeShare(hash);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (shared) {
      setResult(normalizeAnalysis(shared));
      setSelected(0);
      setNotice("Viewing a shared report. Nothing was sent to a server to open it.");
    } else {
      setError("That share link doesn't contain a valid report.");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);


  function persist(next: HistoryEntry[]) {
    setHistory(next);
    saveHistory(next);
  }

  async function analyze() {
    if (live.answers.length === 0) {
      setError("Paste at least one answer, one per line — or load an example classroom below.");
      return;
    }
    setError(null);
    setNotice(live.truncated ? `Only the first ${MAX_ANSWERS} answers were analysed (calm cap, per design).` : null);
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
      // same heuristic in-browser, and SAY so. Network/server errors on a
      // real deployment still surface via the notice.
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
  }

  function finish(data: AnalysisResult, answers: string[]) {
    const clean = normalizeAnalysis(data, answers);
    setResult(clean);
    setSelected(0);
    setUnsureOpen(false);
    setIsSample(null);
    if (clean.meta?.degraded) {
      setNotice("The AI provider didn't respond, so this map uses the built-in heuristic instead. Quotes and counts are still exact.");
    }
    persist([entryFor(clean), ...history]);
  }

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
  }

  function onFile(file: File) {
    if (file.size > 1_000_000) { setError("That file is over 1 MB — paste the answers instead."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result);
      const answers = looksLikeCsv(content, file.name) ? answersFromCsv(content) : parseLines(content);
      if (answers.length === 0) { setError("No answers found in that file."); return; }
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
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
  }

  const total = result ? resultTotal(result) : 0;
  const selectedCluster = result?.clusters[selected] ?? null;
  const topRisk = result?.clusters.find((c) => c.risk === "high") ?? result?.clusters[0] ?? null;
  const sourceLabel =
    result?.meta?.source === "llm" ? "AI analysis" :
    result?.meta?.source === "example" ? "Cached example analysis" :
    result ? "Heuristic preview (grouped by wording similarity — configure an LLM for misconception judgement)" : "";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8 print:block">
          <h1 className="font-display text-5xl">Fault Lines</h1>
          <p className="text-ink/70 mt-2">{t("subtitle")}</p>
          {result?.question && <p className="text-sm text-ink/60 mt-1">Question: {result.question}</p>}
        </header>

        {error && (
          <div role="alert" className="mb-6 border border-rust bg-rust/10 rounded-md px-4 py-3 text-sm no-print">
            {error}
          </div>
        )}
        {notice && !error && (
          <div role="status" className="mb-6 border border-ochre bg-ochre/10 rounded-md px-4 py-3 text-sm no-print">
            {notice}
          </div>
        )}

        {!result && (
          <section className="space-y-4 no-print" aria-label="Paste answers">
            <div>
              <label htmlFor="question" className="block text-sm font-ui mb-1">{t("questionLabel")}</label>
              <input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={300}
                placeholder="e.g. Why do we have seasons?"
                className="w-full border border-ink/20 bg-white dark:bg-white/5 rounded-md p-3 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-rust"
              />
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
              className={dragging ? "rounded-md outline-2 outline-dashed outline-rust" : ""}
            >
              <label htmlFor="answers" className="block text-sm font-ui mb-1">{t("answersLabel")}</label>
              <p id="answers-hint" className="text-xs text-ink/60 mb-2">
                {t("paste")} Answers are analysed and never stored on a server. You can also drop a .txt/.csv file here.
              </p>
              <textarea
                id="answers"
                aria-describedby="answers-hint answers-count"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={"Paste answers, one per line…\nBecause the earth moves nearer to the sun in June\nThe earth tilts on its axis…"}
                className="w-full border border-ink/20 bg-white dark:bg-white/5 rounded-md p-3 font-ui text-sm focus:outline-none focus:ring-2 focus:ring-rust"
              />
            </div>
            <div id="answers-count" className="text-xs text-ink/60 flex flex-wrap gap-x-4 gap-y-1" aria-live="polite">
              <span>{live.answers.length} of max {MAX_ANSWERS} answers</span>
              {live.truncated && <span className="text-rust">Over the cap — only the first {MAX_ANSWERS} will be analysed.</span>}
              {live.duplicates > 0 && <span>{live.duplicates} duplicate answer{live.duplicates === 1 ? "" : "s"} detected (kept — duplicates are evidence too).</span>}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={analyze} disabled={loading} className="px-5 py-2 bg-ink text-paper rounded-md font-ui disabled:opacity-60 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust">
                {loading ? `${t("reading")} ${live.answers.length} ${t("answers")}…` : t("map")}
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="px-5 py-2 border border-ink/30 rounded-md font-ui hover:bg-ink/5">
                Upload .txt / .csv
              </button>
              <input ref={fileRef} type="file" accept=".txt,.csv,text/plain,text/csv" className="hidden" aria-label="Upload answers file"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
              {text && (
                <button type="button" onClick={() => { setText(""); setQuestion(""); }} className="text-sm text-ink/60 underline">{t("clear")}</button>
              )}
              <span className="text-xs text-ink/50" role="status">{loading ? "Grouping answers by belief — no fake spinner, just waiting on the analysis." : ""}</span>
            </div>

            <div className="pt-4 border-t border-ink/10">
              <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">{t("example")} — no typing needed</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button key={ex.id} type="button" onClick={() => loadExample(ex.id)} className="px-4 py-2 border border-ink/30 rounded-md font-ui text-sm hover:bg-ink/5 text-left">
                    {ex.name} <span className="block text-xs text-ink/50">{ex.subject} · {ex.answers.length} answers</span>
                  </button>
                ))}
              </div>
            </div>

            {history.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wide text-ink/50">{t("recent")}</p>
                  <button type="button" className="text-xs text-rust underline" onClick={() => { if (confirm("Delete all locally saved reports?")) persist([]); }}>
                    Delete all
                  </button>
                </div>
                <ul className="space-y-1">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center gap-3 text-sm">
                      <button type="button" className="text-ink/80 underline text-left"
                        onClick={() => { setResult(normalizeAnalysis(h.result)); setSelected(0); setIsSample(null); setNotice("Restored from this browser's local history."); }}>
                        {h.question ? `“${h.question}” — ` : ""}{h.result.clusters.length} {t("beliefs")} · {h.total} {t("answers")}
                        <span className="text-ink/50"> · {new Date(h.at).toLocaleString()}</span>
                      </button>
                      <button type="button" aria-label="Delete this report" className="text-ink/40 hover:text-rust" onClick={() => persist(history.filter((x) => x.id !== h.id))}>×</button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-ink/50 mt-1">History lives only in this browser. On a shared computer, delete it when you&apos;re done (Settings → Clear local data does everything at once).</p>
              </div>
            )}
          </section>
        )}

        {result && (
          <section className="space-y-6" aria-label="Results">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-2xl">{total} answers · 1 question · {result.clusters.length} beliefs</p>
              <p className="text-xs text-ink/50">{isSample ? `Example classroom: ${isSample} (illustrative data)` : sourceLabel}</p>
            </div>

            {topRisk && (
              <p className="border border-rust/50 bg-rust/5 rounded-md px-4 py-3 text-sm">
                <strong>Start here:</strong> “{topRisk.plain_name}” — {topRisk.count} of {total} students, {topRisk.risk} risk.{" "}
                Reteach first: <em>{topRisk.reteach.title}</em> ({topRisk.reteach.minutes} min).
              </p>
            )}

            <StrataMap result={result} selected={selected} onSelect={setSelected} unsureOpen={unsureOpen} onShowUnsure={() => setUnsureOpen((v) => !v)} />

            {unsureOpen && result.unsure.length > 0 && (
              <div className="border border-ink/15 rounded-md p-5" aria-label={t("unsure")}>
                <h2 className="font-display text-xl">{t("unsure")} ({result.unsure.length})</h2>
                <p className="text-sm text-ink/60 mt-1">These answers weren&apos;t turned into a belief — on purpose. Inventing a misconception would be worse than showing you the raw answers:</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {result.unsure.map((u, i) => (
                    <li key={i} className="border-l-2 border-ink/20 pl-3">
                      <span className="italic">“{u.answer}”</span> <span className="text-ink/50">— {u.why}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCluster && <div className="print:hidden"><BandDetail cluster={selectedCluster} total={total} /></div>}

            {/* Print-only: every band, so the printed page is the full one-page plan */}
            <div className="hidden print:block space-y-4">
              {result.clusters.map((c, i) => <BandDetail key={i} cluster={c} total={total} />)}
            </div>

            <ExportBar result={result} />

            <div className="flex gap-4 no-print">
              <button type="button" onClick={startOver} className="text-sm text-ink/60 underline">{t("startOver")}</button>
              <Link href="/settings" className="text-sm text-ink/60 underline">{t("settings")}</Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
