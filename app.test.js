import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
const { loadKey } = require('./app.js');

describe('loadKey', () => {
  let originalLocalStorage;

  beforeAll(() => {
    originalLocalStorage = global.localStorage;
  });

  afterAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  beforeEach(() => {
    // Reset global state
    delete global.window.storage;

    // Set up standard localStorage mocks
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn()
      },
      writable: true
    });
  });

  test('returns default value if both window.storage and localStorage throw', async () => {
    // Make localStorage.getItem throw
    global.localStorage.getItem.mockImplementation(() => { throw new Error('Storage error'); });
    const result = await loadKey('testKey', 'defaultValue');
    expect(result).toBe('defaultValue');
  });

  test('uses window.storage if available and returns parsed value', async () => {
    global.window.storage = {
      get: jest.fn().mockResolvedValue({ value: JSON.stringify('windowStorageValue') })
    };

    const result = await loadKey('testKey', 'defaultValue');

    expect(global.window.storage.get).toHaveBeenCalledWith('testKey', false);
    expect(result).toBe('windowStorageValue');
  });

  test('uses window.storage if available and returns default if no result', async () => {
    global.window.storage = {
      get: jest.fn().mockResolvedValue(null)
    };

    const result = await loadKey('testKey', 'defaultValue');

    expect(global.window.storage.get).toHaveBeenCalledWith('testKey', false);
    expect(result).toBe('defaultValue');
  });

  test('uses localStorage if window.storage is not available and returns parsed value', async () => {
    global.localStorage.getItem.mockReturnValue(JSON.stringify('localStorageValue'));

    const result = await loadKey('testKey', 'defaultValue');

    expect(global.localStorage.getItem).toHaveBeenCalledWith('testKey');
    expect(result).toBe('localStorageValue');
  });

  test('uses localStorage if window.storage is not available and returns default if no result', async () => {
    global.localStorage.getItem.mockReturnValue(null);

    const result = await loadKey('testKey', 'defaultValue');

    expect(global.localStorage.getItem).toHaveBeenCalledWith('testKey');
    expect(result).toBe('defaultValue');
  });

  test('returns default value if JSON parsing fails', async () => {
    global.localStorage.getItem.mockReturnValue('invalid json');

    const result = await loadKey('testKey', 'defaultValue');

    expect(result).toBe('defaultValue');
  });
});

describe('App Component', () => {
  beforeAll(() => {
    const rootElement = document.createElement('div');
    rootElement.setAttribute('id', 'root');
    document.body.appendChild(rootElement);

    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    // Ensure the app starts on the main view (not onboarding)
    localStorage.setItem('onboarding_shown', '1');
  });

  test('renders navigation tabs', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const App = require('./app').default;

    await act(async () => {
      render(<App />);
    });

    expect(screen.getAllByText('Hoy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Coach').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Entreno').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Registro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Perfil').length).toBeGreaterThan(0);

    console.error = originalError;
  });

  test('renders AI space header', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const App = require('./app').default;

    await act(async () => {
      render(<App />);
    });

    expect(screen.getAllByText('Espacio IA').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CENTRO DE MANDO').length).toBeGreaterThan(0);

    console.error = originalError;
  });

  test('preset buttons exist in Perfil tab', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const App = require('./app').default;

    await act(async () => {
      render(<App />);
    });

    const perfilTabButton = screen.getAllByText('Perfil')[0].closest('button');

    await act(async () => {
      perfilTabButton.click();
    });

    expect(screen.getAllByText('Definición').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mantenimiento').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Volumen').length).toBeGreaterThan(0);

    console.error = originalError;
  });

  test('tab switching functionality', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const App = require('./app').default;

    await act(async () => {
      render(<App />);
    });

    const coachTabButton = screen.getAllByText('Coach')[0].closest('button');

    await act(async () => {
      coachTabButton.click();
    });

    expect(screen.getByText('CHAT CON EL COACH')).toBeInTheDocument();

    const entrenoTabButton = screen.getAllByText('Entreno')[0].closest('button');

    await act(async () => {
      entrenoTabButton.click();
    });

    expect(screen.getByText('ENTRENAMIENTO · SPLIT')).toBeInTheDocument();

    const perfilTabButton = screen.getAllByText('Perfil')[0].closest('button');

    await act(async () => {
      perfilTabButton.click();
    });

    expect(screen.getByText('Objetivo Principal')).toBeInTheDocument();

    console.error = originalError;
  });
});

describe('Hoy tab functionalities', () => {
  beforeAll(() => {
    localStorage.setItem('onboarding_shown', '1');
  });

  test('hydration water increase works', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const App = require('./app').default;

    await act(async () => {
      render(<App />);
    });

    const hydrationHeader = screen.getByText('Hidratación');
    const hydrationCard = hydrationHeader.closest('div').parentElement;

    expect(screen.getByText('0.00')).toBeInTheDocument();

    const plusButton = hydrationCard.querySelector('button:last-child');

    await act(async () => {
      plusButton.click();
    });

    expect(screen.getByText('0.25')).toBeInTheDocument();

    console.error = originalError;
  });

  test('adding a custom supplement works', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const App = require('./app').default;

    await act(async () => {
      render(<App />);
    });

    const input = screen.getByPlaceholderText('Ej: Cafeína...');
    const addButton = screen.getByText('Añadir');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Magnesio' } });
      fireEvent.click(addButton);
    });

    expect(screen.getByText('Magnesio')).toBeInTheDocument();

    console.error = originalError;
  });
});

describe('buildPRHistory', () => {
  const { buildPRHistory, isCompoundExercise, estimate1RM } = require('./app.js');

  const exercises = {
    pecho: [{ name: 'Press banca', musculos: ['Pectoral', 'Tríceps'] }],
    biceps: [{ name: 'Curl bíceps', musculos: ['Bíceps'] }],
  };

  test('devuelve array vacío sin datos', () => {
    expect(buildPRHistory({}, {})).toEqual([]);
    expect(buildPRHistory(null, null)).toEqual([]);
  });

  test('calcula PR de peso y 1RM estimado ignorando calentamientos', () => {
    const exlog = {
      'Press banca': [
        { date: '2026-01-10T10:00:00Z', w: 100, reps: 3, type: 'work' },
        { date: '2026-01-10T10:05:00Z', w: 40, reps: 15, type: 'warmup' }, // ignorado
        { date: '2026-01-05T10:00:00Z', w: 90, reps: 8, type: 'work' },
      ],
    };
    const [rec] = buildPRHistory(exlog, exercises);
    expect(rec.name).toBe('Press banca');
    expect(rec.muscle).toBe('Pectoral');
    expect(rec.prWeight).toBe(100); // el calentamiento no cuenta aunque tenga más reps
    // 1RM: max(100*(1+3/30)=110, 90*(1+8/30)=114) = 114
    expect(rec.pr1RM).toBeCloseTo(114, 1);
    expect(rec.sessionsCount).toBe(2);
    expect(rec.totalSets).toBe(2);
  });

  test('recomienda subir carga cuando la última sesión tiene 8+ reps (compuesto +2.5kg)', () => {
    const exlog = {
      'Press banca': [{ date: '2026-02-01T10:00:00Z', w: 80, reps: 8, type: 'work' }],
    };
    const [rec] = buildPRHistory(exlog, exercises);
    expect(rec.recommendation.kind).toBe('overload');
    expect(rec.recommendation.weight).toBe(82.5);
  });

  test('aislado sube solo +1kg', () => {
    const exlog = {
      'Curl bíceps': [{ date: '2026-02-01T10:00:00Z', w: 20, reps: 10, type: 'work' }],
    };
    const [rec] = buildPRHistory(exlog, exercises);
    expect(rec.recommendation.kind).toBe('overload');
    expect(rec.recommendation.weight).toBe(21);
  });

  test('detecta estancamiento con mismo peso 3 sesiones y reps bajas → rotar', () => {
    const exlog = {
      'Curl bíceps': [
        { date: '2026-03-03T10:00:00Z', w: 20, reps: 5, type: 'work' },
        { date: '2026-03-02T10:00:00Z', w: 20, reps: 5, type: 'work' },
        { date: '2026-03-01T10:00:00Z', w: 20, reps: 5, type: 'work' },
      ],
    };
    const [rec] = buildPRHistory(exlog, exercises);
    expect(rec.plateau).toBe(true);
    expect(rec.recommendation.kind).toBe('variation');
    expect(rec.recommendation.weight).toBe(20);
  });

  test('ordena por fecha del último entrenamiento (más reciente primero)', () => {
    const exlog = {
      'Press banca': [{ date: '2026-01-01T10:00:00Z', w: 80, reps: 6, type: 'work' }],
      'Curl bíceps': [{ date: '2026-05-01T10:00:00Z', w: 20, reps: 6, type: 'work' }],
    };
    const recs = buildPRHistory(exlog, exercises);
    expect(recs[0].name).toBe('Curl bíceps');
    expect(recs[1].name).toBe('Press banca');
  });

  test('incluye history cronológico (antiguo→reciente) con maxW y e1rm para el gráfico', () => {
    const exlog = {
      'Press banca': [
        { date: '2026-01-01T10:00:00Z', w: 80, reps: 6, type: 'work' },
        { date: '2026-02-01T10:00:00Z', w: 85, reps: 5, type: 'work' },
        { date: '2026-03-01T10:00:00Z', w: 90, reps: 4, type: 'work' },
      ],
    };
    const [rec] = buildPRHistory(exlog, exercises);
    expect(rec.history).toHaveLength(3);
    expect(rec.history.map(h => h.maxW)).toEqual([80, 85, 90]); // orden cronológico ascendente
    expect(rec.history[0].date).toBe('2026-01-01');
    expect(typeof rec.history[2].e1rm).toBe('number');
    expect(rec.history[2].e1rm).toBeGreaterThan(0);
  });

  test('isCompoundExercise y estimate1RM (PR)', () => {
    expect(isCompoundExercise('Sentadilla trasera')).toBe(true);
    expect(isCompoundExercise('Curl de bíceps')).toBe(false);
    expect(estimate1RM(100, 0)).toBe(0);
    expect(estimate1RM(100, 10)).toBeCloseTo(133.33, 1);
  });
});

describe('buildDaySummary', () => {
  const { buildDaySummary, localDateKey } = require('./app.js');

  const exercises = {
    pecho: [{ name: 'Press banca', musculos: ['Pectoral', 'Tríceps'] }],
    pierna: [{ name: 'Sentadilla', musculos: ['Cuádriceps', 'Glúteos'] }],
  };

  test('día sin entrenamiento devuelve isEmpty', () => {
    const s = buildDaySummary({}, exercises, '2026-07-27');
    expect(s.isEmpty).toBe(true);
    expect(s.exercises).toEqual([]);
  });

  test('localDateKey usa la fecha local, no la UTC cruda', () => {
    // Cualquier ISO válido produce YYYY-MM-DD de 10 caracteres
    expect(localDateKey('2026-07-27T10:00:00Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(localDateKey('fecha-invalida')).toBe('');
  });

  test('consolida series del día: trabajo, calentamiento, volumen y PR', () => {
    const day = '2026-07-27';
    const exlog = {
      'Press banca': [
        { date: day + 'T10:00:00', w: 40, reps: 12, type: 'warmup' }, // calentamiento
        { date: day + 'T10:05:00', w: 90, reps: 8, type: 'work' },
        { date: day + 'T10:10:00', w: 90, reps: 6, type: 'work' },
        { date: '2026-07-20T10:00:00', w: 85, reps: 8, type: 'work' }, // histórico previo (max 85)
      ],
      'Sentadilla': [
        { date: day + 'T10:20:00', w: 100, reps: 5, type: 'work' },
      ],
    };
    const s = buildDaySummary(exlog, exercises, day, { durationMin: 60, sensation: 'Óptimo' });
    expect(s.isEmpty).toBe(false);
    expect(s.totals.exercises).toBe(2);
    expect(s.totals.workSets).toBe(3);       // 2 press + 1 sentadilla (sin calentamiento)
    expect(s.totals.warmupSets).toBe(1);
    // Volumen del día: 40*12 + 90*8 + 90*6 + 100*5 = 480+720+540+500 = 2240
    expect(s.totals.volume).toBe(2240);
    // PR: hoy 90kg en Press banca supera el histórico previo de 85kg
    expect(s.totals.prCount).toBe(1);
    const press = s.exercises.find(e => e.name === 'Press banca');
    expect(press.isPR).toBe(true);
    expect(press.topW).toBe(90);
    // El mini-análisis siempre tiene contenido
    expect(Array.isArray(s.analysis)).toBe(true);
    expect(s.analysis.length).toBeGreaterThan(2);
    // Menciona la duración cuando se pasa
    expect(s.analysis.join(' ')).toMatch(/60 min/);
    // Menciona la sensación
    expect(s.analysis.join(' ')).toMatch(/Óptimo/);
  });

  test('ordena ejercicios por orden de ejecución (más temprano primero)', () => {
    const day = '2026-07-27';
    const exlog = {
      'Sentadilla': [{ date: day + 'T11:00:00', w: 100, reps: 5, type: 'work' }],
      'Press banca': [{ date: day + 'T10:00:00', w: 90, reps: 5, type: 'work' }],
    };
    const s = buildDaySummary(exlog, exercises, day);
    expect(s.exercises[0].name).toBe('Press banca'); // se hizo antes
    expect(s.exercises[1].name).toBe('Sentadilla');
  });

  test('cada ejercicio trae recomendación + progreso vs sesión anterior', () => {
    const day = '2026-07-27';
    const exlog = {
      'Press banca': [
        { date: day + 'T10:00:00', w: 92.5, reps: 8, type: 'work' }, // hoy: 8 reps → subir
        { date: '2026-07-20T10:00:00', w: 90, reps: 8, type: 'work' }, // anterior: 90kg
      ],
    };
    const s = buildDaySummary(exlog, exercises, day);
    const ex = s.exercises[0];
    expect(ex.prevMaxW).toBe(90);
    expect(ex.deltaVsPrev).toBe(2.5); // 92.5 - 90
    expect(ex.recommendation.kind).toBe('overload');
    expect(ex.recommendation.weight).toBe(95); // compuesto +2.5
  });

  test('primera sesión de un ejercicio no tiene progreso previo', () => {
    const day = '2026-07-27';
    const exlog = { 'Press banca': [{ date: day + 'T10:00:00', w: 80, reps: 6, type: 'work' }] };
    const ex = buildDaySummary(exlog, exercises, day).exercises[0];
    expect(ex.prevMaxW).toBeNull();
    expect(ex.deltaVsPrev).toBeNull();
    expect(ex.recommendation.kind).toBe('hold');
  });
});

describe('loadRecommendation', () => {
  const { loadRecommendation } = require('./app.js');

  test('8+ reps → subir carga (compuesto +2.5, aislado +1)', () => {
    expect(loadRecommendation('Press banca', 80, 8, false).kind).toBe('overload');
    expect(loadRecommendation('Press banca', 80, 8, false).weight).toBe(82.5);
    expect(loadRecommendation('Curl', 20, 10, false).weight).toBe(21);
  });

  test('estancado con reps bajas → rotar/forzar rep', () => {
    const r = loadRecommendation('Curl', 20, 5, true, 3);
    expect(r.kind).toBe('variation');
    expect(r.weight).toBe(20);
  });

  test('reps intermedias → consolidar', () => {
    expect(loadRecommendation('Press banca', 80, 6, false).kind).toBe('hold');
  });
});

describe('perfil corporal y objetivos derivados', () => {
  const {
    calcLeanMass, calcBMRMifflin, calcBMRKatch, calcBMR, calcNutritionTargets,
    calcWaterGoalGlasses, calcWeightEMASeries, getTrendWeight, DEFAULT_BODY_PROFILE,
  } = require('./app.js');

  test('calcLeanMass descuenta la grasa', () => {
    expect(calcLeanMass(100, 25)).toBe(75);
    expect(calcLeanMass(93.9, 26.2)).toBeCloseTo(69.3, 1);
  });

  test('calcLeanMass devuelve 0 sin dato fiable de grasa', () => {
    expect(calcLeanMass(90, 0)).toBe(0);
    expect(calcLeanMass(90, undefined)).toBe(0);
    expect(calcLeanMass(0, 20)).toBe(0);
  });

  test('Mifflin distingue sexo', () => {
    const base = { edad: 34, alturaCm: 180, weight: 90 };
    const h = calcBMRMifflin({ ...base, sexo: 'hombre' });
    const m = calcBMRMifflin({ ...base, sexo: 'mujer' });
    expect(h).toBe(10 * 90 + 6.25 * 180 - 5 * 34 + 5);
    expect(h - m).toBe(166); // +5 vs -161
  });

  test('Katch-McArdle usa masa magra', () => {
    expect(calcBMRKatch(70)).toBe(Math.round(370 + 21.6 * 70));
    expect(calcBMRKatch(0)).toBe(0);
  });

  test('calcBMR prefiere Katch si hay % de grasa, si no Mifflin', () => {
    const conGrasa = calcBMR(DEFAULT_BODY_PROFILE, { weight: 90, grasaPct: 20 });
    expect(conGrasa.method).toBe('Katch-McArdle');
    expect(conGrasa.leanKg).toBe(72);

    const sinGrasa = calcBMR(DEFAULT_BODY_PROFILE, { weight: 90 });
    expect(sinGrasa.method).toBe('Mifflin-St Jeor');
    expect(sinGrasa.bmr).toBeGreaterThan(0);
  });

  test('los macros cuadran con las kcal y la proteína sale de la masa magra', () => {
    const t = calcNutritionTargets(
      { ...DEFAULT_BODY_PROFILE, objetivo: 'definicion', ritmoKgSemana: -0.5 },
      { weight: 93.9, grasaPct: 26.2 }
    );
    expect(t.kcal).toBe(t.p * 4 + t.c * 4 + t.f * 9); // consistencia interna
    // definición = 2.6 g por kg de masa magra
    expect(t.p).toBe(Math.round(t.leanKg * 2.6));
    expect(t.protPorKgLean).toBeCloseTo(2.6, 1);
    expect(t.bmrMethod).toBe('Katch-McArdle');
  });

  test('bajar de peso reduce el objetivo calórico (los presets fijos no lo hacían)', () => {
    const antes = calcNutritionTargets(DEFAULT_BODY_PROFILE, { weight: 95, grasaPct: 26 });
    const despues = calcNutritionTargets(DEFAULT_BODY_PROFILE, { weight: 85, grasaPct: 22 });
    expect(despues.kcal).toBeLessThan(antes.kcal);
    expect(despues.bmr).toBeLessThan(antes.bmr);
  });

  test('el objetivo cambia el ritmo y el déficit', () => {
    const def = calcNutritionTargets({ ...DEFAULT_BODY_PROFILE, objetivo: 'definicion', ritmoKgSemana: -0.5 }, { weight: 90, grasaPct: 22 });
    const vol = calcNutritionTargets({ ...DEFAULT_BODY_PROFILE, objetivo: 'volumen', ritmoKgSemana: 0.25 }, { weight: 90, grasaPct: 22 });
    expect(def.deficitDiario).toBeLessThan(0);
    expect(vol.deficitDiario).toBeGreaterThan(0);
    expect(vol.kcal).toBeGreaterThan(def.kcal);
  });

  test('nunca baja del BMR ni de 1500 kcal', () => {
    const t = calcNutritionTargets(
      { ...DEFAULT_BODY_PROFILE, ritmoKgSemana: -2 }, // ritmo agresivo
      { weight: 60, grasaPct: 12 }
    );
    expect(t.kcal).toBeGreaterThanOrEqual(1500);
    expect(t.kcal).toBeGreaterThanOrEqual(t.bmr);
  });

  test('usa el TDEE real si es plausible e ignora el disparatado', () => {
    const m = { weight: 90, grasaPct: 22 };
    const est = calcNutritionTargets(DEFAULT_BODY_PROFILE, m).tdeeEstimado;
    const plausible = calcNutritionTargets(DEFAULT_BODY_PROFILE, m, { tdeeReal: Math.round(est * 1.1) });
    expect(plausible.usandoTdeeReal).toBe(true);
    const absurdo = calcNutritionTargets(DEFAULT_BODY_PROFILE, m, { tdeeReal: 900 });
    expect(absurdo.usandoTdeeReal).toBe(false);
  });

  test('sin peso no hay objetivos', () => {
    expect(calcNutritionTargets(DEFAULT_BODY_PROFILE, {})).toBeNull();
  });

  test('el agua escala con el peso y el entreno', () => {
    expect(calcWaterGoalGlasses(60)).toBeLessThan(calcWaterGoalGlasses(100));
    expect(calcWaterGoalGlasses(90, true)).toBeGreaterThan(calcWaterGoalGlasses(90, false));
    expect(calcWaterGoalGlasses(0)).toBe(14); // fallback
  });

  test('la EMA suaviza el ruido diario del peso', () => {
    const log = {
      '2026-07-01': { weight: 90 },
      '2026-07-02': { weight: 93 }, // pico por retención de agua
      '2026-07-03': { weight: 90 },
    };
    const serie = calcWeightEMASeries(log);
    expect(serie).toHaveLength(3);
    expect(serie[0].ema).toBe(90);
    // la EMA absorbe el pico: queda muy por debajo de los 93 crudos
    expect(serie[1].ema).toBeLessThan(92);
    expect(serie[1].raw).toBe(93);
    expect(getTrendWeight(log)).toBeCloseTo(serie[2].ema, 2);
  });

  test('la EMA ignora fechas sin peso', () => {
    expect(calcWeightEMASeries({ '2026-07-01': { grasaPct: 20 } })).toEqual([]);
    expect(getTrendWeight({})).toBeNull();
  });
});

describe('Panel de perfil corporal en Registro', () => {
  beforeAll(() => {
    localStorage.setItem('onboarding_shown', '1');
  });

  test('muestra el perfil editable y los objetivos calculados', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const App = require('./app').default;

    await act(async () => { render(<App />); });

    const regTab = screen.getAllByText('Registro')[0].closest('button');
    await act(async () => { regTab.click(); });

    expect(screen.getAllByText('Perfil corporal y objetivos').length).toBeGreaterThan(0);
    // Los tres bloques del cálculo derivado
    expect(screen.getAllByText('BMR').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TDEE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Aplicar estos objetivos').length).toBeGreaterThan(0);

    console.error = originalError;
  });
});

describe('carb cycling', () => {
  const { calcCarbCycleTargets, classifyFuelDay } = require('./app.js');
  const base = { kcal: 2600, p: 200, c: 265, f: 70 };

  test('classifyFuelDay distingue alto, medio y descanso', () => {
    expect(classifyFuelDay(true, 'Carbo alto')).toBe('alto');
    expect(classifyFuelDay(true, 'Carbo medio')).toBe('medio');
    expect(classifyFuelDay(false, 'Carbo alto')).toBe('descanso');
  });

  test('el día de descanso recorta carbos y el de entreno los sube', () => {
    const opts = { trainingDaysPerWeek: 4, altoDaysPerWeek: 2 };
    const rest = calcCarbCycleTargets(base, { ...opts, dayType: 'descanso' });
    const alto = calcCarbCycleTargets(base, { ...opts, dayType: 'alto' });
    const medio = calcCarbCycleTargets(base, { ...opts, dayType: 'medio' });

    expect(rest.c).toBeLessThan(base.c);
    expect(alto.c).toBeGreaterThan(base.c);
    expect(alto.c).toBeGreaterThan(medio.c); // alto recibe más que medio
    expect(rest.deltaKcal).toBeLessThan(0);
    expect(alto.deltaKcal).toBeGreaterThan(0);
  });

  test('la proteína y la grasa no se mueven: el swing lo llevan los carbos', () => {
    const opts = { trainingDaysPerWeek: 4, altoDaysPerWeek: 2 };
    ['alto', 'medio', 'descanso'].forEach(dayType => {
      const d = calcCarbCycleTargets(base, { ...opts, dayType });
      expect(d.p).toBe(base.p);
      expect(d.f).toBe(base.f);
      expect(d.kcal).toBe(d.p * 4 + d.c * 4 + d.f * 9);
    });
  });

  test('la media semanal de carbos se mantiene en el objetivo', () => {
    const nTrain = 4, nAlto = 2, nMedio = 2, nRest = 3;
    const opts = { trainingDaysPerWeek: nTrain, altoDaysPerWeek: nAlto };
    const alto = calcCarbCycleTargets(base, { ...opts, dayType: 'alto' });
    const medio = calcCarbCycleTargets(base, { ...opts, dayType: 'medio' });
    const rest = calcCarbCycleTargets(base, { ...opts, dayType: 'descanso' });
    const semana = alto.c * nAlto + medio.c * nMedio + rest.c * nRest;
    // tolerancia de ±2% por redondeos a gramos enteros
    expect(Math.abs(semana - base.c * 7) / (base.c * 7)).toBeLessThan(0.02);
  });

  test('devuelve null sin base válida', () => {
    expect(calcCarbCycleTargets(null, { dayType: 'alto' })).toBeNull();
  });
});

describe('fase calórica y su efecto en la carga', () => {
  const { classifyCaloricPhase, loadRecommendation } = require('./app.js');

  test('clasifica la fase por el balance respecto al TDEE', () => {
    expect(classifyCaloricPhase(-700, 3000)).toBe('deficit_agresivo');
    expect(classifyCaloricPhase(-300, 3000)).toBe('deficit');
    expect(classifyCaloricPhase(0, 3000)).toBe('mantenimiento');
    expect(classifyCaloricPhase(300, 3000)).toBe('superavit');
    expect(classifyCaloricPhase(NaN, 3000)).toBe('desconocida');
  });

  test('en déficit agresivo no sube carga con 8 reps (sí lo haría en normal)', () => {
    const normal = loadRecommendation('Press banca', 80, 8, false, 3, 'mantenimiento');
    const agresivo = loadRecommendation('Press banca', 80, 8, false, 3, 'deficit_agresivo');
    expect(normal.kind).toBe('overload');
    expect(agresivo.kind).toBe('hold'); // exige 10 reps antes de subir
  });

  test('en superávit sube antes (7 reps bastan)', () => {
    expect(loadRecommendation('Press banca', 80, 7, false, 3, 'superavit').kind).toBe('overload');
    expect(loadRecommendation('Press banca', 80, 7, false, 3, 'mantenimiento').kind).toBe('hold');
  });

  test('en déficit agresivo el incremento es menor', () => {
    const normal = loadRecommendation('Press banca', 80, 12, false, 3, 'mantenimiento');
    const agresivo = loadRecommendation('Press banca', 80, 12, false, 3, 'deficit_agresivo');
    expect(agresivo.weight).toBeLessThan(normal.weight);
  });

  test('en déficit agresivo un estancamiento no manda rotar ejercicio', () => {
    const normal = loadRecommendation('Curl', 20, 6, true, 3, 'mantenimiento');
    const agresivo = loadRecommendation('Curl', 20, 6, true, 3, 'deficit_agresivo');
    expect(normal.kind).toBe('variation');
    expect(agresivo.kind).toBe('hold');
  });

  test('sin fase indicada mantiene el comportamiento anterior', () => {
    expect(loadRecommendation('Press banca', 80, 8, false).kind).toBe('overload');
    expect(loadRecommendation('Curl', 20, 5, true, 3).kind).toBe('variation');
  });
});

describe('pérdida de fuerza en déficit', () => {
  const { detectStrengthLossUnderDeficit } = require('./app.js');
  const exercises = { a: [{ name: 'Press banca', musculos: ['Pectoral'] }, { name: 'Sentadilla', musculos: ['Cuádriceps'] }] };

  // 1RM cayendo en dos ejercicios
  const exlogDeclining = {
    'Press banca': [
      { date: '2026-07-01T10:00:00', w: 100, reps: 6, type: 'work' },
      { date: '2026-07-08T10:00:00', w: 95, reps: 6, type: 'work' },
      { date: '2026-07-15T10:00:00', w: 88, reps: 5, type: 'work' },
    ],
    'Sentadilla': [
      { date: '2026-07-01T10:00:00', w: 140, reps: 5, type: 'work' },
      { date: '2026-07-08T10:00:00', w: 132, reps: 5, type: 'work' },
      { date: '2026-07-15T10:00:00', w: 125, reps: 4, type: 'work' },
    ],
  };
  // peso bajando rápido
  const metricsLosing = {
    '2026-07-01': { weight: 95 }, '2026-07-05': { weight: 94 },
    '2026-07-10': { weight: 92.8 }, '2026-07-15': { weight: 91.5 },
  };

  test('detecta caída de fuerza mientras se baja de peso', () => {
    const r = detectStrengthLossUnderDeficit(exlogDeclining, exercises, metricsLosing);
    expect(r.detected).toBe(true);
    expect(r.decliningExercises.length).toBeGreaterThanOrEqual(2);
    expect(r.losingWeight).toBe(true);
    expect(r.message).toMatch(/fuerza|1RM/i);
  });

  test('no alerta si la fuerza cae pero el peso es estable', () => {
    const stable = { '2026-07-01': { weight: 92 }, '2026-07-08': { weight: 92.1 }, '2026-07-15': { weight: 92 } };
    expect(detectStrengthLossUnderDeficit(exlogDeclining, exercises, stable).detected).toBe(false);
  });

  test('no alerta si la fuerza sube aunque baje el peso', () => {
    const improving = {
      'Press banca': [
        { date: '2026-07-01T10:00:00', w: 88, reps: 5, type: 'work' },
        { date: '2026-07-08T10:00:00', w: 92, reps: 6, type: 'work' },
        { date: '2026-07-15T10:00:00', w: 97, reps: 6, type: 'work' },
      ],
    };
    expect(detectStrengthLossUnderDeficit(improving, exercises, metricsLosing).detected).toBe(false);
  });

  test('no alerta sin historial suficiente', () => {
    const poco = { 'Press banca': [{ date: '2026-07-15T10:00:00', w: 90, reps: 6, type: 'work' }] };
    expect(detectStrengthLossUnderDeficit(poco, exercises, metricsLosing).detected).toBe(false);
  });
});

describe('refeed / diet break', () => {
  const { detectRefeedNeed } = require('./app.js');
  const targets = { tdee: 3000, deficitDiario: -400, kcal: 2600 };

  // Genera N días de comida con kcal dadas, terminando hoy
  const foodlogOf = (days, kcal) => {
    const out = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(2026, 6, 27); d.setDate(d.getDate() - i);
      out[d.toISOString().slice(0, 10)] = [{ kcal }];
    }
    return out;
  };

  test('no recomienda nada si no está en déficit', () => {
    const r = detectRefeedNeed({}, foodlogOf(60, 3000), { tdee: 3000, deficitDiario: 0, kcal: 3000 });
    expect(r.recommended).toBe(false);
  });

  test('propone refeed tras 4+ semanas en déficit', () => {
    const r = detectRefeedNeed({}, foodlogOf(35, 2600), targets);
    expect(r.weeksInDeficit).toBeGreaterThanOrEqual(4);
    expect(r.recommended).toBe(true);
    expect(r.kind).toBe('refeed');
  });

  test('escala a diet break tras 8+ semanas', () => {
    const r = detectRefeedNeed({}, foodlogOf(60, 2600), targets);
    expect(r.kind).toBe('diet_break');
    expect(r.reason).toMatch(/diet break/i);
  });

  test('propone diet break si el peso se estanca pese a buena adherencia', () => {
    const stalled = {
      '2026-07-01': { weight: 92 }, '2026-07-08': { weight: 92.1 },
      '2026-07-15': { weight: 91.9 }, '2026-07-22': { weight: 92.05 },
    };
    const r = detectRefeedNeed(stalled, foodlogOf(25, 2600), targets);
    expect(r.stalled).toBe(true);
    expect(r.recommended).toBe(true);
    expect(r.adherencePct).toBeGreaterThanOrEqual(85);
  });

  test('sin datos suficientes de comida no recomienda', () => {
    expect(detectRefeedNeed({}, foodlogOf(3, 2600), targets).recommended).toBe(false);
  });
});

describe('deload sensible a la composición corporal', () => {
  const { detectDeloadNeed } = require('./app.js');

  // Genera entrenamientos constantes en las últimas 8 semanas
  const exlogSteady = (() => {
    const out = { 'Press banca': [] };
    for (let i = 0; i < 56; i += 2) {
      const d = new Date(); d.setDate(d.getDate() - i);
      out['Press banca'].push({ date: d.toISOString(), w: 80, reps: 8, type: 'work' });
    }
    return out;
  })();

  const metricsOf = (kgPerWeek) => {
    const out = {};
    for (let i = 0; i < 5; i++) {
      const d = new Date(); d.setDate(d.getDate() - i * 7);
      out[d.toISOString().slice(0, 10)] = { weight: 90 + i * kgPerWeek };
    }
    return out;
  };

  test('expone el ritmo de pérdida y ya no ignora metricslog', () => {
    const r = detectDeloadNeed(exlogSteady, [], metricsOf(1.4)); // baja ~1.4 kg/sem
    expect(r.rapidLossPct).toBeGreaterThan(1);
  });

  test('una pérdida muy rápida eleva la urgencia frente a peso estable', () => {
    const estable = detectDeloadNeed(exlogSteady, [], metricsOf(0));
    const rapida = detectDeloadNeed(exlogSteady, [], metricsOf(1.6));
    const ORDER = ['none', 'low', 'medium', 'high'];
    expect(ORDER.indexOf(rapida.urgency)).toBeGreaterThan(ORDER.indexOf(estable.urgency));
    expect(rapida.reason).toMatch(/%\/sem/);
  });

  test('sigue funcionando sin datos de peso', () => {
    const r = detectDeloadNeed(exlogSteady, [], {});
    expect(r).toHaveProperty('urgency');
    expect(r.rapidLossPct).toBe(0);
  });
});

describe('adaptación metabólica', () => {
  const { calcMetabolicAdaptation } = require('./app.js');

  test('sin datos no está disponible', () => {
    expect(calcMetabolicAdaptation(0, 3000).available).toBe(false);
    expect(calcMetabolicAdaptation(2500, 0).available).toBe(false);
  });

  test('detecta adaptación leve y marcada', () => {
    expect(calcMetabolicAdaptation(2760, 3000).level).toBe('mild');        // -8%
    expect(calcMetabolicAdaptation(2500, 3000).level).toBe('significant'); // -16.7%
    expect(calcMetabolicAdaptation(2950, 3000).level).toBe('none');        // -1.7%
  });

  test('detecta gasto mayor del estimado', () => {
    const r = calcMetabolicAdaptation(3400, 3000);
    expect(r.level).toBe('higher');
    expect(r.adaptationPct).toBeGreaterThan(0);
    expect(r.message).toMatch(/más/i);
  });

  test('el mensaje de adaptación marcada sugiere recalibrar', () => {
    const r = calcMetabolicAdaptation(2500, 3000);
    expect(r.message).toMatch(/diet break|gasto real/i);
  });
});

describe('cintura y recomposición', () => {
  const { calcWaistMetrics, detectRecomposition, DEFAULT_BODY_PROFILE } = require('./app.js');

  const logConCintura = {
    '2026-05-01': { weight: 93, cintura: 98 },
    '2026-06-01': { weight: 92.5, cintura: 95 },
    '2026-07-01': { weight: 92.4, cintura: 92 },
  };

  test('sin mediciones de cintura no está disponible', () => {
    expect(calcWaistMetrics({ '2026-07-01': { weight: 90 } }, DEFAULT_BODY_PROFILE).available).toBe(false);
  });

  test('calcula WHtR y clasifica el riesgo', () => {
    const r = calcWaistMetrics(logConCintura, { ...DEFAULT_BODY_PROFILE, alturaCm: 180 });
    expect(r.available).toBe(true);
    expect(r.cintura).toBe(92);
    expect(r.whtr).toBeCloseTo(92 / 180, 3);
    expect(r.riesgo.label).toBe('Elevado'); // 0.511 > 0.5
  });

  test('WHtR bajo el umbral 0.5 se marca saludable', () => {
    const r = calcWaistMetrics({ '2026-07-01': { weight: 80, cintura: 85 } }, { ...DEFAULT_BODY_PROFILE, alturaCm: 180 });
    expect(r.riesgo.ok).toBe(true);
  });

  test('mide el cambio total de cintura', () => {
    const r = calcWaistMetrics(logConCintura, DEFAULT_BODY_PROFILE);
    expect(r.deltaTotal).toBe(-6); // 92 - 98
    expect(r.deltaPrev).toBe(-3);  // 92 - 95
    expect(r.mediciones).toBe(3);
  });

  test('detecta recomposición: cintura baja, peso estable, fuerza sostenida', () => {
    const exercises = { a: [{ name: 'Press banca', musculos: ['Pectoral'] }] };
    const exlog = {
      'Press banca': [
        { date: '2026-05-01T10:00:00', w: 85, reps: 6, type: 'work' },
        { date: '2026-06-01T10:00:00', w: 88, reps: 6, type: 'work' },
        { date: '2026-07-01T10:00:00', w: 90, reps: 6, type: 'work' },
      ],
    };
    const r = detectRecomposition(logConCintura, exlog, exercises);
    expect(r.detected).toBe(true);
    expect(r.waistDelta).toBe(-6);
    expect(r.message).toMatch(/recomponiendo/i);
  });

  test('no detecta recomposición si la cintura no baja', () => {
    const sinCambio = {
      '2026-05-01': { weight: 93, cintura: 98 },
      '2026-07-01': { weight: 92.9, cintura: 98 },
    };
    expect(detectRecomposition(sinCambio, {}, {}).detected).toBe(false);
  });

  test('no detecta recomposición sin mediciones suficientes', () => {
    expect(detectRecomposition({ '2026-07-01': { weight: 90, cintura: 92 } }, {}, {}).detected).toBe(false);
  });
});

describe('outliers de peso', () => {
  const { detectWeightOutlier } = require('./app.js');
  const log = {
    '2026-07-01': { weight: 92 }, '2026-07-05': { weight: 91.8 },
    '2026-07-10': { weight: 91.6 }, '2026-07-15': { weight: 91.5 },
  };

  test('un peso coherente con la tendencia no es outlier', () => {
    expect(detectWeightOutlier(log, 91.4).outlier).toBe(false);
  });

  test('detecta una desviación grande hacia arriba', () => {
    const r = detectWeightOutlier(log, 96);
    expect(r.outlier).toBe(true);
    expect(r.diff).toBeGreaterThan(0);
    expect(r.reason).toMatch(/retención|error/i);
  });

  test('detecta una desviación grande hacia abajo', () => {
    const r = detectWeightOutlier(log, 86);
    expect(r.outlier).toBe(true);
    expect(r.diff).toBeLessThan(0);
    expect(r.severity).toBe('high');
  });

  test('no marca outlier sin histórico suficiente', () => {
    expect(detectWeightOutlier({ '2026-07-01': { weight: 92 } }, 99).outlier).toBe(false);
    expect(detectWeightOutlier({}, 99).outlier).toBe(false);
  });

  test('ignora entradas inválidas', () => {
    expect(detectWeightOutlier(log, 'abc').outlier).toBe(false);
    expect(detectWeightOutlier(log, 0).outlier).toBe(false);
  });
});

describe('proyección corporal con partición tipo Forbes', () => {
  const { calcBodyProjection, fatFractionOfLoss, leanFractionOfGain } = require('./app.js');

  test('con más grasa se pierde proporcionalmente más grasa', () => {
    expect(fatFractionOfLoss(30)).toBeGreaterThan(fatFractionOfLoss(12));
    expect(fatFractionOfLoss(30)).toBeLessThanOrEqual(0.92);
    expect(fatFractionOfLoss(5)).toBeGreaterThanOrEqual(0.55);
  });

  test('con menos grasa se gana proporcionalmente más músculo', () => {
    expect(leanFractionOfGain(10)).toBeGreaterThan(leanFractionOfGain(30));
    expect(leanFractionOfGain(50)).toBeGreaterThanOrEqual(0.20);
  });

  test('en déficit el peso y el % de grasa bajan', () => {
    const pts = calcBodyProjection(93.9, 26.2, 3000, 2500, 12);
    expect(pts).toHaveLength(13);
    expect(pts[12].peso).toBeLessThan(pts[0].peso);
    expect(pts[12].grasaPct).toBeLessThan(pts[0].grasaPct);
  });

  test('alguien con grasa alta conserva más músculo en déficit que alguien definido', () => {
    const kcalDef = 2500, tdee = 3000, semanas = 12;
    const graso = calcBodyProjection(100, 32, tdee, kcalDef, semanas);
    const definido = calcBodyProjection(100, 10, tdee, kcalDef, semanas);
    const perdidaMusculoGraso = graso[0].musculo - graso[semanas].musculo;
    const perdidaMusculoDefinido = definido[0].musculo - definido[semanas].musculo;
    expect(perdidaMusculoGraso).toBeLessThan(perdidaMusculoDefinido);
  });

  test('en superávit el peso sube', () => {
    const pts = calcBodyProjection(80, 15, 2800, 3200, 8);
    expect(pts[8].peso).toBeGreaterThan(pts[0].peso);
  });
});

describe('objetivo de fibra', () => {
  const { calcNutritionTargets, DEFAULT_BODY_PROFILE } = require('./app.js');

  test('deriva la fibra de las calorías (~14g/1000kcal)', () => {
    const t = calcNutritionTargets(DEFAULT_BODY_PROFILE, { weight: 90, grasaPct: 22 });
    expect(t.fibra).toBe(Math.max(20, Math.min(60, Math.round((t.kcal / 1000) * 14))));
    expect(t.fibra).toBeGreaterThanOrEqual(20);
    expect(t.fibra).toBeLessThanOrEqual(60);
  });

  test('más calorías implican más fibra', () => {
    const bajo = calcNutritionTargets({ ...DEFAULT_BODY_PROFILE, objetivo: 'definicion', ritmoKgSemana: -0.7 }, { weight: 70, grasaPct: 15 });
    const alto = calcNutritionTargets({ ...DEFAULT_BODY_PROFILE, objetivo: 'volumen', ritmoKgSemana: 0.3 }, { weight: 100, grasaPct: 20 });
    expect(alto.fibra).toBeGreaterThanOrEqual(bajo.fibra);
  });
});

describe('hidratación por sudor', () => {
  const { calcWaterGoalGlasses } = require('./app.js');

  test('una sesión más larga pide más agua', () => {
    const corta = calcWaterGoalGlasses(90, true, 250, 30);
    const larga = calcWaterGoalGlasses(90, true, 250, 120);
    expect(larga).toBeGreaterThan(corta);
  });

  test('sin duración registrada asume una sesión estándar', () => {
    expect(calcWaterGoalGlasses(90, true, 250, 0)).toBeGreaterThan(calcWaterGoalGlasses(90, false));
  });

  test('sigue acotado a un rango razonable', () => {
    expect(calcWaterGoalGlasses(200, true, 250, 300)).toBeLessThanOrEqual(24);
    expect(calcWaterGoalGlasses(40, false)).toBeGreaterThanOrEqual(6);
  });
});

describe('datos de recuperación', () => {
  const { evaluateRecovery, calcRestingHRBaseline } = require('./app.js');

  test('sin datos no aporta nada', () => {
    const r = evaluateRecovery({});
    expect(r.hasData).toBe(false);
    expect(r.delta).toBe(0);
  });

  test('dormir bien suma y dormir poco resta', () => {
    expect(evaluateRecovery({ suenoHoras: 8 }).delta).toBeGreaterThan(0);
    expect(evaluateRecovery({ suenoHoras: 5 }).delta).toBeLessThan(0);
    expect(evaluateRecovery({ suenoHoras: 8 }).hasData).toBe(true);
  });

  test('la calidad del sueño modula el resultado', () => {
    const buena = evaluateRecovery({ suenoHoras: 7.5, suenoCalidad: 5 });
    const mala = evaluateRecovery({ suenoHoras: 7.5, suenoCalidad: 1 });
    expect(buena.delta).toBeGreaterThan(mala.delta);
  });

  test('la FC en reposo se compara con la línea base propia', () => {
    const alta = evaluateRecovery({ fcReposo: 70 }, 60); // +10 sobre su media
    const normal = evaluateRecovery({ fcReposo: 60 }, 60);
    expect(alta.delta).toBeLessThan(normal.delta);
    expect(alta.factors.join(' ')).toMatch(/FC reposo/);
  });

  test('muchos pasos penalizan por NEAT acumulado', () => {
    expect(evaluateRecovery({ pasos: 18000 }).delta).toBeLessThan(evaluateRecovery({ pasos: 9000 }).delta);
  });

  test('la línea base de FC necesita al menos 3 registros', () => {
    expect(calcRestingHRBaseline({ '2026-07-01': { fcReposo: 60 } })).toBeNull();
    const log = {
      '2026-07-01': { fcReposo: 58 }, '2026-07-02': { fcReposo: 60 },
      '2026-07-03': { fcReposo: 62 },
    };
    expect(calcRestingHRBaseline(log)).toBe(60);
  });
});

describe('serie de recomposición', () => {
  const { buildRecompositionSeries, getWeeklyStats } = require('./app.js');

  test('necesita al menos dos puntos', () => {
    expect(buildRecompositionSeries({ '2026-07-01': { weight: 90 } }).available).toBe(false);
    expect(buildRecompositionSeries({}).available).toBe(false);
  });

  test('calcula masa magra y grasa en kg, arrastrando el último % conocido', () => {
    const log = {
      '2026-05-01': { weight: 100, grasaPct: 30, cintura: 100 },
      '2026-06-01': { weight: 98 },                     // sin % de grasa: arrastra 30
      '2026-07-01': { weight: 96, grasaPct: 25, cintura: 94 },
    };
    const r = buildRecompositionSeries(log);
    expect(r.available).toBe(true);
    expect(r.points).toHaveLength(3);
    expect(r.points[1].grasaPct).toBe(30); // arrastrado
    expect(r.last.magra).toBeGreaterThan(0);
    expect(r.deltas.cintura).toBe(-6);
    expect(r.deltas.grasaPct).toBe(-5);
  });

  test('marca recomposición cuando baja la grasa y se mantiene la masa magra', () => {
    const log = {
      '2026-05-01': { weight: 90, grasaPct: 25 },
      '2026-06-01': { weight: 89.5, grasaPct: 22 },
      '2026-07-01': { weight: 89, grasaPct: 20 },
    };
    const r = buildRecompositionSeries(log);
    expect(r.deltas.grasaKg).toBeLessThan(0);
    expect(r.recomposing).toBe(true);
  });

  test('no marca recomposición si se pierde masa magra', () => {
    const log = {
      '2026-05-01': { weight: 90, grasaPct: 20 },
      '2026-07-01': { weight: 82, grasaPct: 19 },
    };
    expect(buildRecompositionSeries(log).recomposing).toBe(false);
  });

  test('getWeeklyStats usa el peso suavizado para el cambio semanal', () => {
    const hoy = new Date();
    const d = (n) => { const x = new Date(hoy); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
    const log = { [d(6)]: { weight: 90 }, [d(3)]: { weight: 93 }, [d(0)]: { weight: 90 } };
    const stats = getWeeklyStats({}, {}, log, []);
    // Con lecturas crudas el cambio sería 0; con EMA refleja el pico suavizado
    expect(stats.weightChange).not.toBeNull();
    expect(Math.abs(stats.weightChange)).toBeLessThan(3);
  });
});

describe('UI de las nuevas métricas', () => {
  beforeAll(() => { localStorage.setItem('onboarding_shown', '1'); });

  test('Registro muestra peso meta, fibra y contexto de medición', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const App = require('./app').default;

    await act(async () => { render(<App />); });
    const regTab = screen.getAllByText('Registro')[0].closest('button');
    await act(async () => { regTab.click(); });

    // Peso inicial y meta configurables (antes constantes en el código)
    expect(screen.getAllByText('Peso inicial').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Peso meta').length).toBeGreaterThan(0);
    // Fibra como cuarto objetivo junto a los macros
    expect(screen.getAllByText('Fibra').length).toBeGreaterThan(0);
    // Contexto de la medición y recuperación
    expect(screen.getAllByText('Cómo mediste').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Báscula').length).toBeGreaterThan(0);
    expect(screen.getAllByText('InBody').length).toBeGreaterThan(0);

    console.error = originalError;
  });

  test('Hoy muestra el registro rápido de peso', async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const App = require('./app').default;

    await act(async () => { render(<App />); });

    expect(screen.getAllByText('Peso de hoy').length).toBeGreaterThan(0);

    console.error = originalError;
  });
});

describe('fechas locales (regresión de zona horaria)', () => {
  const { getLocalDateStr, localDateKey } = require('./app.js');

  test('usa los componentes LOCALES de la fecha, no los UTC', () => {
    // 23:30 hora local: en zonas negativas el equivalente UTC ya es el día
    // siguiente. La app debe registrar el día local, no el UTC.
    const nocheLocal = new Date(2026, 6, 28, 23, 30, 0); // 28-jul-2026 23:30 local
    expect(getLocalDateStr(nocheLocal)).toBe('2026-07-28');

    // 00:30 hora local: en zonas positivas el UTC es aún el día anterior
    const madrugadaLocal = new Date(2026, 6, 28, 0, 30, 0);
    expect(getLocalDateStr(madrugadaLocal)).toBe('2026-07-28');
  });

  test('localDateKey coincide con getLocalDateStr para el mismo instante', () => {
    const d = new Date(2026, 0, 1, 22, 0, 0); // 1-ene 22:00 local
    expect(localDateKey(d.toISOString())).toBe(getLocalDateStr(d));
    expect(getLocalDateStr(d)).toBe('2026-01-01');
  });

  test('el día del mes no se desplaza al cruzar el fin de mes', () => {
    const finDeMes = new Date(2026, 6, 31, 21, 0, 0); // 31-jul 21:00 local
    expect(getLocalDateStr(finDeMes)).toBe('2026-07-31');
  });
});
