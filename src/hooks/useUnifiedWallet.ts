'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance, usePublicClient } from 'wagmi';
import { createWalletClient, custom, type WalletClient, type PublicClient, formatEther } from 'viem';
import { kaia } from 'viem/chains';
import DappPortalSDK from '@linenext/dapp-portal-sdk';
import { useLiff } from '@/app/LiffProvider';
import { 
  monitorWalletSessions, 
  DetectedWalletSession,
  getBestWalletSession
} from '@/utils/wallet-session-detector';
import { 
  readOKXSession, 
  isOKXConnected, 
  getOKXAddress, 
  getOKXChainId,
  syncOKXWithWagmi,
  monitorOKXSession,
  clearOKXSession,
  disconnectOKXWallet
} from '@/utils/okx-session-reader';
import { 
  saveWalletSession, 
  clearWalletSession,
  shouldAutoReconnect,
  getLastWalletType
} from '@/utils/session-storage';
import '@/utils/session-debugger'; // Auto-load debugger in development

interface UnifiedWalletState {
  isConnected: boolean;
  account: string | null;
  isLoading: boolean;
  error: string | null;
  currentChainId: number | null;
  walletType: 'dapp-portal' | 'wagmi' | null;
  balance: string | null;
}

interface UnifiedWalletActions {
  connect: (preferredWallet?: 'dapp-portal') => Promise<void>;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<string>;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshConnection: () => Promise<void>;
  getWalletClient: () => WalletClient | null;
  getPublicClient: () => PublicClient | null;
}

export const useUnifiedWallet = (): UnifiedWalletState & UnifiedWalletActions => {
  const [state, setState] = useState<UnifiedWalletState>({
    isConnected: false,
    account: null,
    isLoading: false,
    error: null,
    currentChainId: null,
    walletType: null,
    balance: null,
  });

  const [sdk, setSdk] = useState<DappPortalSDK | null>(null);
  const [dappWalletClient, setDappWalletClient] = useState<WalletClient | null>(null);
  const [useDappPortal, setUseDappPortal] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [detectedSession, setDetectedSession] = useState<DetectedWalletSession | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState<boolean>(false);
  const [isManuallyDisconnected, setIsManuallyDisconnected] = useState(false);
  
  // Get LIFF context
  const { liff, liffError } = useLiff();

  // Wagmi hooks
  const { address: wagmiAddress, isConnected: wagmiConnected, chainId: wagmiChainId } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain: wagmiSwitchChain } = useSwitchChain();
  const { data: wagmiBalance } = useBalance({ address: wagmiAddress });
  const publicClient = usePublicClient();

  // Detect mobile environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const userAgent = window.navigator.userAgent || '';
        const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        const isLiffApp = liff && liff.isInClient();
        const mobileResult = isMobileDevice || Boolean(isLiffApp);
        setIsMobile(mobileResult);
        console.log('📱 Mobile Detection:', { isMobileDevice, isLiffApp, hasLiff: !!liff, result: mobileResult });
      };
      
      checkMobile();
    }
  }, [liff]);

  // Enhanced session detection with improved priority and error handling
  useEffect(() => {
    if (typeof window === 'undefined' || hasCheckedSession) return;
    
    const detectSessions = async () => {
      console.log('🔍 Enhanced wallet session detection starting...');
      
      try {
        // Check if auto-reconnect is enabled and user hasn't manually disconnected
        const shouldReconnect = shouldAutoReconnect() && !isManuallyDisconnected;
        const lastWalletType = getLastWalletType();
        
        console.log('🔄 Auto-reconnect settings:', { shouldReconnect, lastWalletType, isManuallyDisconnected });
        
        // If user manually disconnected, don't auto-reconnect
        if (isManuallyDisconnected) {
          console.log('🚫 Manual disconnect detected - skipping auto-reconnect');
          setHasCheckedSession(true);
          return;
        }
        console.log('🎯 DApps Portal Priority Check:', { 
          useDappPortal, 
          hasDappWalletClient: !!dappWalletClient,
          isMobile,
          isInLiffClient: liff?.isInClient()
        });
        
        // If DApps Portal is available and working, clear any OKX session to prevent conflicts
        if (useDappPortal && dappWalletClient && !(isMobile && liff?.isInClient())) {
          console.log('🧹 DApps Portal available - clearing OKX session to prevent conflicts');
          clearOKXSession();
        }
        
        // Priority 1: Check DApp Portal session (always check first as primary)
        if (lastWalletType === 'dapp-portal' || !lastWalletType || lastWalletType === 'wagmi') {
          const dappPortalSession = window.localStorage.getItem('dapp-portal-session');
          if (dappPortalSession) {
            try {
              const sessionData = JSON.parse(dappPortalSession);
              const isExpired = Date.now() - sessionData.timestamp > 24 * 60 * 60 * 1000; // 24 hours
              
              if (!isExpired && sessionData.account) {
                console.log('🔄 Found valid DApp Portal session:', sessionData);
                
                setState(prev => ({
                  ...prev,
                  isConnected: true,
                  account: sessionData.account,
                  currentChainId: sessionData.chainId || 8217,
                  walletType: 'dapp-portal',
                  isLoading: false,
                  error: null,
                }));
                
                // Save to unified session storage
                saveWalletSession({
                  account: sessionData.account,
                  chainId: sessionData.chainId || 8217,
                  walletType: 'dapp-portal',
                  isConnected: true,
                });
                
                setDetectedSession({
                  type: 'okx', // Use okx type for compatibility
                  address: sessionData.account,
                  chainId: sessionData.chainId,
                  isConnected: true,
                });
                
                setHasCheckedSession(true);
                return;
              } else if (isExpired) {
                console.log('🕒 DApp Portal session expired, clearing...');
                window.localStorage.removeItem('dapp-portal-session');
              }
            } catch (parseError) {
              console.warn('Failed to parse DApp Portal session:', parseError);
              window.localStorage.removeItem('dapp-portal-session');
            }
          }
        }
        
        // Priority 2: Check OKX session (only if DApps Portal not available or explicitly requested)
        const okxSession = readOKXSession();
        const okxConnected = isOKXConnected();
        const okxAddress = getOKXAddress();
        const okxChainId = getOKXChainId();
        
        console.log('🔍 Enhanced OKX Detection:', {
          localStorage: {
            hasSession: okxSession.isConnected,
            hasData: !!okxSession.sessionData,
            hasJWT: !!okxSession.jwt
          },
          provider: {
            isConnected: okxConnected,
            hasAddress: !!okxAddress,
            chainId: okxChainId
          },
          address: okxAddress,
          chainId: okxChainId
        });
        
        // Only auto-connect OKX if:
        // 1. DApps Portal is not available/working
        // 2. OKX was explicitly the last used wallet
        // 3. No DApps Portal session exists
        // 4. Not in mobile LIFF environment
        const shouldUseOKX = (okxSession.isConnected || okxConnected || okxAddress) && 
                           (lastWalletType === 'wagmi') && 
                           (!useDappPortal || !dappWalletClient || (isMobile && liff?.isInClient()));
        
        console.log('🤔 OKX Auto-connect Decision:', {
          hasOKXSession: okxSession.isConnected || okxConnected || okxAddress,
          lastWalletType,
          useDappPortal,
          hasDappWalletClient: !!dappWalletClient,
          isMobile,
          isInLiffClient: liff?.isInClient(),
          shouldUseOKX
        });
        
        if (shouldUseOKX) {
          console.log('✅ OKX Session Found - Enhanced Auto-Connect:', { 
            localStorage: okxSession.isConnected, 
            provider: okxConnected, 
            address: okxAddress,
            chainId: okxChainId 
          });
          
          const address = okxAddress || okxSession.address;
          const chainId = okxChainId || okxSession.chainId || 8217;
          
          if (address && !state.isConnected) {
            console.log('🚀 Enhanced OKX auto-connection:', address);
            
            // Enhanced sync with Wagmi
            const syncResult = syncOKXWithWagmi();
            console.log('📝 Enhanced Wagmi sync result:', syncResult);
            
            setState(prev => ({
              ...prev,
              isConnected: true,
              account: address,
              currentChainId: chainId,
              walletType: 'wagmi',
              isLoading: false,
              error: null,
            }));
            
            // Save to unified session storage
            saveWalletSession({
              account: address,
              chainId: chainId,
              walletType: 'wagmi',
              isConnected: true,
            });
            
            setDetectedSession({
              type: 'okx',
              address,
              chainId,
              isConnected: true,
              provider: (window as unknown as { ethereum?: unknown })?.ethereum
            });
            
            setHasCheckedSession(true);
            return;
          }
        }
        
        // Priority 3: Enhanced general session detection
        const bestSession = getBestWalletSession();
        if (bestSession && bestSession.isConnected && bestSession.address) {
          console.log('✅ Best wallet session found:', bestSession);
          
          setState(prev => ({
            ...prev,
            isConnected: true,
            account: bestSession.address!,
            currentChainId: bestSession.chainId || null,
            walletType: 'wagmi',
            isLoading: false,
            error: null,
          }));
          
          // Save to unified session storage
          saveWalletSession({
            account: bestSession.address!,
            chainId: bestSession.chainId || null,
            walletType: 'wagmi',
            isConnected: true,
          });
          
          setDetectedSession(bestSession);
        } else {
          console.log('❌ No existing wallet sessions found');
        }
      } catch (error) {
        console.error('Error in enhanced session detection:', error);
      }
      
      setHasCheckedSession(true);
    };
    
    // Reduced delay for faster detection
    const timer = setTimeout(detectSessions, 500);
    
    return () => clearTimeout(timer);
  }, [hasCheckedSession, state.isConnected]);

  // Monitor wallet session changes (prioritize OKX)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Monitor OKX specifically
    const cleanupOKX = monitorOKXSession((connected, address) => {
      console.log('🦊 OKX session change:', { connected, address });
      
      if (connected && address && !state.isConnected) {
        console.log('🔄 Auto-connecting from OKX session change');
        
        const chainId = getOKXChainId() || 8217;
        syncOKXWithWagmi();
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: address,
          currentChainId: chainId,
          walletType: 'wagmi',
          isLoading: false,
          error: null,
        }));
        
        setDetectedSession({
          type: 'okx',
          address,
          chainId,
          isConnected: true,
          provider: (window as unknown as { ethereum?: unknown })?.ethereum
        });
      } else if (!connected && state.isConnected && state.walletType === 'wagmi') {
        console.log('🔄 OKX disconnected, clearing state');
        setState(prev => ({
          ...prev,
          isConnected: false,
          account: null,
          currentChainId: null,
          walletType: null,
        }));
        setDetectedSession(null);
      }
    });
    
    // Monitor other wallets as fallback
    const cleanupGeneral = monitorWalletSessions((sessions) => {
      const bestSession = sessions.find(s => s.isConnected);
      if (bestSession && !state.isConnected) {
        console.log('🔄 General wallet session change detected:', bestSession);
        setDetectedSession(bestSession);
        
        if (bestSession.address) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            account: bestSession.address!,
            currentChainId: bestSession.chainId || null,
            walletType: 'wagmi',
            isLoading: false,
            error: null,
          }));
        }
      }
    });
    
    return () => {
      cleanupOKX();
      cleanupGeneral();
    };
  }, [state.isConnected, state.walletType]);

  // Initialize SDK and create wallet clients
  useEffect(() => {
    const initSDK = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        if (typeof window === 'undefined') {
          throw new Error('Wallet SDK can only be initialized in browser environment');
        }

        console.log('🚀 Initializing Unified Wallet...', { isMobile, hasLiff: !!liff, liffError });

        // For mobile/LIFF environment, prioritize wagmi
        if (isMobile && liff && !liffError) {
          console.log('📱 Mobile LIFF environment detected, using Wagmi');
          setUseDappPortal(false);
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            walletType: 'wagmi',
            error: null
          }));
          return;
        }

        // Validate environment variables for DApp Portal
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
        
        // Create viem wallet client from DApp Portal provider
        const walletProvider = dappPortalSDK.getWalletProvider();
        const viemWalletClient = createWalletClient({
          chain: kaia,
          transport: custom(walletProvider as unknown as Parameters<typeof custom>[0]),
        });
        
        setDappWalletClient(viemWalletClient);
        setUseDappPortal(true);
        
        console.log('✅ DApp Portal SDK and Viem client initialized successfully');
        
        // Check if DApp Portal already has a connected session
        try {
          const accounts = await viemWalletClient.getAddresses();
          if (accounts && accounts.length > 0) {
            const chainId = await viemWalletClient.getChainId();
            console.log('🔄 DApp Portal session found:', { account: accounts[0], chainId });
            
            // Save session to localStorage for persistence
            if (typeof window !== 'undefined') {
              const sessionData = {
                account: accounts[0],
                chainId: chainId,
                walletType: 'dapp-portal',
                timestamp: Date.now(),
                clientId: clientId
              };
              window.localStorage.setItem('dapp-portal-session', JSON.stringify(sessionData));
              console.log('💾 DApp Portal session saved to localStorage');
            }
            
            setState(prev => ({ 
              ...prev, 
              isConnected: true,
              account: accounts[0],
              currentChainId: chainId,
              walletType: 'dapp-portal',
              isLoading: false,
              error: null
            }));
            return;
          }
        } catch (sessionError) {
          console.log('🔍 No existing DApp Portal session found:', sessionError);
        }
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          walletType: 'dapp-portal',
          error: null
        }));
      } catch (error) {
        console.warn('⚠️ DApp Portal init failed, falling back to Wagmi:', error);
        setUseDappPortal(false);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          walletType: 'wagmi',
          error: null
        }));
      }
    };

    if (typeof window !== 'undefined' && typeof isMobile === 'boolean') {
      initSDK();
    }
  }, [isMobile, liff, liffError]);

  // Unified connection check using viem with better synchronization
  useEffect(() => {
    const checkConnection = async () => {
      try {
        let dappPortalAccount: string | null = null;
        let dappPortalChainId: number | null = null;
        let dappPortalBalance: string | null = null;

        // Priority 1: Check DApp Portal connection first
        if (useDappPortal && dappWalletClient && !(isMobile && liff?.isInClient())) {
          try {
            console.log('🔍 Checking DApp Portal connection...');
            const accounts = await dappWalletClient.getAddresses();
            
            if (accounts && accounts.length > 0) {
              const chainId = await dappWalletClient.getChainId();
              
              dappPortalAccount = accounts[0];
              dappPortalChainId = chainId;
              
              // Get balance using viem
              if (publicClient) {
                const balance = await publicClient.getBalance({ address: accounts[0] });
                dappPortalBalance = (Number(balance) / 1e18).toFixed(4);
              }
              
              console.log('✅ DApp Portal connected:', { account: dappPortalAccount, chainId: dappPortalChainId, balance: dappPortalBalance });
              
              // Update localStorage session
              if (typeof window !== 'undefined') {
                const sessionData = {
                  account: dappPortalAccount,
                  chainId: dappPortalChainId,
                  walletType: 'dapp-portal',
                  timestamp: Date.now(),
                  clientId: process.env.NEXT_PUBLIC_CLIENT_ID
                };
                window.localStorage.setItem('dapp-portal-session', JSON.stringify(sessionData));
              }
              
              setState(prev => ({
                ...prev,
                isConnected: true,
                account: dappPortalAccount,
                currentChainId: dappPortalChainId,
                walletType: 'dapp-portal',
                balance: dappPortalBalance,
                isLoading: false,
                error: null,
              }));
              return;
            } else {
              console.log('🔍 DApp Portal: No accounts found');
            }
          } catch (error) {
            console.log('🔍 DApp Portal check failed:', error);
            // Don't set error here, just fall through to other methods
          }
        } else {
          console.log('🔍 DApp Portal: Not available or mobile environment');
        }

        // Fallback to Wagmi with improved state management
        if (wagmiConnected && wagmiAddress) {
          console.log('✅ Wagmi connected:', { address: wagmiAddress, chainId: wagmiChainId, balance: wagmiBalance?.formatted });
          const formattedBalance = wagmiBalance ? wagmiBalance.formatted : '0';
          
          setState(prev => ({
            ...prev,
            isConnected: true,
            account: wagmiAddress,
            currentChainId: wagmiChainId || null,
            walletType: 'wagmi',
            balance: formattedBalance,
            isLoading: false,
            error: null,
          }));
        } else {
          console.log('❌ No wallet connection found');
          setState(prev => ({
            ...prev,
            isConnected: false,
            account: null,
            currentChainId: null,
            walletType: null,
            balance: null,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to check wallet connection',
          isLoading: false,
        }));
      }
    };

    checkConnection();
    
    // Add event listeners for wallet changes
    const handleAccountsChanged = () => {
      console.log('🔄 Accounts changed, rechecking connection...');
      setTimeout(checkConnection, 100);
    };

    const handleChainChanged = () => {
      console.log('🔄 Chain changed, rechecking connection...');
      setTimeout(checkConnection, 100);
    };

    // Listen for wallet events
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    // Periodic check for connection state changes (reduced frequency)
    const interval = setInterval(checkConnection, 3000);
    
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [
    dappWalletClient, 
    useDappPortal, 
    wagmiConnected, 
    wagmiAddress, 
    wagmiChainId, 
    wagmiBalance,
    isMobile, 
    liff,
    publicClient
  ]);

  const connect = useCallback(async (preferredWallet?: 'dapp-portal' | 'okx') => {
    try {
      // Normalize preferredWallet parameter - default to dapp-portal as primary
      let normalizedWallet = preferredWallet;
      if (!preferredWallet || (typeof preferredWallet !== 'string')) {
        normalizedWallet = 'dapp-portal'; // Default to DApps Portal as primary
        console.log('🔄 No wallet specified, defaulting to DApps Portal as primary');
      }
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      setIsManuallyDisconnected(false); // Reset manual disconnect flag
      
      console.log('🔗 Enhanced unified connection starting...', { 
        isMobile, 
        useDappPortal, 
        hasSDK: !!sdk, 
        detectedSession,
        lastWalletType: getLastWalletType(),
        preferredWallet: normalizedWallet,
        originalPreferredWallet: preferredWallet
      });

      // Priority 1: DApp Portal SDK (primary wallet connection)
      if (normalizedWallet === 'dapp-portal' && useDappPortal && dappWalletClient && !(isMobile && liff?.isInClient())) {
        try {
          console.log('🔧 Enhanced DApp Portal connection attempt...');
          
          // Try to get existing accounts first
          let accounts = await dappWalletClient.getAddresses();
          
          // If no accounts, request new connection
          if (!accounts || accounts.length === 0) {
            console.log('🔗 Requesting new DApp Portal connection...');
            accounts = await dappWalletClient.requestAddresses();
          }

          if (accounts && accounts.length > 0) {
            const chainId = await dappWalletClient.getChainId();
            
            console.log('✅ Enhanced DApp Portal connected:', { 
              account: accounts[0], 
              chainId,
              walletType: 'dapp-portal'
            });
            
            // Enhanced session saving
            const sessionData = {
              account: accounts[0],
              chainId: chainId,
              walletType: 'dapp-portal',
              timestamp: Date.now(),
              clientId: process.env.NEXT_PUBLIC_CLIENT_ID
            };
            
            // Save to both DApp Portal and unified storage
            window.localStorage.setItem('dapp-portal-session', JSON.stringify(sessionData));
            saveWalletSession({
              account: accounts[0],
              chainId: chainId,
              walletType: 'dapp-portal',
              isConnected: true,
            });
            
            console.log('💾 Enhanced DApp Portal session saved');
            
            setState(prev => ({
              ...prev,
              isConnected: true,
              account: accounts[0],
              currentChainId: chainId,
              walletType: 'dapp-portal',
              isLoading: false,
              error: null,
            }));
            return;
          }
        } catch (dappError) {
          console.warn('⚠️ Enhanced DApp Portal connection failed:', dappError);
          // Don't throw here, continue to other methods
        }
      }

      // Priority 2: Enhanced OKX connection (only if explicitly requested)
      if (normalizedWallet === 'okx') {
        const okxAddress = getOKXAddress();
        const okxChainId = getOKXChainId();
        const okxConnected = isOKXConnected();
        
        console.log('🔗 Enhanced OKX Connection Check:', { 
          address: okxAddress, 
          chainId: okxChainId, 
          connected: okxConnected 
        });
        
        if (okxAddress || okxConnected) {
          console.log('🦊 Enhanced OKX connection attempt:', { address: okxAddress, chainId: okxChainId });
          
          // Enhanced sync with Wagmi
          const synced = syncOKXWithWagmi();
          console.log('📝 Enhanced OKX sync result:', synced);
          
          if (synced && okxAddress) {
            console.log('✅ Enhanced OKX connection successful!');
            
            // Save to unified session storage
            saveWalletSession({
              account: okxAddress,
              chainId: okxChainId || 8217,
              walletType: 'wagmi',
              isConnected: true,
            });
            
            setState(prev => ({
              ...prev,
              isConnected: true,
              account: okxAddress,
              currentChainId: okxChainId || 8217,
              walletType: 'wagmi',
              isLoading: false,
              error: null,
            }));
            return;
          } else {
            console.log('❌ Enhanced OKX sync failed during connect');
          }
        }
      }

      // Priority 3: Enhanced detected session handling
      if (detectedSession && detectedSession.isConnected && detectedSession.address) {
        console.log('🔗 Enhanced detected session connection:', detectedSession);
        
        // Save to unified session storage
        saveWalletSession({
          account: detectedSession.address!,
          chainId: detectedSession.chainId || null,
          walletType: 'wagmi',
          isConnected: true,
        });
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: detectedSession.address!,
          currentChainId: detectedSession.chainId || null,
          walletType: 'wagmi',
          isLoading: false,
          error: null,
        }));
        return;
      }

      // Priority 4: Mobile LIFF environment
      if (isMobile && liff?.isInClient()) {
        console.log('📱 Enhanced mobile LIFF connection');
        if (connectors.length > 0) {
          await wagmiConnect({ connector: connectors[0] });
          
          // Save to unified session storage
          saveWalletSession({
            walletType: 'wagmi',
            isConnected: true,
          });
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            walletType: 'wagmi',
            error: null,
          }));
          return;
        }
      }

      // Priority 5: Enhanced Wagmi fallback (only if no specific wallet requested)
      if (!preferredWallet) {
        console.log('🔄 Enhanced Wagmi fallback connection...');
        if (connectors.length > 0) {
          await wagmiConnect({ connector: connectors[0] });
          console.log('✅ Enhanced Wagmi connection successful');
          
          // Save to unified session storage
          saveWalletSession({
            walletType: 'wagmi',
            isConnected: true,
          });
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            walletType: 'wagmi',
            error: null,
          }));
        } else {
          throw new Error('No wallet connectors available');
        }
      } else {
        throw new Error(`Failed to connect to ${normalizedWallet} wallet`);
      }
    } catch (error) {
      console.error('❌ Enhanced unified wallet connection failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  }, [dappWalletClient, useDappPortal, wagmiConnect, connectors, isMobile, liff, sdk, detectedSession]);

  const disconnect = useCallback(async () => {
    try {
      console.log('🔌 Enhanced wallet disconnect starting...', { walletType: state.walletType });
      
      // IMMEDIATE state clearing - clear state first for instant UI update
      setState(prev => ({
        ...prev,
        isConnected: false,
        account: null,
        currentChainId: null,
        walletType: null,
        balance: null,
        error: null,
        isLoading: false,
      }));
      
      // Clear detected session and reset session check
      setDetectedSession(null);
      setHasCheckedSession(false);
      setIsManuallyDisconnected(true);
      
      // Enhanced wallet type handling
      if (state.walletType === 'dapp-portal' && dappWalletClient) {
        console.log('🔌 Enhanced DApp Portal disconnect');
        // DApp Portal doesn't have explicit disconnect, just clear state
      } else if (state.walletType === 'wagmi' || wagmiConnected) {
        console.log('🔌 Enhanced Wagmi disconnect');
        await wagmiDisconnect();
      }
      
      // Enhanced OKX wallet disconnect (OKX is represented via wagmi)
      if (state.walletType === 'wagmi' || isOKXConnected()) {
        console.log('🔌 Enhanced OKX wallet disconnect...');
        await disconnectOKXWallet();
      }
      
      // Enhanced session clearing
      console.log('🗑️ Enhanced session clearing...');
      
      // Clear DApp Portal session
      if (typeof window !== 'undefined') {
        const dappPortalKeys = [
          'dapp-portal-session',
          'dapp-portal-account',
          'dapp-portal-chainId',
          'dapp-portal-clientId'
        ];
        
        dappPortalKeys.forEach(key => {
          if (window.localStorage.getItem(key)) {
            window.localStorage.removeItem(key);
            console.log(`🗑️ Cleared DApp Portal session: ${key}`);
          }
        });
      }
      
      // Clear OKX session and Wagmi storage
      clearOKXSession();
      
      // Clear unified session storage
      clearWalletSession();
      
      // Clear any remaining wallet-related storage
      if (typeof window !== 'undefined') {
        const remainingKeys = [
          'walletconnect',
          'walletconnect-v2',
          'metamask',
          'coinbase',
          'trust-wallet',
          'rainbow',
          'phantom'
        ];
        
        remainingKeys.forEach(key => {
          if (window.localStorage.getItem(key)) {
            window.localStorage.removeItem(key);
            console.log(`🗑️ Cleared remaining wallet storage: ${key}`);
          }
        });
      }
      
      // State already cleared at the beginning for instant UI update
      
      console.log('✅ Enhanced wallet disconnect successful');
    } catch (error) {
      console.error('❌ Enhanced disconnect failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet',
        isLoading: false
      }));
    }
  }, [state.walletType, dappWalletClient, wagmiDisconnect, wagmiConnected]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!state.account) {
      throw new Error('Wallet not connected');
    }

    console.log('💰 Getting balance for:', {
      account: state.account,
      walletType: state.walletType,
      hasPublicClient: !!publicClient,
      hasWagmiBalance: !!wagmiBalance
    });

    try {
      // 1) Prefer viem public client if available (works for both DApps Portal and wagmi)
      if (publicClient) {
        console.log('💰 Using publicClient to get balance...');
        const balance = await publicClient.getBalance({ address: state.account as `0x${string}` });
        const formatted = Number(formatEther(balance)).toFixed(4);
        console.log('💰 PublicClient balance result:', { raw: balance.toString(), formatted });
        return formatted;
      }

      // 2) Fallback to ethereum provider RPC (kaia_getBalance or eth_getBalance)
      if (typeof window !== 'undefined') {
        const ethereum = (window as any).ethereum as any;
        if (ethereum?.request) {
          console.log('💰 Using ethereum provider to get balance...');
          try {
            // Try Kaia method first
            let hexBalance: string | null = null;
            try {
              console.log('💰 Trying kaia_getBalance...');
              hexBalance = await ethereum.request({
                method: 'kaia_getBalance',
                params: [state.account, 'latest'],
              });
              console.log('💰 kaia_getBalance result:', hexBalance);
            } catch (kaiaError) {
              console.log('💰 kaia_getBalance failed:', kaiaError);
            }

            if (!hexBalance) {
              try {
                console.log('💰 Trying eth_getBalance...');
                hexBalance = await ethereum.request({
                  method: 'eth_getBalance',
                  params: [state.account, 'latest'],
                });
                console.log('💰 eth_getBalance result:', hexBalance);
              } catch (ethError) {
                console.log('💰 eth_getBalance failed:', ethError);
              }
            }

            if (typeof hexBalance === 'string') {
              const wei = BigInt(hexBalance);
              const formatted = Number(formatEther(wei)).toFixed(4);
              console.log('💰 Provider balance result:', { raw: hexBalance, formatted });
              return formatted;
            }
          } catch (rpcError) {
            console.warn('Provider balance request failed:', rpcError);
          }
        }
      }

      // 3) Fallback to wagmi cached balance if any
      if (wagmiBalance?.formatted) {
        console.log('💰 Using wagmi cached balance:', wagmiBalance.formatted);
        return Number(wagmiBalance.formatted).toFixed(4);
      }

      console.log('💰 No balance found, returning 0.0000');
      return '0.0000';
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0.0000';
    }
  }, [state.account, state.walletType, publicClient, wagmiBalance]);

  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Always use wagmi for chain switching as it handles it better
      await wagmiSwitchChain({ chainId });

      setState(prev => ({
        ...prev,
        currentChainId: chainId,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to switch network:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to switch network',
      }));
    }
  }, [wagmiSwitchChain]);

  const refreshConnection = useCallback(async () => {
    console.log('🔄 Refreshing unified connection...');
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Force recheck connection state
      let connectionFound = false;
      
      // First try DApp Portal if available
      if (useDappPortal && dappWalletClient && !(isMobile && liff?.isInClient())) {
        try {
          const accounts = await dappWalletClient.getAddresses();
          
          if (accounts && accounts.length > 0) {
            const chainId = await dappWalletClient.getChainId();
            let balance = '0';
            
            if (publicClient) {
              const balanceWei = await publicClient.getBalance({ address: accounts[0] });
              balance = (Number(balanceWei) / 1e18).toFixed(4);
            }
            
            setState(prev => ({
              ...prev,
              isConnected: true,
              account: accounts[0],
              currentChainId: chainId,
              walletType: 'dapp-portal',
              balance,
              isLoading: false,
              error: null,
            }));
            connectionFound = true;
            console.log('✅ DApp Portal connection refreshed:', accounts[0]);
          }
        } catch (error) {
          console.log('⚠️ DApp Portal refresh failed, trying Wagmi...', error);
        }
      }
      
      // If DApp Portal failed or not available, try Wagmi
      if (!connectionFound && wagmiConnected && wagmiAddress) {
        const formattedBalance = wagmiBalance ? wagmiBalance.formatted : '0';
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: wagmiAddress,
          currentChainId: wagmiChainId || null,
          walletType: 'wagmi',
          balance: formattedBalance,
          isLoading: false,
          error: null,
        }));
        connectionFound = true;
        console.log('✅ Wagmi connection refreshed:', wagmiAddress);
      }
      
      // If no connection found
      if (!connectionFound) {
        console.log('❌ No wallet connection found after refresh');
        setState(prev => ({
          ...prev,
          isConnected: false,
          account: null,
          currentChainId: null,
          walletType: null,
          balance: null,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh connection:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh wallet connection',
      }));
    }
  }, [useDappPortal, dappWalletClient, isMobile, liff, publicClient, wagmiConnected, wagmiAddress, wagmiChainId, wagmiBalance]);

  const getWalletClient = useCallback((): WalletClient | null => {
    if (state.walletType === 'dapp-portal') {
      return dappWalletClient;
    }
    // For wagmi, we could create a wallet client, but it's typically handled by wagmi hooks
    return null;
  }, [state.walletType, dappWalletClient]);

  const getPublicClient = useCallback((): PublicClient | null => {
    return publicClient || null;
  }, [publicClient]);

  return {
    ...state,
    connect,
    disconnect,
    getBalance,
    switchNetwork,
    refreshConnection,
    getWalletClient,
    getPublicClient,
  };
};
