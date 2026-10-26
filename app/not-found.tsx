import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StrataGame from "@/components/StrataGame";
import Logo from "@/components/Logo";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <main id="main-content" className="shell py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-up">
          <Logo className="mx-auto h-16 w-16" />
          <p className="mt-6 font-display text-[clamp(3.5rem,12vw,6rem)] font-semibold leading-none tracking-tight">
            404
          </p>
          <h1 className="mt-3 text-[clamp(1.4rem,3vw,2rem)]">This page slipped along the fault</h1>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/65">
            You&apos;ve hit a fault line — the page you were looking for isn&apos;t where the map said.
            While you find your way back, here&apos;s the built-in game (it even works offline):
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary">Home</Link>
            <Link href="/tool" className="btn btn-outline">Map my class</Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <StrataGame compact />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
