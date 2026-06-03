import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
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
    expect(screen.getAllByText('Plan').length).toBeGreaterThan(0);

    console.error = originalError;
  });

  test('renders AI space header', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const App = require('./app').default;

    await act(async () => {
      render(<App />);
    });

    expect(screen.getAllByText('Espacio IA · Bruno').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CENTRO DE MANDO').length).toBeGreaterThan(0);

    console.error = originalError;
  });

  test('preset buttons exist', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const App = require('./app').default;

    await act(async () => {
      render(<App />);
    });

    // click on the Coach button first to reveal the settings button
    const coachTabButton = screen.getAllByText('Coach')[0].closest('button');
    await act(async () => {
        coachTabButton.click();
    });

    // click on the settings button first to reveal the preset buttons
    const settingsButton = screen.getByText('Ajustes').closest('button');
    await act(async () => {
        settingsButton.click();
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

    const planTabButton = screen.getAllByText('Plan')[0].closest('button');

    await act(async () => {
      planTabButton.click();
    });

    expect(screen.getByText('TU PLAN: DEFINICIÓN')).toBeInTheDocument();

    console.error = originalError;
  });
});

describe('Hoy tab functionalities', () => {
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
