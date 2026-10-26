import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import T from "@/components/T";
import DemoMap from "@/components/landing/DemoMap";
import { EXAMPLES } from "@/data/examples";

const demo = EXAMPLES[0];
const demoTotal = demo.result.clusters.reduce((s, c) => s + c.count, 0) + demo.result.unsure.length;

const STATS = [
  { value: "stat1v", label: "stat1l" },
  { value: "stat2v", label: "stat2l" },
  { value: "stat3v", label: "stat3l" },
  { value: "stat4v", label: "stat4l" },
] as const;

const STEPS = [
  { n: "01", title: "step1t", body: "step1b", detail: "step1d" },
  { n: "02", title: "step2t", body: "step2b", detail: "step2d" },
  { n: "03", title: "step3t", body: "step3b", detail: "step3d" },
] as const;

const FEATURES = [
  {
    icon: (
      <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
    ),
    title: "feat1t",
    body: "feat1b",
  },
  {
    icon: (
      <>
        <path d="M9 7.5h9M9 12h9M9 16.5h5" strokeLinecap="round" />
        <path d="M4.5 7.5h.01M4.5 12h.01M4.5 16.5h.01" strokeLinecap="round" />
      </>
    ),
    title: "feat2t",
    body: "feat2b",
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 8v4.5" strokeLinecap="round" />
        <path d="M12 16h.01" strokeLinecap="round" />
      </>
    ),
    title: "feat3t",
    body: "feat3b",
  },
  {
    icon: (
      <>
        <path d="M12 3.5v12" strokeLinecap="round" />
        <path d="M7.5 11l4.5 4.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 20h15" strokeLinecap="round" />
      </>
    ),
    title: "feat4t",
    body: "feat4b",
  },
  {
    icon: (
      <>
        <path d="M7 9a5 5 0 0 1 9.9-1.3A3.8 3.8 0 1 1 17 15H7a3 3 0 0 1 0-6Z" strokeLinejoin="round" />
      </>
    ),
    title: "feat5t",
    body: "feat5b",
  },
  {
    icon: (
      <path d="M12 3.5 4.5 7v5.4c0 4.2 3 7.2 7.5 8.1 4.5-.9 7.5-3.9 7.5-8.1V7L12 3.5Z" strokeLinejoin="round" />
    ),
    title: "feat6t",
    body: "feat6b",
  },
] as const;

const PRINCIPLES = [
  { title: "prin1t", body: "prin1b" },
  { title: "prin2t", body: "prin2b" },
  { title: "prin3t", body: "prin3b" },
] as const;

const faqs = [
  { q: "faq1q", a: "faq1a" },
  { q: "faq2q", a: "faq2a" },
  { q: "faq3q", a: "faq3a" },
  { q: "faq4q", a: "faq4a" },
  { q: "faq5q", a: "faq5a" },
  { q: "faq6q", a: "faq6a" },
] as const;

/** Example classrooms: copy comes from the dictionary, data stays in `data/examples.ts`. */
const EXAMPLE_COPY: Record<string, { name: string; subject: string }> = {
  seasons: { name: "exSeasonsName", subject: "exSeasonsSubject" },
  fractions: { name: "exFractionsName", subject: "exFractionsSubject" },
  photosynthesis: { name: "exPhotoName", subject: "exPhotoSubject" },
  ww1: { name: "exWw1Name", subject: "exWw1Subject" },
};

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
            <div className="animate-fade-up" data-tour="hero">
              <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card/70 px-3 py-1.5 text-xs font-medium text-ink/65">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rust opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rust" />
                </span>
                <T k="landingEyebrow" />
              </p>

              <h1 className="mt-5 text-[clamp(2.6rem,7vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
                <T k="landingH1a" />
                <span className="block">
                  <T k="landingH1b" />
                </span>
                <span className="mt-3 block font-display text-[clamp(1.15rem,2.4vw,1.6rem)] font-normal italic leading-tight tracking-[-0.01em] text-rust">
                  <T k="landingTagline" />
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink/70">
                <T k="landingIntro" />
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3" data-tour="hero-cta">
                <Link href="/tool" className="btn btn-primary btn-lg">
                  <T k="landingCtaPrimary" />
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/tool#examples" className="btn btn-outline btn-lg">
                  <T k="landingCtaSecondary" />
                </Link>
              </div>

              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/55">
                {(["trustNoAccounts", "trustNoData", "trustOffline", "trustNoKey"] as const).map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-moss" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5 9.5 17 19 7" />
                    </svg>
                    <T k={item} />
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
                  <dt className="sr-only">
                    <T k={s.label} />
                  </dt>
                  <dd>
                    <span className="block font-display text-2xl font-semibold tracking-tight">
                      <T k={s.value} />
                    </span>
                    <span className="mt-0.5 block text-xs text-ink/55">
                      <T k={s.label} />
                    </span>
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
              <p className="eyebrow">
                <T k="gapEyebrow" />
              </p>
              <h2 id="gap-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08]">
                <T k="gapTitle1" />
                <span className="block text-ink/45">
                  <T k="gapTitle2" />
                </span>
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-ink/65">
                <T k="gapBody" />
              </p>
            </Reveal>

            <Reveal delay={100}>
              <ul className="space-y-4">
                {([
                  ["gap1t", "gap1b"],
                  ["gap2t", "gap2b"],
                  ["gap3t", "gap3b"],
                ] as const).map(([title, body]) => (
                  <li key={title} className="card p-5">
                    <h3 className="font-display text-lg leading-snug">
                      <T k={title} />
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
                      <T k={body} />
                    </p>
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
                <p className="eyebrow">
                  <T k="howEyebrow" />
                </p>
                <h2 id="how-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)]">
                  <T k="howTitle" />
                </h2>
                <p className="mt-3 text-ink/65">
                  <T k="howSub" />
                </p>
              </div>
            </Reveal>

            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 90} as="li" className="h-full">
                  <div className="card relative h-full p-6 card-lift">
                    <span className="font-display text-4xl font-semibold tracking-tight text-rust/25">{step.n}</span>
                    <h3 className="mt-3 font-display text-xl">
                      <T k={step.title} />
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">
                      <T k={step.body} />
                    </p>
                    <p className="mt-4 border-t border-ink/10 pt-3 text-[0.7rem] uppercase tracking-[0.1em] text-ink/45">
                      <T k={step.detail} />
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
                <p className="eyebrow">
                  <T k="featEyebrow" />
                </p>
                <h2 id="features-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)]">
                  <T k="featTitle" />
                </h2>
              </div>
              <Link href="/tool" className="btn btn-outline btn-sm">
                <T k="featOpenTool" /> <span aria-hidden="true">→</span>
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
                  <h3 className="mt-4 font-display text-lg leading-snug">
                    <T k={f.title} />
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
                    <T k={f.body} />
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────── trust */}
        <section className="border-y border-ink/10 bg-slate/[0.06] py-20 sm:py-24" aria-labelledby="trust-heading">
          <div className="shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <Reveal>
              <p className="eyebrow">
                <T k="trustEyebrow" />
              </p>
              <h2 id="trust-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)]">
                <T k="trustTitle" />
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-ink/65">
                <T k="trustBody" />
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
                      <h3 className="text-sm font-semibold">
                        <T k={p.title} />
                      </h3>
                      <p className="text-sm leading-relaxed text-ink/60">
                        <T k={p.body} />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-ink/10 bg-card-deep/50 px-5 py-3">
                  <p className="eyebrow">
                    <T k="receiptEyebrow" />
                  </p>
                  <span className="chip border-ochre/40 bg-ochre/15 text-ink/70">
                    <T k="receiptChip" vars={{ n: 1 }} />
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-ink/45">
                      <T k="receiptNamed" />
                    </p>
                    <p className="mt-1 font-display text-lg">The distance myth</p>
                    <blockquote className="mt-2 border-l-2 border-rust pl-3 text-sm italic text-ink/75">
                      “Because the earth moves nearer to the sun in June”
                    </blockquote>
                  </div>
                  <div className="border-t border-ink/10 pt-4">
                    <p className="text-xs uppercase tracking-[0.1em] text-ink/45">
                      <T k="receiptSetAside" />
                    </p>
                    <p className="mt-1 text-sm italic text-ink/75">“It&apos;s just different”</p>
                    <p className="mt-1 text-xs text-ink/50">
                      <T k="receiptSetAsideNote" />
                    </p>
                  </div>
                  <div className="rounded-lg bg-paper/70 p-3 text-xs leading-relaxed text-ink/60">
                    <strong className="font-semibold text-ink/80">
                      <T k="receiptReteach" />
                    </strong>{" "}
                    <T k="receiptReteachBody" />
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
              <p className="eyebrow">
                <T k="exEyebrow" />
              </p>
              <h2 id="examples-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)]">
                <T k="exTitle" />
              </h2>
              <p className="mt-3 text-ink/65">
                <T k="exSub" />
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
                      <p className="text-[0.7rem] uppercase tracking-[0.12em] text-ink/45">
                        <T k={EXAMPLE_COPY[ex.id].subject as never} />
                      </p>
                      <h3 className="mt-1.5 font-display text-lg leading-snug">
                        <T k={EXAMPLE_COPY[ex.id].name as never} />
                      </h3>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-ink/55">
                      <span className="tabular-nums">
                        <T k="exAnswers" vars={{ n: total }} /> ·{" "}
                        <T k="exBeliefs" vars={{ n: ex.result.clusters.length }} />
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-rust opacity-0 transition-opacity group-hover:opacity-100">
                        <T k="exOpen" /> <span aria-hidden="true">→</span>
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
              <p className="eyebrow">
                <T k="faqEyebrow" />
              </p>
              <h2 id="faq-heading" className="mt-3 text-[clamp(1.9rem,3.6vw,2.4rem)]">
                <T k="faqTitle" />
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
                <T k="faqSub" />
              </p>
              <a
                href="https://github.com/abdulboyprogramming-arch/faultlines/blob/main/SECURITY.md"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm mt-5"
              >
                <T k="faqSecurityCta" />
              </a>
            </Reveal>

            <Reveal delay={80}>
              <div className="divide-y divide-ink/10 overflow-hidden rounded-xl border border-ink/12 bg-card">
                {faqs.map((f) => (
                  <details key={f.q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium marker:hidden hover:bg-ink/[0.03]">
                      <T k={f.q} />
                      <span
                        aria-hidden="true"
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/50 transition-transform duration-300 group-open:rotate-45"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink/65">
                      <T k={f.a} />
                    </p>
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
                  <T k="ctaTitle" />
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-paper/70">
                  <T k="ctaBody" />
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/tool" className="btn btn-accent btn-lg">
                    <T k="ctaPrimary" />
                  </Link>
                  <Link href="/tool?example=seasons" className="btn btn-lg border border-paper/25 text-paper hover:bg-paper/10">
                    <T k="ctaSecondary" />
                  </Link>
                </div>
                <p className="mt-5 text-xs text-paper/45">
                  <T k="ctaFoot" />
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
