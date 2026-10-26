import Link from "next/link";
import Logo from "./Logo";

export default function SiteHeader() {
  return (
    <header className="no-print border-b border-ink/10">
      <nav className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-display text-xl">
          <Logo className="w-7 h-7" /> Fault Lines
        </Link>
        <div className="flex items-center gap-4 text-sm font-ui">
          <Link href="/tool" className="hover:underline">Map my class</Link>
          <Link href="/settings" className="hover:underline">Settings</Link>
          <a href="https://github.com/abdulboyprogramming-arch/faultlines" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </div>
      </nav>
    </header>
  );
}
