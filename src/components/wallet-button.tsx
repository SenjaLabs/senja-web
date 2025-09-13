"use client";

import { useWagmiWallet } from "@/hooks/useWagmiWallet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SwitchChainButton from "./button/switch-wallet-button";

interface WalletButtonProps {
  variant?: "default" | "compact" | "minimal";
  showBalance?: boolean;
  className?: string;
}

export const WalletButton = ({
  variant = "default",
  showBalance = true,
  className = "",
}: WalletButtonProps) => {
  const {
    isConnected,
    account,
    isLoading,
    error,
    currentChainId,
    connect,
    disconnect,
    getBalance,
    balance,
    isLoadingBalance,
  } = useWagmiWallet();
  // Balance is now provided by wagmi

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  // Balance is now automatically managed by wagmi

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600">Connecting...</span>
      </div>
    );
  }

  if (error) {
    // Check if it's a setup error that needs the setup guide
    const errorMessage = String(error || '');
    const isSetupError = errorMessage.includes("Channel ID") ||
      errorMessage.includes("NEXT_PUBLIC_CLIENT_ID") ||
      errorMessage.includes("Environment variables not configured");

    // For other variants or non-setup errors, show compact error
    return (
      <div
        className={`p-4 bg-gradient-orange-red-soft border border-sunset-red/20 rounded-lg ${className}`}
      >
        <div className="flex items-center mb-2">
          <svg
            className="w-4 h-4 text-red-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-700 font-medium text-sm">Connection Error</p>
        </div>
        <p className="text-red-600 text-xs mb-3">{error}</p>
        <Button
          onClick={handleConnect}
          className="bg-gradient-red-orange hover:bg-gradient-sunset text-white"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isConnected && account) {
    if (variant === "minimal") {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <Badge
            variant="default"
            className="bg-orange-100 text-purple-600 border border-orange-200"
          >
            <div className="w-2 h-2 bg-gradient-sunset rounded-full mr-1"></div>
            {formatAddress(account)}
          </Badge>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
            className="text-sunset-red border-sunset-red/20 hover:bg-sunset-red/10"
          >
            Disconnect
          </Button>
        </div>
      );
    }

    if (variant === "compact") {
      return (
        <div
          className={`flex flex-col gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-sunset rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-mono text-sm font-medium">
                {formatAddress(account)}
              </p>
            {showBalance && balance && (
              <p className="text-xs text-gray-600">{balance.formatted} {balance.symbol}</p>
            )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="text-sunset-red border-sunset-red/20 hover:bg-sunset-red/10"
              >
                Disconnect
              </Button>
              <SwitchChainButton className="h-8 px-2 text-xs" />
            </div>
          </div>
        </div>
      );
    }

    // Default variant
    return (
      <div
        className={`p-4 bg-orange-50 border border-orange-200 rounded-lg ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-sunset rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Wallet Connected</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-gray-600">
                  {formatAddress(account)}
                </p>
                <Button
                  onClick={() => copyToClipboard(account)}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-gray-100"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="text-sunset-red border-sunset-red/20 hover:bg-sunset-red/10"
            >
              Disconnect
            </Button>
            <SwitchChainButton className="h-8 px-3 text-xs" />
          </div>
        </div>

        {showBalance && (
          <div className="border-t border-orange-200 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                {balance ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {balance.formatted} {balance.symbol}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Not loaded</p>
                )}
              </div>
              <Button
                onClick={() => window.location.reload()}
                disabled={isLoadingBalance}
                className="bg-gradient-sunset hover:bg-gradient-twilight text-white"
                size="sm"
              >
                {isLoadingBalance ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Loading...
                  </div>
                ) : (
                  "Refresh Balance"
                )}
              </Button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Not connected state
  if (variant === "minimal") {
    return (
      <Button
        onClick={handleConnect}
        className={`bg-gradient-sunset hover:bg-gradient-twilight text-white ${className}`}
        size="sm"
      >
        Connect
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={handleConnect}
        className={`bg-gradient-sunset hover:bg-gradient-twilight text-white ${className}`}
      >
        Connect Wallet
      </Button>
    );
  }

  // Default variant
  return (
    <div className={`text-center p-6 ${className}`}>
      <div className="w-16 h-16 bg-sunset-orange-light rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-orange-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connect Your Wallet
      </h3>
      <p className="text-gray-600 mb-6">
        Connect your wallet to access all features
      </p>
      <Button
        onClick={handleConnect}
        className="bg-gradient-sunset hover:bg-gradient-twilight text-white px-8 py-3 text-lg font-medium"
      >
        Connect Wallet
      </Button>
    </div>
  );
};
