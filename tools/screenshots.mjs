#!/usr/bin/env node
/**
 * Capturas de regresión visual.
 *
 * Recorre las vistas clave de la app en el preview local y guarda una imagen
 * por escena. Comparando contra las de referencia se detecta si un cambio
 * descolocó algo sin querer — justo lo que los tests unitarios no ven.
 *
 *   npm run shots            → captura en screenshots/actual/ y compara
 *   npm run shots:update     → acepta lo capturado como nueva referencia
 *
 * Requiere preview/index.html generado CON --freeze (reloj congelado), o las
 * capturas cambiarían cada día por la fecha y el saludo por hora.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, copyFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const previewFile = resolve(root, "preview/index.html");
const dirBase = resolve(root, "screenshots/base");
const dirActual = resolve(root, "screenshots/actual");
const dirDiff = resolve(root, "screenshots/diff");

const update = process.argv.includes("--update");
// Umbral por píxel (0-1): más bajo = más sensible al antialiasing
const THRESHOLD = 0.12;
// % de píxeles distintos que se tolera antes de marcar la escena como cambiada
const MAX_DIFF_PCT = 0.15;

if (!existsSync(previewFile)) {
  console.error("Falta preview/index.html. Ejecuta: npm run preview");
  process.exit(1);
}

/**
 * Escenas a capturar. `scroll` es el desplazamiento vertical en píxeles;
 * varias escenas por pestaña permiten cubrir secciones que quedan bajo el pliegue.
 */
const ESCENAS = [
  { id: "hoy-01-cabecera", tab: "Hoy", scroll: 0 },
  { id: "hoy-02-peso-y-preparacion", tab: "Hoy", scroll: 620 },
  { id: "hoy-03-macros-y-carbos", tab: "Hoy", scroll: 1150 },
  { id: "entreno-01-cabecera", tab: "Entreno", scroll: 0 },
  { id: "entreno-02-calendario", tab: "Entreno", scroll: 900 },
  { id: "entreno-03-detalle-sesion", tab: "Entreno", scroll: 1700 },
  // El detalle de una sesión solo existe tras elegir un día entrenado en el
  // calendario: sin este clic, el orden de ejercicios no se ve en ninguna captura
  {
    id: "entreno-04-orden-sesion",
    tab: "Entreno",
    scroll: 900,
    accion: async (page) => { await page.getByText("27", { exact: true }).first().click({ timeout: 5000 }); },
    scrollDespues: 900,
  },
  {
    id: "entreno-05-secuencia-y-fatiga",
    tab: "Entreno",
    scroll: 900,
    accion: async (page) => { await page.getByText("27", { exact: true }).first().click({ timeout: 5000 }); },
    scrollDespues: 450,
  },
  {
    // Panel abierto: es donde se registran las series y donde se reordenan
    id: "entreno-06-series-de-un-ejercicio",
    tab: "Entreno",
    scroll: 900,
    accion: async (page) => {
      await page.getByText("27", { exact: true }).first().click({ timeout: 5000 });
      await page.waitForTimeout(700);
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /Prensa de piernas/ }).first().click({ timeout: 5000 });
    },
    scrollDespues: 600,
  },
  {
    // El mapa muscular y las tarjetas de balance viven en un modal: sin abrirlo
    // ninguna captura cubría el panel donde el mapa se pintaba en blanco
    id: "entreno-07-mapa-muscular",
    tab: "Entreno",
    scroll: 0,
    accion: async (page) => { await page.getByRole("button", { name: "Agente" }).first().click({ timeout: 5000 }); },
    scrollDespues: 0,
  },
  { id: "entreno-08-balance-muscular", tab: "Entreno", scroll: 0,
    accion: async (page) => { await page.getByRole("button", { name: "Agente" }).first().click({ timeout: 5000 }); },
    scrollDespues: 700 },
  {
    // Mover un ejercicio de día: solo existe dentro del menú del ejercicio
    id: "entreno-09-mover-de-dia",
    tab: "Entreno",
    scroll: 1700,
    accion: async (page) => {
      await page.getByRole("button", { name: "Opciones del ejercicio" }).first().click({ timeout: 5000 });
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /Mover a otro día/ }).click({ timeout: 5000 });
    },
  },
  {
    // Menú del ejercicio: mover, quitar del día, quitar series, fusionar
    id: "entreno-11-menu-ejercicio",
    tab: "Entreno",
    scroll: 1700,
    accion: async (page) => { await page.getByRole("button", { name: "Opciones del ejercicio" }).first().click({ timeout: 5000 }); },
  },
  {
    // Crear un combinado (biserie/triserie) eligiendo ejercicios del día
    id: "entreno-12-crear-combinado",
    tab: "Entreno",
    scrollHasta: "Añadir Ejercicio Manual",
    accion: async (page) => {
      await page.getByRole("button", { name: "Combinado" }).click({ timeout: 5000 });
      await page.waitForTimeout(400);
      await page.getByRole("button", { name: "Press banca", exact: true }).click({ timeout: 5000 });
      await page.getByRole("button", { name: "Aperturas", exact: true }).click({ timeout: 5000 });
    },
  },
  {
    // Elegir qué ejercicios entran en la rutina antes de generarla
    id: "entreno-13-elegir-rutina",
    tab: "Entreno",
    scrollHasta: "Editar Splits",
    accion: async (page) => { await page.getByRole("button", { name: /PDF IA/ }).click({ timeout: 5000 }); },
  },
  // Posicionar por texto en vez de por píxeles: este panel se mueve cada vez
  // que crece algo por encima, y con scroll fijo la captura acabaría en otro sitio
  { id: "entreno-10-volumen-semanal", tab: "Entreno", scrollHasta: "Volumen Semanal" },
  // Caminata en cinta: el registro por bloques de velocidad y pendiente
  { id: "entreno-14-caminata", tab: "Entreno", scrollHasta: "Caminata en cinta" },
  { id: "entreno-15-caminata-programas", tab: "Entreno", scrollHasta: "Caminata en cinta",
    accion: async (page) => { await page.getByRole("button", { name: "+ Registrar" }).first().click({ timeout: 5000 }); },
    scrollDespues: 200 },
  { id: "registro-01-peso-y-tendencia", tab: "Registro", scroll: 0 },
  // Registro de cintura: la métrica que mejor distingue perder grasa de perder peso
  { id: "registro-06-cintura", tab: "Registro", scroll: 0,
    accion: async (page) => { await page.getByRole("button", { name: "Cintura", exact: true }).first().click({ timeout: 5000 }); } },
  // Perímetros por lados: la pestaña que no existía y hacía imposible la
  // detección de asimetrías que ya estaba escrita
  { id: "registro-07-perimetros", tab: "Registro", scroll: 0,
    accion: async (page) => { await page.getByRole("button", { name: "Perímetros", exact: true }).first().click({ timeout: 5000 }); } },
  // Historial de mediciones: corregir o borrar una medición equivocada
  { id: "registro-08-historial-mediciones", tab: "Registro", scrollHasta: "Historial de mediciones",
    accion: async (page) => { await page.getByRole("button", { name: /Historial de mediciones/ }).click({ timeout: 5000 }); } },
  { id: "registro-02-objetivos", tab: "Registro", scroll: 1150 },
  { id: "registro-03-composicion", tab: "Registro", scroll: 1900 },
  // El selector de rango del gráfico: es donde se veía que "30 d" no cambiaba nada
  { id: "registro-05-evolucion-corporal", tab: "Registro", scrollHasta: "Evolución corporal" },
  // Sustituye al "Radar Corporal": ninguna escena caía sobre esa zona, por eso
  // el radar pudo estar duplicado sin que las capturas lo delataran
  { id: "registro-09-cambios-medicion", tab: "Registro", scrollHasta: "Cambios desde la medición anterior" },
  // Historial nutricional: aquí se ve si un día sin anotar sale estimado
  { id: "registro-10-historial-nutricional", tab: "Registro", scrollHasta: "Historial Nutricional Acumulado",
    scrollDespues: 120 },
  { id: "registro-04-final", tab: "Registro", scroll: 6000 },
  { id: "perfil-01", tab: "Perfil", scroll: 0 },
  { id: "coach-01", tab: "Coach", scroll: 0 },
];

const leerPNG = (p) => PNG.sync.read(readFileSync(p));

/**
 * Localiza un Chromium ya instalado. Playwright suele esperar una build
 * concreta que no tiene por qué coincidir con la del entorno (contenedores,
 * CI), así que se reutiliza la que haya en vez de descargar otra.
 * Devuelve undefined para dejar que Playwright decida si no encuentra ninguna.
 */
function buscarChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const raiz = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (raiz && existsSync(raiz)) {
    const candidatos = readdirSync(raiz)
      .filter((d) => d.startsWith("chromium-"))
      .sort()
      .reverse()
      .map((d) => join(raiz, d, "chrome-linux", "chrome"));
    const encontrado = candidatos.find((p) => existsSync(p));
    if (encontrado) return encontrado;
  }
  for (const p of ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

async function capturar() {
  [dirActual, dirDiff].forEach((d) => { rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); });
  mkdirSync(dirBase, { recursive: true });

  const browser = await chromium.launch({ executablePath: buscarChromium() });
  const page = await browser.newPage({
    viewport: { width: 420, height: 900 },
    deviceScaleFactor: 1,          // 1x mantiene las referencias pequeñas
    timezoneId: "America/Santiago", // zona fija: afecta a fechas mostradas
    locale: "es-CL",
    reducedMotion: "reduce",        // sin animaciones a medias en la captura
  });

  const errores = [];
  page.on("pageerror", (e) => errores.push(e.message.slice(0, 200)));

  await page.goto("file://" + previewFile, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(3500); // arranque de la app y carga de estado

  let tabActual = null;
  let sucia = false; // la escena anterior dejó un modal o un panel abierto
  for (const esc of ESCENAS) {
    // Cerrar modales "a mano" es frágil: basta con que uno cambie de estructura
    // para que la escena siguiente capture la pantalla equivocada o falle al
    // pulsar algo tapado. Recargar deja el estado limpio siempre.
    if (sucia) {
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(3500);
      tabActual = null;
      sucia = false;
    }
    if (esc.tab !== tabActual) {
      await page.getByText(esc.tab, { exact: true }).first().click({ timeout: 10000 });
      await page.waitForTimeout(1200);
      tabActual = esc.tab;
    }
    // Volver arriba del todo antes de posicionar. La app desplaza un contenedor
    // interno (html/body tienen overflow:hidden), así que window.scrollTo no
    // sirve: hay que resetear el scrollTop de cualquier elemento desplazado, o
    // cada escena hereda la posición de la anterior.
    await page.evaluate(() => {
      document.querySelectorAll("*").forEach((el) => { if (el.scrollTop > 0) el.scrollTop = 0; });
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
    await page.mouse.move(210, 450);
    if (esc.scroll) await page.mouse.wheel(0, esc.scroll);
    if (esc.scrollHasta) {
      await page.getByText(esc.scrollHasta, { exact: false }).first()
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    }
    await page.waitForTimeout(600);
    // Algunas pantallas solo aparecen tras interactuar (abrir un día, un modal)
    if (esc.accion) {
      await esc.accion(page);
      sucia = true;
      await page.waitForTimeout(800);
      if (esc.scrollDespues) { await page.mouse.wheel(0, esc.scrollDespues); await page.waitForTimeout(600); }
    }
    await page.screenshot({ path: join(dirActual, esc.id + ".png") });
  }

  await browser.close();
  return errores;
}

function comparar() {
  const actuales = readdirSync(dirActual).filter((f) => f.endsWith(".png")).sort();
  const filas = [];
  let cambiadas = 0, nuevas = 0;

  for (const nombre of actuales) {
    const pActual = join(dirActual, nombre);
    const pBase = join(dirBase, nombre);
    if (!existsSync(pBase)) {
      filas.push({ nombre, estado: "NUEVA", pct: null });
      nuevas++;
      continue;
    }
    const a = leerPNG(pActual), b = leerPNG(pBase);
    if (a.width !== b.width || a.height !== b.height) {
      filas.push({ nombre, estado: "TAMAÑO", pct: null, detalle: `${b.width}x${b.height} → ${a.width}x${a.height}` });
      cambiadas++;
      continue;
    }
    const diff = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(b.data, a.data, diff.data, a.width, a.height, { threshold: THRESHOLD });
    const pct = (n / (a.width * a.height)) * 100;
    if (pct > MAX_DIFF_PCT) {
      writeFileSync(join(dirDiff, nombre), PNG.sync.write(diff));
      filas.push({ nombre, estado: "CAMBIADA", pct });
      cambiadas++;
    } else {
      filas.push({ nombre, estado: "igual", pct });
    }
  }

  // Referencias que ya no se generan (escena eliminada o renombrada)
  const huerfanas = readdirSync(dirBase)
    .filter((f) => f.endsWith(".png") && !actuales.includes(f));

  return { filas, cambiadas, nuevas, huerfanas };
}

function aceptarComoBase() {
  mkdirSync(dirBase, { recursive: true });
  for (const f of readdirSync(dirActual).filter((x) => x.endsWith(".png"))) {
    copyFileSync(join(dirActual, f), join(dirBase, f));
  }
}

// ── Ejecución ──
const errores = await capturar();
if (errores.length) {
  console.log("⚠ errores de la página durante la captura:");
  [...new Set(errores)].slice(0, 5).forEach((e) => console.log("   " + e));
}

if (update) {
  aceptarComoBase();
  console.log(`Referencias actualizadas: ${readdirSync(dirBase).filter((f) => f.endsWith(".png")).length} escenas en screenshots/base/`);
  process.exit(0);
}

const { filas, cambiadas, nuevas, huerfanas } = comparar();
const ancho = Math.max(...filas.map((f) => f.nombre.length));
for (const f of filas) {
  const pct = f.pct == null ? "" : `${f.pct.toFixed(2)}%`;
  const marca = f.estado === "igual" ? "·" : f.estado === "NUEVA" ? "+" : "✗";
  console.log(`  ${marca} ${f.nombre.padEnd(ancho)}  ${f.estado.padEnd(9)} ${pct}${f.detalle ? " " + f.detalle : ""}`);
}
if (huerfanas.length) console.log(`\n  Referencias sin escena: ${huerfanas.join(", ")}`);

if (cambiadas > 0) {
  console.log(`\n${cambiadas} escena(s) cambiaron. Diferencias en screenshots/diff/`);
  console.log("Si el cambio es intencionado: npm run shots:update");
  process.exit(1);
}
if (nuevas > 0) {
  console.log(`\n${nuevas} escena(s) nuevas sin referencia. Acepta con: npm run shots:update`);
  process.exit(1);
}
console.log(`\n${filas.length} escenas sin cambios visuales.`);
