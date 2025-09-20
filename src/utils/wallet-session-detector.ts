// Wallet session detector untuk mendeteksi session wallet yang sudah ada

export interface DetectedWalletSession {
  type: 'okx' | 'metamask' | 'coinbase' | 'walletconnect' | 'unknown';
  address?: string;
  chainId?: number;
  isConnected: boolean;
  provider?: any;
}

/**
 * Deteksi session OKX wallet
 */
export function detectOKXSession(): DetectedWalletSession {
  if (typeof window === 'undefined') {
    return { type: 'okx', isConnected: false };
  }

  try {
    // Check if OKX wallet is available
    const okxWallet = (window as any).okxwallet;
    const ethereum = (window as any).ethereum;
    
    if (okxWallet) {
      console.log('🦊 OKX Wallet detected');
      
      // Check if OKX is connected
      if (okxWallet.isConnected && okxWallet.isConnected()) {
        console.log('✅ OKX Wallet is connected');
        
        // Try to get current account
        if (okxWallet.selectedAddress) {
          console.log('📝 OKX Address found:', okxWallet.selectedAddress);
          return {
            type: 'okx',
            address: okxWallet.selectedAddress,
            chainId: okxWallet.chainId ? parseInt(okxWallet.chainId, 16) : undefined,
            isConnected: true,
            provider: okxWallet,
          };
        }
      }
    }
    
    // Fallback: Check if ethereum provider is OKX
    if (ethereum && ethereum.isOkxWallet) {
      console.log('🦊 OKX detected via ethereum provider');
      
      // Check localStorage for OKX session data
      const okxSession = localStorage.getItem('okx-wallet-session');
      const okxAccount = localStorage.getItem('okx-wallet-account');
      
      if (okxSession || okxAccount) {
        console.log('💾 OKX session found in localStorage');
        return {
          type: 'okx',
          address: okxAccount || undefined,
          isConnected: true,
          provider: ethereum,
        };
      }
    }
    
    return { type: 'okx', isConnected: false };
  } catch (error) {
    console.error('Error detecting OKX session:', error);
    return { type: 'okx', isConnected: false };
  }
}

/**
 * Deteksi session MetaMask wallet
 */
export function detectMetaMaskSession(): DetectedWalletSession {
  if (typeof window === 'undefined') {
    return { type: 'metamask', isConnected: false };
  }

  try {
    const ethereum = (window as any).ethereum;
    
    if (ethereum && ethereum.isMetaMask) {
      console.log('🦊 MetaMask detected');
      
      // Check if MetaMask is connected
      if (ethereum.selectedAddress) {
        console.log('✅ MetaMask is connected:', ethereum.selectedAddress);
        return {
          type: 'metamask',
          address: ethereum.selectedAddress,
          chainId: ethereum.chainId ? parseInt(ethereum.chainId, 16) : undefined,
          isConnected: true,
          provider: ethereum,
        };
      }
    }
    
    return { type: 'metamask', isConnected: false };
  } catch (error) {
    console.error('Error detecting MetaMask session:', error);
    return { type: 'metamask', isConnected: false };
  }
}

/**
 * Deteksi session dari berbagai wallet
 */
export function detectAllWalletSessions(): DetectedWalletSession[] {
  const sessions: DetectedWalletSession[] = [];
  
  // Detect OKX
  const okxSession = detectOKXSession();
  if (okxSession.isConnected) {
    sessions.push(okxSession);
  }
  
  // Detect MetaMask
  const metaMaskSession = detectMetaMaskSession();
  if (metaMaskSession.isConnected) {
    sessions.push(metaMaskSession);
  }
  
  // Check for other common wallet sessions
  sessions.push(...detectOtherWalletSessions());
  
  return sessions;
}

/**
 * Deteksi wallet session lainnya
 */
function detectOtherWalletSessions(): DetectedWalletSession[] {
  if (typeof window === 'undefined') return [];
  
  const sessions: DetectedWalletSession[] = [];
  
  try {
    // Check for Coinbase Wallet
    const ethereum = (window as any).ethereum;
    if (ethereum && ethereum.isCoinbaseWallet && ethereum.selectedAddress) {
      sessions.push({
        type: 'coinbase',
        address: ethereum.selectedAddress,
        chainId: ethereum.chainId ? parseInt(ethereum.chainId, 16) : undefined,
        isConnected: true,
        provider: ethereum,
      });
    }
    
    // Check for WalletConnect in localStorage
    const walletConnectSession = localStorage.getItem('walletconnect');
    if (walletConnectSession) {
      try {
        const wcData = JSON.parse(walletConnectSession);
        if (wcData && wcData.accounts && wcData.accounts.length > 0) {
          sessions.push({
            type: 'walletconnect',
            address: wcData.accounts[0],
            isConnected: true,
          });
        }
      } catch (e) {
        console.log('Failed to parse WalletConnect session');
      }
    }
    
  } catch (error) {
    console.error('Error detecting other wallet sessions:', error);
  }
  
  return sessions;
}

/**
 * Get the best wallet session (prioritize connected wallets)
 */
export function getBestWalletSession(): DetectedWalletSession | null {
  const sessions = detectAllWalletSessions();
  
  if (sessions.length === 0) {
    return null;
  }
  
  // Priority: OKX > MetaMask > Coinbase > WalletConnect > Others
  const priorityOrder = ['okx', 'metamask', 'coinbase', 'walletconnect'];
  
  for (const priority of priorityOrder) {
    const session = sessions.find(s => s.type === priority);
    if (session) {
      return session;
    }
  }
  
  return sessions[0];
}

/**
 * Auto-connect to detected wallet session
 */
export async function autoConnectFromSession(): Promise<{ success: boolean; session?: DetectedWalletSession; error?: string }> {
  try {
    const bestSession = getBestWalletSession();
    
    if (!bestSession) {
      return { success: false, error: 'No wallet session detected' };
    }
    
    console.log('🔄 Auto-connecting from detected session:', bestSession);
    
    // If provider is available, request accounts to ensure connection
    if (bestSession.provider && bestSession.provider.request) {
      try {
        const accounts = await bestSession.provider.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          console.log('✅ Auto-connection successful:', accounts[0]);
          return { 
            success: true, 
            session: {
              ...bestSession,
              address: accounts[0],
              isConnected: true,
            }
          };
        }
      } catch (error) {
        console.log('Failed to get accounts from provider:', error);
      }
    }
    
    // If we have an address but no provider, still consider it connected
    if (bestSession.address) {
      console.log('✅ Session detected with address:', bestSession.address);
      return { success: true, session: bestSession };
    }
    
    return { success: false, error: 'Session detected but not connected' };
    
  } catch (error) {
    console.error('Error in auto-connect from session:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Monitor wallet session changes
 */
export function monitorWalletSessions(callback: (sessions: DetectedWalletSession[]) => void) {
  if (typeof window === 'undefined') return () => {};
  
  const checkSessions = () => {
    const sessions = detectAllWalletSessions();
    callback(sessions);
  };
  
  // Initial check
  checkSessions();
  
  // Monitor ethereum provider changes
  const ethereum = (window as any).ethereum;
  if (ethereum) {
    ethereum.on('accountsChanged', checkSessions);
    ethereum.on('chainChanged', checkSessions);
    ethereum.on('connect', checkSessions);
    ethereum.on('disconnect', checkSessions);
  }
  
  // Monitor localStorage changes (for WalletConnect and others)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key?.includes('wallet') || e.key?.includes('okx')) {
      checkSessions();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Cleanup function
  return () => {
    if (ethereum) {
      ethereum.removeListener('accountsChanged', checkSessions);
      ethereum.removeListener('chainChanged', checkSessions);
      ethereum.removeListener('connect', checkSessions);
      ethereum.removeListener('disconnect', checkSessions);
    }
    window.removeEventListener('storage', handleStorageChange);
  };
}
