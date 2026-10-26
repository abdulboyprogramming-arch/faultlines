/**
 * Fault Lines logo — fully programmatic (SVG, no image assets).
 *
 * Design: four geological strata (rust / ochre / slate / ink — the brand
 * palette and the risk language of the product) split by a hand-drawn fault
 * crack. The right block is displaced downward along the fault, the way real
 * strata slip. Two variants:
 *  - `static`  — print/favicon-safe mark.
 *  - `animated`— crack draws itself in on mount; every ~3s the two blocks
 *    micro-slip along the fault (seismic keyframes), then settle. Respects
 *    prefers-reduced-motion via globals.css.
 */
export default function Logo({
  className = "",
  variant = "animated",
  title = "Fault Lines logo",
}: {
  className?: string;
  variant?: "static" | "animated";
  title?: string;
}) {
  const animated = variant === "animated";
  const uid = animated ? "a" : "s";
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`fl-rust-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C65327" />
          <stop offset="100%" stopColor="#9E3D18" />
        </linearGradient>
        <linearGradient id={`fl-ochre-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D9A03C" />
          <stop offset="100%" stopColor="#B57C22" />
        </linearGradient>
        <linearGradient id={`fl-slate-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4A6E76" />
          <stop offset="100%" stopColor="#31494F" />
        </linearGradient>
        <clipPath id={`fl-left-${uid}`}>
          <path d="M6 6 H58 L52 30 L62 52 L50 76 L60 96 L54 114 H6 Z" />
        </clipPath>
        <clipPath id={`fl-right-${uid}`}>
          <path d="M58 6 H114 V114 H54 L60 96 L50 76 L62 52 L52 30 Z" />
        </clipPath>
      </defs>

      {/* Left block */}
      <g clipPath={`url(#fl-left-${uid})`} className={animated ? "logo-half-l" : undefined}>
        <rect x="6" y="8" width="108" height="24" fill={`url(#fl-rust-${uid})`} />
        <rect x="6" y="36" width="108" height="22" fill={`url(#fl-ochre-${uid})`} />
        <rect x="6" y="62" width="108" height="22" fill={`url(#fl-slate-${uid})`} />
        <rect x="6" y="88" width="108" height="24" fill="#14110E" opacity="0.85" />
      </g>

      {/* Right block — displaced down 6px along the fault, like real strata */}
      <g clipPath={`url(#fl-right-${uid})`} className={animated ? "logo-half-r" : undefined}>
        <g transform="translate(0 6)">
          <rect x="6" y="8" width="108" height="24" fill={`url(#fl-rust-${uid})`} />
          <rect x="6" y="36" width="108" height="22" fill={`url(#fl-ochre-${uid})`} />
          <rect x="6" y="62" width="108" height="22" fill={`url(#fl-slate-${uid})`} />
          <rect x="6" y="88" width="108" height="24" fill="#14110E" opacity="0.85" />
        </g>
      </g>

      {/* Hairline bedding planes */}
      <path d="M6 34 H114 M6 60 H114 M6 86 H114" stroke="#F4F1EA" strokeWidth="1.4" opacity="0.5" />

      {/* The fault crack */}
      <path
        d="M58 6 L52 30 L62 52 L50 76 L60 96 L54 114"
        fill="none"
        stroke="#F4F1EA"
        strokeWidth="2.4"
        strokeLinejoin="round"
        className={animated ? "logo-crack" : undefined}
      />
      <path
        d="M58 6 L52 30 L62 52 L50 76 L60 96 L54 114"
        fill="none"
        stroke="#14110E"
        strokeWidth="0.8"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* Evidence core-sample dot on the biggest (rust/high-risk) stratum */}
      <circle cx="88" cy="20" r="4" fill="#F4F1EA" opacity="0.9" />
      <circle cx="88" cy="20" r="1.8" fill="#B5471F" />
    </svg>
  );
}
