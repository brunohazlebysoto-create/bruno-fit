// Service worker de BrunoFit.
//
// Antes solo hacía passthrough (`fetch(e.request)`) para cumplir el requisito
// de instalación de PWA: no guardaba nada, así que cualquier fallo de red o de
// CDN dejaba la app sin abrir. Ahora guarda sus propios archivos, que desde el
// bundle son autosuficientes, y la app arranca aunque no haya conexión.
//
// La versión la sella tools/build.mjs en cada `npm run build`.
const VERSION = "v2026.07.29-W66";
const CACHE = "brunofit-" + VERSION;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;

  // index.html: primero la red. Si se sirviera de caché, un despliegue nuevo
  // podría no llegar nunca al navegador (el HTML es quien apunta al bundle).
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => { guardar(req, res.clone()); return res; })
        .catch(() => caches.match(req).then(c => c || caches.match("./index.html")))
    );
    return;
  }

  // Archivos propios: caché primero. app.bundle.js y style.css llevan la
  // versión en la URL, así que una versión nueva es una URL nueva y no hay
  // riesgo de servir código viejo.
  if (propio) {
    e.respondWith(
      caches.match(req).then(cacheado => cacheado || fetch(req).then(res => {
        guardar(req, res.clone());
        return res;
      }))
    );
    return;
  }

  // Todo lo externo (tipografías, APIs): red, y la caché solo como red de
  // seguridad. Nunca se sirve una respuesta de IA guardada.
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});

function guardar(req, res) {
  if (!res || res.status !== 200 || res.type === "opaque") return;
  caches.open(CACHE).then(c => c.put(req, res)).catch(() => {});
}
