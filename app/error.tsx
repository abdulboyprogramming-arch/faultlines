"use client";

import { useEffect } from "react";
import Link from "next/link";
import StrataGame from "@/components/StrataGame";
import Logo from "@/components/Logo";
import T from "@/components/T";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the real error for debugging without shipping it to a third party.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <main id="main-content" className="shell py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-up">
          <Logo className="mx-auto h-16 w-16" />
          <h1 className="mt-6 text-[clamp(1.8rem,4vw,2.6rem)]">
            <T k="errTitle" />
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/65">
            <T k="errBody" />
          </p>
          {error?.digest && (
            <p className="mt-2 text-xs text-ink/40">
              <T k="errRef" /> <code className="rounded bg-ink/8 px-1.5 py-0.5">{error.digest}</code>
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="btn btn-primary">
              <T k="errRetry" />
            </button>
            <Link href="/tool" className="btn btn-outline">
              <T k="errBack" />
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <StrataGame compact />
        </div>
      </main>
    </div>
  );
}
