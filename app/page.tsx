"use client";
import { useState } from "react";
import StrataMap from "@/components/StrataMap";
import type { AnalysisResult } from "@/lib/schema";
import exampleResult from "@/data/example-result.json";
import exampleAnswers from "@/data/example-answers.json";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [mode, setMode] = useState<"sample" | null>(null);

  async function analyze(input?: string) {
    const answers = (input ?? text).split("\n").map((s) => s.trim()).filter(Boolean);
    if (answers.length === 0) {
      setError("Paste at least one answer, one per line.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data);
      setSelected(0);
    } catch {
      setError("Something went wrong. Showing the example classroom instead.");
      setResult(exampleResult as AnalysisResult);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }

  function loadExample() {
    setText(exampleAnswers.answers.join("\n"));
    setResult(exampleResult as AnalysisResult);
    setSelected(0);
    setMode("sample");
  }

  const selectedCluster = result && selected !== null ? result.clusters[selected] : null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-5xl text-ink">Fault Lines</h1>
        <p className="text-ink/70 mt-2">
          See what your class actually misunderstands. For teachers marking written answers.
        </p>
      </header>

      {!result && (
        <section className="space-y-4">
          <p className="text-sm text-ink/60">
            Paste your class&apos;s answers to one question, one per line. Remove student names first.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full border border-ink/20 bg-white rounded-md p-3 font-ui text-sm"
            placeholder="Paste answers, one per line…"
          />
          {error && <p className="text-rust text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => analyze()}
              disabled={loading}
              className="px-5 py-2 bg-ink text-paper rounded-md font-ui"
            >
              {loading ? "Reading answers…" : "Map my class"}
            </button>
            <button
              onClick={loadExample}
              className="px-5 py-2 border border-ink/30 rounded-md font-ui"
            >
              Load example classroom
            </button>
          </div>
          {loading && <p className="text-sm text-ink/60">Reading {text.split("\n").filter(Boolean).length} answers…</p>}
        </section>
      )}

      {result && (
        <section className="space-y-6">
          {mode === "sample" && (
            <p className="text-xs text-ink/50 italic">Sample classroom (illustrative data).</p>
          )}
          <StrataMap result={result} selected={selected} onSelect={setSelected} />
          {selectedCluster && (
            <div className="border border-ink/15 rounded-md p-5 space-y-3">
              <h2 className="font-display text-2xl">{selectedCluster.plain_name}</h2>
              <p className="text-sm text-ink/70">{selectedCluster.why_it_matters}</p>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Student quotes</p>
                {selectedCluster.quotes.map((q, i) => (
                  <blockquote key={i} className="italic text-sm border-l-2 border-rust pl-3 my-1">
                    “{q}”
                  </blockquote>
                ))}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
                  Reteach · {selectedCluster.reteach.minutes} min
                </p>
                <p className="font-display text-lg">{selectedCluster.reteach.title}</p>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  {selectedCluster.reteach.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <p className="text-sm mt-2">
                  <span className="text-ink/50">Check question:</span> {selectedCluster.reteach.check_question}
                </p>
                <p className="text-sm">
                  <span className="text-ink/50">Follow-up diagnostic:</span> {selectedCluster.diagnostic_question}
                </p>
              </div>
              <button
                onClick={() => {
                  const plan = `${result.clusters.length} beliefs\n` + result.clusters
                    .map((c) => `${c.count} — ${c.plain_name}\n  ${c.reteach.title} (${c.reteach.minutes} min)\n  ${c.reteach.steps.join("; ")}\n  Check: ${c.reteach.check_question}\n  Diagnostic: ${c.diagnostic_question}`)
                    .join("\n");
                  navigator.clipboard.writeText(plan);
                }}
                className="px-4 py-2 bg-rust text-paper rounded-md text-sm"
              >
                Export plan
              </button>
            </div>
          )}
          <button
            onClick={() => { setResult(null); setMode(null); }}
            className="text-sm text-ink/60 underline"
          >
            Start over
          </button>
        </section>
      )}
    </main>
  );
}
