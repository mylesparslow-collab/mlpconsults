// Keeps the dashboard shell available offline; data always comes from the network.
const C = "mlp-dash-v1";
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(["/dash/"]))); self.skipWaiting(); });
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.pathname.startsWith("/api/") || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(C).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
