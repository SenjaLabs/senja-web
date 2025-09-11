// Crypto polyfills for browser environment
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
}

// Polyfill for crypto.getRandomValues if not available
if (typeof window !== 'undefined' && window.crypto && !window.crypto.getRandomValues) {
  window.crypto.getRandomValues = (array: any) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Ensure process is available
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = {
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
    version: '',
    versions: {},
  };
}

// Initialize tweetnacl with proper random number generator
if (typeof window !== 'undefined') {
  // Set up global random number generator for tweetnacl
  const setupRandomBytes = () => {
    // Create a global randomBytes function that tweetnacl can use
    (window as any).randomBytes = (n: number) => {
      const bytes = new Uint8Array(n);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(bytes);
      } else {
        // Fallback to Math.random
        for (let i = 0; i < n; i++) {
          bytes[i] = Math.floor(Math.random() * 256);
        }
      }
      return bytes;
    };
  };

  // Initialize immediately
  setupRandomBytes();

  // Also try to initialize tweetnacl if it's available
  const initTweetNacl = () => {
    try {
      // Check if tweetnacl is already loaded
      if ((window as any).nacl) {
        const nacl = (window as any).nacl;
        nacl.setPRNG((x: Uint8Array, n: number) => {
          if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(x.subarray(0, n));
          } else {
            for (let i = 0; i < n; i++) {
              x[i] = Math.floor(Math.random() * 256);
            }
          }
        });
      }
    } catch (error) {
      console.warn('Failed to initialize tweetnacl:', error);
    }
  };

  // Try to initialize tweetnacl immediately and on DOM ready
  initTweetNacl();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTweetNacl);
  }
}
