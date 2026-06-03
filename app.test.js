import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

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
