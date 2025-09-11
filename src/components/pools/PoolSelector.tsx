"use client";

import React, { useState, memo } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { tokens } from "@/lib/addresses/tokenAddress";
import { Token } from "@/types";
import { useCurrentChainId } from "@/lib/chain";

interface PoolToken {
  symbol: string;
  name: string;
  logo: string;
  address?: string;
}

interface Pool {
  id: string;
  loanToken: PoolToken;
  collateralToken: PoolToken;
  ltv: string;
  liquidity: string;
  apy: string;
}

interface PoolSelectorProps {
  pools?: Pool[];
  onPoolSelect?: (pool: Pool) => void;
  selectedPool?: Pool;
}

// Helper function to convert Token to PoolToken
const tokenToPoolToken = (token: Token, chainId: number): PoolToken => ({
  symbol: token.symbol,
  name: token.name,
  logo: token.logo,
  address: token.addresses[chainId],
});

// Get tokens from the address library
const [weth, wbtc, usdc, usdt, kaia] = tokens;

// Create default pools with dynamic chain ID
const createDefaultPools = (chainId: number): Pool[] => [
  {
    id: "1",
    loanToken: tokenToPoolToken(usdc, chainId),
    collateralToken: tokenToPoolToken(weth, chainId),
    ltv: "80.00%",
    liquidity: "48,810",
    apy: "8.5%",
  },
  {
    id: "2",
    loanToken: tokenToPoolToken(usdt, chainId),
    collateralToken: tokenToPoolToken(wbtc, chainId),
    ltv: "75.00%",
    liquidity: "32,150",
    apy: "7.2%",
  },
  {
    id: "3",
    loanToken: tokenToPoolToken(kaia, chainId),
    collateralToken: tokenToPoolToken(usdc, chainId),
    ltv: "65.00%",
    liquidity: "15,890",
    apy: "12.3%",
  },
];

export const PoolSelector = memo(function PoolSelector({
  pools,
  onPoolSelect,
  selectedPool,
}: PoolSelectorProps) {
  const currentChainId = useCurrentChainId();
  const defaultPools = createDefaultPools(currentChainId);
  const poolsToUse = pools || defaultPools;
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Pool>(selectedPool || poolsToUse[0]);

  const handleSelect = (pool: Pool) => {
    setSelected(pool);
    setIsOpen(false);
    onPoolSelect?.(pool);
  };

  return (
    <div className="relative z-10 w-full md:w-auto">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full md:min-w-[320px] lg:min-w-[380px] xl:min-w-[480px] px-3 md:px-4 py-2.5 md:py-3 bg-senja-cream/90 rounded-xl border border-senja-cream-light/70 hover:border-senja-orange/50 hover:bg-senja-cream transition-all duration-200 backdrop-blur-sm shadow-sm"
      >
        {/* Selected Pool Display */}
        <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
          {/* From Token */}
          <div className="flex items-center space-x-1.5 md:space-x-2 min-w-0">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-senja-orange/20 flex items-center justify-center flex-shrink-0">
              <Image
                src={selected.loanToken.logo}
                alt={selected.loanToken.symbol}
                width={20}
                height={20}
                className="rounded-full w-5 h-5 md:w-6 md:h-6"
              />
            </div>
            <span className="text-senja-brown font-medium text-sm md:text-base truncate">
              {selected.loanToken.symbol}
            </span>
          </div>

          {/* Arrow */}
          <div className="text-senja-brown/60 text-sm md:text-base flex-shrink-0">
            →
          </div>

          {/* To Token */}
          <div className="flex items-center space-x-1.5 md:space-x-2 min-w-0">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-senja-brown/20 flex items-center justify-center flex-shrink-0">
              <Image
                src={selected.collateralToken.logo}
                alt={selected.collateralToken.symbol}
                width={20}
                height={20}
                className="rounded-full w-5 h-5 md:w-6 md:h-6"
              />
            </div>
            <span className="text-senja-brown font-medium text-sm md:text-base truncate">
              {selected.collateralToken.symbol}
            </span>
          </div>
        </div>

        {/* Dropdown Icon */}
        <ChevronDown
          className={`w-4 h-4 md:w-5 md:h-5 text-senja-brown/60 transition-transform duration-200 flex-shrink-0 ml-4 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl border border-senja-cream-light/70 shadow-xl z-50 overflow-hidden">
          {poolsToUse.map((pool) => (
            <button
              key={pool.id}
              onClick={() => handleSelect(pool)}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 hover:bg-senja-cream/50 transition-colors duration-150 border-b border-senja-cream-light/30 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                {/* Pool Info */}
                <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                  {/* From Token */}
                  <div className="flex items-center space-x-1.5 md:space-x-2 min-w-0">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden bg-senja-orange/20 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={pool.loanToken.logo}
                        alt={pool.loanToken.symbol}
                        width={18}
                        height={18}
                        className="rounded-full w-4 h-4 md:w-5 md:h-5"
                      />
                    </div>
                    <span className="text-senja-brown font-medium text-sm md:text-base truncate">
                      {pool.loanToken.symbol}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="text-senja-brown/60 text-sm md:text-base flex-shrink-0">
                    →
                  </div>

                  {/* To Token */}
                  <div className="flex items-center space-x-1.5 md:space-x-2 min-w-0">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden bg-senja-brown/20 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={pool.collateralToken.logo}
                        alt={pool.collateralToken.symbol}
                        width={18}
                        height={18}
                        className="rounded-full w-4 h-4 md:w-5 md:h-5"
                      />
                    </div>
                    <span className="text-senja-brown font-medium text-sm md:text-base truncate">
                      {pool.collateralToken.symbol}
                    </span>
                  </div>
                </div>

                {/* Pool Stats */}
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="text-senja-orange text-sm md:text-base font-medium">
                    {pool.apy}
                  </div>
                  <div className="text-senja-brown/60 text-xs">APY</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
});
