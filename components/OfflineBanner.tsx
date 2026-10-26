"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/lib/use-i18n";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Quiet offline indicator. Fault Lines genuinely keeps working without a
 * network (examples, history, in-browser analysis), so this says what still
 * works instead of pretending the app is broken.
 */
export default function OfflineBanner() {
  const t = useT();
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );

  if (online) return null;

  return (
    <div
      role="status"
      className="no-print fixed bottom-4 left-4 z-40 max-w-[min(88vw,20rem)] animate-fade-in rounded-lg border border-ochre/50 bg-card px-3.5 py-2.5 text-xs leading-relaxed text-ink/75 shadow-[var(--shadow-lift)]"
    >
      <span className="flex items-center gap-2 font-medium text-ink">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ochre" aria-hidden="true" />
        {t("offlineBannerTitle")}
      </span>
      <span className="mt-1 block">
        {t("offlineBannerBody")}
      </span>
    </div>
  );
}
