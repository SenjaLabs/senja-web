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
import { useReadUserPosition } from "@/hooks/read/readUserPosition";
import { useAccount } from "wagmi";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral";

/**
 * Props for the SwapInterface component
 */
interface SwapInterfaceProps {
  /** Callback function when swap is executed */
  onSwap: (fromToken: Token, toToken: Token, amount: string, selectedPoolAddress?: string, userPositionAddress?: string) => void;
  /** Whether a swap is currently in progress */
  isSwapping?: boolean;
  /** Whether the token is approved for spending */
  isApproved?: boolean;
  /** Whether approval is needed */
  needsApproval?: boolean;
  /** Whether approval is in progress */
  isApproving?: boolean;
  /** Whether to show success alert */
  showSuccessAlert?: boolean;
  /** Whether to show failed alert */
  showFailedAlert?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Success transaction hash */
  successTxHash?: string;
  /** Callback to close success alert */
  onCloseSuccessAlert?: () => void;
  /** Callback to close failed alert */
  onCloseFailedAlert?: () => void;
}

/**
 * SwapInterface component for token swapping functionality
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const SwapInterface = memo(function SwapInterface({
  onSwap,
  isSwapping = false,
  isApproved = false,
  needsApproval = true,
  isApproving = false,
  showSuccessAlert = false,
  showFailedAlert = false,
  errorMessage = "",
  successTxHash = "",
  onCloseSuccessAlert,
  onCloseFailedAlert,
}: SwapInterfaceProps) {
  const { address } = useAccount();
  const [fromToken, setFromToken] = useState<Token | undefined>();
  const [toToken, setToToken] = useState<Token | undefined>();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [showWarningDetails, setShowWarningDetails] = useState(false);
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);

  // Get user position for the selected pool
  const { userPosition } = useReadUserPosition(
    selectedPool?.lendingPool as `0x${string}` || "0x0000000000000000000000000000000000000000"
  );

  // Get user collateral balance for the from token
  const { userCollateralFormatted: fromTokenBalance } = useReadUserCollateral(
    selectedPool?.lendingPool as `0x${string}` || "0x0000000000000000000000000000000000000000",
    fromToken?.decimals || 18
  );
  const handleSwapTokens = useCallback(() => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;

    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    
    // Recalculate the new amount if we have valid input
    if (toAmount && toToken && tempToken && parseFloat(toAmount) > 0) {
      const baseRate = 1.0;
      const slippageBuffer = 0.97;
      const converted = parseFloat(toAmount) * baseRate * slippageBuffer;
      setTimeout(() => setToAmount(converted.toFixed(6)), 0);
    }
  }, [fromToken, toToken, fromAmount, toAmount]);

  const exchangeRate = 1850.42; // Mock exchange rate
  
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
    [fromToken, toToken]
  );

  const handleToAmountChange = useCallback(
    (value: string) => {
      setToAmount(value);
      if (value && fromToken && toToken) {
        const converted = parseFloat(value) / exchangeRate;
        setFromAmount(converted.toFixed(6));
      } else {
        setFromAmount("");
      }
    },
    [fromToken, toToken]
  );

  const handleMaxAmount = useCallback(() => {
    if (fromTokenBalance && parseFloat(fromTokenBalance) > 0) {
      handleFromAmountChange(fromTokenBalance);
    }
  }, [fromTokenBalance, handleFromAmountChange]);

  const handlePoolSelect = useCallback((pool: LendingPoolWithTokens) => {
    setSelectedPool(pool);

    // Auto-set tokens based on selected pool
    if (pool.borrowTokenInfo && pool.collateralTokenInfo) {
      setFromToken(pool.collateralTokenInfo);
      setToToken(pool.borrowTokenInfo);
      // Reset amounts when changing pools
      setFromAmount("");
      setToAmount("");
    }
  }, []);

  const handleSwap = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || !selectedPool || !userPosition) return;

    try {
      await onSwap(fromToken, toToken, fromAmount, selectedPool.lendingPool, userPosition as string);
    } catch (error) {
      console.error("Swap failed:", error);
    }
  }, [fromToken, toToken, fromAmount, selectedPool, userPosition, onSwap]);

  const toggleWarningDetails = useCallback(() => {
    setShowWarningDetails((prev) => !prev);
  }, []);

  const canSwap =
    fromToken && 
    toToken && 
    fromAmount && 
    parseFloat(fromAmount) > 0 && 
    selectedPool && 
    userPosition && 
    address &&
    fromTokenBalance &&
    parseFloat(fromTokenBalance) > 0 &&
    parseFloat(fromAmount) <= parseFloat(fromTokenBalance);
  const needsWalletConnection = !address;

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm border border-sunset-orange shadow-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Swap Collateral</h2>
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
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Balance: {fromTokenBalance || "0.00000"}
                  </span>
                  {fromTokenBalance && parseFloat(fromTokenBalance) > 0 && (
                    <button
                      type="button"
                      onClick={handleMaxAmount}
                      className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-600 px-2 py-1 rounded-md transition-colors"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>

              {/* Warning for insufficient balance */}
              {fromToken && selectedPool && fromAmount && fromTokenBalance && 
                parseFloat(fromTokenBalance) > 0 && 
                parseFloat(fromAmount) > parseFloat(fromTokenBalance) && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-red-600 mr-2">❌</div>
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Insufficient balance</p>
                      <p>You&apos;re trying to swap {fromAmount} {fromToken.symbol} but only have {fromTokenBalance} {fromToken.symbol} available.</p>
                    </div>
                  </div>
                </div>
              )}

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
                        {selectedPool ? (
                          <span>From {selectedPool.collateralTokenInfo?.symbol} collateral</span>
                        ) : (
                          <span>Amount to swap</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">Enter amount to swap</div>
                    )}
                  </div>
                  <TokenSelector
                    selectedToken={fromToken}
                    onTokenSelect={setFromToken}
                    otherToken={toToken}
                    label="Select token to swap from"
                    selectedPoolAddress={selectedPool?.lendingPool}
                    showBalance={true}
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
                      onChange={(e) => handleToAmountChange(e.target.value)}
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
                    showBalance={false}
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
            ) : !selectedPool ? (
              <Button
                disabled
                className="w-full h-14 text-lg font-semibold bg-orange-100 text-orange-600 rounded-xl border border-orange-200"
              >
                Select pool
              </Button>
            ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
              <Button
                disabled
                className="w-full h-14 text-lg font-semibold bg-orange-100 text-orange-600 rounded-xl border border-orange-200"
              >
                {!fromTokenBalance || parseFloat(fromTokenBalance) === 0 ? "No collateral balance" : "Enter amount"}
              </Button>
            ) : fromAmount && fromTokenBalance && parseFloat(fromAmount) > parseFloat(fromTokenBalance) ? (
              <Button
                disabled
                className="w-full h-14 text-lg font-semibold bg-red-100 text-red-600 rounded-xl border border-red-200"
              >
                Insufficient balance
              </Button>
            ) : needsApproval && !isApproved ? (
              <Button
                onClick={handleSwap}
                disabled={isApproving}
                className="w-full h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 rounded-xl shadow-lg"
              >
                {isApproving
                  ? "Approving..."
                  : `Approve ${fromToken.symbol}`}
              </Button>
            ) : (
              <Button
                onClick={handleSwap}
                disabled={!canSwap || isSwapping}
                className="w-full h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 rounded-xl shadow-lg"
              >
                {isSwapping
                  ? "Swapping..."
                  : `Swap ${fromToken.symbol} for ${toToken.symbol}`}
              </Button>
            )}
          </div>

          {/* Warning Message */}
          {fromToken && toToken && fromAmount && selectedPool && (
            <div className="mt-4 bg-orange-50 rounded-lg border border-orange-200">
              <button
                onClick={toggleWarningDetails}
                className="w-full p-3 flex items-center text-orange-700 text-sm hover:bg-orange-100/50 transition-colors rounded-lg"
              >
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Collateral swap details</span>
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
                        <span>Exchange rate</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <span className="text-gray-900 font-medium">
                        {fromToken && toToken && fromAmount && toAmount ? (
                          `1 ${fromToken.symbol} = ${((parseFloat(toAmount) || 0) / (parseFloat(fromAmount) || 1)).toFixed(4)} ${toToken.symbol}`
                        ) : (
                          "1:1 (estimated)"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Pool</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <span className="text-gray-900 font-medium">
                        {selectedPool.collateralTokenInfo?.symbol} / {selectedPool.borrowTokenInfo?.symbol}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Position Address</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <span className="text-gray-900 font-medium">
                        {userPosition ? `${(userPosition as string).slice(0, 6)}...${(userPosition as string).slice(-4)}` : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Slippage tolerance</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <span className="text-gray-900 font-medium">3%</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-600">
                        <span>Swap type</span>
                        <Info className="h-3 w-3 ml-1 text-gray-500" />
                      </div>
                      <span className="text-gray-900 font-medium">Position-based</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Alert */}
      {showSuccessAlert && onCloseSuccessAlert && (
        <SuccessAlert
          isOpen={showSuccessAlert}
          onClose={onCloseSuccessAlert}
          title="Swap Successful!"
          description={`Your collateral swap was completed successfully.`}
          txHash={successTxHash}
        />
      )}

      {/* Failed Alert */}
      {showFailedAlert && onCloseFailedAlert && (
        <FailedAlert
          isOpen={showFailedAlert}
          onClose={onCloseFailedAlert}
          title="Swap Failed"
          description={errorMessage}
        />
      )}
    </div>
  );
});
