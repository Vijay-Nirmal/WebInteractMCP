/**
 * Test setup file for Web Intract MCP library
 */

// Mock Shepherd.js if not available
(globalThis as any).Shepherd = (globalThis as any).Shepherd || {
  Tour: class MockTour {
    constructor() {
      // Mock implementation
    }
    
    addStep(): any {
      return this;
    }
    
    start(): any {
      return this;
    }
    
    cancel(): any {
      return this;
    }
    
    complete(): any {
      return this;
    }
    
    on(): any {
      return this;
    }
  }
};

// Mock DOM APIs if needed
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: any) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

// Mock fetch if needed
(globalThis as any).fetch = (globalThis as any).fetch || (() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  statusText: 'OK',
  status: 200
}));

// Mock console methods to reduce noise in tests
const originalConsole = console;
if (typeof (globalThis as any).jest !== 'undefined') {
  const jestMock = (globalThis as any).jest;
  (global as any).console = {
    ...originalConsole,
    log: jestMock.fn(),
    warn: jestMock.fn(),
    error: originalConsole.error, // Keep error for debugging
  };
}

export {};
