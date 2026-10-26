"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show || !deferred) return null;

  return (
    <div className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 bg-ink text-paper px-5 py-3 rounded-md shadow-lg flex gap-3 items-center z-50">
      <span className="text-sm">Install Fault Lines?</span>
      <button
        type="button"
        onClick={async () => {
          deferred.prompt();
          await deferred.userChoice;
          setShow(false);
          setDeferred(null);
        }}
        className="px-3 py-1 bg-rust rounded text-sm"
      >
        Install
      </button>
      <button type="button" onClick={() => setShow(false)} className="text-sm opacity-70">
        Not now
      </button>
    </div>
  );
}
