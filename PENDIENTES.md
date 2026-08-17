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

---

## Revisión de interfaz (W37–W40)

Segunda pasada, esta vez mirando las pantallas una a una en el preview local.

### Errores corregidos

| Error | Impacto |
|-------|---------|
| Los mensajes de "sin clave API" mandaban a `gemini.google.com` | Es el chatbot, no donde se sacan las claves: **impedía completar el paso**. Ahora `aistudio.google.com` |
| "Semana actual vs anterior: 1 días" | Plural incorrecto |
| El split del día se cruzaba por nombre ("Pectoral" vs "Pecho + Bíceps") | Nunca coincidía; ahora se identifica por cuántos ejercicios del split se hicieron |

### Mejoras aplicadas

| Antes | Ahora |
|-------|-------|
| Pasarse del objetivo se veía igual que cumplirlo: barras y anillos topaban al 100% | El excedente se dibuja en rojo y se indica cuánto (`232/199g +33`) |
| El centro del anillo era ilegible: el texto caía sobre los aros | Radios separados y sin la línea del objetivo, que ya está al lado |
| El coach mostraba prompts que el usuario nunca escribió | Se resumen en una etiqueta corta |
| La preparación del día eran 7 factores seguidos | Separados en lo que resta (↓) y lo que suma (↑), los 2 más relevantes de cada lado |
| Todos los días entrenados eran un punto verde idéntico | Color por split y punto mayor si el volumen fue alto |
| Las pestañas A/B/C/D/E no decían nada | Llevan el grupo muscular y el color del split |
| El selector de sensación salía en días sin entreno | Solo cuando hay sesión que valorar |
| La papelera borraba al instante | Pide confirmación: los datos de peso no se recuperan |
| El objetivo calórico solo estaba en texto bajo el gráfico | Línea de objetivo sobre las barras + media semanal y días por encima |
| "Rendimiento este mes" eran diez cuadraditos sin explicar | Barra con el desglose: constancia /4, volumen /3, progreso /3 |
| Cuatro botones del coach con cuatro colores y sin jerarquía | Uno principal sólido y tres secundarios neutros |
| "Bien hidratada" | "Buena hidratación" |

### Nota sobre los datos de ejemplo
El preview sembraba los 8 ejercicios el mismo día, lo cual no ocurre en uso
real y **ocultó el fallo de detección de split**. Ahora cada sesión usa solo
los ejercicios de su split y rotan A→B→C→D.

---

## Revisión de pantallas desplegables (W41–W44)

Tercera pasada, abriendo modales, paneles expandidos y desplegables — las
superficies que solo existen al interactuar y que las capturas estáticas no
alcanzaban.

### Fallos con impacto real

| Fallo | Por qué importaba |
|-------|-------------------|
| **El análisis local solo corría al GUARDAR algo** | Al abrir la app con datos ya registrados nunca se ejecutaba: "Proyección a 12 semanas" decía *"no hay datos"* con 46 pesos y 45 días de comida, y ninguna alerta (mesetas, sobrecarga, pérdida de fuerza, refeed, adaptación, recomposición) aparecía hasta tocar algo. Ahora se dispara una vez al terminar la carga |
| **La carga recomendada no salía al registrar** | El banner SUBIR/CONSOLIDAR/ROTAR solo existía en la lista del detalle de sesión (lo ya entrenado). Al abrir un ejercicio del split para registrar series — justo cuando necesitas saber qué peso poner — no aparecía nada. Ahora sale en ambas, y si aún no entrenaste hoy la saca del historial |

### Pulido visual

| Antes | Ahora |
|-------|-------|
| El panel del ejercicio tenía dos gráficos del mismo dato (mini 1RM + gráfico grande con selector Peso/1RM) | Solo el grande |
| El buscador del modal de PRs compartía fila con dos botones y no cabía ni su texto | Ocupa su línea; los botones van debajo al 50% con etiquetas completas |
| La lista del editor de splits se cortaba a media tarjeta sin señal de que hubiera más | Degradado al pie cuando hay más de 4 ejercicios |

---

## Arranque sin CDN y orden de ejecución (W45)

### La app no dependía de sí misma

`index.html` bajaba Babel (~2 MB) desde unpkg y compilaba las 19.000 líneas de
`app.js` **en el navegador** en cada carga fría, más React, lucide y Supabase
desde esm.sh. Con esos CDN bloqueados o caídos la app simplemente no arrancaba.

- `npm run build` genera `app.bundle.js`: todo compilado y empaquetado (1 MB)
- `index.html` lo usa y **cae al camino Babel** si falta o no llega a montar
- `npm run verify` abre el `index.html` real en Chromium **sin salida a
  internet** y falla si el preloader no desaparece o `#root` queda vacío
- `deploy_hf.py` sube el bundle y **aborta si quedó desfasado** de `app.js`
  (compara el hash del fuente sellado en la cabecera): servir código viejo en
  silencio sería peor que no desplegar

### Cuando aun así falla (W46)

Con unpkg caído en el móvil, la app mostraba la pantalla roja **PROMESA
RECHAZADA**: el `await loadBabel()` del último recurso estaba *dentro* del
`catch`, así que su rechazo no lo capturaba nadie. Y esa pantalla no explica
nada útil ni deja salida.

- ese último intento va ahora dentro de su propio `try`
- si se agotan todos los caminos: mensaje claro, aviso de que **los datos siguen
  guardados en el teléfono** y botón **Reintentar**
- temporizador de 25 s por si algún camino se cuelga sin llegar a fallar
- `npm run verify` prueba también **el peor caso** (`--sin-bundle`): sin bundle
  y sin red, comprueba que sale el aviso con reintento y no la pantalla roja
- el service worker pasó de no guardar nada a **cachear los archivos propios**
  (`index.html` red primero para no servir despliegues viejos; el resto caché
  primero, con la versión en la URL). La app abre sin conexión

---

## El trabajo que no se contaba (W47)

Tres fallos encadenados hacían que buena parte del entrenamiento no apareciera
en ninguna estadística muscular.

### 1. El mapa leía otra cosa que las tarjetas

`MuscleHeatmap` usaba **solo** la tabla fija `MUSCLES[nombreDelEjercicio]`, sin
pasar por `normalizeMuscle` ni por el catálogo del usuario. Resultado: cualquier
ejercicio propio no pintaba nada, y el mismo panel mostraba dos cifras distintas
del mismo entrenamiento (mapa "Espalda 5.2/sem" vs tarjeta "ESPALDA 16.7").

Ahora el mapa es literalmente la versión visual de `calcMuscleVolumeBalance`.
Además:

- `SLUG_MUSCLE` decía **"Abdominales"** y **"Gemelos"**, que no son ninguno de
  los 11 canónicos: el abdomen y las pantorrillas **no se pintaban jamás**
- las tarjetas reusaban `local.muscleVol`, calculado sobre 28 días fijos, bajo
  la etiqueta "(7d)" — el selector 7/30/Todo no cambiaba nada

### 2. Un ejercicio sin músculos era invisible

Al añadir un ejercicio los músculos los pone la IA. Si esa llamada falla (sin
clave, sin red), queda guardado con la lista vacía — y desde ese momento no
cuenta para el mapa, ni el balance, ni la fatiga de la sesión. Sin avisar.

- `inferMusclesFromName` los deduce del nombre ("Sentadilla en multipower" →
  cuádriceps). El orden de las reglas importa: *press cerrado* es tríceps, no
  pectoral; *curl femoral* es isquios, no bíceps
- lo que aun así no se reconoce **se declara**: el panel de balance lista los
  ejercicios que no suman y explica cómo arreglarlo

### 3. Mayúsculas y acentos multiplicaban los músculos

"braquial", "Braquial" y "Braquial " eran tres músculos distintos. El cuadro del
split mostraba 23 etiquetas donde había 5 músculos: *Deltoides*, *Deltoides
anterior*, *Deltoides lateral* y *Deltoides posterior* contaban por separado.

`canonMuscleName` + `dedupeMuscles` agrupan por músculo real y ordenan por
cuántos ejercicios del día lo trabajan. Lo que no se reconoce se conserva, solo
que ordenado. La misma regla se aplica al reparto de fatiga de la sesión, donde
"Tríceps braquial" y "Tríceps" no acumulaban fatiga entre sí.

### 4. Las pestañas escondían la mitad del día (W48)

El resumen bajo la letra se cortaba en el `+`: la pestaña A de **"Pecho +
Bíceps"** decía solo *Pecho*, y la C de **"Espalda + Tríceps"** solo *Espalda*.
Al querer que cupiera en una línea, se ocultaba justo la mitad del entreno.

Ahora se muestra el nombre completo (`Pecho · Bíceps`), envolviendo en varias
líneas si hace falta. La pestaña crece unos píxeles; a cambio no miente.

### 5. El número de orden se quedaba solo

Con `flexWrap`, un nombre largo saltaba entero a la línea siguiente y dejaba el
`2º` huérfano arriba, con las flechas ▲▼ a media altura de la tarjeta. Número y
nombre van ahora en su propio bloque. El sembrado del preview usa un nombre
largo de verdad para que el caso quede cubierto por las capturas.

---

## Mover un ejercicio de día (W49)

Un ejercicio quedaba atado al día en que se creó. Cambiarlo de sitio obligaba a
borrarlo y volver a crearlo en el otro día — y eso **se llevaba por delante todo
el historial**, porque al borrar se elimina también su entrada en `exlog`.

Ahora, en *Opciones de Ejercicio* → **↔️ Mover a otro día**, con la lista de
splits y el día actual marcado y deshabilitado.

`moveExerciseBetweenSplits` es pura y no toca `exlog`: las series están
indexadas por nombre y siguen donde estaban. Actualiza **las dos** listas a la
vez —el catálogo `exercises` y los nombres de `splits`—, que es justo lo que
suele desincronizarse y hace que un ejercicio aparezca en un sitio y no en otro.

Comprobado de punta a punta en el navegador: "Press banca" sale de A (catálogo y
nombres), entra en C (catálogo y nombres) y conserva sus 12 series.


### El orden de la sesión

Saber con cuánta fatiga llegó cada grupo muscular a cada ejercicio depende de en
qué orden se hicieron. El registro, sin embargo, suele completarse al final del
entreno con todas las series marcadas casi en el mismo segundo — y ahí la hora
deja de distinguir qué fue primero. Además, la lista de la sesión se mostraba en
el orden en que se creó el registro, no en el de ejecución.

| Antes | Ahora |
|-------|-------|
| Los ejercicios del día salían en orden arbitrario | Numerados **1º, 2º, 3º** y reordenables con ▲▼ |
| Las series se listaban de la más reciente a la más antigua (el PDF las numeraba al revés) | En orden de ejecución, etiquetadas **C / S1 / S2 / S3** y reordenables |
| Cada fila de serie repetía la misma fecha | La fecha se cambió por el número de serie, que sí informa |
| La pre-fatiga solo se veía agregada por músculo | Panel **Orden de la sesión**: con qué fatiga llegó el músculo principal a cada ejercicio |
| La IA recibía los ejercicios sin orden ni pre-fatiga | Los recibe numerados y con su pre-fatiga, y se le pide evaluar si el orden fue el adecuado |

**Cómo se guarda el orden.** No hay campo nuevo: se **permutan las marcas de
tiempo que ya existen**. No se inventa ninguna hora, se reparten las mismas en
otro orden. Así todo lo que ya ordenaba por fecha —gráficos, análisis, PDF,
sincronización con la nube, copias de seguridad— sigue funcionando sin tocarlo,
y el orden viaja con los datos.

---

## Números invisibles en Volumen Semanal (W50)

Los músculos con más trabajo (≥8 series/sem) mostraban el número **negro sobre
negro**: justo los que más interesa leer.

El CSS de `.muscle-heatmap-cell` pinta un degradado, es decir un
`background-image`. El código aplicaba `backgroundColor` en línea, y un
`background-image` se pinta **encima** del color: el fondo lima no llegaba a
verse nunca, pero el número sí usaba el `#0c0e0b` pensado para ese fondo.

- se aplica el atajo `background`, que reemplaza también la imagen
- el nombre del músculo lleva color explícito: heredado, salía claro sobre el
  lima sólido — el mismo fallo, un tramo más allá
- los tramos intermedios tampoco mostraban su color (mismo motivo); ahora sí

Se comprobó en el navegador el tramo alto, que es el que estaba roto: fondo
`rgb(205,255,74)`, `background-image: none` y número `rgb(12,14,11)`.

**Regla para no repetirlo:** si una clase del CSS define `background` con
degradado, en línea hay que usar `background`, nunca `backgroundColor`. Las
clases con degradado son `.muscle-heatmap-cell`, `.comp-metric-box`,
`.chat-bubble.user` y `.chat-bubble.assistant`.

---

## Tema claro (W51)

El fondo pasa de negro a blanco. La marca sigue siendo verde, pero el lima
`#cdff4a` daba **1.3:1 de contraste sobre blanco** — ilegible como texto. El
acento es ahora `#4d7c0f`, que sirve a la vez de texto y de relleno, y sobre un
relleno de acento el texto es siempre `--on-accent` (blanco).

Casi todo el color ya salía de variables CSS, así que el grueso del cambio está
en `:root`. Lo demás:

| Qué | Por qué |
|-----|---------|
| `--on-accent`, `--track`, `--overlay`, `--tint-*` | El tema oscuro daba por hecho que "texto sobre acento" era el color del fondo, y que las pistas de las barras eran blanco translúcido. Sobre blanco ninguna de las dos cosas vale |
| Sombras `rgba(0,0,0,.4-.6)` → sombras suaves y frías | El negro al 40% sobre blanco ensucia en vez de elevar |
| Resplandores lima → sombras verdes | Un *glow* sobre blanco se ve como suciedad, no como brillo |
| Barrido de contraste automático | Se recalculó cada color de texto con menos de 4:1 sobre blanco y se oscureció hasta 4.6:1 (ámbar, rosa, oro de los PR…) |
| Escala del Volumen Semanal | Era violeta → lima, que no significaba nada. Ahora gris → ámbar → verde claro → verde sólido: nada / poco / suficiente / en objetivo |
| Silueta del mapa muscular | El músculo sin trabajar era verde muy oscuro: sobre blanco la figura entera era una mancha negra. Ahora gris claro, y el borde del calor es más oscuro que el relleno, no más claro |
| Preloader, `theme-color`, manifiesto y ventana de espera de la IA | Seguían en negro: la app abría con un fogonazo oscuro antes de pintar |
| Pantallas de error críticas | De negro sobre rojo a un fondo claro; siguen diciendo lo mismo |

### Un fallo que llevaba tiempo escondido

`` `${C.lime}44` `` — el truco de pegarle el alfa en hexadecimal a un color.
Pero los tokens de `C` **ya eran variables CSS**, así que eso producía
literalmente `var(--accent-primary)44`: CSS inválido, y el borde o el fondo
simplemente no se pintaban. Sobre negro no se notaba. Eran **47 sitios**.

Ahora se usa `alfa(color, pct)` con `color-mix`, que sí sabe mezclar una
variable — y funciona igual si lo que recibe es un hex de verdad.

**Los PDF no se tocaron.** Se imprimen en papel blanco y ya tenían su propia
paleta. La frontera fiable resultó ser que los colores de la interfaz van
entrecomillados y los del CSS de los PDF van sueltos; el primer intento los
separaba por si la línea tenía etiquetas HTML, y eso descartaba media interfaz.

---

## Quitar de un día y ejercicios combinados (W52)

### Quitar de un día

Existía "Quitar de este split", pero solo en la lista del split y atado al día
que estuviera abierto. Ahora está también en **Opciones de Ejercicio → ➖ Quitar
de este día**, y resuelve el día real del ejercicio (`splitOfExercise`), así que
funciona igual desde el detalle de una sesión.

`removeExerciseFromSplitPure` no toca `exlog`: **volver a añadirlo recupera todo
el historial**. Eso es lo que separa "quitarlo de este día" de "borrar el
ejercicio", que sí se lleva los registros por delante.

### Combinados (biserie / triserie)

Dos o tres ejercicios que se hacen seguidos, sin descanso. Se crean desde la
pestaña **Combinado**, eligiendo del propio día, y quedan como un ejercicio más:
`{ name: "Press banca + Aperturas", combo: [...], musculos: unión }`.

**Cómo se guardan.** Una serie en **cada** ejercicio, no una en el combinado,
todas con el mismo `comboId`:

- los PRs, los gráficos, el reparto muscular y la fatiga están indexados por
  nombre y siguen funcionando sin tocar nada
- guardarlo bajo el nombre del combinado habría **duplicado el volumen** de sus
  partes, y encima habría creado un ejercicio que ningún gráfico conoce
- `comboId` las une: en el detalle del día salen con un distintivo ⛓ 1/2, para
  que una biserie no parezca dos series sueltas

En la tarjeta de un combinado se oculta el formulario suelto de una serie: si
estuviera, registraría bajo el nombre del combinado y volveríamos al problema
del párrafo anterior.

Comprobado en el navegador: registrar una vuelta suma 1 serie a *Press banca* y
1 a *Aperturas*, con el mismo `comboId`, y **nada** queda guardado bajo
"Press banca + Aperturas". Al quitar un ejercicio del día, sus 12 series siguen
donde estaban.

---

## Lo que la IA no estaba viendo (W53)

Al analizar el entrenamiento, el coach recibía **el día de hoy y nada más**.
Podía describir la sesión, pero no juzgar si hubo progreso: los datos de las
sesiones anteriores se calculaban en `buildDaySummary` (`prevMaxW`,
`deltaVsPrev`, `plateau`) y **no se le pasaban**. Y el reparto muscular le
llegaba como "Espalda ~5.2ser", que con 2-3 ejercicios por grupo no dice si el
día fue de espalda o de brazos.

### Progreso contra sesiones anteriores

Cada ejercicio lleva ahora `recentSessions`: las 3 sesiones previas con su peso
tope. Una sola comparación no distingue *"venía subiendo y hoy bajé"* de *"llevo
tres semanas plano"*.

Los tres caminos de IA lo reciben:

| Camino | Qué se añadió |
|--------|---------------|
| PDF con IA | `sesiones previas 82.5 → 85 → hoy 90kg, +5kg vs la anterior`, récord histórico y estancamiento |
| Analizar entrenamiento (Coach) | Bloque *Progreso vs sesiones anteriores* con el peso tope por sesión |
| Recomendación de carga (por ejercicio) | Se le pide comparar con el historial, no solo describir |

### Gasto muscular en porcentajes

`calcSessionMuscleSets` devuelve `sharePct` (cuánto del trabajo efectivo del día
se lleva ese músculo) y `exCount` (en cuántos ejercicios). Los porcentajes suman
~100 y se ven en la app, en el PDF y en los prompts:

> Cuádriceps **41%** · 6 ser. efect. en 2 ejerc.

Al coach se le dan además los umbrales para que la evaluación sea concreta y no
un comentario genérico: **>45% en un grupo** es un día desequilibrado, **<10%**
es un músculo que apenas se tocó. Y en la recomendación por ejercicio se avisa
de cuánto se lleva ya su músculo principal, porque subir carga en el tercer
ejercicio de un grupo no es lo mismo que subirla en el primero.

---

## Porción muscular en vez de grupo entero (W54)

"Espalda 41%" no sirve para decidir nada: no dice si faltó dorsal, trapecio o
lumbar. Los 11 grupos canónicos siguen valiendo para el mapa de calor y el
balance semanal, pero el reparto de la sesión baja ahora un nivel.

Dos fuentes, en este orden:

1. **Lo que ya diga el músculo** — "Deltoides posterior", "Vasto medial". Es lo
   que genera la IA al dar de alta un ejercicio, y lo estábamos aplastando.
2. **El nombre del ejercicio**, cuando el músculo viene en grueso — que es todo
   el catálogo por defecto, donde solo pone "Espalda". Un jalón y un
   encogimiento son los dos "Espalda" y no tocan lo mismo.

Se separan además las porciones que el ejercicio trabaja **de verdad**
(posición primaria o secundaria) de las que solo asisten, que van resumidas en
una línea: en una barra son ruido.

### Dónde NO se afina

Sólo se refina donde la porción **depende del ejercicio**. El cuádriceps no:
ninguna sentadilla ni prensa separa el vasto lateral del medial, así que se
queda como grupo en vez de inventar una etiqueta que suene precisa y no lo sea.

### Dos fallos que salieron al probarlo

- `/lateral/` sin `\b` disparaba con **"unilateral"**: "Prensa de piernas 45
  grados unilateral" se clasificaba como *Glúteo medio* y *Deltoides lateral*
- la regla genérica de la tabla de músculos cortocircuitaba antes de mirar el
  ejercicio, así que un músculo escrito en grueso devolvía el grupo y **no se
  afinaba nunca** — justo el caso de todo el catálogo por defecto

Los dos prompts de IA reciben ahora el reparto por porción y se les pide
explícitamente usarlo en vez del grupo.

---

## Los datos del InBody sí se guardaban — se leían mal (W55)

Tres fallos encadenados. Los datos llegaban al registro; lo que fallaba era todo
lo que venía después, y por eso el plan salía con números que no correspondían.

### 1. El informe y la app hablaban idiomas distintos

El informe trae `masaMuscular`, `smmKg`, `pesoSinGrasa`… pero **toda la app lee
`musculo`**, y ese campo no se escribía nunca. Resultado: importabas un InBody,
los datos quedaban guardados, y la composición seguía en los valores por defecto
(64.7 kg de músculo, 26.2% de grasa) hardcodeados desde el principio.

`normalizeBodyEntry` traduce, con prioridad: masa muscular → SMM → % de músculo
sobre el peso → peso sin grasa menos hueso. **Masa muscular y masa esquelética
no son lo mismo**: confundirlas daría ~38 kg donde hay ~65. También deduce el %
de grasa desde la masa grasa cuando el informe no lo da directo.

### 2. Una pesada normal borraba la composición

`getMetricsForDate` leía **solo la entrada más reciente**. Si el lunes te hacías
un InBody y el martes te pesabas en una báscula normal, el martes la app perdía
el % de grasa y la masa muscular y volvía a los valores por defecto. Con eso se
recalculaban el BMR, los macros y el plan entero.

`mergeMetricsUpTo` arrastra el último valor **conocido de cada campo**. Lo que
describe un día concreto —pasos, sueño, FC en reposo, análisis de una foto— no
se arrastra: los pasos de ayer no son los de hoy.

### 3. El importador escribía por detrás

Llamaba a `setMetricslog` (que ya persiste y sincroniza) **y además** a un
`saveKey("metricslog", …)` suelto, que competía con la escritura asíncrona del
primero. Ahora hay una sola vía.

### Comprobado en el navegador

Con un InBody del 27 (vocabulario de informe) y una pesada normal el 28:

```
PESO 91.9 kg · MAGRA 72.2 kg · GRASA 19.7 kg · MÚSCULO 68.9 kg
BMR 1930 por Katch-McArdle · masa magra 72.2 kg · proteína 2.6 g/kg magra
TDEE 2918 · Objetivo 2370 kcal · P 188 C 256 G 66 F 33
```

El peso es el del día 28 y la composición viene del InBody del 27, que es
justo lo que antes se perdía. El BMR cuadra con Katch-McArdle sobre 72.2 kg
(370 + 21.6 × 72.2 = 1930): el plan ya sale de los datos reales.

---

## El gráfico decía una cosa y el registro otra (W57)

### La discordancia

`buildRecompositionSeries` dibujaba el **peso suavizado** y derivaba de él la
masa magra: 93.8 × 74.9% = 70.3 kg. Pero el informe había **medido** 69 kg. El
gráfico y el registro decían cosas distintas del mismo día.

Ahora, cuando el día tiene una medición real de masa grasa o magra, se usa esa;
el suavizado solo rellena los días sin pesada. Cada punto lleva `medido` y
`pesoTendencia` por separado, para no volver a mezclar las dos cosas.

### Errores al extraer

En el informe se veía **"Músculo esquelético: 42.9 kg"** y **"Músculo
esquelético: 42.9 %"** — el mismo número en dos unidades, que es imposible.
Leer un informe desde una foto falla de formas concretas y detectables, y como
estos datos ajustan después los planes de nutrición y entrenamiento, un error
aquí se propaga a todo.

`validateBodyMetrics` revisa la lectura contra sus propias identidades físicas:

| Comprobación | Qué hace |
|---|---|
| Rangos plausibles | Un `grasaPct` de 251 no es una medición, es una lectura mal hecha: se descarta |
| Mismo número en kg y en % | `smmKg` = `musculoEsq` no puede ser: se recalcula el % desde los kg y el peso |
| `masaGrasa` = peso × %grasa | Rellena lo que falte y **corrige lo que se contradiga** |
| `pesoSinGrasa` = peso − grasa | |
| `masaMuscular` = peso sin grasa − hueso | Y de ahí sale `musculo`, que es lo que lee el resto de la app |
| SMM ≤ masa muscular ≤ peso sin grasa ≤ peso | Cuando se puede se repara; cuando no, se avisa |
| IMC y SMI contra la altura del perfil | |

Lo corregido **se enseña siempre** antes de guardar, campo por campo y con el
motivo: *"musculoEsq: venía igual que smmKg (42.9), que no puede ser;
recalculado a 46.6%"*. Corregir en silencio sería peor que no corregir: los
datos son del usuario y tiene que poder contrastarlos con su informe.

---

## La rutina con IA metía músculos que no tocaban (W59)

En un día de "Pierna Cuádriceps + Hombros" el plan salía con bíceps. Dos causas:

1. **El historial se sacaba de TODO `exlog`**, no de los ejercicios del día:
   `Object.keys(exlog).filter(...)` barría el registro entero, así que entraban
   ejercicios de otros días del split.
2. **Nada se lo prohibía.** El prompt decía qué grupos había, pero no que fueran
   los únicos.

Ahora el historial se limita a los ejercicios del día, el prompt lo dice
explícito —*"está PROHIBIDO añadir un grupo que no esté en esa lista"*— y hay
una red de seguridad que recorta la respuesta: si el modelo añade un grupo o un
ejercicio de fuera, se descarta antes de imprimir.

### Preselección

Pulsar **PDF IA** ya no genera directamente: abre una hoja con los ejercicios
del día agrupados por músculo, todos marcados. Se desmarca lo que no entra y la
IA trabaja **solo con lo elegido**. Es la forma directa de que el plan sea el
del día y no lo que el modelo considere conveniente.

---

## Un fallo que llevaba tiempo y otro que lo acompañaba (W58)

`onClick={analyze}` le pasaba el **evento del clic** como lista de pesos, así que
`evento.map` reventaba y tumbaba la app entera. Era el botón *"Analizar peso y
composición corporal (IA)"*.

Al auditar los 58 manejadores pasados por referencia apareció el mismo patrón en
`onClick={syncLocalToSupabase}`: el evento llegaba como `silent`, que es
*truthy*, y **silenciaba los errores de sincronización**. Si la sincronización
fallaba, no avisaba de nada.

Además de arreglar las dos llamadas, `analyze` ignora ahora un primer argumento
que no sea un array: la función no debería depender de que quien la llame
acierte.

---

## Recomendado, rotar, nuevo o variante (W60)

La hoja de selección pedía decidir sobre 13 ejercicios sin dar ninguna pista, y
con todo marcado. Ahora `recommendDayExercises` los lee y los clasifica.

El criterio no es una opinión: sale del propio historial de cada ejercicio.

| Estado | Qué significa | De dónde sale |
|---|---|---|
| **RECOMENDADO** | Entra hoy | Compuesto del grupo, carga subiendo, historial suficiente, hecho hace poco |
| **ROTAR** | Entra, pero está agotado | Mismo peso 3+ sesiones, carga bajando, o más de 30 días sin tocarlo |
| **NUEVO** | Entra, sin datos aún | Sin sesiones registradas |
| **VARIANTE** | Alternativa, desmarcada | No entró en el top 3 de su grupo; dice **a quién sustituye** |

Cada uno lleva el porqué en una línea: *"carga subiendo (+5 kg)"*, *"estancado:
conviene rotarlo"*, *"32 días sin hacerlo"*.

### Tres cosas que salieron al mirarlo en pantalla

- **"RECOMENDADO · estancado: conviene rotarlo"** se contradecía a sí mismo. Si
  entra pero está agotado, es otro estado — no un recomendado con letra pequeña.
- **"Sin registros" no es estar agotado.** Un ejercicio que nunca hiciste no
  está quemado: no tiene datos. Mezclarlos hacía que apareciera como ROTAR, que
  ahí no significa nada.
- Los grupos salían **alfabéticos**; ahora en el orden del día, que es el que el
  usuario ya conoce.

La misma lectura viaja al prompt, para que el PDF no contradiga lo que la app
acaba de recomendar: al ROTAR se le pide cambiar rango de repeticiones o técnica
en vez de subir carga a ciegas, y al NUEVO arrancar conservador.

---

## El análisis de tendencia llegaba cortado y en genérico (W61)

Terminaba a media frase — *"...4 kg en aproximadamente 2.5 meses,"* — y no daba
ni proyecciones ni recomendaciones concretas.

### Por qué se cortaba

`maxOutputTokens` en texto libre era **2048**, y un modelo con razonamiento se
los gasta pensando antes de escribir nada. Subido a 8192. (El panel no
recortaba: la respuesta llegaba así de la API.)

### Por qué era genérico

El coach solo veía una lista de pesos. La app ya calculaba, y no le pasaba:

- ritmo real en kg/semana por regresión, y semanas hasta la meta
- proyección a 12 semanas con partición grasa/magra tipo Forbes
- BMR, TDEE estimado, TDEE **medido** por consumo y peso real
- adaptación metabólica, refeed/diet break, recomposición, pérdida de fuerza
- cintura y ratio cintura/altura con su clasificación

Ahora va todo, y la respuesta se pide en cinco secciones fijas: **Dónde estás ·
Proyección · Nutrición: qué ajustar · Entrenamiento: qué ajustar · Qué vigilar**,
con la instrucción de citar números reales y no adjetivos.

### Tres errores que solo se vieron interceptando el prompt

Se capturó la llamada real en el navegador para leer lo que se enviaba:

- `calcWeightTrend` devuelve `kgPerWeek`, no `slope` → el ritmo salía `NaN`
- `getTrendWeight(metricslog, alpha)` recibía una **fecha** como alfa
- `refeedAlert.message` no existe (es `reason`) → *"Refeed: undefined"*, y
  `waistMetrics.riesgo` es un objeto → *"(\[object Object\])"*

Los tres habrían entrado en el prompt como datos, no como huecos: el modelo
habría razonado sobre ellos. Además la proyección mostraba cuatro semanas
consecutivas que se diferencian en 200 g; ahora son hitos repartidos (0/4/8/12).

---

## El selector de rango no hacía nada (W62)

Cambiar de **30 d** a **90 d** dejaba el gráfico y los números idénticos. La
causa estaba en una línea:

```js
return rec2.length >= 2 ? rec2 : todos;
```

Si la ventana elegida tenía menos de dos mediciones, caía al histórico completo
**sin decirlo**. Con mediciones espaciadas, elegir "30 días" mostraba un eje de
*15 may a 04 ago*: el selector parecía roto cuando en realidad estaba mintiendo.

El respaldo se mantiene —un gráfico vacío es peor— pero ahora se avisa: *"Solo 1
medición en los últimos 30 días: se muestra el histórico completo para que la
línea tenga sentido"*.

### Más información

- Cada botón de rango dice **cuántas mediciones** contiene, así se ve de un
  vistazo cuál tiene datos antes de pulsarlo
- Al tocar un día, cada métrica muestra el cambio **desde el inicio** y también
  **respecto a la medición anterior**, que es la comparación que uno hace de
  cabeza

---

## Registro de cintura (W63)

`savePerimetros` existía en el código pero **ninguna pestaña lo alcanzaba**: la
cintura solo entraba si venía dentro de un informe de InBody. Y es la métrica
que mejor distingue perder grasa de perder peso.

Nueva pestaña **Cintura** junto a Peso y Composición, con:

- valor en cm y **fecha propia**, para cargar medidas antiguas sin cambiar el
  día seleccionado en el resto de la app
- interruptor **en ayunas**: la condición cambia la medida varios centímetros, y
  sin anotarla dos medidas no son comparables
- lectura inmediata: último valor, cambio vs la medición anterior, ratio
  cintura/altura con su clasificación y las últimas seis medidas

El gráfico ya tenía la serie; ahora tiene datos que mostrar. Y el análisis con
IA recibe la **serie completa** —no solo el último valor— con una sección propia:
la cintura bajando con el peso estable es la señal de recomposición, y eso solo
se ve en serie.

### Dos trampas del formulario

- El campo compartía estado con el formulario de perímetros, cuyo efecto lo
  repoblaba desde **otro día** al guardar: escribías 92 y aparecía 96.3
- Ese mismo efecto se disparaba con cada cambio de `metricslog`, así que el
  propio guardado borraba lo tecleado. Ahora el formulario tiene su estado y su
  fecha, y solo recarga cuando la fecha cambia de verdad

---

## Auditoría del ítem Registro (W64)

Repaso del flujo completo: qué se puede registrar, qué se guarda, qué se lee y
qué se analiza. Se cruzaron los campos escritos contra los leídos.

### Lo que estaba roto

| Hallazgo | Por qué importaba |
|---|---|
| **El formulario de perímetros era inalcanzable** | `savePerimetros` existía desde siempre y **ninguna pestaña lo llamaba**. La detección de asimetrías de brazos y muslos estaba escrita y **no podía dispararse nunca**, porque los datos no había forma de meterlos |
| **No se podía corregir ni borrar una medición** | El aviso de outlier informa pero no bloquea — a propósito, porque un dato raro puede ser legítimo. Pero entonces un peso mal tecleado quedaba **envenenando la tendencia, el TDEE, la proyección y el plan para siempre**, sin forma de sacarlo |

### Lo que se hizo

- **Pestaña Perímetros**, con los dos lados y la asimetría calculada en vivo:
  *"asimetría 1.2 cm · más derecho"* frente a *"simétrico"*. Más de 0.5 cm
  mantenido es un desequilibrio que se corrige con trabajo unilateral, y solo se
  ve midiendo por separado
- **Historial de mediciones**: lista de todas, con lo que contiene cada una y su
  fuente, botón para cargarla en el formulario y borrado con confirmación que
  dice qué se pierde

### Ideas pendientes, por valor

1. **Panel segmental del InBody.** Se guardan los kg de grasa y músculo de
   tronco, brazos y piernas por separado, y **solo se usan en un texto para la
   IA**: no hay ninguna visualización. Es de lo más accionable que da un InBody.
   Además `grasaBrazoIzq`, `grasaPiernaIzq` y `musculoTronco` no se usan en
   absoluto — la asimetría de grasa se calcula solo con el lado derecho.
2. **Más series en el gráfico**: visceral, IMC y agua se registran y no se pueden
   dibujar. Son tres líneas gratis.
3. **Marcar la condición en el gráfico.** Ya se guarda `fuente` y `ayunas`; un
   punto medido en ayunas y otro por la tarde no son comparables y ahora se
   pintan igual.
4. **Media móvil de 7 días como línea de fondo**, para separar la señal del ruido
   diario sin tener que elegir entre peso crudo y peso de tendencia.
5. **Exportar el registro a CSV.** Hay copia de seguridad en JSON, pero no una
   forma de llevarse los datos a una hoja de cálculo o al médico.
6. **Recordatorio de medición.** La frecuencia de registro es lo que alimenta
   todo lo demás, y hoy depende de acordarse.

---

## Las respuestas de texto del coach llegaban cortadas (W65)

"Rutina sugerida para hoy" terminaba a media palabra, dejando incluso un `**`
sin cerrar que se imprimía crudo: *"**Día del Split B:"*.

### La causa

```js
if (responseSchema) {
  ...
  generationConfig.thinkingConfig = { thinkingBudget: 0 };
}
```

El presupuesto de razonamiento **solo se limitaba cuando había esquema JSON**. En
texto libre no se tocaba nunca — y ese presupuesto sale del **mismo**
`maxOutputTokens`. El modelo se lo gastaba pensando y la respuesta visible
llegaba truncada, por muy alto que se pusiera el tope.

Ahora en texto se pone a 0 (ahí es seguro; en JSON no, porque 2.5-flash devuelve
vacío). Y si aun así se corta, **se dice**: *"La respuesta se cortó por longitud.
Vuelve a pedirla para obtener el resto."* Callar el corte era peor que el corte.

### Y el markdown

- una línea de guiones es un separador, no el texto `--`
- una marca `**` sin cerrar se quita antes de renderizar

El primer intento de esto último —*quitar el `**` del final de la línea*— **rompía
el markdown bien cerrado**: `"**Día:** normal"` quedaba en `"**Día: normal"`. Lo
cazó un test. La regla correcta es contar pares y quitar solo el que sobra.

---

## La cintura no llegaba al gráfico (W66)

El panel de arriba decía **92 cm · −7 cm** y el gráfico, tres centímetros más
abajo, decía **93.5 cm · 0 cm desde el inicio**. Los dos leían el mismo
registro.

### La causa

```js
const peso = ema[d] ?? pesoReal;
if (!(peso > 0)) return;      // ← descarta el día entero
```

`buildRecompositionSeries` **exigía peso** para incluir un día. Y la cintura se
mide suelta, en días en los que no te pesas: esas mediciones nunca entraban en
la serie. La línea que se veía era el último valor arrastrado desde un día que
sí tenía pesada.

Ahora entra cualquier día con **algún** dato — peso, cintura, grasa o músculo — y
el peso solo se dibuja si existe ese día: sin pesada, la línea salta en vez de
inventarse un punto.

### Un fallo que iba a introducir yo

Al incluir días de solo cintura, el **primer punto** de la serie pasó a no tener
peso… y los deltas se calculaban con `points[0]` y `points[último]`. Resultado:
el cambio de peso salía **nulo** aunque hubiera pesadas de sobra.

Lo cazó un test. Ahora cada métrica compara **su** primer valor con **su**
último, ignorando los puntos donde no existe.

Comprobado con las cuatro medidas reales (99 → 95 → 93.5 → 92 en días sin
pesada): el gráfico dibuja la línea y dice −7 cm en "Todo" y −3 cm en 90 días,
que es lo correcto porque esa ventana deja fuera la primera.

## El "Radar Corporal": duplicado y, sobre todo, ilegible (W67)

> *"estos gráficos no los entiendo y no dicen mucho se pueden mejorar o mejor
> eliminar?"*

Salían **dos radares idénticos** seguidos. Ese era el problema visible, pero el
duplicado no era lo peor.

### Por qué no se podía arreglar el radar, solo sustituirlo

Un radar sirve para comparar un perfil contra otro sobre **ejes comparables**.
Estos no lo eran:

- Mezclaba **kg de peso con cm de perímetro** normalizados contra un máximo
  inventado, así que la forma del polígono no medía nada real.
- En **cintura menos es mejor**; en **brazo, más**. El mismo lado de la figura
  juntaba una buena noticia y una mala.
- De 6 ejes solo había datos en 2 (peso y cintura), así que el polígono
  degeneraba en **una raya**.

Un gráfico que no se puede leer mal porque no se puede leer.

### Lo que hay ahora: "Cambios desde la medición anterior"

Responde a la pregunta que el radar fingía responder: **qué cambió y si va en la
dirección buena**. Por cada métrica medida, su último valor, la diferencia, los
días transcurridos y una barra desde el centro, verde si el cambio es el que
buscas y ámbar si no.

Dos decisiones que importan:

1. **Cada métrica se compara con la última vez que la mediste**, no con el día
   anterior del calendario. La báscula da peso y grasa; la cinta métrica, los
   perímetros: son días distintos. Comparar contra "el día previo" habría dejado
   casi todo vacío.
2. **La barra se escala con el cambio relativo (%)**, no con los kg o cm
   sueltos. Si escalara con la magnitud absoluta estaría repitiendo el defecto
   del radar: 0.6 kg y 0.6 cm no son la misma noticia.

La lógica salió del JSX a `buildMetricChanges(metricslog)`, con tests: métricas
medidas en días distintos, dirección buena por métrica, cambio relativo, y
ceros y cadenas vacías que no cuentan como medición.

### El motivo por el que un panel duplicado sobrevivió tanto

**Ninguna escena de captura caía sobre esa zona.** `registro-04-final` va a
scroll 6000, que en esa página es el fondo, y las demás quedaban por encima.
Añadida `registro-09-cambios-medicion`, anclada al título, para que esa franja
deje de ser un punto ciego.

## Los días sin comida registrada valían cero (W68)

> *"los dias que no registre comida, registra un valor promedio de calorias y
> macronutrientes"*

Un día sin anotar no es un día de ayuno: es un día que se olvidó. La app lo
trataba de dos maneras, ambas malas:

- En el **gráfico**, como una barra vacía — un día de 0 kcal que nunca ocurrió.
- En los **promedios**, saltándoselo. "Promedio de la semana" era en realidad el
  promedio de los días que sí anotó, que no es lo mismo.

### La estimación

`buildDailyNutrition(foodlog, {desde, hasta, dias})` devuelve la serie diaria
con los huecos rellenados. Cada día sale marcado con `estimado`, y **nada de
esto se escribe en `foodlog`**: el registro real no se toca.

El relleno usa el promedio de los **14 días registrados más cercanos en el
tiempo**, de cualquiera de los dos lados. No el promedio de todo el historial:
si hace dos meses comías 3200 kcal y ahora 2400, el hueco de esta semana tiene
que parecerse a esta semana. Y mirar solo hacia atrás dejaba sin estimar los
huecos de las primeras semanas de uso, cuando todavía no hay pasado.

Dos frenos para no inventar datos:

- Con **menos de 3 días registrados** no hay promedio que valga: el día se
  queda vacío.
- A **más de 14 días** del registro real más cercano tampoco se estima. Un mes
  sin abrir la app es un mes sin abrir la app, no treinta olvidos.

### Dónde cambia

- **Gráfico nutricional**: el día estimado se pinta translúcido y con el
  contorno punteado, con su entrada en la leyenda y una marca `est.` en el
  detalle diario. Se ve la forma de la semana sin que un promedio pase por
  medido.
- **Calorías Promedio**: ahora dice "6 días reales + 1 estimado".
- **TDEE Real**: el arreglo de fondo. Promediaba **21 días registrados** contra
  un cambio de peso medido sobre el **calendario**: dos ventanas distintas, y
  con olvidos los 21 días podían abarcar cinco semanas. Ahora son 21 días de
  calendario, exigiendo que al menos 12 sean reales — un TDEE calculado sobre
  promedios inventados solo devolvería lo que se le metió.
- **Refeed / diet break**: troceaba los días registrados de 7 en 7, así que una
  "semana" podía abarcar tres semanas reales y "8 semanas en déficit" no
  significaba nada. Ahora son semanas de calendario.
- **Prompts de la IA**: se le dice cuántos días son estimados. Si va a ajustar
  el plan sobre un promedio, tiene que saber que lo es.

El preview ahora deja dos días sin comida a propósito: sin ellos las capturas
nunca enseñarían un día estimado. Escena nueva `registro-10-historial-nutricional`.

## "Rutina del Día" mostraba el análisis de otra sesión (W69)

> *"te pedí la rutina de hoy bíceps y pectoral y me diste el análisis de otro día"*

La captura lo dice todo: cabecera **"RUTINA DEL DÍA · DÍA A (PECHO + BÍCEPS)"**
y debajo una lista de sentadillas, step-ups, face pulls y extensión de
cuádriceps, con secciones **Progresión** y **Reparto muscular** — la estructura
del análisis de entrenamiento, no la de una rutina.

### Qué pasaba

Intercepté la petición real: el prompt que sale al pulsar el botón es correcto
(*"Día del Split A: Pecho + Bíceps… Press banca, Curl martillo…"*). El texto de
la pantalla no venía de esa llamada.

Venía de `localStorage`. La sugerencia se guardaba como **texto pelado**, sin
recordar de qué día del split era ni de qué fecha:

```js
saveKey("last_day_sug", out);          // solo el texto
…
if (savedDaySug) setDaySug(savedDaySug);
…
<AIPanel title={`Rutina del Día · ${dayObj.name}`} text={daySug}/>
```

El título salía del día **activo en ese momento** y el texto, de lo último que
se guardó **alguna vez**. Al recargar, cualquier texto viejo aparecía rotulado
como la rutina del día actual. Y sin fecha, una sugerencia de hace una semana
seguía presentándose como "la rutina de hoy".

### El arreglo

La sugerencia se guarda con su día y su fecha — `{dayKey, dayName, fecha,
texto}` — y:

- El **título sale del día guardado**, no del activo. Es imposible que un texto
  quede rotulado con un día que no es el suyo.
- Solo se pinta **en su propio día del split**. Cambiar de pestaña ya no la
  borra: volver al día la recupera.
- Al cargar se **descarta lo que no sea de hoy**, y también el formato viejo,
  que es exactamente el texto zombi que se estaba viendo.

### De paso, el prompt

Decía *"Planifica las series, pesos de calentamiento y series de trabajo
sugeridas hoy"* y le pasaba el historial. Con eso hay sitio para que el modelo
conteste analizando la sesión pasada. Ahora el sistema dice explícitamente que
planifica HOY y que **no analiza sesiones pasadas**, y recibe la lista numerada
de los ejercicios del día con la instrucción de no añadir ninguno fuera de ella.

### Una prueba que fallaba según el día de la semana

Al ejecutar la batería apareció un fallo en `detectDeloadNeed` que no tenía que
ver con este cambio: su caso "estable" no detectaba ninguna descarga, así que
`weeksSinceDeload` se iba al tope y la urgencia ya salía `high` sin necesidad de
la pérdida de peso. No quedaba margen para comprobar que sube, y el resultado
dependía del día en que se ejecutara. El historial de prueba lleva ahora una
descarga explícita hace 3 semanas: parte de `none` y la comparación significa
algo.

## Caminata en cinta con inclinación (W70)

> *"estoy caminando en inclinación casi día por medio, podríamos agregarlo para
> registro y de qué manera porque también tiene intervalos distintos de
> velocidad e inclinación"*

No había ningún registro de cardio. Tres o cuatro sesiones semanales de caminata
inclinada no entraban en ningún cálculo y la IA no las veía al ajustar los
planes.

### Por qué por bloques y no "40 min de cinta"

Porque lo que decide el coste no es el tiempo ni la distancia: es la
**pendiente**. Media hora a 5 km/h son unas 130 kcal en llano y **más del
doble** al 12%, con la misma distancia y el mismo tiempo. Guardar un promedio
borra justo el dato que importa, y la sesión real cambia de cuesta varias veces.

Cada sesión se guarda como una lista de bloques `{minutos, km/h, %}`.

### El cálculo

Ecuación de marcha del ACSM, que mete la pendiente como término propio en vez de
esconderla en un MET de tabla:

```
VO2 (ml/kg/min) = 0.1·S + 1.8·S·G + 3.5     S en m/min, G pendiente (0–1)
```

con 1 litro de O2 ≈ 5 kcal. De ahí salen kcal, METs, distancia y **desnivel
acumulado** — los metros que subes sin moverte del sitio, que es la medida que
de verdad progresa en caminata inclinada.

Dos honestidades:

- La ecuación vale **caminando**. Por encima de 6.4 km/h la marcha pasa a trote
  y la relación cambia: esos bloques se marcan como fuera de rango en vez de
  devolver un número inventado con cara de exacto.
- Las medias de la sesión se ponderan **por tiempo**. Un minuto al 20% no puede
  pesar lo mismo que veintinueve al 2%; la media simple diría 11% donde la real
  es 2.6%.

### Lo que NO hace: sumarse al TDEE

El TDEE de la app sale de la ingesta frente al cambio de peso real, así que el
gasto de caminar **ya está dentro**. Sumarlo otra vez sería contarlo dos veces e
inflaría el objetivo calórico. A la IA se le pasa el resumen semanal con esa
advertencia explícita, para que lo use en recuperación de piernas y reparto de
carbohidratos, no en el balance calórico.

### Los programas

Tres plantillas cargables de un toque, que rellenan los bloques y desde ahí se
editan:

| Programa | Estructura | Cuándo |
|---|---|---|
| **Base Z2 · 40 min** | 5′ @4.5/2% + 30′ @5.2/9% + 5′ @4/0% | 2-3 por semana |
| **Intervalos de pendiente · 42 min** | 6′ cal. + 8×(2′ @4.8/13% + 2′ @5.2/3%) + 4′ calma | 1 por semana, nunca antes de pierna |
| **Larga suave · 60 min** | 5′ + 50′ @5.5/6% + 5′ | Día sin pesas |

La progresión sube **antes la pendiente que la velocidad**: el coste crece mucho
más rápido y el impacto articular sigue siendo el de caminar, que es la razón de
elegir cinta inclinada en vez de correr.

## Sesión guiada: la app dice cómo configurar la cinta (W71)

> *"la idea es que al elegir qué modo me vayas avisando por la aplicación cómo
> ir configurando la cinta"*

Cargar un programa dejaba una lista de bloques, pero caminando en la cinta esa
lista no sirve: hay que saber **qué tocar y cuándo**, sin ponerse a leer.

Al elegir un programa ahora hay **▶ Empezar guiado**, que abre una pantalla a
pantalla completa con la pendiente y la velocidad **en grande**, la cuenta atrás
del bloque y lo que viene después. Todo lo demás es secundario y va pequeño.

### Los avisos

- A **15 segundos** del cambio, la pantalla se pone ámbar y anuncia el valor
  siguiente: *"En 15 s cambia → 9% · 5.2 km/h"*. Da tiempo a llegar a los
  botones.
- Cuenta atrás con pitidos en los últimos 3 segundos y un tono largo justo en
  el cambio, más vibración. El pitido se sintetiza con WebAudio: no hace falta
  ningún archivo y funciona sin conexión.
- En el **último bloque no avisa**. Decir "prepárate" sin poder decir a qué es
  peor que no decir nada.

### Tres detalles que vienen de que el móvil está apoyado en la cinta

1. **El tiempo se calcula desde una marca de reloj**, no acumulando en un
   intervalo. El navegador ralentiza los temporizadores cuando la pestaña pierde
   el foco, y una cuenta acumulada se retrasaría minutos a lo largo de la
   sesión.
2. **Wake lock**: la pantalla no se apaga a mitad de bloque, y se vuelve a pedir
   al regresar a la app.
3. **Los cambios suenan y vibran**, porque nadie va a estar mirando en el
   segundo exacto en que toca subir la cuesta.

### Al terminar se guarda lo que se hizo, no el plan

Si te bajas a los 20 minutos de un programa de 40, `trimBlocksTo` recorta los
bloques a lo realmente completado y eso es lo que se registra. Guardar el plan
entero convertiría el registro en una lista de intenciones.

También hay **Pausa** (que descuenta el tiempo parado) y **Saltar bloque**, que
adelanta el reloj hasta el inicio del siguiente en vez de llevar un contador
aparte: así el tiempo sigue saliendo de una sola fuente y no puede
descuadrarse.

## Para qué sirve cada ejercicio, no solo a qué músculo va (W72)

> *"revisa esa página, y saca ideas para recomendar los ejercicios"*
> (enlace a @emgfitnesslab)

**No pude leer la página.** El proxy de red de este entorno bloquea tanto
`instagram.com` como `emgfitnesslab.com`. Lo que sigue sale del concepto que sí
se puede confirmar desde buscadores —una biblioteca de ejercicios ordenada por
activación muscular medida con EMG, centrada en el montaje, las claves y los
errores que maximizan esa activación— **no de haber visto sus contenidos**. Las
claves de ejecución de abajo son mecánica de cada movimiento, no cifras suyas.

### El hueco que tenía el recomendador

`recommendDayExercises` puntuaba solo por **historial**: progresión, número de
sesiones, días sin hacerlo, si es compuesto. Con eso sabe cuál está funcionando,
pero no **para qué sirve**, y dos ejercicios del mismo grupo pueden ser estímulos
completamente distintos. La consecuencia práctica: la "variante" propuesta era
simplemente *el siguiente de la lista*, así que podía ofrecer cambiar un
ejercicio contraído por otro contraído — mismo estímulo, otro nombre.

### Perfil de resistencia

Lo que separa un ejercicio de otro dentro del mismo músculo es **dónde carga**:

- **estirado** → tensión máxima con el músculo alargado. El que más cuesta y el
  que más se salta la gente.
- **medio** → carga repartida por todo el recorrido. Los básicos pesados.
- **contraído** → tensión máxima en el acortamiento.

Es mecánica observable del movimiento: no hace falta inventar ningún índice
numérico, que además sería justo la falsa precisión que este proyecto lleva
semanas quitando.

Cada entrada trae también las **claves** que deciden si el músculo objetivo se
lleva el trabajo y el **error típico** que se lo pasa a otro sitio.

### Qué cambia

- La **variante** ya no es la siguiente de la lista: es la que aporta un perfil
  que ningún titular cubre, y el motivo lo dice — *"estancado: conviene rotarlo
  · carga en estiramiento, que hoy no cubre ningún otro"*. El motivo original se
  conserva: saber que está estancado sigue siendo la razón de que no sea
  titular.
- **"Cómo carga el día"**: el reparto por perfil de los ejercicios elegidos, con
  aviso si ninguno carga el músculo estirado. Los porcentajes por músculo pueden
  salir perfectos y aun así faltar ese estímulo; el recuento por grupo no lo ve.
- Cada ejercicio marcado muestra su clave de ejecución y su error típico.
- La IA recibe el perfil de cada ejercicio al generar la rutina.

### Un fallo que encontraron los tests

La regla genérica `/curl/` (bíceps) casaba con **"Leg curl"**, así que un curl
femoral salía clasificado como bíceps. El orden de las expresiones importa y la
regla de isquios estaba por debajo. Movida arriba, con el aviso escrito al lado
para que no vuelva a colarse.

## Macros del día: biometría medida, carga real y actividad observada (W73)

> *"revisa bien el cálculo de macros del día, según mis medidas biométricas que
> agrego, según cuánto entrené ese día, según el nivel de actividad"*

Tres huecos, uno por cada cosa que pedía.

### 1. La biometría se usaba a medias

`calcLeanMass` deducía la masa magra de `peso × (1 − %grasa)`. Está bien con solo
una báscula, pero el InBody **mide** el peso sin grasa, y ese valor es el que
debe entrar en Katch-McArdle: es una medición, no una resta. No es cosmético —
1 kg de masa magra son ~22 kcal/día de BMR, y las dos cifras se separan
fácilmente 1-2 kg.

Ahora manda la medida, con un filtro de plausibilidad (entre el 40% y el 98% del
peso) para que un dato mal leído del informe no llegue al BMR. El BMR que trae
el propio informe se arrastra aparte **para contrastar**, no para calcular: cada
aparato usa su fórmula y no se sabe cuál, pero una diferencia grande avisa de
que alguna entrada está mal.

### 2. El día solo sabía si entrenaste, no cuánto

`classifyFuelDay(entrenó, etiqueta del split)`: un sí/no y una etiqueta fija. Con
eso, una sesión de 20 minutos y una pierna de 90 con hora de cinta después
recibían **exactamente los mismos carbohidratos**. Y la caminata inclinada no
existía para la nutrición.

`calcDayActivityLoad` estima el gasto real del día por encima del reposo sumando
lo registrado:

- **Fuerza**: MET 5 por los minutos de sesión (o 3 min por serie si no anotaste
  duración).
- **Cardio**: las kcal del ACSM de la caminata.
- **Pasos**: NEAT.

Dos restas que evitan contar de más: al MET se le quita 1 y a las kcal del ACSM
se les descuenta el basal de esos minutos, porque **ambos incluyen el reposo** y
ya está contado en el BMR. Y a los pasos se les descuenta lo que aporta el
cardio, porque el móvil cuenta los pasos de la cinta y sumar ambos sería contar
la caminata dos veces.

### 3. El reparto, sin mover la media semanal

El día recibe `factor = carga de hoy ÷ media de sus últimos 14 días`. 1.0 es un
día normal suyo. Proteína y grasa no se tocan: el vaivén lo absorben los
carbohidratos.

**La propiedad que hay que conservar** es que la media semanal no cambie: si los
días duros suben sin que bajen los flojos, el déficit se deshace solo y nadie se
entera. Dividir por la media propia lo garantiza.

Dos fallos que aparecieron al implementarlo, ambos cazados por los tests:

- El **recorte** a [0.6, 1.5] rompía la neutralidad: en una semana desigual se
  recortan hacia arriba muchos días flojos y hacia abajo pocos duros, y la suma
  se iba un **3% por encima**. Poco para notarlo, suficiente para deshacer parte
  del déficit en silencio — justo el fallo que el recorte pretendía evitar.
- Reescalar de una pasada tenía su propio problema: con un día cuatro veces la
  media, la reescala multiplicaba el 1.5 ya recortado y lo devolvía a 2.06, por
  encima del tope. Ahora se alterna recorte y reescala hasta estabilizar, que
  resuelve el caso subiendo los días flojos en vez de saltarse el tope. Si aun
  así quedara desviación, se devuelve en `desviacionSemanal` en vez de
  esconderse.

### Y se ve de dónde sale

Bajo el anillo de macros: *"Carbo bajo −106 g · Hoy 210 kcal de actividad frente
a 399 de media · 6000 pasos"*. Un número que cambia solo y sin explicación
convierte el cálculo en un oráculo.

`calcObservedActivityFactor` deduce además el multiplicador de actividad que
implican los datos reales, para contrastarlo con el escrito en el perfil: quien
marcó "Ligero" (1.375) pero entrena cuatro días y camina en cuesta tres tiene un
TDEE estimado corto y un déficit real mayor del que cree.

## El selector de actividad no hacía nada, y el TDEE medido mentía (W74)

> *"ahí no hay cambios, se cambió el nivel de ejercicios. Aunque eso deberías
> saberlo tú según lo que te cargo de entrenamiento"*

Cinco capturas cambiando el nivel de actividad: Sedentario, Ligero y Moderado
dan **exactamente el mismo objetivo** (1863 kcal). Activo salta a 2333 y Muy
activo a 2658.

### Por qué tres botones no hacían nada

El TDEE medido tapaba la estimación. La regla era usar el medido salvo que se
desviara más de un 35% del estimado:

| Nivel | Estimado | Desvío vs medido (1873) | Manda |
|---|---|---|---|
| Sedentario | 2232 | 16% | medido |
| Ligero | 2558 | 27% | medido |
| Moderado | 2697 | 31% | medido |
| Activo | 2883 | **35.03%** | estimado |
| Muy activo | 3209 | 42% | estimado |

Funcionaba según lo escrito, pero desde fuera son tres botones muertos y luego
un salto de 1000 kcal al cruzar un umbral invisible. Ahora se dice en la propia
pantalla: *"esta opción no cambia tus calorías: se está usando tu TDEE medido"*.

### El fallo de verdad estaba debajo

**TDEE medido de 1873 kcal con un BMR de 1860.** Eso es un factor de actividad
de **1.007**: el gasto de alguien en cama. Imposible entrenando cuatro días por
semana y caminando en cuesta en días alternos.

El TDEE medido sale de la comida registrada frente al cambio de peso, y cuando
el registro falla el error va **siempre en la misma dirección**: lo que no se
anota no existe, el TDEE sale bajo, el objetivo sale bajo. La app fijaba **1863
kcal** para un hombre de 92 kg… y tres centímetros más abajo avisaba de
**pérdida de fuerza en cinco ejercicios**. Estaba diagnosticando el daño que
causaba su propio número.

Ahora el TDEE medido tiene un **suelo fisiológico**: ni por debajo de 1.2 × BMR,
ni por debajo del basal más la actividad que sí está registrada. Cuando toca ese
suelo se dice, y se nombra la causa probable —comida sin anotar— porque eso
tiene arreglo.

### Y el nivel de actividad se deduce

Tenía razón: elegirlo a mano es adivinar. `calcObservedActivityFactor` ya existía
desde W73 pero no se usaba. Ahora hay un modo **Automático**, por defecto, que
lo deduce de los entrenos, la cinta y los pasos registrados, y enseña la cuenta:
*"×1.31 · deducido de lo que registras: 399 kcal/día de actividad de media en
tus últimos 14 días"*. Los cinco botones siguen ahí como anulación manual.

## Auditoría: de dónde sale cada número (W75)

> *"primero que todos los cálculos que has implementado tengan respaldo
> científico"*

Repasadas todas las constantes y fórmulas que deciden calorías, macros y gasto.
El resultado está escrito en el propio `app.js`, en un bloque que las clasifica
en tres categorías **a propósito**, porque mezclarlas es lo que convierte una app
en un oráculo:

- **[FÓRMULA]** — ecuación publicada y validada, usada tal cual.
- **[REFERENCIA]** — cifra tomada de una recomendación o tabla estándar.
- **[CONVENIO]** — decisión de diseño nuestra, sin respaldo experimental. No
  puede presentarse como si lo tuviera.

### Lo que estaba bien

| Cálculo | Respaldo |
|---|---|
| BMR Katch-McArdle | `370 + 21.6 × masa magra` |
| BMR Mifflin-St Jeor | Mifflin et al., Am J Clin Nutr 1990 |
| Marcha en cinta | Ecuación del ACSM: `0.1·S + 1.8·S·G + 3.5` |
| 1 L de O₂ ≈ 5 kcal · 1 MET = 3.5 ml/kg/min | Equivalencias estándar |
| Proteína 2.2–2.6 g/kg magra | Helms et al., IJSNEM 2014 (2.3–3.1 en déficit) |
| Fibra 14 g/1000 kcal | Institute of Medicine |
| 1RM estimado | Epley |
| Suelo del TDEE medido | Método de Goldberg (1991; Black 2000) |

Del suelo del TDEE conviene destacar algo: la literatura actual insiste en que el
nivel de actividad con el que se compara **debe reflejar al sujeto** y no un 1.55
fijo. Eso es exactamente lo que hace el factor deducido de W74, así que el diseño
quedó más alineado con la guía vigente de lo que yo mismo pretendía.

### Lo que corregí

**MET del entrenamiento de fuerza.** Había un `5.0` puesto a ojo. El Compendium
of Physical Activities da **dos** anclajes, no uno: 3.5 MET para esfuerzo
ligero-moderado y 6.0 para vigoroso. Un 5.0 no es ninguno de los dos. Ahora se
interpola entre ambos según la fracción de series llevadas a **RIR ≤ 2**, dato
que ya se registraba y no se usaba para nada. El Compendium no interpola —eso es
convenio nuestro— pero el resultado se queda siempre **dentro** de sus dos
valores publicados, y ahora un día suave y uno al fallo dejan de costar lo mismo.

**Coste de los pasos.** Había una constante de `0.00038 kcal por paso y kg`,
deducida a mano de "0.5 kcal/kg por km y 1300 pasos/km": dos cifras redondeadas
de memoria para llegar a un número que **ya se podía calcular**. La ecuación del
ACSM da el coste de caminar en llano, así que ahora los pasos se convierten a
distancia y se pasan por ella. Desaparece la constante inventada y queda **una
sola fuente** para todo lo que sea caminar: la cinta y los pasos cuestan lo
mismo por kilómetro.

### Lo que marqué como convenio, no como ciencia

- **7700 kcal/kg** (regla de Wishnofsky). Es la referencia clásica, pero se sabe
  que **sobreestima la pérdida a largo plazo** porque el gasto baja al adelgazar
  (Hall, Int J Obes 2008). Se usa solo para fijar el déficit diario, no para
  prometer resultados.
- **Partición de Forbes**: la relación es real, pero la forma lineal concreta
  (`0.55 + 0.012 × %grasa`) es una aproximación nuestra, no su ecuación.
- **EMA α = 0.25**, ventana de 14 días, recorte del factor de carbos a
  [0.6, 1.5], umbral del 35% para preferir el TDEE medido. Ninguno tiene
  respaldo experimental: existen para que los números no den saltos absurdos.
- **3 min por serie** cuando no hay duración registrada.

### Una consecuencia práctica

El ACSM no vale para bajadas, así que la pendiente negativa se ignora en vez de
restar calorías. Hay un test que lo fija.

## "No puedo hacerlo hoy": sustituir sin perder el estímulo (W76)

> *"12 me gusta mucho"* — máquina ocupada, viaje, gimnasio del hotel.

Lo que se hace en esa situación es saltarse el ejercicio, o cambiarlo por "otro
de pecho". Y ahí se pierde justo lo que el ejercicio aportaba: un press
inclinado no se sustituye por unas aperturas solo porque los dos sean de pecho.
Uno carga en todo el recorrido y el otro en estiramiento.

Con el perfil de resistencia de W72 y la porción muscular ya se podía hacer
bien, y solo faltaba una pieza: **qué material tienes delante**.

### Cómo elige

Cada candidato se puntúa por lo que **conserva** del original:

- **misma porción muscular** (Pectoral medio, Dorsal ancho, Deltoides
  posterior…), no el grupo entero;
- **mismo perfil de resistencia** — si el original cargaba en estiramiento, el
  sustituto también;
- mismo carácter compuesto o de aislamiento.

Cambiar de perfil no descalifica, pero **se dice**: *"ojo: carga en contracción,
no en estiramiento"*. Es otro estímulo, y ocultarlo sería el error original con
otra cara. Los que conservan porción **y** perfil se marcan como
**mismo estímulo**.

Nunca cruza de grupo muscular: si no hay nada del mismo grupo con ese material,
se dice que no hay, en vez de ofrecer cualquier cosa.

### El material

`inferEquipo` deduce del nombre si es barra, mancuerna, polea, máquina,
multipower, banda o peso corporal — con lo específico por delante, porque
"Sentadilla ciclista Smith" es multipower y no barra, y "Dominadas / Jalón" es
polea aunque lleve barra.

Cuatro entornos: **gimnasio completo**, **hotel / básico**, **solo mancuernas** y
**casa sin material**. Este último obligó a añadir un catálogo de alternativas
—flexiones con pies elevados, sentadilla a una pierna, curl femoral nórdico,
remo invertido bajo mesa, trabajo con banda— porque el catálogo por defecto no
tenía nada que ofrecer justo cuando más falta hace.

### Al elegir

El sustituto entra **en el sitio exacto** del original dentro del día. No se toca
`exlog`: el historial de ambos se conserva, así que volver a poner el original
mañana recupera sus marcas. Se queda en el día hasta que se quite a mano, con
"Quitar de este día", que ya existía.

### Un fallo de mi propio andamiaje

La primera versión no abría nada: la condición del menú (`!isEditing &&
!isMerging`) seguía siendo cierta con el nuevo estado activo, así que la pantalla
de sustitutos nunca llegaba a evaluarse. Lo vi en el navegador, no en los tests
—la lógica pura estaba bien— que es exactamente para lo que sirve abrir la app
de verdad antes de dar algo por hecho.

# ═══════════════════════════════════════════════════════════════
# CATÁLOGO DE IDEAS (agosto 2026)
# ═══════════════════════════════════════════════════════════════

Todas las ideas propuestas hasta ahora, juntas. Cada una lleva **qué dato ya
existe** para alimentarla: eso es lo que separa una idea implementable de una
lista de deseos.

## A · Datos de entrada — el eslabón que envenena todo lo demás

El TDEE medido salió 1873 kcal con un basal de 1860. Todo lo que se calcula
encima de la comida registrada arrastra ese error, así que esto va primero.

**1. Comida rápida: tus 15-20 platos habituales a un toque.**
Hoy hay que describir cada comida. Un plato guardado con sus macros, repetible
con "lo mismo que ayer" o "×1.5", haría más por la precisión que cualquier
fórmula que yo afine. → *Datos: `foodlog` completo, ya se puede extraer lo que
más se repite.*

**2. Aviso de infrarregistro en el momento.**
Si las kcal anotadas implican un gasto imposible para tu peso y actividad,
decirlo ese día, no dejar que envenene el objetivo en silencio. → *Ya existe el
suelo de Goldberg en W74; falta llevarlo al momento de registrar.*

**16. Dónde se te escapa el registro.**
El infrarregistro nunca es uniforme: vive en fines de semana, cenas fuera y
picoteo. Comparando kcal por día de la semana sale solo: *"los sábados
registras un 40% menos que los martes"*. Accionable y solo posible con tus
datos. → *Datos: `foodlog` con fechas.*

**14. Modo sesión en vivo.**
Cronómetro de descanso que arranca al guardar una serie, peso y reps
precargados, botones grandes, avance automático por el orden del día. Además de
la comodidad, genera **descansos reales** (idea 13) y **duración real** — que hoy
casi nunca se registra, y por eso la estimación de gasto cae al supuesto de 3
min/serie. → *Datos: el registro de series ya existe; falta la pantalla.*

## B · Entrenamiento

**13. Descansos entre series, gratis.**
Cada serie ya se guarda con su hora exacta: restando entre series consecutivas
salen los descansos sin anotar nada. Es la variable que más explica un día raro
y que nadie mide — *"hoy descansaste 4:10 frente a tus 2:30 habituales, por eso
subiste 5 kg"*. Hoy eso se interpreta como progreso o estancamiento. → *Datos:
`date` por serie. Requiere registrar durante la sesión, de ahí la idea 14.*

**9. Autorregulación diaria por rendimiento.**
Si la primera serie sale un 10% por debajo de lo previsto, reajustar la sesión
en el momento —bajar volumen, no carga— en vez de descubrir al final que fue un
mal día. → *Datos: RIR, PRs, readiness, todo ya registrado.*

**10. Mesociclos con descarga programada.**
Hoy cada sesión se decide sola. Un bloque de 4-6 semanas con progresión de
volumen y descarga planificada da un plan que cumplir, y contexto a las alertas:
estancarse en semana 5 es normal, en semana 1 no. → *Datos: `calcWeeklyTrainingLoad`
y `detectDeloadNeed` ya existen, les falta el plan contra el que comparar.*

**17. Molestias ligadas a ejercicios concretos.**
Cruzar las notas de sensaciones con lo entrenado 24-72 h antes encuentra
patrones invisibles a ojo: *"molestia de hombro tres de las cuatro veces que
hiciste press militar, siempre al día siguiente"*. Conecta con W76: identificado
el culpable, ya sabe proponer el cambio que conserva el estímulo. → *Datos:
`notes` con fecha + `exlog`.*

**12. Sustituir un ejercicio que hoy no puedes hacer.** ✅ **Hecho en W76.**

## C · Cuerpo y composición

**3. Panel segmental del InBody.**
Ya se guardan grasa y músculo por brazo y pierna, pero solo se usan en un texto
para la IA. Con eso se detectan asimetrías reales y se cruzan con los ejercicios
unilaterales que ya registras. → *Datos: `musculoBrazoIzq`, `grasaPiernaDer`…
guardados y sin usar.*

**5. Marcar en el gráfico las mediciones en ayunas.**
El campo `ayunas` ya se guarda. Una pesada post-comida mete ruido que la EMA
arrastra durante días, y ahora mismo se ve igual que una buena. → *Datos: campo
`ayunas` y `fuente`, ya registrados.*

**11. Fotos de progreso con comparación estable.**
Se guarda el análisis de las fotos pero no las fotos alineadas en el tiempo. Un
antes/después con la misma pose es la métrica que más motiva y la única que capta
lo que la báscula esconde — sobre todo en recomposición, donde el peso no se
mueve.

## D · Que la app aprenda

**8. Cerrar el bucle: contrastar predicción con realidad.**
Cada semana la app predice un cambio de peso. Guardarla y compararla con el real
la convierte en algo que aprende: si predice −0.5 y ocurre −0.1 de forma
sistemática, tu TDEE real está por encima del calculado y debe corregirse solo.
Es la diferencia entre una calculadora y un entrenador. → *Datos: proyección y
peso real, ambos ya existen; falta guardar la predicción.*

**7. Gemelo digital: simular antes de decidir.**
*"¿Qué pasa si subo a 2600 kcal y añado una caminata?"* respondido con tres
curvas a 12 semanas antes de cambiar nada. Hoy la proyección solo extrapola lo
que ya haces. → *Datos: BMR, partición de Forbes y carga real, todo implementado.*

**18. "¿Por qué este número?" en toda la app.**
Tras la auditoría de W75 cada cálculo tiene su fuente en el código, pero el
usuario no la ve. Un toque en cualquier cifra que despliegue la cuenta con sus
datos dentro y la etiqueta de fórmula / referencia / convenio. Efecto
secundario: cuando un número esté mal, lo verá él antes que yo.

## E · Nutrición

**15. Qué pasa al llegar a 85 kg.**
La meta está puesta y la app lleva hasta ahí… y luego nada. Es donde casi todo
el mundo recupera el peso. Un plan de salida —subida escalonada de ~100 kcal por
semana vigilando peso y cintura— convierte el objetivo en una transición en vez
de un acantilado. → *Datos: TDEE medido, tendencia suavizada y cintura.*

**4. Ligar la caminata a la recuperación de piernas.**
Una hora de cinta al 13% el día antes de sentadilla explica una bajada de peso
que hoy se interpreta como pérdida de fuerza. → *Datos: `cardiolog` (W70) y
`exlog`, listos para cruzar.*

## F · Tus datos, fuera de aquí

**6. Exportar a CSV.**
Todo tu historial en un archivo, sin depender de que esta app siga en pie.

## Orden recomendado

1. **14** — arregla la calidad de los datos de entrenamiento y desbloquea la 13.
2. **16** y **2** — el registro de comida sigue envenenando todo lo demás.
3. **15** — antes de necesitarlo, no cuando ya estés en 85 kg.
4. **8** — a partir de aquí la app deja de repetir sus errores.

## Calidad del registro de comida: ideas 1, 2 y 16 (W77)

El TDEE medido salía 1873 kcal con un basal de 1860. Todo lo que la app calcula
—objetivo, macros del día, planes de la IA— se apoya en la comida registrada, así
que este era el arreglo con más efecto en cadena. Tres piezas.

### 1 · "Lo de siempre"

Describir cada comida con texto libre y esperar a que la IA la interprete cuesta
trabajo y necesita conexión: por eso se dejan días sin anotar. Pero la comida
real se repite, así que **lo ya registrado es el mejor catálogo posible**.

`topFrequentMeals` agrupa por nombre —ignorando acentos y mayúsculas, quedándose
con la grafía más reciente— y **promedia los macros de todas las veces**: la
misma comida se anotó con cifras algo distintas cada vez, y el promedio propio
es mejor estimación que la última suelta. Con una sola aparición no entra: eso no
es un hábito.

En Hoy salen como fichas con multiplicador ×½ / ×1 / ×1½. Entran **sin llamar a
ningún servicio**, así que funcionan sin cobertura.

### 2 · ¿Falta comida por registrar?

Versión aplicada del método de Goldberg: si la ingesta declarada dividida por el
basal cae por debajo del nivel de actividad plausible, lo que falla es el
registro, no el metabolismo. Se compara contra el factor de actividad **deducido
de sus propios entrenos y pasos**, que es lo que la literatura pide desde que se
sabe que un 1.55 fijo no sirve.

Se mira sobre una ventana de 14 días, nunca sobre un día suelto: un día bajo es
normal y avisar por eso sería ruido.

El mensaje evita el reproche y nombra la consecuencia: *"no significa que comas
de menos, significa que faltan por anotar unas N kcal al día; mientras siga así,
tu TDEE y tus objetivos salen bajos"*.

### 16 · Dónde se escapa

Saber que faltan calorías no sirve de nada. Saber que faltan **los sábados**, sí.

`analyzeLoggingBias` compara la media de cada día de la semana con la media
general sobre 8 semanas, exigiendo al menos 3 repeticiones antes de afirmar
nada: con dos sábados no hay patrón, hay dos sábados. Detecta también los días
que directamente **nunca se anotan**. Se pinta como siete barras, ámbar las que
se salen.

El preview siembra ahora sábados con solo el desayuno registrado —el patrón real
de infrarregistro— porque sin él las capturas no cubrían este panel.

## Equilibrio entre lados y exportación: ideas 3 y 6 (W78)

### 3 · El segmental estaba muerto

El informe corporal da músculo y grasa por tronco, brazos y piernas. Todo eso se
guardaba… para acabar en una frase del prompt de la IA. Es justo la medición que
puede señalar un desequilibrio real, y no se veía en ninguna pantalla.

**La diferencia va en porcentaje, no en kilos.** 300 g en un brazo y 300 g en una
pierna no son el mismo problema: lo primero es un 8%, lo segundo un 3%.

Los umbrales son **convenio, no ciencia**, y así está escrito: la bioimpedancia
segmental tiene un error propio de varios puntos, así que por debajo del 3% no
se afirma nada y entre 3 y 5% se llama "leve". Marcar como asimetría lo que puede
ser ruido del aparato sería inventar un problema.

Dos matices que evitan consejos absurdos:

- La asimetría de **grasa** se informa pero no se marca como accionable: no se
  corrige con ejercicio.
- El aviso viene con **qué hacer**: los ejercicios unilaterales del grupo
  correcto que ya están en su catálogo, con la instrucción de empezar por el lado
  flojo. Sin eso el dato se queda en "tienes un brazo más grande".

### 6 · Exportar a CSV

El respaldo JSON ya existía, pero un JSON no se abre en una hoja de cálculo ni se
le hace un gráfico. Para que los datos sean de verdad del usuario tienen que
salir en un formato que cualquiera pueda leer.

Cuatro archivos, uno por registro —comidas, entrenamiento, mediciones,
caminatas— en vez de uno mezclado: no comparten columnas y juntarlos obligaría a
limpiarlo antes de poder usarlo. El de entrenamiento incluye el volumen por
serie ya calculado.

Dos detalles que deciden si el archivo sirve o no:

- **Escapado**: un plato llamado `Pollo, arroz y "salsa"` rompe la fila entera y
  desplaza todas las columnas si no se entrecomilla.
- **BOM al principio**: sin él Excel abre el archivo en Latin-1 y destroza los
  acentos de "Plátano" y "Sentadilla búlgara".

### Un fallo con acentos, otra vez

`unilateralesPara` buscaba `/bulgara/` contra el nombre sin normalizar, así que
"Sentadilla búlgara" —el ejercicio unilateral más usado del catálogo— se quedaba
fuera precisamente de la función que sirve para corregir asimetrías de pierna.
