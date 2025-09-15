// Crypto polyfills for browser environment
import { Buffer } from 'buffer';

// Type definitions for global extensions
declare global {
  interface Window {
    Buffer?: typeof Buffer;
    global?: Window;
    process?: {
      env: Record<string, string | undefined>;
      nextTick: (fn: () => void) => void;
      version: string;
      versions: Record<string, string>;
    };
    randomBytes?: (n: number) => Uint8Array;
    nacl?: {
      setPRNG: (fn: (x: Uint8Array, n: number) => void) => void;
    };
  }
}

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window;
}

// Polyfill for crypto.getRandomValues if not available
if (typeof window !== 'undefined' && window.crypto && !window.crypto.getRandomValues) {
  window.crypto.getRandomValues = (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Ensure process is available
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
      NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    },
    nextTick: (fn: () => void) => setTimeout(fn, 0),
    version: 'v16.0.0',
    versions: {
      http_parser: '2.9.4',
      node: '16.0.0',
      v8: '9.0.0',
      ares: '1.17.2',
      uv: '1.41.0',
      zlib: '1.2.11',
      modules: '93',
      openssl: '1.1.1k',
    },
  } as typeof window.process;
}

// Initialize tweetnacl with proper random number generator
if (typeof window !== 'undefined') {
  // Set up global random number generator for tweetnacl
  const setupRandomBytes = () => {
    // Create a global randomBytes function that tweetnacl can use
    window.randomBytes = (n: number) => {
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
      if (window.nacl) {
        const nacl = window.nacl;
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
