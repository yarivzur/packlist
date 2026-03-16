const CACHE_NAME = "packlist-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// Network-first strategy: serve fresh when online, fall back to cache
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  // Only cache same-origin navigation requests
  if (url.origin !== self.location.origin) return;
  if (!event.request.headers.get("accept")?.includes("text/html")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
