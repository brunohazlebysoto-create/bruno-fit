// Minimal SW — PWA install only, no caching (IndexedDB handles compiled JS cache)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// fetch handler requerido por Chrome para habilitar instalación PWA
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request));
});
