"use client";

import React, { useState, useCallback, memo } from 'react';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LendingPoolWithTokens } from '@/lib/graphql/lendingpool-list.fetch';
import { Wallet, AlertTriangle, ArrowRight } from 'lucide-react';

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  const isOnTargetChain = chainId === targetChainId;
  const needsConnection = !isConnected;
  const needsChainSwitch = isConnected && !isOnTargetChain;

  const handleConnect = useCallback(async () => {
    if (!connectors[0]) {
      setError('No wallet connector available');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      await connect({ connector: connectors[0] });
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, [connect, connectors]);

  const handleSwitchChain = useCallback(async () => {
    try {
      setIsSwitching(true);
      setError(null);
      await switchChain({ chainId: targetChainId });
    } catch (err) {
      console.error('Failed to switch chain:', err);
      setError('Failed to switch to Kaia network. Please try again.');
    } finally {
      setIsSwitching(false);
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
                      src={pool.collateralTokenInfo?.logo || "/token/kaia-logo.svg"}
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
                    {pool.collateralTokenInfo?.symbol} / {pool.borrowTokenInfo?.symbol}
                  </div>
                  <div className="text-sm text-gray-600">
                    Lending Pool
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Main action button - centered */}
          <div className="flex flex-col items-center space-y-4">
            {needsConnection && (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full max-w-xs bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-4 px-8 text-lg"
              >
                {isConnecting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                  </div>
                )}
              </Button>
            )}

            {needsChainSwitch && (
              <Button
                onClick={handleSwitchChain}
                disabled={isSwitching}
                className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 text-lg"
              >
                {isSwitching ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Switching...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-5 w-5" />
                    Switch to Kaia Network
                  </div>
                )}
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

            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full max-w-xs border-gray-300 text-gray-700 hover:bg-gray-50 py-2"
            >
              Cancel
            </Button>
          </div>

          {/* Info text */}
          <div className="text-center text-sm text-gray-600">
            <p>
              To interact with this pool, you need to connect your wallet and switch to the Kaia network (Chain ID: 8217).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

WalletConnectionGuard.displayName = 'WalletConnectionGuard';
