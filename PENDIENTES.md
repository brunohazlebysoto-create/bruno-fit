# Pendientes — Registro biométrico, nutrición y entrenamiento

Backlog derivado de la auditoría de cómo la app registra peso y datos
biométricos, y cómo eso ajusta (o no) los requerimientos nutricionales y de
entrenamiento.

**Estado:** 11 de 24 ideas implementadas (ver "Ya implementado" al final).
Las referencias `app.js:NNN` son orientativas — el archivo cambia.

---

> Las 5 ideas que estaban en "Prioridad alta" ya están implementadas
> (carb cycling, deload por composición, pérdida de fuerza en déficit,
> carga calibrada a la fase calórica y refeed/diet break). Ver el detalle
> al final.

## Prioridad alta

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
| **Carb cycling real** | `calcCarbCycleTargets` + `classifyFuelDay`: el `fuel` de los splits ya no es decorativo. Más carbos en día de entreno (los "alto" reciben más), menos en descanso, con la **media semanal cuadrada** al objetivo. Proteína y grasa fijas: el swing lo llevan los carbos. Los anillos de macros de Hoy siguen el objetivo del día |
| **Deload por composición** | `detectDeloadNeed` ya **usa** `metricslog` (antes era `_metricslog` ignorado): perder >1%/sem de peso escala la urgencia, >1.5%/sem la escala doble |
| **Pérdida de fuerza en déficit** | `detectStrengthLossUnderDeficit`: cruza la tendencia de 1RM por ejercicio con la de peso. Alerta solo si caen 2+ ejercicios **y** se está bajando de peso (evita falsos positivos) |
| **Carga según fase calórica** | `classifyCaloricPhase` + `loadRecommendation(…, phase)`: en déficit agresivo exige 10 reps antes de subir (vs 8), reduce el incremento a la mitad y no manda rotar ejercicio ante un estancamiento esperable; en superávit sube con 7 reps |
| **Refeed / diet break** | `detectRefeedNeed`: refeed a las 4 semanas de déficit, diet break a las 8, o antes si el peso se estanca con ≥85% de adherencia. Aparece como notificación y en el panel de objetivos |

### Nota de diseño
Los objetivos calculados **no se aplican solos**: se muestran y el usuario pulsa
"Aplicar estos objetivos". Es deliberado — sobrescribir los macros de alguien
sin que lo pida es destructivo. Si en el futuro se quiere automatizar, hacerlo
como sugerencia notificada, no como escritura silenciosa.
