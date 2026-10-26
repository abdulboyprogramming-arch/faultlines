import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StrataGame from "@/components/StrataGame";
import Logo from "@/components/Logo";

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
            No connection
          </p>
          <h1 className="mt-4 text-[clamp(1.9rem,4.5vw,2.8rem)]">You&apos;re offline</h1>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink/65">
            No signal — no problem. The <strong className="font-semibold text-ink">example classrooms</strong>, your{" "}
            <strong className="font-semibold text-ink">local history</strong> and the built-in analysis on the tool
            page all work without a network. And while you wait, there&apos;s always drilling:
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/tool" className="btn btn-primary">Open the tool (offline mode)</Link>
            <Link href="/" className="btn btn-outline">Home</Link>
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
