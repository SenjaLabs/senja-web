// Direct fix for tweetnacl "no PRNG" error
// This file should be imported before any tweetnacl usage

// Set up global polyfills first
if (typeof window !== 'undefined') {
  // Make sure we have crypto.getRandomValues
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = (array: any) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }

  // Create a working randombytes function
  const workingRandomBytes = (n: number): Uint8Array => {
    const bytes = new Uint8Array(n);
    window.crypto.getRandomValues(bytes);
    return bytes;
  };

  // Override the global randombytes function
  (window as any).randombytes = workingRandomBytes;
  (global as any).randombytes = workingRandomBytes;
  
  // Also set up Buffer if not available
  if (!(window as any).Buffer) {
    try {
      const { Buffer } = require('buffer');
      (window as any).Buffer = Buffer;
    } catch (e) {
      console.warn('Could not load Buffer polyfill:', e);
    }
  }
}

// Export a function to ensure the fix is applied
export const ensureTweetNaclFix = () => {
  if (typeof window === 'undefined') return;
  
  // Double-check that our fix is in place
  if (!(window as any).randombytes) {
    const workingRandomBytes = (n: number): Uint8Array => {
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
    (window as any).randombytes = workingRandomBytes;
  }
};

// Auto-apply the fix
ensureTweetNaclFix();
