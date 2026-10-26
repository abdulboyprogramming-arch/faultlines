"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { setToggle, isOn, TOGGLE_KEY } from "@/lib/prefs";
import { TOURS, type TourId, type TourStep } from "@/lib/tour";
import { useT } from "@/lib/use-i18n";

/**
 * The first-timer walkthrough.
 *
 * A spotlight cut out of a dark scrim, an arrow and a card that explains the
 * area in front of the teacher, one step at a time. It runs itself once on a
 * fresh browser, and can be replayed any time from Settings or the "Show me
 * around" button — which is the part most tours forget.
 *
 * Implementation notes:
 *  - Anchors are `data-tour="…"` attributes, so the tour never depends on CSS
 *    class names or DOM order.
 *  - Steps whose anchor is missing are dropped, so the same tour is valid on a
 *    fresh composer and on a report page.
 *  - The scrim uses `box-shadow: 0 0 0 9999px` on the highlight rather than four
 *    overlay divs: one element, no seams, works at any size.
 *  - Keyboard: ← → to move, Esc to leave, Enter to advance. Focus is moved into
 *    the card and restored afterwards.
 */

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 6;

export default function TourHost() {
  const t = useT();
  const pathname = usePathname();
  const [tour, setTour] = useState<TourId | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const finish = useCallback(() => {
    setTour(null);
    setIndex(0);
    setRect(null);
    setToggle(TOGGLE_KEY.tourDone, true);
  }, []);

  const begin = useCallback((id: TourId) => {
    const available = TOURS[id].filter(
      (s) => typeof document !== "undefined" && document.querySelector(`[data-tour="${s.target}"]`),
    );
    if (available.length === 0) return;
    setSteps(available);
    setIndex(0);
    setTour(id);
  }, []);

  // First visit: offer the walkthrough once, on the page that has one.
  useEffect(() => {
    if (isOn(TOGGLE_KEY.tourDone, "off")) return;
    if (pathname !== "/tool" && pathname !== "/") return;
    const id = setTimeout(() => begin(pathname === "/tool" ? "tool" : "landing"), 900);
    return () => clearTimeout(id);
  }, [pathname, begin]);

  // Manual start: `startTour("report")` / Settings replay button.
  useEffect(() => {
    const onStart = (e: Event) => {
      const id = (e as CustomEvent<TourId>).detail;
      if (id && id in TOURS) begin(id);
    };
    window.addEventListener("faultlines:tour", onStart);
    return () => window.removeEventListener("faultlines:tour", onStart);
  }, [begin]);

  const step = tour ? steps[index] : undefined;

  // Measure the anchor, keep the measurement honest while the page moves.
  useEffect(() => {
    if (!step) return;
    // Measurement is asynchronous on purpose: the first call happens in the
    // next frame (after `scrollIntoView`), so React never sees a synchronous
    // setState from an effect body.
    const measure = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step]);

  // Keyboard control.
  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        setIndex((i) => {
          if (i >= steps.length - 1) {
            finish();
            return i;
          }
          return i + 1;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tour, steps.length, finish]);

  const placeBelow = useMemo(() => {
    if (!rect) return true;
    const viewport = typeof window === "undefined" ? 800 : window.innerHeight;
    return rect.top + rect.height / 2 < viewport / 2;
  }, [rect]);

  if (!tour || !step) return null;

  const cardTop = rect
    ? placeBelow
      ? Math.min(rect.top + rect.height + PAD + 14, (typeof window === "undefined" ? 800 : window.innerHeight) - 260)
      : Math.max(16, rect.top - PAD - 14 - 220)
    : 120;
  const cardLeft = rect
    ? Math.min(
        Math.max(16, rect.left + rect.width / 2 - 190),
        (typeof window === "undefined" ? 1000 : window.innerWidth) - 396,
      )
    : 16;

  return (
    <div className="no-print fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Scrim: the highlight is a hole cut with a huge box-shadow. */}
      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-lg transition-all duration-300"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: "0 0 0 9999px rgba(20, 17, 14, 0.62)",
            outline: "2px solid var(--color-ochre)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-ink/60" />
      )}

      {/* Clicking the scrim advances, like every good tour. */}
      <button
        type="button"
        aria-label={t("dismiss")}
        tabIndex={-1}
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={() => (index >= steps.length - 1 ? finish() : setIndex(index + 1))}
      />

      <div
        className="absolute w-[min(92vw,23.5rem)] animate-fade-up rounded-xl border border-ink/15 bg-card p-4 shadow-[var(--shadow-pop)]"
        style={{ top: cardTop, left: cardLeft }}
      >
        {/* Arrow pointing at the target */}
        {rect && (
          <span
            aria-hidden="true"
            className="absolute h-3 w-3 rotate-45 border-ink/15 bg-card"
            style={{
              left: Math.min(
                Math.max(24, rect.left + rect.width / 2 - cardLeft - 6),
                23.5 * 16 - 40,
              ),
              ...(placeBelow
                ? { top: -7, borderLeftWidth: 1, borderTopWidth: 1 }
                : { bottom: -7, borderRightWidth: 1, borderBottomWidth: 1 }),
            }}
          />
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="chip border-rust/35 bg-rust/10 text-rust">
            {t("tourStepCount", { n: index + 1, total: steps.length })}
          </span>
          <button type="button" onClick={finish} className="text-xs text-ink/45 hover:text-ink">
            {t("tourSkip")}
          </button>
        </div>

        <h2 id="tour-title" className="mt-2.5 font-display text-lg leading-snug">
          {t(step.title)}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{t(step.body)}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-rust" : "bg-ink/20"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIndex(index - 1)}>
                {t("tourBack")}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => (index >= steps.length - 1 ? finish() : setIndex(index + 1))}
            >
              {index >= steps.length - 1 ? t("tourDone") : t("tourNext")}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
