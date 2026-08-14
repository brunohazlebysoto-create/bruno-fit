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

    expect(screen.getByText('ENTRENAMIENTO')).toBeInTheDocument();

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
    // Con `exlogSteady` no se detecta ninguna descarga, así que weeksSinceDeload
    // se va al tope y la urgencia ya sale 'high' sin necesidad de la pérdida de
    // peso: no quedaba margen para comprobar que sube, y el resultado dependía
    // del día de la semana en que se ejecutaran las pruebas. Este historial
    // lleva una descarga explícita hace 3 semanas, así que parte de 'none'.
    const conDeload = (() => {
      const out = { 'Press banca': [] };
      for (let i = 0; i < 70; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const series = (i >= 21 && i <= 27) ? 1 : 4;   // semana de descarga
        for (let s = 0; s < series; s++) {
          out['Press banca'].push({ date: d.toISOString(), w: 80, reps: 8, type: 'work' });
        }
      }
      return out;
    })();
    const estable = detectDeloadNeed(conDeload, [], metricsOf(0));
    const rapida = detectDeloadNeed(conDeload, [], metricsOf(1.6));
    const ORDER = ['none', 'low', 'medium', 'high'];
    expect(estable.urgency).toBe('none');
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
    // factors son objetos {t, s}: t = texto, s = signo (+1 suma, -1 resta)
    expect(alta.factors.map(f => f.t).join(' ')).toMatch(/FC reposo/);
    expect(alta.factors.every(f => typeof f.t === 'string' && [-1, 0, 1].includes(f.s))).toBe(true);
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

describe('caminata en cinta con inclinación', () => {
  const { calcWalkBlock, calcCardioSession, getCardioSummary, PROGRAMAS_CAMINATA, VEL_MARCHA_MAX } = require('./app.js');

  test('la pendiente domina el coste: mismo tiempo y velocidad, más del doble de kcal', () => {
    const llano = calcWalkBlock({ min: 30, vel: 5, incl: 0 }, 92);
    const cuesta = calcWalkBlock({ min: 30, vel: 5, incl: 12 }, 92);
    expect(cuesta.km).toBe(llano.km);            // misma distancia
    expect(cuesta.kcal).toBeGreaterThan(llano.kcal * 2);
  });

  test('coincide con la ecuación de marcha del ACSM', () => {
    // 5 km/h = 83.33 m/min al 10%: VO2 = 0.1·83.33 + 1.8·83.33·0.10 + 3.5 = 26.83
    // kcal/min = 26.83 × 90 / 1000 × 5 = 12.07 → 30 min ≈ 362 kcal
    const r = calcWalkBlock({ min: 30, vel: 5, incl: 10 }, 90);
    expect(r.kcal).toBeGreaterThanOrEqual(358);
    expect(r.kcal).toBeLessThanOrEqual(366);
    expect(r.mets).toBeCloseTo(7.7, 1);
  });

  test('el desnivel acumulado sale de la distancia por la pendiente', () => {
    // 1 hora a 5 km/h al 10% = 5 km × 0.10 = 500 m de desnivel
    expect(calcWalkBlock({ min: 60, vel: 5, incl: 10 }, 90).desnivel).toBe(500);
  });

  test('sin peso registrado no inventa calorías', () => {
    const r = calcWalkBlock({ min: 30, vel: 5, incl: 8 }, 0);
    expect(r.kcal).toBe(0);
    expect(r.km).toBe(2.5);   // lo que no depende del peso sigue saliendo
  });

  test('avisa cuando la velocidad se sale del rango de marcha', () => {
    expect(calcWalkBlock({ min: 10, vel: VEL_MARCHA_MAX + 1, incl: 2 }, 90).fueraDeRango).toBe(true);
    expect(calcWalkBlock({ min: 10, vel: 5.5, incl: 2 }, 90).fueraDeRango).toBe(false);
  });

  test('las medias de la sesión se ponderan por tiempo, no por bloque', () => {
    // Un minuto al 20% no puede pesar lo mismo que 29 minutos al 2%
    const r = calcCardioSession({ bloques: [
      { min: 1, vel: 5, incl: 20 },
      { min: 29, vel: 5, incl: 2 },
    ] }, 90);
    expect(r.min).toBe(30);
    expect(r.inclMedia).toBeCloseTo(2.6, 1);   // la media simple daría 11
  });

  test('suma los bloques de una sesión de intervalos', () => {
    const inter = PROGRAMAS_CAMINATA.find(p => p.key === 'intervalos');
    const r = calcCardioSession(inter, 92);
    expect(r.min).toBe(42);
    expect(r.bloques).toHaveLength(18);         // calentamiento + 8×2 + vuelta a la calma
    expect(r.kcal).toBeGreaterThan(300);
  });

  test('el resumen semanal solo cuenta los días de la ventana', () => {
    const log = {
      '2026-08-01': [{ id: 'a', bloques: [{ min: 40, vel: 5, incl: 9 }] }],  // fuera de los 7 días
      '2026-08-10': [{ id: 'b', bloques: [{ min: 40, vel: 5, incl: 9 }] }],
      '2026-08-12': [{ id: 'c', bloques: [{ min: 30, vel: 5, incl: 6 }] }],
    };
    const r = getCardioSummary(log, 92, '2026-08-14', 7);
    expect(r.sesiones).toBe(2);
    expect(r.min).toBe(70);
    expect(r.inclMax).toBe(9);
  });

  test('todos los programas son caminata de verdad, no trote encubierto', () => {
    PROGRAMAS_CAMINATA.forEach(p => {
      expect(calcCardioSession(p, 92).fueraDeRango).toBe(false);
    });
  });
});

describe('sesión guiada de caminata', () => {
  const { walkStateAt, trimBlocksTo, AVISO_SEG, PROGRAMAS_CAMINATA } = require('./app.js');

  const PLAN = [
    { min: 5,  vel: 4.5, incl: 2 },
    { min: 30, vel: 5.2, incl: 9 },
    { min: 5,  vel: 4.0, incl: 0 },
  ];

  test('en el segundo 0 manda el primer bloque y anuncia el siguiente', () => {
    const e = walkStateAt(PLAN, 0);
    expect(e.idx).toBe(0);
    expect(e.bloque.incl).toBe(2);
    expect(e.siguiente.incl).toBe(9);
    expect(e.restanteBloque).toBe(300);
    expect(e.total).toBe(2400);
  });

  test('en el segundo exacto del cambio ya manda el bloque nuevo', () => {
    // Es lo que el usuario tiene delante en la cinta: a los 5:00 la cuesta ya
    // subió. Con `<=` en la comparación seguiría diciendo el bloque viejo.
    expect(walkStateAt(PLAN, 299).bloque.incl).toBe(2);
    expect(walkStateAt(PLAN, 300).bloque.incl).toBe(9);
  });

  test('avisa con antelación antes de cada cambio', () => {
    const antes = walkStateAt(PLAN, 300 - AVISO_SEG - 1);
    const dentro = walkStateAt(PLAN, 300 - AVISO_SEG);
    expect(antes.avisando).toBe(false);
    expect(dentro.avisando).toBe(true);
    expect(dentro.siguiente.incl).toBe(9);
  });

  test('no avisa en el último bloque: no hay nada a lo que cambiar', () => {
    // Avisar "prepárate" sin poder decir a qué es peor que no avisar
    const e = walkStateAt(PLAN, 2400 - 5);
    expect(e.siguiente).toBe(null);
    expect(e.avisando).toBe(false);
  });

  test('al pasar el tiempo total la sesión queda terminada', () => {
    const e = walkStateAt(PLAN, 2400);
    expect(e.terminado).toBe(true);
    expect(e.restanteTotal).toBe(0);
    expect(e.transcurrido).toBe(2400);
  });

  test('el tiempo transcurrido nunca se pasa del total ni baja de cero', () => {
    expect(walkStateAt(PLAN, 99999).transcurrido).toBe(2400);
    expect(walkStateAt(PLAN, -50).transcurrido).toBe(0);
    expect(walkStateAt(PLAN, -50).idx).toBe(0);
  });

  test('ignora los bloques de duración cero en vez de atascarse en ellos', () => {
    const e = walkStateAt([{ min: 0, vel: 5, incl: 5 }, { min: 10, vel: 5, incl: 9 }], 0);
    expect(e.bloque.incl).toBe(9);
    expect(e.total).toBe(600);
  });

  test('cortar a la mitad guarda lo hecho, no el plan entero', () => {
    const hechos = trimBlocksTo(PLAN, 20 * 60);   // se bajó a los 20 minutos
    expect(hechos).toHaveLength(2);
    expect(hechos[0].min).toBe(5);
    expect(hechos[1].min).toBe(15);               // 15 de los 30 previstos
    expect(hechos[1].incl).toBe(9);
  });

  test('terminar la sesión entera guarda exactamente el plan', () => {
    const hechos = trimBlocksTo(PLAN, 2400);
    expect(hechos.map(b => b.min)).toEqual([5, 30, 5]);
  });

  test('cortar antes de empezar no guarda nada', () => {
    expect(trimBlocksTo(PLAN, 0)).toEqual([]);
  });

  test('el programa de intervalos avisa en cada una de sus 16 transiciones', () => {
    const inter = PROGRAMAS_CAMINATA.find(p => p.key === 'intervalos');
    const cambios = [];
    let previo = null;
    for (let s = 0; s < 42 * 60; s++) {
      const e = walkStateAt(inter.bloques, s);
      if (previo !== null && e.idx !== previo) cambios.push(s);
      previo = e.idx;
    }
    expect(cambios).toHaveLength(17);             // 18 bloques → 17 cambios
    // Cada cambio tuvo su aviso previo salvo el último, que entra en el bloque final
    cambios.slice(0, -1).forEach(s => {
      expect(walkStateAt(inter.bloques, s - 1).avisando).toBe(true);
    });
  });
});

describe('días sin comida registrada', () => {
  const { buildDailyNutrition, averageDailyNutrition, calcTDEE, analyzeMacroPattern } = require('./app.js');

  // Un día de comida "normal" para no repetir el objeto en cada test
  const dia = (kcal, p = 150, c = 200, f = 60) => [{ kcal, proteina: p, carbo: c, grasa: f }];
  const semana = (desde, kcal, n = 7) => {
    const log = {};
    for (let i = 0; i < n; i++) {
      const d = new Date(desde + 'T12:00:00');
      d.setDate(d.getDate() + i);
      log[d.toISOString().slice(0, 10)] = dia(kcal);
    }
    return log;
  };

  test('rellena el hueco con el promedio de los días registrados cercanos', () => {
    const log = { ...semana('2026-07-01', 2000, 4) };
    delete log['2026-07-03'];               // olvidó anotar el día 3
    const serie = buildDailyNutrition(log, { desde: '2026-07-01', hasta: '2026-07-04' });
    expect(serie).toHaveLength(4);
    const hueco = serie.find(d => d.date === '2026-07-03');
    expect(hueco.estimado).toBe(true);
    expect(hueco.kcal).toBe(2000);
    expect(serie.filter(d => !d.estimado)).toHaveLength(3);
  });

  test('el promedio sale de los días CERCANOS, no de todo el historial', () => {
    // Volumen viejo a 3200 kcal y definición reciente a 2000: el hueco de julio
    // tiene que parecerse a julio, no a la media de los dos períodos.
    const log = { ...semana('2026-05-01', 3200, 20), ...semana('2026-06-20', 2000, 14) };
    delete log['2026-07-01'];
    const serie = buildDailyNutrition(log, { desde: '2026-07-01', hasta: '2026-07-01' });
    expect(serie[0].estimado).toBe(true);
    // Con el promedio de todo el historial saldrían ~2700 kcal; el hueco tiene
    // que quedarse pegado a la fase actual.
    expect(serie[0].kcal).toBeLessThan(2150);
  });

  test('no inventa comida lejos de cualquier registro real', () => {
    const log = semana('2026-04-01', 2000, 7);   // dejó de usar la app en abril
    const serie = buildDailyNutrition(log, { desde: '2026-07-01', hasta: '2026-07-03' });
    expect(serie.every(d => d.estimado === false && d.kcal === 0)).toBe(true);
  });

  test('con menos de tres días registrados no hay promedio que valga', () => {
    const log = { '2026-07-01': dia(2000), '2026-07-02': dia(2100) };
    const serie = buildDailyNutrition(log, { desde: '2026-07-01', hasta: '2026-07-04' });
    expect(serie.filter(d => d.estimado)).toHaveLength(0);
  });

  test('un día registrado nunca se sustituye por la estimación', () => {
    const log = { ...semana('2026-07-01', 2000, 6), '2026-07-07': dia(4500) }; // comilona real
    const serie = buildDailyNutrition(log, { desde: '2026-07-07', hasta: '2026-07-07' });
    expect(serie[0].estimado).toBe(false);
    expect(serie[0].kcal).toBe(4500);
  });

  test('el promedio del período cuenta los días estimados como un día más', () => {
    const log = semana('2026-07-01', 2000, 7);
    delete log['2026-07-06'];
    const prom = averageDailyNutrition(buildDailyNutrition(log, { desde: '2026-07-01', hasta: '2026-07-07' }));
    expect(prom.dias).toBe(7);
    expect(prom.diasReales).toBe(6);
    expect(prom.diasEstimados).toBe(1);
    expect(prom.kcal).toBe(2000);
  });

  test('el TDEE usa 21 días de calendario, no 21 días registrados', () => {
    // 24 días de calendario con 4 olvidos: antes hacían falta 21 días
    // registrados y la ventana de comida no cuadraba con la de peso.
    const log = semana('2026-07-01', 2500, 24);
    ['2026-07-05', '2026-07-11', '2026-07-18', '2026-07-22'].forEach(d => delete log[d]);
    const metrics = { '2026-07-04': { weight: 90 }, '2026-07-24': { weight: 90 } };
    const tdee = calcTDEE(log, metrics);
    expect(tdee).toBe(2500); // peso estable → TDEE = ingesta media
  });

  test('el TDEE se niega a calcularse si casi todo el período es estimado', () => {
    const log = semana('2026-07-01', 2500, 6);   // solo 6 días reales en 21
    const metrics = { '2026-07-01': { weight: 90 }, '2026-07-21': { weight: 90 } };
    expect(calcTDEE(log, metrics)).toBe(null);
  });

  test('el patrón de macros informa cuántos días son estimados', () => {
    const log = semana('2026-07-01', 2000, 7);
    delete log['2026-07-05'];
    delete log['2026-07-06'];
    const p = analyzeMacroPattern(log);
    expect(p.days).toBe(7);
    expect(p.diasReales).toBe(5);
    expect(p.diasEstimados).toBe(2);
    expect(p.avgKcal).toBe(2000);
  });
});

describe('cambios desde la última medición', () => {
  const { buildMetricChanges } = require('./app.js');

  test('sin dos mediciones no hay nada que comparar', () => {
    expect(buildMetricChanges({})).toEqual([]);
    expect(buildMetricChanges({ '2026-07-01': { weight: 90 } })).toEqual([]);
  });

  test('cada métrica se compara con la última vez que se midió ESA métrica', () => {
    // La cintura solo aparece en abril y en junio; el peso, en los tres días.
    // Comparar sin más contra "el día anterior" dejaría la cintura sin dato.
    const log = {
      '2026-04-15': { weight: 99, cintura: 99 },
      '2026-05-31': { weight: 95 },
      '2026-06-20': { weight: 93.5, cintura: 93.5 },
    };
    const filas = buildMetricChanges(log);
    const cintura = filas.find(f => f.k === 'cintura');
    expect(cintura.delta).toBe(-5.5);
    expect(cintura.desde).toBe('2026-04-15');
    expect(cintura.dias).toBe(66);

    const peso = filas.find(f => f.k === 'weight');
    expect(peso.delta).toBe(-1.5);
    expect(peso.desde).toBe('2026-05-31');
  });

  test('la dirección buena depende de la métrica, no del signo', () => {
    const log = {
      '2026-06-01': { weight: 95, cintura: 95, brazoDer: 35, musculo: 64 },
      '2026-07-01': { weight: 93, cintura: 93, brazoDer: 36, musculo: 64 },
    };
    const por = Object.fromEntries(buildMetricChanges(log).map(f => [f.k, f]));
    expect(por.cintura.bien).toBe(true);   // bajar cintura es progreso
    expect(por.brazoDer.bien).toBe(true);  // subir brazo también
    expect(por.musculo.bien).toBe(null);   // sin cambio no es ni bueno ni malo
  });

  test('el cambio relativo permite comparar kg con cm', () => {
    const log = {
      '2026-06-01': { weight: 100, cintura: 100 },
      '2026-07-01': { weight: 99, cintura: 95 },
    };
    const por = Object.fromEntries(buildMetricChanges(log).map(f => [f.k, f]));
    expect(por.weight.pct).toBe(-1);
    expect(por.cintura.pct).toBe(-5);
  });

  test('ignora ceros y valores no numéricos en lugar de contarlos como medición', () => {
    const log = {
      '2026-06-01': { weight: 95, cintura: 0 },
      '2026-06-15': { weight: 94, cintura: '' },
      '2026-07-01': { weight: 93, cintura: 92 },
    };
    const filas = buildMetricChanges(log);
    expect(filas.find(f => f.k === 'cintura')).toBeUndefined(); // una sola medida real
    expect(filas.find(f => f.k === 'weight').delta).toBe(-1);
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

describe('robustez con datos reales precargados', () => {
  const seed = (obj) => {
    Object.entries(obj).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('onboarding_shown', '1');
    const rootElement = document.getElementById('root') || document.createElement('div');
    rootElement.setAttribute('id', 'root');
    if (!rootElement.parentElement) document.body.appendChild(rootElement);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  const renderApp = async () => {
    const originalError = console.error;
    console.error = jest.fn();
    const App = require('./app').default;
    let utils;
    await act(async () => { utils = render(<App />); });
    console.error = originalError;
    return utils;
  };

  test('arranca sin datos (estado vacío) sin romperse', async () => {
    await renderApp();
    expect(screen.getAllByText('Hoy').length).toBeGreaterThan(0);
  });

  test('una sola medición de peso no rompe la tendencia ni la recomposición', async () => {
    // Caso límite: series de 1 punto (EMA y regresión necesitan >=2/>=3)
    seed({ metricslog: { '2026-07-01': { weight: 92, grasaPct: 24, cintura: 95 } } });
    await renderApp();
    const regTab = screen.getAllByText('Registro')[0].closest('button');
    await act(async () => { regTab.click(); });
    expect(screen.getAllByText('Perfil corporal y objetivos').length).toBeGreaterThan(0);
  });

  test('histórico completo de peso y entrenos renderiza todas las pestañas', async () => {
    const metricslog = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(2026, 5, 1 + i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      metricslog[k] = { weight: 95 - i * 0.15, grasaPct: 26 - i * 0.1, cintura: 98 - i * 0.1, fcReposo: 58 + (i % 5), suenoHoras: 7 + (i % 3) * 0.5 };
    }
    const exlog = { 'Press banca': [], 'Sentadilla': [] };
    for (let i = 0; i < 12; i++) {
      const d = new Date(2026, 5, 1 + i * 2, 10, 0, 0);
      exlog['Press banca'].push({ date: d.toISOString(), w: 80 + i, reps: 6, rir: 2, type: 'work' });
      exlog['Sentadilla'].push({ date: d.toISOString(), w: 110 + i, reps: 5, rir: 1, type: 'work' });
    }
    const foodlog = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(2026, 5, 1 + i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      foodlog[k] = [{ kcal: 2600, proteina: 200, carbo: 250, grasa: 70 }];
    }
    seed({ metricslog, exlog, foodlog });

    await renderApp();
    // Recorre todas las pestañas con datos cargados
    for (const tab of ['Entreno', 'Registro', 'Perfil', 'Coach', 'Hoy']) {
      const btn = screen.getAllByText(tab)[0].closest('button');
      await act(async () => { btn.click(); });
    }
    expect(screen.getAllByText('Hoy').length).toBeGreaterThan(0);
  });

  test('datos corruptos o parciales no tumban la app', async () => {
    seed({
      metricslog: {
        '2026-07-01': { weight: 'no-es-un-numero' },
        '2026-07-02': { weight: null },
        '2026-07-03': {},
        '2026-07-04': { weight: 90, grasaPct: 'x' },
      },
      exlog: {
        'Press banca': [
          { date: 'fecha-invalida', w: 80, reps: 6 },
          { date: '2026-07-04T10:00:00', w: null, reps: null },
          { date: '2026-07-05T10:00:00', w: 80, reps: 6, type: 'work' },
        ],
        'Vacío': [],
      },
      foodlog: { '2026-07-01': [{ kcal: 'abc' }] },
    });
    await renderApp();
    const regTab = screen.getAllByText('Registro')[0].closest('button');
    await act(async () => { regTab.click(); });
    const entTab = screen.getAllByText('Entreno')[0].closest('button');
    await act(async () => { entTab.click(); });
    expect(screen.getByText('ENTRENAMIENTO')).toBeInTheDocument();
  });
});

describe('invariantes de los cálculos (barrido amplio)', () => {
  const { calcCarbCycleTargets, calcNutritionTargets, DEFAULT_BODY_PROFILE, GOAL_PRESETS } = require('./app.js');

  test('el carb cycling conserva la media semanal en cualquier configuración', () => {
    const fallos = [];
    const bases = [
      { kcal: 2000, p: 160, c: 180, f: 60 },
      { kcal: 2600, p: 200, c: 265, f: 70 },
      { kcal: 3400, p: 200, c: 450, f: 90 },
    ];
    for (const base of bases) {
      for (let nTrain = 1; nTrain <= 7; nTrain++) {
        for (let nAlto = 0; nAlto <= nTrain; nAlto++) {
          for (const restCut of [0, 0.15, 0.25, 0.4]) {
            const nRest = 7 - nTrain, nMedio = nTrain - nAlto;
            const o = { trainingDaysPerWeek: nTrain, altoDaysPerWeek: nAlto, restCutPct: restCut };
            const alto = calcCarbCycleTargets(base, { ...o, dayType: 'alto' });
            const medio = calcCarbCycleTargets(base, { ...o, dayType: 'medio' });
            const rest = calcCarbCycleTargets(base, { ...o, dayType: 'descanso' });
            const semana = alto.c * nAlto + medio.c * nMedio + rest.c * nRest;
            const desv = Math.abs(semana - base.c * 7) / (base.c * 7);
            if (desv > 0.02) fallos.push(`c=${base.c} nTrain=${nTrain} nAlto=${nAlto} cut=${restCut} desv=${(desv * 100).toFixed(1)}%`);
          }
        }
      }
    }
    expect(fallos).toEqual([]);
  });

  test('los objetivos nutricionales cumplen sus invariantes en todo el rango', () => {
    const fallos = [];
    for (const sexo of ['hombre', 'mujer']) {
      for (const objetivo of Object.keys(GOAL_PRESETS)) {
        for (const weight of [50, 70, 90, 120, 150]) {
          for (const grasaPct of [0, 8, 15, 25, 40]) {
            for (const ritmo of [-1.5, -0.5, 0, 0.5]) {
              for (const edad of [18, 34, 70]) {
                const t = calcNutritionTargets(
                  { ...DEFAULT_BODY_PROFILE, sexo, objetivo, ritmoKgSemana: ritmo, edad },
                  { weight, grasaPct }
                );
                if (!t) { fallos.push(`sin resultado: ${weight}kg`); continue; }
                const id = `${sexo}/${objetivo}/${weight}kg/${grasaPct}%/${ritmo}/${edad}a`;
                // Las kcal siempre cuadran exactamente con los macros
                if (t.kcal !== t.p * 4 + t.c * 4 + t.f * 9) fallos.push(`kcal no cuadra: ${id}`);
                // Nunca por debajo del suelo de seguridad
                if (t.kcal < 1500) fallos.push(`bajo el mínimo: ${id} → ${t.kcal}`);
                // Todos los macros positivos y finitos
                for (const k of ['p', 'c', 'f', 'fibra', 'bmr', 'tdee']) {
                  if (!Number.isFinite(t[k]) || t[k] <= 0) fallos.push(`${k} inválido: ${id} → ${t[k]}`);
                }
              }
            }
          }
        }
      }
    }
    expect(fallos.slice(0, 10)).toEqual([]);
  });
});

describe('orden de ejecución de la sesión', () => {
  const {
    getSessionOrder, getDaySets, moveExerciseInSession, moveSetInSession,
    buildSessionSequence, calcSessionMuscleSets, buildDaySummary,
  } = require('./app.js');

  const DIA = '2026-03-10';
  // Hora local fija: usar Z desplazaría el día en zonas negativas
  const t = (h, m, s = 0) => new Date(2026, 2, 10, h, m, s).toISOString();

  // exlog tal y como lo deja addSet: cada array de más reciente a más antiguo
  const hacerLog = () => ({
    'Press banca': [
      { date: t(19, 10), w: 80, reps: 8, type: 'work' },
      { date: t(19, 5), w: 80, reps: 9, type: 'work' },
      { date: t(19, 0), w: 45, reps: 12, type: 'warmup' },
    ],
    // Tres series frente a las dos del press: si fueran simétricas, invertir el
    // orden daría exactamente el mismo resultado y el test no probaría nada
    'Aperturas': [
      { date: t(19, 35), w: 20, reps: 10, type: 'work' },
      { date: t(19, 30), w: 20, reps: 12, type: 'work' },
      { date: t(19, 25), w: 20, reps: 12, type: 'work' },
    ],
    'Curl martillo': [
      { date: t(19, 50), w: 16, reps: 10, type: 'work' },
    ],
    // Otro día: nunca debe mezclarse
    'Sentadilla': [{ date: new Date(2026, 2, 9, 19, 0).toISOString(), w: 100, reps: 5, type: 'work' }],
  });

  const EJERCICIOS = {
    A: [
      { name: 'Press banca', musculos: ['Pectoral', 'Tríceps', 'Hombro anterior'] },
      { name: 'Aperturas', musculos: ['Pectoral', 'Hombro anterior'] },
      { name: 'Curl martillo', musculos: ['Bíceps', 'Antebrazo'] },
      { name: 'Sentadilla', musculos: ['Cuádriceps', 'Glúteo'] },
    ],
  };

  test('ordena los ejercicios del día por hora y excluye otros días', () => {
    const nombres = getSessionOrder(hacerLog(), DIA).map(b => b.exName);
    expect(nombres).toEqual(['Press banca', 'Aperturas', 'Curl martillo']);
  });

  test('las series de un día salen de la primera a la última', () => {
    const sets = getDaySets(hacerLog()['Press banca'], DIA);
    expect(sets.map(s => s.reps)).toEqual([12, 9, 8]); // calentamiento primero
  });

  test('mover un ejercicio cambia el orden y conserva todas las series', () => {
    const log = hacerLog();
    const movido = moveExerciseInSession(log, DIA, 2, 0); // curl al principio
    expect(getSessionOrder(movido, DIA).map(b => b.exName))
      .toEqual(['Curl martillo', 'Press banca', 'Aperturas']);
    // Ni se pierden series ni se tocan las de otros días
    Object.keys(log).forEach(k => expect(movido[k]).toHaveLength(log[k].length));
    expect(movido['Sentadilla']).toEqual(log['Sentadilla']);
  });

  test('reordenar reutiliza las horas ya registradas: no inventa ninguna', () => {
    const log = hacerLog();
    const horas = (l) => Object.values(l).flat()
      .filter(s => s.date.startsWith('2026-03-10') || new Date(s.date).getDate() === 10)
      .map(s => s.date).sort();
    const movido = moveExerciseInSession(log, DIA, 0, 2);
    expect(horas(movido)).toEqual(horas(log));
  });

  test('el orden manual manda sobre el original en el análisis muscular', () => {
    const log = hacerLog();
    const antes = calcSessionMuscleSets(log, EJERCICIOS, DIA);
    // Aperturas primero: el pectoral llega fresco a ellas y fatigado al press
    const movido = moveExerciseInSession(log, DIA, 1, 0);
    const despues = calcSessionMuscleSets(movido, EJERCICIOS, DIA);
    const pecho = (arr) => arr.find(m => m.muscle === 'Pectoral');
    // Mismo volumen de series, distinto estímulo fresco según el orden
    expect(pecho(despues).weightedSets).toBeCloseTo(pecho(antes).weightedSets, 5);
    expect(pecho(despues).freshSets).not.toBeCloseTo(pecho(antes).freshSets, 5);
  });

  test('la secuencia numera 1º, 2º, 3º y la pre-fatiga crece con la posición', () => {
    const sec = buildSessionSequence(hacerLog(), EJERCICIOS, DIA);
    expect(sec.map(s => [s.pos, s.exName])).toEqual([
      [1, 'Press banca'], [2, 'Aperturas'], [3, 'Curl martillo'],
    ]);
    const pectoralEn = (i) => sec[i].prefatiga.find(p => p.muscle === 'Pectoral').pct;
    expect(pectoralEn(0)).toBe(0);          // primero: músculo fresco
    expect(pectoralEn(1)).toBeGreaterThan(0); // ya trabajado en el press
  });

  test('mover una serie la recoloca sin perder ni duplicar', () => {
    const log = hacerLog();
    const movido = moveSetInSession(log, 'Press banca', DIA, 0, 2); // calentamiento al final
    const sets = getDaySets(movido['Press banca'], DIA);
    expect(sets.map(s => s.type)).toEqual(['work', 'work', 'warmup']);
    expect(sets.map(s => s.reps).sort((a, b) => a - b)).toEqual([8, 9, 12]);
  });

  test('los movimientos fuera de rango no alteran nada', () => {
    const log = hacerLog();
    expect(moveExerciseInSession(log, DIA, 0, 9)).toBe(log);
    expect(moveExerciseInSession(log, DIA, -1, 0)).toBe(log);
    expect(moveExerciseInSession(log, DIA, 1, 1)).toBe(log);
    expect(moveSetInSession(log, 'Press banca', DIA, 0, 5)).toBe(log);
    expect(moveSetInSession(log, 'No existe', DIA, 0, 1)).toBe(log);
  });

  test('el resumen del día numera los ejercicios y lista las series en orden', () => {
    const r = buildDaySummary(hacerLog(), EJERCICIOS, DIA);
    expect(r.exercises.map(e => [e.pos, e.name])).toEqual([
      [1, 'Press banca'], [2, 'Aperturas'], [3, 'Curl martillo'],
    ]);
    // El calentamiento se hizo primero, así que encabeza la lista de series
    expect(r.exercises[0].sets[0].type).toBe('warmup');
    expect(r.sequence).toHaveLength(3);
    expect(r.analysis.join(' ')).toContain('Orden de ejecución');
  });

  test('un día sin registros no rompe nada', () => {
    expect(getSessionOrder({}, DIA)).toEqual([]);
    expect(getSessionOrder(null, DIA)).toEqual([]);
    expect(buildSessionSequence({}, EJERCICIOS, DIA)).toEqual([]);
    expect(getDaySets(undefined, DIA)).toEqual([]);
  });
});

describe('mapa muscular y balance (misma fuente de verdad)', () => {
  const { normalizeMuscle, calcMuscleVolumeBalance, SLUG_MUSCLE } = require('./app.js');

  const CANONICOS = ['Pectoral','Espalda','Cuádriceps','Isquios','Deltoides','Bíceps','Tríceps','Glúteos','Antebrazo','Core','Pantorrillas'];

  test('todo músculo del dibujo es uno de los 11 canónicos', () => {
    // "Abdominales" y "Gemelos" no lo eran: el abdomen y las pantorrillas no se
    // pintaban nunca porque el nombre no casaba con el del cálculo
    const invalidos = [];
    Object.entries(SLUG_MUSCLE).forEach(([lado, mapa]) => {
      Object.entries(mapa).forEach(([slug, m]) => {
        if (!CANONICOS.includes(m)) invalidos.push(`${lado}.${slug} → ${m}`);
        else if (normalizeMuscle(m) !== m) invalidos.push(`${lado}.${slug}: normalizeMuscle("${m}") = ${normalizeMuscle(m)}`);
      });
    });
    expect(invalidos).toEqual([]);
  });

  test('cada canónico se dibuja en alguna parte del cuerpo', () => {
    const dibujados = new Set([...Object.values(SLUG_MUSCLE.front), ...Object.values(SLUG_MUSCLE.back)]);
    expect(CANONICOS.filter(m => !dibujados.has(m))).toEqual([]);
  });

  test('un ejercicio propio con músculos detallados sí cuenta', () => {
    // Ni el nombre ni los músculos están en la tabla fija MUSCLES: antes esto
    // daba cero en el mapa aunque las tarjetas lo contaran
    const hoy = new Date().toISOString();
    const exlog = {
      'Sentadilla en multipower': [
        { date: hoy, w: 75, reps: 5, type: 'work' },
        { date: hoy, w: 75, reps: 5, type: 'work' },
      ],
      'Extensión de tríceps en polea alta': [
        { date: hoy, w: 30, reps: 12, type: 'work' },
        { date: hoy, w: 20, reps: 15, type: 'warmup' }, // el calentamiento no suma
      ],
    };
    const exercises = {
      B: [{ name: 'Sentadilla en multipower', musculos: ['Cuádriceps', 'Glúteo mayor', 'Isquiotibiales'] }],
      C: [{ name: 'Extensión de tríceps en polea alta', musculos: ['Tríceps braquial (cabeza larga)'] }],
    };
    const r = calcMuscleVolumeBalance(exlog, exercises, 7);
    expect(r['Cuádriceps'].setsPerWeek).toBeGreaterThan(0);
    expect(r['Glúteos'].setsPerWeek).toBeGreaterThan(0);
    expect(r['Isquios'].setsPerWeek).toBeGreaterThan(0);
    expect(r['Tríceps'].setsPerWeek).toBe(1);   // 1 serie efectiva, primaria
    expect(r['Pectoral'].setsPerWeek).toBe(0);
  });

  test('la ventana de días cambia el resultado', () => {
    const dias = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
    const exlog = { 'Press banca': [{ date: dias(20), w: 80, reps: 8, type: 'work' }] };
    const exercises = { A: [{ name: 'Press banca', musculos: ['Pectoral'] }] };
    expect(calcMuscleVolumeBalance(exlog, exercises, 7)['Pectoral'].setsPerWeek).toBe(0);
    expect(calcMuscleVolumeBalance(exlog, exercises, 30)['Pectoral'].setsPerWeek).toBeGreaterThan(0);
  });
});

describe('ejercicios sin músculos asignados', () => {
  const { inferMusclesFromName, musclesOfExercise, listUncountedExercises,
          calcMuscleVolumeBalance, normalizeMuscle, buildSessionSequence } = require('./app.js');

  test('deduce el músculo principal del nombre', () => {
    const casos = [
      ['Sentadilla en multipower', 'Cuádriceps'],
      ['Prensa 45 grados', 'Cuádriceps'],
      ['Peso muerto rumano', 'Isquios'],
      ['Curl femoral sentado', 'Isquios'],   // "curl" no debe ganarle a "femoral"
      ['Curl biceps supino inclinado', 'Bíceps'],
      ['Extensión de tríceps en polea alta', 'Tríceps'],
      ['Press cerrado', 'Tríceps'],          // "press" no debe ganarle a "cerrado"
      ['Press banca inclinado', 'Pectoral'],
      ['Elevación lateral con mancuernas', 'Deltoides'],
      ['Remo en punta', 'Espalda'],
      ['Elevación de piernas colgado', 'Core'],
      ['Gemelos de pie en máquina', 'Pantorrillas'],
    ];
    const fallos = casos.filter(([nombre, esperado]) => inferMusclesFromName(nombre)[0] !== esperado)
      .map(([nombre, esperado]) => `${nombre}: ${inferMusclesFromName(nombre)[0]} ≠ ${esperado}`);
    expect(fallos).toEqual([]);
  });

  test('lo deducido siempre es un músculo canónico', () => {
    const malos = [];
    ['Sentadilla', 'Press militar', 'Curl martillo', 'Jalón al pecho', 'Plancha abdominal']
      .forEach(n => inferMusclesFromName(n).forEach(m => { if (normalizeMuscle(m) !== m) malos.push(`${n} → ${m}`); }));
    expect(malos).toEqual([]);
  });

  test('el catálogo manda sobre la deducción', () => {
    const exercises = { A: [{ name: 'Sentadilla en multipower', musculos: ['Glúteo mayor'] }] };
    expect(musclesOfExercise('Sentadilla en multipower', exercises)).toEqual(['Glúteo mayor']);
    // Sin catálogo, se deduce en vez de quedarse en nada
    expect(musclesOfExercise('Sentadilla en multipower', {})[0]).toBe('Cuádriceps');
  });

  test('un ejercicio guardado sin músculos ya cuenta en el balance', () => {
    const hoy = new Date().toISOString();
    const exlog = { 'Sentadilla en multipower': [{ date: hoy, w: 75, reps: 5, type: 'work' }] };
    const exercises = { B: [{ name: 'Sentadilla en multipower', musculos: [] }] }; // la IA falló al añadirlo
    expect(calcMuscleVolumeBalance(exlog, exercises, 7)['Cuádriceps'].setsPerWeek).toBeGreaterThan(0);
    expect(listUncountedExercises(exlog, exercises, 7)).toEqual([]);
  });

  test('lo que no se reconoce se declara, no se esconde', () => {
    const hoy = new Date().toISOString();
    const exlog = { 'Rutina X': [{ date: hoy, w: 20, reps: 10, type: 'work' }] };
    expect(listUncountedExercises(exlog, {}, 7)).toEqual(['Rutina X']);
  });

  test('la fatiga se acumula aunque los músculos vengan con nombre detallado', () => {
    const t = (h) => new Date(2026, 2, 10, h, 0).toISOString();
    const exlog = {
      'Press banca': [{ date: t(19), w: 80, reps: 8, type: 'work' }],
      'Press cerrado': [{ date: t(20), w: 55, reps: 10, type: 'work' }],
    };
    const exercises = { A: [
      { name: 'Press banca', musculos: ['Pectoral mayor', 'Tríceps braquial'] },
      { name: 'Press cerrado', musculos: ['Tríceps braquial (cabeza larga)'] },
    ]};
    const sec = buildSessionSequence(exlog, exercises, '2026-03-10');
    // El tríceps del press banca y el del press cerrado son el mismo músculo:
    // el segundo ejercicio debe llegar con pre-fatiga, no a cero
    const tri = sec[1].prefatiga.find(p => p.muscle === 'Tríceps');
    expect(tri).toBeDefined();
    expect(tri.pct).toBeGreaterThan(0);
  });
});

describe('nombres de músculo equivalentes', () => {
  const { canonMuscleName, dedupeMuscles } = require('./app.js');

  test('mayúsculas, acentos y espacios no crean músculos nuevos', () => {
    const equivalentes = [
      ['braquial', 'Braquial', 'BRAQUIAL', ' braquial '],
      ['tríceps braquial', 'Triceps braquial', 'TRÍCEPS BRAQUIAL'],
      ['deltoides posterior', 'Deltoides Posterior', 'DELTOIDES  POSTERIOR'],
    ];
    equivalentes.forEach(grupo => {
      const distintos = new Set(grupo.map(canonMuscleName));
      expect([...distintos]).toHaveLength(1);
    });
  });

  test('un texto no reconocido se conserva, ordenado', () => {
    expect(canonMuscleName('  MÚSCULO   raro ')).toBe('Músculo raro');
    expect(canonMuscleName('')).toBe('');
    expect(canonMuscleName(null)).toBe('');
  });

  test('el resumen del día agrupa las variantes en un solo músculo', () => {
    const r = dedupeMuscles([
      ['Deltoides anterior', 'Tríceps braquial'],
      ['Deltoides lateral', 'Trapecio superior'],
      ['deltoides posterior'],
      ['Deltoides'],
    ]);
    expect(r).toEqual(['Deltoides', 'Espalda', 'Tríceps']); // 4 variantes → 1 entrada
    expect(r[0]).toBe('Deltoides');                          // el más trabajado, primero
  });

  test('un músculo repetido dentro del mismo ejercicio no cuenta doble', () => {
    const r = dedupeMuscles([
      ['Deltoides anterior', 'Deltoides lateral', 'Deltoides posterior'], // 1 ejercicio
      ['Pectoral mayor'],
      ['Pectoral menor'],
    ]);
    expect(r).toEqual(['Pectoral', 'Deltoides']); // pectoral en 2 ejercicios, deltoides en 1
  });
});

describe('mover un ejercicio de día', () => {
  const { moveExerciseBetweenSplits, splitOfExercise } = require('./app.js');

  const base = () => ({
    exercises: {
      A: [{ name: 'Press banca', musculos: ['Pectoral'] }],
      B: [{ name: 'Sentadilla', musculos: ['Cuádriceps'] }, { name: 'Pullover', musculos: ['Espalda'] }],
      C: [],
    },
    splits: [
      { key: 'A', name: 'Pecho + Bíceps', ex: ['Press banca'] },
      { key: 'B', name: 'Pierna Cuádriceps', ex: ['Sentadilla', 'Pullover'] },
      { key: 'C', name: 'Espalda + Tríceps', ex: [] },
    ],
  });

  test('sale del día viejo y entra en el nuevo, en las dos listas', () => {
    const { exercises, splits } = base();
    const r = moveExerciseBetweenSplits(exercises, splits, 'Pullover', 'C');
    expect(r.exercises.B.map(e => e.name)).toEqual(['Sentadilla']);
    expect(r.exercises.C.map(e => e.name)).toEqual(['Pullover']);
    expect(r.splits.find(s => s.key === 'B').ex).toEqual(['Sentadilla']);
    expect(r.splits.find(s => s.key === 'C').ex).toEqual(['Pullover']);
  });

  test('conserva los datos del ejercicio', () => {
    const { exercises, splits } = base();
    const r = moveExerciseBetweenSplits(exercises, splits, 'Pullover', 'A');
    expect(r.exercises.A.find(e => e.name === 'Pullover').musculos).toEqual(['Espalda']);
  });

  test('no muta lo que recibe', () => {
    const { exercises, splits } = base();
    moveExerciseBetweenSplits(exercises, splits, 'Pullover', 'C');
    expect(exercises.B.map(e => e.name)).toEqual(['Sentadilla', 'Pullover']);
    expect(splits.find(s => s.key === 'B').ex).toEqual(['Sentadilla', 'Pullover']);
  });

  test('un destino inexistente no cambia nada', () => {
    const { exercises, splits } = base();
    const r = moveExerciseBetweenSplits(exercises, splits, 'Pullover', 'Z');
    expect(r.exercises).toBe(exercises);
    expect(r.splits).toBe(splits);
  });

  test('moverlo a su propio día no lo duplica', () => {
    const { exercises, splits } = base();
    const r = moveExerciseBetweenSplits(exercises, splits, 'Pullover', 'B');
    expect(r.exercises.B.filter(e => e.name === 'Pullover')).toHaveLength(1);
    expect(r.splits.find(s => s.key === 'B').ex.filter(n => n === 'Pullover')).toHaveLength(1);
  });

  test('un ejercicio que solo estaba en la lista de nombres también se mueve', () => {
    const splits = [
      { key: 'A', name: 'Pecho', ex: ['Fondos'] },
      { key: 'C', name: 'Espalda', ex: [] },
    ];
    expect(splitOfExercise({}, splits, 'Fondos')).toBe('A');
    const r = moveExerciseBetweenSplits({}, splits, 'Fondos', 'C');
    expect(r.splits.find(s => s.key === 'A').ex).toEqual([]);
    expect(r.splits.find(s => s.key === 'C').ex).toEqual(['Fondos']);
    expect(r.exercises.C.map(e => e.name)).toEqual(['Fondos']); // se crea la ficha
  });

  test('el día de un ejercicio se lee del catálogo primero', () => {
    const { exercises, splits } = base();
    expect(splitOfExercise(exercises, splits, 'Sentadilla')).toBe('B');
    expect(splitOfExercise(exercises, splits, 'No existe')).toBeNull();
  });
});

describe('quitar de un día y ejercicios combinados', () => {
  const { removeExerciseFromSplitPure, makeComboExercise, buildComboSets } = require('./app.js');

  const base = () => ({
    exercises: {
      A: [{ name: 'Press banca', musculos: ['Pectoral', 'Tríceps'] },
          { name: 'Aperturas', musculos: ['Pectoral', 'Deltoides anterior'] }],
      B: [{ name: 'Sentadilla', musculos: ['Cuádriceps'] }],
    },
    splits: [
      { key: 'A', name: 'Pecho', ex: ['Press banca', 'Aperturas'] },
      { key: 'B', name: 'Pierna', ex: ['Sentadilla'] },
    ],
  });

  test('quitar de un día lo saca de las dos listas y no toca los otros días', () => {
    const { exercises, splits } = base();
    const r = removeExerciseFromSplitPure(exercises, splits, 'Aperturas', 'A');
    expect(r.exercises.A.map(e => e.name)).toEqual(['Press banca']);
    expect(r.splits.find(s => s.key === 'A').ex).toEqual(['Press banca']);
    expect(r.exercises.B).toEqual(exercises.B);
    // No muta lo que recibe
    expect(exercises.A).toHaveLength(2);
  });

  test('el combinado une nombres y músculos sin repetir', () => {
    const { exercises } = base();
    const c = makeComboExercise(['Press banca', 'Aperturas'], exercises);
    expect(c.name).toBe('Press banca + Aperturas');
    expect(c.combo).toEqual(['Press banca', 'Aperturas']);
    // "Deltoides anterior" y "Tríceps" se agrupan; el pectoral, en ambos, va primero
    expect(c.musculos[0]).toBe('Pectoral');
    expect(new Set(c.musculos).size).toBe(c.musculos.length);
    expect(c.tecnico).toMatch(/Biserie/);
    expect(makeComboExercise(['Press banca', 'Aperturas', 'Fondos'], exercises).tecnico).toMatch(/Triserie/);
  });

  test('hacen falta entre 2 y 3 ejercicios, y sin repetir', () => {
    const { exercises } = base();
    expect(makeComboExercise(['Press banca'], exercises)).toBeNull();
    expect(makeComboExercise([], exercises)).toBeNull();
    expect(makeComboExercise(['a', 'b', 'c', 'd'], exercises)).toBeNull();
    // Un duplicado no cuenta como segundo ejercicio
    expect(makeComboExercise(['Press banca', 'Press banca'], exercises)).toBeNull();
  });

  test('cada serie se guarda en SU ejercicio, unidas por comboId', () => {
    const fecha = new Date(2026, 2, 10, 19, 0).toISOString();
    const r = buildComboSets(['Press banca', 'Aperturas'],
      [{ w: '80', reps: '8', rir: '1' }, { w: '20', reps: '12', rir: '0' }], fecha);
    expect(r.map(x => x.exName)).toEqual(['Press banca', 'Aperturas']);
    expect(r[0].set.w).toBe(80);
    expect(r[1].set.reps).toBe('12');
    expect(r[0].set.comboId).toBe(r[1].set.comboId);       // misma vuelta
    expect(r[0].set.combo).toBe('Press banca + Aperturas');
    expect([r[0].set.comboPos, r[1].set.comboPos]).toEqual([1, 2]);
    // El orden dentro de la vuelta se conserva en la marca de tiempo
    expect(new Date(r[0].set.date).getTime()).toBeLessThan(new Date(r[1].set.date).getTime());
    // Nada se guarda bajo el nombre del combinado: duplicaría el volumen
    expect(r.some(x => x.exName.includes(' + '))).toBe(false);
  });

  test('una vuelta a medias no se registra', () => {
    const fecha = new Date(2026, 2, 10, 19, 0).toISOString();
    expect(buildComboSets(['A', 'B'], [{ w: '80', reps: '8' }, { w: '', reps: '' }], fecha)).toEqual([]);
    expect(buildComboSets(['A', 'B'], [{ w: '0', reps: '8' }, { w: '0', reps: '8' }], fecha)).toEqual([]);
    expect(buildComboSets(['A'], [{ w: '80', reps: '8' }], fecha)).toEqual([]);
    expect(buildComboSets(['A', 'B'], [{ w: '80' }, { w: '20' }], 'fecha mala')).toEqual([]);
  });

  test('sin reps ni RIR la serie sigue siendo válida', () => {
    const fecha = new Date(2026, 2, 10, 19, 0).toISOString();
    const r = buildComboSets(['A', 'B'], [{ w: '80' }, { w: '20', reps: '10' }], fecha);
    expect(r).toHaveLength(2);
    expect(r[0].set.reps).toBe('-');
    expect(r[0].set.rir).toBeNull();
    expect(r[0].set.type).toBe('work');
  });
});

describe('análisis: progreso y reparto muscular en %', () => {
  const { calcSessionMuscleSets, buildDaySummary } = require('./app.js');

  const t = (dia, h) => new Date(2026, 2, dia, h, 0).toISOString();
  // Día con 2 ejercicios de pecho y 1 de bíceps: el reparto en % es lo que
  // distingue "día de pecho" de "día de brazos"
  const EJ = { A: [
    { name: 'Press banca', musculos: ['Pectoral', 'Tríceps'] },
    { name: 'Aperturas', musculos: ['Pectoral'] },
    { name: 'Curl martillo', musculos: ['Bíceps'] },
  ]};
  const log = () => ({
    'Press banca': [
      { date: t(10, 19), w: 90, reps: 8, type: 'work' },
      { date: t(10, 19), w: 90, reps: 7, type: 'work' },
      { date: t(3, 19), w: 85, reps: 8, type: 'work' },
      { date: t(1, 19), w: 82.5, reps: 8, type: 'work' },
    ],
    'Aperturas': [
      { date: t(10, 20), w: 22, reps: 12, type: 'work' },
      { date: t(10, 20), w: 22, reps: 12, type: 'work' },
    ],
    'Curl martillo': [{ date: t(10, 21), w: 16, reps: 10, type: 'work' }],
  });

  test('los porcentajes reparten el trabajo y suman ~100', () => {
    const m = calcSessionMuscleSets(log(), EJ, '2026-03-10');
    const total = m.reduce((a, x) => a + x.sharePct, 0);
    expect(Math.abs(total - 100)).toBeLessThanOrEqual(2);   // redondeo
    const pecho = m.find(x => x.muscle === 'Pectoral');
    const biceps = m.find(x => x.muscle === 'Bíceps');
    expect(pecho.sharePct).toBeGreaterThan(biceps.sharePct);
    expect(pecho.exCount).toBe(2);                          // dos ejercicios de pecho
    expect(biceps.exCount).toBe(1);
  });

  test('un día de un solo músculo se lleva el 100%', () => {
    const solo = { 'Curl martillo': [{ date: t(10, 21), w: 16, reps: 10, type: 'work' }] };
    const m = calcSessionMuscleSets(solo, EJ, '2026-03-10');
    expect(m[0].muscle).toBe('Bíceps');
    expect(m[0].sharePct).toBe(100);
  });

  test('cada ejercicio trae sus sesiones previas para juzgar el progreso', () => {
    const r = buildDaySummary(log(), EJ, '2026-03-10');
    const press = r.exercises.find(e => e.name === 'Press banca');
    // De la más reciente a la más antigua, sin incluir hoy
    expect(press.recentSessions.map(x => x.maxW)).toEqual([85, 82.5]);
    expect(press.deltaVsPrev).toBe(5);        // 90 hoy vs 85 la anterior
    expect(press.topW).toBe(90);
    // Un ejercicio sin historial no inventa sesiones previas
    expect(r.exercises.find(e => e.name === 'Aperturas').recentSessions).toEqual([]);
  });

  test('el resumen del día expone el reparto en porcentaje', () => {
    const r = buildDaySummary(log(), EJ, '2026-03-10');
    expect(r.muscles.every(m => typeof m.sharePct === 'number')).toBe(true);
    expect(r.muscles[0].sharePct).toBeGreaterThan(0);
  });
});

describe('porción muscular en vez de grupo entero', () => {
  const { muscleDetail, calcSessionMuscleDetail, buildDaySummary } = require('./app.js');

  test('afina el grupo grueso a partir del ejercicio', () => {
    const casos = [
      ['Espalda', 'Jalón al pecho', 'Dorsal ancho'],
      ['Espalda', 'Encogimiento con mancuernas', 'Trapecio'],
      ['Espalda', 'Peso muerto', 'Erector espinal'],
      ['Pectoral', 'Press inclinado mancuerna', 'Pectoral superior'],
      ['Pectoral', 'Press banca', 'Pectoral medio'],
      ['Deltoides', 'Vuelos laterales', 'Deltoides lateral'],
      ['Deltoides', 'Press militar', 'Deltoides anterior'],
      ['Deltoides', 'Vuelos posteriores polea', 'Deltoides posterior'],
      ['Pantorrillas', 'Elevación de gemelos sentado', 'Sóleo'],
      ['Tríceps', 'Extensión sobre cabeza', 'Tríceps cabeza larga'],
    ];
    const fallos = casos.filter(([m, ex, esp]) => muscleDetail(m, ex) !== esp)
      .map(([m, ex, esp]) => `${m} en "${ex}": ${muscleDetail(m, ex)} ≠ ${esp}`);
    expect(fallos).toEqual([]);
  });

  test('"unilateral" no es "lateral"', () => {
    // El fallo real: /lateral/ sin \b dispara con "unilateral"
    expect(muscleDetail('Deltoides', 'Prensa de piernas unilateral')).not.toBe('Deltoides lateral');
    expect(muscleDetail('Glúteos', 'Prensa de piernas 45 grados unilateral')).toBe('Glúteo mayor');
    expect(muscleDetail('Deltoides', 'Elevación lateral')).toBe('Deltoides lateral');
  });

  test('respeta el detalle que ya trae el músculo', () => {
    expect(muscleDetail('Deltoides posterior', 'Press banca')).toBe('Deltoides posterior');
    expect(muscleDetail('Dorsal ancho', 'Sentadilla')).toBe('Dorsal ancho');
    expect(muscleDetail('Vasto medial', 'Sentadilla')).toBe('Vasto medial');
    // Mayúsculas y acentos siguen sin crear porciones nuevas
    expect(muscleDetail('DELTOIDES POSTERIOR', 'x')).toBe(muscleDetail('deltoides posterior', 'x'));
  });

  test('no se inventa una porción del cuádriceps: ningún ejercicio las separa', () => {
    expect(muscleDetail('Cuádriceps', 'Sentadilla')).toBe('Cuádriceps');
    expect(muscleDetail('Cuádriceps', 'Prensa 45°')).toBe('Cuádriceps');
  });

  test('el reparto por porción suma ~100 y marca principales', () => {
    const t = (h) => new Date(2026, 2, 10, h, 0).toISOString();
    const exlog = {
      'Jalón al pecho': [{ date: t(19), w: 60, reps: 10, type: 'work' }, { date: t(19), w: 60, reps: 10, type: 'work' }],
      'Vuelos laterales': [{ date: t(20), w: 10, reps: 15, type: 'work' }],
    };
    const ejercicios = { C: [
      { name: 'Jalón al pecho', musculos: ['Espalda', 'Bíceps'] },
      { name: 'Vuelos laterales', musculos: ['Deltoides', 'Trapecio superior'] },
    ]};
    const d = calcSessionMuscleDetail(exlog, ejercicios, '2026-03-10');
    const nombres = d.map(x => x.muscle);
    expect(nombres).toContain('Dorsal ancho');       // no "Espalda"
    expect(nombres).toContain('Deltoides lateral');  // no "Deltoides"
    expect(Math.abs(d.reduce((a, x) => a + x.sharePct, 0) - 100)).toBeLessThanOrEqual(3);
    expect(d.find(x => x.muscle === 'Dorsal ancho').principal).toBe(true);
    // El resumen del día lo expone para la IA
    expect(buildDaySummary(exlog, ejercicios, '2026-03-10').detail.length).toBe(d.length);
  });
});

describe('mediciones de InBody: guardado y lectura', () => {
  const { normalizeBodyEntry, mergeMetricsUpTo, calcNutritionTargets, DEFAULT_BODY_PROFILE } = require('./app.js');

  test('traduce el vocabulario del informe al de la app', () => {
    // El informe trae "masaMuscular"; toda la app lee `musculo`
    const e = normalizeBodyEntry({ peso: 92.3, grasaPct: 24.5, masaMuscular: 64.7, visceral: 9 });
    expect(e.weight).toBe(92.3);
    expect(e.musculo).toBe(64.7);
  });

  test('deduce el músculo cuando el informe no lo da directo', () => {
    // Solo SMM
    expect(normalizeBodyEntry({ peso: 90, smmKg: 40 }).musculo).toBe(40);
    // Solo porcentaje de músculo esquelético
    expect(normalizeBodyEntry({ peso: 90, musculoEsq: 45 }).musculo).toBe(40.5);
    // Peso sin grasa menos hueso
    expect(normalizeBodyEntry({ peso: 90, pesoSinGrasa: 68, masaOsea: 3.2 }).musculo).toBe(64.8);
    // Prioridad: masa muscular gana a SMM (son cosas distintas, ~65 vs ~38 kg)
    expect(normalizeBodyEntry({ peso: 92, masaMuscular: 64.7, smmKg: 38.1 }).musculo).toBe(64.7);
  });

  test('deduce el % de grasa desde la masa grasa', () => {
    expect(normalizeBodyEntry({ peso: 92, masaGrasa: 23 }).grasaPct).toBe(25);
    // Si ya viene, no se toca
    expect(normalizeBodyEntry({ peso: 92, masaGrasa: 23, grasaPct: 24.1 }).grasaPct).toBe(24.1);
  });

  test('una pesada normal al día siguiente ya no borra la composición', () => {
    // El fallo real: se leía SOLO la entrada más reciente, así que el martes
    // la app perdía el % de grasa y la masa muscular del InBody del lunes
    const log = {
      '2026-03-10': { weight: 92.3, grasaPct: 24.5, masaMuscular: 64.7, visceral: 9, cintura: 96 },
      '2026-03-11': { weight: 91.8, fuente: 'bascula' },
    };
    const m = mergeMetricsUpTo(log, '2026-03-11');
    expect(m.weight).toBe(91.8);      // el peso sí es el nuevo
    expect(m.musculo).toBe(64.7);     // la composición se arrastra
    expect(m.grasaPct).toBe(24.5);
    expect(m.cintura).toBe(96);
  });

  test('lo que describe un día concreto no se arrastra', () => {
    const log = {
      '2026-03-10': { weight: 92, pasos: 12000, suenoHoras: 8, fcReposo: 54 },
      '2026-03-11': { weight: 91.8 },
    };
    const m = mergeMetricsUpTo(log, '2026-03-11');
    expect(m.pasos).toBeUndefined();     // los pasos de ayer no son los de hoy
    expect(m.suenoHoras).toBeUndefined();
    expect(m.fcReposo).toBeUndefined();
    // Pero el mismo día sí se leen
    expect(mergeMetricsUpTo(log, '2026-03-10').pasos).toBe(12000);
  });

  test('no mira mediciones posteriores a la fecha consultada', () => {
    const log = {
      '2026-03-10': { weight: 92, grasaPct: 25 },
      '2026-03-20': { weight: 89, grasaPct: 22 },
    };
    expect(mergeMetricsUpTo(log, '2026-03-15').weight).toBe(92);
    expect(mergeMetricsUpTo(log, '2026-03-15').grasaPct).toBe(25);
  });

  test('con la composición bien leída, los objetivos cambian de verdad', () => {
    // Es el motivo por el que el plan salía mal: sin `musculo`, Katch-McArdle
    // usaba la masa magra por defecto y el BMR no se movía
    const conInbody = calcNutritionTargets(DEFAULT_BODY_PROFILE, normalizeBodyEntry({ peso: 92, grasaPct: 18, masaMuscular: 70 }));
    const sinComposicion = calcNutritionTargets(DEFAULT_BODY_PROFILE, normalizeBodyEntry({ peso: 92, grasaPct: 32, masaMuscular: 55 }));
    expect(conInbody.kcal).not.toBe(sinComposicion.kcal);
    expect(conInbody.p).toBeGreaterThan(sinComposicion.p);   // más magro → más proteína
  });

  test('entradas vacías o corruptas no rompen nada', () => {
    expect(normalizeBodyEntry(null)).toEqual({});
    expect(normalizeBodyEntry("x")).toEqual({});
    expect(mergeMetricsUpTo(null, '2026-03-11')).toEqual({});
    expect(mergeMetricsUpTo({ '2026-03-10': null }, '2026-03-11')).toEqual({});
    expect(normalizeBodyEntry({ peso: "no", masaMuscular: "" }).musculo).toBeUndefined();
  });
});

describe('respuestas de IA cortadas a medias', () => {
  const { repairTruncatedJSON, cleanAndParseJSON } = require('./app.js');

  test('cierra un array cortado descartando el elemento incompleto', () => {
    // Es el fallo real: el modelo agota el cupo a mitad de la lista
    const cortado = '{"muscleGroups":[{"name":"Pecho","exercises":[{"name":"Press banca","workSets":[{"weight":90,"reps":8}]},{"name":"Ape';
    const r = JSON.parse(repairTruncatedJSON(cortado));
    expect(r.muscleGroups[0].name).toBe('Pecho');
    expect(r.muscleGroups[0].exercises).toHaveLength(1);       // se descarta el incompleto
    expect(r.muscleGroups[0].exercises[0].name).toBe('Press banca');
  });

  test('corta dentro de una cadena y aun así salva lo anterior', () => {
    const cortado = '{"a":1,"notas":["uno","dos","tre';
    const r = JSON.parse(repairTruncatedJSON(cortado));
    expect(r.a).toBe(1);
    expect(r.notas).toEqual(['uno', 'dos']);
  });

  test('no toca un JSON que está completo', () => {
    expect(repairTruncatedJSON('{"a":1,"b":[1,2]}')).toBeNull();
    expect(repairTruncatedJSON('[1,2,3]')).toBeNull();
  });

  test('no se inventa nada si no hay nada que salvar', () => {
    expect(repairTruncatedJSON('{"a')).toBeNull();
    expect(repairTruncatedJSON('')).toBeNull();
  });

  test('las llaves de escape no confunden al reparador', () => {
    const cortado = '{"txt":"con \\"comillas\\" dentro","lista":[1,2,3';
    const r = JSON.parse(repairTruncatedJSON(cortado));
    expect(r.txt).toBe('con "comillas" dentro');
    expect(r.lista).toEqual([1, 2]);
  });

  test('cleanAndParseJSON repara en vez de reventar', () => {
    const cortado = '```json\n{"plan":[{"ej":"Press","series":3},{"ej":"Ape';
    const r = cleanAndParseJSON(cortado);
    expect(r.plan).toHaveLength(1);
    // Y cuando de verdad no hay nada que hacer, el mensaje es entendible
    expect(() => cleanAndParseJSON('no soy json')).toThrow(/incompleta o mal formada/);
  });
});

describe('revisión de la lectura del informe corporal', () => {
  const { validateBodyMetrics } = require('./app.js');

  test('detecta el mismo número en kg y en % — el fallo real del informe', () => {
    // "Músculo esquelético: 42.9 kg" y "Músculo esquelético: 42.9 %"
    const { entry, avisos } = validateBodyMetrics(
      { peso: 92.1, grasaPct: 25.1, smmKg: 42.9, musculoEsq: 42.9 }, 180);
    expect(entry.musculoEsq).toBeCloseTo(46.6, 0);   // 42.9 / 92.1
    expect(avisos.join(" ")).toMatch(/musculoEsq/);
  });

  test('rellena lo que falta con las identidades físicas', () => {
    const { entry } = validateBodyMetrics({ peso: 92.1, grasaPct: 25.1, masaOsea: 4.6 }, 180);
    expect(entry.masaGrasa).toBeCloseTo(23.1, 1);      // 92.1 × 25.1%
    expect(entry.pesoSinGrasa).toBeCloseTo(69, 1);     // 92.1 − 23.1
    expect(entry.masaMuscular).toBeCloseTo(64.4, 1);   // 69 − 4.6
    expect(entry.musculo).toBeCloseTo(64.4, 1);        // lo que lee el resto de la app
    expect(entry.imc).toBeCloseTo(28.4, 1);            // 92.1 / 1.8²
  });

  test('corrige un valor que se contradice con el resto', () => {
    const { entry, avisos } = validateBodyMetrics(
      { peso: 92.1, grasaPct: 25.1, masaGrasa: 31 }, 180);   // 31 no cuadra con 25.1%
    expect(entry.masaGrasa).toBeCloseTo(23.1, 1);
    expect(avisos.join(" ")).toMatch(/masaGrasa/);
  });

  test('descarta lecturas imposibles en vez de guardarlas', () => {
    const { entry, avisos } = validateBodyMetrics({ peso: 92, grasaPct: 251, visceral: 400 }, 180);
    expect(entry.grasaPct).toBeUndefined();
    expect(entry.visceral).toBeUndefined();
    expect(avisos.length).toBeGreaterThanOrEqual(2);
  });

  test('cuando puede, repara el orden imposible en vez de solo avisar', () => {
    // Masa muscular 80 con peso sin grasa 69: se recalcula desde la identidad
    const { entry, avisos } = validateBodyMetrics(
      { peso: 92, grasaPct: 25, masaMuscular: 80, pesoSinGrasa: 69, masaOsea: 4.6 }, 180);
    expect(entry.masaMuscular).toBeCloseTo(64.4, 1);
    expect(avisos.join(" ")).toMatch(/masaMuscular/);
  });

  test('avisa cuando el orden es imposible y no hay forma de repararlo', () => {
    // El músculo esquelético no puede superar a la masa muscular total, y aquí
    // no hay ninguna identidad de la que recalcularlo
    const { avisos } = validateBodyMetrics(
      { peso: 92, grasaPct: 25, smmKg: 70, masaMuscular: 64.4, pesoSinGrasa: 69, masaOsea: 4.6 }, 180);
    expect(avisos.join(" ")).toMatch(/no puede superar/);
  });

  test('una lectura correcta no genera ruido', () => {
    const { avisos } = validateBodyMetrics(
      { peso: 92.1, imc: 28.4, grasaPct: 25.1, masaGrasa: 23.1, pesoSinGrasa: 69,
        masaOsea: 4.6, masaMuscular: 64.4, visceral: 9 }, 180);
    expect(avisos).toEqual([]);
  });

  test('sin altura no inventa el IMC, y sin peso no rompe', () => {
    expect(validateBodyMetrics({ peso: 92, grasaPct: 25 }, null).entry.imc).toBeUndefined();
    expect(validateBodyMetrics({}, 180).avisos).toEqual([]);
    expect(validateBodyMetrics(null, 180).entry).toEqual({});
  });
});

describe('serie de evolución: qué es dato y qué es relleno', () => {
  const { buildRecompositionSeries } = require('./app.js');

  const log = {
    '2026-03-01': { weight: 92.1, grasaPct: 25.1, masaGrasa: 23.1, pesoSinGrasa: 69, fuente: 'inbody' },
    '2026-03-02': { weight: 91.8, fuente: 'bascula' },
    '2026-03-03': { weight: 91.6, fuente: 'bascula' },
  };

  test('usa la composición MEDIDA, no la derivada del peso suavizado', () => {
    // El fallo real: 93.8 × 74.9% = 70.3 cuando el informe medía 69
    const p = buildRecompositionSeries(log).points[0];
    expect(p.magra).toBe(69);
    expect(p.grasaKg).toBe(23.1);
    expect(p.composicionMedida).toBe(true);
    expect(p.fuente).toBe('inbody');
  });

  test('distingue día pesado de día con composición medida', () => {
    const pts = buildRecompositionSeries(log).points;
    expect(pts.every(p => p.pesado)).toBe(true);              // se pesó los 3 días
    expect(pts.filter(p => p.composicionMedida)).toHaveLength(1); // el InBody, solo uno
  });

  test('en los días sin composición arrastra el último % conocido', () => {
    const pts = buildRecompositionSeries(log).points;
    expect(pts[1].grasaPct).toBe(25.1);
    expect(pts[1].composicionMedida).toBe(false);
    // Y ahí sí se deriva, porque no hay medición de ese día
    expect(pts[1].magra).toBeCloseTo(91.8 * 0.749, 0);
  });

  test('el peso de un día pesado es el de ese día, no el suavizado', () => {
    const pts = buildRecompositionSeries(log).points;
    expect(pts[0].peso).toBe(92.1);
    expect(typeof pts[0].pesoTendencia).toBe('number');   // el suavizado sigue disponible aparte
  });
});

describe('qué se recomienda hoy y qué es variante', () => {
  const { recommendDayExercises } = require('./app.js');

  const HOY = new Date(2026, 2, 20, 12, 0);
  const dia = (n) => { const d = new Date(HOY); d.setDate(d.getDate() - n); return d.toISOString(); };
  const sesionesDe = (pesos, cada = 4) => pesos.flatMap((w, i) =>
    [{ date: dia((pesos.length - 1 - i) * cada + 1), w, reps: 8, type: 'work' }]);

  const exercises = { B: [
    { name: 'Sentadilla', musculos: ['Cuádriceps'] },
    { name: 'Prensa 45°', musculos: ['Cuádriceps'] },
    { name: 'Extensión cuádriceps', musculos: ['Cuádriceps'] },
    { name: 'Sentadilla búlgara', musculos: ['Cuádriceps'] },
    { name: 'Vuelos laterales', musculos: ['Deltoides'] },
  ]};

  test('lo que sube de carga se recomienda; lo estancado pasa a variante', () => {
    const exlog = {
      'Sentadilla': sesionesDe([100, 105, 110, 115, 120, 125]),        // subiendo
      'Prensa 45°': sesionesDe([180, 180, 180, 180, 180, 180]),        // estancada
      'Extensión cuádriceps': sesionesDe([40, 42, 45, 47, 50, 52]),    // subiendo
      'Sentadilla búlgara': sesionesDe([30, 30, 30, 30, 30, 30]),      // estancada
      'Vuelos laterales': sesionesDe([10, 11, 12]),
    };
    const r = recommendDayExercises(exlog, exercises, 'B', { hoy: HOY });
    const de = (n) => r.find(x => x.name === n);
    expect(de('Sentadilla').rol).toBe('recomendado');
    expect(de('Sentadilla').motivo).toMatch(/subiendo/);
    expect(de('Sentadilla búlgara').rol).toBe('variante');
    expect(de('Sentadilla búlgara').motivo).toMatch(/estancado/);
    // Toda variante dice a quién sustituye, y ese alguien está en la sesión
    r.filter(x => x.rol === 'variante').forEach(v => {
      expect(de(v.sustituyeA).rol).not.toBe('variante');
      expect(de(v.sustituyeA).grupo).toBe(v.grupo);
    });
  });

  test('como mucho 3 recomendados por grupo', () => {
    const exlog = {};
    exercises.B.forEach(e => { exlog[e.name] = sesionesDe([50, 55, 60, 65]); });
    const r = recommendDayExercises(exlog, exercises, 'B', { hoy: HOY });
    const porGrupo = {};
    r.filter(x => x.rol !== 'variante').forEach(x => { porGrupo[x.grupo] = (porGrupo[x.grupo] || 0) + 1; });
    expect(porGrupo['Cuádriceps']).toBe(3);
    expect(porGrupo['Deltoides']).toBe(1);   // solo hay uno, y no se queda sin
  });

  test('un ejercicio abandonado pierde prioridad y lo dice', () => {
    const exlog = {
      'Sentadilla': [{ date: dia(70), w: 120, reps: 5, type: 'work' }],
      'Prensa 45°': sesionesDe([180, 185, 190, 195]),
      'Extensión cuádriceps': sesionesDe([40, 45, 50, 55]),
      'Sentadilla búlgara': sesionesDe([30, 32, 34, 36]),
    };
    const r = recommendDayExercises(exlog, exercises, 'B', { hoy: HOY });
    expect(r.find(x => x.name === 'Sentadilla').motivo).toMatch(/días sin hacerlo/);
  });

  test('sin historial no rompe y se marca como tal', () => {
    const r = recommendDayExercises({}, exercises, 'B', { hoy: HOY });
    expect(r).toHaveLength(5);
    expect(r.every(x => ['recomendado', 'rotar', 'nuevo', 'variante'].includes(x.rol))).toBe(true);
    expect(r.find(x => x.name === 'Vuelos laterales').rol).toBe('nuevo');
    expect(recommendDayExercises(null, null, 'B')).toEqual([]);
  });

  test('el compuesto ancla el grupo por encima del aislamiento', () => {
    const exlog = {
      'Sentadilla': sesionesDe([100, 102, 104]),
      'Extensión cuádriceps': sesionesDe([40, 45, 50, 55, 60, 65]),
    };
    const r = recommendDayExercises(exlog, exercises, 'B', { hoy: HOY });
    const sent = r.find(x => x.name === 'Sentadilla');
    expect(sent.rol).not.toBe('variante');
    expect(sent.compuesto).toBe(true);
  });
});

describe('el estado "rotar" no se contradice con "recomendado"', () => {
  const { recommendDayExercises } = require('./app.js');
  const HOY = new Date(2026, 2, 20, 12, 0);
  const dia = (n) => { const d = new Date(HOY); d.setDate(d.getDate() - n); return d.toISOString(); };

  test('un ejercicio que entra pero está estancado se marca ROTAR, no RECOMENDADO', () => {
    // Grupo con solo 2 ejercicios: los dos entran, pero uno está agotado
    const exercises = { A: [
      { name: 'Curl martillo', musculos: ['Bíceps'] },
      { name: 'Curl inclinado', musculos: ['Bíceps'] },
    ]};
    const exlog = {
      'Curl martillo': [16, 16, 16, 16].map((w, i) => ({ date: dia((3 - i) * 4 + 1), w, reps: 8, type: 'work' })),
      'Curl inclinado': [12, 14, 16, 18].map((w, i) => ({ date: dia((3 - i) * 4 + 1), w, reps: 8, type: 'work' })),
    };
    const r = recommendDayExercises(exlog, exercises, 'A', { hoy: HOY });
    const martillo = r.find(x => x.name === 'Curl martillo');
    expect(martillo.rol).toBe('rotar');
    expect(martillo.motivo).toMatch(/estancado/);
    expect(r.find(x => x.name === 'Curl inclinado').rol).toBe('recomendado');
  });

  test('los grupos salen en el orden del día, no alfabético', () => {
    const exercises = { B: [
      { name: 'Sentadilla', musculos: ['Cuádriceps'] },
      { name: 'Vuelos laterales', musculos: ['Deltoides'] },
    ]};
    const r = recommendDayExercises({}, exercises, 'B', { hoy: HOY });
    expect(r.map(x => x.grupo)).toEqual(['Cuádriceps', 'Deltoides']);
  });

  test('ningún recomendado lleva un motivo negativo', () => {
    const exercises = { A: [
      { name: 'Press banca', musculos: ['Pectoral'] },
      { name: 'Aperturas', musculos: ['Pectoral'] },
    ]};
    const exlog = {
      'Press banca': [90, 90, 90, 90].map((w, i) => ({ date: dia((3 - i) * 4 + 1), w, reps: 8, type: 'work' })),
      'Aperturas': [{ date: dia(80), w: 20, reps: 12, type: 'work' }],
    };
    const r = recommendDayExercises(exlog, exercises, 'A', { hoy: HOY });
    r.filter(x => x.rol === 'recomendado').forEach(x => {
      expect(x.motivo).not.toMatch(/estancado|bajando|sin hacerlo/);
    });
  });
});

describe('sin datos no es lo mismo que agotado', () => {
  const { recommendDayExercises } = require('./app.js');
  const HOY = new Date(2026, 2, 20, 12, 0);

  test('un ejercicio nunca hecho se marca NUEVO, no ROTAR', () => {
    const exercises = { A: [{ name: 'Aperturas', musculos: ['Pectoral'] }] };
    const r = recommendDayExercises({}, exercises, 'A', { hoy: HOY });
    expect(r[0].rol).toBe('nuevo');
    expect(r[0].motivo).toMatch(/carga se estimará/);
    expect(r[0].motivo).not.toMatch(/estancado|agotado/);
  });
});

describe('historial de mediciones: describir y borrar', () => {
  const { describeMeasurement, deleteMeasurement } = require('./app.js');

  test('resume qué contiene una medición', () => {
    const d = describeMeasurement({ weight: 92.3, grasaPct: 24.5, musculo: 64.7, cintura: 96, fuente: 'inbody' });
    expect(d.texto).toContain('92.3 kg');
    expect(d.texto).toContain('24.5% grasa');
    expect(d.texto).toContain('cintura 96 cm');
    expect(d.fuente).toBe('inbody');
    expect(d.campos).toBeGreaterThan(3);
  });

  test('cuenta perímetros y datos de recuperación en bloque', () => {
    const d = describeMeasurement({ weight: 92, brazoDer: 38, brazoIzq: 37.5, pasos: 9000, suenoHoras: 7 });
    expect(d.texto).toContain('2 perímetros');
    expect(d.texto).toContain('2 datos de recuperación');
  });

  test('traduce el vocabulario del informe al describir', () => {
    // masaMuscular → musculo, igual que en el resto de la app
    expect(describeMeasurement({ peso: 92, masaMuscular: 64.7 }).texto).toContain('64.7 kg músculo');
  });

  test('una medición vacía se dice, no se finge', () => {
    expect(describeMeasurement({}).texto).toBe('sin datos');
    expect(describeMeasurement(null).texto).toBe('sin datos');
  });

  test('borrar quita solo esa fecha y no muta el original', () => {
    const log = { '2026-03-10': { weight: 92 }, '2026-03-11': { weight: 91.8 } };
    const r = deleteMeasurement(log, '2026-03-10');
    expect(Object.keys(r)).toEqual(['2026-03-11']);
    expect(Object.keys(log)).toHaveLength(2);
  });

  test('borrar una fecha que no existe no rompe nada', () => {
    const log = { '2026-03-10': { weight: 92 } };
    expect(deleteMeasurement(log, '2026-01-01')).toBe(log);
    expect(deleteMeasurement(null, '2026-01-01')).toEqual({});
    expect(deleteMeasurement(log, null)).toBe(log);
  });

  test('tras borrar, la composición vigente deja de verlo', () => {
    const { mergeMetricsUpTo } = require('./app.js');
    const log = {
      '2026-03-10': { weight: 92, grasaPct: 25 },
      '2026-03-11': { weight: 129 },      // el typo que envenena la tendencia
    };
    expect(mergeMetricsUpTo(log, '2026-03-11').weight).toBe(129);
    const limpio = deleteMeasurement(log, '2026-03-11');
    expect(mergeMetricsUpTo(limpio, '2026-03-11').weight).toBe(92);
    expect(mergeMetricsUpTo(limpio, '2026-03-11').grasaPct).toBe(25);
  });
});

describe('respuestas de texto cortadas', () => {
  // Misma regla que aplica MarkdownText: quitar SOLO el ** que queda suelto
  const limpiar = (t) => t.split("\n").map(l => {
    const pares = (l.match(/\*\*/g) || []).length;
    return pares % 2 === 1 ? l.replace(/\*\*(?!.*\*\*)/, "") : l;
  }).join("\n");
  const esSeparador = (t) => /^-{2,}$|^\*{3,}$|^_{3,}$/.test(t.trim());

  test('quita el marcador sin cerrar de una respuesta truncada', () => {
    expect(limpiar("**Día del Split B:")).toBe("Día del Split B:");
  });

  test('no rompe el markdown bien cerrado', () => {
    // El primer intento sí lo rompía: dejaba "**Día: normal"
    expect(limpiar("**Día:** normal")).toBe("**Día:** normal");
    expect(limpiar("**a** y **b**")).toBe("**a** y **b**");
    expect(limpiar("texto sin marcas")).toBe("texto sin marcas");
  });

  test('con varios pares y uno suelto, quita solo el suelto', () => {
    expect(limpiar("**a** y **b** y **cortado")).toBe("**a** y **b** y cortado");
  });

  test('una línea de guiones es un separador, no texto', () => {
    expect(esSeparador("--")).toBe(true);
    expect(esSeparador("---")).toBe(true);
    expect(esSeparador("***")).toBe(true);
    expect(esSeparador("- item")).toBe(false);
    expect(esSeparador("-")).toBe(false);
  });
});

describe('la cintura entra en el gráfico aunque ese día no haya pesada', () => {
  const { buildRecompositionSeries } = require('./app.js');

  // Las cuatro medidas reales, en días sin pesada: es como se mide la cintura
  const soloCintura = {
    '2026-04-15': { cintura: 99, cinturaAyunas: true },
    '2026-05-31': { cintura: 95, cinturaAyunas: true },
    '2026-06-20': { cintura: 93.5, cinturaAyunas: true },
    '2026-08-05': { cintura: 92, cinturaAyunas: true },
  };

  test('un día con solo cintura ya no se descarta', () => {
    // El fallo: se exigía peso para incluir el día, así que estas cuatro
    // mediciones nunca entraban en la serie
    const r = buildRecompositionSeries(soloCintura);
    expect(r.points).toHaveLength(4);
    expect(r.points.map(p => p.cintura)).toEqual([99, 95, 93.5, 92]);
  });

  test('el cambio de cintura es el real, no cero', () => {
    const r = buildRecompositionSeries(soloCintura);
    expect(r.deltas.cintura).toBe(-7);   // 99 → 92, lo que decía el otro panel
  });

  test('sin pesada ese día no se inventa un punto de peso', () => {
    const r = buildRecompositionSeries(soloCintura);
    expect(r.points.every(p => p.peso == null)).toBe(true);
    expect(r.points.every(p => p.pesado === false)).toBe(true);
  });

  test('mezclando pesadas y medidas de cintura, cada serie usa lo suyo', () => {
    const mixto = {
      '2026-04-15': { cintura: 99 },
      '2026-04-16': { weight: 95.8 },
      '2026-08-05': { cintura: 92, weight: 92.1 },
    };
    const r = buildRecompositionSeries(mixto);
    expect(r.points).toHaveLength(3);
    expect(r.points[0].peso).toBeNull();          // día de solo cintura
    expect(r.points[1].peso).toBe(95.8);
    expect(r.points[1].cintura).toBe(99);         // se arrastra el último conocido
    expect(r.deltas.cintura).toBe(-7);
    expect(r.deltas.peso).toBeCloseTo(-3.7, 1);
  });

  test('un día sin ningún dato sigue fuera', () => {
    const r = buildRecompositionSeries({
      '2026-04-15': { cintura: 99 },
      '2026-04-16': { notas: "nada medible" },
      '2026-08-05': { cintura: 92 },
    });
    expect(r.points).toHaveLength(2);
  });
});
