import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import DemoMap from "@/components/landing/DemoMap";
import { EXAMPLES } from "@/data/examples";

const demo = EXAMPLES[0];
const demoTotal = demo.result.clusters.reduce((s, c) => s + c.count, 0) + demo.result.unsure.length;

const STATS = [
  { value: "1 map", label: "from 28 messy answers" },
  { value: "5 min", label: "reteach plan per belief" },
  { value: "7", label: "interface languages" },
  { value: "0", label: "accounts or stored answers" },
];

const STEPS = [
  {
    n: "01",
    title: "Paste",
    body: "Copy your class's answers to one question — one per line, or drop a .txt/.csv. Remove names first; nothing is stored on a server.",
    detail: "Up to 120 answers · duplicate detection · live counter",
  },
  {
    n: "02",
    title: "See the beliefs",
    body: "Answers are grouped by the idea underneath, named in plain language, sized by how many share it, and ranked by exam risk.",
    detail: "Vague answers are set aside honestly, never invented",
  },
  {
    n: "03",
    title: "Reteach & re-check",
    body: "Every belief comes with a five-minute reteach card and a follow-up diagnostic question. Copy, print or export the one-page plan.",
    detail: "Markdown · CSV · JSON · printable plan · share link",
  },
];

const FEATURES = [
  {
    icon: (
      <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
    ),
    title: "Beliefs, not marks",
    body: "Bands are sized by share of class, ordered by damage — the one belief 18 of 28 students share is impossible to miss.",
  },
  {
    icon: (
      <>
        <path d="M9 7.5h9M9 12h9M9 16.5h5" strokeLinecap="round" />
        <path d="M4.5 7.5h.01M4.5 12h.01M4.5 16.5h.01" strokeLinecap="round" />
      </>
    ),
    title: "Verbatim evidence",
    body: "Quotes are always the exact words a student wrote. Counts always sum to your class size — guaranteed by construction.",
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 8v4.5" strokeLinecap="round" />
        <path d="M12 16h.01" strokeLinecap="round" />
      </>
    ),
    title: "Honest about gaps",
    body: "Too vague to classify? It says “Not sure — needs your eyes” and shows you the raw answer instead of inventing a misconception.",
  },
  {
    icon: (
      <>
        <path d="M12 3.5v12" strokeLinecap="round" />
        <path d="M7.5 11l4.5 4.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 20h15" strokeLinecap="round" />
      </>
    ),
    title: "Exports that fit school",
    body: "Copy the plan, print one page for the staffroom, or download Markdown, CSV and JSON for department records.",
  },
  {
    icon: (
      <>
        <path d="M7 9a5 5 0 0 1 9.9-1.3A3.8 3.8 0 1 1 17 15H7a3 3 0 0 1 0-6Z" strokeLinejoin="round" />
      </>
    ),
    title: "Works offline, installs",
    body: "Install it like an app. Example classrooms, the built-in analysis and your local history all work with no signal.",
  },
  {
    icon: (
      <path d="M12 3.5 4.5 7v5.4c0 4.2 3 7.2 7.5 8.1 4.5-.9 7.5-3.9 7.5-8.1V7L12 3.5Z" strokeLinejoin="round" />
    ),
    title: "Private by design",
    body: "No accounts, no database, no analytics on your students. Saved maps live in this browser and you can wipe them in one tap.",
  },
];

const PRINCIPLES = [
  {
    title: "Quotes are never rewritten",
    body: "The model returns which answers belong together; the text you see is always your paste, unedited.",
  },
  {
    title: "The counts add up",
    body: "Every answer lands in a band or in the “not sure” list — never duplicated, never quietly dropped.",
  },
  {
    title: "Silence beats invention",
    body: "If an answer is too thin to interpret, it stays unclassified. A guess would cost you a lesson.",
  },
];

const faqs = [
  {
    q: "Is my students' work stored anywhere?",
    a: "No. There are no accounts and no database. Answers are sent once to the analysis endpoint (or analysed in your browser) and are not saved server-side. Results you keep live only in this browser's local storage — remove student names before pasting, and clear local data on shared computers (Settings). The plain-language privacy page has the full picture.",
  },
  {
    q: "Does it need an AI API key?",
    a: "No. Out of the box it runs a built-in heuristic that groups answers by similarity, and the four example classrooms work with zero network. For true misconception judgement, a school can configure an OpenAI-compatible API key on the server (see README) — the key never reaches the browser.",
  },
  {
    q: "Will it invent misconceptions?",
    a: "It's built not to. Quotes are always verbatim from your paste, counts always sum to your class size, and anything too vague to classify is shown separately as “Not sure — needs your eyes” rather than being assigned an invented belief.",
  },
  {
    q: "Which subjects does it work for?",
    a: "Anything with short written answers: science explanations, maths methods, history causation, language comprehension. Try the example classrooms — seasons, fractions, photosynthesis and WWI causation — to see the range.",
  },
  {
    q: "What do I do with the result?",
    a: "Each belief comes with a ~5-minute reteach card and a follow-up diagnostic question. Copy the one-page plan, print it, or download Markdown/CSV/JSON for your department records.",
  },
  {
    q: "How accurate is the built-in analysis?",
    a: "The built-in engine groups by wording similarity, so it is honest about being a preview: it clusters answers and quotes them, but it does not judge correctness. Settings and every report label which engine produced the map, so you always know what you are reading.",
  },
];

export const metadata = {
  alternates: { canonical: "/" },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main id="main-content">
        {/* ─────────────────────────────────────────────────────────── hero */}
        <section className="relative overflow-hidden">
          {/* Topographic contours + soft wash: depth without noise. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 55% at 18% 0%, rgba(181,71,31,0.10), transparent 70%), radial-gradient(60% 50% at 92% 8%, rgba(62,92,99,0.12), transparent 72%), radial-gradient(50% 40% at 60% 100%, rgba(201,138,46,0.10), transparent 70%)",
              }}
            />
            <svg
              viewBox="0 0 600 400"
              className="absolute -right-24 -top-16 h-[34rem] w-[34rem] text-ink/[0.06] animate-drift"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <path
                  key={i}
                  d={`M${300 - i * 26} ${200 - i * 14} C ${180 - i * 20} ${120 - i * 8}, ${90 - i * 10} ${250 - i * 10}, ${170 - i * 12} ${300 + i * 4} C ${250 - i * 8} ${350 + i * 12}, ${420 + i * 10} ${330 + i * 6}, ${430 + i * 8} ${240 - i * 4} C ${440 + i * 6} ${150 - i * 10}, ${360 + i * 10} ${110 - i * 6}, ${300 - i * 26} ${200 - i * 14} Z`}
                />
              ))}
            </svg>
          </div>

          <div className="shell grid items-center gap-12 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24">
            <div className="animate-fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card/70 px-3 py-1.5 text-xs font-medium text-ink/65">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rust opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rust" />
                </span>
                For teachers marking written answers
              </p>

              <h1 className="mt-5 text-[clamp(2.6rem,7vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
                Every class has
                <span className="block">fault lines.</span>
                <span className="mt-3 block font-display text-[clamp(1.15rem,2.4vw,1.6rem)] font-normal italic leading-tight tracking-[-0.01em] text-rust">
                  See them before the exam does.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink/70">
                Paste your class&apos;s answers to one question. In seconds Fault Lines reveals the different
                ways your class is actually thinking, how many share each one, and which will cost them on
                the exam — with their own words as evidence and a five-minute reteach plan for each.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/tool" className="btn btn-primary btn-lg">
                  Map my class
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/tool#examples" className="btn btn-outline btn-lg">
                  Try an example classroom
                </Link>
              </div>

              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/55">
                {["No accounts", "No stored student data", "Works offline", "No API key needed"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-moss" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5 9.5 17 19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="animate-fade-up lg:pl-2" style={{ animationDelay: "140ms" }}>
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 -z-10 rounded-[1.5rem] bg-gradient-to-br from-rust/12 via-transparent to-slate/15 blur-2xl"
                />
                <DemoMap
                  clusters={demo.result.clusters}
                  unsureCount={demo.result.unsure.length}
                  question={demo.question}
                  total={demoTotal}
                />
              </div>
            </div>
          </div>

          {/* Stat rail */}
          <div className="border-y border-ink/10 bg-card/40">
            <dl className="shell grid grid-cols-2 divide-ink/10 sm:grid-cols-4 sm:divide-x">
              {STATS.map((s) => (
                <div key={s.label} className="px-2 py-5 text-center sm:px-6">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-semibold tracking-tight">{s.value}</span>
                    <span className="mt-0.5 block text-xs text-ink/55">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── gap */}
        <section className="shell py-20 sm:py-24" aria-labelledby="gap-heading">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Reveal>
              <p className="eyebrow">The gap</p>
              <h2 id="gap-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08]">
                A mark tells you who lost points.
                <span className="block text-ink/45">It never tells you what the class believes.</span>
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-ink/65">
                Mark 120 scripts and you finish knowing thirty need “see me”. What you cannot see from a
                mark book is the one idea half the class shares — the idea that will cost them in the exam
                and take five minutes to fix tomorrow.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <ul className="space-y-4">
                {[
                  ["Same answer, different belief", "Two students can write the same sentence for opposite reasons. Grouping by marks hides this; grouping by belief exposes it."],
                  ["Risk, not ranking", "A belief shared by 64% of the class matters more than a single brilliant answer. Bands are ordered by damage, not by grade."],
                  ["Evidence you can defend", "When a head of department asks why you re-taught that, you have the verbatim quotes and the exact count."],
                ].map(([title, body]) => (
                  <li key={title} className="card p-5">
                    <h3 className="font-display text-lg leading-snug">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── how it works */}
        <section className="border-y border-ink/10 bg-paper-deep/50 py-20 sm:py-24" aria-labelledby="how-heading">
          <div className="shell">
            <Reveal>
              <div className="max-w-2xl">
                <p className="eyebrow">How it works</p>
                <h2 id="how-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)]">
                  Three steps, one class period
                </h2>
                <p className="mt-3 text-ink/65">
                  No onboarding, no account, no spreadsheet to tidy first.
                </p>
              </div>
            </Reveal>

            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 90} as="li" className="h-full">
                  <div className="card relative h-full p-6 card-lift">
                    <span className="font-display text-4xl font-semibold tracking-tight text-rust/25">{step.n}</span>
                    <h3 className="mt-3 font-display text-xl">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{step.body}</p>
                    <p className="mt-4 border-t border-ink/10 pt-3 text-[0.7rem] uppercase tracking-[0.1em] text-ink/45">
                      {step.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── features */}
        <section className="shell py-20 sm:py-24" aria-labelledby="features-heading">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="eyebrow">What you get</p>
                <h2 id="features-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)]">
                  Small tool, deliberately complete
                </h2>
              </div>
              <Link href="/tool" className="btn btn-outline btn-sm">
                Open the tool <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80} className="h-full">
                <div className="card h-full p-6 card-lift">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink/12 bg-paper/70 text-rust">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      {f.icon}
                    </svg>
                  </span>
                  <h3 className="mt-4 font-display text-lg leading-snug">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────── trust */}
        <section className="border-y border-ink/10 bg-slate/[0.06] py-20 sm:py-24" aria-labelledby="trust-heading">
          <div className="shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <Reveal>
              <p className="eyebrow">Trust</p>
              <h2 id="trust-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)]">
                Built to be boring about evidence
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-ink/65">
                Misconception tools fail in one direction: they sound confident and get the class wrong.
                Fault Lines is designed so the worst case is a vague answer sitting in a list you can see.
              </p>
              <ul className="mt-7 space-y-4">
                {PRINCIPLES.map((p) => (
                  <li key={p.title} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/15 text-moss">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5 9.5 17 19 7" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{p.title}</h3>
                      <p className="text-sm leading-relaxed text-ink/60">{p.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-ink/10 bg-card-deep/50 px-5 py-3">
                  <p className="eyebrow">Receipt from a real run</p>
                  <span className="chip border-ochre/40 bg-ochre/15 text-ink/70">1 of 28 unclassified</span>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-ink/45">Named belief · 18 of 28 · high risk</p>
                    <p className="mt-1 font-display text-lg">The distance myth</p>
                    <blockquote className="mt-2 border-l-2 border-rust pl-3 text-sm italic text-ink/75">
                      “Because the earth moves nearer to the sun in June”
                    </blockquote>
                  </div>
                  <div className="border-t border-ink/10 pt-4">
                    <p className="text-xs uppercase tracking-[0.1em] text-ink/45">Set aside, not invented</p>
                    <p className="mt-1 text-sm italic text-ink/75">“It&apos;s just different”</p>
                    <p className="mt-1 text-xs text-ink/50">
                      Shown to the teacher with the original wording — no belief guessed on the student&apos;s behalf.
                    </p>
                  </div>
                  <div className="rounded-lg bg-paper/70 p-3 text-xs leading-relaxed text-ink/60">
                    <strong className="font-semibold text-ink/80">Reteach · 6 minutes:</strong> show the orbit is
                    nearly circular, demonstrate axial tilt, then ask why Sydney has winter when London has summer.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────── examples */}
        <section id="examples" className="shell scroll-mt-24 py-20 sm:py-24" aria-labelledby="examples-heading">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow">Example classrooms</p>
              <h2 id="examples-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)]">
                Four classes, four different fault lines
              </h2>
              <p className="mt-3 text-ink/65">
                Real cached runs. Open one and everything works — no typing, no API key, no network.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {EXAMPLES.map((ex, i) => {
              const total = ex.result.clusters.reduce((s, c) => s + c.count, 0) + ex.result.unsure.length;
              return (
                <Reveal key={ex.id} delay={(i % 2) * 80} className="h-full">
                  <Link
                    href={`/tool?example=${ex.id}`}
                    className="group card flex h-full flex-col justify-between gap-4 p-5 card-lift"
                  >
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">{ex.subject}</p>
                      <h3 className="mt-1.5 font-display text-lg leading-snug">{ex.name}</h3>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-ink/55">
                      <span className="tabular-nums">
                        {total} answers · {ex.result.clusters.length} beliefs
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-rust opacity-0 transition-opacity group-hover:opacity-100">
                        Open <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── faq */}
        <section className="border-t border-ink/10 bg-paper-deep/40 py-20 sm:py-24" aria-labelledby="faq-heading">
          <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="eyebrow">Questions</p>
              <h2 id="faq-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.4rem)]">
                The things teachers ask first
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
                Still unsure? The full security notes and architecture decisions are in the repository.
              </p>
              <a
                href="https://github.com/abdulboyprogramming-arch/faultlines/blob/main/SECURITY.md"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm mt-5"
              >
                Read the security notes
              </a>
            </Reveal>

            <Reveal delay={80}>
              <div className="divide-y divide-ink/10 overflow-hidden rounded-xl border border-ink/12 bg-card">
                {faqs.map((f) => (
                  <details key={f.q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium marker:hidden hover:bg-ink/[0.03]">
                      {f.q}
                      <span
                        aria-hidden="true"
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/50 transition-transform duration-300 group-open:rotate-45"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink/65">{f.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────── finale */}
        <section className="shell py-20 sm:py-24" aria-labelledby="cta-heading">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-ink px-6 py-14 text-paper sm:px-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(60% 80% at 10% 0%, rgba(181,71,31,0.55), transparent 65%), radial-gradient(50% 70% at 100% 100%, rgba(62,92,99,0.55), transparent 65%)",
                }}
              />
              <div className="relative mx-auto max-w-2xl text-center">
                <Logo className="mx-auto h-14 w-14" variant="animated" />
                <h2 id="cta-heading" className="mt-6 text-[clamp(1.9rem,4vw,2.8rem)]">
                  Find your class&apos;s fault lines before the exam does.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-paper/70">
                  One question, one paste, about a minute. No account, no student data stored, no API key
                  needed to try it.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/tool" className="btn btn-accent btn-lg">
                    Map my class
                  </Link>
                  <Link href="/tool?example=seasons" className="btn btn-lg border border-paper/25 text-paper hover:bg-paper/10">
                    See a full example
                  </Link>
                </div>
                <p className="mt-5 text-xs text-paper/45">
                  Works on phone, tablet and laptop · installable · offline-ready
                </p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
