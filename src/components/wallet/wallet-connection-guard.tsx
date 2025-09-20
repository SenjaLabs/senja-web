"use client";

import React, { useCallback, memo } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { Wallet, ArrowRight } from "lucide-react";

interface WalletConnectionGuardProps {
  /** Whether the guard is active */
  isActive: boolean;
  /** Callback when wallet is connected and chain is switched */
  onReady: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Pool data for context */
  pool?: LendingPoolWithTokens;
  /** Target chain ID (default: 8217 for Kaia) */
  targetChainId?: number;
}

const TARGET_CHAIN_ID = 8217; // Kaia chain ID

export const WalletConnectionGuard = memo(function WalletConnectionGuard({
  isActive,
  onReady,
  onCancel,
  pool,
  targetChainId = TARGET_CHAIN_ID,
}: WalletConnectionGuardProps) {
  const router = useRouter();

  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const isOnTargetChain = chainId === targetChainId;
  const needsConnection = !isConnected;
  const needsChainSwitch = isConnected && !isOnTargetChain;

  const handleConnect = useCallback(() => {
    // Simply navigate to profile page
    router.push("/profile");
  }, [router]);

  const handleSwitchChain = useCallback(async () => {
    try {
      await switchChain({ chainId: targetChainId });
    } catch {
      // Handle error silently
    }
  }, [switchChain, targetChainId]);

  const handleReady = useCallback(() => {
    if (isConnected && isOnTargetChain) {
      onReady();
    }
  }, [isConnected, isOnTargetChain, onReady]);

  // Auto-trigger ready when conditions are met
  React.useEffect(() => {
    if (isConnected && isOnTargetChain && isActive) {
      // Add a small delay to prevent race conditions
      const timer = setTimeout(() => {
        handleReady();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isConnected, isOnTargetChain, isActive, handleReady]);

  if (!isActive) return null;

  return (
    <Dialog open={isActive} onOpenChange={onCancel}>
      <DialogContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-senja-orange/30 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient-sunset text-center flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pool info */}
          {pool && (
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden">
                    <img
                      src={
                        pool.collateralTokenInfo?.logo || "/token/kaia-logo.svg"
                      }
                      alt={pool.collateralTokenInfo?.symbol || "Token"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden -ml-2">
                    <img
                      src={pool.borrowTokenInfo?.logo || "/token/kaia-logo.svg"}
                      alt={pool.borrowTokenInfo?.symbol || "Token"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {pool.collateralTokenInfo?.symbol} /{" "}
                    {pool.borrowTokenInfo?.symbol}
                  </div>
                  <div className="text-sm text-gray-600">Lending Pool</div>
                </div>
              </div>
            </Card>
          )}

          {/* Error message */}

          {/* Main action button - centered */}
          <div className="flex flex-col items-center space-y-4">
            {needsConnection && (
              <Button
                onClick={handleConnect}
                className="w-full max-w-xs bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-4 px-8 text-lg"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5" />
                  Connect Wallet
                </div>
              </Button>
            )}

            {needsChainSwitch && (
              <Button
                onClick={handleSwitchChain}
                className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 text-lg"
              >
                <div className="flex items-center gap-3">
                  <ArrowRight className="h-5 w-5" />
                  Switch to Kaia Network
                </div>
              </Button>
            )}

            {isConnected && isOnTargetChain && (
              <Button
                onClick={handleReady}
                className="w-full max-w-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-8 text-lg"
              >
                <div className="flex items-center gap-3">
                  <ArrowRight className="h-5 w-5" />
                  Continue to Pool
                </div>
              </Button>
            )}
          </div>

          {/* Info text */}
          <div className="text-center text-sm text-gray-600">
            <p>
              To interact with this pool, you need to connect your wallet and
              switch to the Kaia network (Chain ID: 8217).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

WalletConnectionGuard.displayName = "WalletConnectionGuard";
