// Fault Lines service worker v3 — offline-first app shell.
// Precaches the core routes (including /offline with the built-in game),
// network-first for page navigations with an /offline fallback,
// cache-first for static assets, network-only for /api (fresh analysis,
// and the page falls back to the in-browser heuristic when offline).
const VERSION = "v5";
const CORE_CACHE = `faultlines-core-${VERSION}`;
const RUNTIME_CACHE = `faultlines-runtime-${VERSION}`;
const CORE = ["/", "/tool", "/settings", "/offline", "/play", "/privacy", "/manifest.json", "/icon.svg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((c) => c.addAll(CORE))
      .catch(() => {}) // a single missing asset must not block installation
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) return;

  // Page navigations: network-first, then cache, then the offline page (with the game).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/offline")) || Response.error()),
    );
    return;
  }

  // Static assets: cache-first, fill cache on miss.
  event.respondWith(
    caches.match(request).then((hit) =>
      hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      }).catch(() => hit || Response.error()),
    ),
  );
});
