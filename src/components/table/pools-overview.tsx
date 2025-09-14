"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PoolSearchControls } from "./pool-search-controls";
import { ResponsivePoolsTable } from "./responsive-pools-table";
import { PoolActionsDialog } from "@/components/dialog/pool-actions";
import {
  fetchLendingPools,
  pairLendingPoolsWithTokens,
  LendingPoolWithTokens,
} from "@/lib/graphql/lendingpool-list.fetch";
import { useCurrentChainId } from "@/lib/chain/use-chain";

/**
 * PoolsOverview component for displaying and managing lending pools
 *
 * @returns JSX element
 */
export const PoolsOverview = memo(function PoolsOverview() {
  const [pools, setPools] = useState<LendingPoolWithTokens[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);
  const [isPoolDialogOpen, setIsPoolDialogOpen] = useState(false);
  const currentChainId = useCurrentChainId();

  /**
   * Handle pool click for mobile cards
   */
  const handlePoolClick = useCallback((pool: LendingPoolWithTokens) => {
    setSelectedPool(pool);
    setIsPoolDialogOpen(true);
  }, []);

  /**
   * Handle pool dialog close
   */
  const handlePoolDialogClose = useCallback(() => {
    setIsPoolDialogOpen(false);
    setSelectedPool(null);
  }, []);

  /**
   * Handle action selection
   */
  const handleActionSelect = useCallback((_action: string) => {
    // Keep the pool actions dialog open and let it handle the action
    // The dialog will show the appropriate form based on the selected action
  }, []);

  // Fetch pools data
  useEffect(() => {
    const loadPools = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawPools = await fetchLendingPools();
        const poolsWithTokens = pairLendingPoolsWithTokens(
          rawPools,
          currentChainId
        );
        // Filter out pools with missing token info
        const validPools = poolsWithTokens.filter(
          (pool) => pool.borrowTokenInfo && pool.collateralTokenInfo
        );
        
        setPools(validPools);
      } catch {
        setError("Failed to load pools data");
        setPools([]); // Ensure pools is set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadPools();
  }, [currentChainId]);

  // Filtered pools based on search
  const filteredPools = useMemo(() => {
    if (!searchQuery) return pools;

    const query = searchQuery.toLowerCase();
    return pools.filter((pool) => {
      const borrowSymbol = pool.borrowTokenInfo?.symbol?.toLowerCase() || "";
      const collateralSymbol =
        pool.collateralTokenInfo?.symbol?.toLowerCase() || "";
      const borrowName = pool.borrowTokenInfo?.name?.toLowerCase() || "";
      const collateralName =
        pool.collateralTokenInfo?.name?.toLowerCase() || "";

      return (
        borrowSymbol.includes(query) ||
        collateralSymbol.includes(query) ||
        borrowName.includes(query) ||
        collateralName.includes(query)
      );
    });
  }, [pools, searchQuery]);

  // Handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handlePoolCreated = useCallback(() => {
    // Reload pools data when a new pool is created
    const loadPools = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rawPools = await fetchLendingPools();
        const poolsWithTokens = pairLendingPoolsWithTokens(
          rawPools,
          currentChainId
        );
        // Filter out pools with missing token info
        const validPools = poolsWithTokens.filter(
          (pool) => pool.borrowTokenInfo && pool.collateralTokenInfo
        );
        setPools(validPools);
      } catch {
        setError("Failed to reload pools data");
        setPools([]); // Ensure pools is set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadPools();
  }, [currentChainId]);

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card className="p-6 border-0 shadow-2xl bg-white/95 backdrop-blur-sm ring-1 ring-white/20 hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-red-100/30 pointer-events-none rounded-lg"></div>
          <div className="relative z-10 text-center text-red-600">
            <p>{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please check your internet connection and try again.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // No filtered results
  if (filteredPools.length === 0 && searchQuery) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm ring-1 ring-white/20 hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-senja-primary/5 via-transparent to-senja-cream/10 pointer-events-none"></div>
          <div className="relative z-10">
            <PoolSearchControls
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              totalPools={pools.length}
              filteredPools={filteredPools.length}
              onPoolCreated={handlePoolCreated}
            />

            <div className="p-12">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 mx-auto shadow-inner">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded"></div>
                </div>
                <div className="text-lg font-medium mb-2">No pools found</div>
                <div className="text-sm">No pools match &quot;{searchQuery}&quot;</div>
                <div className="mt-4">
                  <Button onClick={handleClearSearch} variant="outline" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                    Clear search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm ring-1 ring-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-senja-primary/5 via-transparent to-senja-cream/10 pointer-events-none"></div>
        <div className="relative z-10">
          <PoolSearchControls
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            totalPools={pools.length}
            filteredPools={filteredPools.length}
            onPoolCreated={handlePoolCreated}
          />

          <ResponsivePoolsTable
            pools={filteredPools}
            loading={loading}
            onPoolClick={handlePoolClick}
          />
        </div>
      </Card>

      {/* Pool Actions Dialog */}
      <PoolActionsDialog
        isOpen={isPoolDialogOpen}
        onClose={handlePoolDialogClose}
        pool={selectedPool}
        onActionSelect={handleActionSelect}
      />

    </div>
  );
});
