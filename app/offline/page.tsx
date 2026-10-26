import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import StrataGame from "@/components/StrataGame";
import Logo from "@/components/Logo";

export const metadata = { title: "Offline" };

export default function Offline() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12 animate-fade-up">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto" />
          <h1 className="font-display text-5xl mt-4">You&apos;re offline</h1>
          <p className="mt-3 text-ink/70 max-w-lg mx-auto">
            No connection — no problem. The <strong>example classrooms</strong>, your <strong>local history</strong> and the
            built-in heuristic on the tool page all work without a network. And while you wait for signal,
            there&apos;s always drilling:
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/tool" className="px-5 py-2 bg-ink text-paper rounded-md font-ui hover:opacity-90">Open the tool (offline mode)</Link>
            <Link href="/" className="px-5 py-2 border border-ink/30 rounded-md font-ui hover:bg-ink/5">Home</Link>
          </div>
        </div>
        <div className="mt-8 text-left">
          <StrataGame />
        </div>
      </main>
    </div>
  );
}
