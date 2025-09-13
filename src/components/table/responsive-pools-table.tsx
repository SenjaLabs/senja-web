"use client";

import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { PoolsTableOnly } from './pools-table-only';
import { MobilePoolCard } from './mobile-pool-card';
import { LendingPoolWithTokens } from '@/lib/graphql/lendingpool-list.fetch';

/**
 * Props for the ResponsivePoolsTable component
 */
interface ResponsivePoolsTableProps {
  /** Array of pools to display */
  pools: LendingPoolWithTokens[];
  /** Whether data is loading */
  loading?: boolean;
  /** Callback when a pool is clicked */
  onPoolClick?: (pool: LendingPoolWithTokens) => void;
}

/**
 * ResponsivePoolsTable component that shows desktop table on large screens
 * and mobile cards on small screens
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const ResponsivePoolsTable = memo(function ResponsivePoolsTable({
  pools,
  loading = false,
  onPoolClick,
}: ResponsivePoolsTableProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg bg-white">
        <div className="p-8 md:p-12">
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
        <div className="p-8 md:p-12">
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
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block">
        <PoolsTableOnly pools={pools} loading={loading} onPoolClick={onPoolClick} />
      </div>

      {/* Mobile Card View - Hidden on desktop */}
      <div className="lg:hidden space-y-2">
        {pools.map((pool) => (
          <MobilePoolCard
            key={pool.id}
            pool={pool}
            onClick={onPoolClick}
            clickable={!!onPoolClick}
          />
        ))}
      </div>
    </>
  );
});

ResponsivePoolsTable.displayName = 'ResponsivePoolsTable';
