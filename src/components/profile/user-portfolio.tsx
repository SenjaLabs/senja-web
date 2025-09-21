"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/spinner";
import { PoolSelector } from "@/components/select/pools";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useAccount } from "wagmi";
import {
  fetchLendingPools,
  pairLendingPoolsWithTokens,
  LendingPoolWithTokens,
} from "@/lib/graphql/lendingpool-list.fetch";
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral";
import { useReadHealthFactor } from "@/hooks/read/useReadHealthFactor";
import { useReadUserBorrowShares } from "@/hooks/read/useReadUserBorrowShares";
import { useReadUserPosition } from "@/hooks/read/usereadUserPosition";
import { useReadExchangeRate } from "@/hooks/read/useReadExchangeRate";
import { useOptimizedExchangeRate } from "@/hooks/read/useOptimizedExchangeRate";
import { useReadTotalCollateralInWkaia } from "@/hooks/read/useReadTotalCollateralInWkaia";
import { formatLargeNumber } from "@/utils/format";
import { tokens } from "@/lib/addresses/tokenAddress";
import { useCurrentChainId } from "@/lib/chain";
import { TokenBalanceTable as SwapTokenBalanceTable } from "../swap/token-balance-table";

interface UserPortfolioProps {
  className?: string;
}

// Component to calculate collateral equivalent for portfolio
const PortfolioCollateralEquivalent = React.memo(
  function PortfolioCollateralEquivalent({
    usdtValue,
    selectedPool,
    isLoading,
    currentChainId,
  }: {
    usdtValue: number;
    selectedPool: LendingPoolWithTokens | null;
    isLoading: boolean;
    currentChainId: number;
  }) {
    // Find USDT token for conversion
    const usdtToken = useMemo(
      () => tokens.find((t) => t.symbol === "USDT"),
      []
    );
    const collateralToken = selectedPool?.collateralTokenInfo;

    // Only calculate exchange rate if we have USDT value
    const shouldFetchExchangeRate = Boolean(
      usdtValue > 0 &&
        selectedPool?.lendingPool &&
        usdtToken?.addresses[currentChainId] &&
        collateralToken?.addresses[currentChainId]
    );

    // Get exchange rate for USDT to collateral token conversion
    const { parsedExchangeRate: usdtToCollateralRate, exchangeRateLoading } =
      useOptimizedExchangeRate(
        (selectedPool?.lendingPool as `0x${string}`) ||
          "0x0000000000000000000000000000000000000000",
        (usdtToken?.addresses[currentChainId] as `0x${string}`) ||
          "0x0000000000000000000000000000000000000000",
        (collateralToken?.addresses[currentChainId] as `0x${string}`) ||
          "0x0000000000000000000000000000000000000000",
        usdtToken?.decimals || 6,
        collateralToken?.decimals || 18,
        shouldFetchExchangeRate
      );

    // Calculate collateral equivalent
    const collateralEquivalent = useMemo(() => {
      if (usdtValue > 0 && usdtToCollateralRate > 0) {
        const result = usdtValue * usdtToCollateralRate;
        return result;
      }
      return 0;
    }, [usdtValue, usdtToCollateralRate]);

    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      );
    }

    if (exchangeRateLoading) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Converting...</span>
        </div>
      );
    }

    if (collateralEquivalent > 0) {
      return `${formatLargeNumber(collateralEquivalent.toFixed(4))} ${
        collateralToken?.symbol || "TOKEN"
      }`;
    }

    return `0 ${collateralToken?.symbol || "TOKEN"}`;
  }
);

export const UserPortfolio = memo(function UserPortfolio({
  className = "",
}: UserPortfolioProps) {
  const { isConnected } = useAccount();
  const [pools, setPools] = useState<LendingPoolWithTokens[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);

  // State for total balance calculation (similar to swap component)
  const [totalUsdtFromTokens, setTotalUsdtFromTokens] = useState(0);

  const currentChainId = useCurrentChainId();

  // Get total collateral in WKAIA across all pools
  useReadTotalCollateralInWkaia(pools);

  // Load lending pools
  useEffect(() => {
    const loadPools = async () => {
      try {
        setLoading(true);
        setError(null);
        const lendingPools = await fetchLendingPools();
        const poolsWithTokens = pairLendingPoolsWithTokens(lendingPools);
        setPools(poolsWithTokens);
        // Set first pool as default selected
        if (poolsWithTokens.length > 0 && !selectedPool) {
          setSelectedPool(poolsWithTokens[0]);
        }
      } catch (err) {
        console.error("Error loading pools:", err);
        setError("Failed to load lending pools");
      } finally {
        setLoading(false);
      }
    };

    if (isConnected) {
      loadPools();
    }
  }, [isConnected, selectedPool]);

  // Check if user has position first
  const { userPosition } = useReadUserPosition(
    (selectedPool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000"
  );

  // Get user collateral data for selected pool only (simplified approach)
  const {
    userCollateral,
    userCollateralFormatted,
    userCollateralLoading,
    userCollateralError,
  } = useReadUserCollateral(
    selectedPool?.lendingPool || "0x0000000000000000000000000000000000000000",
    selectedPool?.collateralTokenInfo?.decimals || 18
  );

  // Get health factor for selected pool
  const { healthFactor, isLoading: healthFactorLoading } = useReadHealthFactor(
    selectedPool?.lendingPool || "0x0"
  );

  // Get user borrow shares for selected pool
  const { userBorrowSharesFormatted, userBorrowSharesLoading } =
    useReadUserBorrowShares(
      selectedPool?.lendingPool || "0x0000000000000000000000000000000000000000",
      selectedPool?.borrowTokenInfo?.decimals || 18
    );

  // Get exchange rate for converting collateral to borrow token (for selected pool)
  const { parsedExchangeRate } = useReadExchangeRate(
    selectedPool?.lendingPool || "0x0",
    selectedPool?.collateralToken || "0x0",
    selectedPool?.borrowToken || "0x0",
    1, // 1 unit for rate calculation
    selectedPool?.collateralTokenInfo?.decimals || 18,
    selectedPool?.borrowTokenInfo?.decimals || 18
  );

  // Create simplified collateral data with proper USD conversion
  const allCollateralData = useMemo(() => {
    if (!selectedPool || !userCollateral || userCollateral <= BigInt(0)) {
      return [];
    }

    const collateralTokenSymbol =
      selectedPool.collateralTokenInfo?.symbol || "Unknown";
    const borrowTokenSymbol = selectedPool.borrowTokenInfo?.symbol || "Unknown";

    // Calculate USD value using exchange rate
    let usdValue = 0;

    if (parsedExchangeRate > 0) {
      // Convert collateral to borrow token using exchange rate
      const collateralInBorrowToken =
        parseFloat(userCollateralFormatted) * parsedExchangeRate;

      // For now, assume 1:1 conversion to USD for borrow token
      // In a real implementation, you'd need another exchange rate to convert borrow token to USDT
      if (borrowTokenSymbol === "USDT") {
        usdValue = collateralInBorrowToken;
      } else {
        // Placeholder: assume 1 USD per borrow token unit
        // You would need to implement proper price oracle here
        usdValue = collateralInBorrowToken * 1;
      }
    } else {
      // Fallback: if no exchange rate available, use placeholder
      usdValue = parseFloat(userCollateralFormatted) * 1;
    }

    return [
      {
        pool: selectedPool,
        collateralBalance: userCollateral,
        collateralBalanceFormatted: userCollateralFormatted,
        collateralTokenSymbol,
        usdValue,
      },
    ];
  }, [
    selectedPool,
    userCollateral,
    userCollateralFormatted,
    parsedExchangeRate,
  ]);

  const collateralLoading = userCollateralLoading;
  const collateralError = userCollateralError;

  // Use health factor from selected pool
  const overallHealthFactor = useMemo(() => {
    return healthFactor;
  }, [healthFactor]);

  const healthFactorStatus = useMemo(() => {
    if (!overallHealthFactor)
      return { status: "unknown", color: "gray", icon: AlertTriangle };

    const hf = Number(overallHealthFactor) / 1e8; // Using 8 decimals as requested

    // If health factor > 10, treat as infinity
    if (hf > 10)
      return { status: "infinity", color: "purple", icon: CheckCircle };
    if (hf >= 1.5)
      return { status: "healthy", color: "green", icon: CheckCircle };
    if (hf >= 1.0)
      return { status: "warning", color: "yellow", icon: AlertTriangle };
    return { status: "danger", color: "red", icon: AlertTriangle };
  }, [overallHealthFactor]);

  // Format health factor display
  const healthFactorDisplay = useMemo(() => {
    if (!overallHealthFactor) return "N/A";
    const hf = Number(overallHealthFactor) / 1e8; // Using 8 decimals as requested

    // If health factor > 10, display as infinity
    if (hf > 10) return "∞";
    return hf.toFixed(2);
  }, [overallHealthFactor]);

  // Handler to receive total USDT value from SwapTokenBalanceTable
  const handleTotalUsdtUpdate = React.useCallback((totalUsdt: number) => {
    setTotalUsdtFromTokens(totalUsdt);
  }, []);

  if (!isConnected) {
    return (
      <div className={`w-full max-w-xl mx-auto pb-12 ${className}`}>
        <Card className="shadow-2xl border border-orange-200 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 backdrop-blur-sm relative overflow-hidden">
          {/* Senja decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-300/20 to-red-300/20 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="px-3 sm:px-6 relative z-10">
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                User Portfolio
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 text-center py-8 relative z-10">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              Connect Wallet to View Portfolio
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Connect your wallet to see your lending pool positions and health
              factor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || collateralLoading) {
    return (
      <div className={`w-full max-w-xl mx-auto pb-12 ${className}`}>
        <Card className="shadow-2xl border border-orange-200 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 backdrop-blur-sm relative overflow-hidden">
          {/* Senja decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-300/20 to-red-300/20 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="px-3 sm:px-6 relative z-10">
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                User Portfolio
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 text-center py-8 relative z-10">
            <InlineSpinner size="lg" className="mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">
              Loading portfolio data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has position for showing content
  const hasValidPosition =
    userPosition &&
    userPosition !== "0x0000000000000000000000000000000000000000";

  if (error || collateralError) {
    return (
      <div className={`w-full max-w-xl mx-auto pb-12 ${className}`}>
        <Card className="shadow-2xl border border-orange-200 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 backdrop-blur-sm relative overflow-hidden">
          {/* Senja decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-300/20 to-red-300/20 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="px-3 sm:px-6 relative z-10">
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                User Portfolio
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 text-center py-8 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              Error Loading Portfolio
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-xl mx-auto pb-12 ${className}`}>
      <Card className="shadow-2xl border border-orange-200 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 backdrop-blur-sm relative overflow-hidden">
        {/* Senja decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-300/20 to-red-300/20 rounded-full translate-y-8 -translate-x-8"></div>
        <CardHeader className="px-3 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                User Portfolio
              </span>
            </CardTitle>

            {/* Pool Selector */}
            {pools.length > 0 && (
              <div className="w-full sm:w-auto">
                <PoolSelector
                  selectedPool={selectedPool}
                  onPoolSelect={setSelectedPool}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 space-y-6 relative z-10">
          {!hasValidPosition ? (
            /* No Position State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Position Found
              </h3>
              <p className="text-gray-600 mb-4">
                You don&apos;t have a position in the selected pool yet.
              </p>
              <p className="text-sm text-gray-500">
                Try selecting a different pool or use the Supply/Borrow tabs to
                create a position.
              </p>
            </div>
          ) : (
            <>
              {/* Health Factor & User Borrow Section */}
              <div className="bg-gradient-to-r from-orange-50 via-pink-50 to-red-50 rounded-xl p-4 sm:p-6 border border-orange-200 shadow-lg">
                <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-8">
                  {/* Health Factor */}
                  <div className="text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
                      <span className="font-semibold text-sm sm:text-base text-gray-800 flex items-center justify-center sm:justify-start gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
                        Health Factor
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          healthFactorStatus.status === "infinity"
                            ? "border-purple-300 text-purple-800 bg-gradient-to-r from-purple-100 to-purple-200 shadow-sm self-center sm:self-auto"
                            : healthFactorStatus.status === "healthy"
                            ? "border-green-300 text-green-800 bg-gradient-to-r from-green-100 to-green-200 shadow-sm self-center sm:self-auto"
                            : healthFactorStatus.status === "warning"
                            ? "border-yellow-300 text-yellow-800 bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-sm self-center sm:self-auto"
                            : healthFactorStatus.status === "danger"
                            ? "border-red-300 text-red-800 bg-gradient-to-r from-red-100 to-red-200 shadow-sm self-center sm:self-auto"
                            : "border-gray-300 text-gray-800 bg-gradient-to-r from-gray-100 to-gray-200 shadow-sm self-center sm:self-auto"
                        }
                      >
                        <healthFactorStatus.icon className="w-3 h-3 mr-1" />
                        {healthFactorStatus.status === "infinity"
                          ? "INFINITY"
                          : healthFactorStatus.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-md sm:text-xl font-semibold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                        {healthFactorLoading ? (
                          <InlineSpinner size="sm" />
                        ) : (
                          healthFactorDisplay
                        )}
                      </p>
                    </div>
                  </div>

                  {/* User Borrow */}
                  <div className="text-center sm:text-right">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end mb-4 gap-2 sm:gap-0">
                      <span className="font-semibold text-sm sm:text-base text-gray-800 flex items-center justify-center sm:justify-end gap-2">
                        Total Borrowed
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                      </span>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-md sm:text-xl font-semibold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                        {userBorrowSharesLoading ? (
                          <InlineSpinner size="sm" />
                        ) : (
                          formatLargeNumber(userBorrowSharesFormatted || "0")
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Balance Section */}
              {totalUsdtFromTokens > 0 && (
                <div className="bg-gradient-to-r from-orange-50 via-pink-50 to-red-50 rounded-xl p-4 sm:p-6 border border-orange-200 shadow-lg">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-md sm:text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
                        Total Collateral
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                          USD Value
                        </p>
                        <p className="text-md sm:text-2xl font-semibold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                          {formatLargeNumber(totalUsdtFromTokens.toFixed(2))}{" "}
                          USDT
                        </p>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                          {selectedPool?.collateralTokenInfo?.symbol || "Token"}{" "}
                          Collateral
                        </p>
                        <p className="text-md sm:text-xl font-semibold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                          <PortfolioCollateralEquivalent
                            usdtValue={totalUsdtFromTokens}
                            selectedPool={selectedPool}
                            isLoading={false}
                            currentChainId={currentChainId}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Positions Message */}
              {allCollateralData.length === 0 && !collateralLoading && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Active Positions
                  </h3>
                  <p className="text-gray-600">
                    You don&apos;t have any collateral positions in lending
                    pools yet.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Hidden SwapTokenBalanceTable to get total USDT value - only if has position */}
      {hasValidPosition && (
        <div style={{ display: "none" }}>
          <SwapTokenBalanceTable
            selectedPool={selectedPool}
            onTotalUsdtUpdate={handleTotalUsdtUpdate}
          />
        </div>
      )}
    </div>
  );
});

UserPortfolio.displayName = "UserPortfolio";
