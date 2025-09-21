"use client";
import { useState, useCallback, memo, useEffect } from "react";
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
  RefreshCw,
  Clock,
} from "lucide-react";
import { UserPortfolio } from "./profile/user-portfolio";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useDisconnect } from "wagmi";

const ProfileClient = memo(function ProfileClient() {
  const {
    isConnected,
    account,
    isLoading,
    error,
    connect,
    disconnect,
    getBalance,
    switchWalletType,
    walletType,
  } = useWallet();

  // RainbowKit hooks
  const { address: rainbowAddress, isConnected: rainbowConnected } =
    useAccount();
  const { data: rainbowBalance } = useBalance({
    address: rainbowAddress,
  });
  const { disconnect: rainbowDisconnect } = useDisconnect();

  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [activeWallet, setActiveWallet] = useState<"dapps" | "rainbow" | null>(
    null
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const handleGetBalance = useCallback(async () => {
    if (!isConnected) return;

    try {
      setLoadingBalance(true);
      const walletBalance = await getBalance();
      setBalance((parseInt(walletBalance) / 1e18).toFixed(4));
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

  // Track active wallet
  useEffect(() => {
    if (isConnected && account) {
      setActiveWallet(walletType === "dapp-portal" ? "dapps" : "rainbow");
    } else if (rainbowConnected && rainbowAddress) {
      setActiveWallet("rainbow");
    } else {
      setActiveWallet(null);
    }
  }, [isConnected, account, rainbowConnected, rainbowAddress, walletType]);

  // Handle RainbowKit custom event
  useEffect(() => {
    const handleRainbowKitConnect = () => {
      // Find and click the RainbowKit connect button
      const rainbowKitButton = document.querySelector(
        '[data-testid="rk-connect-button"]'
      );
      if (rainbowKitButton && "click" in rainbowKitButton) {
        (rainbowKitButton as { click: () => void }).click();
      }
    };

    window.addEventListener("rainbowkit:connect", handleRainbowKitConnect);
    return () => {
      window.removeEventListener("rainbowkit:connect", handleRainbowKitConnect);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutside = (event: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const target = event.target as any;
      if (showDropdown && !target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header Section - Senja themed */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="relative inline-block">
            {/* Senja background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 rounded-full blur-xl opacity-30 scale-110"></div>
            <div className="relative inline-flex items-center justify-center overflow-hidden">
              <Image
                src="/beary/beary.png"
                alt="Profile Picture"
                width={128}
                height={128}
                className="object-cover rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-white "
                priority
              />
            </div>
          </div>
        </div>

        {/* Wallet Connection Card - Senja themed */}
        <Card className="mb-4 sm:mb-6 shadow-2xl border border-orange-200 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 backdrop-blur-sm mx-auto max-w-xl relative overflow-hidden">
          {/* Senja decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-300/20 to-red-300/20 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="px-3 sm:px-6">
            <div className="flex gap-3 justify-between">
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
          <CardContent className="px-3 sm:px-6 relative z-10">
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
                  onClick={connect}
                  className="mt-3 bg-gradient-red-orange hover:bg-gradient-sunset text-white text-sm"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            ) : activeWallet ? (
              <div className="space-y-4">
                {/* Wallet Type Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Connected Wallet
                  </h3>
                  <div className="relative dropdown-container">
                    <Button
                      onClick={() => setShowDropdown(!showDropdown)}
                      variant="outline"
                      className="flex items-center bg-orange-100 border-orange-200 gap-2 text-sm"
                    >
                      {activeWallet === "dapps"
                        ? "DApps Portal"
                        : "DApps Wallet"}
                    </Button>
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          {activeWallet !== "dapps" && (
                            <button
                              onClick={() => {
                                switchWalletType("dapp-portal");
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Image
                                src="/dapps-logo.svg"
                                alt="DApps Logo"
                                width={16}
                                height={16}
                                className="w-4 h-4 object-contain"
                              />
                              Switch to DApps Portal
                            </button>
                          )}
                          {activeWallet !== "rainbow" && (
                            <button
                              onClick={() => {
                                switchWalletType("wagmi");
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              Switch to DApps Wallet
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Wallet Info Display */}
                <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-orange-pink rounded-full flex items-center justify-center">
                      {activeWallet === "dapps" ? (
                        <Image
                          src="/dapps-logo.svg"
                          alt="DApps Logo"
                          width={20}
                          height={20}
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain filter brightness-0 invert"
                        />
                      ) : (
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs sm:text-sm text-gray-600">
                        Address
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs sm:text-sm font-medium truncate">
                          {formatAddress(
                            activeWallet === "dapps"
                              ? account || ""
                              : rainbowAddress || ""
                          )}
                        </p>
                        <Button
                          onClick={() =>
                            copyToClipboard(
                              activeWallet === "dapps"
                                ? account || ""
                                : rainbowAddress || ""
                            )
                          }
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
                        {activeWallet === "dapps" ? (
                          balance ? (
                            <p className="text-base sm:text-lg font-semibold text-gray-900">
                              {balance} KAIA
                            </p>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-500">
                              Not loaded
                            </p>
                          )
                        ) : rainbowBalance ? (
                          <p className="text-base sm:text-lg font-semibold text-gray-900">
                            {parseFloat(rainbowBalance.formatted).toFixed(4)}{" "}
                            {rainbowBalance.symbol}
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-500">
                            Loading balance...
                          </p>
                        )}
                      </div>
                      {activeWallet === "dapps" && (
                        <Button
                          onClick={handleGetBalance}
                          disabled={loadingBalance}
                          className="bg-gradient-orange-pink hover:bg-gradient-sunset text-white text-sm w-full sm:w-auto"
                          size="sm"
                        >
                          {loadingBalance ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Loading</span>
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
                      )}
                    </div>
                  </div>

                  {/* Disconnect Button */}
                  <div className="mt-4 pt-3 border-t border-orange-200">
                    <Button
                      onClick={
                        activeWallet === "dapps"
                          ? disconnect
                          : () => {
                              // Disconnect RainbowKit using wagmi hook
                              rainbowDisconnect();
                            }
                      }
                      variant="outline"
                      className="w-full rounded-lg text-sunset-red border-sunset-red/20 hover:bg-red-500 hover:text-white text-sm"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 px-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  Connect Your Wallet
                </h3>

                {/* Wallet Connection Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* OKX Wallet Connect Button - Primary */}
                  <Button
                    onClick={() => {
                      switchWalletType("wagmi");
                      // Trigger RainbowKit modal
                      const event = document.createEvent("Event");
                      event.initEvent("rainbowkit:connect", true, true);
                      window.dispatchEvent(event);
                    }}
                    className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 sm:py-4 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <span className="truncate text-xs sm:text-sm">
                        Connect Other Wallet
                      </span>
                    </div>
                  </Button>

                  {/* DApps Portal Connect Button - Fallback */}
                  <Button
                    onClick={() => {
                      switchWalletType("dapp-portal");
                      connect();
                    }}
                    className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 hover:from-orange-600 hover:via-pink-600 hover:to-red-600 text-white px-4 py-3 sm:py-4 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <Image
                          src="/dapps-logo.svg"
                          alt="DApps Logo"
                          width={16}
                          height={16}
                          className="w-3 h-3 sm:w-4 sm:h-4 object-contain filter brightness-0 invert"
                        />
                      </div>
                      <span className="truncate text-xs sm:text-sm">
                        Connect with DApps
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Portfolio Section */}
        <UserPortfolio className="mb-4 sm:mb-6" />

        {/* Hidden RainbowKit ConnectButton for triggering modal */}
        <div className="hidden">
          <ConnectButton
            label="Hidden RainbowKit"
            showBalance={true}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>
      </div>
    </div>
  );
});

export default ProfileClient;
