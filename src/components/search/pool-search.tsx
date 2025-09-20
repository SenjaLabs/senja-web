"use client";

import React, { useCallback, memo } from "react";
import { Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { BearyNotFound } from "./beary-not-found";
import Image from "next/image";

interface PoolSearchProps {
  selectedPool: LendingPoolWithTokens | null;
  onPoolSelect: (pool: LendingPoolWithTokens) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  loading: boolean;
  filteredPools: LendingPoolWithTokens[];
  showSearchInput?: boolean;
  className?: string;
}

// Memoized helper functions
const formatLTV = (ltv: string): string => {
  return ltv ? ((parseInt(ltv) / 1e18) * 100).toFixed(2) + "%" : "N/A";
};

const getPoolDisplayName = (pool: LendingPoolWithTokens): string => {
  const borrowSymbol = pool.borrowTokenInfo?.symbol || "Unknown";
  const collateralSymbol = pool.collateralTokenInfo?.symbol || "Unknown";
  return `${collateralSymbol} → ${borrowSymbol}`;
};

// Memoized pool item component
const PoolItem = memo(
  ({
    pool,
    isSelected,
    onSelect,
  }: {
    pool: LendingPoolWithTokens;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <Card
      className="w-full max-w-xl mx-auto overflow-hidden border-0 bg-gradient-to-br from-orange-50/80 via-orange-100/60 to-pink-50/70 backdrop-blur-sm ring-1 ring-white/30 hover:shadow-2xl hover:ring-orange-200/50 transition-all duration-500 group cursor-pointer"
      onClick={onSelect}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex space-x-2">
          {pool.collateralTokenInfo && (
            <div className="relative">
              <Image
                src={pool.collateralTokenInfo.logo}
                alt={pool.collateralTokenInfo.name}
                width={32}
                height={32}
                className="rounded-full border-2 border-white shadow-md group-hover:shadow-lg transition-shadow"
              />
            </div>
          )}
          {pool.borrowTokenInfo && (
            <div className="relative">
              <Image
                src={pool.borrowTokenInfo.logo}
                alt={pool.borrowTokenInfo.name}
                width={32}
                height={32}
                className="rounded-full border-2 border-white shadow-md group-hover:shadow-lg transition-shadow"
              />
            </div>
            )}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {getPoolDisplayName(pool)}
              </div>
              <div className="text-xs text-gray-500">
                {pool.collateralTokenInfo?.name || "Unknown"} → {pool.borrowTokenInfo?.name || "Unknown"}
              </div>
            </div>
          </div>
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
);

PoolItem.displayName = "PoolItem";

export const PoolSearch = memo(function PoolSearch({
  selectedPool,
  onPoolSelect,
  searchQuery,
  onSearchChange,
  onClearSearch,
  loading,
  filteredPools,
  showSearchInput = true,
  className = "",
}: PoolSearchProps) {
  const handleSearchChange = useCallback(
    // eslint-disable-next-line no-undef
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const handlePoolSelect = useCallback(
    (pool: LendingPoolWithTokens) => {
      onPoolSelect(pool);
    },
    [onPoolSelect]
  );

  return (
    <div className={className}>
      {/* Search Input */}
      {showSearchInput && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search pools by token name or symbol..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          {searchQuery && (
            <Button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Pools List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>

            </div>
          </div>
        ) : filteredPools.length === 0 ? (
          <BearyNotFound
            searchQuery={searchQuery}
            title={searchQuery ? "No Pools Found" : "No Pools Available"}
            description={searchQuery 
              ? `No lending pools found matching "${searchQuery}". Try searching with different keywords.`
              : "No lending pools are available on this network. Switch to a different network to see available pools."
            }
            onRetry={() => onSearchChange("")}
            onClearSearch={onClearSearch}
            showRetry={!searchQuery}
            showClearSearch={!!searchQuery}
          />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredPools.map((pool) => (
              <PoolItem
                key={pool.id}
                pool={pool}
                isSelected={selectedPool?.id === pool.id}
                onSelect={() => handlePoolSelect(pool)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Export helper functions for reuse
export { formatLTV, getPoolDisplayName };
