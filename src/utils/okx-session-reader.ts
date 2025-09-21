// OKX Session Reader untuk membaca session yang sudah ada dan mengintegrasikannya dengan Wagmi

export interface OKXSessionData {
  address?: string;
  chainId?: number;
  isConnected: boolean;
  sessionData?: any;
  jwt?: string;
  connectSession?: any;
}

/**
 * Read OKX session dari localStorage
 */
export function readOKXSession(): OKXSessionData {
  if (typeof window === 'undefined') {
    return { isConnected: false };
  }

  try {
    // Cek berbagai key yang digunakan OKX
    const okxKeys = [
      'OKXStorageKeyck_dappSenjaLabs',
      'okx-wallet-session',
      'okx-wallet-account',
      'recentConnectorId'
    ];

    let sessionData: any = {};
    let foundData = false;

    // Kumpulkan semua data OKX dari localStorage
    for (const key of okxKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          sessionData[key] = parsed;
          foundData = true;
          console.log(`📦 Found OKX data in ${key}:`, parsed);
        } catch {
          // Jika tidak bisa di-parse, simpan sebagai string
          sessionData[key] = data;
          foundData = true;
          console.log(`📦 Found OKX string data in ${key}:`, data);
        }
      }
    }

    if (!foundData) {
      console.log('❌ No OKX session data found');
      return { isConnected: false };
    }

    // Parse data dari OKXStorageKeyck_dappSenjaLabs
    const mainSession = sessionData['OKXStorageKeyck_dappSenjaLabs'];
    if (mainSession) {
      // Extract JWT untuk mendapatkan address
      const jwt = mainSession.jwt?.content;
      let address: string | undefined;
      let chainId: number | undefined;

      if (jwt) {
        try {
          // Decode JWT payload (base64)
          const payload = jwt.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          console.log('🔍 JWT Payload:', decodedPayload);
          
          // Extract subject yang mungkin berisi address info
          if (decodedPayload.sub) {
            // sub biasanya berisi hash, tapi kita bisa cek apakah ada address di data lain
            console.log('🔑 JWT Subject:', decodedPayload.sub);
          }
        } catch (error) {
          console.error('Failed to decode JWT:', error);
        }
      }

      // Cek connectSession untuk address yang lebih jelas
      const connectSession = mainSession.cspk_connectSession?.content;
      if (connectSession) {
        try {
          // Ini adalah encrypted data, tapi kita bisa cek apakah ada cara lain
          console.log('🔒 Connect session found (encrypted)');
        } catch (error) {
          console.error('Failed to parse connect session:', error);
        }
      }

      return {
        address,
        chainId,
        isConnected: true,
        sessionData: mainSession,
        jwt,
        connectSession: mainSession.cspk_connectSession
      };
    }

    return { isConnected: foundData, sessionData };
  } catch (error) {
    console.error('Error reading OKX session:', error);
    return { isConnected: false };
  }
}

/**
 * Check apakah OKX wallet sedang aktif/connected
 */
export function isOKXConnected(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Cek provider OKX
    const okxWallet = (window as any).okxwallet;
    const ethereum = (window as any).ethereum;

    // Method 1: Direct OKX wallet check
    if (okxWallet) {
      const connected = okxWallet.isConnected && okxWallet.isConnected();
      if (connected && okxWallet.selectedAddress) {
        console.log('✅ OKX directly connected:', okxWallet.selectedAddress);
        return true;
      }
    }

    // Method 2: Ethereum provider check
    if (ethereum && ethereum.isOkxWallet) {
      if (ethereum.selectedAddress) {
        console.log('✅ OKX via ethereum provider:', ethereum.selectedAddress);
        return true;
      }
    }

    // Method 3: localStorage session check
    const sessionData = readOKXSession();
    if (sessionData.isConnected) {
      console.log('✅ OKX session found in localStorage');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking OKX connection:', error);
    return false;
  }
}

/**
 * Get OKX account address dari berbagai sumber
 */
export function getOKXAddress(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Method 1: Direct dari OKX wallet
    const okxWallet = (window as any).okxwallet;
    if (okxWallet && okxWallet.selectedAddress) {
      console.log('📍 Address from OKX wallet:', okxWallet.selectedAddress);
      return okxWallet.selectedAddress;
    }

    // Method 2: Dari ethereum provider
    const ethereum = (window as any).ethereum;
    if (ethereum && ethereum.isOkxWallet && ethereum.selectedAddress) {
      console.log('📍 Address from ethereum provider:', ethereum.selectedAddress);
      return ethereum.selectedAddress;
    }

    // Method 3: Request accounts dari provider
    if (ethereum && ethereum.isOkxWallet) {
      // Ini akan trigger permission popup jika belum connected
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            console.log('📍 Address from eth_accounts:', accounts[0]);
            return accounts[0];
          }
        })
        .catch((error: any) => {
          console.log('Failed to get accounts:', error);
        });
    }

    return null;
  } catch (error) {
    console.error('Error getting OKX address:', error);
    return null;
  }
}

/**
 * Get OKX chain ID
 */
export function getOKXChainId(): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const okxWallet = (window as any).okxwallet;
    const ethereum = (window as any).ethereum;

    // Method 1: OKX wallet
    if (okxWallet && okxWallet.chainId) {
      const chainId = typeof okxWallet.chainId === 'string' 
        ? parseInt(okxWallet.chainId, 16) 
        : okxWallet.chainId;
      console.log('🔗 ChainId from OKX wallet:', chainId);
      return chainId;
    }

    // Method 2: Ethereum provider
    if (ethereum && ethereum.isOkxWallet && ethereum.chainId) {
      const chainId = typeof ethereum.chainId === 'string' 
        ? parseInt(ethereum.chainId, 16) 
        : ethereum.chainId;
      console.log('🔗 ChainId from ethereum provider:', chainId);
      return chainId;
    }

    return null;
  } catch (error) {
    console.error('Error getting OKX chain ID:', error);
    return null;
  }
}

/**
 * Enhanced OKX session sync dengan Wagmi storage
 */
export function syncOKXWithWagmi(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const address = getOKXAddress();
    const chainId = getOKXChainId();
    
    if (!address) {
      console.log('❌ No OKX address found to sync');
      return false;
    }

    // Enhanced Wagmi storage structure
    const wagmiStore = {
      state: {
        connections: new Map([
          ['okx', {
            accounts: [address],
            chainId: chainId || 8217, // Default ke Kaia
            connector: {
              id: 'okx',
              name: 'OKX Wallet',
              type: 'injected',
              icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiMwMDAwMDAiLz4KPHBhdGggZD0iTTE2IDI4QzIyLjYyNzQgMjggMjggMjIuNjI3NCAyOCAxNkMyOCA5LjM3MjU4IDIyLjYyNzQgNCAxNiA0QzkuMzcyNTggNCA0IDkuMzcyNTggNCAxNkM0IDIyLjYyNzQgOS4zNzI1OCAyOCAxNiAyOFoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+'
            }
          }]
        ]),
        current: 'okx',
        chainId: chainId || 8217,
        accounts: [address],
        status: 'connected'
      },
      version: 1
    };

    // Enhanced Wagmi storage with better error handling
    try {
      localStorage.setItem('wagmi.store', JSON.stringify(wagmiStore));
      localStorage.setItem('recentConnectorId', 'okx');
      localStorage.setItem('wagmi.connected', 'true');
      
      console.log('✅ Enhanced OKX session synced with Wagmi:', { 
        address, 
        chainId: chainId || 8217,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (storageError) {
      console.error('Failed to save to localStorage:', storageError);
      return false;
    }
  } catch (error) {
    console.error('Error in enhanced OKX sync with Wagmi:', error);
    return false;
  }
}

/**
 * Enhanced OKX disconnect function
 */
export async function disconnectOKXWallet(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    console.log('🔌 Starting enhanced OKX wallet disconnect...');
    
    const okxWallet = (window as any).okxwallet;
    const ethereum = (window as any).ethereum;

    // Method 1: Try OKX wallet specific disconnect
    if (okxWallet) {
      try {
        // OKX wallet might have a disconnect method
        if (typeof okxWallet.disconnect === 'function') {
          await okxWallet.disconnect();
          console.log('✅ OKX wallet disconnected via okxwallet.disconnect()');
        } else if (typeof okxWallet.close === 'function') {
          await okxWallet.close();
          console.log('✅ OKX wallet closed via okxwallet.close()');
        }
      } catch (okxError) {
        console.warn('OKX wallet disconnect method failed:', okxError);
      }
    }

    // Method 2: Try ethereum provider disconnect
    if (ethereum && ethereum.isOkxWallet) {
      try {
        // Try to disconnect from ethereum provider
        if (typeof ethereum.disconnect === 'function') {
          await ethereum.disconnect();
          console.log('✅ OKX disconnected via ethereum.disconnect()');
        }
        
        // Clear selected address
        if (ethereum.selectedAddress) {
          ethereum.selectedAddress = null;
          console.log('✅ OKX selectedAddress cleared');
        }
      } catch (ethereumError) {
        console.warn('Ethereum provider disconnect failed:', ethereumError);
      }
    }

    // Method 3: Clear all session data
    const cleared = clearOKXSession();
    
    console.log('✅ Enhanced OKX wallet disconnect completed');
    return cleared;
  } catch (error) {
    console.error('Enhanced OKX wallet disconnect failed:', error);
    return false;
  }
}

/**
 * Enhanced clear OKX session from localStorage
 */
export function clearOKXSession(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    console.log('🗑️ Starting enhanced OKX session clearing...');
    
    // Extended list of OKX-related keys
    const okxKeys = [
      'OKXStorageKeyck_dappSenjaLabs',
      'okx-wallet-session',
      'okx-wallet-account',
      'okx-wallet-address',
      'okx-wallet-chainId',
      'okx-connect-session',
      'okx-auth-session',
      'okx-user-session',
      'OKX_WALLET_CONNECTED',
      'OKX_WALLET_ADDRESS',
      'OKX_WALLET_CHAIN_ID'
    ];

    let cleared = false;
    okxKeys.forEach(key => {
      if (window.localStorage.getItem(key)) {
        window.localStorage.removeItem(key);
        console.log(`🗑️ Cleared OKX session: ${key}`);
        cleared = true;
      }
    });

    // Clear Wagmi storage
    const wagmiKeys = [
      'wagmi.store',
      'recentConnectorId',
      'wagmi.connected',
      'wagmi.cache',
      'wagmi.recentConnectorId'
    ];
    
    wagmiKeys.forEach(key => {
      if (window.localStorage.getItem(key)) {
        window.localStorage.removeItem(key);
        console.log(`🗑️ Cleared Wagmi storage: ${key}`);
        cleared = true;
      }
    });

    // Clear any other wallet-related storage
    const otherWalletKeys = [
      'walletconnect',
      'walletconnect-v2',
      'metamask',
      'coinbase',
      'trust-wallet',
      'rainbow',
      'phantom',
      'brave',
      'opera',
      'coin98',
      'tokenpocket',
      'bitget',
      'gate',
      'binance'
    ];
    
    otherWalletKeys.forEach(key => {
      if (window.localStorage.getItem(key)) {
        window.localStorage.removeItem(key);
        console.log(`🗑️ Cleared other wallet storage: ${key}`);
        cleared = true;
      }
    });
    
    console.log('✅ Enhanced OKX session clearing completed');
    return cleared;
  } catch (error) {
    console.error('Failed to clear OKX session:', error);
    return false;
  }
}

/**
 * Monitor OKX session changes dan sync dengan Wagmi
 */
export function monitorOKXSession(callback: (connected: boolean, address?: string) => void) {
  if (typeof window === 'undefined') return () => {};

  const checkOKXStatus = () => {
    const connected = isOKXConnected();
    const address = connected ? getOKXAddress() : undefined;
    
    callback(connected, address || undefined);
    
    // Auto-sync jika connected
    if (connected && address) {
      syncOKXWithWagmi();
    }
  };

  // Initial check
  checkOKXStatus();

  // Monitor ethereum provider events
  const ethereum = (window as any).ethereum;
  if (ethereum) {
    ethereum.on('accountsChanged', checkOKXStatus);
    ethereum.on('chainChanged', checkOKXStatus);
    ethereum.on('connect', checkOKXStatus);
    ethereum.on('disconnect', checkOKXStatus);
  }

  // Monitor localStorage changes
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key?.includes('OKX') || e.key?.includes('okx')) {
      checkOKXStatus();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Cleanup function
  return () => {
    if (ethereum) {
      ethereum.removeListener('accountsChanged', checkOKXStatus);
      ethereum.removeListener('chainChanged', checkOKXStatus);
      ethereum.removeListener('connect', checkOKXStatus);
      ethereum.removeListener('disconnect', checkOKXStatus);
    }
    window.removeEventListener('storage', handleStorageChange);
  };
}
