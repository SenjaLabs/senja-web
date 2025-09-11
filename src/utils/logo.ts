/**
 * Utility functions for managing logo caching and preloading
 */

const LOGO_CACHE_KEY = "senja-logo-cached";
const LOGO_URL = "/beary/beary.png";

export const logoUtils = {
  /**
   * Check if logo is already cached in session
   */
  isLogoCached(): boolean {
    if (typeof window === "undefined") return false;
    
    try {
      return sessionStorage.getItem(LOGO_CACHE_KEY) === "true";
    } catch (error) {
      console.warn("sessionStorage not available for logo cache");
      return false;
    }
  },

  /**
   * Mark logo as cached in session
   */
  markLogoCached(): void {
    if (typeof window === "undefined") return;
    
    try {
      sessionStorage.setItem(LOGO_CACHE_KEY, "true");
    } catch (error) {
      console.warn("Could not cache logo state");
    }
  },

  /**
   * Preload logo image
   * Returns a Promise that resolves when the logo is loaded
   */
  preloadLogo(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isLogoCached()) {
        resolve();
        return;
      }

      const img = document.createElement('img');
      
      img.onload = () => {
        this.markLogoCached();
        resolve();
      };
      
      img.onerror = () => {
        console.warn("Failed to preload logo:", LOGO_URL);
        reject(new Error("Logo preload failed"));
      };
      
      img.src = LOGO_URL;
    });
  },

  /**
   * Get logo URL
   */
  getLogoUrl(): string {
    return LOGO_URL;
  },

  /**
   * Clear logo cache (for testing/debugging)
   */
  clearLogoCache(): void {
    if (typeof window === "undefined") return;
    
    try {
      sessionStorage.removeItem(LOGO_CACHE_KEY);
    } catch (error) {
      console.warn("Could not clear logo cache");
    }
  }
};
