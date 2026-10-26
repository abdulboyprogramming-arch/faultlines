"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level boundary for /tool. A failure inside the workspace keeps the
 * teacher's paste in the textarea (it lives in this component tree, so it is
 * gone) — but it must not dump a raw stack or leave a dead page. This offers
 * the two things that actually help: retry, or start a fresh, empty map.
 */
export default function ToolError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="mx-auto w-full max-w-2xl px-5 py-16 text-center sm:px-8">
      <p className="eyebrow">The tool hit a fault</p>
      <h1 className="mt-3 text-[clamp(1.6rem,4vw,2.2rem)]">That map didn&apos;t finish</h1>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/65">
        Something failed while building this page. Your saved maps are still in this browser, and nothing
        was sent anywhere — analysis is a single request that either returns a result or does not.
      </p>
      {error?.digest && (
        <p className="mt-2 text-xs text-ink/40">
          Reference: <code className="rounded bg-ink/8 px-1.5 py-0.5">{error.digest}</code>
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/tool" className="btn btn-outline">
          Start a fresh map
        </Link>
        <Link href="/settings" className="btn btn-ghost">
          Check saved data
        </Link>
      </div>
    </main>
  );
}
