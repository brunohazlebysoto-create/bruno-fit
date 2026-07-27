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
