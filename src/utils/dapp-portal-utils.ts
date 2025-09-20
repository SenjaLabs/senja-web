// Enhanced DApps Portal SDK utilities for better wallet integration

import DappPortalSDK from '@linenext/dapp-portal-sdk';
import { createWalletClient, custom, type WalletClient } from 'viem';
import { kaia } from 'viem/chains';

export interface DAppPortalConfig {
  clientId: string;
  chainId?: string;
  chainNodeRpcEndpoint?: string;
}

export interface DAppPortalSession {
  account: string;
  chainId: number;
  walletType: 'dapp-portal';
  timestamp: number;
  clientId: string;
  isConnected: boolean;
}

/**
 * Initialize DApps Portal SDK with enhanced error handling
 */
export async function initializeDAppPortalSDK(config: DAppPortalConfig): Promise<{
  success: boolean;
  sdk?: DappPortalSDK;
  walletClient?: WalletClient;
  error?: string;
}> {
  try {
    console.log('🚀 Initializing enhanced DApps Portal SDK...', {
      clientId: config.clientId,
      chainId: config.chainId,
      rpcEndpoint: config.chainNodeRpcEndpoint
    });

    // Validate required config
    if (!config.clientId) {
      throw new Error('CLIENT_ID is required for DApps Portal SDK');
    }

    // Initialize SDK
    const sdk = await DappPortalSDK.init({
      clientId: config.clientId,
      chainId: config.chainId || '8217',
      chainNodeRpcEndpoint: config.chainNodeRpcEndpoint || 'https://public-en.node.kaia.io',
    });

    // Create viem wallet client
    const walletProvider = sdk.getWalletProvider();
    const walletClient = createWalletClient({
      chain: kaia,
      transport: custom(walletProvider as unknown as Parameters<typeof custom>[0]),
    });

    console.log('✅ Enhanced DApps Portal SDK initialized successfully');
    
    return {
      success: true,
      sdk,
      walletClient
    };
  } catch (error) {
    console.error('❌ Enhanced DApps Portal SDK initialization failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown initialization error'
    };
  }
}

/**
 * Check if DApps Portal has an existing session
 */
export async function checkDAppPortalSession(walletClient: WalletClient): Promise<{
  hasSession: boolean;
  account?: string;
  chainId?: number;
}> {
  try {
    console.log('🔍 Checking DApps Portal session...');
    
    const accounts = await walletClient.getAddresses();
    
    if (accounts && accounts.length > 0) {
      const chainId = await walletClient.getChainId();
      
      console.log('✅ DApps Portal session found:', {
        account: accounts[0],
        chainId
      });
      
      return {
        hasSession: true,
        account: accounts[0],
        chainId
      };
    }
    
    console.log('❌ No DApps Portal session found');
    return { hasSession: false };
  } catch (error) {
    console.error('Error checking DApps Portal session:', error);
    return { hasSession: false };
  }
}

/**
 * Connect to DApps Portal with enhanced error handling
 */
export async function connectDAppPortal(walletClient: WalletClient): Promise<{
  success: boolean;
  account?: string;
  chainId?: number;
  error?: string;
}> {
  try {
    console.log('🔗 Enhanced DApps Portal connection attempt...');
    
    // First try to get existing accounts
    let accounts = await walletClient.getAddresses();
    
    // If no accounts, request new connection
    if (!accounts || accounts.length === 0) {
      console.log('🔗 Requesting new DApps Portal connection...');
      accounts = await walletClient.requestAddresses();
    }
    
    if (accounts && accounts.length > 0) {
      const chainId = await walletClient.getChainId();
      
      console.log('✅ Enhanced DApps Portal connected:', {
        account: accounts[0],
        chainId
      });
      
      return {
        success: true,
        account: accounts[0],
        chainId
      };
    }
    
    return {
      success: false,
      error: 'No accounts returned from DApps Portal'
    };
  } catch (error) {
    console.error('❌ Enhanced DApps Portal connection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
}

/**
 * Save DApps Portal session to localStorage with enhanced structure
 */
export function saveDAppPortalSession(session: DAppPortalSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionData = {
      ...session,
      timestamp: Date.now(),
      isConnected: true
    };
    
    window.localStorage.setItem('dapp-portal-session', JSON.stringify(sessionData));
    console.log('💾 Enhanced DApps Portal session saved:', sessionData);
  } catch (error) {
    console.error('Failed to save DApps Portal session:', error);
  }
}

/**
 * Load DApps Portal session from localStorage
 */
export function loadDAppPortalSession(): DAppPortalSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = window.localStorage.getItem('dapp-portal-session');
    if (!stored) return null;
    
    const sessionData = JSON.parse(stored);
    
    // Check if session is expired (24 hours)
    const isExpired = Date.now() - sessionData.timestamp > 24 * 60 * 60 * 1000;
    
    if (isExpired) {
      console.log('🕒 DApps Portal session expired, clearing...');
      window.localStorage.removeItem('dapp-portal-session');
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Failed to load DApps Portal session:', error);
    return null;
  }
}

/**
 * Clear DApps Portal session
 */
export function clearDAppPortalSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.removeItem('dapp-portal-session');
    console.log('🗑️ DApps Portal session cleared');
  } catch (error) {
    console.error('Failed to clear DApps Portal session:', error);
  }
}

/**
 * Get DApps Portal wallet provider info
 */
export function getDAppPortalProviderInfo(sdk: DappPortalSDK): {
  isAvailable: boolean;
  provider?: any;
  chainId?: string;
} {
  try {
    const provider = sdk.getWalletProvider();
    const chainId = sdk.getChainId();
    
    return {
      isAvailable: true,
      provider,
      chainId
    };
  } catch (error) {
    console.error('Failed to get DApps Portal provider info:', error);
    return {
      isAvailable: false
    };
  }
}

/**
 * Enhanced DApps Portal connection with retry logic
 */
export async function connectDAppPortalWithRetry(
  walletClient: WalletClient, 
  maxRetries: number = 3
): Promise<{
  success: boolean;
  account?: string;
  chainId?: number;
  error?: string;
}> {
  let lastError: string | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 DApps Portal connection attempt ${attempt}/${maxRetries}`);
    
    const result = await connectDAppPortal(walletClient);
    
    if (result.success) {
      console.log(`✅ DApps Portal connected on attempt ${attempt}`);
      return result;
    }
    
    lastError = result.error;
    console.warn(`⚠️ DApps Portal attempt ${attempt} failed:`, result.error);
    
    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`
  };
}
