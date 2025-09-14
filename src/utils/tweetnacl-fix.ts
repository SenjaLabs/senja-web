// Direct fix for tweetnacl "no PRNG" error
// This file should be imported before any tweetnacl usage

// Type for crypto.getRandomValues
type GetRandomValuesFunction = (array: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | null) => Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | null;

// Set up global polyfills first
if (typeof window !== 'undefined') {
  // Make sure we have crypto.getRandomValues
  if (!window.crypto.getRandomValues) {
    (window.crypto as { getRandomValues: GetRandomValuesFunction }).getRandomValues = (array: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | null) => {
      if (!array) return array;
      const typedArray = array as Uint8Array;
      for (let i = 0; i < typedArray.length; i++) {
        typedArray[i] = Math.floor(Math.random() * 256);
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
  (window as typeof window & { randombytes: typeof workingRandomBytes }).randombytes = workingRandomBytes;
  (global as typeof globalThis & { randombytes: typeof workingRandomBytes }).randombytes = workingRandomBytes;
  
  // Also set up Buffer if not available
  if (!(window as typeof window & { Buffer?: typeof Buffer }).Buffer) {
    try {
      import('buffer').then(({ Buffer }) => {
        (window as typeof window & { Buffer: typeof Buffer }).Buffer = Buffer;
      }).catch((e) => {
        console.warn('Could not load Buffer polyfill:', e);
      });
    } catch (e) {
      console.warn('Could not load Buffer polyfill:', e);
    }
  }
}

// Export a function to ensure the fix is applied
export const ensureTweetNaclFix = () => {
  if (typeof window === 'undefined') return;
  
  // Create a working randombytes function
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
  
  // Double-check that our fix is in place
  if (!(window as typeof window & { randombytes?: typeof workingRandomBytes }).randombytes) {
    (window as typeof window & { randombytes: typeof workingRandomBytes }).randombytes = workingRandomBytes;
  }
};

// Auto-apply the fix
ensureTweetNaclFix();
