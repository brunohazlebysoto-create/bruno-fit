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
