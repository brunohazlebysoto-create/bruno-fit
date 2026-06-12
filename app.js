import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { 
  Flame, Beef, Wheat, Droplet, Plus, Minus, Trash2, Send, Utensils, 
  MessageSquare, NotebookPen, Loader2, Scale, Camera, Clock, ChefHat, 
  Sparkles, LineChart, Dumbbell, ClipboardList, GlassWater, Target, 
  CalendarDays, ShoppingCart, Activity, Eye, EyeOff, CheckSquare, Square, ShieldAlert,
  RefreshCw, Link2, Copy, Check, Settings, Pill, X
} from "lucide-react";

/* ===== CONSTANTES Y PRESETS ===== */
const DEFAULT_PRESETS = {
  definicion:   { label:"Definición",    kcal:2600, p:220, c:265, f:70 },
  mantenimiento:{ label:"Mantenimiento", kcal:3000, p:200, c:360, f:85 },
  volumen:      { label:"Volumen",       kcal:3400, p:200, c:450, f:90 },
  personalizado:{ label:"Personalizado", kcal:2600, p:220, c:265, f:70 }
};

const DEFAULT_SPLITS = [
  { key:"A", name:"Pecho + Bíceps", fuel:"Carbo medio", ex:["Press banca","Press inclinado mancuerna","Aperturas","Curl inclinado","Curl martillo","Curl prono barra"] },
  { key:"B", name:"Pierna Cuádriceps + Hombros", fuel:"Carbo alto", ex:["Sentadilla","Prensa 45°","Sentadilla búlgara","Sentadilla ciclista Smith","Extensión cuádriceps","Press Arnold","Vuelos laterales","Vuelos posteriores polea"] },
  { key:"C", name:"Espalda + Tríceps", fuel:"Carbo medio-alto", ex:["Dominadas / Jalón","Remo barra","Remo máquina","Pullover polea","Face pull","Press cerrado","Extensión polea","Extensión sobre cabeza"] },
  { key:"D", name:"Pierna Posterior", fuel:"Carbo alto", ex:["Peso muerto","Leg curl sentado","Puente glúteos","Estocada atrás Smith"] },
];

const MUSCLES = {
  "Press banca":["Pectoral","Tríceps","Deltoide ant."],
  "Press inclinado mancuerna":["Pectoral","Deltoide ant.","Tríceps"],
  "Aperturas":["Pectoral"],
  "Curl inclinado":["Bíceps"],
  "Curl martillo":["Bíceps","Antebrazo"],
  "Curl prono barra":["Bíceps","Antebrazo"],
  "Sentadilla":["Cuádriceps","Glúteos","Isquios"],
  "Prensa 45°":["Cuádriceps","Glúteos"],
  "Sentadilla búlgara":["Cuádriceps","Glúteos","Isquios"],
  "Sentadilla ciclista Smith":["Cuádriceps"],
  "Extensión cuádriceps":["Cuádriceps"],
  "Press Arnold":["Deltoides","Tríceps"],
  "Vuelos laterales":["Deltoides"],
  "Vuelos posteriores polea":["Deltoides"],
  "Dominadas / Jalón":["Espalda","Bíceps"],
  "Remo barra":["Espalda","Bíceps"],
  "Remo máquina":["Espalda"],
  "Pullover polea":["Espalda"],
  "Face pull":["Deltoides","Espalda"],
  "Press cerrado":["Tríceps","Pectoral"],
  "Extensión polea":["Tríceps"],
  "Extensión sobre cabeza":["Tríceps"],
  "Peso muerto":["Isquios","Glúteos","Espalda"],
  "Leg curl sentado":["Isquios"],
  "Puente glúteos":["Glúteos"],
  "Estocada atrás Smith":["Glúteos","Cuádriceps","Isquios"],
};

const DEFAULT_MEALS = [
  { slot:"Desayuno", kcal:"~580", opts:["4 huevos + 2 claras, 80 g avena con plátano, café","Yogur griego 250 g + 60 g granola + frutos rojos + nueces","Tortilla de 3 huevos + pan integral con aguacate"] },
  { slot:"Almuerzo", kcal:"~620", opts:["180 g pollo, 180 g arroz, verduras, aceite oliva","200 g salmón al horno, 250 g boniato, espárragos","Bowl: 150 g carne magra, quinoa, frijoles, pico de gallo"] },
  { slot:"Pre-entreno", kcal:"~310", opts:["1 plátano + 1 scoop proteína (60-90 min antes)","2 tortitas de arroz con miel + 150 g requesón","Café + 50 g avena instantánea con miel"] },
  { slot:"Post-entreno", kcal:"~410", opts:["1-2 scoops whey + 50 g arroz inflado o 1 plátano","250 g claras + 200 g arroz/puré","Wrap integral con 150 g atún + verduras"] },
  { slot:"Cena", kcal:"~640", opts:["200 g carne/pescado, 200 g verduras al horno, arroz, aceite","Tortilla de 4 huevos + queso, ensalada con aguacate","Curry/guiso de pollo con garbanzos y verduras"] },
];

const PAUTAS = [
  ["🥩 Proteína repartida","30-50 g por toma, cada 3-4 h."],
  ["💧 Hidratación","3-4 L/día. Mantén una buena ingesta de electrolitos."],
  ["🌾 Fibra","30-40 g/día. Verdura en cada comida + fruta."],
  ["⏱️ Timing","Carbos concentrados alrededor del entreno."],
  ["💊 Suplementos","Creatina 5 g/día, whey, vitamina D, cafeína pre-entreno."],
  ["😴 Sueño","Tu factor clave para la recuperación. Dormir poco frena la pérdida de grasa."],
  ["🍷 Alcohol","Mínimo en definición."],
];

const C = {
  bg: "var(--bg-color)",
  panel: "var(--panel-bg)",
  panel2: "var(--panel-bg-sec)",
  panelTint: "var(--panel-bg-tint)",
  line: "var(--line-color)",
  ink: "var(--text-ink)",
  muted: "var(--text-muted)",
  lime: "var(--accent-primary)",
  limeHover: "var(--accent-primary-hover)",
  limeGreen: "var(--accent-lime)",
  cyan: "var(--accent-cyan)",
  amber: "var(--accent-amber)",
  blue: "var(--accent-blue)",
  rose: "var(--accent-red)"
};

const START_W = 93.9, GOAL_W = 85;
const todayKey = () => "log-" + new Date().toISOString().slice(0,10);
const waterKey = () => "water-" + new Date().toISOString().slice(0,10);
const suppsKey = () => "supps-" + new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2,9);
const fdate = (iso)=> new Date(iso).toLocaleDateString("es",{day:"2-digit",month:"short"});

// Clave Gemini/OpenRouter por defecto
const DEFAULT_GEMINI_KEY = "";

const COACH_SCHEMA = {
  type: "OBJECT",
  properties: {
    chatResponse: { type: "STRING" },
    actions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING" },
          data: {
            type: "OBJECT",
            properties: {
              resumen: { type: "STRING" },
              kcal: { type: "NUMBER" },
              proteina: { type: "NUMBER" },
              carbo: { type: "NUMBER" },
              grasa: { type: "NUMBER" },
              weight: { type: "NUMBER" },
              exercise: { type: "STRING" },
              w: { type: "NUMBER" },
              reps: { type: "STRING" },
              phase: { type: "STRING" },
              eventName: { type: "STRING" },
              eventDate: { type: "STRING" },
              meals: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    slot: { type: "STRING" },
                    kcal: { type: "STRING" },
                    opts: { type: "ARRAY", items: { type: "STRING" } }
                  },
                  required: ["slot", "kcal", "opts"]
                }
              },
              splits: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    key: { type: "STRING" },
                    name: { type: "STRING" },
                    fuel: { type: "STRING" },
                    ex: { type: "ARRAY", items: { type: "STRING" } }
                  },
                  required: ["key", "name", "fuel", "ex"]
                }
              }
            }
          }
        },
        required: ["type", "data"]
      }
    }
  },
  required: ["chatResponse"]
};

const WORKOUT_PARSER_SYS = "Eres un asistente experto en entrenamiento de fuerza. Tu tarea es analizar el texto del usuario que describe su sesión de entrenamiento y extraer los ejercicios, pesos y repeticiones. Extrae los pesos en kg (si están en libras, conviértelos a kg dividiendo por 2.2). Para cada ejercicio extraído, debes identificar obligatoriamente al menos los 3 músculos principales que trabaja. Responde estrictamente en formato JSON que cumpla con el esquema WORKOUT_PARSER_SCHEMA.";

const WORKOUT_PARSER_SCHEMA = {
  type: "OBJECT",
  properties: {
    exercises: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          muscles: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Al menos 3 músculos principales involucrados en el ejercicio"
          },
          sets: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                w: { type: "NUMBER" },
                reps: { type: "STRING" }
              },
              required: ["w", "reps"]
            }
          }
        },
        required: ["name", "sets", "muscles"]
      }
    }
  },
  required: ["exercises"]
};

const MEALS_SYS = "Eres un nutricionista deportivo de élite. Tu tarea es recibir el plan de comidas actual de Bruno y la solicitud del usuario para modificar las opciones o la proporción de ingredientes. Debes reescribir y optimizar las opciones de comida del plan actual (manteniendo los 5 momentos del día: Desayuno, Almuerzo, Pre-entreno, Post-entreno, Cena) respetando su perfil y macros. Al estimar porciones, ingredientes y macronutrientes por porción, debes basarte estrictamente en bases de datos nutricionales oficiales (como USDA FoodData Central o tablas de composición de alimentos locales chilenas/latinoamericanas). Devuelve un formato JSON estricto que cumpla con el esquema MEALS_SCHEMA.";

const MEALS_SCHEMA = {
  type: "OBJECT",
  properties: {
    meals: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          slot: { type: "STRING" },
          kcal: { type: "STRING" },
          opts: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["slot", "kcal", "opts"]
      }
    }
  },
  required: ["meals"]
};

/* ===== ACCESO A STORAGE CON FALLBACK ===== */
async function loadKey(key,def){ 
  try{ 
    if(window.storage && typeof window.storage.get === 'function') {
      const r = await window.storage.get(key,false); 
      return r ? JSON.parse(r.value) : def; 
    } else {
      const r = localStorage.getItem(key);
      return r ? JSON.parse(r) : def;
    }
  }catch(e){ 
    return def; 
  } 
}

async function saveKey(key,val){ 
  try{ 
    if(window.storage && typeof window.storage.set === 'function') {
      await window.storage.set(key,JSON.stringify(val),false); 
    } else {
      localStorage.setItem(key, JSON.stringify(val));
    }
  }catch(e){ 
    console.error(e); 
  } 
}

/* ===== SUPABASE CLIENT INITIALIZATION ===== */
let supabase = null;
function initSupabase(url, key) {
  if (url && url.trim() && key && key.trim()) {
    try {
      supabase = createClient(url.trim(), key.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });
      return supabase;
    } catch(e) {
      console.error("Error al inicializar Supabase:", e);
    }
  }
  supabase = null;
  return null;
}


/* ===== INTEGRACIÓN CLOUD SYNC (KVDB.IO) ===== */
async function pushStateToCloud(syncCode, stateObj) {
  if (!syncCode || syncCode.startsWith("bf-")) return;
  try {
    const url = `https://kvdb.io/${syncCode}/state`;
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ ...stateObj, updatedAt: Date.now() })
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch(e) {
    console.error("Error al sincronizar con la nube:", e);
    throw e;
  }
}

async function fetchStateFromCloud(syncCode) {
  if (!syncCode || syncCode.startsWith("bf-")) return null;
  try {
    const url = `https://kvdb.io/${syncCode}/state`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    return await res.json();
  } catch(e) {
    console.error("Error al descargar desde la nube:", e);
    return null;
  }
}

/* ===== INTEGRACIÓN DE LA API DE GEMINI (1.5 FLASH) ===== */
const aiErr = (e) => {
  if (!e) return "No se pudo conectar con la IA. Verifica tu API Key o conexión.";
  const msg = e.message || "";
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("limit")) {
    return "Límite de la API superado (Error 429 / Quota Exceeded). Si usas la versión gratuita de Google AI Studio, espera unos segundos para restablecer el límite por minuto. Para evitar esto, puedes agregar múltiples API Keys separadas por comas en Ajustes (se rotarán automáticamente) o habilitar el pago por uso (Pay-as-you-go) en Google AI Studio, que cuesta centavos para uso personal.";
  }
  return "No se pudo conectar con la IA. Detalle: " + msg;
};
const getProfileStr = (weight = 93.9, musculo = 64.7, grasaPct = 26.2, visceral = 9) => {
  return `Bruno: hombre, 34 años, 180 cm, ${weight} kg. Objetivo: definición (bajar grasa manteniendo músculo; ${musculo} kg de músculo, ${grasaPct}% grasa, visceral grado ${visceral}). Dieta hiperproteica.`;
};

const cleanAndParseJSON = (str) => {
  if (!str) throw new Error("JSON string is empty");
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleaned.trim());
  } catch (e) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(cleaned);
    }
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      return JSON.parse(cleaned);
    }
    throw e;
  }
};

async function parseDailyCloudData(cloudData, today) {
  let finalLog = [];
  let finalWater = 0;
  let finalSupplements = { Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false };
  if (cloudData.dailyDate === today) {
    finalLog = cloudData.log || [];
    finalWater = cloudData.water || 0;
    finalSupplements = cloudData.supplements || { Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false };
  } else {
    finalLog = await loadKey(todayKey(), []);
    finalWater = await loadKey(waterKey(), 0);
    finalSupplements = await loadKey(suppsKey(), { Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false });
  }
  return { finalLog, finalWater, finalSupplements };
}

async function callGemini(messages, systemInstruction, responseSchema = null) {
  let apiKeysStr = await loadKey("gemini_api_key", "");
  
  let apiKeys = [];
  if (apiKeysStr && apiKeysStr.trim() !== "") {
    apiKeys = apiKeysStr.split(/[,;\s]+/).map(k => k.trim()).filter(k => k.length > 0);
  }
  
  const defaultKeys = DEFAULT_GEMINI_KEY.split(/[,;\s]+/).map(k => k.trim()).filter(k => k.length > 0);
  
  // Agregar las llaves por defecto al final como respaldo si no están presentes
  defaultKeys.forEach(dk => {
    if (!apiKeys.includes(dk)) {
      apiKeys.push(dk);
    }
  });

  // Priorizar las llaves de Gemini nativas primero y usar las de OpenRouter como respaldo/fallback
  const geminiKeys = apiKeys.filter(k => !k.startsWith("sk-or-"));
  const openRouterKeys = apiKeys.filter(k => k.startsWith("sk-or-"));

  const orderedKeys = [];
  if (geminiKeys.length > 0) {
    const startGemini = Math.floor(Math.random() * geminiKeys.length);
    for (let count = 0; count < geminiKeys.length; count++) {
      orderedKeys.push(geminiKeys[(startGemini + count) % geminiKeys.length]);
    }
  }
  if (openRouterKeys.length > 0) {
    const startOR = Math.floor(Math.random() * openRouterKeys.length);
    for (let count = 0; count < openRouterKeys.length; count++) {
      orderedKeys.push(openRouterKeys[(startOR + count) % openRouterKeys.length]);
    }
  }

  let lastError = null;

  for (let idx = 0; idx < orderedKeys.length; idx++) {
    const apiKey = orderedKeys[idx];
    try {
      const isOpenRouter = apiKey.startsWith("sk-or-");
      
      if (isOpenRouter) {
        // Carga el modelo guardado, por defecto moonshotai/kimi-k2.6:free
        const model = await loadKey("gemini_model", "moonshotai/kimi-k2.6:free");
        
        const formattedMessages = [
          { role: "system", content: systemInstruction }
        ];
        
        messages.forEach(m => {
          if (Array.isArray(m.content)) {
            const contentParts = [];
            m.content.forEach(part => {
              if (part.type === "image") {
                contentParts.push({
                  type: "image_url",
                  image_url: {
                    url: `data:${part.source.media_type};base64,${part.source.data}`
                  }
                });
              } else {
                contentParts.push({
                  type: "text",
                  text: part.text
                });
              }
            });
            formattedMessages.push({
              role: m.role === "assistant" ? "assistant" : "user",
              content: contentParts
            });
          } else {
            formattedMessages.push({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content
            });
          }
        });

        const body = {
          model: model,
          messages: formattedMessages,
          temperature: 0.2
        };

        if (responseSchema) {
          body.response_format = { type: "json_object" };
          // En OpenRouter para asegurar JSON podemos indicarlo en el system prompt
          body.messages.push({
            role: "system",
            content: "IMPORTANT: You must respond with a JSON object that strictly complies with this JSON schema: " + JSON.stringify(responseSchema)
          });
        }

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://brunoeduardo-bruno-fit.static.hf.space",
            "X-Title": "Centro de Mando Fitness"
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const textOut = data.choices?.[0]?.message?.content || "";
        return textOut.trim();

      } else {
        // Endpoint directo de Google Gemini
        const contents = messages.map(m => {
          if (Array.isArray(m.content)) {
            const parts = m.content.map(part => {
              if (part.type === "image") {
                return {
                  inlineData: {
                    mimeType: part.source.media_type,
                    data: part.source.data
                  }
                };
              }
              return { text: part.text };
            });
            return { role: m.role === "assistant" ? "model" : "user", parts };
          }
          return {
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          };
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        
        const generationConfig = {
          temperature: 0.2
        };
        
        if (responseSchema) {
          generationConfig.responseMimeType = "application/json";
          generationConfig.responseSchema = responseSchema;
        }

        const body = {
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const textOut = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return textOut.trim();
      }
    } catch (e) {
      lastError = e;
      console.warn(`Error con la API Key ${idx + 1}/${orderedKeys.length}: ${e.message}. Intentando con la siguiente...`);
    }
  }

  throw lastError || new Error("No se pudo conectar con ninguna API Key.");
}

function seedExercises(){ 
  const o={}; 
  DEFAULT_SPLITS.forEach(d=>{ 
    o[d.key]=d.ex.map(n=>({name:n,tecnico:"",musculos:MUSCLES[n]||[]})); 
  }); 
  return o; 
}

/* ===== GRÁFICO SVG COMPARTIDO ===== */
function Chart({entries, color=C.lime, height=128}){
  if(!entries || entries.length < 2) return null;
  const [mode, setMode] = useState("peso"); // "peso" or "esfuerzo"

  const values = entries.map(d => {
    if (mode === "peso") {
      return parseFloat(d.w) || 0;
    } else {
      const repsVal = parseInt(d.reps) || 0;
      const rirVal = (d.rir !== undefined && d.rir !== null && !isNaN(parseInt(d.rir))) ? parseInt(d.rir) : 0;
      return (parseFloat(d.w) || 0) * (1 + (repsVal + rirVal) / 30);
    }
  });

  const mn = Math.min(...values), mx = Math.max(...values), rg = (mx - mn) || 1;
  const W = 320, H = height, pad = 22;
  const X = i => pad + (i / (entries.length - 1)) * (W - 2 * pad);
  const Y = v => H - pad - ((v - mn) / rg) * (H - 2 * pad - 6) - 3;
  const line = values.map((val, i) => `${X(i).toFixed(1)},${Y(val).toFixed(1)}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${(W - pad).toFixed(1)},${H - pad}`;
  const lastVal = values[values.length - 1];
  const firstVal = values[0];
  const up = lastVal >= firstVal;
  const col = up ? C.lime : C.amber;
  
  return (
    <div style={{margin:"8px 0 4px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5}}>
        <div style={{fontSize:11, color:C.muted}}>
          {mode === "peso" ? "Historial de Pesos" : "Esfuerzo Estimado (1RM)"} · {Math.round(lastVal)} kg {up?"📈":"📉"}
        </div>
        <div style={{display:"flex", gap:4}}>
          <button 
            onClick={() => setMode("peso")} 
            style={{
              background: mode === "peso" ? "rgba(205,255,74,0.12)" : "transparent",
              border: `1px solid ${mode === "peso" ? C.lime : C.line}`,
              color: mode === "peso" ? C.lime : C.muted,
              fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4, cursor: "pointer"
            }}
          >
            Peso
          </button>
          <button 
            onClick={() => setMode("esfuerzo")} 
            style={{
              background: mode === "esfuerzo" ? "rgba(205,255,74,0.12)" : "transparent",
              border: `1px solid ${mode === "esfuerzo" ? C.lime : C.line}`,
              color: mode === "esfuerzo" ? C.lime : C.muted,
              fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4, cursor: "pointer"
            }}
          >
            Esfuerzo (1RM)
          </button>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height,display:"block"}}>
        <polygon points={area} fill={col} opacity="0.10"/>
        <polyline points={line} fill="none" stroke={col} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {values.map((val,i)=>(<circle key={i} cx={X(i)} cy={Y(val)} r="3.2" fill={col}/>))}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:-2}}><span>{fdate(entries[0].date)}</span><span>{fdate(entries[entries.length-1].date)}</span></div>
    </div>
  );
}

/* ===== COMPONENTE PRINCIPAL APP ===== */

/* ===== AI INTELLIGENCE ENGINE — 20 FEATURES ===== */

// ── Schemas nuevos para el Coach ──
const ANALYSIS_SYS = `Eres el motor de análisis adaptativo de BrunoFit. Analiza los datos del usuario y devuelve acciones concretas de reconfiguración. Sé preciso con los números. Usa los datos históricos reales, no estimaciones genéricas. Responde SOLO en JSON válido.`;

const ANALYSIS_SCHEMA = {
  type:"OBJECT", properties:{
    insights:{ type:"ARRAY", items:{ type:"OBJECT", properties:{
      type:{ type:"STRING" }, // "macro_adjust","phase_change","deload","overtraining","plateau","challenge","goal","event","experiment","pattern","correlation"
      title:{ type:"STRING" },
      message:{ type:"STRING" },
      urgency:{ type:"STRING" }, // "low","medium","high","critical"
      actions:{ type:"ARRAY", items:{ type:"OBJECT", properties:{
        type:{ type:"STRING" },
        data:{ type:"OBJECT", properties:{
          kcal:{ type:"NUMBER" }, proteina:{ type:"NUMBER" }, carbo:{ type:"NUMBER" }, grasa:{ type:"NUMBER" },
          presetKey:{ type:"STRING" }, label:{ type:"STRING" },
          exercise:{ type:"STRING" }, suggestedWeight:{ type:"NUMBER" },
          challengeTitle:{ type:"STRING" }, challengeDesc:{ type:"STRING" }, challengeMetric:{ type:"STRING" }, challengeTarget:{ type:"NUMBER" },
          goalTitle:{ type:"STRING" }, goalExercise:{ type:"STRING" }, goalTarget:{ type:"NUMBER" }, goalDeadlineDays:{ type:"NUMBER" },
          eventName:{ type:"STRING" }, eventDate:{ type:"STRING" },
          experimentTitle:{ type:"STRING" }, experimentDesc:{ type:"STRING" }, experimentVariable:{ type:"STRING" },
          correlation:{ type:"STRING" },
          message:{ type:"STRING" }
        }}
      }}}
    }, required:["type","title","message","urgency"]}}
  }, required:["insights"]
};

const TRAINER_AGENT_SCHEMA = {
  type:"OBJECT", properties:{
    trainingPhase:{ type:"OBJECT", properties:{
      name:{ type:"STRING" },
      description:{ type:"STRING" },
      weekNumber:{ type:"NUMBER" }
    }, required:["name","description"] },
    deloadRecommendation:{ type:"OBJECT", properties:{
      recommended:{ type:"STRING" },
      targetVolumePct:{ type:"NUMBER" },
      durationDays:{ type:"NUMBER" },
      rationale:{ type:"STRING" }
    }, required:["recommended","rationale"] },
    exerciseVariations:{ type:"ARRAY", items:{ type:"OBJECT", properties:{
      exercise:{ type:"STRING" },
      currentIssue:{ type:"STRING" },
      variation:{ type:"STRING" },
      reason:{ type:"STRING" },
      priority:{ type:"STRING" }
    }, required:["exercise","variation","reason","priority"] } },
    muscleAlerts:{ type:"ARRAY", items:{ type:"OBJECT", properties:{
      muscle:{ type:"STRING" },
      status:{ type:"STRING" },
      currentSets:{ type:"NUMBER" },
      recommendation:{ type:"STRING" }
    }, required:["muscle","status","recommendation"] } },
    performanceSummary:{ type:"OBJECT", properties:{
      narrative:{ type:"STRING" },
      topStrengths:{ type:"ARRAY", items:{ type:"STRING" } },
      topConcerns:{ type:"ARRAY", items:{ type:"STRING" } },
      nextWeekFocus:{ type:"STRING" }
    }, required:["narrative","nextWeekFocus"] }
  }, required:["trainingPhase","deloadRecommendation","exerciseVariations","muscleAlerts","performanceSummary"]
};

// ── Funciones estadísticas ──
function linearRegression(ys) {
  if (!ys || ys.length < 2) return { slope: 0, intercept: ys?.[0] || 0 };
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const sumX = xs.reduce((a,b)=>a+b,0), sumY = ys.reduce((a,b)=>a+b,0);
  const sumXY = xs.reduce((s,x,i)=>s+x*ys[i],0), sumX2 = xs.reduce((s,x)=>s+x*x,0);
  const slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
  const intercept = (sumY - slope*sumX) / n;
  return { slope, intercept };
}

function calcTDEE(foodlog, metricslog) {
  // Necesita al menos 21 dias de datos
  const dates = Object.keys(foodlog).filter(d => foodlog[d]?.length > 0).sort();
  if (dates.length < 21) return null;
  const last21 = dates.slice(-21);
  const avgKcal = last21.reduce((s,d)=>{
    const dayKcal = (foodlog[d]||[]).reduce((a,e)=>a+(+e.kcal||0),0);
    return s + dayKcal;
  },0) / last21.length;
  const weightDates = Object.keys(metricslog).filter(d=>metricslog[d]?.weight).sort();
  if (weightDates.length < 2) return null;
  const firstW = parseFloat(metricslog[weightDates[0]]?.weight) || 0;
  const lastW = parseFloat(metricslog[weightDates[weightDates.length-1]]?.weight) || 0;
  const days = Math.max(1, (new Date(weightDates[weightDates.length-1]) - new Date(weightDates[0])) / 86400000);
  const deltaKcalPerDay = ((lastW - firstW) * 7700) / days;
  return Math.round(avgKcal - deltaKcalPerDay);
}

function calcBodyProjection(currentWeight, currentGrasaPct, tdee, targetKcal, weeks=12) {
  const points = [];
  let w = currentWeight, g = currentGrasaPct;
  const dailyDelta = (targetKcal - tdee) / 7700;
  for (let wk=0; wk<=weeks; wk++) {
    const musculo = w * (1 - g/100);
    points.push({ semana: wk, peso: Math.round(w*10)/10, grasaPct: Math.round(g*10)/10, musculo: Math.round(musculo*10)/10 });
    const wChange = dailyDelta * 7;
    // Asume pérdida mayoritariamente de grasa (85%) si déficit, ganancia mayoritariamente muscular (60%) si superávit
    const fatChange = wChange < 0 ? wChange * 0.85 : wChange * 0.4;
    const muscChange = wChange - fatChange;
    const newFatKg = Math.max(0, (w * g/100) + fatChange);
    const newMuscKg = Math.max(0, musculo + muscChange);
    w = Math.max(40, newFatKg + newMuscKg);
    g = Math.max(5, Math.min(50, (newFatKg / w) * 100));
  }
  return points;
}

function detectPlateaus(exlog) {
  const plateaus = [];
  Object.entries(exlog||{}).forEach(([exName, sets])=>{
    if (!sets || sets.length < 9) return;
    const sorted = [...sets].filter(s=>s?.date&&s?.w)/* ⚡ Bolt: Lexicographical string comparison is up to 7x faster than new Date() or localeCompare */ .sort((a,b)=>a.date < b.date ? -1 : (a.date > b.date ? 1 : 0));
    // Agrupamos por semana
    const byWeek = {};
    sorted.forEach(s=>{
      const d = new Date(s.date);
      const wk = `${d.getFullYear()}-W${Math.floor(d.getDay()/7)}`;
      const wkKey = s.date.slice(0,10).slice(0,7) + "-" + Math.floor(parseInt(s.date.slice(8,10))/7);
      if(!byWeek[wkKey]) byWeek[wkKey]=[];
      byWeek[wkKey].push(parseFloat(s.w)||0);
    });
    const weekMaxes = Object.values(byWeek).map(ws=>Math.max(...ws));
    if (weekMaxes.length >= 3) {
      const last3 = weekMaxes.slice(-3);
      if (last3.every(v => Math.abs(v - last3[0]) < 2.5)) {
        plateaus.push({ exercise: exName, weight: last3[0], weeks: last3.length });
      }
    }
  });
  return plateaus;
}

function calcProgressiveOverload(exlog) {
  const suggestions = {};
  Object.entries(exlog||{}).forEach(([exName, sets])=>{
    if (!sets || sets.length === 0) return;
    const sorted = [...sets].filter(s=>s?.date&&s?.w)/* ⚡ Bolt: Lexicographical string comparison is up to 7x faster than new Date() or localeCompare */ .sort((a,b)=>b.date < a.date ? -1 : (b.date > a.date ? 1 : 0));
    const recent = sorted.slice(0,5);
    const maxW = Math.max(...recent.map(s=>parseFloat(s.w)||0));
    const maxReps = Math.max(...recent.filter(s=>parseFloat(s.w)===maxW).map(s=>parseInt(s.reps)||0));
    const isCompound = ["Sentadilla","Peso muerto","Press banca","Dominadas","Remo barra","Prensa"].some(c=>exName.includes(c));
    const increment = isCompound ? 2.5 : 1;
    if (maxReps >= 8) suggestions[exName] = { currentMax: maxW, suggested: maxW + increment, reason: `${maxReps} reps con ${maxW}kg → sube` };
  });
  return suggestions;
}

function detectMuscleImbalances(exlog) {
  const muscleCount = {};
  Object.entries(exlog||{}).forEach(([exName, sets])=>{
    if (!sets || sets.length === 0) return;
    const recent = sets.filter(s=>s?.date && new Date(s.date) > new Date(Date.now()-28*86400000));
    if (recent.length === 0) return;
    const muscles = MUSCLES[exName] || [];
    muscles.forEach(m=>{ muscleCount[m] = (muscleCount[m]||0) + recent.length; });
  });
  const imbalances = [];
  const push = (muscleCount["Pectoral"]||0) + (muscleCount["Tríceps"]||0);
  const pull = (muscleCount["Espalda"]||0) + (muscleCount["Bíceps"]||0);
  const quad = (muscleCount["Cuádriceps"]||0);
  const hams = (muscleCount["Isquios"]||0);
  if (push > 0 && pull > 0 && push/pull > 1.5) imbalances.push(`Empuje (${push} series) vs Jalón (${pull} series) — desbalance ${Math.round(push/pull*10)/10}:1`);
  if (quad > 0 && hams > 0 && quad/hams > 1.5) imbalances.push(`Cuádriceps (${quad}) vs Isquios (${hams}) — desbalance ${Math.round(quad/hams*10)/10}:1`);
  return imbalances;
}

function analyzeMacroPattern(foodlog) {
  const dates = Object.keys(foodlog).sort().slice(-7);
  if (dates.length < 3) return null;
  let totP=0, totC=0, totF=0, totKcal=0, days=0;
  dates.forEach(d=>{
    const entries = foodlog[d]||[];
    if (entries.length===0) return;
    entries.forEach(e=>{ totP+=(+e.proteina||0); totC+=(+e.carbo||0); totF+=(+e.grasa||0); totKcal+=(+e.kcal||0); });
    days++;
  });
  if (days===0) return null;
  return { avgP: Math.round(totP/days), avgC: Math.round(totC/days), avgF: Math.round(totF/days), avgKcal: Math.round(totKcal/days), days };
}

function detectFatigueFromNotes(notes) {
  const fatigueKeywords = ["cansancio","agotado","agotada","fatiga","sin energía","sin energia","no dormí","no dormi","mal dormi","dolor muscular","recuperación","muy cansado","quemado","burnout"];
  const recent = (notes||[]).filter(n=>n?.date && new Date(n.date) > new Date(Date.now()-7*86400000));
  const fatigueCount = recent.filter(n=>{
    const text = (n.text||"").toLowerCase();
    return fatigueKeywords.some(k=>text.includes(k));
  }).length;
  return fatigueCount;
}

function calcWeightTrend(metricslog) {
  const dates = Object.keys(metricslog||{}).filter(d=>metricslog[d]?.weight).sort().slice(-14);
  if (dates.length < 3) return null;
  const weights = dates.map(d=>parseFloat(metricslog[d].weight)||0);
  const reg = linearRegression(weights);
  // slope es cambio por día en índice, convertir a kg/semana
  const kgPerWeek = reg.slope * 7;
  return { kgPerWeek: Math.round(kgPerWeek*100)/100, trend: kgPerWeek < -0.1 ? "bajando" : kgPerWeek > 0.1 ? "subiendo" : "estancado", dataPoints: dates.length };
}

function getWeeklyStats(foodlog, exlog, metricslog, notes) {
  const last7 = [...Array(7)].map((_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-i);
    return d.toISOString().slice(0,10);
  }).reverse();
  const trainDays = last7.filter(d => Object.values(exlog||{}).some(sets=>(sets||[]).some(s=>s?.date?.slice(0,10)===d)));
  const avgProtein = last7.reduce((s,d)=>{ const fl=foodlog[d]||[]; return s+(fl.reduce((a,e)=>a+(+e.proteina||0),0)); },0)/Math.max(1,last7.filter(d=>(foodlog[d]||[]).length>0).length);
  const avgKcal = last7.reduce((s,d)=>{ const fl=foodlog[d]||[]; return s+(fl.reduce((a,e)=>a+(+e.kcal||0),0)); },0)/Math.max(1,last7.filter(d=>(foodlog[d]||[]).length>0).length);
  const weightDates = last7.filter(d=>metricslog?.[d]?.weight);
  const weightChange = weightDates.length>=2 ? parseFloat(metricslog[weightDates[weightDates.length-1]].weight)-parseFloat(metricslog[weightDates[0]].weight) : null;
  const fatigueCount = detectFatigueFromNotes(notes);
  return { trainDays: trainDays.length, avgProtein: Math.round(avgProtein), avgKcal: Math.round(avgKcal), weightChange, fatigueCount };
}

// ── Agente Entrenador: funciones puras ──

function calcWeeklyTrainingLoad(exlog) {
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const mondayOfWeek = new Date();
    mondayOfWeek.setDate(mondayOfWeek.getDate() - ((mondayOfWeek.getDay()+6)%7) - i*7);
    mondayOfWeek.setHours(0,0,0,0);
    const sundayOfWeek = new Date(mondayOfWeek);
    sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
    sundayOfWeek.setHours(23,59,59,999);
    const weekStart = mondayOfWeek.getTime();
    const weekEnd = sundayOfWeek.getTime();
    let totalSets = 0, totalVol = 0;
    Object.values(exlog||{}).forEach(sets=>{
      (sets||[]).forEach(s=>{
        if (!s?.date || s?.type === "warmup") return;
        const t = new Date(s.date).getTime();
        if (t >= weekStart && t <= weekEnd) {
          totalSets++;
          totalVol += (parseFloat(s.w)||0) * (parseInt(s.reps)||0);
        }
      });
    });
    const weekNum = (() => {
      const d = new Date(mondayOfWeek);
      d.setHours(0,0,0,0);
      d.setDate(d.getDate()+3-(d.getDay()+6)%7);
      const week1 = new Date(d.getFullYear(),0,4);
      return 1+Math.round(((d-week1)/86400000-3+(week1.getDay()+6)%7)/7);
    })();
    weeks.push({ weekLabel:`Sem ${weekNum}`, totalSets, totalVol: Math.round(totalVol) });
  }
  return weeks;
}

function detectDeloadNeed(exlog, notes, _metricslog) {
  const weeks = calcWeeklyTrainingLoad(exlog);
  const fatigueScore = detectFatigueFromNotes(notes);
  let weeksSinceDeload = 8;
  for (let i = weeks.length - 1; i >= 4; i--) {
    const prev4avg = weeks.slice(i-4, i).reduce((s,w)=>s+w.totalSets,0)/4;
    if (prev4avg > 0 && weeks[i].totalSets < prev4avg * 0.6) {
      weeksSinceDeload = weeks.length - 1 - i;
      break;
    }
  }
  const allSets = weeks.map(w=>w.totalSets).filter(s=>s>0);
  const medianSets = allSets.length ? allSets.sort((a,b)=>a-b)[Math.floor(allSets.length/2)] : 0;
  let consecutiveHighWeeks = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (weeks[i].totalSets > medianSets * 1.15) consecutiveHighWeeks++;
    else break;
  }
  let urgency = 'none';
  if (weeksSinceDeload >= 7 || fatigueScore >= 3 || consecutiveHighWeeks >= 5) urgency = 'high';
  else if (weeksSinceDeload >= 6 || (consecutiveHighWeeks >= 3 && fatigueScore >= 1)) urgency = 'medium';
  else if (weeksSinceDeload >= 4 || consecutiveHighWeeks >= 3) urgency = 'low';
  const reasons = [];
  if (weeksSinceDeload >= 4) reasons.push(`${weeksSinceDeload} sem sin deload`);
  if (consecutiveHighWeeks >= 3) reasons.push(`${consecutiveHighWeeks} sem de carga alta consecutivas`);
  if (fatigueScore >= 2) reasons.push(`${fatigueScore} notas de fatiga`);
  return { recommended: urgency !== 'none', urgency, reason: reasons.join(' + ') || 'Carga moderada', weeksSinceDeload };
}

const MUSCLE_ALIASES = {
  "Deltoide ant.":"Deltoides","Deltoide lat.":"Deltoides","Deltoide post.":"Deltoides",
  "Core":"Core","Pantorrilla":"Pantorrillas"
};
function calcMuscleVolumeBalance(exlog, exercises) {
  const primaryMuscles = ["Pectoral","Espalda","Cuádriceps","Isquios","Deltoides","Bíceps","Tríceps","Glúteos","Antebrazo","Core","Pantorrillas"];
  const counts = {};
  primaryMuscles.forEach(m=>{ counts[m] = 0; });
  const cutoff28 = Date.now() - 28*86400000;
  Object.entries(exlog||{}).forEach(([exName, sets])=>{
    const muscleList = (exercises&&exercises[exName]?.musculos) || MUSCLES[exName] || [];
    const recentSets = (sets||[]).filter(s=>s?.date && new Date(s.date).getTime()>cutoff28 && s?.type!=="warmup");
    muscleList.forEach(rawM=>{
      const m = MUSCLE_ALIASES[rawM] || rawM;
      if (m in counts) counts[m] += recentSets.length;
    });
  });
  const result = {};
  primaryMuscles.forEach(m=>{
    const setsPerWeek = Math.round((counts[m]/4)*10)/10;
    let status, recommendation;
    if (setsPerWeek === 0) { status="neglected"; recommendation="Sin trabajo en 4 sem — añade ≥2 series/sem"; }
    else if (setsPerWeek < 8) { status="low"; recommendation=`Solo ${setsPerWeek} ser/sem — objetivo mínimo 8`; }
    else if (setsPerWeek <= 20) { status="optimal"; recommendation="Volumen en rango óptimo"; }
    else { status="high"; recommendation="Posible sobrevolumen — considera reducir"; }
    result[m] = { setsPerWeek, status, recommendation };
  });
  return result;
}

export default function App(){
  const [view, setView] = useState(() => {
    return localStorage.getItem("onboarding_shown") ? "hoy" : "onboarding";
  });
  const [aiParsedResults, setAiParsedResults] = useState([]);
  const [editingEntryIdx, setEditingEntryIdx] = useState(null);
  const [editingEntryData, setEditingEntryData] = useState(null);
  const [addFoodInputText, setAddFoodInputText] = useState("");
  const [splits, setSplits] = useState(DEFAULT_SPLITS);
  const [presetKey, setPresetKey] = useState("definicion");
  const [customPresets, setCustomPresets] = useState(DEFAULT_PRESETS);
  const [log, setLog] = useState([]); 
  const [notes, setNotes] = useState([]);
  const [chat, setChat] = useState([]); 
  const [exlog, setExlog] = useState({});
  const [exercises, setExercises] = useState(seedExercises());
  const [water, setWater] = useState(0);
  const [supplements, setSupplements] = useState({ Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false });
  const [chatBusy, setChatBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [aiModel, setAiModel] = useState("moonshotai/kimi-k2.6:free");
  const [prAlerts, setPrAlerts] = useState([]);
  const [workoutDurations, setWorkoutDurations] = useState({});

  // ── 20 AI Features: New States ──
  const [smartGoals, setSmartGoals] = useState([]); // #10 - Adaptive Goals
  const [challenges, setChallenges] = useState([]); // #20 - Gamification
  const [weeklyInsight, setWeeklyInsight] = useState(null); // #19 - Correlations
  const [projections, setProjections] = useState([]); // #15 - 12-week projection
  const [tdeeEstimate, setTdeeEstimate] = useState(null); // #12 - Real TDEE
  const [upcomingEvent, setUpcomingEvent] = useState(null); // #13 - Event planning
  const [experiments, setExperiments] = useState([]); // #18 - A/B experiments
  const [overloadSuggestions, setOverloadSuggestions] = useState({}); // #8 - Progressive overload
  const [plateauAlerts, setPlateauAlerts] = useState([]); // #6 - Plateau detection
  const [muscleImbalances, setMuscleImbalances] = useState([]); // #9 - Imbalances
  const [proactiveMsg, setProactiveMsg] = useState(null); // #16 - Proactive coach
  const [analyzeBusy, setAnalyzeBusy] = useState(false); // Analysis in progress
  const [aiNotifications, setAiNotifications] = useState([]); // In-app AI notifications
  const [macroAdjustSuggestion, setMacroAdjustSuggestion] = useState(null); // #1 - Macro adjustment
  const [weightTrend, setWeightTrend] = useState(null); // Weight trend data
  const [showTrainerAgent, setShowTrainerAgent] = useState(false);
  const [trainerAgentData, setTrainerAgentData] = useState(null);
  const [trainerAgentBusy, setTrainerAgentBusy] = useState(false);

  // Elevated Calendar States & Helpers
  const [calMonth, setCalMonth] = useState(() => new Date());
  
  const getLocalDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDateStr, setSelectedDateStr] = useState(() => getLocalDateStr(new Date()));

  const getLocalDateFromISO = (isoString) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return getLocalDateStr(d);
    } catch (e) {
      return "";
    }
  };

  const getMetricsForDate = (dateStr) => {
    const entries = Object.entries(metricslog || {})
      .filter(([d]) => d <= dateStr)
      /* ⚡ Bolt: Lexicographical string comparison is up to 7x faster than new Date() or localeCompare */ .sort((a, b) => b[0] < a[0] ? -1 : (b[0] > a[0] ? 1 : 0));
    
    if (entries.length > 0) {
      const latest = entries[0][1] || {};
      return {
        weight: parseFloat(latest.weight) || START_W,
        musculo: parseFloat(latest.musculo) || (bodyComp ? bodyComp.musculo : 64.7),
        grasaPct: parseFloat(latest.grasaPct) || (bodyComp ? bodyComp.grasaPct : 26.2),
        visceral: parseInt(latest.visceral) || (bodyComp ? bodyComp.visceral : 9),
        brazoDer: (latest.brazoDer !== undefined && latest.brazoDer !== "") ? parseFloat(latest.brazoDer) : "",
        brazoIzq: (latest.brazoIzq !== undefined && latest.brazoIzq !== "") ? parseFloat(latest.brazoIzq) : "",
        musloDer: (latest.musloDer !== undefined && latest.musloDer !== "") ? parseFloat(latest.musloDer) : "",
        musloIzq: (latest.musloIzq !== undefined && latest.musloIzq !== "") ? parseFloat(latest.musloIzq) : "",
        pantorrillaDer: (latest.pantorrillaDer !== undefined && latest.pantorrillaDer !== "") ? parseFloat(latest.pantorrillaDer) : "",
        pantorrillaIzq: (latest.pantorrillaIzq !== undefined && latest.pantorrillaIzq !== "") ? parseFloat(latest.pantorrillaIzq) : "",
        cintura: (latest.cintura !== undefined && latest.cintura !== "") ? parseFloat(latest.cintura) : "",
        pecho: (latest.pecho !== undefined && latest.pecho !== "") ? parseFloat(latest.pecho) : "",
      };
    }
    
    const wNotes = (notes || [])
      .filter(n => n && n.type === "peso" && n.date && n.date.slice(0, 10) <= dateStr && n.weight)
      /* ⚡ Bolt: Lexicographical string comparison is up to 7x faster than new Date() or localeCompare */ .sort((a, b) => b.date < a.date ? -1 : (b.date > a.date ? 1 : 0));
    const wVal = parseFloat(wNotes.length > 0 ? wNotes[0].weight : ((notes || []).find(n => n && n.type === "peso" && n.weight)?.weight || START_W)) || START_W;
    
    return {
      weight: wVal,
      musculo: parseFloat(bodyComp ? bodyComp.musculo : 64.7) || 64.7,
      grasaPct: parseFloat(bodyComp ? bodyComp.grasaPct : 26.2) || 26.2,
      visceral: parseInt(bodyComp ? bodyComp.visceral : 9) || 9,
      brazoDer: "", brazoIzq: "", musloDer: "", musloIzq: "", pantorrillaDer: "", pantorrillaIzq: "", cintura: "", pecho: ""
    };
  };

  const checkNewPR = (exName, newW, newRepsStr, currentExlog = exlog, newRir = null) => {
    const sets = (currentExlog || {})[exName] || [];
    if (sets.length === 0) return null;
    
    const newReps = parseInt(newRepsStr);
    if (isNaN(newW) || isNaN(newReps) || newReps <= 0) return null;
    
    const newRirNum = (newRir !== null && newRir !== undefined && !isNaN(parseInt(newRir))) ? parseInt(newRir) : 0;
    const new1RM = newW * (1 + (newReps + newRirNum) / 30);
    
    let maxWeight = 0;
    let maxRepsForThisWeight = 0;
    let max1RM = 0;
    
    sets.forEach(s => {
      const sw = parseFloat(s.w);
      const sreps = parseInt(s.reps);
      if (!isNaN(sw) && !isNaN(sreps) && sreps > 0) {
        if (sw > maxWeight) maxWeight = sw;
        if (sw === newW && sreps > maxRepsForThisWeight) {
          maxRepsForThisWeight = sreps;
        }
        const sRirNum = (s.rir !== null && s.rir !== undefined && !isNaN(parseInt(s.rir))) ? parseInt(s.rir) : 0;
        const s1RM = sw * (1 + (sreps + sRirNum) / 30);
        if (s1RM > max1RM) max1RM = s1RM;
      }
    });
    
    let prMsg = "";
    if (new1RM > max1RM && max1RM > 0) {
      prMsg = `¡Nuevo PR de Fuerza Estimada (1RM)! ${new1RM.toFixed(1)} kg (antes ${max1RM.toFixed(1)} kg)`;
    } else if (newW > maxWeight && maxWeight > 0) {
      prMsg = `¡Nuevo peso máximo levantado! ${newW} kg (antes ${maxWeight} kg)`;
    } else if (newW === maxWeight && newReps > maxRepsForThisWeight && maxRepsForThisWeight > 0) {
      prMsg = `¡Nuevo récord de repeticiones para ${newW} kg! ${newReps} reps (antes ${maxRepsForThisWeight} reps)`;
    }
    
    return prMsg;
  };

  // Consolidated History & Inventory States
  const [foodlog, setFoodlog] = useState({});
  const [waterlog, setWaterlog] = useState({});
  const [suppslog, setSuppslog] = useState({});
  const [metricslog, setMetricslog] = useState({});
  const [suppsInventory, setSuppsInventory] = useState({
    "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
    "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
  });

  // Cloud Sync states
  const [syncCode, setSyncCode] = useState("");
  const [cloudSync, setCloudSync] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Desconectado");

  const [bodyComp, setBodyComp] = useState({ musculo: 64.7, grasaPct: 26.2, visceral: 9 });
  const [shoppingList, setShoppingList] = useState({ categorias: [] });
  const [meals, setMeals] = useState(DEFAULT_MEALS);
  const [customSuggestions, setCustomSuggestions] = useState([]);
  const [activeSplitKey, setActiveSplitKey] = useState("A");

  // Supabase States
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [sbSyncing, setSbSyncing] = useState(false);
  const [sbError, setSbError] = useState("");

  const target = customPresets[presetKey] || customPresets.personalizado || DEFAULT_PRESETS.personalizado;

  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [modalMode, setModalMode] = useState("manual"); // "manual" or "ai"
  const [modalVals, setModalVals] = useState({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
  const [modalAiPrompt, setModalAiPrompt] = useState("");
  const [modalAiReasoning, setModalAiReasoning] = useState("");
  const [modalAiBusy, setModalAiBusy] = useState(false);
  const [modalAiErr, setModalAiErr] = useState("");

  const updateAllMacrosAndAdjustMeals = (newKcal, newP, newC, newF) => {
    const oldTarget = { ...target };
    const factor = newKcal / oldTarget.kcal;
    
    let nextMeals = meals;
    if (factor > 0 && factor !== 1) {
      nextMeals = meals.map(meal => {
        let newKcalStr = meal.kcal;
        const kcalMatch = meal.kcal.match(/(\d+)/);
        if (kcalMatch) {
          const val = parseInt(kcalMatch[1]);
          const scaledVal = Math.round(val * factor);
          newKcalStr = meal.kcal.replace(/\d+/, scaledVal);
        }
        
        const nextOpts = meal.opts.map(opt => {
          return opt.replace(/(\d+(\.\d+)?)\s*(g|ml|scoop|scoops|huevo|huevos|clara|claras|rebanada|rebanadas|tostada|tostadas|unidades|unidad)\b/gi, (match, numStr, decimal, unitWord) => {
            const val = parseFloat(numStr);
            const scaled = Math.round(val * factor * 10) / 10;
            const formatted = Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
            return `${formatted} ${unitWord}`;
          });
        });
        
        return {
          ...meal,
          kcal: newKcalStr,
          opts: nextOpts
        };
      });
    }
    
    const nextVals = { kcal: newKcal, p: newP, c: newC, f: newF };
    const newPresets = {
      ...customPresets,
      [presetKey]: {
        ...customPresets[presetKey],
        ...nextVals
      }
    };
    
    const updates = { customPresets: newPresets };
    if (factor > 0 && factor !== 1) {
      updates.meals = nextMeals;
    }
    saveState(updates);
  };

  const handleQueryAiNutrition = async () => {
    if (!modalAiPrompt.trim() || modalAiBusy) return;
    setModalAiBusy(true);
    setModalAiErr("");
    setModalAiReasoning("");
    
    try {
      const promptText = `Bruno quiere ajustar sus objetivos de nutrición.
Datos actuales:
- Preset actual: ${presetKey} (${target.label})
- Macros actuales: ${target.kcal} kcal, ${target.p}g Proteína, ${target.c}g Carbohidratos, ${target.f}g Grasas.
- Peso corporal: ${activeMetrics.weight} kg
- Masa muscular: ${activeMetrics.musculo} kg
- Grasa corporal: ${activeMetrics.grasaPct}%

Solicitud del usuario: "${modalAiPrompt.trim()}"

Calcula los nuevos objetivos de calorías y macronutrientes optimizados para esta solicitud y su perfil.
Fórmula calórica obligatoria: kcal = (proteina * 4) + (carbo * 4) + (grasa * 9).
Devuelve la propuesta en formato JSON con la explicación breve de tus cálculos.`;

      const sysInstruction = "Eres un nutricionista deportivo de élite y experto en recomposición corporal. Calcula los macros optimizados en gramos y calorías totales. Devuelve un formato JSON estricto que cumpla con el esquema requerido.";
      
      const schema = {
        type: "OBJECT",
        properties: {
          kcal: { type: "NUMBER" },
          proteina: { type: "NUMBER" },
          carbo: { type: "NUMBER" },
          grasa: { type: "NUMBER" },
          reasoning: { type: "STRING" }
        },
        required: ["kcal", "proteina", "carbo", "grasa", "reasoning"]
      };

      const out = await callGemini([{ role: "user", content: promptText }], sysInstruction, schema);
      const parsed = cleanAndParseJSON(out);
      
      if (!parsed.kcal || !parsed.proteina || !parsed.carbo || !parsed.grasa) {
        throw new Error("No se recibieron los macros optimizados.");
      }
      
      setModalVals({
        kcal: Math.round(parsed.kcal),
        p: Math.round(parsed.proteina),
        c: Math.round(parsed.carbo),
        f: Math.round(parsed.grasa)
      });
      setModalAiReasoning(parsed.reasoning || "Cálculo completado.");
    } catch (e) {
      console.error(e);
      setModalAiErr("Error al consultar la IA: " + (e.message || "Verifica tu conexión y API Key."));
    } finally {
      setModalAiBusy(false);
    }
  };

  // Carga inicial
  useEffect(() => { 
    (async() => {
      // Cargar configuraciones de Supabase
      const storedSbUrl = await loadKey("supabase_url", "");
      const storedSbKey = await loadKey("supabase_anon_key", "");
      setSupabaseUrl(storedSbUrl);
      setSupabaseAnonKey(storedSbKey);

      if (storedSbUrl && storedSbKey) {
        const client = initSupabase(storedSbUrl, storedSbKey);
        if (client) {
          try {
            const { data: { session } } = await client.auth.getSession();
            if (session?.user) {
              setSupabaseUser(session.user);
            }
          } catch(e) {
            console.error("Error al obtener sesión de Supabase:", e);
          }
        }
      }

      const storedSyncCode = await loadKey("sync_code", "");
      const storedCloudSync = await loadKey("cloud_sync_enabled", false);
      
      const isValidCode = storedSyncCode && !storedSyncCode.startsWith("bf-");
      const activeCode = isValidCode ? storedSyncCode : "";
      const activeCloudSync = isValidCode ? storedCloudSync : false;
      
      setSyncCode(activeCode);
      setCloudSync(activeCloudSync);
      if (!isValidCode && storedCloudSync) {
        await saveKey("cloud_sync_enabled", false);
        await saveKey("sync_code", "");
      }

      // Si tiene la sincronización activa, intentamos descargar de la nube primero
      let initialData = null;
      if (activeCloudSync && activeCode) {
        setSyncStatus("Sincronizando...");
        initialData = await fetchStateFromCloud(activeCode);
      }

      // Cargar fallbacks locales
      const prof = await loadKey("profile", { presetKey: "definicion" });
      const localPresetKey = prof.presetKey || "definicion";
      let localNotes = await loadKey("notes", []);
      if (!Array.isArray(localNotes)) localNotes = [];
      let localChat = await loadKey("chat", []);
      if (!Array.isArray(localChat)) localChat = [];
      let localExlog = await loadKey("exlog", {});
      if (!localExlog || typeof localExlog !== 'object') localExlog = {};
      let localExercises = await loadKey("exercises", null);
      if (!localExercises || typeof localExercises !== 'object') { localExercises = seedExercises(); await saveKey("exercises", localExercises); }
      let localBodyComp = await loadKey("body_comp", { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      if (!localBodyComp || typeof localBodyComp !== 'object') localBodyComp = { musculo: 64.7, grasaPct: 26.2, visceral: 9 };
      let localShoppingList = await loadKey("shopping_list", { categorias: [] });
      if (!localShoppingList || typeof localShoppingList !== 'object') localShoppingList = { categorias: [] };
      let localMeals = await loadKey("meals", DEFAULT_MEALS);
      if (!Array.isArray(localMeals)) localMeals = DEFAULT_MEALS;
      let localCustomSuggestions = await loadKey("custom_suggestions", []);
      if (!Array.isArray(localCustomSuggestions)) localCustomSuggestions = [];
      const localSplitKey = await loadKey("active_split_key", "A");
      let localSplits = await loadKey("training_splits", DEFAULT_SPLITS);
      if (!Array.isArray(localSplits)) localSplits = DEFAULT_SPLITS;

      let localFoodlog = await loadKey("foodlog", {});
      if (!localFoodlog || typeof localFoodlog !== 'object') localFoodlog = {};
      let localWaterlog = await loadKey("waterlog", {});
      if (!localWaterlog || typeof localWaterlog !== 'object') localWaterlog = {};
      let localSuppslog = await loadKey("suppslog", {});
      if (!localSuppslog || typeof localSuppslog !== 'object') localSuppslog = {};
      let localMetricslog = await loadKey("metricslog", {});
      if (!localMetricslog || typeof localMetricslog !== 'object') localMetricslog = {};
      let localSuppsInventory = await loadKey("supps_inventory", {
        "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
        "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
      });
      if (!localSuppsInventory || typeof localSuppsInventory !== 'object') {
        localSuppsInventory = {
          "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
          "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
        };
      }
      let localWorkoutDurations = await loadKey("workout_durations", {});
      if (!localWorkoutDurations || typeof localWorkoutDurations !== 'object') localWorkoutDurations = {};

      let localCustomPresets = await loadKey("custom_presets", DEFAULT_PRESETS);
      if (!localCustomPresets || typeof localCustomPresets !== 'object') {
        localCustomPresets = DEFAULT_PRESETS;
      }

      let finalPresetKey = localPresetKey;
      let finalCustomPresets = localCustomPresets;
      let finalNotes = localNotes;
      let finalChat = localChat;
      let finalExlog = localExlog;
      let finalExercises = localExercises;
      let finalBodyComp = localBodyComp;
      let finalShoppingList = localShoppingList;
      let finalMeals = localMeals;
      let finalCustomSuggestions = localCustomSuggestions;
      let finalSplitKey = localSplitKey;
      let finalSplits = localSplits;

      if (initialData) {
        finalPresetKey = initialData.presetKey || localPresetKey;
        finalCustomPresets = (initialData.customPresets && typeof initialData.customPresets === 'object') ? initialData.customPresets : localCustomPresets;
        finalNotes = Array.isArray(initialData.notes) ? initialData.notes : localNotes;
        finalChat = Array.isArray(initialData.chat) ? initialData.chat : localChat;
        finalExlog = (initialData.exlog && typeof initialData.exlog === 'object') ? initialData.exlog : localExlog;
        finalExercises = (initialData.exercises && typeof initialData.exercises === 'object') ? initialData.exercises : localExercises;
        finalBodyComp = (initialData.bodyComp && typeof initialData.bodyComp === 'object') ? initialData.bodyComp : localBodyComp;
        finalShoppingList = (initialData.shoppingList && typeof initialData.shoppingList === 'object') ? initialData.shoppingList : localShoppingList;
        finalMeals = Array.isArray(initialData.meals) ? initialData.meals : localMeals;
        finalCustomSuggestions = Array.isArray(initialData.customSuggestions) ? initialData.customSuggestions : localCustomSuggestions;
        finalSplitKey = initialData.activeSplitKey || localSplitKey;
        finalSplits = Array.isArray(initialData.splits) ? initialData.splits : localSplits;

        localFoodlog = (initialData.foodlog && typeof initialData.foodlog === 'object') ? initialData.foodlog : localFoodlog;
        localWaterlog = (initialData.waterlog && typeof initialData.waterlog === 'object') ? initialData.waterlog : localWaterlog;
        localSuppslog = (initialData.suppslog && typeof initialData.suppslog === 'object') ? initialData.suppslog : localSuppslog;
        localMetricslog = (initialData.metricslog && typeof initialData.metricslog === 'object') ? initialData.metricslog : localMetricslog;
        localSuppsInventory = (initialData.suppsInventory && typeof initialData.suppsInventory === 'object') ? initialData.suppsInventory : localSuppsInventory;
        localWorkoutDurations = (initialData.workoutDurations && typeof initialData.workoutDurations === 'object') ? initialData.workoutDurations : localWorkoutDurations;
      }

      // MIGRATION OF LEGACY DAILY DATA
      let migrated = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("log-")) {
          const dateStr = key.replace("log-", "");
          if (dateStr.length === 10 && !localFoodlog[dateStr]) {
            try {
              const val = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(val) && val.length > 0) {
                localFoodlog[dateStr] = val;
                migrated = true;
              }
            } catch(e) {}
          }
        } else if (key && key.startsWith("water-")) {
          const dateStr = key.replace("water-", "");
          if (dateStr.length === 10 && localWaterlog[dateStr] === undefined) {
            try {
              const val = JSON.parse(localStorage.getItem(key));
              if (typeof val === "number" && val > 0) {
                localWaterlog[dateStr] = val;
                migrated = true;
              }
            } catch(e) {}
          }
        } else if (key && key.startsWith("supps-")) {
          const dateStr = key.replace("supps-", "");
          if (dateStr.length === 10 && !localSuppslog[dateStr]) {
            try {
              const val = JSON.parse(localStorage.getItem(key));
              if (val && typeof val === "object") {
                localSuppslog[dateStr] = val;
                migrated = true;
              }
            } catch(e) {}
          }
        }
      }

      // Migrate weights and composition notes into metricslog
      finalNotes.forEach(n => {
        try {
          const dStr = n.date.slice(0, 10);
          if (dStr && dStr.length === 10) {
            if (!localMetricslog[dStr]) {
              localMetricslog[dStr] = {};
            }
            if (n.type === "peso" && n.weight && !localMetricslog[dStr].weight) {
              localMetricslog[dStr].weight = n.weight;
              migrated = true;
            }
            if (n.type === "composicion" && n.text && !localMetricslog[dStr].grasaPct) {
              const muscMatch = n.text.match(/Músculo\s+([0-9.]+)/i);
              const grasaMatch = n.text.match(/Grasa\s+([0-9.]+)/i);
              const viscMatch = n.text.match(/Visceral\s+Grado\s+(\d+)/i);
              if (muscMatch) { localMetricslog[dStr].musculo = parseFloat(muscMatch[1]); migrated = true; }
              if (grasaMatch) { localMetricslog[dStr].grasaPct = parseFloat(grasaMatch[1]); migrated = true; }
              if (viscMatch) { localMetricslog[dStr].visceral = parseInt(viscMatch[1]); migrated = true; }
            }
          }
        } catch(e) {}
      });

      // Persistir de inmediato localmente para evitar pérdidas
      await saveKey("profile", { presetKey: finalPresetKey });
      await saveKey("custom_presets", finalCustomPresets);
      await saveKey("notes", finalNotes);
      await saveKey("chat", finalChat);
      await saveKey("exlog", finalExlog);
      await saveKey("exercises", finalExercises);
      await saveKey("body_comp", finalBodyComp);
      await saveKey("shopping_list", finalShoppingList);
      await saveKey("meals", finalMeals);
      await saveKey("custom_suggestions", finalCustomSuggestions);
      await saveKey("active_split_key", finalSplitKey);
      await saveKey("training_splits", finalSplits);
      
      await saveKey("foodlog", localFoodlog);
      await saveKey("waterlog", localWaterlog);
      await saveKey("suppslog", localSuppslog);
      await saveKey("metricslog", localMetricslog);
      await saveKey("supps_inventory", localSuppsInventory);
      await saveKey("workout_durations", localWorkoutDurations);
      if (initialData && initialData.updatedAt) {
        await saveKey("last_local_update", initialData.updatedAt);
      }

      setPresetKey(finalPresetKey);
      setCustomPresets(finalCustomPresets);
      setNotes(finalNotes);
      setChat(finalChat);
      setExlog(finalExlog);
      setExercises(finalExercises);
      setBodyComp(finalBodyComp);
      setShoppingList(finalShoppingList);
      setMeals(finalMeals);
      setCustomSuggestions(finalCustomSuggestions);
      setActiveSplitKey(finalSplitKey);
      setSplits(finalSplits);

      setFoodlog(localFoodlog || {});
      setWaterlog(localWaterlog || {});
      setSuppslog(localSuppslog || {});
      setMetricslog(localMetricslog || {});
      setSuppsInventory(localSuppsInventory || {
        "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
        "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
      });
      setWorkoutDurations(localWorkoutDurations || {});

      // Inicializar estados de hoy a partir del foodlog/waterlog/suppslog
      setLog((localFoodlog || {})[selectedDateStr] || []);
      setWater((localWaterlog || {})[selectedDateStr] || 0);
      setSupplements((localSuppslog || {})[selectedDateStr] || { Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false });

      setGeminiKey(await loadKey("gemini_api_key", DEFAULT_GEMINI_KEY));
      setAiModel(await loadKey("gemini_model", "moonshotai/kimi-k2.6:free"));
      setLoaded(true);

      // Load persisted AI data
      const savedGoals = await loadKey('smart_goals', []);
      if (savedGoals.length > 0) setSmartGoals(savedGoals);
      const savedChallenges = await loadKey('challenges', []);
      if (savedChallenges.length > 0) setChallenges(savedChallenges);
      const savedInsight = await loadKey('weekly_insight', null);
      if (savedInsight) setWeeklyInsight(savedInsight);
      const savedEvent = await loadKey('upcoming_event', null);
      if (savedEvent) setUpcomingEvent(savedEvent);
      const savedExperiments = await loadKey('experiments', []);
      if (savedExperiments.length > 0) setExperiments(savedExperiments);
      // Run initial pure-JS analysis (non-blocking)
      setTimeout(() => {
        try {
          setOverloadSuggestions(calcProgressiveOverload(finalExlog));
          setPlateauAlerts(detectPlateaus(finalExlog));
          setMuscleImbalances(detectMuscleImbalances(finalExlog));
          const trend = calcWeightTrend(localMetricslog);
          setWeightTrend(trend);
          const tdee = calcTDEE(localFoodlog, localMetricslog);
          setTdeeEstimate(tdee);
          if (trend && Math.abs(trend.kgPerWeek) < 0.1 && trend.dataPoints >= 7) {
            setMacroAdjustSuggestion({ type:'stalled', message:'Tu peso lleva '+trend.dataPoints+' registros sin moverse. Considera bajar -150 kcal.', adjustment:-150 });
          }
        } catch(e) { console.warn('Load analysis:', e); }
      }, 800);

      // Si la sincronización está activa, intentamos empujar el estado local actual
      if (activeCloudSync && activeCode) {
        const pending = await loadKey("pending_sync", null);
        const updateTime = Date.now();
        const stateToPush = pending || {
          presetKey: finalPresetKey,
          customPresets: finalCustomPresets,
          notes: finalNotes,
          chat: finalChat,
          exlog: finalExlog,
          exercises: finalExercises,
          bodyComp: finalBodyComp,
          shoppingList: finalShoppingList,
          meals: finalMeals,
          activeSplitKey: finalSplitKey,
          foodlog: localFoodlog,
          waterlog: localWaterlog,
          suppslog: localSuppslog,
          metricslog: localMetricslog,
          suppsInventory: localSuppsInventory,
          updatedAt: updateTime
        };

        try {
          await pushStateToCloud(activeCode, stateToPush);
          setSyncStatus("Sincronizado");
          await saveKey("pending_sync", null);
          await saveKey("last_local_update", stateToPush.updatedAt || updateTime);
        } catch (e) {
          await saveKey("pending_sync", stateToPush);
          setSyncStatus("Esperando verificación");
        }
      }
    })(); 
  }, []);

  // Auto-sincronización al volver a estar online
  useEffect(() => {
    const handleOnline = async () => {
      if (cloudSync && syncCode && !syncCode.startsWith("bf-")) {
        const pending = await loadKey("pending_sync", null);
        if (pending) {
          setSyncStatus("Sincronizando pendiente...");
          try {
            await pushStateToCloud(syncCode, pending);
            setSyncStatus("Sincronizado");
            await saveKey("pending_sync", null);
          } catch (e) {
            setSyncStatus("Offline (Guardado local)");
          }
        }
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [cloudSync, syncCode]);

  // Sincronización en segundo plano periódica y al enfocar la pestaña
  useEffect(() => {
    if (!cloudSync || !syncCode || syncCode.startsWith("bf-")) return;

    let isFetching = false;
    const pullLatest = async () => {
      if (isFetching || !navigator.onLine) return;
      isFetching = true;
      try {
        const cloudData = await fetchStateFromCloud(syncCode);
        if (cloudData && cloudData.updatedAt) {
          const localLastUpdate = await loadKey("last_local_update", 0);
          if (cloudData.updatedAt > localLastUpdate) {
            const nextFoodlog = (cloudData.foodlog && Object.keys(cloudData.foodlog).length > 0) ? cloudData.foodlog : undefined;
            const nextWaterlog = (cloudData.waterlog && Object.keys(cloudData.waterlog).length > 0) ? cloudData.waterlog : undefined;
            const nextSuppslog = (cloudData.suppslog && Object.keys(cloudData.suppslog).length > 0) ? cloudData.suppslog : undefined;
            const nextMetricslog = (cloudData.metricslog && Object.keys(cloudData.metricslog).length > 0) ? cloudData.metricslog : undefined;
            const nextSuppsInventory = cloudData.suppsInventory || {
              "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
              "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
            };
            const nextWorkoutDurations = cloudData.workoutDurations || {};

            // Actualizar estados React
            setPresetKey(cloudData.presetKey || "definicion");
            if (cloudData.customPresets) {
              setCustomPresets(cloudData.customPresets);
            }
            setNotes(cloudData.notes || []);
            setChat(cloudData.chat || []);
            setExlog(cloudData.exlog || {});
            setExercises(cloudData.exercises || seedExercises());
            setBodyComp(cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
            setShoppingList(cloudData.shoppingList || { categorias: [] });
            if (cloudData.meals && Array.isArray(cloudData.meals) && cloudData.meals.length > 0) setMeals(cloudData.meals);
            setCustomSuggestions(cloudData.customSuggestions || []);
            setActiveSplitKey(cloudData.activeSplitKey || "A");
            if (Array.isArray(cloudData.splits)) {
              setSplits(cloudData.splits);
            }

            if (nextFoodlog !== undefined) setFoodlog(nextFoodlog);
            if (nextWaterlog !== undefined) setWaterlog(nextWaterlog);
            if (nextSuppslog !== undefined) setSuppslog(nextSuppslog);
            if (nextMetricslog !== undefined) setMetricslog(nextMetricslog);
            setSuppsInventory(nextSuppsInventory);
            setWorkoutDurations(nextWorkoutDurations);

            // Guardar localmente
            await saveKey("profile", { presetKey: cloudData.presetKey || "definicion" });
            if (cloudData.customPresets) {
              await saveKey("custom_presets", cloudData.customPresets);
            }
            await saveKey("notes", cloudData.notes || []);
            await saveKey("chat", cloudData.chat || []);
            await saveKey("exlog", cloudData.exlog || {});
            await saveKey("exercises", cloudData.exercises || seedExercises());
            await saveKey("body_comp", cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
            await saveKey("shopping_list", cloudData.shoppingList || { categorias: [] });
            if (cloudData.meals && Array.isArray(cloudData.meals) && cloudData.meals.length > 0) await saveKey("meals", cloudData.meals);
            await saveKey("custom_suggestions", cloudData.customSuggestions || []);
            await saveKey("active_split_key", cloudData.activeSplitKey || "A");
            if (Array.isArray(cloudData.splits)) {
              await saveKey("training_splits", cloudData.splits);
            }

            if (nextFoodlog !== undefined) await saveKey("foodlog", nextFoodlog);
            if (nextWaterlog !== undefined) await saveKey("waterlog", nextWaterlog);
            if (nextSuppslog !== undefined) await saveKey("suppslog", nextSuppslog);
            if (nextMetricslog !== undefined) await saveKey("metricslog", nextMetricslog);
            await saveKey("supps_inventory", nextSuppsInventory);
            await saveKey("workout_durations", nextWorkoutDurations);
            await saveKey("last_local_update", cloudData.updatedAt);
            
            setSyncStatus("Sincronizado");
          }
        }
      } catch (e) {
        console.error("Error en auto-sincronización:", e);
      } finally {
        isFetching = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pullLatest();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", pullLatest);
    const interval = setInterval(pullLatest, 30000);

    pullLatest();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", pullLatest);
      clearInterval(interval);
    };
  }, [cloudSync, syncCode]);

  // Sincronizar estados locales cuando cambia selectedDateStr o los históricos
  useEffect(() => {
    if (!loaded) return;
    setLog(foodlog[selectedDateStr] || []);
    setWater(waterlog[selectedDateStr] || 0);
    setSupplements(suppslog[selectedDateStr] || { Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false });
  }, [selectedDateStr, foodlog, waterlog, suppslog, loaded]);

  // Auto-dismiss de alertas de PR tras 6 segundos
  useEffect(() => {
    if (prAlerts && prAlerts.length > 0) {
      const timer = setTimeout(() => {
        setPrAlerts([]);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [prAlerts]);

  // Función para guardar el estado completo localmente y en la nube
  const saveState = async (updates) => {
    const updateTime = Date.now();
    
    let nextFoodlog = { ...foodlog };
    if (updates.log !== undefined) {
      nextFoodlog[selectedDateStr] = updates.log;
    }
    
    let nextWaterlog = { ...waterlog };
    if (updates.water !== undefined) {
      nextWaterlog[selectedDateStr] = updates.water;
    }
    
    let nextSuppslog = { ...suppslog };
    if (updates.supplements !== undefined) {
      nextSuppslog[selectedDateStr] = updates.supplements;
    }
    
    let nextMetricslog = { ...metricslog };
    if (updates.metricslog !== undefined) {
      nextMetricslog = updates.metricslog;
    }
    if (updates.bodyComp !== undefined) {
      const currentMetric = nextMetricslog[selectedDateStr] || {};
      nextMetricslog[selectedDateStr] = {
        ...currentMetric,
        weight: updates.weight !== undefined ? updates.weight : (currentMetric.weight || (notes.find(n => n.type === "peso")?.weight) || 93.9),
        musculo: updates.bodyComp.musculo,
        grasaPct: updates.bodyComp.grasaPct,
        visceral: updates.bodyComp.visceral
      };
    }
    if (updates.weight !== undefined) {
      const currentMetric = nextMetricslog[selectedDateStr] || {};
      nextMetricslog[selectedDateStr] = {
        ...currentMetric,
        weight: updates.weight,
        musculo: currentMetric.musculo || bodyComp.musculo,
        grasaPct: currentMetric.grasaPct || bodyComp.grasaPct,
        visceral: currentMetric.visceral || bodyComp.visceral
      };
    }
    
    let nextSuppsInventory = { ...suppsInventory };
    if (updates.suppsInventory !== undefined) {
      nextSuppsInventory = updates.suppsInventory;
    }
    
    let nextWorkoutDurations = { ...workoutDurations };
    if (updates.workoutDurations !== undefined) {
      nextWorkoutDurations = updates.workoutDurations;
    }

    let nextCustomPresets = { ...customPresets };
    if (updates.customPresets !== undefined) {
      nextCustomPresets = updates.customPresets;
    }

    let nextExperiments = [...experiments];
    if (updates.experiments !== undefined) {
      nextExperiments = updates.experiments;
    }

    let nextSplits = [...splits];
    if (updates.splits !== undefined) {
      nextSplits = updates.splits;
    }

    let nextCustomSuggestions = [...customSuggestions];
    if (updates.customSuggestions !== undefined) {
      nextCustomSuggestions = updates.customSuggestions;
    }

    const current = {
      presetKey: updates.presetKey !== undefined ? updates.presetKey : presetKey,
      customPresets: nextCustomPresets,
      notes: updates.notes !== undefined ? updates.notes : notes,
      chat: updates.chat !== undefined ? updates.chat : chat,
      exlog: updates.exlog !== undefined ? updates.exlog : exlog,
      exercises: updates.exercises !== undefined ? updates.exercises : exercises,
      bodyComp: updates.bodyComp !== undefined ? updates.bodyComp : bodyComp,
      shoppingList: updates.shoppingList !== undefined ? updates.shoppingList : shoppingList,
      meals: updates.meals !== undefined ? updates.meals : meals,
      customSuggestions: nextCustomSuggestions,
      activeSplitKey: updates.activeSplitKey !== undefined ? updates.activeSplitKey : activeSplitKey,
      splits: nextSplits,
      foodlog: nextFoodlog,
      waterlog: nextWaterlog,
      suppslog: nextSuppslog,
      metricslog: nextMetricslog,
      suppsInventory: nextSuppsInventory,
      workoutDurations: nextWorkoutDurations,
      experiments: nextExperiments,
      updatedAt: updateTime
    };

    // Guardar local
    if (updates.presetKey !== undefined) await saveKey("profile", { presetKey: updates.presetKey });
    if (updates.customPresets !== undefined) await saveKey("custom_presets", updates.customPresets);
    if (updates.notes !== undefined) await saveKey("notes", updates.notes);
    if (updates.chat !== undefined) await saveKey("chat", updates.chat);
    if (updates.exlog !== undefined) await saveKey("exlog", updates.exlog);
    if (updates.exercises !== undefined) await saveKey("exercises", updates.exercises);
    if (updates.bodyComp !== undefined) await saveKey("body_comp", updates.bodyComp);
    if (updates.shoppingList !== undefined) await saveKey("shopping_list", updates.shoppingList);
    if (updates.meals !== undefined) await saveKey("meals", updates.meals);
    if (updates.customSuggestions !== undefined) await saveKey("custom_suggestions", updates.customSuggestions);
    if (updates.activeSplitKey !== undefined) await saveKey("active_split_key", updates.activeSplitKey);
    if (updates.experiments !== undefined) await saveKey("experiments", updates.experiments);
    if (updates.splits !== undefined) await saveKey("training_splits", updates.splits);
    
    await saveKey("foodlog", nextFoodlog);
    await saveKey("waterlog", nextWaterlog);
    await saveKey("suppslog", nextSuppslog);
    await saveKey("metricslog", nextMetricslog);
    await saveKey("supps_inventory", nextSuppsInventory);
    await saveKey("workout_durations", nextWorkoutDurations);
    await saveKey("last_local_update", updateTime);

    if (updates.log !== undefined) setFoodlog(nextFoodlog);
    if (updates.water !== undefined) setWaterlog(nextWaterlog);
    if (updates.supplements !== undefined) setSuppslog(nextSuppslog);
    if (updates.metricslog !== undefined || updates.weight !== undefined || updates.bodyComp !== undefined) setMetricslog(nextMetricslog);
    if (updates.suppsInventory !== undefined) setSuppsInventory(nextSuppsInventory);
    if (updates.workoutDurations !== undefined) setWorkoutDurations(nextWorkoutDurations);
    if (updates.customPresets !== undefined) setCustomPresets(nextCustomPresets);
    if (updates.presetKey !== undefined) setPresetKey(updates.presetKey);
    if (updates.customSuggestions !== undefined) setCustomSuggestions(nextCustomSuggestions);
    if (updates.experiments !== undefined) setExperiments(nextExperiments);
    if (updates.splits !== undefined) setSplits(nextSplits);

    // Guardar nube
    if (cloudSync && syncCode && !syncCode.startsWith("bf-")) {
      setSyncStatus("Guardando...");
      try {
        await pushStateToCloud(syncCode, current);
        setSyncStatus("Sincronizado");
        await saveKey("pending_sync", null);
      } catch (e) {
        setSyncStatus("Offline (Guardado local)");
        await saveKey("pending_sync", current);
      }
    }
    // Guardar en Supabase si está autenticado
    if (supabase && supabaseUser) {
      (async () => {
        try {
          const uId = supabaseUser.id;
          
          // 1. Perfil
          if (updates.presetKey !== undefined || updates.activeSplitKey !== undefined || updates.bodyComp !== undefined || updates.meals !== undefined || updates.shoppingList !== undefined || updates.splits !== undefined) {
            const dataToUpsert = {
              id: uId,
              email: supabaseUser.email,
              preset_key: updates.presetKey !== undefined ? updates.presetKey : presetKey,
              active_split_key: updates.activeSplitKey !== undefined ? updates.activeSplitKey : activeSplitKey,
              body_comp: updates.bodyComp !== undefined ? updates.bodyComp : bodyComp,
              meals: updates.meals !== undefined ? updates.meals : meals,
              shopping_list: updates.shoppingList !== undefined ? updates.shoppingList : shoppingList,
              splits: updates.splits !== undefined ? updates.splits : splits,
              updated_at: new Date().toISOString()
            };
            try {
              const { error } = await supabase.from('profiles').upsert(dataToUpsert);
              if (error) {
                delete dataToUpsert.splits;
                await supabase.from('profiles').upsert(dataToUpsert);
              }
            } catch (err) {
              delete dataToUpsert.splits;
              await supabase.from('profiles').upsert(dataToUpsert);
            }
          }

          // 2. Nutrición (Comidas, Agua, Suplementos)
          if (updates.log !== undefined || updates.water !== undefined || updates.supplements !== undefined) {
            const dateStr = selectedDateStr;
            const foodItems = updates.log !== undefined ? updates.log : (foodlog[dateStr] || []);
            let kcal = 0, p = 0, c = 0, f = 0;
            foodItems.forEach(item => {
              kcal += parseFloat(item.kcal) || 0;
              p += parseFloat(item.proteina) || 0;
              c += parseFloat(item.carbo) || 0;
              f += parseFloat(item.grasa) || 0;
            });
            const waterVal = updates.water !== undefined ? updates.water : (waterlog[dateStr] || 0);
            const suppsVal = updates.supplements !== undefined ? updates.supplements : (suppslog[dateStr] || { Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false });

            await supabase.from('nutrition_logs').upsert({
              user_id: uId,
              date: dateStr,
              kcal,
              proteina: p,
              carbo: c,
              grasa: f,
              water: waterVal,
              food_items: foodItems,
              supplements: suppsVal,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, date' });
          }

          // 3. Métricas
          if (updates.metricslog !== undefined || updates.weight !== undefined || updates.bodyComp !== undefined) {
            const dateStr = selectedDateStr;
            const currentMetric = nextMetricslog[dateStr] || {};
            if (currentMetric.weight !== undefined) {
              await supabase.from('metrics_logs').upsert({
                user_id: uId,
                date: dateStr,
                weight: parseFloat(currentMetric.weight) || 93.9,
                musculo: parseFloat(currentMetric.musculo) || 64.7,
                grasa_pct: parseFloat(currentMetric.grasaPct) || 26.2,
                visceral: parseInt(currentMetric.visceral) || 9,
                brazo_der: currentMetric.brazoDer !== undefined && currentMetric.brazoDer !== "" ? parseFloat(currentMetric.brazoDer) : null,
                brazo_izq: currentMetric.brazoIzq !== undefined && currentMetric.brazoIzq !== "" ? parseFloat(currentMetric.brazoIzq) : null,
                muslo_der: currentMetric.musloDer !== undefined && currentMetric.musloDer !== "" ? parseFloat(currentMetric.musloDer) : null,
                muslo_izq: currentMetric.musloIzq !== undefined && currentMetric.musloIzq !== "" ? parseFloat(currentMetric.musloIzq) : null,
                pantorrilla_der: currentMetric.pantorrillaDer !== undefined && currentMetric.pantorrillaDer !== "" ? parseFloat(currentMetric.pantorrillaDer) : null,
                pantorrilla_izq: currentMetric.pantorrillaIzq !== undefined && currentMetric.pantorrillaIzq !== "" ? parseFloat(currentMetric.pantorrillaIzq) : null,
                cintura: currentMetric.cintura !== undefined && currentMetric.cintura !== "" ? parseFloat(currentMetric.cintura) : null,
                pecho: currentMetric.pecho !== undefined && currentMetric.pecho !== "" ? parseFloat(currentMetric.pecho) : null,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id, date' });
            }
          }

          // 4. Entrenamientos
          if (updates.exlog !== undefined) {
            for (const [exName, sets] of Object.entries(updates.exlog)) {
              const dayGroups = {};
              (sets || []).forEach(s => {
                if (s && s.date) {
                  const dStr = s.date.slice(0, 10);
                  if (!dayGroups[dStr]) dayGroups[dStr] = [];
                  dayGroups[dStr].push(s);
                }
              });
              for (const [dStr, daySets] of Object.entries(dayGroups)) {
                const duration = nextWorkoutDurations[dStr] || 0;
                await supabase.from('workout_logs').upsert({
                  user_id: uId,
                  date: dStr,
                  exercise_name: exName,
                  sets: daySets,
                  duration: duration,
                  updated_at: new Date().toISOString()
                });
              }
            }
          }
        } catch(e) {
          console.error("Error al auto-guardar en Supabase:", e);
        }
      })();
    }
  };

  /* ===== HANDLERS DE SUPABASE ===== */
  const saveSbConfig = async (url, anonKey) => {
    setSupabaseUrl(url);
    setSupabaseAnonKey(anonKey);
    await saveKey("supabase_url", url);
    await saveKey("supabase_anon_key", anonKey);
    setSbError("");
    if (url && anonKey) {
      const client = initSupabase(url, anonKey);
      if (client) {
        setSbError("Supabase configurado e inicializado.");
      } else {
        setSbError("Error de inicialización del cliente.");
      }
    } else {
      setSupabaseUser(null);
      setSbError("Supabase desconectado.");
    }
  };

  const handleSbLogin = async (email, password) => {
    if (!supabase) {
      setSbError("Inicializa primero la URL y la Anon Key de Supabase.");
      return;
    }
    setSbSyncing(true);
    setSbError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      if (error) throw error;
      if (data?.user) {
        setSupabaseUser(data.user);
        // Sincronizar datos locales a la nube automáticamente
        setTimeout(() => {
          syncLocalToSupabase();
        }, 1000);
      }
    } catch(err) {
      console.error("Error al iniciar sesión en Supabase:", err);
      setSbError("Error de inicio de sesión: " + err.message);
    } finally {
      setSbSyncing(false);
    }
  };

  const handleSbRegister = async (email, password) => {
    if (!supabase) {
      setSbError("Inicializa primero la URL y la Anon Key de Supabase.");
      return;
    }
    setSbSyncing(true);
    setSbError("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim()
      });
      if (error) throw error;
      if (data?.user) {
        setSupabaseUser(data.user);
        // Registrar el perfil y sincronizar datos locales a la nube automáticamente
        setTimeout(() => {
          syncLocalToSupabase();
        }, 1000);
        setSbError("Cuenta creada e inicio de sesión exitoso.");
      }
    } catch(err) {
      console.error("Error al registrarse en Supabase:", err);
      setSbError("Error de registro: " + err.message);
    } finally {
      setSbSyncing(false);
    }
  };

  const handleSbLogout = async () => {
    if (!supabase) return;
    setSbSyncing(true);
    setSbError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSupabaseUser(null);
      setSbError("Sesión cerrada.");
    } catch(err) {
      console.error("Error al cerrar sesión:", err);
      setSbError("Error al cerrar sesión: " + err.message);
    } finally {
      setSbSyncing(false);
    }
  };

  const syncLocalToSupabase = async () => {
    if (!supabase || !supabaseUser) {
      setSbError("Supabase no está inicializado o no hay sesión activa.");
      return false;
    }
    setSbSyncing(true);
    setSbError("");
    try {
      const uId = supabaseUser.id;
      const uEmail = supabaseUser.email;

      // 1. Sincronizar Perfil
      const { error: profErr } = await supabase.from('profiles').upsert({
        id: uId,
        email: uEmail,
        preset_key: presetKey,
        active_split_key: activeSplitKey,
        body_comp: bodyComp,
        meals: meals,
        shopping_list: shoppingList,
        updated_at: new Date().toISOString()
      });
      if (profErr) throw profErr;

      // 2. Sincronizar Registro de Métricas y Peso
      const metricEntries = Object.entries(metricslog || {});
      for (const [dateStr, m] of metricEntries) {
        if (!m || m.weight === undefined) continue;
        const { error: metErr } = await supabase.from('metrics_logs').upsert({
          user_id: uId,
          date: dateStr,
          weight: parseFloat(m.weight) || 93.9,
          musculo: parseFloat(m.musculo) || 64.7,
          grasa_pct: parseFloat(m.grasaPct) || 26.2,
          visceral: parseInt(m.visceral) || 9,
          brazo_der: m.brazoDer !== undefined && m.brazoDer !== "" ? parseFloat(m.brazoDer) : null,
          brazo_izq: m.brazoIzq !== undefined && m.brazoIzq !== "" ? parseFloat(m.brazoIzq) : null,
          muslo_der: m.musloDer !== undefined && m.musloDer !== "" ? parseFloat(m.musloDer) : null,
          muslo_izq: m.musloIzq !== undefined && m.musloIzq !== "" ? parseFloat(m.musloIzq) : null,
          pantorrilla_der: m.pantorrillaDer !== undefined && m.pantorrillaDer !== "" ? parseFloat(m.pantorrillaDer) : null,
          pantorrilla_izq: m.pantorrillaIzq !== undefined && m.pantorrillaIzq !== "" ? parseFloat(m.pantorrillaIzq) : null,
          cintura: m.cintura !== undefined && m.cintura !== "" ? parseFloat(m.cintura) : null,
          pecho: m.pecho !== undefined && m.pecho !== "" ? parseFloat(m.pecho) : null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, date' });
        if (metErr) throw metErr;
      }

      // 3. Sincronizar Comidas, Agua y Suplementos
      const allDates = new Set([
        ...Object.keys(foodlog || {}),
        ...Object.keys(waterlog || {}),
        ...Object.keys(suppslog || {})
      ]);
      for (const dateStr of allDates) {
        const foodItems = foodlog[dateStr] || [];
        let kcal = 0, p = 0, c = 0, f = 0;
        foodItems.forEach(item => {
          kcal += parseFloat(item.kcal) || 0;
          p += parseFloat(item.proteina) || 0;
          c += parseFloat(item.carbo) || 0;
          f += parseFloat(item.grasa) || 0;
        });
        const waterVal = waterlog[dateStr] || 0;
        const suppsVal = suppslog[dateStr] || { Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false };

        const { error: nutErr } = await supabase.from('nutrition_logs').upsert({
          user_id: uId,
          date: dateStr,
          kcal,
          proteina: p,
          carbo: c,
          grasa: f,
          water: waterVal,
          food_items: foodItems,
          supplements: suppsVal,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, date' });
        if (nutErr) throw nutErr;
      }

      // 4. Sincronizar Historial de Entrenamientos
      const workoutGroups = {};
      Object.entries(exlog || {}).forEach(([exName, sets]) => {
        (sets || []).forEach(s => {
          if (!s || !s.date) return;
          const dStr = s.date.slice(0, 10);
          const key = `${dStr}|${exName}`;
          if (!workoutGroups[key]) workoutGroups[key] = [];
          workoutGroups[key].push(s);
        });
      });
      for (const [key, sets] of Object.entries(workoutGroups)) {
        const [dateStr, exerciseName] = key.split('|');
        const duration = workoutDurations[dateStr] || 0;
        const { error: wkErr } = await supabase.from('workout_logs').upsert({
          user_id: uId,
          date: dateStr,
          exercise_name: exerciseName,
          sets: sets,
          duration: duration,
          updated_at: new Date().toISOString()
        });
        if (wkErr) throw wkErr;
      }

      setSbError("Sincronización completada con éxito.");
      setSbSyncing(false);
      return true;
    } catch(err) {
      console.error("Error al sincronizar datos a Supabase:", err);
      setSbError("Error de sincronización: " + err.message);
      setSbSyncing(false);
      return false;
    }
  };

  const changePreset = (k) => { 
    setPresetKey(k);
    saveState({ presetKey: k });
  };
  
  const setWaterP = (n) => { 
    const v = Math.max(0, n); 
    setWater(v); 
    saveState({ water: v });
  };

  const saveGeminiKey = (k) => {
    setGeminiKey(k);
    saveKey("gemini_api_key", k);
  };

  const saveAiModel = (m) => {
    setAiModel(m);
    saveKey("gemini_model", m);
  };

  // Activa o desactiva la sincronización en la nube
  const handleToggleCloudSync = async (enabled) => {
    setCloudSync(enabled);
    await saveKey("cloud_sync_enabled", enabled);

    if (enabled && syncCode && !syncCode.startsWith("bf-")) {
      setSyncStatus("Sincronizando...");
      const today = new Date().toISOString().slice(0,10);
      const updateTime = Date.now();
      const current = { presetKey, log, notes, chat, exlog, exercises, water, supplements, bodyComp, shoppingList, meals, activeSplitKey, dailyDate: today, foodlog, waterlog, suppslog, metricslog, suppsInventory, workoutDurations, updatedAt: updateTime };
      try {
        await pushStateToCloud(syncCode, current);
        setSyncStatus("Sincronizado");
        await saveKey("pending_sync", null);
        await saveKey("last_local_update", updateTime);
      } catch (e) {
        setSyncStatus("Offline (Guardado local)");
        await saveKey("pending_sync", current);
      }
    } else if (!enabled) {
      setSyncStatus("Desconectado");
    }
  };

  // Crea un código de sincronización real registrando un bucket en kvdb.io con el email
  const handleCreateSyncCode = async (email) => {
    if (!email || !email.trim()) return false;
    setSyncStatus("Creando código...");
    try {
      const res = await fetch("https://kvdb.io/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email.trim())}`
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const code = (await res.text()).trim();
      if (code) {
        setSyncCode(code);
        await saveKey("sync_code", code);
        
        // Activar la sincronización automáticamente
        setCloudSync(true);
        await saveKey("cloud_sync_enabled", true);
        
        setSyncStatus("Esperando verificación...");
        
        const today = new Date().toISOString().slice(0,10);
        const updateTime = Date.now();
        const current = { presetKey, log, notes, chat, exlog, exercises, water, supplements, bodyComp, shoppingList, meals, activeSplitKey, dailyDate: today, foodlog, waterlog, suppslog, metricslog, suppsInventory, workoutDurations, updatedAt: updateTime };
        try {
          await pushStateToCloud(code, current);
          setSyncStatus("Sincronizado");
          await saveKey("last_local_update", updateTime);
        } catch (e) {
          // Si el correo no está verificado, el POST fallará. Se queda en cola para reintento.
          setSyncStatus("Esperando verificación");
          await saveKey("pending_sync", current);
        }
        return true;
      }
    } catch (e) {
      console.error("Error al crear bucket de sync:", e);
      setSyncStatus("Error al crear código");
    }
    return false;
  };

  // Vincular un dispositivo usando un código existente
  const handleLinkDevice = async (code) => {
    if (!code || code.trim() === "") return false;
    setSyncStatus("Vinculando...");
    const cloudData = await fetchStateFromCloud(code.trim());
    if (cloudData) {
      const today = new Date().toISOString().slice(0,10);
      const updateTime = cloudData.updatedAt || Date.now();

      // Guardar local
      setSyncCode(code.trim());
      setCloudSync(true);
      await saveKey("sync_code", code.trim());
      await saveKey("cloud_sync_enabled", true);

      // Decidir datos diarios
      const { finalLog, finalWater, finalSupplements } = await parseDailyCloudData(cloudData, today);

      // Reemplazar estado React
      setPresetKey(cloudData.presetKey || "definicion");
      setLog(finalLog);
      setNotes(cloudData.notes || []);
      setChat(cloudData.chat || []);
      setExlog(cloudData.exlog || {});
      setExercises(cloudData.exercises || seedExercises());
      setWater(finalWater);
      setSupplements(finalSupplements);
      setBodyComp(cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      setShoppingList(cloudData.shoppingList || { categorias: [] });
      if (cloudData.meals && Array.isArray(cloudData.meals) && cloudData.meals.length > 0) setMeals(cloudData.meals);
      setCustomSuggestions(cloudData.customSuggestions || []);
      setActiveSplitKey(cloudData.activeSplitKey || "A");
      if (Array.isArray(cloudData.splits)) {
        setSplits(cloudData.splits);
      }

      if (cloudData.foodlog && Object.keys(cloudData.foodlog).length > 0) setFoodlog(cloudData.foodlog);
      if (cloudData.waterlog && Object.keys(cloudData.waterlog).length > 0) setWaterlog(cloudData.waterlog);
      if (cloudData.suppslog && Object.keys(cloudData.suppslog).length > 0) setSuppslog(cloudData.suppslog);
      if (cloudData.metricslog && Object.keys(cloudData.metricslog).length > 0) setMetricslog(cloudData.metricslog);
      setSuppsInventory(cloudData.suppsInventory || {
        "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
        "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
      });
      setWorkoutDurations(cloudData.workoutDurations || {});

      // Guardar todos localmente
      await saveKey("profile", { presetKey: cloudData.presetKey || "definicion" });
      await saveKey(todayKey(), finalLog);
      await saveKey("notes", cloudData.notes || []);
      await saveKey("chat", cloudData.chat || []);
      await saveKey("exlog", cloudData.exlog || {});
      await saveKey("exercises", cloudData.exercises || seedExercises());
      await saveKey(waterKey(), finalWater);
      await saveKey(suppsKey(), finalSupplements);
      await saveKey("body_comp", cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      await saveKey("shopping_list", cloudData.shoppingList || { categorias: [] });
      if (cloudData.meals && Array.isArray(cloudData.meals) && cloudData.meals.length > 0) await saveKey("meals", cloudData.meals);
      await saveKey("custom_suggestions", cloudData.customSuggestions || []);
      await saveKey("active_split_key", cloudData.activeSplitKey || "A");
      if (Array.isArray(cloudData.splits)) {
        await saveKey("training_splits", cloudData.splits);
      }

      if (cloudData.foodlog && Object.keys(cloudData.foodlog).length > 0) await saveKey("foodlog", cloudData.foodlog);
      if (cloudData.waterlog && Object.keys(cloudData.waterlog).length > 0) await saveKey("waterlog", cloudData.waterlog);
      if (cloudData.suppslog && Object.keys(cloudData.suppslog).length > 0) await saveKey("suppslog", cloudData.suppslog);
      if (cloudData.metricslog && Object.keys(cloudData.metricslog).length > 0) await saveKey("metricslog", cloudData.metricslog);
      await saveKey("supps_inventory", cloudData.suppsInventory || {
        "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
        "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
      });
      await saveKey("workout_durations", cloudData.workoutDurations || {});
      await saveKey("last_local_update", updateTime);

      setSyncStatus("Sincronizado");
      return true;
    } else {
      setSyncStatus("Código inválido");
      return false;
    }
  };

  const handleForcePull = async () => {
    if (!syncCode) return;
    setSyncStatus("Actualizando...");
    const cloudData = await fetchStateFromCloud(syncCode);
    if (cloudData) {
      const today = new Date().toISOString().slice(0,10);
      const updateTime = cloudData.updatedAt || Date.now();

      // Decidir datos diarios
      const { finalLog, finalWater, finalSupplements } = await parseDailyCloudData(cloudData, today);

      setPresetKey(cloudData.presetKey || "definicion");
      setLog(finalLog);
      setNotes(cloudData.notes || []);
      setChat(cloudData.chat || []);
      setExlog(cloudData.exlog || {});
      setExercises(cloudData.exercises || seedExercises());
      setWater(finalWater);
      setSupplements(finalSupplements);
      setBodyComp(cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      setShoppingList(cloudData.shoppingList || { categorias: [] });
      if (cloudData.meals && Array.isArray(cloudData.meals) && cloudData.meals.length > 0) setMeals(cloudData.meals);
      setCustomSuggestions(cloudData.customSuggestions || []);
      setActiveSplitKey(cloudData.activeSplitKey || "A");
      if (Array.isArray(cloudData.splits)) {
        setSplits(cloudData.splits);
      }

      if (cloudData.foodlog && Object.keys(cloudData.foodlog).length > 0) setFoodlog(cloudData.foodlog);
      if (cloudData.waterlog && Object.keys(cloudData.waterlog).length > 0) setWaterlog(cloudData.waterlog);
      if (cloudData.suppslog && Object.keys(cloudData.suppslog).length > 0) setSuppslog(cloudData.suppslog);
      if (cloudData.metricslog && Object.keys(cloudData.metricslog).length > 0) setMetricslog(cloudData.metricslog);
      setSuppsInventory(cloudData.suppsInventory || {
        "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
        "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
      });
      setWorkoutDurations(cloudData.workoutDurations || {});

      // Guardar todos localmente
      await saveKey("profile", { presetKey: cloudData.presetKey || "definicion" });
      await saveKey(todayKey(), finalLog);
      await saveKey("notes", cloudData.notes || []);
      await saveKey("chat", cloudData.chat || []);
      await saveKey("exlog", cloudData.exlog || {});
      await saveKey("exercises", cloudData.exercises || seedExercises());
      await saveKey(waterKey(), finalWater);
      await saveKey(suppsKey(), finalSupplements);
      await saveKey("body_comp", cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      await saveKey("shopping_list", cloudData.shoppingList || { categorias: [] });
      if (cloudData.meals && Array.isArray(cloudData.meals) && cloudData.meals.length > 0) await saveKey("meals", cloudData.meals);
      await saveKey("custom_suggestions", cloudData.customSuggestions || []);
      await saveKey("active_split_key", cloudData.activeSplitKey || "A");
      if (Array.isArray(cloudData.splits)) {
        await saveKey("training_splits", cloudData.splits);
      }

      if (cloudData.foodlog && Object.keys(cloudData.foodlog).length > 0) await saveKey("foodlog", cloudData.foodlog);
      if (cloudData.waterlog && Object.keys(cloudData.waterlog).length > 0) await saveKey("waterlog", cloudData.waterlog);
      if (cloudData.suppslog && Object.keys(cloudData.suppslog).length > 0) await saveKey("suppslog", cloudData.suppslog);
      if (cloudData.metricslog && Object.keys(cloudData.metricslog).length > 0) await saveKey("metricslog", cloudData.metricslog);
      await saveKey("supps_inventory", cloudData.suppsInventory || {
        "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
        "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
      });
      await saveKey("workout_durations", cloudData.workoutDurations || {});
      await saveKey("last_local_update", updateTime);

      setSyncStatus("Sincronizado");
    } else {
      setSyncStatus("Error de descarga");
    }
  };

  // ════════════════════════════════════════════════════════
  // ██ AI INTELLIGENCE ENGINE — 20 FEATURES ██
  // ════════════════════════════════════════════════════════

  // #8 + #6 + #9 + #1 + #7 + #14 — Pure JS (instant, no AI quota)
  const runLocalAnalysis = (eLog, fLog, mLog, nts, tgt) => {
    setOverloadSuggestions(calcProgressiveOverload(eLog));
    setPlateauAlerts(detectPlateaus(eLog));
    setMuscleImbalances(detectMuscleImbalances(eLog));
    const trend = calcWeightTrend(mLog);
    setWeightTrend(trend);
    const tdee = calcTDEE(fLog, mLog);
    setTdeeEstimate(tdee);
    if (tdee && tgt) {
      const latestM = Object.entries(mLog||{}).filter(([_,v])=>v?.weight)/* ⚡ Bolt: Lexicographical string comparison is up to 7x faster than new Date() or localeCompare */ .sort((a,b)=>b[0] < a[0] ? -1 : (b[0] > a[0] ? 1 : 0))[0]?.[1];
      if (latestM) setProjections(calcBodyProjection(parseFloat(latestM.weight), parseFloat(latestM.grasaPct)||25, tdee, tgt.kcal, 12));
    }
    if (trend && Math.abs(trend.kgPerWeek) < 0.1 && trend.dataPoints >= 7) {
      setMacroAdjustSuggestion({ type:"stalled", message:`Tu peso lleva ${trend.dataPoints} registros sin moverse (${trend.kgPerWeek>=0?"+":""}${trend.kgPerWeek} kg/sem). Considera bajar -150 kcal.`, adjustment:-150 });
    } else if (trend && Math.abs(trend.kgPerWeek) > 0.8 && trend.trend === "bajando") {
      setMacroAdjustSuggestion({ type:"too_fast", message:`Perdiendo ${Math.abs(trend.kgPerWeek)} kg/sem — muy rápido. Sube +200 kcal para proteger el músculo.`, adjustment:200 });
    } else { setMacroAdjustSuggestion(null); }
    const fatigueCount = detectFatigueFromNotes(nts);
    if (fatigueCount >= 2) {
      setAiNotifications(prev => [{ id:"fatigue", type:"warning", icon:"⚡", title:fatigueCount>=3?"Posible Sobreentrenamiento":"Fatiga detectada", message:fatigueCount>=3?"3+ notas de fatiga. Reduce volumen 40% por 3-5 días y sube kcal a mantenimiento.":"2 notas de fatiga esta semana. Descansa bien esta noche.", urgency:fatigueCount>=3?"high":"medium" },...prev.filter(n=>n.id!=="fatigue")].slice(0,8));
    }
  };

  // #16 Proactive Coach — time-aware messages
  const runProactiveCoach = (fLog, eLog, tgt) => {
    const now = new Date(), hour = now.getHours(), todayStr = now.toISOString().slice(0,10);
    const todayLog = fLog[todayStr] || [];
    const todayKcal = todayLog.reduce((s,e)=>s+(+e.kcal||0),0);
    const todayProtein = todayLog.reduce((s,e)=>s+(+e.proteina||0),0);
    const todayHasWorkout = Object.values(eLog||{}).some(sets=>(sets||[]).some(s=>s?.date?.slice(0,10)===todayStr));
    let msg = null;
    if (hour>=7&&hour<=9&&todayKcal<100) msg={icon:"🌅",text:`Buenos días! Objetivo: ${tgt?.kcal||2200} kcal · ${tgt?.p||180}g proteína. Registra tu desayuno.`};
    else if (hour>=12&&hour<=13&&todayKcal<400) msg={icon:"🍽️",text:`Son las ${hour}:00h y llevas solo ${todayKcal} kcal. Come bien antes del entreno.`};
    else if (hour>=17&&hour<=19&&!todayHasWorkout&&todayKcal>200) msg={icon:"💪",text:`¿Ya entrenaste? Llevas ${todayProtein}g de ${tgt?.p||180}g proteína objetivo.`};
    else if (hour>=21&&todayProtein<(tgt?.p||180)*0.7) msg={icon:"🥛",text:`Cierre del día: ${todayProtein}g de ${tgt?.p||180}g proteína. Un batido antes de dormir te ayuda.`};
    setProactiveMsg(msg);
  };

  // #19 Weekly Insight — AI correlation analysis (runs once per day)
  const runWeeklyInsight = async (fLog, eLog, mLog, nts, tgt) => {
    const lastRun = await loadKey("weekly_insight_date","");
    const today = new Date().toISOString().slice(0,10);
    if (lastRun===today) { const saved=await loadKey("weekly_insight",null); if(saved) setWeeklyInsight(saved); return; }
    const stats = getWeeklyStats(fLog, eLog, mLog, nts);
    if (stats.avgKcal===0&&stats.trainDays===0) return;
    try {
      const out = await callGemini([{role:"user",content:`Semana de Bruno: ${stats.trainDays} días entreno, ${stats.avgProtein}g proteína promedio (objetivo ${tgt?.p||180}g), ${stats.avgKcal} kcal (objetivo ${tgt?.kcal||2200}), cambio de peso: ${stats.weightChange!==null?stats.weightChange.toFixed(2)+"kg":"sin datos"}, notas fatiga: ${stats.fatigueCount}. Genera UN insight específico y accionable (máx 2 oraciones con datos reales).`}],"Coach fitness. Responde en español, máx 2 oraciones, datos específicos.",null);
      const insight={text:out.trim(),date:today,stats};
      setWeeklyInsight(insight);
      await saveKey("weekly_insight",insight);
      await saveKey("weekly_insight_date",today);
    } catch(e){console.warn("Weekly insight:",e);}
  };

  // #20 Weekly Challenges
  const generateWeeklyChallenges = async (fLog, tgt, eLog) => {
    const thisMonday=(()=>{const d=new Date();d.setDate(d.getDate()-d.getDay()+1);return d.toISOString().slice(0,10);})();
    const lastRun=await loadKey("challenges_date","");
    if (lastRun===thisMonday){const saved=await loadKey("challenges",[]);if(saved.length>0){setChallenges(saved);return;}}
    const pattern=analyzeMacroPattern(fLog);
    const pt=tgt?.p||180;
    const chlngs=[
      {id:uid(),icon:"🥩",title:"Proteína diaria",desc:`Supera ${pt}g de proteína ${pattern&&pattern.avgP<pt*0.8?"cada":"al menos 5"} días esta semana`,metric:"protein_days",target:pattern&&pattern.avgP<pt*0.8?7:5,progress:0,completed:false},
      {id:uid(),icon:"💧",title:"Hidratación perfecta",desc:"Registra 3L de agua al menos 5 días esta semana",metric:"water_5days",target:5,progress:0,completed:false},
      {id:uid(),icon:"💪",title:"4 entrenos",desc:"Completa al menos 4 sesiones de entrenamiento esta semana",metric:"workout_sessions",target:4,progress:0,completed:false}
    ];
    setChallenges(chlngs);
    await saveKey("challenges",chlngs);
    await saveKey("challenges_date",thisMonday);
  };

  // #10 Smart Goal from PR
  const addSmartGoalFromPR = (exName, prWeight) => {
    const isCompound=["Sentadilla","Peso muerto","Press banca","Remo","Prensa"].some(c=>exName.includes(c));
    const nextTarget=prWeight+(isCompound?5:2.5);
    const newGoal={id:uid(),icon:"🏆",exercise:exName,title:`${exName}: ${nextTarget}kg`,desc:`Levanta ${nextTarget}kg en ${exName}`,currentPR:prWeight,targetPR:nextTarget,deadline:new Date(Date.now()+28*86400000).toISOString().slice(0,10),created:new Date().toISOString()};
    setSmartGoals(prev=>{const updated=[newGoal,...prev.filter(g=>g.exercise!==exName)].slice(0,5);saveKey("smart_goals",updated);return updated;});
    setAiNotifications(prev=>[{id:"goal_"+uid(),type:"success",icon:"🏆",title:"Nuevo Smart Goal",message:`PR de ${prWeight}kg en ${exName}. Próximo: ${nextTarget}kg en 4 semanas.`,urgency:"low"},...prev].slice(0,8));
  };

  // ── Central Analysis Dispatcher ──
  const analyzeAndReconfigure = async (trigger, ctx={}) => {
    if (analyzeBusy) return;
    const eLog=ctx.currentExlog||exlog, fLog=ctx.currentFoodlog||foodlog, mLog=ctx.currentMetricslog||metricslog, nts=ctx.currentNotes||notes, tgt=ctx.currentTarget||target;
    runLocalAnalysis(eLog,fLog,mLog,nts,tgt);
    runProactiveCoach(fLog,eLog,tgt);
    const aiTriggers=["weight_saved","weekly_check","app_load_weekly"];
    if (!aiTriggers.includes(trigger)) return;
    setAnalyzeBusy(true);
    try {
      if (["weekly_check","app_load_weekly"].includes(trigger)){
        await runWeeklyInsight(fLog,eLog,mLog,nts,tgt);
        await generateWeeklyChallenges(fLog,tgt,eLog);
      }
      if (trigger==="weight_saved"){
        const trend=calcWeightTrend(mLog), tdee=calcTDEE(fLog,mLog);
        if (trend&&trend.dataPoints>=5){
          const tdeeMsg=tdee?` TDEE real: ~${tdee} kcal/día.`:"";
          setAiNotifications(prev=>[{id:"weight_analysis",type:"info",icon:"⚖️",title:"Análisis de tendencia",message:`${trend.trend==="bajando"?"📉":trend.trend==="subiendo"?"📈":"➡️"} ${trend.trend} ${trend.kgPerWeek>=0?"+":""}${trend.kgPerWeek} kg/sem (${trend.dataPoints} registros).${tdeeMsg}`,urgency:"medium"},...prev.filter(n=>n.id!=="weight_analysis")].slice(0,8));
        }
      }
    } catch(e){console.warn("analyzeAndReconfigure:",e);}
    finally{setAnalyzeBusy(false);}
  };

  const updateChallengeProgress = (challengeId, newProgress, completed=false) => {
    setChallenges(prev=>{const updated=prev.map(c=>c.id===challengeId?{...c,progress:newProgress,completed}:c);saveKey("challenges",updated);return updated;});
  };

  const runTrainerAgentAnalysis = async () => {
    if (trainerAgentBusy) return;
    setTrainerAgentBusy(true);
    const weeklyLoad = calcWeeklyTrainingLoad(exlog);
    const deloadCheck = detectDeloadNeed(exlog, notes, metricslog);
    const muscleVol = calcMuscleVolumeBalance(exlog, exercises);
    const localData = { weeklyLoad, deloadCheck, muscleVol };
    const loadSummary = weeklyLoad.map(w=>`${w.weekLabel}: ${w.totalSets} ser, ${w.totalVol}kg vol`).join(' | ');
    const plateauList = (plateauAlerts||[]).map(p=>`${p.exercise} (${p.weight}kg, ${p.weeks} sem)`).join(', ') || 'ninguno';
    const muscleList = Object.entries(muscleVol).map(([m,d])=>`${m}: ${d.setsPerWeek} ser/sem [${d.status}]`).join(', ');
    const overloadList = Object.entries(overloadSuggestions||{}).slice(0,5).map(([ex,s])=>`${ex}: ${s.currentMax}kg→${s.suggested}kg`).join(', ') || 'sin sugerencias';
    const imbalanceList = (muscleImbalances||[]).join(' | ') || 'ninguno';
    const sys = `Eres el Agente Entrenador de BrunoFit — especialista en periodización de fuerza e hipertrofia. ${getProfileStr(activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Analiza los datos objetivos y genera recomendaciones precisas y accionables. Usa terminología técnica en español. Basa TODOS los números en los datos provistos. Responde SOLO en JSON que cumpla el esquema.`;
    const userMsg = `ANÁLISIS DE ENTRENAMIENTO — ÚLTIMAS 8 SEMANAS:\nCarga semanal: ${loadSummary}\nEstancamientos: ${plateauList}\nBalance muscular: ${muscleList}\nSobrecarga sugerida: ${overloadList}\nDesequilibrios push/pull: ${imbalanceList}\nDeload: ${deloadCheck.recommended?`RECOMENDADO — ${deloadCheck.reason} (urgencia: ${deloadCheck.urgency})`:'no necesario aún'}\nSemanas sin deload: ${deloadCheck.weeksSinceDeload}\nSplits: ${(splits||[]).map(s=>`${s.key}: ${s.name}`).join(' | ')}`;
    try {
      const raw = await callGemini([{role:"user",content:userMsg}], sys, TRAINER_AGENT_SCHEMA);
      const parsed = cleanAndParseJSON(raw);
      setTrainerAgentData({...(parsed||{}), _local: localData});
    } catch(e) {
      setTrainerAgentData({ _error: aiErr(e), _local: localData });
    } finally {
      setTrainerAgentBusy(false);
    }
  };

  const handleForcePush = async () => {
    if (!syncCode) return;
    setSyncStatus("Sincronizando...");
    const today = new Date().toISOString().slice(0,10);
    const updateTime = Date.now();
    const current = { 
      presetKey, customPresets, log, notes, chat, exlog, exercises, water, supplements, bodyComp, shoppingList, meals, activeSplitKey, dailyDate: today, 
      foodlog, waterlog, suppslog, metricslog, suppsInventory, workoutDurations,
      updatedAt: updateTime 
    };
    try {
      await pushStateToCloud(syncCode, current);
      setSyncStatus("Sincronizado");
      await saveKey("pending_sync", null);
      await saveKey("last_local_update", updateTime);
    } catch (e) {
      setSyncStatus("Error al subir");
    }
  };

  const handleCoachActions = (actions) => {
    if (!actions || !actions.length) return;
    
    let updatedLog = [...log];
    let updatedNotes = [...notes];
    let updatedExlog = { ...exlog };
    let nextPresets = { ...customPresets };
    let nextMeals = [...meals];
    let nextMetricslog = { ...metricslog };
    let presetKeyToSet = presetKey;
    let eventToSet = upcomingEvent;
    let nextSplits = [...splits];
    
    let hasLog = false;
    let hasNotes = false;
    let hasExlog = false;
    let hasPresets = false;
    let hasMeals = false;
    let hasMetricslog = false;
    let hasEvent = false;
    let hasSplits = false;

    actions.forEach(act => {
      if (act.type === "ADD_FOOD" && act.data) {
        const e = {
          id: uid(),
          resumen: act.data.resumen || "Comida registrada por Coach",
          kcal: parseFloat(act.data.kcal) || 0,
          proteina: parseFloat(act.data.proteina) || 0,
          carbo: parseFloat(act.data.carbo) || 0,
          grasa: parseFloat(act.data.grasa) || 0,
          t: Date.now()
        };
        updatedLog = [e, ...updatedLog];
        hasLog = true;
      } else if (act.type === "ADD_WEIGHT" && act.data) {
        const wVal = parseFloat(act.data.weight);
        if (wVal > 0) {
          const e = {
            id: uid(),
            type: "peso",
            date: new Date().toISOString(),
            text: `${wVal} kg`,
            weight: wVal
          };
          updatedNotes = [e, ...updatedNotes];
          hasNotes = true;
          
          const dStr = new Date().toISOString().slice(0, 10);
          nextMetricslog[dStr] = {
            ...(nextMetricslog[dStr] || {}),
            weight: wVal,
            musculo: (nextMetricslog[dStr] || {}).musculo || bodyComp.musculo,
            grasaPct: (nextMetricslog[dStr] || {}).grasaPct || bodyComp.grasaPct,
            visceral: (nextMetricslog[dStr] || {}).visceral || bodyComp.visceral
          };
          hasMetricslog = true;
        }
      } else if (act.type === "ADD_SET" && act.data) {
        const exName = act.data.exercise;
        const wVal = parseFloat(act.data.w);
        const repsVal = String(act.data.reps || "-");
        if (exName && wVal > 0) {
          // Usar la fecha seleccionada en el calendario, no la fecha de hoy
          const parts = selectedDateStr.split("-");
          const now = new Date();
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), now.getHours(), now.getMinutes(), now.getSeconds());
          const e = {
            date: d.toISOString(),
            w: wVal,
            reps: repsVal,
            type: "work"
          };
          updatedExlog[exName] = [e, ...(updatedExlog[exName] || [])].slice(0, 60);
          hasExlog = true;
        }
      } else if (act.type === "UPDATE_TARGET" && act.data) {
        const newKcal = parseFloat(act.data.kcal);
        const newP = parseFloat(act.data.proteina);
        const newC = parseFloat(act.data.carbo);
        const newF = parseFloat(act.data.grasa);
        if (!isNaN(newKcal) && newKcal > 0) {
          const targetKey = presetKeyToSet || "personalizado";
          const existingPreset = nextPresets[targetKey] || { label: "Personalizado", kcal: 2000, p: 150, c: 200, f: 60 };
          nextPresets = {
            ...nextPresets,
            [targetKey]: {
              ...existingPreset,
              kcal: newKcal,
              p: !isNaN(newP) ? newP : Math.round(newKcal * 0.35 / 4),
              c: !isNaN(newC) ? newC : Math.round(newKcal * 0.40 / 4),
              f: !isNaN(newF) ? newF : Math.round(newKcal * 0.25 / 9)
            }
          };
          hasPresets = true;
        }
        if (act.data.meals && Array.isArray(act.data.meals) && act.data.meals.length > 0) {
          nextMeals = act.data.meals;
          hasMeals = true;
        }
      } else if (act.type === "UPDATE_SPLITS" && act.data) {
        if (act.data.splits && Array.isArray(act.data.splits) && act.data.splits.length > 0) {
          nextSplits = act.data.splits;
          hasSplits = true;
        }
      } else if (act.type === "CHANGE_PHASE" && act.data) {
        const phase = act.data.phase;
        const newKcal = parseFloat(act.data.kcal);
        const newP = parseFloat(act.data.proteina);
        const newC = parseFloat(act.data.carbo);
        const newF = parseFloat(act.data.grasa);
        if (phase && nextPresets[phase]) {
          nextPresets = {
            ...nextPresets,
            [phase]: {
              ...nextPresets[phase],
              kcal: !isNaN(newKcal) ? newKcal : nextPresets[phase].kcal,
              p: !isNaN(newP) ? newP : nextPresets[phase].p,
              c: !isNaN(newC) ? newC : nextPresets[phase].c,
              f: !isNaN(newF) ? newF : nextPresets[phase].f,
            }
          };
          hasPresets = true;
          presetKeyToSet = phase;
        }
      } else if (act.type === "SET_EVENT" && act.data) {
        const name = act.data.eventName || "Evento";
        const date = act.data.eventDate;
        if (date) {
          eventToSet = { name, date };
          hasEvent = true;
        }
      }
    });

    const updates = {};
    if (hasLog) {
      setLog(updatedLog);
      updates.log = updatedLog;
    }
    if (hasNotes) {
      setNotes(updatedNotes);
      updates.notes = updatedNotes;
    }
    if (hasExlog) {
      setExlog(updatedExlog);
      updates.exlog = updatedExlog;
    }
    if (hasPresets) {
      setCustomPresets(nextPresets);
      setPresetKey(presetKeyToSet);
      updates.customPresets = nextPresets;
      updates.presetKey = presetKeyToSet;
    }
    if (hasMeals) {
      setMeals(nextMeals);
      updates.meals = nextMeals;
    }
    if (hasMetricslog) {
      setMetricslog(nextMetricslog);
      updates.metricslog = nextMetricslog;
    }
    if (hasEvent) {
      setUpcomingEvent(eventToSet);
      saveKey("upcoming_event", eventToSet);
    }
    if (hasSplits) {
      setSplits(nextSplits);
      updates.splits = nextSplits;
    }
    
    if (hasLog || hasNotes || hasExlog || hasPresets || hasMeals || hasMetricslog || hasEvent || hasSplits) {
      saveState(updates);
    }

    if (hasMetricslog) {
      setTimeout(() => {
        analyzeAndReconfigure("weight_saved", { currentMetricslog: nextMetricslog });
      }, 300);
    }
  };

  const activeMetrics = getMetricsForDate(selectedDateStr) || {
    weight: START_W, musculo: 64.7, grasaPct: 26.2, visceral: 9,
    brazoDer: "", brazoIzq: "", musloDer: "", musloIzq: "", pantorrillaDer: "", pantorrillaIzq: "", cintura: "", pecho: ""
  };

  // ⚡ Bolt: Memoize totals calculation to prevent unnecessary reduce operations on every render
  const totals = useMemo(() => {
    return (log || []).reduce((a,e) => ({
      kcal: a.kcal + (+e.kcal || 0),
      p: a.p + (+e.proteina || 0),
      c: a.c + (+e.carbo || 0),
      f: a.f + (+e.grasa || 0)
    }), { kcal:0, p:0, c:0, f:0 });
  }, [log]);

  // Resumen del entrenamiento realizado hoy
  const getTodayWorkoutSummary = () => {
    let summary = [];
    Object.entries(exlog || {}).forEach(([name, sets]) => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todaySets = (sets || []).filter(s => s && s.date && s.date.slice(0, 10) === todayStr);
      if (todaySets.length > 0) {
        const sorted = [...todaySets].reverse();
        const setsText = sorted.map((s, idx) => s ? `Serie ${idx + 1}: ${s.w} kg x ${s.reps}` : "").filter(Boolean).join(", ");
        summary.push(`- ${name}: ${setsText}`);
      }
    });
    if (summary.length === 0) return "Ninguno registrado hoy.";
    return summary.join("\n");
  };

  // Resumen histórico completo para dar memoria real al Coach
  const buildWorkoutHistorySummary = () => {
    const now = new Date();
    const weeksBack = 8; // últimas 8 semanas
    const weeklyVolume = {}; // { 'Semana N': { sets: 0, tons: 0, days: Set } }
    const prs = {}; // { ejercicio: maxKg }
    const recentByEx = {}; // { ejercicio: [sets últimas 4 semanas] }

    Object.entries(exlog || {}).forEach(([exName, sets]) => {
      (sets || []).forEach(s => {
        if (!s || !s.date || !s.w) return;
        const d = new Date(s.date);
        const weeksAgo = Math.floor((now - d) / (7 * 24 * 3600 * 1000));
        if (weeksAgo > weeksBack) return;

        // PRs
        if (!prs[exName] || s.w > prs[exName]) prs[exName] = s.w;

        // Volumen semanal
        const weekLabel = weeksAgo === 0 ? 'Esta semana' : `Hace ${weeksAgo} sem`;
        if (!weeklyVolume[weekLabel]) weeklyVolume[weekLabel] = { sets: 0, tons: 0, days: new Set() };
        weeklyVolume[weekLabel].sets++;
        weeklyVolume[weekLabel].tons += (s.w * (parseFloat(s.reps) || 1)) / 1000;
        weeklyVolume[weekLabel].days.add(d.toISOString().slice(0, 10));

        // Series recientes (4 semanas) por ejercicio
        if (weeksAgo <= 4) {
          if (!recentByEx[exName]) recentByEx[exName] = [];
          recentByEx[exName].push({ date: s.date, w: s.w, reps: s.reps });
        }
      });
    });

    // PRs top 10 ejercicios
    const prLines = Object.entries(prs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ex, w]) => `  - ${ex}: ${w} kg`);

    // Progresión por ejercicio (primer set más antiguo vs más reciente últimas 4 sem)
    const progressLines = Object.entries(recentByEx)
      .map(([ex, sets]) => {
        const sorted = [...sets]/* ⚡ Bolt: Lexicographical string comparison is up to 7x faster than new Date() or localeCompare */ .sort((a, b) => a.date < b.date ? -1 : (a.date > b.date ? 1 : 0));
        if (sorted.length < 2) return null;
        const first = sorted[0], last = sorted[sorted.length - 1];
        if (first.w === last.w) return null;
        const diff = (last.w - first.w).toFixed(1);
        const arrow = diff > 0 ? '↑' : '↓';
        return `  - ${ex}: ${first.w}kg → ${last.w}kg (${arrow}${Math.abs(diff)}kg)`;
      })
      .filter(Boolean)
      .slice(0, 8);

    // Volumen últimas 4 semanas
    const volLines = ['Esta semana', 'Hace 1 sem', 'Hace 2 sem', 'Hace 3 sem']
      .map(label => {
        const v = weeklyVolume[label];
        if (!v) return null;
        return `  - ${label}: ${v.sets} series, ${v.tons.toFixed(1)} ton, ${v.days.size} días entrenados`;
      })
      .filter(Boolean);

    // Tendencia de peso (últimas 8 semanas)
    const weightEntries = Object.entries(metricslog || {})
      .map(([d, m]) => ({ date: d, w: m?.weight }))
      .filter(e => e.w)
      /* ⚡ Bolt: Lexicographical string comparison is up to 7x faster than new Date() or localeCompare */ .sort((a, b) => a.date < b.date ? -1 : (a.date > b.date ? 1 : 0));
    let weightTrend = 'Sin registros de peso suficientes.';
    if (weightEntries.length >= 2) {
      const oldest = weightEntries[Math.max(0, weightEntries.length - 8)];
      const latest = weightEntries[weightEntries.length - 1];
      const diff = (latest.w - oldest.w).toFixed(1);
      weightTrend = `${oldest.w}kg (${oldest.date}) → ${latest.w}kg (${latest.date}) = ${diff > 0 ? '+' : ''}${diff}kg`;
    }

    let result = '';
    if (prLines.length > 0) result += `PRs actuales (máximo histórico):\n${prLines.join('\n')}\n`;
    if (progressLines.length > 0) result += `Progresión últimas 4 semanas:\n${progressLines.join('\n')}\n`;
    if (volLines.length > 0) result += `Volumen de entrenamiento semanal:\n${volLines.join('\n')}\n`;
    result += `Tendencia de peso corporal: ${weightTrend}`;
    return result || 'Sin historial de entrenamiento registrado aún.';
  };

  // Saludo proactivo diario (solo una vez al día al abrir Coach)
  const sendDailyGreetingIfNeeded = async () => {
    const todayKey = `dailyGreeting_${new Date().toISOString().slice(0, 10)}`;
    if (localStorage.getItem(todayKey)) return; // ya se envió hoy
    localStorage.setItem(todayKey, '1');
    const activeSplit = splits.find(s => s.key === activeSplitKey) || splits[0] || DEFAULT_SPLITS[0];
    await sendCoachMessage(`[Análisis automático de apertura] Dame un resumen rápido de mi estado actual: qué músculo me toca hoy según mi split (${activeSplit.name}), cómo voy con mi progresión de fuerza esta semana y si hay algo importante en mi historial que deba tener en cuenta hoy.`);
  };


  const sendCoachMessage = async (messageText, customChat = null) => {
    const chatHistory = customChat || chat;
    if (!messageText.trim() || chatBusy) return;
    
    const nextChat = [...chatHistory, { role: "user", content: messageText.trim() }];
    setChat(nextChat);
    setChatBusy(true);
    
    await saveState({ chat: nextChat });
    
    try {
      const activeSplit = splits.find(s => s.key === activeSplitKey) || splits[0] || DEFAULT_SPLITS[0];
      const todayWorkout = getTodayWorkoutSummary();

      // Get latest metrics for prompt
      const getLatestMetricsText = () => {
        const keys = Object.keys(metricslog || {});
        if (keys.length === 0) return "Ninguna registrada.";
        let latestDate = keys[0];
        for (let i = 1; i < keys.length; i++) {
          if (keys[i] > latestDate) latestDate = keys[i];
        }
        const m = { date: latestDate, ...(metricslog[latestDate] || {}) };
        let text = `Último peso: ${m.weight || "?"} kg. `;
        if (m.musculo) text += `Masa muscular: ${m.musculo} kg, Grasa: ${m.grasaPct}%. `;
        if (m.brazoDer && m.brazoIzq) {
          const diff = Math.abs(m.brazoDer - m.brazoIzq);
          if (diff > 0.5) text += `Asimetría en brazos detectada: D ${m.brazoDer} cm vs I ${m.brazoIzq} cm (dif: ${diff.toFixed(1)} cm). `;
        }
        if (m.musloDer && m.musloIzq) {
          const diff = Math.abs(m.musloDer - m.musloIzq);
          if (diff > 0.5) text += `Asimetría en muslos detectada: D ${m.musloDer} cm vs I ${m.musloIzq} cm (dif: ${diff.toFixed(1)} cm). `;
        }
        return text;
      };
      const metricsSummary = getLatestMetricsText();

      // Get 7-day average nutrition
      const getNutritionAverages = (days = 7) => {
        const today = new Date(selectedDateStr);
        let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
        let loggedDays = 0;
        for (let i = 0; i < days; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().slice(0, 10);
          const entries = (foodlog || {})[dateStr];
          if (entries && entries.length > 0) {
            loggedDays++;
            entries.forEach(e => {
              totalKcal += parseFloat(e.kcal) || 0;
              totalP += parseFloat(e.proteina) || 0;
              totalC += parseFloat(e.carbo) || 0;
              totalF += parseFloat(e.grasa) || 0;
            });
          }
        }
        if (loggedDays === 0) return "Sin registros nutricionales en los últimos 7 días.";
        return `Promedios diarios reales consumidos en los últimos ${days} días: ${Math.round(totalKcal / loggedDays)} kcal (P: ${Math.round(totalP / loggedDays)}g, C: ${Math.round(totalC / loggedDays)}g, G: ${Math.round(totalF / loggedDays)}g) basado en ${loggedDays} días con registros.`;
      };
      const recentNutrition = getNutritionAverages(7);

      const workoutHistory = buildWorkoutHistorySummary();

      // Get all exercise names from splits and custom exercises
      const allExerciseNames = [...new Set([
        ...splits.flatMap(s => s.ex || []),
        ...Object.keys(exercises)
      ])];
      const exerciseNamesStr = allExerciseNames.join(", ");

      const sys = `Eres el coach nutricional y de fuerza de Bruno. ${getProfileStr(activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)}
Plan nutricional activo: ${target.kcal} kcal (${target.label}), P:${target.p}g / C:${target.c}g / G:${target.f}g.
Métricas antropométricas y corporales: ${metricsSummary}
Historial nutricional acumulado reciente: ${recentNutrition}
Día de Split de entrenamiento activo hoy: Día ${activeSplit.key} (${activeSplit.name}), combustible de carbohidratos asignado: ${activeSplit.fuel}.
Hoy lleva consumido: ${Math.round(totals.kcal)} kcal, P:${Math.round(totals.p)}g C:${Math.round(totals.c)}g G:${Math.round(totals.f)}g (Restante hoy: ${Math.round(Math.max(0, target.kcal - totals.kcal))} kcal, P:${Math.round(Math.max(0, target.p - totals.p))}g C:${Math.round(Math.max(0, target.c - totals.c))}g G:${Math.round(Math.max(0, target.f - totals.f))}g).

Entrenamiento realizado por Bruno hoy:
${todayWorkout}

--- HISTORIAL Y MEMORIA COMPLETA ---
${workoutHistory}
--- FIN HISTORIAL ---

Español, directo, técnico y motivador. Usa el historial para dar recomendaciones personalizadas y basadas en datos reales (PRs, progresión, volumen). Si detectás estancamiento o regresión en algún ejercicio, mencionalo proactivamente.
REGLA DE CALCULADORA INVERSA: Si Bruno te pregunta qué cenar o comer para cerrar el día o cómo completar sus macros restantes (ej. 'me quedan 600 calorías y 50g de proteína...'), calcula con precisión matemática una combinación rápida de alimentos (ej. claras, huevo entero, gramos exactos de pechuga de pollo, scoop de whey) para cuadrar sus números de forma exacta.
REGLA CRÍTICA DE PORCIONES E INGREDIENTES: Cuando recomiendes porciones, alimentos o comidas en el chat, debes ajustar estrictamente las porciones (detallando gramos exactos) al plan nutricional seleccionado por Bruno (${target.label}) y a las necesidades energéticas del split del día (${activeSplit.fuel}). No recomiendes las mismas porciones por defecto. Si está en "Volumen" o día de "Carbo alto", propón porciones abundantes de carbohidratos. Si está en "Definición" o día de "Carbo medio", sé sumamente estricto y reduce las porciones de carbohidratos, sugiriendo fuentes de proteína magra más saciantes.
REGLA DE DATOS NUTRICIONALES DE REFERENCIA: Para calcular calorías y macronutrientes de los alimentos registrados (ADD_FOOD) o recomendados en el chat, debes basar tus cálculos estrictamente en bases de datos nutricionales oficiales y verificadas (como USDA FoodData Central o tablas locales de Latinoamérica/Chile). No inventes ni alucines valores; asegúrate de que todas las estimaciones por porción/gramaje sean científicamente coherentes con estas fuentes oficiales.

Debes responder SIEMPRE en formato JSON cumpliendo con el esquema COACH_SCHEMA. Si Bruno te pide agregar o registrar comida (ADD_FOOD), peso (ADD_WEIGHT), series de ejercicios (ADD_SET) o cambiar su límite/objetivo de calorías o macros diarios (UPDATE_TARGET), o cambiar la rutina de splits/entrenamiento (UPDATE_SPLITS), incluye las acciones correspondientes en el arreglo 'actions'. Si es solo una conversación o duda normal, el arreglo 'actions' debe ser vacío.
REGLAS DE ACCIÓN UPDATE_TARGET:
* Si Bruno te pide cambiar sus calorías objetivo (ej. "súbeme las calorías a 2800" o "estoy definiendo muy lento, baja las calorías"), genera una acción con type "UPDATE_TARGET".
* En 'data', proporciona: 'kcal' (número). Opcionalmente puedes definir 'proteina' (número), 'carbo' (número) y 'grasa' (número). Si Bruno no especifica macros, calcula una distribución balanceada hiperproteica (ej: 2.2g de proteína por kg de peso, 20-25% grasa, y el resto carbohidratos).
* De manera opcional y recomendada, si cambias el límite de calorías, puedes incluir una nueva distribución sugerida de comidas en la propiedad 'meals' de 'data' que cumpla exactamente con este nuevo límite calórico (manteniendo el formato de slot, kcal y opts). Esto actualizará automáticamente su dieta de hoy.
REGLAS DE ACCIÓN UPDATE_SPLITS:
* Si Bruno te pide cambiar su plan/rutina de entrenamiento, agregar o quitar ejercicios de un split (ej. "saca curl de bíceps de la rutina de brazos" o "cambia el split de hoy a empuje e incluye press inclinado y aperturas"), genera una acción con type "UPDATE_SPLITS".
* En 'data', proporciona: 'splits' (arreglo que contiene la estructura COMPLETA de todos los días de entrenamiento, cada uno con key, name, fuel y ex).
      Ejercicios válidos para ADD_SET: ${exerciseNamesStr}.`;
      
      const out = await callGemini(nextChat.slice(-12), sys, COACH_SCHEMA);
      const parsed = cleanAndParseJSON(out);
      
      if (parsed.actions && parsed.actions.length > 0) {
        handleCoachActions(parsed.actions);
        // Si registró ejercicios, análisis automático de la sesión
        const hasNewSets = parsed.actions.some(a => a.type === 'ADD_SET');
        if (hasNewSets) {
          setTimeout(() => {
            sendCoachMessage('[Análisis automático de sesión] Analicé las series que acabo de registrar. Dame una evaluación breve: ¿superé mis registros anteriores? ¿el volumen fue adecuado? ¿qué debo priorizar la próxima sesión de este músculo?');
          }, 1500);
        }
      }
      
      const finalChat = [...nextChat, { role: "assistant", content: parsed.chatResponse || "..." }];
      setChat(finalChat);
      await saveState({ chat: finalChat });
    } catch(e) {
      console.error(e);
      let content = aiErr(e);
      try {
        const rawOut = await callGemini(nextChat.slice(-12), `Eres el coach de Bruno. Responde brevemente en texto plano.`);
        content = rawOut || "...";
      } catch (err) {}
      const finalChat = [...nextChat, { role: "assistant", content }];
      setChat(finalChat);
      await saveState({ chat: finalChat });
    } finally {
      setChatBusy(false);
    }
  };

  const handleAnalyzeWorkout = async () => {
    setView("coach");
    const msg = "He terminado de entrenar. Por favor, analiza mi entrenamiento de hoy y dame sugerencias. Pregúntame sobre mis sensaciones, fallos u otros detalles relevantes.";
    await sendCoachMessage(msg);
  };

  const importWorkoutData = (resolvedWorkout, currentSplitKey) => {
    let updatedExlog = { ...exlog };
    let updatedExercises = { ...exercises };
    let exercisesChanged = false;
    
    const parts = selectedDateStr.split("-");
    const now = new Date();
    let timeOffset = 0;
    const newPrs = [];

    resolvedWorkout.forEach((item) => {
      let resolvedName = item.targetName;
      if (item.targetName === "__NEW__") {
        resolvedName = item.originalName;
        const alreadyExistsInSplit = (updatedExercises[currentSplitKey] || []).some(e => e.name.toLowerCase() === resolvedName.toLowerCase());
        if (!alreadyExistsInSplit) {
          updatedExercises[currentSplitKey] = [...(updatedExercises[currentSplitKey] || []), { name: resolvedName, tecnico: "", musculos: item.muscles || [] }];
          exercisesChanged = true;
        }
      }

      // Check for PR before writing to updatedExlog
      item.sets.forEach(s => {
        const prMsg = checkNewPR(resolvedName, parseFloat(s.w), s.reps, updatedExlog);
        if (prMsg) {
          newPrs.push(`${resolvedName}: ${prMsg}`);
        }
      });

      // Generar series con fecha seleccionada
      const newSets = item.sets.map((s) => {
        timeOffset += 10;
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds() - timeOffset);
        return {
          date: d.toISOString(),
          w: parseFloat(s.w) || 0,
          reps: String(s.reps).trim() || "-",
          type: s.type || "work"
        };
      });

      updatedExlog[resolvedName] = [...newSets, ...(updatedExlog[resolvedName] || [])].slice(0, 60);
    });

    if (newPrs.length > 0) {
      setPrAlerts(newPrs);
      newPrs.forEach(function(prStr) { var m = prStr.match(/^([^:]+).*?([0-9]+(?:\.[0-9]+)?)\s*kg/); if(m) addSmartGoalFromPR(m[1].trim(), parseFloat(m[2])); });
    }

    const updates = { exlog: updatedExlog };
    if (exercisesChanged) {
      updates.exercises = updatedExercises;
      setExercises(updatedExercises);
    }
    setExlog(updatedExlog);
    setTimeout(function() { analyzeAndReconfigure("training_saved", { currentExlog: updatedExlog }); }, 300);
    saveState(updates);
  };

  return (
    <div className="app-outer-container">
      <div className="app-inner-container">
        {/* Navigation Bottom Bar */}
        {["hoy", "coach", "entreno", "reg", "perfil", "plan"].includes(view) && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 80,
            paddingBottom: "env(safe-area-inset-bottom)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            background: C.panel,
            borderTop: `1px solid ${C.line}`,
            zIndex: 100
          }}>
            {[
              ["hoy", "Hoy", Flame],
              ["coach", "Coach", MessageSquare],
              ["entreno", "Entreno", Dumbbell],
              ["reg", "Registro", ClipboardList],
              ["perfil", "Perfil", Settings]
            ].map(([k, lbl, Ic]) => {
              const isActive = view === k || (k === "perfil" && view === "plan");
              return (
                <button
                  key={k}
                  onClick={() => setView(k)}
                  className="btn-active-scale"
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 0 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                    outline: "none"
                  }}
                >
                  <Ic size={22} strokeWidth={isActive ? 2.5 : 1.8}/>
                  <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: "0.01em" }}>{lbl}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Viewport */}
        <div style={{
          flex: 1,
          overflowY: view === "coach" ? "hidden" : "auto",
          display: "flex",
          flexDirection: "column"
        }}>

      {["hoy", "coach", "entreno", "reg", "plan", "perfil"].includes(view) && (
        <div style={{maxWidth:520, margin:"0 auto", padding:"20px 16px 10px"}}>
          {view === "hoy" && (
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <div style={{width:36, height:36, borderRadius:10, background:C.lime, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <Sparkles size={18} color="#ffffff"/>
                </div>
                <span style={{fontWeight:800, fontSize:16, color:C.ink}}>Espacio IA</span>
              </div>
              <div style={{width:36, height:36, borderRadius:99, background:C.panel2, border:`1px solid ${C.line}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden"}}>
                <span style={{fontSize:14, fontWeight:700, color:C.muted}}>B</span>
              </div>
            </div>
          )}
          {view === "hoy" && (
            <div style={{marginTop:16}}>
              <div style={{fontSize:13, color:C.muted}}>¡Hola, Bruno!</div>
              <div className="disp" style={{fontSize:32, marginTop:2, lineHeight:1}}>CENTRO DE MANDO</div>
            </div>
          )}
          {view === "coach" && (
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <div style={{fontSize:20, fontWeight:800, color:C.ink}}>Coach Bruno</div>
              <div style={{width:36, height:36, borderRadius:99, background:C.panel2, border:`1px solid ${C.line}`, display:"flex", alignItems:"center", justifyContent:"center"}}>
                <span style={{fontSize:14, fontWeight:700, color:C.muted}}>B</span>
              </div>
            </div>
          )}
          {view === "entreno" && (
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <div style={{fontSize:20, fontWeight:800, color:C.ink}}>Rutina de Hoy</div>
              <button
                onClick={() => setShowTrainerAgent(true)}
                className="btn-active-scale"
                style={{background:"rgba(205,255,74,0.08)", border:`1px solid rgba(205,255,74,0.25)`, borderRadius:10, padding:"6px 10px", display:"flex", alignItems:"center", gap:5, color:C.lime, fontWeight:800, fontSize:11.5, cursor:"pointer"}}
              >
                <Sparkles size={13}/><span>Agente</span>
              </button>
            </div>
          )}
          {view === "reg" && (
            <div style={{fontSize:20, fontWeight:800, color:C.ink}}>Registro Histórico</div>
          )}
          {view === "plan" && (
            <div style={{fontSize:20, fontWeight:800, color:C.ink}}>Plan de Objetivos</div>
          )}
          {view === "perfil" && (
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <div style={{fontSize:20, fontWeight:800, color:C.ink}}>Mi Perfil</div>
              <Settings size={20} color={C.muted}/>
            </div>
          )}
        </div>
      )}

      <div style={{
        // En Coach la altura es fija (el chat scrollea adentro); en el resto el
        // contenedor debe crecer con el contenido para que el padding inferior
        // quede DESPUÉS del último elemento y nada quede oculto tras la barra.
        flex: view === "coach" ? 1 : "1 0 auto",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        paddingBottom: ["hoy", "coach", "entreno", "reg", "perfil", "plan"].includes(view) ? 110 : 20
      }}>
        {view === "onboarding" && (
          <Onboarding setView={setView} />
        )}
        {view === "hoy" && (
          <Hoy 
            target={target} 
            totals={totals} 
            log={log} 
            setLog={(l) => { setLog(l); saveState({ log: l }); }} 
            loaded={loaded} 
            water={water} 
            setWater={setWaterP} 
            geminiKey={geminiKey}
            supplements={supplements}
            handleUpdateSupplements={(newSupps, newInv) => {
              setSupplements(newSupps);
              if (newInv) setSuppsInventory(newInv);
              saveState({ supplements: newSupps, suppsInventory: newInv || suppsInventory });
            }}
            activeSplitKey={activeSplitKey}
            suppsInventory={suppsInventory}
            setSuppsInventory={(si) => saveState({ suppsInventory: si })}
            selectedDateStr={selectedDateStr}
            setSelectedDateStr={setSelectedDateStr}
            proactiveMsg={proactiveMsg}
            aiNotifications={aiNotifications}
            setAiNotifications={setAiNotifications}
            macroAdjustSuggestion={macroAdjustSuggestion}
            setMacroAdjustSuggestion={setMacroAdjustSuggestion}
            saveState={saveState}
            customPresets={customPresets}
            weeklyInsight={weeklyInsight}
            smartGoals={smartGoals}
            challenges={challenges}
            updateChallengeProgress={updateChallengeProgress}
            splits={splits}
            upcomingEvent={upcomingEvent}
            experiments={experiments}
            setExperiments={setExperiments}
            setView={setView}
            setShowNutritionModal={setShowNutritionModal}
            setModalVals={setModalVals}
            addFoodInputText={addFoodInputText}
            setAddFoodInputText={setAddFoodInputText}
            customSuggestions={customSuggestions}
          />
        )}
        {view === "coach" && (
          <Coach 
            chat={chat} 
            setChat={(c) => { setChat(c); saveState({ chat: c }); }} 
            target={target} 
            totals={totals} 
            sendCoachMessage={sendCoachMessage}
            chatBusy={chatBusy}
            sendDailyGreetingIfNeeded={sendDailyGreetingIfNeeded}
          />
        )}
        {view === "entreno" && (
          <Entreno 
            exlog={exlog} 
            setExlog={(el) => { setExlog(el); saveState({ exlog: el }); }} 
            exercises={exercises} 
            setExercises={(ex) => { setExercises(ex); saveState({ exercises: ex }); }}
            geminiKey={geminiKey}
            handleAnalyzeWorkout={handleAnalyzeWorkout}
            importWorkoutData={importWorkoutData}
            activeSplitKey={activeSplitKey}
            setActiveSplitKey={(sk) => { setActiveSplitKey(sk); saveState({ activeSplitKey: sk }); }}
            selectedDateStr={selectedDateStr}
            setSelectedDateStr={setSelectedDateStr}
            calMonth={calMonth}
            setCalMonth={setCalMonth}
            workoutDurations={workoutDurations}
            setWorkoutDurations={(wd) => saveState({ workoutDurations: wd })}
            prAlerts={prAlerts}
            setPrAlerts={setPrAlerts}
            checkNewPR={checkNewPR}
            activeMetrics={activeMetrics}
            overloadSuggestions={overloadSuggestions}
            plateauAlerts={plateauAlerts}
            muscleImbalances={muscleImbalances}
            splits={splits}
            setSplits={(s) => saveState({ splits: s })}
            notes={notes}
            chat={chat}
          />
        )}
        {view === "reg" && (
          <Registro 
            notes={notes} 
            setNotes={(n) => { setNotes(n); saveState({ notes: n }); }} 
            target={target} 
            bodyComp={bodyComp} 
            setBodyComp={(bc) => { setBodyComp(bc); saveState({ bodyComp: bc }); }}
            geminiKey={geminiKey}
            metricslog={metricslog}
            setMetricslog={(ml) => saveState({ metricslog: ml })}
            selectedDateStr={selectedDateStr}
            saveWeight={(w) => saveState({ weight: w })}
            activeMetrics={activeMetrics}
            foodlog={foodlog}
            waterlog={waterlog}
            exlog={exlog}
            projections={projections}
            tdeeEstimate={tdeeEstimate}
            analyzeAndReconfigure={analyzeAndReconfigure}
            experiments={experiments}
            setExperiments={(exp) => saveState({ experiments: exp })}
          />
        )}
        {view === "plan" && (
          <Plan 
            presetKey={presetKey}
            setPresetKey={(k) => saveState({ presetKey: k })}
            customPresets={customPresets}
            setCustomPresets={(cp, switchToPersonal) => {
              const updates = { customPresets: cp };
              if (switchToPersonal) updates.presetKey = "personalizado";
              saveState(updates);
              if (switchToPersonal) setPresetKey("personalizado");
            }}
            shoppingList={shoppingList} 
            setShoppingList={(sl) => { setShoppingList(sl); saveState({ shoppingList: sl }); }}
            geminiKey={geminiKey}
            meals={meals}
            setMeals={(ml) => { setMeals(ml); saveState({ meals: ml }); }}
            activeMetrics={activeMetrics}
            setShowNutritionModal={setShowNutritionModal}
            setModalVals={setModalVals}
          />
        )}
        {view === "perfil" && (
          <Perfil 
            activeMetrics={activeMetrics}
            geminiKey={geminiKey}
            saveGeminiKey={saveGeminiKey}
            aiModel={aiModel}
            saveAiModel={saveAiModel}
            cloudSync={cloudSync}
            syncCode={syncCode}
            syncStatus={syncStatus}
            handleToggleCloudSync={handleToggleCloudSync}
            handleCreateSyncCode={handleCreateSyncCode}
            handleLinkDevice={handleLinkDevice}
            handleForcePull={handleForcePull}
            handleForcePush={handleForcePush}
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
            supabaseUser={supabaseUser}
            sbSyncing={sbSyncing}
            sbError={sbError}
            saveSbConfig={saveSbConfig}
            handleSbLogin={handleSbLogin}
            handleSbRegister={handleSbRegister}
            handleSbLogout={handleSbLogout}
            syncLocalToSupabase={syncLocalToSupabase}
            changePreset={changePreset}
            presetKey={presetKey}
            customPresets={customPresets}
            bodyComp={bodyComp}
          />
        )}
        {view === "addfood" && (
          <AddFood 
            addFoodInputText={addFoodInputText}
            setAddFoodInputText={setAddFoodInputText}
            aiParsedResults={aiParsedResults}
            setAiParsedResults={setAiParsedResults}
            setView={setView}
            setEditingEntryIdx={setEditingEntryIdx}
            setEditingEntryData={setEditingEntryData}
            log={log}
            setLog={(l) => { setLog(l); saveState({ log: l }); }}
            geminiKey={geminiKey}
            saveState={saveState}
          />
        )}
        {view === "editentry" && (
          <EditEntry 
            editingEntryIdx={editingEntryIdx}
            editingEntryData={editingEntryData}
            setEditingEntryData={setEditingEntryData}
            aiParsedResults={aiParsedResults}
            setAiParsedResults={setAiParsedResults}
            setView={setView}
          />
        )}
      </div>

      {showTrainerAgent && (
        <TrainerAgent
          onClose={() => setShowTrainerAgent(false)}
          data={trainerAgentData}
          busy={trainerAgentBusy}
          onRunAnalysis={runTrainerAgentAnalysis}
          exlog={exlog}
          exercises={exercises}
          notes={notes}
          metricslog={metricslog}
          splits={splits}
          plateauAlerts={plateauAlerts}
          overloadSuggestions={overloadSuggestions}
          muscleImbalances={muscleImbalances}
        />
      )}

      {prAlerts.length > 0 && (
        <div style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 24px)",
          maxWidth: 360,
          background: "rgba(21, 23, 15, 0.98)",
          border: `2px solid ${C.lime}`,
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(205,255,74,0.15)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          animation: "pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
        }}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <span style={{display:"flex", alignItems:"center", gap:8, fontSize:13.5, fontWeight:900, color:C.lime}}>
              <Sparkles size={16}/> ¡NUEVO PR DETECTADO!
            </span>
            <button 
              onClick={() => setPrAlerts([])} 
              style={{background:"none", border:"none", color:C.muted, cursor:"pointer", padding:8, margin:-4, display:"flex", alignItems:"center", justifyContent:"center"}}
            >
              <X size={20}/>
            </button>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            {prAlerts.map((msg, idx) => (
              <div key={idx} style={{fontSize:12.5, color:C.ink, fontWeight:600, borderLeft:`3px solid ${C.lime}`, paddingLeft:8}}>
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {showNutritionModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999, padding: 16
        }}>
          <div style={{
            background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16,
            padding: 20, width: "100%", maxWidth: 420, display: "flex",
            flexDirection: "column", gap: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            maxHeight: "calc(100vh - 32px)", overflowY: "auto"
          }}>
            {/* Header */}
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span style={{fontSize:14, fontWeight:900, color:C.lime, letterSpacing:".05em"}}>
                AJUSTAR OBJETIVOS DE NUTRICIÓN
              </span>
              <button 
                onClick={() => setShowNutritionModal(false)}
                style={{background:"none", border:"none", color:C.muted, cursor: "pointer", padding:4}}
              >
                <X size={20}/>
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{display:"flex", gap:6, background:C.panel2, padding:4, borderRadius:10, border:`1px solid ${C.line}`}}>
              <button
                onClick={() => setModalMode("manual")}
                style={{
                  flex:1, padding:"6px 12px", borderRadius:8, border:"none",
                  background: modalMode === "manual" ? C.lime : "transparent",
                  color: modalMode === "manual" ? "#0c0e0b" : C.muted,
                  fontSize:12, fontWeight:800, cursor:"pointer"
                }}
              >
                Ajuste Manual
              </button>
              <button
                onClick={() => setModalMode("ai")}
                style={{
                  flex:1, padding:"6px 12px", borderRadius:8, border:"none",
                  background: modalMode === "ai" ? C.lime : "transparent",
                  color: modalMode === "ai" ? "#0c0e0b" : C.muted,
                  fontSize:12, fontWeight:800, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:4
                }}
              >
                <Sparkles size={12}/>
                <span>Ajuste con IA</span>
              </button>
            </div>

            {/* Manual Tab Content */}
            {modalMode === "manual" && (
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                  <div>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>Calorías (kcal)</label>
                    <input 
                      type="number" 
                      value={modalVals.kcal}
                      onChange={e => {
                        const val = parseInt(e.target.value)||0;
                        const oldKcal = modalVals.kcal || 1;
                        const factor = val / oldKcal;
                        setModalVals(prev => ({
                          kcal: val,
                          p: Math.round(prev.p * factor),
                          c: Math.round(prev.c * factor),
                          f: Math.round(prev.f * factor)
                        }));
                      }}
                      style={{width:"100%", background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px", fontSize:13, color:C.ink, outline:"none", textAlign:"center", fontWeight:600}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize:11, color:C.cyan, fontWeight:700, display:"block", marginBottom:4}}>Proteína (g)</label>
                    <input 
                      type="number" 
                      value={modalVals.p}
                      onChange={e => {
                        const val = parseInt(e.target.value)||0;
                        setModalVals(prev => {
                          const next = { ...prev, p: val };
                          return { ...next, kcal: next.p * 4 + next.c * 4 + next.f * 9 };
                        });
                      }}
                      style={{width:"100%", background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px", fontSize:13, color:C.ink, outline:"none", textAlign:"center", fontWeight:600}}
                    />
                  </div>
                </div>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                  <div>
                    <label style={{fontSize:11, color:C.lime, fontWeight:700, display:"block", marginBottom:4}}>Carbohidratos (g)</label>
                    <input 
                      type="number" 
                      value={modalVals.c}
                      onChange={e => {
                        const val = parseInt(e.target.value)||0;
                        setModalVals(prev => {
                          const next = { ...prev, c: val };
                          return { ...next, kcal: next.p * 4 + next.c * 4 + next.f * 9 };
                        });
                      }}
                      style={{width:"100%", background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px", fontSize:13, color:C.ink, outline:"none", textAlign:"center", fontWeight:600}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize:11, color:C.amber, fontWeight:700, display:"block", marginBottom:4}}>Grasas (g)</label>
                    <input 
                      type="number" 
                      value={modalVals.f}
                      onChange={e => {
                        const val = parseInt(e.target.value)||0;
                        setModalVals(prev => {
                          const next = { ...prev, f: val };
                          return { ...next, kcal: next.p * 4 + next.c * 4 + next.f * 9 };
                        });
                      }}
                      style={{width:"100%", background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px", fontSize:13, color:C.ink, outline:"none", textAlign:"center", fontWeight:600}}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AI Tab Content */}
            {modalMode === "ai" && (
              <div style={{display:"flex", flexDirection:"column", gap:10}}>
                <div style={{fontSize:11.5, color:C.muted}}>
                  Describe qué cambios quieres en tus macros o tu plan de alimentación (ej: "baja mis calorías a 2300 y sube proteína a 220g", "haz un déficit agresivo para definir"):
                </div>
                <div style={{display:"flex", gap:6}}>
                  <textarea
                    value={modalAiPrompt}
                    onChange={e => setModalAiPrompt(e.target.value)}
                    placeholder="Escribe tu solicitud aquí..."
                    rows={2}
                    style={{flex:1, background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px 10px", fontSize:12.5, color:C.ink, resize:"none", outline:"none"}}
                  />
                  <button
                    onClick={handleQueryAiNutrition}
                    disabled={modalAiBusy || !modalAiPrompt.trim()}
                    style={{padding:"0 12px", background: modalAiBusy ? C.panel2 : C.lime, color: modalAiBusy ? C.muted : "#0c0e0b", fontWeight:800, borderRadius:8, fontSize:11.5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}
                  >
                    {modalAiBusy ? <Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/> : <Send size={16}/>}
                  </button>
                </div>

                {modalAiErr && (
                  <div style={{color:C.rose, fontSize:12, marginTop:4}}>
                    {modalAiErr}
                  </div>
                )}

                {modalAiReasoning && (
                  <div style={{background:"rgba(74,214,255,.05)", border:`1px solid ${C.cyan}`, borderRadius:10, padding:10, fontSize:12, color:C.ink, marginTop:4}}>
                    <div style={{fontWeight:800, color:C.cyan, marginBottom:4}}>Propuesta de la IA:</div>
                    {modalAiReasoning}
                  </div>
                )}

                {/* AI Calculated Values Preview */}
                <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:6, background:C.panel2, padding:10, borderRadius:10, border:`1px solid ${C.line}`, marginTop:4}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9, color:C.muted, fontWeight:700}}>kcal</div>
                    <div style={{fontSize:13, fontWeight:800, color:C.lime}}>{modalVals.kcal}</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9, color:C.cyan, fontWeight:700}}>Prot</div>
                    <div style={{fontSize:13, fontWeight:800, color:C.cyan}}>{modalVals.p}g</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9, color:C.lime, fontWeight:700}}>Carb</div>
                    <div style={{fontSize:13, fontWeight:800, color:C.lime}}>{modalVals.c}g</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9, color:C.amber, fontWeight:700}}>Grasa</div>
                    <div style={{fontSize:13, fontWeight:800, color:C.amber}}>{modalVals.f}g</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div style={{display:"flex", gap:8, borderTop:`1px solid ${C.line}`, paddingTop:12, marginTop:4}}>
              <button 
                onClick={() => setShowNutritionModal(false)}
                style={{flex:1, padding:"10px", background:"none", border:`1px solid ${C.line}`, color:C.muted, borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer"}}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  updateAllMacrosAndAdjustMeals(modalVals.kcal, modalVals.p, modalVals.c, modalVals.f);
                  setShowNutritionModal(false);
                }}
                style={{flex:1, padding:"10px", background:C.lime, color:"#0c0e0b", border:"none", borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer"}}
              >
                Guardar y Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

/* ===== SUB-PANEL IA (AIPanel) ===== */
function AIPanel({title, busy, text, color=C.lime, onClose}){
  if(!busy && !text) return null;
  return (
    <div className="pop" style={{
      background:"rgba(107,78,255,.05)", 
      border:`1px solid ${C.line}`, 
      borderLeft:`3px solid ${color}`, 
      borderRadius:12, 
      padding:"13px 15px", 
      marginTop:10,
      position:"relative"
    }}>
      <div style={{
        display:"flex", 
        alignItems:"center", 
        justifyContent:"space-between",
        fontSize:11, 
        fontWeight:800, 
        letterSpacing:".08em", 
        textTransform:"uppercase", 
        color, 
        marginBottom: busy ? 0 : 7
      }}>
        <span style={{display:"flex", alignItems:"center", gap:7}}>
          <Sparkles size={13}/>{title}
        </span>
        {onClose && !busy && (
          <button 
            onClick={onClose}
            style={{
              background:"none",
              border:"none",
              cursor:"pointer",
              color:C.muted,
              padding:4,
              margin:"-4px -4px -4px 0",
              display:"grid",
              placeItems:"center"
            }}
          >
            <X size={15}/>
          </button>
        )}
      </div>
      {busy ? (
        <div style={{display:"flex", gap:7, alignItems:"center", color:C.muted, fontSize:13, marginTop:7}}>
          <Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>pensando…
        </div>
      ) : (
        <div style={{fontSize:13.5, lineHeight:1.55, whiteSpace:"pre-wrap", color:"#dde0cf"}}>{text}</div>
      )}
    </div>
  );
}

/* ===== TAB HOY ===== */
function Bar({ icon: Ic, label, val, max, unit, color, onSettingsClick }) {
  const pct = Math.min(100, max ? (val / max) * 100 : 0);
  
  // Choose background tint and icon color based on color
  let circleBg = "var(--panel-bg-sec)";
  let iconColor = color;
  if (color === "var(--accent-primary)") {
    circleBg = "var(--panel-bg-tint)";
    iconColor = "var(--accent-primary)";
  } else if (color === "var(--accent-cyan)") {
    circleBg = "#e6fffa";
    iconColor = "var(--accent-cyan)";
  } else if (color === "var(--accent-amber)") {
    circleBg = "#fffbeb";
    iconColor = "var(--accent-amber)";
  } else if (color === "var(--accent-blue)") {
    circleBg = "#ebf8ff";
    iconColor = "var(--accent-blue)";
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      border: "1px solid var(--line-color)",
      borderRadius: "var(--radius-md)",
      background: "var(--bg-color)",
      boxShadow: "var(--shadow-card)",
      marginBottom: 12,
      gap: 12
    }}>
      {/* Left Icon circular 44x44 */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: circleBg,
        color: iconColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}>
        <Ic size={20} strokeWidth={2}/>
      </div>

      {/* Center Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-ink)" }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-ink)", fontVariantNumeric: "tabular-nums" }}>
            {Math.round(val)}<span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 500 }}> / {max} {unit}</span>
          </span>
        </div>
        
        {/* Progress Bar height: 6px */}
        <div style={{ height: 6, background: "var(--panel-bg-sec)", borderRadius: "var(--radius-pill)", overflow: "hidden", width: "100%" }}>
          <div className="macro-progress-bar" style={{ height: "100%", width: `${pct}%`, background: iconColor, borderRadius: "var(--radius-pill)" }}/>
        </div>
      </div>

      {/* Right Settings Icon */}
      <button 
        onClick={onSettingsClick}
        className="btn-active-scale"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          outline: "none"
        }}
      >
        <Settings size={18} />
      </button>
    </div>
  );
}

function Onboarding({ setView }) {
  const handleOmit = () => {
    localStorage.setItem("onboarding_shown", "true");
    setView("hoy");
  };

  const handleRegisterNow = () => {
    localStorage.setItem("onboarding_shown", "true");
    setView("addfood");
  };

  const handleConfigurePlan = () => {
    localStorage.setItem("onboarding_shown", "true");
    setView("plan");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "32px 16px",
      minHeight: "100%",
      background: "var(--bg-color)"
    }}>
      {/* Top Welcome Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
        {/* Large Purple Lightning Icon Wrapper */}
        <div style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: "var(--accent-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0c0e0b",
          marginBottom: 16,
          position: "relative",
          boxShadow: "0 8px 16px rgba(92, 79, 223, 0.2)"
        }}>
          <Flame size={48} strokeWidth={2}/>
          <div style={{
            position: "absolute",
            bottom: -6,
            background: "var(--panel-bg-sec)",
            border: "1px solid var(--line-color)",
            color: "var(--accent-primary)",
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "var(--radius-pill)",
            display: "flex",
            alignItems: "center",
            gap: 2
          }}>
            <Sparkles size={10}/> IA ACTIVA
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-ink)", margin: "8px 0" }}>
          ¡Hola, soy <span style={{ color: "var(--accent-primary)" }}>Bruno</span>!
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", maxHeight: "4.5em", overflow: "hidden", lineHeight: 1.4, padding: "0 16px" }}>
          Tu compañero inteligente para transformar tu salud y nutrición.
        </p>

        {/* Pills / Tags Row */}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {["Registro IA", "Planificación", "Coaching"].map((pill, i) => (
            <div key={i} style={{
              background: i === 0 ? "var(--panel-bg-tint)" : "var(--panel-bg-sec)",
              color: i === 0 ? "var(--accent-primary)" : "var(--text-muted)",
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: 12,
              fontWeight: 600,
              border: i === 0 ? "1px solid var(--accent-primary)" : "1px solid transparent"
            }}>
              {pill}
            </div>
          ))}
        </div>
      </div>

      {/* Tus Primeros Pasos Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", marginTop: 24, flex: 1, justifyContent: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", color: "var(--text-muted)", textTransform: "uppercase" }}>
          TUS PRIMEROS PASOS
        </div>

        {/* Step 1 Card */}
        <div style={{
          border: "1px solid var(--line-color)",
          borderRadius: "var(--radius-md)",
          padding: 16,
          background: "var(--panel-bg)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--panel-bg-tint)",
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Utensils size={20}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-ink)" }}>Tu primera comida</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.3 }}>
                Cuéntame qué has comido o toma una foto para analizar tus macros.
              </div>
            </div>
          </div>
          <button
            onClick={handleRegisterNow}
            className="btn-active-scale"
            style={{
              height: 44,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-primary)",
              color: "#0c0e0b",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              width: "100%"
            }}
          >
            Registrar ahora <Plus size={16}/>
          </button>
        </div>

        {/* Step 2 Card */}
        <div style={{
          border: "1px solid var(--line-color)",
          borderRadius: "var(--radius-md)",
          padding: 16,
          background: "var(--panel-bg)",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#e6fcf5",
              color: "var(--accent-cyan)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Target size={20}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-ink)" }}>Define tus objetivos</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.3 }}>
                Configura tus metas de calorías y macros según tu ritmo de vida.
              </div>
            </div>
          </div>
          <button
            onClick={handleConfigurePlan}
            className="btn-active-scale"
            style={{
              height: 44,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-cyan)",
              color: "#04212b",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              width: "100%"
            }}
          >
            Configurar plan <Plus size={16}/>
          </button>
        </div>
      </div>

      {/* Footer link */}
      <button
        onClick={handleOmit}
        style={{
          background: "none",
          border: "none",
          color: "var(--accent-primary)",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 4
        }}
      >
        Omitir tutorial e ir al centro de mando &rarr;
      </button>
    </div>
  );
}

function AddFood({
  addFoodInputText,
  setAddFoodInputText,
  aiParsedResults,
  setAiParsedResults,
  setView,
  setEditingEntryIdx,
  setEditingEntryData,
  log,
  setLog,
  geminiKey,
  saveState
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();

  const [localText, setLocalText] = useState(addFoodInputText || "");
  useEffect(() => {
    setLocalText(addFoodInputText || "");
  }, [addFoodInputText]);

  const FOOD_SYS = "Eres un nutricionista experto. Estima los macros de la comida detallada por el usuario (puede ser texto o imagen).\n" +
                    "REGLAS CRÍTICAS DE ESTIMACIÓN:\n" +
                    "1. Devuelve un listado de ingredientes o platos individuales de forma desglosada.\n" +
                    "2. Asume porciones genéricas estándar si el usuario no las detalla.\n" +
                    "Responde ÚNICAMENTE con el formato JSON y nada más. Ejemplo de esquema requerido:\n" +
                    "{\n" +
                    "  \"items\": [\n" +
                    "    { \"resumen\": \"Pechuga de pollo a la plancha\", \"peso\": \"200g\", \"kcal\": 330, \"proteina\": 62, \"carbo\": 0, \"grasa\": 7, \"precision\": 95 },\n" +
                    "    { \"resumen\": \"Arroz blanco cocido\", \"peso\": \"150g\", \"kcal\": 195, \"proteina\": 4, \"carbo\": 42, \"grasa\": 1, \"precision\": 95 }\n" +
                    "  ]\n" +
                    "}";

  const FOOD_SCHEMA = {
    type: "OBJECT",
    properties: {
      items: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            resumen: { type: "STRING" },
            peso: { type: "STRING" },
            kcal: { type: "INTEGER" },
            proteina: { type: "INTEGER" },
            carbo: { type: "INTEGER" },
            grasa: { type: "INTEGER" },
            precision: { type: "INTEGER" }
          },
          required: ["resumen", "peso", "kcal", "proteina", "carbo", "grasa", "precision"]
        }
      }
    },
    required: ["items"]
  };

  const handleAnalyze = async () => {
    const val = localText.trim();
    if (!val || busy) return;
    setAddFoodInputText(val);
    setBusy(true);
    setErr("");
    try {
      const out = await callGemini([{ role: "user", content: val }], FOOD_SYS, FOOD_SCHEMA);
      const parsed = cleanAndParseJSON(out);
      if (parsed && parsed.items) {
        setAiParsedResults(prev => [...prev, ...parsed.items]);
      } else {
        throw new Error("No se devolvió un formato correcto.");
      }
    } catch (e) {
      setErr("Error al analizar: Describe los alimentos de forma natural o detalla pesos.");
    } finally {
      setBusy(false);
    }
  };

  const onPhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const media = ["image/jpeg", "image/png", "image/webp"].includes(file.type) ? file.type : "image/jpeg";
      const out = await callGemini([
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media, data: b64 } },
            { type: "text", text: "Analiza esta comida y estima los macros de cada plato desglosado en un listado de items." }
          ]
        }
      ], FOOD_SYS, FOOD_SCHEMA);
      const parsed = cleanAndParseJSON(out);
      if (parsed && parsed.items) {
        setAiParsedResults(prev => [...prev, ...parsed.items]);
      }
    } catch (err) {
      setErr("Error leyendo la foto. Sube otra imagen.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const handleAddCustomItem = () => {
    const newItem = {
      resumen: "Nuevo alimento",
      peso: "100g",
      kcal: 100,
      proteina: 10,
      carbo: 10,
      grasa: 2,
      precision: 95
    };
    setAiParsedResults(prev => [...prev, newItem]);
  };

  const handleEditItem = (idx) => {
    setEditingEntryIdx(idx);
    setEditingEntryData({ ...aiParsedResults[idx] });
    setView("editentry");
  };

  const handleRemoveItem = (idx) => {
    setAiParsedResults(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveAll = () => {
    if (aiParsedResults.length === 0) return;
    const entries = aiParsedResults.map(item => ({
      id: uid(),
      resumen: `${item.resumen} (${item.peso})`,
      kcal: item.kcal,
      proteina: item.proteina,
      carbo: item.carbo,
      grasa: item.grasa,
      t: Date.now()
    }));
    const next = [...entries, ...log];
    setLog(next);
    saveState({ log: next });
    setAiParsedResults([]);
    setAddFoodInputText("");
    setView("hoy");
  };

  // Calculations for total impact card
  const totalImpact = aiParsedResults.reduce((acc, item) => {
    acc.kcal += item.kcal || 0;
    acc.p += item.proteina || 0;
    acc.c += item.carbo || 0;
    acc.f += item.grasa || 0;
    return acc;
  }, { kcal: 0, p: 0, c: 0, f: 0 });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: "var(--bg-color)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 8px", borderBottom: "1px solid var(--line-color)" }}>
        <button onClick={() => setView("hoy")} className="btn-active-scale" style={{ background: "none", border: "none", cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-ink)" }}>
          &larr;
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-ink)" }}>Añadir comida</span>
        <div style={{ width: 44 }}/>
      </div>

      {/* Content */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-ink)" }}>¿Qué has comido?</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: -8 }}>Escribe los alimentos y cantidades de forma natural.</div>

        <div style={{ position: "relative" }}>
          <textarea
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={() => setAddFoodInputText(localText)}
            placeholder="Ej: Dos huevos revueltos con una tostada de aguacate y café con leche..."
            rows={4}
            style={{ width: "100%", resize: "none", background: "var(--panel-bg)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: 14, color: "var(--text-ink)", fontSize: 14, outline: "none" }}
          />
          <div style={{ position: "absolute", bottom: 8, right: 8, fontSize: 11, color: "var(--text-muted)", opacity: 0.7 }}>Powered by Bruno AI</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleAnalyze}
            disabled={busy || !localText.trim()}
            className="btn-active-scale"
            style={{
              flex: 1,
              height: 56,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-primary)",
              color: "#0c0e0b",
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              border: "none"
            }}
          >
            {busy ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }}/> : <Sparkles size={16}/>}
            Analizar con IA
          </button>
          <button
            onClick={() => fileRef.current.click()}
            disabled={busy}
            className="btn-active-scale"
            style={{ width: 56, height: 56, borderRadius: "var(--radius-md)", border: "1px solid var(--line-color)", background: "var(--panel-bg)", color: "var(--text-muted)", cursor: "pointer", display: "grid", placeItems: "center" }}
          >
            <Camera size={20}/>
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhotoUpload} style={{ display: "none" }}/>
        </div>
        {err && (
          <div style={{ fontSize: 12, color: "var(--accent-red)", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:8, padding:"10px 12px" }}>
            {err}
            <div style={{ marginTop:8 }}>
              <button onClick={handleAddCustomItem} style={{ background:"rgba(205,255,74,0.1)", border:"1px solid rgba(205,255,74,0.3)", borderRadius:8, padding:"7px 14px", color:"var(--accent-primary)", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                + Añadir manualmente sin IA
              </button>
            </div>
          </div>
        )}

        {/* Resultados IA */}
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-ink)" }}>{aiParsedResults.length > 0 ? "Resultados IA" : "Añadir alimentos"}</span>
            <button onClick={handleAddCustomItem} style={{ background: "none", border: "none", color: "var(--accent-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Añadir manual</button>
          </div>
          {aiParsedResults.length === 0 && !err && (
            <div style={{ textAlign:"center", padding:"20px 0", color:"var(--text-muted)", fontSize:13 }}>
              <div style={{ marginBottom:10 }}>Describe tu comida arriba y toca "Analizar con IA",</div>
              <div style={{ marginBottom:16 }}>o agrega un alimento manualmente:</div>
              <button onClick={handleAddCustomItem} style={{ background:"rgba(205,255,74,0.1)", border:"1px solid rgba(205,255,74,0.3)", borderRadius:10, padding:"10px 20px", color:"var(--accent-primary)", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                + Añadir alimento manualmente
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {aiParsedResults.map((item, idx) => (
              <div key={idx} style={{ padding: 14, border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", background: "var(--bg-color)", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-ink)" }}>{item.resumen}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.peso}</div>
                  </div>
                  <div style={{ background: "#e6fcf5", color: "var(--accent-cyan)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-pill)" }}>
                    &bull; {item.precision}% Precisión
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, background: "var(--panel-bg)", padding: 8, borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>kcal</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-ink)" }}>{item.kcal}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>prot</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-blue)" }}>{item.proteina}g</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>carb</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-amber)" }}>{item.carbo}g</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>gras</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-cyan)" }}>{item.grasa}g</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
                  <button onClick={() => handleEditItem(idx)} className="btn-active-scale" style={{ flex: 1, height: 36, border: "1px solid var(--line-color)", background: "var(--bg-color)", color: "var(--text-ink)", fontSize: 13, fontWeight: 600, borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
                    Editar
                  </button>
                  <button onClick={() => handleRemoveItem(idx)} className="btn-active-scale" style={{ width: 36, height: 36, border: "1px solid var(--line-color)", background: "var(--bg-color)", color: "var(--accent-red)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutritional Impact Card */}
        {aiParsedResults.length > 0 && (
          <div style={{ background: "var(--panel-bg-tint)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--line-color)", marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent-primary)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
              IMPACTO NUTRICIONAL TOTAL
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-primary)", color: "#0c0e0b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                  <Flame size={16}/>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>KCAL</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{totalImpact.kcal}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                  <Beef size={16}/>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>PROT</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{totalImpact.p}g</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-amber)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                  <Wheat size={16}/>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>CARB</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{totalImpact.c}g</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-cyan)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                  <Droplet size={16}/>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>GRAS</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{totalImpact.f}g</div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {aiParsedResults.length > 0 && (
          <button
            onClick={handleSaveAll}
            className="btn-active-scale"
            style={{
              height: 56,
              background: "var(--text-ink)",
              color: "#0c0e0b",
              fontSize: 16,
              fontWeight: 700,
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            Guardar registro
          </button>
        )}
      </div>
    </div>
  );
}

function EditEntry({
  editingEntryIdx,
  editingEntryData,
  setEditingEntryData,
  aiParsedResults,
  setAiParsedResults,
  setView
}) {
  if (!editingEntryData) return null;

  const handleIncrement = (field, amount) => {
    setEditingEntryData(prev => {
      const next = { ...prev, [field]: Math.max(0, (prev[field] || 0) + amount) };
      // Recalculate kcal roughly based on macros if user changes them
      next.kcal = (next.proteina || 0) * 4 + (next.carbo || 0) * 4 + (next.grasa || 0) * 9;
      return next;
    });
  };

  const handleSave = () => {
    setAiParsedResults(prev => prev.map((item, idx) => idx === editingEntryIdx ? editingEntryData : item));
    setView("addfood");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: "var(--bg-color)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 8px", borderBottom: "1px solid var(--line-color)" }}>
        <button onClick={() => setView("addfood")} className="btn-active-scale" style={{ background: "none", border: "none", cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-ink)" }}>
          &larr;
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-ink)" }}>Editar registro</span>
        <div style={{ width: 44 }}/>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Top Card */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid var(--line-color)", padding: 16, borderRadius: "var(--radius-lg)" }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--panel-bg-sec)", display: "flex", alignItems: "center", justifyTarget: "center", justifyContent: "center", overflow: "hidden", color: "var(--accent-primary)" }}>
            <Utensils size={24}/>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-ink)" }}>{editingEntryData.resumen}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Registrado hoy, {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>

        {/* KPI Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: 16, textAlign: "center", background: "var(--panel-bg)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>CANTIDAD</div>
            <input 
              type="text" 
              value={editingEntryData.peso} 
              onChange={e => setEditingEntryData({ ...editingEntryData, peso: e.target.value })}
              style={{ fontSize: 18, fontWeight: 800, width: "100%", textAlign: "center", background: "none", border: "none" }}
            />
          </div>
          <div style={{ border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: 16, textAlign: "center", background: "var(--panel-bg)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>ENERGÍA</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-amber)" }}>{editingEntryData.kcal} kcal</div>
          </div>
        </div>

        {/* Incremental Inputs */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>MACRONUTRIENTES</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-primary)", cursor: "pointer" }}>Ajustar con IA</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Proteínas */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "10px 16px", background: "var(--panel-bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Beef size={12}/></div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-ink)" }}>Proteínas</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => handleIncrement("proteina", -5)} className="btn-active-scale" style={{ width: 44, height: 44, borderRadius: "var(--radius-pill)", border: "1px solid var(--line-color)", background: "var(--bg-color)", fontSize: 20, cursor: "pointer" }}>-</button>
                <span style={{ fontSize: 16, fontWeight: 800, width: 30, textAlign: "center" }}>{editingEntryData.proteina}g</span>
                <button onClick={() => handleIncrement("proteina", 5)} className="btn-active-scale" style={{ width: 44, height: 44, borderRadius: "var(--radius-pill)", border: "1px solid var(--line-color)", background: "var(--bg-color)", fontSize: 20, cursor: "pointer" }}>+</button>
              </div>
            </div>

            {/* Carbohidratos */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "10px 16px", background: "var(--panel-bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-amber)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Wheat size={12}/></div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-ink)" }}>Carbohidratos</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => handleIncrement("carbo", -5)} className="btn-active-scale" style={{ width: 44, height: 44, borderRadius: "var(--radius-pill)", border: "1px solid var(--line-color)", background: "var(--bg-color)", fontSize: 20, cursor: "pointer" }}>-</button>
                <span style={{ fontSize: 16, fontWeight: 800, width: 30, textAlign: "center" }}>{editingEntryData.carbo}g</span>
                <button onClick={() => handleIncrement("carbo", 5)} className="btn-active-scale" style={{ width: 44, height: 44, borderRadius: "var(--radius-pill)", border: "1px solid var(--line-color)", background: "var(--bg-color)", fontSize: 20, cursor: "pointer" }}>+</button>
              </div>
            </div>

            {/* Grasas */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "10px 16px", background: "var(--panel-bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-cyan)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Droplet size={12}/></div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-ink)" }}>Grasas</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => handleIncrement("grasa", -2)} className="btn-active-scale" style={{ width: 44, height: 44, borderRadius: "var(--radius-pill)", border: "1px solid var(--line-color)", background: "var(--bg-color)", fontSize: 20, cursor: "pointer" }}>-</button>
                <span style={{ fontSize: 16, fontWeight: 800, width: 30, textAlign: "center" }}>{editingEntryData.grasa}g</span>
                <button onClick={() => handleIncrement("grasa", 2)} className="btn-active-scale" style={{ width: 44, height: 44, borderRadius: "var(--radius-pill)", border: "1px solid var(--line-color)", background: "var(--bg-color)", fontSize: 20, cursor: "pointer" }}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => setView("addfood")} className="btn-active-scale" style={{ flex: 1, height: 56, border: "1px solid var(--line-color)", background: "var(--bg-color)", color: "var(--text-ink)", fontSize: 15, fontWeight: 600, borderRadius: "var(--radius-md)", cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-active-scale" style={{ flex: 1, height: 56, background: "var(--accent-primary)", color: "#0c0e0b", fontSize: 15, fontWeight: 600, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer" }}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

function Hoy({
  target, totals, log, setLog, loaded, water, setWater, geminiKey, supplements, handleUpdateSupplements,
  activeSplitKey, suppsInventory, setSuppsInventory, selectedDateStr, setSelectedDateStr,
  proactiveMsg, aiNotifications, setAiNotifications, macroAdjustSuggestion, setMacroAdjustSuggestion, saveState, customPresets,
  weeklyInsight, smartGoals, challenges, updateChallengeProgress, upcomingEvent, experiments, setExperiments, splits,
  setView, setShowNutritionModal, setModalVals, addFoodInputText, setAddFoodInputText, customSuggestions
}){
  const [text, setText] = useState(""); 
  const [busy, setBusy] = useState(false); 
  const [err, setErr] = useState("");
  const [newSuppInput, setNewSuppInput] = useState("");
  const [editFoodObj, setEditFoodObj] = useState(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [suggForm, setSuggForm] = useState(null); // null | { idx: "new" | number, data: {...} }
  const suggFileRef = useRef(null);

  // Lee y reduce la foto de la sugerencia a un dataURL liviano (max 400px)
  const readSuggestionImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 400;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const onSuggPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !suggForm) return;
    try {
      const dataUrl = await readSuggestionImage(file);
      // Muestra la foto de inmediato y activa el indicador de análisis IA
      setSuggForm(prev => prev ? { ...prev, data: { ...prev.data, img: dataUrl }, aiPhotoLoading: true } : prev);
      try {
        const b64 = dataUrl.split(",")[1];
        const media = ["image/jpeg","image/png","image/webp"].includes(file.type) ? file.type : "image/jpeg";
        const SUGG_SCHEMA = {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            kcal: { type: "INTEGER" },
            proteina: { type: "INTEGER" },
            carbo: { type: "INTEGER" },
            grasa: { type: "INTEGER" }
          },
          required: ["name","kcal","proteina","carbo","grasa"]
        };
        const out = await callGemini([{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media, data: b64 } },
            { type: "text", text: "Identifica este alimento y estima sus macros para una porción típica." }
          ]
        }], "Eres un nutricionista experto. Analiza la imagen de comida y responde SOLO con JSON {name, kcal, proteina, carbo, grasa}. Usa nombres en español.", SUGG_SCHEMA);
        const parsed = cleanAndParseJSON(out);
        if (parsed && parsed.kcal) {
          setSuggForm(prev => prev ? {
            ...prev,
            aiPhotoLoading: false,
            data: {
              ...prev.data,
              img: dataUrl,
              name: prev.data.name || parsed.name || "",
              kcal: parsed.kcal || prev.data.kcal,
              proteina: parsed.proteina !== undefined ? parsed.proteina : prev.data.proteina,
              carbo: parsed.carbo !== undefined ? parsed.carbo : prev.data.carbo,
              grasa: parsed.grasa !== undefined ? parsed.grasa : prev.data.grasa,
            }
          } : prev);
        } else {
          setSuggForm(prev => prev ? { ...prev, aiPhotoLoading: false } : prev);
        }
      } catch(_aiErr) {
        setSuggForm(prev => prev ? { ...prev, aiPhotoLoading: false } : prev);
      }
    } catch(err) {
      console.error("Error al leer la foto de la sugerencia:", err);
    }
    e.target.value = "";
  };

  const openNewSuggForm = () => {
    setSuggForm({ idx: "new", data: { name: "", kcal: 400, proteina: 30, carbo: 40, grasa: 12, time: "10 min", img: "" } });
  };

  const openEditSuggForm = (idx) => {
    const s = (customSuggestions || [])[idx];
    if (!s) return;
    setSuggForm({ idx, data: { name: s.name || "", kcal: s.kcal || 0, proteina: s.proteina !== undefined ? s.proteina : 20, carbo: s.carbo !== undefined ? s.carbo : 30, grasa: s.grasa !== undefined ? s.grasa : 10, time: s.time || "10 min", img: s.img || "" } });
  };

  const saveSuggForm = () => {
    if (!suggForm || !suggForm.data.name.trim()) return;
    const cleanItem = {
      name: suggForm.data.name.trim(),
      kcal: +suggForm.data.kcal || 0,
      proteina: +suggForm.data.proteina || 0,
      carbo: +suggForm.data.carbo || 0,
      grasa: +suggForm.data.grasa || 0,
      time: suggForm.data.time || "10 min",
      img: suggForm.data.img || ""
    };
    const current = customSuggestions || [];
    const next = suggForm.idx === "new"
      ? [cleanItem, ...current]
      : current.map((s, i) => i === suggForm.idx ? cleanItem : s);
    saveState({ customSuggestions: next });
    setSuggForm(null);
  };

  const deleteSuggestion = (idx) => {
    const next = (customSuggestions || []).filter((_, i) => i !== idx);
    saveState({ customSuggestions: next });
    setSuggForm(null);
  };

  const [localText, setLocalText] = useState(addFoodInputText || "");
  useEffect(() => {
    setLocalText(addFoodInputText || "");
  }, [addFoodInputText]);

  const toggleSupplement = (name) => {
    const checked = !supplements[name];
    const next = { ...supplements, [name]: checked };
    
    // Descontar del inventario de stock si corresponde
    let nextInv = null;
    if (checked && suppsInventory && suppsInventory[name]) {
      nextInv = { ...suppsInventory };
      nextInv[name] = {
        ...nextInv[name],
        servingsLeft: Math.max(0, nextInv[name].servingsLeft - 1)
      };
    }
    handleUpdateSupplements(next, nextInv);
  };
  
  const addCustomSupplement = () => {
    if (!newSuppInput.trim() || supplements[newSuppInput.trim()] !== undefined) return;
    const next = { ...supplements, [newSuppInput.trim()]: false };
    handleUpdateSupplements(next, null);
    setNewSuppInput("");
  };

  const deleteSupplement = (name) => {
    const next = { ...supplements };
    delete next[name];
    handleUpdateSupplements(next, null);
  };
  const fileRef = useRef();
  
  const [aiBusy, setAiBusy] = useState(""); 
  const [aiTitle, setAiTitle] = useState(""); 
  const [aiText, setAiText] = useState(""); 
  const [showMoments, setShowMoments] = useState(false);

  useEffect(() => {
    (async () => {
      const savedTitle = await loadKey("last_ai_title", "");
      const savedText = await loadKey("last_ai_text", "");
      if (savedTitle) setAiTitle(savedTitle);
      if (savedText) setAiText(savedText);
    })();
  }, []);

  const waterGoal = 14; // Default to 14 glasses (3.5L)
  const liters = (water * 0.25).toFixed(2);
  const rem = {
    kcal: Math.max(0, target.kcal - totals.kcal),
    p: Math.max(0, target.p - totals.p),
    c: Math.max(0, target.c - totals.c),
    f: Math.max(0, target.f - totals.f)
  };
  const totalGrams = (totals.p + totals.c + totals.f) || 1;
  const pPct = ((totals.p / totalGrams) * 100).toFixed(1);
  const cPct = ((totals.c / totalGrams) * 100).toFixed(1);
  const fPct = ((totals.f / totalGrams) * 100).toFixed(1);

  const getLocalDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatSelectedDate = (dStr) => {
    try {
      const parts = dStr.split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("es", { weekday: 'long', day: 'numeric', month: 'long' });
    } catch(e) {
      return dStr;
    }
  };

  const handlePrevDay = () => {
    try {
      const parts = selectedDateStr.split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() - 1);
      setSelectedDateStr(getLocalDateStr(d));
    } catch(e) {}
  };

  const handleNextDay = () => {
    try {
      const parts = selectedDateStr.split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() + 1);
      setSelectedDateStr(getLocalDateStr(d));
    } catch(e) {}
  };

  const FOOD_SYS = "Eres un nutricionista experto. Estima los macros de la comida detallada por el usuario (puede ser texto o imagen).\n" +
                    "REGLAS CRÍTICAS DE ESTIMACIÓN:\n" +
                    "1. DEBES basar tus estimaciones de calorías y macronutrientes estrictamente en datos de bases de datos nutricionales oficiales y verificadas (como USDA FoodData Central o tablas de composición de alimentos regionales de Latinoamérica/Chile). No inventes ni alucines valores; asegúrate de que sean coherentes con estas referencias científicas.\n" +
                    "2. Si el usuario no especifica pesos o cantidades exactas (ej. 'un tuto de pollo y arroz', 'un plato de tallarines', 'un plátano', 'un café con leche'), DEBES asumir porciones genéricas estándar y realistas según las bases de datos nutricionales (por ejemplo: un muslo/tuto de pollo mediano = 100g de carne limpia cocida, un plato de arroz = 150g cocido, un plato de pasta = 180g cocido, un plátano mediano = 100g, etc.) para realizar los cálculos. NUNCA dejes campos vacíos ni falles por falta de información.\n" +
                    "3. Interpreta regionalismos chilenos y latinoamericanos comunes (ej. 'tuto de pollo' = muslo/pierna de pollo; 'palta' = aguacate; 'porotos' = frijoles; 'zapallo' = calabaza; 'camote' = boniato; 'lomo liso' = corte de carne de res magra; etc.).\n" +
                    "Responde ÚNICAMENTE con el formato JSON y nada más. Ejemplo de esquema requerido:\n" +
                    "{\n" +
                    "  \"resumen\": \"Pollo con arroz y palta\",\n" +
                    "  \"kcal\": 550,\n" +
                    "  \"proteina\": 45,\n" +
                    "  \"carbo\": 50,\n" +
                    "  \"grasa\": 15\n" +
                    "}";

  const FOOD_SCHEMA = {
    type: "OBJECT",
    properties: {
      resumen: { type: "STRING" },
      kcal: { type: "INTEGER" },
      proteina: { type: "INTEGER" },
      carbo: { type: "INTEGER" },
      grasa: { type: "INTEGER" }
    },
    required: ["resumen", "kcal", "proteina", "carbo", "grasa"]
  };

  const pushEntry = (o, fb) => { 
    const e = {
      id: uid(),
      resumen: o.resumen || fb,
      kcal: +o.kcal || 0,
      proteina: +o.proteina || 0,
      carbo: +o.carbo || 0,
      grasa: +o.grasa || 0,
      t: Date.now()
    }; 
    const next = [e, ...log]; 
    setLog(next); 
  };

  const addFood = async() => { 
    if(!text.trim() || busy) return; 
    setBusy(true); 
    setErr(""); 
    const d = text.trim();
    try{ 
      const out = await callGemini([{role:"user", content:d}], FOOD_SYS, FOOD_SCHEMA); 
      pushEntry(cleanAndParseJSON(out), d); 
      setText(""); 
    } catch(e){ 
      setErr("No pude estimar eso. Agrega cantidades (ej: '200g carne, 150g boniato')."); 
    } 
    setBusy(false); 
  };

  const onPhoto = async(e) => { 
    const file = e.target.files && e.target.files[0]; 
    if(!file) return; 
    setBusy(true); 
    setErr("");
    try{ 
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const media = ["image/jpeg","image/png","image/webp"].includes(file.type) ? file.type : "image/jpeg";
      const out = await callGemini([
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media, data: b64 } },
            { type: "text", text: "Analiza esta comida y estima los macros nutricionales." }
          ]
        }
      ], FOOD_SYS, FOOD_SCHEMA);
      pushEntry(cleanAndParseJSON(out), "Comida (Foto)"); 
    } catch(err){ 
      setErr("Error leyendo la foto. Asegura buena iluminación o digita el texto."); 
    } 
    setBusy(false); 
    e.target.value = ""; 
  };

  const del = (id) => { 
    const next = log.filter(e => e.id !== id); 
    setLog(next); 
  };

  const run = async(title, sys, user) => { 
    setShowMoments(false); 
    setAiBusy(title); 
    setAiTitle(title); 
    setAiText("");
    try{ 
      const out = await callGemini([{ role: "user", content: user }], sys);
      const txt = out || "Sin sugerencias por el momento.";
      setAiText(txt); 
      saveKey("last_ai_title", title);
      saveKey("last_ai_text", txt);
    }catch(e){ 
      setAiText(aiErr(e)); 
    } 
    setAiBusy(""); 
  };

  const suggestDinner = () => {
    const activeSplit = (splits || DEFAULT_SPLITS).find(s => s.key === activeSplitKey) || (splits || DEFAULT_SPLITS)[0] || DEFAULT_SPLITS[0];
    const sys = `Eres el coach nutricional de Bruno. Plan: ${target.kcal} kcal (${target.label}), ${target.p}P/${target.c}C/${target.f}G. Split activo de hoy: Día ${activeSplit.key} (${activeSplit.name}), combustible de carbohidratos asignado: ${activeSplit.fuel}. Directo, breve, formato legible sin preámbulos.`;
    const user = `Hoy le quedan a Bruno: ${rem.kcal} kcal, ${rem.p} g proteína, ${rem.c} g carbo, ${rem.f} g grasa.
    Propón 2 opciones de cena rápida que cierren estos macros.
    REGLA CRÍTICA DE PORCIONES: Las porciones recomendadas (arroz, papas, pan, pollo, carne, claras, etc.) deben estar ajustadas con precisión matemática para adaptarse al modo nutricional activo (${target.label}) y al combustible del split de hoy (${activeSplit.fuel}). Detalla cantidades exactas en gramos/porciones.`;
    run("Cena Sugerida", sys, user);
  };

  const whatNow = (m) => {
    const activeSplit = (splits || DEFAULT_SPLITS).find(s => s.key === activeSplitKey) || (splits || DEFAULT_SPLITS)[0] || DEFAULT_SPLITS[0];
    const sys = `Eres el coach de nutrición de Bruno. Plan nutricional activo: ${target.kcal} kcal (${target.label}), ${target.p}P/${target.c}C/${target.f}G. Split activo de hoy: Día ${activeSplit.key} (${activeSplit.name}), combustible: ${activeSplit.fuel}. Directo y rápido.`;
    const user = `Bruno necesita una opción de comida rápida para el momento: ${m}. Le quedan ${rem.kcal} kcal, ${rem.p} g prot, ${rem.c} g carb y ${rem.f} g grasa.
    Da 1 o 2 opciones concretas detallando porciones y gramos exactos.
    REGLA DE AJUSTE DE PORCIONES: Las porciones recomendadas deben cambiar drásticamente según el modo nutricional seleccionado (${target.label}) y el nivel de carbohidratos del entrenamiento de hoy (${activeSplit.fuel}). Detalla cantidades exactas en gramos.`;
    run("¿Qué como ahora?", sys, user);
  };

  const daySummary = () => { 
    const det = log.map(e => `${e.resumen} (${Math.round(e.kcal)}kcal P${Math.round(e.proteina)})`).join("; ") || "nada registrado"; 
    const sys = `Eres el coach nutricional de Bruno. Dashboard diario. Resumen directo, honesto y constructivo.`;
    const user = `El ${formatSelectedDate(selectedDateStr)}, Bruno consumió: ${det}. Totales: ${Math.round(totals.kcal)} kcal, P:${Math.round(totals.p)}g C:${Math.round(totals.c)}g G:${Math.round(totals.f)}g. Brinda un análisis corto de adherencia a los objetivos y consejo rápido de timings.`;
    run("Resumen del Día", sys, user); 
  };

  const chip = (a) => ({
    padding:"9px 8px",
    borderRadius:10,
    fontSize:12,
    fontWeight:700,
    cursor:"pointer",
    border:`1px solid ${a ? C.lime : C.line}`,
    background: a ? "rgba(107,78,255,.12)" : C.panel,
    color: a ? C.lime : C.ink,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    gap:6,
    flex:1
  });

  const SUGGESTIONS = [
    {name:"Bowl de Avena y Frutos", kcal:350, time:"10 min", img:"https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&q=75&fit=crop"},
    {name:"Pollo al Curry con Arroz", kcal:520, time:"25 min", img:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=75&fit=crop"},
    {name:"Ensalada César Proteica", kcal:380, time:"15 min", img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=75&fit=crop"},
    {name:"Salmón con Espárragos", kcal:410, time:"20 min", img:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=75&fit=crop"},
  ];

  return (
    <div className="pop" style={{ display: "flex", flexDirection: "column", padding: "0 16px 16px" }}>
      {/* Selector de fecha — pill gris con flechas 44x44 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--panel-bg-sec)",
        borderRadius: "var(--radius-pill)",
        padding: "4px 8px",
        marginBottom: 20
      }}>
        <button 
          onClick={handlePrevDay} 
          className="btn-active-scale"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "none",
            border: "none",
            color: "var(--text-ink)",
            cursor: "pointer",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none"
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-ink)", letterSpacing: "0.01em" }}>
          {selectedDateStr === getLocalDateStr(new Date()) ? "Hoy, " : ""}{formatSelectedDate(selectedDateStr)}
        </span>
        <button 
          onClick={handleNextDay} 
          className="btn-active-scale"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "none",
            border: "none",
            color: "var(--text-ink)",
            cursor: "pointer",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none"
          }}
        >
          ›
        </button>
      </div>

      {upcomingEvent && upcomingEvent.date && (() => {
        const days = Math.ceil((new Date(upcomingEvent.date) - new Date()) / 86400000);
        if (days < 0) return null;
        return (
          <div style={{
            background: `linear-gradient(135deg, ${C.rose}11, ${C.rose}22)`,
            border: `1.5px solid ${C.rose}`,
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "pop 0.3s ease"
          }}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <span style={{fontSize:20}}>⏳</span>
              <div>
                <div style={{fontSize:13.5, fontWeight:800, color:C.ink}}>{upcomingEvent.name}</div>
                <div style={{fontSize:11, color:C.muted}}>Planificación activa hacia el evento</div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20, fontWeight:900, color:C.rose}}>{days}</div>
              <div style={{fontSize:9.5, color:C.muted, textTransform:"uppercase", fontWeight:700}}>días rest.</div>
            </div>
          </div>
        );
      })()}

      {proactiveMsg && (
        <div 
          onClick={() => setView("addfood")}
          className="btn-active-scale"
          style={{
            background: "var(--panel-bg-tint)",
            border: "1px solid var(--line-color)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            animation: "pop 0.3s ease",
            boxShadow: "var(--shadow-card)"
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(92, 79, 223, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--accent-primary)"
          }}>
            <Sparkles size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>
              PRIORIDAD IA
            </div>
            <div style={{ fontSize: 13, color: "var(--text-ink)", lineHeight: 1.45 }}>
              {proactiveMsg.text}
            </div>
          </div>
          <div style={{ color: "var(--accent-primary)", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>&rarr;</div>
        </div>
      )}

      {macroAdjustSuggestion && (
        <div style={{
          background: `linear-gradient(135deg, ${C.cyan}11, ${C.cyan}22)`,
          border: `1.5px solid ${C.cyan}`,
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          animation: "pop 0.3s ease"
        }}>
          <div style={{display:"flex", alignItems:"flex-start", gap:10}}>
            <span style={{fontSize:20}}>🔄</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11, fontWeight:800, color:C.cyan, textTransform:"uppercase", letterSpacing:".05em", marginBottom:2}}>Ajuste de Calorías Recomendado</div>
              <div style={{fontSize:13, color:C.ink, lineHeight:1.45}}>{macroAdjustSuggestion.message}</div>
            </div>
          </div>
          <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
            <button 
              onClick={() => {
                const nextKcal = target.kcal + macroAdjustSuggestion.adjustment;
                const newPresets = {
                  ...customPresets,
                  personalizado: {
                    ...customPresets.personalizado,
                    kcal: nextKcal,
                    p: Math.round(nextKcal * 0.35 / 4),
                    c: Math.round(nextKcal * 0.40 / 4),
                    f: Math.round(nextKcal * 0.25 / 9)
                  }
                };
                saveState({ customPresets: newPresets, presetKey: "personalizado" });
                setMacroAdjustSuggestion(null);
              }}
              style={{
                padding:"6px 12px",
                background:C.cyan,
                color:"#04212b",
                fontWeight:800,
                fontSize:11.5,
                borderRadius:8,
                border:"none",
                cursor:"pointer"
              }}
            >
              Aplicar {macroAdjustSuggestion.adjustment > 0 ? "+" : ""}{macroAdjustSuggestion.adjustment} kcal
            </button>
            <button 
              onClick={() => setMacroAdjustSuggestion(null)}
              style={{
                padding:"6px 12px",
                background:"transparent",
                border:`1px solid ${C.line}`,
                color:C.muted,
                fontWeight:700,
                fontSize:11.5,
                borderRadius:8,
                cursor:"pointer"
              }}
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {aiNotifications && aiNotifications.length > 0 && (
        <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:12}}>
          {aiNotifications.map(n => (
            <div key={n.id} style={{
              background: C.panel,
              border: `1px solid ${n.type === "warning" ? C.rose : n.type === "success" ? C.lime : C.line}`,
              borderLeft: `4px solid ${n.type === "warning" ? C.rose : n.type === "success" ? C.lime : C.cyan}`,
              borderRadius: 12,
              padding: "10px 14px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              position: "relative",
              animation: "pop 0.2s ease"
            }}>
              <span style={{fontSize:16}}>{n.icon || "🔔"}</span>
              <div style={{flex:1, paddingRight:20}}>
                <div style={{fontSize:12, fontWeight:800, color: n.type === "warning" ? C.rose : n.type === "success" ? C.lime : C.cyan}}>{n.title}</div>
                <div style={{fontSize:12.5, color:C.ink, marginTop:2, lineHeight:1.4}}>{n.message}</div>
              </div>
              <button 
                onClick={() => setAiNotifications(prev => prev.filter(x => x.id !== n.id))}
                style={{
                  position:"absolute",
                  right:8,
                  top:8,
                  background:"none",
                  border:"none",
                  color:C.muted,
                  cursor:"pointer",
                  fontSize:14,
                  display:"grid",
                  placeItems:"center"
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {weeklyInsight && (
        <div style={{
          background: C.panel,
          border: `1.5px solid ${C.line}`,
          borderLeft: `4px solid ${C.cyan}`,
          borderRadius: 14,
          padding: "13px 15px",
          marginBottom: 12,
          animation: "pop 0.3s ease"
        }}>
          <div style={{fontSize:11, fontWeight:800, color:C.cyan, textTransform:"uppercase", letterSpacing:".05em", display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
            <span>📊 Insight de la Semana</span>
          </div>
          <div style={{fontSize:13.5, color:C.ink, lineHeight:1.5}}>{weeklyInsight.text}</div>
        </div>
      )}

      {smartGoals && smartGoals.length > 0 && (
        <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"13px 15px", marginBottom:12}}>
          <div style={{fontSize:11.5, fontWeight:800, color:C.lime, textTransform:"uppercase", letterSpacing:".05em", display:"flex", alignItems:"center", gap:6, marginBottom:10}}>
            <span>🏆 Objetivos de Fuerza Inteligentes</span>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {smartGoals.map(g => (
              <div key={g.id} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10}}>
                <div style={{display:"flex", justifyContent:"space-between", fontSize:12.5, fontWeight:700, color:C.ink, marginBottom:4}}>
                  <span>{g.exercise}</span>
                  <span style={{color:C.lime}}>{g.targetPR} kg</span>
                </div>
                <div style={{fontSize:11, color:C.muted, marginBottom:6}}>Meta: superar PR de {g.currentPR}kg antes de {fdate(g.deadline)}</div>
                <div style={{height:6, background:C.bg, borderRadius:3, overflow:"hidden"}}>
                  <div style={{height:"100%", width:"80%", background:C.lime, borderRadius:3}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {challenges && challenges.length > 0 && (
        <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"13px 15px", marginBottom:12}}>
          <div style={{fontSize:11.5, fontWeight:800, color:C.cyan, textTransform:"uppercase", letterSpacing:".05em", display:"flex", alignItems:"center", gap:6, marginBottom:10}}>
            <span>🎮 Desafíos Gamificados Semanales</span>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            {challenges.map(c => {
              const pct = Math.min(100, (c.progress / c.target) * 100);
              return (
                <div key={c.id} style={{
                  background:C.panel2, 
                  border:`1px solid ${c.completed ? C.lime : C.line}`, 
                  borderRadius:10, 
                  padding:10,
                  opacity: c.completed ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}>
                  <span style={{fontSize:18}}>{c.icon || "🎯"}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex", justifyContent:"space-between", fontSize:12.5, fontWeight:700, color: c.completed ? C.lime : C.ink}}>
                      <span>{c.title}</span>
                      <span>{c.progress} / {c.target}</span>
                    </div>
                    <div style={{fontSize:11, color:C.muted, marginBottom:6}}>{c.desc}</div>
                    <div style={{height:5, background:C.bg, borderRadius:2.5, overflow:"hidden"}}>
                      <div style={{height:"100%", width:`${pct}%`, background: c.completed ? C.lime : C.cyan, borderRadius:2.5}}/>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const nextProg = c.completed ? 0 : c.target;
                      updateChallengeProgress(c.id, nextProg, !c.completed);
                    }}
                    style={{
                      background:"none",
                      border:"none",
                      cursor:"pointer",
                      padding:4,
                      color: c.completed ? C.lime : C.muted
                    }}
                  >
                    {c.completed ? "☑" : "☐"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {experiments && experiments.length > 0 && experiments.filter(e => e.status === "active").map(e => (
        <div key={e.id} style={{
          background: C.panel,
          border: `1.5px solid ${C.amber}`,
          borderRadius: 16,
          padding: "13px 15px",
          marginBottom: 12,
          animation: "pop 0.3s ease"
        }}>
          <div style={{fontSize:11, fontWeight:800, color:C.amber, textTransform:"uppercase", letterSpacing:".05em", display:"flex", alignItems:"center", gap:6, marginBottom:6}}>
            <span>🧪 Experimento A/B Activo</span>
          </div>
          <div style={{fontSize:14, fontWeight:700, color:C.ink, marginBottom:4}}>{e.title}</div>
          <div style={{fontSize:12.5, color:C.muted, lineHeight:1.45, marginBottom:8}}>{e.desc}</div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, borderTop:`1px solid ${C.line}`, paddingTop:6}}>
            <span style={{color:C.muted}}>Variable: <b style={{color:C.ink}}>{e.variable}</b></span>
            <button 
              onClick={() => {
                const updated = experiments.map(x => x.id === e.id ? { ...x, status: "completed", results: "Estancamiento roto con éxito" } : x);
                setExperiments(updated);
              }}
              style={{
                background:"rgba(255,177,61,.12)",
                border:`1px solid ${C.amber}`,
                color:C.amber,
                fontSize:10.5,
                fontWeight:800,
                padding:"4px 8px",
                borderRadius:6,
                cursor:"pointer"
              }}
            >
              Completar
            </button>
          </div>
        </div>
      ))}

      {/* Header sección nutrición */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14}}>
        <span style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".1em"}}>Resumen de Nutrición</span>
        <span 
          onClick={() => setView("plan")}
          style={{fontSize:12, fontWeight:700, color:"var(--accent-primary)", cursor:"pointer"}}
        >
          Ver objetivos
        </span>
      </div>

      {/* Tarjetas de macros */}
      <Bar 
        icon={Flame} 
        label="Calorías" 
        val={totals.kcal} 
        max={target.kcal} 
        unit="kcal" 
        color="var(--accent-primary)"
        onSettingsClick={() => {
          setModalVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
          setShowNutritionModal(true);
        }}
      />
      <Bar 
        icon={Beef} 
        label="Proteína" 
        val={totals.p} 
        max={target.p} 
        unit="g" 
        color="var(--accent-blue)"
        onSettingsClick={() => {
          setModalVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
          setShowNutritionModal(true);
        }}
      />
      <Bar 
        icon={Wheat} 
        label="Carbohidratos" 
        val={totals.c} 
        max={target.c} 
        unit="g" 
        color="var(--accent-amber)"
        onSettingsClick={() => {
          setModalVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
          setShowNutritionModal(true);
        }}
      />
      <Bar 
        icon={Droplet} 
        label="Grasas" 
        val={totals.f} 
        max={target.f} 
        unit="g" 
        color="var(--accent-cyan)"
        onSettingsClick={() => {
          setModalVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
          setShowNutritionModal(true);
        }}
      />

      {/* Proporción de macros consumidos */}
      {totals.p + totals.c + totals.f > 0 && (
        <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"13px 15px", marginBottom:12}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
            <span style={{fontSize:13, fontWeight:700}}>Distribución de Macros Consumidos</span>
            <span style={{fontSize:11, color:C.muted}}>Total: {Math.round(totals.p + totals.c + totals.f)}g</span>
          </div>
          <div style={{height:10, background:C.panel2, borderRadius:6, overflow:"hidden", display:"flex"}}>
            <div style={{width:pPct+"%", background:C.cyan, height:"100%"}} title={`Proteína: ${pPct}%`}/>
            <div style={{width:cPct+"%", background:C.lime, height:"100%"}} title={`Carbohidratos: ${cPct}%`}/>
            <div style={{width:fPct+"%", background:C.amber, height:"100%"}} title={`Grasas: ${fPct}%`}/>
          </div>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:11, marginTop:6}}>
            <span style={{color:C.cyan, fontWeight:600}}>P: {pPct}% ({Math.round(totals.p)}g)</span>
            <span style={{color:C.lime, fontWeight:600}}>C: {cPct}% ({Math.round(totals.c)}g)</span>
            <span style={{color:C.amber, fontWeight:600}}>G: {fPct}% ({Math.round(totals.f)}g)</span>
          </div>
        </div>
      )}

      {/* Registro de comida — nuevo diseño */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:16, fontWeight:800, marginBottom:12, display:"flex", alignItems:"center", gap:8, color:C.ink}}>
          <Sparkles size={18} color="var(--accent-primary)"/>Registrar comida
        </div>
        <textarea
          value={localText}
          onChange={e => setLocalText(e.target.value)}
          onBlur={() => setAddFoodInputText(localText)}
          className="ph"
          rows={3}
          placeholder="Describe lo que comiste (ej: Ensalada César con pollo a la parrilla y agua)..."
          style={{width:"100%", resize:"none", background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"14px", color:C.ink, fontSize:13.5, outline:"none", boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}
        />
        <div style={{display:"flex", gap:10, marginTop:10}}>
          <button
            onClick={() => {
              setAddFoodInputText(localText);
              setView("addfood");
            }}
            className="btn-active-scale"
            style={{
              flex:1,
              height:56,
              borderRadius:14,
              border:"none",
              cursor:"pointer",
              background: "var(--accent-primary)",
              color: "#0c0e0b",
              fontWeight:800,
              fontSize:14,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              gap:8,
              boxShadow: "0 4px 14px rgba(92, 79, 223, 0.2)"
            }}
          >
            <Sparkles size={15}/>Añadir con IA
          </button>
          <button
            onClick={() => {
              setAddFoodInputText(localText);
              setView("addfood");
            }}
            className="btn-active-scale"
            style={{width:54, height:56, borderRadius:14, border:`1px solid ${C.line}`, background:C.panel, color:C.muted, cursor:"pointer", display:"grid", placeItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}
          >
            <Camera size={20}/>
          </button>
        </div>
        {err && <div style={{color:C.rose, fontSize:12, marginTop:8}}>{err}</div>}
      </div>

      {/* Sugerencias para ti */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
          <span style={{fontSize:13, fontWeight:800, color:C.ink}}>Sugerencias para ti</span>
          <span 
            onClick={() => setShowAllSuggestions(true)}
            style={{fontSize:11, fontWeight:700, color:"var(--accent-primary)", cursor:"pointer"}}
          >
            Ver todas
          </span>
        </div>
        <div style={{
          display: "flex", 
          gap: 16, 
          overflowX: "auto", 
          scrollSnapType: "x mandatory", 
          paddingBottom: 8,
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}>
          {[...(customSuggestions || []).map(s => ({...s, _custom:true})), ...SUGGESTIONS].map((s,i) => {
            const suggestionImg = s.img || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&q=75&fit=crop";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: 160,
                  flexShrink: 0,
                  background: C.panel,
                  border: `1px solid ${s._custom ? C.lime+"55" : C.line}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "var(--shadow-card)",
                  scrollSnapAlign: "start"
                }}
              >
                <div style={{ width: "100%", height: 100, position: "relative", overflow: "hidden" }}>
                  <img src={suggestionImg} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  {s._custom && (
                    <div style={{position:"absolute", top:8, left:8, background:C.lime, color:"#0c0e0b", fontSize:9, fontWeight:900, padding:"2px 6px", borderRadius:99, letterSpacing:".06em"}}>
                      TUYA
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(255,255,255,0.9)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "var(--text-ink)"
                  }}>
                    {s.kcal} kcal
                  </div>
                </div>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, flex: 1, justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-ink)", lineHeight: 1.3, height: 34, overflow: "hidden" }}>{s.name}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--text-muted)" }}>
                      <Clock size={12}/>{s.time || "10 min"}
                    </span>
                    <button 
                      onClick={() => {
                        pushEntry({ 
                          resumen: s.name, 
                          kcal: s.kcal, 
                          proteina: s.proteina !== undefined ? s.proteina : 20, 
                          carbo: s.carbo !== undefined ? s.carbo : 30, 
                          grasa: s.grasa !== undefined ? s.grasa : 10 
                        }, s.name);
                      }}
                      className="btn-active-scale"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--panel-bg-tint)",
                        color: "var(--accent-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        border: "none"
                      }}
                    >
                      <Plus size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Todas las sugerencias (ver, crear, editar) */}
      {showAllSuggestions && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, bottom:0,
          background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:9999
        }} onClick={() => { setShowAllSuggestions(false); setSuggForm(null); }}>
          <div className="pop" style={{
            background:C.bg, border:`1px solid ${C.line}`, borderRadius:"20px 20px 0 0",
            width:"100%", maxWidth:410, maxHeight:"85dvh", overflowY:"auto",
            padding:"18px 16px 24px", display:"flex", flexDirection:"column", gap:12
          }} onClick={e => e.stopPropagation()}>

            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span style={{fontSize:16, fontWeight:900, color:C.ink}}>
                {suggForm ? (suggForm.idx === "new" ? "Nueva Sugerencia" : "Editar Sugerencia") : "Mis Sugerencias"}
              </span>
              <button
                onClick={() => suggForm ? setSuggForm(null) : setShowAllSuggestions(false)}
                style={{background:"none", border:"none", color:C.muted, cursor:"pointer", padding:6}}
              >
                <X size={20}/>
              </button>
            </div>

            {suggForm ? (
              <div style={{display:"flex", flexDirection:"column", gap:12}}>
                {/* Foto */}
                <div
                  onClick={() => suggFileRef.current && suggFileRef.current.click()}
                  style={{
                    width:"100%", height:140, borderRadius:14, overflow:"hidden", cursor:"pointer",
                    border:`1px dashed ${suggForm.data.img ? C.line : C.lime}`,
                    background:C.panel2, display:"flex", alignItems:"center", justifyContent:"center", position:"relative"
                  }}
                >
                  {suggForm.data.img ? (
                    <img src={suggForm.data.img} alt="Foto sugerencia" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                  ) : (
                    <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:6, color:C.muted, fontSize:12}}>
                      <Camera size={22} color={C.lime}/>
                      Toca para subir una foto
                    </div>
                  )}
                  {/* Overlay de análisis IA */}
                  {suggForm.aiPhotoLoading && (
                    <div style={{position:"absolute", inset:0, background:"rgba(12,14,11,0.72)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, borderRadius:14}}>
                      <Loader2 size={22} style={{animation:"spin 1s linear infinite", color:C.lime}}/>
                      <span style={{fontSize:11, color:C.ink, fontWeight:700}}>Analizando macros...</span>
                    </div>
                  )}
                  {suggForm.data.img && !suggForm.aiPhotoLoading && (
                    <div style={{position:"absolute", bottom:8, right:8, background:"rgba(0,0,0,0.65)", color:C.ink, fontSize:10.5, fontWeight:700, padding:"4px 10px", borderRadius:99, display:"flex", alignItems:"center", gap:4}}>
                      <Camera size={11}/> Cambiar foto
                    </div>
                  )}
                </div>
                <input ref={suggFileRef} type="file" accept="image/*" onChange={onSuggPhoto} style={{display:"none"}}/>

                <div>
                  <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>Nombre</label>
                  <input
                    type="text"
                    value={suggForm.data.name}
                    onChange={e => setSuggForm(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                    placeholder="Ej: Bowl de pollo y quinoa"
                    style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none"}}
                  />
                </div>

                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                  <div>
                    <label style={{fontSize:11, color:C.lime, fontWeight:700, display:"block", marginBottom:4}}>Calorías (kcal)</label>
                    <input
                      type="number" inputMode="numeric"
                      value={suggForm.data.kcal}
                      onChange={e => setSuggForm(prev => ({ ...prev, data: { ...prev.data, kcal: e.target.value } }))}
                      style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center"}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>Tiempo</label>
                    <input
                      type="text"
                      value={suggForm.data.time}
                      onChange={e => setSuggForm(prev => ({ ...prev, data: { ...prev.data, time: e.target.value } }))}
                      placeholder="10 min"
                      style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center"}}
                    />
                  </div>
                </div>

                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8}}>
                  <div>
                    <label style={{fontSize:11, color:C.cyan, fontWeight:700, display:"block", marginBottom:4}}>Proteína (g)</label>
                    <input
                      type="number" inputMode="numeric"
                      value={suggForm.data.proteina}
                      onChange={e => setSuggForm(prev => ({ ...prev, data: { ...prev.data, proteina: e.target.value } }))}
                      style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 8px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center"}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize:11, color:C.amber, fontWeight:700, display:"block", marginBottom:4}}>Carbos (g)</label>
                    <input
                      type="number" inputMode="numeric"
                      value={suggForm.data.carbo}
                      onChange={e => setSuggForm(prev => ({ ...prev, data: { ...prev.data, carbo: e.target.value } }))}
                      style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 8px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center"}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize:11, color:C.rose, fontWeight:700, display:"block", marginBottom:4}}>Grasas (g)</label>
                    <input
                      type="number" inputMode="numeric"
                      value={suggForm.data.grasa}
                      onChange={e => setSuggForm(prev => ({ ...prev, data: { ...prev.data, grasa: e.target.value } }))}
                      style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 8px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center"}}
                    />
                  </div>
                </div>

                <div style={{display:"flex", gap:8, marginTop:4}}>
                  {suggForm.idx !== "new" && (
                    <button
                      onClick={() => deleteSuggestion(suggForm.idx)}
                      style={{padding:"12px 14px", background:"rgba(255,107,138,0.12)", color:C.rose, border:`1px solid ${C.rose}44`, borderRadius:12, fontSize:13, fontWeight:800, cursor:"pointer"}}
                    >
                      <Trash2 size={15}/>
                    </button>
                  )}
                  <button
                    onClick={() => setSuggForm(null)}
                    style={{flex:1, padding:"12px", background:"none", border:`1px solid ${C.line}`, color:C.muted, borderRadius:12, fontSize:13, fontWeight:800, cursor:"pointer"}}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveSuggForm}
                    disabled={!suggForm.data.name.trim()}
                    style={{flex:1, padding:"12px", background: suggForm.data.name.trim() ? C.lime : C.panel2, color: suggForm.data.name.trim() ? "#0c0e0b" : C.muted, border:"none", borderRadius:12, fontSize:13, fontWeight:800, cursor:"pointer"}}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={openNewSuggForm}
                  className="btn-active-scale"
                  style={{
                    width:"100%", padding:"13px", borderRadius:14, border:`1px dashed ${C.lime}`,
                    background:"rgba(205,255,74,0.06)", color:C.lime, fontWeight:800, fontSize:13.5,
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8
                  }}
                >
                  <Plus size={16}/> Crear nueva sugerencia
                </button>

                {(customSuggestions || []).length > 0 && (
                  <div style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".08em", marginTop:4}}>
                    Creadas por ti ({(customSuggestions || []).length})
                  </div>
                )}
                {(customSuggestions || []).map((s, idx) => (
                  <div key={"c"+idx} style={{display:"flex", gap:10, alignItems:"center", background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:10}}>
                    <div style={{width:54, height:54, borderRadius:10, overflow:"hidden", flexShrink:0, background:C.panel2, display:"flex", alignItems:"center", justifyContent:"center"}}>
                      {s.img
                        ? <img src={s.img} alt={s.name} style={{width:"100%", height:"100%", objectFit:"cover"}} loading="lazy"/>
                        : <Utensils size={20} color={C.muted}/>}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:700, color:C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{s.name}</div>
                      <div style={{fontSize:11, color:C.muted, marginTop:2, display:"flex", gap:8, flexWrap:"wrap"}}>
                        <span style={{color:C.lime, fontWeight:700}}>{s.kcal} kcal</span>
                        <span style={{color:C.cyan}}>P {s.proteina !== undefined ? s.proteina : 20}g</span>
                        <span>C {s.carbo !== undefined ? s.carbo : 30}g</span>
                        <span style={{color:C.amber}}>G {s.grasa !== undefined ? s.grasa : 10}g</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openEditSuggForm(idx)}
                      className="btn-active-scale"
                      title="Editar sugerencia"
                      style={{width:34, height:34, borderRadius:9, border:`1px solid ${C.line}`, background:C.panel2, color:C.muted, cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0}}
                    >
                      <NotebookPen size={14}/>
                    </button>
                    <button
                      onClick={() => {
                        pushEntry({
                          resumen: s.name,
                          kcal: s.kcal,
                          proteina: s.proteina !== undefined ? s.proteina : 20,
                          carbo: s.carbo !== undefined ? s.carbo : 30,
                          grasa: s.grasa !== undefined ? s.grasa : 10
                        }, s.name);
                      }}
                      className="btn-active-scale"
                      title="Registrar en el día"
                      style={{width:34, height:34, borderRadius:9, border:"none", background:C.lime, color:"#0c0e0b", cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0}}
                    >
                      <Plus size={16}/>
                    </button>
                  </div>
                ))}

                <div style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".08em", marginTop:4}}>
                  Sugerencias del Coach
                </div>
                {SUGGESTIONS.map((s, idx) => (
                  <div key={"d"+idx} style={{display:"flex", gap:10, alignItems:"center", background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:10}}>
                    <div style={{width:54, height:54, borderRadius:10, overflow:"hidden", flexShrink:0}}>
                      <img src={s.img} alt={s.name} style={{width:"100%", height:"100%", objectFit:"cover"}} loading="lazy"/>
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13, fontWeight:700, color:C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{s.name}</div>
                      <div style={{fontSize:11, color:C.muted, marginTop:2, display:"flex", gap:8, alignItems:"center"}}>
                        <span style={{color:C.lime, fontWeight:700}}>{s.kcal} kcal</span>
                        <span style={{display:"flex", alignItems:"center", gap:3}}><Clock size={11}/>{s.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        pushEntry({
                          resumen: s.name,
                          kcal: s.kcal,
                          proteina: s.proteina !== undefined ? s.proteina : 20,
                          carbo: s.carbo !== undefined ? s.carbo : 30,
                          grasa: s.grasa !== undefined ? s.grasa : 10
                        }, s.name);
                      }}
                      className="btn-active-scale"
                      title="Registrar en el día"
                      style={{width:34, height:34, borderRadius:9, border:"none", background:C.lime, color:"#0c0e0b", cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0}}
                    >
                      <Plus size={16}/>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tarjeta de Hidratación */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"13px 15px", marginBottom:14}}>
        <div style={{display:"flex", alignItems:"center", justifyTarget:"space-between", justifyContent:"space-between", marginBottom:8}}>
          <span style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700}}>
            <GlassWater size={16} color={C.cyan}/>Hidratación
          </span>
          <span style={{fontSize:13, color:C.muted}}>
            <b style={{color:C.ink, fontSize:15}}>{liters}</b> / {(waterGoal * 0.25).toFixed(1)} L
          </span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <button onClick={() => setWater(water - 1)} style={{width:38, height:38, borderRadius:10, border:`1px solid ${C.line}`, background:C.panel2, color:C.ink, cursor:"pointer", display:"grid", placeItems:"center"}}><Minus size={16}/></button>
          <div style={{flex:1, display:"flex", gap:3, overflow:"hidden"}}>
            {Array.from({length: waterGoal}).map((_,i) => (
              <div key={i} style={{
                flex:1, 
                height:22, 
                borderRadius:5, 
                background: i < water ? C.cyan : C.panel2, 
                border: `1px solid ${i < water ? C.cyan : C.line}`,
                transition: "all .2s"
              }}/>
            ))}
          </div>
          <button onClick={() => setWater(water + 1)} style={{width:38, height:38, borderRadius:10, border:"none", background:C.cyan, color:"#04212b", cursor:"pointer", display:"grid", placeItems:"center"}}><Plus size={16}/></button>
        </div>
      </div>

      {/* Tarjeta de Suplementos del Día */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"13px 15px", marginBottom:14}}>
        <div style={{display:"flex", alignItems:"center", justifyTarget:"space-between", justifyContent:"space-between", marginBottom:10}}>
          <span style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700}}>
            <Pill size={16} color={C.lime}/> Suplementos del Día
          </span>
          <span style={{fontSize:11, color:C.muted}}>
            {Object.values(supplements || {}).filter(Boolean).length} / {Object.keys(supplements || {}).length} tomados
          </span>
        </div>
        
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          {Object.entries(supplements || {}).map(([name, checked]) => {
            const hasInv = suppsInventory && suppsInventory[name];
            const stockLow = hasInv && suppsInventory[name].servingsLeft <= 5;
            
            return (
              <div 
                key={name}
                onClick={() => toggleSupplement(name)}
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:10,
                  padding:"8px 12px",
                  background:C.panel2,
                  border:`1px solid ${checked ? C.lime : (stockLow ? C.rose : C.line)}`,
                  borderRadius:8,
                  fontSize:13,
                  cursor:"pointer",
                  opacity: checked ? 0.6 : 1,
                  transition:"all 0.2s ease"
                }}
              >
                {checked ? <CheckSquare size={15} color={C.lime}/> : <Square size={15} color={C.muted}/>}
                <div style={{flex: 1, display:"flex", flexDirection:"column"}}>
                  <span style={{textDecoration: checked ? "line-through" : "none", fontWeight: 600}}>{name}</span>
                  {hasInv && (
                    <span style={{fontSize:10.5, color: stockLow ? C.rose : C.muted, fontWeight: stockLow ? 800 : 500}}>
                      {suppsInventory[name].servingsLeft} / {suppsInventory[name].totalServings} servicios{stockLow ? " ⚠️ ¡STOCK BAJO!" : ""}
                    </span>
                  )}
                </div>
                
                {hasInv && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const inv = { ...suppsInventory };
                      inv[name] = { ...inv[name], servingsLeft: inv[name].totalServings };
                      setSuppsInventory(inv);
                    }}
                    style={{
                      background:C.line, 
                      color:C.lime, 
                      fontSize:9.5, 
                      fontWeight:800, 
                      padding:"4px 8px", 
                      borderRadius:6, 
                      cursor:"pointer"
                    }}
                  >
                    + TARRO
                  </button>
                )}

                {!["Creatina", "Whey Protein", "Vitamina D", "Multivitamínico"].includes(name) && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSupplement(name); }}
                    style={{background:"none", border:"none", cursor:"pointer", color:C.muted, display:"grid", placeItems:"center"}}
                  >
                    <Trash2 size={13}/>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        <div style={{display:"flex", gap:6, marginTop:8}}>
          <input 
            value={newSuppInput}
            onChange={e => setNewSuppInput(e.target.value)}
            onKeyDown={e => { if(e.key === "Enter") addCustomSupplement(); }}
            placeholder="Ej: Cafeína..."
            className="ph"
            style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:12, color:C.ink}}
          />
          <button 
            onClick={addCustomSupplement}
            style={{padding:"6px 12px", background:C.lime, color:"#0c0e0b", fontWeight:800, borderRadius:8, fontSize:11, cursor:"pointer"}}
          >
            Añadir
          </button>
        </div>
      </div>

      {/* Botones de IA rápidos */}
      <div style={{display:"flex", gap:7, marginBottom:7}}>
        <button onClick={suggestDinner} style={chip(aiBusy==="Cena Sugerida")}><ChefHat size={14}/>Sugerir cena</button>
        <button onClick={() => setShowMoments(v => !v)} style={chip(showMoments)}><Clock size={14}/>¿Qué como ahora?</button>
      </div>
      {showMoments && (
        <div className="pop" style={{display:"flex", gap:7, flexWrap:"wrap", marginBottom:7}}>
          {["Pre-entreno", "Post-entreno", "Desayuno rápido", "Snack saludable"].map(m => (
            <button key={m} onClick={() => whatNow(m)} style={{...chip(false), flex:"1 1 45%", fontSize:11.5, padding:"8px 6px"}}>
              {m}
            </button>
          ))}
        </div>
      )}
      <button onClick={daySummary} style={{...chip(aiBusy==="Resumen del Día"), width:"100%", marginBottom:2}}>
        <Sparkles size={14}/>Resumen IA del día
      </button>
      <AIPanel 
        title={aiTitle} 
        busy={!!aiBusy} 
        text={aiText} 
        onClose={() => { 
          setAiText(""); 
          setAiTitle(""); 
          saveKey("last_ai_title", "");
          saveKey("last_ai_text", "");
        }}
      />

      <div style={{marginTop:18, marginBottom:6, display:"flex", justifyTarget:"space-between", justifyContent:"space-between", alignItems:"baseline"}}>
        <span className="disp" style={{fontSize:22, color:C.lime}}>LOG DE COMIDAS</span>
        <span style={{fontSize:12, color:C.muted}}>{log.length} {log.length===1 ? "registro" : "registros"}</span>
      </div>
      
      {!loaded && <div style={{color:C.muted, fontSize:13, padding:"10px 0"}}>Cargando…</div>}
      {loaded && log.length === 0 && (
        <div style={{color:C.muted, fontSize:13, padding:"18px 0", textAlign:"center"}}>Aún no registras nada hoy.</div>
      )}
      
      {log.map(e => (
        <div key={e.id} className="pop"
          style={{
            background:C.panel,
            border:`1px solid ${C.line}`,
            borderRadius:13,
            padding:"11px 14px",
            marginBottom:9,
            display:"flex",
            gap:10,
            alignItems:"center"
          }}
        >
          <div style={{flex:1}}>
            <div style={{fontSize:13.5, fontWeight:600, marginBottom:4}}>{e.resumen}</div>
            <div style={{fontSize:11.5, color:C.muted, display:"flex", gap:10, flexWrap:"wrap", fontVariantNumeric:"tabular-nums"}}>
              <span style={{color:C.lime}}>{Math.round(e.kcal)} kcal</span>
              <span style={{color:C.cyan}}>P {Math.round(e.proteina)}g</span>
              <span>C {Math.round(e.carbo)}g</span>
              <span style={{color:C.amber}}>G {Math.round(e.grasa)}g</span>
            </div>
          </div>
          <button
            onClick={() => setEditFoodObj({ e, isEditing: false })}
            className="btn-active-scale"
            title="Editar registro"
            style={{width:38, height:38, borderRadius:10, border:`1px solid ${C.line}`, background:C.panel2, color:C.muted, cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0}}
          >
            <NotebookPen size={15}/>
          </button>
        </div>
      ))}

      {editFoodObj && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, bottom:0,
          background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
          display:"grid", placeItems:"center", zIndex:9999, padding:20
        }} onClick={() => setEditFoodObj(null)}>
          <div style={{
            background: C.panel, border:`1px solid ${C.line}`, borderRadius:16,
            padding:20, width:"100%", maxWidth:320, display:"flex", flexDirection:"column", gap:12
          }} onClick={e => e.stopPropagation()}>
            {!editFoodObj.isEditing ? (
              <>
                <div style={{fontSize:16, fontWeight:800, color:C.ink, textAlign:"center"}}>Opciones de Comida</div>
                <div style={{fontSize:12, color:C.muted, textAlign:"center", marginBottom:8}}>{editFoodObj.e.resumen}</div>
                <button onClick={() => setEditFoodObj({...editFoodObj, isEditing: true})} style={{background:C.lime, color:"#0c0e0b", fontWeight:800, padding:12, borderRadius:12, border:"none", cursor:"pointer"}}>
                  ✏️ Editar Comida
                </button>
                <button onClick={() => { del(editFoodObj.e.id); setEditFoodObj(null); }} style={{background:"rgba(255, 61, 113, 0.15)", color:C.rose, fontWeight:800, padding:12, borderRadius:12, border:`1px solid ${C.rose}`, cursor:"pointer"}}>
                  🗑️ Borrar Comida
                </button>
              </>
            ) : (
              <>
                <div style={{fontSize:16, fontWeight:800, color:C.ink, textAlign:"center", marginBottom:8}}>Editar Macros</div>
                <input type="text" id="ef-resumen" defaultValue={editFoodObj.e.resumen} placeholder="Descripción" style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, fontSize:12}} />
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                  <div>
                    <label style={{fontSize:10, color:C.muted, fontWeight:700}}>Kcal</label>
                    <input type="number" id="ef-kcal" defaultValue={Math.round(editFoodObj.e.kcal)} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink}} />
                  </div>
                  <div>
                    <label style={{fontSize:10, color:C.cyan, fontWeight:700}}>Proteína (g)</label>
                    <input type="number" id="ef-p" defaultValue={Math.round(editFoodObj.e.proteina)} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.cyan}`, borderRadius:8, color:C.ink}} />
                  </div>
                  <div>
                    <label style={{fontSize:10, color:C.muted, fontWeight:700}}>Carbo (g)</label>
                    <input type="number" id="ef-c" defaultValue={Math.round(editFoodObj.e.carbo)} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink}} />
                  </div>
                  <div>
                    <label style={{fontSize:10, color:C.amber, fontWeight:700}}>Grasa (g)</label>
                    <input type="number" id="ef-f" defaultValue={Math.round(editFoodObj.e.grasa)} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink}} />
                  </div>
                </div>
                <button onClick={() => {
                  const newResumen = document.getElementById("ef-resumen").value;
                  const newKcal = parseFloat(document.getElementById("ef-kcal").value);
                  const newP = parseFloat(document.getElementById("ef-p").value);
                  const newC = parseFloat(document.getElementById("ef-c").value);
                  const newF = parseFloat(document.getElementById("ef-f").value);
                  if(newResumen && !isNaN(newKcal)) {
                    const nextLog = log.map(item => item.id === editFoodObj.e.id ? {
                      ...item, resumen: newResumen, kcal: newKcal||0, proteina: newP||0, carbo: newC||0, grasa: newF||0
                    } : item);
                    setLog(nextLog);
                  }
                  setEditFoodObj(null);
                }} style={{background:C.lime, color:"#0c0e0b", fontWeight:800, padding:12, borderRadius:12, border:"none", cursor:"pointer", marginTop:8}}>
                  Guardar
                </button>
              </>
            )}
            <button onClick={() => setEditFoodObj(null)} style={{background:"transparent", color:C.muted, fontWeight:700, padding:10, border:"none", cursor:"pointer"}}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== TAB COACH ===== */
function Coach({
  chat, setChat, target, totals, sendCoachMessage, chatBusy, sendDailyGreetingIfNeeded
}){
  // Simple markdown renderer for Coach responses
  const renderMarkdown = (text) => {
    if (!text) return null;
    const blocks = text.split('\n\n');
    return blocks.map((block, idx) => {
      // List parsing
      if (block.trim().startsWith('- ') || block.trim().match(/^\d+\.\s/)) {
        const lines = block.split('\n');
        return (
          <ul key={idx} style={{ paddingLeft: '20px', margin: '8px 0' }}>
            {lines.map((line, lidx) => {
              const content = line.replace(/^(- |\d+\.\s)/, '');
              const bolded = content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
                return part;
              });
              return <li key={lidx}>{bolded}</li>;
            })}
          </ul>
        );
      }
      
      // Paragraph with bold parsing
      const bolded = block.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        return part;
      });
      return <p key={idx} style={{ margin: '8px 0' }}>{bolded}</p>;
    });
  };

  const [text, setText] = useState(""); 
  const endRef = useRef(null);

  useEffect(() => { 
    endRef.current && endRef.current.scrollIntoView({behavior:"smooth"}); 
  }, [chat, chatBusy]);

  // Saludo proactivo al montar el componente (una vez al día)
  useEffect(() => {
    if (sendDailyGreetingIfNeeded && chat.length === 0) {
      sendDailyGreetingIfNeeded();
    }
  }, []);

  const send = () => { 
    if(!text.trim() || chatBusy) return; 
    sendCoachMessage(text.trim());
    setText(""); 
  };

  return (
    <div className="pop chat-window">
      
      {/* Cabecera del Chat con el Coach */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${C.line}`}}>
        <div className="disp" style={{fontSize:22, color:C.lime}}>CHAT CON EL COACH</div>
      </div>

      <div className="chat-bubble-container" style={{display:"flex", flexDirection:"column"}}>
        {chat.length === 0 ? (
          <div style={{textAlign:"center", color:C.muted, fontSize:13, padding:"30px 14px"}}>
            <MessageSquare size={26} color={C.lime} style={{marginBottom:10}}/>
            <p>Pregúntale a tu coach sobre tus macros, dieta o entrenamientos.</p>
            <div style={{display:"flex", flexDirection:"column", gap:8, marginTop:16}}>
              {["¿Cómo ajusto mis macros de hoy?", "¿Qué snacks proteicos saludables me recomiendas?", "Me siento fatigado, ¿debería saltar el entreno hoy?"].map(q => (
                <button key={q} onClick={() => setText(q)} style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:10, padding:"9px 12px", color:C.ink, fontSize:12.5, cursor:"pointer", textAlign:"left"}}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: "auto" }} />
        )}
        
        {chat.slice(-4).map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role === "user" ? "user" : "assistant"}`}>
            {m.role === "user" ? m.content : renderMarkdown(m.content)}
          </div>
        ))}
        
        {chatBusy && (
          <div style={{display:"flex", gap:6, color:C.muted, fontSize:13, alignItems:"center", padding:"4px 2px"}}>
            <Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/>pensando…
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{display:"flex", gap:6, paddingBottom:4, flexWrap:"wrap"}}>
        <button 
          onClick={() => sendCoachMessage('Haceme un análisis completo de mi semana de entrenamiento: PRs actuales, progresión de fuerza, volumen total, si estoy progresando en cada ejercicio y qué debo mejorar la semana que viene.')}
          disabled={chatBusy}
          style={{fontSize:11, padding:"5px 10px", borderRadius:8, border:`1px solid ${C.cyan}`, background:"transparent", color:C.cyan, cursor:"pointer", opacity: chatBusy ? 0.5 : 1}}
        >
          📊 Analizar mi semana
        </button>
        <button 
          onClick={() => sendCoachMessage('¿Qué músculo me conviene entrenar hoy según mi split y mi historial reciente? ¿Estoy descansando suficiente?')}
          disabled={chatBusy}
          style={{fontSize:11, padding:"5px 10px", borderRadius:8, border:`1px solid ${C.lime}`, background:"transparent", color:C.lime, cursor:"pointer", opacity: chatBusy ? 0.5 : 1}}
        >
          💪 ¿Qué entreno hoy?
        </button>
        <button 
          onClick={() => sendCoachMessage('Basándote en mi progresión histórica y PRs actuales, ¿cuánto debería cargar esta semana en cada ejercicio para seguir progresando sin lesionarme?')}
          disabled={chatBusy}
          style={{fontSize:11, padding:"5px 10px", borderRadius:8, border:`1px solid ${C.rose}`, background:"transparent", color:C.rose, cursor:"pointer", opacity: chatBusy ? 0.5 : 1}}
        >
          🎯 Cargas recomendadas
        </button>
      </div>
      <div style={{display:"flex", gap:8, paddingTop:6}}>
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          onKeyDown={e => { if(e.key === "Enter") send(); }} 
          className="ph" 
          placeholder="Pregúntale a tu coach…" 
          style={{flex:1, background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"12px 14px", color:C.ink, fontSize:14, outline:"none"}}
        />
        <button onClick={send} disabled={chatBusy} style={{width:48, borderRadius:12, border:"none", background:C.lime, color:"#0c0e0b", cursor:"pointer", display:"grid", placeItems:"center"}}>
          <Send size={18}/>
        </button>
      </div>
    </div>
  );
}

/* ===== TAB PERFIL Y AJUSTES ===== */
function Perfil({
  activeMetrics,
  geminiKey,
  saveGeminiKey,
  aiModel,
  saveAiModel,
  cloudSync,
  syncCode,
  syncStatus,
  handleToggleCloudSync,
  handleCreateSyncCode,
  handleLinkDevice,
  handleForcePull,
  handleForcePush,
  supabaseUrl,
  supabaseAnonKey,
  supabaseUser,
  sbSyncing,
  sbError,
  saveSbConfig,
  handleSbLogin,
  handleSbRegister,
  handleSbLogout,
  syncLocalToSupabase,
  changePreset,
  presetKey,
  customPresets,
  bodyComp
}) {
  const [showKeyField, setShowKeyField] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [linkSuccess, setLinkSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  
  const predefinedModels = ["google/gemini-2.5-flash", "google/gemini-2.5-pro", "deepseek/deepseek-chat", "moonshotai/kimi-k2.6:free"];
  const [customModelMode, setCustomModelMode] = useState(!predefinedModels.includes(aiModel));

  useEffect(() => {
    if (!predefinedModels.includes(aiModel)) {
      setCustomModelMode(true);
    } else {
      setCustomModelMode(false);
    }
  }, [aiModel]);
  
  const [sbUrlInput, setSbUrlInput] = useState(supabaseUrl || "");
  const [sbKeyInput, setSbKeyInput] = useState(supabaseAnonKey || "");
  const [sbEmail, setSbEmail] = useState("");
  const [sbPass, setSbPass] = useState("");
  const [showSbField, setShowSbField] = useState(false);

  useEffect(() => {
    setSbUrlInput(supabaseUrl || "");
    setSbKeyInput(supabaseAnonKey || "");
  }, [supabaseUrl, supabaseAnonKey]);

  const keysList = geminiKey ? geminiKey.split(/[,;\s]+/).map(k => k.trim()).filter(k => k.length > 0) : [];

  const handleAddKey = () => {
    if (!newKeyInput.trim()) return;
    const added = newKeyInput.trim();
    if (!keysList.includes(added)) {
      const updatedList = [...keysList, added];
      saveGeminiKey(updatedList.join(","));
    }
    setNewKeyInput("");
  };

  const handleRemoveKey = (indexToRemove) => {
    const updatedList = keysList.filter((_, idx) => idx !== indexToRemove);
    saveGeminiKey(updatedList.join(","));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processLinking = async () => {
    if (!linkInput.trim()) return;
    const ok = await handleLinkDevice(linkInput.trim());
    setLinkSuccess(ok);
    if(ok) setLinkInput("");
    setTimeout(() => setLinkSuccess(null), 3000);
  };

  return (
    <div className="pop" style={{ display: "flex", flexDirection: "column", padding: "0 16px 16px", gap: 16 }}>
      
      {/* Tarjeta de Perfil Bruno */}
      <div style={{
        background: "linear-gradient(135deg, var(--panel-bg-sec) 0%, var(--panel-bg) 100%)",
        border: "1px solid var(--line-color)",
        borderRadius: "var(--radius-lg)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "var(--shadow-card)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--accent-primary-hover)",
            color: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 18
          }}>
            B
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-ink)" }}>Bruno Eduardo</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Hombre • 34 años • 180 cm</div>
          </div>
        </div>

        {/* Grid de composición corporal */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginTop: 4
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--line-color)",
            borderRadius: "var(--radius-md)",
            padding: "8px 4px",
            textAlign: "center"
          }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, display: "block", textTransform: "uppercase" }}>Peso</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-primary)", display: "block", marginTop: 2 }}>
              {activeMetrics.weight || 93.9} <span style={{ fontSize: 10, fontWeight: 500 }}>kg</span>
            </span>
          </div>
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--line-color)",
            borderRadius: "var(--radius-md)",
            padding: "8px 4px",
            textAlign: "center"
          }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, display: "block", textTransform: "uppercase" }}>Músculo</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-cyan)", display: "block", marginTop: 2 }}>
              {bodyComp?.musculo || 64.7} <span style={{ fontSize: 10, fontWeight: 500 }}>kg</span>
            </span>
          </div>
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--line-color)",
            borderRadius: "var(--radius-md)",
            padding: "8px 4px",
            textAlign: "center"
          }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, display: "block", textTransform: "uppercase" }}>Grasa</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-rose)", display: "block", marginTop: 2 }}>
              {bodyComp?.grasaPct || 26.2} <span style={{ fontSize: 10, fontWeight: 500 }}>%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Objetivo (PRESETS) */}
      <div style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--line-color)",
        borderRadius: "var(--radius-lg)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "var(--shadow-card)"
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-ink)", display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Target size={15} color="var(--accent-rose)" />
          <span>Objetivo Principal</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
          {Object.keys(customPresets).map(k => (
            <button
              key={k}
              onClick={() => changePreset(k)}
              className="btn-active-scale"
              style={{
                padding: "10px 8px",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                border: `1px solid ${presetKey === k ? "var(--accent-rose)" : "var(--line-color)"}`,
                background: presetKey === k ? "rgba(255,107,152,.12)" : "var(--panel-bg-sec)",
                color: presetKey === k ? "var(--accent-rose)" : "var(--text-muted)"
              }}
            >
              {customPresets[k].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sección de API Key y Modelo */}
      <div style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--line-color)",
        borderRadius: "var(--radius-lg)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "var(--shadow-card)"
      }}>
        <div 
          onClick={() => setShowKeyField(!showKeyField)}
          style={{ fontSize: 13, fontWeight: 800, color: "var(--text-ink)", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={15} color="var(--accent-lime)" />
            <span>Configuración de IA</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{showKeyField ? "Ocultar" : "Mostrar"}</span>
        </div>

        {showKeyField && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newKeyInput}
                onChange={e => setNewKeyInput(e.target.value)}
                type="password"
                placeholder="Pegar nueva API Key (OpenRouter/Gemini)..."
                style={{ flex: 1, background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "10px 12px", fontSize: 12, color: "var(--text-ink)" }}
              />
              <button 
                onClick={handleAddKey} 
                className="btn-active-scale"
                style={{ padding: "10px 16px", background: "var(--accent-lime)", color: "#000000", fontWeight: 800, borderRadius: "var(--radius-md)", fontSize: 12, cursor: "pointer" }}
              >
                Añadir
              </button>
            </div>

            {keysList.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--panel-bg-sec)", padding: 10, borderRadius: "var(--radius-md)", border: "1px solid var(--line-color)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>Claves activas ({keysList.length}):</div>
                {keysList.map((k, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, background: "var(--panel-bg)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--line-color)" }}>
                    <span style={{ fontFamily: "monospace", color: "var(--text-ink)" }}>
                      {k.length > 15 ? `${k.slice(0, 8)}...${k.slice(-4)}` : "Clave activa"}
                    </span>
                    <button 
                      onClick={() => handleRemoveKey(idx)} 
                      style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer", fontSize: 11, fontWeight: 700, padding: 4 }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: "12px 0", border: "1px dashed var(--line-color)", borderRadius: "var(--radius-md)" }}>
                No tienes llaves configuradas. Añade una para usar funciones de IA.
              </div>
            )}

            {/* Selector de modelo */}
            {keysList.some(k => k.startsWith("sk-or-")) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--panel-bg-sec)", padding: 10, borderRadius: "var(--radius-md)", border: "1px solid var(--line-color)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--accent-lime)", textTransform: "uppercase", letterSpacing: ".05em" }}>Modelo de OpenRouter:</div>
                <select 
                  value={customModelMode ? "custom" : aiModel} 
                  onChange={e => {
                    if (e.target.value === "custom") {
                      setCustomModelMode(true);
                    } else {
                      setCustomModelMode(false);
                      saveAiModel(e.target.value);
                    }
                  }} 
                  style={{ background: "var(--panel-bg)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-sm)", padding: "8px 10px", fontSize: 12, color: "var(--text-ink)", width: "100%" }}
                >
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="deepseek/deepseek-chat">DeepSeek Chat (V3)</option>
                  <option value="moonshotai/kimi-k2.6:free">Kimi K2.6 (Gratis)</option>
                  <option value="custom">Otro (Ingresar ID abajo)</option>
                </select>
                {customModelMode && (
                  <input 
                    value={aiModel === "custom" ? "" : aiModel} 
                    onChange={e => saveAiModel(e.target.value)} 
                    placeholder="Ej: meta-llama/llama-3.1-70b-instruct" 
                    style={{ background: "var(--panel-bg)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-sm)", padding: "8px 10px", fontSize: 12, color: "var(--text-ink)", marginTop: 4 }}
                  />
                )}
              </div>
            )}
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
              Las claves de OpenRouter deben iniciar con <code>sk-or-</code>. Se rotarán automáticamente para evitar límites.
            </div>
          </div>
        )}
      </div>

      {/* Sincronización en la Nube (KVDB) */}
      <div style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--line-color)",
        borderRadius: "var(--radius-lg)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "var(--shadow-card)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-ink)", display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <RefreshCw 
              size={15} 
              color="var(--accent-cyan)" 
              style={{ animation: syncStatus === "Sincronizando..." || syncStatus === "Guardando..." ? "spin 2s linear infinite" : "none" }}
            />
            <span>Sincronización KVDB</span>
          </div>
          <span style={{ fontSize: 11, color: syncStatus === "Sincronizado" ? "var(--accent-lime)" : "var(--text-muted)", fontWeight: 700 }}>
            {syncStatus}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1 }}>Sincronizar entre dispositivos</span>
          <button 
            onClick={() => {
              if (cloudSync) {
                handleToggleCloudSync(false);
              } else {
                if (syncCode && !syncCode.startsWith("bf-")) {
                  handleToggleCloudSync(true);
                } else {
                  setShowEmailInput(!showEmailInput);
                }
              }
            }}
            className="btn-active-scale"
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              fontSize: 11,
              fontWeight: 800,
              background: cloudSync ? "rgba(74, 214, 255, 0.12)" : "var(--panel-bg-sec)",
              border: `1px solid ${cloudSync ? "var(--accent-cyan)" : "var(--line-color)"}`,
              color: cloudSync ? "var(--accent-cyan)" : "var(--text-muted)",
              cursor: "pointer"
            }}
          >
            {cloudSync ? "ACTIVO" : "DESACTIVADO"}
          </button>
        </div>

        {showEmailInput && !cloudSync && (
          <div style={{ background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Ingresa tu correo para crear un código de sincronización:</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input 
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                type="email"
                placeholder="tu-correo@ejemplo.com"
                style={{ flex: 1, background: "var(--panel-bg)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-sm)", padding: "8px 10px", fontSize: 12, color: "var(--text-ink)" }}
              />
              <button 
                onClick={async () => {
                  if (!emailInput.trim()) {
                    setEmailErr("Ingresa un correo");
                    return;
                  }
                  setEmailErr("");
                  const ok = await handleCreateSyncCode(emailInput);
                  if (ok) {
                    setShowEmailInput(false);
                    setEmailInput("");
                  } else {
                    setEmailErr("Error al crear código.");
                  }
                }}
                className="btn-active-scale"
                style={{ padding: "8px 12px", background: "var(--accent-cyan)", color: "#000000", fontWeight: 800, borderRadius: "var(--radius-sm)", fontSize: 11, cursor: "pointer" }}
              >
                Crear
              </button>
            </div>
            {emailErr && <div style={{ color: "var(--accent-rose)", fontSize: 11 }}>{emailErr}</div>}
          </div>
        )}

        {cloudSync && syncCode && (
          <div style={{ background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, color: "var(--accent-amber)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <ShieldAlert size={12} />
              <span>Verificación requerida en tu correo</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
              Código creado. Revisa tu correo y verifica el mensaje de <b>kvdb.io</b> para activarlo.
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Código de enlace:</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <code style={{ flex: 1, background: "var(--panel-bg)", padding: "8px 10px", borderRadius: "var(--radius-sm)", fontSize: 11.5, color: "var(--accent-cyan)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: "1px solid var(--line-color)" }}>
                {syncCode}
              </code>
              <button 
                onClick={handleCopyCode} 
                className="btn-active-scale"
                style={{ padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--line-color)", color: "var(--text-ink)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                {copied ? <Check size={12} color="var(--accent-lime)" /> : <Copy size={12} />}
                <span style={{ fontSize: 10 }}>{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
              <button 
                onClick={handleForcePush} 
                className="btn-active-scale"
                style={{ padding: "8px", borderRadius: "var(--radius-sm)", background: "var(--line-color)", color: "var(--accent-lime)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
              >
                Subir Datos
              </button>
              <button 
                onClick={handleForcePull} 
                className="btn-active-scale"
                style={{ padding: "8px", borderRadius: "var(--radius-sm)", background: "var(--line-color)", color: "var(--accent-cyan)", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
              >
                Bajar Datos
              </button>
            </div>
          </div>
        )}

        {cloudSync && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Vincular dispositivo secundario:</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input 
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                placeholder="Pegar código de sincronización..."
                style={{ flex: 1, background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "8px 10px", fontSize: 12, color: "var(--text-ink)" }}
              />
              <button 
                onClick={processLinking} 
                className="btn-active-scale"
                style={{ padding: "8px 12px", background: "var(--accent-cyan)", color: "#000000", fontWeight: 800, borderRadius: "var(--radius-md)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <Link2 size={12} /> Vincular
              </button>
            </div>
            {linkSuccess === true && <div style={{ color: "var(--accent-lime)", fontSize: 11 }}>¡Vinculado con éxito!</div>}
            {linkSuccess === false && <div style={{ color: "var(--accent-rose)", fontSize: 11 }}>Código inválido.</div>}
          </div>
        )}
      </div>

      {/* Supabase Cloud Database */}
      <div style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--line-color)",
        borderRadius: "var(--radius-lg)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "var(--shadow-card)"
      }}>
        <div 
          onClick={() => setShowSbField(!showSbField)}
          style={{ fontSize: 13, fontWeight: 800, color: "var(--text-ink)", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw 
              size={15} 
              color={supabaseUser ? "var(--accent-lime)" : "var(--text-muted)"} 
              style={{ animation: sbSyncing ? "spin 2s linear infinite" : "none" }}
            />
            <span>Supabase Cloud Database</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{showSbField ? "Ocultar" : "Mostrar"}</span>
        </div>

        {showSbField && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>Supabase Project URL:</span>
              <input 
                value={sbUrlInput}
                onChange={e => setSbUrlInput(e.target.value)}
                placeholder="https://xxxx.supabase.co"
                style={{ width: "100%", background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "8px 10px", fontSize: 11.5, color: "var(--text-ink)", marginTop: 4 }}
              />
            </div>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>Supabase Anon Key:</span>
              <input 
                value={sbKeyInput}
                onChange={e => setSbKeyInput(e.target.value)}
                type="password"
                placeholder="eyJhbGciOi..."
                style={{ width: "100%", background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "8px 10px", fontSize: 11.5, color: "var(--text-ink)", marginTop: 4 }}
              />
            </div>
            <button 
              onClick={() => saveSbConfig(sbUrlInput, sbKeyInput)}
              className="btn-active-scale"
              style={{ padding: "10px", background: "var(--line-color)", color: "var(--accent-lime)", fontWeight: 800, borderRadius: "var(--radius-md)", fontSize: 11.5, cursor: "pointer", width: "100%" }}
            >
              Guardar Configuración
            </button>

            {/* Login / Registro / Estado de Sesión */}
            {supabaseUrl && supabaseAnonKey && (
              <div style={{ borderTop: "1px dashed var(--line-color)", marginTop: 6, paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {supabaseUser ? (
                  <div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 6 }}>
                      Sesión activa: <b style={{ color: "var(--accent-lime)" }}>{supabaseUser.email}</b>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button 
                        onClick={syncLocalToSupabase}
                        disabled={sbSyncing}
                        className="btn-active-scale"
                        style={{ flex: 1, padding: "10px", background: "var(--accent-lime)", color: "#000000", fontWeight: 800, borderRadius: "var(--radius-md)", fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      >
                        {sbSyncing ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : "Sincronizar ahora"}
                      </button>
                      <button 
                        onClick={handleSbLogout}
                        disabled={sbSyncing}
                        className="btn-active-scale"
                        style={{ padding: "10px 14px", background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", color: "var(--accent-rose)", fontWeight: 700, borderRadius: "var(--radius-md)", fontSize: 11.5, cursor: "pointer" }}
                      >
                        Salir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Ingresa a tu cuenta de Supabase:</div>
                    <input 
                      value={sbEmail}
                      onChange={e => setSbEmail(e.target.value)}
                      placeholder="tu-correo@ejemplo.com"
                      style={{ width: "100%", background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "8px 10px", fontSize: 11.5, color: "var(--text-ink)" }}
                    />
                    <input 
                      value={sbPass}
                      onChange={e => setSbPass(e.target.value)}
                      type="password"
                      placeholder="Contraseña"
                      style={{ width: "100%", background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: "8px 10px", fontSize: 11.5, color: "var(--text-ink)" }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button 
                        onClick={() => handleSbLogin(sbEmail, sbPass)}
                        disabled={sbSyncing}
                        className="btn-active-scale"
                        style={{ flex: 1, padding: "10px", background: "var(--accent-cyan)", color: "#000000", fontWeight: 800, borderRadius: "var(--radius-md)", fontSize: 11.5, cursor: "pointer" }}
                      >
                        {sbSyncing ? "Conectando..." : "Iniciar Sesión"}
                      </button>
                      <button 
                        onClick={() => handleSbRegister(sbEmail, sbPass)}
                        disabled={sbSyncing}
                        className="btn-active-scale"
                        style={{ flex: 1, padding: "10px", background: "var(--accent-lime)", color: "#000000", fontWeight: 800, borderRadius: "var(--radius-md)", fontSize: 11.5, cursor: "pointer" }}
                      >
                        Registrarse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {sbError && (
              <div style={{ fontSize: 11.5, color: sbError.includes("Error") ? "var(--accent-rose)" : "var(--accent-lime)", marginTop: 4, lineHeight: 1.3 }}>
                {sbError}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

/* ===== AGENTE ENTRENADOR ===== */
function TrainerAgent({ onClose, data, busy, onRunAnalysis, exlog, exercises, notes, metricslog, splits, plateauAlerts, overloadSuggestions, muscleImbalances }) {
  const local = data?._local || null;

  const muscleVol = React.useMemo(() => {
    if (local?.muscleVol) return local.muscleVol;
    return calcMuscleVolumeBalance(exlog, exercises);
  }, [local, exlog, exercises]);

  const weeklyLoad = local?.weeklyLoad || calcWeeklyTrainingLoad(exlog);
  const deloadCheck = local?.deloadCheck || detectDeloadNeed(exlog, notes, metricslog);

  const STATUS_COLORS = {
    neglected: { bg:"rgba(244,63,94,0.12)", border:"rgba(244,63,94,0.3)", text:"#f43f5e" },
    low:       { bg:"rgba(251,191,36,0.12)", border:"rgba(251,191,36,0.3)", text:"#fbbf24" },
    optimal:   { bg:"rgba(205,255,74,0.1)",  border:"rgba(205,255,74,0.25)", text:"#cdff4a" },
    high:      { bg:"rgba(74,214,255,0.1)",  border:"rgba(74,214,255,0.25)", text:"#4ad6ff" },
  };
  const URGENCY_COLORS = {
    low:    { border:"rgba(251,191,36,0.4)", text:"#fbbf24", bg:"rgba(251,191,36,0.08)" },
    medium: { border:"rgba(244,63,94,0.3)",  text:"#fb923c", bg:"rgba(251,146,60,0.08)" },
    high:   { border:"rgba(244,63,94,0.5)",  text:"#f43f5e", bg:"rgba(244,63,94,0.1)" },
  };
  const PHASE_COLORS = { "Acumulación":"#cdff4a", "Intensificación":"#4ad6ff", "Deload":"#fbbf24", "Pico":"#f43f5e" };

  const maxSets = Math.max(...weeklyLoad.map(w=>w.totalSets), 1);

  return (
    <div className="trainer-agent-sheet" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="trainer-agent-panel">

        {/* Header */}
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:10, borderBottom:`1px solid rgba(205,255,74,0.1)`}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <div style={{width:30, height:30, borderRadius:8, background:"rgba(205,255,74,0.1)", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <Sparkles size={15} color="#cdff4a"/>
            </div>
            <span className="disp" style={{fontSize:20, color:"#cdff4a", letterSpacing:".04em"}}>AGENTE ENTRENADOR</span>
          </div>
          <button onClick={onClose} style={{background:"none", border:"none", color:"#9aa088", cursor:"pointer", padding:4}}><X size={20}/></button>
        </div>

        {/* Phase Indicator */}
        <div className="pop" style={{padding:"12px 14px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          {data?.trainingPhase ? (
            <>
              <div>
                <div style={{fontSize:10, color:"#9aa088", fontWeight:700, letterSpacing:".08em", marginBottom:3}}>FASE ACTUAL</div>
                <div className="disp" style={{fontSize:26, color: PHASE_COLORS[data.trainingPhase.name] || "#cdff4a", lineHeight:1}}>{data.trainingPhase.name?.toUpperCase()}</div>
                <div style={{fontSize:11, color:"#9aa088", marginTop:3}}>{data.trainingPhase.description}</div>
              </div>
              {data.trainingPhase.weekNumber && (
                <div style={{textAlign:"center", background:"rgba(205,255,74,0.08)", border:"1px solid rgba(205,255,74,0.15)", borderRadius:10, padding:"8px 12px"}}>
                  <div className="disp" style={{fontSize:28, color:"#cdff4a"}}>{data.trainingPhase.weekNumber}</div>
                  <div style={{fontSize:9, color:"#9aa088", fontWeight:700}}>SEM CICLO</div>
                </div>
              )}
            </>
          ) : (
            <div style={{color:"#9aa088", fontSize:12}}>
              <Sparkles size={13} style={{verticalAlign:"middle", marginRight:5}}/>
              Ejecuta el análisis IA para ver tu fase de entrenamiento
            </div>
          )}
        </div>

        {/* Muscle Volume Balance Grid */}
        <div>
          <div style={{fontSize:10, fontWeight:700, color:"#9aa088", letterSpacing:".08em", marginBottom:2}}>BALANCE MUSCULAR · series/sem</div>
          <div className="volume-balance-grid">
            {Object.entries(muscleVol).map(([muscle, d]) => {
              const sc = STATUS_COLORS[d.status];
              return (
                <div key={muscle} title={d.recommendation} style={{background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:8, padding:"7px 8px"}}>
                  <div style={{fontSize:9, fontWeight:700, color:"#9aa088", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{muscle.toUpperCase()}</div>
                  <div style={{fontSize:18, fontWeight:900, color:sc.text, lineHeight:1}}>{d.setsPerWeek}</div>
                  <div style={{fontSize:8, color:sc.text, marginTop:1, opacity:.8}}>{d.status === "neglected" ? "sin trabajo" : d.status === "low" ? "bajo" : d.status === "high" ? "alto" : "óptimo"}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Load Chart */}
        <div>
          <div style={{fontSize:10, fontWeight:700, color:"#9aa088", letterSpacing:".08em", marginBottom:8}}>CARGA SEMANAL (series)</div>
          <div style={{display:"flex", alignItems:"flex-end", gap:4, height:64}}>
            {weeklyLoad.map((w, i) => {
              const isLast = i === weeklyLoad.length - 1;
              const heightPct = maxSets > 0 ? (w.totalSets / maxSets) * 100 : 0;
              return (
                <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, height:"100%", justifyContent:"flex-end"}}>
                  <div style={{width:"100%", height:`${heightPct}%`, minHeight: w.totalSets > 0 ? 4 : 0, background: isLast ? "#cdff4a" : "rgba(205,255,74,0.25)", borderRadius:"3px 3px 0 0", transition:"height .3s"}}/>
                  <div style={{fontSize:8, color: isLast ? "#cdff4a" : "#9aa088", fontWeight: isLast ? 700 : 400, whiteSpace:"nowrap"}}>{w.weekLabel.replace("Sem ","W")}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex", justifyContent:"space-between", marginTop:4}}>
            <span style={{fontSize:9, color:"#9aa088"}}>8 semanas atrás</span>
            <span style={{fontSize:9, color:"#cdff4a", fontWeight:700}}>Esta semana: {weeklyLoad[weeklyLoad.length-1]?.totalSets || 0} series</span>
          </div>
        </div>

        {/* Deload Card */}
        {deloadCheck.recommended && (() => {
          const uc = URGENCY_COLORS[deloadCheck.urgency] || URGENCY_COLORS.low;
          const aiDeload = data?.deloadRecommendation;
          return (
            <div style={{background:uc.bg, border:`1px solid ${uc.border}`, borderRadius:12, padding:"12px 14px"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6}}>
                <div style={{display:"flex", alignItems:"center", gap:6}}>
                  <Activity size={14} color={uc.text}/>
                  <span style={{fontSize:11, fontWeight:800, color:uc.text, letterSpacing:".06em"}}>
                    {deloadCheck.urgency === "high" ? "DELOAD URGENTE" : deloadCheck.urgency === "medium" ? "DELOAD RECOMENDADO" : "DELOAD PRÓXIMAMENTE"}
                  </span>
                </div>
                <div style={{background:uc.border, borderRadius:6, padding:"2px 8px"}}>
                  <span className="disp" style={{fontSize:18, color:uc.text}}>{deloadCheck.weeksSinceDeload}w</span>
                </div>
              </div>
              <div style={{fontSize:12, color:"#f3f4ea", marginBottom: aiDeload ? 8 : 0}}>{deloadCheck.reason}</div>
              {aiDeload && (
                <div style={{display:"flex", gap:8, marginTop:6}}>
                  {aiDeload.targetVolumePct && <div style={{fontSize:11, color:"#9aa088"}}>↓ Volumen al <strong style={{color:uc.text}}>{aiDeload.targetVolumePct}%</strong></div>}
                  {aiDeload.durationDays && <div style={{fontSize:11, color:"#9aa088"}}>· <strong style={{color:uc.text}}>{aiDeload.durationDays} días</strong></div>}
                </div>
              )}
            </div>
          );
        })()}

        {/* Muscle Alerts from AI */}
        {data?.muscleAlerts?.length > 0 && (
          <div>
            <div style={{fontSize:10, fontWeight:700, color:"#9aa088", letterSpacing:".08em", marginBottom:8}}>ALERTAS MUSCULARES</div>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              {data.muscleAlerts.slice(0,4).map((alert, i) => {
                const sc = STATUS_COLORS[alert.status] || STATUS_COLORS.low;
                return (
                  <div key={i} style={{background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:9, padding:"8px 12px", display:"flex", alignItems:"center", gap:10}}>
                    <div style={{width:6, height:6, borderRadius:"50%", background:sc.text, flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12, fontWeight:700, color:sc.text}}>{alert.muscle}</div>
                      <div style={{fontSize:11, color:"#9aa088"}}>{alert.recommendation}</div>
                    </div>
                    {alert.currentSets != null && <div style={{fontSize:10, color:sc.text, fontWeight:700, whiteSpace:"nowrap"}}>{alert.currentSets} ser/sem</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exercise Variations */}
        {data?.exerciseVariations?.length > 0 && (
          <div>
            <div style={{fontSize:10, fontWeight:700, color:"#9aa088", letterSpacing:".08em", marginBottom:8}}>VARIACIONES SUGERIDAS</div>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              {data.exerciseVariations.slice(0,4).map((v, i) => {
                const prioColor = v.priority==="alta" ? "#f43f5e" : v.priority==="media" ? "#fbbf24" : "#9aa088";
                return (
                  <div key={i} className="pop" style={{padding:"10px 12px"}}>
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4}}>
                      <div style={{fontSize:12, fontWeight:700, color:"#f3f4ea"}}>
                        {v.exercise} <span style={{color:"#9aa088", fontSize:11}}>→</span> <span style={{color:"#cdff4a"}}>{v.variation}</span>
                      </div>
                      <div style={{fontSize:9, background:`rgba(${prioColor.startsWith("#f43f")?'244,63,94':prioColor.startsWith("#fbb")?'251,191,36':'154,160,136'},0.15)`, color:prioColor, borderRadius:5, padding:"2px 6px", fontWeight:700, whiteSpace:"nowrap"}}>{v.priority?.toUpperCase()}</div>
                    </div>
                    <div style={{fontSize:11, color:"#9aa088"}}>{v.reason}</div>
                    {v.currentIssue && <div style={{fontSize:10, color:"#4ad6ff", marginTop:3, fontStyle:"italic"}}>{v.currentIssue}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Performance Summary */}
        {data?.performanceSummary && (
          <div style={{borderLeft:"3px solid #4ad6ff", background:"rgba(74,214,255,0.05)", borderRadius:"0 10px 10px 0", padding:"12px 14px"}}>
            <div style={{fontSize:10, fontWeight:700, color:"#4ad6ff", letterSpacing:".08em", marginBottom:8}}>RESUMEN DE RENDIMIENTO</div>
            <div style={{fontSize:12, color:"#f3f4ea", lineHeight:1.6, marginBottom:8}}>{data.performanceSummary.narrative}</div>
            {data.performanceSummary.topStrengths?.length > 0 && (
              <div style={{marginBottom:6}}>
                {data.performanceSummary.topStrengths.map((s,i)=><div key={i} style={{fontSize:11, color:"#cdff4a", marginBottom:2}}>✓ {s}</div>)}
              </div>
            )}
            {data.performanceSummary.topConcerns?.length > 0 && (
              <div style={{marginBottom:8}}>
                {data.performanceSummary.topConcerns.map((c,i)=><div key={i} style={{fontSize:11, color:"#fbbf24", marginBottom:2}}>▲ {c}</div>)}
              </div>
            )}
            {data.performanceSummary.nextWeekFocus && (
              <div style={{background:"rgba(205,255,74,0.08)", border:"1px solid rgba(205,255,74,0.2)", borderRadius:8, padding:"8px 10px", fontSize:12, color:"#cdff4a", fontWeight:600}}>
                🎯 {data.performanceSummary.nextWeekFocus}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {data?._error && (
          <div style={{fontSize:12, color:"#f43f5e", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:9, padding:"10px 12px"}}>{data._error}</div>
        )}

        {/* AI CTA */}
        <button
          onClick={onRunAnalysis}
          disabled={busy}
          style={{width:"100%", padding:"14px 0", borderRadius:12, border:"none", cursor: busy ? "not-allowed" : "pointer", background: busy ? "rgba(205,255,74,0.1)" : "linear-gradient(90deg,#4ad6ff,#cdff4a)", color: busy ? "#9aa088" : "#0c0e0b", fontWeight:900, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:".03em", opacity: busy ? 0.7 : 1, transition:"opacity .2s"}}
        >
          {busy ? <><Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/>Analizando...</> : <><Sparkles size={16}/>{data && !data._error ? "Actualizar Análisis" : "Analizar con IA"}</>}
        </button>

      </div>
    </div>
  );
}

/* ===== TAB ENTRENAMIENTO ===== */
function Entreno({
  exlog, setExlog, exercises, setExercises, geminiKey, handleAnalyzeWorkout, importWorkoutData,
  activeSplitKey, setActiveSplitKey, selectedDateStr, setSelectedDateStr, calMonth, setCalMonth,
  workoutDurations, setWorkoutDurations, prAlerts, setPrAlerts, checkNewPR, activeMetrics,
  overloadSuggestions, plateauAlerts, muscleImbalances, splits, setSplits, notes, chat
}){
  const sel = activeSplitKey;
  const setSel = setActiveSplitKey;
  const [open, setOpen] = useState(null);
  const [w, setW] = useState(""); 
  const [reps, setReps] = useState("");
  const [setsCount, setSetsCount] = useState("1");
  const [setType, setSetType] = useState("work"); // 'work' or 'warmup' or 'dropset'
  const [rir, setRir] = useState("-");
  const [editSetObj, setEditSetObj] = useState(null);
  const [editExObj, setEditExObj] = useState(null);
  const [exTab, setExTab] = useState("texto"); // 'texto' or 'nuevo'

  const getRecentSensationsText = () => {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recentNotes = (notes || []).filter(n => n && n.date && new Date(n.date).getTime() >= sevenDaysAgo);
    let notesText = recentNotes.map(n => `[Nota ${fdate(n.date)}]: ${n.text}`).join(" | ");
    
    const recentChat = (chat || []).slice(-8).filter(m => m.role === "user");
    let chatText = recentChat.map(m => m.content).join(" | ");
    
    let combined = "";
    if (notesText) combined += `Notas de bienestar y esfuerzo recientes: ${notesText}. `;
    if (chatText) combined += `Comentarios/sensaciones de chat recientes: ${chatText}.`;
    return combined || "Sin sensaciones o fatiga reportadas recientemente.";
  };

  // --- Splits Manual Editor States ---
  const [showSplitsEditor, setShowSplitsEditor] = useState(false);
  const [editSplitsData, setEditSplitsData] = useState([]);
  const [editingSplitIdx, setEditingSplitIdx] = useState(0);
  const [newExText, setNewExText] = useState("");
  const [confirmRemoveEx, setConfirmRemoveEx] = useState(null); // null or exercise name
  
  // States for text importer
  const [importText, setImportText] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [importErr, setImportErr] = useState("");
  const [verificationList, setVerificationList] = useState(null);
  
  const [dayBusy, setDayBusy] = useState(false); 
  const [daySug, setDaySug] = useState("");
  const [progBusy, setProgBusy] = useState(""); 
  const [prog, setProg] = useState({});
  
  const [adding, setAdding] = useState(false); 
  const [addMode, setAddMode] = useState("nombre"); 
  const [addText, setAddText] = useState(""); 
  const [addBusy, setAddBusy] = useState(false); 
  const [addErr, setAddErr] = useState("");
  
  const [wkBusy, setWkBusy] = useState(false); 
  const [wk, setWk] = useState("");

  const getLocalDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLocalDateFromISO = (isoString) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return getLocalDateStr(d);
    } catch (e) {
      return "";
    }
  };

  // Removed duplicate getMetricsForDate from Entreno component

  const workoutSessions = React.useMemo(() => {
    const sessions = {};
    Object.entries(exlog || {}).forEach(([name, sets]) => {
      (sets || []).forEach(s => {
        const localDate = getLocalDateFromISO(s.date);
        if (!localDate) return;
        if (!sessions[localDate]) {
          sessions[localDate] = {};
        }
        if (!sessions[localDate][name]) {
          sessions[localDate][name] = [];
        }
        sessions[localDate][name].push(s);
      });
    });
    return sessions;
  }, [exlog]);

  const getSessionStats = () => {
    let totalVol = 0;
    const workouts = workoutSessions[selectedDateStr] || {};
    Object.values(workouts).forEach(sets => {
      sets.forEach(s => {
        if (s.type !== "warmup") {
          totalVol += (parseFloat(s.w) || 0) * (parseInt(s.reps) || 0);
        }
      });
    });
    const dur = workoutDurations[selectedDateStr] || 0;
    const density = dur > 0 ? Math.round(totalVol / dur) : 0;
    return { totalVol, density, dur };
  };

  const dayObj = (splits || DEFAULT_SPLITS).find(d => d.key === sel) || (splits || DEFAULT_SPLITS)[0] || DEFAULT_SPLITS[0];
  const dayExs = (exercises || {})[sel] || [];
  const dayMuscles = [...new Set(dayExs.flatMap(e => e.musculos || []))];
  const last = (n) => { const a = (exlog || {})[n]; return a && a.length ? a[0] : null; };
  const chartData = (n) => ((exlog || {})[n] || []).slice().reverse();

  useEffect(() => {
    (async () => {
      const savedDaySug = await loadKey("last_day_sug", "");
      const savedWk = await loadKey("last_wk_sug", "");
      if (savedDaySug) setDaySug(savedDaySug);
      if (savedWk) setWk(savedWk);
    })();
  }, []);

  /* ===== MAPA DE CALOR DE VOLUMEN SEMANAL ===== */
  const vol = useMemo(() => {
    const exMap = {};
    Object.values(exercises || {}).flat().forEach(e => { exMap[e.name] = e.musculos || []; });
    const weekAgo = Date.now() - 7 * 864e5;
    const calculatedVol = { Pectoral: 0, Espalda: 0, Cuádriceps: 0, Isquios: 0, Deltoides: 0, Bíceps: 0, Tríceps: 0, Glúteos: 0, Antebrazo: 0 };

    Object.entries(exlog || {}).forEach(([name, sets]) => {
      const ms = exMap[name] || MUSCLES[name] || [];
      (sets || []).forEach(s => {
        if(s && s.date && new Date(s.date).getTime() >= weekAgo && s.type !== "warmup") {
          ms.forEach(m => {
            if(calculatedVol[m] !== undefined) calculatedVol[m] = calculatedVol[m] + 1;
          });
        }
      });
    });
    return calculatedVol;
  }, [exercises, exlog]);

  const getHeatColor = (sets) => {
    if (sets === 0) return { bg: C.panel2, text: C.muted };
    if (sets < 4) return { bg: "rgba(107, 78, 255, 0.15)", text: C.ink, border: "rgba(107, 78, 255, 0.3)" };
    if (sets < 8) return { bg: "rgba(205, 255, 74, 0.25)", text: "#f3f4ea", border: C.lime, fontWeight: 700 };
    return { bg: C.lime, text: "#0c0e0b", border: C.lime, fontWeight: 800, boxShadow: "0 0 10px rgba(205, 255, 74, 0.3)" };
  };

  const allExistingExercises = Object.values(exercises || {}).flat().map(e => e.name);

  const findBestMatch = (name, existingList) => {
    const clean = (s) => s.toLowerCase().trim().replace(/s$/, "");
    const cleanedName = clean(name);
    const exact = existingList.find(ex => clean(ex) === cleanedName);
    if (exact) return exact;
    const contains = existingList.find(ex => clean(ex).includes(cleanedName) || cleanedName.includes(clean(ex)));
    if (contains) return contains;
    return "__NEW__";
  };

  const handleParseText = async () => {
    if (!importText.trim() || importBusy) return;
    setImportBusy(true);
    setImportErr("");
    try {
      const out = await callGemini([{ role: "user", content: importText.trim() }], WORKOUT_PARSER_SYS, WORKOUT_PARSER_SCHEMA);
      const parsed = cleanAndParseJSON(out);
      if (!parsed.exercises || parsed.exercises.length === 0) {
        throw new Error("No se detectaron ejercicios.");
      }
      
      const list = parsed.exercises.map(ex => {
        const bestMatch = findBestMatch(ex.name, allExistingExercises);
        return {
          originalName: ex.name,
          targetName: bestMatch,
          sets: ex.sets.map(s => ({ w: s.w, reps: String(s.reps), type: s.type || "work" })),
          muscles: ex.muscles || []
        };
      });
      setVerificationList(list);
    } catch (e) {
      setImportErr("No se pudo analizar el entrenamiento. Intenta con un formato claro (ej: 'Sentadilla 4 series de 90kg x 8 reps').");
    } finally {
      setImportBusy(false);
    }
  };

  const handleConfirmAndImport = () => {
    importWorkoutData(verificationList, sel);
    setVerificationList(null);
    setImportText("");
  };

  const addSet = (n) => { 
    if(!w.trim()) return; 
    const count = parseInt(setsCount) || 1;
    const newSets = [];
    const parts = selectedDateStr.split("-");
    const now = new Date();

    const rirVal = rir === "-" ? null : parseInt(rir);

    // Check for PR before writing
    const newPrs = [];
    const prMsg = checkNewPR(n, parseFloat(w), reps.trim(), exlog, rirVal);
    if (prMsg) {
      newPrs.push(`${n}: ${prMsg}`);
    }
    if (newPrs.length > 0) {
      setPrAlerts(newPrs);
    }

    for (let i = 0; i < count; i++) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds() - (count - 1 - i) * 10);
      newSets.push({
        date: d.toISOString(),
        w: parseFloat(w),
        reps: reps.trim() || "-",
        type: setType,
        rir: rirVal
      });
    }
    const next = {...exlog, [n]: [...newSets.reverse(), ...(exlog[n] || [])].slice(0, 60)}; 
    setExlog(next); 
    setW(""); 
    setReps(""); 
    setSetsCount("1");
    setRir("-");
  };

  const delSet = (n, i) => { 
    const arr = [...(exlog[n] || [])]; 
    arr.splice(i, 1); 
    const next = {...exlog, [n]: arr}; 
    setExlog(next); // setExlog prop ya guarda en saveState automáticamente
  };

  // Borra una serie del detalle del día en el calendario (usa referencia directa al objeto)
  const delSetFromDay = (exName, setObj) => {
    const arr = [...(exlog[exName] || [])];
    // Buscar la serie por coincidencia exacta de fecha+peso+reps para no borrar la equivocada
    const idx = arr.findIndex(s => s.date === setObj.date && s.w === setObj.w && s.reps === setObj.reps && s.type === setObj.type);
    if (idx === -1) return;
    arr.splice(idx, 1);
    const next = {...exlog, [exName]: arr};
    setExlog(next);
  };

  const delExercise = (n) => { 
    const updatedExercises = { ...exercises };
    Object.keys(updatedExercises).forEach(k => {
      updatedExercises[k] = (updatedExercises[k] || []).filter(e => e.name !== n);
    });
    setExercises(updatedExercises);

    const nextSplits = (splits || DEFAULT_SPLITS).map(s => {
      return {
        ...s,
        ex: (s.ex || []).filter(name => name !== n)
      };
    });
    setSplits(nextSplits);

    const updatedExlog = { ...exlog };
    delete updatedExlog[n];
    setExlog(updatedExlog);
  };

  // --- Splits Manual Actions & Helpers ---
  const startEditSplits = () => {
    setEditSplitsData((splits || DEFAULT_SPLITS).map(s => ({ ...s, ex: [...(s.ex || [])] })));
    setEditingSplitIdx(0);
    setNewExText("");
    setShowSplitsEditor(true);
  };

  const saveSplitsAndSyncExercises = (nextSplits) => {
    const nextExercises = { ...exercises };
    nextSplits.forEach(s => {
      const existingForDay = exercises[s.key] || [];
      nextExercises[s.key] = (s.ex || []).map(name => {
        const existingObj = existingForDay.find(e => e.name.toLowerCase() === name.toLowerCase()) || 
                            Object.values(exercises).flat().find(e => e.name.toLowerCase() === name.toLowerCase());
        if (existingObj) {
          return { ...existingObj, name };
        } else {
          return {
            name,
            tecnico: "",
            musculos: MUSCLES[name] || []
          };
        }
      });
    });
    
    const splitKeys = nextSplits.map(s => s.key);
    Object.keys(nextExercises).forEach(k => {
      if (!splitKeys.includes(k)) {
        delete nextExercises[k];
      }
    });

    if (!splitKeys.includes(activeSplitKey)) {
      setActiveSplitKey(splitKeys[0] || "A");
    }

    setExercises(nextExercises);
    setSplits(nextSplits);
    setShowSplitsEditor(false);
  };

  const removeExerciseFromSplit = (exName) => {
    const updatedExercises = { ...exercises };
    if (updatedExercises[sel]) {
      updatedExercises[sel] = updatedExercises[sel].filter(e => e.name !== exName);
    }
    setExercises(updatedExercises);
    
    const nextSplits = (splits || DEFAULT_SPLITS).map(s => {
      if (s.key === sel) {
        return {
          ...s,
          ex: s.ex.filter(name => name !== exName)
        };
      }
      return s;
    });
    setSplits(nextSplits);
    setConfirmRemoveEx(null);
  };

  const removeExerciseGlobally = (exName) => {
    delExercise(exName);
    setConfirmRemoveEx(null);
  };

  const handleUpdateExercise = (oldName, newName, newTecnico, newMusculosList) => {
    const updatedExercises = { ...exercises };
    Object.keys(updatedExercises).forEach(k => {
      updatedExercises[k] = (updatedExercises[k] || []).map(e => {
        if (e.name === oldName) {
          return { ...e, name: newName, tecnico: newTecnico, musculos: newMusculosList };
        }
        return e;
      });
    });
    setExercises(updatedExercises);

    if (oldName !== newName) {
      const updatedExlog = { ...exlog };
      if (updatedExlog[oldName]) {
        updatedExlog[newName] = updatedExlog[oldName];
        delete updatedExlog[oldName];
      }
      setExlog(updatedExlog);
    }
    if (oldName === open) {
      setOpen(newName);
    }
  };

  const delExFromSession = (exName, dateStr) => {
    const updatedExlog = { ...exlog };
    if (updatedExlog[exName]) {
      updatedExlog[exName] = updatedExlog[exName].filter(s => getLocalDateFromISO(s.date) !== dateStr);
      if (updatedExlog[exName].length === 0) {
        delete updatedExlog[exName];
      }
    }
    setExlog(updatedExlog);
  };

  const formatDay = (dStr) => {
    try {
      const parts = dStr.split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("es", { day: 'numeric', month: 'short' });
    } catch(e) {
      return dStr;
    }
  };

  const addExercise = async() => { 
    if(!addText.trim() || addBusy) return; 
    setAddBusy(true); 
    setAddErr("");
    try{
      if(addMode === "nombre"){
        const sys = "Eres un entrenador personal experto. Analiza el ejercicio brindado, identifica su nombre técnico e identifica obligatoriamente al menos los 3 músculos principales involucrados (por ejemplo, para Sentadilla podrías listar Cuádriceps femoral, Glúteo mayor, e Isquiotibiales). Devuelve un JSON. Ejemplo:\n" +
                    "{\n" +
                    "  \"tecnico\": \"Extensión de rodilla en máquina\",\n" +
                    "  \"musculos\": [\"Cuádriceps femoral\", \"Vasto lateral\", \"Vasto medial\"]\n" +
                    "}";
        const schema = {
          type: "OBJECT",
          properties: {
            tecnico: { type: "STRING" },
            musculos: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Lista con al menos 3 músculos principales trabajados"
            }
          },
          required: ["tecnico", "musculos"]
        };
        const o = cleanAndParseJSON(await callGemini([{role:"user", content:addText.trim()}], sys, schema));
        setExercises({...exercises, [sel]: [...dayExs, {name: addText.trim(), tecnico: o.tecnico || "", musculos: o.musculos || []}]});
      } else {
        const sys = "El usuario describe un ejercicio físico. Identifícalo, indica su nombre técnico e identifica obligatoriamente al menos los 3 músculos principales involucrados (por ejemplo, para Vuelos laterales podrías listar Deltoides lateral, Supraespinoso, e Hombro anterior). Devuelve un JSON. Ejemplo:\n" +
                    "{\n" +
                    "  \"nombre\": \"Vuelos laterales en polea\",\n" +
                    "  \"tecnico\": \"Abducción de hombro en polea baja\",\n" +
                    "  \"musculos\": [\"Deltoides lateral\", \"Supraespinoso\", \"Trapecio\"]\n" +
                    "}";
        const schema = {
          type: "OBJECT",
          properties: {
            nombre: { type: "STRING" },
            tecnico: { type: "STRING" },
            musculos: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Lista con al menos 3 músculos principales trabajados"
            }
          },
          required: ["nombre", "tecnico", "musculos"]
        };
        const o = cleanAndParseJSON(await callGemini([{role:"user", content:addText.trim()}], sys, schema));
        setExercises({...exercises, [sel]: [...dayExs, {name: o.nombre || addText.trim(), tecnico: o.tecnico || "", musculos: o.musculos || []}]});
      }
      setAddText(""); 
      setAdding(false);
    } catch(e){ 
      setAddErr("No pude procesar el ejercicio. Intenta con una descripción más directa."); 
    }
    setAddBusy(false);
  };

  const analyzeProg = async(ex) => { 
    setProgBusy(ex.name);
    const hist = (exlog[ex.name] || []).slice(0, 8).map(s => {
      const rirStr = (s.rir !== undefined && s.rir !== null) ? `@RIR ${s.rir}` : "";
      const repsNum = parseInt(s.reps);
      const rirNum = (s.rir !== undefined && s.rir !== null && !isNaN(parseInt(s.rir))) ? parseInt(s.rir) : 0;
      const rmVal = (!isNaN(s.w) && !isNaN(repsNum) && repsNum > 0) ? Math.round(s.w * (1 + (repsNum + rirNum) / 30)) : null;
      const rmStr = rmVal ? ` (RM: ${rmVal}kg)` : "";
      return `${fdate(s.date)}: ${s.w}kg x ${s.reps}${rirStr}${rmStr}`;
    }).join(" | ") || "Sin registros previos";
    try{ 
      const sensations = getRecentSensationsText();
      const sys = `Eres el entrenador personal de Bruno. ${getProfileStr(activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Entrega recomendaciones concretas de sobrecarga progresiva y técnica de ejecución. Corto y directo. Si Bruno reporta cansancio, dolor, molestias o fatiga en sus sensaciones o chat reciente, ajusta el entrenamiento proactivamente (bajar carga, deload temporal, o modificar la técnica).`;
      const out = await callGemini([{role:"user", content:`Ejercicio: ${ex.name}. Músculos: ${(ex.musculos || []).join(", ") || "?"}. Historial reciente (nuevo a viejo): ${hist}.\nSensaciones/Notas recientes de Bruno: ${sensations}.\nAnaliza el rendimiento y da pautas de carga/repeticiones para el próximo entrenamiento.`}], sys);
      setProg(p => ({...p, [ex.name]: out})); 
    } catch(e){ 
      setProg(p => ({...p, [ex.name]: aiErr(e)})); 
    } 
    setProgBusy("");
  };

  const suggest = async() => { 
    setDayBusy(true); 
    setDaySug("");
    const hist = dayExs.map(ex => { 
      const a = (exlog[ex.name] || []).slice(0, 3).map(s => {
        const rirStr = (s.rir !== undefined && s.rir !== null) ? `@RIR ${s.rir}` : "";
        return `${s.w}kg x ${s.reps}${rirStr}`;
      }).join(", "); 
      return a ? `${ex.name}: ${a}` : `${ex.name}: sin marcas`; 
    }).join(" | ");
    try{ 
      const sensations = getRecentSensationsText();
      const sys = `Eres el entrenador de fuerza de Bruno. ${getProfileStr(activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Orden del entrenamiento: mantener el orden asignado del split. Respuestas estructuradas y breves. Si Bruno reporta cansancio, dolores o fatiga acumulada en sus sensaciones recientes, adapta de forma proactiva la rutina sugerida hoy reduciendo volumen o intensidad.`;
      const out = await callGemini([{role:"user", content:`Día del Split ${sel}: ${dayObj.name}. Músculos: ${dayMuscles.join(", ")}. Historial reciente: ${hist}.\nSensaciones/Notas recientes de Bruno: ${sensations}.\nPlanifica las series, pesos de calentamiento, y series de trabajo sugeridas hoy.`}], sys);
      setDaySug(out); 
      saveKey("last_day_sug", out);
    } catch(e){ 
      setDaySug(aiErr(e)); 
    } 
    setDayBusy(false);
  };

  const planWeek = async() => { 
    setWkBusy(true); 
    setWk("");
    try{ 
      const sys = `Eres el entrenador deportivo de Bruno. ${getProfileStr(activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Organiza la semana de Bruno de forma realista.`;
      const out = await callGemini([{role:"user", content:"Organiza una distribución semanal de 7 días para sus 4 entrenamientos + descansos. Incluye consejos prácticos para optimizar la recuperación y adaptar el entrenamiento ante imprevistos cotidianos."}], sys);
      setWk(out); 
      saveKey("last_wk_sug", out);
    } catch(e){ 
      setWk(aiErr(e)); 
    } 
    setWkBusy(false);
  };

  const tag = {
    fontSize:10.5,
    fontWeight:700,
    padding:"3px 8px",
    borderRadius:999,
    background:"rgba(74,214,255,.12)",
    color:C.cyan
  };

  return (
    <div className="pop">
      <div className="disp" style={{fontSize:24, color:C.lime, marginBottom:10}}>ENTRENAMIENTO · SPLIT</div>

      {muscleImbalances && muscleImbalances.length > 0 && (
        <div style={{
          background: "rgba(255,107,138,.08)",
          border: `1.5px solid ${C.rose}`,
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6
        }}>
          <div style={{fontSize:13, fontWeight:800, color:C.rose, display:"flex", alignItems:"center", gap:6}}>
            <span>⚠️ Desequilibrio Muscular Detectado</span>
          </div>
          <div style={{fontSize:12, color:C.ink, lineHeight:1.45}}>
            Tu volumen de entrenamiento reciente muestra asimetrías importantes:
          </div>
          <ul style={{margin:0, paddingLeft:16, fontSize:12, color:C.muted}}>
            {muscleImbalances.map((imb, idx) => (
              <li key={idx} style={{marginBottom:2}}>{imb}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mapa de Calor de Volumen Semanal */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"14px 16px", marginBottom:12}}>
        <div style={{display:"flex", alignItems:"center", gap:8, fontSize:12.5, fontWeight:800, marginBottom:10}}>
          <Activity size={15} color={C.lime}/> Volumen Semanal <span style={{color:C.muted, fontWeight:500, fontSize:11}}>(series efectivas en 7 días)</span>
        </div>
        <div className="muscle-heatmap-grid">
          {Object.entries(vol).map(([m, n]) => {
            const styleProps = getHeatColor(n);
            return (
              <div 
                key={m} 
                className="muscle-heatmap-cell"
                style={{
                  backgroundColor: styleProps.bg,
                  borderColor: styleProps.border || C.line,
                  boxShadow: styleProps.boxShadow || "none"
                }}
              >
                <span className="muscle-name" style={{ color: styleProps.text === C.muted ? C.muted : "inherit" }}>{m}</span>
                <span className="muscle-count" style={{ color: styleProps.text, fontWeight: styleProps.fontWeight || 500 }}>{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendario de Historial de Entrenamientos */}
      {(() => {
        const year = calMonth.getFullYear();
        const month = calMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        let startDayOfWeek = firstDayOfMonth.getDay() - 1; // Lunes = 0, ..., Domingo = 6
        if (startDayOfWeek === -1) startDayOfWeek = 6;
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        
        const monthNames = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        const cells = [];
        for (let i = 0; i < startDayOfWeek; i++) {
          cells.push({ type: "empty" });
        }
        for (let d = 1; d <= totalDaysInMonth; d++) {
          const dayDate = new Date(year, month, d);
          const dateStr = getLocalDateStr(dayDate);
          cells.push({
            type: "day",
            dayNum: d,
            dateStr: dateStr,
            isToday: dateStr === getLocalDateStr(new Date()),
            isSelected: dateStr === selectedDateStr,
            hasWorkout: !!workoutSessions[dateStr]
          });
        }

        const handlePrevMonth = () => {
          setCalMonth(new Date(year, month - 1, 1));
        };
        const handleNextMonth = () => {
          setCalMonth(new Date(year, month + 1, 1));
        };

        const selectedDayWorkouts = workoutSessions[selectedDateStr] || null;

        const formatSelectedDateLong = (dStr) => {
          try {
            const parts = dStr.split("-");
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return d.toLocaleDateString("es", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          } catch(e) {
            return dStr;
          }
        };

        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"14px 16px", marginBottom:12}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
              <div style={{display:"flex", alignItems:"center", gap:8, fontSize:12.5, fontWeight:800}}>
                <CalendarDays size={15} color={C.lime}/> Historial de Entrenamientos
              </div>
              <div style={{display:"flex", alignItems:"center", gap:6}}>
                <button 
                  onClick={handlePrevMonth} 
                  style={{
                    background:C.panel2, 
                    border:`1px solid ${C.line}`, 
                    borderRadius:8, 
                    color:C.ink, 
                    width:28, 
                    height:28, 
                    cursor:"pointer", 
                    display:"grid", 
                    placeItems:"center",
                    fontWeight:"bold"
                  }}
                >
                  ◀
                </button>
                <span style={{fontSize:11.5, fontWeight:800, textTransform:"uppercase", color:C.lime, minWidth:80, textAlign:"center"}}>
                  {monthNames[month]} {year}
                </span>
                <button 
                  onClick={handleNextMonth} 
                  style={{
                    background:C.panel2, 
                    border:`1px solid ${C.line}`, 
                    borderRadius:8, 
                    color:C.ink, 
                    width:28, 
                    height:28, 
                    cursor:"pointer", 
                    display:"grid", 
                    placeItems:"center",
                    fontWeight:"bold"
                  }}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Grid del calendario */}
            <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:4, textAlign:"center", marginBottom:8}}>
              {["L", "M", "M", "J", "V", "S", "D"].map((day, idx) => (
                <div key={idx} style={{fontSize:10, fontWeight:800, color:C.muted, paddingBottom:4}}>
                  {day}
                </div>
              ))}
              {cells.map((cell, idx) => {
                if (cell.type === "empty") {
                  return <div key={`empty-${idx}`} style={{height:38}} />;
                }
                const cellBg = cell.isSelected 
                  ? "rgba(107, 78, 255, 0.18)" 
                  : cell.isToday 
                    ? "rgba(74, 214, 255, 0.12)" 
                    : "transparent";
                const cellBorder = cell.isSelected 
                  ? `1px solid ${C.lime}` 
                  : cell.isToday 
                    ? `1px solid ${C.cyan}` 
                    : `1px solid transparent`;
                const cellTextColor = cell.isSelected 
                  ? C.lime 
                  : cell.isToday 
                    ? C.cyan 
                    : C.ink;

                return (
                  <button
                    key={`day-${cell.dayNum}`}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    style={{
                      height:38,
                      background:cellBg,
                      border:cellBorder,
                      borderRadius:10,
                      color:cellTextColor,
                      fontSize:12.5,
                      fontWeight:cell.isSelected || cell.isToday ? 800 : 500,
                      cursor:"pointer",
                      position:"relative",
                      display:"flex",
                      flexDirection:"column",
                      alignItems:"center",
                      justifyContent:"center"
                    }}
                  >
                    <span>{cell.dayNum}</span>
                    {cell.hasWorkout && (
                      <span 
                        style={{
                          width:4, 
                          height:4, 
                          borderRadius:"50%", 
                          backgroundColor:C.lime, 
                          boxShadow:`0 0 6px ${C.lime}`,
                          position:"absolute",
                          bottom:5
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detalle del día seleccionado */}
            <div style={{borderTop:`1px solid ${C.line}`, marginTop:12, paddingTop:12}}>
              <div style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:4}}>
                <span>Detalle de Sesión</span>
                <span style={{color:C.lime}}>{formatSelectedDateLong(selectedDateStr)}</span>
              </div>

              {selectedDayWorkouts && (() => {
                const { totalVol, density, dur } = getSessionStats();
                return (
                  <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10, marginBottom:10}}>
                    <div style={{display:"flex", justifyContent:"space-between", fontSize:12, color:C.ink, marginBottom:8}}>
                      <span>Volumen Efectivo: <b style={{color:C.lime}}>{totalVol.toLocaleString()} kg</b></span>
                      {dur > 0 && <span>Densidad: <b style={{color:C.cyan}}>{density} kg/min</b></span>}
                    </div>
                    <div style={{display:"flex", alignItems:"center", gap:8}}>
                      <span style={{fontSize:11.5, color:C.muted}}>Duración:</span>
                      <input 
                        type="number"
                        value={dur || ""}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          const next = { ...workoutDurations, [selectedDateStr]: val };
                          setWorkoutDurations(next);
                        }}
                        placeholder="minutos"
                        style={{width:70, background:C.bg, border:`1px solid ${C.line}`, borderRadius:6, padding:"4px 8px", fontSize:12, color:C.ink, textAlign:"center"}}
                      />
                      <span style={{fontSize:11.5, color:C.muted}}>minutos</span>
                      <div style={{display:"flex", gap:4, marginLeft:"auto"}}>
                        {[45, 60, 75, 90].map(m => (
                          <button 
                            key={m} 
                            onClick={() => {
                              const next = { ...workoutDurations, [selectedDateStr]: m };
                              setWorkoutDurations(next);
                            }}
                            style={{
                              background: dur === m ? "rgba(74,214,255,.14)" : C.bg,
                              border: `1px solid ${dur === m ? C.cyan : C.line}`,
                              color: dur === m ? C.cyan : C.muted,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "4px 6px",
                              borderRadius: 5,
                              cursor: "pointer"
                            }}
                          >
                            {m} min
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {selectedDayWorkouts ? (
                <div style={{display:"flex", flexDirection:"column", gap:8}}>
                  {Object.entries(selectedDayWorkouts).map(([exName, sets]) => {
                    const globalEx = Object.values(exercises).flat().find(item => item.name === exName) || { name: exName };
                    const isOpen = open === "session-" + exName;
                    const l = last(exName);
                    const cd = chartData(exName);
                    return (
                      <div key={exName} style={{background:C.panel2, border:`1px solid ${isOpen ? C.lime : C.line}`, borderRadius:13, marginBottom:4, overflow:"hidden", position:"relative"}}>
                        <div style={{display:"flex", alignItems:"center"}}>
                          <button 
                            onClick={() => {
                              const nextOpen = isOpen ? null : "session-" + exName;
                              setOpen(nextOpen);
                              if (nextOpen) {
                                const sug = overloadSuggestions && overloadSuggestions[exName];
                                const lastWeight = l ? l.w : "";
                                setW(sug ? String(sug.suggested) : String(lastWeight));
                                setReps(l ? String(l.reps) : "");
                              } else {
                                setW("");
                                setReps("");
                              }
                            }} 
                            style={{flex:1, background:"none", border:"none", cursor:"pointer", padding:"12px 14.5px 12px 14px", display:"flex", alignItems:"center", gap:10, color:C.ink, textAlign:"left"}}
                          >
                            <div style={{flex:1, paddingRight:32}}>
                              <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
                                <div style={{fontSize:13.5, fontWeight:600}}>{exName}</div>
                                {overloadSuggestions && overloadSuggestions[exName] && (
                                  <span style={{
                                    fontSize:10, 
                                    fontWeight:700, 
                                    background:"rgba(107,78,255,0.12)", 
                                    color:C.lime, 
                                    border:`1px solid rgba(107,78,255,0.3)`, 
                                    borderRadius:6, 
                                    padding:"2px 6px",
                                    display:"inline-flex",
                                    alignItems:"center",
                                    gap:3
                                  }}>
                                    💡 Sugerido: {overloadSuggestions[exName].suggested} kg
                                  </span>
                                )}
                                {plateauAlerts && plateauAlerts.some(p => p.exercise === exName) && (
                                  <span style={{
                                    fontSize:10, 
                                    fontWeight:700, 
                                    background:"rgba(255,177,61,0.12)", 
                                    color:C.amber, 
                                    border:`1px solid rgba(255,177,61,0.3)`, 
                                    borderRadius:6, 
                                    padding:"2px 6px",
                                    display:"inline-flex",
                                    alignItems:"center",
                                    gap:3
                                  }}>
                                    ⚠️ Estancamiento
                                  </span>
                                )}
                              </div>
                              {globalEx.tecnico && <div style={{fontSize:11, color:C.muted, fontStyle:"italic"}}>{globalEx.tecnico}</div>}
                              {l ? (
                                <div style={{fontSize:11.5, color:C.cyan, marginTop:2}}>última: {l.w} kg × {l.reps} · {fdate(l.date)}</div>
                              ) : (
                                <div style={{fontSize:11.5, color:C.muted, marginTop:2}}>{(globalEx.musculos || []).join(" · ")}</div>
                              )}
                            </div>
                            <span style={{color:C.muted, fontSize:14, marginRight:26}}>{isOpen ? "▴" : "▾"}</span>
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditExObj({ ex: globalEx, isEditing: false, isSession: true, sessionDate: selectedDateStr });
                            }}
                            style={{
                              position:"absolute",
                              right:12,
                              top:12,
                              background:"rgba(107,78,255,0.06)",
                              border:`1px solid rgba(107,78,255,0.2)`,
                              borderRadius:8,
                              width:28,
                              height:28,
                              cursor:"pointer",
                              color:C.lime,
                              display:"grid",
                              placeItems:"center",
                              zIndex:10
                            }}
                          >
                            <NotebookPen size={12} />
                          </button>
                        </div>

                        {!isOpen && (
                          <div style={{padding:"0 14px 12px 14px", display:"flex", flexWrap:"wrap", gap:6}}>
                            {sets.map((s, idx) => (
                              <span 
                                key={idx} 
                                style={{
                                  fontSize:11, 
                                  background:C.bg, 
                                  border:`1px solid ${s.type === "warmup" ? C.line : s.type === "dropset" ? C.rose : C.cyan}`, 
                                  borderRadius:6, 
                                  padding:"4px 8px", 
                                  color: s.type === "warmup" ? C.muted : s.type === "dropset" ? C.rose : C.cyan,
                                  textDecoration: s.type === "warmup" ? "line-through" : "none"
                                }}>
                                {s.w} kg × {s.reps} {s.type === "warmup" ? "(C)" : s.type === "dropset" ? "(Drop)" : ""}
                              </span>
                            ))}
                          </div>
                        )}

                        {isOpen && (
                          <div className="pop" style={{padding:"0 14px 14px"}}>
                            {(globalEx.musculos || []).length > 0 && (
                              <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:10}}>
                                {globalEx.musculos.map(m => (<span key={m} style={tag}>{m}</span>))}
                              </div>
                            )}

                            {/* Tipo de set */}
                            <div style={{display:"flex", gap:6, marginBottom:8}}>
                              <button 
                                onClick={() => setSetType("work")} 
                                style={{
                                  flex:1, padding:"6px", borderRadius:8, fontSize:10, fontWeight:700, cursor:"pointer", 
                                  border:`1px solid ${setType === "work" ? C.lime : C.line}`, 
                                  background: setType === "work" ? "rgba(107,78,255,.12)" : "transparent", 
                                  color: setType === "work" ? C.lime : C.muted
                                }}
                              >
                                Serie Efectiva
                              </button>
                              <button 
                                onClick={() => setSetType("warmup")} 
                                style={{
                                  flex:1, padding:"6px", borderRadius:8, fontSize:10, fontWeight:700, cursor:"pointer", 
                                  border:`1px solid ${setType === "warmup" ? C.amber : C.line}`, 
                                  background: setType === "warmup" ? "rgba(255,177,61,.12)" : "transparent", 
                                  color: setType === "warmup" ? C.amber : C.muted
                                }}
                              >
                                Calentamiento
                              </button>
                              <button 
                                onClick={() => setSetType("dropset")} 
                                style={{
                                  flex:1, padding:"6px", borderRadius:8, fontSize:10, fontWeight:700, cursor:"pointer", 
                                  border:`1px solid ${setType === "dropset" ? C.rose : C.line}`, 
                                  background: setType === "dropset" ? "rgba(255,107,152,.15)" : "transparent", 
                                  color: setType === "dropset" ? C.rose : C.muted
                                }}
                              >
                                Drop Set
                              </button>
                            </div>

                            {/* Agregar series */}
                            <div style={{display:"flex", gap:4, marginBottom:8, width:"100%"}}>
                              <input 
                                value={w} 
                                onChange={e => setW(e.target.value)} 
                                type="number" 
                                inputMode="decimal" 
                                className="ph" 
                                placeholder="kg" 
                                style={{flex:1.2, minWidth:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 5px", color:C.ink, fontSize:13.5, outline:"none"}}
                              />
                              <input 
                                value={reps} 
                                onChange={e => setReps(e.target.value)} 
                                className="ph" 
                                placeholder="reps" 
                                style={{flex:1, minWidth:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 5px", color:C.ink, fontSize:13.5, outline:"none"}}
                              />
                              <select 
                                value={rir} 
                                onChange={e => setRir(e.target.value)} 
                                style={{width:54, minWidth:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 2px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center", cursor:"pointer"}}
                              >
                                <option value="-">RIR</option>
                                <option value="0">RIR 0</option>
                                <option value="1">RIR 1</option>
                                <option value="2">RIR 2</option>
                                <option value="3">RIR 3</option>
                                <option value="4">RIR 4+</option>
                              </select>
                              <input 
                                value={setsCount} 
                                onChange={e => setSetsCount(e.target.value)} 
                                type="number"
                                inputMode="numeric"
                                className="ph" 
                                placeholder="ser." 
                                style={{width:44, minWidth:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 2px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center"}}
                              />
                              <button onClick={() => addSet(exName)} style={{width:36, height:35, borderRadius:9, border:"none", background:C.lime, color:"#0c0e0b", cursor:"pointer", fontSize:18, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center"}}>＋</button>
                            </div>

                            <Chart entries={cd}/>

                            <details style={{marginTop:6, marginBottom:10, background:C.panel, border:`1px solid ${C.line}`, borderRadius:9, padding:"6px 10px", cursor:"pointer"}}>
                              <summary style={{fontSize:11, fontWeight:800, color:C.lime, outline:"none"}}>💡 Guía RIR (Repeticiones en Reserva)</summary>
                              <div style={{fontSize:10.5, color:C.muted, marginTop:4, lineHeight:1.45}}>
                                <b>RIR 0:</b> Fallo total. Esfuerzo máximo.<br/>
                                <b>RIR 1-2:</b> Ideal para hipertrofia (1-2 reps en recámara).<br/>
                                <b>RIR 3-4:</b> Calentamiento o trabajo técnico.<br/>
                                <span style={{color:C.cyan}}>* El 1RM se calcula considerando RIR (1RM = w * (1 + (reps + rir) / 30)).</span>
                              </div>
                            </details>

                            {sets.length === 0 && (
                              <div style={{fontSize:12, color:C.muted, padding:"4px 0"}}>Sin registros en esta sesión.</div>
                            )}

                            {sets.map((s, i) => (
                              <div key={i} style={{display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderTop:`1px solid ${C.line}`, opacity: s.type === "warmup" ? 0.6 : 1}}>
                                <span style={{fontSize:12.5, color:C.muted, minWidth:54}}>{formatDay(s.date)}</span>
                                <span style={{fontSize:13.5, fontWeight:600}}>{s.w} kg</span>
                                <span style={{fontSize:13, color:C.muted}}>
                                  × {s.reps}
                                  {s.rir !== undefined && s.rir !== null ? ` @RIR ${s.rir}` : ""}
                                </span>
                                {(() => {
                                  const repsNum = parseInt(s.reps);
                                  const rirNum = (s.rir !== undefined && s.rir !== null && !isNaN(parseInt(s.rir))) ? parseInt(s.rir) : 0;
                                  if (!isNaN(s.w) && !isNaN(repsNum) && repsNum > 0) {
                                    const rmVal = s.w * (1 + (repsNum + rirNum) / 30);
                                    return (
                                      <span style={{fontSize:11, color:C.cyan, background:"rgba(74,214,255,0.08)", padding:"2px 5px", borderRadius:4, fontWeight:600}}>
                                        RM: {Math.round(rmVal)} kg
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                                {s.type === "warmup" && (
                                  <span style={{fontSize:10, color:C.amber, background:"rgba(255,177,61,.12)", padding:"2px 6px", borderRadius:4, fontWeight:700}}>
                                    Calentamiento
                                  </span>
                                )}
                                {s.type === "dropset" && (
                                  <span style={{fontSize:10, color:C.rose, background:"rgba(255,107,152,.12)", padding:"2px 6px", borderRadius:4, fontWeight:700}}>
                                    Drop Set
                                  </span>
                                )}
                                <button onClick={() => delSetFromDay(exName, s)} style={{marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:C.muted}}>
                                  <Trash2 size={14}/>
                                </button>
                              </div>
                            ))}

                            <div style={{display:"flex", gap:8, marginTop:10}}>
                              <button 
                                onClick={() => analyzeProg(globalEx)} 
                                disabled={progBusy === exName} 
                                style={{flex:4, padding:"9px", borderRadius:9, border:`1px solid ${C.line}`, background:C.panel2, color:C.lime, cursor:"pointer", fontWeight:700, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6}}
                              >
                                {progBusy === exName ? <><Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>Analizando…</> : <><Sparkles size={13}/>Recomendación de carga</>}
                              </button>
                              <button onClick={() => delExFromSession(exName, selectedDateStr)} style={{flex:1, padding:"9px 12px", borderRadius:9, border:`1px solid ${C.line}`, background:"none", color:C.muted, cursor:"pointer", fontSize:12.5}}>Quitar</button>
                            </div>
                            {prog[exName] && <AIPanel title="Consejo de Progresión" busy={false} text={prog[exName]} color={C.cyan} onClose={() => setProg(p => ({...p, [exName]: ""}))}/>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{textAlign:"center", color:C.muted, fontSize:12, padding:"16px 0", background:C.panel2, border:`1px dashed ${C.line}`, borderRadius:10}}>
                  Descanso o sin ejercicios registrados este día
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Selector del Split */}
      <div style={{display:"flex", gap:6, marginBottom:14, alignItems:"center", flexWrap:"wrap", width:"100%"}}>
        {(splits || DEFAULT_SPLITS).map(d => (
          <button 
            key={d.key} 
            onClick={() => { setSel(d.key); setDaySug(""); setOpen(null); setAdding(false); }} 
            style={{
              width:44, 
              height:44, 
              borderRadius:11, 
              fontFamily:"'Bebas Neue'", 
              fontSize:22, 
              cursor:"pointer", 
              border:`1px solid ${sel === d.key ? C.lime : C.line}`, 
              background: sel === d.key ? "rgba(107,78,255,.14)" : C.panel, 
              color: sel === d.key ? C.lime : C.muted
            }}
          >
            {d.key}
          </button>
        ))}
        <button
          onClick={startEditSplits}
          style={{
            marginLeft:"auto",
            padding:"6px 12px",
            height:36,
            borderRadius:10,
            background: C.panel2,
            border: `1px solid ${C.line}`,
            color: C.lime,
            fontSize:11.5,
            fontWeight:800,
            cursor:"pointer",
            display:"flex",
            alignItems:"center",
            gap:4
          }}
        >
          <Settings size={12}/>
          <span>Editar Splits</span>
        </button>
      </div>

      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <div className="disp" style={{fontSize:24}}>{dayObj.name.toUpperCase()}</div>
          <span style={{fontSize:11, color:C.muted, fontWeight:700}}>{dayObj.fuel}</span>
        </div>
        {dayMuscles.length > 0 && (
          <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:8}}>
            {dayMuscles.map(m => (<span key={m} style={tag}>{m}</span>))}
          </div>
        )}
      </div>

      <div style={{fontSize:12, fontWeight:800, color:C.muted, textTransform:"uppercase", marginBottom:8, marginTop:4}}>
        Ejercicios Atajo (Pulsa para abrir y registrar series)
      </div>

      {/* Listado de ejercicios del día */}
      {dayExs.map(ex => {
        const isOpen = open === ex.name; 
        const l = last(ex.name); 
        const cd = chartData(ex.name);
        return (
          <div key={ex.name} style={{background:C.panel, border:`1px solid ${isOpen ? C.lime : C.line}`, borderRadius:13, marginBottom:9, overflow:"hidden", position:"relative"}}>
            <div style={{display:"flex", alignItems:"center"}}>
              <button 
                onClick={() => {
                  const nextOpen = isOpen ? null : ex.name;
                  setOpen(nextOpen);
                  if (nextOpen) {
                    const sug = overloadSuggestions && overloadSuggestions[ex.name];
                    const lastWeight = l ? l.w : "";
                    setW(sug ? String(sug.suggested) : String(lastWeight));
                    setReps(l ? String(l.reps) : "");
                  } else {
                    setW("");
                    setReps("");
                  }
                }} 
                style={{flex:1, background:"none", border:"none", cursor:"pointer", padding:"12px 14.5px 12px 14px", display:"flex", alignItems:"center", gap:10, color:C.ink, textAlign:"left"}}
              >
                <div style={{flex:1, paddingRight:32}}>
                  <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
                    <div style={{fontSize:13.5, fontWeight:600}}>{ex.name}</div>
                    {overloadSuggestions && overloadSuggestions[ex.name] && (
                      <span style={{
                        fontSize:10, 
                        fontWeight:700, 
                        background:"rgba(107,78,255,0.12)", 
                        color:C.lime, 
                        border:`1px solid rgba(107,78,255,0.3)`, 
                        borderRadius:6, 
                        padding:"2px 6px",
                        display:"inline-flex",
                        alignItems:"center",
                        gap:3
                      }}>
                        💡 Sugerido: {overloadSuggestions[ex.name].suggested} kg
                      </span>
                    )}
                    {plateauAlerts && plateauAlerts.some(p => p.exercise === ex.name) && (
                      <span style={{
                        fontSize:10, 
                        fontWeight:700, 
                        background:"rgba(255,177,61,0.12)", 
                        color:C.amber, 
                        border:`1px solid rgba(255,177,61,0.3)`, 
                        borderRadius:6, 
                        padding:"2px 6px",
                        display:"inline-flex",
                        alignItems:"center",
                        gap:3
                      }}>
                        ⚠️ Estancamiento
                      </span>
                    )}
                  </div>
                  {ex.tecnico && <div style={{fontSize:11, color:C.muted, fontStyle:"italic"}}>{ex.tecnico}</div>}
                  {l ? (
                    <div style={{fontSize:11.5, color:C.cyan, marginTop:2}}>última: {l.w} kg × {l.reps} · {fdate(l.date)}</div>
                  ) : (
                    <div style={{fontSize:11.5, color:C.muted, marginTop:2}}>{(ex.musculos || []).join(" · ")}</div>
                  )}
                </div>
                <span style={{color:C.muted, fontSize:14, marginRight:26}}>{isOpen ? "▴" : "▾"}</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditExObj({ ex, isEditing: false });
                }}
                style={{
                  position:"absolute",
                  right:12,
                  top:12,
                  background:"rgba(107,78,255,0.06)",
                  border:`1px solid rgba(107,78,255,0.2)`,
                  borderRadius:8,
                  width:28,
                  height:28,
                  cursor:"pointer",
                  color:C.lime,
                  display:"grid",
                  placeItems:"center",
                  zIndex:10
                }}
              >
                <NotebookPen size={12} />
              </button>
            </div>
            
            {isOpen && (
              <div className="pop" style={{padding:"0 14px 14px"}}>
                {(ex.musculos || []).length > 0 && (
                  <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:10}}>
                    {ex.musculos.map(m => (<span key={m} style={tag}>{m}</span>))}
                  </div>
                )}
                
                {/* Tipo de set */}
                <div style={{display:"flex", gap:6, marginBottom:8}}>
                  <button 
                    onClick={() => setSetType("work")} 
                    style={{
                      flex:1, 
                      padding:"6px", 
                      borderRadius:8, 
                      fontSize:10, 
                      fontWeight:700, 
                      cursor:"pointer", 
                      border:`1px solid ${setType === "work" ? C.lime : C.line}`, 
                      background: setType === "work" ? "rgba(107,78,255,.12)" : "transparent", 
                      color: setType === "work" ? C.lime : C.muted
                    }}
                  >
                    Serie Efectiva
                  </button>
                  <button 
                    onClick={() => setSetType("warmup")} 
                    style={{
                      flex:1, 
                      padding:"6px", 
                      borderRadius:8, 
                      fontSize:10, 
                      fontWeight:700, 
                      cursor:"pointer", 
                      border:`1px solid ${setType === "warmup" ? C.amber : C.line}`, 
                      background: setType === "warmup" ? "rgba(255,177,61,.12)" : "transparent", 
                      color: setType === "warmup" ? C.amber : C.muted
                    }}
                  >
                    Calentamiento
                  </button>
                  <button 
                    onClick={() => setSetType("dropset")} 
                    style={{
                      flex:1, 
                      padding:"6px", 
                      borderRadius:8, 
                      fontSize:10, 
                      fontWeight:700, 
                      cursor:"pointer", 
                      border:`1px solid ${setType === "dropset" ? C.rose : C.line}`, 
                      background: setType === "dropset" ? "rgba(255,107,152,.15)" : "transparent", 
                      color: setType === "dropset" ? C.rose : C.muted
                    }}
                  >
                    Drop Set
                  </button>
                </div>

                {/* Agregar series */}
                <div style={{display:"flex", gap:4, marginBottom:8, width:"100%"}}>
                  <input 
                    value={w} 
                    onChange={e => setW(e.target.value)} 
                    type="number" 
                    inputMode="decimal" 
                    className="ph" 
                    placeholder="kg" 
                    style={{flex:1.2, minWidth:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 5px", color:C.ink, fontSize:13.5, outline:"none"}}
                  />
                  <input 
                    value={reps} 
                    onChange={e => setReps(e.target.value)} 
                    className="ph" 
                    placeholder="reps" 
                    style={{flex:1, minWidth:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 5px", color:C.ink, fontSize:13.5, outline:"none"}}
                  />
                  <select 
                    value={rir} 
                    onChange={e => setRir(e.target.value)} 
                    style={{width:54, minWidth:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 2px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center", cursor:"pointer"}}
                  >
                    <option value="-">RIR</option>
                    <option value="0">RIR 0</option>
                    <option value="1">RIR 1</option>
                    <option value="2">RIR 2</option>
                    <option value="3">RIR 3</option>
                    <option value="4">RIR 4+</option>
                  </select>
                  <input 
                    value={setsCount} 
                    onChange={e => setSetsCount(e.target.value)} 
                    type="number"
                    inputMode="numeric"
                    className="ph" 
                    placeholder="ser." 
                    style={{width:44, minWidth:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 2px", color:C.ink, fontSize:13.5, outline:"none", textAlign:"center"}}
                  />
                  <button onClick={() => addSet(ex.name)} style={{width:36, height:35, borderRadius:9, border:"none", background:C.lime, color:"#0c0e0b", cursor:"pointer", fontSize:18, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center"}}>＋</button>
                </div>

                <Chart entries={cd}/>

                <details style={{marginTop:6, marginBottom:10, background:C.panel, border:`1px solid ${C.line}`, borderRadius:9, padding:"6px 10px", cursor:"pointer"}}>
                  <summary style={{fontSize:11, fontWeight:800, color:C.lime, outline:"none"}}>💡 Guía RIR (Repeticiones en Reserva)</summary>
                  <div style={{fontSize:10.5, color:C.muted, marginTop:4, lineHeight:1.45}}>
                    <b>RIR 0:</b> Fallo total. Esfuerzo máximo.<br/>
                    <b>RIR 1-2:</b> Ideal para hipertrofia (1-2 reps en recámara).<br/>
                    <b>RIR 3-4:</b> Calentamiento o trabajo técnico.<br/>
                    <span style={{color:C.cyan}}>* El 1RM se calcula considerando RIR (1RM = w * (1 + (reps + rir) / 30)).</span>
                  </div>
                </details>

                {(exlog[ex.name] || []).length === 0 && (
                  <div style={{fontSize:12, color:C.muted, padding:"4px 0"}}>Sin registros en bitácora.</div>
                )}

                {(exlog[ex.name] || []).map((s, i) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderTop:`1px solid ${C.line}`, opacity: s.type === "warmup" ? 0.6 : 1}}>
                    <span style={{fontSize:12.5, color:C.muted, minWidth:54}}>{fdate(s.date)}</span>
                    <span style={{fontSize:13.5, fontWeight:600}}>{s.w} kg</span>
                    <span style={{fontSize:13, color:C.muted}}>
                      × {s.reps}
                      {s.rir !== undefined && s.rir !== null ? ` @RIR ${s.rir}` : ""}
                    </span>
                    {(() => {
                      const repsNum = parseInt(s.reps);
                      const rirNum = (s.rir !== undefined && s.rir !== null && !isNaN(parseInt(s.rir))) ? parseInt(s.rir) : 0;
                      if (!isNaN(s.w) && !isNaN(repsNum) && repsNum > 0) {
                        const rmVal = s.w * (1 + (repsNum + rirNum) / 30);
                        return (
                          <span style={{fontSize:11, color:C.cyan, background:"rgba(74,214,255,0.08)", padding:"2px 5px", borderRadius:4, fontWeight:600}}>
                            RM: {Math.round(rmVal)} kg
                          </span>
                        );
                      }
                      return null;
                    })()}
                    {s.type === "warmup" && (
                      <span style={{fontSize:10, color:C.amber, background:"rgba(255,177,61,.12)", padding:"2px 6px", borderRadius:4, fontWeight:700}}>
                        Calentamiento
                      </span>
                    )}
                    <button onClick={() => delSet(ex.name, i)} style={{marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:C.muted}}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}

                <div style={{display:"flex", gap:8, marginTop:10}}>
                  <button 
                    onClick={() => analyzeProg(ex)} 
                    disabled={progBusy === ex.name} 
                    style={{flex:1, padding:"9px", borderRadius:9, border:`1px solid ${C.line}`, background:C.panel2, color:C.lime, cursor:"pointer", fontWeight:700, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6}}
                  >
                    {progBusy === ex.name ? <><Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>Analizando…</> : <><Sparkles size={13}/>Recomendación de carga</>}
                  </button>
                  <button onClick={() => setConfirmRemoveEx(ex.name)} style={{padding:"9px 12px", borderRadius:9, border:`1px solid ${C.line}`, background:"none", color:C.muted, cursor:"pointer", fontSize:12.5}}>Quitar</button>
                </div>
                {prog[ex.name] && <AIPanel title="Consejo de Progresión" busy={false} text={prog[ex.name]} color={C.cyan} onClose={() => setProg(p => ({...p, [ex.name]: ""}))}/>}
              </div>
            )}
          </div>
        );
      })}

      {/* Sección Unificada de Carga/Adición */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:14, marginBottom:12, marginTop:10}}>
        <div style={{display:"flex", borderBottom:`1px solid ${C.line}`, marginBottom:12}}>
          <button 
            onClick={() => setExTab("texto")}
            style={{
              flex:1, padding:"8px 0", background:"none", border:"none", 
              borderBottom: exTab === "texto" ? `2px solid ${C.lime}` : "none",
              color: exTab === "texto" ? C.lime : C.muted, fontWeight:700, fontSize:12.5, cursor:"pointer"
            }}
          >
            Cargar por Texto (IA)
          </button>
          <button 
            onClick={() => setExTab("nuevo")}
            style={{
              flex:1, padding:"8px 0", background:"none", border:"none", 
              borderBottom: exTab === "nuevo" ? `2px solid ${C.lime}` : "none",
              color: exTab === "nuevo" ? C.lime : C.muted, fontWeight:700, fontSize:12.5, cursor:"pointer"
            }}
          >
            Añadir Ejercicio Manual
          </button>
        </div>

        {exTab === "texto" ? (
          <div>
            {!verificationList ? (
              <>
                <textarea 
                  value={importText} 
                  onChange={e => setImportText(e.target.value)} 
                  className="ph" 
                  rows={3} 
                  placeholder="Ej: hoy hice sentadilla 4x100kg x 10 reps, prensa 3x180kg x 12 reps..." 
                  style={{width:"100%", resize:"none", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none"}}
                />
                <button 
                  onClick={handleParseText} 
                  disabled={importBusy || !importText.trim()} 
                  style={{
                    width:"100%",
                    marginTop:8, 
                    padding:"11px", 
                    borderRadius:10, 
                    border:"none", 
                    cursor:"pointer", 
                    background: importBusy ? C.panel2 : C.lime, 
                    color: importBusy ? C.muted : "#0c0e0b", 
                    fontWeight:800, 
                    fontSize:14, 
                    display:"flex", 
                    alignItems:"center", 
                    justifyContent:"center", 
                    gap:8
                  }}
                >
                  {importBusy ? <><Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/>Procesando con IA…</> : "Analizar y cargar"}
                </button>
                {importErr && <div style={{color:C.rose, fontSize:12, marginTop:8}}>{importErr}</div>}
              </>
            ) : (
              <div className="pop" style={{display:"flex", flexDirection:"column", gap:12}}>
                <div style={{fontSize:12, color:C.muted}}>
                  Verifica los ejercicios y series detectados. Ajusta los nombres o valores para evitar duplicados.
                </div>
                
                {verificationList.map((item, idx) => (
                  <div key={idx} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10}}>
                    <div style={{display:"flex", flexDirection:"column", gap:6, marginBottom:8}}>
                      <div style={{fontSize:12, color:C.muted}}>
                        IA detectó: <b style={{color:C.ink}}>{item.originalName}</b>
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:6}}>
                        <span style={{fontSize:11.5, color:C.muted, whiteSpace:"nowrap"}}>Guardar como:</span>
                        <select 
                          value={item.targetName}
                          onChange={e => {
                            const next = [...verificationList];
                            next[idx].targetName = e.target.value;
                            setVerificationList(next);
                          }}
                          style={{flex:1, background:C.bg, border:`1px solid ${C.line}`, borderRadius:6, padding:"4px 8px", fontSize:12.5, color:C.ink}}
                        >
                          {allExistingExercises.map(exName => (
                            <option key={exName} value={exName}>{exName}</option>
                          ))}
                          <option value="__NEW__">{`[Crear nuevo: "${item.originalName}"]`}</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{display:"flex", flexDirection:"column", gap:4}}>
                      {item.sets.map((set, sIdx) => (
                        <div key={sIdx} style={{display:"flex", alignItems:"center", gap:6}}>
                          <span style={{fontSize:11, color:C.muted, width:45}}>Serie {sIdx + 1}:</span>
                          <input 
                            value={set.w}
                            onChange={e => {
                              const next = [...verificationList];
                              next[idx].sets[sIdx].w = e.target.value;
                              setVerificationList(next);
                            }}
                            type="number"
                            placeholder="kg"
                            style={{width:55, background:C.bg, border:`1px solid ${C.line}`, borderRadius:6, padding:"4px 6px", fontSize:12, color:C.ink, textAlign:"center"}}
                          />
                          <span style={{fontSize:11, color:C.muted}}>kg</span>
                          <input 
                            value={set.reps}
                            onChange={e => {
                              const next = [...verificationList];
                              next[idx].sets[sIdx].reps = e.target.value;
                              setVerificationList(next);
                            }}
                            placeholder="Reps"
                            style={{width:55, background:C.bg, border:`1px solid ${C.line}`, borderRadius:6, padding:"4px 6px", fontSize:12, color:C.ink, textAlign:"center"}}
                          />
                          <span style={{fontSize:11, color:C.muted}}>reps</span>
                          
                          <select 
                            value={set.type || "work"}
                            onChange={e => {
                              const next = [...verificationList];
                              next[idx].sets[sIdx].type = e.target.value;
                              setVerificationList(next);
                            }}
                            style={{background:C.bg, border:`1px solid ${C.line}`, borderRadius:6, padding:"4px", fontSize:11, color:C.ink}}
                          >
                            <option value="work">Trabajo</option>
                            <option value="warmup">Calentamiento</option>
                          </select>

                          <button 
                            onClick={() => {
                              const next = [...verificationList];
                              next[idx].sets.splice(sIdx, 1);
                              setVerificationList(next);
                            }}
                            style={{marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:C.muted}}
                          >
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const next = [...verificationList];
                          const lastSet = next[idx].sets[next[idx].sets.length - 1] || { w: "60", reps: "10", type: "work" };
                          next[idx].sets.push({ w: lastSet.w, reps: lastSet.reps, type: lastSet.type });
                          setVerificationList(next);
                        }}
                        style={{alignSelf:"flex-start", background:"none", border:"none", color:C.lime, fontSize:11.5, fontWeight:700, cursor:"pointer", padding:"4px 0", marginTop:2}}
                      >
                        ＋ Añadir serie
                      </button>
                    </div>
                  </div>
                ))}
                
                <div style={{display:"flex", gap:8, marginTop:4}}>
                  <button 
                    onClick={handleConfirmAndImport}
                    style={{flex:1, padding:"10px", borderRadius:8, border:"none", background:C.lime, color:"#0c0e0b", fontWeight:800, fontSize:13, cursor:"pointer"}}
                  >
                    Confirmar e Importar
                  </button>
                  <button 
                    onClick={() => setVerificationList(null)}
                    style={{padding:"10px 14px", borderRadius:8, border:`1px solid ${C.line}`, background:"none", color:C.muted, fontWeight:700, fontSize:13, cursor:"pointer"}}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{display:"flex", gap:7, marginBottom:10}}>
              <button onClick={() => setAddMode("nombre")} style={{flex:1, padding:"8px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:`1px solid ${addMode === "nombre" ? C.lime : C.line}`, background: addMode === "nombre" ? "rgba(107,78,255,.12)" : "transparent", color: addMode === "nombre" ? C.lime : C.muted}}>
                Sé el nombre
              </button>
              <button onClick={() => setAddMode("describir")} style={{flex:1, padding:"8px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:`1px solid ${addMode === "describir" ? C.lime : C.line}`, background: addMode === "describir" ? "rgba(107,78,255,.12)" : "transparent", color: addMode === "describir" ? C.lime : C.muted}}>
                Describirlo
              </button>
            </div>
            <textarea 
              value={addText} 
              onChange={e => setAddText(e.target.value)} 
              rows={addMode === "describir" ? 3 : 1} 
              className="ph" 
              placeholder={addMode === "nombre" ? "Ej: Hip thrust con barra" : "Ej: En máquina sentado, empujo los agarres hacia afuera separando los muslos..."} 
              style={{width:"100%", resize:"none", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none"}}
            />
            <div style={{display:"flex", gap:8, marginTop:8}}>
              <button 
                onClick={addExercise} 
                disabled={addBusy} 
                style={{flex:1, padding:"10px", borderRadius:10, border:"none", background: addBusy ? C.panel2 : C.lime, color: addBusy ? C.muted : "#0c0e0b", cursor:"pointer", fontWeight:800, fontSize:13.5, display:"flex", alignItems:"center", justifyTarget:"center", justifyContent:"center", gap:6}}
              >
                {addBusy ? <><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Procesando…</> : (addMode === "nombre" ? "Añadir ejercicio" : "Identificar y añadir")}
              </button>
            </div>
            {addErr && <div style={{color:C.rose, fontSize:12, marginTop:8}}>{addErr}</div>}
          </div>
        )}
      </div>

      {/* Botón de Análisis del Entrenamiento */}
      <button 
        onClick={handleAnalyzeWorkout}
        style={{
          width:"100%", 
          marginBottom:12, 
          padding:"12px", 
          borderRadius:12, 
          border:"none", 
          cursor:"pointer", 
          background:`linear-gradient(90deg, ${C.cyan}, ${C.lime})`,
          color:"#0c0e0b",
          fontWeight:800, 
          fontSize:14, 
          display:"flex", 
          alignItems:"center", 
          justifyContent:"center", 
          gap:8
        }}
      >
        <Sparkles size={16}/>
        <span>Analizar entrenamiento de hoy (Coach IA)</span>
      </button>

      {/* Botones de IA del Split */}
      <button 
        onClick={suggest} 
        disabled={dayBusy} 
        style={{width:"100%", marginTop:12, padding:"12px", borderRadius:12, border:"none", cursor:"pointer", background: dayBusy ? C.panel2 : C.lime, color: dayBusy ? C.muted : "#0c0e0b", fontWeight:800, fontSize:14, display:"flex", alignItems:"center", justifyTarget:"center", justifyContent:"center", gap:8}}
      >
        {dayBusy ? <><Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/>Planificando…</> : <><Sparkles size={16}/>Rutina sugerida para hoy</>}
      </button>
      <AIPanel title={`Rutina del Día · ${dayObj.name}`} busy={dayBusy} text={daySug} onClose={() => { setDaySug(""); saveKey("last_day_sug", ""); }}/>

      <button 
        onClick={planWeek} 
        disabled={wkBusy} 
        style={{width:"100%", marginTop:10, padding:"11px", borderRadius:12, border:`1px solid ${C.line}`, cursor:"pointer", background:C.panel, color:C.lime, fontWeight:800, fontSize:13.5, display:"flex", alignItems:"center", justifyTarget:"center", justifyContent:"center", gap:8}}
      >
        {wkBusy ? <><Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/>Planificando…</> : <><CalendarDays size={16}/>Planificación semanal (Distribución)</>}
      </button>
      <AIPanel title="Organización Semanal" busy={wkBusy} text={wk} color={C.cyan} onClose={() => { setWk(""); saveKey("last_wk_sug", ""); }}/>

      {editSetObj && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, bottom:0,
          background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
          display:"grid", placeItems:"center", zIndex:9999, padding:20
        }} onClick={() => setEditSetObj(null)}>
          <div style={{
            background: C.panel, border:`1px solid ${C.line}`, borderRadius:16,
            padding:20, width:"100%", maxWidth:320, display:"flex", flexDirection:"column", gap:12
          }} onClick={e => e.stopPropagation()}>
            {!editSetObj.isEditing ? (
              <>
                <div style={{fontSize:16, fontWeight:800, color:C.ink, textAlign:"center"}}>Opciones de Serie</div>
                <div style={{fontSize:12, color:C.muted, textAlign:"center", marginBottom:8}}>{editSetObj.s.w} kg x {editSetObj.s.reps}</div>
                <button onClick={() => setEditSetObj({...editSetObj, isEditing: true})} style={{background:C.lime, color:"#0c0e0b", fontWeight:800, padding:12, borderRadius:12, border:"none", cursor:"pointer"}}>
                  ✏️ Editar Serie
                </button>
                <button onClick={() => { delSetFromDay(editSetObj.exName, editSetObj.s); setEditSetObj(null); }} style={{background:"rgba(255, 61, 113, 0.15)", color:C.rose, fontWeight:800, padding:12, borderRadius:12, border:`1px solid ${C.rose}`, cursor:"pointer"}}>
                  🗑️ Borrar Serie
                </button>
              </>
            ) : (
              <>
                <div style={{fontSize:16, fontWeight:800, color:C.ink, textAlign:"center", marginBottom:8}}>Editar Serie</div>
                <div style={{display:"flex", gap:8}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700}}>Peso (kg)</label>
                    <input type="number" id="es-w" defaultValue={editSetObj.s.w} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, marginTop:4}} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700}}>Reps</label>
                    <input type="text" id="es-r" defaultValue={editSetObj.s.reps} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, marginTop:4}} />
                  </div>
                </div>
                <button onClick={() => {
                  const newW = parseFloat(document.getElementById("es-w").value);
                  const newReps = document.getElementById("es-r").value;
                  if(!isNaN(newW) && newReps) {
                    const currentDayExlog = exlog[editSetObj.exName] || [];
                    const updatedSets = currentDayExlog.map(old => (old.date === editSetObj.s.date && old.w === editSetObj.s.w && old.reps === editSetObj.s.reps) ? { ...old, w: newW, reps: newReps } : old);
                    setExlog({ ...exlog, [editSetObj.exName]: updatedSets });
                  }
                  setEditSetObj(null);
                }} style={{background:C.lime, color:"#0c0e0b", fontWeight:800, padding:12, borderRadius:12, border:"none", cursor:"pointer", marginTop:8}}>
                  Guardar
                </button>
              </>
            )}
            <button onClick={() => setEditSetObj(null)} style={{background:"transparent", color:C.muted, fontWeight:700, padding:10, border:"none", cursor:"pointer"}}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {editExObj && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, bottom:0,
          background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
          display:"grid", placeItems:"center", zIndex:9999, padding:20
        }} onClick={() => setEditExObj(null)}>
          <div style={{
            background: C.panel, border:`1px solid ${C.line}`, borderRadius:16,
            padding:20, width:"100%", maxWidth:320, display:"flex", flexDirection:"column", gap:12
          }} onClick={e => e.stopPropagation()}>
            {!editExObj.isEditing ? (
              <>
                <div style={{fontSize:16, fontWeight:800, color:C.ink, textAlign:"center"}}>Opciones de Ejercicio</div>
                <div style={{fontSize:12, color:C.muted, textAlign:"center", marginBottom:8}}>
                  {editExObj.ex.name} {editExObj.isSession && `(Sesión: ${formatDay(editExObj.sessionDate)})`}
                </div>
                <button onClick={() => setEditExObj({...editExObj, isEditing: true})} style={{background:C.lime, color:"#0c0e0b", fontWeight:800, padding:12, borderRadius:12, border:"none", cursor:"pointer"}}>
                  ✏️ Editar Ejercicio
                </button>
                {editExObj.isSession && (
                  <button 
                    onClick={() => { 
                      delExFromSession(editExObj.ex.name, editExObj.sessionDate); 
                      setEditExObj(null); 
                    }} 
                    style={{background:"rgba(255, 61, 113, 0.15)", color:C.rose, fontWeight:800, padding:12, borderRadius:12, border:`1px solid ${C.rose}`, cursor:"pointer"}}
                  >
                    🗑️ Quitar de esta Sesión
                  </button>
                )}
                <button 
                  onClick={() => { 
                    delExercise(editExObj.ex.name); 
                    setEditExObj(null); 
                  }} 
                  style={{background:"rgba(255, 61, 113, 0.15)", color:C.rose, fontWeight:700, padding:10, borderRadius:12, border:`1px solid ${C.rose}`, cursor:"pointer", fontSize:12.5}}
                >
                  🗑️ Borrar Ejercicio (Global)
                </button>
              </>
            ) : (
              <>
                <div style={{fontSize:16, fontWeight:800, color:C.ink, textAlign:"center", marginBottom:8}}>Editar Ejercicio</div>
                
                <div style={{display:"flex", flexDirection:"column", gap:8}}>
                  <div>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700}}>Nombre del Ejercicio</label>
                    <input type="text" id="ee-name" defaultValue={editExObj.ex.name} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, marginTop:4}} />
                  </div>
                  
                  <div>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700}}>Nombre Técnico / Ejecución</label>
                    <input type="text" id="ee-tecnico" defaultValue={editExObj.ex.tecnico || ""} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, marginTop:4}} />
                  </div>
                  
                  <div>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700}}>Músculos (separados por coma)</label>
                    <input type="text" id="ee-musculos" defaultValue={(editExObj.ex.musculos || []).join(", ")} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, marginTop:4}} />
                  </div>
                </div>
                
                <button onClick={() => {
                  const newName = document.getElementById("ee-name").value.trim();
                  const newTecnico = document.getElementById("ee-tecnico").value.trim();
                  const newMusculosStr = document.getElementById("ee-musculos").value;
                  const newMusculosList = newMusculosStr.split(",").map(m => m.trim()).filter(Boolean);
                  
                  if(newName) {
                    handleUpdateExercise(editExObj.ex.name, newName, newTecnico, newMusculosList);
                  }
                  setEditExObj(null);
                }} style={{background:C.lime, color:"#0c0e0b", fontWeight:800, padding:12, borderRadius:12, border:"none", cursor:"pointer", marginTop:8}}>
                  Guardar
                </button>
              </>
            )}
            <button onClick={() => setEditExObj(null)} style={{background:"transparent", color:C.muted, fontWeight:700, padding:10, border:"none", cursor:"pointer"}}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {confirmRemoveEx !== null && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "grid", placeItems: "center", zIndex: 9999, padding: 20
        }}>
          <div style={{
            background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16,
            padding: 20, width: "100%", maxWidth: 360, display: "flex",
            flexDirection: "column", gap: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            <div style={{fontSize: 16, fontWeight: 800, color: C.ink, textAlign: "center"}}>
              Quitar Ejercicio
            </div>
            <div style={{fontSize: 12.5, color: C.muted, textAlign: "center"}}>
              ¿Cómo deseas quitar <strong>{confirmRemoveEx}</strong>?
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 8, marginTop: 4}}>
              <button 
                onClick={() => removeExerciseFromSplit(confirmRemoveEx)}
                style={{
                  background: C.panel2, border: `1px solid ${C.line}`, color: C.lime,
                  fontWeight: 800, padding: 12, borderRadius: 12, cursor: "pointer",
                  textAlign: "center"
                }}
              >
                Quitar de este split únicamente
              </button>
              <button 
                onClick={() => removeExerciseGlobally(confirmRemoveEx)}
                style={{
                  background: "rgba(255, 61, 113, 0.12)", border: `1px solid ${C.rose}44`, color: C.rose,
                  fontWeight: 800, padding: 12, borderRadius: 12, cursor: "pointer",
                  textAlign: "center"
                }}
              >
                Eliminar por completo de la app (Borra historial)
              </button>
              <button 
                onClick={() => setConfirmRemoveEx(null)}
                style={{
                  background: "none", border: "none", color: C.muted,
                  fontWeight: 700, padding: 10, cursor: "pointer"
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSplitsEditor && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
          display: "grid", placeItems: "center", zIndex: 9998, padding: 16
        }}>
          <div style={{
            background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16,
            padding: 20, width: "100%", maxWidth: 460, display: "flex",
            flexDirection: "column", gap: 14, maxHeight: "calc(100vh - 32px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span style={{fontSize:14, fontWeight:900, color:C.lime, letterSpacing:".05em"}}>
                ADMINISTRACIÓN DE SPLITS
              </span>
              <button 
                onClick={() => setShowSplitsEditor(false)}
                style={{background:"none", border:"none", color:C.muted, cursor:"pointer", padding:4}}
              >
                <X size={20}/>
              </button>
            </div>

            <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:4, borderBottom:`1px solid ${C.line}`}}>
              {editSplitsData.map((s, idx) => (
                <button
                  key={s.key}
                  onClick={() => setEditingSplitIdx(idx)}
                  style={{
                    padding:"6px 12px", borderRadius:8,
                    background: editingSplitIdx === idx ? `${C.lime}22` : C.panel2,
                    border: `1px solid ${editingSplitIdx === idx ? C.lime : C.line}`,
                    color: editingSplitIdx === idx ? C.lime : C.muted,
                    fontSize:12, fontWeight:800, cursor:"pointer"
                  }}
                >
                  Día {s.key}
                </button>
              ))}
              <button
                onClick={() => {
                  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                  const existingKeys = editSplitsData.map(s => s.key);
                  let nextKey = "A";
                  for (let i = 0; i < alphabet.length; i++) {
                    if (!existingKeys.includes(alphabet[i])) { nextKey = alphabet[i]; break; }
                  }
                  const newDay = { key: nextKey, name: "Nuevo Split " + nextKey, fuel: "Carbo medio", ex: [] };
                  const nextSplits = [...editSplitsData, newDay];
                  setEditSplitsData(nextSplits);
                  setEditingSplitIdx(nextSplits.length - 1);
                }}
                style={{
                  padding:"6px 10px", borderRadius:8, background:"none",
                  border:`1px dashed ${C.line}`, color:C.lime,
                  fontSize:12, fontWeight:800, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:2
                }}
              >
                <Plus size={12}/> Nuevo
              </button>
            </div>

            {editSplitsData[editingSplitIdx] && (
              <div style={{display:"flex", flexDirection:"column", gap:12, overflowY:"auto", flex:1, paddingRight:4}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                  <div>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>Nombre del Split</label>
                    <input 
                      type="text" 
                      value={editSplitsData[editingSplitIdx].name}
                      onChange={e => {
                        const next = [...editSplitsData];
                        next[editingSplitIdx].name = e.target.value;
                        setEditSplitsData(next);
                      }}
                      style={{width:"100%", background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px", fontSize:13, color:C.ink, outline:"none"}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>Combustible / Carbos</label>
                    <select
                      value={editSplitsData[editingSplitIdx].fuel}
                      onChange={e => {
                        const next = [...editSplitsData];
                        next[editingSplitIdx].fuel = e.target.value;
                        setEditSplitsData(next);
                      }}
                      style={{width:"100%", background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px", fontSize:13, color:C.ink, outline:"none"}}
                    >
                      <option value="Carbo alto">Carbo alto</option>
                      <option value="Carbo medio-alto">Carbo medio-alto</option>
                      <option value="Carbo medio">Carbo medio</option>
                      <option value="Carbo bajo">Carbo bajo</option>
                      <option value="Cero Carbos">Cero Carbos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:6}}>Ejercicios ({editSplitsData[editingSplitIdx].ex.length})</label>
                  <div style={{display:"flex", flexDirection:"column", gap:6, maxHeight:180, overflowY:"auto", marginBottom:10}}>
                    {editSplitsData[editingSplitIdx].ex.map((name, exIdx) => (
                      <div key={exIdx} style={{display:"flex", alignItems:"center", justifyContent:"space-between", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px"}}>
                        <span style={{fontSize:12.5, color:C.ink, fontWeight:600}}>{name}</span>
                        <div style={{display:"flex", alignItems:"center", gap:4}}>
                          <button 
                            disabled={exIdx === 0}
                            onClick={() => {
                              const day = { ...editSplitsData[editingSplitIdx] };
                              const nextEx = [...day.ex];
                              const temp = nextEx[exIdx];
                              nextEx[exIdx] = nextEx[exIdx - 1];
                              nextEx[exIdx - 1] = temp;
                              day.ex = nextEx;
                              const nextSplits = [...editSplitsData];
                              nextSplits[editingSplitIdx] = day;
                              setEditSplitsData(nextSplits);
                            }}
                            style={{background:"none", border:"none", color: exIdx === 0 ? C.line : C.muted, cursor: exIdx === 0 ? "default" : "pointer"}}
                          >
                            ▲
                          </button>
                          <button 
                            disabled={exIdx === editSplitsData[editingSplitIdx].ex.length - 1}
                            onClick={() => {
                              const day = { ...editSplitsData[editingSplitIdx] };
                              const nextEx = [...day.ex];
                              const temp = nextEx[exIdx];
                              nextEx[exIdx] = nextEx[exIdx + 1];
                              nextEx[exIdx + 1] = temp;
                              day.ex = nextEx;
                              const nextSplits = [...editSplitsData];
                              nextSplits[editingSplitIdx] = day;
                              setEditSplitsData(nextSplits);
                            }}
                            style={{background:"none", border:"none", color: exIdx === editSplitsData[editingSplitIdx].ex.length - 1 ? C.line : C.muted, cursor: exIdx === editSplitsData[editingSplitIdx].ex.length - 1 ? "default" : "pointer"}}
                          >
                            ▼
                          </button>
                          <button 
                            onClick={() => {
                              const day = { ...editSplitsData[editingSplitIdx] };
                              day.ex = day.ex.filter((_, i) => i !== exIdx);
                              const nextSplits = [...editSplitsData];
                              nextSplits[editingSplitIdx] = day;
                              setEditSplitsData(nextSplits);
                            }}
                            style={{background:"none", border:"none", color:C.rose, cursor:"pointer", padding:2}}
                          >
                            <X size={14}/>
                          </button>
                        </div>
                      </div>
                    ))}
                    {editSplitsData[editingSplitIdx].ex.length === 0 && (
                      <div style={{fontSize:12, color:C.muted, textAlign:"center", padding:"10px 0"}}>Sin ejercicios asignados a este split.</div>
                    )}
                  </div>

                  <div style={{display:"flex", gap:6}}>
                    <input 
                      type="text" 
                      value={newExText}
                      onChange={e => setNewExText(e.target.value)}
                      placeholder="Nombre de ejercicio a añadir..."
                      style={{flex:1, background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px", fontSize:12.5, color:C.ink, outline:"none"}}
                      onKeyDown={e => { 
                        if (e.key === "Enter") { 
                          e.preventDefault(); 
                          const day = { ...editSplitsData[editingSplitIdx] }; 
                          if (newExText.trim() && !day.ex.includes(newExText.trim())) { 
                            day.ex = [...day.ex, newExText.trim()]; 
                            const nextSplits = [...editSplitsData]; 
                            nextSplits[editingSplitIdx] = day; 
                            setEditSplitsData(nextSplits); 
                            setNewExText(""); 
                          } 
                        } 
                      }}
                    />
                    <button 
                      onClick={() => {
                        const day = { ...editSplitsData[editingSplitIdx] };
                        if (newExText.trim() && !day.ex.includes(newExText.trim())) {
                          day.ex = [...day.ex, newExText.trim()];
                          const nextSplits = [...editSplitsData];
                          nextSplits[editingSplitIdx] = day;
                          setEditSplitsData(nextSplits);
                          setNewExText("");
                        }
                      }}
                      style={{padding:"0 14px", background:C.lime, color:"#0c0e0b", border:"none", borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer"}}
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                <div style={{marginTop:"auto", paddingTop:10, borderTop:`1px solid ${C.line}`, display:"flex", justifyContent:"space-between"}}>
                  <button
                    onClick={() => {
                      if (editSplitsData.length <= 1) { alert("Debes tener al menos un split."); return; }
                      if (window.confirm(`¿Seguro que deseas eliminar por completo el Split ${editSplitsData[editingSplitIdx].key}?`)) {
                        const nextSplits = editSplitsData.filter((_, i) => i !== editingSplitIdx);
                        setEditSplitsData(nextSplits);
                        setEditingSplitIdx(Math.max(0, editingSplitIdx - 1));
                      }
                    }}
                    style={{
                      background:"none", border:`1px solid ${C.rose}44`, color:C.rose,
                      borderRadius:8, padding:"6px 12px", fontSize:11.5, fontWeight:700, cursor:"pointer"
                    }}
                  >
                    Eliminar este Día de Split
                  </button>
                </div>
              </div>
            )}

            <div style={{display:"flex", gap:8, borderTop:`1px solid ${C.line}`, paddingTop:12}}>
              <button 
                onClick={() => setShowSplitsEditor(false)}
                style={{flex:1, padding:"10px", background:"none", border:`1px solid ${C.line}`, color:C.muted, borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer"}}
              >
                Cancelar
              </button>
              <button 
                onClick={() => saveSplitsAndSyncExercises(editSplitsData)}
                style={{flex:1, padding:"10px", background:C.lime, color:"#0c0e0b", border:"none", borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer"}}
              >
                Guardar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== TAB REGISTRO / PESO / COMPOSICIÓN CORPORAL ===== */
function Registro({
  notes, setNotes, target, bodyComp, setBodyComp, geminiKey,
  metricslog, setMetricslog, selectedDateStr, saveWeight, activeMetrics,
  foodlog, waterlog, exlog,
  projections, tdeeEstimate, analyzeAndReconfigure, experiments, setExperiments
}){
  const [type, setType] = useState("peso");
  const [statsPeriod, setStatsPeriod] = useState(7); // 7 or 30 days

  const [dailyNutritionData, hasNutritionData, macroStats] = useMemo(() => {
    const today = new Date(selectedDateStr);
    const data = [];
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
    let activeDays = 0;

    for (let i = statsPeriod - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entries = (foodlog || {})[dateStr] || [];
      let kcal = 0, p = 0, c = 0, f = 0;

      if (entries.length > 0) {
        activeDays++;
        entries.forEach(e => {
          kcal += parseFloat(e.kcal) || 0;
          p += parseFloat(e.proteina) || 0;
          c += parseFloat(e.carbo) || 0;
          f += parseFloat(e.grasa) || 0;
        });
        totalKcal += kcal;
        totalP += p;
        totalC += c;
        totalF += f;
      }
      data.push({ date: dateStr, kcal, p, c, f });
    }

    const mStats = activeDays === 0 ? null : {
      kcal: Math.round(totalKcal / activeDays),
      p: Math.round(totalP / activeDays),
      c: Math.round(totalC / activeDays),
      f: Math.round(totalF / activeDays),
      activeDays
    };

    return [data, data.some(d => d.kcal > 0), mStats];
  }, [selectedDateStr, foodlog, statsPeriod]);

  const renderNutritionHistory = () => {
    if (!hasNutritionData) {
      return (
        <div style={{textAlign:"center", color:C.muted, fontSize:12, padding:"24px 0", background:C.panel2, border:`1px dashed ${C.line}`, borderRadius:12, margin:"8px 0"}}>
          No hay registros de comidas en los últimos {statsPeriod} días.
        </div>
      );
    }

    const W = 320, H = 150, pad = 20;
    const maxVal = Math.max(...dailyNutritionData.map(d => d.p * 4 + d.c * 4 + d.f * 9), target ? target.kcal : 2500, 1000);
    
    const barW = (W - 2 * pad) / dailyNutritionData.length;
    const X = i => pad + i * barW;
    const Y = v => H - pad - (v / maxVal) * (H - 2 * pad);
    const targetY = Y(target ? target.kcal : 2500);

    return (
      <div style={{margin:"12px 0 6px"}}>
        {/* Leyenda */}
        <div style={{display:"flex", gap:10, fontSize:10, color:C.muted, marginBottom:8, justifyContent:"center", flexWrap:"wrap"}}>
          <span style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:7, height:7, borderRadius:"50%", background:C.cyan}}/> Proteína</span>
          <span style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:7, height:7, borderRadius:"50%", background:C.amber}}/> Carbohidrato</span>
          <span style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:7, height:7, borderRadius:"50%", background:C.rose}}/> Grasa</span>
          <span style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:10, height:1, borderBottom:`1.5px dashed ${C.lime}`}}/> Objetivo ({target ? target.kcal : 2500})</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:H, display:"block"}}>
          {/* Líneas horizontales de guía */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const yVal = p * maxVal;
            const yPos = Y(yVal);
            return (
              <g key={idx}>
                <line x1={pad} y1={yPos} x2={W - pad} y2={yPos} stroke={C.line} strokeWidth="0.8" strokeDasharray="3,3"/>
                <text x={pad - 4} y={yPos + 3.5} fill={C.muted} fontSize="8.5" textAnchor="end">{yVal.toFixed(0)}</text>
              </g>
            );
          })}

          {/* Línea de objetivo */}
          <line x1={pad} y1={targetY} x2={W - pad} y2={targetY} stroke={C.lime} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.9"/>

          {/* Barras apiladas */}
          {dailyNutritionData.map((d, i) => {
            const pK = d.p * 4;
            const cK = d.c * 4;
            const fK = d.f * 9;
            const totalK = pK + cK + fK;

            if (totalK === 0) return null;

            const pHeight = (pK / maxVal) * (H - 2 * pad);
            const cHeight = (cK / maxVal) * (H - 2 * pad);
            const fHeight = (fK / maxVal) * (H - 2 * pad);

            const yP = H - pad - pHeight;
            const yC = yP - cHeight;
            const yF = yC - fHeight;

            return (
              <g key={i}>
                {/* Proteína (abajo) */}
                {pK > 0 && <rect x={X(i) + 2} y={yP} width={barW - 4} height={pHeight} fill={C.cyan} rx="1"/>}
                {/* Carbohidratos (medio) */}
                {cK > 0 && <rect x={X(i) + 2} y={yC} width={barW - 4} height={cHeight} fill={C.amber} rx="1"/>}
                {/* Grasa (arriba) */}
                {fK > 0 && <rect x={X(i) + 2} y={yF} width={barW - 4} height={fHeight} fill={C.rose} rx="1"/>}
              </g>
            );
          })}
        </svg>

        <div style={{display:"flex", justifyContent:"space-between", fontSize:9, color:C.muted, marginTop:4, padding:`0 ${pad}px`}}>
          <span>{fdate(dailyNutritionData[0].date)}</span>
          <span>{fdate(dailyNutritionData[dailyNutritionData.length - 1].date)}</span>
        </div>

        {/* Tabla detallada de días registrados */}
        <div style={{marginTop:12, borderTop:`1px solid ${C.line}`, paddingTop:8, maxHeight:150, overflowY:"auto"}}>
          <div style={{fontSize:11, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".05em"}}>Detalle Diario:</div>
          {dailyNutritionData
            .filter(d => d.kcal > 0)
            .reverse()
            .map(d => {
              const compliance = target ? (d.kcal / target.kcal) * 100 : 100;
              let dotColor = C.lime;
              if (compliance < 90) dotColor = C.cyan;
              else if (compliance > 110) dotColor = C.rose;

              return (
                <div key={d.date} style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11.5, padding:"5px 0", borderBottom:`1px solid rgba(42,46,32,0.4)`}}>
                  <span style={{fontWeight:600}}>{fdate(d.date + "T12:00:00Z")}</span>
                  <div style={{display:"flex", alignItems:"center", gap:6}}>
                    <span style={{width:6, height:6, borderRadius:"50%", background:dotColor}}/>
                    <span style={{fontWeight:700, color:C.ink}}>{Math.round(d.kcal)} kcal</span>
                  </div>
                  <span style={{color:C.muted, fontSize:10.5}}>P: {Math.round(d.p)}g · C: {Math.round(d.c)}g · G: {Math.round(d.f)}g</span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Water Statistics
  const waterStats = useMemo(() => {
    const today = new Date(selectedDateStr);
    let totalWater = 0;
    let loggedDays = 0;
    for (let i = 0; i < statsPeriod; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const w = (waterlog || {})[dateStr];
      if (w !== undefined) {
        totalWater += w;
        loggedDays++;
      }
    }
    return loggedDays > 0 ? (totalWater / loggedDays).toFixed(1) : "0.0";
  }, [selectedDateStr, waterlog, statsPeriod]);

  // Training Sessions Statistics
  const trainingStats = useMemo(() => {
    const today = new Date(selectedDateStr);
    let count = 0;
    const workoutDays = new Set();
    Object.values(exlog || {}).forEach(sets => {
      (sets || []).forEach(s => {
        if (s && s.date) {
          workoutDays.add(s.date.slice(0, 10));
        }
      });
    });
    for (let i = 0; i < statsPeriod; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (workoutDays.has(dateStr)) {
        count++;
      }
    }
    return count;
  }, [selectedDateStr, exlog, statsPeriod]);

  // Weight Change Statistics
  const weightChangeStats = useMemo(() => {
    const today = new Date(selectedDateStr);
    let newestW = null;
    let oldestW = null;
    
    const sortedWeights = Object.entries(metricslog || {})
      .filter(([dateStr]) => dateStr <= selectedDateStr)
      .map(([dateStr, m]) => ({ date: dateStr, w: m ? m.weight : undefined }))
      .filter(x => x.w !== undefined)
      /* ⚡ Bolt: Lexicographical string comparison is up to 7x faster than new Date() or localeCompare */ .sort((a, b) => b.date < a.date ? -1 : (b.date > a.date ? 1 : 0));
    
    if (sortedWeights.length === 0) return null;
    newestW = sortedWeights[0].w;
    
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() - statsPeriod);
    const limitDateStr = limitDate.toISOString().slice(0, 10);
    
    const oldestEntries = sortedWeights.filter(x => x.date >= limitDateStr);
    if (oldestEntries.length > 0) {
      oldestW = oldestEntries[oldestEntries.length - 1].w;
    }
    
    if (newestW !== null && oldestW !== null) {
      const diff = newestW - oldestW;
      return {
        current: newestW,
        change: diff,
        text: diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`
      };
    }
    return null;
  }, [selectedDateStr, metricslog, statsPeriod]);
  const [text, setText] = useState(""); 
  const [weight, setWeight] = useState("");
  
  const [muscInput, setMuscInput] = useState("");
  const [fatInput, setFatInput] = useState("");
  const [viscInput, setViscInput] = useState("");

  const [brazoDer, setBrazoDer] = useState("");
  const [brazoIzq, setBrazoIzq] = useState("");
  const [musloDer, setMusloDer] = useState("");
  const [musloIzq, setMusloIzq] = useState("");
  const [pantorrillaDer, setPantorrillaDer] = useState("");
  const [pantorrillaIzq, setPantorrillaIzq] = useState("");
  const [cintura, setCintura] = useState("");
  const [pecho, setPecho] = useState("");

  const [busy, setBusy] = useState(false); 
  const [trend, setTrend] = useState("");

  useEffect(() => {
    const entry = metricslog[selectedDateStr] || {};
    setWeight(entry.weight !== undefined ? String(entry.weight) : "");
    setMuscInput(entry.musculo !== undefined ? String(entry.musculo) : "");
    setFatInput(entry.grasaPct !== undefined ? String(entry.grasaPct) : "");
    setViscInput(entry.visceral !== undefined ? String(entry.visceral) : "");
    
    setBrazoDer(entry.brazoDer !== undefined ? String(entry.brazoDer) : "");
    setBrazoIzq(entry.brazoIzq !== undefined ? String(entry.brazoIzq) : "");
    setMusloDer(entry.musloDer !== undefined ? String(entry.musloDer) : "");
    setMusloIzq(entry.musloIzq !== undefined ? String(entry.musloIzq) : "");
    setPantorrillaDer(entry.pantorrillaDer !== undefined ? String(entry.pantorrillaDer) : "");
    setPantorrillaIzq(entry.pantorrillaIzq !== undefined ? String(entry.pantorrillaIzq) : "");
    setCintura(entry.cintura !== undefined ? String(entry.cintura) : "");
    setPecho(entry.pecho !== undefined ? String(entry.pecho) : "");
  }, [selectedDateStr, metricslog]);

  useEffect(() => {
    (async () => {
      const savedTrend = await loadKey("last_trend", "");
      if (savedTrend) setTrend(savedTrend);
    })();
  }, []);
  
  const [busyComp, setBusyComp] = useState(false);
  const [errComp, setErrComp] = useState("");
  const fileCompRef = useRef(null);

  const onPhotoComp = async(e) => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    setBusyComp(true);
    setErrComp("");
    try{
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const media = ["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type) ? file.type : "image/jpeg";
      
      const prompt = "Analiza esta foto o documento (InBody, PDF o foto de balanza/reporte) de composición corporal y extrae de forma precisa: peso total (kg), masa muscular (kg), porcentaje de grasa (%) y opcionalmente nivel de grasa visceral (escala 1-20, aproximado si no sale, pon 9 si no hay datos).";
      const sys = "Eres un analista de datos de salud experto. Extrae los números indicados en el archivo (foto o PDF) y responde estrictamente con el formato JSON.";
      const schema = {
        type: "OBJECT",
        properties: {
          peso: { type: "NUMBER" },
          musculo: { type: "NUMBER" },
          grasaPct: { type: "NUMBER" },
          visceral: { type: "INTEGER" }
        },
        required: ["peso", "musculo", "grasaPct"]
      };
      
      const out = await callGemini([
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media, data: b64 } },
            { type: "text", text: prompt }
          ]
        }
      ], sys, schema);
      
      const o = cleanAndParseJSON(out);
      
      const nextComp = { musculo: o.musculo, grasaPct: o.grasaPct, visceral: o.visceral || activeMetrics.visceral || 9 };
      setBodyComp(nextComp);
      
      const currentMetric = metricslog[selectedDateStr] || {};
      const nextMetricObj = {
        ...currentMetric,
        weight: o.peso,
        musculo: o.musculo,
        grasaPct: o.grasaPct,
        visceral: o.visceral || nextComp.visceral
      };
      const newMetricslog = {
        ...metricslog,
        [selectedDateStr]: nextMetricObj
      };
      setMetricslog(newMetricslog);
      
      const noteDate = new Date(selectedDateStr + "T" + new Date().toTimeString().slice(0, 8)).toISOString();
      const eWeight = {
        id: uid(),
        type: "peso",
        date: noteDate,
        text: `${o.peso} kg`,
        weight: o.peso
      };
      
      const eComp = {
        id: uid(),
        type: "composicion",
        date: noteDate,
        text: `Composición (Reporte/Archivo): Músculo ${o.musculo} kg, Grasa ${o.grasaPct}%, Visceral Grado ${o.visceral || nextComp.visceral}`
      };
      
      const nextNotes = [eComp, eWeight, ...notes];
      setNotes(nextNotes);
      
      const nextWeights = nextNotes.filter(n => n.type === "peso" && n.weight).slice().reverse();
      analyze(nextWeights, nextMetricObj);

    } catch(err) {
      setErrComp("No pude extraer los datos del archivo. Asegúrate de que los números sean legibles y el archivo sea válido.");
    }
    setBusyComp(false);
    e.target.value = "";
  };
  
  const TYPES = { 
    peso: ["Peso", C.cyan], 
    composicion: ["Composición", C.lime],
    perimetros: ["Perímetros", C.cyan],
    entreno: ["Entreno", C.lime], 
    sensacion: ["Estado", C.amber], 
    nota: ["Nota", C.muted] 
  };

  const savePeso = () => {
    const wNum = parseFloat(weight);
    if (isNaN(wNum) || wNum <= 0) return;
    
    const currentMetric = metricslog[selectedDateStr] || {};
    const nextMetric = {
      ...currentMetric,
      weight: wNum,
      musculo: currentMetric.musculo !== undefined ? currentMetric.musculo : (activeMetrics.musculo || 64.7),
      grasaPct: currentMetric.grasaPct !== undefined ? currentMetric.grasaPct : (activeMetrics.grasaPct || 26.2),
      visceral: currentMetric.visceral !== undefined ? currentMetric.visceral : (activeMetrics.visceral || 9)
    };
    const newMetricslog = {
      ...metricslog,
      [selectedDateStr]: nextMetric
    };
    setMetricslog(newMetricslog);
    
    setBodyComp({
      musculo: nextMetric.musculo,
      grasaPct: nextMetric.grasaPct,
      visceral: nextMetric.visceral
    });
    
    const noteDate = new Date(selectedDateStr + "T" + new Date().toTimeString().slice(0, 8)).toISOString();
    const e = {
      id: uid(),
      type: "peso",
      date: noteDate,
      text: `${wNum} kg`,
      weight: wNum
    };
    const nextNotes = [e, ...notes];
    setNotes(nextNotes);
    setWeight("");

    const nextWeights = nextNotes.filter(n => n.type === "peso" && n.weight).slice().reverse();
    analyze(nextWeights, nextMetric);
  };

  const saveComposicion = () => {
    const parsedM = parseFloat(muscInput);
    const parsedF = parseFloat(fatInput);
    const parsedV = parseInt(viscInput) || activeMetrics.visceral || 9;
    
    if (isNaN(parsedM) || isNaN(parsedF)) return;
    
    const currentMetric = metricslog[selectedDateStr] || {};
    const nextMetric = {
      ...currentMetric,
      weight: currentMetric.weight !== undefined ? currentMetric.weight : (activeMetrics.weight || START_W),
      musculo: parsedM,
      grasaPct: parsedF,
      visceral: parsedV
    };
    const newMetricslog = {
      ...metricslog,
      [selectedDateStr]: nextMetric
    };
    setMetricslog(newMetricslog);
    
    setBodyComp({ musculo: parsedM, grasaPct: parsedF, visceral: parsedV });
    
    const noteDate = new Date(selectedDateStr + "T" + new Date().toTimeString().slice(0, 8)).toISOString();
    const e = {
      id: uid(),
      type: "composicion",
      date: noteDate,
      text: `Composición: Músculo ${parsedM} kg, Grasa ${parsedF}%, Visceral Grado ${parsedV}`
    };
    const nextNotes = [e, ...notes];
    setNotes(nextNotes);
    setMuscInput("");
    setFatInput("");
    setViscInput("");

    const nextWeights = nextNotes.filter(n => n.type === "peso" && n.weight).slice().reverse();
    analyze(nextWeights, nextMetric);
  };

  const savePerimetros = () => {
    const currentMetric = metricslog[selectedDateStr] || {};
    const newMetricslog = {
      ...metricslog,
      [selectedDateStr]: {
        ...currentMetric,
        weight: currentMetric.weight !== undefined ? currentMetric.weight : (activeMetrics.weight || START_W),
        musculo: currentMetric.musculo !== undefined ? currentMetric.musculo : (activeMetrics.musculo || 64.7),
        grasaPct: currentMetric.grasaPct !== undefined ? currentMetric.grasaPct : (activeMetrics.grasaPct || 26.2),
        visceral: currentMetric.visceral !== undefined ? currentMetric.visceral : (activeMetrics.visceral || 9),
        brazoDer: brazoDer.trim() !== "" ? parseFloat(brazoDer) : undefined,
        brazoIzq: brazoIzq.trim() !== "" ? parseFloat(brazoIzq) : undefined,
        musloDer: musloDer.trim() !== "" ? parseFloat(musloDer) : undefined,
        musloIzq: musloIzq.trim() !== "" ? parseFloat(musloIzq) : undefined,
        pantorrillaDer: pantorrillaDer.trim() !== "" ? parseFloat(pantorrillaDer) : undefined,
        pantorrillaIzq: pantorrillaIzq.trim() !== "" ? parseFloat(pantorrillaIzq) : undefined,
        cintura: cintura.trim() !== "" ? parseFloat(cintura) : undefined,
        pecho: pecho.trim() !== "" ? parseFloat(pecho) : undefined,
      }
    };
    
    Object.keys(newMetricslog[selectedDateStr]).forEach(k => {
      if (newMetricslog[selectedDateStr][k] === undefined) delete newMetricslog[selectedDateStr][k];
    });
    
    setMetricslog(newMetricslog);
    
    const noteDate = new Date(selectedDateStr + "T" + new Date().toTimeString().slice(0, 8)).toISOString();
    let pText = "Medidas: ";
    if (brazoDer) pText += `Brazos D:${brazoDer} I:${brazoIzq}cm | `;
    if (musloDer) pText += `Muslos D:${musloDer} I:${musloIzq}cm | `;
    if (pantorrillaDer) pText += `Pantorrillas D:${pantorrillaDer} I:${pantorrillaIzq}cm | `;
    if (cintura) pText += `Cintura:${cintura}cm | `;
    if (pecho) pText += `Pecho:${pecho}cm`;
    
    if (pText.endsWith(" | ")) pText = pText.slice(0, -3);
    
    const e = {
      id: uid(),
      type: "nota",
      date: noteDate,
      text: pText
    };
    setNotes([e, ...notes]);
  };

  const saveNota = () => {
    if (!text.trim()) return;
    const noteDate = new Date(selectedDateStr + "T" + new Date().toTimeString().slice(0, 8)).toISOString();
    const e = {
      id: uid(),
      type,
      date: noteDate,
      text: text.trim()
    };
    setNotes([e, ...notes]);
    setText("");
  };

  const add = () => { 
    if (type === "peso") {
      savePeso();
    } else if (type === "composicion") {
      saveComposicion();
    } else if (type === "perimetros") {
      savePerimetros();
    } else {
      saveNota();
    }
  };

  const del = (id) => { 
    const next = notes.filter(n => n.id !== id); 
    setNotes(next); 
  };

  const weights = notes.filter(n => n.type === "peso" && n.weight).slice().reverse();
  const lastW = activeMetrics.weight;
  const startW = weights.length ? weights[0].weight : START_W;
  const chartW = weights.map(x => ({date: x.date, w: x.weight}));
  const goalPct = Math.max(0, Math.min(100, ((startW - lastW) / ((startW - GOAL_W) || 1)) * 100));
  const toGoal = (lastW - GOAL_W);

  let velocityText = "Sin datos de tendencia";
  let projectionText = "";
  if (weights.length >= 2) {
    const firstWEntry = weights[0];
    const lastWEntry = weights[weights.length - 1];
    const tDiffMs = new Date(lastWEntry.date) - new Date(firstWEntry.date);
    const wDiff = firstWEntry.w - lastWEntry.w;
    const weeks = tDiffMs / (1000 * 60 * 60 * 24 * 7);
    if (weeks > 0.05) {
      const ratePerWeek = wDiff / weeks;
      if (ratePerWeek > 0.02) {
        velocityText = `-${ratePerWeek.toFixed(2)} kg/semana`;
        const weeksToGoal = toGoal / ratePerWeek;
        if (weeksToGoal > 0) {
          const goalDate = new Date();
          goalDate.setDate(goalDate.getDate() + (weeksToGoal * 7));
          projectionText = `Meta en ${weeksToGoal.toFixed(1)} semanas (~ ${goalDate.toLocaleDateString("es", {month: 'short', year: 'numeric'})})`;
        } else {
          projectionText = "¡Meta alcanzada!";
        }
      } else if (ratePerWeek < -0.02) {
        velocityText = `+${Math.abs(ratePerWeek).toFixed(2)} kg/semana`;
        projectionText = "Tendencia de ganancia";
      } else {
        velocityText = "Estable (mantenimiento)";
      }
    }
  }

  const getBodyCompHistory = () => {
    const sortedDates = Object.keys(metricslog || {}).sort();
    if (sortedDates.length === 0) return [];
    
    let lastWVal = START_W;
    let lastMVal = bodyComp ? bodyComp.musculo : 64.7;
    let lastGVal = bodyComp ? bodyComp.grasaPct : 26.2;
    
    return sortedDates.map(date => {
      const e = (metricslog || {})[date] || {};
      if (e.weight !== undefined) lastWVal = e.weight;
      if (e.musculo !== undefined) lastMVal = e.musculo;
      if (e.grasaPct !== undefined) lastGVal = e.grasaPct;
      
      const lean = lastWVal * (1 - lastGVal / 100);
      const fat = lastWVal * (lastGVal / 100);
      return {
        date: date + "T12:00:00.000Z",
        lean: parseFloat(lean.toFixed(1)),
        fat: parseFloat(fat.toFixed(1)),
        w: lastWVal
      };
    });
  };

  const bodyCompHistory = getBodyCompHistory();

  const bD = parseFloat(brazoDer);
  const bI = parseFloat(brazoIzq);
  const mD = parseFloat(musloDer);
  const mI = parseFloat(musloIzq);
  const pD = parseFloat(pantorrillaDer);
  const pI = parseFloat(pantorrillaIzq);
  
  const bDiff = (!isNaN(bD) && !isNaN(bI)) ? Math.abs(bD - bI) : 0;
  const mDiff = (!isNaN(mD) && !isNaN(mI)) ? Math.abs(mD - mI) : 0;
  const pDiff = (!isNaN(pD) && !isNaN(pI)) ? Math.abs(pD - pI) : 0;
  
  const showBAsym = bDiff > 0.5;
  const showMAsym = mDiff > 0.5;
  const showPAsym = pDiff > 0.5;

  const rightArmColor = !isNaN(bD) ? (showBAsym && bD > bI ? C.rose : C.cyan) : C.line;
  const leftArmColor = !isNaN(bI) ? (showBAsym && bI > bD ? C.rose : C.cyan) : C.line;
  const rightThighColor = !isNaN(mD) ? (showMAsym && mD > mI ? C.rose : C.cyan) : C.line;
  const leftThighColor = !isNaN(mI) ? (showMAsym && mI > mD ? C.rose : C.cyan) : C.line;
  const rightCalfColor = !isNaN(pD) ? (showPAsym && pD > pI ? C.rose : C.cyan) : C.line;
  const leftCalfColor = !isNaN(pI) ? (showPAsym && pI > pD ? C.rose : C.cyan) : C.line;

  const rightArmWidth = showBAsym && bD > bI ? 6 : 3.5;
  const leftArmWidth = showBAsym && bI > bD ? 6 : 3.5;
  const rightThighWidth = showMAsym && mD > mI ? 7 : 4.5;
  const leftThighWidth = showMAsym && mI > mD ? 7 : 4.5;
  const rightCalfWidth = showPAsym && pD > pI ? 5 : 3.5;
  const leftCalfWidth = showPAsym && pI > pD ? 5 : 3.5;

  const fatWeight = (lastW * (activeMetrics.grasaPct / 100)).toFixed(1);
  const remainingWeight = (lastW - activeMetrics.musculo - parseFloat(fatWeight)).toFixed(1);

  const totalBar = lastW || 1;
  const muscPct = ((activeMetrics.musculo / totalBar) * 100).toFixed(1);
  const fatBarPct = ((parseFloat(fatWeight) / totalBar) * 100).toFixed(1);
  const remPct = (100 - parseFloat(muscPct) - parseFloat(fatBarPct)).toFixed(1);

  const analyze = async(customWeights = null, customMetrics = null) => { 
    setBusy(true); 
    setTrend(""); 
    const weightsToUse = customWeights || weights;
    const metricsToUse = customMetrics || activeMetrics;
    const series = weightsToUse.map(w => `${fdate(w.date)}: ${w.weight}kg`).join(" -> ") || "Sin datos";
    
    // Calculate 7-day nutritional average
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0, loggedDays = 0;
    const today = new Date(selectedDateStr);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entries = (foodlog || {})[dateStr];
      if (entries && entries.length > 0) {
        loggedDays++;
        entries.forEach(e => {
          totalKcal += parseFloat(e.kcal) || 0;
          totalP += parseFloat(e.proteina) || 0;
          totalC += parseFloat(e.carbo) || 0;
          totalF += parseFloat(e.grasa) || 0;
        });
      }
    }
    const nutAvgText = loggedDays > 0 
      ? `Promedio nutricional de los últimos 7 días: ${Math.round(totalKcal / loggedDays)} kcal/día (P: ${Math.round(totalP / loggedDays)}g, C: ${Math.round(totalC / loggedDays)}g, G: ${Math.round(totalF / loggedDays)}g).`
      : "Sin registros nutricionales recientes.";

    try{ 
      const sys = `Eres el coach de Bruno. ${getProfileStr(metricsToUse.weight, metricsToUse.musculo, metricsToUse.grasaPct, metricsToUse.visceral)} Déficit de grasa progresivo, manteniendo masa muscular magra. Corto y al grano.`;
      const out = await callGemini([{role:"user", content:`Historial de peso de Bruno: ${series}. Composición actual: Músculo ${metricsToUse.musculo}kg, Grasa ${metricsToUse.grasaPct}%, Visceral Grado ${metricsToUse.visceral}. ${nutAvgText} Analiza la tendencia y da sugerencias calóricas.`}], sys);
      setTrend(out); 
      saveKey("last_trend", out);
    } catch(e){ 
      setTrend(aiErr(e)); 
    } 
    setBusy(false); 
  };

  const renderGoalBar = (title, val, unit, min, max, idealMin, idealMax, valColor) => {
    const numVal = parseFloat(val) || 0;
    const percent = Math.max(0, Math.min(100, ((numVal - min) / (max - min)) * 100));
    const underPct = ((idealMin - min) / (max - min)) * 100;
    const normalPct = ((idealMax - idealMin) / (max - min)) * 100;
    const overPct = 100 - underPct - normalPct;
    
    let statusText = "Normal";
    let statusColor = C.lime;
    if (numVal < idealMin) {
      statusText = "Bajo";
      statusColor = C.cyan;
    } else if (numVal > idealMax) {
      statusText = "Alto";
      statusColor = C.rose;
    }
    
    return (
      <div style={{marginBottom:14}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4, fontSize:12}}>
          <span style={{fontWeight:700, color:C.ink}}>{title}</span>
          <div style={{display:"flex", gap:6, alignItems:"center"}}>
            <span style={{fontSize:14, fontWeight:800, color:valColor}}>{numVal.toFixed(1)} {unit}</span>
            <span style={{fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:4, background:`rgba(${statusColor === C.cyan ? "74,214,255" : statusColor === C.rose ? "255,107,138" : "205,255,74"},.12)`, color:statusColor}}>
              {statusText}
            </span>
          </div>
        </div>
        <div style={{position:"relative", height:12, background:C.panel2, borderRadius:6, overflow:"hidden", display:"flex", border:`1px solid ${C.line}`}}>
          <div style={{width:`${underPct}%`, height:"100%", background:"rgba(74,214,255,.07)"}}/>
          <div style={{width:`${normalPct}%`, height:"100%", background:"rgba(107,78,255,.10)"}}/>
          <div style={{width:`${overPct}%`, height:"100%", background:"rgba(255,107,138,.07)"}}/>
          
          <div 
            style={{
              position:"absolute",
              left:`${percent}%`,
              top:0,
              bottom:0,
              width:3,
              background:statusColor,
              boxShadow:`0 0 8px ${statusColor}`,
              transform:"translateX(-50%)",
              transition:"left .6s ease"
            }}
          />
        </div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:9.5, color:C.muted, marginTop:2}}>
          <span>mín {min}</span>
          <span>ideal: {idealMin}-{idealMax}</span>
          <span>máx {max}</span>
        </div>
      </div>
    );
  };

  const renderBodyCompChart = (data) => {
    if (!data || data.length < 2) {
      return (
        <div style={{textAlign:"center", color:C.muted, fontSize:12, padding:"24px 0", background:C.panel2, border:`1px dashed ${C.line}`, borderRadius:12, margin:"8px 0"}}>
          Registra peso y composición en al menos 2 días para ver la tendencia de masa magra vs grasa
        </div>
      );
    }
    
    const W = 320, H = 160, pad = 24;
    const allVals = data.flatMap(d => [d.lean, d.fat]);
    const minY = Math.max(0, Math.min(...allVals) - 4);
    const maxY = Math.max(...allVals) + 4;
    const YRange = (maxY - minY) || 1;
    
    const X = i => pad + (i / (data.length - 1)) * (W - 2 * pad);
    const Y = v => H - pad - ((v - minY) / YRange) * (H - 2 * pad);
    
    const leanLine = data.map((d, i) => `${X(i).toFixed(1)},${Y(d.lean).toFixed(1)}`).join(" ");
    const fatLine = data.map((d, i) => `${X(i).toFixed(1)},${Y(d.fat).toFixed(1)}`).join(" ");
    
    const leanArea = `${pad},${H - pad} ${leanLine} ${(W - pad).toFixed(1)},${H - pad}`;
    const fatArea = `${pad},${H - pad} ${fatLine} ${(W - pad).toFixed(1)},${H - pad}`;
    
    return (
      <div style={{margin:"12px 0 6px"}}>
        <div style={{display:"flex", gap:14, fontSize:11, color:C.muted, marginBottom:6, justifyContent:"center"}}>
          <span style={{display:"flex", alignItems:"center", gap:4}}><span style={{width:8, height:8, borderRadius:"50%", background:C.cyan}}/> Masa Magra (kg)</span>
          <span style={{display:"flex", alignItems:"center", gap:4}}><span style={{width:8, height:8, borderRadius:"50%", background:C.amber}}/> Masa Grasa (kg)</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:H, display:"block"}}>
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const yVal = minY + p * YRange;
            const yPos = Y(yVal);
            return (
              <g key={idx}>
                <line x1={pad} y1={yPos} x2={W - pad} y2={yPos} stroke={C.line} strokeWidth="0.8" strokeDasharray="3,3"/>
                <text x={pad - 4} y={yPos + 3.5} fill={C.muted} fontSize="8.5" textAnchor="end">{yVal.toFixed(0)}</text>
              </g>
            );
          })}
          
          <polygon points={leanArea} fill={C.cyan} opacity="0.08"/>
          <polygon points={fatArea} fill={C.amber} opacity="0.08"/>
          
          <polyline points={leanLine} fill="none" stroke={C.cyan} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
          <polyline points={fatLine} fill="none" stroke={C.amber} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
          
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={X(i)} cy={Y(d.lean)} r="3" fill={C.cyan}/>
              <circle cx={X(i)} cy={Y(d.fat)} r="3" fill={C.amber}/>
            </g>
          ))}
        </svg>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:9, color:C.muted, marginTop:2, padding:`0 ${pad}px`}}>
          <span>{fdate(data[0].date)}</span>
          <span>{fdate(data[data.length - 1].date)}</span>
        </div>
      </div>
    );
  };

  const renderProjectionChart = () => {
    if (!projections || projections.length === 0) {
      return (
        <div style={{textAlign:"center", color:C.muted, fontSize:12, padding:"24px 0", background:C.panel2, border:`1px dashed ${C.line}`, borderRadius:12}}>
          No hay datos de proyección disponibles. Registra tu peso e ingesta calórica habitual.
        </div>
      );
    }
    
    const W = 320, H = 160, pad = 24;
    const weights = projections.map(p => p.peso);
    const fats = projections.map(p => p.grasaPct);
    
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const rangeW = (maxW - minW) || 1;
    
    const minF = Math.min(...fats) - 2;
    const maxF = Math.max(...fats) + 2;
    const rangeF = (maxF - minF) || 1;
    
    const X = wk => pad + (wk / 12) * (W - 2 * pad);
    const Y_W = val => H - pad - ((val - minW) / rangeW) * (H - 2 * pad);
    const Y_F = val => H - pad - ((val - minF) / rangeF) * (H - 2 * pad);
    
    const weightLine = projections.map(p => `${X(p.semana).toFixed(1)},${Y_W(p.peso).toFixed(1)}`).join(" ");
    const fatLine = projections.map(p => `${X(p.semana).toFixed(1)},${Y_F(p.grasaPct).toFixed(1)}`).join(" ");
    
    return (
      <div style={{margin:"12px 0 6px"}}>
        <div style={{display:"flex", gap:14, fontSize:11, color:C.muted, marginBottom:8, justifyContent:"center"}}>
          <span style={{display:"flex", alignItems:"center", gap:4}}>
            <span style={{width:8, height:8, borderRadius:"50%", background:C.cyan}}/> Peso Proyectado (kg)
          </span>
          <span style={{display:"flex", alignItems:"center", gap:4}}>
            <span style={{width:8, height:8, borderRadius:"50%", background:C.rose}}/> Grasa Proyectada (%)
          </span>
        </div>
        
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:H, display:"block"}}>
          {[0, 3, 6, 9, 12].map((wk) => {
            const xPos = X(wk);
            return (
              <g key={wk}>
                <line x1={xPos} y1={pad} x2={xPos} y2={H - pad} stroke={C.line} strokeWidth="0.8" strokeDasharray="3,3"/>
                <text x={xPos} y={H - pad + 10} fill={C.muted} fontSize="8" textAnchor="middle">Sem {wk}</text>
              </g>
            );
          })}
          
          <polyline points={weightLine} fill="none" stroke={C.cyan} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
          <polyline points={fatLine} fill="none" stroke={C.rose} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
          
          <circle cx={X(0)} cy={Y_W(projections[0].peso)} r="3.2" fill={C.cyan}/>
          <circle cx={X(0)} cy={Y_F(projections[0].grasaPct)} r="3.2" fill={C.rose}/>
          <circle cx={X(12)} cy={Y_W(projections[12].peso)} r="3.2" fill={C.cyan}/>
          <circle cx={X(12)} cy={Y_F(projections[12].grasaPct)} r="3.2" fill={C.rose}/>
        </svg>
        
        <div style={{marginTop:12, padding:"8px 10px", background:C.panel2, borderRadius:10, border:`1px solid ${C.line}`, fontSize:11.5, color:C.ink, display:"flex", justifyContent:"space-between"}}>
          <div>
            <span style={{color:C.muted}}>Inicio:</span> <b>{projections[0]?.peso} kg</b> · <span style={{color:C.rose}}>{projections[0]?.grasaPct}%</span>
          </div>
          <div>
            <span style={{color:C.muted}}>Semana 12:</span> <b style={{color:C.lime}}>{projections[12]?.peso} kg</b> · <span style={{color:C.rose}}>{projections[12]?.grasaPct}%</span>
          </div>
        </div>
      </div>
    );
  };

  const buttonLabels = {
    peso: "Guardar Peso",
    composicion: "Guardar Composición",
    perimetros: "Guardar Perímetros",
    entreno: "Guardar Entreno",
    sensacion: "Guardar Estado",
    nota: "Guardar Nota"
  };

  return (
    <div className="pop">
      {/* Caja de objetivo de Peso */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"16px 18px", marginBottom:12}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:10}}>
          <div>
            <div style={{fontSize:11, color:C.muted, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase"}}>Peso Actual ({fdate(selectedDateStr + "T12:00:00Z")})</div>
            <div className="disp" style={{fontSize:40, marginTop:2}}>{lastW.toFixed(1)} <span style={{fontSize:16, color:C.muted}}>kg</span></div>
          </div>
          <div style={{textAlign:"right", display:"flex", alignItems:"center", gap:6, color:C.lime, fontWeight:800, fontSize:15}}>
            <Target size={16}/>meta {GOAL_W} kg
          </div>
        </div>
        <div style={{height:9, background:C.panel2, borderRadius:6, overflow:"hidden"}}>
          <div style={{height:"100%", width:goalPct+"%", background:`linear-gradient(90deg,${C.cyan},${C.lime})`, borderRadius:6, transition:"width .6s"}}/>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted, marginTop:5}}>
          <span>{startW} kg inicial</span>
          <span>{toGoal > 0 ? `faltan ${toGoal.toFixed(1)} kg` : "¡Objetivo alcanzado!"}</span>
        </div>
        <div style={{borderTop:`1px solid ${C.line}`, marginTop:10, paddingTop:8, fontSize:11.5, color:C.muted}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
            <span>Tendencia:</span>
            <span style={{color:C.cyan, fontWeight:700}}>{velocityText}</span>
          </div>
          {projectionText && (
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <span>Predicción:</span>
              <span style={{color:C.lime, fontWeight:700, textAlign:"right"}}>{projectionText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Selector de tipo de registro y formulario */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:14, marginBottom:12}}>
        <div style={{display:"flex", gap:6, marginBottom:10, flexWrap:"wrap"}}>
          {Object.keys(TYPES).map(k => (
            <button 
              key={k} 
              onClick={() => setType(k)} 
              style={{
                padding:"6px 11px", 
                borderRadius:999, 
                fontSize:11.5, 
                fontWeight:700, 
                cursor:"pointer", 
                border:`1px solid ${type === k ? TYPES[k][1] : C.line}`, 
                background: type === k ? "rgba(255,255,255,.05)" : "transparent", 
                color: type === k ? TYPES[k][1] : C.muted
              }}
            >
              {TYPES[k][0]}
            </button>
          ))}
        </div>

        {type === "peso" && (
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <Scale size={18} color={C.cyan}/>
            <input 
              value={weight} 
              onChange={e => setWeight(e.target.value)} 
              type="number" 
              inputMode="decimal" 
              className="ph" 
              placeholder="93.9" 
              style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:14, outline:"none"}}
            />
            <span style={{color:C.muted, fontSize:14}}>kg</span>
          </div>
        )}

        {type === "composicion" && (
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <span style={{width:110, fontSize:12.5, color:C.muted}}>Masa Músculo:</span>
              <input 
                value={muscInput} 
                onChange={e => setMuscInput(e.target.value)} 
                type="number" 
                inputMode="decimal" 
                className="ph" 
                placeholder="64.7" 
                style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
              />
              <span style={{color:C.muted, fontSize:13}}>kg</span>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <span style={{width:110, fontSize:12.5, color:C.muted}}>Grasa Corporal:</span>
              <input 
                value={fatInput} 
                onChange={e => setFatInput(e.target.value)} 
                type="number" 
                inputMode="decimal" 
                className="ph" 
                placeholder="26.2" 
                style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
              />
              <span style={{color:C.muted, fontSize:13}}>%</span>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <span style={{width:110, fontSize:12.5, color:C.muted}}>Grasa Visceral:</span>
              <input 
                value={viscInput} 
                onChange={e => setViscInput(e.target.value)} 
                type="number" 
                inputMode="numeric" 
                className="ph" 
                placeholder="9" 
                style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
              />
              <span style={{color:C.muted, fontSize:13}}>Nivel</span>
            </div>

            <div style={{marginTop:8, display:"flex", gap:8}}>
              <button 
                onClick={() => fileCompRef.current.click()} 
                disabled={busyComp} 
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: `1px solid ${C.line}`,
                  background: C.panel2,
                  color: C.lime,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                {busyComp ? <Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/> : <Camera size={16}/>}
                <span>{busyComp ? "Analizando archivo..." : "Escanear foto o PDF con IA"}</span>
              </button>
              <input ref={fileCompRef} type="file" accept="image/*,application/pdf" onChange={onPhotoComp} style={{display:"none"}}/>
            </div>
            {errComp && <div style={{color:C.rose, fontSize:12, marginTop:6}}>{errComp}</div>}
          </div>
        )}

        {type === "perimetros" && (
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <div>
                <span style={{fontSize:11.5, color:C.muted}}>Brazo Der (cm):</span>
                <input 
                  value={brazoDer} 
                  onChange={e => setBrazoDer(e.target.value)} 
                  type="number" 
                  inputMode="decimal" 
                  className="ph" 
                  placeholder="38" 
                  style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
                />
              </div>
              <div>
                <span style={{fontSize:11.5, color:C.muted}}>Brazo Izq (cm):</span>
                <input 
                  value={brazoIzq} 
                  onChange={e => setBrazoIzq(e.target.value)} 
                  type="number" 
                  inputMode="decimal" 
                  className="ph" 
                  placeholder="38" 
                  style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
                />
              </div>
            </div>
            
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <div>
                <span style={{fontSize:11.5, color:C.muted}}>Muslo Der (cm):</span>
                <input 
                  value={musloDer} 
                  onChange={e => setMusloDer(e.target.value)} 
                  type="number" 
                  inputMode="decimal" 
                  className="ph" 
                  placeholder="60" 
                  style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
                />
              </div>
              <div>
                <span style={{fontSize:11.5, color:C.muted}}>Muslo Izq (cm):</span>
                <input 
                  value={musloIzq} 
                  onChange={e => setMusloIzq(e.target.value)} 
                  type="number" 
                  inputMode="decimal" 
                  className="ph" 
                  placeholder="60" 
                  style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
                />
              </div>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <div>
                <span style={{fontSize:11.5, color:C.muted}}>Pantorrilla Der (cm):</span>
                <input 
                  value={pantorrillaDer} 
                  onChange={e => setPantorrillaDer(e.target.value)} 
                  type="number" 
                  inputMode="decimal" 
                  className="ph" 
                  placeholder="40" 
                  style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
                />
              </div>
              <div>
                <span style={{fontSize:11.5, color:C.muted}}>Pantorrilla Izq (cm):</span>
                <input 
                  value={pantorrillaIzq} 
                  onChange={e => setPantorrillaIzq(e.target.value)} 
                  type="number" 
                  inputMode="decimal" 
                  className="ph" 
                  placeholder="40" 
                  style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
                />
              </div>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <div>
                <span style={{fontSize:11.5, color:C.muted}}>Cintura (cm):</span>
                <input 
                  value={cintura} 
                  onChange={e => setCintura(e.target.value)} 
                  type="number" 
                  inputMode="decimal" 
                  className="ph" 
                  placeholder="92" 
                  style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
                />
              </div>
              <div>
                <span style={{fontSize:11.5, color:C.muted}}>Pecho (cm):</span>
                <input 
                  value={pecho} 
                  onChange={e => setPecho(e.target.value)} 
                  type="number" 
                  inputMode="decimal" 
                  className="ph" 
                  placeholder="108" 
                  style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 10px", color:C.ink, fontSize:13, outline:"none"}}
                />
              </div>
            </div>
          </div>
        )}

        {type !== "peso" && type !== "composicion" && type !== "perimetros" && (
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            rows={2} 
            className="ph" 
            placeholder={type === "entreno" ? "Subí press militar en polea..." : type === "sensacion" ? "Fatigado hoy pero bien alimentado..." : "Nota general..."} 
            style={{width:"100%", resize:"none", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none"}}
          />
        )}

        <button onClick={add} style={{width:"100%", marginTop:8, padding:"10px", borderRadius:10, border:"none", cursor:"pointer", background:C.lime, color:"#0c0e0b", fontWeight:800, fontSize:14}}>
          {buttonLabels[type] || "Guardar Registro"}
        </button>
      </div>

      {/* Caja de Composición Corporal InBody (Barras de Objetivo) */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
        <div style={{fontSize:12.5, fontWeight:800, marginBottom:12, display:"flex", alignItems:"center", gap:6}}>
          <Activity size={15} color={C.lime}/> Panel de Composición Corporal Inteligente
        </div>
        
        {renderGoalBar("Peso Corporal", lastW, "kg", 60, 110, 75, 88, C.cyan)}
        {renderGoalBar("Masa Muscular", activeMetrics.musculo, "kg", 45, 85, 55, 66, C.lime)}
        {renderGoalBar("Masa Grasa Corporal", parseFloat(fatWeight), "kg", 5, 35, 8, 15, C.amber)}
        
        <div style={{height:9, background:C.panel2, borderRadius:6, overflow:"hidden", display:"flex", marginTop:16, marginBottom:10}}>
          <div style={{width:muscPct+"%", background:C.cyan, height:"100%"}} title="Músculo"/>
          <div style={{width:fatBarPct+"%", background:C.amber, height:"100%"}} title="Grasa"/>
          <div style={{width:remPct+"%", background:C.line, height:"100%"}} title="Otros (Agua/Huesos)"/>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:10.5, color:C.muted}}>
          <span>Músculo: {muscPct}%</span>
          <span>Grasa: {fatBarPct}%</span>
          <span>Otros: {remPct}%</span>
        </div>

        {/* Indicador de grasa visceral */}
        <div style={{fontSize:11, color:C.muted, display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14}}>
          <span>Grasa Visceral: <b style={{color:C.rose}}>Grado {activeMetrics.visceral}</b></span>
          <span style={{color: activeMetrics.visceral >= 10 ? C.rose : activeMetrics.visceral >= 6 ? C.amber : C.lime, fontWeight:700}}>
            {activeMetrics.visceral >= 10 ? "Alerta" : activeMetrics.visceral >= 6 ? "Moderado" : "Saludable"}
          </span>
        </div>
        <div className="visceral-indicator">
          {Array.from({length: 12}).map((_, i) => {
            let color = C.line;
            if (i < activeMetrics.visceral) {
              color = activeMetrics.visceral >= 10 ? C.rose : activeMetrics.visceral >= 6 ? C.amber : C.lime;
            }
            return (
              <div key={i} className="visceral-dot" style={{ backgroundColor: color }}/>
            );
          })}
        </div>
      </div>

      {/* Gráfico Histórico de Masa Magra vs Masa Grasa */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
        <div style={{fontSize:12.5, fontWeight:800, marginBottom:2}}>Evolución: Masa Magra vs Masa Grasa</div>
        {renderBodyCompChart(bodyCompHistory)}
      </div>

      {/* Indicador Visual de Asimetrías de Perímetros */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
        <div style={{fontSize:12.5, fontWeight:800, marginBottom:4, display:"flex", alignItems:"center", gap:6}}>
          <ClipboardList size={15} color={C.lime}/> Mapa Visual de Asimetrías
        </div>
        <div style={{fontSize:11.5, color:C.muted, marginBottom:14}}>
          Diferencias bilaterales mayores a 0.5 cm se marcan en color naranja/rojo.
        </div>
        
        <div style={{display:"flex", gap:14, alignItems:"center", flexWrap:"wrap", justifyContent:"center"}}>
          {/* SVG Body Outline */}
          <div style={{background:C.panel2, borderRadius:12, padding:8, border:`1px solid ${C.line}`}}>
            <svg width="200" height="260" viewBox="0 0 200 260" style={{display:"block", margin:"0 auto"}}>
              {/* Head */}
              <circle cx="100" cy="30" r="12" fill="none" stroke={C.muted} strokeWidth="2"/>
              <text x="100" y="33" fill={C.muted} fontSize="8" textAnchor="middle" fontWeight="bold">Bruno</text>
              
              {/* Neck */}
              <line x1="100" y1="42" x2="100" y2="48" stroke={C.muted} strokeWidth="2"/>
              
              {/* Torso */}
              <path d="M 80,48 L 120,48 L 112,120 L 88,120 Z" fill="none" stroke={C.muted} strokeWidth="2"/>
              <text x="100" y="85" fill={C.muted} fontSize="8.5" textAnchor="middle">Cintura: {activeMetrics.cintura || "?"}cm</text>
              <text x="100" y="68" fill={C.muted} fontSize="8.5" textAnchor="middle">Pecho: {activeMetrics.pecho || "?"}cm</text>
              
              {/* Pelvis */}
              <path d="M 88,120 L 112,120 L 115,135 L 85,135 Z" fill="none" stroke={C.muted} strokeWidth="1.8"/>
              
              {/* Arms */}
              <path d="M 80,48 L 55,100" fill="none" stroke={rightArmColor} strokeWidth={rightArmWidth} strokeLinecap="round"/>
              <text x="45" y="75" fill={rightArmColor} fontSize="9" textAnchor="end" fontWeight="bold">D: {bD || "?"}</text>
              
              <path d="M 120,48 L 145,100" fill="none" stroke={leftArmColor} strokeWidth={leftArmWidth} strokeLinecap="round"/>
              <text x="155" y="75" fill={leftArmColor} fontSize="9" textAnchor="start" fontWeight="bold">I: {bI || "?"}</text>
              
              {/* Thighs */}
              <path d="M 90,135 L 82,190" fill="none" stroke={rightThighColor} strokeWidth={rightThighWidth} strokeLinecap="round"/>
              <text x="45" y="165" fill={rightThighColor} fontSize="9" textAnchor="end" fontWeight="bold">D: {mD || "?"}</text>
              
              <path d="M 110,135 L 118,190" fill="none" stroke={leftThighColor} strokeWidth={leftThighWidth} strokeLinecap="round"/>
              <text x="155" y="165" fill={leftThighColor} fontSize="9" textAnchor="start" fontWeight="bold">I: {mI || "?"}</text>
              
              {/* Calves */}
              <path d="M 82,190 L 82,240" fill="none" stroke={rightCalfColor} strokeWidth={rightCalfWidth} strokeLinecap="round"/>
              <text x="45" y="215" fill={rightCalfColor} fontSize="9" textAnchor="end" fontWeight="bold">D: {pD || "?"}</text>
              
              <path d="M 118,190 L 118,240" fill="none" stroke={leftCalfColor} strokeWidth={leftCalfWidth} strokeLinecap="round"/>
              <text x="155" y="215" fill={leftCalfColor} fontSize="9" textAnchor="start" fontWeight="bold">I: {pI || "?"}</text>

              {/* Asymmetry Warnings overlays */}
              {showBAsym && (
                <g>
                  <rect x="75" y="105" width="50" height="12" rx="3" fill="rgba(255,107,138,0.9)"/>
                  <text x="100" y="114" fill="#000" fontSize="7.5" textAnchor="middle" fontWeight="bold">Δ Brazos: {bDiff.toFixed(1)}</text>
                </g>
              )}
              {showMAsym && (
                <g>
                  <rect x="75" y="145" width="50" height="12" rx="3" fill="rgba(255,107,138,0.9)"/>
                  <text x="100" y="154" fill="#000" fontSize="7.5" textAnchor="middle" fontWeight="bold">Δ Muslos: {mDiff.toFixed(1)}</text>
                </g>
              )}
              {showPAsym && (
                <g>
                  <rect x="75" y="200" width="50" height="12" rx="3" fill="rgba(255,107,138,0.9)"/>
                  <text x="100" y="209" fill="#000" fontSize="7.5" textAnchor="middle" fontWeight="bold">Δ Pantorrillas: {pDiff.toFixed(1)}</text>
                </g>
              )}
            </svg>
          </div>
          
          {/* Warnings List & Suggestions */}
          <div style={{flex:1, minWidth:220, display:"flex", flexDirection:"column", gap:8}}>
            {(!showBAsym && !showMAsym && !showPAsym) ? (
              <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:12, padding:12, fontSize:12.5, color:C.muted}}>
                ✔ Simetría muscular correcta (diferencias bilaterales ≤ 0.5 cm). Sigue así.
              </div>
            ) : (
              <>
                <div style={{background:"rgba(255,107,138,.08)", border:`1px solid ${C.rose}`, borderRadius:12, padding:12}}>
                  <div style={{fontSize:12, fontWeight:800, color:C.rose, marginBottom:6, display:"flex", alignItems:"center", gap:4}}>
                    <ShieldAlert size={14}/> Asimetrías Significativas Detectadas
                  </div>
                  <ul style={{margin:0, paddingLeft:16, fontSize:12, color:C.ink, lineHeight:1.4}}>
                    {showBAsym && (
                      <li style={{marginBottom:4}}>
                        Brazos: diferencia de <b style={{color:C.rose}}>{bDiff.toFixed(1)} cm</b> (Lado {bD > bI ? "Derecho" : "Izquierdo"} dominante).
                      </li>
                    )}
                    {showMAsym && (
                      <li style={{marginBottom:4}}>
                        Muslos: diferencia de <b style={{color:C.rose}}>{mDiff.toFixed(1)} cm</b> (Lado {mD > mI ? "Derecho" : "Izquierdo"} dominante).
                      </li>
                    )}
                    {showPAsym && (
                      <li style={{marginBottom:4}}>
                        Pantorrillas: diferencia de <b style={{color:C.rose}}>{pDiff.toFixed(1)} cm</b> (Lado {pD > pI ? "Derecho" : "Izquierdo"} dominante).
                      </li>
                    )}
                  </ul>
                </div>
                
                <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:12, padding:12}}>
                  <div style={{fontSize:11.5, fontWeight:800, color:C.lime, marginBottom:4}}>Recomendación de Entrenamiento Unilateral:</div>
                  <div style={{fontSize:12, color:C.muted, lineHeight:1.4}}>
                    Introduce ejercicios unilaterales (mancuernas/poleas) en tus rutinas. Inicia siempre el set con el miembro no dominante (más débil) y limita el miembro dominante al mismo número de repeticiones y peso.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas Globales y Resúmenes */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <div style={{fontSize:12.5, fontWeight:800, display:"flex", alignItems:"center", gap:6}}>
            <LineChart size={15} color={C.lime}/> Estadísticas y Resúmenes
          </div>
          <div style={{display:"flex", gap:4}}>
            {[7, 30].map(d => (
              <button
                key={d}
                onClick={() => setStatsPeriod(d)}
                style={{
                  background: statsPeriod === d ? "rgba(107,78,255,.14)" : C.panel2,
                  border: `1px solid ${statsPeriod === d ? C.lime : C.line}`,
                  color: statsPeriod === d ? C.lime : C.muted,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                {d === 7 ? "7 Días" : "30 Días"}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10}}>
          <div style={{background:C.panel2, borderRadius:12, padding:12, border:`1px solid ${C.line}`, gridColumn:"span 2"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{fontSize:10.5, color:C.muted}}>Metabolismo Estimado (TDEE Real)</div>
                <div style={{fontSize:16, fontWeight:800, color:C.cyan, marginTop:3}}>
                  {tdeeEstimate ? `${tdeeEstimate} kcal/día` : "Calculando... (mín. 3 semanas de datos)"}
                </div>
              </div>
              <Activity size={16} color={C.cyan} />
            </div>
            <div style={{fontSize:9.5, color:C.muted, marginTop:4, lineHeight:1.3}}>
              Calculado en base a tu ingesta histórica y variaciones de peso reales.
            </div>
          </div>

          <div style={{background:C.panel2, borderRadius:12, padding:10, border:`1px solid ${C.line}`}}>
            <div style={{fontSize:10.5, color:C.muted}}>Calorías Promedio</div>
            <div style={{fontSize:15, fontWeight:800, color:C.lime, marginTop:3}}>
              {macroStats ? `${macroStats.kcal} kcal/día` : "Sin datos"}
            </div>
            {macroStats && (
              <div style={{fontSize:9.5, color:C.muted, marginTop:2, lineHeight:1.2}}>
                P: {macroStats.p}g · C: {macroStats.c}g · G: {macroStats.f}g
              </div>
            )}
          </div>
          <div style={{background:C.panel2, borderRadius:12, padding:10, border:`1px solid ${C.line}`}}>
            <div style={{fontSize:10.5, color:C.muted}}>Hidratación Promedio</div>
            <div style={{fontSize:15, fontWeight:800, color:C.cyan, marginTop:3}}>
              {waterStats} L/día
            </div>
            <div style={{fontSize:9.5, color:C.muted, marginTop:2}}>
              Meta: 3-4 Litros
            </div>
          </div>
          <div style={{background:C.panel2, borderRadius:12, padding:10, border:`1px solid ${C.line}`}}>
            <div style={{fontSize:10.5, color:C.muted}}>Entrenamientos</div>
            <div style={{fontSize:15, fontWeight:800, color:C.lime, marginTop:3}}>
              {trainingStats} {trainingStats === 1 ? "sesión" : "sesiones"}
            </div>
            <div style={{fontSize:9.5, color:C.muted, marginTop:2}}>
              Frecuencia en el período
            </div>
          </div>
          <div style={{background:C.panel2, borderRadius:12, padding:10, border:`1px solid ${C.line}`}}>
            <div style={{fontSize:10.5, color:C.muted}}>Variación de Peso</div>
            <div style={{fontSize:15, fontWeight:800, color: weightChangeStats && weightChangeStats.change <= 0 ? C.lime : C.rose, marginTop:3}}>
              {weightChangeStats ? weightChangeStats.text : "Sin datos"}
            </div>
            <div style={{fontSize:9.5, color:C.muted, marginTop:2}}>
              Diferencia en el período
            </div>
          </div>
        </div>
      </div>

      {chartW.length >= 2 && (
        <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"12px 16px 6px", marginBottom:12}}>
          <div style={{fontSize:12.5, fontWeight:800, marginBottom:2}}>Tendencia de Peso (kg)</div>
          <Chart entries={chartW} color={C.cyan} height={140}/>
        </div>
      )}

      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"12px 16px 12px", marginBottom:12}}>
        <div style={{fontSize:12.5, fontWeight:800, marginBottom:2}}>Proyección Corporal a 12 Semanas (IA)</div>
        {renderProjectionChart()}
      </div>

      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
        <div style={{fontSize:12.5, fontWeight:800, marginBottom:2}}>Historial Nutricional Acumulado</div>
        {renderNutritionHistory()}
      </div>

      {weights.length > 0 && (
        <>
          <button 
            onClick={analyze} 
            disabled={busy} 
            style={{width:"100%", padding:"11px", borderRadius:12, border:`1px solid ${C.line}`, cursor:"pointer", background:C.panel, color:C.lime, fontWeight:800, fontSize:13.5, display:"flex", alignItems:"center", justifyTarget:"center", justifyContent:"center", gap:8, marginBottom:4}}
          >
            {busy ? <><Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/>Analizando…</> : <><LineChart size={16}/>Analizar peso y composición corporal (IA)</>}
          </button>
          <AIPanel title="Análisis de Tendencia" busy={busy} text={trend} color={C.cyan} onClose={() => { setTrend(""); saveKey("last_trend", ""); }}/>
        </>
      )}

      {notes.length === 0 && <div style={{color:C.muted, fontSize:13, textAlign:"center", padding:"16px 0"}}>Tu bitácora está vacía.</div>}
      
      {notes.map(n => { 
        const col = (TYPES[n.type] || ["", C.muted])[1]; 
        const d = new Date(n.date);
        return (
          <div key={n.id} className="pop" style={{
            background:C.panel, 
            border:`1px solid ${C.line}`, 
            borderRadius:13, 
            padding:"11px 14px", 
            marginBottom:9, 
            display:"flex", 
            gap:10, 
            alignItems:"flex-start"
          }}>
            <div style={{flex:1}}>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:3}}>
                <span style={{fontSize:10, fontWeight:800, letterSpacing:".08em", textTransform:"uppercase", color:col}}>
                  {(TYPES[n.type] || ["Nota"])[0]}
                </span>
                <span style={{fontSize:11, color:C.muted}}>
                  {fdate(n.date)} · {d.toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"})}
                </span>
              </div>
              <div style={{fontSize:13.5}}>{n.text}</div>
            </div>
            <button onClick={() => del(n.id)} style={{background:"none", border:"none", cursor:"pointer", color:C.muted}}>
              <Trash2 size={16}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ===== TAB PLAN / DIETA Y LISTA DE COMPRAS ===== */
function Plan({presetKey, setPresetKey, customPresets, setCustomPresets, shoppingList, setShoppingList, geminiKey, meals, setMeals, activeMetrics, setShowNutritionModal, setModalVals}){
  const target = customPresets[presetKey] || customPresets.personalizado || DEFAULT_PRESETS.personalizado;
  // Local state for macro editor — avoids async-lag with controlled inputs
  const [editVals, setEditVals] = React.useState({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
  const [editDirty, setEditDirty] = React.useState(false);
  // Tracks previous preset so we can compute the scale factor when switching modes
  const prevPlanRef = React.useRef({ key: presetKey, kcal: target.kcal });
  // Sync editVals when target changes; scale meal portions when switching training mode
  React.useEffect(() => {
    const { key: prevKey, kcal: prevKcal } = prevPlanRef.current;
    prevPlanRef.current = { key: presetKey, kcal: target.kcal };
    setEditVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
    setEditDirty(false);
    // Only scale meals when the preset MODE changes (not when macros are edited in-place,
    // since updateMacroAndAdjustMeals / updateAllMacrosAndAdjustMeals already handle that)
    if (prevKey !== presetKey && prevKcal && prevKcal !== target.kcal && target.kcal > 0) {
      const factor = target.kcal / prevKcal;
      const nextMeals = meals.map(meal => {
        let kcalStr = meal.kcal;
        const m = meal.kcal.match(/(\d+)/);
        if (m) kcalStr = meal.kcal.replace(/\d+/, Math.round(parseInt(m[1]) * factor));
        const opts = meal.opts.map(opt =>
          opt.replace(/(\d+(\.\d+)?)\s*(g|ml|scoop|scoops|huevo|huevos|clara|claras|rebanada|rebanadas|tostada|tostadas|unidades|unidad)\b/gi,
            (_, n, _d, u) => {
              const v = Math.round(parseFloat(n) * factor * 10) / 10;
              return `${Number.isInteger(v) ? v : v.toFixed(1)} ${u}`;
            })
        );
        return { ...meal, kcal: kcalStr, opts };
      });
      setMeals(nextMeals);
    }
  }, [presetKey, target.kcal, target.p, target.c, target.f]);

  const updateMacroAndAdjustMeals = (type, numVal) => {
    const oldTarget = { ...target };
    const nextVals = { kcal: target.kcal, p: target.p, c: target.c, f: target.f };
    nextVals[type] = numVal;
    
    let factor = 1;
    if (type === "kcal") {
      factor = numVal / oldTarget.kcal;
      nextVals.p = Math.round(oldTarget.p * factor);
      nextVals.c = Math.round(oldTarget.c * factor);
      nextVals.f = Math.round(oldTarget.f * factor);
    } else {
      const newKcal = nextVals.p * 4 + nextVals.c * 4 + nextVals.f * 9;
      nextVals.kcal = newKcal;
      factor = newKcal / oldTarget.kcal;
    }
    
    if (factor > 0 && factor !== 1) {
      const nextMeals = meals.map(meal => {
        let newKcalStr = meal.kcal;
        const kcalMatch = meal.kcal.match(/(\d+)/);
        if (kcalMatch) {
          const val = parseInt(kcalMatch[1]);
          const scaledVal = Math.round(val * factor);
          newKcalStr = meal.kcal.replace(/\d+/, scaledVal);
        }
        
        const nextOpts = meal.opts.map(opt => {
          return opt.replace(/(\d+(\.\d+)?)\s*(g|ml|scoop|scoops|huevo|huevos|clara|claras|rebanada|rebanadas|tostada|tostadas|unidades|unidad)\b/gi, (match, numStr, decimal, unitWord) => {
            const val = parseFloat(numStr);
            const scaled = Math.round(val * factor * 10) / 10;
            const formatted = Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
            return `${formatted} ${unitWord}`;
          });
        });
        
        return {
          ...meal,
          kcal: newKcalStr,
          opts: nextOpts
        };
      });
      setMeals(nextMeals);
    }
    
    const newPresets = {
      ...customPresets,
      [presetKey]: {
        ...customPresets[presetKey],
        ...nextVals
      }
    };
    setCustomPresets(newPresets, false);
    setEditVals(nextVals);
  };

  const handleLongPress = (type, currentVal) => {
    let promptMsg = "";
    if (type === "kcal") promptMsg = "Ingresa el nuevo objetivo de Calorías Diarias (kcal):";
    else if (type === "p") promptMsg = "Ingresa el nuevo objetivo de Proteína (g):";
    else if (type === "c") promptMsg = "Ingresa el nuevo objetivo de Carbohidratos (g):";
    else if (type === "f") promptMsg = "Ingresa el nuevo objetivo de Grasas (g):";
    
    const newVal = prompt(promptMsg, currentVal);
    if (newVal === null) return;
    
    const numVal = parseInt(newVal);
    if (isNaN(numVal) || numVal <= 0) {
      alert("Por favor ingresa un número válido mayor a 0.");
      return;
    }
    
    updateMacroAndAdjustMeals(type, numVal);
  };

  const bindLongPress = (type, currentVal) => {
    let timer = null;
    const start = (e) => {
      timer = setTimeout(() => {
        handleLongPress(type, currentVal);
      }, 700);
    };
    const clear = () => {
      if (timer) clearTimeout(timer);
    };
    return {
      onMouseDown: start,
      onMouseUp: clear,
      onMouseLeave: clear,
      onTouchStart: start,
      onTouchEnd: clear
    };
  };

  const commitMacros = () => {
    const oldTarget = { ...target };
    const nextVals = { ...editVals };
    
    let factor = 1;
    if (nextVals.kcal !== oldTarget.kcal) {
      factor = nextVals.kcal / oldTarget.kcal;
    } else if (nextVals.p !== oldTarget.p || nextVals.c !== oldTarget.c || nextVals.f !== oldTarget.f) {
      const newKcal = nextVals.p * 4 + nextVals.c * 4 + nextVals.f * 9;
      nextVals.kcal = newKcal;
      factor = newKcal / oldTarget.kcal;
    }
    
    if (factor > 0 && factor !== 1) {
      const nextMeals = meals.map(meal => {
        let newKcalStr = meal.kcal;
        const kcalMatch = meal.kcal.match(/(\d+)/);
        if (kcalMatch) {
          const val = parseInt(kcalMatch[1]);
          const scaledVal = Math.round(val * factor);
          newKcalStr = meal.kcal.replace(/\d+/, scaledVal);
        }
        
        const nextOpts = meal.opts.map(opt => {
          return opt.replace(/(\d+(\.\d+)?)\s*(g|ml|scoop|scoops|huevo|huevos|clara|claras|rebanada|rebanadas|tostada|tostadas|unidades|unidad)\b/gi, (match, numStr, decimal, unitWord) => {
            const val = parseFloat(numStr);
            const scaled = Math.round(val * factor * 10) / 10;
            const formatted = Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
            return `${formatted} ${unitWord}`;
          });
        });
        
        return {
          ...meal,
          kcal: newKcalStr,
          opts: nextOpts
        };
      });
      setMeals(nextMeals);
    }
    
    const newPresets = {
      ...customPresets,
      [presetKey]: {
        ...customPresets[presetKey],
        ...nextVals
      }
    };
    setCustomPresets(newPresets, false);
    setEditDirty(false);
  };
  const [shopBusy, setShopBusy] = useState(false);
  const [shopErr, setShopErr] = useState("");





  const [aiMealsBusy, setAiMealsBusy] = useState(false);
  const [mealsPrompt, setMealsPrompt] = useState("");
  const [showMealsAiPanel, setShowMealsAiPanel] = useState(false);
  const [mealsAiErr, setMealsAiErr] = useState("");
  const [previewMeals, setPreviewMeals] = useState(null);

  const adjustMealsWithAI = async () => {
    if (!mealsPrompt.trim() || aiMealsBusy) return;
    setAiMealsBusy(true);
    setMealsAiErr("");
    try {
      const prompt = `Plan de comidas actual: ${JSON.stringify(meals)}. Objetivo de hoy: ${target.label} (${target.kcal} kcal, ${target.p}g P, ${target.c}g C, ${target.f}g G). Perfil de Bruno: hombre, 34 años, 180 cm, 93.9 kg. Solicitud de cambio del usuario: "${mealsPrompt.trim()}". Genera la distribución de comidas adaptada respetando su perfil y el esquema requerido.`;
      const out = await callGemini([{ role: "user", content: prompt }], MEALS_SYS, MEALS_SCHEMA);
      const parsed = cleanAndParseJSON(out);
      if (!parsed.meals || parsed.meals.length === 0) {
        throw new Error("No se pudo generar la distribución de comidas.");
      }
      setPreviewMeals(parsed.meals);
      setMealsPrompt("");
    } catch (e) {
      setMealsAiErr("No se pudo procesar la solicitud. Intenta describiendo el cambio de forma directa.");
    } finally {
      setAiMealsBusy(false);
    }
  };

  const handleConfirmMeals = () => {
    if (previewMeals) {
      setMeals(previewMeals);
      setPreviewMeals(null);
      setShowMealsAiPanel(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewMeals(null);
  };

  // --- Manual Meals Editor States & Actions ---
  const [editingMealIdx, setEditingMealIdx] = React.useState(null); // null, or index, or "new"
  const [editMealData, setEditMealData] = React.useState({ slot: "", kcal: "", opts: [""] });

  const startEditMeal = (idx) => {
    setEditingMealIdx(idx);
    setEditMealData({
      slot: meals[idx].slot,
      kcal: meals[idx].kcal,
      opts: meals[idx].opts && meals[idx].opts.length > 0 ? [...meals[idx].opts] : [""]
    });
  };

  const startAddMeal = () => {
    setEditingMealIdx("new");
    setEditMealData({ slot: "", kcal: "", opts: [""] });
  };

  const saveMeal = () => {
    if (!editMealData.slot.trim()) return;
    const cleanedOpts = editMealData.opts.map(o => o.trim()).filter(Boolean);
    const updatedMeal = {
      slot: editMealData.slot.trim(),
      kcal: editMealData.kcal.trim() || "~200 kcal",
      opts: cleanedOpts.length > 0 ? cleanedOpts : ["Comida personalizada"]
    };
    let nextMeals = [...meals];
    if (editingMealIdx === "new") {
      nextMeals.push(updatedMeal);
    } else {
      nextMeals[editingMealIdx] = updatedMeal;
    }
    setMeals(nextMeals);
    setEditingMealIdx(null);
  };

  const deleteMeal = (idx) => {
    if (window.confirm("¿Seguro que deseas eliminar esta comida de la distribución?")) {
      const nextMeals = meals.filter((_, i) => i !== idx);
      setMeals(nextMeals);
      setEditingMealIdx(null);
    }
  };

  const updateOptionText = (oIdx, val) => {
    const nextOpts = [...editMealData.opts];
    nextOpts[oIdx] = val;
    setEditMealData(prev => ({ ...prev, opts: nextOpts }));
  };

  const addOptionField = () => {
    setEditMealData(prev => ({ ...prev, opts: [...prev.opts, ""] }));
  };

  const removeOptionField = (oIdx) => {
    const nextOpts = editMealData.opts.filter((_, i) => i !== oIdx);
    setEditMealData(prev => ({ ...prev, opts: nextOpts.length > 0 ? nextOpts : [""] }));
  };

  const generateShoppingList = async() => {
    setShopBusy(true);
    setShopErr("");

    const prompt = `Genera una lista de compras semanal recomendada para Bruno. Bruno está en el preset: ${target.label} (${target.kcal} kcal, ${target.p}g P, ${target.c}g C, ${target.f}g G). Prioriza proteínas, verduras, frutas y alimentos saludables. Devuelve un formato JSON estructurado.`;
    const sys = "Eres un nutricionista experto. Devuelve un JSON estructurado con el formato requerido. Ejemplo:\n" +
                "{\n" +
                "  \"categorias\": [\n" +
                "    {\n" +
                "      \"nombre\": \"Proteínas rápidas\",\n" +
                "      \"items\": [\"Pechuga de pollo fileteada (1.5 kg)\", \"Huevos (2 cartones)\", \"Proteína de suero (Whey)\"]\n" +
                "    }\n" +
                "  ]\n" +
                "}";

    const schema = {
      type: "OBJECT",
      properties: {
        categorias: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              nombre: { type: "STRING" },
              items: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["nombre", "items"]
          }
        }
      },
      required: ["categorias"]
    };

    try {
      const out = await callGemini([{ role: "user", content: prompt }], sys, schema);
      const parsed = cleanAndParseJSON(out);
      setShoppingList(parsed);
    } catch(e) {
      setShopErr("Error al generar la lista. Intenta de nuevo.");
    }
    setShopBusy(false);
  };

  const toggleShopItem = (catIdx, itemIdx) => {
    const nextList = { ...shoppingList };
    const item = nextList.categorias[catIdx].items[itemIdx];
    if (item.startsWith("[x] ")) {
      nextList.categorias[catIdx].items[itemIdx] = item.replace("[x] ", "");
    } else {
      nextList.categorias[catIdx].items[itemIdx] = "[x] " + item;
    }
    setShoppingList(nextList);
  };

  // Preset selector labels
  const PRESET_LABELS = Object.entries(customPresets).map(([k, v]) => ({ key: k, label: v.label || k }));

  const totalKcalFromMacros = (editVals.p * 4 + editVals.c * 4 + editVals.f * 9) || 1;
  const pPctCalc = Math.round(editVals.p * 4 / totalKcalFromMacros * 100);
  const cPctCalc = Math.round(editVals.c * 4 / totalKcalFromMacros * 100);
  const fPctCalc = 100 - pPctCalc - cPctCalc;
  const totalPctCalc = pPctCalc + cPctCalc + fPctCalc;

  const MODE_CARDS = [
    { key:"definicion",    label:"Definición", icon:Sparkles, desc:"Déficit calórico para perder grasa manteniendo músculo." },
    { key:"volumen",       label:"Volumen",    icon:Flame,    desc:"Superávit para maximizar la ganancia de masa muscular." },
    { key:"mantenimiento", label:"Balance",    icon:Scale,    desc:"Mantén tu peso actual con energía equilibrada." },
  ];

  return (
    <div className="pop">

      {/* Objetivo — chips compactos */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".1em", marginBottom:10}}>Modo de Entrenamiento</div>
        <div style={{display:"flex", gap:8}}>
          {MODE_CARDS.map(({key, label, icon:Ic}) => {
            const sel = presetKey === key;
            return (
              <button key={key} onClick={() => setPresetKey(key)} style={{
                flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                padding:"10px 6px", borderRadius:12, cursor:"pointer",
                background: sel ? C.lime : C.panel,
                border: sel ? `1.5px solid ${C.lime}` : `1px solid ${C.line}`,
                color: sel ? "#0c0e0b" : C.muted,
                boxShadow: sel ? "0 2px 8px rgba(205,255,74,0.2)" : "none"
              }}>
                <Ic size={14} color={sel ? "#0c0e0b" : C.muted} strokeWidth={sel ? 2.5 : 1.8}/>
                <span style={{fontSize:11, fontWeight:700, whiteSpace:"nowrap"}}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Presupuesto Diario */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"14px 16px", marginBottom:14}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
          <span style={{fontSize:12, fontWeight:700, color:C.ink}}>Presupuesto Diario</span>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{fontSize:20, fontWeight:900, color:C.lime, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:".02em"}}>{target.kcal} <span style={{fontSize:11, fontWeight:600, color:C.muted, fontFamily:"'Manrope',sans-serif"}}>kcal</span></span>
            <button 
              onClick={() => {
                setModalVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
                setShowNutritionModal(true);
              }}
              className="btn-active-scale"
              style={{
                background: "rgba(205,255,74,0.1)",
                border: "none",
                color: C.lime,
                fontSize: 11.5,
                fontWeight: 800,
                padding: "4px 8px",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <NotebookPen size={12}/> Editar
            </button>
          </div>
        </div>
        <div style={{ height: 6, background: "var(--panel-bg-sec)", borderRadius: "var(--radius-pill)", overflow: "hidden", width: "100%" }}>
          <div style={{ height: "100%", width: `${Math.min(100, (target.kcal / 4500) * 100)}%`, background: C.lime, borderRadius: "var(--radius-pill)" }}/>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:10, color:C.muted, marginTop:5}}>
          <span>1200 kcal</span><span>4500 kcal</span>
        </div>
      </div>

      {/* Distribución de Macros */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"14px 16px", marginBottom:14}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
          <span style={{fontSize:12, fontWeight:700, color:C.ink}}>Distribución de Macros</span>
          <button 
            onClick={() => {
              setModalVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f });
              setShowNutritionModal(true);
            }}
            className="btn-active-scale"
            style={{
              background: "rgba(205,255,74,0.1)",
              border: "none",
              color: C.lime,
              fontSize: 11.5,
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <NotebookPen size={12}/> Editar
          </button>
        </div>
        {[
          {label:"Proteínas",     pct:Math.round(target.p * 4 / (target.kcal || 1) * 100), g:target.p, color:C.lime },
          {label:"Carbohidratos", pct:Math.round(target.c * 4 / (target.kcal || 1) * 100), g:target.c, color:C.amber },
          {label:"Grasas",        pct:100 - Math.round(target.p * 4 / (target.kcal || 1) * 100) - Math.round(target.c * 4 / (target.kcal || 1) * 100), g:target.f, color:C.cyan },
        ].map(({label,pct,g,color}) => (
          <div key={label} style={{marginBottom:12}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5}}>
              <span style={{fontSize:12, fontWeight:600, color:C.ink}}>{label}</span>
              <span style={{fontSize:12, fontWeight:800, color}}>{pct}% <span style={{fontSize:10, color:C.muted, fontWeight:500}}>· {g}g</span></span>
            </div>
            <div style={{ height: 6, background: "var(--panel-bg-sec)", borderRadius: "var(--radius-pill)", overflow: "hidden", width: "100%" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "var(--radius-pill)" }}/>
            </div>
          </div>
        ))}
        <div style={{display:"flex", justifyContent:"space-between", borderTop:`1px solid ${C.line}`, paddingTop:8, fontSize:11, fontWeight:700}}>
          <span style={{color:C.muted}}>Total</span>
          <span style={{color: C.lime}}>100%</span>
        </div>
      </div>

      <button onClick={() => { setShowNutritionModal(true); setModalVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f }); }} style={{
        width:"100%", padding:"14px", borderRadius:16, border:`1px solid ${C.line}`, cursor:"pointer",
        background:C.panel, color:C.lime, fontWeight:800, fontSize:14, marginBottom:20,
        display:"flex", alignItems:"center", justifyContent:"center", gap:8
      }}>
        <Settings size={15}/> Ajuste avanzado con IA / Manual
      </button>

      {/* Lista de Compras Inteligente */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"16px 18px", marginBottom:14}}>
        <div style={{display:"flex", justifyTarget:"space-between", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <span style={{fontSize:12.5, fontWeight:800, display:"flex", alignItems:"center", gap:8}}>
            <ShoppingCart size={15} color={C.lime}/> Lista de Compras Inteligente
          </span>
          <button 
            onClick={generateShoppingList}
            disabled={shopBusy}
            style={{
              padding:"6px 12px", 
              borderRadius:9, 
              background: shopBusy ? C.panel2 : C.lime, 
              color: shopBusy ? C.muted : "#0c0e0b", 
              fontSize:11.5, 
              fontWeight:800,
              cursor:"pointer",
              display:"flex",
              alignItems:"center",
              gap:4
            }}
          >
            {shopBusy ? <Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/> : <Sparkles size={12}/>}
            <span>{shoppingList.categorias.length > 0 ? "Actualizar" : "Generar con IA"}</span>
          </button>
        </div>

        {shopErr && <div style={{color:C.rose, fontSize:12, marginBottom:10}}>{shopErr}</div>}

        {shoppingList.categorias.length === 0 && !shopBusy && (
          <div style={{fontSize:12.5, color:C.muted, textAlign:"center", padding:"14px 0"}}>
            Genera una lista de compras rápida diseñada para tus objetivos y tus turnos de guardia.
          </div>
        )}

        {shoppingList.categorias.map((cat, catIdx) => (
          <div key={cat.nombre} style={{marginBottom:12}}>
            <div style={{fontSize:11, fontWeight:800, textTransform:"uppercase", color:C.cyan, letterSpacing:".05em", marginBottom:6}}>
              {cat.nombre}
            </div>
            {cat.items.map((item, itemIdx) => {
              const isChecked = item.startsWith("[x] ");
              const displayText = isChecked ? item.replace("[x] ", "") : item;
              return (
                <div 
                  key={item} 
                  className="shopping-list-item" 
                  onClick={() => toggleShopItem(catIdx, itemIdx)}
                  style={{
                    cursor:"pointer", 
                    opacity: isChecked ? 0.45 : 1,
                    textDecoration: isChecked ? "line-through" : "none"
                  }}
                >
                  {isChecked ? <CheckSquare size={15} color={C.lime}/> : <Square size={15} color={C.muted}/>}
                  <span>{displayText}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sugerencias de Comidas */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"16px 18px", marginBottom:14}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:6}}>
          <span style={{fontSize:11, color:C.muted, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase"}}>
            Distribución de Comidas Sugerida
          </span>
          <div style={{display:"flex", gap:6}}>
            <button
              onClick={startAddMeal}
              style={{
                padding:"4px 10px",
                borderRadius:6,
                background: C.panel2,
                border: `1px solid ${C.line}`,
                color: C.lime,
                fontSize:11,
                fontWeight:800,
                cursor:"pointer",
                display:"flex",
                alignItems:"center",
                gap:4
              }}
            >
              <Plus size={11}/>
              <span>Añadir Comida</span>
            </button>
            <button 
              onClick={() => {
                setShowMealsAiPanel(!showMealsAiPanel);
                setMealsAiErr("");
                setPreviewMeals(null);
              }}
              style={{
                padding:"4px 10px",
                borderRadius:6,
                background: showMealsAiPanel ? "rgba(107,78,255,.12)" : C.panel2,
                border: `1px solid ${showMealsAiPanel ? C.lime : C.line}`,
                color: showMealsAiPanel ? C.lime : C.muted,
                fontSize:11,
                fontWeight:800,
                cursor:"pointer",
                display:"flex",
                alignItems:"center",
                gap:4
              }}
            >
              <Sparkles size={11}/>
              <span>{showMealsAiPanel ? "Cerrar" : "Ajustar con IA"}</span>
            </button>
          </div>
        </div>

        {showMealsAiPanel && (
          <div className="pop" style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:12, padding:10, marginBottom:12, display:"flex", flexDirection:"column", gap:6}}>
            <div style={{fontSize:11, color:C.muted}}>
              Indica qué deseas cambiar (ej: "cambia pollo por pescado", "hazlo vegetariano", "ajusta las porciones de carbohidratos"):
            </div>
            <div style={{display:"flex", gap:6}}>
              <textarea 
                value={mealsPrompt}
                onChange={e => setMealsPrompt(e.target.value)}
                placeholder="Escribe tu solicitud de cambio..."
                rows={2}
                style={{flex:1, background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:12.5, color:C.ink, resize:"none", outline:"none"}}
              />
              <button 
                onClick={adjustMealsWithAI}
                disabled={aiMealsBusy || !mealsPrompt.trim()}
                style={{padding:"0 12px", background: aiMealsBusy ? C.panel : C.lime, color: aiMealsBusy ? C.muted : "#0c0e0b", fontWeight:800, borderRadius:8, fontSize:11.5, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}
              >
                {aiMealsBusy ? <Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/> : <Send size={14}/>}
              </button>
            </div>
            {mealsAiErr && <div style={{color:C.rose, fontSize:11}}>{mealsAiErr}</div>}
          </div>
        )}

        {previewMeals && (
          <div className="pop" style={{background:"rgba(74,214,255,.05)", border:`1px solid ${C.cyan}`, borderRadius:12, padding:12, marginBottom:12}}>
            <div style={{fontSize:11.5, fontWeight:800, color:C.cyan, display:"flex", alignItems:"center", gap:6, marginBottom:8}}>
              <Sparkles size={12}/> Vista previa de cambios generada por la IA
            </div>
            <div style={{display:"flex", gap:6, marginTop:8}}>
              <button onClick={handleConfirmMeals} style={{flex:1, padding:"6px 12px", background:C.lime, color:"#0c0e0b", fontWeight:800, borderRadius:6, fontSize:11, cursor:"pointer"}}>
                Confirmar y Aplicar
              </button>
              <button onClick={handleCancelPreview} style={{padding:"6px 12px", background:"none", border:`1px solid ${C.line}`, color:C.muted, fontWeight:700, borderRadius:6, fontSize:11, cursor:"pointer"}}>
                Rechazar
              </button>
            </div>
          </div>
        )}

        {(previewMeals || meals).map((meal, idx) => (
          <div key={idx} style={{background:C.panel2, border:`1px solid ${previewMeals ? C.cyan : C.line}`, borderRadius:12, padding:12, marginBottom:8}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <span style={{fontSize:14, fontWeight:700, color:C.lime}}>{meal.slot}</span>
                {!previewMeals && (
                  <button 
                    onClick={() => startEditMeal(idx)}
                    style={{
                      background: "none", border: "none", color: C.muted, cursor: "pointer", 
                      padding: 2, display: "flex", alignItems: "center", transition: "color 0.2s"
                    }}
                    title="Editar comida"
                  >
                    <NotebookPen size={12}/>
                  </button>
                )}
              </div>
              <span style={{fontSize:12, color:C.muted, fontVariantNumeric:"tabular-nums"}}>{meal.kcal}</span>
            </div>
            <ul style={{margin:0, paddingLeft:16, fontSize:13, color:"#dde0cf", lineHeight:1.45}}>
              {meal.opts.map((opt, oidx) => (
                <li key={oidx} style={{marginBottom:4}}>{opt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pautas Generales */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"16px 18px", marginBottom:4}}>
        <div style={{fontSize:11, color:C.muted, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12}}>Pautas y Recomendaciones Generales</div>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {PAUTAS.map(([title, desc], idx) => (
            <div key={idx} style={{display:"flex", gap:12, alignItems:"flex-start", borderBottom: idx === PAUTAS.length - 1 ? "none" : `1px solid ${C.line}`, paddingBottom: idx === PAUTAS.length - 1 ? 0 : 10}}>
              <div style={{fontSize:13.5, fontWeight:700, minWidth:120}}>{title}</div>
              <div style={{fontSize:13, color:C.muted, lineHeight:1.4}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de edición de comida */}
      {editingMealIdx !== null && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999, padding: 16
        }}>
          <div style={{
            background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16,
            padding: 20, width: "100%", maxWidth: 420, display: "flex",
            flexDirection: "column", gap: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span style={{fontSize:14, fontWeight:900, color:C.lime}}>
                {editingMealIdx === "new" ? "AÑADIR COMIDA" : "EDITAR COMIDA"}
              </span>
              <button 
                onClick={() => setEditingMealIdx(null)}
                style={{background:"none", border:"none", color:C.muted, cursor: "pointer", padding:4}}
              >
                <X size={20}/>
              </button>
            </div>

            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              <div>
                <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>Nombre del Momento (ej. Desayuno)</label>
                <input 
                  type="text" 
                  value={editMealData.slot}
                  onChange={e => setEditMealData(prev => ({ ...prev, slot: e.target.value }))}
                  placeholder="ej. Merienda"
                  style={{width:"100%", background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:C.ink, outline:"none"}}
                />
              </div>

              <div>
                <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>Estimación de Calorías (ej. ~300 kcal)</label>
                <input 
                  type="text" 
                  value={editMealData.kcal}
                  onChange={e => setEditMealData(prev => ({ ...prev, kcal: e.target.value }))}
                  placeholder="ej. ~300 kcal"
                  style={{width:"100%", background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:C.ink, outline:"none"}}
                />
              </div>

              <div>
                <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>Opciones de Alimentos</label>
                <div style={{display:"flex", flexDirection:"column", gap:6, maxHeight:200, overflowY:"auto", paddingRight:4}}>
                  {editMealData.opts.map((opt, oIdx) => (
                    <div key={oIdx} style={{display:"flex", gap:6}}>
                      <input 
                        type="text" 
                        value={opt}
                        onChange={e => updateOptionText(oIdx, e.target.value)}
                        placeholder="Opción de comida o combinación"
                        style={{flex:1, background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:12.5, color:C.ink, outline:"none"}}
                      />
                      <button 
                        onClick={() => removeOptionField(oIdx)}
                        style={{background:"rgba(255,107,138,0.1)", border:"none", borderRadius:8, color:C.rose, cursor:"pointer", padding:"0 10px", display:"flex", alignItems:"center"}}
                      >
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addOptionField}
                  style={{
                    marginTop:8, background:"none", border:`1px dashed ${C.line}`, borderRadius:8,
                    color:C.lime, fontSize:11.5, fontWeight:700, padding:"6px 12px", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:4, width:"100%", justifyContent:"center"
                  }}
                >
                  <Plus size={12}/> Añadir Opción Alternativa
                </button>
              </div>
            </div>

            <div style={{display:"flex", gap:8, marginTop:6}}>
              {editingMealIdx !== "new" && (
                <button 
                  onClick={() => deleteMeal(editingMealIdx)}
                  style={{
                    padding:"8px 14px", background:"rgba(255,107,138,0.15)", color:C.rose, border:`1px solid ${C.rose}44`,
                    borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer"
                  }}
                >
                  Eliminar
                </button>
              )}
              <button 
                onClick={saveMeal}
                style={{
                  flex:1, padding:"8px 14px", background:C.lime, color:"#0c0e0b", border:"none",
                  borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer"
                }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

/* ===== RENDERIZAR LA APLICACIÓN REACT ===== */
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
  window.dispatchEvent(new Event('load-completed'));
}

// Para testing (Jest / Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadKey, default: App };
}
