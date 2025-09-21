"use client";

import { useState, useEffect } from "react";
import { useUnifiedWallet } from "@/hooks/useUnifiedWallet";
import { DisconnectConfirmationDialog } from "@/components/wallet/disconnect-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SwitchChainButton from "./button/switch-wallet-button";

interface EnhancedWalletButtonProps {
  variant?: "default" | "compact" | "minimal" | "enhanced";
  showBalance?: boolean;
  showWalletType?: boolean;
  className?: string;
  autoRefresh?: boolean;
}

export const EnhancedWalletButton = ({
  variant = "enhanced",
  showBalance = true,
  showWalletType = true,
  className = "",
  autoRefresh = true,
}: EnhancedWalletButtonProps) => {
  const {
    isConnected,
    account,
    isLoading,
    error,
    walletType,
    connect,
    disconnect,
    getBalance,
    refreshConnection,
  } = useUnifiedWallet();
  
  
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Enhanced balance fetching with auto-refresh
  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && account) {
        try {
          setIsLoadingBalance(true);
          const walletBalance = await getBalance();
          // getBalance() already returns formatted string
          setBalance(walletBalance);
          setLastRefresh(new Date());
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance(null);
        } finally {
          setIsLoadingBalance(false);
        }
      } else {
        setBalance(null);
        setLastRefresh(null);
      }
    };

    fetchBalance();

    // Auto-refresh balance every 30 seconds if enabled
    if (autoRefresh && isConnected) {
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, account, getBalance, autoRefresh]);

  const handleConnect = async () => {
    // Connect directly to DApps Portal SDK
    console.log('🔧 Enhanced wallet button - connecting directly to DApps Portal SDK');
    try {
      await connect('dapp-portal');
    } catch (error) {
      console.error('DApps Portal connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    // Open disconnect confirmation dialog
    setIsDisconnectDialogOpen(true);
  };

  const handleConfirmDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
      console.log('✅ Wallet disconnected successfully');
    } catch (error) {
      console.error('Disconnection failed:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleCloseDisconnectDialog = () => {
    setIsDisconnectDialogOpen(false);
  };

  const handleRefresh = async () => {
    try {
      await refreshConnection();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    if (typeof window !== 'undefined' && window.navigator?.clipboard) {
      window.navigator.clipboard.writeText(text);
    }
  };

  const getWalletTypeDisplay = () => {
    switch (walletType) {
      case 'dapp-portal':
        return 'DApps Portal';
      case 'wagmi':
        return 'OKX Wallet';
      default:
        return 'Unknown';
    }
  };

  const getWalletTypeColor = () => {
    switch (walletType) {
      case 'dapp-portal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'wagmi':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Connecting...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium text-sm">Connection Error</p>
          </div>
          <p className="text-red-600 text-xs mb-3">{error}</p>
          <div className="flex gap-2">
            <Button onClick={handleConnect} className="bg-red-600 hover:bg-red-700 text-white" size="sm">
              Try Again
            </Button>
            <Button onClick={refreshConnection} variant="outline" size="sm" className="border-red-300 text-red-600">
              Refresh
            </Button>
          </div>
        </div>
      );
    }

    if (isConnected && account) {
    if (variant === "minimal") {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          {showWalletType && (
            <Badge className={`text-xs ${getWalletTypeColor()}`}>
              {getWalletTypeDisplay()}
            </Badge>
          )}
          <Badge variant="default" className="bg-green-100 text-green-600 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            {formatAddress(account)}
          </Badge>
          <Button onClick={handleDisconnect} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
            Disconnect
          </Button>
        </div>
      );
    }

    if (variant === "compact") {
      return (
        <div className={`flex flex-col gap-3 p-3 bg-green-50 rounded-lg border border-green-200 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-sm font-medium">{formatAddress(account)}</p>
                {showWalletType && (
                  <Badge className={`text-xs ${getWalletTypeColor()}`}>
                    {getWalletTypeDisplay()}
                  </Badge>
                )}
              </div>
              {showBalance && balance && (
                <p className="text-xs text-gray-600">{balance} KAIA</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleDisconnect} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                Disconnect
              </Button>
              <SwitchChainButton className="h-8 px-2 text-xs" />
            </div>
          </div>
        </div>
      );
    }

    // Enhanced variant (default)
    return (
      <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900">Wallet Connected</p>
                {showWalletType && (
                  <Badge className={`text-xs ${getWalletTypeColor()}`}>
                    {getWalletTypeDisplay()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-gray-600">{formatAddress(account)}</p>
                <Button onClick={() => copyToClipboard(account)} variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-gray-100">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleDisconnect} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              Disconnect
            </Button>
            <SwitchChainButton className="h-8 px-3 text-xs" />
          </div>
        </div>

        {showBalance && (
          <div className="border-t border-green-200 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                {balance ? (
                  <p className="text-lg font-semibold text-gray-900">{balance} KAIA</p>
                ) : (
                  <p className="text-sm text-gray-500">Not loaded</p>
                )}
                {lastRefresh && (
                  <p className="text-xs text-gray-400">Last updated: {lastRefresh.toLocaleTimeString()}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isLoadingBalance}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {isLoadingBalance ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Loading...
                    </div>
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
    }

    // Not connected state
    if (variant === "minimal") {
      return (
        <Button onClick={handleConnect} className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`} size="sm">
          Connect
        </Button>
      );
    }

    if (variant === "compact") {
      return (
        <Button onClick={handleConnect} className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}>
          Connect Wallet
        </Button>
      );
    }

    // Enhanced variant (default)
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-4">
          Connect your wallet to access all features. We support DApps Portal and OKX Wallet.
        </p>
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>DApps Portal SDK</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>OKX Wallet</span>
          </div>
        </div>
        <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium">
          Connect Wallet
        </Button>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <DisconnectConfirmationDialog
        isOpen={isDisconnectDialogOpen}
        onClose={handleCloseDisconnectDialog}
        onConfirm={handleConfirmDisconnect}
        walletType={walletType || undefined}
        account={account || undefined}
        isLoading={isDisconnecting}
      />
    </>
  );
};
