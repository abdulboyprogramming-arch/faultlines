import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import StrataGame from "@/components/StrataGame";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12 animate-fade-up">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto" />
          <h1 className="font-display text-6xl mt-4">404</h1>
          <p className="mt-3 text-ink/70 max-w-md mx-auto">
            You&apos;ve hit a fault line — this page slipped along the crack and isn&apos;t where the map said.
            While you find your way back, here&apos;s our built-in game (it even works offline):
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/" className="px-5 py-2 bg-ink text-paper rounded-md font-ui hover:opacity-90">Home</Link>
            <Link href="/tool" className="px-5 py-2 border border-ink/30 rounded-md font-ui hover:bg-ink/5">Map my class</Link>
          </div>
        </div>
        <div className="mt-8 text-left">
          <StrataGame compact />
        </div>
      </main>
    </div>
  );
}
