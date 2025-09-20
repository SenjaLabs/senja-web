// Debug utility for wallet connection issues

export function debugWalletConnection() {
  console.log('🔍 Wallet Connection Debug Info:');
  
  // Check environment variables
  console.log('Environment Variables:', {
    CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID ? 'Set' : 'Not set',
    CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'Not set',
    RPC_ENDPOINT: process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || 'Not set'
  });
  
  // Check window objects
  if (typeof window !== 'undefined') {
    console.log('Window Objects:', {
      ethereum: !!window.ethereum,
      okxwallet: !!(window as any).okxwallet,
      isOkxWallet: !!(window as any).ethereum?.isOkxWallet
    });
    
    // Check localStorage
    console.log('LocalStorage:', {
      dappPortalSession: !!localStorage.getItem('dapp-portal-session'),
      wagmiStore: !!localStorage.getItem('wagmi.store'),
      okxSession: !!localStorage.getItem('OKXStorageKeyck_dappSenjaLabs')
    });
  }
  
  // Check user agent
  console.log('User Agent:', navigator.userAgent);
  
  // Check if mobile
  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
  console.log('Is Mobile:', isMobile);
}

// Function to test wallet connection with proper parameters
export function testWalletConnection() {
  console.log('🧪 Testing wallet connection parameters...');
  
  const testCases = [
    { name: 'No parameter', param: undefined },
    { name: 'DApps Portal', param: 'dapp-portal' as const },
    { name: 'OKX Wallet', param: 'okx' as const },
    { name: 'Invalid string', param: 'invalid' as any },
    { name: 'Object parameter', param: {} as any },
    { name: 'Null parameter', param: null as any }
  ];
  
  testCases.forEach(testCase => {
    console.log(`Test: ${testCase.name}`, {
      parameter: testCase.param,
      type: typeof testCase.param,
      isValid: typeof testCase.param === 'string' || testCase.param === undefined
    });
  });
}

// Auto-run debug on import
if (typeof window !== 'undefined') {
  debugWalletConnection();
}
