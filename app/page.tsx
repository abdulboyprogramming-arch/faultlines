import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-rust/30 to-slate/30" />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="font-display text-6xl md:text-7xl">Fault Lines</h1>
          <p className="mt-4 text-xl text-ink/70">
            Every class has fault lines. See them before the exam does.
          </p>
          <p className="mt-6 text-ink/60 max-w-2xl mx-auto">
            Paste your class's written answers to one question. In about ten seconds, Fault Lines
            reveals the four different ways your class is thinking, how many share each one, and
            which will cost them on the exam — with their own words as evidence and a five-minute
            reteach plan for each.
          </p>
          <Link
            href="/tool"
            className="inline-block mt-8 px-8 py-3 bg-ink text-paper rounded-md font-ui text-lg"
          >
            Map my class
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="border border-ink/10 rounded-md p-6">
          <h2 className="font-display text-2xl">For teachers</h2>
          <p className="text-sm text-ink/70 mt-2">
            Mark 120 scripts, write "see me" on 30, and still miss the one belief the whole class shares.
            Fault Lines makes that belief visible.
          </p>
        </div>
        <div className="border border-ink/10 rounded-md p-6">
          <h2 className="font-display text-2xl">Not a grader</h2>
          <p className="text-sm text-ink/70 mt-2">
            An answer is not a mark. It's evidence of a belief. We group by belief, name it, and rank
            by damage — misconception cartography, not scoring.
          </p>
        </div>
        <div className="border border-ink/10 rounded-md p-6">
          <h2 className="font-display text-2xl">Honest about gaps</h2>
          <p className="text-sm text-ink/70 mt-2">
            When an answer is too vague to classify, it says "Not sure — needs your eyes" instead of
            inventing a misconception. Trust over hallucination.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-ink/60">
          Browser extension and additional platforms coming soon. Available now on web, PWA, GitHub Pages, and Vercel.
        </p>
        <Link href="/tool" className="text-rust underline">
          Open the tool →
        </Link>
      </section>
    </main>
  );
}
