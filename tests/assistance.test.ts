import { beforeEach, describe, expect, it, vi } from "vitest";
import { isOn, setToggle, TOGGLE_KEY, TOGGLES } from "@/lib/prefs";
import { canNotify, notificationPermission, requestNotificationPermission } from "@/lib/notify";
import { TOURS, startTour } from "@/lib/tour";
import en from "@/lib/i18n/en";

class MemStorage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

beforeEach(() => {
  vi.stubGlobal("localStorage", new MemStorage());
});

describe("assistant preferences", () => {
  it("ships with safe defaults: suggestions on, notifications off", () => {
    expect(isOn(TOGGLE_KEY.suggest, "on")).toBe(true);
    expect(isOn(TOGGLE_KEY.historySuggest, "on")).toBe(true);
    expect(isOn(TOGGLE_KEY.notify, "off")).toBe(false);
  });

  it("remembers a change across reads", () => {
    setToggle(TOGGLE_KEY.suggest, false);
    expect(isOn(TOGGLE_KEY.suggest, "on")).toBe(false);
    setToggle(TOGGLE_KEY.suggest, true);
    expect(isOn(TOGGLE_KEY.suggest, "on")).toBe(true);
  });

  it("only stores the two documented values", () => {
    expect(TOGGLES).toEqual(["on", "off"]);
    setToggle(TOGGLE_KEY.notify, true);
    expect(localStorage.getItem(TOGGLE_KEY.notify)).toBe("on");
  });

  it("survives blocked storage instead of throwing", () => {
    const hostile = {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); },
    };
    vi.stubGlobal("localStorage", hostile);
    expect(() => setToggle(TOGGLE_KEY.notify, true)).not.toThrow();
    expect(isOn(TOGGLE_KEY.notify, "on")).toBe(true);
  });
});

describe("completion notifications", () => {
  it("reports unsupported when the API is missing", async () => {
    expect(notificationPermission()).toBe("unsupported");
    expect(canNotify()).toBe(false);
    expect(await requestNotificationPermission()).toBe("unsupported");
  });

  it("never pretends a notification was shown", async () => {
    const { notifyReady } = await import("@/lib/notify");
    expect(await notifyReady("title", "body")).toBe(false);
  });

  it("respects a denied browser permission", async () => {
    const NotificationStub = { permission: "denied", requestPermission: vi.fn() };
    vi.stubGlobal("Notification", NotificationStub);
    vi.stubGlobal("window", { Notification: NotificationStub });
    expect(notificationPermission()).toBe("denied");
    expect(canNotify()).toBe(false);
  });
});

describe("tour definitions", () => {
  it("every step targets a real key and a non-empty anchor", () => {
    for (const [id, steps] of Object.entries(TOURS)) {
      expect(steps.length, id).toBeGreaterThan(0);
      for (const step of steps) {
        expect(step.target.length, `${id}/${step.target}`).toBeGreaterThan(0);
        expect(Object.keys(en), `${id}/${step.title}`).toContain(step.title);
        expect(Object.keys(en), `${id}/${step.body}`).toContain(step.body);
      }
    }
  });

  it("broadcasts a start event without touching the DOM", () => {
    const listener = vi.fn();
    vi.stubGlobal("window", {
      dispatchEvent: (e: Event) => listener(e),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    startTour("report");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
