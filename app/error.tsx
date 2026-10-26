"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="max-w-xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-6xl">Something broke</h1>
      <p className="mt-4 text-ink/70">Try again or head home.</p>
      <button onClick={reset} className="mt-6 px-4 py-2 bg-ink text-paper rounded-md">Retry</button>
    </main>
  );
}
