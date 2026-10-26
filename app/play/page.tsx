import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StrataGame from "@/components/StrataGame";

export const metadata = {
  title: "Strata Drop — the Fault Lines game",
  description:
    "A tiny offline drilling game built into Fault Lines: catch solid understanding, dodge the fault cracks. Mouse, touch or arrow keys.",
};

const RULES = [
  { swatch: "bg-slate", label: "Solid understanding", points: "+10" },
  { swatch: "bg-ochre", label: "Partial idea", points: "+5" },
  { swatch: "bg-rust", label: "Fault crack", points: "−1 life" },
];

export default function Play() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main id="main-content" className="shell py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink/45">
            <Link href="/" className="transition-colors hover:text-ink">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink/70">Strata Drop</span>
          </nav>

          <header className="animate-fade-up text-center">
            <h1 className="text-[clamp(2.2rem,5vw,3.2rem)]">Strata Drop</h1>
            <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink/65">
              Our own little drilling game — the same one that keeps you company on 404s and offline
              moments. Fully programmatic, zero downloads, works on any device.
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
                  <span className="block text-sm font-medium leading-tight">{rule.label}</span>
                  <span className="block text-xs tabular-nums text-ink/50">{rule.points}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tool" className="btn btn-primary">
              Back to mapping
            </Link>
            <Link href="/" className="btn btn-outline">
              Home
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-ink/40">
            High scores are saved in this browser only — no accounts, no leaderboards, no tracking.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
