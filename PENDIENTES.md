# Pendientes — Registro biométrico, nutrición y entrenamiento

Backlog derivado de la auditoría de cómo la app registra peso y datos
biométricos, y cómo eso ajusta (o no) los requerimientos nutricionales y de
entrenamiento.

**Estado:** 16 de 24 ideas implementadas (ver "Ya implementado" al final).
Las referencias `app.js:NNN` son orientativas — el archivo cambia.

---

> Ya implementadas: las 5 de "Prioridad alta" original (carb cycling,
> deload por composición, pérdida de fuerza en déficit, carga calibrada a
> la fase calórica, refeed/diet break) y las 5 siguientes (adaptación
> metabólica, cintura/WHtR, readiness score, partición de Forbes y
> outliers de peso). Ver el detalle al final.

## Prioridad alta

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
| **Adaptación metabólica** | `calcMetabolicAdaptation`: compara el gasto real medido con el estimado por fórmula. Marca adaptación leve (−8%) o marcada (−15%) y sugiere recalibrar sobre el gasto real; también detecta gastar más de lo estimado |
| **Cintura / WHtR** | `calcWaistMetrics`: la cintura ya no es solo un dibujo. Calcula el ratio cintura/altura (umbral de salud 0.5), su clasificación de riesgo y el cambio total/parcial. Se muestra en el panel de objetivos |
| **Recomposición** | `detectRecomposition`: cintura bajando + peso estable + fuerza sostenida = estás cambiando grasa por músculo aunque la báscula no se mueva. Aparece como notificación |
| **Readiness con composición** | `predictTodayReadiness` recibe `metricslog` y `activeMetrics`: penaliza déficits agresivos (>1%/sem) y la necesidad de deload. Además el % de hidratación ya usa el objetivo por peso, no un `/14` fijo |
| **Partición de Forbes** | `fatFractionOfLoss` / `leanFractionOfGain`: la proyección ya no asume 85%/40% fijos. Con más grasa se pierde proporcionalmente más grasa (y se gana menos músculo), recalculado cada semana |
| **Outliers de peso** | `detectWeightOutlier`: avisa al escribir un peso que se aleja >2.5 kg del peso de tendencia (error de tecleo o medición post-comida). Informa sin bloquear el guardado |

### Nota de diseño
Los objetivos calculados **no se aplican solos**: se muestran y el usuario pulsa
"Aplicar estos objetivos". Es deliberado — sobrescribir los macros de alguien
sin que lo pida es destructivo. Si en el futuro se quiere automatizar, hacerlo
como sugerencia notificada, no como escritura silenciosa.
