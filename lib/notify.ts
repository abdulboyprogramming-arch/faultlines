"use client";

import { useSyncExternalStore } from "react";

/**
 * Completion notifications.
 *
 * Teachers start a map and switch tab to mark, or walk away from the laptop.
 * When the analysis lands, a system notification brings them back — but only if
 * they asked for one in Settings and granted permission, and never with student
 * content in the body (a notification can appear on a lock screen).
 *
 * Design constraints:
 *  - The body carries counts only: "28 answers · 5 beliefs". No quotes, no
 *    question text, nothing identifying a class.
 *  - Prefers the service worker (`registration.showNotification`) because that
 *    is the only path that works on mobile Chrome and when the tab is hidden.
 *  - Degrades silently: unsupported browser, denied permission or a blocked API
 *    is a no-op, never an error the teacher has to deal with.
 */

export type Permission = "default" | "granted" | "denied" | "unsupported";

export function notificationPermission(): Permission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as Permission;
}

/** Ask once, when the teacher turns the setting on. Never on page load. */
export async function requestNotificationPermission(): Promise<Permission> {
  if (notificationPermission() === "unsupported") return "unsupported";
  if (Notification.permission !== "default") return Notification.permission as Permission;
  try {
    return (await Notification.requestPermission()) as Permission;
  } catch {
    return "denied";
  }
}

/** True when a notification can actually be shown right now. */
export function canNotify(): boolean {
  return notificationPermission() === "granted";
}

/**
 * Show "your map is ready". Returns whether anything was displayed, so callers
 * can fall back to the in-page toast without guessing.
 */
export async function notifyReady(title: string, body: string): Promise<boolean> {
  if (!canNotify()) return false;
  const options: NotificationOptions = {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    // `tag` collapses repeats: a second map replaces the first notification
    // instead of stacking up a wall of them.
    tag: "faultlines-map-ready",
    data: { url: "/tool" },
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    /* fall through to the plain Notification constructor */
  }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/**
 * Permission state as an external store, so components read it without an
 * effect (and without the server/client mismatch that `Notification.permission`
 * read during render would cause).
 */
export function useNotificationPermission(): Permission {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("focus", callback);
      document.addEventListener("visibilitychange", callback);
      return () => {
        window.removeEventListener("focus", callback);
        document.removeEventListener("visibilitychange", callback);
      };
    },
    () => notificationPermission(),
    () => "default" as Permission,
  );
}
