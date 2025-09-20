// Test file for DApps Portal utilities

import { 
  initializeDAppPortalSDK,
  checkDAppPortalSession,
  connectDAppPortal,
  saveDAppPortalSession,
  loadDAppPortalSession,
  clearDAppPortalSession,
  getDAppPortalProviderInfo,
  connectDAppPortalWithRetry
} from '../dapp-portal-utils';

// Mock DApps Portal SDK
jest.mock('@linenext/dapp-portal-sdk', () => ({
  init: jest.fn(),
}));

// Mock viem
jest.mock('viem', () => ({
  createWalletClient: jest.fn(),
  custom: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DApps Portal Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeDAppPortalSDK', () => {
    it('should initialize SDK successfully with valid config', async () => {
      const mockSDK = {
        getWalletProvider: jest.fn().mockReturnValue({}),
        getChainId: jest.fn().mockReturnValue('8217'),
      };

      const mockWalletClient = {
        getAddresses: jest.fn(),
        requestAddresses: jest.fn(),
        getChainId: jest.fn(),
      };

      const DappPortalSDK = require('@linenext/dapp-portal-sdk');
      const { createWalletClient } = require('viem');

      DappPortalSDK.init.mockResolvedValue(mockSDK);
      createWalletClient.mockReturnValue(mockWalletClient);

      const result = await initializeDAppPortalSDK({
        clientId: 'test-client-id',
        chainId: '8217',
        chainNodeRpcEndpoint: 'https://test-rpc.com'
      });

      expect(result.success).toBe(true);
      expect(result.sdk).toBe(mockSDK);
      expect(result.walletClient).toBe(mockWalletClient);
      expect(result.error).toBeUndefined();
    });

    it('should fail initialization without clientId', async () => {
      const result = await initializeDAppPortalSDK({
        clientId: '',
        chainId: '8217'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('CLIENT_ID is required for DApps Portal SDK');
    });

    it('should handle initialization errors', async () => {
      const DappPortalSDK = require('@linenext/dapp-portal-sdk');
      DappPortalSDK.init.mockRejectedValue(new Error('Network error'));

      const result = await initializeDAppPortalSDK({
        clientId: 'test-client-id'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('checkDAppPortalSession', () => {
    it('should return session info when wallet has accounts', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
        getChainId: jest.fn().mockResolvedValue(8217),
      };

      const result = await checkDAppPortalSession(mockWalletClient);

      expect(result.hasSession).toBe(true);
      expect(result.account).toBe('0x1234567890123456789012345678901234567890');
      expect(result.chainId).toBe(8217);
    });

    it('should return no session when wallet has no accounts', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn().mockResolvedValue([]),
        getChainId: jest.fn().mockResolvedValue(8217),
      };

      const result = await checkDAppPortalSession(mockWalletClient);

      expect(result.hasSession).toBe(false);
      expect(result.account).toBeUndefined();
      expect(result.chainId).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn().mockRejectedValue(new Error('Wallet error')),
        getChainId: jest.fn().mockResolvedValue(8217),
      };

      const result = await checkDAppPortalSession(mockWalletClient);

      expect(result.hasSession).toBe(false);
    });
  });

  describe('connectDAppPortal', () => {
    it('should connect successfully with existing accounts', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
        requestAddresses: jest.fn(),
        getChainId: jest.fn().mockResolvedValue(8217),
      };

      const result = await connectDAppPortal(mockWalletClient);

      expect(result.success).toBe(true);
      expect(result.account).toBe('0x1234567890123456789012345678901234567890');
      expect(result.chainId).toBe(8217);
      expect(mockWalletClient.requestAddresses).not.toHaveBeenCalled();
    });

    it('should request new connection when no existing accounts', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn().mockResolvedValue([]),
        requestAddresses: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
        getChainId: jest.fn().mockResolvedValue(8217),
      };

      const result = await connectDAppPortal(mockWalletClient);

      expect(result.success).toBe(true);
      expect(result.account).toBe('0x1234567890123456789012345678901234567890');
      expect(mockWalletClient.requestAddresses).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn().mockRejectedValue(new Error('Connection failed')),
        requestAddresses: jest.fn(),
        getChainId: jest.fn(),
      };

      const result = await connectDAppPortal(mockWalletClient);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('Session Management', () => {
    it('should save session to localStorage', () => {
      const session = {
        account: '0x1234567890123456789012345678901234567890',
        chainId: 8217,
        walletType: 'dapp-portal' as const,
        timestamp: Date.now(),
        clientId: 'test-client-id',
        isConnected: true,
      };

      saveDAppPortalSession(session);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dapp-portal-session',
        JSON.stringify(expect.objectContaining(session))
      );
    });

    it('should load session from localStorage', () => {
      const session = {
        account: '0x1234567890123456789012345678901234567890',
        chainId: 8217,
        walletType: 'dapp-portal' as const,
        timestamp: Date.now(),
        clientId: 'test-client-id',
        isConnected: true,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(session));

      const result = loadDAppPortalSession();

      expect(result).toEqual(session);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('dapp-portal-session');
    });

    it('should return null for expired session', () => {
      const expiredSession = {
        account: '0x1234567890123456789012345678901234567890',
        chainId: 8217,
        walletType: 'dapp-portal' as const,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        clientId: 'test-client-id',
        isConnected: true,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession));

      const result = loadDAppPortalSession();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dapp-portal-session');
    });

    it('should clear session from localStorage', () => {
      clearDAppPortalSession();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dapp-portal-session');
    });
  });

  describe('connectDAppPortalWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
        requestAddresses: jest.fn(),
        getChainId: jest.fn().mockResolvedValue(8217),
      };

      const result = await connectDAppPortalWithRetry(mockWalletClient, 3);

      expect(result.success).toBe(true);
      expect(result.account).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn()
          .mockRejectedValueOnce(new Error('First attempt failed'))
          .mockRejectedValueOnce(new Error('Second attempt failed'))
          .mockResolvedValue(['0x1234567890123456789012345678901234567890']),
        requestAddresses: jest.fn(),
        getChainId: jest.fn().mockResolvedValue(8217),
      };

      const result = await connectDAppPortalWithRetry(mockWalletClient, 3);

      expect(result.success).toBe(true);
      expect(result.account).toBe('0x1234567890123456789012345678901234567890');
      expect(mockWalletClient.getAddresses).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockWalletClient = {
        getAddresses: jest.fn().mockRejectedValue(new Error('Persistent error')),
        requestAddresses: jest.fn(),
        getChainId: jest.fn(),
      };

      const result = await connectDAppPortalWithRetry(mockWalletClient, 2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed after 2 attempts');
      expect(mockWalletClient.getAddresses).toHaveBeenCalledTimes(2);
    });
  });
});
