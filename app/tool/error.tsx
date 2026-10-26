"use client";

import { useEffect } from "react";
import Link from "next/link";
import T from "@/components/T";

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
      <p className="eyebrow">
        <T k="toolErrEyebrow" />
      </p>
      <h1 className="mt-3 text-[clamp(1.6rem,4vw,2.2rem)]">
        <T k="toolErrTitle" />
      </h1>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink/65">
        <T k="toolErrBody" />
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
          <T k="toolErrFresh" />
        </Link>
        <Link href="/settings" className="btn btn-ghost">
          <T k="toolErrSaved" />
        </Link>
      </div>
    </main>
  );
}
