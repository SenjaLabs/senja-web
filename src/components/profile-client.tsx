"use client";
import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedWallet } from "@/hooks/useUnifiedWallet";
import { DisconnectConfirmationDialog } from "@/components/wallet/disconnect-confirmation-dialog";
import {
  Lock,
  CreditCard,
  Copy,
  AlertTriangle,
  RefreshCw,
  Clock,
} from "lucide-react";
import SwitchWalletButton from "./button/switch-wallet-button";
import { UserPortfolio } from "./profile/user-portfolio";
import { WalletSessionIndicator } from "./wallet-session-indicator";

const ProfileClient = memo(function ProfileClient() {
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
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [refreshingConnection, setRefreshingConnection] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleGetBalance = useCallback(async () => {
    if (!isConnected) return;

    try {
      setLoadingBalance(true);
      const walletBalance = await getBalance();
      // getBalance() already returns formatted string
      setBalance(walletBalance);
    } catch {
      // Silent error handling for production
    } finally {
      setLoadingBalance(false);
    }
  }, [isConnected, getBalance]);

  const formatAddress = useCallback(
    (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`,
    []
  );

  const copyToClipboard = useCallback((text: string) => {
    // eslint-disable-next-line no-undef
    navigator.clipboard.writeText(text);
  }, []);

  const handleRefreshConnection = useCallback(async () => {
    try {
      setRefreshingConnection(true);
      await refreshConnection();
    } finally {
      setRefreshingConnection(false);
    }
  }, [refreshConnection]);

  const handleConfirmDisconnect = useCallback(async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
      console.log('✅ Wallet disconnected successfully');
    } catch (error) {
      console.error('Disconnection failed:', error);
    } finally {
      setIsDisconnecting(false);
    }
  }, [disconnect]);

  const handleCloseDisconnectDialog = useCallback(() => {
    setIsDisconnectDialogOpen(false);
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Development Session Indicator - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p- hidden bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              🔧 Development Mode - OKX Session Debug
            </h3>
            <WalletSessionIndicator />
          </div>
        </div>
      )}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header Section - Icon close to hero header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center overflow-hidden">
            <Image
              src="/beary/beary.png"
              alt="Profile Picture"
              width={128}
              height={128}
              className="object-cover rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
              priority
            />
          </div>
        </div>

        {/* Wallet Connection Card - Same width as pool cards */}
        <Card className="mb-4 sm:mb-6 shadow-lg border border-orange-100 bg-white/80 backdrop-blur-sm mx-auto max-w-xl">
          <CardHeader className=" px-3 ">
            <div className="flex px-3 gap-3 justify-between">
              <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-orange-pink rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                Wallet Connection
              </CardTitle>
              {isConnected && (
                <Badge
                  variant="default"
                  className="bg-orange-50 text-green-600 border border-orange-200 self-start sm:self-auto"
                >
                  <div className="w-2 h-2 bg-sunset-orange rounded-full mr-2"></div>
                  Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-sm sm:text-base text-gray-600">
                  Connecting...
                </span>
              </div>
            ) : error ? (
              <div className="bg-gradient-orange-red-soft border border-sunset-red/20 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-sunset-red mr-2" />
                  <p className="text-sm sm:text-base text-sunset-red font-medium">
                    Connection Error
                  </p>
                </div>
                <p className="text-sunset-red/80 text-xs sm:text-sm mt-1">
                  {error}
                </p>
                <Button
                  onClick={() => {
                    connect('dapp-portal');
                  }}
                  className="mt-3 bg-gradient-red-orange hover:bg-gradient-sunset text-white text-sm"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            ) : isConnected && account ? (
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      Connected Wallet
                    </h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button
                        onClick={handleRefreshConnection}
                        disabled={refreshingConnection}
                        variant="outline"
                        className="rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50 text-sm disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${refreshingConnection ? 'animate-spin' : ''}`} />
                        {refreshingConnection ? 'Refreshing...' : 'Refresh'}
                      </Button>
                      <SwitchWalletButton />
                      <Button
                        onClick={() => setIsDisconnectDialogOpen(true)}
                        variant="outline"
                        className="rounded-lg text-sunset-red border-sunset-red/20 hover:bg-red-500 hover:text-white text-sm"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-orange-pink rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs sm:text-sm text-gray-600">
                        Address
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs sm:text-sm font-medium truncate">
                          {formatAddress(account)}
                        </p>
                        <Button
                          onClick={() => copyToClipboard(account)}
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-orange-100 flex-shrink-0"
                        >
                          <Copy className="w-3 h-3 text-sunset-orange" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Balance Section */}
                  <div className="border-t border-orange-200 pt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Balance
                        </p>
                        {balance ? (
                          <p className="text-base sm:text-lg font-semibold text-gray-900">
                            {balance} KAIA
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-500">
                            Not loaded
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleGetBalance}
                        disabled={loadingBalance}
                        className="bg-gradient-orange-pink hover:bg-gradient-sunset text-white text-sm w-full sm:w-auto"
                        size="sm"
                      >
                        {loadingBalance ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span className="hidden sm:inline">Loading</span>
                            <span className="sm:hidden">Loading</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              Refresh Balance
                            </span>
                            <span className="sm:hidden">Refresh</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Image
                    src="/beary/beary-wallet.png"
                    alt="Beary with wallet"
                    width={80}
                    height={80}
                  />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Connect your wallet to access your profile and manage your
                  assets
                </p>
                
                {/* Debug info for mobile */}
                {typeof window !== 'undefined' && window.navigator && (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                    <div>User Agent: {window.navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
                    <div>Environment: {process.env.NODE_ENV}</div>
                    <div>Timestamp: {new Date().toLocaleTimeString()}</div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => connect('dapp-portal')}
                    className="bg-gradient-orange-pink hover:bg-gradient-sunset text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-medium flex-1 sm:flex-none"
                  >
                    Connect Wallet
                  </Button>
                  <Button
                    onClick={handleRefreshConnection}
                    disabled={refreshingConnection}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-medium flex-1 sm:flex-none disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshingConnection ? 'animate-spin' : ''}`} />
                    {refreshingConnection ? 'Refreshing...' : 'Refresh Connection'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Portfolio Section */}
        <UserPortfolio className="mb-4 sm:mb-6" />
      </div>
      
      {/* Disconnect Confirmation Dialog */}
      <DisconnectConfirmationDialog
        isOpen={isDisconnectDialogOpen}
        onClose={handleCloseDisconnectDialog}
        onConfirm={handleConfirmDisconnect}
        walletType={walletType || undefined}
        account={account || undefined}
        isLoading={isDisconnecting}
      />
    </div>
  );
});

export default ProfileClient;
