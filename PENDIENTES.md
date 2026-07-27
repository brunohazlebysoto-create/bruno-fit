# Registro biométrico, nutrición y entrenamiento — estado

Backlog derivado de la auditoría de cómo la app registra peso y datos
biométricos, y cómo eso ajusta los requerimientos nutricionales y de
entrenamiento.

**Estado: 24 de 24 ideas implementadas.** Las referencias `app.js:NNN` son
orientativas — el archivo cambia.

---

## Qué se implementó

### Perfil y objetivos

| Idea | Qué se hizo |
|------|-------------|
| Perfil corporal editable | `DEFAULT_BODY_PROFILE` + editor en Registro: sexo, edad, altura, objetivo, actividad, ritmo, peso inicial y peso meta. Sustituye los valores hardcodeados de `getProfileStr`, del informe de composición (`H=1.80, AGE=34`) y las constantes `START_W`/`GOAL_W` |
| BMR/TDEE por fórmula | `calcBMRMifflin`, `calcBMRKatch`, `calcBMR` — usa Katch-McArdle si hay % de grasa (más preciso), si no Mifflin-St Jeor |
| Objetivos derivados | `calcNutritionTargets`: BMR → TDEE → kcal según ritmo deseado. Suelo de seguridad (nunca bajo el BMR ni 1500 kcal) y uso del TDEE real medido cuando su desviación es plausible |
| Proteína por masa magra | 2.6 g/kg de masa magra en definición, 2.3 mantenimiento, 2.2 volumen — en vez de 220 g fijos |
| Fibra objetivo | ~14 g por cada 1000 kcal, acotada a 20-60 g. Se muestra junto a P/C/G |

### Medición y calidad del dato

| Idea | Qué se hizo |
|------|-------------|
| Peso de tendencia (EMA) | `calcWeightEMASeries` / `getTrendWeight`. **`calcTDEE` y `getWeeklyStats` ya lo usan** en vez de lecturas crudas, que se disparaban con la retención de agua |
| Tendencia unificada | La velocidad de cambio usa la regresión (`calcWeightTrend`), no la comparación entre la primera y la última pesada |
| Outliers de peso | `detectWeightOutlier` avisa al escribir un peso que se aleja >2.5 kg de la tendencia. Informa sin bloquear el guardado |
| Fuente y estado | Cada medición guarda `fuente` (báscula/InBody/manual) y `ayunas`, para no mezclar mediciones no equivalentes en la misma serie |
| Entrada rápida | Widget de peso en 2 toques en la pestaña Hoy, con valores sugeridos alrededor del último peso |
| Import de foto completo | `onPhotoComp` usa el `FITDAYS_SCHEMA` completo (~30 campos: agua, masa ósea, IMC, WHR, segmental) en vez de un esquema reducido de 4 campos |

### Nutrición que responde a la composición

| Idea | Qué se hizo |
|------|-------------|
| Carb cycling real | `calcCarbCycleTargets` + `classifyFuelDay`: el `fuel` de los splits ya no es decorativo. Más carbos entrenando (los "alto" reciben más), menos en descanso, con la **media semanal cuadrada** al objetivo. Proteína y grasa fijas; el swing lo llevan los carbos |
| Adaptación metabólica | `calcMetabolicAdaptation` compara el gasto real con el estimado: marca adaptación leve (−8%) o marcada (−15%) y sugiere recalibrar. También detecta gastar más de lo estimado |
| Refeed / diet break | `detectRefeedNeed`: refeed a las 4 semanas de déficit, diet break a las 8, o antes si el peso se estanca con ≥85% de adherencia |
| Agua por peso y sudor | `calcWaterGoalGlasses`: ~35 ml/kg + ~500 ml por hora de entreno, en vez de 14 vasos fijos |

### Entrenamiento que responde a la composición

| Idea | Qué se hizo |
|------|-------------|
| Deload por composición | `detectDeloadNeed` ya **usa** `metricslog` (antes era `_metricslog` ignorado): perder >1%/sem escala la urgencia, >1.5%/sem la escala doble |
| Pérdida de fuerza en déficit | `detectStrengthLossUnderDeficit` cruza la tendencia de 1RM con la de peso. Alerta solo si caen 2+ ejercicios **y** se está bajando de peso |
| Carga según fase calórica | `classifyCaloricPhase` + `loadRecommendation(…, phase)`: en déficit agresivo exige 10 reps antes de subir (vs 8), reduce el incremento a la mitad y no manda rotar ante un estancamiento esperable; en superávit sube con 7 reps |
| Readiness con composición | `predictTodayReadiness` penaliza déficits agresivos y la necesidad de deload; la hidratación usa el objetivo por peso |
| Sueño, pasos y FC en reposo | `evaluateRecovery` + `calcRestingHRBaseline`: campos opcionales en el registro de peso que alimentan el readiness con datos objetivos. La FC se compara con la **línea base propia**, no con un umbral genérico. Si no hay datos, cae a las palabras clave de las notas |

### Análisis y visualización

| Idea | Qué se hizo |
|------|-------------|
| Cintura / WHtR | `calcWaistMetrics`: ratio cintura/altura (umbral de salud 0.5), clasificación de riesgo y cambio total/parcial |
| Recomposición | `detectRecomposition`: cintura bajando + peso estable + fuerza sostenida = cambiando grasa por músculo aunque la báscula no se mueva |
| Panel de recomposición | `buildRecompositionSeries` + gráfico único con peso suavizado, masa magra, grasa y cintura, con los deltas de cada métrica |
| Partición de Forbes | `fatFractionOfLoss` / `leanFractionOfGain` sustituyen el 85%/40% fijo: la partición depende del % de grasa actual y se recalcula cada semana proyectada |

---

## Notas de diseño

**Los objetivos no se aplican solos.** Se calculan, se muestran y el usuario
pulsa "Aplicar estos objetivos". Sobrescribir los macros de alguien sin que lo
pida es destructivo. Si se quiere automatizar, hacerlo como sugerencia
notificada, nunca como escritura silenciosa.

**Los avisos informan, no bloquean.** El aviso de outlier de peso no impide
guardar: un dato raro puede ser legítimo y perderlo es peor que registrarlo.

**Degradación elegante.** Cada función devuelve un estado "sin datos" en vez de
fallar: sin % de grasa se usa Mifflin en vez de Katch; sin datos de sueño el
readiness cae a las notas; sin fase calórica conocida la recomendación de carga
mantiene el comportamiento original.

---

## Posibles siguientes pasos (no planificados)

- **Integración con wearables** (Apple Health / Google Fit / Garmin) para que
  sueño, pasos y FC en reposo entren solos en vez de a mano.
- **HRV** como métrica de recuperación — la más informativa, pero requiere
  dispositivo compatible.
- **Recordatorio matutino** de pesaje: la frecuencia de registro es lo que
  alimenta la tendencia, el TDEE y los objetivos.
- **Histórico de objetivos**: guardar cómo evolucionaron kcal y macros para
  correlacionarlos con los resultados obtenidos.
