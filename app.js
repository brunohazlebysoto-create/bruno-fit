const APP_VERSION = "v2025.06.20-W";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { 
  Flame, Beef, Wheat, Droplet, Plus, Minus, Trash2, Send, Utensils, 
  MessageSquare, NotebookPen, Loader2, Scale, Camera, Clock, ChefHat, 
  Sparkles, LineChart, Dumbbell, ClipboardList, GlassWater, Target, 
  CalendarDays, ShoppingCart, Activity, Eye, EyeOff, CheckSquare, Square, ShieldAlert,
  RefreshCw, Link2, Copy, Check, Settings, Pill, X, TrendingUp, FileText
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
  { key:"E", name:"100% Suelo y Cero Espacio", fuel:"Carbo bajo-medio", ex:["Sentadillas con pulso","Flexiones de brazos","Remo Delfín","Curl con Auto-Resistencia"] },
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
  "Sentadillas con pulso":["Cuádriceps","Glúteos","Isquios"],
  "Flexiones de brazos":["Pectoral","Tríceps","Deltoide ant."],
  "Remo Delfín":["Espalda","Deltoides"],
  "Curl con Auto-Resistencia":["Bíceps"],
  "Apertura alta en poleas":["Pectoral"],
  "Aperturas polea alta":["Pectoral"],
  "Aperturas polea baja":["Pectoral","Deltoide ant."],
  "Cruce en polea alta":["Pectoral"],
  "Cruces polea alta":["Pectoral"],
  "Curl de bíceps supino sentado":["Bíceps"],
  "Curl de bíceps supino":["Bíceps"],
  "Curl concentrado":["Bíceps"],
  "Curl bíceps mancuerna":["Bíceps"],
  "Curl barra":["Bíceps","Antebrazo"],
  "Press inclinado barra":["Pectoral","Deltoide ant.","Tríceps"],
  "Press declinado":["Pectoral","Tríceps"],
  "Press banca mancuerna":["Pectoral","Tríceps","Deltoide ant."],
  "Jalón al pecho":["Espalda","Bíceps"],
  "Jalón polea":["Espalda","Bíceps"],
  "Remo sentado":["Espalda","Bíceps"],
  "Remo polea baja":["Espalda","Bíceps"],
  "Elevaciones laterales":["Deltoides"],
  "Vuelos laterales mancuerna":["Deltoides"],
  "Press hombro mancuerna":["Deltoides","Tríceps"],
  "Press militar":["Deltoides","Tríceps"],
  "Peso muerto rumano":["Isquios","Glúteos"],
  "Hip thrust":["Glúteos","Isquios"],
  "Sentadilla goblet":["Cuádriceps","Glúteos"],
  "Prensa de pierna":["Cuádriceps","Glúteos"],
};

// Biblioteca de ejercicios — búsqueda local sin API
const EXERCISE_DB = [
  // PECTORAL
  {name:"Press banca",tecnico:"Press de pectoral con barra plano",equipo:"peso libre",musculos:["Pectoral","Tríceps","Deltoide ant."]},
  {name:"Press inclinado mancuerna",tecnico:"Press inclinado con mancuernas",equipo:"peso libre",musculos:["Pectoral","Deltoide ant.","Tríceps"]},
  {name:"Press inclinado barra",tecnico:"Press inclinado con barra",equipo:"peso libre",musculos:["Pectoral","Deltoide ant.","Tríceps"]},
  {name:"Press declinado",tecnico:"Press de pectoral declinado",equipo:"peso libre",musculos:["Pectoral","Tríceps"]},
  {name:"Press banca mancuerna",tecnico:"Press de pectoral con mancuernas plano",equipo:"peso libre",musculos:["Pectoral","Tríceps","Deltoide ant."]},
  {name:"Aperturas",tecnico:"Apertura de pectoral con mancuernas",equipo:"peso libre",musculos:["Pectoral"]},
  {name:"Aperturas inclinadas",tecnico:"Apertura inclinada con mancuernas",equipo:"peso libre",musculos:["Pectoral","Deltoide ant."]},
  {name:"Press pectoral máquina",tecnico:"Press de pectoral en máquina convergente",equipo:"máquina",musculos:["Pectoral","Tríceps"]},
  {name:"Cruces en polea",tecnico:"Cruce de pectoral en polea",equipo:"polea",musculos:["Pectoral"]},
  {name:"Cruces polea baja",tecnico:"Cruce de pectoral en polea baja",equipo:"polea",musculos:["Pectoral","Deltoide ant."]},
  {name:"Pec deck",tecnico:"Apertura de pectoral en máquina pec deck",equipo:"máquina",musculos:["Pectoral"]},
  {name:"Aperturas polea alta",tecnico:"Cruce de pectoral en polea alta",equipo:"polea",musculos:["Pectoral"]},
  {name:"Flexiones de brazos",tecnico:"Flexión de pecho en suelo",equipo:"cuerpo libre",musculos:["Pectoral","Tríceps","Deltoide ant."]},
  // ESPALDA
  {name:"Dominadas / Jalón",tecnico:"Jalón frontal en polea alta o dominadas",equipo:"polea",musculos:["Espalda","Bíceps"]},
  {name:"Dominadas",tecnico:"Dominadas con agarre prono",equipo:"cuerpo libre",musculos:["Espalda","Bíceps"]},
  {name:"Jalón polea",tecnico:"Jalón frontal en polea alta",equipo:"polea",musculos:["Espalda","Bíceps"]},
  {name:"Jalón al pecho",tecnico:"Jalón al pecho en polea alta",equipo:"polea",musculos:["Espalda","Bíceps"]},
  {name:"Jalón tras nuca",tecnico:"Jalón tras nuca en polea alta",equipo:"polea",musculos:["Espalda","Bíceps"]},
  {name:"Remo barra",tecnico:"Remo con barra inclinado",equipo:"peso libre",musculos:["Espalda","Bíceps"]},
  {name:"Remo mancuerna",tecnico:"Remo con mancuerna a una mano",equipo:"peso libre",musculos:["Espalda","Bíceps"]},
  {name:"Remo máquina",tecnico:"Remo sentado en máquina",equipo:"máquina",musculos:["Espalda"]},
  {name:"Remo en polea baja",tecnico:"Remo sentado en polea baja",equipo:"polea",musculos:["Espalda","Bíceps"]},
  {name:"Pullover polea",tecnico:"Pullover en polea alta",equipo:"polea",musculos:["Espalda"]},
  {name:"Pullover mancuerna",tecnico:"Pullover con mancuerna",equipo:"peso libre",musculos:["Espalda","Pectoral"]},
  {name:"Face pull",tecnico:"Face pull en polea alta con cuerda",equipo:"polea",musculos:["Deltoides","Espalda"]},
  {name:"Remo Pendlay",tecnico:"Remo Pendlay con barra",equipo:"peso libre",musculos:["Espalda","Bíceps"]},
  {name:"Remo en T",tecnico:"Remo en máquina T-bar",equipo:"máquina",musculos:["Espalda","Bíceps"]},
  {name:"Hiperextensiones",tecnico:"Extensión lumbar en banco",equipo:"máquina",musculos:["Espalda","Glúteos","Isquios"]},
  {name:"Peso muerto",tecnico:"Peso muerto convencional",equipo:"peso libre",musculos:["Isquios","Glúteos","Espalda"]},
  {name:"Peso muerto rumano",tecnico:"Peso muerto rumano con barra",equipo:"peso libre",musculos:["Isquios","Glúteos","Espalda"]},
  {name:"Peso muerto sumo",tecnico:"Peso muerto sumo con barra",equipo:"peso libre",musculos:["Isquios","Glúteos","Cuádriceps"]},
  // HOMBROS / DELTOIDES
  {name:"Press Arnold",tecnico:"Press Arnold con mancuernas",equipo:"peso libre",musculos:["Deltoides","Tríceps"]},
  {name:"Press militar",tecnico:"Press militar con barra de pie",equipo:"peso libre",musculos:["Deltoides","Tríceps"]},
  {name:"Press hombro mancuerna",tecnico:"Press de hombro con mancuernas",equipo:"peso libre",musculos:["Deltoides","Tríceps"]},
  {name:"Press hombro máquina",tecnico:"Press de hombro en máquina",equipo:"máquina",musculos:["Deltoides","Tríceps"]},
  {name:"Vuelos laterales",tecnico:"Elevación lateral con mancuernas",equipo:"peso libre",musculos:["Deltoides"]},
  {name:"Vuelos laterales polea",tecnico:"Elevación lateral en polea baja",equipo:"polea",musculos:["Deltoides"]},
  {name:"Vuelos posteriores polea",tecnico:"Abducción posterior en polea",equipo:"polea",musculos:["Deltoides"]},
  {name:"Vuelos posteriores",tecnico:"Elevación posterior con mancuernas",equipo:"peso libre",musculos:["Deltoides","Espalda"]},
  {name:"Pájaro",tecnico:"Vuelo posterior en banco inclinado",equipo:"peso libre",musculos:["Deltoides","Espalda"]},
  {name:"Elevación frontal",tecnico:"Elevación frontal con mancuernas",equipo:"peso libre",musculos:["Deltoides"]},
  // BÍCEPS
  {name:"Curl inclinado",tecnico:"Curl de bíceps inclinado con mancuernas",equipo:"peso libre",musculos:["Bíceps"]},
  {name:"Curl martillo",tecnico:"Curl de bíceps en agarre martillo",equipo:"peso libre",musculos:["Bíceps","Antebrazo"]},
  {name:"Curl prono barra",tecnico:"Curl reverso con barra",equipo:"peso libre",musculos:["Bíceps","Antebrazo"]},
  {name:"Curl barra",tecnico:"Curl de bíceps con barra",equipo:"peso libre",musculos:["Bíceps"]},
  {name:"Curl mancuerna",tecnico:"Curl de bíceps con mancuernas alterno",equipo:"peso libre",musculos:["Bíceps"]},
  {name:"Curl predicador",tecnico:"Curl predicador en banco Scott",equipo:"peso libre",musculos:["Bíceps"]},
  {name:"Curl predicador máquina",tecnico:"Curl predicador en máquina",equipo:"máquina",musculos:["Bíceps"]},
  {name:"Curl polea baja",tecnico:"Curl de bíceps en polea baja",equipo:"polea",musculos:["Bíceps"]},
  {name:"Curl concentrado",tecnico:"Curl concentrado con mancuerna",equipo:"peso libre",musculos:["Bíceps"]},
  {name:"Curl con Auto-Resistencia",tecnico:"Curl de bíceps con autorresistencia",equipo:"cuerpo libre",musculos:["Bíceps"]},
  // TRÍCEPS
  {name:"Press cerrado",tecnico:"Press cerrado en barra para tríceps",equipo:"peso libre",musculos:["Tríceps","Pectoral"]},
  {name:"Extensión polea",tecnico:"Extensión de tríceps en polea alta",equipo:"polea",musculos:["Tríceps"]},
  {name:"Extensión sobre cabeza",tecnico:"Extensión de tríceps sobre la cabeza",equipo:"peso libre",musculos:["Tríceps"]},
  {name:"Extensión sobre cabeza polea",tecnico:"Extensión de tríceps sobre cabeza en polea",equipo:"polea",musculos:["Tríceps"]},
  {name:"Patada tríceps",tecnico:"Extensión de tríceps en kick back",equipo:"peso libre",musculos:["Tríceps"]},
  {name:"Fondos tríceps",tecnico:"Fondos en paralelas para tríceps",equipo:"cuerpo libre",musculos:["Tríceps","Pectoral","Deltoides"]},
  {name:"Jalón tríceps cuerda",tecnico:"Jalón de tríceps en polea con cuerda",equipo:"polea",musculos:["Tríceps"]},
  // PIERNAS — CUÁDRICEPS
  {name:"Sentadilla",tecnico:"Sentadilla libre con barra",equipo:"peso libre",musculos:["Cuádriceps","Glúteos","Isquios"]},
  {name:"Sentadilla búlgara",tecnico:"Sentadilla split búlgara",equipo:"peso libre",musculos:["Cuádriceps","Glúteos","Isquios"]},
  {name:"Sentadilla ciclista Smith",tecnico:"Sentadilla ciclista en máquina Smith",equipo:"máquina",musculos:["Cuádriceps"]},
  {name:"Prensa 45°",tecnico:"Prensa de pierna a 45 grados",equipo:"máquina",musculos:["Cuádriceps","Glúteos"]},
  {name:"Prensa pierna horizontal",tecnico:"Prensa de pierna horizontal",equipo:"máquina",musculos:["Cuádriceps","Glúteos"]},
  {name:"Extensión cuádriceps",tecnico:"Extensión de rodilla en máquina",equipo:"máquina",musculos:["Cuádriceps"]},
  {name:"Hack squat",tecnico:"Hack sentadilla en máquina",equipo:"máquina",musculos:["Cuádriceps","Glúteos"]},
  {name:"Estocada",tecnico:"Estocada frontal con mancuernas",equipo:"peso libre",musculos:["Cuádriceps","Glúteos","Isquios"]},
  {name:"Estocada atrás Smith",tecnico:"Estocada posterior en máquina Smith",equipo:"máquina",musculos:["Glúteos","Cuádriceps","Isquios"]},
  {name:"Sentadillas con pulso",tecnico:"Sentadilla con pulso sin equipo",equipo:"cuerpo libre",musculos:["Cuádriceps","Glúteos","Isquios"]},
  // PIERNAS — ISQUIOS / GLÚTEOS
  {name:"Leg curl sentado",tecnico:"Flexión de rodilla en máquina sentada",equipo:"máquina",musculos:["Isquios"]},
  {name:"Leg curl tumbado",tecnico:"Flexión de rodilla en máquina tumbada",equipo:"máquina",musculos:["Isquios"]},
  {name:"Puente glúteos",tecnico:"Puente de glúteos con barra",equipo:"peso libre",musculos:["Glúteos"]},
  {name:"Hip thrust",tecnico:"Hip thrust con barra en banco",equipo:"peso libre",musculos:["Glúteos","Isquios"]},
  {name:"Hip thrust máquina",tecnico:"Hip thrust en máquina",equipo:"máquina",musculos:["Glúteos","Isquios"]},
  {name:"Patada glúteo polea",tecnico:"Extensión de cadera en polea baja",equipo:"polea",musculos:["Glúteos"]},
  {name:"Abducción cadera máquina",tecnico:"Abducción de cadera en máquina",equipo:"máquina",musculos:["Glúteos"]},
  {name:"Sentadilla sumo",tecnico:"Sentadilla sumo con mancuerna",equipo:"peso libre",musculos:["Glúteos","Cuádriceps","Isquios"]},
  // GEMELOS / PANTORRILLAS
  {name:"Elevación de talones",tecnico:"Elevación de talones de pie",equipo:"máquina",musculos:["Gemelos"]},
  {name:"Elevación de talones sentado",tecnico:"Elevación de talones sentado",equipo:"máquina",musculos:["Gemelos"]},
  // CORE / ABDOMEN
  {name:"Plancha",tecnico:"Plancha isométrica abdominal",equipo:"cuerpo libre",musculos:["Core"]},
  {name:"Crunch",tecnico:"Crunch abdominal en suelo",equipo:"cuerpo libre",musculos:["Core"]},
  {name:"Crunch polea",tecnico:"Crunch abdominal en polea alta",equipo:"polea",musculos:["Core"]},
  {name:"Elevación de piernas",tecnico:"Elevación de piernas colgado",equipo:"cuerpo libre",musculos:["Core"]},
  {name:"Remo Delfín",tecnico:"Remo invertido con apoyo en el suelo",equipo:"cuerpo libre",musculos:["Espalda","Deltoides"]},
  {name:"Hiperextensiones inversas",tecnico:"Extensión de cadera en banco",equipo:"máquina",musculos:["Glúteos","Isquios"]},
];

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

/* ===== CACHÉ DE RESPUESTAS IA (localStorage, ahorra cuota) ===== */
const AI_CACHE_KEY = "ai_response_cache_v1";
const AI_CACHE_MAX = 150;
const AI_CACHE_TTL = 30 * 86400000; // 30 días
function _aiHash(s){ let h=0; const str=(s||""); for(let i=0;i<str.length;i++){ h=(h*31 + str.charCodeAt(i))|0; } return h.toString(36); }
function getAICache(kind, input){
  try{
    const raw = localStorage.getItem(AI_CACHE_KEY);
    if(!raw) return null;
    const store = JSON.parse(raw);
    const key = kind + ":" + _aiHash((input||"").toLowerCase().trim());
    const hit = store[key];
    if(!hit) return null;
    if(Date.now() - hit.t > AI_CACHE_TTL) return null;
    return hit.v;
  }catch(_){ return null; }
}
function setAICache(kind, input, value){
  try{
    const raw = localStorage.getItem(AI_CACHE_KEY);
    let store = raw ? JSON.parse(raw) : {};
    const key = kind + ":" + _aiHash((input||"").toLowerCase().trim());
    store[key] = { v: value, t: Date.now() };
    let keys = Object.keys(store);
    if(keys.length > AI_CACHE_MAX){
      keys.sort((a,b)=>store[a].t - store[b].t);
      for(let i=0;i<keys.length - AI_CACHE_MAX;i++) delete store[keys[i]];
      keys = Object.keys(store);
    }
    const blob = JSON.stringify(store);
    if(blob.length > 480000){
      keys.sort((a,b)=>store[a].t - store[b].t);
      keys.slice(0, Math.floor(keys.length / 2)).forEach(k => delete store[k]);
    }
    localStorage.setItem(AI_CACHE_KEY, JSON.stringify(store));
  }catch(_){}
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
  if (!e) return "⚠️ Sin clave API. Ve a Perfil → Ajustes y agrega tu clave de Google AI Studio (gemini.google.com) — es gratuita.";
  const msg = e.message || "";
  if (msg.includes("No se pudo conectar") || msg.includes("No API Key")) {
    return "⚠️ Sin clave API configurada. Ve a Perfil → Ajustes → Clave Gemini y agrega tu clave gratuita de gemini.google.com";
  }
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota") || msg.includes("limit")) {
    return "⏱️ Límite de API superado. Espera unos segundos o agrega más claves en Perfil → Ajustes (se rotan automáticamente).";
  }
  if (msg.includes("401") || msg.includes("403") || msg.includes("API_KEY") || msg.includes("invalid")) {
    return "❌ Clave API inválida. Ve a Perfil → Ajustes y verifica tu clave Gemini.";
  }
  return "⚠️ Error IA: " + msg;
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

let _rrIdx = 0; // round-robin global para Gemini keys

// ── Helpers consolidados de fecha e imágenes (antes duplicados en varios scopes) ──
function getLocalDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Compat fotos: soporta photos[] (nuevo) y photo string (legacy)
function getEntryPhotos(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.photos) && entry.photos.length > 0) return entry.photos;
  if (entry.photo) return [entry.photo];
  return [];
}

const stripDataUrl = (url) => url.split(",")[1] || url;
const mimeFromDataUrl = (url) => url.startsWith("data:image/png") ? "image/png" : "image/jpeg";
const pickImageMedia = (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) ? file.type : "image/jpeg";

// FileReader → base64 puro (sin el prefijo data:)
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// Comprime imagen vía canvas → dataURL JPEG. Rechaza la promesa si falla la lectura/carga.
function compressImageToDataUrl(file, maxW = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callGemini(messages, systemInstruction, responseSchema = null, options = {}) {
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

  if (apiKeys.length === 0) {
    throw new Error("No API Key configurada. Ve a Perfil → Ajustes y agrega tu clave Gemini gratuita de gemini.google.com");
  }

  // Priorizar las llaves de Gemini nativas primero y usar las de OpenRouter como respaldo/fallback
  const geminiKeys = apiKeys.filter(k => !k.startsWith("sk-or-"));
  const openRouterKeys = apiKeys.filter(k => k.startsWith("sk-or-"));

  const orderedKeys = [];
  if (geminiKeys.length > 0) {
    // Round-robin estricto: cada llamada empieza en la siguiente clave
    const startGemini = _rrIdx % geminiKeys.length;
    _rrIdx = (_rrIdx + 1) % geminiKeys.length;
    for (let count = 0; count < geminiKeys.length; count++) {
      orderedKeys.push(geminiKeys[(startGemini + count) % geminiKeys.length]);
    }
  }
  if (openRouterKeys.length > 0) {
    for (let count = 0; count < openRouterKeys.length; count++) {
      orderedKeys.push(openRouterKeys[count % openRouterKeys.length]);
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

        const nativeModel = (await loadKey("gemini_native_model", "gemini-2.5-flash")) || "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${nativeModel}:generateContent?key=${apiKey}`;
        
        const generationConfig = {
          temperature: 0.2
        };
        
        if (responseSchema) {
          generationConfig.responseMimeType = "application/json";
          generationConfig.responseSchema = responseSchema;
          // Disable thinking for structured output — thinking tokens can exhaust
          // the budget before the JSON is complete, causing empty/malformed responses
          generationConfig.thinkingConfig = { thinkingBudget: 0 };
        }

        const body = {
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig
        };
        if (options.safetySettings) {
          body.safetySettings = options.safetySettings;
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errMsg = errorData.error?.message || `HTTP ${res.status}`;
          console.error(`[Gemini key ${idx+1}/${orderedKeys.length}] ${res.status}: ${errMsg}`);
          throw new Error(errMsg);
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        const finishReason = candidate?.finishReason;
        if (finishReason === "SAFETY" || (!candidate && data.promptFeedback?.blockReason)) {
          const reason = data.promptFeedback?.blockReason || "SAFETY";
          throw new Error(`Bloqueado por filtros de seguridad (${reason}). Si estás analizando fotos corporales, intenta con imágenes de diferente ángulo.`);
        }
        const parts = candidate?.content?.parts || [];
        // gemini-2.5-flash thinking models prepend a {thought:true} part before the actual response
        const textPart = parts.find(p => !p.thought && p.text != null) || parts[parts.length - 1];
        const textOut = textPart?.text || "";
        return textOut.trim();
      }
    } catch (e) {
      lastError = e;
      const is429 = e.message && (e.message.includes("429") || e.message.includes("RESOURCE_EXHAUSTED") || e.message.includes("quota") || e.message.includes("limit"));
      console.warn(`Error con la API Key ${idx + 1}/${orderedKeys.length}: ${e.message}. Intentando con la siguiente...`);
      if (is429 && idx < orderedKeys.length - 1) {
        // backoff exponencial: 2s, 4s, 8s… entre claves
        await new Promise(r => setTimeout(r, Math.min(2000 * Math.pow(2, idx), 16000)));
      }
    }
  }

  const isQuota = lastError?.message && (lastError.message.includes("429") || lastError.message.includes("RESOURCE_EXHAUSTED") || lastError.message.includes("quota") || lastError.message.includes("limit"));
  if (isQuota) {
    throw new Error("⏱️ Límite de peticiones alcanzado en todas las claves. Si todas tus claves son de la misma cuenta de Google, comparten la misma cuota — crea claves desde cuentas distintas para multiplicarla. O espera 1 minuto e intenta de nuevo.");
  }
  throw lastError || new Error("No se pudo conectar con ninguna API Key.");
}

const SEED_TECNICO = {
  "Press banca":"Press de pectoral con barra plano",
  "Press inclinado mancuerna":"Press de pectoral inclinado con mancuernas",
  "Aperturas":"Apertura de pectoral con mancuernas",
  "Curl inclinado":"Curl de bíceps inclinado con mancuernas",
  "Curl martillo":"Curl de bíceps en agarre martillo",
  "Curl prono barra":"Curl reverso con barra recta",
  "Sentadilla":"Sentadilla con barra libre",
  "Prensa 45°":"Prensa de pierna a 45 grados",
  "Sentadilla búlgara":"Sentadilla split búlgara con mancuernas",
  "Sentadilla ciclista Smith":"Sentadilla ciclista en máquina Smith",
  "Extensión cuádriceps":"Extensión de rodilla en máquina",
  "Press Arnold":"Press Arnold con mancuernas",
  "Vuelos laterales":"Abducción lateral de hombro con mancuernas",
  "Vuelos posteriores polea":"Abducción posterior de hombro en polea",
  "Dominadas / Jalón":"Jalón frontal en polea alta o dominadas",
  "Remo barra":"Remo con barra inclinado hacia adelante",
  "Remo máquina":"Remo sentado en máquina",
  "Pullover polea":"Pullover de espalda en polea alta",
  "Face pull":"Face pull en polea alta con cuerda",
  "Press cerrado":"Press de tríceps con agarre cerrado en barra",
  "Extensión polea":"Extensión de tríceps en polea alta",
  "Extensión sobre cabeza":"Extensión de tríceps sobre la cabeza",
  "Peso muerto":"Peso muerto convencional con barra",
  "Leg curl sentado":"Flexión de rodilla en máquina sentada",
  "Puente glúteos":"Puente de glúteos con barra",
  "Estocada atrás Smith":"Estocada posterior en máquina Smith",
  "Sentadillas con pulso":"Sentadilla con pulso al frente sin equipo",
  "Flexiones de brazos":"Flexión de pecho en suelo",
  "Remo Delfín":"Remo invertido con apoyo en el suelo",
  "Curl con Auto-Resistencia":"Curl de bíceps con autorresistencia manual",
};

const SEED_EQUIPO = {
  "Press banca":"peso libre",
  "Press inclinado mancuerna":"peso libre",
  "Aperturas":"peso libre",
  "Curl inclinado":"peso libre",
  "Curl martillo":"peso libre",
  "Curl prono barra":"peso libre",
  "Sentadilla":"peso libre",
  "Prensa 45°":"máquina",
  "Sentadilla búlgara":"peso libre",
  "Sentadilla ciclista Smith":"máquina",
  "Extensión cuádriceps":"máquina",
  "Press Arnold":"peso libre",
  "Vuelos laterales":"peso libre",
  "Vuelos posteriores polea":"polea",
  "Dominadas / Jalón":"peso libre",
  "Remo barra":"peso libre",
  "Remo máquina":"máquina",
  "Pullover polea":"polea",
  "Face pull":"polea",
  "Press cerrado":"peso libre",
  "Extensión polea":"polea",
  "Extensión sobre cabeza":"peso libre",
  "Peso muerto":"peso libre",
  "Leg curl sentado":"máquina",
  "Puente glúteos":"peso libre",
  "Estocada atrás Smith":"máquina",
  "Sentadillas con pulso":"cuerpo libre",
  "Flexiones de brazos":"cuerpo libre",
  "Remo Delfín":"cuerpo libre",
  "Curl con Auto-Resistencia":"cuerpo libre",
};

const EQUIPO_ORDER = ["peso libre","máquina","polea","cuerpo libre"];
const EQUIPO_LABEL = { "peso libre":"🏋️ Peso libre", "máquina":"⚙️ Máquina", "polea":"🔗 Polea", "cuerpo libre":"🤸 Cuerpo libre" };

function seedExercises(){
  const o={};
  DEFAULT_SPLITS.forEach(d=>{
    o[d.key]=d.ex.map(n=>({name:n, tecnico:SEED_TECNICO[n]||"", equipo:SEED_EQUIPO[n]||"peso libre", musculos:MUSCLES[n]||[]}));
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

/* ===== FITDAYS SCHEMA ===== */
const FITDAYS_SCHEMA = {
  type:"OBJECT", properties:{
    peso:{ type:"NUMBER" },
    imc:{ type:"NUMBER" },
    grasaPct:{ type:"NUMBER" },
    masaGrasa:{ type:"NUMBER" },
    grasaSubc:{ type:"NUMBER" },
    masaMuscular:{ type:"NUMBER" },
    smmKg:{ type:"NUMBER" },        // Músculo esquelético en kg (SMM)
    musculoEsq:{ type:"NUMBER" },   // Músculo esquelético en % (si aparece)
    masaOsea:{ type:"NUMBER" },     // Masa Esquelética (huesos) en kg — NO músculo
    masaEsqueletica:{ type:"NUMBER" }, // alias legacy de masaOsea
    pesoSinGrasa:{ type:"NUMBER" }, // Peso sin grasa / LBM en kg
    smi:{ type:"NUMBER" },          // SMI en kg/m²
    aguaKg:{ type:"NUMBER" },
    pctAgua:{ type:"NUMBER" },
    proteinaKg:{ type:"NUMBER" },
    pctProteina:{ type:"NUMBER" },
    visceral:{ type:"NUMBER" },
    bmr:{ type:"NUMBER" },
    edadCorporal:{ type:"NUMBER" },
    zinE:{ type:"NUMBER" },         // zINE
    whr:{ type:"NUMBER" },
    puntuacion:{ type:"NUMBER" },
    pesoObjetivo:{ type:"NUMBER" }, // Peso objetivo recomendado en kg
    tipoCuerpo:{ type:"STRING" },   // Tipo de cuerpo: "Obesidad", "Normal", etc.
    grasaTronco:{ type:"NUMBER" },
    grasaBrazoDer:{ type:"NUMBER" },
    grasaBrazoIzq:{ type:"NUMBER" },
    grasaPiernaDer:{ type:"NUMBER" },
    grasaPiernaIzq:{ type:"NUMBER" },
    musculoTronco:{ type:"NUMBER" },
    musculoBrazoDer:{ type:"NUMBER" },
    musculoBrazoIzq:{ type:"NUMBER" },
    musculoPiernaDer:{ type:"NUMBER" },
    musculoPiernaIzq:{ type:"NUMBER" },
  }, required:["peso","grasaPct"]
};
// Campos de FITDAYS_SCHEMA que son strings (no numéricos)
const FITDAYS_STRING_FIELDS = new Set(["tipoCuerpo"]);

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

const TIPS_SCHEMA = { type:"OBJECT", properties:{ cards:{ type:"ARRAY", items:{ type:"OBJECT", properties:{ icon:{type:"STRING"}, tipType:{type:"STRING"}, title:{type:"STRING"}, body:{type:"STRING"}, detail:{type:"STRING"}, extra:{type:"ARRAY", items:{type:"STRING"}} }, required:["icon","tipType","title","body","detail","extra"] } } }, required:["cards"] };

const FALLBACK_TIPS = [
  { icon:"💧", tipType:"reminder", title:"Hidratación", body:"Apunta a 35ml por kg de peso al día. Un 2% de deshidratación reduce el rendimiento hasta un 20%.", extra:["Si tu orina es amarillo oscuro antes de entrenar, ya estás en déficit hídrico.", "→ Toma 500ml al despertar, 300ml antes de entrenar y 200ml cada 20 min durante el entreno.", "→ En días de mucho sudor añade una pizca de sal al agua — funciona igual que el isotónico."] },
  { icon:"🛌", tipType:"reminder", title:"Sueño = crecimiento", body:"El músculo crece durante el descanso, no en el gym. 7-9 horas maximizan la síntesis proteica.", extra:["Menos de 6h reduce la testosterona, eleva el cortisol y frena la recuperación muscular.", "→ Corta pantallas 30 min antes de dormir — la luz azul retrasa la melatonina hasta 90 min.", "→ Habitación a 18-20°C mejora el sueño profundo, la fase donde se libera hormona de crecimiento."] },
  { icon:"🥩", tipType:"tip", title:"Proteína post-entreno", body:"Consume 30-40g de proteína en las 2 horas post-entreno para maximizar la síntesis proteica.", extra:["La ventana anabólica es más amplia de lo que se creía (2-4h), pero más cerca = mejor.", "→ Combina proteína rápida (suero, huevos) con carbohidrato simple (fruta, arroz blanco).", "→ Si entrenas en ayunas, toma al menos 5g de EAA durante el entreno para minimizar el catabolismo."] },
  { icon:"📈", tipType:"tip", title:"Sobrecarga progresiva", body:"Sin progresión no hay adaptación. Aumenta 1.25–2.5kg cuando completes todas las series en el rango alto.", extra:["El cuerpo solo crece si el estímulo aumenta — la progresión de carga es la herramienta clave.", "→ Sin discos de 1.25kg, usa progresión de reps: busca 1 rep más por serie antes de subir peso.", "→ Lleva un registro escrito — sin datos no sabes si estás progresando de verdad."] },
  { icon:"🔄", tipType:"tip", title:"Varía el agarre en jalón", body:"Agarre supino activa más bíceps, neutro reduce tensión en muñecas, prono enfoca la espalda alta.", extra:["Rotar el agarre cada 3-4 semanas previene el sobreuso articular y añade variedad al estímulo.", "→ Agarre neutro (palmas enfrentadas) permite más carga y es el más cómodo para la mayoría.", "→ Combina jalón supino con remo para maximizar bíceps sin necesitar sesión separada."] },
  { icon:"⚡", tipType:"motivation", title:"Consistencia > Intensidad", body:"3 sesiones semanales durante 6 meses superan a 6 sesiones durante 2 semanas. La constancia gana.", extra:["Los resultados se acumulan de forma no lineal — los primeros meses parecen lentos, luego se disparan.", "→ Si tienes un mal día, entrena igual pero reduce el volumen a la mitad — mantener el hábito importa más.", "→ La sesión 'mediocre' cuenta exactamente igual que la perfecta en el cómputo anual."] },
  { icon:"🧘", tipType:"reminder", title:"Movilidad dinámica pre-entreno", body:"5 min de movilidad dinámica mejoran el rango de movimiento y reducen lesiones. Evita estiramientos estáticos.", extra:["El estiramiento estático antes de levantar puede reducir la fuerza hasta un 8% — guárdalo para después.", "→ Rutina express: 10 hip circles + 10 rotaciones de hombro + 10 sentadillas profundas sin peso.", "→ Prioriza movilidad de cadera y hombros — son las articulaciones con mayor impacto en el rendimiento."] },
  { icon:"📊", tipType:"tip", title:"Entrena con RIR", body:"Dejar 1-3 repeticiones en reserva (RIR 1-3) maximiza la hipertrofia con menor fatiga acumulada.", extra:["Ir siempre al fallo puede duplicar el tiempo de recuperación sin añadir más hipertrofia.", "→ Usa RIR 2-3 en las series de acumulación, RIR 0-1 solo en la última serie de cada ejercicio.", "→ Para calcular tu RIR: al terminar la serie pregúntate cuántas reps más podrías hacer con buena técnica."] },
  { icon:"🎯", tipType:"tip", title:"Conexión mente-músculo", body:"Pensar activamente en el músculo que trabajas puede aumentar su activación hasta un 30%.", extra:["La activación intencional importa especialmente en músculos difíciles de sentir como glúteos y espalda alta.", "→ Reduce el peso un 20% y añade 2 seg de pausa en la posición de máximo estiramiento.", "→ Para pecho: imagina juntar los codos en la contracción, no solo empujar el peso."] },
  { icon:"🍌", tipType:"reminder", title:"Carbos pre-entreno", body:"Carbohidratos 30-60 min antes del entreno mejoran el rendimiento en sesiones de más de 45 min.", extra:["Sin carbos disponibles, el cuerpo puede catabolizar músculo para obtener energía en sesiones largas.", "→ Opciones rápidas: plátano, 30g avena con leche, o 2 tostadas con mermelada.", "→ Si entrenas en ayunas, considera al menos 5g de BCAA o EAA para minimizar el catabolismo."] },
  { icon:"💪", tipType:"motivation", title:"Especificidad del entrenamiento", body:"El cuerpo se adapta exactamente a lo que practicas. Si quieres fuerza, entrena fuerza.", extra:["Hacer cardio excesivo mientras buscas hipertrofia compite directamente con las adaptaciones musculares.", "→ Define tu objetivo principal y diseña el 80% del entreno en torno a él.", "→ Especificidad no significa monotonía — varía ejercicios accesorios, no los patrones de movimiento principales."] },
  { icon:"🔥", tipType:"tip", title:"Calentamiento específico", body:"El calentamiento ideal replica los movimientos del entreno con menor peso — no solo correr o bicicleta.", extra:["2 series de activación con 40-60% del peso de trabajo preparan mejor las articulaciones que 10 min de cardio.", "→ Para press de pecho: 15 reps con barra vacía + 8 reps con el 60% antes del peso de trabajo.", "→ Para sentadilla: sentadilla goblet con 10kg + hip hinge con bandas activan toda la cadena posterior."] },
];

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
    const sorted = [...sets].filter(s=>s?.date&&s?.w).sort((a,b)=>a.date < b.date ? -1 : (a.date > b.date ? 1 : 0));
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
    const sorted = [...sets].filter(s=>s?.date&&s?.w).sort((a,b)=>b.date < a.date ? -1 : (b.date > a.date ? 1 : 0));
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
  let push = 0, pull = 0, quad = 0, hams = 0;
  const cutoff = Date.now() - 7 * 86400000;
  Object.entries(exlog||{}).forEach(([exName, sets])=>{
    if (!sets || sets.length === 0) return;
    const muscles = MUSCLES[exName] || [];
    const isPush = muscles.some(m => /pectoral|tríceps|tricep|deltoid/i.test(m));
    const isPull = muscles.some(m => /espalda|bíceps|bicep|trapecio|rombo|dorsal/i.test(m));
    const isQuad = muscles.some(m => /cuádriceps|cuadricep/i.test(m));
    const isHam = muscles.some(m => /isquio/i.test(m));
    const n = (sets||[]).filter(s=>s?.date&&s.type!=="warmup"&&new Date(s.date).getTime()>cutoff).length;
    if (isPush) push += n;
    if (isPull) pull += n;
    if (isQuad) quad += n;
    if (isHam) hams += n;
  });
  const imbalances = [];
  if (push>0&&pull>0&&push/pull>1.5) imbalances.push(`Empuje (${push} series) vs Jalón (${pull} series) — ratio ${Math.round(push/pull*10)/10}:1`);
  if (quad>0&&hams>0&&quad/hams>1.5) imbalances.push(`Cuádriceps (${quad} series) vs Isquios (${hams} series) — ratio ${Math.round(quad/hams*10)/10}:1`);
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

// Normaliza cualquier nombre de músculo (incluso anatómico detallado generado por IA,
// ej. "Pectoral mayor (fibras claviculares)", "Tríceps braquial (cabeza larga)",
// "Deltoides Posterior", "Braquiorradial") a una de las 11 categorías canónicas.
// Ignora mayúsculas, acentos y paréntesis. Devuelve null si no se reconoce.
function normalizeMuscle(raw) {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // quitar acentos
    .replace(/\([^)]*\)/g, " ")                        // quitar (cabeza larga) etc.
    .replace(/\s+/g, " ").trim();
  // El orden importa: casos específicos antes que genéricos
  if (/recto femoral|vasto|cuadricep/.test(s)) return "Cuádriceps";
  if (/isquio|biceps femoral|semitendinoso|semimembranoso|femoral posterior/.test(s)) return "Isquios";
  if (/\bfemoral\b/.test(s)) return "Isquios"; // femoral genérico (recto femoral ya resuelto arriba)
  if (/gluteo/.test(s)) return "Glúteos";
  if (/gemelo|soleo|pantorrilla|triceps sural/.test(s)) return "Pantorrillas";
  if (/braquiorradial|antebrazo|flexor|extensor|muneca|supinador|pronador/.test(s)) return "Antebrazo";
  if (/triceps/.test(s)) return "Tríceps";
  if (/biceps|braquial/.test(s)) return "Bíceps"; // braquial anterior cuenta como bíceps
  if (/deltoid|manguito|rotador|supraespinoso|infraespinoso|redondo menor/.test(s)) return "Deltoides";
  if (/pectoral|pecho|serrato/.test(s)) return "Pectoral";
  if (/dorsal|trapecio|romboides|redondo mayor|erector|lumbar|espalda|elevador de la esc/.test(s)) return "Espalda";
  if (/core|abdominal|oblicuo|transverso|recto del abdomen/.test(s)) return "Core";
  return null; // no reconocido — no se cuenta en el balance agregado
}

function calcMuscleVolumeBalance(exlog, exercises, days = 28) {
  const primaryMuscles = ["Pectoral","Espalda","Cuádriceps","Isquios","Deltoides","Bíceps","Tríceps","Glúteos","Antebrazo","Core","Pantorrillas"];
  const counts = {};
  primaryMuscles.forEach(m=>{ counts[m] = 0; });
  const cutoff = days >= 999 ? 0 : Date.now() - days * 86400000;
  let minDate = Infinity;
  Object.entries(exlog||{}).forEach(([exName, sets])=>{
    const _exMusculos = exercises && Object.values(exercises).flat().find(e=>e.name===exName)?.musculos;
    const muscleList = (_exMusculos?.length ? _exMusculos : MUSCLES[exName]) || [];
    const filteredSets = (sets||[]).filter(s=>s?.date && (days >= 999 || new Date(s.date).getTime()>cutoff) && s?.type!=="warmup");
    filteredSets.forEach(s => {
      const t = new Date(s.date).getTime();
      if (t < minDate) minDate = t;
    });
    if (!filteredSets.length) return;
    // Ponderar por posición de activación: primario=1.0, secundario=0.6, terciario=0.35...
    // Un press cuenta como serie completa de Pectoral pero solo fracción para Tríceps/Deltoides.
    // Tras normalizar, si dos posiciones colapsan al mismo músculo se queda el peso mayor (el más primario).
    const weightByMuscle = {};
    muscleList.forEach((rawM, idx) => {
      const m = normalizeMuscle(rawM);
      if (!m) return;
      const w = MUSCLE_ACTIVATION_WEIGHTS[idx] ?? 0.1;
      if (weightByMuscle[m] === undefined || w > weightByMuscle[m]) weightByMuscle[m] = w;
    });
    Object.entries(weightByMuscle).forEach(([m, w])=>{
      if (m in counts) counts[m] += filteredSets.length * w;
    });
  });
  // Weeks divisor: for "Todo" use full history span, else use days/7
  let weeks;
  if (days >= 999) {
    weeks = minDate < Infinity ? Math.max(1, (Date.now() - minDate) / (7 * 86400000)) : 1;
  } else {
    weeks = days / 7;
  }
  const result = {};
  primaryMuscles.forEach(m=>{
    const setsPerWeek = Math.round((counts[m]/weeks)*10)/10;
    let status, recommendation;
    if (setsPerWeek === 0) { status="neglected"; recommendation="Sin trabajo en este período — añade ≥2 series/sem"; }
    else if (setsPerWeek < 8) { status="low"; recommendation=`Solo ${setsPerWeek} ser/sem — objetivo mínimo 8`; }
    else if (setsPerWeek <= 20) { status="optimal"; recommendation="Volumen en rango óptimo"; }
    else { status="high"; recommendation="Posible sobrevolumen — considera reducir"; }
    result[m] = { setsPerWeek, status, recommendation };
  });
  return result;
}

// Activation weights by position (primary muscle = 1.0, decreasing)
const MUSCLE_ACTIVATION_WEIGHTS = [1.0, 0.6, 0.35, 0.2, 0.1];

function calcSessionMuscleSets(exlog, exercises, dateStr) {
  const allExObjects = Object.values(exercises || {}).flat();
  const muscleMap = {}; // muscle → { sets, weightedSets, exNames }

  Object.entries(exlog || {}).forEach(([exName, allSets]) => {
    const daySets = (allSets || []).filter(s =>
      s?.date && s.type !== "warmup" &&
      (() => { try { const d = new Date(s.date); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; } catch(e){ return ""; } })() === dateStr
    );
    if (!daySets.length) return;

    const exObj = allExObjects.find(e => e.name === exName);
    const musculos = exObj?.musculos || [];
    if (!musculos.length) return;

    const effectiveSets = daySets.length;
    musculos.forEach((m, idx) => {
      const w = MUSCLE_ACTIVATION_WEIGHTS[idx] ?? 0.1;
      if (!muscleMap[m]) muscleMap[m] = { sets: 0, weightedSets: 0, exNames: [] };
      muscleMap[m].sets += effectiveSets;
      muscleMap[m].weightedSets += Math.round(effectiveSets * w * 10) / 10;
      if (!muscleMap[m].exNames.includes(exName)) muscleMap[m].exNames.push(exName);
    });
  });

  // Return sorted by weighted sets descending
  return Object.entries(muscleMap)
    .sort(([, a], [, b]) => b.weightedSets - a.weightedSets)
    .map(([muscle, data]) => ({ muscle, ...data }));
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
  const [exerciseTechNotes, setExerciseTechNotes] = useState({});

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
  const [pdfBusy, setPdfBusy] = useState(false);
  const [coachPersonality, setCoachPersonality] = useState("técnico");
  const [dietGuidelines, setDietGuidelines] = useState("");
  const [trainingGuidelines, setTrainingGuidelines] = useState("");
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [backupToast, setBackupToast] = useState(false);
  const nightlyBackupRef = useRef(null); // holds latest state for midnight callback

  // Elevated Calendar States & Helpers
  const [calMonth, setCalMonth] = useState(() => new Date());
  
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
      .sort((a, b) => b[0] < a[0] ? -1 : (b[0] > a[0] ? 1 : 0));
    
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
      .sort((a, b) => b.date < a.date ? -1 : (b.date > a.date ? 1 : 0));
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
  const [sbAutoSyncStatus, setSbAutoSyncStatus] = useState(""); // "" | "saving" | "saved" | "error"
  const sbFullSyncTimer = useRef(null);
  const sbPullIntervalRef = useRef(null);

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
              await saveKey("last_logged_in_user_id", session.user.id);
              setSupabaseUser(session.user);
              setSbError("");
              setTimeout(() => loadFullStateFromSupabase(session.user.id), 1500);
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
      let localExerciseTechNotes = await loadKey("exercise_tech_notes", {});
      if (!localExerciseTechNotes || typeof localExerciseTechNotes !== 'object') localExerciseTechNotes = {};

      let localDietGuidelines = await loadKey("diet_guidelines", "");
      let localTrainingGuidelines = await loadKey("training_guidelines", "");

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
      setExerciseTechNotes(localExerciseTechNotes || {});
      setDietGuidelines(localDietGuidelines || "");
      setTrainingGuidelines(localTrainingGuidelines || "");

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
            if (cloudData.customSuggestions && Array.isArray(cloudData.customSuggestions) && cloudData.customSuggestions.length > 0) setCustomSuggestions(cloudData.customSuggestions);
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

    let nextExerciseTechNotes = { ...exerciseTechNotes };
    if (updates.exerciseTechNotes !== undefined) {
      nextExerciseTechNotes = updates.exerciseTechNotes;
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
      exerciseTechNotes: nextExerciseTechNotes,
      experiments: nextExperiments,
      smartGoals: updates.smartGoals !== undefined ? updates.smartGoals : smartGoals,
      challenges: updates.challenges !== undefined ? updates.challenges : challenges,
      weeklyInsight: updates.weeklyInsight !== undefined ? updates.weeklyInsight : weeklyInsight,
      upcomingEvent: updates.upcomingEvent !== undefined ? updates.upcomingEvent : upcomingEvent,
      dietGuidelines: updates.dietGuidelines !== undefined ? updates.dietGuidelines : dietGuidelines,
      trainingGuidelines: updates.trainingGuidelines !== undefined ? updates.trainingGuidelines : trainingGuidelines,
      updatedAt: updateTime
    };

    // Actualizar UI primero (feedback instantáneo), luego persistir
    if (updates.log !== undefined) setFoodlog(nextFoodlog);
    if (updates.water !== undefined) setWaterlog(nextWaterlog);
    if (updates.supplements !== undefined) setSuppslog(nextSuppslog);
    if (updates.metricslog !== undefined || updates.weight !== undefined || updates.bodyComp !== undefined) setMetricslog(nextMetricslog);
    if (updates.suppsInventory !== undefined) setSuppsInventory(nextSuppsInventory);
    if (updates.workoutDurations !== undefined) setWorkoutDurations(nextWorkoutDurations);
    if (updates.exerciseTechNotes !== undefined) setExerciseTechNotes(nextExerciseTechNotes);
    if (updates.customPresets !== undefined) setCustomPresets(nextCustomPresets);
    if (updates.presetKey !== undefined) setPresetKey(updates.presetKey);
    if (updates.customSuggestions !== undefined) setCustomSuggestions(nextCustomSuggestions);
    if (updates.experiments !== undefined) setExperiments(nextExperiments);
    if (updates.splits !== undefined) setSplits(nextSplits);
    if (updates.dietGuidelines !== undefined) setDietGuidelines(updates.dietGuidelines);
    if (updates.trainingGuidelines !== undefined) setTrainingGuidelines(updates.trainingGuidelines);

    // Guardar local en paralelo (antes era secuencial: ~20 awaits encadenados)
    const writes = [];
    if (updates.presetKey !== undefined) writes.push(saveKey("profile", { presetKey: updates.presetKey }));
    if (updates.customPresets !== undefined) writes.push(saveKey("custom_presets", updates.customPresets));
    if (updates.notes !== undefined) writes.push(saveKey("notes", updates.notes));
    if (updates.chat !== undefined) writes.push(saveKey("chat", updates.chat));
    if (updates.exlog !== undefined) writes.push(saveKey("exlog", updates.exlog));
    if (updates.exercises !== undefined) writes.push(saveKey("exercises", updates.exercises));
    if (updates.bodyComp !== undefined) writes.push(saveKey("body_comp", updates.bodyComp));
    if (updates.shoppingList !== undefined) writes.push(saveKey("shopping_list", updates.shoppingList));
    if (updates.meals !== undefined) writes.push(saveKey("meals", updates.meals));
    if (updates.customSuggestions !== undefined) writes.push(saveKey("custom_suggestions", updates.customSuggestions));
    if (updates.activeSplitKey !== undefined) writes.push(saveKey("active_split_key", updates.activeSplitKey));
    if (updates.experiments !== undefined) writes.push(saveKey("experiments", updates.experiments));
    if (updates.splits !== undefined) writes.push(saveKey("training_splits", updates.splits));
    if (updates.dietGuidelines !== undefined) writes.push(saveKey("diet_guidelines", updates.dietGuidelines));
    if (updates.trainingGuidelines !== undefined) writes.push(saveKey("training_guidelines", updates.trainingGuidelines));
    if (updates.log !== undefined) writes.push(saveKey("foodlog", nextFoodlog));
    if (updates.water !== undefined) writes.push(saveKey("waterlog", nextWaterlog));
    if (updates.supplements !== undefined) writes.push(saveKey("suppslog", nextSuppslog));
    if (updates.metricslog !== undefined || updates.bodyComp !== undefined || updates.weight !== undefined) writes.push(saveKey("metricslog", nextMetricslog));
    if (updates.suppsInventory !== undefined) writes.push(saveKey("supps_inventory", nextSuppsInventory));
    if (updates.workoutDurations !== undefined) writes.push(saveKey("workout_durations", nextWorkoutDurations));
    if (updates.exerciseTechNotes !== undefined) writes.push(saveKey("exercise_tech_notes", nextExerciseTechNotes));
    writes.push(saveKey("last_local_update", updateTime));
    await Promise.all(writes);

    // Auto-sync completo a Supabase (full_state)
    scheduleFullSupabaseSync(current);

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
        // Si cambia el usuario, limpiar estado local antes de cargar el nuevo perfil
        const prevUserId = await loadKey("last_logged_in_user_id", null);
        if (prevUserId && prevUserId !== data.user.id) {
          await clearLocalUserState();
        }
        await saveKey("last_logged_in_user_id", data.user.id);
        setSupabaseUser(data.user);
        const restored = await loadFullStateFromSupabase(data.user.id);
        setSbError(restored ? "Datos restaurados desde la nube." : "Sesión iniciada. Sincronizando...");
        if (!restored) {
          setTimeout(() => syncLocalToSupabase(), 1000);
        }
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
        // Si cambia el usuario, limpiar estado local antes de crear el perfil nuevo
        const prevUserId = await loadKey("last_logged_in_user_id", null);
        if (prevUserId && prevUserId !== data.user.id) {
          await clearLocalUserState();
        }
        await saveKey("last_logged_in_user_id", data.user.id);
        setSupabaseUser(data.user);
        setTimeout(() => syncLocalToSupabase(), 1000);
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

  // Borra todo el estado local para evitar filtración de datos entre usuarios en el mismo dispositivo
  const clearLocalUserState = async () => {
    setNotes([]); await saveKey("notes", []);
    setExlog({}); await saveKey("exlog", {});
    setExercises({}); await saveKey("exercises", {});
    setFoodlog({}); await saveKey("foodlog", {});
    setWaterlog({}); await saveKey("waterlog", {});
    setSuppslog({}); await saveKey("suppslog", {});
    setMetricslog({}); await saveKey("metricslog", {});
    setSuppsInventory({}); await saveKey("supps_inventory", {});
    setWorkoutDurations({}); await saveKey("workout_durations", {});
    setMeals([]); await saveKey("meals", []);
    setSplits(DEFAULT_SPLITS); await saveKey("training_splits", DEFAULT_SPLITS);
    setBodyComp(null); await saveKey("body_comp", null);
    setShoppingList(null); await saveKey("shopping_list", null);
    setCustomPresets({}); await saveKey("custom_presets", {});
    setCustomSuggestions([]); await saveKey("custom_suggestions", []);
    setChat([]); await saveKey("chat", []);
    setExperiments([]); await saveKey("experiments", []);
    setSmartGoals([]); await saveKey("smart_goals", []);
    setChallenges([]); await saveKey("challenges", []);
    setWeeklyInsight(""); await saveKey("weekly_insight", "");
    setUpcomingEvent(""); await saveKey("upcoming_event", "");
    await saveKey("last_local_update", 0);
  };

  const syncLocalToSupabase = async (silent = false) => {
    if (!supabase || !supabaseUser) {
      if (!silent) setSbError("Supabase no está inicializado o no hay sesión activa.");
      return false;
    }
    setSbSyncing(true);
    setSbError("");
    try {
      const uId = supabaseUser.id;
      const uEmail = supabaseUser.email;

      // Antes de subir, verificar si la nube tiene datos más recientes
      const localUpdatedAt = await loadKey("last_local_update", 0);
      const { data: profileCheck } = await supabase.from('profiles').select('full_state').eq('id', uId).single();
      const cloudUpdatedAt = profileCheck?.full_state?.updatedAt || 0;
      if (cloudUpdatedAt > localUpdatedAt) {
        // La nube es más reciente → restaurar en vez de sobreescribir
        const restored = await loadFullStateFromSupabase(uId);
        setSbSyncing(false);
        setSbError(restored ? "Datos restaurados desde la nube (más recientes)." : "Sin cambios.");
        return true;
      }


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

  // ── Auto-sync completo a Supabase (debounced 5s) ──────────────────────────
  const scheduleFullSupabaseSync = (stateBlob) => {
    if (!supabase || !supabaseUser) return;
    clearTimeout(sbFullSyncTimer.current);
    setSbAutoSyncStatus("saving");
    sbFullSyncTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_state: stateBlob,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
        setSbAutoSyncStatus("saved");
        setTimeout(() => setSbAutoSyncStatus(""), 3000);
      } catch(e) {
        console.error("SB full-sync error:", e);
        setSbAutoSyncStatus("error");
      } finally {
        sbFullSyncTimer.current = null;
      }
    }, 5000);
  };

  // Pull automático cada 60s: si la nube tiene datos más recientes los restaura silenciosamente
  useEffect(() => {
    if (!supabase || !supabaseUser) {
      clearInterval(sbPullIntervalRef.current);
      return;
    }
    sbPullIntervalRef.current = setInterval(async () => {
      try {
        if (sbFullSyncTimer.current) return; // hay un push pendiente: no pisar con un pull
        const localTs = await loadKey("last_local_update", 0);
        const { data } = await supabase.from('profiles').select('full_state').eq('id', supabaseUser.id).single();
        const cloudTs = data?.full_state?.updatedAt || 0;
        if (cloudTs > localTs) {
          await loadFullStateFromSupabase(supabaseUser.id);
          setSbAutoSyncStatus("saved");
          setTimeout(() => setSbAutoSyncStatus(""), 3000);
        }
      } catch(e) { /* silencioso */ }
    }, 60000);
    return () => clearInterval(sbPullIntervalRef.current);
  }, [supabaseUser]);

  // Restaura TODO el estado desde profiles.full_state (al hacer login en nuevo dispositivo)
  const loadFullStateFromSupabase = async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('full_state, updated_at').eq('id', userId).single();
      if (error || !data?.full_state) return false;
      const s = data.full_state;
      const localUpdatedAt = await loadKey("last_local_update", 0);
      const cloudUpdatedAt = s.updatedAt || 0;
      if (cloudUpdatedAt <= localUpdatedAt) return false; // local es más reciente
      // Restaurar todo desde la nube
      if (s.notes && Array.isArray(s.notes) && s.notes.length > 0) { setNotes(s.notes); await saveKey("notes", s.notes); }
      if (s.exlog && Object.keys(s.exlog).length > 0) { setExlog(s.exlog); await saveKey("exlog", s.exlog); }
      if (s.exercises && Object.keys(s.exercises).length > 0) { setExercises(s.exercises); await saveKey("exercises", s.exercises); }
      if (s.foodlog && Object.keys(s.foodlog).length > 0) { setFoodlog(s.foodlog); await saveKey("foodlog", s.foodlog); }
      if (s.waterlog && Object.keys(s.waterlog).length > 0) { setWaterlog(s.waterlog); await saveKey("waterlog", s.waterlog); }
      if (s.suppslog && Object.keys(s.suppslog).length > 0) { setSuppslog(s.suppslog); await saveKey("suppslog", s.suppslog); }
      if (s.metricslog && Object.keys(s.metricslog).length > 0) { setMetricslog(s.metricslog); await saveKey("metricslog", s.metricslog); }
      if (s.suppsInventory && Object.keys(s.suppsInventory).length > 0) { setSuppsInventory(s.suppsInventory); await saveKey("supps_inventory", s.suppsInventory); }
      if (s.workoutDurations && Object.keys(s.workoutDurations).length > 0) { setWorkoutDurations(s.workoutDurations); await saveKey("workout_durations", s.workoutDurations); }
      if (s.meals && Array.isArray(s.meals) && s.meals.length > 0) { setMeals(s.meals); await saveKey("meals", s.meals); }
      if (s.splits && Array.isArray(s.splits) && s.splits.length > 0) { setSplits(s.splits); await saveKey("training_splits", s.splits); }
      if (s.bodyComp) { setBodyComp(s.bodyComp); await saveKey("body_comp", s.bodyComp); }
      if (s.shoppingList) { setShoppingList(s.shoppingList); await saveKey("shopping_list", s.shoppingList); }
      if (s.presetKey) { setPresetKey(s.presetKey); await saveKey("profile", { presetKey: s.presetKey }); }
      if (s.activeSplitKey) { setActiveSplitKey(s.activeSplitKey); await saveKey("active_split_key", s.activeSplitKey); }
      if (s.customPresets) { setCustomPresets(s.customPresets); await saveKey("custom_presets", s.customPresets); }
      if (s.customSuggestions && Array.isArray(s.customSuggestions)) { setCustomSuggestions(s.customSuggestions); await saveKey("custom_suggestions", s.customSuggestions); }
      if (s.chat && Array.isArray(s.chat) && s.chat.length > 0) { setChat(s.chat); await saveKey("chat", s.chat); }
      if (s.experiments && Array.isArray(s.experiments)) { setExperiments(s.experiments); await saveKey("experiments", s.experiments); }
      if (s.smartGoals && Array.isArray(s.smartGoals) && s.smartGoals.length > 0) { setSmartGoals(s.smartGoals); await saveKey("smart_goals", s.smartGoals); }
      if (s.challenges && Array.isArray(s.challenges) && s.challenges.length > 0) { setChallenges(s.challenges); await saveKey("challenges", s.challenges); }
      if (s.weeklyInsight) { setWeeklyInsight(s.weeklyInsight); await saveKey("weekly_insight", s.weeklyInsight); }
      if (s.upcomingEvent) { setUpcomingEvent(s.upcomingEvent); await saveKey("upcoming_event", s.upcomingEvent); }
      if (s.updatedAt) await saveKey("last_local_update", s.updatedAt);
      return true;
    } catch(e) {
      console.error("loadFullState error:", e);
      return false;
    }
  };

  // Exportar todos los datos como JSON
  const exportDataJSON = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      notes, exlog, exercises, foodlog, waterlog, suppslog, metricslog,
      suppsInventory, workoutDurations, meals, splits, bodyComp,
      shoppingList, presetKey, activeSplitKey, customPresets,
      customSuggestions, chat, experiments, smartGoals, challenges,
      weeklyInsight, upcomingEvent
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brunofit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mantener ref actualizada con el estado más reciente para el backup nocturno
  nightlyBackupRef.current = { notes, exlog, exercises, foodlog, waterlog, suppslog, metricslog, suppsInventory, workoutDurations, meals, splits, bodyComp, shoppingList, presetKey, activeSplitKey, customPresets, customSuggestions, chat, experiments, smartGoals, challenges, weeklyInsight, upcomingEvent, supabase, supabaseUser };

  // Backup automático: al abrir la app (si se perdió el de medianoche) y cada 00:00
  useEffect(() => {
    if (!loaded) return; // esperar a que los datos estén cargados

    const doBackup = async () => {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem("last_backup_date") === today) return;
      localStorage.setItem("last_backup_date", today);
      const st = nightlyBackupRef.current;
      const snap = { exportedAt: new Date().toISOString(), notes: st.notes, exlog: st.exlog, exercises: st.exercises, foodlog: st.foodlog, waterlog: st.waterlog, suppslog: st.suppslog, metricslog: st.metricslog, suppsInventory: st.suppsInventory, workoutDurations: st.workoutDurations, meals: st.meals, splits: st.splits, bodyComp: st.bodyComp, shoppingList: st.shoppingList, presetKey: st.presetKey, activeSplitKey: st.activeSplitKey, customPresets: st.customPresets, customSuggestions: st.customSuggestions, smartGoals: st.smartGoals, challenges: st.challenges };
      // 1. Descargar JSON
      try {
        const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `brunofit-backup-${today}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (_) {}
      // 2. Guardar en Supabase si está autenticado
      if (st.supabase && st.supabaseUser) {
        try {
          await st.supabase.from("profiles").upsert({ id: st.supabaseUser.id, email: st.supabaseUser.email, full_state: JSON.stringify(snap), last_backup: today, updated_at: new Date().toISOString() });
        } catch (_) {}
      }
      // 3. Toast de confirmación
      setBackupToast(true);
      setTimeout(() => setBackupToast(false), 5000);
    };

    // Al abrir la app: correr si el backup de hoy no se hizo
    doBackup();

    // A las 00:00: programar backup para medianoche y repetir cada día
    const schedule = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      return setTimeout(() => { doBackup(); schedule(); }, next - now);
    };
    const tid = schedule();
    return () => clearTimeout(tid);
  }, [loaded]);

  // Importar datos desde JSON
  const importDataJSON = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const s = JSON.parse(e.target.result);
        if (s.notes && Array.isArray(s.notes)) { setNotes(s.notes); await saveKey("notes", s.notes); }
        if (s.exlog && typeof s.exlog === 'object') { setExlog(s.exlog); await saveKey("exlog", s.exlog); }
        if (s.exercises && typeof s.exercises === 'object') { setExercises(s.exercises); await saveKey("exercises", s.exercises); }
        if (s.foodlog && typeof s.foodlog === 'object') { setFoodlog(s.foodlog); await saveKey("foodlog", s.foodlog); }
        if (s.waterlog && typeof s.waterlog === 'object') { setWaterlog(s.waterlog); await saveKey("waterlog", s.waterlog); }
        if (s.suppslog && typeof s.suppslog === 'object') { setSuppslog(s.suppslog); await saveKey("suppslog", s.suppslog); }
        if (s.metricslog && typeof s.metricslog === 'object') { setMetricslog(s.metricslog); await saveKey("metricslog", s.metricslog); }
        if (s.suppsInventory && typeof s.suppsInventory === 'object') { setSuppsInventory(s.suppsInventory); await saveKey("supps_inventory", s.suppsInventory); }
        if (s.workoutDurations && typeof s.workoutDurations === 'object') { setWorkoutDurations(s.workoutDurations); await saveKey("workout_durations", s.workoutDurations); }
        if (s.meals && Array.isArray(s.meals)) { setMeals(s.meals); await saveKey("meals", s.meals); }
        if (s.splits && Array.isArray(s.splits)) { setSplits(s.splits); await saveKey("training_splits", s.splits); }
        if (s.bodyComp) { setBodyComp(s.bodyComp); await saveKey("body_comp", s.bodyComp); }
        if (s.shoppingList) { setShoppingList(s.shoppingList); await saveKey("shopping_list", s.shoppingList); }
        if (s.presetKey) { setPresetKey(s.presetKey); await saveKey("profile", { presetKey: s.presetKey }); }
        if (s.activeSplitKey) { setActiveSplitKey(s.activeSplitKey); await saveKey("active_split_key", s.activeSplitKey); }
        if (s.customPresets) { setCustomPresets(s.customPresets); await saveKey("custom_presets", s.customPresets); }
        if (s.customSuggestions && Array.isArray(s.customSuggestions)) { setCustomSuggestions(s.customSuggestions); await saveKey("custom_suggestions", s.customSuggestions); }
        if (s.chat && Array.isArray(s.chat)) { setChat(s.chat); await saveKey("chat", s.chat); }
        if (s.experiments && Array.isArray(s.experiments)) { setExperiments(s.experiments); await saveKey("experiments", s.experiments); }
        if (s.smartGoals && Array.isArray(s.smartGoals)) { setSmartGoals(s.smartGoals); await saveKey("smart_goals", s.smartGoals); }
        if (s.challenges && Array.isArray(s.challenges)) { setChallenges(s.challenges); await saveKey("challenges", s.challenges); }
        if (s.weeklyInsight) { setWeeklyInsight(s.weeklyInsight); await saveKey("weekly_insight", s.weeklyInsight); }
        if (s.upcomingEvent) { setUpcomingEvent(s.upcomingEvent); await saveKey("upcoming_event", s.upcomingEvent); }
        setSbError("Datos importados correctamente.");
      } catch(err) {
        setSbError("Error al importar: archivo inválido.");
      }
    };
    reader.readAsText(file);
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
      if (cloudData.customSuggestions && Array.isArray(cloudData.customSuggestions) && cloudData.customSuggestions.length > 0) setCustomSuggestions(cloudData.customSuggestions);
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
      if (cloudData.customSuggestions && Array.isArray(cloudData.customSuggestions) && cloudData.customSuggestions.length > 0) setCustomSuggestions(cloudData.customSuggestions);
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
      const latestM = Object.entries(mLog||{}).filter(([_,v])=>v?.weight).sort((a,b)=>b[0] < a[0] ? -1 : (b[0] > a[0] ? 1 : 0))[0]?.[1];
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
    const remKcal = (tgt?.kcal||2200) - todayKcal;
    if (hour>=7&&hour<=9&&todayKcal<100) msg={icon:"🌅",text:`Buenos días! Objetivo: ${tgt?.kcal||2200} kcal · ${tgt?.p||180}g proteína. Registra tu desayuno.`};
    else if (hour>=12&&hour<=13&&todayKcal<400) msg={icon:"🍽️",text:`Son las ${hour}:00h y llevas solo ${todayKcal} kcal. Come bien antes del entreno.`};
    else if (hour>=17&&hour<=19&&!todayHasWorkout&&todayKcal>200) msg={icon:"💪",text:`¿Ya entrenaste? Llevas ${todayProtein}g de ${tgt?.p||180}g proteína objetivo.`};
    else if (hour>=21&&hour<23&&remKcal>300) msg={icon:"🌙",text:`Faltan ${remKcal} kcal para cerrar el día. ¿Ya cenaste? Ve a la pestaña Hoy para pedir sugerencias de cena.`};
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
          nextSplits = act.data.splits.map(newS => {
            const existing = (splits || []).find(s => s.key === newS.key);
            return { ...newS, ex: (newS.ex && newS.ex.length) ? newS.ex : (existing?.ex || []) };
          });
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
    const todayStr = selectedDateStr || new Date().toISOString().slice(0, 10);
    let summary = [];
    Object.entries(exlog || {}).forEach(([name, sets]) => {
      const todaySets = (sets || []).filter(s => s && s.date && s.date.slice(0, 10) === todayStr && s.type !== "warmup");
      if (todaySets.length > 0) {
        const sorted = [...todaySets];
        const setsText = sorted.map((s, idx) => {
          let txt = `S${idx + 1}: ${s.w}kg×${s.reps}`;
          if (s.rir !== undefined && s.rir !== null) txt += ` @RIR${s.rir}`;
          return txt;
        }).join(", ");
        const vol = sorted.reduce((a, s) => a + (parseFloat(s.w) || 0) * (parseFloat(s.reps) || 1), 0);
        summary.push(`- ${name} (${sorted.length} series, ${Math.round(vol)} kg vol): ${setsText}`);
      }
    });
    if (summary.length === 0) return "Ninguno registrado hoy.";
    // Agrega activación muscular total del día (suma across variantes)
    const muscleSets = calcSessionMuscleSets(exlog, exercises, todayStr);
    if (muscleSets.length > 0) {
      const muscleText = muscleSets.slice(0, 8)
        .map(({ muscle, weightedSets }) => `${muscle} ~${Math.round(weightedSets * 10) / 10}ser`)
        .join(', ');
      summary.push(`\nActivación muscular acumulada hoy: ${muscleText}`);
    }
    return summary.join("\n");
  };

  // Resumen histórico completo para dar memoria real al Coach
  const buildWorkoutHistorySummary = () => {
    const now = new Date();
    const weeksBack = 8;
    const weeklyVolume = {};
    const prs = {};
    const allExSessions = {}; // { exName: [{date, maxW, maxReps, rm, sets[]}] } últimas 5 sesiones
    const allExObjects = Object.values(exercises || {}).flat();

    const OPTIMAL_SETS_RANGE = {
      Pectoral:[10,20], Espalda:[10,20], Cuádriceps:[8,16], Isquios:[6,12],
      Deltoides:[12,20], Bíceps:[8,16], Tríceps:[8,16], Glúteos:[8,16], Antebrazo:[6,10]
    };

    Object.entries(exlog || {}).forEach(([exName, sets]) => {
      // ── PRs y volumen semanal ──
      (sets || []).forEach(s => {
        if (!s || !s.date || !s.w || s.type === "warmup") return;
        const d = new Date(s.date);
        const weeksAgo = Math.floor((now - d) / (7 * 24 * 3600 * 1000));
        if (weeksAgo > weeksBack) return;
        if (!prs[exName] || s.w > prs[exName]) prs[exName] = s.w;
        const weekLabel = weeksAgo === 0 ? 'Esta semana' : `Hace ${weeksAgo} sem`;
        if (!weeklyVolume[weekLabel]) weeklyVolume[weekLabel] = { sets: 0, tons: 0, days: new Set() };
        weeklyVolume[weekLabel].sets++;
        weeklyVolume[weekLabel].tons += (s.w * (parseFloat(s.reps) || 1)) / 1000;
        weeklyVolume[weekLabel].days.add(d.toISOString().slice(0, 10));
      });

      // ── Historial por sesión (últimas 5 sesiones de trabajo) ──
      const workingSets = (sets || []).filter(s => s && s.date && s.w && s.type !== "warmup");
      if (workingSets.length > 0) {
        const byDate = {};
        workingSets.forEach(s => {
          const dk = s.date.slice(0, 10);
          if (!byDate[dk]) byDate[dk] = [];
          byDate[dk].push(s);
        });
        const dates = Object.keys(byDate).sort().reverse().slice(0, 5);
        allExSessions[exName] = dates.map(dk => {
          const daySets = byDate[dk];
          const maxW = Math.max(...daySets.map(s => parseFloat(s.w) || 0));
          // best 1RM using Epley: w * (1 + (reps+rir)/30)
          const bestRM = daySets.reduce((best, s) => {
            const reps = parseInt(s.reps) || 0;
            const rir = parseInt(s.rir) || 0;
            const rm = (parseFloat(s.w) || 0) * (1 + (reps + rir) / 30);
            return rm > best ? rm : best;
          }, 0);
          const maxReps = Math.max(...daySets.filter(s => parseFloat(s.w) === maxW).map(s => parseInt(s.reps) || 0));
          return { date: dk, maxW, maxReps, rm: Math.round(bestRM), nSets: daySets.length };
        });
      }
    });

    // ── 1. Análisis detallado por ejercicio ──
    const plateauExercises = [];
    const overloadTargets = [];
    const exDetailLines = [];

    Object.entries(allExSessions).forEach(([exName, sessions]) => {
      if (!sessions.length) return;
      const exObj = allExObjects.find(e => e.name === exName);
      const primaryMuscle = exObj?.musculos?.[0] || "";

      // Plateau: mismo peso máximo en últimas 3+ sesiones
      if (sessions.length >= 3) {
        const last3W = sessions.slice(0, 3).map(s => s.maxW);
        if (last3W.every(w => w === last3W[0])) {
          plateauExercises.push({ name: exName, weight: last3W[0], count: last3W.length });
        }
      }

      // Sobrecarga progresiva: si hizo 8+ reps en última sesión → sugerir subir peso
      const latest = sessions[0];
      if (latest && latest.maxReps >= 8) {
        const isCompound = /sentadill|peso muert|press banca|dominad|jalón|remo barra|prensa/i.test(exName);
        const inc = isCompound ? 2.5 : 1;
        overloadTargets.push({ name: exName, cur: latest.maxW, next: latest.maxW + inc, reps: latest.maxReps });
      }

      // Línea de detalle: últimas 3 sesiones con 1RM
      const recent = sessions.slice(0, 3);
      const rmTrend = recent.map(s => `${s.date.slice(5)}: ${s.maxW}kg×${s.maxReps||"?"}rep×${s.nSets}ser (1RM~${s.rm})`).join(' | ');
      // Tendencia 1RM (subiendo/bajando)
      const rmVals = recent.map(s => s.rm).filter(Boolean);
      const rmDelta = rmVals.length >= 2 ? rmVals[0] - rmVals[rmVals.length - 1] : 0;
      const trend = rmDelta > 2 ? " ↑" : rmDelta < -2 ? " ↓" : "";
      exDetailLines.push(`  ${exName}${primaryMuscle ? " ["+primaryMuscle+"]" : ""}${trend}: ${rmTrend}`);
    });

    // ── 2. Volumen por grupo muscular (series ponderadas, 2 semanas) ──
    const muscleWeekMap = {};
    Object.entries(exlog || {}).forEach(([exName, allSets]) => {
      const exObj = allExObjects.find(e => e.name === exName);
      const musculos = exObj?.musculos || [];
      if (!musculos.length) return;
      (allSets || []).filter(s => s?.date && s.type !== "warmup").forEach(s => {
        const d = new Date(s.date);
        const weeksAgo = Math.floor((now - d) / (7 * 24 * 3600 * 1000));
        if (weeksAgo > 2) return;
        const lbl = weeksAgo === 0 ? 'Esta semana' : 'Hace 1 sem';
        if (!muscleWeekMap[lbl]) muscleWeekMap[lbl] = {};
        musculos.forEach((m, idx) => {
          const w = MUSCLE_ACTIVATION_WEIGHTS[idx] ?? 0.1;
          muscleWeekMap[lbl][m] = (muscleWeekMap[lbl][m] || 0) + w;
        });
      });
    });
    const muscleLines = ['Esta semana', 'Hace 1 sem'].map(lbl => {
      const mm = muscleWeekMap[lbl];
      if (!mm) return null;
      const sorted = Object.entries(mm).sort(([,a],[,b]) => b-a);
      const parts = sorted.map(([m, s]) => {
        const v = Math.round(s * 10) / 10;
        const opt = OPTIMAL_SETS_RANGE[m];
        const badge = opt ? (v < opt[0] ? "⚠bajo" : v > opt[1] ? "⬆exceso" : "✓") : "";
        return `${m}:${v}ser${badge}`;
      });
      return `  ${lbl}: ${parts.join(', ')}`;
    }).filter(Boolean);

    // ── 3. Volumen semanal global ──
    const volLines = ['Esta semana', 'Hace 1 sem', 'Hace 2 sem', 'Hace 3 sem'].map(label => {
      const v = weeklyVolume[label];
      if (!v) return null;
      return `  - ${label}: ${v.sets} series, ${v.tons.toFixed(1)} ton, ${v.days.size} días`;
    }).filter(Boolean);

    // ── 4. PRs top 8 ──
    const prLines = Object.entries(prs).sort((a,b)=>b[1]-a[1]).slice(0,8)
      .map(([ex, w]) => `  ${ex}: ${w}kg`);

    let result = '';
    if (exDetailLines.length) result += `HISTORIAL POR EJERCICIO (últimas sesiones + 1RM estimado Epley):\n${exDetailLines.join('\n')}\n\n`;
    if (muscleLines.length) result += `VOLUMEN POR MÚSCULO — series ponderadas por activación (✓=óptimo ⚠=bajo ⬆=exceso):\n${muscleLines.join('\n')}\n\n`;
    if (volLines.length) result += `VOLUMEN SEMANAL GLOBAL:\n${volLines.join('\n')}\n\n`;
    if (prLines.length) result += `PRs MÁXIMOS HISTÓRICOS:\n${prLines.join('\n')}\n\n`;
    if (plateauExercises.length) result += `ESTANCAMIENTOS DETECTADOS (mismo peso 3+ sesiones):\n${plateauExercises.map(p=>`  ⚠️ ${p.name}: ${p.weight}kg`).join('\n')}\n\n`;
    if (overloadTargets.length) result += `OBJETIVOS SOBRECARGA PRÓXIMA SESIÓN (reps≥8 → sube):\n${overloadTargets.slice(0,6).map(t=>`  ${t.name}: ${t.cur}kg×${t.reps}rep → intentar ${t.next}kg`).join('\n')}\n`;
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

      const nowHour = new Date().getHours();
      const timeBlock = nowHour < 6 ? "madrugada (antes de las 6h)" : nowHour < 12 ? `mañana (${nowHour}:00h)` : nowHour < 15 ? `mediodía (${nowHour}:00h)` : nowHour < 19 ? `tarde (${nowHour}:00h)` : `noche (${nowHour}:00h)`;
      const trainedToday = todayWorkout && !todayWorkout.includes("Sin entreno") && todayWorkout.trim().length > 10;
      const remKcal = Math.max(0, target.kcal - totals.kcal);
      const remP = Math.max(0, target.p - totals.p);
      const remC = Math.max(0, target.c - totals.c);
      const remF = Math.max(0, target.f - totals.f);
      const mealContext = nowHour < 9 ? "Bruno aún no ha desayunado — orienta hacia desayuno + pre-entreno si aplica." : nowHour < 13 ? "Hora de almuerzo próxima — considera kcal restantes para las comidas del resto del día." : nowHour < 16 ? "Tarde post-almuerzo — puede quedar merienda y cena." : nowHour < 20 ? "Tarde/noche — probablemente quedan cena y snack." : "Noche — enfócate en cerrar macros del día y recuperación nocturna.";

      // Get Fitdays body composition data
      const getFitdaysCompositionText = () => {
        const keys = Object.keys(metricslog || {}).sort().reverse();
        if (keys.length === 0) return "Sin registros Fitdays.";
        const latest = metricslog[keys[0]];
        if (!latest) return "Sin registros Fitdays.";

        let comp = "";
        if (latest.puntuacion) comp += `Score Fitdays: ${latest.puntuacion}/100. `;
        if (latest.tipoCuerpo) comp += `Tipo de cuerpo: ${latest.tipoCuerpo}. `;
        if (latest.edadCorporal) comp += `Edad corporal: ${latest.edadCorporal} años. `;
        const smm = latest.smmKg || latest.masaMuscular || latest.musculo;
        if (smm) comp += `Masa muscular/SMM: ${smm}kg. `;
        if (latest.pesoSinGrasa) comp += `LBM: ${latest.pesoSinGrasa}kg. `;
        if (latest.smi) comp += `SMI: ${latest.smi} kg/m². `;
        if (latest.masaOsea || latest.masaEsqueletica) comp += `Masa ósea: ${latest.masaOsea || latest.masaEsqueletica}kg. `;
        if (latest.grasaSubc) comp += `Grasa subcutánea: ${latest.grasaSubc}%. `;
        if (latest.bmr) comp += `BMR: ${latest.bmr}kcal. `;
        if (latest.pesoObjetivo) comp += `Objetivo peso: ${latest.pesoObjetivo}kg. `;
        if (latest.zinE) comp += `zINE: ${latest.zinE}. `;
        if (latest.whr) comp += `WHR: ${latest.whr}. `;

        // Segmental analysis
        if (latest.musculoBrazoDer || latest.musculoBrazoIzq) {
          const dif = Math.abs((latest.musculoBrazoDer || 0) - (latest.musculoBrazoIzq || 0));
          if (dif > 0.3) comp += `⚠️ Asimetría muscular en brazos: D ${latest.musculoBrazoDer}kg vs I ${latest.musculoBrazoIzq}kg. `;
        }
        if (latest.musculoPiernaDer || latest.musculoPiernaIzq) {
          const dif = Math.abs((latest.musculoPiernaDer || 0) - (latest.musculoPiernaIzq || 0));
          if (dif > 0.5) comp += `⚠️ Asimetría muscular en piernas: D ${latest.musculoPiernaDer}kg vs I ${latest.musculoPiernaIzq}kg. `;
        }
        if (latest.grasaTronco && latest.grasaBrazoDer && latest.grasaPiernaDer) {
          const torsoRatio = latest.grasaTronco / (latest.grasaBrazoDer + latest.grasaPiernaDer);
          if (torsoRatio > 3) comp += `Concentración de grasa en tronco (mayor que miembros). Prioriza: dominadas, remos, press. `;
        }

        // Incluir análisis IA de Fitdays si existe (guardado al hacer el análisis)
        const latestFitdaysAnalysis = keys.slice(0, 3).map(k => metricslog[k]?.fitdaysAIAnalysis).find(Boolean);
        if (latestFitdaysAnalysis) comp += `\nÚltimo análisis IA Fitdays: "${latestFitdaysAnalysis.slice(0, 300)}..."`;

        return comp || "Sin datos Fitdays.";
      };
      const getFotoAnalysisContext = () => {
        const keys = Object.keys(metricslog || {}).sort().reverse();
        const recentAnalyses = keys.slice(0, 5).map(k => metricslog[k]?.photoAnalysis ? `${k}: "${metricslog[k].photoAnalysis.slice(0, 200)}"` : null).filter(Boolean);
        return recentAnalyses.length ? recentAnalyses.join("\n") : null;
      };
      const fitdaysComp = getFitdaysCompositionText();
      const fotoAnalysisCtx = getFotoAnalysisContext();

      const sys = `Eres el coach nutricional y de fuerza de Bruno. ${getProfileStr(activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)}${dietGuidelines ? `\nDIRECTRICES DIETÉTICAS PERSONALIZADAS DE BRUNO (respétalas siempre): ${dietGuidelines}` : ""}${trainingGuidelines ? `\nDIRECTRICES DE ENTRENAMIENTO PERSONALIZADAS DE BRUNO (respétalas siempre): ${trainingGuidelines}` : ""}
MOMENTO ACTUAL: ${timeBlock}. ADAPTA tu respuesta a este contexto horario — no sugieras desayuno si es de noche, ni cena si es de mañana. ${mealContext}
Plan nutricional activo: ${target.kcal} kcal (${target.label}), P:${target.p}g / C:${target.c}g / G:${target.f}g.
Métricas antropométricas y corporales: ${metricsSummary}
Datos de Composición Corporal (Fitdays): ${fitdaysComp}${fotoAnalysisCtx ? `\nAnálisis de fotos de progreso recientes:\n${fotoAnalysisCtx}` : ""}
Historial nutricional acumulado reciente: ${recentNutrition}
Día de Split de entrenamiento activo hoy: Día ${activeSplit.key} (${activeSplit.name}), combustible de carbohidratos asignado: ${activeSplit.fuel}.
Estado de entrenamiento hoy: ${trainedToday ? "✓ YA ENTRENÓ HOY — no preguntes si va a entrenar, asume recuperación activa." : "✗ AÚN NO HA ENTRENADO HOY — puedes orientar pre-entreno, timing y energía si aplica."}
Datos adicionales del día ${selectedDateStr}: agua: ${water || waterlog[selectedDateStr] || 0}ml, duración sesión: ${workoutDurations[selectedDateStr] ? workoutDurations[selectedDateStr]+" min" : "no registrada"}, suplementos activos: ${Object.entries(supplements||{}).filter(([,v])=>v).map(([k])=>k).join(", ")||"ninguno"}.
Hoy lleva consumido: ${Math.round(totals.kcal)} kcal, P:${Math.round(totals.p)}g C:${Math.round(totals.c)}g G:${Math.round(totals.f)}g. Restante: ${Math.round(remKcal)} kcal, P:${Math.round(remP)}g C:${Math.round(remC)}g G:${Math.round(remF)}g.

Entrenamiento realizado por Bruno hoy:
${todayWorkout}

--- HISTORIAL Y MEMORIA COMPLETA ---
${workoutHistory}
--- FIN HISTORIAL ---

Español. ${coachPersonality==="motivacional" ? "Tono motivacional, empático y energético. Celebra logros, usa frases inspiradoras, motiva a Bruno a superar sus límites." : coachPersonality==="nutricionista" ? "Enfócate principalmente en nutrición, timing de comidas, macros y estrategias alimentarias. Profundiza en el aspecto nutricional sobre el entrenamiento." : coachPersonality==="psicólogo" ? "Tono empático, comprensivo y de apoyo. Atiende el aspecto mental y emocional del fitness. Ayuda a manejar el estrés, la motivación y los hábitos." : "Directo, técnico y basado en datos. Prioriza análisis de progresión de fuerza, 1RM, volumen por músculo y optimización del rendimiento. El peso corporal es secundario frente al rendimiento."}
FORMATO DE RESPUESTA (chatResponse): Texto limpio y legible para chat móvil. PERMITIDO: párrafos cortos, listas con "• item" (un ítem por línea), **negrita** para datos clave, emojis puntuales para separar secciones. PROHIBIDO ABSOLUTO: cualquier encabezado markdown (# ## ### #### ##### — NUNCA uses el símbolo #), listas con * en medio de una frase, párrafos de más de 4 líneas. Máximo 4 ítems por lista; si hay más datos, agrúpalos. Separá las secciones con una línea en blanco.
REGLA DE ANÁLISIS DE ENTRENAMIENTO: Usa SIEMPRE el historial detallado de ejercicios. Para cada ejercicio mencionado: cita el 1RM estimado, la tendencia (subiendo/bajando), y el número de series por semana en los músculos involucrados. Si detectás estancamiento (misma carga 3+ sesiones), propone inmediatamente una variación concreta con nombre del ejercicio alternativo.
REGLA PRÓXIMA SEMANA: Cuando el tema sea entrenamiento o al finalizar un análisis de sesión, incluye SIEMPRE un bloque "Próxima semana:" con 3-5 puntos específicos: qué peso intentar en los ejercicios principales (basado en sobrecarga progresiva), qué músculo necesita más volumen según el balance muscular, y si hay algún ejercicio que conviene rotar o variar.
REGLA VARIACIONES: Si un ejercicio lleva 3+ sesiones sin progreso de 1RM, sugiere la variación más adecuada (ej: press banca plano → press inclinado con mancuernas / press banca agarre cerrado / push-ups con lastre). Siempre da el nombre exacto del ejercicio alternativo.
REGLA DE CALCULADORA INVERSA: Si Bruno te pregunta qué cenar o comer para cerrar el día o cómo completar sus macros restantes, calcula con precisión matemática una combinación rápida de alimentos (gramos exactos) para cuadrar sus números.
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
      
      // Una sola llamada estructurada (sin streaming paralelo — ahorra cuota)
      const out = await callGemini(nextChat.slice(-12), sys, COACH_SCHEMA);
      const parsed = cleanAndParseJSON(out);

      if (parsed && parsed.actions && parsed.actions.length > 0) {
        handleCoachActions(parsed.actions);
        const hasNewSets = parsed.actions.some(a => a.type === 'ADD_SET');
        if (hasNewSets) {
          setTimeout(() => {
            sendCoachMessage('[Análisis automático de sesión] Analicé las series que acabo de registrar. Dame una evaluación breve: ¿superé mis registros anteriores? ¿el volumen fue adecuado? ¿qué debo priorizar la próxima sesión de este músculo?');
          }, 1500);
        }
      }

      const finalChat = [...nextChat, { role: "assistant", content: (parsed && parsed.chatResponse) || "..." }];
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
    const todayWorkout = getTodayWorkoutSummary();
    if (todayWorkout === "Ninguno registrado hoy.") {
      // Sin datos aún — solo abrir Coach
      return;
    }
    // Construir resumen nutricional de hoy
    const todayLog = (foodlog || {})[selectedDateStr] || [];
    const todayTotals = todayLog.reduce((a, e) => ({
      kcal: a.kcal + (+e.kcal || 0), p: a.p + (+e.proteina || 0),
      c: a.c + (+e.carbo || 0), f: a.f + (+e.grasa || 0)
    }), { kcal:0, p:0, c:0, f:0 });
    const nutritionLine = todayLog.length > 0
      ? `Nutrición hoy: ${Math.round(todayTotals.kcal)} kcal | P: ${Math.round(todayTotals.p)}g C: ${Math.round(todayTotals.c)}g G: ${Math.round(todayTotals.f)}g`
      : "Sin registros nutricionales hoy.";
    // Notas de sensaciones del día
    const todaySensations = (notes || [])
      .filter(n => (n.date || "").slice(0,10) === selectedDateStr)
      .map(n => n.text).join(" / ") || "Sin notas de sensaciones.";

    const msg = `[ANÁLISIS DE ENTRENAMIENTO — ${selectedDateStr}]

Ejercicios completados hoy:
${todayWorkout}

${nutritionLine}
Sensaciones/notas del día: ${todaySensations}

Analiza este entrenamiento usando mi historial completo que ya tenés. Responde con EXACTAMENTE esta estructura, en este orden:

**Progresión** — compará cada ejercicio con las 2-4 semanas anteriores: ¿subí peso, mantuve o bajé? ¿más o menos series/reps?

**Lo que salió bien** — 2-3 puntos concretos positivos de la sesión de hoy.

**Lo que mejorar** — 2-3 puntos concretos con el problema y la corrección exacta.

**Próxima sesión** — para cada ejercicio principal: peso objetivo, reps y series recomendadas. Sé específico con números.

No repitas los datos que ya te mandé. No me pidas registrar nada.`;
    await sendCoachMessage(msg);
  };

  const generateWeeklyPDF = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    const w = window.open('', '_blank');
    if (w) w.document.write('<html><body style="background:#0c0e0b;color:#cdff4a;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center"><div><p style="font-size:22px;margin-bottom:8px">⏳ Generando reporte…</p><p style="font-size:13px;color:#9aa088">Analizando 8 semanas de entrenamiento con IA</p><p style="font-size:12px;color:#666;margin-top:10px;">Esto puede tardar 30–60 segundos ☕</p></div></body></html>');
    try {
      const last7 = [...Array(7)].map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-i); return d.toISOString().slice(0,10); }).reverse();
      const weekStart = last7[0], weekEnd = last7[6];
      const DAYS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
      const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      const fmtDate = d => { const dt=new Date(d+'T12:00:00'); return `${DAYS_ES[dt.getDay()]} ${dt.getDate()} ${MONTHS_ES[dt.getMonth()]}`; };
      const fmtShort = d => { const [,m,day]=d.split('-'); return `${parseInt(day)} ${MONTHS_ES[parseInt(m)-1]}`; };

      // Workouts this week — grouped by day
      const weekWorkouts = {}; // { date: { exName: [sets] } }
      const allTimePRs = {}, prevBestByEx = {};
      Object.entries(exlog||{}).forEach(([exName, sets]) => {
        let weekMax = 0;
        (sets||[]).forEach(s => {
          if (!s||!s.w||s.type==="warmup") return;
          const w2 = parseFloat(s.w)||0;
          const d = (s.date||"").slice(0,10);
          if (w2 > (allTimePRs[exName]||0)) allTimePRs[exName] = w2;
          if (d < weekStart || d > weekEnd) {
            if (w2 > (prevBestByEx[exName]||0)) prevBestByEx[exName] = w2;
            return;
          }
          if (w2 > weekMax) weekMax = w2;
          if (!weekWorkouts[d]) weekWorkouts[d] = {};
          if (!weekWorkouts[d][exName]) weekWorkouts[d][exName] = [];
          weekWorkouts[d][exName].push(s);
        });
      });

      // Per-exercise historical sessions (last 5 per exercise, for strength trend)
      const exHistorical = {};
      Object.entries(exlog||{}).forEach(([exName, sets]) => {
        const workSets = (sets||[]).filter(s => s?.date && s.w && s.type !== "warmup");
        if (!workSets.length) return;
        const byDate = {};
        workSets.forEach(s => { const dk = s.date.slice(0,10); if (!byDate[dk]) byDate[dk] = []; byDate[dk].push(s); });
        const dates = Object.keys(byDate).sort().reverse().slice(0,5);
        exHistorical[exName] = dates.map(dk => {
          const daySets = byDate[dk];
          const maxW2 = Math.max(...daySets.map(s => parseFloat(s.w)||0));
          const bestRM = daySets.reduce((best, s) => { const reps = parseInt(s.reps)||0; const rir = parseInt(s.rir)||0; const rm = (parseFloat(s.w)||0)*(1+(reps+rir)/30); return rm > best ? rm : best; }, 0);
          return { date: dk, maxW: maxW2, rm: Math.round(bestRM), nSets: daySets.length };
        });
      });

      // Plateau: same maxW for 3+ consecutive sessions
      const localPlateaus = [];
      Object.entries(exHistorical).forEach(([exName, sessions]) => {
        if (sessions.length >= 3) {
          const last3W = sessions.slice(0,3).map(s => s.maxW);
          if (last3W.every(w => w === last3W[0]) && last3W[0] > 0) localPlateaus.push({ name: exName, weight: last3W[0] });
        }
      });

      // Technique notes from exercises state
      const techNotesByEx = {};
      Object.values(exercises||{}).flat().forEach(ex => { if (ex?.tecnico?.trim()) techNotesByEx[ex.name] = ex.tecnico.trim(); });

      // Full 8-week history for AI (1RM trends, plateaus, muscle volume with optimal ranges)
      const historyStr = buildWorkoutHistorySummary();

      const trainedDays = Object.keys(weekWorkouts).sort();
      const totalSets = trainedDays.reduce((s,d)=>s+Object.values(weekWorkouts[d]).reduce((ss,sets)=>ss+sets.length,0),0);
      const totalTons = trainedDays.reduce((s,d)=>s+Object.values(weekWorkouts[d]).reduce((ss,sets)=>ss+sets.reduce((sss,set)=>sss+(parseFloat(set.w)||0)*(parseFloat(set.reps)||1)/1000,0),0),0);

      const wDates = last7.filter(d=>metricslog?.[d]?.weight);
      const weightChange = wDates.length>=2 ? (parseFloat(metricslog[wDates[wDates.length-1]].weight)-parseFloat(metricslog[wDates[0]].weight)).toFixed(1) : null;
      const latestMetricDate = Object.keys(metricslog||{}).sort().reverse()[0];
      const lm = latestMetricDate ? metricslog[latestMetricDate] : null;

      // Build per-day detail for AI prompt
      const dayDetails = trainedDays.map(date => {
        const dayExs = weekWorkouts[date];
        const lines = Object.entries(dayExs).map(([ex,sets])=>{
          const maxW = Math.max(...sets.map(s=>parseFloat(s.w)||0));
          const allPR = allTimePRs[ex]||0;
          const prevBest = prevBestByEx[ex]||0;
          const est1rm = maxW>0?Math.round(maxW*(1+(parseFloat(sets[0]?.reps)||8)/30)):0;
          const prNote = maxW>=allPR&&maxW>0?' ★PR' : maxW>prevBest&&maxW>0?' ↑mejora':'';
          return `  • ${ex}: ${sets.length} series [${sets.map(s=>`${s.w}kg×${s.reps}`).join(', ')}] → 1RM est.${est1rm}kg${prNote}`;
        });
        return `${fmtDate(date)}:\n${lines.join('\n')}`;
      }).join('\n\n');

      // Muscle volume
      const muscleVol = calcMuscleVolumeBalance(exlog, exercises);
      const muscleLines = Object.entries(muscleVol).filter(([,m])=>m.setsPerWeek>0)
        .sort((a,b)=>b[1].setsPerWeek-a[1].setsPerWeek)
        .map(([muscle,m])=>`${muscle}: ${m.setsPerWeek.toFixed(1)} series/sem (${m.status})`).join(' | ');

      // Deload / fatigue
      const deload = detectDeloadNeed(exlog, notes||[], metricslog||{});
      const overloadStr = Object.entries(overloadSuggestions||{}).slice(0,10).map(([ex,s])=>`${ex}: max ${s.currentMax}kg → sugerido ${s.suggested}kg`).join('\n');
      const plateauStr = (plateauAlerts||[]).slice(0,6).map(p=>p.exercise||p.message||'').filter(Boolean).join(', ')||'Ninguno';

      const PDF_SCHEMA = { type:"OBJECT", properties:{
        valoracion:{ type:"OBJECT", properties:{ puntuacion:{type:"NUMBER"}, resumen:{type:"STRING"} }, required:["puntuacion","resumen"] },
        analisis:{ type:"STRING" },
        progresion:{ type:"STRING" },
        recuperacion:{ type:"STRING" },
        fortalezas:{ type:"ARRAY", items:{type:"STRING"} },
        mejorar:{ type:"ARRAY", items:{ type:"OBJECT", properties:{ punto:{type:"STRING"}, accion:{type:"STRING"} }, required:["punto","accion"] } },
        cargas:{ type:"ARRAY", items:{ type:"OBJECT", properties:{
          ejercicio:{type:"STRING"}, cargaActual:{type:"STRING"}, sugerencia:{type:"STRING"}, esquema:{type:"STRING"}, razon:{type:"STRING"}
        }, required:["ejercicio","sugerencia","esquema","razon"] }},
        variaciones:{ type:"ARRAY", items:{ type:"OBJECT", properties:{ ejercicio:{type:"STRING"}, alternativa:{type:"STRING"}, motivo:{type:"STRING"} }, required:["ejercicio","alternativa","motivo"] }},
        planProximaSemana:{ type:"ARRAY", items:{type:"STRING"} },
        focoProximaSemana:{ type:"STRING" }
      }, required:["valoracion","analisis","progresion","cargas","focoProximaSemana"] };

      const sys = `Eres el coach personal de Bruno. Tu análisis va a ser leído por su entrenadora humana. Sé técnico, específico y detallado. Usa los datos reales de 1RM Epley, tendencias históricas y volumen muscular — nunca inventes cifras. Para ejercicios estancados (mismo peso 3+ sesiones), sugiere una variación concreta con nombre exacto del ejercicio alternativo. Responde en español.`;
      const userMsg = `REPORTE SEMANAL — ${weekStart} al ${weekEnd}

DATOS GENERALES:
• Días entrenados: ${trainedDays.length}/7
• Series efectivas totales: ${totalSets}
• Volumen total: ${totalTons.toFixed(2)} toneladas
${lm?.musculo?`• Masa muscular: ${lm.musculo}kg | Grasa: ${lm.grasaPct}% | Visceral: ${lm.visceral||'?'}`:''}

ENTRENAMIENTO DÍA A DÍA (esta semana):
${dayDetails||'Sin datos'}

HISTORIAL COMPLETO (8 semanas — 1RM estimado Epley por sesión, tendencias ↑↓, volumen muscular con rangos óptimos):
${historyStr||'Sin historial'}

VOLUMEN POR MÚSCULO (últimas 4 semanas, rangos hipertrofia):
${muscleLines||'Sin datos'}

NOTAS TÉCNICAS POR EJERCICIO:
${Object.entries(techNotesByEx).length ? Object.entries(techNotesByEx).map(([ex,n])=>`  ${ex}: ${n}`).join('\n') : '  Sin notas técnicas registradas'}

ESTANCAMIENTOS DETECTADOS (mismo peso 3+ sesiones consecutivas):
${localPlateaus.length ? localPlateaus.map(p=>`  ⚠ ${p.name}: estancado en ${p.weight}kg`).join('\n') : '  Ninguno'}

SOBRECARGA PROGRESIVA DETECTADA:
${overloadStr||'Sin sugerencias disponibles'}

NECESIDAD DE DELOAD: ${deload.recommended?`SÍ — urgencia ${deload.urgency} (${deload.reason})`:'No detectada'} · Semanas sin deload: ${deload.weeksSinceDeload}

INSTRUCCIONES PARA EL ANÁLISIS:
1. "valoracion": puntúa la semana del 1 al 10 con un resumen de una línea.
2. "analisis": 3 párrafos detallados — (a) análisis global de volumen e intensidad, (b) qué ejercicios evolucionaron bien y cuáles no según tendencia 1RM, (c) balance muscular push/pull/piernas con datos de series.
3. "progresion": párrafo específico sobre tendencia de 1RM estimado por ejercicio clave, si la sobrecarga es correcta según el historial de 8 semanas.
4. "recuperacion": evaluación del estado de fatiga, si necesita deload, calidad del volumen (demasiado/poco).
5. "fortalezas": mínimo 4 puntos concretos con datos reales (cita ejercicios, pesos, 1RM).
6. "mejorar": mínimo 4 puntos cada uno con una acción concreta y accionable.
7. "cargas": para CADA ejercicio realizado esta semana, da la carga actual, la sugerencia concreta en kg para la próxima sesión basada en la tendencia de 1RM, el esquema recomendado (ej. "4×6" o "3×10-12") y el razonamiento técnico.
8. "variaciones": para cada ejercicio en ESTANCAMIENTOS DETECTADOS, propón 1 variación específica (nombre exacto del ejercicio alternativo) y el motivo técnico.
9. "planProximaSemana": lista de 5-7 prioridades concretas para la próxima semana, ordenadas por impacto.
10. "focoProximaSemana": UN párrafo claro de foco principal.`;

      const raw = await callGemini([{role:"user",content:userMsg}], sys, PDF_SCHEMA);
      const ai = cleanAndParseJSON(raw) || {};

      // Build day-grouped exercise sections
      let daysSectionsHTML = trainedDays.map(date => {
        const dayExs = weekWorkouts[date];
        const dayTons = Object.values(dayExs).reduce((s,sets)=>s+sets.reduce((ss,set)=>ss+(parseFloat(set.w)||0)*(parseFloat(set.reps)||1)/1000,0),0);
        const rows = Object.entries(dayExs).map(([exName,sets])=>{
          const maxW = Math.max(...sets.map(s=>parseFloat(s.w)||0));
          const avgReps = Math.round(sets.reduce((s,e)=>s+(parseFloat(e.reps)||8),0)/sets.length);
          const est1rm = maxW>0?Math.round(maxW*(1+avgReps/30)):'—';
          const isPR = allTimePRs[exName]&&maxW>=allTimePRs[exName];
          const isImprove = !isPR && prevBestByEx[exName] && maxW > prevBestByEx[exName];
          const badge = isPR?'<span class="pr-badge">★ PR</span>':isImprove?'<span class="imp-badge">↑</span>':'';
          const techNote = techNotesByEx[exName] ? `<div style="font-size:9px;color:#888;font-style:italic;margin-top:2px;">📝 ${techNotesByEx[exName].slice(0,80)}</div>` : '';
          const hist = exHistorical[exName]; const histLen = hist?.length||0;
          const rmDelta = histLen>=2 ? hist[0].rm - hist[histLen-1].rm : 0;
          const trend = rmDelta>3?'<span style="color:#3a7000;font-size:10px;margin-left:3px;">↑</span>':rmDelta<-3?'<span style="color:#b91c1c;font-size:10px;margin-left:3px;">↓</span>':'';
          return `<tr><td><b>${exName}</b> ${badge}${trend}${techNote}</td><td>${sets.length}</td><td style="font-size:10.5px;">${sets.map(s=>`${s.w}kg×${s.reps}`).join(' · ')}</td><td>${est1rm} kg</td><td style="color:#888;">${maxW}kg</td></tr>`;
        }).join('');
        return `<div class="day-block">
  <div class="day-header"><span>${fmtDate(date)}</span><span class="day-stats">${Object.keys(dayExs).length} ejercicios · ${Object.values(dayExs).reduce((s,sets)=>s+sets.length,0)} series · ${dayTons.toFixed(1)}t</span></div>
  <table><thead><tr><th>Ejercicio</th><th>Series</th><th>Cargas × Reps</th><th>1RM est.</th><th>Mejor</th></tr></thead><tbody>${rows}</tbody></table>
</div>`;
      }).join('');

      // Muscle bars grouped by category
      const MUSCLE_GROUPS = {
        'Empuje': ['Pectoral','Deltoides','Deltoides anterior','Tríceps'],
        'Jalón': ['Dorsal ancho','Trapecio','Romboides','Bíceps','Braquial'],
        'Piernas': ['Cuádriceps','Isquiotibiales','Glúteo','Gemelos','Sóleo'],
        'Núcleo': ['Abdominales','Oblicuos','Lumbares','Core']
      };
      const assignedMuscles = new Set();
      let muscleGroupsHTML = '';
      Object.entries(MUSCLE_GROUPS).forEach(([group, muscles]) => {
        const groupEntries = muscles.filter(m => muscleVol[m]?.setsPerWeek > 0);
        groupEntries.forEach(m => assignedMuscles.add(m));
        if (!groupEntries.length) return;
        const bars = groupEntries.map(muscle => {
          const m = muscleVol[muscle];
          const pct = Math.max(3, Math.round((m.setsPerWeek/20)*100));
          const col = m.status==='optimal'?'#4a8a00':m.status==='high'?'#0077a0':m.status==='low'?'#c97a00':'#b91c1c';
          const statusLabel = m.status==='optimal'?'óptimo':m.status==='high'?'alto':m.status==='low'?'bajo':'sin trabajo';
          return `<div class="muscle-bar"><div class="bar-label">${muscle}</div><div style="flex:1;background:#f0f0f0;border-radius:4px;height:7px;"><div style="width:${Math.min(pct,100)}%;height:7px;background:${col};border-radius:4px;"></div></div><div class="bar-val">${m.setsPerWeek.toFixed(1)}/sem <span style="color:${col};font-weight:700;">(${statusLabel})</span></div></div>`;
        }).join('');
        muscleGroupsHTML += `<div class="muscle-group"><div class="muscle-group-title">${group}</div>${bars}</div>`;
      });
      // Remaining muscles not in groups
      const remaining = Object.entries(muscleVol).filter(([m,v])=>v.setsPerWeek>0&&!assignedMuscles.has(m));
      if (remaining.length) {
        const bars = remaining.map(([muscle,m])=>{
          const pct = Math.max(3,Math.round((m.setsPerWeek/20)*100));
          const col = m.status==='optimal'?'#4a8a00':m.status==='high'?'#0077a0':m.status==='low'?'#c97a00':'#b91c1c';
          return `<div class="muscle-bar"><div class="bar-label">${muscle}</div><div style="flex:1;background:#f0f0f0;border-radius:4px;height:7px;"><div style="width:${Math.min(pct,100)}%;height:7px;background:${col};border-radius:4px;"></div></div><div class="bar-val">${m.setsPerWeek.toFixed(1)}/sem</div></div>`;
        }).join('');
        muscleGroupsHTML += `<div class="muscle-group"><div class="muscle-group-title">Otros</div>${bars}</div>`;
      }

      // Strength progression table (exercises done this week, last 5 sessions each)
      const weekExNames = [...new Set(trainedDays.flatMap(d => Object.keys(weekWorkouts[d]||{})))];
      const progRows = weekExNames.map(exName => {
        const history = exHistorical[exName];
        if (!history || history.length < 2) return null;
        const rmDelta2 = history[0].rm - history[history.length-1].rm;
        const trendColor2 = rmDelta2 > 2 ? '#3a7000' : rmDelta2 < -2 ? '#b91c1c' : '#888';
        const trendArrow2 = rmDelta2 > 2 ? '↑' : rmDelta2 < -2 ? '↓' : '→';
        const cells = history.slice(0,5).map(s => `<td style="font-size:9.5px;text-align:center;padding:5px 6px;">${s.date.slice(5)}<br><b>${s.maxW}kg</b><br><span style="color:#777;">${s.rm}kg</span></td>`).join('');
        return `<tr><td style="font-size:11px;font-weight:700;padding:6px 8px;white-space:nowrap;">${exName} <span style="color:${trendColor2};font-size:13px;">${trendArrow2}</span></td>${cells}</tr>`;
      }).filter(Boolean).join('');

      // Plateau visual section
      const plateauHTML = localPlateaus.length ? localPlateaus.map(p => `<div class="list-item warn-item"><b>⚠ ${p.name}</b> — estancado en <b>${p.weight}kg</b> por 3+ sesiones consecutivas</div>`).join('') : '';

      // AI variations section
      const variacionesHTML = (ai.variaciones||[]).map(v => `<div class="list-item"><b>${v.ejercicio}</b> &rarr; <span style="color:#3a7000;font-weight:700;">${v.alternativa}</span><div class="action">${v.motivo}</div></div>`).join('');

      // Cargas table
      const cargasRows = (ai.cargas||[]).map(c=>`<tr><td><b>${c.ejercicio}</b></td><td>${c.cargaActual||'—'}</td><td class="highlight"><b>${c.sugerencia}</b></td><td style="color:#555;font-weight:700;">${c.esquema||'—'}</td><td style="font-size:10px;color:#666;">${c.razon||''}</td></tr>`).join('');

      const scoreColor = !ai.valoracion?.puntuacion?'#888':ai.valoracion.puntuacion>=8?'#3a7000':ai.valoracion.puntuacion>=6?'#c97a00':'#b91c1c';

      const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reporte Semanal — ${fmtShort(weekStart)} al ${fmtShort(weekEnd)}</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;padding:28px 32px;max-width:800px;margin:0 auto;line-height:1.5}
h1{font-size:26px;font-weight:900;margin-bottom:2px;color:#0c0e0b}
h2{font-size:11px;font-weight:900;margin:24px 0 10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid #cdff4a;padding-bottom:5px;color:#333}
.meta{color:#888;font-size:11px;margin-bottom:18px}
.hint{background:#0c0e0b;color:#cdff4a;padding:10px 16px;border-radius:8px;margin-bottom:22px;font-size:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.hint button{background:#cdff4a;color:#0c0e0b;border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:12px;flex-shrink:0}
.score-row{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.score-circle{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;flex-shrink:0;border:3px solid}
.score-text{font-size:13px;color:#444;line-height:1.5}
.metrics-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.metrics-row span{background:#f5f5f5;padding:4px 10px;border-radius:6px;font-size:11px}
.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
.stat-box{background:#f8f8f8;border-radius:10px;padding:10px 12px;border-left:3px solid #cdff4a}
.stat-val{font-size:20px;font-weight:900;line-height:1}.stat-label{font-size:9px;color:#888;margin-top:3px;text-transform:uppercase;letter-spacing:.04em}
.day-block{margin-bottom:18px}
.day-header{display:flex;align-items:center;justify-content:space-between;background:#0c0e0b;color:#cdff4a;padding:7px 12px;border-radius:8px 8px 0 0;font-size:11.5px;font-weight:800}
.day-stats{font-size:10px;color:#9aa088;font-weight:500}
table{width:100%;border-collapse:collapse;margin-bottom:0}
th{background:#f3f3f3;font-weight:700;text-align:left;padding:6px 8px;font-size:10px;color:#555}
td{padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:11px;vertical-align:top}
.day-block table{border-radius:0 0 8px 8px;overflow:hidden;border:1px solid #e8e8e8;border-top:none}
.day-block tbody tr:last-child td{border-bottom:none}
.pr-badge{display:inline-block;background:#cdff4a;color:#0c0e0b;font-size:9px;font-weight:900;padding:1px 5px;border-radius:4px;vertical-align:middle}
.imp-badge{display:inline-block;background:#4ad6ff22;color:#0077a0;font-size:9px;font-weight:900;padding:1px 5px;border-radius:4px;vertical-align:middle;border:1px solid #4ad6ff55}
.muscle-group{margin-bottom:12px}
.muscle-group-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:6px;padding-left:2px}
.muscle-bar{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.bar-label{font-size:11px;width:130px;flex-shrink:0;color:#333}
.bar-val{font-size:10px;color:#888;width:130px;text-align:right;flex-shrink:0}
.ai-section{background:#f9fff0;border-left:3px solid #cdff4a;padding:13px 16px;border-radius:0 8px 8px 0;line-height:1.7;font-size:12px;margin-bottom:6px;white-space:pre-wrap}
.recovery-box{background:#fff8f0;border-left:3px solid #f59e0b;padding:13px 16px;border-radius:0 8px 8px 0;line-height:1.7;font-size:12px;margin-bottom:6px;white-space:pre-wrap}
.highlight{color:#3a7000;font-weight:700}
.list-item{padding:6px 0 6px 14px;border-left:2px solid #cdff4a;margin-bottom:7px;font-size:12px;line-height:1.5}
.list-item .action{font-size:11px;color:#555;margin-top:2px;padding-left:0}
.warn-item{border-left-color:#f59e0b}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.col-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee}
.foco-box{background:#0c0e0b;color:#cdff4a;border-radius:10px;padding:16px 18px;font-size:13px;font-weight:700;line-height:1.6;margin-top:4px}
.plan-list{list-style:none;counter-reset:plan}
.plan-list li{counter-increment:plan;padding:7px 0 7px 28px;position:relative;border-bottom:1px solid #f5f5f5;font-size:12px;line-height:1.5}
.plan-list li::before{content:counter(plan);position:absolute;left:0;top:7px;background:#cdff4a;color:#0c0e0b;font-weight:900;font-size:10px;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;line-height:18px}
.deload-alert{background:#fff0f0;border:1px solid #f59e0b;border-radius:8px;padding:10px 14px;margin-bottom:6px;font-size:11.5px;color:#7a4000}
.footer{margin-top:36px;font-size:9.5px;color:#bbb;text-align:center;border-top:1px solid #eee;padding-top:14px}
@media print{.hint{display:none!important}body{padding:14px 20px}h2{margin:16px 0 8px}}
</style></head><body>
<div class="hint">📄 Compartir → Imprimir → Guardar PDF &nbsp;&nbsp;<button onclick="window.print()">Imprimir / PDF</button></div>
<h1>Reporte Semanal de Entrenamiento</h1>
<div class="meta">Semana ${fmtShort(weekStart)} – ${fmtShort(weekEnd)} &nbsp;·&nbsp; Generado el ${new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</div>
${lm?`<div class="metrics-row">${lm.weight?`<span>⚖️ Peso: <b>${lm.weight} kg</b>${weightChange!==null?` (${parseFloat(weightChange)>=0?'+':''}${weightChange} kg/sem)`:''}</span>`:''} ${lm.musculo?`<span>💪 Músculo: <b>${lm.musculo} kg</b></span>`:''} ${lm.grasaPct?`<span>📊 Grasa: <b>${lm.grasaPct}%</b></span>`:''} ${lm.visceral?`<span>🫀 Visceral: <b>G${lm.visceral}</b></span>`:''}</div>`:''}
${ai.valoracion?`<div class="score-row"><div class="score-circle" style="color:${scoreColor};border-color:${scoreColor};">${ai.valoracion.puntuacion||'?'}</div><div class="score-text"><b style="font-size:14px;">Valoración de la semana</b><br>${ai.valoracion.resumen||''}</div></div>`:''}
<h2>Resumen de la Semana</h2>
<div class="summary-grid">
<div class="stat-box"><div class="stat-val">${trainedDays.length}<span style="font-size:12px;color:#888;">/7</span></div><div class="stat-label">Días</div></div>
<div class="stat-box"><div class="stat-val">${totalSets}</div><div class="stat-label">Series efectivas</div></div>
<div class="stat-box"><div class="stat-val">${totalTons.toFixed(1)}<span style="font-size:12px;color:#888;">t</span></div><div class="stat-label">Volumen total</div></div>
<div class="stat-box" style="border-left-color:${weightChange!==null&&parseFloat(weightChange)>0?'#f59e0b':'#cdff4a'};"><div class="stat-val">${weightChange!==null?(parseFloat(weightChange)>0?'+':'')+weightChange:'—'}<span style="font-size:12px;color:#888;">${weightChange!==null?' kg':''}</span></div><div class="stat-label">Cambio peso</div></div>
</div>
${deload.recommended&&deload.urgency!=='none'?`<div style="margin-top:10px;" class="deload-alert">⚠️ <b>Deload recomendado</b> (urgencia: ${deload.urgency}) — ${deload.reason}</div>`:''}
<h2>Entrenamientos por Día</h2>
${daysSectionsHTML||'<p style="color:#999;">Sin entrenamientos registrados esta semana.</p>'}
${progRows?`<h2>Progresión de Fuerza por Ejercicio</h2>
<p style="font-size:10px;color:#aaa;margin-bottom:8px;">Carga máxima y 1RM estimado (Epley) por sesión — últimas 5 sesiones. ↑ mejorando · ↓ bajando · → estancado</p>
<div style="overflow-x:auto;"><table style="min-width:500px;"><thead><tr><th style="width:170px;">Ejercicio</th><th colspan="5" style="text-align:center;font-size:9.5px;">Sesiones recientes (fecha / carga / 1RM est.)</th></tr></thead><tbody>${progRows}</tbody></table></div>`:''}
${plateauHTML?`<h2>⚠ Ejercicios Estancados</h2>${plateauHTML}`:''}
<h2>Volumen por Grupo Muscular</h2>
<div class="two-col" style="margin-bottom:4px;">${muscleGroupsHTML}</div>
<p style="font-size:10px;color:#aaa;margin-top:4px;">Referencia: verde=óptimo (8–20 series/sem) · amarillo=bajo (&lt;8) · rojo=sin trabajo · azul=alto (&gt;20)</p>
<h2>Análisis Global</h2>
${ai.analisis?`<div class="ai-section">${ai.analisis}</div>`:'<p style="color:#999;">Sin análisis disponible.</p>'}
<h2>Progresión de Fuerza — Análisis IA</h2>
${ai.progresion?`<div class="ai-section">${ai.progresion}</div>`:''}
${ai.recuperacion?`<h2>Recuperación y Fatiga</h2><div class="recovery-box">${ai.recuperacion}</div>`:''}
${(ai.fortalezas?.length||ai.mejorar?.length)?`<h2>Balance de la Semana</h2><div class="two-col">
${ai.fortalezas?.length?`<div><div class="col-title" style="color:#3a7000;">✓ Fortalezas</div>${ai.fortalezas.map(f=>`<div class="list-item">${f}</div>`).join('')}</div>`:''}
${ai.mejorar?.length?`<div><div class="col-title" style="color:#c97a00;">↑ A mejorar</div>${ai.mejorar.map(m=>`<div class="list-item warn-item"><b>${m.punto||m}</b>${m.accion?`<div class="action">→ ${m.accion}</div>`:''}</div>`).join('')}</div>`:''}
</div>`:''}
${cargasRows?`<h2>Recomendaciones de Carga — Próxima Semana</h2><table><thead><tr><th>Ejercicio</th><th>Carga actual</th><th>Sugerencia</th><th>Esquema</th><th>Razonamiento</th></tr></thead><tbody>${cargasRows}</tbody></table>`:''}
${variacionesHTML?`<h2>Variaciones Sugeridas (para estancamientos)</h2>${variacionesHTML}`:''}
${ai.planProximaSemana?.length?`<h2>Plan para la Próxima Semana</h2><ol class="plan-list">${ai.planProximaSemana.map(p=>`<li>${p}</li>`).join('')}</ol>`:''}
${ai.focoProximaSemana?`<h2>Foco Principal</h2><div class="foco-box">${ai.focoProximaSemana}</div>`:''}
<div class="footer">Reporte generado por Bruno Fit &nbsp;·&nbsp; ${new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
</body></html>`;

      if (w && !w.closed) { w.document.open(); w.document.write(html); w.document.close(); }
    } catch(e) {
      if (w && !w.closed) w.close();
      alert("No se pudo generar el reporte: " + aiErr(e));
    } finally {
      setPdfBusy(false);
    }
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
                  <div style={{position:"relative", display:"inline-flex"}}>
                    <Ic size={22} strokeWidth={isActive ? 2.5 : 1.8}/>
                    {k === "coach" && chat.length > 0 && view !== "coach" && (
                      <div style={{position:"absolute", top:-2, right:-3, width:7, height:7, borderRadius:"50%", background:C.lime}}/>
                    )}
                  </div>
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
              <div style={{fontSize:9, color:C.muted, fontWeight:700, letterSpacing:".1em", marginTop:2}}>{APP_VERSION}</div>
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
            <div>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                <div style={{fontSize:20, fontWeight:800, color:C.ink}}>Rutina de Hoy</div>
                <div style={{display:"flex", gap:6}}>
                  <button
                    onClick={() => setShowFocusMode(true)}
                    className="btn-active-scale"
                    style={{background:"rgba(74,214,255,0.08)", border:`1px solid rgba(74,214,255,0.25)`, borderRadius:10, padding:"6px 10px", display:"flex", alignItems:"center", gap:5, color:C.cyan, fontWeight:800, fontSize:11.5, cursor:"pointer"}}
                  >
                    <Clock size={13}/><span>Foco</span>
                  </button>
                  <button
                    onClick={() => setShowTrainerAgent(true)}
                    className="btn-active-scale"
                    style={{background:"rgba(205,255,74,0.08)", border:`1px solid rgba(205,255,74,0.25)`, borderRadius:10, padding:"6px 10px", display:"flex", alignItems:"center", gap:5, color:C.lime, fontWeight:800, fontSize:11.5, cursor:"pointer"}}
                  >
                    <Sparkles size={13}/><span>Agente</span>
                  </button>
                </div>
              </div>
              {(() => {
                const isPush = m => /pectoral|deltoid|tricep/i.test(m);
                const isPull = m => /dorsal|trapecio|bicep|rombo/i.test(m);
                const isLegs = m => /cuadri|isquio|gluteo|gemelo|soleo/i.test(m);
                const weekAgo = Date.now() - 7 * 864e5;
                const exMap = {};
                Object.values(exercises || {}).flat().forEach(e => { exMap[e.name] = e.musculos || []; });
                let push = 0, pull = 0, legs = 0;
                Object.entries(exlog || {}).forEach(([name, sets]) => {
                  const ms = exMap[name] || MUSCLES[name] || [];
                  (sets || []).forEach(s => {
                    if (s && s.date && new Date(s.date).getTime() >= weekAgo && s.type !== "warmup") {
                      if (ms.some(isPush)) push++;
                      else if (ms.some(isPull)) pull++;
                      else if (ms.some(isLegs)) legs++;
                    }
                  });
                });
                if (push + pull + legs === 0) return null;
                return (
                  <div style={{display:"flex", gap:6, marginTop:8}}>
                    {[["Empuje",push,C.cyan],["Jalón",pull,C.lime],["Piernas",legs,C.amber]].map(([lbl,val,col]) => (
                      <div key={lbl} style={{flex:1, background:C.panel, border:`1px solid ${col}33`, borderRadius:8, padding:"5px 8px", textAlign:"center"}}>
                        <div style={{fontSize:9, fontWeight:700, color:C.muted, textTransform:"uppercase"}}>{lbl}</div>
                        <div style={{fontSize:16, fontWeight:900, color:col, lineHeight:1.2}}>{val}</div>
                        <div style={{fontSize:8, color:C.muted}}>series</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
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
            exlog={exlog}
            notes={notes}
            foodlog={foodlog}
            sendCoachMessage={sendCoachMessage}
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
            coachPersonality={coachPersonality}
            setCoachPersonality={setCoachPersonality}
            metricslog={metricslog}
            foodlog={foodlog}
            exlog={exlog}
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
            exerciseTechNotes={exerciseTechNotes}
            setExerciseTechNotes={(etn) => saveState({ exerciseTechNotes: etn })}
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
            setNotes={(n) => { setNotes(n); saveState({ notes: n }); }}
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
            dietGuidelines={dietGuidelines}
            setDietGuidelines={setDietGuidelines}
            trainingGuidelines={trainingGuidelines}
            setTrainingGuidelines={setTrainingGuidelines}
            onSaveGuidelines={(type, value) => {
              if (type === "diet") saveState({ dietGuidelines: value });
              else saveState({ trainingGuidelines: value });
            }}
            sendCoachMessage={sendCoachMessage}
            setView={setView}
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
            exportDataJSON={exportDataJSON}
            importDataJSON={importDataJSON}
            sbAutoSyncStatus={sbAutoSyncStatus}
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
            foodlog={foodlog}
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
          generateWeeklyPDF={generateWeeklyPDF}
          pdfBusy={pdfBusy}
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

      {showFocusMode && (
        <FocusMode
          onClose={() => setShowFocusMode(false)}
          splits={splits}
          exlog={exlog}
          exercises={exercises}
        />
      )}

      {backupToast && (
        <div style={{position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:"rgba(21,23,15,0.96)", border:`1px solid ${C.lime}44`, borderRadius:12, padding:"10px 16px", zIndex:9999, display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
          <span style={{fontSize:14}}>🔒</span>
          <span style={{fontSize:12.5, color:C.lime, fontWeight:700}}>Copia automática guardada</span>
        </div>
      )}

      {prAlerts.length > 0 && <Confetti key={prAlerts.join("|").slice(0, 24)} />}
      {prAlerts.length > 0 && (
        <div style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100vw - 24px)",
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

/* ===== CONFETTI (celebración de PR) ===== */
function Confetti(){
  const pieces = React.useMemo(() => Array.from({length: 40}).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    dur: 1.8 + Math.random() * 1.4,
    color: [C.lime, C.cyan, C.amber, C.rose, "#ffffff"][i % 5],
    rot: Math.random() * 360,
    size: 6 + Math.random() * 7
  })), []);
  return (
    <div style={{position:"fixed", inset:0, pointerEvents:"none", zIndex:10000, overflow:"hidden"}}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position:"absolute", top:0, left:`${p.left}%`,
          width:p.size, height:p.size*0.55, background:p.color,
          borderRadius:2, opacity:0.95, transform:`rotate(${p.rot}deg)`,
          animation:`confettiFall ${p.dur}s cubic-bezier(0.4,0,0.6,1) ${p.delay}s forwards`
        }}/>
      ))}
    </div>
  );
}

/* ===== MARKDOWN TEXT RENDERER ===== */
function MarkdownText({ text, style = {} }) {
  if (!text) return null;

  const renderInline = (str) => {
    if (!str) return null;
    const parts = str.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**') && p.length > 4)
        return <strong key={i} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith('*') && p.endsWith('*') && p.length > 2 && !p.startsWith('**'))
        return <span key={i} style={{ color: C.cyan }}>{p.slice(1, -1)}</span>;
      if (p.startsWith('`') && p.endsWith('`'))
        return <code key={i} style={{ background: 'rgba(255,255,255,0.09)', borderRadius: 4, padding: '1px 5px', fontSize: '0.88em' }}>{p.slice(1, -1)}</code>;
      return p;
    });
  };

  const lines = text.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const tr = lines[i].trim();

    if (!tr) { i++; continue; }

    // # through ###### headers (strip all leading hashes)
    const hm = tr.match(/^(#{1,6})\s+(.*)/);
    if (hm) {
      const lvl = Math.min(hm[1].length, 3);
      out.push(
        <div key={i} style={{ fontSize: lvl === 1 ? 15 : lvl === 2 ? 13.5 : 13, fontWeight: 800, color: C.lime, marginTop: 10, marginBottom: 3, lineHeight: 1.3 }}>
          {renderInline(hm[2])}
        </div>
      );
      i++; continue;
    }

    // Standalone **Title** line → section header
    if (/^\*\*[^*]+\*\*\s*:?\s*$/.test(tr)) {
      out.push(
        <div key={i} style={{ fontSize: 13, fontWeight: 800, color: C.lime, marginTop: 10, marginBottom: 2 }}>
          {tr.replace(/\*\*/g, '').replace(/:$/, '')}
        </div>
      );
      i++; continue;
    }

    // Bullet list (•, -, * at line start)
    if (/^[•\-\*]\s/.test(tr)) {
      const items = [];
      while (i < lines.length && /^[•\-\*]\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[•\-\*]\s+/, '');
        items.push(
          <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 3 }}>
            <span style={{ color: C.lime, flexShrink: 0, fontSize: 14, lineHeight: '1.55' }}>·</span>
            <span style={{ flex: 1, lineHeight: 1.55 }}>{renderInline(itemText)}</span>
          </div>
        );
        i++;
      }
      out.push(<div key={`bl${i}`} style={{ margin: '5px 0' }}>{items}</div>);
      continue;
    }

    // Numbered list
    if (/^\d+[.)]\s/.test(tr)) {
      const items = [];
      let n = 1;
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+[.)]\s+/, '');
        items.push(
          <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 3 }}>
            <span style={{ color: C.lime, flexShrink: 0, fontWeight: 700, fontSize: 12, minWidth: 16, lineHeight: '1.7' }}>{n}.</span>
            <span style={{ flex: 1, lineHeight: 1.55 }}>{renderInline(itemText)}</span>
          </div>
        );
        i++; n++;
      }
      out.push(<div key={`nl${i}`} style={{ margin: '5px 0' }}>{items}</div>);
      continue;
    }

    // Inline "* item * item" pattern → split into vertical bullets
    if (/\*\s[A-ZÁÉÍÓÚ0-9\*]/.test(tr) && (tr.match(/\*\s/g) || []).length >= 2) {
      const parts = tr.split(/\s*\*\s+/).filter(Boolean);
      if (parts.length > 1) {
        out.push(
          <div key={i} style={{ margin: '5px 0' }}>
            {parts.map((p, pi) => (
              <div key={pi} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 3 }}>
                <span style={{ color: C.lime, flexShrink: 0, fontSize: 14, lineHeight: '1.55' }}>·</span>
                <span style={{ flex: 1, lineHeight: 1.55 }}>{renderInline(p.trim())}</span>
              </div>
            ))}
          </div>
        );
        i++; continue;
      }
    }

    // Regular paragraph
    out.push(<p key={i} style={{ margin: '4px 0', lineHeight: 1.58 }}>{renderInline(tr)}</p>);
    i++;
  }

  return <div style={{ fontSize: 13.5, color: 'inherit', ...style }}>{out}</div>;
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
        <MarkdownText text={text} style={{ color: "#dde0cf" }}/>
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
  saveState,
  foodlog
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();

  const [localText, setLocalText] = useState(addFoodInputText || "");
  useEffect(() => {
    setLocalText(addFoodInputText || "");
  }, [addFoodInputText]);

  const recentUnique = React.useMemo(() => {
    const seen = new Map();
    const allDates = Object.keys(foodlog || {}).sort().reverse();
    for (const d of allDates) {
      for (const entry of (foodlog[d] || [])) {
        const key = entry.resumen?.toLowerCase().trim();
        if (key && !seen.has(key)) seen.set(key, entry);
        if (seen.size >= 5) break;
      }
      if (seen.size >= 5) break;
    }
    return [...seen.values()];
  }, [foodlog]);

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
    const cached = getAICache("food", val);
    if (cached && Array.isArray(cached) && cached.length) {
      setAiParsedResults(prev => [...prev, ...cached]);
      setBusy(false);
      return;
    }
    try {
      const out = await callGemini([{ role: "user", content: val }], FOOD_SYS, FOOD_SCHEMA);
      const parsed = cleanAndParseJSON(out);
      if (parsed && parsed.items) {
        setAiParsedResults(prev => [...prev, ...parsed.items]);
        setAICache("food", val, parsed.items);
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
      const b64 = await fileToBase64(file);
      const media = pickImageMedia(file);
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

        {recentUnique.length > 0 && (
          <div style={{padding:"0 0 6px"}}>
            <div style={{fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6}}>Repetir rápido</div>
            <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
              {recentUnique.map((item, i) => (
                <button key={i} onClick={() => {
                  const newEntry = { ...item, id: Date.now() + i, t: Date.now() };
                  const newLog = [newEntry, ...log];
                  setLog(newLog);
                  saveState({ log: newLog });
                }} style={{
                  background:C.panel2, border:`1px solid ${C.line}`, borderRadius:20,
                  padding:"5px 10px", fontSize:11, fontWeight:600, color:C.ink,
                  cursor:"pointer", display:"flex", alignItems:"center", gap:4
                }}>
                  <span style={{maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{item.resumen}</span>
                  <span style={{color:C.muted, fontSize:10}}>{item.kcal}kcal</span>
                </button>
              ))}
            </div>
          </div>
        )}

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

function predictTodayReadiness(exlog, notes, water, foodlog, selectedDateStr) {
  const today = selectedDateStr || new Date().toISOString().slice(0, 10);

  // ── ¿Ya entrenaste hoy? → modo Recuperación ──
  const todaySets = Object.values(exlog || {}).flatMap(sets =>
    (sets || []).filter(s => (s?.date || '').slice(0, 10) === today && s.type !== 'warmup')
  );
  const trainedToday = todaySets.length > 0;

  if (trainedToday) {
    const todayFood = (foodlog || {})[today] || [];
    const proteinToday = Math.round(todayFood.reduce((a, e) => a + (+e.proteina || 0), 0));
    const hydPct = Math.min(1, (water || 0) / 14);
    const totalSets = todaySets.length;
    const totalVol = Math.round(todaySets.reduce((a, s) => a + ((parseFloat(s.w)||0) * (parseInt(s.reps)||0)), 0));

    let score = 7;
    const factors = [];

    if (proteinToday >= 50) { score += 1; factors.push(`${proteinToday}g proteína ✓`); }
    else if (proteinToday >= 20) { factors.push(`${proteinToday}g prot. (suma más)`); }
    else { score -= 1; factors.push("Prioriza proteína ahora"); }

    if (hydPct >= 0.75) { score += 1; factors.push("Hidratación buena"); }
    else if (hydPct >= 0.4) { factors.push("Sigue hidratándote"); }
    else { score -= 1; factors.push("Agua urgente"); }

    if (totalSets >= 15) { factors.push(`Sesión intensa · ${totalSets} series`); score -= 0.5; }
    else if (totalSets >= 6) { factors.push(`${totalSets} series · ${totalVol > 0 ? totalVol + " kg vol." : ""}`); }
    else { factors.push(`${totalSets} series registradas`); }

    score = Math.round(Math.max(1, Math.min(10, score)));
    let label, color;
    if (score >= 8) { label = "Recuperación en curso"; color = C.lime; }
    else if (score >= 6) { label = "Completa tu recuperación"; color = C.cyan; }
    else { label = "Prioriza proteína y agua"; color = C.amber; }

    return { score, label, color, factors, mode: "recovery" };
  }

  // ── Preparación pre-entreno ──
  let score = 5;
  const factors = [];

  // 1. Días de descanso desde último entreno
  let lastWorkoutDate = null;
  Object.values(exlog || {}).forEach(sets => {
    (sets || []).forEach(s => {
      const d = (s?.date || '').slice(0, 10);
      if (d && d < today && (!lastWorkoutDate || d > lastWorkoutDate)) lastWorkoutDate = d;
    });
  });
  const restDays = lastWorkoutDate
    ? Math.floor((new Date(today) - new Date(lastWorkoutDate)) / 86400000)
    : 7;
  if (restDays === 1) { score += 0.5; factors.push("1 día de descanso"); }
  else if (restDays === 2 || restDays === 3) { score += 1.5; factors.push(`${restDays} días de descanso`); }
  else if (restDays > 3) { score += 0.5; factors.push("Descanso prolongado"); }

  // 2. Hidratación actual
  const hydPct = Math.min(1, (water || 0) / 14);
  if (hydPct >= 0.75) { score += 1.5; factors.push("Bien hidratado"); }
  else if (hydPct >= 0.4) { score += 0.5; factors.push("Hidratación parcial"); }
  else { score -= 1; factors.push("Hidratación baja"); }

  // 3. Proteína y calorías de ayer
  const yesterday = new Date(new Date(today).getTime() - 86400000).toISOString().slice(0, 10);
  const yEntries = (foodlog || {})[yesterday] || [];
  const yProt = Math.round(yEntries.reduce((a, e) => a + (+e.proteina || 0), 0));
  const yKcal = Math.round(yEntries.reduce((a, e) => a + (+e.kcal || 0), 0));
  if (yProt >= 150) { score += 1.5; factors.push(`${yProt}g proteína ayer`); }
  else if (yProt >= 100) { score += 0.5; factors.push(`${yProt}g prot. ayer`); }
  else if (yProt > 0 && yProt < 80) { score -= 1; factors.push("Proteína baja ayer"); }
  else if (yKcal > 0 && yKcal < 1500) { score -= 0.5; factors.push("Calorías bajas ayer"); }

  // 4. Calidad de sueño en notas recientes
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const recentNotes = (notes || []).filter(n => n?.date && n.date.slice(0, 10) >= weekAgo);
  const goodSleepKw = ["dormí bien","dormi bien","buen sueño","descansé","descanse","dormi 8","dormí 8"];
  const badSleepKw = ["mal sueño","insomnio","no dormí","no dormi","poco sueño","desvelado","desvelada","dormí poco","dormi poco"];
  const goodSleep = recentNotes.some(n => goodSleepKw.some(k => (n.text||"").toLowerCase().includes(k)));
  const badSleep = recentNotes.some(n => badSleepKw.some(k => (n.text||"").toLowerCase().includes(k)));
  if (goodSleep) { score += 1; factors.push("Buen sueño reciente"); }
  else if (badSleep) { score -= 1.5; factors.push("Sueño deficiente"); }

  // 5. Fatiga acumulada en notas
  const fatigueKw = ["fatiga","cansado","cansada","agotado","agotada","sin energía","sin energia"];
  const fatigueCount = recentNotes.filter(n => fatigueKw.some(k => (n.text||"").toLowerCase().includes(k))).length;
  if (fatigueCount >= 2) { score -= 2; factors.push("Fatiga acumulada"); }
  else if (fatigueCount === 1) { score -= 1; factors.push("Algo de fatiga"); }

  // 6. Volumen semanal (riesgo de sobreentrenamiento)
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  let weekSets = 0;
  Object.values(exlog || {}).forEach(sets => {
    (sets || []).forEach(s => {
      const d = (s?.date || '').slice(0, 10);
      if (d >= weekStart && d < today && s.type !== 'warmup') weekSets++;
    });
  });
  if (weekSets > 45) { score -= 1.5; factors.push(`Semana muy cargada (${weekSets} series)`); }
  else if (weekSets > 30) { score -= 0.5; factors.push(`Semana cargada (${weekSets} series)`); }

  score = Math.round(Math.max(1, Math.min(10, score)));
  let label, color;
  if (score >= 8) { label = "Listo para rendir al máximo"; color = C.lime; }
  else if (score >= 6) { label = "Buena preparación"; color = C.cyan; }
  else if (score >= 4) { label = "Preparación moderada"; color = C.amber; }
  else { label = "Considera descansar hoy"; color = C.rose; }

  return { score, label, color, factors, mode: "readiness" };
}

const PlantaHidratacion = React.memo(function PlantaHidratacion({ water, waterGoal, isRestDay }) {
  const wg = waterGoal || 14;
  const pct = Math.min(1, Math.max(0, (water || 0) / wg));

  const lerpColor = (a, b, t) => {
    const h = s => [parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16)];
    const hex = (r,g,bl) => `#${[r,g,bl].map(x => Math.round(Math.max(0,Math.min(255,x))).toString(16).padStart(2,'0')).join('')}`;
    const [ar,ag,ab] = h(a), [br,bg,bb] = h(b);
    return hex(ar+(br-ar)*t, ag+(bg-ag)*t, ab+(bb-ab)*t);
  };

  const leafColor = pct <= 0.3
    ? lerpColor('#6b4218', '#8a7a12', pct / 0.3)
    : pct <= 0.6
      ? lerpColor('#8a7a12', '#5a9a1e', (pct - 0.3) / 0.3)
      : lerpColor('#5a9a1e', '#52d010', (pct - 0.6) / 0.4);

  const stemColor = pct < 0.3 ? '#5c3a18' : pct < 0.6 ? '#4a6a14' : '#2a7c08';
  const droop = (1 - pct) * 32;
  const showFlower = pct >= 0.82 && isRestDay;
  const showDew = pct >= 0.60;
  const uid = 'ph';

  let statusText, statusColor;
  if (pct >= 0.85) { statusText = "¡Floreciendo! 🌿"; statusColor = C.lime; }
  else if (pct >= 0.6) { statusText = "Bien hidratada 💧"; statusColor = C.cyan; }
  else if (pct >= 0.3) { statusText = "Sedienta… 🥤"; statusColor = C.amber; }
  else { statusText = "¡Se marchita! 🥀"; statusColor = C.rose; }

  const ts = 'all 0.85s cubic-bezier(0.4,0,0.2,1)';

  // Leaf shape (medium)
  const leafM = "M 0 0 C 4 -5 17 -19 29 -13 C 35 -9 33 2 25 6 C 15 12 3 6 0 0 Z";
  const leafS = "M 0 0 C 3 -4 13 -15 21 -10 C 26 -7 24 1 18 5 C 11 9 2 5 0 0 Z";
  const leafMid = "M 0 0 C 7 -3 15 -3 21 5"; // vein for medium leaf
  const leafMidS = "M 0 0 C 6 -2 12 -2 18 5";

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6, width:'100%'}}>
      <svg viewBox="0 0 120 190" width={128} height={192} style={{overflow:'visible', display:'block'}}>
        <defs>
          <linearGradient id={`${uid}-body`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#7a3e1a"/>
            <stop offset="42%" stopColor="#a05028"/>
            <stop offset="100%" stopColor="#6a2e10"/>
          </linearGradient>
          <linearGradient id={`${uid}-rim`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#8a4820"/>
            <stop offset="50%" stopColor="#b86030"/>
            <stop offset="100%" stopColor="#7a3810"/>
          </linearGradient>
          <linearGradient id={`${uid}-soil`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2e1e12"/>
            <stop offset="100%" stopColor="#1a1008"/>
          </linearGradient>
          <linearGradient id={`${uid}-leaf`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={lerpColor(leafColor,'#ffffff',0.12)}/>
            <stop offset="100%" stopColor={lerpColor(leafColor,'#000000',0.08)}/>
          </linearGradient>
          <linearGradient id={`${uid}-water`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4ad6ff" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="#4ad6ff" stopOpacity="0.30"/>
          </linearGradient>
          <filter id={`${uid}-glow`}>
            <feGaussianBlur stdDeviation="1.2" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* ── Pot ── */}
        {/* Pot body */}
        <path d="M 31 162 Q 28 187 40 188 L 80 188 Q 92 187 89 162 Z"
          fill={`url(#${uid}-body)`}/>
        {/* Pot rim */}
        <rect x="26" y="154" width="68" height="11" rx="5.5" ry="5.5"
          fill={`url(#${uid}-rim)`}/>
        {/* Highlight stripe on rim */}
        <rect x="30" y="155" width="30" height="3" rx="1.5" fill="rgba(255,255,255,0.12)"/>
        {/* Soil */}
        <ellipse cx="60" cy="158" rx="29" ry="7" fill={`url(#${uid}-soil)`}/>
        {/* Soil pebbles */}
        <circle cx="48" cy="157" r="1.8" fill="#3c2810" opacity="0.7"/>
        <circle cx="64" cy="156" r="1.2" fill="#3c2810" opacity="0.7"/>
        <circle cx="73" cy="158" r="1.6" fill="#3c2810" opacity="0.7"/>
        {/* Water level gauge on pot side */}
        <rect x="84" y={188 - 26*pct} width="5" height={26*pct} rx="2.5"
          fill={`url(#${uid}-water)`} style={{transition:ts}}/>
        <rect x="84" y="162" width="5" height="26" rx="2.5" fill="none"
          stroke="rgba(74,214,255,0.3)" strokeWidth="0.8"/>

        {/* ── Main stem ── */}
        <path
          d={`M 60 157 C ${60+droop*0.15} 138 ${59+droop*0.25} 115 ${58+droop*0.15} 65`}
          stroke={stemColor} strokeWidth="3.8" fill="none" strokeLinecap="round"
          style={{transition:ts}}/>

        {/* ── Branch stems ── */}
        {/* Bottom pair */}
        <path d={`M ${59+droop*0.12} 137 C ${52-droop*0.3} 130 ${40-droop*0.5} 128 ${34-droop*0.45} 123`}
          stroke={stemColor} strokeWidth="2.2" fill="none" strokeLinecap="round" style={{transition:ts}}/>
        <path d={`M ${59+droop*0.12} 137 C ${66+droop*0.3} 130 ${78+droop*0.5} 128 ${84+droop*0.45} 123`}
          stroke={stemColor} strokeWidth="2.2" fill="none" strokeLinecap="round" style={{transition:ts}}/>
        {/* Middle pair */}
        <path d={`M ${58+droop*0.1} 110 C ${50-droop*0.35} 103 ${39-droop*0.55} 101 ${33-droop*0.5} 96`}
          stroke={stemColor} strokeWidth="2" fill="none" strokeLinecap="round" style={{transition:ts}}/>
        <path d={`M ${58+droop*0.1} 110 C ${66+droop*0.35} 103 ${77+droop*0.55} 101 ${83+droop*0.5} 96`}
          stroke={stemColor} strokeWidth="2" fill="none" strokeLinecap="round" style={{transition:ts}}/>
        {/* Top pair */}
        <path d={`M ${58+droop*0.05} 86 C ${51-droop*0.3} 79 ${42-droop*0.5} 77 ${37-droop*0.42} 72`}
          stroke={stemColor} strokeWidth="1.7" fill="none" strokeLinecap="round" style={{transition:ts}}/>
        <path d={`M ${58+droop*0.05} 86 C ${65+droop*0.3} 79 ${74+droop*0.5} 77 ${79+droop*0.42} 72`}
          stroke={stemColor} strokeWidth="1.7" fill="none" strokeLinecap="round" style={{transition:ts}}/>

        {/* ── Leaves ── */}
        {/* Bottom left */}
        <g transform={`translate(${34-droop*0.45}, 123)`} style={{transition:ts}}>
          <g transform={`rotate(${-18 - droop*0.65})`}>
            <path d={leafM} fill={`url(#${uid}-leaf)`}/>
            <path d={leafMid} stroke={stemColor} strokeWidth="0.9" fill="none" opacity="0.55"/>
          </g>
        </g>
        {/* Bottom right */}
        <g transform={`translate(${84+droop*0.45}, 123)`} style={{transition:ts}}>
          <g transform={`rotate(${197 + droop*0.65})`}>
            <path d={leafM} fill={`url(#${uid}-leaf)`}/>
            <path d={leafMid} stroke={stemColor} strokeWidth="0.9" fill="none" opacity="0.55"/>
          </g>
        </g>
        {/* Middle left */}
        <g transform={`translate(${33-droop*0.5}, 96)`} style={{transition:ts}}>
          <g transform={`rotate(${-22 - droop*0.75})`}>
            <path d={leafM} fill={`url(#${uid}-leaf)`}/>
            <path d={leafMid} stroke={stemColor} strokeWidth="0.9" fill="none" opacity="0.55"/>
          </g>
        </g>
        {/* Middle right */}
        <g transform={`translate(${83+droop*0.5}, 96)`} style={{transition:ts}}>
          <g transform={`rotate(${202 + droop*0.75})`}>
            <path d={leafM} fill={`url(#${uid}-leaf)`}/>
            <path d={leafMid} stroke={stemColor} strokeWidth="0.9" fill="none" opacity="0.55"/>
          </g>
        </g>
        {/* Top left */}
        <g transform={`translate(${37-droop*0.42}, 72)`} style={{transition:ts}}>
          <g transform={`rotate(${-26 - droop*0.85})`}>
            <path d={leafS} fill={`url(#${uid}-leaf)`}/>
            <path d={leafMidS} stroke={stemColor} strokeWidth="0.8" fill="none" opacity="0.55"/>
          </g>
        </g>
        {/* Top right */}
        <g transform={`translate(${79+droop*0.42}, 72)`} style={{transition:ts}}>
          <g transform={`rotate(${206 + droop*0.85})`}>
            <path d={leafS} fill={`url(#${uid}-leaf)`}/>
            <path d={leafMidS} stroke={stemColor} strokeWidth="0.8" fill="none" opacity="0.55"/>
          </g>
        </g>

        {/* ── Dew drops ── */}
        {showDew && (
          <g style={{transition:'opacity 0.7s'}} opacity="1">
            <ellipse cx={27-droop*0.4} cy={118} rx="2.8" ry="3.8"
              fill="#4ad6ff" opacity="0.6" filter={`url(#${uid}-glow)`}/>
            <ellipse cx={83+droop*0.45} cy={91} rx="2.2" ry="3.2"
              fill="#4ad6ff" opacity="0.5" filter={`url(#${uid}-glow)`}/>
            <ellipse cx={35-droop*0.3} cy={67} rx="2" ry="2.8"
              fill="#4ad6ff" opacity="0.45" filter={`url(#${uid}-glow)`}/>
          </g>
        )}

        {/* ── Apex bud or flower ── */}
        {showFlower ? (
          <g transform={`translate(${58+droop*0.05}, ${63-droop*0.4})`} style={{transition:ts}}>
            {[0,52,103,155,206,257,309].map((angle, i) => (
              <ellipse key={i} cx={0} cy={-7.5} rx="3.8" ry="6.5"
                fill={i % 2 === 0 ? '#f9e068' : '#ffd235'} opacity="0.92"
                transform={`rotate(${angle})`}/>
            ))}
            <circle cx={0} cy={0} r="5.5" fill="#f4a830"/>
            <circle cx={0} cy={0} r="3.2" fill="#e88010"/>
            <circle cx={-1} cy={-1} r="1" fill="#ffc040" opacity="0.7"/>
          </g>
        ) : (
          <g transform={`translate(${58+droop*0.05}, ${65-droop*0.4})`} style={{transition:ts}}>
            <ellipse cx={0} cy={-7} rx="4.5" ry="7"
              fill={pct > 0.35 ? lerpColor('#5a6a10','#38c008',Math.min(1,(pct-0.35)/0.65)) : '#4a3a18'}
              style={{transition:'fill 0.85s'}}/>
            <ellipse cx={0} cy={-7} rx="2" ry="3"
              fill="rgba(255,255,255,0.10)"/>
          </g>
        )}
      </svg>

      <div style={{
        fontSize: 13, fontWeight: 700, color: statusColor,
        textAlign: 'center', transition: 'color 0.7s', letterSpacing: '.01em'
      }}>
        {statusText}
      </div>
    </div>
  );
});

const DailyGreetingCard = React.memo(function DailyGreetingCard({
  todayKcal, exlog, splits, activeSplitKey, selectedDateStr, setView, sendCoachMessage, isRestDay
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const greetingIcon = hour < 12 ? "🌅" : hour < 19 ? "☀️" : "🌙";

  const hasTrainedToday = React.useMemo(() =>
    Object.values(exlog || {}).some(sets =>
      (sets || []).some(s => (s?.date || '').slice(0, 10) === selectedDateStr)
    ), [exlog, selectedDateStr]);

  const sendMealSuggestion = (meal) => {
    setView("coach");
    const msgs = {
      desayuno: `Dame 3 opciones de desayuno para ahora. Que sean variadas, altas en proteína y prácticas. Ajústalas a mis macros diarios.`,
      almuerzo: `Dame 3 opciones de almuerzo para ahora. Altas en proteína, que me dejen con energía para el resto del día. Ajusta a mis macros.`,
      merienda: `Dame 2-3 ideas de merienda/snack para ahora. Que sean rápidas y ayuden a llegar bien a la cena sin pasarme de calorías.`,
      cena: `Dame 3 opciones de cena para esta noche. Que sean livianas pero con buena proteína. Ajusta a lo que me queda de macros hoy.`,
    };
    setTimeout(() => sendCoachMessage?.(msgs[meal]), 200);
  };

  const contextButtons = [];
  if (hour >= 6 && hour < 11) {
    contextButtons.push({ icon: "🌞", label: "Desayuno", action: () => sendMealSuggestion("desayuno") });
  } else if (hour >= 11 && hour < 15) {
    contextButtons.push({ icon: "🍽️", label: "Almuerzo", action: () => sendMealSuggestion("almuerzo") });
  } else if (hour >= 15 && hour < 18) {
    contextButtons.push({ icon: "🫐", label: "Merienda", action: () => sendMealSuggestion("merienda") });
  } else if (hour >= 18 && hour < 22) {
    contextButtons.push({ icon: "🌆", label: "Cena", action: () => sendMealSuggestion("cena") });
  }

  if (!hasTrainedToday && !isRestDay) {
    contextButtons.push({ icon: "🏋️", label: "Pre-entreno", action: () => setView("entreno") });
  } else if (hasTrainedToday) {
    contextButtons.push({ icon: "💪", label: "Post-entreno", action: () => {
      setView("coach");
      setTimeout(() => sendCoachMessage?.("[AUTO] Acabo de terminar mi entrenamiento de hoy. Dame un análisis rápido de la sesión y qué comer en las próximas 2 horas para optimizar la recuperación."), 200);
    }});
  }

  // Botón adaptado según momento del día
  const isNight = hour >= 19 || hour < 5;
  const isMorning = hour >= 5 && hour < 12;
  const ctaLabel = isNight ? "Resumen del día" : isMorning ? "Plan para hoy" : "¿Cómo voy hoy?";
  const ctaIcon = isNight ? "🌙" : isMorning ? "📋" : "📊";

  const handleCTA = () => {
    setView("coach");
    const msg = isNight
      ? `[Resumen nocturno ${selectedDateStr}] Hazme un resumen de mi día completo: entrenamiento, nutrición, hidratación y qué mejorar mañana.`
      : isMorning
      ? `[Plan matutino ${selectedDateStr}] Dame un plan concreto para hoy: qué toca entrenar según mi split, cuántas calorías y proteína apuntar, y cuál es la prioridad del día.`
      : `[Seguimiento ${selectedDateStr}] ¿Cómo voy con mi plan de hoy? Analiza lo que ya registré y dame sugerencias para el resto del día.`;
    setTimeout(() => sendCoachMessage?.(msg), 200);
  };

  return (
    <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"20px 16px 14px", marginBottom:12}}>
      <div style={{fontSize:34, fontWeight:900, color:C.ink, marginBottom:14, letterSpacing:"-0.5px"}}>
        {greeting} <span style={{fontSize:28}}>{greetingIcon}</span>
      </div>
      {contextButtons.length > 0 && (
        <div style={{display:"flex", gap:8, marginBottom:10, flexWrap:"wrap"}}>
          {contextButtons.map((btn, i) => (
            <button key={i} onClick={btn.action} style={{
              flex:1, minWidth:120,
              background:C.panel2, border:`1px solid ${C.line}`,
              borderRadius:12, padding:"11px 10px",
              fontSize:13.5, fontWeight:700, color:C.ink,
              cursor:"pointer", display:"flex", alignItems:"center", gap:7, justifyContent:"center"
            }}>
              <span style={{fontSize:16}}>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={handleCTA} style={{
        width:"100%", background:C.panel2, border:`1px solid ${C.line}`,
        borderRadius:12, padding:"11px 16px",
        fontSize:13.5, fontWeight:700, color:C.ink,
        cursor:"pointer", display:"flex", alignItems:"center", gap:8, justifyContent:"center"
      }}>
        <Sparkles size={15} color={C.lime}/> {ctaIcon} {ctaLabel}
      </button>
    </div>
  );
});

function Hoy({
  target, totals, log, setLog, loaded, water, setWater, geminiKey, supplements, handleUpdateSupplements,
  activeSplitKey, suppsInventory, setSuppsInventory, selectedDateStr, setSelectedDateStr,
  proactiveMsg, aiNotifications, setAiNotifications, macroAdjustSuggestion, setMacroAdjustSuggestion, saveState, customPresets,
  weeklyInsight, smartGoals, challenges, updateChallengeProgress, upcomingEvent, experiments, setExperiments, splits,
  setView, setShowNutritionModal, setModalVals, addFoodInputText, setAddFoodInputText, customSuggestions,
  exlog, notes, foodlog, sendCoachMessage
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
  const readSuggestionImage = (file) => compressImageToDataUrl(file, 400, 0.72);

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

  // Memoized: both iterate exlog/notes/foodlog — avoid recomputing every render
  const isRestDay = React.useMemo(
    () => !Object.values(exlog || {}).some(sets =>
      (sets || []).some(s => (s?.date || '').slice(0, 10) === selectedDateStr)
    ),
    [exlog, selectedDateStr]
  );
  const readiness = React.useMemo(
    () => predictTodayReadiness(exlog, notes, water, foodlog, selectedDateStr),
    [exlog, notes, water, foodlog, selectedDateStr]
  );

  const weekKcal = React.useMemo(() => {
    return [...Array(7)].map((_,i) => {
      const d = new Date(); d.setDate(d.getDate() - (6-i));
      const dateStr = d.toISOString().slice(0,10);
      const entries = (foodlog || {})[dateStr] || [];
      return { date: dateStr, kcal: Math.round(entries.reduce((s,e) => s+(+e.kcal||0), 0)) };
    });
  }, [foodlog]);

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
      const b64 = await fileToBase64(file);
      const media = pickImageMedia(file);
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
    const det = log.map(e => `${e.resumen} (${Math.round(e.kcal)}kcal P:${Math.round(e.proteina)}g C:${Math.round(e.carbo)}g G:${Math.round(e.grasa)}g)`).join("; ") || "nada registrado";
    const pct = target.kcal > 0 ? Math.round((totals.kcal / target.kcal) * 100) : 0;
    const remP = Math.max(0, target.p - totals.p);
    const remC = Math.max(0, target.c - totals.c);
    const remF = Math.max(0, target.f - totals.f);
    const hydrPct = Math.round((water / 14) * 100);
    const activeSplit = (splits || DEFAULT_SPLITS).find(s => s.key === activeSplitKey) || DEFAULT_SPLITS[0];
    const sys = `Eres el coach nutricional y de fuerza de Bruno. Plan: ${target.kcal} kcal (${target.label}), objetivo P:${target.p}g C:${target.c}g G:${target.f}g. Split hoy: ${activeSplit?.name || "no definido"} (${activeSplit?.fuel || ""}). Responde con análisis honesto y 2-3 acciones concretas para el resto del día.`;
    const user = `RESUMEN DEL DÍA — ${formatSelectedDate(selectedDateStr)}:

Comidas: ${det}
Totales: ${Math.round(totals.kcal)} kcal (${pct}% del objetivo) | P:${Math.round(totals.p)}g | C:${Math.round(totals.c)}g | G:${Math.round(totals.f)}g
Restante: ${Math.round(target.kcal - totals.kcal)} kcal | P:${remP}g | C:${remC}g | G:${remF}g
Hidratación: ${(water * 0.25).toFixed(1)}L (${hydrPct}% del objetivo diario)

Analiza la adherencia real a los objetivos del día y da 2-3 sugerencias concretas para completar el día de forma óptima.`;
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

      {/* Saludo contextual del día */}
      <DailyGreetingCard
        todayKcal={totals?.kcal || 0}
        exlog={exlog}
        splits={splits}
        activeSplitKey={activeSplitKey}
        selectedDateStr={selectedDateStr}
        setView={setView}
        sendCoachMessage={sendCoachMessage}
        isRestDay={isRestDay}
      />

      {/* Planta de hidratación */}
      <div
        onClick={() => { if(water < waterGoal) setWater(water + 1); }}
        style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"16px 15px 8px", marginBottom:12, display:'flex', flexDirection:'column', alignItems:'center', gap:0, cursor: water < waterGoal ? "pointer" : "default"}}
      >
        <PlantaHidratacion water={water} waterGoal={waterGoal} isRestDay={isRestDay}/>
        <div style={{fontSize:10, color:C.muted, marginTop:4, letterSpacing:".04em"}}>
          {water < waterGoal ? "Toca para +💧" : "¡Hidratación completa! 🎉"}
        </div>
      </div>

      <div style={{display:"flex", alignItems:"center", gap:10, background:C.panel, border:`1.5px solid ${readiness.color}33`, borderRadius:14, padding:"10px 14px", marginBottom:12, animation:"pop 0.3s ease"}}>
        <div style={{width:44, height:44, borderRadius:"50%", background:`${readiness.color}22`, border:`2px solid ${readiness.color}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
          {readiness.mode === "recovery"
            ? <span style={{fontSize:22, lineHeight:1}}>✓</span>
            : <span style={{fontSize:16, fontWeight:900, color:readiness.color}}>{readiness.score}</span>
          }
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:10, fontWeight:800, color:readiness.color, textTransform:"uppercase", letterSpacing:".07em"}}>
            {readiness.mode === "recovery" ? "Recuperación hoy" : "Preparación hoy"}
          </div>
          <div style={{fontSize:13, fontWeight:700, color:C.ink}}>{readiness.label}</div>
          {readiness.factors.length > 0 && <div style={{fontSize:10.5, color:C.muted, marginTop:2, lineHeight:1.45}}>{readiness.factors.join(" · ")}</div>}
        </div>
      </div>

      {weekKcal.some(d => d.kcal > 0) && (() => {
        const maxK = Math.max(...weekKcal.map(d=>d.kcal), target?.kcal||2200);
        const tgt = target?.kcal || 2200;
        const DAYS = ['L','M','X','J','V','S','D'];
        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"12px 14px", marginBottom:12}}>
            <div style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8}}>Calorías · 7 días</div>
            <div style={{display:"flex", alignItems:"flex-end", gap:4, height:44}}>
              {weekKcal.map((d,i) => {
                const h = d.kcal > 0 ? Math.max(4, Math.round((d.kcal/maxK)*44)) : 3;
                const isToday = d.date === selectedDateStr;
                const aboveTarget = d.kcal > tgt * 1.05;
                const col = d.kcal === 0 ? C.line : aboveTarget ? C.amber : isToday ? C.lime : C.cyan;
                return (
                  <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2}}>
                    <div style={{width:"100%", height:h, background:col, borderRadius:3, transition:"height .3s"}}/>
                    <div style={{fontSize:8, color: isToday ? C.lime : C.muted, fontWeight: isToday ? 800 : 500}}>{DAYS[(new Date(d.date+'T12:00:00').getDay()+6)%7]}</div>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:9.5, color:C.muted, marginTop:4}}>Objetivo: {tgt} kcal · Hoy: {weekKcal[6]?.kcal || 0} kcal</div>
          </div>
        );
      })()}

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
          <MarkdownText text={weeklyInsight.text} style={{color:C.ink}}/>
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

      {/* Tarjetas de macros — anillos SVG */}
      {(() => {
        const PI = Math.PI;
        const macros = [
          { r: 62, sw: 12, color: C.lime,  label: "Kcal",     val: Math.round(totals.kcal), max: target.kcal, unit: "kcal" },
          { r: 46, sw: 10, color: C.cyan,  label: "Proteína", val: Math.round(totals.p),    max: target.p,    unit: "g" },
          { r: 30, sw: 10, color: C.amber, label: "Carbos",   val: Math.round(totals.c),    max: target.c,    unit: "g" },
          { r: 15, sw: 8,  color: C.rose,  label: "Grasas",   val: Math.round(totals.f),    max: target.f,    unit: "g" },
        ];
        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:14, display:"flex", gap:16, alignItems:"center"}}>
            <svg width={150} height={150} viewBox="0 0 150 150">
              {macros.map(m => {
                const circ = 2 * PI * m.r;
                const pct = Math.min(1, m.max > 0 ? m.val / m.max : 0);
                const offset = circ - pct * circ;
                return (
                  <g key={m.label} transform="rotate(-90 75 75)">
                    <circle cx={75} cy={75} r={m.r} fill="none" stroke={m.color + "22"} strokeWidth={m.sw}/>
                    <circle cx={75} cy={75} r={m.r} fill="none" stroke={m.color} strokeWidth={m.sw}
                      strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                      style={{transition:"stroke-dashoffset 0.6s ease"}}/>
                  </g>
                );
              })}
              <text x={75} y={71} textAnchor="middle" style={{fontSize:15, fontWeight:900, fill:C.ink}}>{Math.round(totals.kcal)}</text>
              <text x={75} y={85} textAnchor="middle" style={{fontSize:10, fill:C.muted}}>/ {target.kcal} kcal</text>
            </svg>
            <div style={{flex:1, display:"flex", flexDirection:"column", gap:7}}>
              {macros.map(m => {
                const pct = Math.min(1, m.max > 0 ? m.val / m.max : 0);
                return (
                  <div key={m.label} style={{display:"flex", flexDirection:"column", gap:2}}>
                    <div style={{display:"flex", justifyContent:"space-between", fontSize:11}}>
                      <span style={{color:m.color, fontWeight:700}}>{m.label}</span>
                      <span style={{color:C.muted}}>{m.val}<span style={{color:C.muted, fontWeight:400}}>/{m.max}{m.unit}</span></span>
                    </div>
                    <div style={{height:5, background:C.panel2, borderRadius:4, overflow:"hidden"}}>
                      <div style={{height:"100%", width:(pct*100)+"%", background:m.color, borderRadius:4, transition:"width 0.5s ease"}}/>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => { setModalVals({ kcal: target.kcal, p: target.p, c: target.c, f: target.f }); setShowNutritionModal(true); }}
                style={{marginTop:4, padding:"5px 10px", background:"none", border:`1px solid ${C.line}`, borderRadius:8, fontSize:11, color:C.muted, cursor:"pointer", fontWeight:600, alignSelf:"flex-start"}}
              >Ajustar objetivos</button>
            </div>
          </div>
        );
      })()}

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

      {/* Tarjeta de Hidratación — contador de vasos */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"12px 15px", marginBottom:14}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
          <span style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700}}>
            <GlassWater size={15} color={C.cyan}/>Hidratación
          </span>
          <span style={{fontSize:13, color:C.muted}}>
            <b style={{color:C.ink, fontSize:14}}>{liters}</b> / {(waterGoal * 0.25).toFixed(1)} L
          </span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <button onClick={() => setWater(Math.max(0, water - 1))} style={{width:38, height:38, borderRadius:10, border:`1px solid ${C.line}`, background:C.panel2, color:C.ink, cursor:"pointer", display:"grid", placeItems:"center"}}><Minus size={16}/></button>
          <div style={{flex:1, display:"flex", gap:2, overflow:"hidden"}}>
            {Array.from({length: waterGoal}).map((_,i) => (
              <div key={i} style={{
                flex:1, height:21, borderRadius:4,
                background: i < water ? C.cyan : C.panel2,
                border: `1px solid ${i < water ? C.cyan : C.line}`,
                transition: "all .2s"
              }}/>
            ))}
          </div>
          <button onClick={() => setWater(water + 1)} style={{width:38, height:38, borderRadius:10, border:"none", background:C.cyan, color:"#04212b", cursor:"pointer", display:"grid", placeItems:"center"}}><Plus size={16}/></button>
        </div>
      </div>

      {/* Timing de comidas */}
      {log.length > 0 && (() => {
        const meals = [...log].sort((a, b) => (a.t || 0) - (b.t || 0));
        const lastMeal = meals[meals.length - 1];
        const lastT = lastMeal?.t || 0;
        const nextIdeal = lastT ? new Date(lastT + 2.5 * 3600000) : null;
        const now = Date.now();
        const nextStr = nextIdeal ? nextIdeal.toLocaleTimeString("es", { hour:"2-digit", minute:"2-digit" }) : null;
        const isInPast = nextIdeal && nextIdeal.getTime() < now;
        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"12px 15px", marginBottom:14}}>
            <div style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", marginBottom:8}}>Timing de Comidas</div>
            <div style={{display:"flex", flexDirection:"column", gap:5}}>
              {meals.slice(-4).map((m) => (
                <div key={m.id} style={{display:"flex", alignItems:"center", gap:8, fontSize:12}}>
                  <div style={{width:6, height:6, borderRadius:"50%", background:C.lime, flexShrink:0}}/>
                  <span style={{color:C.muted, fontVariantNumeric:"tabular-nums", flexShrink:0, minWidth:38}}>
                    {m.t ? new Date(m.t).toLocaleTimeString("es", { hour:"2-digit", minute:"2-digit" }) : "—"}
                  </span>
                  <span style={{color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1}}>{m.resumen}</span>
                  {m.proteina >= 20 ? (
                    <span style={{background:`${C.lime}22`, color:C.lime, fontSize:9.5, fontWeight:800, borderRadius:6, padding:"1px 5px", flexShrink:0}}>💪 {m.proteina}g P</span>
                  ) : m.proteina > 0 ? (
                    <span style={{color:C.muted, fontSize:9.5, flexShrink:0}}>{m.proteina}g P</span>
                  ) : null}
                  <span style={{color:C.muted, fontSize:10.5, flexShrink:0}}>{Math.round(m.kcal)} kcal</span>
                </div>
              ))}
            </div>
            {nextStr && (
              <div style={{marginTop:8, paddingTop:8, borderTop:`1px solid ${C.line}`, display:"flex", alignItems:"center", gap:6, fontSize:12}}>
                <Clock size={13} color={isInPast ? C.amber : C.cyan}/>
                <span style={{color: isInPast ? C.amber : C.cyan, fontWeight:700}}>
                  {isInPast ? "Ya es hora de comer" : `Próxima comida ideal: ~${nextStr}`}
                </span>
              </div>
            )}
          </div>
        );
      })()}

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

      {/* Botones de IA contextuales según hora del día */}
      {(() => {
        const hour = new Date().getHours();
        const greeting = hour >= 5 && hour < 12 ? "Buenos días 🌅" : hour >= 12 && hour < 18 ? "Buenas tardes ☀️" : "Buenas noches 🌙";
        let contextChips;
        if (hour >= 5 && hour < 10) {
          contextChips = [
            { label:"☀️ Desayuno", action: () => whatNow("Desayuno") },
            { label:"🏃 Pre-entreno", action: () => whatNow("Pre-entreno") },
          ];
        } else if (hour >= 10 && hour < 14) {
          contextChips = [
            { label:"🥗 Almuerzo", action: () => whatNow("Almuerzo") },
            { label:"🍎 Snack mañana", action: () => whatNow("Snack de media mañana") },
          ];
        } else if (hour >= 14 && hour < 17) {
          contextChips = [
            { label:"⚡ Merienda", action: () => whatNow("Merienda") },
            { label:"🏋️ Post-entreno", action: () => whatNow("Post-entreno") },
          ];
        } else if (hour >= 17 && hour < 22) {
          contextChips = [
            { label:"🌙 Sugerir cena", action: suggestDinner },
            { label:"📊 Resumen del día", action: daySummary },
          ];
        } else {
          contextChips = [
            { label:"📊 Resumen del día", action: daySummary },
            { label:"😴 Prep. nocturna", action: () => run("Preparación nocturna", "Eres el coach de Bruno. Da una recomendación breve de rutina de sueño y recuperación.", "Dame consejos rápidos para optimizar mi recuperación esta noche según mi entreno y nutrición de hoy.") },
          ];
        }
        return (
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11.5, color:C.muted, marginBottom:6, textAlign:"center"}}>{greeting}</div>
            <div style={{display:"flex", gap:7, marginBottom:7}}>
              {contextChips.map(c => (
                <button key={c.label} onClick={c.action} style={chip(false)}>{c.label}</button>
              ))}
            </div>
          </div>
        );
      })()}
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
  chat, setChat, target, totals, sendCoachMessage, chatBusy, sendDailyGreetingIfNeeded,
  coachPersonality, setCoachPersonality, metricslog, foodlog, exlog
}){

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

  const [showContext, setShowContext] = useState(false);

  const contextSummary = React.useMemo(() => {
    const nutritionDays = Object.keys(foodlog || {}).filter(d => (foodlog[d]||[]).length > 0).length;
    const workoutSessions = Object.keys(exlog || {}).filter(d => (exlog[d]||[]).length > 0).length;
    const latestMetrics = Object.entries(metricslog || {}).sort((a,b) => b[0] < a[0] ? -1 : (b[0] > a[0] ? 1 : 0))[0];
    const latestWeight = latestMetrics ? latestMetrics[1]?.weight : null;
    return { nutritionDays, workoutSessions, latestWeight };
  }, [foodlog, exlog, metricslog]);

  const PERSONALITIES = [
    { key:"técnico", label:"⚙️ Técnico", desc:"Análisis y datos" },
    { key:"motivacional", label:"🔥 Motivador", desc:"Energía y logros" },
    { key:"nutricionista", label:"🥗 Nutrición", desc:"Foco en comida" },
    { key:"psicólogo", label:"🧠 Psicólogo", desc:"Mente y hábitos" },
  ];

  return (
    <div className="pop chat-window">

      {/* Cabecera del Chat con el Coach */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${C.line}`}}>
        <div className="disp" style={{fontSize:22, color:C.lime}}>CHAT CON EL COACH</div>
        <button onClick={() => setShowContext(v => !v)} style={{background:"none", border:`1px solid ${C.line}`, borderRadius:8, padding:"4px 8px", fontSize:11, color:C.muted, cursor:"pointer"}}>
          {showContext ? "▲" : "▼"} Contexto
        </button>
      </div>

      {/* Modos de personalidad */}
      <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:8, scrollbarWidth:"none"}}>
        {PERSONALITIES.map(p => (
          <button key={p.key} onClick={() => setCoachPersonality(p.key)} style={{
            flexShrink:0, padding:"5px 10px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
            border:`1px solid ${coachPersonality===p.key ? C.lime : C.line}`,
            background: coachPersonality===p.key ? `${C.lime}22` : "transparent",
            color: coachPersonality===p.key ? C.lime : C.muted
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Barra de contexto colapsable */}
      {showContext && (
        <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:10, padding:"8px 12px", marginBottom:8, fontSize:11, color:C.muted, animation:"pop 0.2s ease"}}>
          <span style={{fontWeight:700, color:C.ink}}>Basado en: </span>
          {contextSummary.nutritionDays} días de nutrición · {contextSummary.workoutSessions} sesiones de entreno
          {contextSummary.latestWeight ? ` · peso ${contextSummary.latestWeight} kg` : ""}
        </div>
      )}

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
            {m.role === "user" ? m.content : <MarkdownText text={m.content}/>}
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
          onClick={() => sendCoachMessage('Analiza TODOS mis datos actuales en conjunto: composición corporal Fitdays (peso, grasa, SMM, Score), análisis de fotos de progreso, historial de entrenamiento y nutrición de las últimas semanas. Con base en todo esto: 1) ¿Son óptimos mis objetivos actuales de calorías y macros? Si no, actualízalos con UPDATE_TARGET. 2) ¿Mi split es el adecuado para mi objetivo actual? Si no, ajústalo con UPDATE_SPLITS. 3) Dame 3 acciones concretas prioritarias para las próximas 4 semanas.')}
          disabled={chatBusy}
          style={{fontSize:11, padding:"5px 10px", borderRadius:8, border:`1px solid #cdff4a`, background:"rgba(205,255,74,0.08)", color:"#cdff4a", cursor:"pointer", opacity: chatBusy ? 0.5 : 1, fontWeight:800}}
        >
          ✦ Análisis Global + Actualizar Objetivos
        </button>
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
  exportDataJSON,
  importDataJSON,
  sbAutoSyncStatus,
  changePreset,
  presetKey,
  customPresets,
  bodyComp
}) {
  const [showKeyField, setShowKeyField] = useState(false);
  const [geminiNativeModel, setGeminiNativeModel] = useState("gemini-2.5-flash");
  const [keyStatuses, setKeyStatuses] = useState({});
  const [availableGeminiModels, setAvailableGeminiModels] = useState([]);
  useEffect(() => {
    loadKey("gemini_native_model", "gemini-2.5-flash").then(m => setGeminiNativeModel(m || "gemini-2.5-flash"));
    loadKey("gemini_available_models", []).then(ms => { if (Array.isArray(ms) && ms.length) setAvailableGeminiModels(ms); });
  }, []);
  const saveGeminiNativeModel = (m) => { setGeminiNativeModel(m); saveKey("gemini_native_model", m); };

  const testSingleKey = async (key) => {
    const id = key.slice(0, 12);
    setKeyStatuses(prev => ({ ...prev, [id]: "testing" }));
    try {
      let ok = false;
      if (key.startsWith("sk-or-")) {
        // OpenRouter: verificar con models list
        const res = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { "Authorization": `Bearer ${key}` }
        });
        ok = res.ok;
      } else {
        // Gemini: listar modelos — no gasta cuota de generación
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`);
        ok = res.ok;
      }
      setKeyStatuses(prev => ({ ...prev, [id]: ok ? "ok" : "error" }));
    } catch {
      setKeyStatuses(prev => ({ ...prev, [id]: "error" }));
    }
  };

  const testAllKeys = async (keys) => {
    await Promise.all(keys.map(k => testSingleKey(k)));
  };
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>Claves activas ({keysList.length}):</div>
                  <button onClick={() => testAllKeys(keysList)} style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-cyan)", background: "none", border: "1px solid var(--accent-cyan)", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                    Probar todas
                  </button>
                </div>
                {keysList.map((k, idx) => {
                  const id = k.slice(0, 12);
                  const st = keyStatuses[id];
                  const dotColor = st === "ok" ? "#7fff6a" : st === "error" ? "var(--accent-rose)" : st === "testing" ? "var(--accent-amber)" : "var(--line-color)";
                  const dotLabel = st === "ok" ? "OK" : st === "error" ? "Error" : st === "testing" ? "..." : "—";
                  return (
                    <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, background: "var(--panel-bg)", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: `1px solid ${st === "ok" ? "#7fff6a44" : st === "error" ? "rgba(255,107,138,0.3)" : "var(--line-color)"}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0, boxShadow: st === "ok" ? "0 0 6px #7fff6a" : st === "error" ? "0 0 6px var(--accent-rose)" : "none", animation: st === "testing" ? "pulse 1s infinite" : "none" }} />
                        <span style={{ fontFamily: "monospace", color: "var(--text-ink)" }}>
                          {k.startsWith("sk-or-") ? "OpenRouter · " : "Gemini · "}{k.length > 15 ? `${k.slice(0, 6)}...${k.slice(-4)}` : "Clave"}
                        </span>
                        <span style={{ fontSize: 10, color: dotColor, fontWeight: 700 }}>{dotLabel}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => testSingleKey(k)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>Probar</button>
                        <button onClick={() => handleRemoveKey(idx)} style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>✕</button>
                      </div>
                    </div>
                  );
                })}
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
            {/* Selector de modelo Gemini nativo */}
            {keysList.some(k => !k.startsWith("sk-or-")) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--panel-bg-sec)", padding: 10, borderRadius: "var(--radius-md)", border: "1px solid var(--line-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: ".05em" }}>Modelo Gemini:</div>
                  <button onClick={async () => {
                    const firstKey = keysList.find(k => !k.startsWith("sk-or-"));
                    if (!firstKey) return;
                    try {
                      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${firstKey}&pageSize=50`);
                      const data = await res.json();
                      const names = (data.models || [])
                        .map(m => m.name?.replace("models/", ""))
                        .filter(n => n && /flash|pro/i.test(n))
                        .sort();
                      if (names.length) { setAvailableGeminiModels(names); saveKey("gemini_available_models", names); }
                    } catch {}
                  }} style={{ fontSize: 10, color: "var(--accent-cyan)", background: "none", border: "1px solid var(--accent-cyan)", borderRadius: 6, padding: "2px 7px", cursor: "pointer", fontWeight: 700 }}>
                    Cargar modelos
                  </button>
                </div>
                <select
                  value={geminiNativeModel}
                  onChange={e => saveGeminiNativeModel(e.target.value)}
                  style={{ background: "var(--panel-bg)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-sm)", padding: "8px 10px", fontSize: 12, color: "var(--text-ink)", width: "100%" }}
                >
                  {(() => {
                    const opts = availableGeminiModels.length > 0 ? availableGeminiModels : ["gemini-2.5-flash","gemini-2.5-flash-lite","gemini-2.5-pro","gemini-2.0-flash"];
                    const all = opts.includes(geminiNativeModel) ? opts : [geminiNativeModel, ...opts];
                    return all.map(m => <option key={m} value={m}>{m}</option>);
                  })()}
                </select>
                <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Tocá <b>Cargar modelos</b> para ver los disponibles con tu clave.
                </div>
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
            {sbAutoSyncStatus === "saving" && (
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Guardando en la nube…</div>
            )}
            {sbAutoSyncStatus === "saved" && (
              <div style={{ fontSize: 10, color: "var(--accent-lime)", marginTop: 2 }}>Guardado en la nube ✓</div>
            )}
          </div>
        )}
      </div>

      {/* Exportar / Importar datos */}
      <div style={{ background: "var(--panel-bg-sec)", border: "1px solid var(--line-color)", borderRadius: "var(--radius-md)", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-ink)", letterSpacing: "0.05em" }}>COPIA DE SEGURIDAD</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
          Exporta todos tus datos a un archivo JSON para guardarlos o pasarlos a otro dispositivo.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={exportDataJSON}
            className="btn-active-scale"
            style={{ flex: 1, padding: "10px", background: "var(--accent-lime)", color: "#000", fontWeight: 800, borderRadius: "var(--radius-md)", fontSize: 11.5, cursor: "pointer" }}
          >
            Exportar JSON
          </button>
          <label
            className="btn-active-scale"
            style={{ flex: 1, padding: "10px", background: "var(--panel-bg)", border: "1px solid var(--line-color)", color: "var(--text-ink)", fontWeight: 700, borderRadius: "var(--radius-md)", fontSize: 11.5, cursor: "pointer", textAlign: "center" }}
          >
            Importar JSON
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={e => { if (e.target.files[0]) importDataJSON(e.target.files[0]); }}
            />
          </label>
        </div>
      </div>

    </div>
  );
}

/* Datos anatómicos SVG (react-native-body-highlighter, MIT) */
const BODY_OUTLINE = {
  front: "M 309.48 168.91 Q 305.84 164.32 303.32 169.76 C 298.49 180.21 308.31 200.03 314.51 208.74 C 316.34 211.31 318.01 208.95 318.58 207.26 A 0.67 0.66 57.6 0 1 319.87 207.55 C 319.06 215.09 318.68 227.40 324.34 232.47 C 327.22 235.05 326.97 235.88 326.92 239.51 Q 326.68 255.16 323.97 266.82 Q 323.85 267.35 323.48 267.73 Q 308.61 282.73 290.26 293.23 C 278.34 300.05 267.53 299.26 253.00 298.03 Q 237.49 296.72 224.74 305.21 C 208.71 315.86 190.95 335.73 189.24 355.50 Q 186.95 381.81 190.53 412.66 C 190.79 414.92 190.69 417.49 191.02 419.92 Q 191.09 420.43 190.88 420.90 C 187.89 427.65 183.99 434.89 181.93 441.29 C 177.25 455.76 176.31 470.23 176.20 486.02 Q 176.20 486.51 175.90 486.90 C 159.84 507.69 147.56 529.29 141.49 554.95 Q 140.10 560.80 138.16 574.66 Q 131.28 623.74 118.11 671.52 C 115.99 679.21 112.98 690.29 104.08 693.63 Q 90.70 698.65 79.29 707.27 C 73.17 711.89 69.48 719.95 66.12 726.62 C 62.44 733.91 47.57 737.30 49.20 746.00 C 49.75 748.96 51.89 750.13 54.75 750.02 Q 67.27 749.50 74.18 740.00 C 76.03 737.45 77.93 736.62 80.54 735.24 Q 81.02 734.98 81.24 735.48 Q 84.59 743.00 80.47 750.73 Q 71.41 767.75 62.21 784.70 Q 60.53 787.81 59.49 791.20 C 57.52 797.69 65.78 800.84 69.45 795.20 C 76.80 783.92 82.72 773.30 92.55 762.52 Q 93.00 762.04 92.84 762.67 Q 87.89 783.24 79.07 802.44 C 77.36 806.17 75.64 812.30 79.19 815.18 C 89.50 823.53 107.08 773.44 109.24 767.88 A 0.37 0.36 -30.3 0 1 109.94 768.06 C 108.51 777.44 106.43 787.14 105.28 796.13 C 104.34 803.43 103.67 808.49 104.41 814.32 C 105.40 822.00 112.74 817.15 114.09 812.77 C 118.56 798.32 120.41 781.74 125.18 766.21 A 0.55 0.55 0.0 0 1 125.93 765.87 C 131.64 768.40 126.65 796.54 133.38 803.49 A 1.35 1.35 0.0 0 0 134.16 803.90 C 138.40 804.59 139.71 797.34 140.15 793.73 Q 141.74 780.80 142.58 767.76 Q 142.86 763.46 144.07 759.34 Q 150.39 737.64 154.77 715.46 Q 156.15 708.50 155.48 697.76 Q 154.48 681.63 161.99 665.46 Q 180.58 625.46 201.25 586.52 C 213.64 563.18 218.66 541.14 220.65 514.18 C 221.24 506.18 223.22 502.59 228.42 495.84 C 237.76 483.72 242.73 464.92 246.12 450.19 Q 246.24 449.64 246.75 449.42 L 250.30 447.82 A 0.49 0.49 0.0 0 1 250.99 448.23 Q 252.78 470.14 257.44 487.01 C 259.04 492.80 264.20 498.21 265.32 505.20 C 265.91 508.82 266.99 512.44 267.11 516.00 Q 267.57 529.33 266.95 540.50 C 265.58 565.32 263.85 592.20 259.98 619.13 C 258.39 630.19 253.14 640.55 250.52 651.43 Q 245.19 673.62 242.32 696.24 C 239.63 717.56 236.59 740.02 236.04 757.75 Q 234.98 791.48 237.98 842.55 Q 239.43 867.18 244.64 891.26 Q 247.76 905.70 255.88 917.90 Q 256.15 918.31 256.08 918.79 C 254.89 926.25 257.03 933.47 255.60 940.95 Q 252.28 958.32 251.77 975.98 C 251.55 983.43 252.85 991.28 253.67 998.93 Q 253.99 1001.95 253.29 1005.00 C 239.19 1067.03 246.93 1130.64 261.77 1190.07 C 266.01 1207.06 266.47 1222.37 264.71 1240.03 C 263.85 1248.62 262.10 1260.41 264.24 1268.75 C 266.05 1275.80 267.54 1287.46 261.78 1293.28 C 256.71 1298.39 242.40 1310.55 240.72 1316.98 C 239.19 1322.86 235.04 1332.26 242.29 1333.71 Q 242.69 1333.79 243.08 1333.66 L 244.23 1333.29 Q 245.05 1333.02 244.81 1333.85 C 242.95 1340.16 249.20 1340.52 253.77 1340.86 C 256.46 1341.06 257.37 1343.60 259.30 1344.71 Q 263.13 1346.91 267.14 1344.43 Q 267.59 1344.15 267.92 1344.56 Q 271.17 1348.61 276.21 1349.09 C 278.90 1349.35 281.27 1347.36 283.62 1346.09 Q 284.10 1345.82 284.44 1346.26 Q 288.33 1351.29 294.72 1351.38 C 295.77 1351.39 297.65 1351.62 298.54 1350.79 Q 301.20 1348.30 306.57 1341.58 C 312.04 1334.74 311.14 1328.85 310.29 1320.16 C 309.43 1311.33 311.17 1303.41 313.76 1295.20 C 315.84 1288.56 313.35 1280.06 314.07 1273.15 C 314.57 1268.39 315.80 1263.68 315.01 1259.02 C 314.06 1253.42 311.98 1247.60 311.31 1242.66 Q 309.57 1229.80 309.57 1219.75 Q 309.57 1192.29 313.54 1161.94 C 315.34 1148.21 319.24 1136.08 324.12 1123.46 Q 325.66 1119.48 326.10 1115.72 C 330.14 1081.34 326.20 1048.44 320.65 1013.26 C 319.84 1008.17 319.39 1002.54 321.72 997.72 C 328.03 984.68 329.28 969.38 329.07 954.15 C 329.01 949.50 327.95 944.55 327.58 939.63 C 327.13 933.64 329.28 925.78 330.82 919.80 C 334.72 904.69 337.76 888.96 341.43 874.30 Q 348.95 844.25 355.42 813.95 C 358.50 799.49 357.70 784.78 357.75 768.06 Q 357.78 756.80 356.36 748.81 Q 356.26 748.24 356.77 748.50 L 363.71 751.99 A 1.07 1.07 0.0 0 0 364.67 751.99 L 371.53 748.56 Q 372.07 748.29 371.98 748.89 C 369.47 765.94 370.28 783.04 371.30 800.17 Q 371.86 809.54 372.73 813.51 C 378.37 839.12 384.90 864.49 390.59 890.08 Q 394.83 909.20 399.51 928.22 C 400.58 932.58 401.13 937.66 400.58 941.57 C 398.11 958.92 398.53 982.22 407.11 998.54 C 408.41 1001.01 408.74 1005.35 408.31 1008.09 C 402.82 1043.75 398.07 1079.22 402.19 1115.33 Q 402.65 1119.34 404.21 1123.44 C 410.53 1140.06 413.55 1150.61 415.25 1164.75 C 418.31 1190.26 420.52 1218.43 416.79 1244.33 C 415.56 1252.86 411.78 1258.57 413.63 1267.80 Q 415.33 1276.21 414.16 1284.74 C 413.11 1292.39 415.65 1298.68 417.31 1305.89 C 419.02 1313.32 418.11 1320.99 417.47 1328.50 C 416.71 1337.55 423.74 1344.86 430.17 1350.90 A 1.48 1.46 -18.7 0 0 430.95 1351.28 Q 439.25 1352.41 444.03 1346.06 Q 444.40 1345.57 444.87 1345.96 Q 453.39 1352.89 460.49 1344.48 Q 460.81 1344.11 461.23 1344.37 C 469.09 1349.37 469.89 1340.80 474.98 1340.71 C 479.52 1340.64 485.21 1340.09 483.54 1333.77 Q 483.38 1333.17 483.97 1333.35 C 488.25 1334.67 490.66 1331.94 490.06 1327.75 C 489.09 1321.04 487.50 1314.41 483.44 1310.30 Q 474.77 1301.53 466.05 1292.83 C 461.19 1287.98 462.25 1276.40 463.74 1270.47 C 466.27 1260.35 464.49 1248.06 463.03 1236.25 C 461.04 1220.05 463.22 1204.28 467.41 1187.04 C 481.60 1128.60 488.89 1065.20 475.23 1006.07 C 473.92 1000.37 475.00 995.00 475.76 989.36 C 477.88 973.68 475.72 958.50 473.08 942.76 C 471.70 934.55 473.60 926.56 472.20 918.79 Q 472.11 918.30 472.39 917.89 C 483.07 902.63 486.53 880.99 488.49 863.25 C 492.12 830.38 492.47 797.34 492.26 764.31 C 492.11 741.56 488.80 719.07 486.12 696.53 C 484.30 681.19 480.76 664.32 477.47 649.99 C 474.89 638.73 469.69 628.87 468.04 617.25 C 465.37 598.45 464.19 580.92 462.40 556.31 Q 460.86 535.06 461.01 522.74 Q 461.13 512.05 463.22 504.00 C 464.54 498.90 468.30 493.91 469.91 489.46 C 474.50 476.74 476.10 461.71 477.56 448.28 Q 477.62 447.74 478.13 447.94 L 481.73 449.35 A 0.77 0.77 0.0 0 1 482.19 449.89 Q 486.03 466.84 492.52 482.96 C 494.16 487.04 496.63 491.75 500.12 495.79 C 505.75 502.32 507.17 507.95 508.00 517.24 C 509.72 536.47 512.15 552.06 518.89 569.24 Q 521.60 576.16 527.50 587.28 Q 543.57 617.60 558.56 648.47 C 566.04 663.89 571.90 675.54 572.85 690.59 Q 572.98 692.57 572.55 700.88 Q 572.12 709.31 573.99 718.25 Q 577.87 736.78 582.37 752.38 C 585.15 761.98 586.32 769.32 586.71 778.53 C 586.92 783.46 587.58 803.53 593.41 804.06 C 599.41 804.61 599.71 774.61 600.39 768.08 A 1.12 1.12 0.0 0 1 600.80 767.33 Q 601.30 766.93 601.62 766.30 A 1.39 1.00 59.0 0 1 603.70 767.19 C 607.27 782.50 609.43 797.55 614.25 812.25 C 615.52 816.12 618.33 820.08 622.81 817.38 A 1.18 1.17 -8.4 0 0 623.35 816.66 Q 624.98 810.32 624.13 803.72 Q 621.83 785.89 618.23 768.64 A 0.53 0.53 0.0 0 1 619.24 768.34 C 622.72 777.06 636.06 814.20 645.24 816.03 C 650.64 817.10 652.13 811.12 650.95 807.31 C 648.59 799.74 644.42 791.59 642.09 784.69 Q 638.29 773.46 635.22 761.98 A 0.15 0.14 -73.3 0 1 635.47 761.84 Q 640.35 767.61 644.90 773.66 C 649.45 779.70 653.60 787.18 658.03 793.93 Q 660.09 797.07 661.70 797.82 C 665.53 799.62 670.61 795.77 669.00 791.28 C 666.63 784.66 661.63 776.66 659.33 772.19 Q 654.22 762.29 648.82 752.53 C 645.43 746.40 644.71 741.93 646.89 735.59 Q 647.08 735.05 647.60 735.27 C 650.55 736.50 652.37 737.45 654.44 740.27 Q 661.27 749.61 673.53 749.92 C 681.25 750.12 680.47 740.89 676.20 738.28 C 671.33 735.31 664.61 731.14 661.97 725.94 C 657.98 718.11 654.62 711.26 649.21 707.28 Q 637.40 698.62 623.76 693.40 C 619.45 691.75 615.12 686.26 613.76 682.47 Q 608.42 667.65 602.70 641.81 Q 594.90 606.62 590.85 578.90 Q 588.46 562.58 587.74 559.15 C 582.02 531.75 569.74 509.81 552.98 487.61 C 551.81 486.06 551.91 485.12 551.97 483.26 Q 552.48 466.57 548.70 449.61 C 546.27 438.71 541.82 430.32 537.44 420.82 Q 537.22 420.36 537.28 419.85 C 539.40 398.94 540.83 377.68 539.05 356.70 C 537.31 336.13 521.34 317.28 504.86 306.23 C 494.75 299.45 485.77 296.97 473.93 298.16 Q 464.41 299.12 453.63 298.41 C 438.05 297.39 418.32 280.58 407.40 270.35 C 405.82 268.87 404.57 267.56 404.10 265.32 Q 401.24 251.68 401.26 237.76 Q 401.26 233.73 404.68 232.04 Q 405.14 231.82 405.39 231.38 C 409.76 223.86 408.77 215.16 408.75 206.85 A 0.38 0.38 0.0 0 1 409.48 206.69 C 410.36 208.62 412.01 211.62 414.22 208.45 C 421.05 198.67 427.45 183.93 425.97 172.00 C 425.49 168.15 422.83 165.91 418.91 167.68",
  back: "M 1028.14 166.45 Q 1021.22 166.96 1021.73 176.02 C 1022.38 187.38 1027.41 200.00 1034.70 209.56 A 0.95 0.95 0.0 0 0 1035.77 209.88 Q 1037.97 209.08 1038.42 206.75 Q 1038.48 206.41 1038.79 206.56 C 1039.50 206.91 1039.29 219.51 1039.32 221.19 C 1039.41 225.63 1041.33 230.61 1045.48 233.58 A 1.48 1.46 -79.2 0 1 1046.03 234.40 C 1047.33 239.56 1046.14 264.59 1042.52 268.26 Q 1027.38 283.59 1008.53 293.99 C 997.30 300.18 985.80 298.88 972.00 298.05 C 960.16 297.34 951.79 300.13 941.86 307.09 C 927.96 316.83 911.37 335.39 909.24 353.00 C 906.85 372.86 908.46 396.71 910.58 417.97 Q 910.78 420.04 909.97 421.91 C 907.17 428.36 903.51 435.29 901.56 441.28 Q 895.91 458.72 896.11 477.26 Q 896.15 480.50 895.88 486.15 Q 895.86 486.66 895.55 487.06 C 879.06 508.02 866.67 530.27 860.84 556.43 Q 859.72 561.44 857.62 576.15 C 853.15 607.45 846.97 639.64 837.96 670.48 C 835.37 679.35 832.82 690.15 824.31 693.38 Q 811.21 698.35 799.91 706.70 C 793.05 711.77 790.22 717.94 785.68 726.75 C 782.37 733.16 764.38 739.29 769.45 747.77 C 771.01 750.37 774.09 750.14 776.79 749.81 Q 787.25 748.51 793.13 740.83 C 795.42 737.84 797.13 736.50 800.36 735.31 A 0.63 0.63 0.0 0 1 801.16 735.68 C 803.48 741.92 802.81 745.80 799.51 751.90 Q 789.51 770.39 779.78 789.01 C 775.87 796.49 784.57 802.15 789.55 794.51 C 796.72 783.50 802.47 773.20 812.06 762.59 Q 812.62 761.98 812.43 762.79 Q 807.49 783.70 798.01 804.03 Q 795.79 808.79 797.53 813.47 C 798.35 815.65 800.88 816.85 802.95 815.95 C 807.95 813.78 812.74 805.60 815.08 800.58 Q 820.51 788.92 825.23 776.95 Q 827.37 771.52 829.06 768.26 A 0.34 0.34 0.0 0 1 829.69 768.47 C 828.65 774.94 819.92 813.84 825.80 817.66 C 829.47 820.04 832.91 815.52 833.80 812.51 Q 838.73 795.91 842.08 776.75 C 842.69 773.31 843.62 770.03 844.54 766.92 A 1.49 1.49 0.0 0 1 847.45 767.13 C 849.06 778.16 848.17 788.91 850.91 799.85 C 851.57 802.48 854.41 806.12 856.99 802.69 C 861.32 796.92 861.47 780.19 861.98 770.25 C 862.50 760.22 866.62 750.03 868.70 741.28 C 871.57 729.16 876.10 714.64 875.42 700.50 C 874.79 687.46 876.48 676.40 882.00 664.53 Q 899.81 626.31 920.51 587.27 C 928.60 572.01 933.68 558.17 937.01 542.00 Q 938.40 535.24 940.57 511.31 C 941.06 506.01 943.33 501.94 947.04 497.29 C 957.02 484.77 962.25 465.95 965.86 450.00 Q 965.97 449.54 966.40 449.37 L 969.87 447.93 Q 970.39 447.72 970.44 448.27 C 972.08 465.19 974.18 483.97 982.58 498.42 Q 985.25 503.01 985.69 509.45 C 985.76 510.51 986.43 511.70 986.49 512.50 C 986.89 517.68 987.09 525.23 986.82 531.50 Q 985.00 573.11 980.47 614.52 C 978.98 628.13 972.65 640.33 969.66 653.60 C 966.01 669.78 963.02 685.46 961.19 702.45 C 959.24 720.52 956.19 739.39 955.83 756.75 C 954.96 797.57 955.28 842.51 962.96 884.21 C 965.15 896.11 968.33 907.72 975.37 917.40 A 1.48 1.46 27.9 0 1 975.65 918.29 C 975.42 926.20 976.32 934.21 975.03 942.01 C 971.89 960.94 969.95 978.86 973.41 997.96 C 973.70 999.53 973.58 1001.87 973.23 1003.42 C 959.26 1065.20 965.77 1130.76 981.86 1191.82 C 985.51 1205.68 986.32 1220.46 984.96 1234.92 C 984.02 1244.98 982.27 1255.20 983.30 1265.30 C 984.08 1272.87 988.23 1284.18 983.14 1291.21 C 978.75 1297.25 969.45 1303.98 963.07 1312.35 C 960.11 1316.25 952.52 1335.31 964.02 1333.54 Q 964.55 1333.46 964.42 1333.98 C 962.73 1340.59 969.52 1340.54 974.36 1340.95 Q 974.88 1341.00 975.24 1341.37 C 978.64 1344.83 981.89 1347.54 986.66 1344.41 Q 987.11 1344.12 987.46 1344.52 C 992.32 1350.09 997.09 1350.27 1003.06 1346.11 Q 1003.50 1345.80 1003.93 1346.12 C 1005.34 1347.18 1006.20 1348.82 1007.59 1349.58 Q 1011.98 1351.98 1017.08 1351.27 A 1.56 1.56 0.0 0 0 1017.93 1350.86 Q 1024.28 1344.70 1027.72 1339.46 C 1032.14 1332.71 1030.13 1325.67 1029.71 1317.92 C 1029.27 1309.96 1031.28 1302.44 1033.52 1294.97 C 1034.58 1291.42 1034.05 1286.50 1033.60 1282.59 Q 1032.89 1276.40 1034.01 1270.28 C 1034.95 1265.11 1035.75 1261.39 1034.60 1257.67 Q 1029.90 1242.46 1029.51 1227.25 Q 1028.64 1193.94 1033.40 1159.73 C 1035.13 1147.30 1038.92 1136.76 1043.43 1124.47 Q 1045.16 1119.75 1045.73 1115.31 C 1050.32 1079.07 1044.60 1044.51 1039.86 1008.73 C 1038.66 999.61 1043.98 993.60 1045.54 987.51 C 1048.41 976.36 1049.80 959.10 1047.93 945.66 C 1046.88 938.09 1047.48 931.84 1049.21 924.99 C 1053.15 909.35 1056.75 892.75 1059.78 880.01 Q 1066.27 852.63 1072.60 825.22 Q 1075.98 810.55 1076.49 805.75 Q 1077.50 796.31 1077.72 775.82 Q 1077.85 764.16 1076.54 752.58 Q 1076.32 750.58 1075.99 749.61 Q 1075.45 748.03 1076.95 748.78 L 1083.35 752.00 A 1.10 1.08 44.4 0 0 1084.32 752.00 L 1091.50 748.31 A 0.24 0.24 0.0 0 1 1091.84 748.59 Q 1090.49 753.63 1090.36 758.75 C 1089.82 779.99 1089.54 802.24 1094.28 822.45 Q 1101.55 853.47 1108.92 884.46 C 1111.25 894.25 1114.60 910.13 1117.95 922.87 C 1119.13 927.36 1119.75 931.95 1120.50 936.49 C 1121.14 940.42 1119.45 945.92 1119.24 949.53 Q 1118.26 966.73 1121.38 983.68 C 1121.98 986.96 1123.21 991.52 1124.54 993.96 C 1128.10 1000.50 1128.52 1004.24 1127.36 1012.10 C 1122.34 1046.29 1118.51 1078.84 1121.48 1113.50 C 1121.72 1116.32 1122.66 1120.49 1123.91 1123.73 C 1131.43 1143.10 1134.58 1156.98 1136.42 1177.99 C 1138.35 1200.12 1139.52 1222.20 1136.35 1244.60 Q 1135.88 1247.88 1134.29 1252.69 C 1132.00 1259.62 1132.37 1264.14 1133.83 1271.98 C 1135.50 1280.93 1132.17 1288.45 1134.90 1297.66 C 1136.88 1304.36 1138.19 1310.69 1137.87 1317.88 C 1137.58 1324.48 1135.49 1332.56 1139.15 1338.36 Q 1142.72 1344.04 1149.63 1350.84 Q 1149.97 1351.18 1150.46 1351.25 Q 1158.71 1352.49 1163.67 1346.15 A 0.64 0.64 0.0 0 1 1164.58 1346.04 Q 1173.02 1352.85 1180.03 1344.60 Q 1180.37 1344.20 1180.83 1344.46 Q 1186.12 1347.40 1190.08 1343.66 Q 1192.28 1341.58 1193.29 1341.22 C 1197.87 1339.60 1204.81 1341.71 1203.29 1333.67 A 0.39 0.39 0.0 0 1 1203.82 1333.23 L 1204.86 1333.62 Q 1205.25 1333.77 1205.65 1333.71 C 1212.46 1332.65 1209.17 1324.33 1208.00 1319.87 C 1205.32 1309.62 1192.63 1299.79 1185.30 1292.30 C 1180.77 1287.68 1182.22 1274.71 1183.62 1269.06 C 1186.76 1256.35 1182.79 1239.97 1182.29 1230.50 C 1181.63 1217.80 1182.70 1204.60 1185.99 1191.35 C 1200.90 1131.35 1208.58 1067.26 1194.98 1006.22 C 1193.56 999.84 1194.88 994.32 1195.73 987.24 C 1197.46 972.87 1195.00 955.62 1192.39 940.62 C 1191.27 934.14 1192.32 927.30 1192.25 920.69 Q 1192.25 920.23 1192.09 919.80 L 1191.79 918.97 Q 1191.59 918.45 1191.92 918.00 C 1199.57 907.39 1203.42 893.36 1205.50 881.25 C 1212.13 842.49 1212.38 800.86 1211.97 761.04 C 1211.76 739.76 1208.12 718.12 1205.90 696.81 Q 1204.13 679.89 1197.85 652.94 C 1194.73 639.58 1188.50 627.37 1187.05 613.69 Q 1183.04 575.93 1181.17 542.06 Q 1180.56 530.97 1180.85 518.01 C 1180.96 512.91 1182.20 504.08 1184.51 499.52 C 1186.81 494.98 1189.81 490.71 1191.01 485.74 Q 1195.45 467.32 1197.09 448.35 A 0.55 0.55 0.0 0 1 1197.86 447.90 L 1201.25 449.41 Q 1201.74 449.63 1201.86 450.16 C 1205.49 466.08 1210.60 484.96 1221.09 497.82 C 1229.48 508.13 1227.82 523.50 1229.73 535.92 C 1232.46 553.65 1237.66 569.19 1246.25 585.54 Q 1262.47 616.39 1284.56 662.22 Q 1292.50 678.70 1292.52 695.41 Q 1292.52 695.47 1292.20 701.94 C 1291.63 713.32 1294.91 723.91 1297.35 734.87 C 1300.01 746.89 1305.13 759.34 1305.74 772.33 C 1305.98 777.24 1306.66 804.29 1313.58 804.01 A 1.29 1.29 0.0 0 0 1314.41 803.66 C 1321.43 797.06 1316.55 769.02 1321.52 766.22 A 1.20 1.19 -21.2 0 1 1323.27 766.99 C 1326.58 781.35 1329.25 795.81 1332.92 809.99 C 1334.01 814.20 1338.07 821.55 1342.84 816.86 Q 1343.20 816.50 1343.28 816.00 Q 1344.28 809.42 1343.76 805.00 Q 1341.60 786.63 1337.95 768.42 A 0.48 0.48 0.0 0 1 1338.86 768.15 C 1342.31 776.96 1355.85 815.37 1366.03 816.16 C 1370.51 816.50 1371.54 810.41 1370.44 807.06 C 1367.79 798.97 1363.64 790.62 1361.28 783.45 Q 1357.86 773.08 1355.02 762.60 A 0.28 0.28 0.0 0 1 1355.50 762.34 Q 1359.72 767.36 1363.75 772.57 C 1368.83 779.14 1373.25 787.32 1378.17 794.66 Q 1379.99 797.36 1381.66 797.98 C 1384.30 798.97 1389.15 796.58 1388.99 793.50 Q 1388.85 790.72 1386.66 786.58 Q 1378.13 770.40 1369.24 754.42 C 1365.36 747.45 1364.08 743.12 1366.68 735.63 Q 1366.81 735.24 1367.20 735.38 Q 1371.90 736.99 1372.91 738.60 Q 1379.67 749.28 1393.03 749.97 C 1401.07 750.38 1400.13 741.50 1395.34 738.12 C 1390.41 734.62 1384.54 731.36 1381.93 726.55 C 1378.04 719.37 1374.79 711.78 1368.18 706.82 Q 1357.23 698.60 1343.50 693.43 C 1335.51 690.42 1332.54 680.64 1330.25 672.50 C 1321.70 642.22 1315.13 611.45 1310.75 580.29 Q 1308.97 567.62 1308.28 563.74 C 1302.89 533.66 1289.99 510.94 1272.05 486.75 Q 1271.76 486.36 1271.76 485.88 C 1271.89 470.59 1270.82 455.36 1265.92 440.80 C 1263.95 434.94 1260.59 428.46 1257.79 422.38 Q 1256.94 420.52 1257.10 418.48 C 1258.73 398.21 1260.25 378.73 1258.88 358.36 C 1257.39 336.36 1241.06 316.98 1223.33 305.40 C 1213.33 298.87 1205.11 297.32 1193.06 298.08 C 1179.40 298.94 1169.27 299.86 1157.52 293.24 Q 1139.58 283.12 1124.50 267.54 Q 1124.15 267.19 1124.04 266.70 Q 1121.33 254.82 1121.08 242.66 C 1120.97 237.52 1120.38 234.21 1124.51 231.78 Q 1124.95 231.52 1125.21 231.07 C 1128.92 224.63 1129.03 215.40 1128.17 207.76 Q 1128.08 207.01 1128.59 206.65 Q 1128.95 206.40 1129.15 206.78 L 1130.41 209.10 A 1.80 1.79 -42.1 0 0 1133.47 209.25 C 1138.33 202.11 1153.60 172.22 1141.68 166.80 Q 1141.16 166.57 1140.69 166.88 L 1138.38 168.39"
};
const MUSCLE_PATHS = {
  front: {
    "chest":["M272.91 422.84c-18.95-17.19-22-57-12.64-78.79 5.57-12.99 26.54-24.37 39.97-25.87q20.36-2.26 37.02.75c9.74 1.76 16.13 15.64 18.41 25.04 3.99 16.48 3.23 31.38 1.67 48.06q-1.35 14.35-2.05 16.89c-6.52 23.5-38.08 29.23-58.28 24.53-9.12-2.12-17.24-4.38-24.1-10.61z","M416.04 435c-15.12.11-34.46-6.78-41.37-21.48q-1.88-3.99-2.84-12.18c-2.89-24.41-5.9-53.65 8.44-74.79 4.26-6.26 10.49-7.93 18.36-8.56q11.66-.92 23.32-.35c10.58.53 18.02 2.74 26.62 7.87 12.81 7.65 19.73 14.52 22.67 29.75 4.94 25.57.24 64.14-28.21 74.97q-12.26 4.67-26.99 4.77z"],
    "obliques":["M264.21 435.53c-4.88-3.13-5.75-12.11-5.39-17.36q.03-.53.51-.75 1.8-.84 3.43.85 10.05 10.45 22.57 16.9c3.64 1.89 5.54 3.62 4.79 7.8q-.42 2.35-2.82 1.87-12.45-2.49-23.09-9.31z","M287.33 452.44c-4.05 4.46-10.38 11.38-16.28 14.3a.84.83 51.1 01-.9-.1c-6.29-5.17-12.54-18.97-14.21-25.09q-.91-3.34.85-8.81.12-.39.35-.05c2.41 3.65 4.59 7.74 8.67 9.76q10.18 5.05 21.27 9.01a.61.61 0 01.25.98z","M297.3 487.82c-7.36-4.23-16.68-11.37-20.55-17.57q-.32-.5.09-.92 8.72-9.04 19.84-17.87 1.46-1.17 2.81-1.67a.44.44 0 01.59.43c-.28 10.08-.4 20.42.65 30.43q.34 3.26-.68 6.15a1.9 1.9 0 01-2.75 1.02z","M257.35 456.18l13.68 16.63a1.86 1.82 22.9 01.4.95c.59 5.4-2.02 12.71-3.8 17.56q-.3.84-.84.13-11.85-15.55-9.77-35.17.04-.45.33-.1z","M271.69 494.07a1.53 1.52-61.8 01-.49-1.64l4.2-13.58a.98.98 0 011.51-.5c3.2 2.32 21.89 14.05 22.26 16.7q1.15 8.32.66 16.79a.9.9 0 01-1.34.73q-14.24-8.05-26.8-18.5z","M299.35 544.62c-7.52-6.03-16.15-13.43-24.23-21.24-6.93-6.7-6-17.19-4.88-26.06a.44.44 0 01.72-.28q13.31 11.88 28.41 21.38.43.27.6.75c2.33 6.49.95 18.37-.07 25.23q-.09.59-.55.22z","M299.09 575.53c-7.98-3.65-27.57-15.86-28.06-26.2q-.57-11.91.46-24.3a.36.36 0 01.67-.15q.84 1.36 2.17 2.54 10.59 9.45 21.68 18.31c4.37 3.49 4.34 6.46 4.16 11.74q-.3 8.82-.42 17.64-.01.72-.66.42z","M308.17 657.58c-7.39-.13-12.41-4.13-17.14-9.39q-11.86-13.22-23.92-26.37-.33-.36-.33-.85.09-23.18 1.81-46.22.53-7.13 2.49-14.41a.71.71 0 011.2-.3q11.54 12.06 25.82 21.1 3.36 2.12 3.62 5.17 2.06 23.67 3.86 47.36c.58 7.62 2.31 13.36 4.43 20.82q.47 1.66-.96 2.79-.39.31-.88.3z","M438.7 444.36c-2.09-4.03-.13-6.83 3.63-8.81 10.22-5.36 16.79-11 24.23-18.07a1.71 1.71 0 012.89 1.12c.33 4.74-.81 14.39-5.53 17.22-4.68 2.82-18.74 10.02-24.39 9.14q-.57-.09-.83-.6z","M457.39 466.73c-3.72-1.02-13.2-10.29-16.5-14.49a.52.52 0 01.24-.81q10.94-3.75 21.31-9c3.96-2.01 6.3-5.98 8.57-9.58q.38-.59.55.09c.82 3.33 1.54 6.17.38 9.58-2.55 7.44-7.62 18.79-13.66 24.01a.96.96 0 01-.89.2z","M428.43 487.22c-1.01-1.79-.82-4.55-.71-6.72q.78-15.08.48-30.27-.01-.59.55-.4 1.72.59 3.02 1.64 11.58 9.37 18.82 16.95c3.86 4.05-16.2 17.42-19.56 19.48a1.87 1.86 59.6 01-2.6-.68z","M470.76 456.28a.25.25 0 01.44.13q2.03 19.67-9.8 35.22-.37.48-.6-.08c-1.37-3.29-5.86-16.13-3.51-18.91q6.3-7.47 13.47-16.36z","M452.27 478.5c1.13.49 4.28 12.47 4.78 14.38q.14.5-.23.88-1.29 1.35-2.65 2.41-10.44 8.12-21.76 14.97-1.49.9-2.91 1.33a.81.81 0 01-1.05-.71q-.73-8.62.67-17.15.08-.47.44-.8c1.74-1.6 21.96-15.73 22.34-15.51a.58.03 31 00.37.2z","M428.22 519.14q.11-.36.43-.56 15.3-9.66 28.83-21.69a.43.42-22.6 01.71.29c.51 8.26 2.25 18.67-4.46 25.4q-11.8 11.84-25.03 22.09-.43.34-.49-.2c-.75-6.82-1.97-18.92.01-25.33z","M456.54 524.55a.04.04 0 01.07.02q1.52 13.67.41 27.4-.04.47-.28.88c-4.97 8.3-18.23 19.62-27.88 22.63q-.57.17-.58-.43-.05-10.31-.27-20.53-.1-4.8 2.63-7.09c8.54-7.13 18.56-14.62 25.9-22.88z","M418.89 657.11q-1.12-1.67-.43-3.63 3.27-9.38 4.04-18.23 1.97-22.81 3.58-45.65c.16-2.32.72-6.41 2.84-7.71q14.97-9.23 27.16-21.93.41-.42.71.08 1.29 2.15 1.53 4.2 3.23 27.74 3.13 56.8a1.3 1.28-24.5 01-.33.86q-12.74 13.93-25.55 27.75c-4.8 5.17-9.09 7.87-15.73 7.96q-.61.01-.95-.5z"],
    "abs":["M311.02 531.71a.23.23 0 01-.19-.21q-.39-10.47 1.9-20.76c1.26-5.69 7.66-9.9 13.1-12.9 9.09-5.01 18.93-11.15 28.56-14.92a1.24 1.21-42.6 01.94.03c3.28 1.52 4.78 3.87 4.82 7.68q.13 13.16-.15 26.31c-.08 3.85.78 8.39-.87 13.1q-.17.46-.59.72-2.65 1.65-4.29 1.82-21.06 2.22-43.23-.87z","M321 577.76c-5.17-.33-8.71-.44-10-6.26q-3.2-14.44-.59-27.83.11-.53.64-.63c7.58-1.44 13.62-2.45 22.45-4.56q11.5-2.76 23.94-1.88c3.67.26 3.3 3.46 3.4 6.21q.46 12.55-.33 26.94-.25 4.41-1.81 8.08-.21.49-.73.6-1.39.28-3.22.29-16.89.14-33.75-.96z","M347.73 429.25c7.46-3.61 10.5 6.27 10.99 11.52.48 5.06 3.46 30.61-2.78 32.93q-4.17 1.55-6.89 3.33-17.56 11.54-35.88 21.46a1.6 1.59-21.9 01-2.3-.98c-2.87-10.41-10.59-43.96 1.66-50.95 11.3-6.45 23.96-11.86 35.2-17.31z","M350.35 712.81c-29.15-9.93-37.98-100.69-39.47-126.61a.99.99 0 01.33-.8c3.58-3.26 27.61-1.47 34.62-.93 4.41.34 15.27 1.31 15.26 7.53-.05 40.77.64 82.05-1.96 122.72a1.29 1.29 0 01-1.86 1.08c-2.3-1.14-4.12-2.04-6.92-2.99z","M371.94 473.31c-5.46-2.59-2.97-24.26-2.77-29.56.25-6.8 2.41-18.63 12.64-13.8q16.26 7.67 32.34 15.72 6.18 3.1 7.13 10.05c.58 4.26 1.35 8.49 1.07 12.72q-.84 12.55-4.33 26.56-.54 2.16-1.1 3.44-.25.58-.81.31c-15.78-7.29-30.79-19.08-44.17-25.44z","M382.57 533.27c-4.17-.18-9.56-.3-13.15-2.69q-.17-.11-.24-.31c-1.82-5.55-.86-11.17-.96-15.66-.18-8.4-.78-17.36.06-25.71.29-2.85 1.88-4.42 4.15-5.79q.42-.26.91-.19 1.71.25 3.21 1.03 12.48 6.44 24.75 13.26c4.96 2.75 12.21 7.02 13.72 12.41q2.93 10.56 2.39 21.49a.77.76-1.8 01-.67.71q-16.89 2.18-34.17 1.45z","M373.75 578.69c-2.47 0-4.31.22-5-2.7-1.8-7.7-3.05-34.29-.19-38.81q.27-.43.77-.47 13.14-1.24 25.77 1.83c8.41 2.04 14.51 3.01 21.85 4.36a1.29 1.28.6 011.05 1.07q2.16 14.12-.73 28.07c-1.08 5.24-5.22 5.26-10.36 5.63q-14.26 1.04-33.16 1.02z","M416.32 584.73q1.14.41 1.07 1.62c-1.62 26.44-9.96 116.68-40.43 126.74-2.27.75-4.15 2.12-6.35 2.73q-1.18.33-1.3-.89-.86-9.2-1.06-17.75c-.83-35.67-.91-71.2-1.01-106.88q0-.5.31-.89c4.95-6.46 41.69-7.25 48.77-4.68z"],
    "biceps":["M189.52 492.51c-2.43.62-7.38.57-7.51-3.08-.56-16.01-.42-35.49 5.11-50.26 3.19-8.54 13.89-30.22 23.27-32.72 10.08-2.68 12.68 16.59 12.6 22.8-.22 15.98-7.51 34.79-15.05 48.71-4.29 7.94-9.95 12.38-18.42 14.55z","M526.69 486.31c-9.9-8.61-17.75-33.21-20.65-47.73-1.41-7.06-1.34-29.61 8.58-32.16 10.33-2.66 23.81 25.34 26.6 32.91q2.6 7.04 3.6 16.13 1.62 14.66 1.66 32.28c.03 11.04-16.45 1.48-19.79-1.43z"],
    "triceps":["M206.2 514.2c-5.41-.67-6.55-7.29-4.69-11.42 11.08-24.55 22.84-50.62 30.54-75.51 1.37-4.41 3.08-8.59 3.95-12.45q2.94-13.12 5.79-26.26.42-1.98 1.82-3.39a.52.52 0 01.81.1q1.04 1.69 1.94 4.56 4.63 14.65 5.15 24.92c.57 11.36-5.11 24.55-8.65 35.5q-7.69 23.78-20.25 45.39c-2.45 4.23-11.51 19.18-16.41 18.56z","M517.69 512.06c-20.07-22.12-28.95-51.73-38.01-79.03-3.27-9.87-3.58-19.18-1.34-29.38 1.29-5.88 2.49-13.03 5.61-18.52q.32-.57.72-.06 1.35 1.67 1.79 3.69c2.67 12.33 5.14 24.49 9.07 36.52 8.25 25.28 18.58 49.8 31.1 77.2q1.42 3.1 1.05 5.33c-.81 4.89-5.46 9.25-9.99 4.25z"],
    "neck":["M354.01 315.07q-3.49-3.65-5.9-8.23c-6.46-12.3-11.03-25.42-16.12-38.77-2.92-7.66-1.98-19.44-1.61-27.6q.03-.58.47-.21c9.06 7.39 11.33 17.46 15.67 27.62 5.4 12.61 15.4 33.31 9.11 46.92a1 .99 35.5 01-1.62.27z","M345.77 316c-4.12-1.96-12.78-6.76-15.07-11.38-4.29-8.65-2.69-16.02-2.28-25.25a1 1 0 011.95-.28c4.29 12.42 10.5 24.4 15.71 36.61q.23.55-.31.3z","M372.75 314.71c-5.78-9.67 1.71-31.17 6.17-40.68 5.95-12.68 8.21-24.68 18.35-33.9a.49.49 0 01.82.35c.28 8.68.84 19.39-1.97 27.72-5.26 15.58-11.39 33.46-21.42 46.62a1.18 1.18 0 01-1.95-.11z","M398.01 278.49a.5.49 35.5 01.87-.14c2.01 2.7 1.62 11.6 1.61 15.13-.04 12.42-8.2 17.45-17.9 22.58a.35.35 0 01-.48-.46c5.51-12.02 11.85-24.46 15.9-37.11z","M362.65 290.52q-1.14-1.37-1.86-3.41-5.33-15.15-12.14-29.75c-2.37-5.06-1.07-9.07-7.92-10.99q-1.01-.28.02-.47c5.98-1.08 15.25.91 21.33 2q2.37.42 4.81-.09 10.09-2.13 20.45-2.12a.37.37 0 01.08.73c-6.34 1.46-5.45 5.64-7.57 10.21q-6.1 13.1-11 26.69-1.3 3.62-2.9 6.81a1.99 1.99 0 01-3.3.39z"],
    "trapezius":["M285.01 307.01a.89.89 0 01-.11-1.64q19.44-9.61 35.65-24.8 1.68-1.57 3.31-.31.4.32.45.82 1.25 12.61-1.57 25.41c-.74 3.32-2.55 4.23-5.9 4.48q-16.02 1.24-31.83-3.96z","M414 311.19c-5.24-.12-7.81-.64-8.9-6.27q-2.33-12.09-1.17-23.94.06-.61.61-.89 1.66-.85 3.65.99 16.12 14.87 33.97 23.63 3.65 1.79-.27 2.89-13.88 3.91-27.89 3.59z"],
    "deltoids":["M274.06 311.69q3.94 2.77 4.33 8.14.04.48-.38.73c-9.98 5.88-24.35 7.45-28.82 19.75-2.31 6.36-.97 17.35-1.43 23.68q-.55 7.51-5.73 14.07-10.37 13.11-13.81 16.67c-3.41 3.53-6.81 1.76-10.69-.47-15.42-8.87-24.95-25.45-22.52-43.22 2.05-14.92 12.71-25.79 24.06-35.02 16.99-13.82 35.58-17.99 54.99-4.33z","M450.39 320.75q-.95-.52-.7-1.58c1.57-6.61 5.8-9.1 12.14-11.9 24.99-11.03 43.76 3.33 60.17 20.74 20.73 21.99 11.81 56.44-14.82 68.19-4.41 1.94-6.79-1.03-9.81-4.51-5.81-6.7-13.46-14.12-15.99-22.8-3.93-13.43 4.32-27.54-9.64-37.62q-8.22-5.93-17.99-9.08-1.84-.59-3.36-1.44z"],
    "adductors":["M280.26 647.4c11.65 10.74 22.18 21.04 31.02 34.3 15.82 23.72 27.55 49.72 34.01 77.58 1.34 5.79-6.14 20.34-12.62 20.22q-.52-.01-.72-.49-.67-1.59-1.21-3.13c-14.68-41.71-27.96-79.71-46.87-117.01-1.9-3.74-3.05-7.33-4.06-11.2a.27.27 0 01.45-.27z","M331.64 898.32q-.17.57-.23-.02c-2.23-25.01-8.47-50.09-14.25-74.53q-19.4-82.1-42.46-163.69-.58-2.08.33-.13c19.88 42.53 38.94 86.51 51.64 132.07 9.49 34.06 15.59 71.67 4.97 106.3z","M334.46 789.17c1.56-2.63 14.39-20.38 16.2-20.37a1.71 1.7-89.2 011.7 1.76q-1.12 34.88-7.4 68.95c-.38 2.06-1.41 4.27-2.16 6.23q-.24.62-.34-.04-3.68-25.45-8.44-50.7c-.34-1.79-.63-4 .44-5.83z","M395.47 779.4c-5.7 1.33-11.34-11.87-12.46-15.86q-.61-2.18-.02-4.65 10.17-42.64 35.06-78.81c9.47-13.77 18.83-22.36 29.85-32.56q.55-.5.4.22-1.12 5.7-3.73 10.83c-19.44 38.38-33.3 79.2-47.77 119.65a1.84 1.83-86.4 01-1.33 1.18z","M453.65 658.99q.67-1.43.23.09-26.73 93.75-48.63 189.74c-1.98 8.7-3.66 17.9-5.44 26.84q-2.19 11.05-2.78 22.43a.15.15 0 01-.3.04c-8.18-24.48-6.74-51.98-1.87-76.86 11.07-56.49 34.44-110.42 58.79-162.28z","M377.91 768.67c1.49.84 1.76 1.49 2.66 2.66q6.16 8.04 12.23 16.13c1.88 2.52 1.97 4.18 1.38 7.45q-4.57 25.23-8.43 50.57-.11.71-.4.05-1.89-4.29-2.54-8.09-5.57-32.28-6.98-65.01-.09-2 .81-3.44a.95.94 30.8 011.27-.32z"],
    "quadriceps":["M292.42 935.6q-.95-.52-1.57-1.4-4.1-5.79-7-13.53-7.8-20.79-13.3-42.33c-9.06-35.53-19.33-71.36-25.03-107.59-5.33-33.86 4-74.19 20.7-103.37q.35-.62.53.07c14.44 55.57 39.03 107.94 41.45 165.34 1.11 26.34.66 52.96-3.6 79.03-.63 3.83-4.73 27.81-12.18 23.78z","M275.11 942.93q-2.42-2.18-3.57-5.24c-3.98-10.61-7.68-21.02-12.81-31.32-7.85-15.76-10.77-34.56-13.2-51.46-2.11-14.63-2.31-31.47-3.93-47.18-.22-2.16-1.04-12.78.46-13.79q1.36-.92 2.08.55c1.5 3.08 3.12 6.12 3.66 9.58q8.21 52.38 26.36 102.15c2.87 7.87 9.98 30.5 1.85 36.74a.71.7-42.5 01-.9-.03z","M322.69 945.72c-3.73 6.14-10.77-2.43-12.6-5.6-3.16-5.47-2.62-14.93-1.78-20.81 4.03-28.09 5.6-52.81 3.48-80.78q-.06-.79.28-.08 15.77 32.83 14.26 68.9c-.4 9.54-2.94 22.48-2.91 34.13q.01 3.02-.73 4.24z","M437.82 933.52c-8.9 14.18-15.15-26.74-15.46-29.25q-5.26-43.04-1.19-86.08c4.9-51.8 26.91-99.32 40.38-150.92q.18-.66.5-.06c17.25 31.67 25.39 68.28 20.54 104.36q-2.29 17.02-8.71 42.76-7.56 30.25-15.2 60.47-6.13 24.25-15.06 47.61-1.83 4.79-5.8 11.11z","M451.79 942.6c-9.95-10.01 4.97-42.91 8.94-55.41q12.55-39.53 19.27-80.47c.49-2.97 2.64-12.34 5.41-13.28a.83.83 0 011.09.64q.74 4 .45 7.92c-1.99 26.52-3.37 58.99-11.01 87.73q-2.53 9.5-7.46 18.8c-4.38 8.24-6.97 16.72-10.08 25.27q-1.66 4.54-4.55 8.63a1.35 1.35 0 01-2.06.17z","M406.69 946.81c-3.24-2.77-1.48-10.64-2.01-14.71q-2.23-17.18-2.57-22.16c-1.75-25.07 3.61-49.11 13.98-71.92q.23-.51.2.05c-1.2 19.15-1.28 38.18.83 57.38q1.68 15.4 3.39 30.8c.43 3.92-.31 9.71-2.09 13.33-1.62 3.28-7.58 10.77-11.73 7.23z"],
    "knees":["M297.69 1008.37c-7.27 7.29-16.34 3.42-19.64-5.18q-6.18-16.11-9.57-30.68c-1.99-8.6-2.24-19.68 9.72-19.91q13.12-.24 26.05 2.15 1.71.32 3.29 1.02a1.17 1.15 4.2 01.63.72c3.17 10.27 2.5 23.36.05 33.69q-2.37 10.01-10.53 18.19z","M288.03 1059.54c-6.99-5.81 13.75-46.43 17.3-53.91q7.3-15.38 10.9-32.01c.74-3.42 2-6.31 4.18-8.64a1.36 1.35 54.7 012.23.39c3.97 9.09 1.66 13.86-1.67 24.65q-10.23 33.19-27.2 63.57-1.8 3.23-4.2 5.84a1.13 1.12-49 01-1.54.11z","M430.44 1008.31c-12.92-12.62-14.34-33.49-10.92-50.31.31-1.53 1.09-2.53 2.73-2.86q11.44-2.25 23.08-2.59c14.13-.42 17.31 5.67 14.54 18.63q-3.13 14.69-9.12 30.37c-3.45 9.03-11.63 15.25-20.31 6.76z","M438.96 1059.52q-2.25-1.89-3.8-4.64-20.15-35.92-31.06-75.66-2.11-7.68 1.95-14.16a1.16 1.16 0 011.91-.08c2.26 3.06 3.4 5.4 4.26 9.37 3.98 18.54 10.94 32.53 20.07 51.09 3.51 7.14 11.38 26.16 8.5 33.61a1.16 1.16 0 01-1.83.47z"],
    "tibialis":["M263.52 973.59a.6.6 0 011.09-.14q1.38 2.22 1.83 5.06c7.87 49.97 18.01 99.59 25 149.68q4.63 33.19 4.31 67.55-.04 3.45-2.15 5.76-.4.44-.75-.03-1.89-2.58-3.08-5.51c-11.63-28.6-20.46-58.12-24.26-88.68q-4.96-39.97-5.72-69.53c-.13-5.27-.17-12.59.35-18.98q1.7-20.77 2.52-41.6c.04-1.16.52-2.43.86-3.58z","M463.39 973.68a.7.7 0 011.25-.1c.27.46.64 1.34.68 1.93q1.26 20.88 2.53 41.76.66 10.82.39 19.98-1.23 40.77-7.51 82.25c-3.91 25.87-12.19 51.55-21.96 75.76q-1.13 2.79-3.27 6.13-.29.44-.71.12c-2.68-2.06-2.32-6.7-2.29-10.32.26-31.03 2.71-55.52 8.76-91.4q9.27-55.06 18.94-110.05c.8-4.5.99-10.52 3.19-16.06z"],
    "calves":["M252.09 1032.57c.24-3.71 2.14-22.17 4.63-24.18a1.03 1.02-17.9 011.67.85c-.45 7.89-1.27 16-1.49 23.45q-.57 18.93-.66 37.88-.02 3.63.34 6.85c2.08 18.76 5.56 37.32 9.3 55.8 3.82 18.84 9.13 37.64 13.11 56.63q2.44 11.68 2.08 17.95c-.32 5.7-3.08 20.49-8.51 23.92a.62.62 0 01-.84-.16q-1.2-1.65-.95-3.55c.92-7.26 1.45-14.15-.3-21.52q-8.25-34.74-13.62-59.06c-1.86-8.44-3.17-17.18-3.93-26.3q-3.69-44.24-.83-88.56z","M315.01 1025.17a.16.16 0 01.32.02c4.06 25.75 8.98 52.72 8.71 77.81q-.13 12.06-5.74 26.31c-7.2 18.3-8.93 38.57-15.95 56.93q-.18.48-.21-.03c-1.87-34.47-5.67-65.91-8.56-103.28q-.97-12.49 4.44-23.14 7.47-14.69 15.14-29.29c.81-1.55 1.35-3.62 1.85-5.33z","M455.5 1231.67c-7.13-5.81-9.23-24.34-8.2-31.86 1.41-10.32 4.63-23.14 7.98-36.33q9.54-37.46 15.15-75.74c2.86-19.5 1.53-40.15.75-59.8-.22-5.67-.98-12.51-1.23-18.75a.97.97 0 011.87-.4c.35.86.92 1.76 1.12 2.68q2.96 14.31 3.31 20.53 2.37 43.28-.49 84.75-1.21 17.42-5.43 35.77-6.33 27.51-12.84 54.98-2.01 8.49-.11 18.36c.36 1.9.11 3.95-.68 5.55a.79.79 0 01-1.2.26z","M412.77 1025.44a.14.14 0 01.27-.04c4.88 11.62 10.93 22.01 17.28 34.78 4.07 8.19 4.71 14.41 4.1 24.25-2.13 34.3-6.27 68.85-8.45 101.59q-.05.69-.31.05-1.48-3.67-2.28-6.75c-4.34-16.75-8.78-38.38-16.39-57.57q-1.4-3.55-2.2-10.11c-1.78-14.73-.2-31.24 2.04-45.88q3.06-20.02 5.94-40.32z"],
    "forearm":["M127.23 683.05c-4.07-2.12 1.27-27.07 2.25-31.57 4.98-23.03 9.17-46.17 13.91-69.25q1.53-7.47 2.13-15.13c.93-12.09.81-22.15 6.23-31.59 7.1-12.33 13.54-29.16 26.1-36.73a1.98 1.97 62.7 012.84.91c1.92 4.48 1.93 8.28 2.06 14.15.44 19.77-1.3 41.04-8.72 59.67-11 27.62-22.22 55.21-32.62 82.91-4.04 10.76-7.56 20.66-12.82 26.39q-.59.65-1.36.24z","M201.5 527.4a.84.84 0 01.67.65c3.98 17.15-2.93 39.36-10.95 54.41-4.6 8.63-13.06 20.43-18.21 31.33q-13.21 27.92-24.58 56.64-2.51 6.35-6.61 11.02a1.43 1.43 0 01-2.5-.81q-.36-3.78.84-7.17 10.31-29.18 21.57-57.99c6.32-16.18 14.55-31.65 20.66-47.87 3.69-9.82 5.36-22.36 7.32-30.62 1.49-6.27 4.19-11.06 11.79-9.59z","M207.33 540.4a.6.59-63.1 011.03-.34l5.38 6.02q.4.45.33 1.06-.52 4.1-1.29 5.84-6.91 15.65-13.69 31.35c-5.41 12.53-16.33 28.4-23.51 44.89-8.3 19.08-16.03 39.32-26.75 57.16a.36.36 0 01-.62 0l-.19-.32q-.17-.28-.06-.59 10.08-29.91 23.05-58.65 2.9-6.42 5.47-11.21c4.62-8.59 10.86-16.17 14.62-23.02q13.23-24.13 16.23-52.19z","M600.08 683.04c-5-4.14-8.97-15.46-11.29-21.56-5.82-15.25-11.38-30.55-17.58-45.7q-9.15-22.39-18.02-44.89c-5.58-14.19-7.32-31.42-7.99-46.57-.29-6.44-.68-19.43 2.67-25.02a1.71 1.71 0 012.25-.63c6.72 3.52 11.29 9.96 14.87 16.5q6.25 11.38 12.68 22.66c1.97 3.45 2.93 7.66 3.41 12.06 1.16 10.6 1.55 21.29 3.66 31.65 3.93 19.29 7.38 38.63 11.47 57.92 1.5 7.07 9.3 39.08 5.12 43.5a.91.91 0 01-1.25.08z","M586.58 681.46q-4.35-4.47-6.75-10.61-11.35-28.91-24.59-57.01c-5.72-12.13-14.32-22.86-19.97-35.1-7.1-15.36-12.9-33.32-9.27-50.31a1.44 1.43-87.1 011.23-1.12c7.47-.88 9.29 2.88 11.02 9.2 3.39 12.42 4.76 25.91 9.75 36.7 15.55 33.65 27.61 64.94 39.31 98.42 1.13 3.24 2.05 5.47 1.62 9.04a1.38 1.37 26.3 01-2.35.79z","M579.58 686.43q-3.92-5.77-6.87-12.13-8.05-17.34-19.75-44.5-2.68-6.24-6.46-13.62c-5.14-10.05-13.15-22.36-17.34-31.85q-9.55-21.68-13.66-31.36-1.09-2.58-1.33-5.87-.04-.61.37-1.07l5.24-5.85a.69.69 0 011.2.4q2.74 27.05 15.49 50.75 1.7 3.17 8.26 12.86 7.02 10.39 12.18 21.88 8.71 19.41 20.19 50.1 2.22 5.92 3.13 9.98a.36.36 0 01-.65.28z"],
    "hands":["M100.98 745.85c-9.03-6.62-15.78-13.18-13.3-24.59 2.67-12.29 15.01-20.6 25.37-26.21 7.76-4.21 18.22-1.68 26.15.97 7.14 2.39 11.11 6.16 11.1 13.86q-.04 18.51-4.75 36.37c-5.47 20.76-34.48 6.99-44.57-.4z","M53.81 746.32a.91.91 0 01-.74-.95c.14-2.49-.23-6.34 2.25-7.8 4.66-2.71 11.37-5.53 14.15-10.3q6.32-10.86 16.56-20.3 1.27-1.17.64.44c-1.45 3.73-2.86 7.21-3.87 11.59-2.76 11.9-14.62 30-28.99 27.32z","M87.21 745.05c1.44.46 8.14 2.66 8.61 4.55 1.26 5.12-4.42 8.54-7 12.25-7.73 11.1-15.12 23.38-24.25 33.28a1.22 1.22 0 01-2.11-.86c.11-3.93.38-7.1 2.43-10.65q10.27-17.71 19.31-36.11.32-.65 2.13-2.27.38-.35.88-.19z","M108.11 758.12a2.16 2.16 0 011.07 2.87q-10.49 22.55-19.92 45.81c-1.45 3.56-4.37 5.15-7.82 6.04a1.35 1.34-8.1 01-1.69-1.26c-.11-3.05.37-5.87 1.58-8.9q8.1-20.28 15.15-40.96c.41-1.2.62-3.33 1.69-4.85a1.21 1.21 0 01.91-.49q4.72-.21 9.03 1.74z","M134.09 799.9q-1.16-1.7-1.41-3.73-2.1-17.07-1.18-34.29.03-.6.61-.75l6.93-1.85q.68-.19.65.52-.51 10.9-.85 21.71c-.28 8.58.1 12.65-4.17 18.4a.36.36 0 01-.58-.01z","M108.13 814.65a1.48 1.48 0 01-1.62-1.47c-.02-2.83-.14-5.66.32-8.53q2.9-17.79 5.4-35.65.53-3.84 1.58-7.56a.66.66 0 01.76-.48l7.26 1.24a.97.97 0 01.78 1.14q-4.76 23.96-9.1 46.26-.9 4.64-5.38 5.05z","M591.31 755.99c-8.06-2.93-8.66-9.76-10.28-17.06q-3.22-14.42-3.1-29.3.04-4.06 1.46-6.55c4.34-7.57 18.16-9.91 25.63-10.35 8.75-.51 18.37 6.96 24.99 12.27q8.92 7.17 10.74 17.52c2.45 13.89-12.11 23.41-22.7 29.04-6.95 3.69-18.63 7.39-26.74 4.43z","M641.97 706.78q10.85 9.65 17.61 21.91c1.63 2.97 9.74 6.76 12.87 8.59 2.9 1.7 3.03 4.81 2.55 8.5q-.06.42-.48.49c-8.16 1.32-11.99-1.93-17.72-7.23-10.35-9.58-10.5-20.33-15.33-31.9q-.54-1.29.5-.36z","M638 760.07c-2.54-3.42-7.52-6.03-5.44-11.11q.18-.44.61-.63l7.41-3.3q1.29-.58 2.05.62 3.33 5.23 5.69 10.04 6.84 13.94 14.71 27.33c1.35 2.29 4.28 10.16 2.25 12.11a1.22 1.22 0 01-1.77-.08c-9.43-10.98-16.85-23.36-25.51-34.98z","M647.83 812.68c-4 .24-7.71-2.87-9.11-6.38q-9.28-23.27-19.74-45.33a2.05 2.05 0 01.92-2.71q4.5-2.28 9.62-1.7a1.09 1.07 83.8 01.89.73q7.5 23.06 16.57 45.5 1.8 4.46 1.5 9.24a.7.7 0 01-.65.65z","M596.17 761.18a.84.84 0 01.62.81c-.01 4.86.95 35.3-2.71 37.67q-.49.32-.82-.17-3.41-5.21-3.51-8.49-.45-15.62-1.16-31.23-.03-.72.66-.52l6.92 1.93z","M621.09 814.28c-4.35 1.91-5.92-3.77-6.5-6.56q-4.52-21.91-8.88-43.95a1.41 1.41 0 011.14-1.66l6.8-1.18a.92.92 0 011.06.76q2.79 16.32 5.09 32.91c.85 6.17 2.2 12.25 1.8 18.95q-.03.52-.51.73z"],
    "ankles":["M291.88 1208.11c5.48-1.03 11.85 5.55 13.38 10.37q2.45 7.74 1.47 16.83-.09.83-.45.08c-4.31-9.05-8-16.99-15.39-23.88a1.98 1.98 0 01.99-3.4z","M275.88 1270.94c-4.41-3.87-7.4-7.17-4.91-13.37q4.78-11.92 5.49-21.32.62-8.27 6.22-12.84c9-7.33 20.8 15 23.1 22.1 2.55 7.91 4.83 16.36 4.49 24.5-.31 7.14-2.02 17.4-6.49 23.1q-.3.38-.53-.05c-5.67-10.74-18.6-14.41-27.37-22.12z","M430.92 1209.12c2.24-1.35 10.54-2.02 6.02 2.65q-9.99 10.32-14.82 23.8a.28.28 0 01-.55-.08c-.52-10.27-.48-20.45 9.35-26.37z","M445.01 1223.26c8.45 6.56 6.46 16.66 9.35 25.59q1.76 5.43 3.47 10.88c3.84 12.26-27.75 21.49-32.21 32.42q-1.02 2.51-2.17.05c-6.91-14.82-6.79-29.36-1.78-44.58q2.82-8.57 8.02-16.04c3.02-4.35 9.61-12.76 15.32-8.32z"],
    "feet":["M264.5 1334.5c-3.98-.34-18.59-4.25-19.04-9.44a1.4 1.4 0 01.27-.94c9.66-13.03 20.9-25.49 28.65-39.78q.25-.47.78-.37 9.76 1.78 17.73 7.65a1.19 1.18 43 01.07 1.86c-1.32 1.11-1.65 2.62-1.06 4.35 2.96 8.57-.92 16.55-4.81 25.34-1.79 4.06-1.76 8.99-2.81 13.62a1.56 1.56 0 01-1.99 1.14q-8.36-2.64-17.79-3.43z","M291.87 1340.12c-2.25-2.64-2.07-5.93-.78-9.35q3.34-8.88 4.02-18.35.43-6.02 1.25-8.74 1.32-4.37 3.45-8.22a.66.65 53.7 011.21.19q1.97 9.26 6.28 17.3c2.59 4.85-.82 11.49-2.92 16.14a1.81 1.78-35.8 00-.16.94q.42 4.3-1.9 7.94-.22.33-.61.43l-8.79 2.06a1.06 1.06 0 01-1.05-.34z","M444.66 1337.65q-1.08-1.3-1.28-3.09c-.52-4.48-.73-8.39-2.77-12.64-3.51-7.31-7.06-16.37-4.43-23.19.77-1.99.92-3.79-.76-5.13a1.29 1.28 46.4 01.04-2.04q7.96-5.76 17.59-7.64.46-.1.69.32c7.25 13.1 17.21 24.83 26.45 36.56q1.11 1.41 2.51 3.8a1.17 1.14-51 01.09.95c-1.75 5.01-12.93 7.89-17.77 8.55q-9.87 1.36-19.54 3.82a.82.8-26.2 01-.82-.27z","M426.94 1338.55c-2.01-.34-2.96-5.48-3-7.12-.15-6.02-6.29-11.65-3.12-17.89q4.35-8.53 6.34-17.75a.78.78 0 011.47-.17c2.12 4.52 4.18 9.08 4.35 14.33q.35 10.43 3.97 20.24c1.19 3.22 1.52 5.83.39 8.78a2.32 2.31 19.3 01-2.87 1.38q-3.44-1.09-7.53-1.8z"],
    "head":["M 418.91 167.68 c 3.92 -1.77 6.58 0.47 7.06 4.32 c 1.48 11.93 -4.92 26.67 -11.75 36.45 c -2.21 3.17 -3.86 0.17 -4.74 -1.76 a 0.38 0.38 0 0 0 -0.73 0.16 c 0.02 8.31 1.01 17.01 -3.36 24.53 c -0.167 0.293 -4.39 4.62 -10.799 9.508 c -23.591 18.112 -41.591 16.112 -61.446 -0.797 c -4.736 -3.649 -5.925 -5.041 -8.805 -7.621 c -5.66 -5.07 -5.28 -17.38 -4.47 -24.92 c 0.05 -0.51 -0.468 -0.892 -0.933 -0.687 a 0.653 0.653 0 0 0 -0.357 0.397 c -0.57 1.69 -2.24 4.05 -4.07 1.48 c -6.2 -8.71 -16.02 -28.53 -11.19 -38.98 c 1.68 -3.627 3.733 -3.91 6.16 -0.85 a 182.853 182.853 0 0 1 3.78 23.29 a 1.02 1.02 0 0 0 1.56 0.77 c 2.79 -1.75 2.61 -18.93 2.63 -24.22 c 0.02 -4.53 1.12 -8.94 3.8 -13.1 c 4.36 -6.76 4.86 -11.51 5.57 -19.82 c 0.47 -5.53 4.34 -8.12 9.77 -8.21 c 6.39 -0.12 12.69 -0.07 19 -0.93 c 4.02 -0.55 7.4 -1.43 11.53 -0.75 c 6.7 1.1 13.44 1.64 20.22 1.62 c 4.607 -0.013 7.523 0.227 8.75 0.72 c 5.96 2.37 5.56 9.73 6.11 15.22 c 0.44 4.34 2.097 8.447 4.97 12.32 c 6.57 8.88 2.19 25.6 5.64 36.36 a 1.14 1.14 0 0 0 2.22 -0.23 c 0.887 -8.36 2.18 -16.45 3.88 -24.27 z z z z"],
    "hair":["M418.91 167.68q-2.55 11.73-3.88 24.27a1.14 1.14 0 01-2.22.23c-3.45-10.76.93-27.48-5.64-36.36q-4.31-5.81-4.97-12.32c-.55-5.49-.15-12.85-6.11-15.22q-1.84-.74-8.75-.72-10.17.03-20.22-1.62c-4.13-.68-7.51.2-11.53.75-6.31.86-12.61.81-19 .93-5.43.09-9.3 2.68-9.77 8.21-.71 8.31-1.21 13.06-5.57 19.82-2.68 4.16-3.78 8.57-3.8 13.1-.02 5.29.16 22.47-2.63 24.22a1.02 1.02 0 01-1.56-.77q-1.14-11.78-3.78-23.29-1.48-6.99-1.9-9.7c-2.49-15.94.13-40.13 13.53-51.15 9.39-7.72 28.53-11.63 40.37-11.51 4.2.05 8.74-.3 12.68.22 13.82 1.82 31.67 5.83 39.42 18.92 9.01 15.21 9.88 35.14 5.33 51.99z"]
  },
  back: {
    "neck":["M1022.74 290.63a.62.61 25.9 01-.36-1.03q1.71-1.83 4.11-3.11c8.19-4.35 19.4-8.3 23.38-17.48q8.48-19.57 8.22-40.85-.05-4.38.57-5.76c1.98-4.38 9.65-3.66 13.85-2.91 4.3.76 4.71 3.25 4.68 7.3q-.2 24.11-.88 48.2c-.12 4.25 1.6 15.84-4.88 16.32-14.57 1.08-32.6 1.81-48.69-.68z","M1095.75 291.46c-4.3-.25-4.9-3.99-4.95-7.71q-.46-29.47-1-58.94c-.13-7.39 11.74-6.23 15.99-4.85 4.2 1.36 3.01 6.89 2.88 10.79-.28 8.88 5.15 41.1 15.32 46.78q8.6 4.81 17.27 9.51 1.97 1.07 3.26 2.36a.8.79 63.6 01-.45 1.35c-16.12 2.17-33.78 1.56-48.32.71z"],
    "trapezius":["M1071.06 308.94c5.6 4.92 6.96 17.83 7.43 24.88q1.5 22.3.93 44.68-1.2 46.76-5.66 94a.57.56 3.7 01-.59.51q-.68-.03-.94-1.01-4.29-15.9-9.79-25.19c-10.24-17.31-18.8-31.84-25.59-49.4-10.19-26.38-15.6-54.28-26.46-80.58q-3.07-7.43-7.61-14.07-.3-.43.2-.6 12.47-4.28 25.48-4.85c5.54-.25 12.15.86 18.32 1.41 9.7.87 16.77 3.6 24.28 10.22z","M1163.98 302.12a.43.43 0 01.22.65q-7.08 10.77-11.41 23.37c-10.53 30.61-17.8 62.94-31.3 91.07-5.11 10.64-15.17 25.22-20.12 36.26q-4.08 9.08-6.59 18.83a.77.77 0 01-1.51-.12q-4.27-45.15-5.52-90.99c-.56-20.28-.74-39.92 2.75-60.43 1.04-6.13 2.77-9.98 7.85-13.85 9.8-7.48 18.02-7.73 30.1-9.11 12.02-1.39 23.92.4 35.53 4.32z"],
    "deltoids":["M980.66 319.58c.19.14.55.19.65.32a.8.8 0 01-.16 1.15c-6.78 4.75-15.26 9.77-20.03 15.58-6.41 7.78-8.76 16.96-9.44 27.04-.39 5.92-1.68 9.5-5.59 13.43-10.02 10.08-19.04 16.47-31.14 20.41q-.75.25-.75-.55.19-18.4-.09-36.3-.14-9.4 1.07-14.22c4.04-16.07 22.8-33.85 39.68-35.64 9.99-1.06 17.34 2.46 25.8 8.78z","M1227.3 316.44c14.62 9.44 25.48 21.03 25.46 39.51q-.02 20.56-.01 41.37a.37.37 0 01-.51.35c-5.08-2.06-10.41-3.98-14.9-6.97-7.84-5.24-21.14-14.95-21.77-24.95-.69-10.75-2.81-20.85-9.76-29.25-4.68-5.65-12.96-10.58-19.6-15.26q-1.23-.87.01-1.71c4.6-3.13 9.91-6.78 15.25-7.98q13.58-3.03 25.83 4.89z"],
    "upper-back":["M987.06 381.44c-8.48-5.06-14.14-13.28-18.82-22.92q-5.3-10.92-6.46-14.04c-1.49-4.01 35.14-19.22 39.61-20.97q2.75-1.08 4.33-.72c4.33.96 6.61 9.96 7.46 13.7q5.43 23.89 14.65 55.74.78 2.7-.88 4.39c-5.37 5.5-34.69-12.08-39.89-15.18z","M1017.44 583.31q-9.11-9.57-16.97-22.03-2.28-3.62-2.91-7.25c-3.28-18.82-5.77-38.04-10.52-56.55-3.53-13.73-4.74-25.19-6.61-41.43-.85-7.35-5.67-13.34-8.22-18.75q-4.93-10.47-6.44-22.88-.33-2.72 1.89-1.11c7.25 5.27 16.36 6.16 26.91 7.56 8.86 1.19 23.41-3.18 28.94-10.76 3.34-4.58 4.7-6.5 8.86-8.77a.67.66-26.4 01.92.3q10.02 21.8 19.93 43.78c2.56 5.69 12.11 15.88 10.77 21.83-3.65 16.09-9.88 31.96-16.24 47.13-9.72 23.21-18.61 46.72-27.2 70.36q-.24.67-.88.35-1.03-.52-2.23-1.78z","M1017.71 404.73c-23.86 13.25-54.31 7.11-60.45-22.75-1.2-5.81-2.5-15.84.64-20.55 3.63-5.44 7.17 4.18 8.17 6.14 7.71 15.14 31.62 29.16 48.2 31.13q1.84.21 5.26 2.06.4.21.26.64-.86 2.65-2.08 3.33z","M1141.45 397.63a2.17 2.14-3.6 01-1.88-1.64q-.71-2.97.18-5.95 8.74-29.19 11.75-43.29c1.73-8.11 3.07-16.77 6.94-22.08 1.92-2.62 4.28-2.27 7.19-1.15q20.52 7.9 39.09 18.77a1.37 1.36 25.9 01.58 1.67c-6.05 15.46-12.98 30.84-28.43 39.45-9.45 5.26-25.83 15.17-35.42 14.22z","M1149.69 404.8q-2.04-1.15-2.45-3.5-.09-.53.41-.75c4.64-2.04 9.78-2.51 14.63-3.87 11.01-3.1 22.03-10.83 30.34-18.57q6.33-5.89 7.58-8.93c1.02-2.49 3.79-9.5 7-9.46q.52.01.87.39 2.71 3.01 2.81 7.2c.33 13.77-2.24 26.93-13.26 35.95-13.88 11.36-33.12 9.94-47.93 1.54z","M1161.19 419.98c6.1 1.57 11.6.99 17.75.06 8.36-1.27 14.83-2.76 21.34-7.27a.54.53 74.1 01.84.47q-.64 11.88-5.76 22.85c-2.42 5.2-6.64 10.84-8.04 16.67q-1.02 4.24-1.43 8.92-1.64 18.72-6.34 37.47c-4.73 18.91-7.13 38.67-10.8 57.85q-.24 1.24-2.2 4.3c-4.57 7.14-12.22 19.43-19.34 23.88a.44.43-25.6 01-.64-.22c-8.26-22.57-16.6-45.11-25.91-67.23-6.67-15.85-13.27-32.14-17.27-48.42q-1.58-6.41 2.91-12.01 5.21-6.51 8.57-14.14 9.25-21 19.01-41.64a.47.47 0 01.65-.21q6.17 3.37 9.51 9.64c2.45 4.6 12.22 7.75 17.15 9.03z"],
    "triceps":["M931.03 442.29c-2.01 2.57-6.52 9.71-10.12 9.17q-.52-.08-.8-.52-1.35-2.09-1.84-4.44c-2.25-10.87-3.28-22.88 1.35-33.38 5.45-12.33 18.27-23.68 29.61-31.2a.47.46 68.7 01.71.32l6.42 38.52q.09.54-.26.97c-.47.58-1.12 1.52-1.71 1.94q-9.11 6.58-18.08 13.36-2.9 2.2-5.28 5.26z","M958.15 427.11a.41.41 0 01.55.27q4.44 16.16-2.23 31.41-3.37 7.73-5.91 19.98c-1.51 7.28-8.93 12.21-11.81 18.82-2.42 5.56-2.41 12.5-3.51 16.66-2.14 8.06-8.51 14.15-13.91 20.13a.93.93 0 01-1.54-.25q-.57-1.3-.75-2.89c-1.93-16.91 2.52-33.52 5.71-49.99 2.16-11.21-1.54-24.15 9.68-34.59q9.54-8.86 19.55-17.23c1.3-1.08 2.7-1.72 4.17-2.32z","M903.57 519.67a1.84 1.82-5.4 01-1.12-.92q-3.54-6.97-3.68-15.19c-.37-21.2 3.8-42.53 9.5-63.44q.33-1.23.92-.1 4.64 8.78 8.6 18.67c2.88 7.21 4.19 12.98 1.88 20.57q-6.07 19.96-14.02 39.23-.65 1.58-2.08 1.18z","M1213.94 424.56q-2.02-1.5-3.08-3.02-.31-.46-.22-1 3.32-19.22 6.42-38.46.09-.56.56-.25 14.9 9.82 24.8 22.71c9.8 12.75 9.72 30.37 5.41 45.13a2.62 2.62 0 01-3.76 1.57c-3.26-1.77-6.22-6.71-8.62-9.67-5.24-6.46-14.75-12-21.51-17.01z","M1246.2 534.5q-.95-.3-1.75-1.22c-4.65-5.4-9.13-9.88-11.46-15.51-2.96-7.13-1.37-15.5-5.64-22.09-4.06-6.26-8.72-9.91-10.89-17.58-1.62-5.68-2.81-11.46-4.97-17.02-4.56-11.69-6.45-20.86-3.33-33.56a.59.58-74 01.75-.42q1.69.56 3.22 1.79 11.23 9.08 21.54 19.18c5.39 5.28 6.92 10.13 7.24 18.16.9 22.52 10.62 44.97 6.59 67.49a1.01 1 13.9 01-1.3.78z","M1258.43 439.96q2.01 5.38 3.1 10.68c3.58 17.36 7.13 34.77 6.89 52.61q-.11 8.3-3.94 15.61a1.61 1.6 33.4 01-2.44.5c-1.45-1.19-1.9-3.58-2.43-4.94q-9.23-23.41-13.19-38.15c-2.63-9.81 6.82-27.63 11.53-36.35q.28-.5.48.04z"],
    "lower-back":["M986.76 627.1c-3.13-13.13-7.31-49.77 7.27-58.07 2.4-1.37 4.8-.82 6.7 1.29 6.15 6.8 16.22 18.56 18.77 28.15a1.35 1.3 52.6 01-.11.98c-2.51 4.53-9.96 8.09-15.83 11.36q-5.47 3.06-11.33 10.52c-1.23 1.56-2.6 4.3-4.5 6.06a.59.58-28.2 01-.97-.29z","M1023.15 607.96a2.06 2.04-74.3 01-.94-1.69c-.17-10.98 5.04-24.58 8.79-34.9q15.61-42.83 36-83.59a1.11 1.1-62.5 011.51-.48c1.25.66 3.21 12.98 3.46 15.08q6.94 59.25 2.82 116.88-.62 8.66-3.1 19.37-.13.53-.59.24l-47.95-30.91z","M1090.76 581.75q.62-5.16 0-10.27.22-29.79 3.05-59.5 1.1-11.58 3.91-22.88.31-1.27.44-1.43 1.08-1.43 1.88.17 23.38 46.97 40.14 96.18c1.8 5.28 5.84 16.69 4.38 22.96a1.64 1.64 0 01-.71 1.01l-47.63 30.72q-1.12.72-1.34-.6-4.54-28-4.12-56.36z","M1151.19 603.31q-5.39-3.38-2.19-9.05 8.03-14.22 17.88-24.62c3.49-3.69 9.04.89 10.97 3.99q2.92 4.66 3.8 10.14 3.5 21.77-1.21 43.02a.96.96 0 01-1.77.28c-6.92-11.85-16.03-16.56-27.48-23.76z"],
    "forearm":["M878.44 534.38a.15.15 0 01.18-.13c.47.12 6.68 15.77 7.07 17.22q6.66 24.73 5.52 50.29c-.4 8.9-3.45 17.35-6.64 25.55-7.94 20.38-17.41 41.88-29.59 60.09a1.04 1.02-54.2 01-1.49.25c-.34-.26.37-1.45.47-1.83q5.58-20.8 8.97-42.08 8.65-54.15 15.51-109.36z","M893 518.93a.39.38 24.6 01.69-.25q5.97 7.83 13.11 15.27c8.08 8.4 1.41 28.73-5.88 37.12a1.05 1.05 0 01-1.63-.05c-6.09-7.93-5.41-18.74-4.97-28.44.36-8.12-.76-15.7-1.32-23.65z","M869.06 547.19c2.16.36 1.67 6.21 1.57 7.8q-2.54 38.84-9.11 77.16c-3.04 17.71-8.47 41.3-22.09 54.09a.38.38 0 01-.62-.41c14.51-40.44 19-84.26 26.8-126.31q.9-4.88 1.48-10.82.18-1.81 1.97-1.51z","M864.24 682.58q15.09-28.18 25.12-58.55c8.14-24.63 13.67-42.4 20.79-60.35q3.31-8.37 12.08-9.63c1.35-.2 3.68-.75 4.86.21q1.13.93.61 2.3-5.8 15.45-12.04 29.88c-5.79 13.39-14.92 28.68-20.32 40.14-6.12 13-28.07 59.18-31.64 56.64a.21.21 0 01.03-.36q.15-.07.34-.13.12-.04.17-.15z","M1272.99 519.43c.27-.33.33-.75.75-1.05a.32.32 0 01.5.29c-.7 7.22-1.77 14.33-1.66 21.54.13 8.94 2.13 24-5.35 31.17q-.37.35-.73 0c-7.63-7.55-14.2-28.29-6.52-36.92q6.6-7.41 13.01-15.03z","M1312.82 688.04c-4.78-6.01-7.2-10.8-11.76-19.56q-12.39-23.79-21.03-47.53c-4.86-13.36-5.22-26.17-3.83-40.19q1.13-11.5 2.69-19.53 2.72-13.98 9.59-26.79a.17.17 0 01.32.06q7.26 63.12 17.22 120.49 2.43 14.04 7.03 30.55c.22.79.74 1.33.36 2.4a.34.34 0 01-.59.1z","M1296.52 558.51c-.22-2.94-1.44-10.25 2-12.04a.62.61-18.4 01.89.44q6.25 35.69 12.21 71.07c3.88 23 8.77 46.2 16.73 68.19a.29.29 0 01-.47.31c-11.67-10.67-18.09-31.15-20.89-45.98q-7.27-38.55-10.47-81.99z","M1303.5 683.6c-2.89-.66-10.16-13.21-12.11-17.02-8.8-17.21-16.92-34.81-25.84-51.89-5.36-10.27-10.98-20.49-15.39-30.95q-5.86-13.86-11.07-27.8a1.63 1.62 79.5 011.5-2.2c13.02-.16 15.5 7.18 19.65 18.81q9.04 25.33 17.43 50.89 9.65 29.37 23.82 56.84.87 1.69 2.13 3.12.24.28-.12.2z"],
    "gluteal":["M1045.06 626.19q1.42.61 4.11 4.4.27.39-.19.52c-14.47 4.12-26.13 7.4-38.13 15.77q-15.37 10.71-30.53 21.6a.55.54 74.9 01-.86-.5c1.19-13.13 10.35-35.23 20.46-45.06 9.14-8.88 34.99-1.11 45.14 3.27z","M1007.94 762.81c-16.94-16.64-29.37-37.66-31.47-61-2.06-22.84 15.63-34.95 32.18-45.71 8.2-5.33 46.51-27.32 54.37-17.65 5.92 7.29 13.38 15.84 15.44 25.21q3.01 13.63 2.44 27.6-.94 22.59-6.27 44.49c-2.43 9.96-2.9 17.16-2.59 26.75.47 14.83-18.52 17.18-29.12 14.07-6.38-1.87-13.79-4.83-21.35-6.25q-7.39-1.38-13.63-7.51z","M1117.94 631.04q-.13-.03-.27-.06-.12-.02-.06-.13 2.58-4.2 7.05-5.92 12.71-4.87 26.13-5.81c12.93-.91 17.1 3.08 23.28 13.06 5.71 9.22 13.32 24.7 13.44 36.06q.01.76-.61.32-16.65-11.74-33.2-23.51c-10.03-7.14-23.72-10.58-35.76-14.01z","M1124.12 776.61c-9.28 2.74-26.75 1.29-28.86-10.88-1.05-6.03.27-14.88-1.3-23.27q-.54-2.94-2.15-9.35c-3.2-12.81-4.02-23.33-5.08-35.27-1.07-12.03-.57-22 1.64-33.17q1.1-5.6 4.19-10.41 8.74-13.58 11.87-16.59c4.96-4.77 15.84.18 21.19 2.11q19.7 7.12 40.17 21.43c9.59 6.7 19.29 14.31 22.93 25.17 4.81 14.37-.65 33.88-7.42 46.87q-7.79 14.97-21.39 28.9-6.74 6.9-15.26 8.36c-7.07 1.21-13.68 4.08-20.53 6.1z"],
    "adductors":["M1070.06 785.19c2.95 1.36 1.8 10.43 1.49 13.04q-3.98 33.27-14.66 64.61a.39.39 0 01-.76-.17c.9-7.05 2.31-14.29 2.16-20.92q-.68-30.14-18.71-54.52-.29-.39.18-.49c7.42-1.52 23.53-4.69 30.3-1.55z","M1127.24 787.66c-15.99 21.49-22.3 48.51-16.08 74.83a.47.46-63.2 01-.88.29q-1.99-4.69-3.65-10.24-8.29-27.75-11.6-56.54c-.65-5.71-1.1-11.77 6.87-11.9q13-.19 25.68 2.83a.31.24 41.2 01.1.53q-.12.01-.27.07-.1.04-.17.13z"],
    "hamstring":["M963.27 741.53a.71.7 31.7 011.19-.28q1.51 1.62 2.47 3.99c4.6 11.41 8.93 22.66 11.07 34.72 3.38 19.14 4.84 38.23 3.12 57.74q-1.68 19.06-2.99 38.15c-.51 7.55-.88 15.71.07 23.18q1.08 8.54 1.39 17.57a.52.52 0 01-.98.25q-1.03-2.07-1.8-4.62-5.13-16.92-7.25-34.49-5.01-41.45-6.86-83.17-1.09-24.75-.07-49.51.06-1.59.64-3.53z","M1030.2 791.53q.17-.36.38-.03c5.26 8.11 9.94 16.15 12.47 25.64 3.12 11.72 5.87 24.36 4.31 36.24q-.5 3.8-3.57 14.02c-10.75 35.81-12.83 74.2-18.5 111.1q-.82 5.4-2.55 10.55-.23.68-.59.07c-4.72-8.07-5.18-25.09-5.34-34.81-.7-43.69 1.92-87.82 6.38-131.28 1.41-13.74 1.99-21.15 7.01-31.5z","M998.81 761.94q14.07 14.17 20.1 33.62c.98 3.15-.78 9.61-.93 12.91q-1.3 27.63-2.3 55.27c-.55 15.31-1.54 30.27-5.12 45.26q-8.62 36.18-22.76 68.73-3.65 8.41-10.15 17.19-.45.61-.41-.14c.11-1.93.82-4.15.99-5.71q2.45-22.72 6.08-45.26c2.83-17.66 4.18-35.95 4.33-52.37.33-36.43-.75-73.34 1.47-109.68.33-5.32 1.07-16.16 4.7-20.25q.33-.36.81-.45 1.95-.37 3.19.88z","M1052.52 855.62a.04.04 0 01.08.01q1.07 9.9 2.17 19.87.33 3.04-2.37 14.18c-3.83 15.8-8.15 31.11-8.9 47.47-.99 21.61-3.11 45.66-9.92 66.3q-1.49 4.52-.87-.2 3.38-25.36 3.7-51.99c.05-3.74-.4-10.32.2-15.58 2.19-19.2 7.39-38.25 11.75-57.05 1.78-7.64 2.93-15.21 4.16-23.01z","M1183.25 947.53c2.57 14.85 4.32 31.11 6.22 46.14q.35 2.74-1.11.39c-14.67-23.67-23.34-52.15-30.55-79.32q-5.08-19.14-5.97-39.05-1.36-30.37-2.44-60.74c-.22-6.09-2.56-15.63-.55-21.57q5.87-17.35 18.96-31.07c10.77-11.28 10.17 46.55 10.16 48.97-.13 41.09-.45 74.18 1.91 110.07.57 8.75 1.88 17.53 3.37 26.18z","M1136.43 791.52q.27-.42.49.03c3.12 6.46 4.84 12.26 5.68 19.83 5.07 45.8 8.05 94.61 7.56 140.76-.13 11.8-.46 26.22-5.13 37.08a.44.44 0 01-.83-.06q-2.51-9.14-3.69-18.41-3.54-27.64-7.36-55.24c-2.49-18-5.47-35.67-11.09-52.26q-4.35-12.82-2.08-26.75c1.76-10.77 3.58-21.61 8.46-31.16q3.58-6.99 7.99-13.82z","M1115.03 856.73c2.03 18.72 7.11 37.44 11.47 55.77 2.25 9.46 3.94 19.51 3.95 30.11q.02 31.7 4.08 63.16.16 1.26-.29.07-2.7-7.15-4.19-14.6c-4.44-22.21-5.71-40.52-6.87-61.23-.24-4.24-1.19-9.64-2.23-13.92q-3.94-16.25-7.7-32.55c-2.09-9.04.08-18.69 1.6-27.66q.07-.38.32-.09.16.19.01.4-.19.24-.15.54z","M1202.61 741.08a.44.44 0 01.72.03c.52.82.9 1.86.95 2.91q.73 15.98.37 31.97-1.16 52.95-7.85 105.49-1.88 14.74-5.97 29.04-1 3.52-1.92 4.95-1.57 2.47-1.39-.37c.58-9.44 1.83-19.17 1.71-28.16-.32-24.52-4.94-49.11-3.95-72.75.69-16.54 2.5-33.51 7.54-49.38q2.99-9.4 6.61-18.6.74-1.88 3.18-5.13z"],
    "calves":["M982.69 1149.31c-3.07-2.23-3.98-6.24-5.24-11.03-7.19-27.14-7.88-53.18-6.67-82.78q1.03-25.29 9.23-47.45c4.77-12.89 15.33-24.77 23.79-36q.82-1.09.74.27c-1.37 22.86-2.72 45.67-3.11 68.49-.52 30.56-1.51 61.11-.42 91.68.24 6.83-2.77 16.29-10.08 18.37q-4.39 1.25-8.24-1.55z","M983.99 1163.56c7.15-5.59 16.16-.63 17 8.23q4.31 45.02 5.22 90.26c.16 8.25-.8 15.79-2.19 23.65q-.45 2.52-1.43 3.66-.95 1.11-1.22-.33c-5.03-26.7-8.28-53.49-11.87-80.36q-1.68-12.52-3.24-18.71-2.04-8.12-5.53-18.24c-1.03-3 .8-6.25 3.26-8.16z","M1013.69 1150.31c-4.8-2.61-4.66-16.17-4.36-20.75 2.34-36.49 3.44-73.94 1.04-110.45-1.03-15.55.02-31.49.62-47.06q.03-.66.25-.03c2.28 6.45 4.52 12.88 7.39 19.11 5.12 11.14 11.5 22.91 14.83 33.92q2.34 7.74 3.97 16.46 5.3 28.43 5.62 56.09c.2 18.32-7.9 40-22.63 51.79q-3.42 2.73-6.73.92z","M1014.14 1164.37c7-1.83 14.1 2.2 14.11 9.95q.06 29.04-5.62 57.41c-3.87 19.28-6.24 38.23-8.43 57.48a.37.37 0 01-.74-.01q-3.12-43.48-3.58-86.64-.15-14.16.76-28.3c.18-2.83.02-8.98 3.5-9.89z","M1172.94 1149.31c-6.06-4.56-6.94-11.4-6.8-19.4.96-52.67-.49-105.31-3.54-157.9q-.04-.72.41-.16 7.96 10.07 15.43 20.44c9.11 12.64 13.61 28.98 15.78 44.21 4.96 34.71 3.75 72.94-5.97 106.5-1.97 6.82-9.18 10.93-15.31 6.31z","M1144.41 1147.33q-17.19-17.37-20.08-40.86-.89-7.22-.13-19.97 1.18-20.06 4.69-41.33c2.33-14.1 5.8-25.22 12.41-38.61q8.19-16.59 14.35-34.15a.14.13-37.7 01.26.03q1.01 15.71 1.26 31.44c.18 11.61-1.34 24.91-1.58 36.43-.72 34.7 1.22 62.05 2.06 93.19.17 6.32-1.1 26.1-13.24 13.83z","M1173.74 1161.73c6.88-2 14.34 3.23 11.98 10.91-2.24 7.3-4.78 14.44-5.99 21.96-5.07 31.52-8.04 63.18-14.13 94.6a.72.71-61.9 01-1.21.37c-.14-.14-.35-.39-.4-.59q-3.53-13.58-3.19-28.23 1.04-44.67 5.06-87.04c.58-6.1 1.93-10.25 7.88-11.98z","M1154.32 1165a1.58 1.57-84.6 01.97 1.18c.79 4.42 1.42 8.78 1.57 13.4.96 29.17-.47 62.66-2.04 90.23q-.78 13.79-1.39 19.52a.23.23 0 01-.45 0c-2.79-21.25-5.41-41.99-9.64-63.03-3.44-17.08-4.29-34.91-4.68-52.3-.19-8.37 8.99-11.61 15.66-9z"],
    "ankles":["M998.25 1320.52c-4.62.24-8.17-1.08-8.78-6.28-1.6-13.81-.75-28.85-2.16-42.41q-.39-3.74.24-7.03a.69.69 0 011.23-.28c2.35 3.15 4.22 5.75 5.14 9.66 1.54 6.57 1.91 22.57 9.97 24.09q13.33 2.5 15.93-10.47c.92-4.57 1-12.33 5.05-17.25q.42-.51.42.15c.11 14.39.4 30.86-3.08 44.54-.79 3.13-3.31 4.23-6.51 4.4q-8.73.45-17.45.88z","M1149.5 1319.51c-6.93-.63-6.82-18.08-7.14-23.7q-.73-12.53-.59-25.09.01-.71.45-.15 2.74 3.49 3.29 7.17c1.67 11.25 3.21 25.34 19.7 19.99 4.87-1.58 7.03-18.57 7.89-23.21.79-4.2 2.74-7 5.28-10.13a.56.56 0 01.98.22c1.12 4.6.04 12.39-.37 17.26-.92 10.77-.32 21.48-1.52 32.37q-.7 6.23-7.01 6.18-12.13-.11-20.96-.91z"],
    "feet":["M962.87 1327.38q-.62-.51-.05-1.07l1.99-1.99q.39-.39.93-.41 25.66-.82 51.26 1 1.34.1 4.43 1.47.46.2.69.64 1.84 3.5 2.87 7.23c2.32 8.38-6.63 7.24-12.23 6.68q-15.37-1.53-30.5-4.56c-8.21-1.65-13.33-3.95-19.39-8.99z","M1154.35 1341.35c-12.48 1.36-13.27-3.88-8.67-13.37 1.82-3.76 12.72-3.65 16.39-3.77q19.44-.63 38.9-.44c2.41.02 3.31 1 4.61 2.76q.32.44-.09.79c-5.43 4.67-10.52 7.17-17.95 8.74q-16.46 3.47-33.19 5.29z"],
    "hands":["M789.41 726.84c3.98-6.79 9.89-14.6 16.56-20.14a.31.31 0 01.48.35c-4.39 11.06-5.38 21.94-14.02 30.72-5.82 5.93-10.7 9.81-19.04 8.57q-.55-.08-.59-.63c-.24-3.07-.26-7.29 3.1-8.85 4.82-2.26 10.72-5.28 13.51-10.02z","M807.27 745.31c17.61 3.49 2.75 13.52-.73 18.99q-10.05 15.82-21.86 30.37-1.56 1.92-2.52-.58a2.41 2.33-55.4 01-.16-.96q.2-5.26 2.75-9.71c6.94-12.09 13.12-24.52 19.72-36.79q.91-1.7 2.8-1.32z","M819.3 744.82c-7.79-6.06-14.51-12.4-11.88-23.38 3.07-12.83 14.66-20.7 25.14-26.38 9.57-5.18 37.61-.75 37.6 13.68q-.01 16.24-3.67 31.99c-2.38 10.26-4.49 16.44-16.87 16.3-10.71-.13-21.93-5.7-30.32-12.21z","M827.99 758.27a2.08 2.07 26.6 01.91 2.73q-10.47 22.03-19.66 45.04-2.25 5.63-8.23 6.74a1.45 1.44 84.3 01-1.7-1.4q-.1-4.29 1.51-8.31 7.3-18.34 13.86-36.96c.74-2.1 1.53-6.08 2.97-8.96q.26-.5.82-.57 5.05-.64 9.52 1.69z","M841.68 762.32a.76.75-79.1 01.6.89q-4.51 23.14-9.28 45.87c-.73 3.49-2.09 5.73-5.85 5.43q-.52-.04-.61-.56-.74-4.54-.32-7.21 2.89-18.57 5.59-37.18.38-2.65 1.67-8.22.13-.54.68-.44l7.52 1.42z","M854.75 799.53a.78.78 0 01-1.37-.02q-.91-1.75-1.15-4.29-1.62-16.58-1.2-33.25a.84.84 0 01.61-.78l7.09-1.93q.59-.16.56.45-.58 14.77-1.12 29.56c-.14 4.06-1.54 6.86-3.42 10.26z","M1336.39 751.96c-8.72 4.49-29.38 10.28-33.61-3.6q-5.68-18.65-5.83-38.24c-.06-7.59 4.01-11.75 11.09-14.08 8.85-2.92 19.02-5.3 27.54-.35 8.74 5.09 18.39 11.28 22.45 21.01 3.05 7.3 3.34 13.66-1.78 20.01-5.21 6.47-12.49 11.45-19.86 15.25z","M1374.32 737.5c-8.05-8.14-9.61-19.67-13.85-30.75a.22.22 0 01.35-.24q10.3 8.96 17.1 20.77c2.57 4.47 9.08 7.59 13.57 9.79 3.11 1.52 2.96 5.9 2.71 8.73q-.05.52-.57.59c-8.87 1.17-13.48-2.98-19.31-8.89z","M1383.76 795.45c-.59-.21-.96-.17-1.39-.68-8.84-10.3-15.85-21.5-23.44-32.41-2.81-4.02-8.81-7.64-7.45-13.14q.15-.6.7-.84l7.85-3.44q.66-.29 1.13.25 2.36 2.73 4.17 6.49 7.36 15.23 16.89 31.47c2.33 3.96 3.04 7.59 2.32 11.85a.58.58 0 01-.78.45z","M1365.79 812.62c-2.7-.28-6.42-2.66-7.49-5.33q-8.74-21.76-19.85-45.74c-2.12-4.58 6.55-5.17 9.12-5.21 1.8-.03 1.93.71 2.38 2.18q5.72 18.34 15.35 42.12c.74 1.84 4.81 12.43.49 11.98z","M1308.16 759.17l7.44 2.1q.23.07.24.31.75 16.26-.86 32.41-.3 3-1.25 5.48a.79.79 0 01-1.42.12q-3.9-6.58-3.82-13.9.16-13.07-.83-26.11-.05-.57.5-.41z","M1340.07 814.35c-2.7.82-4.99-1.16-5.54-3.71q-5.06-23.49-9.82-47.47a.77.76-10.7 01.62-.9l7.52-1.38q.59-.11.73.47c2.08 8.53 3.26 19.85 4.22 25.75q2.09 12.92 3.19 21.14.34 2.54-.33 5.46a.86.84 88.4 01-.59.64z"],
    "head":["M1028.14 166.45c1.03 5.06 1.36 9.61 6.41 11.53 13.06 4.95 16.74 15.51 23.52 27.48 1.387 2.447 3.863 3.623 7.43 3.53a910.025 910.025 0 0136.94-.25c6.23.09 9.27-7.55 11.48-12.3 4.31-9.27 10.37-15.83 20.28-18.94.333-.1.603-.287.81-.56 1.92-2.58 3.043-5.43 3.37-8.55l2.31-1.51a.977.977 0 01.99-.08c11.92 5.42-3.35 35.31-8.21 42.45-.761 1.11-2.423 1.028-3.06-.15l-1.26-2.32c-.133-.253-.32-.297-.56-.13-.34.24-.48.61-.42 1.11.86 7.64.75 16.87-2.96 23.31-.173.3.839.041-3.7 4.71-3.34 3.436-74.18 3.78-75.48-1.38a1.465 1.465 0 00-.55-.82c-4.15-2.97-6.07-7.95-6.16-12.39-.03-1.68.18-14.28-.53-14.63-.207-.1-.33-.037-.37.19-.3 1.553-1.183 2.597-2.65 3.13a.951.951 0 01-1.07-.32c-7.29-9.56-12.32-22.18-12.97-33.54-.34-6.04 1.797-9.23 6.41-9.57zm29.95 61.71c.173 14.187 18.967 14.703 19.1-1.37.03-4.05-.38-6.54-4.68-7.3-4.2-.75-11.87-1.47-13.85 2.91-.413.92-.603 2.84-.57 5.76zm31.71-3.35c.36 19.647 18.59 14.82 18.87 5.94.13-3.9 1.32-9.43-2.88-10.79-4.25-1.38-16.12-2.54-15.99 4.85z"],
    "hair":["M1138.38 168.39q-.49 4.68-3.37 8.55-.31.41-.81.56c-9.91 3.11-15.97 9.67-20.28 18.94-2.21 4.75-5.25 12.39-11.48 12.3q-18.46-.25-36.94.25-5.35.14-7.43-3.53c-6.78-11.97-10.46-22.53-23.52-27.48-5.05-1.92-5.38-6.47-6.41-11.53q-6.64-26.16 4.43-48.88c8.13-16.7 34.61-21.41 51.58-21.04 4.89.11 9.69-.11 14.42.85 18.79 3.8 33.17 8.5 39.34 28.66q6.38 20.88.47 42.35z"]
  }
};

// slug -> nombre muscular español (slugs no listados se dibujan como base)
const SLUG_MUSCLE = {
  front: { chest:"Pectoral", deltoids:"Deltoides", biceps:"Bíceps", triceps:"Tríceps",
           forearm:"Antebrazo", quadriceps:"Cuádriceps", abs:"Abdominales",
           calves:"Gemelos", trapezius:"Espalda" },
  back:  { deltoids:"Deltoides", triceps:"Tríceps", forearm:"Antebrazo", gluteal:"Glúteos",
           hamstring:"Isquios", calves:"Gemelos", trapezius:"Espalda",
           "upper-back":"Espalda", "lower-back":"Espalda" }
};

/* ===== MAPA DE CALOR MUSCULAR ===== */
function MuscleHeatmap({ exlog, days, onChangeDays, decay = false }) {
  const muscleWeekly = useMemo(() => {
    const now = Date.now();
    // decay solo aplica en la ventana de 7 días
    const effectiveDecay = decay && days <= 7;
    const cutoff = days >= 999 ? 0 : now - days * 86400000;
    const counts = {};
    let minDate = Infinity;
    Object.entries(exlog || {}).forEach(([exName, sets]) => {
      const muscles = (MUSCLES[exName] || []).map(m => m === "Deltoide ant." ? "Deltoides" : m);
      (sets || [])
        .filter(s => s?.date && s.type !== "warmup" && (days >= 999 || new Date(s.date).getTime() >= cutoff))
        .forEach(s => {
          const t = new Date(s.date).getTime();
          if (t < minDate) minDate = t;
          // En 7d: peso lineal 1.0→0 según días transcurridos
          const weight = effectiveDecay ? Math.max(0, 1 - (now - t) / (7 * 86400000)) : 1;
          if (weight > 0) muscles.forEach(m => { counts[m] = (counts[m] || 0) + weight; });
        });
    });
    // Normalize to sets/week (decay: divide by 1 — weights ya encodifican recencia)
    let weeks;
    if (effectiveDecay) {
      weeks = 1;
    } else if (days >= 999) {
      weeks = minDate < Infinity ? Math.max(1, (now - minDate) / (7 * 86400000)) : 1;
    } else {
      weeks = days / 7;
    }
    const result = {};
    Object.entries(counts).forEach(([m, n]) => { result[m] = Math.round((n / weeks) * 10) / 10; });
    return result; // setsPerWeek per muscle (o score ponderado si decay=true)
  }, [exlog, days, decay]);

  const BASE = { fill: "rgba(38,50,30,0.92)", stroke: "rgba(70,92,54,0.55)" };
  const heat = (name) => {
    const spw = muscleWeekly[name] || 0;
    if (!spw) return BASE;
    const pct = Math.min(1, spw / 20);
    const a = 0.28 + pct * 0.72;
    return { fill: `rgba(255,86,108,${a.toFixed(2)})`, stroke: `rgba(255,150,160,${Math.min(1, a + 0.15).toFixed(2)})` };
  };

  // Dibuja un lado del cuerpo con paths anatómicos reales (función, no componente)
  const renderSide = (side) => {
    const map = SLUG_MUSCLE[side] || {};
    return (
      <>
        {Object.entries(MUSCLE_PATHS[side]).map(([slug, paths]) => {
          const muscle = map[slug];
          const st = muscle ? heat(muscle) : BASE;
          return paths.map((d, i) => (
            <path key={slug + i} d={d} fill={st.fill} stroke={st.stroke}
              strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
          ));
        })}
        <path d={BODY_OUTLINE[side]} fill="none" stroke="rgba(110,135,82,0.7)"
          strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round"/>
      </>
    );
  };

  const sorted = Object.entries(muscleWeekly).sort(([,a],[,b]) => b - a);
  const total = Object.values(muscleWeekly).reduce((s,v) => s+v, 0);

  return (
    <div style={{background:"var(--panel-bg-sec)", border:"1px solid var(--line-color)", borderRadius:14, padding:14}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
        <div style={{fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".08em"}}>
          🔥 Mapa Muscular
        </div>
        <div style={{display:"flex", gap:4}}>
          {[[7,"7 días"],[30,"30 días"],[999,"Todo"]].map(([d,lbl]) => (
            <button key={d} onClick={() => onChangeDays(d)} className="btn-active-scale"
              style={{padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:800, cursor:"pointer",
                background: days===d ? "rgba(205,255,74,0.15)" : "var(--panel-bg)",
                border: `1px solid ${days===d ? "rgba(205,255,74,0.5)" : "var(--line-color)"}`,
                color: days===d ? "var(--accent-primary)" : "var(--text-muted)"}}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <div style={{textAlign:"center", padding:"18px 0", fontSize:11, color:"var(--text-muted)"}}>
          Registra series en el tab Entreno para activar el mapa de calor.
        </div>
      ) : (
        <>
          <div style={{display:"flex", justifyContent:"center", gap:6}}>
            <div style={{textAlign:"center"}}>
              <svg viewBox="0 0 724 1448" style={{width:128, height:256, display:"block"}}>
                {renderSide("front")}
              </svg>
              <div style={{fontSize:9, fontWeight:700, color:"var(--text-muted)", letterSpacing:".07em"}}>FRENTE</div>
            </div>
            <div style={{textAlign:"center"}}>
              <svg viewBox="724 0 724 1448" style={{width:128, height:256, display:"block"}}>
                {renderSide("back")}
              </svg>
              <div style={{fontSize:9, fontWeight:700, color:"var(--text-muted)", letterSpacing:".07em"}}>ESPALDA</div>
            </div>
          </div>

          {/* Barra leyenda */}
          <div style={{padding:"8px 4px 0"}}>
            <div style={{height:7, borderRadius:99, background:"linear-gradient(to right,rgba(38,50,30,0.92),rgba(255,86,108,0.5),rgba(255,86,108,1))"}}/>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:9, color:"var(--text-muted)", marginTop:3}}>
              <span>0</span><span>Series / sem</span><span>≥20/sem</span>
            </div>
          </div>

          {/* Chips de músculos más trabajados */}
          <div style={{marginTop:10, display:"flex", gap:5, flexWrap:"wrap"}}>
            {sorted.slice(0,7).map(([m,s]) => {
              const a = Math.min(1, 0.2 + (s/20)*0.8);
              return (
                <span key={m} style={{fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20,
                  background:`rgba(255,86,108,${(a*0.22).toFixed(2)})`,
                  border:`1px solid rgba(255,86,108,${(a*0.55).toFixed(2)})`,
                  color:`rgba(255,120,135,${a.toFixed(2)})`}}>
                  {m} · {s.toFixed(1)}/sem
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ===== AGENTE ENTRENADOR ===== */
function TrainerAgent({ onClose, data, busy, onRunAnalysis, generateWeeklyPDF, pdfBusy, exlog, exercises, notes, metricslog, splits, plateauAlerts, overloadSuggestions, muscleImbalances }) {
  const local = data?._local || null;

  const [heatmapDays, setHeatmapDays] = useState(7);

  const muscleVol = React.useMemo(() => {
    if (local?.muscleVol) return local.muscleVol;
    return calcMuscleVolumeBalance(exlog, exercises, heatmapDays);
  }, [local, exlog, exercises, heatmapDays]);

  const weeklyLoad = React.useMemo(() => local?.weeklyLoad || calcWeeklyTrainingLoad(exlog), [local, exlog]);
  const deloadCheck = React.useMemo(() => local?.deloadCheck || detectDeloadNeed(exlog, notes, metricslog), [local, exlog, notes, metricslog]);

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

        {/* Muscle Heatmap con decay temporal — intensidad se diluye hasta desaparecer a los 7 días */}
        <MuscleHeatmap exlog={exlog} days={heatmapDays} onChangeDays={setHeatmapDays} decay={true}/>

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
          <div style={{fontSize:10, fontWeight:700, color:"#9aa088", letterSpacing:".08em", marginBottom:2}}>
            BALANCE MUSCULAR · series/sem {heatmapDays >= 999 ? "(todo)" : `(${heatmapDays}d)`}
          </div>
          <div className="volume-balance-grid">
            {Object.entries(muscleVol).map(([muscle, d]) => {
              const sc = STATUS_COLORS[d.status];
              return (
                <div key={muscle} title={d.recommendation} style={{background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:8, padding:"7px 8px"}}>
                  <div style={{fontSize:9, fontWeight:700, color:"#9aa088", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{muscle.toUpperCase()}</div>
                  <div style={{fontSize:18, fontWeight:900, color:sc.text, lineHeight:1}}>{d.setsPerWeek}</div>
                  <div style={{fontSize:8, color:sc.text, marginTop:1, opacity:.8}}>{d.status === "neglected" ? "sin trabajo" : d.status === "low" ? "bajo" : d.status === "high" ? "alto" : "óptimo"}</div>
                  {d.setsPerWeek < 10 && <div style={{fontSize:7, color:"#9aa088", marginTop:2, opacity:.7}}>↑ MEV: 10</div>}
                  {d.setsPerWeek > 18 && <div style={{fontSize:7, color:C.amber, marginTop:2, opacity:.85}}>⚠ cerca MRV (20)</div>}
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

        {/* PDF para coach */}
        {generateWeeklyPDF && (
          <>
            <button
              onClick={generateWeeklyPDF}
              disabled={pdfBusy || busy}
              style={{width:"100%", padding:"13px 0", borderRadius:12, border:`1px solid ${C.amber}`, cursor:(pdfBusy||busy)?"not-allowed":"pointer", background:"transparent", color:C.amber, fontWeight:800, fontSize:13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:(pdfBusy||busy)?0.6:1, transition:"opacity .2s"}}
            >
              {pdfBusy ? <><Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/>Generando… (30–60 seg)</> : <>📄 PDF para mi coach</>}
            </button>
            {!pdfBusy && <p style={{fontSize:10.5, color:C.muted, textAlign:"center", marginTop:4}}>Analiza 8 semanas con IA — puede tardar ~1 minuto ☕</p>}
          </>
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

/* ===== MODO FOCO ===== */
function FocusMode({ onClose, splits, exlog, exercises }) {
  // Helper: get muscle list for any exercise (MUSCLES constant + custom exercises fallback)
  const getMuscles = (name) => {
    if (MUSCLES[name]) return MUSCLES[name];
    const allExs = Object.values(exercises || {}).flat();
    return allExs.find(e => e.name === name)?.musculos || [];
  };
  const circuitSplit = splits.find(s => s.key === "E") || DEFAULT_SPLITS.find(s => s.key === "E");
  const circuitExs = circuitSplit?.ex || [];
  const exDuration = 60;
  const [formCues, setFormCues] = useState({});
  const [formCueBusy, setFormCueBusy] = useState({});
  const today = new Date().toISOString().slice(0, 10);
  const sessionStartRef = useRef(Date.now());
  const [showHydrationAlert, setShowHydrationAlert] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - sessionStartRef.current) / 60000;
      if (elapsed >= 45 && !showHydrationAlert) setShowHydrationAlert(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [showHydrationAlert]);
  const [setsDone, setSetsDone] = useState({});
  useEffect(() => {
    loadKey("focus_sets_" + today, {}).then(saved => {
      if (saved && Object.keys(saved).length) setSetsDone(saved);
    });
  }, [today]);
  useEffect(() => {
    if (Object.keys(setsDone).length) saveKey("focus_sets_" + today, setsDone);
  }, [setsDone, today]);
  const markSetDone = (exName) => {
    setSetsDone(prev => ({ ...prev, [exName]: (prev[exName] || 0) + 1 }));
    // Auto-suggest rest based on last logged reps
    const lastSets = (exlog[exName] || []).slice(0, 3);
    const avgReps = lastSets.length > 0
      ? Math.round(lastSets.reduce((s,e) => s + (parseFloat(e.reps) || 8), 0) / lastSets.length)
      : 8;
    const suggestedRest = avgReps <= 5 ? 180 : avgReps <= 10 ? 120 : 60;
    setRestTotal(suggestedRest);
    startRest();
  };
  const resetSets = (exName) => setSetsDone(prev => ({ ...prev, [exName]: 0 }));

  const generateFormCue = async (exName) => {
    if (formCues[exName] || formCueBusy[exName]) return;
    setFormCueBusy(prev => ({ ...prev, [exName]: true }));
    try {
      const tip = await callGemini(
        [{ role: "user", content: `Dame UN tip conciso de técnica de ejecución para: ${exName}. Máx 2 oraciones. Enfocate en el error más común y cómo corregirlo.` }],
        "Eres un entrenador experto en biomecánica. Responde en español, directo y técnico. Sin preámbulos."
      );
      setFormCues(prev => ({ ...prev, [exName]: tip?.trim() || "" }));
    } catch (_) {}
    setFormCueBusy(prev => ({ ...prev, [exName]: false }));
  };

  // --- WAKE LOCK: mantener pantalla encendida mientras el panel esté abierto ---
  const wakeLockRef = useRef(null);
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    navigator.wakeLock.request("screen").then(wl => { wakeLockRef.current = wl; }).catch(() => {});
    return () => { if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; } };
  }, []);

  // --- REST TIMER ---
  const [restTotal, setRestTotal] = useState(90);
  const [restElapsed, setRestElapsed] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const restIntervalRef = useRef(null);
  const restRemaining = Math.max(0, restTotal - restElapsed);

  useEffect(() => {
    if (!restRunning) { clearInterval(restIntervalRef.current); return; }
    restIntervalRef.current = setInterval(() => {
      setRestElapsed(prev => {
        const next = prev + 1;
        if (next >= restTotal) {
          clearInterval(restIntervalRef.current);
          setRestRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return restTotal;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(restIntervalRef.current);
  }, [restRunning, restTotal]);

  const startRest = () => { setRestElapsed(0); setRestRunning(true); };
  const stopRest = () => { clearInterval(restIntervalRef.current); setRestRunning(false); setRestElapsed(0); };
  const setPreset = (s) => { setRestTotal(s); setRestElapsed(0); setRestRunning(false); };

  // --- CIRCUIT TIMER ---
  const [circuitRunning, setCircuitRunning] = useState(false);
  const [totalSecs, setTotalSecs] = useState(0);
  const circuitIntervalRef = useRef(null);
  const prevBoundaryRef = useRef(-1);

  const currentExIdx = circuitExs.length > 0 ? Math.floor(totalSecs / exDuration) % circuitExs.length : 0;
  const currentRound = circuitExs.length > 0 ? Math.floor(totalSecs / (exDuration * circuitExs.length)) + 1 : 1;
  const secsInEx = exDuration - (totalSecs % exDuration);
  const nextExIdx = (currentExIdx + 1) % circuitExs.length;

  useEffect(() => {
    if (!circuitRunning) { clearInterval(circuitIntervalRef.current); return; }
    circuitIntervalRef.current = setInterval(() => {
      setTotalSecs(prev => {
        const next = prev + 1;
        const boundary = Math.floor(next / exDuration);
        if (boundary > prevBoundaryRef.current) {
          prevBoundaryRef.current = boundary;
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(circuitIntervalRef.current);
  }, [circuitRunning]);

  const startCircuit = () => { setTotalSecs(0); prevBoundaryRef.current = -1; setCircuitRunning(true); };
  const stopCircuit = () => { clearInterval(circuitIntervalRef.current); setCircuitRunning(false); setTotalSecs(0); prevBoundaryRef.current = -1; };

  const fmtTime = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const MUSCLE_COLORS = { "Cuádriceps":C.lime, "Glúteos":C.lime, "Isquios":C.lime, "Pectoral":C.cyan, "Tríceps":C.cyan, "Espalda":C.amber, "Deltoides":C.amber, "Bíceps":C.rose };
  const exColor = (name) => MUSCLE_COLORS[getMuscles(name)[0]] || C.muted;

  // --- CARRUSEL POR SPLIT ---
  const [focusSplit, setFocusSplit] = useState(splits[0]?.key || "A");
  const [overrides, setOverrides] = useState({});

  const getLastEntry = (exName) => {
    const work = (exlog[exName] || []).filter(s => s.type !== "warmup");
    if (work.length === 0) return { w: 0, reps: "8" };
    const last = [...work].sort((a,b) => b.date < a.date ? -1 : (b.date > a.date ? 1 : 0))[0];
    return { w: parseFloat(last.w) || 0, reps: String(parseInt(last.reps) || 8) };
  };
  const getVals = (exName) => overrides[exName] || getLastEntry(exName);
  const adjWeight = (exName, delta) => {
    const cur = getVals(exName);
    setOverrides(prev => ({ ...prev, [exName]: { ...cur, w: Math.max(0, (cur.w||0) + delta) } }));
  };
  const adjReps = (exName, delta) => {
    const cur = getVals(exName);
    setOverrides(prev => ({ ...prev, [exName]: { ...cur, reps: String(Math.max(1, (parseInt(cur.reps)||8) + delta)) } }));
  };
  const triggerRest = () => { stopRest(); setRestElapsed(0); setRestRunning(true); };

  return (
    <div className="trainer-agent-sheet" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="trainer-agent-panel">

        {/* Header */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <Clock size={16} color={C.cyan}/>
            <span style={{fontFamily:"var(--font-display)", fontSize:20, letterSpacing:".05em", color:C.ink}}>MODO FOCO</span>
          </div>
          <button onClick={onClose} style={{background:"none", color:C.muted, cursor:"pointer", padding:4, display:"flex", border:"none"}}><X size={20}/></button>
        </div>

        {/* Hydration alert after 45 min */}
        {showHydrationAlert && (
          <div style={{background:`${C.cyan}18`, border:`1px solid ${C.cyan}44`, borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8}}>
            <span style={{fontSize:12.5, color:C.cyan}}>💧 Llevas +45 min entrenando — bebe agua ahora</span>
            <button onClick={() => setShowHydrationAlert(false)} style={{background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16, lineHeight:1}}>×</button>
          </div>
        )}

        {/* REST TIMER */}
        <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:14, padding:16}}>
          <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".08em", marginBottom:12}}>⏱ Timer de Descanso</div>

          <div style={{textAlign:"center", marginBottom:8}}>
            <span style={{fontFamily:"var(--font-display)", fontSize:60, lineHeight:1, color: restRunning ? C.lime : C.ink, transition:"color .3s"}}>
              {fmtTime(restRemaining)}
            </span>
          </div>

          <div style={{height:5, background:C.line, borderRadius:99, marginBottom:12, overflow:"hidden"}}>
            <div style={{height:"100%", width:`${restTotal > 0 ? (restElapsed/restTotal)*100 : 0}%`, background:C.lime, borderRadius:99, transition:"width .8s linear"}}/>
          </div>

          <div style={{display:"flex", gap:5, marginBottom:8}}>
            {[60,90,120,180].map(s => (
              <button key={s} onClick={() => setPreset(s)}
                style={{flex:1, padding:"5px 0", borderRadius:6, background: restTotal===s ? "rgba(205,255,74,0.12)" : C.panel, border:`1px solid ${restTotal===s ? "rgba(205,255,74,0.5)" : C.line}`, color: restTotal===s ? C.lime : C.muted, fontSize:11, fontWeight:800, cursor:"pointer"}}>
                {s}s
              </button>
            ))}
          </div>

          <div style={{display:"flex", gap:6}}>
            <button onClick={() => setPreset(Math.max(10, restTotal-10))}
              style={{flex:1, padding:"9px 0", borderRadius:8, background:C.panel, border:`1px solid ${C.line}`, color:C.muted, fontSize:13, fontWeight:700, cursor:"pointer"}}>−10s</button>
            <button onClick={restRunning ? stopRest : startRest}
              style={{flex:2, padding:"9px 0", borderRadius:8, background: restRunning ? "rgba(255,107,138,0.12)" : "rgba(205,255,74,0.12)", border:`1px solid ${restRunning ? "rgba(255,107,138,0.4)" : "rgba(205,255,74,0.35)"}`, color: restRunning ? C.rose : C.lime, fontSize:14, fontWeight:800, cursor:"pointer"}}>
              {restRunning ? "⏹ Parar" : "▶ Iniciar"}
            </button>
            <button onClick={() => setPreset(Math.min(300, restTotal+10))}
              style={{flex:1, padding:"9px 0", borderRadius:8, background:C.panel, border:`1px solid ${C.line}`, color:C.muted, fontSize:13, fontWeight:700, cursor:"pointer"}}>+10s</button>
          </div>
        </div>

        {/* CIRCUIT */}
        <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:14, padding:16}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
            <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".08em"}}>🏃 Circuito Sin Equipo</div>
            {circuitRunning && (
              <div style={{fontSize:11, fontWeight:800, color:C.cyan, background:"rgba(74,214,255,0.1)", border:"1px solid rgba(74,214,255,0.25)", borderRadius:6, padding:"2px 8px"}}>
                Ronda {currentRound}
              </div>
            )}
          </div>

          <div style={{fontSize:12, fontWeight:700, color:C.muted, marginBottom:10}}>
            {circuitSplit?.name || "Sin equipo"} · {circuitExs.length} × {exDuration}s
          </div>

          {circuitRunning ? (
            <div style={{textAlign:"center", paddingBottom:8}}>
              <div style={{fontSize:11, fontWeight:700, color:C.muted, letterSpacing:".08em", marginBottom:4}}>
                EJERCICIO {currentExIdx+1} / {circuitExs.length}
              </div>
              <div style={{fontFamily:"var(--font-display)", fontSize:22, letterSpacing:".02em", color: exColor(circuitExs[currentExIdx]), marginBottom:6}}>
                {circuitExs[currentExIdx]}
              </div>
              <div style={{fontFamily:"var(--font-display)", fontSize:72, lineHeight:1, color:C.ink, marginBottom:8}}>
                {secsInEx}
              </div>
              <div style={{height:5, background:C.line, borderRadius:99, marginBottom:10, overflow:"hidden"}}>
                <div style={{height:"100%", width:`${(secsInEx/exDuration)*100}%`, background: exColor(circuitExs[currentExIdx]), borderRadius:99, transition:"width .8s linear"}}/>
              </div>
              <div style={{fontSize:11, color:C.muted}}>
                SIGUIENTE → <span style={{color: exColor(circuitExs[nextExIdx]), fontWeight:700}}>
                  {circuitExs[nextExIdx]}{currentExIdx+1 === circuitExs.length ? ` · Ronda ${currentRound+1}` : ""}
                </span>
              </div>
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:5, marginBottom:10}}>
              {circuitExs.map((ex, i) => (
                <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", background:C.panel, border:`1px solid ${C.line}`, borderRadius:8}}>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <span style={{fontFamily:"var(--font-display)", fontSize:17, color:C.lime, width:18, textAlign:"center"}}>{i+1}</span>
                    <span style={{fontSize:13, fontWeight:600, color:C.ink}}>{ex}</span>
                  </div>
                  <span style={{fontSize:11, color:C.muted, fontWeight:700}}>60s</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={circuitRunning ? stopCircuit : startCircuit}
            style={{width:"100%", padding:"13px 0", borderRadius:10, cursor:"pointer", background: circuitRunning ? "rgba(255,107,138,0.12)" : "linear-gradient(90deg,rgba(205,255,74,0.15),rgba(74,214,255,0.15))", border:`1px solid ${circuitRunning ? "rgba(255,107,138,0.4)" : "rgba(205,255,74,0.3)"}`, color: circuitRunning ? C.rose : C.lime, fontSize:14, fontWeight:800, letterSpacing:".03em"}}>
            {circuitRunning ? "⏹ Detener Circuito" : "▶ Iniciar Circuito"}
          </button>
        </div>

        {/* CARRUSEL DE EJERCICIOS POR SPLIT */}
        <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:14, padding:16}}>
          <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".08em", marginBottom:12}}>
            💪 Ejercicios por Split
          </div>

          {/* Split tabs */}
          <div style={{display:"flex", gap:5, marginBottom:14, overflowX:"auto", paddingBottom:2}}>
            {splits.map(sp => {
              const active = focusSplit === sp.key;
              return (
                <button key={sp.key} onClick={() => setFocusSplit(sp.key)}
                  className="btn-active-scale"
                  style={{flexShrink:0, padding:"5px 11px", borderRadius:20, fontSize:11, fontWeight:800, cursor:"pointer",
                    background: active ? "rgba(205,255,74,0.15)" : C.panel,
                    border: `1px solid ${active ? "rgba(205,255,74,0.5)" : C.line}`,
                    color: active ? C.lime : C.muted}}>
                  {sp.key} · {sp.name.split("+")[0].split(" ").slice(0,2).join(" ")}
                </button>
              );
            })}
          </div>

          {/* Horizontal card carousel */}
          {(() => {
            const spExs = splits.find(s => s.key === focusSplit)?.ex || [];
            if (spExs.length === 0) return <div style={{fontSize:12, color:C.muted, textAlign:"center", padding:"12px 0"}}>Sin ejercicios en este split.</div>;
            return (
              <>
                <div style={{display:"flex", gap:10, overflowX:"auto", paddingBottom:10, scrollSnapType:"x mandatory", WebkitOverflowScrolling:"touch"}}>
                  {spExs.map(exName => {
                    const vals = getVals(exName);
                    const last = getLastEntry(exName);
                    const seriesTotal = (exlog[exName] || []).filter(s => s.type !== "warmup").length;
                    const col = exColor(exName);
                    const muscles = getMuscles(exName).slice(0,2);
                    const hasHistory = last.w > 0;
                    const btnStyle = (active) => ({
                      width:32, height:32, borderRadius:7, cursor:"pointer", fontSize:18, fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: active ? "rgba(205,255,74,0.12)" : C.panel2,
                      border: `1px solid ${active ? "rgba(205,255,74,0.4)" : C.line}`,
                      color: active ? C.lime : C.muted
                    });
                    return (
                      <div key={exName} style={{
                        flexShrink:0, width:188, background:C.panel, border:`1px solid ${C.line}`,
                        borderRadius:13, padding:13, scrollSnapAlign:"start",
                        display:"flex", flexDirection:"column", gap:9
                      }}>
                        {/* Name */}
                        <div style={{fontSize:12.5, fontWeight:800, color:C.ink, lineHeight:1.25, minHeight:32}}>{exName}</div>

                        {/* Muscle chips + history */}
                        <div style={{display:"flex", gap:4, flexWrap:"wrap", alignItems:"center"}}>
                          {muscles.map(m => (
                            <span key={m} style={{fontSize:9, fontWeight:700, color:col, background:`${col}18`, border:`1px solid ${col}30`, borderRadius:4, padding:"1px 5px"}}>{m}</span>
                          ))}
                          {seriesTotal > 0 && <span style={{fontSize:9, color:C.muted, marginLeft:"auto"}}>{seriesTotal} series</span>}
                        </div>

                        {/* Last record hint */}
                        {hasHistory && (
                          <div style={{fontSize:10, color:C.muted}}>Última: <span style={{color:col, fontWeight:700}}>{last.w}kg × {last.reps}</span></div>
                        )}

                        {/* Weight control */}
                        <div>
                          <div style={{fontSize:9, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5}}>Peso (kg)</div>
                          <div style={{display:"flex", alignItems:"center", gap:5}}>
                            <button onClick={() => adjWeight(exName, -2.5)} style={btnStyle(false)}>−</button>
                            <span style={{flex:1, textAlign:"center", fontFamily:"var(--font-display)", fontSize:24, color:C.ink, lineHeight:1}}>{vals.w || 0}</span>
                            <button onClick={() => adjWeight(exName, 2.5)} style={btnStyle(true)}>+</button>
                          </div>
                        </div>

                        {/* Reps control */}
                        <div>
                          <div style={{fontSize:9, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5}}>Reps</div>
                          <div style={{display:"flex", alignItems:"center", gap:5}}>
                            <button onClick={() => adjReps(exName, -1)} style={btnStyle(false)}>−</button>
                            <span style={{flex:1, textAlign:"center", fontFamily:"var(--font-display)", fontSize:24, color:C.ink, lineHeight:1}}>{parseInt(vals.reps)||8}</span>
                            <button onClick={() => adjReps(exName, 1)} style={btnStyle(true)}>+</button>
                          </div>
                        </div>

                        {/* Rest button */}
                        <button onClick={triggerRest} className="btn-active-scale"
                          style={{width:"100%", padding:"8px 0", borderRadius:8, cursor:"pointer",
                            background:"rgba(205,255,74,0.1)", border:"1px solid rgba(205,255,74,0.28)",
                            color:C.lime, fontSize:11, fontWeight:800}}>
                          ▶ Descanso {restTotal}s
                        </button>

                        {/* Set tracking */}
                        <div style={{display:"flex", alignItems:"center", gap:8, marginTop:8}}>
                          <button
                            onClick={() => markSetDone(exName)}
                            style={{flex:1, padding:"9px", borderRadius:9, border:"none", background:C.lime, color:"#0c0e0b", fontWeight:800, fontSize:12.5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6}}
                          >
                            ✓ Serie hecha
                          </button>
                          <div style={{fontSize:12, fontWeight:700, color:C.muted, minWidth:54, textAlign:"center"}}>
                            {(setsDone[exName] || 0)} series
                          </div>
                          {(setsDone[exName] || 0) > 0 && (
                            <button onClick={() => resetSets(exName)} style={{background:"none", border:`1px solid ${C.line}`, borderRadius:8, padding:"7px 9px", color:C.muted, fontSize:11, cursor:"pointer"}}>
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Form cue */}
                        {formCues[exName] ? (
                          <div style={{fontSize:10.5, color:C.amber, lineHeight:1.4, background:`${C.amber}11`, border:`1px solid ${C.amber}33`, borderRadius:7, padding:"6px 8px"}}>
                            💡 {formCues[exName]}
                          </div>
                        ) : (
                          <button onClick={() => generateFormCue(exName)}
                            disabled={formCueBusy[exName]}
                            style={{width:"100%", padding:"5px 0", borderRadius:7, cursor:"pointer", background:"transparent",
                              border:`1px solid ${C.amber}44`, color:C.amber, fontSize:10, fontWeight:700}}>
                            {formCueBusy[exName] ? "…" : "💡 Tip técnico"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{fontSize:10, color:C.muted, textAlign:"center"}}>
                  ← Deslizá para ver todos los ejercicios →
                </div>
              </>
            );
          })()}
        </div>

      </div>
    </div>
  );
}

/* ===== CARRUSEL DE ALERTAS Y SUGERENCIAS ===== */
const TIP_STYLE = {
  tip:        { color: C.lime,  bg: "rgba(205,255,74,0.08)",  border: "rgba(205,255,74,0.45)" },
  reminder:   { color: C.cyan,  bg: "rgba(74,214,255,0.08)",  border: "rgba(74,214,255,0.45)" },
  motivation: { color: C.amber, bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.45)" },
  warning:    { color: C.rose,  bg: "rgba(255,107,138,0.08)", border: "rgba(255,107,138,0.45)" },
  imbalance:  { color: C.rose,  bg: "rgba(255,107,138,0.08)", border: C.rose },
  plateau:    { color: C.amber, bg: "rgba(251,191,36,0.08)",  border: C.amber },
  overload:   { color: C.cyan,  bg: "rgba(74,214,255,0.08)",  border: C.cyan },
};

function InsightsCarousel({ muscleImbalances, plateauAlerts, overloadSuggestions, aiTips }) {
  const [dismissed, setDismissed] = React.useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem("carousel_dismissed") || "[]")); } catch { return new Set(); }
  });
  const [tipIdx, setTipIdx] = React.useState(() => {
    try { return parseInt(sessionStorage.getItem("carousel_tip_idx") || "0", 10); } catch { return 0; }
  });
  const [expanded, setExpanded] = React.useState(false);
  const touchRef = React.useRef({ startX: 0, moved: false });
  const [swipeX, setSwipeX] = React.useState(0);
  const [swiping, setSwiping] = React.useState(false);

  const tips = aiTips && aiTips.length > 0 ? aiTips : FALLBACK_TIPS;

  const dataCards = React.useMemo(() => {
    const list = [];
    (muscleImbalances || []).forEach((text, i) => {
      const isPP = text.includes("Empuje");
      list.push({
        id: "imb" + i, tipType: "imbalance", icon: "⚖️",
        title: isPP ? "Desbalance Empuje/Jalón" : "Desbalance Cuáds/Isquios",
        body: text.replace("series", "ser") + (isPP ? " — Empuje = Pecho+Hombros+Tríceps · Jalón = Espalda+Bíceps" : ""),
        extra: isPP
          ? ["Ideal 1:1 a 1.3:1. El desequilibrio sostenido puede causar dolor de hombro y mala postura.", "Esta semana: reemplaza 1 serie de press por remo, y añade face pulls al final.", "El ejercicio más eficiente para equilibrar: remo con mancuerna unilateral (no necesita mucho tiempo)."]
          : ["Desequilibrio cuáds/isquios eleva el riesgo de lesión de rodilla y LCA.", "Añade peso muerto rumano o curl de pierna al final de tu próxima sesión de piernas.", "Objetivo: al menos 1 serie de isquios por cada 1.5 de cuádriceps."]
      });
    });
    (plateauAlerts || []).slice(0, 3).forEach((p, i) => list.push({
      id: "plt" + i, tipType: "plateau", icon: "⚡",
      title: "Estancamiento: " + p.exercise,
      body: `Sin progreso en ${p.weeks} semanas con ${p.weight}kg.`,
      extra: [
        "El cuerpo se adapta al estímulo repetido — necesita un cambio para crecer de nuevo.",
        "Opción A · Doble progresión: baja a 3 sets × 6 reps, sube 2.5kg y trabaja hasta llegar a 3×10 antes de volver a subir.",
        "Opción B · Técnica: reduce el peso 10% durante 2 semanas enfocándote en tempo 3-1-2 (bajada-pausa-subida).",
        "Opción C · Variación: cambia a un ejercicio parecido (ej. si estás estancado en press banca → press inclinado) por 4 semanas y luego vuelve.",
        "Opción D · Deload: una semana con 50% del volumen habitual y sin fallo muscular restaura el SNC."
      ]
    }));
    Object.entries(overloadSuggestions || {}).slice(0, 3).forEach(([ex, s], i) => list.push({
      id: "ovl" + i, tipType: "overload", icon: "↑",
      title: "Subir peso: " + ex,
      body: `${s.currentMax}kg → ${s.suggested}kg. ${s.reason || "Completando todas las series en rango alto."}`,
      extra: [
        "Cuándo subir: cuando completas TODAS las series en el límite superior del rango de reps (sin fallar en las últimas).",
        `Cómo: sube ${Math.round((s.suggested - s.currentMax) * 10) / 10}kg. Si no tienes ese disco, sube al siguiente disponible y baja 1-2 reps hasta adaptarte.`,
        "Si fallas demasiado pronto: el aumento fue prematuro, baja al peso anterior 1 semana más.",
        "Regla de oro: mejor subir pequeño y completar que subir grande y fallar series."
      ]
    }));
    return list.filter(c => !dismissed.has(c.id));
  }, [muscleImbalances, plateauAlerts, overloadSuggestions, dismissed]);

  const currentTip = tips[tipIdx % tips.length];
  const tipCard = { id: "tip", tipType: currentTip.tipType || "tip", icon: currentTip.icon, title: currentTip.title, body: currentTip.body, extra: (currentTip.extra && currentTip.extra.length > 0) ? currentTip.extra : (currentTip.detail ? [currentTip.detail] : []) };
  const allCards = [...dataCards, tipCard];
  const card = allCards[0];

  const dismissCurrent = () => {
    setExpanded(false);
    if (card.id === "tip") {
      setTipIdx(prev => {
        const next = (prev + 1) % tips.length;
        try { sessionStorage.setItem("carousel_tip_idx", String(next)); } catch {}
        return next;
      });
    } else {
      setDismissed(prev => {
        const next = new Set([...prev, card.id]);
        try { sessionStorage.setItem("carousel_dismissed", JSON.stringify([...next])); } catch {}
        return next;
      });
    }
    setSwipeX(0); setSwiping(false);
  };

  const onTouchStart = (e) => {
    touchRef.current = { startX: e.touches[0].clientX, moved: false };
    setSwiping(true); setSwipeX(0);
  };
  const onTouchMove = (e) => {
    if (!swiping) return;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    if (Math.abs(dx) > 8) touchRef.current.moved = true;
    setSwipeX(Math.min(0, dx));
  };
  const onTouchEnd = () => {
    if (!touchRef.current.moved) {
      setExpanded(prev => !prev);
      setSwipeX(0); setSwiping(false);
    } else if (swipeX < -70) {
      dismissCurrent();
    } else {
      setSwipeX(0); setSwiping(false);
    }
  };

  const st = TIP_STYLE[card.tipType] || TIP_STYLE.tip;

  return (
    <div style={{marginBottom:12}}>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          background: st.bg, border: `1.5px solid ${st.border}`,
          borderRadius: 14, padding: "12px 14px", cursor: "pointer",
          transform: `translateX(${swipeX}px)`,
          opacity: 1 - Math.abs(swipeX) / 200,
          transition: swiping ? "none" : "transform 0.25s ease, opacity 0.25s",
          userSelect: "none"
        }}
      >
        {/* Header row */}
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8}}>
          <div style={{display:"flex", alignItems:"center", gap:6, flex:1}}>
            <span style={{fontSize:16}}>{card.icon}</span>
            <span style={{fontSize:12.5, fontWeight:800, color:st.color}}>{card.title}</span>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:6, flexShrink:0}}>
            <span style={{fontSize:10, color:st.color, opacity:.7}}>{expanded ? "▲" : "▼"}</span>
            <button onTouchEnd={e => { e.stopPropagation(); dismissCurrent(); }} onClick={e => { e.stopPropagation(); dismissCurrent(); }} style={{background:"none", border:"none", color:st.color, fontSize:18, cursor:"pointer", lineHeight:1, padding:"0 2px", opacity:.6}}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{fontSize:11.5, color:C.ink, marginTop:6, lineHeight:1.5}}>{card.body}</div>

        {/* Expanded detail */}
        {expanded && card.extra && card.extra.length > 0 && (
          <div style={{marginTop:10, display:"flex", flexDirection:"column", gap:6, borderTop:`1px solid ${st.border}`, paddingTop:10}}>
            {card.extra.map((line, i) => (
              <div key={i} style={{display:"flex", gap:7, alignItems:"flex-start"}}>
                <span style={{color:st.color, fontWeight:800, fontSize:11, flexShrink:0, marginTop:1}}>{i === 0 ? "ℹ" : "→"}</span>
                <span style={{fontSize:11, color: i === 0 ? C.muted : C.ink, lineHeight:1.5}}>{line}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tap hint when collapsed */}
        {!expanded && (
          <div style={{fontSize:9.5, color:st.color, opacity:.55, marginTop:5, textAlign:"right"}}>toca para ver más</div>
        )}
      </div>

      {/* Dots + swipe hint */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:5}}>
        <div style={{display:"flex", gap:4, alignItems:"center"}}>
          {allCards.slice(0, Math.min(8, allCards.length)).map((c, i) => (
            <div key={c.id + i} style={{width:i===0?14:5, height:5, borderRadius:99, background:i===0?st.border:`${st.border}50`, transition:"width .2s"}}/>
          ))}
        </div>
        <span style={{fontSize:9.5, color:C.muted}}>← desliza para pasar</span>
      </div>
    </div>
  );
}

/* ===== TAB ENTRENAMIENTO ===== */
function Entreno({
  exlog, setExlog, exercises, setExercises, geminiKey, handleAnalyzeWorkout, importWorkoutData,
  activeSplitKey, setActiveSplitKey, selectedDateStr, setSelectedDateStr, calMonth, setCalMonth,
  workoutDurations, setWorkoutDurations, exerciseTechNotes, setExerciseTechNotes, prAlerts, setPrAlerts, checkNewPR, activeMetrics,
  overloadSuggestions, plateauAlerts, muscleImbalances, splits, setSplits, notes, setNotes, chat
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
  const [refreshMuscleBusy, setRefreshMuscleBusy] = useState(false);
  const [exTab, setExTab] = useState("texto"); // 'texto' or 'nuevo'
  const [mergeTarget, setMergeTarget] = useState("");
  const [showExMgr, setShowExMgr] = useState(false);
  const [exMgrSearch, setExMgrSearch] = useState("");
  const [exSearch, setExSearch] = useState("");

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

  // --- AI Tips for InsightsCarousel ---
  const [aiTips, setAiTips] = useState([]);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = "insights_tips_" + today;
    const cached = getAICache("tips", cacheKey);
    if (cached) { setAiTips(cached); return; }
    if (!geminiKey) return;
    const cutoff = Date.now() - 7 * 86400000;
    let push = 0, pull = 0, legs = 0;
    Object.entries(exlog || {}).forEach(([n, sets]) => {
      const ms = MUSCLES[n] || [];
      const isPush = ms.some(m => /pectoral|tríceps|tricep|deltoid/i.test(m));
      const isPull = ms.some(m => /espalda|bíceps|bicep|dorsal/i.test(m));
      const isLegs = ms.some(m => /cuádriceps|isquio|glúteo/i.test(m));
      const n7 = (sets || []).filter(s => s?.date && s.type !== "warmup" && new Date(s.date).getTime() > cutoff).length;
      if (isPush) push += n7; if (isPull) pull += n7; if (isLegs) legs += n7;
    });
    const ctx = `Entrenador: Push ${push} series · Pull ${pull} series · Piernas ${legs} series (últimos 7 días). Plateaus: ${(plateauAlerts||[]).length}. Sugerencias sobrecarga: ${Object.keys(overloadSuggestions||{}).length}. Notas recientes: ${getRecentSensationsText().slice(0, 200)}.`;
    callGemini([{ role:"user", content: `Genera 6 tarjetas variadas de coaching fitness personalizado para Bruno basándote en este contexto: ${ctx}\n\nGenera EXACTAMENTE 6 tarjetas con tipTypes variados (tip, reminder, motivation, warning) — no repitas el mismo tipo consecutivo. El campo 'extra' debe tener EXACTAMENTE 3 strings: [0] contexto/por qué importa, [1] acción concreta hoy (empieza con →), [2] otra acción o dato práctico (empieza con →).` }],
      "Eres coach fitness experto. Responde SOLO en JSON válido con el array 'cards'. Cada card: {icon, tipType, title (máx 4 palabras), body (máx 25 palabras), detail (igual a extra[0], máx 20 palabras), extra: [string×3]}. En español.",
      TIPS_SCHEMA
    ).then(raw => {
      try {
        const parsed = cleanAndParseJSON(raw);
        const tips = (parsed?.cards || []).filter(t => t.title && t.body);
        if (tips.length >= 3) { setAiTips(tips); setAICache("tips", cacheKey, tips); }
      } catch (_) {}
    }).catch(() => {});
  }, []);

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

  // Finds the canonical exlog key for an exercise name, tolerating:
  // - case differences, trailing spaces
  // - slash notation: "Dominadas / Jalón" ↔ "Dominadas"
  // - abbreviated names: "Remo barra" ↔ "Remo con barra"
  // Prefers the key that already has the most records.
  const findExlogKey = (name) => {
    const el = exlog || {};
    if (el[name] && el[name].length > 0) return name; // exact match with records
    const norm = (s) => s.toLowerCase().trim();
    const nameNorm = norm(name);
    const nameParts = nameNorm.split(/\s*\/\s*/);
    const nameWords = nameNorm.split(/\s+/);
    let bestKey = name, bestLen = 0;
    for (const key of Object.keys(el)) {
      if (!el[key] || !el[key].length) continue;
      const keyNorm = norm(key);
      const keyParts = keyNorm.split(/\s*\/\s*/);
      const keyWords = keyNorm.split(/\s+/);
      const match =
        keyNorm === nameNorm || // case-insensitive exact
        nameParts.some(p => keyParts.includes(p)) || // slash part match
        keyParts.some(p => nameParts.includes(p)) ||
        // abbreviated word match: all words of the shorter name exist in the longer key
        (nameWords.length >= 2 && nameWords.every(w => keyWords.includes(w))) ||
        (keyWords.length >= 2 && keyWords.every(w => nameWords.includes(w)));
      if (match && el[key].length > bestLen) { bestKey = key; bestLen = el[key].length; }
    }
    return bestKey;
  };

  const last = (n) => { const key = findExlogKey(n); const a = (exlog || {})[key]; return a && a.length ? a[0] : null; };
  const chartData = (n) => { const key = findExlogKey(n); return ((exlog || {})[key] || []).slice().sort((a,b) => a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)); };

  useEffect(() => {
    (async () => {
      const savedDaySug = await loadKey("last_day_sug", "");
      const savedWk = await loadKey("last_wk_sug", "");
      if (savedDaySug) setDaySug(savedDaySug);
      if (savedWk) setWk(savedWk);
    })();
  }, []);

  const topProgress = React.useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 86400000;
    const progress = [];
    Object.entries(exlog || {}).forEach(([name, sets]) => {
      const recent = sets.filter(s => s.w && new Date(s.date).getTime() > thirtyDaysAgo);
      const older = sets.filter(s => s.w && new Date(s.date).getTime() <= thirtyDaysAgo && new Date(s.date).getTime() > now - 60 * 86400000);
      if (!recent.length || !older.length) return;
      const recentMax = Math.max(...recent.map(s=>parseFloat(s.w)||0));
      const olderMax = Math.max(...older.map(s=>parseFloat(s.w)||0));
      const delta = recentMax - olderMax;
      if (delta > 0) progress.push({ name, delta, current: recentMax });
    });
    return progress.sort((a,b) => b.delta - a.delta).slice(0, 3);
  }, [exlog]);

  /* ===== MAPA DE CALOR DE VOLUMEN SEMANAL ===== */
  const vol = useMemo(() => {
    // Solo añadir al mapa si musculos tiene contenido; si está vacío, dejar que MUSCLES haga fallback
    const exMap = {};
    Object.values(exercises || {}).flat().forEach(e => { if (e.musculos?.length) exMap[e.name] = e.musculos; });
    const weekAgo = Date.now() - 7 * 864e5;
    const calculatedVol = { Pectoral: 0, Espalda: 0, Cuádriceps: 0, Isquios: 0, Deltoides: 0, Bíceps: 0, Tríceps: 0, Glúteos: 0, Antebrazo: 0 };

    Object.entries(exlog || {}).forEach(([name, sets]) => {
      const ms = exMap[name] || MUSCLES[name] || [];
      if (!ms.length) return;
      // Peso por activación: primario 1.0, secundario 0.6, terciario 0.35… (tras normalizar, se queda el mayor)
      const weightByMuscle = {};
      ms.forEach((rawM, idx) => {
        const m = normalizeMuscle(rawM);
        if (!m) return;
        const w = MUSCLE_ACTIVATION_WEIGHTS[idx] ?? 0.1;
        if (weightByMuscle[m] === undefined || w > weightByMuscle[m]) weightByMuscle[m] = w;
      });
      (sets || []).forEach(s => {
        if(s && s.date && new Date(s.date).getTime() >= weekAgo && s.type !== "warmup") {
          Object.entries(weightByMuscle).forEach(([m, w]) => {
            if(calculatedVol[m] !== undefined) calculatedVol[m] += w;
          });
        }
      });
    });
    // Redondear a 1 decimal
    Object.keys(calculatedVol).forEach(m => { calculatedVol[m] = Math.round(calculatedVol[m]*10)/10; });
    return calculatedVol;
  }, [exercises, exlog]);

  const getHeatColor = (sets) => {
    if (sets === 0) return { bg: C.panel2, text: C.muted };
    if (sets < 4) return { bg: "rgba(107, 78, 255, 0.15)", text: C.ink, border: "rgba(107, 78, 255, 0.3)" };
    if (sets < 8) return { bg: "rgba(205, 255, 74, 0.25)", text: "#f3f4ea", border: C.lime, fontWeight: 700 };
    return { bg: C.lime, text: "#0c0e0b", border: C.lime, fontWeight: 800, boxShadow: "0 0 10px rgba(205, 255, 74, 0.3)" };
  };

  const allExistingExercises = Object.values(exercises || {}).flat().map(e => e.name);
  const allExerciseObjects = (() => {
    const seen = new Set();
    const userExs = Object.values(exercises || {}).flat();
    // Merge user exercises (first, so they take priority) with global library
    return [...userExs, ...EXERCISE_DB].filter(e => {
      if (seen.has(e.name)) return false;
      seen.add(e.name); return true;
    }).map(e => ({ ...e, equipo: e.equipo || SEED_EQUIPO[e.name] || "peso libre", tecnico: e.tecnico || SEED_TECNICO[e.name] || "" }));
  })();

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
    const canonKey = findExlogKey(n);
    const next = {...exlog, [canonKey]: [...newSets.reverse(), ...(exlog[canonKey] || [])].slice(0, 60)};
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

  const buildRoutinePDF = (splitKey) => {
    const allSplits = splits || DEFAULT_SPLITS;
    const dayObj = allSplits.find(d => d.key === splitKey) || allSplits[0];
    const dayExs = (exercises || {})[splitKey] || [];
    const today = new Date().toLocaleDateString("es-ES", {day:"2-digit", month:"long", year:"numeric"});

    // Get last recorded weight/reps for an exercise from exlog
    const getLastSet = (exName) => {
      const el = exlog || {};
      const key = Object.keys(el).find(k => k.toLowerCase() === exName.toLowerCase()) || exName;
      const sets = (el[key] || []).filter(s => s.type !== "warmup");
      if (!sets.length) return null;
      return sets[0]; // already sorted newest first
    };

    // Suggest working weight: last weight or placeholder
    const suggestLoad = (exName) => {
      const s = getLastSet(exName);
      if (s && s.w) return `${s.w} kg × ${s.reps} reps`;
      return "— kg × — reps";
    };

    const TECH_NOTES = {
      "sentadilla": ["Bracing 360° antes de bajar", "Rodillas siguen la dirección de los pies", "Cadera por debajo del paralelo", "Ascenso explosivo, bajada controlada"],
      "prensa": ["Espalda baja completamente apoyada durante todo el movimiento", "Empuje a través del talón y mediopié", "No bloquees las rodillas al final", "Pies altos = glúteo; pies bajos = cuádriceps"],
      "press": ["Core activado, zona lumbar neutra", "Bajada controlada hasta el pecho o clavícula", "Codos a ~45° del torso en press de pecho"],
      "curl": ["No balancear el torso", "Supinación completa en el tope", "Bajada excéntrica lenta (2–3 seg)"],
      "dominad": ["Escápulas deprimidas antes de jalar", "Codos hacia las caderas en el descenso", "Rango completo: extensión hasta casi colgar"],
      "remo": ["Espalda recta, bisagra de cadera", "Jalar hasta el abdomen bajo, codos pegados al cuerpo", "Squeeze (apriete) 1 seg en el tope"],
      "extensión": ["Eje de la máquina alineado con la rodilla", "Mantener 1 seg con cuádricep contraído", "Bajada lenta: 2–3 seg"],
      "elevacion": ["Sin balanceo de torso ni impulso", "Sube solo hasta altura del hombro", "Bajada excéntrica lenta (2 seg)"],
      "face pull": ["Cuerda separada al llegar a la cara", "Rotación externa al final", "Codos a altura de hombros o más"],
      "búlgara": ["Pie trasero en banco (empeine)", "Rodilla delantera no sobrepasa el pie", "Torso ligeramente inclinado = más cuádriceps"],
      "zancada": ["Paso largo, rodilla trasera casi toca el suelo", "Torso erguido", "Empuje con el talón del pie delantero"],
      "hip thrust": ["Escápulas sobre el banco", "Empuje de cadera hasta extensión completa", "Squeeze de glúteo 1 seg en el tope"],
      "peso muerto": ["Barra sobre el mediopié", "Caderas y hombros suben al mismo ritmo", "Espalda neutral durante todo el movimiento"],
      "aperturas": ["Codo ligeramente flexionado fijo", "Hasta sentir estiramiento en pectoral", "Cierre con pecho, no con brazos"],
    };

    const getTechNotes = (exName) => {
      const low = exName.toLowerCase();
      for (const [key, notes] of Object.entries(TECH_NOTES)) {
        if (low.includes(key)) return notes;
      }
      return ["Mantener técnica estricta durante toda la serie", "Excéntrico controlado (2–3 seg)", "RIR objetivo: 1–2 en series de trabajo"];
    };

    const exRows = dayExs.map((ex, i) => {
      const last = getLastSet(ex.name);
      const lastW = last ? parseFloat(last.w) : null;
      const lastR = last ? parseInt(last.reps) : null;
      const w1 = lastW || 0;
      const w2 = w1 ? (w1 * 1.05).toFixed(1) : "—";
      const warmW1 = w1 ? Math.round(w1 * 0.5) : "—";
      const warmW2 = w1 ? Math.round(w1 * 0.7) : "—";
      const techs = getTechNotes(ex.name);
      const muscStr = (ex.musculos || []).slice(0, 4).join(", ") || "—";
      return `
        <div class="ex-card">
          <div class="ex-header">
            <span class="ex-num">${i + 1}</span>
            <div class="ex-title">
              <div class="ex-name">${ex.name}</div>
              <div class="ex-muscles">${muscStr}</div>
            </div>
            <div class="ex-last">${last ? `Último: <strong>${last.w}kg×${last.reps}</strong>` : "Sin historial"}</div>
          </div>
          <div class="ex-body">
            <div class="sets-block">
              <div class="block-title">SERIES Y CARGAS</div>
              <table>
                <thead><tr><th>Tipo</th><th>Carga</th><th>Reps</th><th>Intensidad</th></tr></thead>
                <tbody>
                  <tr class="row-warm"><td>Calent. 1</td><td>${warmW1} kg</td><td>8–10</td><td>Técnica</td></tr>
                  <tr class="row-warm"><td>Calent. 2</td><td>${warmW2} kg</td><td>5</td><td>Aprox.</td></tr>
                  <tr class="row-work"><td>Trabajo 1</td><td><strong>${w1 || "—"} kg</strong></td><td>${lastR || "8–10"}</td><td>@RIR 2</td></tr>
                  <tr class="row-work"><td>Trabajo 2</td><td><strong>${w1 || "—"} kg</strong></td><td>${lastR || "8–10"}</td><td>@RIR 2</td></tr>
                  <tr class="row-work"><td>Trabajo 3</td><td><strong>${w1 ? Math.round(w1 * 0.95) : "—"} kg</strong></td><td>${lastR || "8–10"}</td><td>@RIR 2</td></tr>
                </tbody>
              </table>
              <div class="prog-hint">Progresión: si 3 series @RIR≥2, sube a <strong>${w2} kg</strong> la próxima sesión</div>
            </div>
            <div class="tech-block">
              <div class="block-title">TÉCNICA CLAVE</div>
              <ul>${techs.map(t => `<li>${t}</li>`).join("")}</ul>
            </div>
          </div>
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Split ${splitKey} — ${dayObj.name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;color:#111;font-size:10.5pt;line-height:1.5;background:#fff}
.page{max-width:780px;margin:0 auto;padding:28px 24px 44px}
.doc-header{border-bottom:3px solid #111;padding-bottom:12px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:flex-end}
.doc-header h1{font-size:20pt;font-weight:900;letter-spacing:-0.5px;line-height:1.1}
.doc-header .meta{text-align:right;font-size:9pt;color:#555;line-height:1.8}
.badge{display:inline-block;background:#111;color:#fff;font-size:8pt;font-weight:700;padding:3px 9px;border-radius:20px}
.info-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px}
.info-box{border:1.5px solid #ddd;border-radius:7px;padding:9px 12px}
.info-box .lbl{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:2px}
.info-box .val{font-size:10.5pt;font-weight:700}
.ex-card{border:1.5px solid #e5e7eb;border-radius:9px;margin-bottom:12px;overflow:hidden;page-break-inside:avoid}
.ex-header{background:#f3f4f6;padding:9px 12px;border-bottom:1.5px solid #e5e7eb;display:flex;align-items:center;gap:10px}
.ex-num{background:#111;color:#fff;font-size:10pt;font-weight:800;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ex-title{flex:1}
.ex-name{font-size:11.5pt;font-weight:800}
.ex-muscles{font-size:8.5pt;color:#6b7280;margin-top:1px}
.ex-last{font-size:9pt;color:#555;white-space:nowrap}
.ex-body{padding:11px 12px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.block-title{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:7px}
table{width:100%;border-collapse:collapse;font-size:9.5pt}
th{text-align:left;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;border-bottom:1.5px solid #e5e7eb;padding:3px 5px}
td{padding:4px 5px;border-bottom:1px solid #f3f4f6}
tr:last-child td{border-bottom:none}
.row-warm td{color:#d97706}
.row-work td{color:#1d4ed8}
.row-work td:nth-child(2){font-weight:700;color:#111}
.prog-hint{margin-top:7px;background:#eff6ff;border-left:3px solid #3b82f6;border-radius:0 5px 5px 0;padding:5px 9px;font-size:9pt;color:#1e40af}
.tech-block ul{list-style:none}
.tech-block ul li{font-size:9.5pt;padding:3px 0 3px 13px;position:relative;color:#374151;border-bottom:1px solid #f9fafb}
.tech-block ul li::before{content:"→";position:absolute;left:0;color:#9ca3af}
.legend{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px;page-break-inside:avoid}
.leg-box{border:1.5px solid #e5e7eb;border-radius:7px;padding:9px 12px}
.leg-box h4{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:7px}
.leg-box ul{list-style:none}
.leg-box ul li{font-size:9pt;padding:2px 0;display:flex;gap:8px}
.leg-box ul li strong{min-width:52px;color:#1d4ed8}
.footer{margin-top:28px;padding-top:10px;border-top:1.5px solid #e5e7eb;display:flex;justify-content:space-between;font-size:8pt;color:#9ca3af}
.print-btn{position:fixed;top:14px;right:14px;background:#111;color:#fff;border:none;border-radius:7px;padding:9px 18px;font-size:11pt;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2)}
@media print{.print-btn{display:none}@page{size:A4;margin:14mm 14mm 18mm 14mm}}
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨 Guardar PDF</button>
<div class="page">
  <div class="doc-header">
    <div>
      <h1>Split ${splitKey} — ${dayObj.name.toUpperCase()}</h1>
      <div style="font-size:10pt;color:#555;margin-top:4px">Plan detallado · Técnica + Progresión de cargas</div>
    </div>
    <div class="meta">
      <div><span class="badge">Bruno Hazleby</span></div>
      <div style="margin-top:6px">Generado: ${today}</div>
      <div>Ejercicios: <strong>${dayExs.length}</strong></div>
    </div>
  </div>
  <div class="info-row">
    <div class="info-box"><div class="lbl">Enfoque calórico</div><div class="val">${dayObj.fuel || "—"}</div></div>
    <div class="info-box"><div class="lbl">Descanso compuestos</div><div class="val">3–4 minutos</div></div>
    <div class="info-box"><div class="lbl">Descanso aislamiento</div><div class="val">90 seg – 2 min</div></div>
  </div>
  ${exRows || '<p style="color:#888;text-align:center;padding:20px">No hay ejercicios registrados en este split.</p>'}
  <div class="legend">
    <div class="leg-box">
      <h4>RIR — Repeticiones en Reserva</h4>
      <ul>
        <li><strong>@RIR 0</strong> Fallo total — no puedes más</li>
        <li><strong>@RIR 1</strong> Podrías hacer 1 rep más</li>
        <li><strong>@RIR 2</strong> Podrías hacer 2 reps más (objetivo)</li>
        <li><strong>@RIR 3+</strong> Calentamiento / técnica</li>
      </ul>
    </div>
    <div class="leg-box">
      <h4>Cuándo bajar la carga ese día</h4>
      <ul>
        <li><strong>Técnica</strong> Si la forma se rompe</li>
        <li><strong>Dolor</strong> Dolor articular (no quemazón)</li>
        <li><strong>Sueño</strong> Menos de 6 h la noche anterior</li>
        <li><strong>Fatiga</strong> Sesiones acumuladas sin descanso</li>
      </ul>
    </div>
  </div>
  <div class="footer">
    <span>Bruno Fit · Plan generado automáticamente</span>
    <span>Split ${splitKey} — ${dayObj.name}</span>
    <span>${today}</span>
  </div>
</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };

  const startEditSplits = () => {
    const baseSplits = (splits || DEFAULT_SPLITS).map(s => ({ ...s, ex: [...(s.ex || []), ...(exercises[s.key] || []).map(e => e.name)] }));
    // Deduplicate ex per split
    const deduped = baseSplits.map(s => ({ ...s, ex: [...new Set(s.ex)] }));
    setEditSplitsData(deduped);
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
    let found = false;

    Object.keys(updatedExercises).forEach(k => {
      updatedExercises[k] = (updatedExercises[k] || []).map(e => {
        if (e.name === oldName) {
          found = true;
          return { ...e, name: newName, tecnico: newTecnico, musculos: newMusculosList };
        }
        return e;
      });
    });

    // Ejercicio solo en EXERCISE_DB o exlog — insertarlo en los splits que lo referencian
    if (!found) {
      (splits || DEFAULT_SPLITS).forEach(s => {
        if ((s.ex || []).includes(oldName)) {
          if (!updatedExercises[s.key]) updatedExercises[s.key] = [];
          // evitar duplicado
          if (!updatedExercises[s.key].find(e => e.name === oldName || e.name === newName)) {
            updatedExercises[s.key] = [...updatedExercises[s.key], { name: newName, tecnico: newTecnico, musculos: newMusculosList }];
            found = true;
          }
        }
      });
      // Si tampoco está en ningún split (solo en exlog), agregar al split activo
      if (!found) {
        if (!updatedExercises[sel]) updatedExercises[sel] = [];
        updatedExercises[sel] = [...updatedExercises[sel], { name: newName, tecnico: newTecnico, musculos: newMusculosList }];
      }
    }

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

  const handleMergeExercise = (sourceName, targetName) => {
    if (!targetName || targetName === sourceName) return;
    // Merge sets from both keys, newest first, max 60
    const merged = [...(exlog[sourceName] || []), ...(exlog[targetName] || [])]
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .slice(0, 60);
    const updatedExlog = { ...exlog, [targetName]: merged };
    delete updatedExlog[sourceName];
    // Rename in exercises state (replace sourceName → targetName, deduplicate)
    const updatedExercises = { ...exercises };
    Object.keys(updatedExercises).forEach(k => {
      const seen = new Set();
      updatedExercises[k] = (updatedExercises[k] || [])
        .map(e => e.name === sourceName ? { ...e, name: targetName } : e)
        .filter(e => { if (seen.has(e.name)) return false; seen.add(e.name); return true; });
    });
    // Rename in splits.ex[]
    const updatedSplits = (splits || DEFAULT_SPLITS).map(s => ({
      ...s,
      ex: [...new Set((s.ex || []).map(n => n === sourceName ? targetName : n))]
    }));
    setExlog(updatedExlog);
    setExercises(updatedExercises);
    setSplits(updatedSplits);
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
        let tecnico = "", equipo = "peso libre", musculos = [];
        // Local-first: si el ejercicio ya existe, reusar su metadata sin llamar a la IA
        const matchName = findBestMatch(addText.trim(), allExerciseObjects.map(e => e.name));
        const matchObj = matchName ? allExerciseObjects.find(e => e.name === matchName) : null;
        if (matchObj && (matchObj.musculos?.length || matchObj.tecnico)) {
          tecnico = matchObj.tecnico || "";
          equipo = matchObj.equipo || "peso libre";
          musculos = matchObj.musculos || [];
        } else {
          const cached = getAICache("exname", addText.trim());
          if (cached) {
            tecnico = cached.tecnico || ""; equipo = cached.equipo || "peso libre"; musculos = cached.musculos || [];
          } else {
            try {
              const sys = "Eres un entrenador personal experto. Analiza el ejercicio brindado, identifica su nombre técnico, el tipo de equipo usado y exactamente 5 músculos ordenados de mayor a menor activación (primario → secundarios → estabilizadores). Devuelve un JSON. Ejemplo:\n" +
                          "{\n" +
                          "  \"tecnico\": \"Extensión de rodilla en máquina\",\n" +
                          "  \"equipo\": \"máquina\",\n" +
                          "  \"musculos\": [\"Cuádriceps femoral\", \"Vasto lateral\", \"Vasto medial\", \"Recto femoral\", \"Glúteo mayor\"]\n" +
                          "}\n" +
                          "Valores válidos para equipo: \"peso libre\", \"máquina\", \"polea\", \"cuerpo libre\".";
              const schema = {
                type: "OBJECT",
                properties: {
                  tecnico: { type: "STRING" },
                  equipo: { type: "STRING" },
                  musculos: { type: "ARRAY", items: { type: "STRING" }, description: "Exactamente 5 músculos de mayor a menor activación" }
                },
                required: ["tecnico", "equipo", "musculos"]
              };
              const o = cleanAndParseJSON(await callGemini([{role:"user", content:addText.trim()}], sys, schema));
              tecnico = o.tecnico || "";
              equipo = o.equipo || "peso libre";
              musculos = o.musculos || [];
              setAICache("exname", addText.trim(), { tecnico, equipo, musculos });
            } catch(aiE) {
              setAddErr("⚠️ " + aiErr(aiE) + " — ejercicio añadido sin metadatos.");
            }
          }
        }
        setExercises({...exercises, [sel]: [...dayExs, {name: addText.trim(), tecnico, equipo, musculos}]});
        setSplits((splits || DEFAULT_SPLITS).map(s => s.key === sel ? {...s, ex: [...new Set([...(s.ex||[]), addText.trim()])]} : s));
      } else {
        let nombre = addText.trim(), tecnico = "", equipo = "peso libre", musculos = [];
        const cachedD = getAICache("exdesc", addText.trim());
        if (cachedD) {
          nombre = cachedD.nombre || addText.trim();
          tecnico = cachedD.tecnico || "";
          equipo = cachedD.equipo || "peso libre";
          musculos = cachedD.musculos || [];
        } else {
          try {
            const sys = "El usuario describe un ejercicio físico. Identifícalo, indica su nombre técnico, el tipo de equipo y exactamente 5 músculos ordenados de mayor a menor activación (primario → secundarios → estabilizadores). Devuelve un JSON. Ejemplo:\n" +
                        "{\n" +
                        "  \"nombre\": \"Vuelos laterales en polea\",\n" +
                        "  \"tecnico\": \"Abducción de hombro en polea baja\",\n" +
                        "  \"equipo\": \"polea\",\n" +
                        "  \"musculos\": [\"Deltoides lateral\", \"Supraespinoso\", \"Trapecio medio\", \"Infraespinoso\", \"Serrato anterior\"]\n" +
                        "}\n" +
                        "Valores válidos para equipo: \"peso libre\", \"máquina\", \"polea\", \"cuerpo libre\".";
            const schema = {
              type: "OBJECT",
              properties: {
                nombre: { type: "STRING" },
                tecnico: { type: "STRING" },
                equipo: { type: "STRING" },
                musculos: { type: "ARRAY", items: { type: "STRING" }, description: "Exactamente 5 músculos de mayor a menor activación" }
              },
              required: ["nombre", "tecnico", "equipo", "musculos"]
            };
            const o = cleanAndParseJSON(await callGemini([{role:"user", content:addText.trim()}], sys, schema));
            nombre = o.nombre || addText.trim();
            tecnico = o.tecnico || "";
            equipo = o.equipo || "peso libre";
            musculos = o.musculos || [];
            setAICache("exdesc", addText.trim(), { nombre, tecnico, equipo, musculos });
          } catch(aiE) {
            // Fallback: add with description as name, no AI metadata
            setAddErr("⚠️ " + aiErr(aiE) + " — añadido sin identificar, puedes editar el nombre después.");
          }
        }
        setExercises({...exercises, [sel]: [...dayExs, {name: nombre, tecnico, equipo, musculos}]});
        setSplits((splits || DEFAULT_SPLITS).map(s => s.key === sel ? {...s, ex: [...new Set([...(s.ex||[]), nombre])]} : s));
      }
      setAddText("");
      setAdding(false);
    } catch(e){
      setAddErr("⚠️ " + aiErr(e));
    }
    setAddBusy(false);
  };

  const analyzeProg = async(ex) => {
    setProgBusy(ex.name);
    const hist = (exlog[findExlogKey(ex.name)] || []).slice(0, 8).map(s => {
      const rirStr = (s.rir !== undefined && s.rir !== null) ? `@RIR ${s.rir}` : "";
      const repsNum = parseInt(s.reps);
      const rirNum = (s.rir !== undefined && s.rir !== null && !isNaN(parseInt(s.rir))) ? parseInt(s.rir) : 0;
      const rmVal = (!isNaN(s.w) && !isNaN(repsNum) && repsNum > 0) ? Math.round(s.w * (1 + (repsNum + rirNum) / 30)) : null;
      const rmStr = rmVal ? ` (RM est: ${rmVal}kg)` : "";
      return `${fdate(s.date)}: ${s.w}kg x ${s.reps}${rirStr}${rmStr}`;
    }).join(" | ") || "Sin registros previos";

    // Fatiga acumulada en sesión — ejercicios ya hechos hoy con músculos solapados
    const exMusculos = ex.musculos || [];
    const sessionToday = workoutSessions[selectedDateStr] || {};
    const allExObjects = Object.values(exercises || {}).flat();
    const priorFatigue = Object.entries(sessionToday)
      .filter(([name]) => name !== ex.name && name !== findExlogKey(ex.name))
      .map(([name, sets]) => {
        const priorEx = allExObjects.find(e => e.name === name);
        const priorMuscles = priorEx?.musculos || [];
        const effective = sets.filter(s => s.type !== "warmup");
        if (!effective.length) return null;
        const vol = Math.round(effective.reduce((a, s) => a + (parseFloat(s.w)||0) * (parseInt(s.reps)||0), 0));
        const overlap = priorMuscles.filter((m, i) => i <= 2 && exMusculos.some(em =>
          em.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(em.toLowerCase())
        ));
        if (!overlap.length && priorMuscles[0] !== exMusculos[0]) return null;
        return `${name} (${effective.length} series, ${vol}kg vol) → músculos solapados: ${overlap.join(", ") || priorMuscles[0]}`;
      })
      .filter(Boolean);

    const fatigueCtx = priorFatigue.length > 0
      ? `\n\nCONTEXTO DE FATIGA ACUMULADA HOY (ejercicios previos en esta sesión que comparten músculos):\n${priorFatigue.join("\n")}\nESTO ES CLAVE: si el peso de hoy es menor al histórico, puede deberse al orden del ejercicio y la fatiga acumulada — NO necesariamente a una pérdida de fuerza real. Considerar esto al interpretar el rendimiento.`
      : "";

    try{
      const sensations = getRecentSensationsText();
      const sys = `Eres el entrenador personal de Bruno. ${getProfileStr(activeMetrics.weight, activeMetrics.musculo, activeMetrics.grasaPct, activeMetrics.visceral)} Entrega recomendaciones concretas de sobrecarga progresiva y técnica de ejecución. Corto y directo. Si Bruno reporta cansancio, dolor, molestias o fatiga, ajusta proactivamente.`;
      const out = await callGemini([{role:"user", content:`Ejercicio: ${ex.name}. Músculos: ${exMusculos.join(", ") || "?"}.\nHistorial reciente (nuevo a viejo, con 1RM estimado): ${hist}.\nSensaciones recientes: ${sensations}.${fatigueCtx}\nAnaliza el rendimiento considerando el contexto de fatiga y da pautas de carga para el próximo entrenamiento.`}], sys);
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

      {topProgress.length > 0 && (
        <div style={{display:"flex", gap:6, marginBottom:12, overflowX:"auto"}}>
          {topProgress.map((p, i) => (
            <div key={i} style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:10, padding:"8px 10px", minWidth:110, flexShrink:0}}>
              <div style={{fontSize:9, fontWeight:700, color:C.muted, textTransform:"uppercase", marginBottom:2}}>Top {i+1} · 30 días</div>
              <div style={{fontSize:12, fontWeight:800, color:C.ink, marginBottom:2, lineHeight:1.2}}>{p.name}</div>
              <div style={{fontSize:13, fontWeight:900, color:C.lime}}>+{p.delta}kg</div>
              <div style={{fontSize:10, color:C.muted}}>{p.current}kg ahora</div>
            </div>
          ))}
        </div>
      )}

      <InsightsCarousel
        muscleImbalances={muscleImbalances}
        plateauAlerts={plateauAlerts}
        overloadSuggestions={overloadSuggestions}
        aiTips={aiTips}
      />

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
                {(() => {
                  let streak = 0;
                  const todayD = new Date();
                  for (let i = 0; i < 365; i++) {
                    const d = new Date(todayD);
                    d.setDate(d.getDate() - i);
                    const ds = getLocalDateStr(d);
                    if (workoutSessions[ds] && Object.keys(workoutSessions[ds]).length > 0) {
                      streak++;
                    } else {
                      break;
                    }
                  }
                  return (
                    <span style={{fontSize:11, fontWeight:800, padding:"2px 8px", borderRadius:6, background: streak >= 2 ? "rgba(205,255,74,0.1)" : "rgba(154,160,136,0.08)", color: streak >= 2 ? C.lime : C.muted, border:`1px solid ${streak >= 2 ? "rgba(205,255,74,0.25)" : "rgba(154,160,136,0.15)"}`}}>
                      🔥 {streak} días
                    </span>
                  );
                })()}
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

            {/* Score de rendimiento mensual */}
            {(() => {
              const monthSessions = Object.keys(workoutSessions || {}).filter(d => {
                const dd = new Date(d + "T12:00:00");
                return dd.getFullYear() === year && dd.getMonth() === month && workoutSessions[d] && Object.keys(workoutSessions[d]).length > 0;
              });
              const trainDaysScore = Math.min(4, (monthSessions.length / 20) * 4);
              const totalSetsMonth = monthSessions.reduce((sum, d) => {
                return sum + Object.values(workoutSessions[d]).reduce((a, sets) => a + sets.filter(s => s.type !== "warmup").length, 0);
              }, 0);
              const volumeScore = Math.min(3, (totalSetsMonth / 100) * 3);
              const topProgress = Object.keys(exlog || {}).filter(exKey => {
                const sets = (exlog[exKey] || []).filter(s => {
                  const dd = new Date(s.date + "T12:00:00");
                  return dd.getFullYear() === year && dd.getMonth() === month;
                });
                if (sets.length < 2) return false;
                const sorted = [...sets].sort((a,b) => a.date < b.date ? -1 : 1);
                return parseFloat(sorted[sorted.length-1].w||0) > parseFloat(sorted[0].w||0);
              });
              const progressScore = Math.min(3, topProgress.length);
              const totalScore = Math.round((trainDaysScore + volumeScore + progressScore) * 10) / 10;
              const filled = Math.round(totalScore);
              const squares = [...Array(10)].map((_, i) => i < filled ? "⬛" : "⬜").join("");
              return (
                <div style={{background:"rgba(205,255,74,0.05)", border:"1px solid rgba(205,255,74,0.12)", borderRadius:8, padding:"6px 10px", fontSize:11, color:C.muted, marginBottom:8, display:"flex", alignItems:"center", gap:6}}>
                  Rendimiento este mes: <span style={{letterSpacing:1}}>{squares}</span> <span style={{color:C.lime, fontWeight:800}}>{totalScore}/10</span>
                </div>
              );
            })()}

            {/* Alertas: descanso y racha */}
            {(() => {
              const last3 = [-2,-1,0].map(i => { const d = new Date(selectedDateStr+"T12:00:00"); d.setDate(d.getDate()+i); return getLocalDateStr(d); });
              const consecutive3 = last3.every(d => !!(workoutSessions[d] && Object.keys(workoutSessions[d]).length > 0));
              if (!consecutive3) return null;
              return (
                <div style={{fontSize:11, color:C.cyan, background:"rgba(74,214,255,0.06)", border:"1px solid rgba(74,214,255,0.18)", borderRadius:7, padding:"5px 10px", marginBottom:8}}>
                  💤 3 días seguidos — considera un día de recuperación
                </div>
              );
            })()}

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

              {/* Quick sensation */}
              <div style={{display:"flex", gap:5, marginBottom:8}}>
                {[["😴","Fatigado","rgba(255,61,113,0.1)","rgba(255,61,113,0.3)",C.rose],["💪","Normal","rgba(205,255,74,0.08)","rgba(205,255,74,0.25)",C.lime],["🚀","Óptimo","rgba(74,214,255,0.08)","rgba(74,214,255,0.25)",C.cyan]].map(([emoji,label,bg,border,col]) => {
                  const todaySensation = (notes||[]).find(n => n.type==="sensacion" && n.date?.slice(0,10)===selectedDateStr);
                  const isActive = todaySensation?.text?.toLowerCase().includes(label.toLowerCase());
                  return (
                    <button key={label} onClick={() => {
                      const newNote = { id: uid(), type:"sensacion", date: new Date(selectedDateStr+"T"+new Date().toTimeString().slice(0,8)).toISOString(), text: label };
                      const filtered = (notes||[]).filter(n => !(n.type==="sensacion" && n.date?.slice(0,10)===selectedDateStr));
                      setNotes && setNotes([newNote, ...filtered]);
                    }} style={{flex:1, background:isActive?bg:"transparent", border:`1px solid ${isActive?border:C.line}`, borderRadius:8, padding:"5px 4px", color:isActive?col:C.muted, fontSize:11, fontWeight:700, cursor:"pointer"}}>
                      {emoji} {label}
                    </button>
                  );
                })}
              </div>

              {selectedDayWorkouts && (() => {
                const { totalVol, density, dur } = getSessionStats();
                const totalSets = Object.values(selectedDayWorkouts||{}).reduce((a,sets)=>a+(sets.filter(s=>s.type!=="warmup").length),0);
                const setsPerMin = dur > 0 ? Math.round((totalSets/dur)*10)/10 : 0;
                const otherSessionDates = Object.keys(workoutSessions)
                  .filter(d => d !== selectedDateStr && workoutSessions[d] && Object.keys(workoutSessions[d]).length > 0)
                  .sort().slice(-8);
                const avgHistVol = otherSessionDates.length ? Math.round(
                  otherSessionDates.reduce((sum, d) => {
                    const sessVol = Object.values(workoutSessions[d]).flat()
                      .filter(s => s.type !== "warmup")
                      .reduce((a, s) => a + (parseFloat(s.w)||0)*(parseInt(s.reps)||0), 0);
                    return sum + sessVol;
                  }, 0) / otherSessionDates.length
                ) : 0;
                const volDiffPct = avgHistVol > 0 && totalVol > 0 ? Math.round(((totalVol - avgHistVol) / avgHistVol) * 100) : null;
                return (
                  <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10, marginBottom:10}}>
                    <div style={{display:"flex", justifyContent:"space-between", fontSize:12, color:C.ink, marginBottom:8, flexWrap:"wrap", gap:4}}>
                      <span>Volumen Efectivo: <b style={{color:C.lime}}>{totalVol.toLocaleString()} kg</b>{volDiffPct !== null && <span style={{fontSize:11, color: volDiffPct >= 0 ? C.lime : C.rose, marginLeft:4}}>({volDiffPct >= 0 ? "+" : ""}{volDiffPct}% vs media)</span>}</span>
                      <span style={{display:"flex", gap:8, alignItems:"center"}}>
                        {dur > 0 && <span>Densidad: <b style={{color:C.cyan}}>{density} kg/min</b></span>}
                        {setsPerMin > 0 && <span>Intensidad: <b style={{color:C.amber}}>{setsPerMin} ser/min</b></span>}
                      </span>
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

              {/* Resumen muscular de la sesión */}
              {selectedDayWorkouts && (() => {
                const muscleSets = calcSessionMuscleSets(exlog, exercises, selectedDateStr);
                if (!muscleSets.length) return null;
                return (
                  <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", marginBottom:10}}>
                    <div style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", marginBottom:8}}>
                      Músculos trabajados hoy
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:5}}>
                      {muscleSets.map(({ muscle, weightedSets, sets, exNames }, i) => {
                        const maxW = muscleSets[0]?.weightedSets || 1;
                        const pct = Math.round((weightedSets / maxW) * 100);
                        const color = i === 0 ? C.lime : i === 1 ? C.cyan : i <= 3 ? C.amber : C.muted;
                        return (
                          <div key={muscle}>
                            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3}}>
                              <span style={{fontSize:11.5, fontWeight:700, color: i < 3 ? C.ink : C.muted}}>{muscle}</span>
                              <span style={{fontSize:10, color:C.muted}}>{sets} series</span>
                            </div>
                            <div style={{height:4, borderRadius:4, background:"rgba(255,255,255,0.05)", overflow:"hidden"}}>
                              <div style={{height:"100%", width:`${pct}%`, background:color, borderRadius:4, transition:"width .3s"}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Semana actual vs anterior */}
              {(() => {
                const getWeekStart = (dateStr) => {
                  const d = new Date(dateStr + "T12:00:00");
                  const day = d.getDay();
                  const diff = (day === 0 ? -6 : 1 - day);
                  d.setDate(d.getDate() + diff);
                  return getLocalDateStr(d);
                };
                const weekStart = getWeekStart(selectedDateStr);
                const prevWeekStart = (() => { const d = new Date(weekStart + "T12:00:00"); d.setDate(d.getDate()-7); return getLocalDateStr(d); })();
                const getWeekDates = (start) => [...Array(7)].map((_,i) => { const d = new Date(start+"T12:00:00"); d.setDate(d.getDate()+i); return getLocalDateStr(d); });
                const curWeekDates = getWeekDates(weekStart);
                const prevWeekDates = getWeekDates(prevWeekStart);
                const weekStats = (dates) => {
                  let sets=0, vol=0, days=0;
                  dates.forEach(d => {
                    const sess = workoutSessions[d];
                    if (!sess || Object.keys(sess).length === 0) return;
                    days++;
                    Object.values(sess).forEach(exSets => {
                      exSets.forEach(s => { if(s.type!=="warmup"){ sets++; vol += (parseFloat(s.w)||0)*(parseInt(s.reps)||0); } });
                    });
                  });
                  return {sets, vol:Math.round(vol), days};
                };
                const curStats = weekStats(curWeekDates);
                const prevStats = weekStats(prevWeekDates);
                return (
                  <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", marginBottom:10}}>
                    <div style={{fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", marginBottom:8}}>Semana actual vs anterior</div>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                      {[["Esta semana", curStats], ["Sem. anterior", prevStats]].map(([label, stats], i) => (
                        <div key={label} style={{background:C.bg, borderRadius:8, padding:"8px 10px"}}>
                          <div style={{fontSize:10, color:C.muted, fontWeight:700, marginBottom:4}}>{label}</div>
                          <div style={{fontSize:13, fontWeight:800, color: i===0 ? C.lime : C.muted}}>{stats.sets} series</div>
                          <div style={{fontSize:10.5, color:C.muted}}>{stats.vol.toLocaleString()} kg vol</div>
                          <div style={{fontSize:10, color:C.muted}}>{stats.days} días</div>
                        </div>
                      ))}
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
                                {(() => {
                                  const allSetsForEx = exlog[findExlogKey(exName)] || [];
                                  const todaySets = (workoutSessions[selectedDateStr]?.[exName] || []).filter(s => s.type !== "warmup");
                                  const histSets = allSetsForEx.filter(s => {
                                    try { const d = new Date(s.date); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` !== selectedDateStr && s.type !== "warmup"; } catch(e){ return false; }
                                  });
                                  const histMax = histSets.length ? Math.max(...histSets.map(s => parseFloat(s.w)||0)) : 0;
                                  const todayMax = todaySets.length ? Math.max(...todaySets.map(s => parseFloat(s.w)||0)) : 0;
                                  const isPR = histMax > 0 && todayMax > histMax;
                                  return isPR ? <span style={{fontSize:10, fontWeight:800, color:"#ffd700", background:"rgba(255,215,0,0.12)", border:"1px solid rgba(255,215,0,0.3)", borderRadius:4, padding:"1px 5px", marginLeft:4}}>★ PR</span> : null;
                                })()}
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
                                {globalEx.musculos.map((m, idx) => (
                                  <span key={m} style={{...tag,
                                    background: idx === 0 ? "rgba(205,255,74,0.15)" : idx <= 2 ? "rgba(74,214,255,0.12)" : "rgba(154,160,136,0.08)",
                                    color: idx === 0 ? C.lime : idx <= 2 ? C.cyan : C.muted,
                                    border: `1px solid ${idx === 0 ? "rgba(205,255,74,0.3)" : idx <= 2 ? "rgba(74,214,255,0.2)" : "rgba(154,160,136,0.15)"}`
                                  }}>{m}</span>
                                ))}
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
        <div style={{marginLeft:"auto", display:"flex", gap:6}}>
          <button
            onClick={() => buildRoutinePDF(sel)}
            title="Generar PDF imprimible de este split"
            style={{
              padding:"6px 11px",
              height:36,
              borderRadius:10,
              background: C.panel2,
              border: `1px solid ${C.line}`,
              color: C.muted,
              fontSize:11.5,
              fontWeight:800,
              cursor:"pointer",
              display:"flex",
              alignItems:"center",
              gap:4
            }}
          >
            <FileText size={12}/>
            <span>PDF</span>
          </button>
          <button
            onClick={startEditSplits}
            style={{
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

      {/* Buscador de ejercicios */}
      {dayExs.length > 3 && (
        <div style={{position:"relative", marginBottom:10}}>
          <input
            type="text"
            placeholder="Buscar por nombre o músculo…"
            value={exSearch}
            onChange={e => setExSearch(e.target.value)}
            style={{width:"100%", boxSizing:"border-box", background:C.panel, border:`1px solid ${exSearch ? C.lime : C.line}`, borderRadius:10, padding:"8px 32px 8px 12px", fontSize:13, color:C.ink, outline:"none"}}
          />
          {exSearch ? (
            <button onClick={() => setExSearch("")} style={{position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16, lineHeight:1, padding:0}}>✕</button>
          ) : (
            <span style={{position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:C.muted, fontSize:14, pointerEvents:"none"}}>🔍</span>
          )}
        </div>
      )}

      {/* Listado de ejercicios del día */}
      {(() => {
        const q = exSearch.toLowerCase().trim();
        const filtered = q
          ? dayExs.filter(ex =>
              ex.name.toLowerCase().includes(q) ||
              (ex.musculos || []).some(m => m.toLowerCase().includes(q))
            )
          : dayExs;
        if (q && filtered.length === 0) return (
          <div style={{textAlign:"center", color:C.muted, fontSize:13, padding:"16px 0"}}>
            Sin resultados para "{exSearch}"
          </div>
        );
        return filtered.map(ex => {
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
                    {(() => {
                      const exKey = Object.keys(exlog || {}).find(k => k === ex.name || k.toLowerCase() === ex.name.toLowerCase());
                      const lastSet = exKey ? (exlog[exKey] || [])[0] : null;
                      const daysSince = lastSet ? Math.floor((Date.now() - new Date(lastSet.date).getTime()) / 86400000) : 999;
                      const isOrphan = daysSince >= 21;
                      return isOrphan ? <span style={{fontSize:9, fontWeight:800, color:C.amber, border:"1px solid rgba(255,185,64,0.3)", borderRadius:4, padding:"1px 5px", marginLeft:4}}>⚠ {daysSince < 999 ? daysSince+"d" : "nunca"}</span> : null;
                    })()}
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
                  {exerciseTechNotes && exerciseTechNotes[ex.name] && <div style={{fontSize:11, color:C.amber, fontStyle:"italic", marginTop:1}}>💡 {exerciseTechNotes[ex.name]}</div>}
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
                    {ex.musculos.map((m, idx) => (
                      <span key={m} style={{...tag,
                        background: idx === 0 ? "rgba(205,255,74,0.15)" : idx <= 2 ? "rgba(74,214,255,0.12)" : "rgba(154,160,136,0.08)",
                        color: idx === 0 ? C.lime : idx <= 2 ? C.cyan : C.muted,
                        border: `1px solid ${idx === 0 ? "rgba(205,255,74,0.3)" : idx <= 2 ? "rgba(74,214,255,0.2)" : "rgba(154,160,136,0.15)"}`
                      }}>{m}</span>
                    ))}
                  </div>
                )}

                {/* 1RM histórico mini chart */}
                {(() => {
                  const rmHistory = (chartData(ex.name) || []).slice(-12).map(s => {
                    const reps = parseInt(s.reps)||0;
                    const rir = parseInt(s.rir)||0;
                    const rm = (reps > 0 && s.w) ? Math.round(parseFloat(s.w) * (1 + (reps+rir)/30)) : null;
                    return rm;
                  }).filter(Boolean).slice(-8);
                  if (rmHistory.length < 2) return null;
                  const min = Math.min(...rmHistory), max = Math.max(...rmHistory);
                  const range = max - min || 1;
                  const pts = rmHistory.map((v,i) => {
                    const x = (i / (rmHistory.length-1)) * 100;
                    const y = 30 - ((v-min)/range)*24;
                    return `${x},${y}`;
                  }).join(" ");
                  return (
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:10, fontWeight:700, color:C.muted, marginBottom:4}}>1RM estimado histórico (kg)</div>
                      <svg viewBox="0 0 100 36" style={{width:"100%", height:36, overflow:"visible"}}>
                        <polyline points={pts} fill="none" stroke={C.lime} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        {rmHistory.map((v,i) => {
                          const x = (i / (rmHistory.length-1)) * 100;
                          const y = 30 - ((v-min)/range)*24;
                          return <circle key={i} cx={x} cy={y} r={i===rmHistory.length-1?2.5:1.5} fill={i===rmHistory.length-1?C.lime:"rgba(205,255,74,0.5)"}/>;
                        })}
                      </svg>
                      <div style={{display:"flex", justifyContent:"space-between", fontSize:9, color:C.muted, marginTop:2}}>
                        <span>{min} kg</span><span>{max} kg</span>
                      </div>
                    </div>
                  );
                })()}

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

                {(exlog[findExlogKey(ex.name)] || []).length === 0 && (
                  <div style={{fontSize:12, color:C.muted, padding:"4px 0"}}>Sin registros en bitácora.</div>
                )}

                {(exlog[findExlogKey(ex.name)] || []).map((s, i) => (
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
                    <button onClick={() => delSet(findExlogKey(ex.name), i)} style={{marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:C.muted}}>
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
      });
      })()}

      {/* ===== Gestionar todos los ejercicios ===== */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, marginBottom:12, overflow:"hidden"}}>
        <button
          onClick={() => { setShowExMgr(v => !v); setExMgrSearch(""); }}
          style={{width:"100%", background:"none", border:"none", padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", color:C.ink}}
        >
          <span style={{fontSize:12.5, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".05em"}}>Gestionar todos los ejercicios</span>
          <span style={{color:C.muted, fontSize:13}}>{showExMgr ? "▴" : "▾"}</span>
        </button>
        {showExMgr && (
          <div style={{padding:"0 14px 14px"}}>
            <input
              value={exMgrSearch}
              onChange={e => setExMgrSearch(e.target.value)}
              placeholder="Buscar ejercicio…"
              className="ph"
              style={{width:"100%", boxSizing:"border-box", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, padding:"8px 12px", color:C.ink, fontSize:13, outline:"none", marginBottom:10}}
            />
            {Object.keys(exlog || {})
              .filter(n => !exMgrSearch || n.toLowerCase().includes(exMgrSearch.toLowerCase()))
              .sort()
              .map(n => (
                <div key={n} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderTop:`1px solid ${C.line}`}}>
                  <div>
                    <div style={{fontSize:13, fontWeight:600, color:C.ink}}>{n}</div>
                    <div style={{fontSize:11, color:C.muted}}>{(exlog[n]||[]).length} registros</div>
                  </div>
                  <button
                    onClick={() => { setMergeTarget(""); setEditExObj({ ex: { name: n }, isMerging: true }); }}
                    style={{background:"rgba(74,214,255,0.1)", color:C.cyan, fontWeight:700, fontSize:11.5, padding:"6px 12px", borderRadius:8, border:`1px solid ${C.cyan}44`, cursor:"pointer", whiteSpace:"nowrap"}}
                  >
                    🔗 Fusionar
                  </button>
                </div>
              ))
            }
            {Object.keys(exlog || {}).filter(n => !exMgrSearch || n.toLowerCase().includes(exMgrSearch.toLowerCase())).length === 0 && (
              <div style={{fontSize:12, color:C.muted, textAlign:"center", padding:"12px 0"}}>Sin ejercicios encontrados</div>
            )}
          </div>
        )}
      </div>

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
              <button onClick={() => { setAddMode("nombre"); setAddText(""); }} style={{flex:1, padding:"8px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:`1px solid ${addMode === "nombre" ? C.lime : C.line}`, background: addMode === "nombre" ? "rgba(107,78,255,.12)" : "transparent", color: addMode === "nombre" ? C.lime : C.muted}}>
                Sé el nombre
              </button>
              <button onClick={() => { setAddMode("describir"); setAddText(""); }} style={{flex:1, padding:"8px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:`1px solid ${addMode === "describir" ? C.lime : C.line}`, background: addMode === "describir" ? "rgba(107,78,255,.12)" : "transparent", color: addMode === "describir" ? C.lime : C.muted}}>
                Describirlo
              </button>
            </div>

            {addMode === "nombre" ? (
              <div style={{position:"relative"}}>
                <input
                  value={addText}
                  onChange={e => setAddText(e.target.value)}
                  className="ph"
                  placeholder="Buscar ejercicio… ej: Hip thrust, Curl"
                  style={{width:"100%", boxSizing:"border-box", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none"}}
                />
                {(() => {
                  const q = addText.trim().toLowerCase();
                  if (!q) return null;
                  const filtered = allExerciseObjects.filter(e => e.name.toLowerCase().includes(q));
                  if (!filtered.length) return null;
                  const groups = {};
                  filtered.forEach(e => { const eq = e.equipo || "peso libre"; (groups[eq] = groups[eq]||[]).push(e); });
                  EQUIPO_ORDER.forEach(eq => { if (groups[eq]) groups[eq].sort((a,b) => a.name.localeCompare(b,"es")); });
                  return (
                    <div style={{position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:C.bg, border:`1px solid ${C.line}`, borderRadius:12, zIndex:60, overflow:"hidden", boxShadow:"0 8px 28px rgba(0,0,0,0.45)", maxHeight:320, overflowY:"auto"}}>
                      {EQUIPO_ORDER.filter(eq => groups[eq]).map(eq => (
                        <div key={eq}>
                          <div style={{padding:"6px 12px 4px", fontSize:9.5, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".07em", background:"rgba(0,0,0,0.18)", position:"sticky", top:0}}>
                            {EQUIPO_LABEL[eq]}
                          </div>
                          {groups[eq].map(ex => (
                            <div key={ex.name}
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => {
                                const existing = allExerciseObjects.find(o => o.name === ex.name);
                                if (existing) {
                                  const alreadyInDay = dayExs.some(d => d.name === existing.name);
                                  if (!alreadyInDay) {
                                    setExercises({...exercises, [sel]: [...dayExs, {name:existing.name, tecnico:existing.tecnico||"", equipo:existing.equipo||"peso libre", musculos:existing.musculos||[]}]});
                                    setSplits((splits || DEFAULT_SPLITS).map(s => s.key === sel ? {...s, ex: [...new Set([...(s.ex||[]), existing.name])]} : s));
                                  }
                                  setAddText(""); setAdding(false);
                                } else {
                                  setAddText(ex.name);
                                }
                              }}
                              className="btn-active-scale"
                              style={{padding:"9px 12px", cursor:"pointer", borderTop:`1px solid ${C.line}`}}>
                              <div style={{fontSize:13, color:C.ink, fontWeight:600}}>{ex.name}</div>
                              {ex.tecnico && <div style={{fontSize:11, color:C.muted, marginTop:2, lineHeight:1.3}}>{ex.tecnico}</div>}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <textarea
                value={addText}
                onChange={e => setAddText(e.target.value)}
                rows={3}
                className="ph"
                placeholder="Ej: En máquina sentado, empujo los agarres hacia afuera separando los muslos..."
                style={{width:"100%", resize:"none", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px", color:C.ink, fontSize:13.5, outline:"none"}}
              />
            )}

            <div style={{display:"flex", gap:8, marginTop:8}}>
              <button
                onClick={addExercise}
                disabled={addBusy}
                style={{flex:1, padding:"10px", borderRadius:10, border:"none", background: addBusy ? C.panel2 : C.lime, color: addBusy ? C.muted : "#0c0e0b", cursor:"pointer", fontWeight:800, fontSize:13.5, display:"flex", alignItems:"center", justifyContent:"center", gap:6}}
              >
                {addBusy ? <><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Procesando…</> : (addMode === "nombre" ? "Añadir ejercicio nuevo" : "Identificar y añadir")}
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
            {!editExObj.isEditing && !editExObj.isMerging ? (
              <>
                <div style={{fontSize:16, fontWeight:800, color:C.ink, textAlign:"center"}}>Opciones de Ejercicio</div>
                <div style={{fontSize:12, color:C.muted, textAlign:"center", marginBottom:8}}>
                  {editExObj.ex.name}
                </div>
                <button onClick={() => setEditExObj({...editExObj, isEditing: true})} style={{background:C.lime, color:"#0c0e0b", fontWeight:800, padding:12, borderRadius:12, border:"none", cursor:"pointer"}}>
                  ✏️ Editar Ejercicio
                </button>
                <button
                  onClick={() => { setMergeTarget(""); setEditExObj({...editExObj, isMerging: true}); }}
                  style={{background:"rgba(74,214,255,0.1)", color:C.cyan, fontWeight:800, padding:12, borderRadius:12, border:`1px solid ${C.cyan}44`, cursor:"pointer"}}
                >
                  🔗 Fusionar con otro ejercicio
                </button>
                <button
                  onClick={() => {
                    const dateToUse = editExObj.sessionDate || selectedDateStr;
                    const canonKey = findExlogKey(editExObj.ex.name);
                    delExFromSession(canonKey, dateToUse);
                    setEditExObj(null);
                  }}
                  style={{background:"rgba(255, 61, 113, 0.15)", color:C.rose, fontWeight:800, padding:12, borderRadius:12, border:`1px solid ${C.rose}`, cursor:"pointer"}}
                >
                  🗑️ Quitar series de este día
                </button>
              </>
            ) : !editExObj.isEditing && editExObj.isMerging ? (
              <>
                <div style={{fontSize:16, fontWeight:800, color:C.ink, textAlign:"center"}}>Fusionar Ejercicio</div>
                <div style={{fontSize:12, color:C.muted, textAlign:"center"}}>
                  Todos los registros de <strong>{editExObj.ex.name}</strong> se unirán al ejercicio que elijas.
                </div>
                <select
                  value={mergeTarget}
                  onChange={e => setMergeTarget(e.target.value)}
                  style={{width:"100%", padding:"10px 8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, color:C.ink, fontSize:13}}
                >
                  <option value="">— Selecciona ejercicio destino —</option>
                  {[...new Set([
                    ...Object.keys(exlog),
                    ...Object.values(exercises).flat().map(e => e.name)
                  ])].filter(n => n !== editExObj.ex.name).sort().map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  disabled={!mergeTarget}
                  onClick={() => {
                    handleMergeExercise(editExObj.ex.name, mergeTarget);
                    setEditExObj(null);
                    setMergeTarget("");
                  }}
                  style={{background: mergeTarget ? C.lime : C.line, color: mergeTarget ? "#0c0e0b" : C.muted, fontWeight:800, padding:12, borderRadius:12, border:"none", cursor: mergeTarget ? "pointer" : "default"}}
                >
                  Confirmar Fusión
                </button>
                <button onClick={() => setEditExObj({...editExObj, isMerging: false})} style={{background:"none", border:"none", color:C.muted, fontWeight:700, padding:8, cursor:"pointer"}}>
                  Volver
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
                    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4}}>
                      <label style={{fontSize:11, color:C.muted, fontWeight:700}}>Músculos (mayor → menor activación)</label>
                      <button
                        disabled={refreshMuscleBusy}
                        onClick={async () => {
                          const exName = document.getElementById("ee-name").value.trim() || editExObj.ex.name;
                          setRefreshMuscleBusy(true);
                          try {
                            const sys = "Eres un entrenador personal experto en anatomía y biomecánica. Para el ejercicio dado, lista EXACTAMENTE 5 músculos en orden estricto de mayor a menor activación: 1º músculo principal, 2º secundario más activo, 3º secundario, 4º estabilizador primario, 5º estabilizador secundario. SIEMPRE devuelve exactamente 5, incluso para ejercicios simples — usa sinergistas y estabilizadores. Devuelve SOLO JSON.";
                            const schema = {
                              type: "OBJECT",
                              properties: {
                                musculos: {
                                  type: "ARRAY",
                                  items: { type: "STRING" },
                                  minItems: 5,
                                  maxItems: 5,
                                  description: "Exactamente 5 músculos de mayor a menor activación"
                                }
                              },
                              required: ["musculos"]
                            };
                            const o = cleanAndParseJSON(await callGemini([{role:"user", content:`Ejercicio: ${exName}`}], sys, schema));
                            const el = document.getElementById("ee-musculos");
                            if (el && o?.musculos?.length) {
                              el.value = o.musculos.slice(0, 5).join(", ");
                            } else {
                              alert("La IA no devolvió músculos. Intentá de nuevo.");
                            }
                          } catch(e) {
                            alert("Error al consultar la IA: " + (e?.message || e));
                          }
                          setRefreshMuscleBusy(false);
                        }}
                        style={{
                          background: refreshMuscleBusy ? C.panel2 : "rgba(205,255,74,0.1)",
                          border: `1px solid ${refreshMuscleBusy ? C.line : "rgba(205,255,74,0.4)"}`,
                          color: refreshMuscleBusy ? C.muted : C.lime,
                          borderRadius: 8, padding: "3px 8px", fontSize: 10.5,
                          fontWeight: 800, cursor: refreshMuscleBusy ? "default" : "pointer",
                          display: "flex", alignItems: "center", gap: 4
                        }}
                      >
                        {refreshMuscleBusy ? <><Loader2 size={10} style={{animation:"spin 1s linear infinite"}}/> Cargando</> : "🔄 IA"}
                      </button>
                    </div>
                    <input type="text" id="ee-musculos" defaultValue={(editExObj.ex.musculos || []).join(", ")} style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink}} />
                  </div>
                </div>

                <div>
                  <label style={{fontSize:11, color:C.muted, fontWeight:700}}>Notas de técnica / cues</label>
                  <textarea
                    id="ee-technotes"
                    defaultValue={(exerciseTechNotes && exerciseTechNotes[editExObj.ex.name]) || ""}
                    placeholder="Ej: codos a 45°, pecho a barra, pausa abajo..."
                    rows={2}
                    style={{width:"100%", padding:"8px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, color:C.ink, marginTop:4, resize:"none", fontSize:12}}
                  />
                </div>

                <button onClick={() => {
                  const newName = document.getElementById("ee-name").value.trim();
                  const newTecnico = document.getElementById("ee-tecnico").value.trim();
                  const newMusculosStr = document.getElementById("ee-musculos").value;
                  const newMusculosList = newMusculosStr.split(",").map(m => m.trim()).filter(Boolean);

                  if(newName) {
                    handleUpdateExercise(editExObj.ex.name, newName, newTecnico, newMusculosList);
                    const techNote = document.getElementById("ee-technotes")?.value?.trim();
                    if (techNote !== undefined) {
                      const oldName = editExObj.ex.name;
                      setExerciseTechNotes(prev => {
                        const next = {...prev};
                        if (oldName !== newName) delete next[oldName];
                        next[newName] = techNote;
                        return next;
                      });
                    }
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
              ¿Deseas quitar <strong>{confirmRemoveEx}</strong> de este split?
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
                Quitar de este split
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

            <div style={{borderTop:`1px solid ${C.line}`, paddingTop:12, display:"flex", flexDirection:"column", gap:8}}>
              <button
                onClick={() => {
                  const allExlogNames = Object.keys(exlog || {});

                  // Build date→exercises co-occurrence map
                  const dateToExs = {};
                  allExlogNames.forEach(exName => {
                    (exlog[exName] || []).forEach(s => {
                      if (s?.date) {
                        const d = s.date.slice(0, 10);
                        if (!dateToExs[d]) dateToExs[d] = [];
                        if (!dateToExs[d].includes(exName)) dateToExs[d].push(exName);
                      }
                    });
                  });

                  // Keyword → target muscles map for split name matching
                  const KW = {
                    empuje:['Pectoral','Deltoides','Tríceps'], push:['Pectoral','Deltoides','Tríceps'],
                    jalón:['Espalda','Bíceps','Antebrazo'], jal:['Espalda','Bíceps','Antebrazo'], pull:['Espalda','Bíceps','Antebrazo'],
                    pierna:['Cuádriceps','Isquios','Glúteos','Pantorrillas'], leg:['Cuádriceps','Isquios','Glúteos','Pantorrillas'],
                    brazo:['Bíceps','Tríceps','Antebrazo'], arm:['Bíceps','Tríceps','Antebrazo'],
                  };

                  // Target muscles per split (from split name keywords)
                  const splitTargets = {};
                  editSplitsData.forEach(day => {
                    const nl = day.name.toLowerCase();
                    let ms = [];
                    Object.entries(KW).forEach(([kw, mlist]) => { if (nl.includes(kw)) ms = [...ms, ...mlist]; });
                    splitTargets[day.key] = [...new Set(ms)];
                  });

                  // Score how well an exercise fits a split via muscle matching
                  const muscleScore = (exName, splitKey) => {
                    const targets = splitTargets[splitKey];
                    if (!targets || targets.length === 0) return 0.5; // circuito/unknown → neutral
                    const mgs = MUSCLES[exName] || Object.values(exercises || {}).flat().find(e => e.name === exName)?.musculos || [];
                    return mgs.filter(m => targets.some(t => m === t || m.startsWith(t.slice(0,5)))).length;
                  };

                  // Co-occurrence scores (seed = existing ex[] entries)
                  const coScore = {};
                  editSplitsData.forEach(day => {
                    coScore[day.key] = {};
                    const seeds = new Set((day.ex || []).map(n => n.toLowerCase()));
                    if (seeds.size === 0) return;
                    Object.values(dateToExs).forEach(dayExs => {
                      if (dayExs.some(n => seeds.has(n.toLowerCase()))) {
                        dayExs.forEach(n => {
                          if (!seeds.has(n.toLowerCase()))
                            coScore[day.key][n] = (coScore[day.key][n] || 0) + 1;
                        });
                      }
                    });
                  });

                  // Assign each exlog exercise to best split
                  const assignments = {};
                  editSplitsData.forEach(day => { assignments[day.key] = new Set(day.ex || []); });

                  allExlogNames.forEach(exName => {
                    const alreadyIn = editSplitsData.some(d => (d.ex || []).some(e => e.toLowerCase() === exName.toLowerCase()));
                    if (alreadyIn) return;
                    // Co-occurrence takes priority
                    let bestKey = null, bestCo = 0;
                    editSplitsData.forEach(d => { const s = coScore[d.key][exName] || 0; if (s > bestCo) { bestCo = s; bestKey = d.key; } });
                    if (bestKey) { assignments[bestKey].add(exName); return; }
                    // Muscle-keyword fallback
                    let bestMKey = null, bestMS = -1;
                    editSplitsData.forEach(d => { const s = muscleScore(exName, d.key); if (s > bestMS) { bestMS = s; bestMKey = d.key; } });
                    if (bestMKey) assignments[bestMKey].add(exName);
                    else assignments[editSplitsData[0]?.key]?.add(exName);
                  });

                  setEditSplitsData(editSplitsData.map(day => ({ ...day, ex: [...assignments[day.key]] })));
                }}
                style={{width:"100%", padding:"8px", background:"none", border:`1px solid ${C.cyan}66`, color:C.cyan, borderRadius:8, fontSize:11.5, fontWeight:700, cursor:"pointer"}}
              >
                Recuperar atajos del historial
              </button>
              <div style={{display:"flex", gap:8}}>
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
        </div>
      )}
    </div>
  );
}

/* ===== FITDAYS TRENDS MINI-CHART ===== */
function FitdaysTrends({ metricslog }) {
  const entries = React.useMemo(() => {
    return Object.entries(metricslog || {})
      .filter(([, v]) => v && (v.peso !== undefined || v.weight !== undefined))
      .sort(([a], [b]) => a < b ? -1 : (a > b ? 1 : 0))
      .map(([date, v]) => ({
        date,
        peso: v.peso ?? v.weight,
        grasaPct: v.grasaPct,
        smmKg: v.smmKg ?? v.masaMuscular ?? v.musculo,
        puntuacion: v.puntuacion,
        bmr: v.bmr,
        smi: v.smi,
      }));
  }, [metricslog]);

  if (entries.length < 2) return null;

  const W = 300, H = 70, pad = 18;
  const mkLine = (vals) => {
    const mn = Math.min(...vals), mx = Math.max(...vals), rg = (mx - mn) || 1;
    const X = i => pad + (i / (vals.length - 1)) * (W - 2 * pad);
    const Y = v => H - pad - ((v - mn) / rg) * (H - 2 * pad - 4);
    return { pts: vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" "), X, Y, mn, mx, vals };
  };

  const pesoVals = entries.map(e => e.peso).filter(v => v != null);
  const grasaVals = entries.map(e => e.grasaPct).filter(v => v != null);
  const smmVals = entries.map(e => e.smmKg).filter(v => v != null);
  const puntuacionVals = entries.map(e => e.puntuacion).filter(v => v != null);
  const bmrVals = entries.map(e => e.bmr).filter(v => v != null);
  const smiVals = entries.map(e => e.smi).filter(v => v != null);

  const hasPeso = pesoVals.length >= 2;
  const hasGrasa = grasaVals.length >= 2;
  const hasSMM = smmVals.length >= 2;
  const hasPuntuacion = puntuacionVals.length >= 2;
  const hasBmr = bmrVals.length >= 2;
  const hasSMI = smiVals.length >= 2;

  if (!hasPeso && !hasGrasa && !hasSMM) return null;

  const miniChart = (vals, color, label, unit) => {
    if (vals.length < 2) return null;
    const { pts, X, Y } = mkLine(vals);
    const last = vals[vals.length - 1];
    const first = vals[0];
    const up = last >= first;
    const area = `${X(0).toFixed(1)},${H - pad} ${pts} ${X(vals.length - 1).toFixed(1)},${H - pad}`;
    return (
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:10, color:C.muted, marginBottom:2, display:"flex", justifyContent:"space-between"}}>
          <span style={{fontWeight:700, color}}>{label}</span>
          <span style={{color:C.ink, fontWeight:800}}>{last.toFixed(1)}{unit} {up ? "↑" : "↓"}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:H, display:"block"}}>
          <polygon points={area} fill={color} opacity="0.10"/>
          <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
          {vals.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r="2.5" fill={color}/>)}
        </svg>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:9, color:C.muted, marginTop:-2}}>
          <span>{entries[0].date.slice(5)}</span>
          <span>{entries[entries.length - 1].date.slice(5)}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"12px 14px", marginBottom:12}}>
      <div style={{fontSize:12, fontWeight:800, color:C.ink, marginBottom:10}}>📈 Tendencias Fitdays</div>
      <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
        {hasPeso && miniChart(entries.filter(e => e.peso != null).map(e => e.peso), C.cyan, "Peso", " kg")}
        <div style={{flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:8}}>
          {hasGrasa && miniChart(entries.filter(e => e.grasaPct != null).map(e => e.grasaPct), C.amber, "% Grasa", "%")}
          {hasSMM && miniChart(entries.filter(e => e.smmKg != null).map(e => e.smmKg), C.lime, "SMM", " kg")}
          {hasPuntuacion && miniChart(entries.filter(e => e.puntuacion != null).map(e => e.puntuacion), "#a78bfa", "Score", "")}
        </div>
        {(hasBmr || hasSMI) && (
          <div style={{flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:8}}>
            {hasBmr && miniChart(entries.filter(e => e.bmr != null).map(e => e.bmr), C.rose, "BMR", " kcal")}
            {hasSMI && miniChart(entries.filter(e => e.smi != null).map(e => e.smi), "#22d3ee", "SMI", " kg/m²")}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== FITDAYS IMPORT COMPONENT ===== */
function FitdaysImport({ metricslog, setMetricslog, geminiKey }) {
  const [previews, setPreviews] = React.useState([]);
  const [imagesData, setImagesData] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [extracted, setExtracted] = React.useState(null);
  const [form, setForm] = React.useState({});
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [saved, setSaved] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [segGrasaOpen, setSegGrasaOpen] = React.useState(false);
  const [segMusculoOpen, setSegMusculoOpen] = React.useState(false);
  const [fitAnalysis, setFitAnalysis] = React.useState("");
  const [fitAnalysisBusy, setFitAnalysisBusy] = React.useState(false);

  const compressImage = (file) => compressImageToDataUrl(file, 600, 0.8);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []); // copia a array ANTES de limpiar el input
    if (files.length === 0) return;
    e.target.value = ""; // seguro limpiar ahora que tenemos copia
    setSaved(false);
    setExtracted(null);
    setForm({});
    setErr("");
    try {
      const newPreviews = [];
      const newImagesData = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImage(file);
        newPreviews.push(dataUrl);
        const b64 = dataUrl.split(",")[1];
        const mime = ["image/jpeg","image/png","image/webp"].includes(file.type) ? file.type : "image/jpeg";
        newImagesData.push({ b64, mime });
      }
      if (newImagesData.length === 0) {
        setErr("No se cargó ninguna imagen.");
        return;
      }
      // Acumula: si ya hay fotos cargadas, las agrega en vez de reemplazar
      setPreviews(prev => [...prev, ...newPreviews]);
      setImagesData(prev => [...prev, ...newImagesData]);
    } catch(ex) {
      setErr("No se pudieron leer las imágenes: " + (ex.message || ex));
    }
  };

  const doExtract = async () => {
    if (imagesData.length === 0 || busy) return;
    setBusy(true);
    setErr("");
    try {
      const sys = `Eres un extractor de datos de composición corporal especializado en informes Fitdays/InBody.
Extrae SOLO los valores que aparecen visibles. No inventes ni estimes valores ausentes.

MAPA EXACTO DE CAMPOS (usa estas claves JSON precisas):
• peso → "Peso" total en kg
• imc → "IMC" en kg/m²
• puntuacion → "Puntuación corporal" /100
• pesoObjetivo → "Peso objetivo recomendado" en kg (sección "Control de peso")
• tipoCuerpo → tipo de cuerpo como texto, p.ej. "Obesidad"
• grasaPct → "Grasa corporal %" (sección composición corporal)
• masaGrasa → masa grasa total en kg
• grasaSubc → "Grasa subcutánea" en %
• visceral → "Grado de grasa visceral" número entero 1-20
• masaMuscular → "Masa muscular" en kg (TOTAL — incluye todo tipo de músculo, ~64 kg)
• smmKg → "Músculo esquelético" en kg (SMM — solo músculo esquelético, ~40-45 kg)
• musculoEsq → "Músculo esquelético" en % si aparece como porcentaje
• masaOsea → "Masa Esquelética" en kg (tejido ÓSEO, ~4-5 kg) ← ¡ATENCIÓN: es hueso, NOT músculo!
• pesoSinGrasa → "Peso corporal sin grasa" / LBM en kg
• smi → "SMI" en kg/m²
• aguaKg → "Contenido de agua" en kg
• proteinaKg → "Cantidad de proteína" en kg
• bmr → "Tasa metabólica basal" en kcal (número solo, sin "kcal")
• edadCorporal → "Edad corporal" en años
• zinE → "zINE" valor decimal
• whr → "WHR" o "Índice cintura-cadera"
• grasaTronco/grasaBrazoDer/grasaBrazoIzq/grasaPiernaDer/grasaPiernaIzq → kg de grasa segmental
• musculoTronco/musculoBrazoDer/musculoBrazoIzq/musculoPiernaDer/musculoPiernaIzq → kg de músculo segmental

CRÍTICO: "Masa Esquelética" ≠ "Músculo esquelético". Masa Esquelética = huesos (~4.9 kg) → masaOsea. Músculo esquelético = SMM (~42 kg) → smmKg.`;

      // Build message with all images
      const content = [
        ...imagesData.map(img => ({
          type: "image",
          source: { type: "base64", media_type: img.mime, data: img.b64 }
        })),
        { type: "text", text: `Extrae todos los valores del informe Fitdays en estas ${imagesData.length} imagen(es). Sigue el mapa de campos del sistema EXACTAMENTE. Si hay múltiples imágenes con datos del mismo campo, usa el valor más legible. No inventes datos ausentes.` }
      ];

      const out = await callGemini([{
        role: "user",
        content
      }], sys, FITDAYS_SCHEMA);

      const parsed = cleanAndParseJSON(out);
      if (!parsed || parsed.peso == null) {
        setErr("No se detectaron datos. Intenta con otras capturas.");
      } else {
        setExtracted(parsed);
        const f = {};
        Object.keys(FITDAYS_SCHEMA.properties).forEach(k => {
          if (parsed[k] != null) f[k] = String(parsed[k]);
        });
        setForm(f);
      }
    } catch(ex) {
      setErr("Error IA: " + (ex.message || ex));
    }
    setBusy(false);
  };

  const fv = (k) => form[k] !== undefined ? form[k] : "";
  const sv = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }));

  const fieldInput = (k, label, unit) => (
    <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:5}}>
      <span style={{fontSize:11.5, color:C.muted, flex:"0 0 140px"}}>{label}:</span>
      <input
        value={fv(k)}
        onChange={e => sv(k)(e.target.value)}
        type="number"
        inputMode="decimal"
        style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"5px 8px", color:C.ink, fontSize:12, outline:"none", minWidth:0}}
      />
      {unit && <span style={{fontSize:11, color:C.muted, whiteSpace:"nowrap"}}>{unit}</span>}
    </div>
  );

  const fieldInputText = (k, label) => (
    <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:5}}>
      <span style={{fontSize:11.5, color:C.muted, flex:"0 0 140px"}}>{label}:</span>
      <input
        value={fv(k)}
        onChange={e => sv(k)(e.target.value)}
        type="text"
        style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"5px 8px", color:C.ink, fontSize:12, outline:"none", minWidth:0}}
      />
    </div>
  );

  const doSave = () => {
    if (!date) return;
    const entry = {};
    Object.keys(FITDAYS_SCHEMA.properties).forEach(k => {
      if (form[k] !== undefined && form[k] !== "") {
        if (FITDAYS_STRING_FIELDS.has(k)) {
          entry[k] = form[k];
        } else {
          const n = parseFloat(form[k]);
          if (!isNaN(n)) entry[k] = n;
        }
      }
    });
    if (entry.peso == null && entry.weight == null) {
      setErr("Se requiere el peso para guardar.");
      return;
    }
    // Map peso -> weight for metricslog compatibility
    if (entry.peso != null && entry.weight == null) entry.weight = entry.peso;
    const current = metricslog[date] || {};
    const updated = { ...current, ...entry };
    const newLog = { ...metricslog, [date]: updated };
    setMetricslog(newLog);
    saveKey("metricslog", newLog);
    setSaved(true);
    setErr("");
  };

  const sectionTitle = (title, color) => (
    <div style={{fontSize:11, fontWeight:800, color, textTransform:"uppercase", letterSpacing:".08em", marginBottom:6, marginTop:8, borderBottom:`1px solid ${C.line}`, paddingBottom:3}}>
      {title}
    </div>
  );

  return (
    <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"12px 14px", marginBottom:12}}>
      <div style={{fontSize:12.5, fontWeight:800, marginBottom:10}}>📊 Importar Fitdays</div>

      <label
        style={{display:"flex", alignItems:"center", justifyContent:"center", gap:6, width:"100%", height:38, borderRadius:10, border:`1px solid ${C.cyan}`, background:`${C.cyan}18`, color:C.cyan, fontSize:12.5, fontWeight:800, cursor:"pointer", marginBottom:8, boxSizing:"border-box"}}
      >
        📷 {previews.length > 0 ? `Agregar más fotos (+${previews.length} ya cargada${previews.length !== 1 ? 's' : ''})` : "Cargar capturas (múltiples)"}
        <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={onFiles}/>
      </label>

      {previews.length > 0 && (
        <div style={{marginBottom:10}}>
          {/* Preview row of thumbnails */}
          <div style={{display:"flex", gap:8, marginBottom:10, overflowX:"auto", paddingBottom:4}}>
            {previews.map((prev, idx) => (
              <div key={idx} style={{position:"relative", flexShrink:0}}>
                <img src={prev} alt={`preview-${idx}`} style={{width:75, height:75, objectFit:"cover", borderRadius:8, border:`1px solid ${C.line}`}}/>
                <div style={{position:"absolute", top:2, right:2, background:C.panel, border:`1px solid ${C.line}`, borderRadius:4, fontSize:10, fontWeight:700, color:C.muted, padding:"2px 6px"}}>{idx + 1}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex", gap:10}}>
            <button
              onClick={doExtract}
              disabled={busy}
              style={{flex:1, height:38, borderRadius:10, border:"none",
                background: busy ? C.panel2 : `linear-gradient(135deg,${C.cyan},${C.lime})`,
                color: busy ? C.muted : "#0c0e0b",
                fontSize:12.5, fontWeight:800, cursor: busy ? "default" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6
              }}
            >
              {busy
                ? <><span style={{display:"inline-block", animation:"spin 1s linear infinite", marginRight:4}}>⟳</span> Extrayendo…</>
                : `✦ Extraer datos con IA (${previews.length} imagen${previews.length !== 1 ? 's' : ''})`}
            </button>
            <button
              onClick={() => { setPreviews([]); setImagesData([]); setForm({}); setExtracted(null); }}
              style={{flex:"0 0 auto", height:38, borderRadius:10, border:`1px solid ${C.line}`, background:C.panel2, color:C.muted, fontSize:12, fontWeight:700, cursor:"pointer", padding:"0 12px"}}
            >
              ✕ Limpiar
            </button>
          </div>
          {err && <div style={{color:C.rose, fontSize:11, marginTop:5}}>{err}</div>}
        </div>
      )}

      {extracted && (
        <div>
          <div style={{fontSize:11, color:C.lime, fontWeight:700, marginBottom:8}}>✓ Datos extraídos — revisa y edita si necesitas:</div>

          {/* Date picker */}
          <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:10}}>
            <span style={{fontSize:11.5, color:C.muted, flex:"0 0 140px"}}>Fecha:</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"5px 8px", color:C.ink, fontSize:12, outline:"none"}}
            />
          </div>

          {sectionTitle("Básico", C.cyan)}
          {fieldInput("peso", "Peso total", "kg")}
          {fieldInput("imc", "IMC", "kg/m²")}
          {fieldInput("puntuacion", "Puntuación", "/100")}
          {fieldInput("pesoObjetivo", "Peso objetivo", "kg")}
          {fieldInputText("tipoCuerpo", "Tipo de cuerpo")}

          {sectionTitle("Grasa", C.amber)}
          {fieldInput("grasaPct", "% Grasa corporal", "%")}
          {fieldInput("masaGrasa", "Masa grasa total", "kg")}
          {fieldInput("grasaSubc", "Grasa subcutánea", "%")}
          {fieldInput("visceral", "Grasa visceral grado", "")}

          {sectionTitle("Músculo & LBM", C.lime)}
          {fieldInput("masaMuscular", "Masa muscular total", "kg")}
          {fieldInput("smmKg", "Músculo esquelético", "kg")}
          {fieldInput("musculoEsq", "Músculo esquelético", "%")}
          {fieldInput("masaOsea", "Masa ósea (huesos)", "kg")}
          {fieldInput("pesoSinGrasa", "Peso sin grasa (LBM)", "kg")}
          {fieldInput("smi", "SMI", "kg/m²")}

          {sectionTitle("Agua, Proteína & Metab.", C.muted)}
          {fieldInput("aguaKg", "Agua corporal", "kg")}
          {fieldInput("pctAgua", "% Agua", "%")}
          {fieldInput("proteinaKg", "Proteína", "kg")}
          {fieldInput("pctProteina", "% Proteína", "%")}
          {fieldInput("bmr", "BMR", "kcal")}
          {fieldInput("edadCorporal", "Edad corporal", "años")}
          {fieldInput("zinE", "zINE", "")}
          {fieldInput("whr", "WHR", "")}

          {/* Segmental grasa collapsible */}
          <div
            style={{fontSize:11, fontWeight:800, color:C.amber, textTransform:"uppercase", letterSpacing:".08em", marginBottom: segGrasaOpen ? 6 : 0, marginTop:8, borderBottom:`1px solid ${C.line}`, paddingBottom:3, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center"}}
            onClick={() => setSegGrasaOpen(o => !o)}
          >
            <span>Segmental Grasa</span>
            <span style={{fontSize:14}}>{segGrasaOpen ? "▲" : "▼"}</span>
          </div>
          {segGrasaOpen && (
            <div>
              {fieldInput("grasaTronco", "Tronco", "kg")}
              {fieldInput("grasaBrazoDer", "Brazo Der.", "kg")}
              {fieldInput("grasaBrazoIzq", "Brazo Izq.", "kg")}
              {fieldInput("grasaPiernaDer", "Pierna Der.", "kg")}
              {fieldInput("grasaPiernaIzq", "Pierna Izq.", "kg")}
            </div>
          )}

          {/* Segmental músculo collapsible */}
          <div
            style={{fontSize:11, fontWeight:800, color:C.lime, textTransform:"uppercase", letterSpacing:".08em", marginBottom: segMusculoOpen ? 6 : 0, marginTop:8, borderBottom:`1px solid ${C.line}`, paddingBottom:3, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center"}}
            onClick={() => setSegMusculoOpen(o => !o)}
          >
            <span>Segmental Músculo</span>
            <span style={{fontSize:14}}>{segMusculoOpen ? "▲" : "▼"}</span>
          </div>
          {segMusculoOpen && (
            <div>
              {fieldInput("musculoTronco", "Tronco", "kg")}
              {fieldInput("musculoBrazoDer", "Brazo Der.", "kg")}
              {fieldInput("musculoBrazoIzq", "Brazo Izq.", "kg")}
              {fieldInput("musculoPiernaDer", "Pierna Der.", "kg")}
              {fieldInput("musculoPiernaIzq", "Pierna Izq.", "kg")}
            </div>
          )}

          <button
            onClick={doSave}
            style={{width:"100%", height:42, borderRadius:11, border:"none", marginTop:12,
              background:`linear-gradient(135deg,${C.lime},${C.cyan})`,
              color:"#0c0e0b", fontSize:13, fontWeight:800, cursor:"pointer"
            }}
          >
            💾 Guardar medición
          </button>
          {saved && <div style={{color:C.lime, fontSize:12, fontWeight:700, textAlign:"center", marginTop:6}}>✓ Medición guardada correctamente</div>}
          {err && <div style={{color:C.rose, fontSize:11, marginTop:5}}>{err}</div>}
          {saved && !fitAnalysis && (
            <button
              onClick={async () => {
                setFitAnalysisBusy(true);
                try {
                  const allDates = Object.keys(metricslog||{}).sort();
                  const prevDate = allDates.filter(d => d < date).pop();
                  const prev = prevDate ? metricslog[prevDate] : null;
                  const curr = metricslog[date] || {};

                  // Historial completo (últimos 6 scans) para ver tendencia
                  const histDates = allDates.filter(d => d <= date).slice(-6);
                  const histStr = histDates.map(d => {
                    const m = metricslog[d] || {};
                    const smm = m.smmKg || m.masaMuscular || m.musculo;
                    return `${d}: ${m.weight||"?"}kg, Grasa ${m.grasaPct||"?"}%, SMM ${smm||"?"}kg, Visceral ${m.visceral||"?"}, Score ${m.puntuacion||"?"}`;
                  }).join("\n");

                  const compFn = (m) => {
                    const smm = m.smmKg || m.masaMuscular || m.musculo;
                    return `Peso: ${m.weight||"?"}kg | Grasa: ${m.grasaPct||"?"}% | SMM: ${smm||"?"}kg | LBM: ${m.pesoSinGrasa||"?"}kg | SMI: ${m.smi||"?"} | Visceral grado: ${m.visceral||"?"} | Score: ${m.puntuacion||"?"}/100 | Tipo: ${m.tipoCuerpo||"?"} | Objetivo: ${m.pesoObjetivo||"?"}kg | BMR: ${m.bmr||"?"}kcal | EdadCorp: ${m.edadCorporal||"?"}`;
                  };
                  const currStr = compFn(curr);
                  const prevStr = prev ? compFn(prev) : "Sin scan anterior";

                  const segCurr = [curr.musculoBrazoDer, curr.musculoBrazoIzq, curr.musculoPiernaDer, curr.musculoPiernaIzq].some(v => v);
                  const segStr = segCurr ?
                    `Segmental MÚSCULO: Tronco ${curr.musculoTronco||"?"}kg, BrazoDer ${curr.musculoBrazoDer||"?"}kg, BrazoIzq ${curr.musculoBrazoIzq||"?"}kg, PiernaDer ${curr.musculoPiernaDer||"?"}kg, PiernaIzq ${curr.musculoPiernaIzq||"?"}kg\nSegmental GRASA: Tronco ${curr.grasaTronco||"?"}kg, BrazoDer ${curr.grasaBrazoDer||"?"}kg, BrazoIzq ${curr.grasaBrazoIzq||"?"}kg, PiernaDer ${curr.grasaPiernaDer||"?"}kg, PiernaIzq ${curr.grasaPiernaIzq||"?"}kg` : "";

                  const sys = `Eres el coach de composición corporal de Bruno Hazleby. Tienes acceso a todos sus scans Fitdays históricos.
Analiza la evolución y da retroalimentación concreta. Formato: párrafos cortos + bullets con •, negrita para datos clave. Sin encabezados markdown (#). Máx 250 palabras.`;
                  const msg = `SCAN ACTUAL (${date}):\n${currStr}\n\nSCAN ANTERIOR (${prevDate||"ninguno"}):\n${prevStr}\n\n${segStr ? "SEGMENTAL ACTUAL:\n" + segStr + "\n\n" : ""}HISTORIAL ÚLTIMOS SCANS:\n${histStr}\n\nAnaliza:\n1) Cambios desde el scan anterior (avance o retroceso en cada métrica)\n2) Tendencia general del historial\n3) Puntos positivos + señales de alerta\n4) Una acción específica para las próximas 2 semanas\n5) Si el objetivo de ${curr.pesoObjetivo||"?"}kg es realista y en qué plazo`;

                  const out = await callGemini([{role:"user", content:msg}], sys);
                  setFitAnalysis(out);
                  // Guardar análisis en metricslog para que el Coach lo use como memoria global
                  if (out && !out.startsWith("Error")) {
                    const updEntry = { ...(metricslog[date]||{}), fitdaysAIAnalysis: out.slice(0, 500) };
                    const updMetrics = { ...metricslog, [date]: updEntry };
                    saveKey("metricslog", updMetrics);
                    setMetricslog(updMetrics);
                  }
                } catch(e) {
                  setFitAnalysis("Error: " + (e.message||e));
                }
                setFitAnalysisBusy(false);
              }}
              disabled={fitAnalysisBusy}
              style={{width:"100%", height:40, borderRadius:10, border:`1px solid ${C.cyan}`, background:`${C.cyan}12`, color:fitAnalysisBusy?C.muted:C.cyan, fontSize:12.5, fontWeight:800, cursor:fitAnalysisBusy?"default":"pointer", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:6}}
            >
              {fitAnalysisBusy ? <><span style={{animation:"spin 1s linear infinite", display:"inline-block"}}>⟳</span> Analizando…</> : "✦ Analizar composición con IA"}
            </button>
          )}
          {fitAnalysis && (
            <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10, marginTop:8, fontSize:12, color:C.ink, lineHeight:1.6, whiteSpace:"pre-wrap"}}>
              {fitAnalysis}
              <button onClick={() => setFitAnalysis("")} style={{display:"block", width:"100%", marginTop:8, background:"none", border:`1px solid ${C.line}`, borderRadius:6, color:C.muted, fontSize:11, padding:"4px", cursor:"pointer"}}>Cerrar análisis</button>
            </div>
          )}
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
  projections, tdeeEstimate, analyzeAndReconfigure, experiments, setExperiments,
  dietGuidelines, setDietGuidelines, trainingGuidelines, setTrainingGuidelines, onSaveGuidelines,
  sendCoachMessage, setView
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
      .sort((a, b) => b.date < a.date ? -1 : (b.date > a.date ? 1 : 0));
    
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
  const [cmpOpen, setCmpOpen] = useState(false);
  const [cmpDateA, setCmpDateA] = useState("");
  const [cmpDateB, setCmpDateB] = useState("");
  const [cmpPhotoAnalysis, setCmpPhotoAnalysis] = useState("");
  const [cmpPhotoBusy, setCmpPhotoBusy] = useState(false);
  const [progressPhotoAnalysis, setProgressPhotoAnalysis] = useState(() => metricslog[new Date().toISOString().slice(0,10)]?.photoAnalysis || "");
  const [progressPhotoBusy, setProgressPhotoBusy] = useState(false);
  const [progressPhotoErr, setProgressPhotoErr] = useState("");
  const [progressPhotoLoading, setProgressPhotoLoading] = useState(false);
  const [photosUnlocked, setPhotosUnlocked] = useState(false);
  const [photoPinInput, setPhotoPinInput] = useState("");
  const [photoPinError, setPhotoPinError] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);

  // Cargar análisis guardado cuando cambia la fecha seleccionada
  useEffect(() => {
    setProgressPhotoAnalysis(metricslog[selectedDateStr]?.photoAnalysis || "");
  }, [selectedDateStr]);

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

    const allDates = Object.keys(metricslog).sort().reverse();
    if (!cmpDateA && allDates.length >= 2) setCmpDateA(allDates[1]);
    if (!cmpDateB && allDates.length >= 1) setCmpDateB(allDates[0]);
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
    const isPdf = file.type === "application/pdf";
    if (isPdf) setErrComp("📄 PDF detectado — esto puede tardar 20-40 s. Para ir más rápido, usa una captura de pantalla.");
    try{
      let b64, media;
      if (isPdf) {
        // PDFs: enviar tal cual (no podemos renderizar sin PDF.js)
        b64 = await fileToBase64(file);
        media = "application/pdf";
      } else {
        // Imágenes: comprimir a 700px máx, calidad 0.82 → reduce payload 5-10x
        b64 = stripDataUrl(await compressImageToDataUrl(file, 700, 0.82));
        media = "image/jpeg";
      }
      if (!isPdf) setErrComp(""); // limpiar aviso PDF si era imagen
      
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
      saveKey("metricslog", newMetricslog);

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
    saveKey("metricslog", newMetricslog);

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
    saveKey("metricslog", newMetricslog);

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
    saveKey("metricslog", newMetricslog);

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

    // Historial de composición corporal (últimas mediciones)
    const compHistory = Object.entries(metricslog || {})
      .filter(([, m]) => m && (m.musculo || m.grasaPct))
      .sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0))
      .slice(-6)
      .map(([d, m]) => `${d}: ${m.musculo ? m.musculo + 'kg músculo' : ''} ${m.grasaPct ? m.grasaPct + '% grasa' : ''}`.trim())
      .join(" → ");

    // Historial de perímetros (últimas 3 mediciones)
    const perimHistory = Object.entries(metricslog || {})
      .filter(([, m]) => m && (m.brazoDer || m.cintura || m.pecho))
      .sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0))
      .slice(-3)
      .map(([d, m]) => `${d}: brazo ${m.brazoDer || '?'}cm, cintura ${m.cintura || '?'}cm, pecho ${m.pecho || '?'}cm`)
      .join(" | ");

    // Top PRs de entrenamiento
    const prs = {};
    Object.entries(exlog || {}).forEach(([name, sets]) => {
      (sets || []).forEach(s => {
        if (s && s.w && s.type !== "warmup") {
          if (!prs[name] || s.w > prs[name]) prs[name] = s.w;
        }
      });
    });
    const prText = Object.entries(prs).slice(0, 8).map(([n, w]) => `${n}: ${w}kg`).join(", ") || "Sin datos";

    // Días entrenados últimas 4 semanas
    const recentWorkoutDays = new Set();
    Object.values(exlog || {}).forEach(sets => {
      (sets || []).forEach(s => {
        if (s && s.date) {
          const d = new Date(s.date);
          const daysAgo = (Date.now() - d.getTime()) / 86400000;
          if (daysAgo <= 28) recentWorkoutDays.add(s.date.slice(0, 10));
        }
      });
    });

    try{
      const sys = `Eres el coach personal de Bruno. ${getProfileStr(metricsToUse.weight, metricsToUse.musculo, metricsToUse.grasaPct, metricsToUse.visceral)}
Objetivo principal: reducción de grasa corporal manteniendo masa muscular. Dieta hiperproteica.
Responde en español con análisis específico y 3-5 sugerencias concretas y accionables basadas en los datos reales. Formato: 1 párrafo de análisis + lista de sugerencias numeradas.`;
      const userMsg = `DATOS DE BRUNO para análisis completo:

📊 HISTORIAL DE PESO (cronológico): ${series}

💪 COMPOSICIÓN CORPORAL (historial): ${compHistory || "Sin datos previos"}
Actual → Músculo: ${metricsToUse.musculo}kg | Grasa: ${metricsToUse.grasaPct}% | Visceral: Grado ${metricsToUse.visceral}

📏 PERÍMETROS CORPORALES: ${perimHistory || "Sin datos"}

🍽️ NUTRICIÓN: ${nutAvgText}

🏋️ ENTRENAMIENTO: ${recentWorkoutDays.size} días entrenados en últimas 4 semanas
PRs actuales: ${prText}

Analiza la tendencia de peso y composición corporal, identifica si está progresando hacia su objetivo de definición, y da sugerencias ESPECÍFICAS de calorías, macros y frecuencia de entrenamiento basadas en estos datos reales.`;
      const out = await callGemini([{role:"user", content:userMsg}], sys);
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
                <span>{busyComp ? "Analizando… (20-40 s si es PDF)" : "Escanear foto / captura / PDF"}</span>
              </button>
              <input ref={fileCompRef} type="file" accept="image/*,application/pdf" onChange={onPhotoComp} style={{display:"none"}}/>
            </div>
            {errComp && <div style={{color: errComp.startsWith("📄") ? C.amber : C.rose, fontSize:12, marginTop:6}}>{errComp}</div>}
          </div>
        )}

        <button onClick={() => { if(type === "peso") savePeso(); else if(type === "composicion") saveComposicion(); }} style={{width:"100%", marginTop:8, padding:"10px", borderRadius:10, border:"none", cursor:"pointer", background:C.lime, color:"#0c0e0b", fontWeight:800, fontSize:14}}>
          {buttonLabels[type] || "Guardar"}
        </button>
      </div>

      {/* ── Directrices personalizadas ── */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:14, marginBottom:12}}>
        <div style={{fontSize:12, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:".08em", marginBottom:10}}>Directrices personalizadas</div>
        <div style={{marginBottom:8}}>
          <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>🥗 Dieta — mis reglas</label>
          <textarea
            value={dietGuidelines||""}
            onChange={e => setDietGuidelines && setDietGuidelines(e.target.value)}
            onBlur={e => onSaveGuidelines && onSaveGuidelines("diet", e.target.value)}
            placeholder="Ej: sin gluten, carbos solo post-entreno, no comer antes de las 9am..."
            rows={2}
            style={{width:"100%", resize:"none", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px 10px", color:C.ink, fontSize:12.5, outline:"none"}}
          />
        </div>
        <div>
          <label style={{fontSize:11, color:C.muted, fontWeight:700, display:"block", marginBottom:4}}>🏋️ Entreno — mis reglas</label>
          <textarea
            value={trainingGuidelines||""}
            onChange={e => setTrainingGuidelines && setTrainingGuidelines(e.target.value)}
            onBlur={e => onSaveGuidelines && onSaveGuidelines("training", e.target.value)}
            placeholder="Ej: no entreno lunes, evitar press militar por hombro, descanso mínimo 2 días entre piernas..."
            rows={2}
            style={{width:"100%", resize:"none", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px 10px", color:C.ink, fontSize:12.5, outline:"none"}}
          />
        </div>
        <div style={{fontSize:10, color:C.muted, marginTop:6}}>💡 El Coach usará estas reglas en todas sus respuestas</div>
      </div>

      {/* ===== INFORME DE COMPOSICIÓN CORPORAL ===== */}
      {(() => {
        const H = 1.80, AGE = 34;
        const W = lastW || 93.9;
        const M = activeMetrics.musculo || 64.7;
        const G = activeMetrics.grasaPct || 26.2;
        const V = activeMetrics.visceral || 9;

        const fatKg   = W * G / 100;
        const leanKg  = W - fatKg;
        const bmi     = W / (H * H);
        const bmr     = Math.round(10 * W + 6.25 * 180 - 5 * AGE + 5);
        const skelM   = M * 0.615; // músculo esquelético ≈ 61.5% del total
        const smi     = skelM / (H * H);
        const waterEst  = leanKg * 0.73;
        const boneEst   = leanKg * 0.068;
        const subcutFat = fatKg * 0.82;

        // Porcentajes barra segmentada
        const pMusc = Math.round(M / W * 100);
        const pAgua = Math.round(waterEst / W * 100);
        const pGras = Math.round(fatKg / W * 100);
        const pHues = Math.max(0, 100 - pMusc - pAgua - pGras);

        // Puntuación corporal (25 pts cada dimensión)
        const sBmi  = bmi>=18.5&&bmi<25?25:bmi<27?17:bmi<30?10:5;
        const sFat  = G<=13?25:G<=17?21:G<=20?17:G<=25?11:G<=30?6:2;
        const sVisc = V<=4?25:V<=6?20:V<=9?13:V<=11?7:3;
        const sMusc = smi>=12?25:smi>=10?21:smi>=8?16:smi>=6?10:6;
        const score = sBmi + sFat + sVisc + sMusc;
        const scoreCol = score>=75?C.lime:score>=55?C.amber:C.rose;
        const scoreLabel = score>=80?"Composición excelente":score>=65?"Progreso sólido":score>=50?"En proceso de mejora":"Prioriza hábitos";

        // Clasificaciones
        const bmiLabel  = bmi<18.5?["Bajo peso",C.cyan]:bmi<25?["Normal",C.lime]:bmi<30?["Sobrepeso",C.amber]:["Obesidad",C.rose];
        const fatLabel  = G<6?["Muy bajo",C.cyan]:G<14?["Atlético",C.lime]:G<18?["Fitness",C.lime]:G<25?["Aceptable",C.amber]:["Alto",C.rose];
        const viscLabel = V<=4?["Saludable",C.lime]:V<=9?["Moderado",C.amber]:["Alerta",C.rose];

        // Tipo de cuerpo (2 señales: grasa % y relación músculo/peso)
        const mRatio = M / W;
        const bodyTypeInfo = (() => {
          if (G > 28) return ["Obeso", C.rose];
          if (G > 22 && mRatio < 0.65) return ["Sobrepeso", C.amber];
          if (G < 13 && mRatio < 0.63) return ["Delgado", C.cyan];
          if (G > 20 && mRatio < 0.63) return ["Delgado-Gordo", C.amber];
          if (G < 15 && smi >= 11) return ["Atlético", C.lime];
          if (mRatio >= 0.68 && G < 20) return ["Musculoso", C.lime];
          return ["Estándar", C.muted];
        })();

        // Control de peso
        const targetFatPct = 15;
        const fatToLose = Math.max(0, fatKg - W * targetFatPct / 100);
        const muscToGain = Math.max(0, 70 - M);
        const optWMin = (18.5 * H * H).toFixed(1);
        const optWMax = (24.9 * H * H).toFixed(1);

        // Edad corporal estimada (corrección vs edad real)
        const bodyAge = Math.max(18, Math.round(AGE + (bmi - 22) * 1.1 + (G - 15) * 0.7 + (V - 4) * 1.3 - (smi - 9) * 1.8));

        const chip = (label, col) => (
          <span style={{fontSize:10, fontWeight:700, color:col, background:`${col}1a`, border:`1px solid ${col}40`, borderRadius:20, padding:"2px 9px"}}>{label}</span>
        );

        const miniCard = (label, val, hint, col=C.ink) => (
          <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"10px 12px"}}>
            <div style={{fontSize:9, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".05em", marginBottom:3}}>{label}</div>
            <div style={{fontFamily:"var(--font-display)", fontSize:21, color:col, lineHeight:1}}>{val}</div>
            {hint && <div style={{fontSize:9, color:C.muted, marginTop:2}}>{hint}</div>}
          </div>
        );

        return (
          <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:12}}>

            {/* === BLOQUE 1: Puntuación === */}
            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
                <div style={{display:"flex", alignItems:"center", gap:7}}>
                  <Activity size={14} color={C.lime}/>
                  <span style={{fontSize:11, fontWeight:800, color:C.ink, textTransform:"uppercase", letterSpacing:".06em"}}>Informe de Composición Corporal</span>
                </div>
                <span style={{fontSize:10, color:C.muted}}>Bruno · 34a · 180cm</span>
              </div>

              <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
                {/* Score big number */}
                <div style={{textAlign:"center", flexShrink:0}}>
                  <div style={{fontFamily:"var(--font-display)", fontSize:60, lineHeight:1, color:scoreCol}}>{score}</div>
                  <div style={{fontSize:10, color:C.muted, fontWeight:700}}>/ 100 pts</div>
                  <div style={{fontSize:10, color:scoreCol, fontWeight:700, marginTop:4}}>{scoreLabel}</div>
                </div>
                {/* Sub-scores */}
                <div style={{flex:1, display:"flex", flexDirection:"column", gap:5, paddingTop:4}}>
                  {[["IMC", sBmi, bmiLabel[1]],["Grasa", sFat, fatLabel[1]],["Visceral", sVisc, viscLabel[1]],["Músculo", sMusc, smi>=10?C.lime:smi>=8?C.amber:C.rose]].map(([lbl,s,col]) => (
                    <div key={lbl} style={{display:"flex", alignItems:"center", gap:6}}>
                      <span style={{width:46, fontSize:10, color:C.muted, textAlign:"right"}}>{lbl}</span>
                      <div style={{flex:1, height:4, background:C.line, borderRadius:99, overflow:"hidden"}}>
                        <div style={{height:"100%", width:`${(s/25)*100}%`, background:col, borderRadius:99}}/>
                      </div>
                      <span style={{width:22, fontSize:10, color:col, fontWeight:800, textAlign:"right"}}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* === BLOQUE 2: Composición principal === */}
            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px"}}>
              <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:10}}>Análisis de Composición (kg)</div>

              <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:12}}>
                {[["PESO",W.toFixed(1),"kg",C.ink],["MAGRA",leanKg.toFixed(1),"kg",C.cyan],["GRASA",fatKg.toFixed(1),"kg",G>25?C.rose:C.amber],["MÚSCULO",M.toFixed(1),"kg",C.lime]].map(([lbl,v,u,col]) => (
                  <div key={lbl} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"8px 6px", textAlign:"center"}}>
                    <div style={{fontSize:8.5, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".05em", marginBottom:3}}>{lbl}</div>
                    <div style={{fontFamily:"var(--font-display)", fontSize:20, color:col, lineHeight:1}}>{v}</div>
                    <div style={{fontSize:9, color:C.muted, marginTop:1}}>{u}</div>
                  </div>
                ))}
              </div>

              {/* Barra segmentada */}
              <div style={{height:8, borderRadius:6, overflow:"hidden", display:"flex"}}>
                <div style={{width:`${pMusc}%`, background:C.lime}} title="Músculo"/>
                <div style={{width:`${pAgua}%`, background:C.cyan, opacity:.7}} title="Agua"/>
                <div style={{width:`${pGras}%`, background:G>25?C.rose:C.amber}} title="Grasa"/>
                <div style={{width:`${pHues}%`, background:C.line}} title="Hueso"/>
              </div>
              <div style={{display:"flex", gap:8, fontSize:9, color:C.muted, marginTop:5, flexWrap:"wrap"}}>
                <span><span style={{color:C.lime}}>■</span> Músculo {pMusc}%</span>
                <span><span style={{color:C.cyan}}>■</span> Agua {pAgua}%</span>
                <span><span style={{color:G>25?C.rose:C.amber}}>■</span> Grasa {pGras}%</span>
                <span><span style={{color:C.muted}}>■</span> Hueso ~{pHues}%</span>
              </div>
            </div>

            {/* === BLOQUE 3: Tabla análisis general === */}
            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px"}}>
              <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:10}}>Análisis General</div>
              <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, overflow:"hidden"}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 55px 88px 55px 64px", padding:"6px 10px", borderBottom:`1px solid ${C.line}`, fontSize:9, fontWeight:700, color:C.muted, textTransform:"uppercase"}}>
                  <span>Métrica</span><span style={{textAlign:"center"}}>Bajo</span><span style={{textAlign:"center"}}>Óptimo</span><span style={{textAlign:"center"}}>Alto</span><span style={{textAlign:"center"}}>Tu valor</span>
                </div>
                {[
                  {lbl:"Masa muscular",  v:`${M.toFixed(1)} kg`, lo:"<50 kg", op:"55–70 kg",  hi:">75 kg",  col:M>=55&&M<=70?C.lime:M>=50?C.amber:C.rose},
                  {lbl:"Grasa corporal", v:`${G.toFixed(1)} %`,  lo:"<6 %",   op:"10–20 %",   hi:">25 %",  col:G>=10&&G<=20?C.lime:G<25?C.amber:C.rose},
                  {lbl:"IMC",            v:bmi.toFixed(1),        lo:"<18.5",  op:"18.5–24.9", hi:">25",    col:bmiLabel[1]},
                  {lbl:"Grasa visceral", v:`G${V}`,               lo:"—",      op:"< 5",        hi:">10",   col:viscLabel[1]},
                ].map((row, i, arr) => (
                  <div key={row.lbl} style={{display:"grid", gridTemplateColumns:"1fr 55px 88px 55px 64px", padding:"7px 10px", borderBottom:i<arr.length-1?`1px solid ${C.line}`:"none", fontSize:11}}>
                    <span style={{fontWeight:700, color:C.ink}}>{row.lbl}</span>
                    <span style={{textAlign:"center", color:C.muted}}>{row.lo}</span>
                    <span style={{textAlign:"center", color:C.lime, fontWeight:700}}>{row.op}</span>
                    <span style={{textAlign:"center", color:C.muted}}>{row.hi}</span>
                    <span style={{textAlign:"center", color:row.col, fontWeight:800}}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* === BLOQUE 4: Indicadores derivados === */}
            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px"}}>
              <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:10}}>Otros Indicadores</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6}}>
                {miniCard("TMB", `${bmr}`, "kcal/día · basal", C.cyan)}
                {miniCard("Masa magra", `${leanKg.toFixed(1)} kg`, "Peso sin grasa")}
                {miniCard("G. subcutánea", `${subcutFat.toFixed(1)} kg`, "~82% grasa total", G>25?C.rose:C.amber)}
                {miniCard("Agua estimada", `${waterEst.toFixed(1)} kg`, "73% masa magra", C.cyan)}
                {miniCard("SMI", smi.toFixed(1), "Musc. esq. / talla²", smi>=10?C.lime:smi>=8?C.amber:C.rose)}
                {miniCard("Edad corporal", `${bodyAge} a`, `Real: 34 a · Δ ${bodyAge-34>0?"+"+(bodyAge-34):bodyAge-34}`, bodyAge<=AGE?C.lime:bodyAge<=AGE+5?C.amber:C.rose)}
              </div>
            </div>

            {/* === BLOQUE 5: Control de peso + Tipo de cuerpo === */}
            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px"}}>
              <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:10}}>Control de Peso</div>
              <div style={{background:`rgba(205,255,74,0.05)`, border:`1px solid rgba(205,255,74,0.18)`, borderRadius:10, padding:"12px 14px", marginBottom:12}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                  {[
                    ["Peso recomendado", `${GOAL_W}–82 kg`],
                    ["Grasa a perder", `−${fatToLose.toFixed(1)} kg`],
                    ["Músculo a ganar", `+${muscToGain.toFixed(1)} kg`],
                    ["Rango IMC óptimo", `${optWMin}–${optWMax} kg`],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div style={{fontSize:10, color:C.muted, fontWeight:600, marginBottom:2}}>{k}</div>
                      <div style={{fontSize:15, fontWeight:800, color:C.lime}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8}}>Tipo de Cuerpo</div>
              <div style={{display:"flex", gap:6, flexWrap:"wrap", alignItems:"center"}}>
                {chip(bodyTypeInfo[0], bodyTypeInfo[1])}
                {chip(bmiLabel[0], bmiLabel[1])}
                {chip(`Grasa: ${fatLabel[0]}`, fatLabel[1])}
                {chip(`Visceral: ${viscLabel[0]}`, viscLabel[1])}
              </div>
            </div>

            {/* === BLOQUE 6: Barras objetivo + visceral === */}
            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px"}}>
              <div style={{fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".06em", marginBottom:12}}>Barras de Objetivo</div>
              {renderGoalBar("Peso Corporal", lastW, "kg", 60, 110, 75, 88, C.cyan)}
              {renderGoalBar("Masa Muscular", M, "kg", 45, 85, 55, 70, C.lime)}
              {renderGoalBar("Masa Grasa Corporal", fatKg, "kg", 5, 35, 8, 15, C.amber)}

              <div style={{fontSize:11, color:C.muted, display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14}}>
                <span>Grasa Visceral: <b style={{color:V>=10?C.rose:V>=6?C.amber:C.lime}}>Grado {V}</b></span>
                <span style={{color:viscLabel[1], fontWeight:700}}>{viscLabel[0]}</span>
              </div>
              <div className="visceral-indicator">
                {Array.from({length:12}).map((_,i) => (
                  <div key={i} className="visceral-dot" style={{backgroundColor: i<V?(V>=10?C.rose:V>=6?C.amber:C.lime):C.line}}/>
                ))}
              </div>
            </div>

          </div>
        );
      })()}

      {/* Gráfico Histórico de Masa Magra vs Masa Grasa */}
      <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
        <div style={{fontSize:12.5, fontWeight:800, marginBottom:2}}>Evolución: Masa Magra vs Masa Grasa</div>
        {renderBodyCompChart(bodyCompHistory)}
      </div>

      {/* Radar chart de medidas corporales */}
      {(() => {
        const entry = metricslog[selectedDateStr] || {};
        const prevDates = Object.keys(metricslog).filter(d => d < selectedDateStr).sort().slice(-1);
        const prevEntry = prevDates.length > 0 ? (metricslog[prevDates[0]] || {}) : null;

        const fields = [
          { label:"Brazo", cur: entry.brazoDer ? (((+entry.brazoDer||0)+(+entry.brazoIzq||0))/2) : null, max:50 },
          { label:"Muslo", cur: entry.musloDer ? (((+entry.musloDer||0)+(+entry.musloIzq||0))/2) : null, max:80 },
          { label:"Pantorrilla", cur: entry.pantorrillaDer ? (((+entry.pantorrillaDer||0)+(+entry.pantorrillaIzq||0))/2) : null, max:50 },
          { label:"Cintura", cur: entry.cintura ? (+entry.cintura||0) : null, max:120, invert:true },
          { label:"Pecho", cur: entry.pecho ? (+entry.pecho||0) : null, max:130 },
          { label:"Peso", cur: entry.weight ? (+entry.weight||0) : null, max:130 },
        ];
        const hasData = fields.some(f => f.cur !== null && f.cur > 0);
        if (!hasData) return null;

        const prevFields = prevEntry ? [
          { cur: prevEntry.brazoDer ? (((+prevEntry.brazoDer||0)+(+prevEntry.brazoIzq||0))/2) : null, max:50 },
          { cur: prevEntry.musloDer ? (((+prevEntry.musloDer||0)+(+prevEntry.musloIzq||0))/2) : null, max:80 },
          { cur: prevEntry.pantorrillaDer ? (((+prevEntry.pantorrillaDer||0)+(+prevEntry.pantorrillaIzq||0))/2) : null, max:50 },
          { cur: prevEntry.cintura ? (+prevEntry.cintura||0) : null, max:120, invert:true },
          { cur: prevEntry.pecho ? (+prevEntry.pecho||0) : null, max:130 },
          { cur: prevEntry.weight ? (+prevEntry.weight||0) : null, max:130 },
        ] : null;

        const N = fields.length;
        const R = 75, cx = 95, cy = 90;
        const angles = fields.map((_, i) => (2 * Math.PI * i / N) - Math.PI / 2);

        const toXY = (r, angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];

        const polygon = (vals, fillColor, opacity) => {
          const pts = vals.map((v, i) => {
            const norm = v !== null ? Math.min(1, Math.max(0, v / (fields[i].max || 1))) : 0;
            const r2 = norm * R;
            return toXY(r2, angles[i]).map(x => x.toFixed(1)).join(",");
          });
          return <polygon points={pts.join(" ")} fill={fillColor} fillOpacity={opacity} stroke={fillColor} strokeWidth="1.5" strokeLinejoin="round"/>;
        };

        const curVals = fields.map(f => f.cur);
        const prevVals = prevFields ? prevFields.map(f => f.cur) : null;

        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
            <div style={{fontSize:12.5, fontWeight:800, marginBottom:8, display:"flex", alignItems:"center", gap:6}}>
              <Activity size={15} color={C.cyan}/> Radar Corporal
              {prevDates.length > 0 && <span style={{fontSize:10, color:C.muted, fontWeight:500}}>vs {prevDates[0]}</span>}
            </div>
            <svg width="100%" viewBox={`0 0 190 180`} style={{display:"block", maxWidth:260, margin:"0 auto"}}>
              {[0.25, 0.5, 0.75, 1].map(scale => (
                <polygon key={scale}
                  points={angles.map(a => toXY(R*scale, a).map(x => x.toFixed(1)).join(",")).join(" ")}
                  fill="none" stroke={C.line} strokeWidth="0.8"/>
              ))}
              {angles.map((a, i) => {
                const [x1, y1] = toXY(0, a);
                const [x2, y2] = toXY(R, a);
                const [lx, ly] = toXY(R + 12, a);
                return (
                  <g key={i}>
                    <line x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke={C.line} strokeWidth="0.8"/>
                    <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fill={C.muted} fontSize="8">{fields[i].label}</text>
                  </g>
                );
              })}
              {prevVals && polygon(prevVals, C.amber, 0.15)}
              {polygon(curVals, C.cyan, 0.25)}
              {curVals.map((v, i) => {
                if (v === null) return null;
                const norm = Math.min(1, Math.max(0, v / (fields[i].max || 1)));
                const [px, py] = toXY(norm * R, angles[i]);
                return <circle key={i} cx={px.toFixed(1)} cy={py.toFixed(1)} r="3" fill={C.cyan} stroke={C.panel} strokeWidth="1.2"/>;
              })}
            </svg>
            <div style={{display:"flex", gap:12, justifyContent:"center", fontSize:10, color:C.muted, marginTop:4}}>
              <span style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:8, height:8, borderRadius:"50%", background:C.cyan}}/> Hoy</span>
              {prevVals && <span style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:8, height:8, borderRadius:"50%", background:C.amber}}/> Anterior</span>}
            </div>
          </div>
        );
      })()}

      {/* Radar chart de medidas corporales */}
      {(() => {
        const entry = metricslog[selectedDateStr] || {};
        const prevDates = Object.keys(metricslog).filter(d => d < selectedDateStr).sort().slice(-1);
        const prevEntry = prevDates.length > 0 ? (metricslog[prevDates[0]] || {}) : null;

        const fields = [
          { label:"Brazo", cur: entry.brazoDer ? (((+entry.brazoDer||0)+(+entry.brazoIzq||0))/2) : null, max:50 },
          { label:"Muslo", cur: entry.musloDer ? (((+entry.musloDer||0)+(+entry.musloIzq||0))/2) : null, max:80 },
          { label:"Pantorrilla", cur: entry.pantorrillaDer ? (((+entry.pantorrillaDer||0)+(+entry.pantorrillaIzq||0))/2) : null, max:50 },
          { label:"Cintura", cur: entry.cintura ? (+entry.cintura||0) : null, max:120, invert:true },
          { label:"Pecho", cur: entry.pecho ? (+entry.pecho||0) : null, max:130 },
          { label:"Peso", cur: entry.weight ? (+entry.weight||0) : null, max:130 },
        ];
        const hasData = fields.some(f => f.cur !== null && f.cur > 0);
        if (!hasData) return null;

        const prevFields = prevEntry ? [
          { cur: prevEntry.brazoDer ? (((+prevEntry.brazoDer||0)+(+prevEntry.brazoIzq||0))/2) : null, max:50 },
          { cur: prevEntry.musloDer ? (((+prevEntry.musloDer||0)+(+prevEntry.musloIzq||0))/2) : null, max:80 },
          { cur: prevEntry.pantorrillaDer ? (((+prevEntry.pantorrillaDer||0)+(+prevEntry.pantorrillaIzq||0))/2) : null, max:50 },
          { cur: prevEntry.cintura ? (+prevEntry.cintura||0) : null, max:120, invert:true },
          { cur: prevEntry.pecho ? (+prevEntry.pecho||0) : null, max:130 },
          { cur: prevEntry.weight ? (+prevEntry.weight||0) : null, max:130 },
        ] : null;

        const N = fields.length;
        const R = 75, cx = 95, cy = 90;
        const angles = fields.map((_, i) => (2 * Math.PI * i / N) - Math.PI / 2);

        const toXY = (r, angle) => [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];

        const polygon = (vals, fillColor, opacity) => {
          const pts = vals.map((v, i) => {
            const norm = v !== null ? Math.min(1, Math.max(0, v / (fields[i].max || 1))) : 0;
            const r2 = norm * R;
            return toXY(r2, angles[i]).map(x => x.toFixed(1)).join(",");
          });
          return <polygon points={pts.join(" ")} fill={fillColor} fillOpacity={opacity} stroke={fillColor} strokeWidth="1.5" strokeLinejoin="round"/>;
        };

        const curVals = fields.map(f => f.cur);
        const prevVals = prevFields ? prevFields.map(f => f.cur) : null;

        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"14px 16px", marginBottom:12}}>
            <div style={{fontSize:12.5, fontWeight:800, marginBottom:8, display:"flex", alignItems:"center", gap:6}}>
              <Activity size={15} color={C.cyan}/> Radar Corporal
              {prevDates.length > 0 && <span style={{fontSize:10, color:C.muted, fontWeight:500}}>vs {prevDates[0]}</span>}
            </div>
            <svg width="100%" viewBox={`0 0 190 180`} style={{display:"block", maxWidth:260, margin:"0 auto"}}>
              {[0.25, 0.5, 0.75, 1].map(scale => (
                <polygon key={scale}
                  points={angles.map(a => toXY(R*scale, a).map(x => x.toFixed(1)).join(",")).join(" ")}
                  fill="none" stroke={C.line} strokeWidth="0.8"/>
              ))}
              {angles.map((a, i) => {
                const [x1, y1] = toXY(0, a);
                const [x2, y2] = toXY(R, a);
                const [lx, ly] = toXY(R + 12, a);
                return (
                  <g key={i}>
                    <line x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke={C.line} strokeWidth="0.8"/>
                    <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fill={C.muted} fontSize="8">{fields[i].label}</text>
                  </g>
                );
              })}
              {prevVals && polygon(prevVals, C.amber, 0.15)}
              {polygon(curVals, C.cyan, 0.25)}
              {curVals.map((v, i) => {
                if (v === null) return null;
                const norm = Math.min(1, Math.max(0, v / (fields[i].max || 1)));
                const [px, py] = toXY(norm * R, angles[i]);
                return <circle key={i} cx={px.toFixed(1)} cy={py.toFixed(1)} r="3" fill={C.cyan} stroke={C.panel} strokeWidth="1.2"/>;
              })}
            </svg>
            <div style={{display:"flex", gap:12, justifyContent:"center", fontSize:10, color:C.muted, marginTop:4}}>
              <span style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:8, height:8, borderRadius:"50%", background:C.cyan}}/> Hoy</span>
              {prevVals && <span style={{display:"flex", alignItems:"center", gap:3}}><span style={{width:8, height:8, borderRadius:"50%", background:C.amber}}/> Anterior</span>}
            </div>
          </div>
        );
      })()}

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

      {/* Comparador de fechas */}
      {Object.keys(metricslog).length >= 2 && (() => {
        const allDates = Object.keys(metricslog).sort().reverse();
        const mA = cmpDateA ? (metricslog[cmpDateA] || {}) : {};
        const mB = cmpDateB ? (metricslog[cmpDateB] || {}) : {};
        const cmpFields = [
          { label:"Peso (kg)", a: mA.weight, b: mB.weight },
          { label:"Músculo (kg)", a: mA.musculo, b: mB.musculo },
          { label:"Grasa (%)", a: mA.grasaPct, b: mB.grasaPct, lowerBetter:true },
          { label:"Brazo D (cm)", a: mA.brazoDer, b: mB.brazoDer },
          { label:"Muslo D (cm)", a: mA.musloDer, b: mB.musloDer },
          { label:"Cintura (cm)", a: mA.cintura, b: mB.cintura, lowerBetter:true },
          { label:"Pecho (cm)", a: mA.pecho, b: mB.pecho },
        ].filter(f => f.a !== undefined || f.b !== undefined);
        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"12px 14px", marginBottom:12}}>
            <button onClick={() => setCmpOpen(v => !v)} style={{background:"none", border:"none", cursor:"pointer", width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:0}}>
              <span style={{fontSize:12.5, fontWeight:800, display:"flex", alignItems:"center", gap:6}}>
                <TrendingUp size={14} color={C.cyan}/> Comparar Fechas
              </span>
              <span style={{color:C.muted, fontSize:12}}>{cmpOpen ? "▲" : "▼"}</span>
            </button>
            {cmpOpen && (
              <div style={{marginTop:10, animation:"pop 0.2s ease"}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10}}>
                  <div>
                    <label style={{fontSize:10, color:C.muted, fontWeight:700, display:"block", marginBottom:3}}>Fecha A (antes)</label>
                    <select value={cmpDateA} onChange={e => setCmpDateA(e.target.value)} style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 8px", color:C.ink, fontSize:12}}>
                      {allDates.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:10, color:C.muted, fontWeight:700, display:"block", marginBottom:3}}>Fecha B (después)</label>
                    <select value={cmpDateB} onChange={e => setCmpDateB(e.target.value)} style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 8px", color:C.ink, fontSize:12}}>
                      {allDates.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                {cmpFields.length > 0 ? cmpFields.map(f => {
                  const vA = parseFloat(f.a);
                  const vB = parseFloat(f.b);
                  const diff = (!isNaN(vA) && !isNaN(vB)) ? (vB - vA) : null;
                  const improved = diff !== null && (f.lowerBetter ? diff < 0 : diff > 0);
                  const deltaColor = diff === null ? C.muted : diff === 0 ? C.muted : improved ? C.lime : C.rose;
                  return (
                    <div key={f.label} style={{display:"grid", gridTemplateColumns:"1fr 60px 60px 64px", gap:4, alignItems:"center", fontSize:12, padding:"5px 0", borderBottom:`1px solid ${C.line}33`}}>
                      <span style={{color:C.muted, fontSize:11}}>{f.label}</span>
                      <span style={{textAlign:"right", color:C.ink}}>{!isNaN(vA) ? vA.toFixed(1) : "—"}</span>
                      <span style={{textAlign:"right", color:C.ink, fontWeight:700}}>{!isNaN(vB) ? vB.toFixed(1) : "—"}</span>
                      <span style={{textAlign:"right", fontWeight:800, color:deltaColor}}>
                        {diff !== null ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)}` : "—"}
                      </span>
                    </div>
                  );
                }) : <div style={{color:C.muted, fontSize:12, textAlign:"center", padding:"8px 0"}}>Sin datos en las fechas seleccionadas</div>}
              </div>
            )}
          </div>
        );
      })()}

      {/* Fitdays Trends + Import */}
      <FitdaysTrends metricslog={metricslog}/>
      <FitdaysImport
        metricslog={metricslog}
        setMetricslog={setMetricslog}
        geminiKey={geminiKey}
      />

      {/* Galería de fotos de progreso */}
      {(() => {
        // Soporte para photos[] (nuevo) y photo string (legacy) → helper de módulo getEntryPhotos
        const getPhotos = getEntryPhotos;
        const datesWithPhotos = Object.keys(metricslog).filter(d => getPhotos(metricslog[d]).length > 0).sort().reverse();
        const todayPhotos = getPhotos(metricslog[selectedDateStr]);

        // Comprime a máx 800px; si falla por cualquier razón devuelve el dataURL crudo
        const compressFile = (file) => new Promise((res) => {
          const r = new FileReader();
          r.onload = () => {
            const rawUrl = r.result;
            if (!rawUrl) { res(null); return; }
            try {
              const img = new Image();
              img.onload = () => {
                try {
                  const maxW = 800;
                  const scale = Math.min(1, maxW / img.width);
                  const canvas = document.createElement("canvas");
                  canvas.width = Math.round(img.width * scale);
                  canvas.height = Math.round(img.height * scale);
                  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                  const compressed = canvas.toDataURL("image/jpeg", 0.82);
                  res(compressed && compressed.length > 100 ? compressed : rawUrl);
                } catch(_) { res(rawUrl); }
              };
              img.onerror = () => res(rawUrl); // fallback al URL crudo si la imagen no carga
              img.src = rawUrl;
            } catch(_) { res(rawUrl); }
          };
          r.onerror = () => res(null); // null = archivo ilegible
          r.readAsDataURL(file);
        });

        const handlePhotoUpload = async (e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          if (!files.length) return;
          setProgressPhotoAnalysis("");
          setProgressPhotoErr("");
          setProgressPhotoLoading(true);
          try {
            const results = await Promise.all(files.map(compressFile));
            const newUrls = results.filter(Boolean); // filtra nulls (archivos fallidos)
            if (!newUrls.length) {
              setProgressPhotoErr("No se pudieron leer las fotos. Intenta con otras imágenes.");
              setProgressPhotoLoading(false);
              return;
            }
            const existing = getPhotos(metricslog[selectedDateStr]);
            const merged = [...existing, ...newUrls].slice(0, 6);
            const updated = { ...(metricslog[selectedDateStr] || {}), photos: merged };
            const newMetricslog = { ...metricslog, [selectedDateStr]: updated };
            setMetricslog(newMetricslog);
            saveKey("metricslog", newMetricslog);
          } catch(ex) {
            setProgressPhotoErr("Error: " + (ex.message || String(ex)));
          }
          setProgressPhotoLoading(false);
        };

        const deletePhoto = (idx) => {
          const updated = { ...(metricslog[selectedDateStr] || {}) };
          const current = getPhotos(metricslog[selectedDateStr]);
          updated.photos = current.filter((_, i) => i !== idx);
          delete updated.photo; // limpia legacy
          const newMetricslog = { ...metricslog, [selectedDateStr]: updated };
          setMetricslog(newMetricslog);
          saveKey("metricslog", newMetricslog);
          setProgressPhotoAnalysis("");
        };

        const analyzeProgressPhotos = async () => {
          if (!todayPhotos.length || progressPhotoBusy) return;
          setProgressPhotoBusy(true);
          setProgressPhotoAnalysis("");
          try {
            const strip = stripDataUrl;
            const mime = mimeFromDataUrl;
            const imagesParts = todayPhotos.map(url => ({
              type: "image",
              source: { type: "base64", media_type: mime(url), data: strip(url) }
            }));
            const prevPhotoDates = datesWithPhotos.filter(d => d < selectedDateStr).slice(0, 1);
            const hasPrev = prevPhotoDates.length > 0;
            const prevPhotos = hasPrev ? getPhotos(metricslog[prevPhotoDates[0]]) : [];
            const prevParts = prevPhotos.slice(0, 2).map(url => ({
              type: "image",
              source: { type: "base64", media_type: mime(url), data: strip(url) }
            }));
            const allParts = [
              ...(hasPrev ? prevParts : []),
              ...imagesParts,
              { type: "text", text: hasPrev
                ? `Imágenes de seguimiento de composición corporal para evaluación profesional. FECHA ANTERIOR (${prevPhotoDates[0]}): primeras ${prevParts.length} imagen(es). FECHA ACTUAL (${selectedDateStr}): últimas ${imagesParts.length} imagen(es). Compara: cambios en % grasa visible, masa muscular, definición y postura entre ambas fechas. Incluye: 1) qué mejoró, 2) qué empeoró o estancó, 3) una acción concreta para las próximas 2 semanas. Máx 200 palabras en español. Sin encabezados.`
                : `Imágenes de seguimiento de composición corporal (${selectedDateStr}, ${imagesParts.length} ángulo(s)). Evaluación profesional: distribución de grasa corporal, desarrollo muscular visible por grupo muscular, simetría y postura. 2 observaciones objetivas + 2 recomendaciones concretas para el entrenamiento. Máx 150 palabras en español. Sin encabezados.`
              }
            ];
            const RELAXED_SAFETY = [
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ];
            const result = await callGemini(
              [{ role:"user", content: allParts }],
              "Eres un especialista en medicina del deporte y evaluación de composición corporal. Analizas imágenes de seguimiento físico con criterio científico y profesional. Tus reportes son técnicos, objetivos y constructivos. Responde siempre en español sin encabezados markdown.",
              null,
              { safetySettings: RELAXED_SAFETY }
            );
            if (!result?.trim()) throw new Error("El modelo no generó respuesta. Intenta con otras fotos o ángulos.");
            // Persistir análisis en metricslog para que el Coach lo use como memoria
            const prevEntry = metricslog[selectedDateStr] || {};
            const updatedEntry = { ...prevEntry, photoAnalysis: result.trim(), photoAnalysisDate: selectedDateStr };
            const updatedMetrics = { ...metricslog, [selectedDateStr]: updatedEntry };
            setMetricslog(updatedMetrics);
            saveKey("metricslog", updatedMetrics);
            setProgressPhotoAnalysis(result.trim());
          } catch(ex) {
            setProgressPhotoAnalysis("⚠️ " + (ex.message || "Error al analizar"));
          }
          setProgressPhotoBusy(false);
        };

        const checkPin = () => {
          if (photoPinInput === "1234") {
            setPhotosUnlocked(true);
            setShowPinInput(false);
            setPhotoPinInput("");
            setPhotoPinError(false);
          } else {
            setPhotoPinError(true);
            setPhotoPinInput("");
          }
        };

        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"12px 14px", marginBottom:12}}>
            <div style={{fontSize:12.5, fontWeight:800, marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <span style={{display:"flex", alignItems:"center", gap:6}}><Camera size={14} color={C.lime}/> Fotos de Progreso</span>
              {photosUnlocked ? (
                <div style={{display:"flex", alignItems:"center", gap:6}}>
                  <label style={{background: progressPhotoLoading ? C.panel2 : C.lime, color: progressPhotoLoading ? C.muted : "#0c0e0b", border:"none", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:800, cursor: progressPhotoLoading ? "default" : "pointer", display:"inline-flex", alignItems:"center", gap:4, pointerEvents: progressPhotoLoading ? "none" : "auto"}}>
                    {progressPhotoLoading ? <><span style={{animation:"spin 1s linear infinite", display:"inline-block"}}>⟳</span> Cargando…</> : "+ Fotos"}
                    <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhotoUpload} disabled={progressPhotoLoading}/>
                  </label>
                  <button onClick={() => { setPhotosUnlocked(false); setShowPinInput(false); setPhotoPinInput(""); setPhotoPinError(false); }} style={{background:"none", border:`1px solid ${C.line}`, borderRadius:8, padding:"4px 8px", fontSize:11, color:C.muted, cursor:"pointer"}}>🔒</button>
                </div>
              ) : (
                <span style={{fontSize:11, color:C.muted}}>🔒</span>
              )}
            </div>

            {!photosUnlocked ? (
              <div style={{textAlign:"center", padding:"16px 0 10px"}}>
                <div style={{fontSize:26, marginBottom:6}}>🔒</div>
                <div style={{fontSize:12, color:C.muted, marginBottom:12}}>Sección protegida con contraseña</div>
                {!showPinInput ? (
                  <button onClick={() => setShowPinInput(true)} style={{background:"transparent", border:`1px solid ${C.lime}`, borderRadius:10, padding:"7px 22px", color:C.lime, fontSize:12.5, fontWeight:800, cursor:"pointer"}}>
                    Ver fotos
                  </button>
                ) : (
                  <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="PIN"
                      value={photoPinInput}
                      onChange={e => { setPhotoPinInput(e.target.value); setPhotoPinError(false); }}
                      onKeyDown={e => { if (e.key === "Enter") checkPin(); }}
                      style={{width:100, textAlign:"center", fontSize:18, letterSpacing:6, borderRadius:8, border:`1px solid ${photoPinError ? "#f43f5e" : C.line}`, background:C.panel2, color:C.ink, padding:"6px 10px", outline:"none"}}
                      autoFocus
                    />
                    {photoPinError && <div style={{fontSize:11, color:"#f43f5e"}}>PIN incorrecto</div>}
                    <div style={{display:"flex", gap:8}}>
                      <button onClick={checkPin} style={{background:C.lime, border:"none", borderRadius:8, padding:"6px 18px", color:"#0c0e0b", fontSize:12, fontWeight:800, cursor:"pointer"}}>Entrar</button>
                      <button onClick={() => { setShowPinInput(false); setPhotoPinInput(""); setPhotoPinError(false); }} style={{background:"none", border:`1px solid ${C.line}`, borderRadius:8, padding:"6px 12px", color:C.muted, fontSize:12, cursor:"pointer"}}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {progressPhotoErr && (
                  <div style={{background:"rgba(244,63,94,0.12)", border:"1px solid rgba(244,63,94,0.4)", borderRadius:8, padding:"7px 10px", marginBottom:8, fontSize:12, color:"#f43f5e"}}>
                    ⚠️ {progressPhotoErr}
                    <button onClick={() => setProgressPhotoErr("")} style={{float:"right", background:"none", border:"none", color:"#f43f5e", cursor:"pointer", fontSize:14, lineHeight:1, padding:0}}>✕</button>
                  </div>
                )}

                {todayPhotos.length > 0 ? (
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:10, color:C.lime, fontWeight:700, marginBottom:6}}>{selectedDateStr} — {todayPhotos.length} foto{todayPhotos.length !== 1 ? "s" : ""}</div>
                    <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:4}}>
                      {todayPhotos.map((url, idx) => (
                        <div key={idx} style={{position:"relative", flexShrink:0}}>
                          <img src={url} alt={`foto-${idx}`} style={{height:100, width:75, objectFit:"cover", borderRadius:8, border:`1px solid ${C.line}`, display:"block"}}/>
                          <button onClick={() => deletePhoto(idx)} style={{position:"absolute", top:2, right:2, background:"rgba(0,0,0,0.6)", border:"none", borderRadius:"50%", width:18, height:18, color:"#fff", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0}}>✕</button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={analyzeProgressPhotos}
                      disabled={progressPhotoBusy}
                      style={{width:"100%", marginTop:8, height:36, borderRadius:10, border:"none",
                        background: progressPhotoBusy ? C.panel2 : `linear-gradient(135deg,${C.lime},${C.cyan})`,
                        color: progressPhotoBusy ? C.muted : "#0c0e0b",
                        fontSize:12.5, fontWeight:800, cursor: progressPhotoBusy ? "default" : "pointer",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:6
                      }}
                    >
                      {progressPhotoBusy
                        ? <><span style={{animation:"spin 1s linear infinite", display:"inline-block"}}>⟳</span> Analizando…</>
                        : "✦ Analizar con IA"}
                    </button>
                    {progressPhotoAnalysis && (
                      <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10, marginTop:8, fontSize:12, color:C.ink, lineHeight:1.65, whiteSpace:"pre-wrap"}}>
                        {progressPhotoAnalysis}
                        <div style={{display:"flex", gap:6, marginTop:8}}>
                          {sendCoachMessage && setView && (
                            <button
                              onClick={() => {
                                sendCoachMessage(`Acabo de analizar mis fotos de progreso del ${selectedDateStr}. El análisis dice:\n"${progressPhotoAnalysis}"\n\nCon base en este análisis de fotos + todos mis datos de Fitdays, entreno y nutrición: ¿debo ajustar mis objetivos de calorías o macros? Si corresponde, actualízalos con UPDATE_TARGET. ¿Qué debo priorizar en las próximas 2 semanas?`);
                                setView("coach");
                              }}
                              style={{flex:1, background:"rgba(205,255,74,0.08)", border:"1px solid rgba(205,255,74,0.35)", borderRadius:6, color:"#cdff4a", fontSize:11, fontWeight:800, padding:"5px", cursor:"pointer"}}
                            >
                              ✦ Enviar al Coach → Actualizar Objetivos
                            </button>
                          )}
                          <button onClick={() => setProgressPhotoAnalysis("")} style={{flex:1, background:"none", border:`1px solid ${C.line}`, borderRadius:6, color:C.muted, fontSize:11, padding:"5px", cursor:"pointer"}}>Cerrar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{textAlign:"center", color:C.muted, fontSize:12, padding:"12px 0"}}>
                    Sube fotos de hoy para analizar con IA 📸
                  </div>
                )}

                {datesWithPhotos.filter(d => d !== selectedDateStr).length > 0 && (
                  <div>
                    <div style={{fontSize:10, color:C.muted, fontWeight:700, marginBottom:5}}>HISTORIAL</div>
                    <div style={{display:"flex", gap:8, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none"}}>
                      {datesWithPhotos.filter(d => d !== selectedDateStr).slice(0, 8).map(d => (
                        <div key={d} style={{flexShrink:0, textAlign:"center"}}>
                          <img src={getPhotos(metricslog[d])[0]} alt={d} style={{width:64, height:80, objectFit:"cover", borderRadius:8, border:`1px solid ${C.line}`, display:"block"}}/>
                          <div style={{fontSize:9, color:C.muted, marginTop:2}}>{d.slice(5)}</div>
                          {getPhotos(metricslog[d]).length > 1 && <div style={{fontSize:8, color:C.cyan}}>+{getPhotos(metricslog[d]).length - 1}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* Comparador de fotos corporales con IA */}
      {photosUnlocked && (() => {
        const getPhotos2 = getEntryPhotos;
        const datesWithPhotos = Object.keys(metricslog).filter(d => getPhotos2(metricslog[d]).length > 0).sort().reverse();
        if (datesWithPhotos.length < 2) return null;

        const photoA = cmpDateA ? getPhotos2(metricslog[cmpDateA])[0] : null;
        const photoB = cmpDateB ? getPhotos2(metricslog[cmpDateB])[0] : null;

        const analyzePhotos = async () => {
          if (!photoA || !photoB || cmpPhotoBusy) return;
          const cacheKey = [cmpDateA, cmpDateB].sort().join("|");
          const cached = getAICache("photo_cmp", cacheKey);
          if (cached) { setCmpPhotoAnalysis(cached); return; }
          setCmpPhotoBusy(true);
          setCmpPhotoAnalysis("");
          try {
            const strip = stripDataUrl;
            const mime = mimeFromDataUrl;
            const msg = {
              role: "user",
              content: [
                { type: "image", source: { media_type: mime(photoA), data: strip(photoA) } },
                { type: "image", source: { media_type: mime(photoB), data: strip(photoB) } },
                { type: "text", text: `Compara estas dos fotos de progreso corporal. La primera (izquierda) es del ${cmpDateA} y la segunda (derecha) del ${cmpDateB}. Analiza visualmente: cambios en composición corporal (músculo/grasa visible), definición, volumen, postura y cualquier progreso notable. Sé específico y constructivo. Máximo 5 oraciones en español.` }
              ]
            };
            const result = await callGemini([msg], "Eres un coach experto en composición corporal. Analiza fotos de progreso con criterio profesional, siendo honesto y motivador. Responde en español.");
            const text = result?.trim() || "Sin análisis disponible.";
            setAICache("photo_cmp", cacheKey, text);
            setCmpPhotoAnalysis(text);
            const updMetrics = { ...metricslog, [cmpDateB]: { ...(metricslog[cmpDateB] || {}), cmpPhotoAnalysis: text } };
            saveKey("metricslog", updMetrics);
            setMetricslog(updMetrics);
          } catch(e) {
            setCmpPhotoAnalysis("⚠️ " + aiErr(e));
          }
          setCmpPhotoBusy(false);
        };

        return (
          <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:16, padding:"12px 14px", marginBottom:12}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: cmpOpen ? 12 : 0}}>
              <span style={{display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontWeight:800}}>
                <Camera size={14} color={C.cyan}/> Comparar Fotos
              </span>
              <button onClick={() => { setCmpOpen(!cmpOpen); setCmpPhotoAnalysis(""); }} style={{
                background: cmpOpen ? C.panel2 : `${C.cyan}22`,
                border: `1px solid ${cmpOpen ? C.line : C.cyan}`,
                borderRadius:8, padding:"4px 12px", fontSize:11, fontWeight:800,
                cursor:"pointer", color: cmpOpen ? C.muted : C.cyan
              }}>
                {cmpOpen ? "Cerrar" : "Comparar →"}
              </button>
            </div>

            {cmpOpen && (
              <>
                {/* Side-by-side selectors + photos */}
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10}}>
                  {/* A */}
                  <div style={{display:"flex", flexDirection:"column", gap:5}}>
                    <select value={cmpDateA} onChange={e => { setCmpDateA(e.target.value); setCmpPhotoAnalysis(""); }}
                      style={{fontSize:11, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"5px 6px", color:C.ink, width:"100%"}}>
                      <option value="">— Fecha A —</option>
                      {datesWithPhotos.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {photoA ? (
                      <div style={{position:"relative"}}>
                        <img src={photoA} alt={cmpDateA} style={{width:"100%", aspectRatio:"3/4", objectFit:"cover", borderRadius:10, border:`2px solid ${C.cyan}`, display:"block"}}/>
                        <div style={{position:"absolute", bottom:4, left:4, fontSize:9, fontWeight:800, color:"#fff", background:"rgba(0,0,0,0.65)", borderRadius:4, padding:"1px 5px"}}>{cmpDateA}</div>
                      </div>
                    ) : (
                      <div style={{aspectRatio:"3/4", borderRadius:10, border:`1px dashed ${C.line}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:10}}>Sin foto</div>
                    )}
                  </div>
                  {/* B */}
                  <div style={{display:"flex", flexDirection:"column", gap:5}}>
                    <select value={cmpDateB} onChange={e => { setCmpDateB(e.target.value); setCmpPhotoAnalysis(""); }}
                      style={{fontSize:11, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:8, padding:"5px 6px", color:C.ink, width:"100%"}}>
                      <option value="">— Fecha B —</option>
                      {datesWithPhotos.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {photoB ? (
                      <div style={{position:"relative"}}>
                        <img src={photoB} alt={cmpDateB} style={{width:"100%", aspectRatio:"3/4", objectFit:"cover", borderRadius:10, border:`2px solid ${C.lime}`, display:"block"}}/>
                        <div style={{position:"absolute", bottom:4, left:4, fontSize:9, fontWeight:800, color:"#fff", background:"rgba(0,0,0,0.65)", borderRadius:4, padding:"1px 5px"}}>{cmpDateB}</div>
                      </div>
                    ) : (
                      <div style={{aspectRatio:"3/4", borderRadius:10, border:`1px dashed ${C.line}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:10}}>Sin foto</div>
                    )}
                  </div>
                </div>

                {/* AI analyze button */}
                {photoA && photoB && (
                  <button onClick={analyzePhotos} disabled={cmpPhotoBusy} style={{
                    width:"100%", height:42, borderRadius:11, border:"none",
                    background: cmpPhotoBusy ? C.panel2 : `linear-gradient(135deg,${C.cyan},${C.lime})`,
                    color: cmpPhotoBusy ? C.muted : "#0c0e0b",
                    fontSize:13, fontWeight:800, cursor: cmpPhotoBusy ? "default" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginBottom:10
                  }}>
                    {cmpPhotoBusy
                      ? <><Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/> Analizando…</>
                      : <><Sparkles size={15}/> Analizar con IA</>}
                  </button>
                )}

                {/* Result */}
                {cmpPhotoAnalysis && (
                  <div style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:11, padding:"11px 13px", color:C.ink}}>
                    <MarkdownText text={cmpPhotoAnalysis} style={{fontSize:12.5}}/>
                    <button onClick={() => { sendCoachMessage(`[Comparativa fotos ${cmpDateA} → ${cmpDateB}]\n${cmpPhotoAnalysis}`); setView("coach"); }} style={{marginTop:10, width:"100%", height:36, borderRadius:9, border:`1px solid ${C.lime}`, background:"transparent", color:C.lime, fontSize:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                      <Sparkles size={13}/> Enviar al Coach
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

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


      {/* Version footer */}
      <div style={{textAlign:"center", padding:"8px 0 24px", fontSize:9, color:"rgba(154,160,136,0.4)", fontWeight:700, letterSpacing:".1em"}}>
        {APP_VERSION}
      </div>
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
