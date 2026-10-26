import SiteHeader from "@/components/SiteHeader";
import StrataGame from "@/components/StrataGame";

export const metadata = { title: "Strata Drop — the Fault Lines game" };

export default function Play() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12 animate-fade-up">
        <h1 className="font-display text-5xl text-center">Strata Drop</h1>
        <p className="text-center text-ink/70 mt-3 max-w-lg mx-auto">
          Our own little drilling game — the same one that keeps you company on 404s and offline moments.
          Fully programmatic, zero downloads, works on any device.
        </p>
        <div className="mt-8">
          <StrataGame />
        </div>
      </main>
    </div>
  );
}
