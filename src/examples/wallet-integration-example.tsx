"use client";

import React, { useState, useEffect } from 'react';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { EnhancedWalletButton } from '@/components/enhanced-wallet-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Example component demonstrating DApps Portal SDK with OKX integration
 */
export const WalletIntegrationExample: React.FC = () => {
  const {
    isConnected,
    account,
    isLoading,
    error,
    walletType,
    currentChainId,
    balance,
    connect,
    disconnect,
    getBalance,
    switchNetwork,
    refreshConnection
  } = useUnifiedWallet();

  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  // Example: Get transaction history
  const fetchTransactionHistory = async () => {
    if (!account) return;
    
    setIsLoadingTx(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactionHistory([
        { hash: '0x123...', type: 'send', amount: '1.5 KAIA', timestamp: new Date() },
        { hash: '0x456...', type: 'receive', amount: '2.0 KAIA', timestamp: new Date() }
      ]);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
    } finally {
      setIsLoadingTx(false);
    }
  };

  // Example: Switch to different network
  const handleSwitchNetwork = async () => {
    try {
      // Switch to Base Sepolia for testing
      await switchNetwork(84532);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  // Example: Send transaction
  const handleSendTransaction = async () => {
    if (!account) return;
    
    try {
      // This would be implemented with actual transaction logic
      console.log('Sending transaction...');
      // await sendTransaction({ to: '0x...', value: '1000000000000000000' });
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          DApps Portal SDK + OKX Integration
        </h1>
        <p className="text-gray-600">
          Unified wallet system with enhanced session management
        </p>
      </div>

      {/* Enhanced Wallet Button */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enhanced Wallet Button</h2>
        <EnhancedWalletButton
          variant="enhanced"
          showBalance={true}
          showWalletType={true}
          autoRefresh={true}
        />
      </Card>

      {/* Wallet Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
            <p><strong>Account:</strong> {account || 'Not connected'}</p>
            <p><strong>Wallet Type:</strong> {walletType || 'None'}</p>
            <p><strong>Chain ID:</strong> {currentChainId || 'None'}</p>
            <p><strong>Balance:</strong> {balance || '0'} KAIA</p>
          </div>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {!isConnected ? (
            <Button onClick={connect} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <>
              <Button onClick={disconnect} variant="outline">
                Disconnect
              </Button>
              <Button onClick={getBalance} variant="outline">
                Refresh Balance
              </Button>
              <Button onClick={refreshConnection} variant="outline">
                Refresh Connection
              </Button>
              <Button onClick={handleSwitchNetwork} variant="outline">
                Switch Network
              </Button>
              <Button onClick={fetchTransactionHistory} variant="outline" disabled={isLoadingTx}>
                {isLoadingTx ? 'Loading...' : 'Get Transaction History'}
              </Button>
              <Button onClick={handleSendTransaction} variant="outline">
                Send Transaction
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Transaction History */}
      {transactionHistory.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <div className="space-y-2">
            {transactionHistory.map((tx, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-mono text-sm">{tx.hash}</p>
                  <p className="text-sm text-gray-600">{tx.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{tx.amount}</p>
                  <p className="text-sm text-gray-600">{tx.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Implementation Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
        <div className="space-y-3 text-sm">
          <div>
            <strong>DApps Portal SDK:</strong> 
            <span className="ml-2 text-green-600">
              {process.env.NEXT_PUBLIC_CLIENT_ID ? 'Configured' : 'Not configured'}
            </span>
          </div>
          <div>
            <strong>OKX Integration:</strong> 
            <span className="ml-2 text-green-600">Active</span>
          </div>
          <div>
            <strong>Wagmi Fallback:</strong> 
            <span className="ml-2 text-green-600">Active</span>
          </div>
          <div>
            <strong>Session Management:</strong> 
            <span className="ml-2 text-green-600">Enhanced</span>
          </div>
          <div>
            <strong>Auto-Reconnection:</strong> 
            <span className="ml-2 text-green-600">Enabled</span>
          </div>
        </div>
      </Card>

      {/* Usage Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        <div className="space-y-3 text-sm">
          <div>
            <strong>1. Desktop Users:</strong> DApps Portal SDK will be used for wallet connection
          </div>
          <div>
            <strong>2. OKX Users:</strong> OKX wallet will be automatically detected and synced
          </div>
          <div>
            <strong>3. Mobile Users:</strong> Wagmi connectors will be used for mobile compatibility
          </div>
          <div>
            <strong>4. Session Persistence:</strong> Wallet sessions are automatically saved and restored
          </div>
          <div>
            <strong>5. Error Handling:</strong> Comprehensive error handling with fallback mechanisms
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WalletIntegrationExample;
