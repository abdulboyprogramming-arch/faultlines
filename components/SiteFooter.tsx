import Link from "next/link";
import Logo from "./Logo";
import T from "./T";

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
            <T k="footerBlurb" />
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.7rem] text-ink/45">
            <span className="chip">
              <T k="footerLicence" />
            </span>
            <span className="chip">
              <T k="footerNoAccounts" />
            </span>
            <span className="chip">
              <T k="footerOffline" />
            </span>
          </p>
        </div>

        <nav aria-labelledby="footer-product">
          <h2 id="footer-product" className="eyebrow">
            <T k="footerProduct" />
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/tool" className="text-ink/65 transition-colors hover:text-ink">
                <T k="navMap" />
              </Link>
            </li>
            <li>
              <Link href="/tool#examples" className="text-ink/65 transition-colors hover:text-ink">
                <T k="footerExampleClassrooms" />
              </Link>
            </li>
            <li>
              <Link href="/play" className="text-ink/65 transition-colors hover:text-ink">
                <T k="playGame" />
              </Link>
            </li>
            <li>
              <Link href="/settings" className="text-ink/65 transition-colors hover:text-ink">
                <T k="footerLocalData" />
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-resources">
          <h2 id="footer-resources" className="eyebrow">
            <T k="footerResources" />
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={GITHUB} target="_blank" rel="noreferrer" className="text-ink/65 transition-colors hover:text-ink"><T k="footerSource" /></a></li>
            <li><a href={`${GITHUB}/blob/main/ARCHITECTURE.md`} target="_blank" rel="noreferrer" className="text-ink/65 transition-colors hover:text-ink"><T k="footerHow" /></a></li>
            <li><a href={`${GITHUB}/issues`} target="_blank" rel="noreferrer" className="text-ink/65 transition-colors hover:text-ink"><T k="footerFeedback" /></a></li>
            <li><Link href="/privacy" className="text-ink/65 transition-colors hover:text-ink">
              <T k="privacy" />
            </Link></li>
            <li><a href={`${GITHUB}/blob/main/SECURITY.md`} target="_blank" rel="noreferrer" className="text-ink/65 transition-colors hover:text-ink"><T k="footerSecurity" /></a></li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">
            <T k="footerBuiltBy" />
          </h2>
          <p className="mt-3 text-sm text-ink/65">
            Abdulrahman Adeeyo
            <span className="block text-ink/45">
              <T k="footerBuiltByNote" />
            </span>
          </p>
          <p className="mt-4 text-xs text-ink/45">
            <T k="footerSavedNote" />
          </p>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="shell flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink/45 sm:flex-row">
          <p>
            <T k="footerCopyright" vars={{ year: new Date().getFullYear() }} />
          </p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
            <T k="footerMadeWith" />
          </p>
        </div>
      </div>
    </footer>
  );
}
