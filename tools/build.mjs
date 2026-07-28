#!/usr/bin/env node
/**
 * Build de producción: genera app.bundle.js autocontenido.
 *
 * Hasta ahora index.html descargaba Babel desde unpkg y React, lucide y
 * Supabase desde esm.sh, y compilaba app.js EN EL NAVEGADOR en cada carga
 * fría. Eso implica que:
 *   - sin conexión (o con esos CDN caídos o bloqueados) la app no arranca
 *   - la primera carga descarga ~2 MB de Babel y compila 860 KB de JSX
 *
 * Este script empaqueta todo en un único archivo ya compilado. index.html lo
 * usa si existe y, si no, cae al camino antiguo con Babel.
 *
 *   npm run build
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const salida = resolve(root, "app.bundle.js");
const fuente = readFileSync(resolve(root, "app.js"), "utf8");

const result = await build({
  entryPoints: [resolve(root, "app.js")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020", "chrome100", "safari15", "firefox100"],
  loader: { ".js": "jsx" },
  jsx: "transform",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  write: false,
  logLevel: "error",
});

const code = result.outputFiles[0].text;
// La versión se lee del propio fuente para dejar constancia en el bundle
const version = (fuente.match(/APP_VERSION\s*=\s*"([^"]+)"/) || [, "desconocida"])[1];
// El hash del fuente permite detectar un bundle obsoleto antes de desplegarlo:
// servir código viejo en silencio es peor que fallar al construir (deploy_hf.py)
const hash = createHash("sha1").update(fuente).digest("hex");

writeFileSync(
  salida,
  `/* BrunoFit ${version} — generado por tools/build.mjs. No editar a mano. */\n` +
  `/* fuente:${hash} */\n${code}`
);

// El CDN de HuggingFace cachea agresivamente: sin cambiar la query, un bundle
// nuevo puede no llegar nunca al navegador. Se sella con la versión del fuente.
const htmlPath = resolve(root, "index.html");
const html = readFileSync(htmlPath, "utf8");
const htmlNuevo = html.replace(/app\.bundle\.js\?v=[^'"]*/, `app.bundle.js?v=${version}`);
if (htmlNuevo !== html) writeFileSync(htmlPath, htmlNuevo);

const kb = (statSync(salida).size / 1024).toFixed(0);
console.log(`app.bundle.js generado · ${version} · ${kb} KB${htmlNuevo !== html ? " · index.html sellado" : ""}`);
