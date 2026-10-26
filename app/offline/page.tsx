import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StrataGame from "@/components/StrataGame";
import Logo from "@/components/Logo";
import T from "@/components/T";

export const metadata = { title: "Offline" };

export default function Offline() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main id="main-content" className="shell py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-up">
          <Logo className="mx-auto h-16 w-16" />
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-ochre/45 bg-ochre/12 px-3 py-1 text-xs font-medium text-ink/70">
            <span className="h-1.5 w-1.5 rounded-full bg-ochre" aria-hidden="true" />
            <T k="offlineBannerTitle" />
          </p>
          <h1 className="mt-4 text-[clamp(1.9rem,4.5vw,2.8rem)]">
            <T k="offlineTitle" />
          </h1>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink/65">
            <T k="offlineBody" />
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/tool" className="btn btn-primary">
              <T k="offlineOpen" />
            </Link>
            <Link href="/" className="btn btn-outline">
              <T k="offlineHome" />
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <StrataGame />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
