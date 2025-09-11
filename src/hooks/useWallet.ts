'use client';

import { useState, useEffect, useCallback } from 'react';
import  DappPortalSDK  from '@linenext/dapp-portal-sdk';
import { chains } from '@/lib/addresses/chainAddress';

interface WalletState {
  isConnected: boolean;
  account: string | null;
  isLoading: boolean;
  error: string | null;
  currentChainId: number | null;
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
  });

  const [sdk, setSdk] = useState<DappPortalSDK | null>(null);

  // Initialize SDK
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
          throw new Error('NEXT_PUBLIC_CLIENT_ID is not set. Please check your environment variables.');
        }

        const dappPortalSDK = await DappPortalSDK.init({
          clientId: clientId,
          chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '8217',
          chainNodeRpcEndpoint: process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || 'https://public-en.node.kaia.io',
        });

        setSdk(dappPortalSDK);
        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Failed to initialize DApp Portal SDK:', error);
        
        // Handle specific error cases
        let errorMessage = 'Failed to initialize wallet SDK';
        
        if (error instanceof Error) {
          if (error.message.includes('400') || error.message.includes('metric.dappportal.io')) {
            errorMessage = 'Invalid Channel ID. Please check your NEXT_PUBLIC_CLIENT_ID in .env.local file.';
          } else if (error.message.includes('NEXT_PUBLIC_CLIENT_ID is not set')) {
            errorMessage = 'Environment variables not configured. Please run setup and add your Channel ID.';
          } else if (error.message.includes('no PRNG')) {
            errorMessage = 'Crypto initialization failed. Please refresh the page.';
          } else {
            errorMessage = error.message;
          }
        }
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage
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
    if (sdk) {
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
        } catch (error) {
          console.log('No existing wallet connection found');
        }
      };

      checkConnection();
    }
  }, [sdk]);

  const connect = useCallback(async () => {
    if (!sdk) {
      setState(prev => ({ ...prev, error: 'SDK not initialized' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
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
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [sdk]);

  const disconnect = useCallback(async () => {
    if (!sdk) {
      return;
    }

    try {
      const walletProvider = sdk.getWalletProvider();
      await walletProvider.disconnectWallet();
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        account: null,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setState(prev => ({ ...prev, error: 'Failed to disconnect wallet' }));
    }
  }, [sdk]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!sdk || !state.account) {
      throw new Error('Wallet not connected');
    }

    try {
      const walletProvider = sdk.getWalletProvider();
      const balance = await walletProvider.request({
        method: 'kaia_getBalance',
        params: [state.account, 'latest'],
      });

      return balance as string;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error('Failed to get balance');
    }
  }, [sdk, state.account]);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!sdk) {
      setState(prev => ({ ...prev, error: 'SDK not initialized' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const walletProvider = sdk.getWalletProvider();
      
      // Check if the chain is supported
      const targetChain = chains.find(chain => chain.id === chainId);
      if (!targetChain) {
        throw new Error(`Chain with ID ${chainId} is not supported`);
      }

      // Switch to the target chain
      await walletProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      setState(prev => ({
        ...prev,
        currentChainId: chainId,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to switch network:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [sdk]);

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
