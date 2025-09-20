'use client';

import { useState, useEffect, useCallback } from 'react';
import DappPortalSDK from '@linenext/dapp-portal-sdk';
import { chains } from '@/lib/addresses/chainAddress';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from 'wagmi';

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

  // Wagmi hooks as fallback
  const { address: wagmiAddress, isConnected: wagmiConnected, chainId: wagmiChainId } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain: wagmiSwitchChain } = useSwitchChain();
  const { data: wagmiBalance } = useBalance({ address: wagmiAddress });

  // Initialize SDK with fallback
  useEffect(() => {
    const initSDK = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Ensure we're in browser environment
        if (typeof window === 'undefined') {
          throw new Error('Wallet SDK can only be initialized in browser environment');
        }

        // Ensure crypto polyfills are available
        if (!window.crypto || !window.crypto.getRandomValues) {
          throw new Error('Crypto API not available. Please ensure polyfills are loaded.');
        }
        
        // Validate environment variables
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        if (!clientId) {
          setUseDappPortal(false);
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            walletType: 'wagmi',
            error: null
          }));
          return;
        }

        const dappPortalSDK = await DappPortalSDK.init({
          clientId: clientId,
          chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '8217',
          chainNodeRpcEndpoint: process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || 'https://public-en.node.kaia.io',
        });

        setSdk(dappPortalSDK);
        setUseDappPortal(true);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          walletType: 'dapp-portal',
          error: null
        }));
      } catch {
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

    // Only initialize on client side
    if (typeof window !== 'undefined') {
      initSDK();
    }
  }, []);

  // Check if wallet is already connected
  useEffect(() => {
    if (useDappPortal && sdk) {
      const checkConnection = async () => {
        try {
          const walletProvider = sdk.getWalletProvider();
          const accounts = await walletProvider.request({ 
            method: 'kaia_accounts' 
          }) as string[];
          
          if (accounts && accounts.length > 0) {
            // Get current chain ID
            const chainId = await walletProvider.request({ 
              method: 'kaia_chainId' 
            }) as string;
            
            setState(prev => ({
              ...prev,
              isConnected: true,
              account: accounts[0],
              currentChainId: parseInt(chainId, 16),
            }));
          }
        } catch  {
          // No existing wallet connection found
        }
      };

      checkConnection();
    } else if (!useDappPortal) {
      // Use wagmi state
      setState(prev => ({
        ...prev,
        isConnected: wagmiConnected,
        account: wagmiAddress || null,
        currentChainId: wagmiChainId || null,
      }));
    }
  }, [sdk, useDappPortal, wagmiConnected, wagmiAddress, wagmiChainId]);

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (useDappPortal && sdk) {
        // Use DApp Portal SDK for connection
        const walletProvider = sdk.getWalletProvider();
        const accounts = await walletProvider.request({ 
          method: 'kaia_requestAccounts' 
        }) as string[];

        if (accounts && accounts.length > 0) {
          // Get current chain ID
          const chainId = await walletProvider.request({ 
            method: 'kaia_chainId' 
          }) as string;
          
          setState(prev => ({
            ...prev,
            isConnected: true,
            account: accounts[0],
            currentChainId: parseInt(chainId, 16),
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'No accounts returned from wallet',
          }));
        }
      } else {
        // Fallback to wagmi when DApp Portal SDK is not available
        if (connectors.length > 0) {
          await wagmiConnect({ connector: connectors[0] });
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'No wallet connectors available',
          }));
        }
      }
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to connect wallet',
      }));
    }
  }, [sdk, useDappPortal, wagmiConnect, connectors]);

  const disconnect = useCallback(async () => {
    try {
      if (useDappPortal && sdk) {
        // Use DApp Portal SDK for disconnection
        const walletProvider = sdk.getWalletProvider();
        await walletProvider.disconnectWallet();
      } else {
        // Fallback to wagmi when DApp Portal SDK is not available
        await wagmiDisconnect();
      }
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        account: null,
        error: null,
      }));
    } catch {
      setState(prev => ({ ...prev, error: 'Failed to disconnect wallet' }));
    }
  }, [sdk, useDappPortal, wagmiDisconnect]);

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

  return {
    ...state,
    connect,
    disconnect,
    getBalance,
    switchNetwork,
    getCurrentChain,
  };
};
