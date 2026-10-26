import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import T from "@/components/T";

export const metadata = {
  title: "Privacy",
  description:
    "Fault Lines stores no student answers, has no accounts and no database. What that means in practice, in plain language, for teachers and schools.",
  alternates: { canonical: "/privacy" },
};

const FACTS = [
  { title: "priv1t", body: "priv1b" },
  { title: "priv2t", body: "priv2b" },
  { title: "priv3t", body: "priv3b" },
  { title: "priv4t", body: "priv4b" },
] as const;

const NO_LIST = ["never1", "never2", "never3", "never4", "never5"] as const;

export default function Privacy() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main id="main-content" className="shell py-10 sm:py-14">
        <div className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink/45">
            <Link href="/" className="transition-colors hover:text-ink">
              <T k="breadcrumbHome" />
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink/70">
              <T k="privacy" />
            </span>
          </nav>

          <p className="eyebrow">
            <T k="privacy" />
          </p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,2.8rem)]">
            <T k="privacyTitle" />
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">
            <T k="privacyIntro" />
          </p>
          <p className="mt-3 text-xs text-ink/45">
            <T k="privacyUpdated" />
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FACTS.map((fact) => (
              <section key={fact.title} className="card p-5">
                <h2 className="font-display text-lg leading-snug">
                  <T k={fact.title} />
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
                  <T k={fact.body} />
                </p>
              </section>
            ))}
          </div>

          <section className="mt-8 card p-5" aria-labelledby="not-collected">
            <h2 id="not-collected" className="font-display text-lg">
              <T k="neverTitle" />
            </h2>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {NO_LIST.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-moss/15 text-moss">
                    <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5 9.5 17 19 7" />
                    </svg>
                  </span>
                  <span className="text-ink/70">
                    <T k={item} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-xl">
              <T k="aiT" />
            </h2>
            <p className="text-sm leading-relaxed text-ink/70">
              <T k="aiB" />
            </p>
            <h2 className="font-display text-xl">
              <T k="beforeT" />
            </h2>
            <p className="text-sm leading-relaxed text-ink/70">
              <T k="beforeB" />
            </p>
            <h2 className="font-display text-xl">
              <T k="sharedT" />
            </h2>
            <p className="text-sm leading-relaxed text-ink/70">
              <T k="sharedB" />{" "}
              <Link href="/settings" className="underline underline-offset-2 hover:text-rust">
                <T k="footerLocalData" />
              </Link>
            </p>
            <h2 className="font-display text-xl">
              <T k="questionsT" />
            </h2>
            <p className="text-sm leading-relaxed text-ink/70">
              <T k="questionsB" />{" "}
              <a
                href="https://github.com/abdulboyprogramming-arch/faultlines/issues"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-rust"
              >
                the public repository
              </a>
              . The full technical audit — client secrets, tenancy and header policy — is in{" "}
              <a
                href="https://github.com/abdulboyprogramming-arch/faultlines/blob/main/SECURITY.md"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-rust"
              >
                SECURITY.md
              </a>
              .
            </p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/tool" className="btn btn-primary">
              <T k="privacyCtaMap" />
            </Link>
            <Link href="/settings" className="btn btn-outline">
              <T k="privacyCtaSettings" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
