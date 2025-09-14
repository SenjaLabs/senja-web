"use client";

import React, { useMemo, memo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReadTotalSupplyAssets } from '@/hooks/read/useReadTotalSupplyAssets';
import { formatUnits } from 'viem';
import { LendingPoolWithTokens } from '@/lib/graphql/lendingpool-list.fetch';

interface PoolsTableOnlyProps {
  pools: LendingPoolWithTokens[];
  loading?: boolean;
  onPoolClick?: (pool: LendingPoolWithTokens) => void;
}

// Individual pool row component
const PoolRow = React.memo(({ pool, onPoolClick }: { pool: LendingPoolWithTokens; onPoolClick?: (pool: LendingPoolWithTokens) => void }) => {
  const { totalSupplyAssets, totalSupplyAssetsLoading } = useReadTotalSupplyAssets(
    pool.lendingPool,
    pool.borrowTokenInfo?.decimals || 18
  );

  const formattedLTV = useMemo(() => {
    if (!pool.ltv) return '0%';
    const ltvNumber = Number(pool.ltv) / 1e18;
    return `${(ltvNumber * 100).toFixed(1)}%`;
  }, [pool.ltv]);

  const formattedLiquidity = useMemo(() => {
    if (totalSupplyAssetsLoading || !pool.borrowTokenInfo) {
      return 'Loading...';
    }
    
    // If totalSupplyAssets is undefined, show 0
    if (totalSupplyAssets === undefined) {
      return `0.00 ${pool.borrowTokenInfo.symbol}`;
    }
    
    const liquidity = formatUnits(totalSupplyAssets, pool.borrowTokenInfo.decimals);
    const formatted = Number(liquidity).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return `${formatted} ${pool.borrowTokenInfo.symbol}`;
  }, [totalSupplyAssets, totalSupplyAssetsLoading, pool.borrowTokenInfo]);

  const handleClick = () => {
    if (onPoolClick) {
      onPoolClick(pool);
    }
  };

  return (
    <tr 
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${onPoolClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Token Logos */}
      <td className="py-4 px-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Image
              src={pool.collateralTokenInfo?.logo || '/token/kaia-logo.svg'}
              alt={pool.collateralTokenInfo?.name || 'Collateral Token'}
              width={32}
              height={32}
              className="rounded-full border-2 border-white shadow-sm"
            />
          </div>
          <div className="relative -ml-2">
            <Image
              src={pool.borrowTokenInfo?.logo || '/token/kaia-logo.svg'}
              alt={pool.borrowTokenInfo?.name || 'Borrow Token'}
              width={32}
              height={32}
              className="rounded-full border-2 border-white shadow-sm"
            />
          </div>
        </div>
      </td>
      
      {/* Token Names */}
      <td className="py-4 px-6">
        <div className="text-sm font-medium text-gray-900">
          {pool.collateralTokenInfo?.name || 'Unknown'} / {pool.borrowTokenInfo?.name || 'Unknown'}
        </div>
        <div className="text-xs text-gray-500">
          {pool.collateralTokenInfo?.symbol || 'UNK'} → {pool.borrowTokenInfo?.symbol || 'UNK'}
        </div>
      </td>
      
      {/* LTV */}
      <td className="py-4 px-6 text-center">
        <Badge 
          variant="secondary" 
          className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium"
        >
          {formattedLTV}
        </Badge>
      </td>
      
      {/* Liquidity */}
      <td className="py-4 px-6 text-right">
        <div className="text-sm font-medium text-gray-900">
          {formattedLiquidity}
        </div>
        {totalSupplyAssetsLoading && (
          <div className="text-xs text-gray-500 mt-1">
            Updating...
          </div>
        )}
      </td>
    </tr>
  );
});

PoolRow.displayName = 'PoolRow';

export const PoolsTableOnly = memo(function PoolsTableOnly({
  pools,
  loading = false,
  onPoolClick,
}: PoolsTableOnlyProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg bg-white">
        <div className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Loading Pools</h4>
            <p className="text-gray-600 text-center">Fetching the latest lending pool data...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (pools.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg bg-white">
        <div className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">No Pools Available</h4>
            <p className="text-gray-600 text-center max-w-md">
              There are currently no lending pools available on this network. 
              Try switching to a different network or check back later.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Pool
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Tokens
              </th>
              <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                LTV
              </th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Liquidity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pools.map((pool) => (
              <PoolRow key={pool.id} pool={pool} onPoolClick={onPoolClick} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
});
