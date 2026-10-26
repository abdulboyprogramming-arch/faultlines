"use client";

import { useStoredChoice } from "./use-local-store";

/**
 * Assistant preferences.
 *
 * Every helper the app adds on top of the core loop is optional and remembered
 * per browser — a teacher who finds suggestions noisy turns them off once and
 * never sees them again. Stored under `faultlines-*` so Settings → "Clear all
 * local data" resets everything, and so backup/restore carries them.
 *
 * Values are the strings "on" / "off" (not booleans) because `localStorage`
 * only holds strings and a boolean wrapper here would be the only place in the
 * codebase that lies about that.
 */
export type Toggle = "on" | "off";
export const TOGGLE_KEY = {
  suggest: "faultlines-pref-suggest",
  historySuggest: "faultlines-pref-history-suggest",
  notify: "faultlines-pref-notify",
  tourDone: "faultlines-pref-tour-done",
} as const;

export const TOGGLES: readonly Toggle[] = ["on", "off"];

/** Answer autocomplete in the composer. On by default. */
export function useSuggestPref(): [boolean, (on: boolean) => void] {
  return useToggle(TOGGLE_KEY.suggest, "on");
}

/** Search suggestions in the saved-maps rail. On by default. */
export function useHistorySuggestPref(): [boolean, (on: boolean) => void] {
  return useToggle(TOGGLE_KEY.historySuggest, "on");
}

/** Browser notification when a map finishes. Off by default (needs permission). */
export function useNotifyPref(): [boolean, (on: boolean) => void] {
  return useToggle(TOGGLE_KEY.notify, "off");
}

export function useToggle(key: string, fallback: Toggle): [boolean, (on: boolean) => void] {
  const value = useStoredChoice<Toggle>(key, fallback, TOGGLES);
  return [value === "on", (on: boolean) => setToggle(key, on)];
}

export function setToggle(key: string, on: boolean): void {
  try {
    localStorage.setItem(key, on ? "on" : "off");
  } catch {
    /* storage blocked — the toggle still applies for this session */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("faultlines:storage"));
  }
}

export function isOn(key: string, fallback: Toggle = "off"): boolean {
  try {
    return (localStorage.getItem(key) ?? fallback) === "on";
  } catch {
    return fallback === "on";
  }
}
