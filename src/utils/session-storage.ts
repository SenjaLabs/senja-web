// Session storage utilities for wallet state persistence

export interface WalletSession {
  account: string | null;
  chainId: number | null;
  walletType: 'wagmi' | 'dapp-portal' | null;
  isConnected: boolean;
  lastConnected: number;
  autoReconnect: boolean;
}

const WALLET_SESSION_KEY = 'wallet_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save wallet session to localStorage
 */
export function saveWalletSession(session: Partial<WalletSession>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentSession = getWalletSession();
    const updatedSession: WalletSession = {
      ...currentSession,
      ...session,
      lastConnected: Date.now(),
    };
    
    localStorage.setItem(WALLET_SESSION_KEY, JSON.stringify(updatedSession));
    console.log('💾 Wallet session saved:', updatedSession);
  } catch (error) {
    console.error('Failed to save wallet session:', error);
  }
}

/**
 * Get wallet session from localStorage
 */
export function getWalletSession(): WalletSession {
  const defaultSession: WalletSession = {
    account: null,
    chainId: null,
    walletType: null,
    isConnected: false,
    lastConnected: 0,
    autoReconnect: true,
  };

  if (typeof window === 'undefined') return defaultSession;
  
  try {
    const stored = localStorage.getItem(WALLET_SESSION_KEY);
    if (!stored) return defaultSession;
    
    const session: WalletSession = JSON.parse(stored);
    
    // Check if session is expired
    if (Date.now() - session.lastConnected > SESSION_TIMEOUT) {
      console.log('🕒 Wallet session expired, clearing...');
      clearWalletSession();
      return defaultSession;
    }
    
    return { ...defaultSession, ...session };
  } catch (error) {
    console.error('Failed to get wallet session:', error);
    return defaultSession;
  }
}

/**
 * Clear wallet session
 */
export function clearWalletSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(WALLET_SESSION_KEY);
    console.log('🗑️ Wallet session cleared');
  } catch (error) {
    console.error('Failed to clear wallet session:', error);
  }
}

/**
 * Check if wallet should auto-reconnect
 */
export function shouldAutoReconnect(): boolean {
  const session = getWalletSession();
  return session.autoReconnect && session.isConnected && session.account !== null;
}

/**
 * Set auto-reconnect preference
 */
export function setAutoReconnect(enabled: boolean): void {
  saveWalletSession({ autoReconnect: enabled });
}

/**
 * Get last connected wallet type
 */
export function getLastWalletType(): 'wagmi' | 'dapp-portal' | null {
  const session = getWalletSession();
  return session.walletType;
}

/**
 * Session storage for chain preferences
 */
export function saveChainPreference(chainId: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('preferred_chain_id', chainId.toString());
  } catch (error) {
    console.error('Failed to save chain preference:', error);
  }
}

export function getChainPreference(): number | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('preferred_chain_id');
    return stored ? parseInt(stored, 10) : null;
  } catch (error) {
    console.error('Failed to get chain preference:', error);
    return null;
  }
}
