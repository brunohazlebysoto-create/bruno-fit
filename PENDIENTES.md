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
