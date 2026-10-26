"use client";

import { useSyncExternalStore } from "react";

/**
 * Small external-store helpers for browser-only state (localStorage, media
 * queries).
 *
 * Reading `localStorage` during render makes the server and the client disagree
 * — the usual cause of React hydration errors — and doing it inside an effect
 * with `setState` triggers an extra render pass. `useSyncExternalStore` is the
 * supported answer: the server (and the first hydration pass) uses the fallback,
 * then React re-renders with the real value and stays subscribed to changes.
 */

export const STORAGE_EVENT = "faultlines:storage";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

/** Call after writing to localStorage so subscribed components re-render. */
export function notifyStorageChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function read(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function useStoredString(key: string, fallback = ""): string {
  return useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
}

export function useStoredChoice<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  const raw = useStoredString(key, fallback);
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
