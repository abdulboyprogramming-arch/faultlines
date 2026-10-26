import Logo from "./Logo";

/**
 * Programmatic animated loading object: four strata bands breathing
 * top-to-bottom (like a core sample being read), under the animated logo.
 * Pure CSS keyframes — zero assets, works offline, reduced-motion safe.
 * Used by route `loading.tsx` files and the tool's analysing state.
 */
export default function StrataLoader({
  label = "Reading the strata…",
  fullPage = false,
}: {
  label?: string;
  fullPage?: boolean;
}) {
  const bands = [
    { color: "bg-rust", width: "92%", delay: "0ms" },
    { color: "bg-ochre", width: "68%", delay: "140ms" },
    { color: "bg-slate", width: "46%", delay: "280ms" },
    { color: "bg-ink/70", width: "24%", delay: "420ms" },
  ];
  const inner = (
    <div className="flex flex-col items-center gap-5" role="status" aria-live="polite" aria-label={label}>
      <Logo className="w-16 h-16" variant="animated" />
      <div className="w-56 space-y-1.5" aria-hidden="true">
        {bands.map((b, i) => (
          <div key={i} className="h-2.5 bg-ink/5 rounded-sm overflow-hidden">
            <div
              className={`h-full origin-left rounded-sm animate-strata-load ${b.color}`}
              style={{ width: b.width, animationDelay: b.delay }}
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-ink/60 font-ui animate-pulse-soft">{label}</p>
    </div>
  );
  return fullPage ? (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">{inner}</main>
  ) : (
    inner
  );
}
