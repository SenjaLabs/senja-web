// Global polyfills that work with both webpack and Turbopack
// This file should be imported as early as possible

// Set up global variables
if (typeof window !== 'undefined') {
  // Make sure we have crypto.getRandomValues
  if (!window.crypto) {
    (window as any).crypto = {};
  }
  
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = (array: any) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }

  // Set up Buffer polyfill
  if (!(window as any).Buffer) {
    try {
      const { Buffer } = require('buffer');
      (window as any).Buffer = Buffer;
      (window as any).global = window;
    } catch (e) {
      console.warn('Could not load Buffer polyfill:', e);
    }
  }

  // Set up process polyfill
  if (!(window as any).process) {
    (window as any).process = {
      env: {},
      nextTick: (fn: Function) => setTimeout(fn, 0),
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
  (window as any).randombytes = createRandomBytes;
  (window as any).randomBytes = createRandomBytes;
  
  // Also set up in global scope
  (global as any).randombytes = createRandomBytes;
  (global as any).randomBytes = createRandomBytes;

  // Patch tweetnacl if it's already loaded
  const patchTweetNacl = () => {
    try {
      // Try to get tweetnacl from various possible locations
      const nacl = (window as any).nacl || (global as any).nacl;
      if (nacl && nacl.setPRNG) {
        nacl.setPRNG((x: Uint8Array, n: number) => {
          const randomBytes = createRandomBytes(n);
          x.set(randomBytes);
        });
        console.log('TweetNacl PRNG patched successfully');
      }
      
      // Also patch the global randombytes function that tweetnacl might use
      if (typeof (global as any).randombytes === 'function') {
        (global as any).randombytes = createRandomBytes;
      }
      
      // Patch any existing randombytes function
      if (typeof (window as any).randombytes === 'function') {
        (window as any).randombytes = createRandomBytes;
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
  console.log('Global polyfills applied');
};
