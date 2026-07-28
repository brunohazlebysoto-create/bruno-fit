#!/usr/bin/env node
/**
 * Verifica que el index.html REAL (el que se despliega) arranca la app.
 *
 * tools/preview.mjs genera un HTML propio, así que probarlo no dice nada del
 * cargador de producción. Este script sirve el repo tal cual por HTTP, lo abre
 * en Chromium SIN salida a internet y comprueba que:
 *   - el preloader desaparece (la app montó y disparó 'load-completed')
 *   - el árbol de React tiene contenido
 *   - no hubo errores de página ni la pantalla roja de error crítico
 *
 * Es la red de seguridad del camino app.bundle.js → Babel: si el bundle falta,
 * está corrupto o el cargador se rompe, esto falla en vez de descubrirse en
 * producción.
 *
 *   npm run verify
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = 4173;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
};

function buscarChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const raiz = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (raiz && existsSync(raiz)) {
    const encontrado = readdirSync(raiz)
      .filter((d) => d.startsWith("chromium-"))
      .sort()
      .reverse()
      .map((d) => join(raiz, d, "chrome-linux", "chrome"))
      .find((p) => existsSync(p));
    if (encontrado) return encontrado;
  }
  for (const p of ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

// Con --sin-bundle se simula el peor caso: no hay bundle y tampoco red para
// bajar Babel. La app no puede arrancar; lo que se comprueba es que avisa con
// un mensaje claro y un botón de reintento, no con la pantalla roja de
// "PROMESA RECHAZADA", que no explica nada ni deja salida.
const sinBundle = process.argv.includes("--sin-bundle");

const server = createServer(async (req, res) => {
  let ruta = decodeURIComponent(req.url.split("?")[0]);
  if (ruta === "/") ruta = "/index.html";
  if (sinBundle && ruta === "/app.bundle.js") { res.writeHead(404); res.end("no"); return; }
  const archivo = join(root, normalize(ruta).replace(/^(\.\.[/\\])+/, ""));
  try {
    const buf = await readFile(archivo);
    res.writeHead(200, { "content-type": MIME[extname(ruta)] || "application/octet-stream" });
    res.end(buf);
  } catch {
    res.writeHead(404);
    res.end("no encontrado");
  }
});
await new Promise((r) => server.listen(PUERTO, "127.0.0.1", r));

const browser = await chromium.launch({ executablePath: buscarChromium() });
const page = await browser.newPage({
  viewport: { width: 420, height: 900 },
  timezoneId: "America/Santiago",
  locale: "es-CL",
});

const errores = [];
page.on("pageerror", (e) => errores.push("pageerror: " + e.message.slice(0, 200)));
// Los errores de consola por recursos no traen la URL; se registra la petición
page.on("requestfailed", (r) => errores.push("no cargó: " + r.url()));
page.on("response", (r) => {
  if (r.status() >= 400) errores.push(`HTTP ${r.status()}: ${r.url()}`);
});
// Sin red externa: así se comprueba que la app NO depende de ningún CDN.
await page.route("**://**", (route) => {
  const url = route.request().url();
  return url.startsWith(`http://127.0.0.1:${PUERTO}`) ? route.continue() : route.abort();
});

await page.goto(`http://127.0.0.1:${PUERTO}/`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(4000);

const estado = await page.evaluate(() => ({
  preloader: !!document.getElementById("app-preloader"),
  nodos: document.getElementById("root")?.childElementCount ?? 0,
  pantallaError: /ERROR CRÍTICO|PROMESA RECHAZADA/.test(document.body.innerText),
  reintentar: [...document.querySelectorAll("button")].some(b => b.textContent === "Reintentar"),
  texto: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 160),
}));

const destino = process.argv.slice(2).find((a) => a.endsWith(".png"));
if (destino) await page.screenshot({ path: destino });

await browser.close();
server.close();

const fallos = [];

if (sinBundle) {
  // Aquí NO puede arrancar: lo correcto es fallar con explicación y salida
  if (estado.pantallaError) fallos.push("salió la pantalla roja en vez del aviso con reintento");
  if (!estado.reintentar) fallos.push("no apareció el botón Reintentar");
} else {
  // El cargador cae a Babel si el bundle falla; sin red eso también fallaría,
  // así que un arranque correcto aquí demuestra que el bundle hizo su trabajo.
  if (estado.preloader) fallos.push("el preloader sigue visible: la app no montó");
  if (!estado.nodos) fallos.push("#root quedó vacío");
  if (estado.pantallaError) fallos.push("se mostró la pantalla de error crítico");
  // Los errores de red de las fuentes de Google son esperables y no rompen nada
  const relevantes = errores.filter((e) => !/fonts\.(googleapis|gstatic)\.com/.test(e));
  if (relevantes.length) fallos.push(...relevantes);
}

if (fallos.length) {
  console.error(`✗ index.html NO se comporta como debe${sinBundle ? " sin bundle" : ""}:`);
  fallos.forEach((f) => console.error("  · " + f));
  process.exit(1);
}
if (sinBundle) console.log("✓ sin bundle ni red: avisa con un mensaje claro y botón de reintento");
else {
  console.log(`✓ index.html arranca sin CDN · ${estado.nodos} nodo(s) en #root`);
  console.log(`  primeras palabras: ${estado.texto}`);
}
if (destino) console.log(`  captura: ${destino}`);
