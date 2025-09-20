// Session Debugger untuk membantu debug OKX session integration

export function debugOKXSession() {
  console.log('🔍 ===== OKX SESSION DEBUG REPORT =====');
  
  // Check localStorage
  console.log('📦 LocalStorage Check:');
  const okxKeys = [
    'OKXStorageKeyck_dappSenjaLabs',
    'okx-wallet-session',
    'okx-wallet-account',
    'recentConnectorId'
  ];
  
  okxKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`  ✅ ${key}:`, value.length > 100 ? `${value.substring(0, 100)}...` : value);
    } else {
      console.log(`  ❌ ${key}: Not found`);
    }
  });
  
  // Check window objects
  console.log('🌐 Window Objects Check:');
  const windowObj = window as any;
  
  if (windowObj.okxwallet) {
    console.log('  ✅ window.okxwallet:', {
      isConnected: windowObj.okxwallet.isConnected?.() || 'N/A',
      selectedAddress: windowObj.okxwallet.selectedAddress || 'N/A',
      chainId: windowObj.okxwallet.chainId || 'N/A'
    });
  } else {
    console.log('  ❌ window.okxwallet: Not found');
  }
  
  if (windowObj.ethereum) {
    console.log('  ✅ window.ethereum:', {
      isOkxWallet: windowObj.ethereum.isOkxWallet || false,
      isMetaMask: windowObj.ethereum.isMetaMask || false,
      selectedAddress: windowObj.ethereum.selectedAddress || 'N/A',
      chainId: windowObj.ethereum.chainId || 'N/A'
    });
  } else {
    console.log('  ❌ window.ethereum: Not found');
  }
  
  // Check Wagmi storage
  console.log('🔄 Wagmi Storage Check:');
  const wagmiStore = localStorage.getItem('wagmi.store');
  const recentConnector = localStorage.getItem('recentConnectorId');
  
  if (wagmiStore) {
    try {
      const parsed = JSON.parse(wagmiStore);
      console.log('  ✅ wagmi.store:', {
        hasState: !!parsed.state,
        hasConnections: !!parsed.state?.connections,
        current: parsed.state?.current || 'N/A',
        chainId: parsed.state?.chainId || 'N/A',
        accounts: parsed.state?.accounts || []
      });
    } catch (e) {
      console.log('  ❌ wagmi.store: Invalid JSON');
    }
  } else {
    console.log('  ❌ wagmi.store: Not found');
  }
  
  console.log(`  ${recentConnector ? '✅' : '❌'} recentConnectorId:`, recentConnector || 'Not found');
  
  console.log('🔍 ===== END DEBUG REPORT =====');
}

export function logSessionEvent(event: string, data?: any) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] 🦊 OKX Session Event: ${event}`, data || '');
}

export function createSessionWatcher() {
  if (typeof window === 'undefined') return () => {};
  
  console.log('👀 Starting OKX Session Watcher...');
  
  // Watch localStorage changes
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  
  localStorage.setItem = function(key: string, value: string) {
    if (key.includes('OKX') || key.includes('okx') || key.includes('wagmi')) {
      logSessionEvent(`localStorage.setItem: ${key}`, value.length > 50 ? `${value.substring(0, 50)}...` : value);
    }
    return originalSetItem.apply(this, [key, value]);
  };
  
  localStorage.removeItem = function(key: string) {
    if (key.includes('OKX') || key.includes('okx') || key.includes('wagmi')) {
      logSessionEvent(`localStorage.removeItem: ${key}`);
    }
    return originalRemoveItem.apply(this, [key]);
  };
  
  // Watch ethereum events
  const ethereum = (window as any).ethereum;
  if (ethereum) {
    const logEthereumEvent = (eventName: string) => (...args: any[]) => {
      logSessionEvent(`ethereum.${eventName}`, args);
    };
    
    ethereum.on('accountsChanged', logEthereumEvent('accountsChanged'));
    ethereum.on('chainChanged', logEthereumEvent('chainChanged'));
    ethereum.on('connect', logEthereumEvent('connect'));
    ethereum.on('disconnect', logEthereumEvent('disconnect'));
  }
  
  // Cleanup function
  return () => {
    console.log('🛑 Stopping OKX Session Watcher...');
    localStorage.setItem = originalSetItem;
    localStorage.removeItem = originalRemoveItem;
    
    if (ethereum) {
      ethereum.removeAllListeners?.();
    }
  };
}

// Auto-start watcher in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add debug function to window for easy access
  (window as any).debugOKXSession = debugOKXSession;
  (window as any).okxSessionWatcher = createSessionWatcher();
  
  console.log('🔧 OKX Session Debugger loaded! Use debugOKXSession() to check status');
}
