import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StrataGame from "@/components/StrataGame";
import T from "@/components/T";

export const metadata = {
  title: "Strata Drop — the Fault Lines game",
  description:
    "A tiny offline drilling game built into Fault Lines: catch solid understanding, dodge the fault cracks. Mouse, touch or arrow keys.",
};

const RULES = [
  { swatch: "bg-slate", label: "playRule1" as const, points: "+10", life: false },
  { swatch: "bg-ochre", label: "playRule2" as const, points: "+5", life: false },
  { swatch: "bg-rust", label: "playRule3" as const, points: "playRuleLife" as const, life: true },
];

export default function Play() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main id="main-content" className="shell py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink/45">
            <Link href="/" className="transition-colors hover:text-ink">
              <T k="breadcrumbHome" />
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink/70">
              <T k="playTitle" />
            </span>
          </nav>

          <header className="animate-fade-up text-center">
            <h1 className="text-[clamp(2.2rem,5vw,3.2rem)]">
              <T k="playTitle" />
            </h1>
            <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink/65">
              <T k="playIntro" />
            </p>
          </header>

          <div className="mt-8">
            <StrataGame />
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {RULES.map((rule) => (
              <li key={rule.label} className="card flex items-center gap-3 px-4 py-3">
                <span className={`h-3 w-3 shrink-0 rounded-sm ${rule.swatch}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-tight">
                    <T k={rule.label} />
                  </span>
                  <span className="block text-xs tabular-nums text-ink/50">
                    {rule.life ? <T k="playRuleLife" /> : rule.points}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tool" className="btn btn-primary">
              <T k="playBack" />
            </Link>
            <Link href="/" className="btn btn-outline">
              <T k="breadcrumbHome" />
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-ink/40">
            <T k="playFoot" />
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
