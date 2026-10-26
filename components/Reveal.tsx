"use client";

import { useEffect, useRef, useState } from "react";

type Tag = "div" | "li" | "section" | "article";

/**
 * Scroll-in reveal, used sparingly on landing sections.
 *
 * Progressive enhancement: `globals.css` only hides `.reveal` under
 * `html.has-js`, and reduced-motion users always see content immediately. The
 * observer disconnects after the first reveal so nothing keeps running.
 *
 * `as` keeps the markup valid — a wrapper inside `<ol>` must itself be an `<li>`.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** ms */
  delay?: number;
  as?: Tag;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // No observer (or motion is unwanted): show the content immediately.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
