import Link from "next/link";
import Logo from "./Logo";

const GITHUB = "https://github.com/abdulboyprogramming-arch/faultlines";

/**
 * Shared footer. Server component — no state, no client JS.
 * Keeps every page ending the same way, which is most of what "feels finished".
 */
export default function SiteFooter() {
  return (
    <footer className="no-print mt-20 border-t border-ink/10 bg-paper-deep/40">
      <div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" variant="static" />
            <span className="font-display text-lg font-semibold">Fault Lines</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            Misconception cartography for teachers. Verbatim evidence, exact counts, and a five-minute
            reteach plan — never an invented belief.
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.7rem] text-ink/45">
            <span className="chip">MIT licensed</span>
            <span className="chip">No accounts</span>
            <span className="chip">Works offline</span>
          </p>
        </div>

        <nav aria-label="Product">
          <h2 className="eyebrow">Product</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/tool" className="text-ink/65 transition-colors hover:text-ink">Map my class</Link></li>
            <li><Link href="/tool#examples" className="text-ink/65 transition-colors hover:text-ink">Example classrooms</Link></li>
            <li><Link href="/play" className="text-ink/65 transition-colors hover:text-ink">Strata Drop</Link></li>
            <li><Link href="/settings" className="text-ink/65 transition-colors hover:text-ink">Settings &amp; local data</Link></li>
          </ul>
        </nav>

        <nav aria-label="Resources">
          <h2 className="eyebrow">Resources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={GITHUB} target="_blank" rel="noreferrer" className="text-ink/65 transition-colors hover:text-ink">Source code</a></li>
            <li><a href={`${GITHUB}/blob/main/ARCHITECTURE.md`} target="_blank" rel="noreferrer" className="text-ink/65 transition-colors hover:text-ink">How it works</a></li>
            <li><a href={`${GITHUB}/issues`} target="_blank" rel="noreferrer" className="text-ink/65 transition-colors hover:text-ink">Feedback &amp; issues</a></li>
            <li><a href={`${GITHUB}/blob/main/SECURITY.md`} target="_blank" rel="noreferrer" className="text-ink/65 transition-colors hover:text-ink">Privacy &amp; security</a></li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Built by</h2>
          <p className="mt-3 text-sm text-ink/65">
            Abdulrahman Adeeyo
            <span className="block text-ink/45">for the Devpost “Build with AI” hackathon</span>
          </p>
          <p className="mt-4 text-xs text-ink/45">
            Answers are analysed and never stored on a server. Saved maps live in this browser only.
          </p>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="shell flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Fault Lines · Every class has fault lines.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
            Built with Next.js, TypeScript &amp; Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
