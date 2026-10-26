"use client";

import type { ReactNode } from "react";
import { locales, type I18nKey } from "@/lib/i18n";
import { useLocale } from "@/lib/use-i18n";

type Vars = Record<string, ReactNode>;

/**
 * Translate inside a *server* component.
 *
 * Most of the app is client-side and uses `useT()`, but the landing page, the
 * privacy page and the status pages are rendered on the server for speed and
 * for static generation. They cannot read `localStorage`, so `T` is the small
 * client island that does it for them: the server renders the English string,
 * then the island swaps in the reader's language after hydration.
 *
 * `vars` values may be any node — strings, numbers, or markup like `<strong>` —
 * which is how translated sentences keep their emphasis:
 *
 *   <T k="offlineBody" vars={{ strong: <strong>…</strong> }} />
 */
export default function T({ k, vars }: { k: I18nKey; vars?: Vars }) {
  const locale = useLocale();
  const dict = (locales[locale] ?? locales.en) as Record<string, string>;
  const template = dict[k] ?? locales.en[k] ?? k;
  if (!vars) return <>{template}</>;

  // Split on `{placeholder}` boundaries, keeping the delimiters.
  const parts = template.split(/(\{[a-zA-Z0-9_]+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = /^\{([a-zA-Z0-9_]+)\}$/.exec(part);
        if (!match) return part;
        const value = vars[match[1]];
        return value === undefined ? part : <span key={i}>{value}</span>;
      })}
    </>
  );
}
