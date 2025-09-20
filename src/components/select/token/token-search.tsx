"use client";

import React, { useState, useCallback, memo } from "react";
import { Search, X } from "lucide-react";
import { tokens } from "@/lib/addresses/tokenAddress";
import { Token } from "@/types";
import Image from "next/image";
import { useReadUserCollateralBalance } from "@/hooks/read/useReadUserCollateralBalance";
import { useCurrentChainId } from "@/lib/chain";
import { BearyNotFound } from "@/components/search/beary-not-found";

// Component to display token balance
const TokenBalance = memo(function TokenBalance({ 
  token, 
  poolAddress,
}: { 
  token: Token; 
  poolAddress?: string;
  isCollateralBalance?: boolean;
}) {
  const currentChainId = useCurrentChainId();
  
  // Always use collateral balance from position for both "from" and "to" tokens
  const { parsedUserCollateralBalance, userCollateralBalanceLoading } = useReadUserCollateralBalance(
    poolAddress as `0x${string}` || "0x0000000000000000000000000000000000000000",
    token.addresses[currentChainId] as `0x${string}` || "0x0000000000000000000000000000000000000000",
    token.decimals
  );

  const balance = parsedUserCollateralBalance;
  const isLoading = userCollateralBalanceLoading;

  if (isLoading) {
    return (
      <div className="text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
        <div className="text-xs text-gray-500">{token.symbol}</div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <div className="text-sm text-gray-900">
        {balance?.toFixed(5) || "0.00000"}
      </div>
      <div className="text-xs text-gray-500">{token.symbol}</div>
    </div>
  );
});

interface TokenSearchProps {
  onTokenSelect: (token: Token) => void;
  otherToken?: Token;
  showPopularTokens?: boolean;
  className?: string;
  selectedPoolAddress?: string;
  showBalance?: boolean;
  isCollateralBalance?: boolean;
}

export const TokenSearch = memo(function TokenSearch({
  onTokenSelect,
  otherToken,
  showPopularTokens = true,
  className = "",
  selectedPoolAddress,
  showBalance = false,
  isCollateralBalance = false,
}: TokenSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const availableTokens = tokens.filter(
    (token) => {
      // Filter out KAIA tokens
      if (token.symbol === "KAIA" || token.symbol === "WKAI") {
        return false;
      }
      
      // Filter out the other token if it exists
      if (otherToken && token.symbol === otherToken.symbol) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return token.symbol.toLowerCase().includes(query) ||
               token.name.toLowerCase().includes(query);
      }
      
      return true;
    }
  );

  const handleTokenSelect = useCallback((token: Token) => {
    onTokenSelect(token);
    setSearchQuery("");
  }, [onTokenSelect]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const popularTokens = ["WETH", "USDC", "USDT", "WBTC"];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-all duration-200 z-10 ${
            searchQuery ? "text-sunset-orange scale-110" : "text-gray-400"
          }`}
        />
        <div
          className={`relative rounded-lg transition-all duration-200 ${
            searchQuery
              ? "bg-gradient-to-r from-orange-100/50 to-pink-100/50 p-0.5 shadow-lg shadow-orange-200/20"
              : "p-0"
          }`}
        >
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-10 py-3 transition-all duration-200 border-0 rounded-lg relative z-10 focus:ring-0 focus:outline-none bg-white text-gray-900 placeholder-gray-400 ${
              !searchQuery
                ? "border-2 border-orange-200 hover:border-orange-300"
                : ""
            }`}
            style={{
              border: searchQuery ? "none" : "2px solid #fed7aa",
              boxShadow: "none",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-sunset-orange transition-colors duration-200 z-20"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Popular Tokens */}
      {showPopularTokens && searchQuery === "" && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-3">
            Popular tokens
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTokens.map((symbol) => {
              const token = tokens.find((t) => t.symbol === symbol);
              // Filter out the other token if it exists
              if (!token || (otherToken && token.symbol === otherToken.symbol)) {
                return null;
              }

              return (
              <button
                type="button"
                key={symbol}
                onClick={() => handleTokenSelect(token)}
                className="h-8 px-3 bg-sunset-purple-light hover:bg-sunset-pink-light border border-sunset-purple/20 hover:border-sunset-pink/30 hover:shadow-md hover:shadow-sunset-pink/20 hover:scale-105 transition-all duration-300 group rounded-lg"
              >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full overflow-hidden">
                      <Image
                        src={token.logo}
                        alt={token.name}
                        width={16}
                        height={16}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                            // eslint-disable-next-line no-undef
                            .nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.classList.remove("hidden");
                            fallback.classList.add("flex");
                          }
                        }}
                      />
                      <div className="w-full h-full bg-gradient-sunset items-center justify-center text-white text-xs font-semibold hidden">
                        {token.symbol.charAt(0)}
                      </div>
                    </div>
                    <span className="text-xs text-sunset-purple group-hover:text-sunset-pink transition-colors duration-300">
                      {symbol}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Token List */}
      <div className="flex-1 overflow-y-auto max-h-96">
        <div className="space-y-1">
          {availableTokens.length === 0 ? (
            <BearyNotFound
              searchQuery={searchQuery}
              title="No Tokens Found"
              description={searchQuery 
                ? `No tokens found matching "${searchQuery}". Try searching with different keywords.`
                : "No tokens are available. Try refreshing or switching networks."
              }
              onRetry={() => setSearchQuery("")}
              onClearSearch={handleClearSearch}
              showRetry={!searchQuery}
              showClearSearch={!!searchQuery}
            />
          ) : (
            availableTokens.map((token) => (
              <button
                type="button"
                key={token.symbol}
                onClick={() => handleTokenSelect(token)}
                className="w-full max-w-xl mx-auto flex items-center justify-between px-4 py-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:shadow-md hover:shadow-orange-200/20 hover:scale-[1.02] rounded-lg transition-all duration-300 group border border-transparent hover:border-orange-200/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={token.logo}
                      alt={token.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget
                          // eslint-disable-next-line no-undef
                          .nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.classList.remove("hidden");
                          fallback.classList.add("flex");
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-twilight items-center justify-center text-white font-semibold hidden group-hover:bg-gradient-sunset transition-all duration-300">
                      {token.symbol.charAt(0)}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 group-hover:text-sunset-purple transition-colors duration-300">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                      {token.name}
                    </div>
                  </div>
                </div>
                {showBalance ? (
                  <TokenBalance 
                    token={token} 
                    poolAddress={isCollateralBalance ? selectedPoolAddress : undefined}
                    isCollateralBalance={isCollateralBalance}
                  />
                ) : (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">-</div>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
});
