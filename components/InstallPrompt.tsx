"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { t } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "faultlines-install-dismissed";
const REASK_MS = 14 * 24 * 60 * 60 * 1000;

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}
function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
}
function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    return Date.now() - at < REASK_MS;
  } catch { return false; }
}

/**
 * Cross-device install experience:
 * - Chromium (Android/desktop/tablet): native prompt via beforeinstallprompt.
 * - iOS Safari: step-by-step "Share → Add to Home Screen" sheet.
 * - Already installed / recently dismissed: stays silent.
 * - Registers the service worker and offers a one-tap reload when a new
 *   version is waiting (update toast).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        const check = () => { if (reg.waiting && navigator.serviceWorker.controller) setUpdateReady(true); };
        check();
        reg.addEventListener("updatefound", () => {
          reg.installing?.addEventListener("statechange", check);
        });
      }).catch(() => { /* offline-first is best-effort */ });
      let refreshed = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshed) { refreshed = true; location.reload(); }
      });
    }
    if (isStandalone() || recentlyDismissed()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const iosTimer = setTimeout(() => { if (isIOS() && !isStandalone()) setShowIOS(true); }, 2500);
    return () => { window.removeEventListener("beforeinstallprompt", handler); clearTimeout(iosTimer); };
  }, []);

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setDeferred(null);
    setShowIOS(false);
  }

  if (updateReady) {
    return (
      <div className="no-print fixed bottom-4 left-1/2 z-50 w-[min(92vw,26rem)] animate-slide-up rounded-lg bg-ink text-paper shadow-xl px-5 py-4 flex items-center gap-3" role="status">
        <Logo className="w-9 h-9 shrink-0" variant="static" />
        <p className="text-sm flex-1">A new version of Fault Lines is ready.</p>
        <button type="button" className="px-3 py-1.5 bg-rust rounded-md text-sm shrink-0" onClick={() => {
          navigator.serviceWorker.getRegistration().then((r) => r?.waiting?.postMessage({ type: "SKIP_WAITING" }));
        }}>Reload</button>
        <button type="button" aria-label="Dismiss" className="opacity-70 shrink-0" onClick={() => setUpdateReady(false)}>×</button>
      </div>
    );
  }

  if (!deferred && !showIOS) return null;

  return (
    <div className="no-print fixed bottom-4 left-1/2 z-50 w-[min(92vw,26rem)] animate-slide-up rounded-lg bg-ink text-paper shadow-xl p-5" role="dialog" aria-label={t("installTitle")}>
      <div className="flex items-start gap-3">
        <Logo className="w-11 h-11 shrink-0" />
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{t("installTitle")}</p>
          <p className="text-sm opacity-80 mt-1">{t("installBody")}</p>
        </div>
        <button type="button" aria-label={t("notNow")} className="opacity-70 text-lg leading-none" onClick={dismiss}>×</button>
      </div>
      {deferred ? (
        <div className="flex gap-2 mt-4">
          <button type="button" className="flex-1 px-4 py-2 bg-rust rounded-md text-sm font-ui hover:opacity-90" onClick={async () => {
            deferred.prompt();
            await deferred.userChoice;
            dismiss();
          }}>{t("install")}</button>
          <button type="button" className="px-4 py-2 border border-paper/30 rounded-md text-sm font-ui" onClick={dismiss}>{t("notNow")}</button>
        </div>
      ) : (
        <ol className="text-sm mt-4 space-y-1.5 list-decimal pl-5 opacity-90">
          <li>Tap the <strong>Share</strong> button in Safari&apos;s toolbar.</li>
          <li>Choose <strong>“Add to Home Screen”</strong>.</li>
          <li>Tap <strong>Add</strong> — Fault Lines now lives on your home screen, offline-ready.</li>
        </ol>
      )}
    </div>
  );
}
