"use client";

import React, { useMemo, memo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReadTotalSupplyAssets } from "@/hooks/read/useReadTotalSupplyAssets";
import { formatUnits } from "viem";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { ArrowRight } from "lucide-react";

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
      pool.lendingPool,
      pool.borrowTokenInfo?.decimals || 18
    );

  const formattedLTV = useMemo(() => {
    if (!pool.ltv) return "0%";
    const ltvNumber = Number(pool.ltv) / 1e18;
    return `${(ltvNumber * 100).toFixed(1)}%`;
  }, [pool.ltv]);

  const formattedLiquidity = useMemo(() => {
    if (totalSupplyAssetsLoading || !pool.borrowTokenInfo) {
      return "Loading...";
    }

    // If totalSupplyAssets is undefined, show 0
    if (totalSupplyAssets === undefined) {
      return "0.00";
    }

    const liquidity = formatUnits(
      totalSupplyAssets,
      pool.borrowTokenInfo.decimals
    );
    const formatted = Number(liquidity).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${formatted} ${pool.borrowTokenInfo.symbol}`;
  }, [totalSupplyAssets, totalSupplyAssetsLoading, pool.borrowTokenInfo]);

  const handleClick = () => {
    if (clickable && onClick) {
      onClick(pool);
    }
  };

  return (
    <Card
      className={`overflow-hidden border-0 bg-white mobile-animate mobile-card mobile-no-select ${
        clickable ? "hover:shadow-lg hover:bg-orange-50 cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="mobile-spacing-sm">
        {/* Header with token logos and names */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {/* Token logos */}
            <div className="flex items-center">
              <div className="relative">
                <Image
                  src={pool.collateralTokenInfo?.logo || "/token/kaia-logo.svg"}
                  alt={pool.collateralTokenInfo?.name || "Collateral Token"}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-white shadow-sm"
                />
              </div>
              <div className="relative -ml-2">
                <Image
                  src={pool.borrowTokenInfo?.logo || "/token/kaia-logo.svg"}
                  alt={pool.borrowTokenInfo?.name || "Borrow Token"}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-white shadow-sm"
                />
              </div>
            </div>

            {/* Token names */}
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {pool.collateralTokenInfo?.symbol || "UNK"} /{" "}
                {pool.borrowTokenInfo?.symbol || "UNK"}
              </div>
              <div className="text-xs text-gray-500">
                {pool.collateralTokenInfo?.name || "Unknown"} →{" "}
                {pool.borrowTokenInfo?.name || "Unknown"}
              </div>
            </div>
          </div>

          {/* Arrow icon for clickable cards */}
          {clickable && <ArrowRight className="h-4 w-4 text-gray-400" />}
        </div>

        {/* Stats row - LTV and Liquidity side by side */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
          {/* LTV */}
          <div className="flex items-center space-x-2">
            <div>
              <div className="ml-2 text-xs font-medium text-blue-600 uppercase tracking-wide">
                LTV
              </div>
              <Badge
                variant="secondary"
                className="text-gray-800 text-xs font-semibold"
              >
                {formattedLTV}
              </Badge>
            </div>
          </div>

          {/* Liquidity */}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                Liquidity
              </div>
              <div className="text-xs font-semibold text-green-800">
                {formattedLiquidity}
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
