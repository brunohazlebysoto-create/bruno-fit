# Pendientes — Registro biométrico, nutrición y entrenamiento

Backlog derivado de la auditoría de cómo la app registra peso y datos
biométricos, y cómo eso ajusta (o no) los requerimientos nutricionales y de
entrenamiento.

**Estado:** 6 de 24 ideas implementadas (ver "Ya implementado" al final).
Las referencias `app.js:NNN` son orientativas — el archivo cambia.

---

## Prioridad alta

### 1. Calorías y carbos según día de entreno vs descanso
Los splits ya declaran `fuel: "Carbo alto" | "Carbo medio"` (`app.js:22-30`)
pero hoy es **solo texto decorativo**. Convertirlo en carb cycling real: más
carbohidratos en días de pierna/empuje pesado, menos en descanso, manteniendo
la media semanal en el objetivo.
*Depende de:* objetivos por fórmula (ya implementado).

### 2. La composición corporal debe influir en el entrenamiento
`detectDeloadNeed(exlog, notes, _metricslog)` (`app.js:1401`) recibe el tercer
argumento y **nunca lo usa** — el guion bajo lo delata. Un peso bajando rápido
(>1% semanal) combinado con notas de fatiga es señal fuerte de deload.
Añadir la tendencia de peso como entrada real de la decisión.

### 3. Detección de pérdida de fuerza por déficit
Cruzar `buildPRHistory` (histórico de PRs, ya existente) con `calcWeightTrend`:
si los 1RM estimados caen mientras el peso baja rápido, avisar de que hay que
frenar el déficit o subir proteína. Hoy ambos análisis viven aislados.

### 4. Volumen de entrenamiento calibrado a la fase calórica
En déficit agresivo la prioridad es **mantener** carga (menos volumen, misma
intensidad); en superávit, empujar volumen. Ligar `loadRecommendation` y las
sugerencias de sobrecarga al balance calórico real (`nutritionTargets.deficitDiario`).

### 5. Refeed / diet break automáticos
Si se acumulan N semanas en déficit o la tendencia se estanca pese a adherencia,
proponer subir a mantenimiento unos días. Hoy solo aparece como consejo suelto
en el texto de la IA, sin lógica que lo dispare.

---

## Prioridad media

### 6. Ajuste por adaptación metabólica
Si el peso no baja pese a cumplir las calorías, recalcular el TDEE a la baja de
forma progresiva. La base ya está: `calcTDEE` ahora usa peso suavizado y
`calcNutritionTargets` acepta `tdeeReal`. Falta el bucle de corrección.

### 7. Cintura / WHR como métrica de éxito
`cintura` y `pecho` se capturan en `savePerimetros` (`app.js:15257`) pero **solo
se dibujan**: no alimentan nutrición ni entrenamiento. Usar la cintura como
señal de recomposición (bajar cintura manteniendo fuerza) junto al peso.

### 8. Readiness score diario
Combinar fatiga (notas), días de descanso (hay un cálculo parcial en
`app.js:6428`) y tendencia de peso en un único score que ajuste la sesión
sugerida del día.

### 9. Partición grasa/músculo realista en las proyecciones
`calcBodyProjection` (`app.js:1108`) asume fijo 85% grasa en déficit y 40% en
superávit. Hacerlo dependiente del % de grasa actual (relación de Forbes): con
grasa alta se pierde proporcionalmente más grasa, con grasa baja más músculo.

### 10. Detección de outliers al registrar peso
Avisar si un peso registrado se desvía >2-3 kg del peso de tendencia (EMA):
casi siempre es error de tecleo o medición post-comida. La EMA ya existe
(`calcWeightEMASeries`), falta el aviso en el formulario.

### 11. Etiqueta de fuente y estado de la medición
Guardar en cada entrada de `metricslog` si viene de báscula / InBody / manual y
si fue en ayunas. Sin esto se comparan mediciones no equivalentes en la misma
serie temporal.

### 12. Entrada rápida de peso en 2 toques
Hoy el registro de peso comparte formulario con composición y perímetros.
Un flujo mínimo diario (solo peso) con recordatorio matutino subiría mucho la
frecuencia de registro, que es lo que alimenta todo lo demás.

### 13. Fibra y micronutrientes objetivo
Derivar un objetivo de fibra de las calorías (~14 g por 1000 kcal) además de
P/C/G. Hoy solo se siguen los tres macros.

---

## Prioridad baja

### 14. Unificar los dos cálculos de tendencia de peso
Existían dos: `calcWeightTrend` (regresión, `app.js:1337`) y uno de dos puntos
en el componente de métricas. **Parcialmente resuelto** — la UI ya usa la
regresión; queda revisar si `getWeeklyStats` debería usarla también.

### 15. Peso objetivo y meta configurables
`START_W = 93.9, GOAL_W = 85` siguen hardcodeados (`app.js:220`). Deberían
formar parte del perfil corporal editable ya creado.

### 16. Panel de recomposición unificado
Un solo gráfico con peso suavizado + % grasa + masa magra + cintura + fuerza
(PRs) para ver si de verdad hay recomposición y no solo pérdida de peso.

### 17. Hidratación ligada al peso registrado del día
`calcWaterGoalGlasses` ya escala con el peso, pero el consumo diario no se
compara contra el peso perdido por sudor ni ajusta por clima/duración.

### 18. Sueño, HRV, pasos y frecuencia cardíaca
No se capturan en ningún sitio. Son las entradas que faltan para un readiness
score serio (idea 8). Requiere UI de captura o integración externa.

---

## Ya implementado (referencia)

| Idea | Qué se hizo |
|------|-------------|
| Perfil corporal editable | `DEFAULT_BODY_PROFILE` + editor en Registro; sexo, edad, altura, objetivo, actividad y ritmo. Sustituye los valores hardcodeados de `app.js:480` y del informe de composición |
| BMR/TDEE por fórmula | `calcBMRMifflin`, `calcBMRKatch`, `calcBMR` — usa Katch-McArdle si hay % de grasa (más preciso), si no Mifflin-St Jeor |
| Objetivos derivados | `calcNutritionTargets`: BMR → TDEE → kcal según ritmo deseado. Con suelo de seguridad (nunca bajo el BMR ni 1500 kcal) y uso del TDEE real medido cuando es plausible |
| Proteína por masa magra | 2.6 g/kg de masa magra en definición, 2.3 mantenimiento, 2.2 volumen — en vez de 220 g fijos |
| Peso de tendencia (EMA) | `calcWeightEMASeries` / `getTrendWeight`; se muestra en la UI y **`calcTDEE` ya lo usa** en los extremos en vez de lecturas crudas |
| Agua según peso | `calcWaterGoalGlasses`: ~35 ml/kg + 600 ml si se entrenó, en vez de 14 vasos fijos |
| Import de foto completo | `onPhotoComp` usa el `FITDAYS_SCHEMA` completo (~30 campos: agua, masa ósea, IMC, WHR, segmental) en vez de un esquema reducido de 4 campos |

### Nota de diseño
Los objetivos calculados **no se aplican solos**: se muestran y el usuario pulsa
"Aplicar estos objetivos". Es deliberado — sobrescribir los macros de alguien
sin que lo pida es destructivo. Si en el futuro se quiere automatizar, hacerlo
como sugerencia notificada, no como escritura silenciosa.
