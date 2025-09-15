"use client";
import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import {
  Lock,
  CreditCard,
  Copy,
  AlertTriangle,
  Link2,
  RefreshCw,
  Clock,
} from "lucide-react";
import SwitchWalletButton from "./button/switch-wallet-button";

const ProfileClient = memo(function ProfileClient() {
  const {
    isConnected,
    account,
    isLoading,
    error,
    connect,
    disconnect,
    getBalance,
  } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const handleGetBalance = useCallback(async () => {
    if (!isConnected) return;

    try {
      setLoadingBalance(true);
      const walletBalance = await getBalance();
      setBalance((parseInt(walletBalance) / 1e18).toFixed(4));
    } catch  {
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

  return (
    <div className="min-h-screen mt-8 xl:mt-16">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
            <Image
              src="/beary/beary.png"
              alt="Profile Picture"
              width={128}
              height={128}
              className="object-cover rounded-full w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 "
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Manage your wallet and account settings
          </p>
        </div>

        {/* Wallet Connection Card */}
        <Card className="mb-4 sm:mb-6 shadow-lg border border-orange-100 bg-white/80 backdrop-blur-sm">
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
                <span className="ml-3 text-sm sm:text-base text-gray-600">Connecting...</span>
              </div>
            ) : error ? (
              <div className="bg-gradient-orange-red-soft border border-sunset-red/20 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-sunset-red mr-2" />
                  <p className="text-sm sm:text-base text-sunset-red font-medium">
                    Connection Error
                  </p>
                </div>
                <p className="text-sunset-red/80 text-xs sm:text-sm mt-1">{error}</p>
                <Button
                  onClick={connect}
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
                      <SwitchWalletButton />
                      <Button
                        onClick={disconnect}
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
                      <p className="font-mono text-xs sm:text-sm text-gray-600">Address</p>
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
                        <p className="text-xs sm:text-sm text-gray-600">Balance</p>
                        {balance ? (
                          <p className="text-base sm:text-lg font-semibold text-gray-900">
                            {balance} KAIA
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-500">Not loaded</p>
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
                            <span className="hidden sm:inline">Loading...</span>
                            <span className="sm:hidden">Loading</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3" />
                            <span className="hidden sm:inline">Refresh Balance</span>
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sunset-orange-light rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Link2 className="w-6 h-6 sm:w-8 sm:h-8 text-sunset-orange" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Connect your wallet to access your profile and manage your
                  assets
                </p>
                <Button
                  onClick={connect}
                  className="bg-gradient-orange-pink hover:bg-gradient-sunset text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-medium w-full sm:w-auto"
                >
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default ProfileClient;
