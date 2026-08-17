#!/usr/bin/env node
/**
 * Preview local de la app — SOLO para desarrollo.
 *
 * index.html carga React, lucide y Babel desde CDN, lo que impide abrir la app
 * en entornos sin salida a internet (CI, contenedores, avión). Este script
 * empaqueta app.js con las dependencias que ya están en node_modules y genera
 * un HTML autocontenido en preview/index.html.
 *
 * No modifica index.html ni app.js: producción sigue igual.
 *
 *   node tools/preview.mjs                  → genera preview/index.html
 *   node tools/preview.mjs --seed           → además precarga datos de ejemplo
 *   node tools/preview.mjs --seed --freeze  → congela el reloj (capturas
 *                                             reproducibles, ver tools/screenshots.mjs)
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "preview");
mkdirSync(outDir, { recursive: true });

const withSeed = process.argv.includes("--seed");
// Congelar el reloj hace que las capturas de regresión sean comparables: sin
// esto la fecha, el saludo por hora y los datos sembrados cambian cada día.
const freeze = process.argv.includes("--freeze");
const FIXED_ISO = "2026-07-28T09:30:00";
// Con el reloj congelado, los datos se anclan a esa misma fecha
const HOY = freeze ? new Date(FIXED_ISO) : new Date();

// ── 1. Empaquetar la app con sus dependencias locales ──
const result = await build({
  entryPoints: [resolve(root, "app.js")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome110"],
  loader: { ".js": "jsx" },
  jsx: "transform",
  define: { "process.env.NODE_ENV": '"development"' },
  write: false,
  logLevel: "error",
});
const appBundle = result.outputFiles[0].text;

// ── 2. Datos de ejemplo (opcional) para ver la app "con vida" ──
const seedScript = withSeed ? buildSeed() : "";

// Parche de reloj: new Date() y Date.now() devuelven siempre el mismo instante.
// El resto del comportamiento de Date se mantiene intacto.
const freezeScript = freeze ? `
(function () {
  var FIJO = new Date(${JSON.stringify(FIXED_ISO)}).getTime();
  var Real = Date;
  function D(){ return arguments.length === 0 ? new Real(FIJO) : new Real(...arguments); }
  D.prototype = Real.prototype;
  D.now = function(){ return FIJO; };
  D.parse = Real.parse; D.UTC = Real.UTC;
  window.Date = D;
})();` : "";

// ── 3. HTML autocontenido: mismo CSS y misma raíz que producción ──
const css = readFileSync(resolve(root, "style.css"), "utf8");
const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BrunoFit — preview local</title>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${freezeScript}</script>\n<script>${seedScript}</script>
<script>${appBundle}</script>
</body>
</html>`;

writeFileSync(resolve(outDir, "index.html"), html);
console.log(`preview/index.html generado (${(html.length / 1024 / 1024).toFixed(1)} MB)${withSeed ? " con datos de ejemplo" : ""}${freeze ? ` · reloj fijado en ${FIXED_ISO}` : ""}`);

function buildSeed() {
  const pad = (n) => String(n).padStart(2, "0");
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hoy = new Date(HOY);
  const diasAtras = (n) => { const d = new Date(hoy); d.setDate(d.getDate() - n); return d; };

  const metricslog = {}, foodlog = {}, waterlog = {};
  // Caminata inclinada en días alternos, que es como se usa de verdad
  const cardiolog = {};
  for (let i = 45; i >= 0; i--) {
    const d = diasAtras(i), k = key(d);
    // Peso con ruido diario para que se note el efecto del suavizado
    const ruido = [0, .5, -.4, .8, -.3, .2, -.6][i % 7];
    metricslog[k] = {
      weight: Math.round((95 - (45 - i) * 0.06 + ruido) * 10) / 10,
      grasaPct: Math.round((26.5 - (45 - i) * 0.045) * 10) / 10,
      musculo: Math.round((64 + (45 - i) * 0.012) * 10) / 10,
      visceral: 9,
      cintura: Math.round((99 - (45 - i) * 0.06) * 10) / 10,
      fcReposo: 56 + (i % 4),
      suenoHoras: [7.5, 8, 6.5, 7, 8.5][i % 5],
      suenoCalidad: [4, 5, 3, 4, 5][i % 5],
      pasos: 6000 + (i % 5) * 1500,
      fuente: "bascula", ayunas: true,
    };
    // Segmental cada dos semanas, como quien se hace el InBody de vez en
    // cuando, con una asimetría leve en brazos: es lo que hay que enseñar.
    if (i % 14 === 0) {
      Object.assign(metricslog[k], {
        musculoTronco: 29.8, pesoSinGrasa: Math.round((metricslog[k].weight * 0.755) * 10) / 10,
        musculoBrazoDer: 3.9, musculoBrazoIzq: 3.62,
        musculoPiernaDer: 10.2, musculoPiernaIzq: 10.1,
        grasaBrazoDer: 1.3, grasaBrazoIzq: 1.3,
        grasaPiernaDer: 3.4, grasaPiernaIzq: 3.4,
      });
    }
    if (i % 2 === 1 && i <= 13) {
      cardiolog[k] = [{
        id: "cam" + i,
        bloques: i % 4 === 1
          ? [{ min: 5, vel: 4.5, incl: 2 }, { min: 30, vel: 5.2, incl: 9 }, { min: 5, vel: 4, incl: 0 }]
          : [{ min: 5, vel: 4.5, incl: 2 }, { min: 40, vel: 5.5, incl: 6 }, { min: 5, vel: 4, incl: 0 }],
      }];
    }
    // Dos días sin anotar comida: pasa en el uso real y es el caso que rellena
    // la estimación. Sin ellos el preview nunca enseñaría un día estimado.
    if (i === 2 || i === 9) { waterlog[k] = 8 + (i % 5); continue; }
    // Los sábados solo se anota el desayuno: es el patrón real de
    // infrarregistro (se come fuera y no se apunta) y sin él el panel de
    // calidad del registro no tendría nada que enseñar en las capturas.
    const sabado = d.getDay() === 6;
    foodlog[k] = sabado ? [
      { id: "s" + i + "a", resumen: "Avena con whey", kcal: 620, proteina: 48, carbo: 72, grasa: 14 },
    ] : [
      { id: "s" + i + "a", resumen: "Avena con whey", kcal: 620, proteina: 48, carbo: 72, grasa: 14 },
      { id: "s" + i + "b", resumen: "Pollo con arroz", kcal: 780, proteina: 62, carbo: 88, grasa: 16 },
      { id: "s" + i + "c", resumen: "Salmón y verduras", kcal: 640, proteina: 46, carbo: 34, grasa: 30 },
      { id: "s" + i + "d", resumen: "Yogur y frutos secos", kcal: 420, proteina: 30, carbo: 38, grasa: 16 },
    ];
    waterlog[k] = 8 + (i % 5);
  }

  // Entrenos: cada sesión usa SOLO los ejercicios de su split y los splits
  // rotan A→B→C→D, como en un uso real. Antes cada día metía los 8 ejercicios
  // a la vez, lo que hacía imposible probar nada que dependa del split del día.
  const exlog = {};
  const rutinas = [
    ["A", [["Press banca", 82, 1.0, 6], ["Press inclinado mancuerna", 30, 0.5, 9], ["Curl martillo", 16, 0, 10]]],
    // El nombre largo no está de adorno: reproduce el caso real en que el
    // título envuelve a dos líneas, y además no existe en el catálogo, así que
    // ejercita la deducción de músculos por el nombre.
    ["B", [["Sentadilla", 110, 1.2, 5], ["Prensa de piernas 45 grados unilateral", 60, 1.0, 10], ["Vuelos laterales", 10, 0.25, 14]]],
    ["C", [["Remo barra", 70, 0.8, 8], ["Dominadas / Jalón", 8, 0.4, 7], ["Press francés", 28, 0.5, 10]]],
    ["D", [["Peso muerto", 130, 1.5, 5], ["Leg curl sentado", 45, 0.8, 11]]],
  ];
  let sesion = 0;
  for (let s = 9; s >= 0; s--) {              // de la más antigua a la más reciente
    const [, ejercicios] = rutinas[sesion % rutinas.length];
    sesion++;
    const d = diasAtras(s * 3 + 1); d.setHours(19, 0, 0, 0);
    // Cada serie con su propia hora: es lo que ocurre al registrar sobre la
    // marcha y lo que hace visible el orden de ejecución de la sesión
    let minuto = 0;
    const hora = () => { const x = new Date(d); x.setMinutes(minuto); minuto += 3; return x.toISOString(); };
    ejercicios.forEach(([nombre, base, inc, reps]) => {
      exlog[nombre] = exlog[nombre] || [];
      const w = Math.round((base + inc * (9 - s)) * 2) / 2;
      const delEjercicio = [{ date: hora(), w: Math.round(w * 0.55 * 2) / 2, reps: 12, rir: "-", type: "warmup" }];
      for (let k2 = 0; k2 < 3; k2++) {
        delEjercicio.push({ date: hora(), w, reps: reps - k2 > 3 ? reps - k2 : 4, rir: String(k2), type: "work" });
      }
      // exlog va de la serie más reciente a la más antigua, como lo deja addSet
      exlog[nombre].push(...delEjercicio.reverse());
    });
  }

  // La app asume que cada ejercicio va de la serie más reciente a la más
  // antigua (`last()` lee la posición 0); el sembrado va de la sesión más
  // vieja a la más nueva, así que hay que invertirlo al final.
  Object.keys(exlog).forEach(k => exlog[k].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)));

  const notes = [
    { id: "n1", type: "sensacion", date: diasAtras(1).toISOString(), text: "Óptimo" },
    { id: "n2", type: "sensacion", date: diasAtras(5).toISOString(), text: "Fatigado" },
  ];
  const workoutDurations = {};
  for (let s = 0; s < 10; s++) workoutDurations[key(diasAtras(s * 3 + 1))] = 58 + (s % 3) * 7;

  const store = {
    onboarding_shown: "1",
    metricslog, foodlog, waterlog, cardiolog, exlog, notes, workoutDurations,
    body_profile: { sexo: "hombre", edad: 34, alturaCm: 180, objetivo: "definicion", actividad: 1.45, ritmoKgSemana: -0.5, pesoInicial: 95, pesoObjetivo: 85 },
  };
  return Object.entries(store)
    .map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(typeof v === "string" ? v : JSON.stringify(v))});`)
    .join("\n");
}
