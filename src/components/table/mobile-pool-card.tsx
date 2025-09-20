"use client";

import React, { useMemo, memo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReadTotalSupplyAssets } from "@/hooks/read/useReadTotalSupplyAssets";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { formatUnits } from "viem";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { ArrowRight } from "lucide-react";
import { formatLargeNumber } from "@/utils/format";

/**
 * Props for the MobilePoolCard component
 */
interface MobilePoolCardProps {
  /** Pool data */
  pool: LendingPoolWithTokens;
  /** Callback when pool is clicked */
  onClick?: (pool: LendingPoolWithTokens) => void;
  /** Whether the card is clickable */
  clickable?: boolean;
}

/**
 * Mobile-optimized pool card component
 *
 * @param props - Component props
 * @returns JSX element
 */
export const MobilePoolCard = memo(function MobilePoolCard({
  pool,
  onClick,
  clickable = true,
}: MobilePoolCardProps) {
  const { totalSupplyAssets, totalSupplyAssetsLoading } =
    useReadTotalSupplyAssets(
      pool.lendingPool as `0x${string}`,
      pool.borrowToken as `0x${string}`
    );

  const { supplyAPY, loading: apyLoading } = useReadPoolApy(
    pool.lendingPool as `0x${string}`
  );

  const formattedLTV = useMemo(() => {
    if (!pool.ltv) return "0%";
    const ltvNumber = Number(pool.ltv) / 1e18;
    return `${(ltvNumber * 100).toFixed(1)}%`;
  }, [pool.ltv]);

  const formattedLiquidity = useMemo(() => {
    if (totalSupplyAssetsLoading || !pool.borrowTokenInfo) {
      return { amount: "Loading...", symbol: "" };
    }

    // If totalSupplyAssets is undefined, show 0
    if (totalSupplyAssets === undefined) {
      return { amount: "0", symbol: pool.borrowTokenInfo.symbol };
    }

    const liquidity = formatUnits(
      totalSupplyAssets,
      pool.borrowTokenInfo.decimals
    );
    
    // Use formatLargeNumber for better display
    const formattedAmount = formatLargeNumber(liquidity);

    return { 
      amount: formattedAmount, 
      symbol: pool.borrowTokenInfo.symbol 
    };
  }, [totalSupplyAssets, totalSupplyAssetsLoading, pool.borrowTokenInfo]);

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(pool);
    }
  };

  return (
    <Card
      className={`w-full max-w-xl mx-auto overflow-hidden border-0 bg-gradient-to-br from-orange-50/80 via-orange-100/60 to-pink-50/70 backdrop-blur-sm ring-1 ring-white/30 hover:shadow-2xl hover:ring-orange-200/50 transition-all duration-500 group ${
        clickable ? "hover:shadow-lg hover:bg-gradient-to-br hover:from-orange-100/80 hover:via-pink-50/70 hover:to-orange-50/80 cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Header with token logos and names */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Token logos */}
            <div className="flex items-center">
              <div className="relative group-hover:animate-pulse">
                <Image
                  src={pool.collateralTokenInfo?.logo || "/token/kaia-logo.svg"}
                  alt={pool.collateralTokenInfo?.name || "Collateral Token"}
                  width={28}
                  height={28}
                  className="rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
              <div className="relative -ml-2 group-hover:animate-pulse" style={{animationDelay: '0.1s'}}>
                <Image
                  src={pool.borrowTokenInfo?.logo || "/token/kaia-logo.svg"}
                  alt={pool.borrowTokenInfo?.name || "Borrow Token"}
                  width={28}
                  height={28}
                  className="rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
            </div>

            {/* Token names */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {pool.collateralTokenInfo?.symbol || "UNK"} /{" "}
                {pool.borrowTokenInfo?.symbol || "UNK"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {pool.collateralTokenInfo?.name || "Unknown"} →{" "}
                {pool.borrowTokenInfo?.name || "Unknown"}
              </div>
            </div>
          </div>

          {/* Arrow icon for clickable cards */}
          {clickable && <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />}
        </div>

        {/* Stats row - APY, LTV and Liquidity in three columns */}
        <div className="bg-gradient-to-r from-orange-100/60 via-pink-50/70 to-orange-50/60 rounded-xl p-2.5 sm:p-3 border border-orange-200/40 shadow-inner hover:shadow-md transition-all duration-300">
          <div className="grid grid-cols-3 gap-3">
            {/* APY */}
            <div className="text-center">
              <div className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">
                APY
              </div>
              <div className="text-sm sm:text-base font-semibold text-orange-700">
                {apyLoading ? "..." : `${supplyAPY}%`}
              </div>
            </div>

            {/* LTV */}
            <div className="text-center">
              <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                LTV
              </div>
              <Badge
                variant="secondary"
                className="text-gray-800 text-xs sm:text-sm font-semibold px-2 py-1"
              >
                {formattedLTV}
              </Badge>
            </div>

            {/* Liquidity */}
            <div className="text-center">
              <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                Liquidity
              </div>
              <div className="text-xs sm:text-sm font-semibold text-green-700 truncate">
                {formattedLiquidity.amount}
              </div>
              <div className="text-xs text-green-600">
                {formattedLiquidity.symbol}
              </div>
              {totalSupplyAssetsLoading && (
                <div className="text-xs text-green-600 mt-0.5">Updating...</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MobilePoolCard.displayName = "MobilePoolCard";
