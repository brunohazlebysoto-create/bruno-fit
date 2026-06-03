import React, { useState, useEffect, useRef } from "react";
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
const PRESETS = {
  definicion:   { label:"Definición",    kcal:2600, p:220, c:265, f:70 },
  mantenimiento:{ label:"Mantenimiento", kcal:3000, p:200, c:360, f:85 },
  volumen:      { label:"Volumen",       kcal:3400, p:200, c:450, f:90 },
};

const SPLIT = [
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
  ["💧 Hidratación","3-4 L/día, más en guardias. Electrolitos en turnos largos."],
  ["🌾 Fibra","30-40 g/día. Verdura en cada comida + fruta."],
  ["⏱️ Timing","Carbos concentrados alrededor del entreno."],
  ["💊 Suplementos","Creatina 5 g/día, whey, vitamina D, cafeína pre-entreno."],
  ["🏥 Guardias","Lleva barritas proteicas, frutos secos, shaker y fruta."],
  ["😴 Sueño","Tu factor más frágil con turnos. Dormir poco frena la pérdida de grasa."],
  ["🍷 Alcohol","Mínimo en definición."],
];

const C = { 
  bg:"#0c0e0b", panel:"#15170f", panel2:"#1c1f15", line:"#2a2e20", 
  ink:"#f3f4ea", muted:"#9aa088", lime:"#cdff4a", cyan:"#4ad6ff", 
  amber:"#ffb13d", rose:"#ff6b8a", guardia:"#00f0ff" 
};

const START_W = 93.9, GOAL_W = 85;
const todayKey = () => "log-" + new Date().toISOString().slice(0,10);
const waterKey = () => "water-" + new Date().toISOString().slice(0,10);
const suppsKey = () => "supps-" + new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2,9);
const fdate = (iso)=> new Date(iso).toLocaleDateString("es",{day:"2-digit",month:"short"});

// Clave Gemini: el usuario la introduce en Ajustes > Coach
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
              reps: { type: "STRING" }
            }
          }
        },
        required: ["type", "data"]
      }
    }
  },
  required: ["chatResponse"]
};

const WORKOUT_PARSER_SYS = "Eres un asistente experto en entrenamiento de fuerza. Tu tarea es analizar el texto del usuario que describe su sesión de entrenamiento y extraer los ejercicios, pesos y repeticiones. Extrae los pesos en kg (si están en libras, conviértelos a kg dividiendo por 2.2). Responde estrictamente en formato JSON que cumpla con el esquema WORKOUT_PARSER_SCHEMA.";

const WORKOUT_PARSER_SCHEMA = {
  type: "OBJECT",
  properties: {
    exercises: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
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
        required: ["name", "sets"]
      }
    }
  },
  required: ["exercises"]
};

const MEALS_SYS = "Eres un nutricionista deportivo de élite. Tu tarea es recibir el plan de comidas actual de Bruno y la solicitud del usuario para modificar las opciones o la proporción de ingredientes. Debes reescribir y optimizar las opciones de comida del plan actual (manteniendo los 5 momentos del día: Desayuno, Almuerzo, Pre-entreno, Post-entreno, Cena) respetando su perfil, macros y guardias. Devuelve un formato JSON estricto que cumpla con el esquema MEALS_SCHEMA.";

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
const aiErr = (e) => "No se pudo conectar con la IA. " + (e ? `Detalle: ${e.message}` : "Verifica tu API Key o conexión.");
const getProfileStr = (isGuardia, weight = 93.9, musculo = 64.7, grasaPct = 26.2, visceral = 9) => {
  return `Bruno: hombre, 34 años, 180 cm, ${weight} kg, residente de cirugía pediátrica con guardias de 24h. Objetivo: definición (bajar grasa manteniendo músculo; ${musculo} kg de músculo, ${grasaPct}% grasa, visceral grado ${visceral}). Dieta hiperproteica.${
    isGuardia ? " [IMPORTANTE: HOY BRUNO ESTÁ EN GUARDIA DE 24H EN EL HOSPITAL. Priorizar timing de snacks rápidos, hidratación extra a 4.5L, evitar fatiga extrema en entrenamientos y priorizar movilidad]" : ""
  }`;
};

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

  // Alternar las llaves de forma aleatoria/balanceada para distribuir la carga de cuota
  const startIndex = Math.floor(Math.random() * apiKeys.length);
  let lastError = null;

  for (let count = 0; count < apiKeys.length; count++) {
    const i = (startIndex + count) % apiKeys.length;
    const apiKey = apiKeys[i];
    try {
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
    } catch (e) {
      lastError = e;
      console.warn(`Error con la API Key ${i + 1}/${apiKeys.length}: ${e.message}. Intentando con la siguiente...`);
    }
  }

  throw lastError || new Error("No se pudo conectar con ninguna API Key.");
}

function seedExercises(){ 
  const o={}; 
  SPLIT.forEach(d=>{ 
    o[d.key]=d.ex.map(n=>({name:n,tecnico:"",musculos:MUSCLES[n]||[]})); 
  }); 
  return o; 
}

/* ===== GRÁFICO SVG COMPARTIDO ===== */
function Chart({entries, color=C.lime, height=128}){
  if(!entries || entries.length < 2) return null;
  const W = 320, H = height, pad = 22;
  const ws = entries.map(d => d.w), mn = Math.min(...ws), mx = Math.max(...ws), rg = (mx - mn) || 1;
  const X = i => pad + (i / (entries.length - 1)) * (W - 2 * pad);
  const Y = v => H - pad - ((v - mn) / rg) * (H - 2 * pad - 6) - 3;
  const line = entries.map((d, i) => `${X(i).toFixed(1)},${Y(d.w).toFixed(1)}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${(W - pad).toFixed(1)},${H - pad}`;
  const up = entries[entries.length - 1].w >= entries[0].w;
  const col = up ? C.lime : C.amber;
  return (
    <div style={{margin:"8px 0 4px"}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:3}}>Progreso · mín {mn} · máx {mx} · último {entries[entries.length-1].w} kg {up?"📈":"📉"}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height,display:"block"}}>
        <polygon points={area} fill={col} opacity="0.10"/>
        <polyline points={line} fill="none" stroke={col} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {entries.map((d,i)=>(<circle key={i} cx={X(i)} cy={Y(d.w)} r="3.2" fill={col}/>))}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:-2}}><span>{fdate(entries[0].date)}</span><span>{fdate(entries[entries.length-1].date)}</span></div>
    </div>
  );
}

/* ===== COMPONENTE PRINCIPAL APP ===== */
export default function App(){
  const [view, setView] = useState("hoy");
  const [presetKey, setPresetKey] = useState("definicion");
  const [log, setLog] = useState([]); 
  const [notes, setNotes] = useState([]);
  const [chat, setChat] = useState([]); 
  const [exlog, setExlog] = useState({});
  const [exercises, setExercises] = useState(seedExercises());
  const [water, setWater] = useState(0);
  const [supplements, setSupplements] = useState({ Creatina: false, "Whey Protein": false, "Vitamina D": false, "Multivitamínico": false });
  const [chatBusy, setChatBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isGuardia, setIsGuardia] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [prAlerts, setPrAlerts] = useState([]);
  const [workoutDurations, setWorkoutDurations] = useState({});
  
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
      .sort((a, b) => b[0].localeCompare(a[0]));
    
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
      .sort((a, b) => b.date.localeCompare(a.date));
    const wVal = parseFloat(wNotes.length > 0 ? wNotes[0].weight : ((notes || []).find(n => n && n.type === "peso" && n.weight)?.weight || START_W)) || START_W;
    
    return {
      weight: wVal,
      musculo: parseFloat(bodyComp ? bodyComp.musculo : 64.7) || 64.7,
      grasaPct: parseFloat(bodyComp ? bodyComp.grasaPct : 26.2) || 26.2,
      visceral: parseInt(bodyComp ? bodyComp.visceral : 9) || 9,
      brazoDer: "", brazoIzq: "", musloDer: "", musloIzq: "", pantorrillaDer: "", pantorrillaIzq: "", cintura: "", pecho: ""
    };
  };

  const checkNewPR = (exName, newW, newRepsStr, currentExlog = exlog) => {
    const sets = (currentExlog || {})[exName] || [];
    if (sets.length === 0) return null;
    
    const newReps = parseInt(newRepsStr);
    if (isNaN(newW) || isNaN(newReps) || newReps <= 0) return null;
    
    const new1RM = newW * (1 + newReps / 30);
    
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
        const s1RM = sw * (1 + sreps / 30);
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
  const [activeSplitKey, setActiveSplitKey] = useState("A");

  // Supabase States
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [sbSyncing, setSbSyncing] = useState(false);
  const [sbError, setSbError] = useState("");

  const target = PRESETS[presetKey];

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
      const localSplitKey = await loadKey("active_split_key", "A");

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

      let finalPresetKey = localPresetKey;
      let finalNotes = localNotes;
      let finalChat = localChat;
      let finalExlog = localExlog;
      let finalExercises = localExercises;
      let finalIsGuardia = false; // Always default to false for desprioritization
      let finalBodyComp = localBodyComp;
      let finalShoppingList = localShoppingList;
      let finalMeals = localMeals;
      let finalSplitKey = localSplitKey;

      if (initialData) {
        finalPresetKey = initialData.presetKey || localPresetKey;
        finalNotes = Array.isArray(initialData.notes) ? initialData.notes : localNotes;
        finalChat = Array.isArray(initialData.chat) ? initialData.chat : localChat;
        finalExlog = (initialData.exlog && typeof initialData.exlog === 'object') ? initialData.exlog : localExlog;
        finalExercises = (initialData.exercises && typeof initialData.exercises === 'object') ? initialData.exercises : localExercises;
        finalIsGuardia = initialData.isGuardia || false;
        finalBodyComp = (initialData.bodyComp && typeof initialData.bodyComp === 'object') ? initialData.bodyComp : localBodyComp;
        finalShoppingList = (initialData.shoppingList && typeof initialData.shoppingList === 'object') ? initialData.shoppingList : localShoppingList;
        finalMeals = Array.isArray(initialData.meals) ? initialData.meals : localMeals;
        finalSplitKey = initialData.activeSplitKey || localSplitKey;

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
      await saveKey("notes", finalNotes);
      await saveKey("chat", finalChat);
      await saveKey("exlog", finalExlog);
      await saveKey("exercises", finalExercises);
      await saveKey("is_guardia", finalIsGuardia);
      await saveKey("body_comp", finalBodyComp);
      await saveKey("shopping_list", finalShoppingList);
      await saveKey("meals", finalMeals);
      await saveKey("active_split_key", finalSplitKey);
      
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
      setNotes(finalNotes);
      setChat(finalChat);
      setExlog(finalExlog);
      setExercises(finalExercises);
      setIsGuardia(finalIsGuardia);
      setBodyComp(finalBodyComp);
      setShoppingList(finalShoppingList);
      setMeals(finalMeals);
      setActiveSplitKey(finalSplitKey);

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
      setLoaded(true);

      // Si la sincronización está activa, intentamos empujar el estado local actual
      if (activeCloudSync && activeCode) {
        const pending = await loadKey("pending_sync", null);
        const updateTime = Date.now();
        const stateToPush = pending || {
          presetKey: finalPresetKey,
          notes: finalNotes,
          chat: finalChat,
          exlog: finalExlog,
          exercises: finalExercises,
          isGuardia: finalIsGuardia,
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
            const nextFoodlog = cloudData.foodlog || {};
            const nextWaterlog = cloudData.waterlog || {};
            const nextSuppslog = cloudData.suppslog || {};
            const nextMetricslog = cloudData.metricslog || {};
            const nextSuppsInventory = cloudData.suppsInventory || {
              "Creatina": { active: true, servingsLeft: 60, totalServings: 60 },
              "Whey Protein": { active: true, servingsLeft: 30, totalServings: 30 }
            };
            const nextWorkoutDurations = cloudData.workoutDurations || {};

            // Actualizar estados React
            setPresetKey(cloudData.presetKey || "definicion");
            setNotes(cloudData.notes || []);
            setChat(cloudData.chat || []);
            setExlog(cloudData.exlog || {});
            setExercises(cloudData.exercises || seedExercises());
            setIsGuardia(cloudData.isGuardia || false);
            setBodyComp(cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
            setShoppingList(cloudData.shoppingList || { categorias: [] });
            setMeals(cloudData.meals || DEFAULT_MEALS);
            setActiveSplitKey(cloudData.activeSplitKey || "A");

            setFoodlog(nextFoodlog);
            setWaterlog(nextWaterlog);
            setSuppslog(nextSuppslog);
            setMetricslog(nextMetricslog);
            setSuppsInventory(nextSuppsInventory);
            setWorkoutDurations(nextWorkoutDurations);

            // Guardar localmente
            await saveKey("profile", { presetKey: cloudData.presetKey || "definicion" });
            await saveKey("notes", cloudData.notes || []);
            await saveKey("chat", cloudData.chat || []);
            await saveKey("exlog", cloudData.exlog || {});
            await saveKey("exercises", cloudData.exercises || seedExercises());
            await saveKey("is_guardia", cloudData.isGuardia || false);
            await saveKey("body_comp", cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
            await saveKey("shopping_list", cloudData.shoppingList || { categorias: [] });
            await saveKey("meals", cloudData.meals || DEFAULT_MEALS);
            await saveKey("active_split_key", cloudData.activeSplitKey || "A");
            
            await saveKey("foodlog", nextFoodlog);
            await saveKey("waterlog", nextWaterlog);
            await saveKey("suppslog", nextSuppslog);
            await saveKey("metricslog", nextMetricslog);
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

    const current = {
      presetKey: updates.presetKey !== undefined ? updates.presetKey : presetKey,
      notes: updates.notes !== undefined ? updates.notes : notes,
      chat: updates.chat !== undefined ? updates.chat : chat,
      exlog: updates.exlog !== undefined ? updates.exlog : exlog,
      exercises: updates.exercises !== undefined ? updates.exercises : exercises,
      isGuardia: updates.isGuardia !== undefined ? updates.isGuardia : isGuardia,
      bodyComp: updates.bodyComp !== undefined ? updates.bodyComp : bodyComp,
      shoppingList: updates.shoppingList !== undefined ? updates.shoppingList : shoppingList,
      meals: updates.meals !== undefined ? updates.meals : meals,
      activeSplitKey: updates.activeSplitKey !== undefined ? updates.activeSplitKey : activeSplitKey,
      foodlog: nextFoodlog,
      waterlog: nextWaterlog,
      suppslog: nextSuppslog,
      metricslog: nextMetricslog,
      suppsInventory: nextSuppsInventory,
      workoutDurations: nextWorkoutDurations,
      updatedAt: updateTime
    };

    // Guardar local
    if (updates.presetKey !== undefined) await saveKey("profile", { presetKey: updates.presetKey });
    if (updates.notes !== undefined) await saveKey("notes", updates.notes);
    if (updates.chat !== undefined) await saveKey("chat", updates.chat);
    if (updates.exlog !== undefined) await saveKey("exlog", updates.exlog);
    if (updates.exercises !== undefined) await saveKey("exercises", updates.exercises);
    if (updates.isGuardia !== undefined) await saveKey("is_guardia", updates.isGuardia);
    if (updates.bodyComp !== undefined) await saveKey("body_comp", updates.bodyComp);
    if (updates.shoppingList !== undefined) await saveKey("shopping_list", updates.shoppingList);
    if (updates.meals !== undefined) await saveKey("meals", updates.meals);
    if (updates.activeSplitKey !== undefined) await saveKey("active_split_key", updates.activeSplitKey);
    
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
          if (updates.presetKey !== undefined || updates.activeSplitKey !== undefined || updates.isGuardia !== undefined || updates.bodyComp !== undefined || updates.meals !== undefined || updates.shoppingList !== undefined) {
            await supabase.from('profiles').upsert({
              id: uId,
              email: supabaseUser.email,
              preset_key: updates.presetKey !== undefined ? updates.presetKey : presetKey,
              active_split_key: updates.activeSplitKey !== undefined ? updates.activeSplitKey : activeSplitKey,
              is_guardia: updates.isGuardia !== undefined ? updates.isGuardia : isGuardia,
              body_comp: updates.bodyComp !== undefined ? updates.bodyComp : bodyComp,
              meals: updates.meals !== undefined ? updates.meals : meals,
              shopping_list: updates.shoppingList !== undefined ? updates.shoppingList : shoppingList,
              updated_at: new Date().toISOString()
            });
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
        is_guardia: isGuardia,
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

  const toggleGuardia = () => {
    const next = !isGuardia;
    setIsGuardia(next);
    saveState({ isGuardia: next });
  };

  const saveGeminiKey = (k) => {
    setGeminiKey(k);
    saveKey("gemini_api_key", k);
  };

  // Activa o desactiva la sincronización en la nube
  const handleToggleCloudSync = async (enabled) => {
    setCloudSync(enabled);
    await saveKey("cloud_sync_enabled", enabled);

    if (enabled && syncCode && !syncCode.startsWith("bf-")) {
      setSyncStatus("Sincronizando...");
      const today = new Date().toISOString().slice(0,10);
      const updateTime = Date.now();
      const current = { presetKey, log, notes, chat, exlog, exercises, water, supplements, isGuardia, bodyComp, shoppingList, meals, activeSplitKey, dailyDate: today, updatedAt: updateTime };
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
        const current = { presetKey, log, notes, chat, exlog, exercises, water, supplements, isGuardia, bodyComp, shoppingList, meals, activeSplitKey, dailyDate: today, updatedAt: updateTime };
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

      // Reemplazar estado React
      setPresetKey(cloudData.presetKey || "definicion");
      setLog(finalLog);
      setNotes(cloudData.notes || []);
      setChat(cloudData.chat || []);
      setExlog(cloudData.exlog || {});
      setExercises(cloudData.exercises || seedExercises());
      setWater(finalWater);
      setSupplements(finalSupplements);
      setIsGuardia(cloudData.isGuardia || false);
      setBodyComp(cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      setShoppingList(cloudData.shoppingList || { categorias: [] });
      setMeals(cloudData.meals || DEFAULT_MEALS);
      setActiveSplitKey(cloudData.activeSplitKey || "A");
      
      setFoodlog(cloudData.foodlog || {});
      setWaterlog(cloudData.waterlog || {});
      setSuppslog(cloudData.suppslog || {});
      setMetricslog(cloudData.metricslog || {});
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
      await saveKey("is_guardia", cloudData.isGuardia || false);
      await saveKey("body_comp", cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      await saveKey("shopping_list", cloudData.shoppingList || { categorias: [] });
      await saveKey("meals", cloudData.meals || DEFAULT_MEALS);
      await saveKey("active_split_key", cloudData.activeSplitKey || "A");
      
      await saveKey("foodlog", cloudData.foodlog || {});
      await saveKey("waterlog", cloudData.waterlog || {});
      await saveKey("suppslog", cloudData.suppslog || {});
      await saveKey("metricslog", cloudData.metricslog || {});
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

      setPresetKey(cloudData.presetKey || "definicion");
      setLog(finalLog);
      setNotes(cloudData.notes || []);
      setChat(cloudData.chat || []);
      setExlog(cloudData.exlog || {});
      setExercises(cloudData.exercises || seedExercises());
      setWater(finalWater);
      setSupplements(finalSupplements);
      setIsGuardia(cloudData.isGuardia || false);
      setBodyComp(cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      setShoppingList(cloudData.shoppingList || { categorias: [] });
      setMeals(cloudData.meals || DEFAULT_MEALS);
      setActiveSplitKey(cloudData.activeSplitKey || "A");
      
      setFoodlog(cloudData.foodlog || {});
      setWaterlog(cloudData.waterlog || {});
      setSuppslog(cloudData.suppslog || {});
      setMetricslog(cloudData.metricslog || {});
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
      await saveKey("is_guardia", cloudData.isGuardia || false);
      await saveKey("body_comp", cloudData.bodyComp || { musculo: 64.7, grasaPct: 26.2, visceral: 9 });
      await saveKey("shopping_list", cloudData.shoppingList || { categorias: [] });
      await saveKey("meals", cloudData.meals || DEFAULT_MEALS);
      await saveKey("active_split_key", cloudData.activeSplitKey || "A");
      
      await saveKey("foodlog", cloudData.foodlog || {});
      await saveKey("waterlog", cloudData.waterlog || {});
      await saveKey("suppslog", cloudData.suppslog || {});
      await saveKey("metricslog", cloudData.metricslog || {});
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

  const handleForcePush = async () => {
    if (!syncCode) return;
    setSyncStatus("Sincronizando...");
    const today = new Date().toISOString().slice(0,10);
    const updateTime = Date.now();
    const current = { 
      presetKey, log, notes, chat, exlog, exercises, water, supplements, isGuardia, bodyComp, shoppingList, meals, activeSplitKey, dailyDate: today, 
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
    let hasLog = false;
    let hasNotes = false;
    let hasExlog = false;

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
    
    if (hasLog || hasNotes || hasExlog) {
      saveState(updates);
    }
  };

  const activeMetrics = getMetricsForDate(selectedDateStr) || {
    weight: START_W, musculo: 64.7, grasaPct: 26.2, visceral: 9,
    brazoDer: "", brazoIzq: "", musloDer: "", musloIzq: "", pantorrillaDer: "", pantorrillaIzq: "", cintura: "", pecho: ""
  };

  const totals = (log || []).reduce((a,e) => ({
    kcal: a.kcal + (+e.kcal || 0),
    p: a.p + (+e.proteina || 0),
    c: a.c + (+e.carbo || 0),
    f: a.f + (+e.grasa || 0)
  }), { kcal:0, p:0, c:0, f:0 });

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

  const sendCoachMessage = async (messageText, customChat = null) => {
    const chatHistory = customChat || chat;
    if (!messageText.trim() || chatBusy) return;
    
    const nextChat = [...chatHistory, { role: "user", content: messageText.trim() }];
    setChat(nextChat);
    setChatBusy(true);
    
    await saveState({ chat: nextChat });
    
    try {
      const activeSplit = SPLIT.find(s => s.key === activeSplitKey) || SPLIT[0];
      const todayWorkout = getTodayWorkoutSummary();

      // Get latest metrics for prompt
      const getLatestMetricsText = () => {
        const sorted = Object.entries(metricslog || {})
          .map(([dateStr, m]) => ({ date: dateStr, ...(m || {}) }))
          .sort((a, b) => b.date.localeCompare(a.date));
        if (sorted.length === 0) return "Ninguna registrada.";
        const m = sorted[0];
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

      const sys = `Eres el coach nutricional y de fuerza de Bruno. ${getProfileStr(isGuardia, activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)}
Plan nutricional activo: ${target.kcal} kcal (${target.label}), P:${target.p}g / C:${target.c}g / G:${target.f}g.
Métricas antropométricas y corporales: ${metricsSummary}
Historial nutricional acumulado reciente: ${recentNutrition}
Día de Split de entrenamiento activo hoy: Día ${activeSplit.key} (${activeSplit.name}), combustible de carbohidratos asignado: ${activeSplit.fuel}.
Hoy lleva consumido: ${Math.round(totals.kcal)} kcal, P:${Math.round(totals.p)}g C:${Math.round(totals.c)}g G:${Math.round(totals.f)}g (Restante hoy: ${Math.round(Math.max(0, target.kcal - totals.kcal))} kcal, P:${Math.round(Math.max(0, target.p - totals.p))}g C:${Math.round(Math.max(0, target.c - totals.c))}g G:${Math.round(Math.max(0, target.f - totals.f))}g).

Entrenamiento realizado por Bruno hoy:
${todayWorkout}

Español, directo, técnico y motivador.
REGLA DE CALCULADORA INVERSA: Si Bruno te pregunta qué cenar o comer para cerrar el día o cómo completar sus macros restantes (ej. 'me quedan 600 calorías y 50g de proteína...'), calcula con precisión matemática una combinación rápida de alimentos (ej. claras, huevo entero, gramos exactos de pechuga de pollo, scoop de whey) para cuadrar sus números de forma exacta.\nREGLA CRÍTICA DE PORCIONES E INGREDIENTES: Cuando recomiendes porciones, alimentos o comidas en el chat, debes ajustar estrictamente las porciones (detallando gramos exactos) al plan nutricional seleccionado por Bruno (${target.label}) y a las necesidades energéticas del split del día (${activeSplit.fuel}). No recomiendes las mismas porciones por defecto. Si está en "Volumen" o día de "Carbo alto", propón porciones abundantes de carbohidratos. Si está en "Definición" o día de "Carbo medio", sé sumamente estricto y reduce las porciones de carbohidratos, sugiriendo fuentes de proteína magra más saciantes.

Debes responder SIEMPRE en formato JSON cumpliendo con el esquema COACH_SCHEMA. Si Bruno te pide agregar o registrar comida (ADD_FOOD), peso (ADD_WEIGHT) o series de ejercicios (ADD_SET), incluye las acciones correspondientes en el arreglo 'actions'. Si es solo una conversación o duda normal, el arreglo 'actions' debe ser vacío.
Ejercicios válidos para ADD_SET: Press banca, Press inclinado mancuerna, Aperturas, Curl inclinado, Curl martillo, Curl prono barra, Sentadilla, Prensa 45°, Sentadilla búlgara, Sentadilla ciclista Smith, Extensión cuádriceps, Press Arnold, Vuelos laterales, Vuelos posteriores polea, Dominadas / Jalón, Remo barra, Remo máquina, Pullover polea, Face pull, Press cerrado, Extensión polea, Extensión sobre cabeza, Peso muerto, Leg curl sentado, Puente glúteos, Estocada atrás Smith.`;
      
      const out = await callGemini(nextChat.slice(-12), sys, COACH_SCHEMA);
      const parsed = JSON.parse(out);
      
      if (parsed.actions && parsed.actions.length > 0) {
        handleCoachActions(parsed.actions);
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
          updatedExercises[currentSplitKey] = [...(updatedExercises[currentSplitKey] || []), { name: resolvedName, tecnico: "", musculos: [] }];
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
    }

    const updates = { exlog: updatedExlog };
    if (exercisesChanged) {
      updates.exercises = updatedExercises;
      setExercises(updatedExercises);
    }
    setExlog(updatedExlog);
    saveState(updates);
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:`radial-gradient(700px 400px at 90% -10%, rgba(205,255,74,.10), transparent 60%), radial-gradient(600px 400px at -10% 10%, rgba(74,214,255,.07), transparent 55%), ${C.bg}`,
      color:C.ink,
      fontFamily:"'Manrope',system-ui,sans-serif",
      paddingTop:65
    }}>
      {/* Nav de navegación superior fija */}
      <div style={{position:"fixed", top:0, left:0, right:0, background:"rgba(12,14,11,.92)", backdropFilter:"blur(10px)", borderBottom:`1px solid ${C.line}`, zIndex:99}}>
        <div style={{maxWidth:520, margin:"0 auto", display:"flex"}}>
          {[["hoy","Hoy",Utensils],["coach","Coach",MessageSquare],["entreno","Entreno",Dumbbell],["reg","Registro",NotebookPen],["plan","Plan",ClipboardList]].map(([k,lbl,Ic]) => (
            <button 
              key={k} 
              onClick={() => setView(k)} 
              style={{
                flex:1, 
                background:"none", 
                border:"none", 
                cursor:"pointer", 
                padding:"8px 0 10px", 
                display:"flex", 
                flexDirection:"column", 
                alignItems:"center", 
                gap:4, 
                color:view===k ? C.lime : C.muted
              }}
            >
              <Ic size={18}/><span style={{fontSize:9.5, fontWeight:700}}>{lbl}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:520, margin:"0 auto", padding:"26px 16px 14px"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:C.lime, fontWeight:800}}>
              Espacio IA · Bruno
            </div>
            <div className="disp" style={{fontSize:34, marginTop:2}}>CENTRO DE MANDO</div>
          </div>
        </div>
        <div style={{display:"flex", gap:8, marginTop:14}}>
          {Object.keys(PRESETS).map(k => (
            <button 
              key={k} 
              onClick={() => changePreset(k)} 
              style={{
                flex:1, 
                padding:"8px 4px", 
                borderRadius:10, 
                fontSize:12, 
                fontWeight:700, 
                cursor:"pointer", 
                border:`1px solid ${presetKey === k ? C.lime : C.line}`, 
                background: presetKey === k ? "rgba(205,255,74,.14)" : C.panel, 
                color: presetKey === k ? C.lime : C.muted
              }}
            >
              {PRESETS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:520, margin:"0 auto", padding:"0 16px"}}>
        {view === "hoy" && (
          <Hoy 
            target={target} 
            totals={totals} 
            log={log} 
            setLog={(l) => { setLog(l); saveState({ log: l }); }} 
            loaded={loaded} 
            water={water} 
            setWater={setWaterP} 
            isGuardia={isGuardia}
            geminiKey={geminiKey}
            supplements={supplements}
            setSupplements={(s) => { setSupplements(s); saveState({ supplements: s }); }}
            activeSplitKey={activeSplitKey}
            suppsInventory={suppsInventory}
            setSuppsInventory={(si) => saveState({ suppsInventory: si })}
            selectedDateStr={selectedDateStr}
            setSelectedDateStr={setSelectedDateStr}
          />
        )}
        {view === "coach" && (
          <Coach 
            chat={chat} 
            setChat={(c) => { setChat(c); saveState({ chat: c }); }} 
            target={target} 
            totals={totals} 
            isGuardia={isGuardia}
            geminiKey={geminiKey}
            saveGeminiKey={saveGeminiKey}
            cloudSync={cloudSync}
            syncCode={syncCode}
            syncStatus={syncStatus}
            handleToggleCloudSync={handleToggleCloudSync}
            handleCreateSyncCode={handleCreateSyncCode}
            handleLinkDevice={handleLinkDevice}
            handleForcePull={handleForcePull}
            handleForcePush={handleForcePush}
            handleCoachActions={handleCoachActions}
            sendCoachMessage={sendCoachMessage}
            chatBusy={chatBusy}
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
          />
        )}
        {view === "entreno" && (
          <Entreno 
            exlog={exlog} 
            setExlog={(el) => { setExlog(el); saveState({ exlog: el }); }} 
            exercises={exercises} 
            setExercises={(ex) => { setExercises(ex); saveState({ exercises: ex }); }}
            isGuardia={isGuardia}
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
          />
        )}
        {view === "reg" && (
          <Registro 
            notes={notes} 
            setNotes={(n) => { setNotes(n); saveState({ notes: n }); }} 
            target={target} 
            bodyComp={bodyComp} 
            setBodyComp={(bc) => { setBodyComp(bc); saveState({ bodyComp: bc }); }}
            isGuardia={isGuardia}
            geminiKey={geminiKey}
            metricslog={metricslog}
            setMetricslog={(ml) => saveState({ metricslog: ml })}
            selectedDateStr={selectedDateStr}
            saveWeight={(w) => saveState({ weight: w })}
            activeMetrics={activeMetrics}
            foodlog={foodlog}
            waterlog={waterlog}
            exlog={exlog}
          />
        )}
        {view === "plan" && (
          <Plan 
            presetKey={presetKey} 
            shoppingList={shoppingList} 
            setShoppingList={(sl) => { setShoppingList(sl); saveState({ shoppingList: sl }); }}
            geminiKey={geminiKey}
            meals={meals}
            setMeals={(ml) => { setMeals(ml); saveState({ meals: ml }); }}
          />
        )}
      </div>

      {prAlerts.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: 480,
          background: "rgba(21, 23, 15, 0.95)",
          border: `2px solid ${C.lime}`,
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 30px rgba(205,255,74,.2), 0 0 20px rgba(0,0,0,0.8)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          animation: "pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
        }}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <span style={{display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:900, color:C.lime}}>
              <Sparkles size={16}/> ¡NUEVO PR DETECTADO!
            </span>
            <button 
              onClick={() => setPrAlerts([])} 
              style={{background:"none", border:"none", color:C.muted, cursor:"pointer", padding:4}}
            >
              <X size={16}/>
            </button>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            {prAlerts.map((msg, idx) => (
              <div key={idx} style={{fontSize:13, color:C.ink, fontWeight:600, borderLeft:`3px solid ${C.lime}`, paddingLeft:8}}>
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== SUB-PANEL IA (AIPanel) ===== */
function AIPanel({title, busy, text, color=C.lime, onClose}){
  if(!busy && !text) return null;
  return (
    <div className="pop" style={{
      background:"rgba(205,255,74,.05)", 
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
function Bar({icon:Ic, label, val, max, unit, color}){
  const pct = Math.min(100, max ? (val / max) * 100 : 0); 
  const over = val > max;
  return (
    <div style={{background:C.panel, border:`1px solid ${over ? C.amber : C.line}`, borderRadius:14, padding:"13px 15px", marginBottom:10}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
        <span style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700}}>
          <Ic size={16} color={color}/>{label}
        </span>
        <span style={{fontVariantNumeric:"tabular-nums", fontSize:13, color:over ? C.amber : C.muted}}>
          <b style={{color:over ? C.amber : C.ink, fontSize:15}}>{Math.round(val)}</b> / {max} {unit}
        </span>
      </div>
      <div style={{height:8, background:C.panel2, borderRadius:4, overflow:"hidden"}}>
        <div style={{height:"100%", width:`${pct}%`, background:color, borderRadius:4}}/>
      </div>
    </div>
  );
}

function Hoy({
  target, totals, log, setLog, loaded, water, setWater, isGuardia, geminiKey, supplements, setSupplements,
  activeSplitKey, suppsInventory, setSuppsInventory, selectedDateStr, setSelectedDateStr
}){
  const [text, setText] = useState(""); 
  const [busy, setBusy] = useState(false); 
  const [err, setErr] = useState("");
  const [newSuppInput, setNewSuppInput] = useState("");

  const toggleSupplement = (name) => {
    const checked = !supplements[name];
    const next = { ...supplements, [name]: checked };
    setSupplements(next);
    
    // Descontar del inventario de stock si corresponde
    if (suppsInventory && suppsInventory[name]) {
      const inv = { ...suppsInventory };
      inv[name] = {
        ...inv[name],
        servingsLeft: Math.max(0, inv[name].servingsLeft + (checked ? -1 : 1))
      };
      setSuppsInventory(inv);
    }
  };
  
  const addCustomSupplement = () => {
    if (!newSuppInput.trim() || supplements[newSuppInput.trim()] !== undefined) return;
    const next = { ...supplements, [newSuppInput.trim()]: false };
    setSupplements(next);
    setNewSuppInput("");
  };

  const deleteSupplement = (name) => {
    const next = { ...supplements };
    delete next[name];
    setSupplements(next);
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
                    "1. Si el usuario no especifica pesos o cantidades exactas (ej. 'un tuto de pollo y arroz', 'un plato de tallarines', 'un plátano', 'un café con leche'), DEBES asumir porciones genéricas estándar y realistas (por ejemplo: un muslo/tuto de pollo mediano = 100g de carne, un plato de arroz = 150g cocido, un plato de pasta = 180g cocido, un plátano mediano = 100g, etc.) para realizar los cálculos. NUNCA dejes campos vacíos ni falles por falta de información.\n" +
                    "2. Interpreta regionalismos chilenos y latinoamericanos comunes (ej. 'tuto de pollo' = muslo/pierna de pollo; 'palta' = aguacate; 'porotos' = frijoles; 'zapallo' = calabaza; 'camote' = boniato; 'lomo liso' = corte de carne de res magra; etc.).\n" +
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
      pushEntry(JSON.parse(out), d); 
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
      pushEntry(JSON.parse(out), "Comida (Foto)"); 
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
    const activeSplit = SPLIT.find(s => s.key === activeSplitKey) || SPLIT[0];
    const sys = `Eres el coach nutricional de Bruno. Plan: ${target.kcal} kcal (${target.label}), ${target.p}P/${target.c}C/${target.f}G. Split activo de hoy: Día ${activeSplit.key} (${activeSplit.name}), combustible de carbohidratos asignado: ${activeSplit.fuel}. Directo, breve, formato legible sin preámbulos.`;
    const user = `Hoy le quedan a Bruno: ${rem.kcal} kcal, ${rem.p} g proteína, ${rem.c} g carbo, ${rem.f} g grasa.
    Propón 2 opciones de cena rápida que cierren estos macros.
    REGLA CRÍTICA DE PORCIONES: Las porciones recomendadas (arroz, papas, pan, pollo, carne, claras, etc.) deben estar ajustadas con precisión matemática para adaptarse al modo nutricional activo (${target.label}) y al combustible del split de hoy (${activeSplit.fuel}). Detalla cantidades exactas en gramos/porciones.`;
    run("Cena Sugerida", sys, user);
  };

  const whatNow = (m) => {
    const activeSplit = SPLIT.find(s => s.key === activeSplitKey) || SPLIT[0];
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
    background: a ? "rgba(205,255,74,.12)" : C.panel,
    color: a ? C.lime : C.ink,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    gap:6,
    flex:1
  });

  return (
    <div className="pop">
      {/* Selector de fecha superior */}
      <div style={{display:"flex", alignItems:"center", justifyTarget:"space-between", justifyContent:"space-between", background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"8px 12px", marginBottom:12}}>
        <button onClick={handlePrevDay} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, width:32, height:32, cursor:"pointer", display:"grid", placeItems:"center", fontWeight:"bold"}}>◀</button>
        <span style={{fontSize:13, fontWeight:800, textTransform:"uppercase", color:C.lime, textAlign:"center"}}>
          {selectedDateStr === getLocalDateStr(new Date()) ? "Hoy · " : ""}{formatSelectedDate(selectedDateStr)}
        </span>
        <button onClick={handleNextDay} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, width:32, height:32, cursor:"pointer", display:"grid", placeItems:"center", fontWeight:"bold"}}>▶</button>
      </div>

      {/* Tarjetas de macros */}
      <Bar icon={Flame} label="Calorías" val={totals.kcal} max={target.kcal} unit="kcal" color={C.lime}/>
      <Bar icon={Beef} label="Proteína" val={totals.p} max={target.p} unit="g" color={C.cyan}/>
      <Bar icon={Wheat} label="Carbohidratos" val={totals.c} max={target.c} unit="g" color={C.lime}/>
      <Bar icon={Droplet} label="Grasas" val={totals.f} max={target.f} unit="g" color={C.amber}/>
      
      <div style={{
        background:"rgba(74,214,255,.08)",
        border:`1px solid rgba(74,214,255,.2)`,
        borderRadius:12,
        padding:"10px 14px",
        margin:"4px 0 12px",
        fontSize:12.5,
        color:"#cfe9f5"
      }}>
        Te quedan <b style={{color:C.cyan}}>{rem.p} g de proteína</b> hoy. Objetivo prioritario.
      </div>

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

      {/* Registro de comida manual / cámara */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:14, marginBottom:14}}>
        <div style={{fontSize:13, fontWeight:800, marginBottom:8, display:"flex", alignItems:"center", gap:8}}>
          <Plus size={16} color={C.lime}/>Registrar comida
        </div>
        <textarea 
          value={text} 
          onChange={e => setText(e.target.value)} 
          className="ph" 
          rows={2} 
          placeholder="Ej: 200g pollo a la plancha, 150g arroz blanco, ensalada de palta..." 
          style={{width:"100%", resize:"none", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none"}}
        />
        <div style={{display:"flex", gap:8, marginTop:8}}>
          <button 
            onClick={addFood} 
            disabled={busy} 
            style={{
              flex:1, 
              padding:"11px", 
              borderRadius:10, 
              border:"none", 
              cursor:"pointer", 
              background: busy ? C.panel2 : C.lime, 
              color: busy ? C.muted : "#1a2400", 
              fontWeight:800, 
              fontSize:14, 
              display:"flex", 
              alignItems:"center", 
              justifyContent:"center", 
              gap:8
            }}
          >
            {busy ? <><Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/>Estimando…</> : "Añadir con IA"}
          </button>
          <button 
            onClick={() => fileRef.current.click()} 
            disabled={busy} 
            style={{width:52, borderRadius:10, border:`1px solid ${C.line}`, background:C.panel2, color:C.lime, cursor:"pointer", display:"grid", placeItems:"center"}}
          >
            <Camera size={20}/>
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{display:"none"}}/>
        </div>
        {err && <div style={{color:C.rose, fontSize:12, marginTop:8}}>{err}</div>}
      </div>

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
            style={{padding:"6px 12px", background:C.lime, color:"#1a2400", fontWeight:800, borderRadius:8, fontSize:11, cursor:"pointer"}}
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
          {["Pre-entreno", "Post-entreno", "Desayuno rápido", "Snack de guardia"].map(m => (
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
        <div key={e.id} className="pop" style={{
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
            <div style={{fontSize:13.5, fontWeight:600, marginBottom:4}}>{e.resumen}</div>
            <div style={{fontSize:11.5, color:C.muted, display:"flex", gap:10, flexWrap:"wrap", fontVariantNumeric:"tabular-nums"}}>
              <span style={{color:C.lime}}>{Math.round(e.kcal)} kcal</span>
              <span style={{color:C.cyan}}>P {Math.round(e.proteina)}g</span>
              <span>C {Math.round(e.carbo)}g</span>
              <span style={{color:C.amber}}>G {Math.round(e.grasa)}g</span>
            </div>
          </div>
          <button onClick={() => del(e.id)} style={{background:"none", border:"none", cursor:"pointer", color:C.muted}}>
            <Trash2 size={16}/>
          </button>
        </div>
      ))}
    </div>
  );
}

/* ===== TAB COACH & CONFIGURACIÓN ===== */
function Coach({
  chat, setChat, target, totals, isGuardia, geminiKey, saveGeminiKey,
  cloudSync, syncCode, syncStatus, handleToggleCloudSync, handleCreateSyncCode, handleLinkDevice, handleForcePull, handleForcePush,
  handleCoachActions, sendCoachMessage, chatBusy,
  supabaseUrl, supabaseAnonKey, supabaseUser, sbSyncing, sbError,
  saveSbConfig, handleSbLogin, handleSbRegister, handleSbLogout, syncLocalToSupabase
}){
  const [text, setText] = useState(""); 
  const [showKeyField, setShowKeyField] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [linkSuccess, setLinkSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  
  // Supabase UI States
  const [sbUrlInput, setSbUrlInput] = useState(supabaseUrl || "");
  const [sbKeyInput, setSbKeyInput] = useState(supabaseAnonKey || "");
  const [sbEmail, setSbEmail] = useState("");
  const [sbPass, setSbPass] = useState("");
  const [showSbField, setShowSbField] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    setSbUrlInput(supabaseUrl || "");
    setSbKeyInput(supabaseAnonKey || "");
  }, [supabaseUrl, supabaseAnonKey]);

  useEffect(() => { 
    endRef.current && endRef.current.scrollIntoView({behavior:"smooth"}); 
  }, [chat, chatBusy]);

  useEffect(() => {
    setKeyInput(geminiKey);
  }, [geminiKey]);

  const send = () => { 
    if(!text.trim() || chatBusy) return; 
    sendCoachMessage(text.trim());
    setText(""); 
  };

  const handleSaveKey = () => {
    saveGeminiKey(keyInput.trim());
    setShowKeyField(false);
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
    <div className="pop chat-window">
      
      {/* Cabecera del Chat con el Coach */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${C.line}`}}>
        <div className="disp" style={{fontSize:22, color:C.lime}}>CHAT CON EL COACH</div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: showSettings ? "rgba(205,255,74,.15)" : C.panel,
            border: `1px solid ${showSettings ? C.lime : C.line}`,
            color: showSettings ? C.lime : C.muted,
            padding: "5px 10px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 700
          }}
        >
          <Settings size={14} color={showSettings ? C.lime : C.muted}/>
          <span>{showSettings ? "Cerrar Ajustes" : "Ajustes"}</span>
        </button>
      </div>

      {/* Sección de Ajustes e Integraciones */}
      {showSettings && (
        <div className="pop" style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"12px 14px", marginBottom:12, display:"flex", flexDirection:"column", gap:8}}>
          
          {/* Toggle API Key */}
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", borderBottom:`1px solid ${C.line}`, paddingBottom:6}} onClick={() => setShowKeyField(!showKeyField)}>
            <span style={{fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:6}}>
              <Sparkles size={14} color={C.lime}/> Ajustes de Gemini API
            </span>
            <span style={{fontSize:10, color:C.muted}}>{showKeyField ? "Ocultar" : "Configurar"}</span>
          </div>
          {showKeyField && (
            <div style={{marginTop:4, display:"flex", flexDirection:"column", gap:6}}>
              <div style={{display:"flex", gap:8}}>
                <input 
                  value={keyInput} 
                  onChange={e => setKeyInput(e.target.value)} 
                  type="password" 
                  placeholder="API_KEY_1, API_KEY_2..." 
                  style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px 10px", fontSize:12, color:C.ink}}
                />
                <button onClick={handleSaveKey} style={{padding:"8px 12px", background:C.lime, color:"#1a2400", fontWeight:700, borderRadius:8, fontSize:12, cursor:"pointer"}}>
                  Guardar
                </button>
              </div>
              <div style={{fontSize:11, color:C.muted, lineHeight:1.3}}>
                Puedes ingresar múltiples API Keys separadas por comas. El sistema las probará en orden si alguna supera su cuota o da error.
              </div>
            </div>
          )}

          {/* Sección de Cloud Sync */}
          <div style={{display:"flex", flexDirection:"column", gap:6, paddingTop:4}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span style={{fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:6}}>
                <RefreshCw size={14} color={C.cyan} style={{ animation: syncStatus === "Sincronizando..." || syncStatus === "Guardando..." ? "spin 2s linear infinite" : "none" }}/> 
                Sincronización en la Nube
              </span>
              <span style={{fontSize:10, color: syncStatus === "Sincronizado" ? C.lime : C.muted, fontWeight:700}}>{syncStatus}</span>
            </div>

            <div style={{display:"flex", alignItems:"center", gap:8, marginTop:4}}>
              <span style={{fontSize:11.5, color:C.muted, flex:1}}>Guardar progreso entre dispositivos</span>
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
                style={{
                  padding:"5px 10px",
                  borderRadius:8,
                  fontSize:11,
                  fontWeight:800,
                  background: cloudSync ? "rgba(205,255,74,.15)" : C.panel2,
                  border: `1px solid ${cloudSync ? C.lime : C.line}`,
                  color: cloudSync ? C.lime : C.muted,
                  cursor:"pointer"
                }}
              >
                {cloudSync ? "ACTIVO" : "DESACTIVADO"}
              </button>
            </div>

            {showEmailInput && !cloudSync && (
              <div className="pop" style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10, marginTop:6, display:"flex", flexDirection:"column", gap:6}}>
                <div style={{fontSize:11, color:C.muted}}>Ingresa tu correo para crear un código de sincronización seguro:</div>
                <div style={{display:"flex", gap:6}}>
                  <input 
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    type="email"
                    placeholder="tu-correo@ejemplo.com"
                    style={{flex:1, background:C.bg, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:12, color:C.ink}}
                  />
                  <button 
                    onClick={async () => {
                      if (!emailInput.trim()) {
                        setEmailErr("Por favor ingresa un correo");
                        return;
                      }
                      setEmailErr("");
                      const ok = await handleCreateSyncCode(emailInput);
                      if (ok) {
                        setShowEmailInput(false);
                        setEmailInput("");
                      } else {
                        setEmailErr("Error al crear código. Intenta de nuevo.");
                      }
                    }}
                    style={{padding:"6px 12px", background:C.lime, color:"#1a2400", fontWeight:800, borderRadius:8, fontSize:11, cursor:"pointer"}}
                  >
                    Crear Código
                  </button>
                </div>
                {emailErr && <div style={{color:C.rose, fontSize:11}}>{emailErr}</div>}
              </div>
            )}

            {cloudSync && syncCode && (
              <div className="pop" style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10, marginTop:6, display:"flex", flexDirection:"column", gap:6}}>
                <div style={{fontSize:10.5, color:C.amber, fontWeight:700, display:"flex", alignItems:"center", gap:4}}>
                  <ShieldAlert size={12}/>
                  <span>Verificación requerida en tu correo</span>
                </div>
                <div style={{fontSize:11, color:C.muted, lineHeight:1.4}}>
                  Se ha registrado un código seguro. <b>Revisa tu correo</b> para buscar el mensaje de verificación de <b>kvdb.io</b> para activar la sincronización.
                </div>
                <div style={{fontSize:10, color:C.muted, textTransform:"uppercase", fontWeight:700, marginTop:4}}>Código de enlace (Copia en tu celular)</div>
                <div style={{display:"flex", gap:6, alignItems:"center"}}>
                  <code style={{flex:1, background:C.bg, padding:"6px 8px", borderRadius:6, fontSize:11.5, color:C.cyan, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{syncCode}</code>
                  <button onClick={handleCopyCode} style={{padding:"6px 10px", borderRadius:6, background:C.line, color:C.ink, cursor:"pointer", display:"flex", alignItems:"center", gap:4}}>
                    {copied ? <Check size={12} color={C.lime}/> : <Copy size={12}/>}
                    <span style={{fontSize:10}}>{copied ? "Copiado" : "Copiar"}</span>
                  </button>
                  <button onClick={handleForcePush} style={{padding:"6px 10px", borderRadius:6, background:C.line, color:C.lime, cursor:"pointer", fontSize:10, fontWeight:700}}>
                    Subir
                  </button>
                  <button onClick={handleForcePull} style={{padding:"6px 10px", borderRadius:6, background:C.line, color:C.cyan, cursor:"pointer", fontSize:10, fontWeight:700}}>
                    Descargar
                  </button>
                </div>
              </div>
            )}

            {cloudSync && (
              <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:6}}>
                <div style={{fontSize:10, color:C.muted, textTransform:"uppercase", fontWeight:700}}>Vincular con otro dispositivo</div>
                <div style={{display:"flex", gap:6}}>
                  <input 
                    value={linkInput}
                    onChange={e => setLinkInput(e.target.value)}
                    placeholder="Pega el código de sincronización..."
                    style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:12, color:C.ink}}
                  />
                  <button onClick={processLinking} style={{padding:"6px 12px", background:C.cyan, color:"#04212b", fontWeight:800, borderRadius:8, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:4}}>
                    <Link2 size={12}/> Vincular
                  </button>
                </div>
                {linkSuccess === true && <div style={{color:C.lime, fontSize:11.5}}>¡Vinculado correctamente! Datos actualizados.</div>}
                {linkSuccess === false && <div style={{color:C.rose, fontSize:11.5}}>Código inválido o error en la descarga.</div>}
              </div>
            )}
          </div>

          {/* Sección de Supabase Cloud Database */}
          <div style={{display:"flex", flexDirection:"column", gap:6, paddingTop:6, borderTop:`1px solid ${C.line}`}}>
            <div style={{display:"flex", justifyTarget:"space-between", justifyContent:"space-between", alignItems:"center", cursor:"pointer", paddingBottom:2}} onClick={() => setShowSbField(!showSbField)}>
              <span style={{fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:6}}>
                <RefreshCw size={14} color={supabaseUser ? C.lime : C.muted} style={{ animation: sbSyncing ? "spin 2s linear infinite" : "none" }}/>
                Supabase Cloud Database
              </span>
              <span style={{fontSize:10, color:C.muted}}>{showSbField ? "Ocultar" : "Configurar"}</span>
            </div>

            {showSbField && (
              <div className="pop" style={{display:"flex", flexDirection:"column", gap:8, marginTop:4}}>
                {/* Inputs de Configuración */}
                <div>
                  <span style={{fontSize:10.5, color:C.muted}}>Supabase Project URL:</span>
                  <input 
                    value={sbUrlInput}
                    onChange={e => setSbUrlInput(e.target.value)}
                    placeholder="https://xxxx.supabase.co"
                    style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:11.5, color:C.ink, marginTop:2}}
                  />
                </div>
                <div>
                  <span style={{fontSize:10.5, color:C.muted}}>Supabase Anon Key:</span>
                  <input 
                    value={sbKeyInput}
                    onChange={e => setSbKeyInput(e.target.value)}
                    type="password"
                    placeholder="eyJhbGciOi..."
                    style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:11.5, color:C.ink, marginTop:2}}
                  />
                </div>
                <button 
                  onClick={() => saveSbConfig(sbUrlInput, sbKeyInput)}
                  style={{padding:"8px", background:C.line, color:C.lime, fontWeight:800, borderRadius:8, fontSize:11.5, cursor:"pointer", width:"100%"}}
                >
                  Guardar Configuración
                </button>

                {/* Login / Registro / Estado de Sesión */}
                {supabaseUrl && supabaseAnonKey && (
                  <div style={{borderTop:`1px dashed ${C.line}`, marginTop:6, paddingTop:8, display:"flex", flexDirection:"column", gap:8}}>
                    {supabaseUser ? (
                      <div>
                        <div style={{fontSize:11.5, color:C.muted, marginBottom:6}}>
                          Sesión activa: <b style={{color:C.lime}}>{supabaseUser.email}</b>
                        </div>
                        <div style={{display:"flex", gap:6}}>
                          <button 
                            onClick={syncLocalToSupabase}
                            disabled={sbSyncing}
                            style={{flex:1, padding:"8px", background:C.lime, color:"#1a2400", fontWeight:800, borderRadius:8, fontSize:11.5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6}}
                          >
                            {sbSyncing ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : "Sincronizar ahora"}
                          </button>
                          <button 
                            onClick={handleSbLogout}
                            disabled={sbSyncing}
                            style={{padding:"8px 12px", background:C.panel2, border:`1px solid ${C.line}`, color:C.rose, fontWeight:700, borderRadius:8, fontSize:11.5, cursor:"pointer"}}
                          >
                            Salir
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{display:"flex", flexDirection:"column", gap:8}}>
                        <div style={{fontSize:11.5, color:C.muted}}>Ingresa a tu cuenta de Supabase:</div>
                        <input 
                          value={sbEmail}
                          onChange={e => setSbEmail(e.target.value)}
                          placeholder="tu-correo@ejemplo.com"
                          style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:11.5, color:C.ink}}
                        />
                        <input 
                          value={sbPass}
                          onChange={e => setSbPass(e.target.value)}
                          type="password"
                          placeholder="Contraseña"
                          style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 10px", fontSize:11.5, color:C.ink}}
                        />
                        <div style={{display:"flex", gap:6}}>
                          <button 
                            onClick={() => handleSbLogin(sbEmail, sbPass)}
                            disabled={sbSyncing}
                            style={{flex:1, padding:"8px", background:C.cyan, color:"#04212b", fontWeight:800, borderRadius:8, fontSize:11.5, cursor:"pointer"}}
                          >
                            {sbSyncing ? "Conectando..." : "Iniciar Sesión"}
                          </button>
                          <button 
                            onClick={() => handleSbRegister(sbEmail, sbPass)}
                            disabled={sbSyncing}
                            style={{flex:1, padding:"8px", background:C.lime, color:"#1a2400", fontWeight:800, borderRadius:8, fontSize:11.5, cursor:"pointer"}}
                          >
                            Registrarse
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {sbError && (
                  <div style={{fontSize:11, color: sbError.includes("Error") ? C.rose : C.lime, marginTop:4, lineHeight:1.3}}>
                    {sbError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="chat-bubble-container" style={{display:"flex", flexDirection:"column"}}>
        {chat.length === 0 ? (
          <div style={{textAlign:"center", color:C.muted, fontSize:13, padding:"30px 14px"}}>
            <MessageSquare size={26} color={C.lime} style={{marginBottom:10}}/>
            <p>Pregúntale a tu coach sobre tus macros, guardias o entrenamientos.</p>
            <div style={{display:"flex", flexDirection:"column", gap:8, marginTop:16}}>
              {["¿Cómo ajusto mis macros tras una guardia de 24h?", "¿Qué snacks proteicos me recomiendas para quirófano?", "Me siento fatigado, ¿debería saltar el entreno hoy?"].map(q => (
                <button key={q} onClick={() => setText(q)} style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:10, padding:"9px 12px", color:C.ink, fontSize:12.5, cursor:"pointer", textAlign:"left"}}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: "auto" }} />
        )}
        
        {chat.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role === "user" ? "user" : "assistant"}`}>
            {m.content}
          </div>
        ))}
        
        {chatBusy && (
          <div style={{display:"flex", gap:6, color:C.muted, fontSize:13, alignItems:"center", padding:"4px 2px"}}>
            <Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/>pensando…
          </div>
        )}
        <div ref={endRef}/>
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
        <button onClick={send} disabled={chatBusy} style={{width:48, borderRadius:12, border:"none", background:C.lime, color:"#1a2400", cursor:"pointer", display:"grid", placeItems:"center"}}>
          <Send size={18}/>
        </button>
      </div>
    </div>
  );
}

/* ===== TAB ENTRENAMIENTO ===== */
function Entreno({
  exlog, setExlog, exercises, setExercises, isGuardia, geminiKey, handleAnalyzeWorkout, importWorkoutData,
  activeSplitKey, setActiveSplitKey, selectedDateStr, setSelectedDateStr, calMonth, setCalMonth,
  workoutDurations, setWorkoutDurations, prAlerts, setPrAlerts, checkNewPR, activeMetrics
}){
  const sel = activeSplitKey;
  const setSel = setActiveSplitKey;
  const [open, setOpen] = useState(null);
  const [w, setW] = useState(""); 
  const [reps, setReps] = useState("");
  const [setsCount, setSetsCount] = useState("1");
  const [setType, setSetType] = useState("work"); // 'work' or 'warmup'
  
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

  const getWorkoutSessionsByDate = () => {
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
  };

  const workoutSessions = getWorkoutSessionsByDate();

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

  const dayObj = SPLIT.find(d => d.key === sel) || {name: "Día " + sel, fuel: ""};
  const dayExs = (exercises || {})[sel] || [];
  const dayMuscles = [...new Set(dayExs.flatMap(e => e.musculos || []))];
  const last = (n) => { const a = (exlog || {})[n]; return a && a.length ? a[0] : null; };
  const chartData = (n) => ((exlog || {})[n] || []).slice().reverse().map(s => ({date: s.date, w: s.w}));

  useEffect(() => {
    (async () => {
      const savedDaySug = await loadKey("last_day_sug", "");
      const savedWk = await loadKey("last_wk_sug", "");
      if (savedDaySug) setDaySug(savedDaySug);
      if (savedWk) setWk(savedWk);
    })();
  }, []);

  /* ===== MAPA DE CALOR DE VOLUMEN SEMANAL ===== */
  const exMap = {}; 
  Object.values(exercises || {}).flat().forEach(e => { exMap[e.name] = e.musculos || []; });
  const weekAgo = Date.now() - 7 * 864e5; 
  const vol = { Pectoral: 0, Espalda: 0, Cuádriceps: 0, Isquios: 0, Deltoides: 0, Bíceps: 0, Tríceps: 0, Glúteos: 0, Antebrazo: 0 };
  
  Object.entries(exlog || {}).forEach(([name, sets]) => { 
    const ms = exMap[name] || MUSCLES[name] || []; 
    (sets || []).forEach(s => { 
      if(s && s.date && new Date(s.date).getTime() >= weekAgo && s.type !== "warmup") {
        ms.forEach(m => { 
          if(vol[m] !== undefined) vol[m] = vol[m] + 1; 
        }); 
      }
    }); 
  });

  const getHeatColor = (sets) => {
    if (sets === 0) return { bg: C.panel2, text: C.muted };
    if (sets < 4) return { bg: "rgba(205, 255, 74, 0.15)", text: C.ink, border: "rgba(205, 255, 74, 0.3)" };
    if (sets < 8) return { bg: "rgba(205, 255, 74, 0.35)", text: "#1a2400", border: C.lime, fontWeight: 700 };
    return { bg: C.lime, text: "#1a2400", border: C.lime, fontWeight: 800, boxShadow: "0 0 10px rgba(205, 255, 74, 0.3)" };
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
      const parsed = JSON.parse(out);
      if (!parsed.exercises || parsed.exercises.length === 0) {
        throw new Error("No se detectaron ejercicios.");
      }
      
      const list = parsed.exercises.map(ex => {
        const bestMatch = findBestMatch(ex.name, allExistingExercises);
        return {
          originalName: ex.name,
          targetName: bestMatch,
          sets: ex.sets.map(s => ({ w: s.w, reps: String(s.reps), type: s.type || "work" }))
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

    // Check for PR before writing
    const newPrs = [];
    const prMsg = checkNewPR(n, parseFloat(w), reps.trim());
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
        type: setType
      });
    }
    const next = {...exlog, [n]: [...newSets.reverse(), ...(exlog[n] || [])].slice(0, 60)}; 
    setExlog(next); 
    setW(""); 
    setReps(""); 
    setSetsCount("1");
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
      updatedExercises[k] = updatedExercises[k].filter(e => e.name !== n);
    });
    setExercises(updatedExercises);

    const updatedExlog = { ...exlog };
    delete updatedExlog[n];
    setExlog(updatedExlog);
  };

  const addExercise = async() => { 
    if(!addText.trim() || addBusy) return; 
    setAddBusy(true); 
    setAddErr("");
    try{
      if(addMode === "nombre"){
        const sys = "Eres un entrenador personal. Analiza el ejercicio brindado y devuelve un JSON. Ejemplo:\n" +
                    "{\n" +
                    "  \"tecnico\": \"Extensión de rodilla en máquina\",\n" +
                    "  \"musculos\": [\"Cuádriceps\"]\n" +
                    "}";
        const schema = {
          type: "OBJECT",
          properties: {
            tecnico: { type: "STRING" },
            musculos: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["tecnico", "musculos"]
        };
        const o = JSON.parse(await callGemini([{role:"user", content:addText.trim()}], sys, schema));
        setExercises({...exercises, [sel]: [...dayExs, {name: addText.trim(), tecnico: o.tecnico || "", musculos: o.musculos || []}]});
      } else {
        const sys = "El usuario describe un ejercicio físico. Identifícalo y devuelve un JSON. Ejemplo:\n" +
                    "{\n" +
                    "  \"nombre\": \"Vuelos laterales en polea\",\n" +
                    "  \"tecnico\": \"Abducción de hombro en polea baja\",\n" +
                    "  \"musculos\": [\"Deltoides\"]\n" +
                    "}";
        const schema = {
          type: "OBJECT",
          properties: {
            nombre: { type: "STRING" },
            tecnico: { type: "STRING" },
            musculos: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["nombre", "tecnico", "musculos"]
        };
        const o = JSON.parse(await callGemini([{role:"user", content:addText.trim()}], sys, schema));
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
    const hist = (exlog[ex.name] || []).slice(0, 8).map(s => `${fdate(s.date)}: ${s.w}kg x ${s.reps}`).join(" | ") || "Sin registros previos";
    try{ 
      const sys = `Eres el entrenador personal de Bruno. ${getProfileStr(isGuardia, activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Entrega recomendaciones concretas de sobrecarga progresiva y técnica de ejecución. Corto y directo.`;
      const out = await callGemini([{role:"user", content:`Ejercicio: ${ex.name}. Músculos: ${(ex.musculos || []).join(", ") || "?"}. Historial reciente (nuevo a viejo): ${hist}. Analiza el rendimiento y da pautas de carga/repeticiones para el próximo entrenamiento.`}], sys);
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
      const a = (exlog[ex.name] || []).slice(0, 3).map(s => `${s.w}kg x ${s.reps}`).join(", "); 
      return a ? `${ex.name}: ${a}` : `${ex.name}: sin marcas`; 
    }).join(" | ");
    try{ 
      const sys = `Eres el entrenador de fuerza de Bruno. ${getProfileStr(isGuardia, activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Orden del entrenamiento: mantener el orden asignado del split. Respuestas estructuradas y breves.`;
      const out = await callGemini([{role:"user", content:`Día del Split ${sel}: ${dayObj.name}. Músculos: ${dayMuscles.join(", ")}. Historial: ${hist}. Planifica las series, pesos de calentamiento, y series de trabajo sugeridas hoy.`}], sys);
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
      const sys = `Eres el entrenador deportivo de Bruno. ${getProfileStr(isGuardia, activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Organiza la semana de Bruno de forma realista para sus guardias hospitalarias.`;
      const out = await callGemini([{role:"user", content:"Organiza una distribución semanal de 7 días para sus 4 entrenamientos + descansos. Incluye consejos de qué hacer si le cae una guardia pediátrica de emergencia."}], sys);
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
                  ? "rgba(205, 255, 74, 0.18)" 
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
                  {Object.entries(selectedDayWorkouts).map(([exName, sets]) => (
                    <div key={exName} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"8px 12px"}}>
                      <div style={{fontSize:12.5, fontWeight:700, color:C.ink, marginBottom:4}}>{exName}</div>
                      <div style={{display:"flex", flexDirection:"column", gap:4}}>
                        {sets.map((s, idx) => (
                          <div key={idx} style={{display:"flex", alignItems:"center", gap:6}}>
                            <span style={{
                              flex:1,
                              fontSize:11, 
                              background:C.bg, 
                              border:`1px solid ${s.type === "warmup" ? C.line : C.cyan}`, 
                              borderRadius:6, 
                              padding:"3px 8px", 
                              color: s.type === "warmup" ? C.muted : C.cyan,
                              textDecoration: s.type === "warmup" ? "line-through" : "none"
                            }}>
                              {s.w} kg × {s.reps} {s.type === "warmup" ? "(C)" : ""}
                            </span>
                            <button 
                              onClick={() => delSetFromDay(exName, s)}
                              title="Eliminar esta serie"
                              style={{background:"none", border:"none", cursor:"pointer", color:C.rose, padding:"2px 4px", flexShrink:0}}
                            >
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
      <div style={{display:"flex", gap:6, marginBottom:14}}>
        {SPLIT.map(d => (
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
              background: sel === d.key ? "rgba(205,255,74,.14)" : C.panel, 
              color: sel === d.key ? C.lime : C.muted
            }}
          >
            {d.key}
          </button>
        ))}
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

      {/* Importador Masivo por Texto */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:14, marginBottom:12}}>
        <div style={{fontSize:13, fontWeight:800, marginBottom:8, display:"flex", alignItems:"center", gap:8}}>
          <Sparkles size={16} color={C.lime}/> Cargar entrenamiento por texto
        </div>
        
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
                color: importBusy ? C.muted : "#1a2400", 
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
                style={{flex:1, padding:"10px", borderRadius:8, border:"none", background:C.lime, color:"#1a2400", fontWeight:800, fontSize:13, cursor:"pointer"}}
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

      {/* Listado de ejercicios del día */}
      {dayExs.map(ex => {
        const isOpen = open === ex.name; 
        const l = last(ex.name); 
        const cd = chartData(ex.name);
        return (
          <div key={ex.name} style={{background:C.panel, border:`1px solid ${isOpen ? C.lime : C.line}`, borderRadius:13, marginBottom:9, overflow:"hidden"}}>
            <button 
              onClick={() => { setOpen(isOpen ? null : ex.name); setW(""); setReps(""); }} 
              style={{width:"100%", background:"none", border:"none", cursor:"pointer", padding:"12px 14px", display:"flex", alignItems:"center", gap:10, color:C.ink, textAlign:"left"}}
            >
              <div style={{flex:1}}>
                <div style={{fontSize:13.5, fontWeight:600}}>{ex.name}</div>
                {ex.tecnico && <div style={{fontSize:11, color:C.muted, fontStyle:"italic"}}>{ex.tecnico}</div>}
                {l ? (
                  <div style={{fontSize:11.5, color:C.cyan, marginTop:2}}>última: {l.w} kg × {l.reps} · {fdate(l.date)}</div>
                ) : (
                  <div style={{fontSize:11.5, color:C.muted, marginTop:2}}>{(ex.musculos || []).join(" · ")}</div>
                )}
              </div>
              <span style={{color:C.muted, fontSize:14}}>{isOpen ? "▴" : "▾"}</span>
            </button>
            
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
                      fontSize:11, 
                      fontWeight:700, 
                      cursor:"pointer", 
                      border:`1px solid ${setType === "work" ? C.lime : C.line}`, 
                      background: setType === "work" ? "rgba(205,255,74,.12)" : "transparent", 
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
                      fontSize:11, 
                      fontWeight:700, 
                      cursor:"pointer", 
                      border:`1px solid ${setType === "warmup" ? C.amber : C.line}`, 
                      background: setType === "warmup" ? "rgba(255,177,61,.12)" : "transparent", 
                      color: setType === "warmup" ? C.amber : C.muted
                    }}
                  >
                    Calentamiento
                  </button>
                </div>

                {/* Agregar series */}
                <div style={{display:"flex", gap:8, marginBottom:8}}>
                  <input 
                    value={w} 
                    onChange={e => setW(e.target.value)} 
                    type="number" 
                    inputMode="decimal" 
                    className="ph" 
                    placeholder="kg" 
                    style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"9px 11px", color:C.ink, fontSize:14, outline:"none"}}
                  />
                  <input 
                    value={reps} 
                    onChange={e => setReps(e.target.value)} 
                    className="ph" 
                    placeholder="Reps" 
                    style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"9px 11px", color:C.ink, fontSize:14, outline:"none"}}
                  />
                  <input 
                    value={setsCount} 
                    onChange={e => setSetsCount(e.target.value)} 
                    type="number"
                    inputMode="numeric"
                    className="ph" 
                    placeholder="Series" 
                    style={{width:70, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"9px 11px", color:C.ink, fontSize:14, outline:"none", textAlign:"center"}}
                  />
                  <button onClick={() => addSet(ex.name)} style={{width:44, borderRadius:9, border:"none", background:C.lime, color:"#1a2400", cursor:"pointer", fontSize:20, fontWeight:700}}>＋</button>
                </div>

                <Chart entries={cd}/>

                {(exlog[ex.name] || []).length === 0 && (
                  <div style={{fontSize:12, color:C.muted, padding:"4px 0"}}>Sin registros en bitácora.</div>
                )}

                {(exlog[ex.name] || []).map((s, i) => (
                  <div key={i} style={{display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderTop:`1px solid ${C.line}`, opacity: s.type === "warmup" ? 0.6 : 1}}>
                    <span style={{fontSize:12.5, color:C.muted, minWidth:54}}>{fdate(s.date)}</span>
                    <span style={{fontSize:13.5, fontWeight:600}}>{s.w} kg</span>
                    <span style={{fontSize:13, color:C.muted}}>× {s.reps}</span>
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
                  <button onClick={() => delExercise(ex.name)} style={{padding:"9px 12px", borderRadius:9, border:`1px solid ${C.line}`, background:"none", color:C.muted, cursor:"pointer", fontSize:12.5}}>Quitar</button>
                </div>
                {prog[ex.name] && <AIPanel title="Consejo de Progresión" busy={false} text={prog[ex.name]} color={C.cyan} onClose={() => setProg(p => ({...p, [ex.name]: ""}))}/>}
              </div>
            )}
          </div>
        );
      })}

      {/* Agregar ejercicio nuevo */}
      {!adding ? (
        <button onClick={() => { setAdding(true); setAddErr(""); setAddText(""); }} style={{width:"100%", padding:"11px", borderRadius:12, border:`1px dashed ${C.line}`, background:"none", color:C.muted, cursor:"pointer", fontWeight:700, fontSize:13, marginTop:4}}>
          ＋ Añadir ejercicio nuevo
        </button>
      ) : (
        <div className="pop" style={{background:C.panel, border:`1px solid ${C.lime}`, borderRadius:14, padding:14, marginTop:4}}>
          <div style={{display:"flex", gap:7, marginBottom:10}}>
            <button onClick={() => setAddMode("nombre")} style={{flex:1, padding:"8px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:`1px solid ${addMode === "nombre" ? C.lime : C.line}`, background: addMode === "nombre" ? "rgba(205,255,74,.12)" : "transparent", color: addMode === "nombre" ? C.lime : C.muted}}>
              Sé el nombre
            </button>
            <button onClick={() => setAddMode("describir")} style={{flex:1, padding:"8px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:`1px solid ${addMode === "describir" ? C.lime : C.line}`, background: addMode === "describir" ? "rgba(205,255,74,.12)" : "transparent", color: addMode === "describir" ? C.lime : C.muted}}>
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
              style={{flex:1, padding:"10px", borderRadius:10, border:"none", background: addBusy ? C.panel2 : C.lime, color: addBusy ? C.muted : "#1a2400", cursor:"pointer", fontWeight:800, fontSize:13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6}}
            >
              {addBusy ? <><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Procesando…</> : (addMode === "nombre" ? "Añadir ejercicio" : "Identificar y añadir")}
            </button>
            <button onClick={() => setAdding(false)} style={{padding:"10px 14px", borderRadius:10, border:`1px solid ${C.line}`, background:"none", color:C.muted, cursor:"pointer", fontSize:13.5}}>
              Cancelar
            </button>
          </div>
          {addErr && <div style={{color:C.rose, fontSize:12, marginTop:8}}>{addErr}</div>}
        </div>
      )}

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
          color:"#1a2400", 
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
        style={{width:"100%", marginTop:12, padding:"12px", borderRadius:12, border:"none", cursor:"pointer", background: dayBusy ? C.panel2 : C.lime, color: dayBusy ? C.muted : "#1a2400", fontWeight:800, fontSize:14, display:"flex", alignItems:"center", justifyTarget:"center", justifyContent:"center", gap:8}}
      >
        {dayBusy ? <><Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/>Planificando…</> : <><Sparkles size={16}/>Rutina sugerida para hoy</>}
      </button>
      <AIPanel title={`Rutina del Día · ${dayObj.name}`} busy={dayBusy} text={daySug} onClose={() => { setDaySug(""); saveKey("last_day_sug", ""); }}/>

      <button 
        onClick={planWeek} 
        disabled={wkBusy} 
        style={{width:"100%", marginTop:10, padding:"11px", borderRadius:12, border:`1px solid ${C.line}`, cursor:"pointer", background:C.panel, color:C.lime, fontWeight:800, fontSize:13.5, display:"flex", alignItems:"center", justifyTarget:"center", justifyContent:"center", gap:8}}
      >
        {wkBusy ? <><Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/>Planificando…</> : <><CalendarDays size={16}/>Distribución semanal de guardias</>}
      </button>
      <AIPanel title="Organización Semanal" busy={wkBusy} text={wk} color={C.cyan} onClose={() => { setWk(""); saveKey("last_wk_sug", ""); }}/>
    </div>
  );
}

/* ===== TAB REGISTRO / PESO / COMPOSICIÓN CORPORAL ===== */
/* ===== TAB REGISTRO / PESO / COMPOSICIÓN CORPORAL ===== */
function Registro({
  notes, setNotes, target, bodyComp, setBodyComp, isGuardia, geminiKey,
  metricslog, setMetricslog, selectedDateStr, saveWeight, activeMetrics,
  foodlog, waterlog, exlog
}){
  const [type, setType] = useState("peso");
  const [statsPeriod, setStatsPeriod] = useState(7); // 7 or 30 days

  const getDailyNutritionHistory = (days) => {
    const today = new Date(selectedDateStr);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entries = (foodlog || {})[dateStr] || [];
      let kcal = 0, p = 0, c = 0, f = 0;
      entries.forEach(e => {
        kcal += parseFloat(e.kcal) || 0;
        p += parseFloat(e.proteina) || 0;
        c += parseFloat(e.carbo) || 0;
        f += parseFloat(e.grasa) || 0;
      });
      data.push({ date: dateStr, kcal, p, c, f });
    }
    return data;
  };

  const dailyNutritionData = getDailyNutritionHistory(statsPeriod);
  const hasNutritionData = dailyNutritionData.some(d => d.kcal > 0);

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

  // Macro Statistics
  const getMacroStats = (days) => {
    const today = new Date(selectedDateStr);
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
    let activeDays = 0;
    
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entries = (foodlog || {})[dateStr];
      if (entries && entries.length > 0) {
        activeDays++;
        entries.forEach(e => {
          totalKcal += parseFloat(e.kcal) || 0;
          totalP += parseFloat(e.proteina) || 0;
          totalC += parseFloat(e.carbo) || 0;
          totalF += parseFloat(e.grasa) || 0;
        });
      }
    }
    if (activeDays === 0) return null;
    return {
      kcal: Math.round(totalKcal / activeDays),
      p: Math.round(totalP / activeDays),
      c: Math.round(totalC / activeDays),
      f: Math.round(totalF / activeDays),
      activeDays
    };
  };

  // Water Statistics
  const getWaterStats = (days) => {
    const today = new Date(selectedDateStr);
    let totalWater = 0;
    let loggedDays = 0;
    for (let i = 0; i < days; i++) {
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
  };

  // Training Sessions Statistics
  const getTrainingStats = (days) => {
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
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (workoutDays.has(dateStr)) {
        count++;
      }
    }
    return count;
  };

  // Weight Change Statistics
  const getWeightChangeStats = (days) => {
    const today = new Date(selectedDateStr);
    let newestW = null;
    let oldestW = null;
    
    const sortedWeights = Object.entries(metricslog || {})
      .filter(([dateStr]) => dateStr <= selectedDateStr)
      .map(([dateStr, m]) => ({ date: dateStr, w: m ? m.weight : undefined }))
      .filter(x => x.w !== undefined)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    if (sortedWeights.length === 0) return null;
    newestW = sortedWeights[0].w;
    
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() - days);
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
  };

  const macroStats = getMacroStats(statsPeriod);
  const waterStats = getWaterStats(statsPeriod);
  const trainingStats = getTrainingStats(statsPeriod);
  const weightChangeStats = getWeightChangeStats(statsPeriod); 
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
      const media = ["image/jpeg","image/png","image/webp"].includes(file.type) ? file.type : "image/jpeg";
      
      const prompt = "Analiza esta foto de una báscula o reporte de composición corporal (InBody) y extrae: peso total (kg), masa muscular (kg), porcentaje de grasa (%) y opcionalmente nivel de grasa visceral (escala 1-20, aproximado si no sale, pon 9 si no hay datos).";
      const sys = "Eres un analista de datos de salud. Extrae los números indicados en la foto y responde estrictamente con el formato JSON.";
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
      
      const o = JSON.parse(out);
      
      const nextComp = { musculo: o.musculo, grasaPct: o.grasaPct, visceral: o.visceral || activeMetrics.visceral || 9 };
      setBodyComp(nextComp);
      
      const currentMetric = metricslog[selectedDateStr] || {};
      const newMetricslog = {
        ...metricslog,
        [selectedDateStr]: {
          ...currentMetric,
          weight: o.peso,
          musculo: o.musculo,
          grasaPct: o.grasaPct,
          visceral: o.visceral || nextComp.visceral
        }
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
        text: `Composición (Foto): Músculo ${o.musculo} kg, Grasa ${o.grasaPct}%, Visceral Grado ${o.visceral || nextComp.visceral}`
      };
      
      setNotes([eComp, eWeight, ...notes]);
      
    } catch(err) {
      setErrComp("No pude extraer los datos de la foto. Asegura que los números sean legibles y estén bien iluminados.");
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
    const newMetricslog = {
      ...metricslog,
      [selectedDateStr]: {
        ...currentMetric,
        weight: wNum,
        musculo: currentMetric.musculo !== undefined ? currentMetric.musculo : (activeMetrics.musculo || 64.7),
        grasaPct: currentMetric.grasaPct !== undefined ? currentMetric.grasaPct : (activeMetrics.grasaPct || 26.2),
        visceral: currentMetric.visceral !== undefined ? currentMetric.visceral : (activeMetrics.visceral || 9)
      }
    };
    setMetricslog(newMetricslog);
    
    setBodyComp({
      musculo: currentMetric.musculo !== undefined ? currentMetric.musculo : (activeMetrics.musculo || 64.7),
      grasaPct: currentMetric.grasaPct !== undefined ? currentMetric.grasaPct : (activeMetrics.grasaPct || 26.2),
      visceral: currentMetric.visceral !== undefined ? currentMetric.visceral : (activeMetrics.visceral || 9)
    });
    
    const noteDate = new Date(selectedDateStr + "T" + new Date().toTimeString().slice(0, 8)).toISOString();
    const e = {
      id: uid(),
      type: "peso",
      date: noteDate,
      text: `${wNum} kg`,
      weight: wNum
    };
    setNotes([e, ...notes]);
    setWeight("");
  };

  const saveComposicion = () => {
    const parsedM = parseFloat(muscInput);
    const parsedF = parseFloat(fatInput);
    const parsedV = parseInt(viscInput) || activeMetrics.visceral || 9;
    
    if (isNaN(parsedM) || isNaN(parsedF)) return;
    
    const currentMetric = metricslog[selectedDateStr] || {};
    const newMetricslog = {
      ...metricslog,
      [selectedDateStr]: {
        ...currentMetric,
        weight: currentMetric.weight !== undefined ? currentMetric.weight : (activeMetrics.weight || START_W),
        musculo: parsedM,
        grasaPct: parsedF,
        visceral: parsedV
      }
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
    setNotes([e, ...notes]);
    setMuscInput("");
    setFatInput("");
    setViscInput("");
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

  const analyze = async() => { 
    setBusy(true); 
    setTrend(""); 
    const series = weights.map(w => `${fdate(w.date)}: ${w.weight}kg`).join(" -> ") || "Sin datos";
    
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
      const sys = `Eres el coach de Bruno. ${getProfileStr(isGuardia, activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Déficit de grasa progresivo, manteniendo masa muscular magra. Corto y al grano.`;
      const out = await callGemini([{role:"user", content:`Historial de peso de Bruno: ${series}. Composición actual: Músculo ${activeMetrics.musculo}kg, Grasa ${activeMetrics.grasaPct}%, Visceral Grado ${activeMetrics.visceral}. ${nutAvgText} Analiza la tendencia y da sugerencias calóricas.`}], sys);
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
          <div style={{width:`${normalPct}%`, height:"100%", background:"rgba(205,255,74,.10)"}}/>
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
                <span>{busyComp ? "Analizando Foto..." : "Escanear reporte/balanza con IA"}</span>
              </button>
              <input ref={fileCompRef} type="file" accept="image/*" capture="environment" onChange={onPhotoComp} style={{display:"none"}}/>
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
            placeholder={type === "entreno" ? "Subí press militar en polea..." : type === "sensacion" ? "Fatigado por la guardia pero bien alimentado..." : "Nota general..."} 
            style={{width:"100%", resize:"none", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none"}}
          />
        )}

        <button onClick={add} style={{width:"100%", marginTop:8, padding:"10px", borderRadius:10, border:"none", cursor:"pointer", background:C.lime, color:"#1a2400", fontWeight:800, fontSize:14}}>
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
                  background: statsPeriod === d ? "rgba(205,255,74,.14)" : C.panel2,
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
function Plan({presetKey, shoppingList, setShoppingList, geminiKey, meals, setMeals}){
  const target = PRESETS[presetKey];
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
      const prompt = `Plan de comidas actual: ${JSON.stringify(meals)}. Objetivo de hoy: ${target.label} (${target.kcal} kcal, ${target.p}g P, ${target.c}g C, ${target.f}g G). Perfil de Bruno: hombre, 34 años, 180 cm, 93.9 kg, residente de cirugía pediátrica con guardias de 24h. Solicitud de cambio del usuario: "${mealsPrompt.trim()}". Genera la distribución de comidas adaptada respetando su perfil y el esquema requerido.`;
      const out = await callGemini([{ role: "user", content: prompt }], MEALS_SYS, MEALS_SCHEMA);
      const parsed = JSON.parse(out);
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

  const generateShoppingList = async() => {
    setShopBusy(true);
    setShopErr("");

    const prompt = `Genera una lista de compras semanal recomendada para Bruno (residente de cirugía pediátrica con guardias de 24h). Bruno está en el preset: ${target.label} (${target.kcal} kcal, ${target.p}g P, ${target.c}g C, ${target.f}g G). Prioriza proteínas de preparación rápida, snacks de bolsillo, verduras y frutas fáciles de transportar al hospital. Devuelve un formato JSON estructurado.`;
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
      const parsed = JSON.parse(out);
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

  return (
    <div className="pop">
      <div className="disp" style={{fontSize:24, color:C.lime, marginBottom:10}}>TU PLAN: {target.label.toUpperCase()}</div>
      
      {/* Objetivos de macros */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"16px 18px", marginBottom:14}}>
        <div style={{fontSize:11, color:C.muted, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10}}>Objetivos de Nutrición</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12}}>
          <div style={{background:C.panel2, borderRadius:12, padding:12, border:`1px solid ${C.line}`}}>
            <div style={{fontSize:12, color:C.muted}}>Calorías Diarias</div>
            <div className="disp" style={{fontSize:28, color:C.lime, marginTop:4}}>{target.kcal} <span style={{fontSize:12, fontFamily:"'Manrope'", fontWeight:500, color:C.muted}}>kcal</span></div>
          </div>
          <div style={{background:C.panel2, borderRadius:12, padding:12, border:`1px solid ${C.line}`}}>
            <div style={{fontSize:12, color:C.cyan}}>Proteína (Objetivo)</div>
            <div className="disp" style={{fontSize:28, color:C.cyan, marginTop:4}}>{target.p} <span style={{fontSize:12, fontFamily:"'Manrope'", fontWeight:500, color:C.muted}}>g</span></div>
          </div>
          <div style={{background:C.panel2, borderRadius:12, padding:12, border:`1px solid ${C.line}`}}>
            <div style={{fontSize:12, color:C.lime}}>Carbohidratos</div>
            <div className="disp" style={{fontSize:28, color:C.lime, marginTop:4}}>{target.c} <span style={{fontSize:12, fontFamily:"'Manrope'", fontWeight:500, color:C.muted}}>g</span></div>
          </div>
          <div style={{background:C.panel2, borderRadius:12, padding:12, border:`1px solid ${C.line}`}}>
            <div style={{fontSize:12, color:C.amber}}>Grasas</div>
            <div className="disp" style={{fontSize:28, color:C.amber, marginTop:4}}>{target.f} <span style={{fontSize:12, fontFamily:"'Manrope'", fontWeight:500, color:C.muted}}>g</span></div>
          </div>
        </div>
      </div>

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
              color: shopBusy ? C.muted : "#1a2400", 
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
        <div style={{display:"flex", justifyTarget:"space-between", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <span style={{fontSize:11, color:C.muted, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase"}}>
            Distribución de Comidas Sugerida
          </span>
          <button 
            onClick={() => {
              setShowMealsAiPanel(!showMealsAiPanel);
              setMealsAiErr("");
              setPreviewMeals(null);
            }}
            style={{
              padding:"4px 10px",
              borderRadius:6,
              background: showMealsAiPanel ? "rgba(205,255,74,.12)" : C.panel2,
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
                style={{padding:"0 12px", background: aiMealsBusy ? C.panel : C.lime, color: aiMealsBusy ? C.muted : "#1a2400", fontWeight:800, borderRadius:8, fontSize:11.5, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}
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
              <button onClick={handleConfirmMeals} style={{flex:1, padding:"6px 12px", background:C.lime, color:"#1a2400", fontWeight:800, borderRadius:6, fontSize:11, cursor:"pointer"}}>
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
              <span style={{fontSize:14, fontWeight:700, color:C.lime}}>{meal.slot}</span>
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
    </div>
  );
}

/* ===== RENDERIZAR LA APLICACIÓN REACT ===== */
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
}

// Para testing (Jest / Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadKey };
}
