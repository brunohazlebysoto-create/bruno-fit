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

  test('isCompoundExercise y estimate1RM', () => {
    expect(isCompoundExercise('Sentadilla trasera')).toBe(true);
    expect(isCompoundExercise('Curl de bíceps')).toBe(false);
    expect(estimate1RM(100, 0)).toBe(0);
    expect(estimate1RM(100, 10)).toBeCloseTo(133.33, 1);
  });
});
