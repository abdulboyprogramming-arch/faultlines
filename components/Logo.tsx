export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-label="Fault Lines logo">
      <rect x="10" y="10" width="100" height="20" fill="#B5471F" className="animate-pulse" />
      <rect x="10" y="34" width="70" height="20" fill="#C98A2E" />
      <rect x="10" y="58" width="40" height="20" fill="#3E5C63" />
      <rect x="10" y="82" width="12" height="20" fill="#14110E" opacity="0.4" />
      <path d="M10 32 Q60 28 110 32" stroke="#14110E" strokeWidth="1" fill="none" />
      <path d="M10 56 Q60 52 110 56" stroke="#14110E" strokeWidth="1" fill="none" />
      <path d="M10 80 Q60 76 110 80" stroke="#14110E" strokeWidth="1" fill="none" />
    </svg>
  );
}
