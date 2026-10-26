"use client";

import type { Suggestion } from "@/lib/suggest";
import { useT } from "@/lib/use-i18n";

/**
 * The dropdown behind both autocomplete features.
 *
 * Presentational only: the field owns the open/closed state and the active
 * index, so the keyboard model (`↑ ↓ Tab Enter Esc`) stays in one place and
 * behaves identically in the question field, the answers box and the history
 * search.
 *
 * Mouse users get `onMouseDown` with `preventDefault` so clicking a suggestion
 * never blurs the field — the classic bug that makes a dropdown disappear just
 * before the click lands.
 */
export default function SuggestionList({
  id,
  items,
  active,
  label,
  onPick,
  onHover,
  className = "",
}: {
  id: string;
  items: Suggestion[];
  active: number;
  label: string;
  onPick: (value: string) => void;
  onHover: (index: number) => void;
  className?: string;
}) {
  const t = useT();
  if (items.length === 0) return null;

  return (
    <div
      id={id}
      role="listbox"
      aria-label={label}
      className={`absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-ink/15 bg-card shadow-[var(--shadow-lift)] animate-fade-in ${className}`}
    >
      {items.map((item, i) => (
        <button
          key={`${item.source}-${item.value}`}
          type="button"
          role="option"
          id={`${id}-${i}`}
          aria-selected={i === active}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(item.value)}
          onMouseEnter={() => onHover(i)}
          className={`flex w-full items-start gap-2 px-3 py-2 text-start text-sm transition-colors ${
            i === active ? "bg-rust/[0.08] text-ink" : "text-ink/75 hover:bg-ink/[0.04]"
          }`}
        >
          <span className="mt-0.5 shrink-0 text-[0.6rem] uppercase tracking-[0.1em] text-ink/35">
            {item.source === "answer"
              ? t("suggestAnswer")
              : item.source === "belief"
                ? t("suggestBelief")
                : t("suggestQuestion")}
          </span>
          <span className="min-w-0 flex-1 truncate">{item.value}</span>
        </button>
      ))}
      <p className="border-t border-ink/10 px-3 py-1.5 text-[0.65rem] text-ink/40">{t("suggestHint")}</p>
    </div>
  );
}
