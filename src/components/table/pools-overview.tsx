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
// Note: Removed useCurrentChainId import as we now fetch from all chains

/**
 * Props for PoolsOverview component
 */
interface PoolsOverviewProps {
  onPoolClick?: (pool: LendingPoolWithTokens) => void;
}

/**
 * PoolsOverview component for displaying and managing lending pools
 *
 * @param props - Component props
 * @returns JSX element
 */
export const PoolsOverview = memo(function PoolsOverview({ onPoolClick }: PoolsOverviewProps = {}) {
  const [pools, setPools] = useState<LendingPoolWithTokens[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);
  const [isPoolDialogOpen, setIsPoolDialogOpen] = useState(false);
  // Note: We now fetch pools from all chains, not just the current chain

  // Reset internal dialog state when external onPoolClick is provided
  useEffect(() => {
    if (onPoolClick) {
      setIsPoolDialogOpen(false);
      setSelectedPool(null);
    }
  }, [onPoolClick]);

  /**
   * Handle pool click for mobile cards
   */
  const handlePoolClickInternal = useCallback((pool: LendingPoolWithTokens) => {
    if (onPoolClick) {
      // Use external handler if provided (e.g., from home page with wallet guard)
      onPoolClick(pool);
    } else {
      // Fallback to internal dialog - but this should not be used when onPoolClick is provided
      console.warn('PoolsOverview: onPoolClick not provided, using internal dialog. This may cause conflicts.');
      setSelectedPool(pool);
      setIsPoolDialogOpen(true);
    }
  }, [onPoolClick]);

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
  const handleActionSelect = useCallback((action: string) => {
    console.log("Action selected:", action);
    // For actions that need separate dialogs, handle them here
    // For now, all actions are handled within PoolActionsDialog
  }, []);


  // Fetch pools data
  useEffect(() => {
    const loadPools = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawPools = await fetchLendingPools();
        // Fetch pools from all chains, not just current chain
        const poolsWithTokens = pairLendingPoolsWithTokens(rawPools);
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
  }, []); // Remove currentChainId dependency to fetch from all chains

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
        // Fetch pools from all chains, not just current chain
        const poolsWithTokens = pairLendingPoolsWithTokens(rawPools);
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
  }, []); // Remove currentChainId dependency to fetch from all chains

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
        <div className="relative">
          <PoolSearchControls
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            totalPools={pools.length}
            filteredPools={filteredPools.length}
            onPoolCreated={handlePoolCreated}
          />

          <Card className="w-full max-w-sm md:max-w-xl mx-auto overflow-hidden border-0 bg-gradient-to-br from-orange-50/80 via-orange-100/60 to-pink-50/70 backdrop-blur-sm ring-1 ring-white/30 hover:shadow-2xl hover:ring-orange-200/50 transition-all duration-500">
            <div className="p-8 md:p-12">
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
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative">
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
          onPoolClick={handlePoolClickInternal}
        />
      </div>

      {/* Pool Actions Dialog - only show if no external onPoolClick handler is provided */}
      {!onPoolClick && isPoolDialogOpen && (
        <PoolActionsDialog
          isOpen={isPoolDialogOpen}
          onClose={handlePoolDialogClose}
          pool={selectedPool}
          onActionSelect={handleActionSelect}
        />
      )}


    </div>
  );
});
