"use client";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show || !deferred) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-ink text-paper px-5 py-3 rounded-md shadow-lg flex gap-3 items-center z-50">
      <span className="text-sm">Install Fault Lines?</span>
      <button
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
      <button onClick={() => setShow(false)} className="text-sm opacity-70">
        Not now
      </button>
    </div>
  );
}
