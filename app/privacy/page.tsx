import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy",
  description:
    "Fault Lines stores no student answers, has no accounts and no database. What that means in practice, in plain language, for teachers and schools.",
  alternates: { canonical: "/privacy" },
};

const FACTS = [
  {
    title: "No accounts, no database",
    body: "There is nothing to sign up for and nothing to sign in to. Fault Lines has no user table and no storage bucket — the only thing it can save is what your own browser keeps.",
  },
  {
    title: "Answers are not stored on a server",
    body: "When you press “Map my class”, your answers are sent once to the analysis endpoint, used to build that result, and returned. They are not written to disk, logged in full, or kept for later.",
  },
  {
    title: "Your saved maps live in this browser",
    body: "History, appearance and game scores use localStorage on your device. Clearing site data — or the “Clear all local data” button in Settings — removes them permanently. Nothing syncs anywhere.",
  },
  {
    title: "Share links carry the report, not a copy on a server",
    body: "The report is encoded in the part of the URL after #. Browsers never send that fragment to a server, so the report travels in the link itself. Anyone with the link can open it — treat it like a shared document.",
  },
];

const NO_LIST = [
  "No analytics, tracking pixels or heatmaps",
  "No advertising or third-party cookies",
  "No student names collected by the tool",
  "No data sold, rented or shared with brokers",
  "No background sync of local data",
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main id="main-content" className="shell py-10 sm:py-14">
        <div className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs text-ink/45">
            <Link href="/" className="transition-colors hover:text-ink">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink/70">Privacy</span>
          </nav>

          <p className="eyebrow">Privacy</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,2.8rem)]">Your students&apos; words stay yours</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/70">
            Fault Lines was built for marking written answers, which means it handles the one thing a school
            cannot afford to leak: what children actually wrote. So the design starts from “store nothing”
            rather than “store it carefully”.
          </p>
          <p className="mt-3 text-xs text-ink/45">Last updated 26 October 2026 · applies to the web app and the browser extension.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FACTS.map((fact) => (
              <section key={fact.title} className="card p-5">
                <h2 className="font-display text-lg leading-snug">{fact.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{fact.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 card p-5" aria-labelledby="not-collected">
            <h2 id="not-collected" className="font-display text-lg">What we never do</h2>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {NO_LIST.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-moss/15 text-moss">
                    <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5 9.5 17 19 7" />
                    </svg>
                  </span>
                  <span className="text-ink/70">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="font-display text-xl">If your school configures an AI provider</h2>
            <p className="text-sm leading-relaxed text-ink/70">
              By default the app uses a built-in, deterministic engine that never leaves your browser or the
              server it runs on. A school <em>may</em> configure an OpenAI-compatible provider on its own
              deployment; in that case the pasted answers are sent to whichever provider that deployment names,
              under that provider&apos;s terms. The API key lives on the server and never reaches a browser, and
              Settings always shows which engine a deployment is using.
            </p>
            <h2 className="font-display text-xl">Before you paste</h2>
            <p className="text-sm leading-relaxed text-ink/70">
              Remove or initialise student names. The composer scans your paste and warns when it spots
              email addresses, phone-shaped numbers, “Name:” labels or name-like pairs of words — that scan runs
              entirely in your browser.
            </p>
            <h2 className="font-display text-xl">Shared and school computers</h2>
            <p className="text-sm leading-relaxed text-ink/70">
              Saved maps persist in the browser until cleared. Use{" "}
              <Link href="/settings" className="underline underline-offset-2 hover:text-rust">Settings → Clear all local data</Link>{" "}
              when you finish, or use a private window.
            </p>
            <h2 className="font-display text-xl">Questions or a data request</h2>
            <p className="text-sm leading-relaxed text-ink/70">
              Because no personal data is held server-side, there is nothing to request or erase on our side.
              For anything else, open an issue on{" "}
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
            <Link href="/tool" className="btn btn-primary">Map a class</Link>
            <Link href="/settings" className="btn btn-outline">Local data settings</Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
