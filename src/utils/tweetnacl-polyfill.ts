// TweetNacl polyfill to fix the "no PRNG" error
import { Buffer } from 'buffer';

// Type definitions for global extensions
declare global {
  interface Window {
    Buffer?: typeof Buffer;
    global?: Window;
    randombytes?: (n: number) => Uint8Array;
    randomBytes?: (n: number) => Uint8Array;
    nacl?: {
      setPRNG: (fn: (x: Uint8Array, n: number) => void) => void;
    };
  }
  
  interface GlobalThis {
    randombytes?: (n: number) => Uint8Array;
    randomBytes?: (n: number) => Uint8Array;
  }
}

// Make sure Buffer is available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window;
}

// Set up crypto.getRandomValues if not available
if (typeof window !== 'undefined' && window.crypto && !window.crypto.getRandomValues) {
  window.crypto.getRandomValues = (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Create a robust random number generator
const createRandomBytes = (n: number): Uint8Array => {
  const bytes = new Uint8Array(n);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    // Fallback to Math.random
    for (let i = 0; i < n; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
};

// Patch tweetnacl's randombytes function globally
if (typeof window !== 'undefined') {
  // Override the global randombytes function that tweetnacl uses
  window.randombytes = createRandomBytes;
  window.randomBytes = createRandomBytes;
  
  // Also patch the global scope
  (globalThis as unknown as { randombytes: (n: number) => Uint8Array }).randombytes = createRandomBytes;
  (globalThis as unknown as { randomBytes: (n: number) => Uint8Array }).randomBytes = createRandomBytes;
}

// Export a function to initialize tweetnacl when it's loaded
export const initTweetNacl = () => {
  if (typeof window === 'undefined') return;

  try {
    // Try to get tweetnacl from the global scope
    const nacl = window.nacl;
    if (nacl && nacl.setPRNG) {
      nacl.setPRNG((x: Uint8Array, n: number) => {
        const randomBytes = createRandomBytes(n);
        x.set(randomBytes);
      });
    }
  } catch (error) {
    console.warn('Failed to initialize tweetnacl PRNG:', error);
  }
};

// Auto-initialize when the module loads
if (typeof window !== 'undefined') {
  // Try to initialize immediately
  window.setTimeout(initTweetNacl, 0);
  
  // Also try when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTweetNacl);
  }
  
  // Try again after a short delay to ensure all modules are loaded
  window.setTimeout(initTweetNacl, 100);
}
