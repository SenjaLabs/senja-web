"use client";

import React, { useState, useCallback, memo } from "react";
import { ArrowUpDown, Info, ChevronDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector } from "../select/token";
import { PoolSearchDialog } from "../search";
import { Token } from "@/types";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";

/**
 * Props for the SwapInterface component
 */
interface SwapInterfaceProps {
  /** Callback function when swap is executed */
  onSwap: (fromToken: Token, toToken: Token, amount: string) => void;
}

/**
 * SwapInterface component for token swapping functionality
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const SwapInterface = memo(function SwapInterface({
  onSwap,
}: SwapInterfaceProps) {
  const [fromToken, setFromToken] = useState<Token | undefined>();
  const [toToken, setToToken] = useState<Token | undefined>();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWarningDetails, setShowWarningDetails] = useState(false);
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);

  const exchangeRate = 1850.42; // Mock exchange rate
  const minReceived = toAmount
    ? (parseFloat(toAmount) * 0.995).toFixed(6)
    : "0";

  const handleSwapTokens = useCallback(() => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;

    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const handleFromAmountChange = useCallback(
    (value: string) => {
      setFromAmount(value);
      if (value && fromToken && toToken) {
        const converted = parseFloat(value) * exchangeRate;
        setToAmount(converted.toFixed(6));
      } else {
        setToAmount("");
      }
    },
    [fromToken, toToken, exchangeRate]
  );

  const handlePoolSelect = useCallback((pool: LendingPoolWithTokens) => {
    setSelectedPool(pool);

    // Auto-set tokens based on selected pool
    if (pool.borrowTokenInfo && pool.collateralTokenInfo) {
      setFromToken(pool.collateralTokenInfo);
      setToToken(pool.borrowTokenInfo);
    }
  }, []);

  const handleSwap = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsLoading(true);
    try {
      await onSwap(fromToken, toToken, fromAmount);
    } finally {
      setIsLoading(false);
    }
  }, [fromToken, toToken, fromAmount, onSwap]);

  const toggleWarningDetails = useCallback(() => {
    setShowWarningDetails((prev) => !prev);
  }, []);

  const canSwap =
    fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0;
  const needsWalletConnection = false; // This would come from wallet context

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm border border-sunset-orange shadow-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Swap</h2>
            <PoolSearchDialog
              selectedPool={selectedPool}
              onPoolSelect={handlePoolSelect}
            />
          </div>

          {/* From Token Section */}
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Sell</span>
                <span className="text-sm text-gray-500">
                  {fromToken ? `${fromToken.symbol} Token` : "Select token"}
                </span>
              </div>

              <div className="relative bg-sunset-pink-light rounded-xl p-4 border border-sunset-orange">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Input
                      type="number"
                      placeholder="0"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="border-0 bg-transparent text-3xl font-semibold placeholder:text-gray-400 p-0 h-auto focus-visible:ring-0 text-gray-900"
                    />
                    {fromToken && fromAmount ? (
                      <div className="text-sm text-gray-500 mt-1">
                        ≈ ${(parseFloat(fromAmount) * 1850).toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">-</div>
                    )}
                  </div>
                  <TokenSelector
                    selectedToken={fromToken}
                    onTokenSelect={setFromToken}
                    otherToken={toToken}
                    label="Select token to swap from"
                  />
                </div>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapTokens}
                className="h-10 w-10 rounded-full bg-white border border-sunset-orange hover:bg-sunset-orange-light shadow-sm"
              >
                <ArrowUpDown className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            {/* To Token Section */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Buy</span>
                <span className="text-sm text-gray-500">
                  {toToken ? `${toToken.symbol} Token` : "Select token"}
                </span>
              </div>

              <div className="relative bg-sunset-pink-light rounded-xl p-4 border border-sunset-orange">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Input
                      type="number"
                      placeholder="0"
                      value={toAmount}
                      readOnly
                      className="border-0 bg-transparent text-3xl font-semibold placeholder:text-gray-400 p-0 h-auto focus-visible:ring-0 text-gray-900"
                    />
                    {toToken && toAmount ? (
                      <div className="text-sm text-gray-500 mt-1">
                        ${(parseFloat(toAmount) * 1).toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">-</div>
                    )}
                  </div>
                  <TokenSelector
                    selectedToken={toToken}
                    onTokenSelect={setToToken}
                    otherToken={fromToken}
                    label="Select token to receive"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <div className="mt-6">
            {needsWalletConnection ? (
              <Button className="w-full h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg">
                Connect wallet
              </Button>
            ) : !fromToken || !toToken ? (
              <Button
                disabled
                className="w-full h-14 text-lg font-semibold bg-orange-100 text-orange-600 rounded-xl border border-orange-200"
              >
                Select tokens
              </Button>
            ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
              <Button
                disabled
                className="w-full h-14 text-lg font-semibold bg-orange-100 text-orange-600 rounded-xl border border-orange-200"
              >
                Enter amount
              </Button>
            ) : (
              <Button
                onClick={handleSwap}
                disabled={!canSwap || isLoading}
                className="w-full h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 rounded-xl shadow-lg"
              >
                {isLoading
                  ? "Swapping..."
                  : `Swap ${fromToken.symbol} for ${toToken.symbol}`}
              </Button>
            )}
          </div>

          {/* Warning Message */}
          {fromToken && toToken && fromAmount && (
            <div className="mt-4 bg-orange-50 rounded-lg border border-orange-200">
              <button
                onClick={toggleWarningDetails}
                className="w-full p-3 flex items-center text-orange-700 text-sm hover:bg-orange-100/50 transition-colors rounded-lg"
              >
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>This trade cannot be completed right now</span>
                <ChevronDown
                  className={`h-4 w-4 ml-auto text-orange-700 transition-transform ${
                    showWarningDetails ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Trading Details */}
              {showWarningDetails && (
                <div className="px-3 pb-3 border-t border-yellow-200/50">
                  <div className="pt-3 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Fee (0.25%)</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <span className="text-gray-900 font-medium">$11.02</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Network cost</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <div className="flex items-center text-gray-900">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mr-1">
                          <span className="text-xs text-white">⟠</span>
                        </div>
                        <span className="font-medium">N/A</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Order routing</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <span className="text-gray-900 font-medium">
                        Uniswap API
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Price impact</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <span className="text-green-600 font-medium">-0.31%</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Max slippage</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <div className="flex items-center text-gray-900">
                        <span className="text-gray-500 mr-2">Auto</span>
                        <span className="font-medium">2.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
