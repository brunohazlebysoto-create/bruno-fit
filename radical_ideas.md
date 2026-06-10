# 🚀 20 Ideas de Mejora — BrunoFit: Auto-Reconfiguración por IA

> Enfoque: cuando el usuario agrega datos (nutrición, entrenamiento, objetivos), la IA analiza y **reconfigura automáticamente** toda la app.

---

## 🧠 CATEGORÍA 1 — Recalibración Nutricional Automática

### 1. 🔄 Ajuste de Macros por Peso Semanal
**Trigger:** Usuario registra nuevo peso
**Acción IA:** Compara la tendencia de las últimas 2 semanas (subió, bajó, se estancó). Si el peso no se mueve hacia el objetivo, recalcula automáticamente kcal ±150 y ajusta el preset activo. Notificación: *"Tu peso lleva 10 días estancado. Ajusté tus calorías a 2050 kcal."*

---

### 2. 🍽️ Redistribución de Macros por Patrón de Comida
**Trigger:** El usuario registra alimentos durante 5+ días
**Acción IA:** Detecta si consistentemente falla proteína pero cumple carbohidratos. Propone redistribución para alcanzar los mismos kcal de forma más realista para ese patrón de vida.

---

### 3. 📅 Plan de Comidas Adaptado al Entreno del Día
**Trigger:** El usuario registra un entreno en la app
**Acción IA:** Si fue día de piernas (gasto alto), genera plan con +300 kcal y más carbohidratos. Si fue descanso, baja a mantenimiento bajo. El plan de comidas en tab Plan se actualiza automáticamente.

---

### 4. 🛒 Lista de Compras por Déficit de Macros
**Trigger:** El foodlog muestra 3+ días con déficit de proteína
**Acción IA:** Genera lista de compras enfocada en fuentes de proteína baratas (pollo, huevo, queso cottage, atún) y la actualiza en tab Plan automáticamente.

---

### 5. 💊 Ajuste de Suplementos por Rendimiento
**Trigger:** El usuario no llega a su objetivo de proteína diaria
**Acción IA:** Evalúa si los suplementos actuales son suficientes y recomienda ajustar tiempos de toma. Coach: *"Tomaste tu Whey antes del gym pero no llegaste a 180g. Añade una toma extra post-cena."*

---

## 💪 CATEGORÍA 2 — Recalibración por Datos de Entrenamiento

### 6. 📈 Detección de Plateau y Cambio de Rutina
**Trigger:** El mismo peso en el mismo ejercicio por 3 semanas
**Acción IA:** Detecta el plateau, propone variación (agarre, reps, tempo, ejercicio alternativo) y actualiza directamente el split activo con la variación sugerida.

---

### 7. ⚡ Recalibración de Volumen por Recuperación
**Trigger:** El usuario registra sesiones en días consecutivos o notas de fatiga
**Acción IA:** Si detecta acumulación de fatiga, propone un "deload" de 3 días (60% del volumen). Modifica el split temporalmente: *"Tu recuperación está comprometida. Programé un mini-deload esta semana."*

---

### 8. 🎯 Progressive Overload Automático
**Trigger:** El usuario completa un ejercicio con el máximo de reps programado
**Acción IA:** Sube automáticamente el peso sugerido para la próxima sesión (+2.5 kg compuestos, +1 kg aislamiento). El próximo log ya muestra el peso actualizado pre-cargado.

---

### 9. 📊 Análisis de Desequilibrios Musculares
**Trigger:** 4+ semanas de logs de entrenamiento acumulados
**Acción IA:** Analiza si hay desbalance (más empuje que jalón, más cuádriceps que isquiotibiales). Reorganiza el split para corregir y genera un reporte visual en tab Registro.

---

### 10. 🏆 Smart Goals — Objetivos Adaptativos
**Trigger:** El usuario alcanza un PR o completa un objetivo
**Acción IA:** Genera automáticamente el siguiente objetivo escalonado con un plan de 4 semanas. Si levantó 100 kg en press, el nuevo target se fija en 105 kg y aparece visible en el Dashboard (tab Hoy).

---

## 🎯 CATEGORÍA 3 — Recalibración por Cambio de Objetivos

### 11. 🔁 Modo "Cambio de Fase" Automático
**Trigger:** El usuario escribe *"Quiero empezar a definir"* o *"Quiero volumen"*
**Acción IA:** Reconfigura TODO: preset de calorías, macros, split de entrenamiento, lista de compras. Un único mensaje cambia toda la app en segundos.

---

### 12. 📉 Recálculo de TDEE Real por Datos Históricos
**Trigger:** 3 semanas de datos completos (foodlog + peso diario)
**Acción IA:** Calcula el TDEE real del usuario (no tablas genéricas) basándose en la relación entre calorías consumidas y cambio de peso real. Actualiza el preset: *"Tu metabolismo real es ~2,650 kcal. Ajusté tu objetivo."*

---

### 13. 🗓️ Planificación por Evento (Vacaciones, Foto, Competencia)
**Trigger:** El usuario menciona un evento futuro en el Coach
**Acción IA:** Crea una cuenta regresiva y un plan por fases (ej: 8 semanas antes = 4 déficit moderado + 4 peak week). Banner de progreso hacia el evento y macros que se ajustan semana por semana.

---

### 14. 🌡️ Detección de Sobreentrenamiento por Bienestar
**Trigger:** El usuario registra notas de "cansancio", "dolor", "mal dormir"
**Acción IA:** Analiza el texto libre de las notas. Si detecta señales de sobreentrenamiento, activa semana de recuperación: reduce volumen y sube calorías a mantenimiento temporalmente.

---

## 🔮 CATEGORÍA 4 — Inteligencia Predictiva y Proactiva

### 15. 🔮 Proyección de Composición Corporal a 12 Semanas
**Trigger:** El usuario actualiza peso y porcentaje de grasa
**Acción IA:** Proyecta cómo estará el usuario en 4, 8 y 12 semanas siguiendo el plan actual. Gráfica en tab Registro: *"Si mantienes este ritmo, estarás en 19% BF en agosto."*

---

### 16. ⏰ Coach Proactivo — Mensajes con Contexto de Hora
**Trigger:** No se ha registrado comida a las 12pm o no ha entrenado en día programado
**Acción IA:** El Coach envía mensaje con contexto: *"Hoy toca Piernas y llevas solo 600 kcal registradas. Asegúrate de comer bien antes del entreno."*

---

### 17. 📸 Análisis Visual de Alimentos (Foto → Macros)
**Trigger:** El usuario sube foto de su plato o un menú de restaurante
**Acción IA:** Estima calorías y macros de la foto, pide confirmación y lo registra directamente en el foodlog del día. Con el tiempo aprende las porciones típicas del usuario.

---

### 18. 🧪 "Experimento de la Semana" — Protocolo A/B Personal
**Trigger:** El usuario lleva 4+ semanas sin progreso en un objetivo
**Acción IA:** Propone cambiar UNA variable de forma controlada por 2 semanas (ej: ayuno intermitente, más carbos post-entreno). Al final, analiza y presenta resultados comparativos antes vs después.

---

### 19. 🔗 Correlaciones Ocultas — Insights Automáticos Semanales
**Trigger:** Análisis automático cada domingo con los datos de la semana
**Acción IA:** Busca correlaciones en los datos: *"Los días que duermes menos de 7h, consumes 22% más calorías."* o *"Tus mejores entrenamientos ocurren cuando comes +200g de carbos el día anterior."* Aparece como "Insight de la Semana" en tab Hoy.

---

### 20. 🎮 Desafíos Adaptativos — Gamificación IA
**Trigger:** El usuario completa o falla un desafío semanal
**Acción IA:** Genera desafíos personalizados basados en puntos débiles históricos. Si siempre falla proteína los fines de semana: *"Llega a 160g de proteína el sábado y domingo."* Cada desafío completado desbloquea un logro y el siguiente se calibra al nivel correcto (ni fácil ni imposible).

---

## 🏗️ Prioridad de Implementación Sugerida

| # | Idea | Impacto | Dificultad | Prioridad |
|---|------|---------|------------|-----------|
| 1 | Ajuste de macros por peso semanal | ⭐⭐⭐⭐⭐ | Media | 🔴 Alta |
| 11 | Modo "Cambio de Fase" automático | ⭐⭐⭐⭐⭐ | Baja | 🔴 Alta |
| 8 | Progressive Overload automático | ⭐⭐⭐⭐ | Baja | 🔴 Alta |
| 16 | Coach proactivo con contexto de hora | ⭐⭐⭐⭐ | Media | 🟡 Media |
| 3 | Plan de comidas adaptado al entreno | ⭐⭐⭐⭐ | Media | 🟡 Media |
| 12 | TDEE real por datos históricos | ⭐⭐⭐⭐⭐ | Alta | 🟡 Media |
| 19 | Correlaciones ocultas / insights | ⭐⭐⭐⭐⭐ | Alta | 🟢 Largo plazo |
| 15 | Proyección a 12 semanas | ⭐⭐⭐⭐ | Alta | 🟢 Largo plazo |
