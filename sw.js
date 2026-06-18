const CACHE_NAME = "brunofit-cache-v7";
const ASSETS = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalar el Service Worker y precargar recursos básicos
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de red primero (Network First) con fallback a caché
self.addEventListener("fetch", (e) => {
  // Solo manejar peticiones GET y evitar APIs externas dinámicas
  if (
    e.request.method !== "GET" || 
    e.request.url.includes("googleapis.com") || 
    e.request.url.includes("kvdb.io")
  ) {
    return;
  }
  
  e.respondWith(
    // "no-store" evita que la caché HTTP del navegador sirva versiones viejas;
    // la caché offline propia (CACHE_NAME) sigue siendo el respaldo sin red.
    fetch(e.request, { cache: "no-store" })
      .then((res) => {
        // Clonar y guardar en caché el recurso más nuevo si la red funciona
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // Si no hay red, servir desde la caché
        return caches.match(e.request);
      })
  );
});

