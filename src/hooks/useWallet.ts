'use client';

import { useState, useEffect, useCallback } from 'react';
import DappPortalSDK from '@linenext/dapp-portal-sdk';
import { chains } from '@/lib/addresses/chainAddress';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from 'wagmi';
import { useLiff } from '@/app/LiffProvider';

// Ethereum provider type
interface EthereumProvider {
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface WalletState {
  isConnected: boolean;
  account: string | null;
  isLoading: boolean;
  error: string | null;
  currentChainId: number | null;
  walletType: 'dapp-portal' | 'wagmi' | null;
}

interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<string>;
  switchNetwork: (chainId: number) => Promise<void>;
  getCurrentChain: () => { id: number; name: string; logo: string } | null;
  refreshConnection: () => Promise<void>;
}

export const useWallet = (): WalletState & WalletActions => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    isLoading: false,
    error: null,
    currentChainId: null,
    walletType: null,
  });

  const [sdk, setSdk] = useState<DappPortalSDK | null>(null);
  const [useDappPortal, setUseDappPortal] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Get LIFF context
  const { liff, liffError } = useLiff();

  // Wagmi hooks as fallback
  const { address: wagmiAddress, isConnected: wagmiConnected, chainId: wagmiChainId } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain: wagmiSwitchChain } = useSwitchChain();
  const { data: wagmiBalance } = useBalance({ address: wagmiAddress });

  // Detect mobile environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const userAgent = (typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent : '') || 
                         (typeof window !== 'undefined' && window.navigator ? (window.navigator as { vendor?: string }).vendor : '') || 
                         ((window as { opera?: string }).opera) || '';
        const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        const isLiffApp = liff && liff.isInClient();
        const mobileResult = isMobileDevice || Boolean(isLiffApp);
        setIsMobile(mobileResult);
        console.log('🔍 Mobile Detection:', { isMobileDevice, isLiffApp, hasLiff: !!liff, result: mobileResult });
      };
      
      checkMobile();
    }
  }, [liff]);

  // Initialize SDK with mobile-specific logic
  useEffect(() => {
    const initSDK = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Ensure we're in browser environment
        if (typeof window === 'undefined') {
          throw new Error('Wallet SDK can only be initialized in browser environment');
        }

        console.log('🚀 Initializing SDK...', { isMobile, hasLiff: !!liff, liffError });

        // For mobile/LIFF environment, prioritize different approach
        if (isMobile && liff && !liffError) {
          console.log('📱 Mobile LIFF environment detected');
          try {
            // Try to use LIFF for wallet connection
            if (liff.isInClient()) {
              console.log('✅ In LINE client, using LIFF approach');
              setUseDappPortal(false);
              setState(prev => ({ 
                ...prev, 
                isLoading: false, 
                walletType: 'wagmi',
                error: null
              }));
              return;
            }
          } catch (liffInitError) {
            console.warn('⚠️ LIFF initialization failed:', liffInitError);
          }
        }

        // Ensure crypto polyfills are available
        if (!window.crypto || !window.crypto.getRandomValues) {
          throw new Error('Crypto API not available. Please ensure polyfills are loaded.');
        }
        
        // Validate environment variables
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        if (!clientId) {
          console.log('❌ No CLIENT_ID, using Wagmi');
          setUseDappPortal(false);
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            walletType: 'wagmi',
            error: null
          }));
          return;
        }

        console.log('🔧 Initializing DApp Portal SDK...');
        const dappPortalSDK = await DappPortalSDK.init({
          clientId: clientId,
          chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '8217',
          chainNodeRpcEndpoint: process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || 'https://public-en.node.kaia.io',
        });

        setSdk(dappPortalSDK);
        setUseDappPortal(true);
        console.log('✅ DApp Portal SDK initialized successfully');
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          walletType: 'dapp-portal',
          error: null
        }));
      } catch (error) {
        console.warn('⚠️ DApp Portal init failed, falling back to Wagmi:', error);
        // Fallback to wagmi
        setUseDappPortal(false);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          walletType: 'wagmi',
          error: null
        }));
      }
    };

    // Only initialize on client side, and wait for mobile detection
    if (typeof window !== 'undefined' && typeof isMobile === 'boolean') {
      initSDK();
    }
  }, [isMobile, liff, liffError]);

  // Check wallet connection from both DApp Portal and Wagmi
  useEffect(() => {
    const checkConnection = async () => {
      let dappPortalConnected = false;
      let dappPortalAccount = null;
      let dappPortalChainId = null;

      // Check DApp Portal connection (skip on mobile LIFF environment)
      if (useDappPortal && sdk && !(isMobile && liff?.isInClient())) {
        try {
          const walletProvider = sdk.getWalletProvider();
          const accounts = await walletProvider.request({ 
            method: 'kaia_accounts' 
          }) as string[];
          
          if (accounts && accounts.length > 0) {
            const chainId = await walletProvider.request({ 
              method: 'kaia_chainId' 
            }) as string;
            
            dappPortalConnected = true;
            dappPortalAccount = accounts[0];
            dappPortalChainId = parseInt(chainId, 16);
          }
        } catch {
          // DApp Portal not connected
          console.log('🔍 DApp Portal check failed, will use Wagmi');
        }
      }

      // Priority: Use DApp Portal if connected, otherwise use Wagmi
      if (dappPortalConnected) {
        console.log('✅ DApp Portal connected:', dappPortalAccount);
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: dappPortalAccount,
          currentChainId: dappPortalChainId,
          walletType: 'dapp-portal',
        }));
      } else if (wagmiConnected && wagmiAddress) {
        console.log('✅ Wagmi connected:', wagmiAddress);
        // Use Wagmi connection
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: wagmiAddress,
          currentChainId: wagmiChainId || null,
          walletType: 'wagmi',
        }));
      } else {
        console.log('❌ No wallet connection found. DApp Portal:', !!useDappPortal, 'Wagmi:', wagmiConnected);
        // No connection found
        setState(prev => ({
          ...prev,
          isConnected: false,
          account: null,
          currentChainId: null,
          walletType: null,
        }));
      }
    };

    checkConnection();

    // Add event listeners for wallet connection changes
    const handleAccountsChanged = (..._args: unknown[]) => {
      // Trigger a recheck when accounts change
      setTimeout(checkConnection, 100);
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = args[0] as string;
      if (typeof chainId === 'string') {
        setState(prev => ({
          ...prev,
          currentChainId: parseInt(chainId, 16),
        }));
      }
    };

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Periodic check for connection state (especially for mobile)
    const interval = setInterval(checkConnection, 3000);

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
      clearInterval(interval);
    };
  }, [sdk, useDappPortal, wagmiConnected, wagmiAddress, wagmiChainId, isMobile, liff]);

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔗 Starting connection...', { isMobile, useDappPortal, hasSDK: !!sdk, wagmiConnectors: connectors.length });

      // For mobile LIFF environment, prioritize Wagmi
      if (isMobile && liff?.isInClient()) {
        console.log('📱 Mobile LIFF detected, using Wagmi directly');
        if (connectors.length > 0) {
          await wagmiConnect({ connector: connectors[0] });
          setState(prev => ({
            ...prev,
            isLoading: false,
            walletType: 'wagmi',
          }));
          return;
        }
      }

      // Try DApp Portal first if available and not in mobile LIFF
      if (useDappPortal && sdk && !(isMobile && liff?.isInClient())) {
        try {
          console.log('🔧 Trying DApp Portal connection...');
          const walletProvider = sdk.getWalletProvider();
          const accounts = await walletProvider.request({ 
            method: 'kaia_requestAccounts' 
          }) as string[];

          if (accounts && accounts.length > 0) {
            const chainId = await walletProvider.request({ 
              method: 'kaia_chainId' 
            }) as string;
            
            console.log('✅ DApp Portal connected successfully:', accounts[0]);
            setState(prev => ({
              ...prev,
              isConnected: true,
              account: accounts[0],
              currentChainId: parseInt(chainId, 16),
              walletType: 'dapp-portal',
              isLoading: false,
            }));
            return;
          }
        } catch (dappError) {
          console.warn('⚠️ DApp Portal connection failed, trying Wagmi...', dappError);
        }
      }

      // Fallback to wagmi
      console.log('🔄 Falling back to Wagmi...');
      if (connectors.length > 0) {
        await wagmiConnect({ connector: connectors[0] });
        console.log('✅ Wagmi connected successfully');
        setState(prev => ({
          ...prev,
          isLoading: false,
          walletType: 'wagmi',
        }));
      } else {
        console.error('❌ No wallet connectors available');
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'No wallet connectors available',
        }));
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to connect wallet',
      }));
    }
  }, [sdk, useDappPortal, wagmiConnect, connectors, isMobile, liff]);

  const disconnect = useCallback(async () => {
    try {
      // Disconnect from current wallet type
      if (state.walletType === 'dapp-portal' && useDappPortal && sdk) {
        const walletProvider = sdk.getWalletProvider();
        await walletProvider.disconnectWallet();
      } else if (state.walletType === 'wagmi' || wagmiConnected) {
        await wagmiDisconnect();
      }
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        account: null,
        currentChainId: null,
        walletType: null,
        error: null,
      }));
    } catch (error) {
      console.error('Disconnect failed:', error);
      setState(prev => ({ ...prev, error: 'Failed to disconnect wallet' }));
    }
  }, [state.walletType, sdk, useDappPortal, wagmiDisconnect, wagmiConnected]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!state.account) {
      throw new Error('Wallet not connected');
    }

    try {
      if (useDappPortal && sdk) {
        // Use DApp Portal SDK for balance
        const walletProvider = sdk.getWalletProvider();
        const balance = await walletProvider.request({
          method: 'kaia_getBalance',
          params: [state.account, 'latest'],
        });
        return balance as string;
      } else {
        // Fallback to wagmi balance when DApp Portal SDK is not available
        if (wagmiBalance) {
          return wagmiBalance.formatted;
        }
        return '0';
      }
    } catch {
      throw new Error('Failed to get balance');
    }
  }, [sdk, state.account, useDappPortal, wagmiBalance]);


  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if the chain is supported
      const targetChain = chains.find(chain => chain.id === chainId);
      if (!targetChain) {
        throw new Error(`Chain with ID ${chainId} is not supported`);
      }

      // Always use wagmi for chain switching
      await wagmiSwitchChain({ chainId });

      setState(prev => ({
        ...prev,
        currentChainId: chainId,
        isLoading: false,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to switch network',
      }));
    }
  }, [wagmiSwitchChain]);

  const getCurrentChain = useCallback(() => {
    if (!state.currentChainId) {
      return null;
    }
    
    const currentChain = chains.find(chain => chain.id === state.currentChainId);
    return currentChain ? {
      id: currentChain.id,
      name: currentChain.name,
      logo: currentChain.logo
    } : null;
  }, [state.currentChainId]);

  const refreshConnection = useCallback(async () => {
    console.log('🔄 Refreshing connection...', { isMobile, useDappPortal, hasSDK: !!sdk, isLiffClient: liff?.isInClient() });
    
    let dappPortalConnected = false;
    let dappPortalAccount = null;
    let dappPortalChainId = null;

    // Check DApp Portal connection (skip on mobile LIFF environment)
    if (useDappPortal && sdk && !(isMobile && liff?.isInClient())) {
      try {
        const walletProvider = sdk.getWalletProvider();
        const accounts = await walletProvider.request({ 
          method: 'kaia_accounts' 
        }) as string[];
        
        if (accounts && accounts.length > 0) {
          const chainId = await walletProvider.request({ 
            method: 'kaia_chainId' 
          }) as string;
          
          dappPortalConnected = true;
          dappPortalAccount = accounts[0];
          dappPortalChainId = parseInt(chainId, 16);
        }
      } catch {
        // DApp Portal not connected
        console.log('🔄 Refresh: DApp Portal check failed');
      }
    }

    // Priority: Use DApp Portal if connected, otherwise use Wagmi
    if (dappPortalConnected) {
      console.log('🔄 Refresh: DApp Portal connected:', dappPortalAccount);
      setState(prev => ({
        ...prev,
        isConnected: true,
        account: dappPortalAccount,
        currentChainId: dappPortalChainId,
        walletType: 'dapp-portal',
      }));
    } else if (wagmiConnected && wagmiAddress) {
      console.log('🔄 Refresh: Wagmi connected:', wagmiAddress);
      // Use Wagmi connection
      setState(prev => ({
        ...prev,
        isConnected: true,
        account: wagmiAddress,
        currentChainId: wagmiChainId || null,
        walletType: 'wagmi',
      }));
    } else {
      console.log('🔄 Refresh: No connection found. DApp Portal:', !!useDappPortal, 'Wagmi:', wagmiConnected);
      // No connection found
      setState(prev => ({
        ...prev,
        isConnected: false,
        account: null,
        currentChainId: null,
        walletType: null,
      }));
    }
  }, [useDappPortal, sdk, wagmiConnected, wagmiAddress, wagmiChainId, isMobile, liff]);

  return {
    ...state,
    connect,
    disconnect,
    getBalance,
    switchNetwork,
    getCurrentChain,
    refreshConnection,
  };
};
