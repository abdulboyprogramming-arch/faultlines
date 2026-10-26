"use client";
import Link from "next/link";
import StrataGame from "@/components/StrataGame";
import Logo from "@/components/Logo";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-up">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto" />
          <h1 className="font-display text-5xl mt-4">Something slipped</h1>
          <p className="mt-3 text-ink/70 max-w-md mx-auto">
            A fault moved under this page. Your pasted answers and local history are safe in your browser.
            Try again — or take a drilling break:
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button type="button" onClick={reset} className="px-5 py-2 bg-ink text-paper rounded-md font-ui hover:opacity-90">Try again</button>
            <Link href="/tool" className="px-5 py-2 border border-ink/30 rounded-md font-ui hover:bg-ink/5">Back to the tool</Link>
          </div>
        </div>
        <div className="mt-8 text-left">
          <StrataGame compact />
        </div>
      </div>
    </main>
  );
}
