// Global polyfills that work with both webpack and Turbopack
// This file should be imported as early as possible

// Type definitions for global extensions
declare global {
  interface Window {
    crypto: {
      getRandomValues?: (array: Uint8Array) => Uint8Array;
    };
    Buffer?: typeof Buffer;
    global?: Window;
    process?: {
      env: Record<string, string | undefined>;
      nextTick: (fn: () => void) => void;
      version: string;
      versions: Record<string, string>;
    };
    randombytes?: (n: number) => Uint8Array;
    randomBytes?: (n: number) => Uint8Array;
    nacl?: {
      setPRNG: (fn: (x: Uint8Array, n: number) => void) => void;
    };
  }
  
  interface GlobalThis {
    randombytes?: (n: number) => Uint8Array;
    randomBytes?: (n: number) => Uint8Array;
    nacl?: {
      setPRNG: (fn: (x: Uint8Array, n: number) => void) => void;
    };
  }
}

// Set up global variables
if (typeof window !== 'undefined') {
  // Make sure we have crypto.getRandomValues
  if (!window.crypto) {
    (window as { crypto: { getRandomValues?: (array: Uint8Array) => Uint8Array } }).crypto = {};
  }
  
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }

  // Set up Buffer polyfill
  if (!window.Buffer) {
    try {
      // Use dynamic import instead of require
      import('buffer').then(({ Buffer }) => {
        window.Buffer = Buffer;
        window.global = window;
      }).catch((e) => {
        console.warn('Could not load Buffer polyfill:', e);
      });
    } catch (e) {
      console.warn('Could not load Buffer polyfill:', e);
    }
  }

  // Set up process polyfill
  if (!window.process) {
    (window as { process: { env: Record<string, string | undefined>; nextTick: (fn: () => void) => void; version: string; versions: Record<string, string> } }).process = {
      env: {},
      nextTick: (fn: () => void) => setTimeout(fn, 0),
      version: '',
      versions: {},
    };
  }

  // Create a working randombytes function
  const createRandomBytes = (n: number): Uint8Array => {
    const bytes = new Uint8Array(n);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < n; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    return bytes;
  };

  // Override the global randombytes function that tweetnacl uses
  window.randombytes = createRandomBytes;
  window.randomBytes = createRandomBytes;
  
  // Also set up in global scope
  (globalThis as unknown as { randombytes: (n: number) => Uint8Array }).randombytes = createRandomBytes;
  (globalThis as unknown as { randomBytes: (n: number) => Uint8Array }).randomBytes = createRandomBytes;

  // Patch tweetnacl if it's already loaded
  const patchTweetNacl = () => {
    try {
      // Try to get tweetnacl from various possible locations
      const nacl = window.nacl || (globalThis as { nacl?: { setPRNG: (fn: (x: Uint8Array, n: number) => void) => void } }).nacl;
      if (nacl && nacl.setPRNG) {
        nacl.setPRNG((x: Uint8Array, n: number) => {
          const randomBytes = createRandomBytes(n);
          x.set(randomBytes);
        });
      }
      
      // Also patch the global randombytes function that tweetnacl might use
      if (typeof (globalThis as unknown as { randombytes?: (n: number) => Uint8Array }).randombytes === 'function') {
        (globalThis as unknown as { randombytes: (n: number) => Uint8Array }).randombytes = createRandomBytes;
      }
      
      // Patch any existing randombytes function
      if (typeof window.randombytes === 'function') {
        window.randombytes = createRandomBytes;
      }
    } catch (error) {
      console.warn('Failed to patch tweetnacl:', error);
    }
  };

  // Try to patch immediately and on various events
  patchTweetNacl();
  setTimeout(patchTweetNacl, 0);
  setTimeout(patchTweetNacl, 100);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchTweetNacl);
  }
}

// Export the polyfill function
export const applyGlobalPolyfills = () => {
  // This function can be called to ensure polyfills are applied
};
