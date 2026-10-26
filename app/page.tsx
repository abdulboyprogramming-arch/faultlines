import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Logo from "@/components/Logo";
import { EXAMPLES } from "@/data/examples";

const demo = EXAMPLES[0];
const demoTotal = demo.result.clusters.reduce((s, c) => s + c.count, 0) + demo.result.unsure.length;
const bandColor = { high: "bg-rust", med: "bg-ochre", low: "bg-slate" } as const;

const faqs = [
  { q: "Is my students' work stored anywhere?", a: "No. There are no accounts and no database. Answers are sent once to the analysis endpoint (or analysed in your browser) and are not saved server-side. Results you keep live only in your browser's local storage — remove student names before pasting, and clear local data on shared computers (Settings)." },
  { q: "Does it need an AI API key?", a: "No. Out of the box it runs a built-in heuristic that groups answers by similarity and the three cached example classrooms work with zero network. For true misconception judgement, a teacher/school can configure an OpenAI-compatible API key on the server (see README) — the key never reaches the browser." },
  { q: "Will it invent misconceptions?", a: "It's built not to. Quotes are always verbatim from your paste, counts always sum to your class size, and anything too vague to classify is shown separately as “Not sure — needs your eyes” rather than being assigned an invented belief." },
  { q: "Which subjects does it work for?", a: "Anything with short written answers: science explanations, maths methods, history causation, language comprehension. Try the three example classrooms (seasons, fractions, photosynthesis) to see the range." },
  { q: "What do I do with the result?", a: "Each belief comes with a ~5-minute reteach card and a follow-up diagnostic question. Copy the one-page plan, print it, or download Markdown/CSV/JSON for your department records." },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <section className="relative overflow-hidden px-6 py-20 text-center">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-rust/30 to-slate/30" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto">
          <Logo className="w-20 h-20 mx-auto" />
          <h1 className="font-display text-6xl md:text-7xl mt-4">Fault Lines</h1>
          <p className="mt-4 text-xl text-ink/70">Every class has fault lines. See them before the exam does.</p>
          <p className="mt-6 text-ink/60 max-w-2xl mx-auto">
            Paste your class&apos;s written answers to one question. In seconds, Fault Lines reveals the different
            ways your class is actually thinking, how many share each one, and which will cost them on the exam —
            with their own words as evidence and a five-minute reteach plan for each.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tool" className="px-8 py-3 bg-ink text-paper rounded-md font-ui text-lg hover:opacity-90">Map my class</Link>
            <Link href="/tool" className="px-8 py-3 border border-ink/30 rounded-md font-ui text-lg hover:bg-ink/5">Try an example classroom</Link>
          </div>
          <p className="mt-4 text-xs text-ink/50">No accounts · No stored student data · Works with no API key</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10" aria-label="Example output">
        <h2 className="font-display text-3xl text-center">28 messy answers → one map</h2>
        <p className="text-center text-ink/60 text-sm mt-2">Example: <em>“{demo.question}”</em></p>
        <div className="mt-6 border border-ink/10 rounded-md bg-white/40 dark:bg-white/5 p-5 space-y-2">
          {demo.result.clusters.map((c) => (
            <div key={c.plain_name} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_6rem_12rem] items-center gap-3 text-sm">
              <div className="h-3 bg-ink/5 rounded-sm overflow-hidden">
                <div className={`h-full ${bandColor[c.risk]}`} style={{ width: `${(c.count / demoTotal) * 100}%` }} />
              </div>
              <span className="tabular-nums text-right">{c.count} of {demoTotal}</span>
              <span className="font-display">{c.plain_name}</span>
            </div>
          ))}
          <p className="text-xs text-ink/50 pt-1">+ {demo.result.unsure.length} “Not sure — needs your eyes”.</p>
          <blockquote className="italic text-sm border-l-2 border-rust pl-3 mt-3">
            “{demo.result.clusters[0].quotes[0]}” — evidence, in the student&apos;s own words.
          </blockquote>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12" aria-label="How it works">
        <h2 className="font-display text-3xl text-center">How it works</h2>
        <ol className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            ["1 · Paste", "Copy your class's answers to one question — one per line, or upload a .txt/.csv. Names off first; nothing is stored."],
            ["2 · See the beliefs", "Answers are grouped by the idea underneath, named, sized, and ranked by exam risk — vague answers are set aside honestly instead of being invented."],
            ["3 · Reteach & re-check", "Each belief gets a ~5-minute reteach card plus a diagnostic question. Export the one-page plan (copy, print, Markdown, CSV) and teach it tomorrow."],
          ].map(([h, p]) => (
            <li key={h} className="border border-ink/10 rounded-md p-6 bg-white/40 dark:bg-white/5">
              <h3 className="font-display text-2xl">{h}</h3>
              <p className="text-sm text-ink/70 mt-2">{p}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8" aria-label="Why">
        <div className="border border-ink/10 rounded-md p-6">
          <h2 className="font-display text-2xl">For teachers</h2>
          <p className="text-sm text-ink/70 mt-2">Mark 120 scripts, write “see me” on 30, and still miss the one belief the whole class shares. Fault Lines makes that belief visible.</p>
        </div>
        <div className="border border-ink/10 rounded-md p-6">
          <h2 className="font-display text-2xl">Not a grader</h2>
          <p className="text-sm text-ink/70 mt-2">An answer is not a mark. It&apos;s evidence of a belief. We group by belief, name it, and rank by damage — misconception cartography, not scoring.</p>
        </div>
        <div className="border border-ink/10 rounded-md p-6">
          <h2 className="font-display text-2xl">Honest about gaps</h2>
          <p className="text-sm text-ink/70 mt-2">When an answer is too vague to classify, it says “Not sure — needs your eyes” instead of inventing a misconception. Verbatim quotes, exact counts. Trust over hallucination.</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12" aria-label="Frequently asked questions">
        <h2 className="font-display text-3xl text-center">Questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="border border-ink/10 rounded-md p-4 bg-white/40 dark:bg-white/5">
              <summary className="font-ui cursor-pointer">{f.q}</summary>
              <p className="text-sm text-ink/70 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10 px-6 py-10 text-center text-sm text-ink/60">
        <p>Fault Lines — built by Abdulrahman Adeeyo. Open source (MIT).</p>
        <div className="mt-3 flex justify-center gap-4">
          <a href="https://github.com/abdulboyprogramming-arch/faultlines" className="px-4 py-2 bg-ink text-paper rounded-md">Star on GitHub</a>
          <a href="https://github.com/abdulboyprogramming-arch/faultlines/issues" className="px-4 py-2 border border-ink/30 rounded-md">Report feedback</a>
          <Link href="/settings" className="px-4 py-2 border border-ink/30 rounded-md">Settings</Link>
        </div>
      </footer>
    </main>
  );
}
