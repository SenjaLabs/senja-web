"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoolInfoCard } from "./shared/pool-info-card";
import { AmountInput } from "./shared/amount-input";
import { useRefetch } from "@/hooks/useRefetch";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { useReadUserSupply } from "@/hooks/read/useReadUserSupply";
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral";
import { useCurrentChainId } from "@/lib/chain/use-chain";
import { useWithdrawLiquidity } from "@/hooks/write/useWithdrawLiquidity";
import { useWithdrawCollateral } from "@/hooks/write/useWithdrawCollateral";
import { SuccessAlert, FailedAlert } from "@/components/alert";

interface WithdrawTabProps {
  pool?: {
    lendingPool: string;
    collateralTokenInfo: {
      symbol: string;
      logo: string;
      addresses: Record<string, string>;
      decimals: number;
    };
    borrowTokenInfo: {
      symbol: string;
      logo: string;
      addresses: Record<string, string>;
      decimals: number;
    };
    ltv: string;
  };
}

const WithdrawTab = ({ pool }: WithdrawTabProps) => {
  const [withdrawType, setWithdrawType] = useState("liquidity");
  const [amount, setAmount] = useState("");

  const currentChainId = useCurrentChainId();

  // Refetch functionality
  const { addRefetchFunction, removeRefetchFunction } = useRefetch({
    refetchInterval: 0, // Disable auto-refetch, we'll trigger manually
    enabled: false,
  });

  // Get APY for the pool
  const {
    supplyAPY,
    loading: apyLoading,
    refetch: refetchApy,
  } = useReadPoolApy(pool?.lendingPool);

  // Withdraw Liquidity Hook
  const {
    handleWithdrawLiquidity,
    isWithdrawing: isWithdrawingLiquidity,
    isConfirming: isConfirmingLiquidity,
    isSuccess: isSuccessLiquidity,
    isError: isErrorLiquidity,
    showSuccessAlert: showSuccessAlertLiquidity,
    successTxHash: successTxHashLiquidity,
    handleCloseSuccessAlert: handleCloseSuccessAlertLiquidity,
    error: errorLiquidity,
  } = useWithdrawLiquidity(
    currentChainId,
    pool?.borrowTokenInfo?.decimals || 18,
    () => {
      setAmount("");
    }
  );

  // Withdraw Collateral Hook
  const {
    handleWithdrawCollateral,
    isWithdrawing: isWithdrawingCollateral,
    isConfirming: isConfirmingCollateral,
    isSuccess: isSuccessCollateral,
    isError: isErrorCollateral,
    showSuccessAlert: showSuccessAlertCollateral,
    successTxHash: successTxHashCollateral,
    handleCloseSuccessAlert: handleCloseSuccessAlertCollateral,
  } = useWithdrawCollateral(
    currentChainId,
    pool?.collateralTokenInfo?.decimals || 18,
    () => {
      setAmount("");
    }
  );

  // Get user supply shares for liquidity withdrawal
  const {
    userSupplySharesFormatted: liquidityBalanceFormatted,
    userSupplyShares: userSupplySharesRaw,
    userSupplySharesLoading: liquidityBalanceLoading,
    userSupplySharesError: liquidityBalanceError,
    refetchUserSupplyShares: refetchLiquidityBalance,
  } = useReadUserSupply(
    (pool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    pool?.borrowTokenInfo?.decimals || 18
  );

  // Get user collateral balance for collateral withdrawal
  const {
    userCollateralFormatted: collateralBalanceFormatted,
    userCollateral: userCollateralRaw,
    userCollateralLoading: collateralBalanceLoading,
    userCollateralError: collateralBalanceError,
    refetchUserCollateral: refetchCollateralBalance,
  } = useReadUserCollateral(
    (pool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    pool?.collateralTokenInfo?.decimals || 18
  );

  // Parse the raw values for max button functionality
  const liquidityBalanceParsed = userSupplySharesRaw
    ? Number(userSupplySharesRaw) /
      Math.pow(10, pool?.borrowTokenInfo?.decimals || 6)
    : 0;
  const collateralBalanceParsed = userCollateralRaw
    ? Number(userCollateralRaw) /
      Math.pow(10, pool?.collateralTokenInfo?.decimals || 18)
    : 0;

  // Add refetch functions
  useEffect(() => {
    addRefetchFunction(refetchApy);
    addRefetchFunction(refetchLiquidityBalance);
    addRefetchFunction(refetchCollateralBalance);

    return () => {
      removeRefetchFunction(refetchApy);
      removeRefetchFunction(refetchLiquidityBalance);
      removeRefetchFunction(refetchCollateralBalance);
    };
  }, [
    addRefetchFunction,
    removeRefetchFunction,
    refetchApy,
    refetchLiquidityBalance,
    refetchCollateralBalance,
  ]);

  const handleSetMaxLiquidity = useCallback(() => {
    if (liquidityBalanceParsed > 0) {
      setAmount(liquidityBalanceFormatted);
    }
  }, [liquidityBalanceFormatted, liquidityBalanceParsed]);

  const handleSetMaxCollateral = useCallback(() => {
    if (collateralBalanceParsed > 0) {
      setAmount(collateralBalanceFormatted);
    }
  }, [collateralBalanceFormatted, collateralBalanceParsed]);

  const handleWithdraw = useCallback(async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (withdrawType === "liquidity") {
      await handleWithdrawLiquidity(pool.lendingPool as `0x${string}`, amount);
    } else if (withdrawType === "collateral") {
      await handleWithdrawCollateral(pool.lendingPool as `0x${string}`, amount);
    }
  }, [
    withdrawType,
    amount,
    pool,
    handleWithdrawLiquidity,
    handleWithdrawCollateral,
  ]);

  if (!pool) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-amber-600">No pool selected</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={withdrawType}
        onValueChange={setWithdrawType}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-orange-50 border-2 border-orange-200 rounded-lg p-1 shadow-lg mb-4">
          <TabsTrigger
            value="liquidity"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
          >
            Withdraw Liquidity
          </TabsTrigger>
          <TabsTrigger
            value="collateral"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
          >
            Withdraw Collateral
          </TabsTrigger>
        </TabsList>

        {/* Pool Information Card */}
        <PoolInfoCard
          collateralToken={{
            symbol: pool.collateralTokenInfo.symbol,
            logo: pool.collateralTokenInfo.logo,
          }}
          borrowToken={{
            symbol: pool.borrowTokenInfo.symbol,
            logo: pool.borrowTokenInfo.logo,
          }}
          apy={apyLoading ? "Loading..." : supplyAPY}
          ltv={(Number(pool.ltv) / 1e16).toFixed(1)}
        />

        <TabsContent value="liquidity" className="mt-4">
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
            <div className="space-y-4">
              {/* User Position Info */}
              <div className="p-3 bg-white/50 rounded-lg border border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Your Liquidity:</span>
                  <span className="text-md font-bold text-orange-700">
                    {liquidityBalanceLoading ? (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : liquidityBalanceError ? (
                      <span className="text-red-500 text-xs">Error</span>
                    ) : (
                      `${liquidityBalanceFormatted || "0.00"} ${
                        pool.borrowTokenInfo.symbol
                      }`
                    )}
                  </span>
                </div>
              </div>

              <AmountInput
                label="Amount to Withdraw"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={setAmount}
                onMaxClick={handleSetMaxLiquidity}
                tokenSymbol={pool.borrowTokenInfo.symbol}
                maxDisabled={liquidityBalanceParsed <= 0}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="collateral" className="mt-4">
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
            <div className="space-y-4">
              {/* User Position Info */}
              <div className="p-3 bg-white/50 rounded-lg border border-orange-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Collateral Balance:
                  </span>
                  <span className="font-bold text-md text-orange-700">
                    {collateralBalanceLoading ? (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : collateralBalanceError ? (
                      <span className="text-red-500 text-xs">Error</span>
                    ) : (
                      `${collateralBalanceFormatted || "0.00"} ${
                        pool.collateralTokenInfo.symbol
                      }`
                    )}
                  </span>
                </div>
              </div>

              <AmountInput
                label="Amount to Withdraw"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={setAmount}
                onMaxClick={handleSetMaxCollateral}
                tokenSymbol={pool.collateralTokenInfo.symbol}
                maxDisabled={collateralBalanceParsed <= 0}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Status */}
      {((withdrawType === "liquidity" &&
        (isWithdrawingLiquidity ||
          isConfirmingLiquidity ||
          isSuccessLiquidity ||
          isErrorLiquidity)) ||
        (withdrawType === "collateral" &&
          (isWithdrawingCollateral ||
            isConfirmingCollateral ||
            isSuccessCollateral ||
            isErrorCollateral))) && (
        <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
          <div className="space-y-3">
            {/* Withdraw Status */}
            {(isWithdrawingLiquidity || isWithdrawingCollateral) && (
              <div className="flex items-center gap-3 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">
                  {withdrawType === "collateral"
                    ? "Withdrawing collateral..."
                    : "Withdrawing liquidity..."}
                </span>
              </div>
            )}

            {(isConfirmingLiquidity || isConfirmingCollateral) && (
              <div className="flex items-center gap-3 text-orange-600">
                <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">
                  Confirming transaction...
                </span>
              </div>
            )}

            {(isSuccessLiquidity || isSuccessCollateral) && (
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold">
                  {withdrawType === "collateral"
                    ? "Collateral withdrawn successfully!"
                    : "Liquidity withdrawn successfully!"}
                </span>
              </div>
            )}

            {/* Error Status */}
            {(isErrorLiquidity || isErrorCollateral) && (
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-semibold">
                  Transaction failed
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      <Button
        onClick={handleWithdraw}
        disabled={
          !amount ||
          parseFloat(amount) <= 0 ||
          isWithdrawingLiquidity ||
          isConfirmingLiquidity ||
          isWithdrawingCollateral ||
          isConfirmingCollateral
        }
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {isWithdrawingLiquidity || isWithdrawingCollateral
          ? "Withdrawing..."
          : isConfirmingLiquidity || isConfirmingCollateral
          ? "Confirming..."
          : `Withdraw ${
              withdrawType === "liquidity" ? "Liquidity" : "Collateral"
            }`}
      </Button>

      {/* Withdraw Liquidity Success Alert */}
      {showSuccessAlertLiquidity && (
        <SuccessAlert
          isOpen={showSuccessAlertLiquidity}
          onClose={handleCloseSuccessAlertLiquidity}
          title="Transaction Success"
          description="Liquidity withdrawn successfully!"
          buttonText="Close"
          txHash={successTxHashLiquidity}
          chainId={currentChainId}
        />
      )}

      {/* Withdraw Collateral Success Alert */}
      {showSuccessAlertCollateral && (
        <SuccessAlert
          isOpen={showSuccessAlertCollateral}
          onClose={handleCloseSuccessAlertCollateral}
          title="Transaction Success"
          description="Collateral withdrawn successfully!"
          buttonText="Close"
          txHash={successTxHashCollateral}
          chainId={currentChainId}
        />
      )}

      {/* Failed Alert */}
      {(isErrorLiquidity || isErrorCollateral) && (
        <FailedAlert
          isOpen={isErrorLiquidity || isErrorCollateral}
          onClose={() => {
            // Reset error states
            if (isErrorLiquidity) {
              // Error will be cleared automatically by the hook
            }
            if (isErrorCollateral) {
              // Error will be cleared automatically by the hook
            }
          }}
          title="Transaction Failed"
          description={
            errorLiquidity || "Transaction failed. Please try again."
          }
          buttonText="Close"
        />
      )}
    </div>
  );
};

export default WithdrawTab;
