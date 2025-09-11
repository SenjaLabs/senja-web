"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { tokens } from '@/lib/addresses/tokenAddress';
import { Token } from '@/types';

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
const tokenToPoolToken = (token: Token, chainId: number = 8453): PoolToken => ({
  symbol: token.symbol,
  name: token.name,
  logo: token.logo,
  address: token.addresses[chainId]
});

// Get tokens from the address library
const [weth, wbtc, usdc, usdt, kaia] = tokens;

const DEFAULT_POOLS: Pool[] = [
  {
    id: '1',
    loanToken: tokenToPoolToken(usdc),
    collateralToken: tokenToPoolToken(weth),
    ltv: '80.00%',
    liquidity: '48,810',
    apy: '8.5%'
  },
  {
    id: '2',
    loanToken: tokenToPoolToken(usdt),
    collateralToken: tokenToPoolToken(wbtc),
    ltv: '75.00%',
    liquidity: '32,150',
    apy: '7.2%'
  },
  {
    id: '3',
    loanToken: tokenToPoolToken(kaia),
    collateralToken: tokenToPoolToken(usdc),
    ltv: '65.00%',
    liquidity: '15,890',
    apy: '12.3%'
  }
];

export function PoolSelector({ 
  pools = DEFAULT_POOLS, 
  onPoolSelect,
  selectedPool 
}: PoolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Pool>(selectedPool || pools[0]);

  const handleSelect = (pool: Pool) => {
    setSelected(pool);
    setIsOpen(false);
    onPoolSelect?.(pool);
  };

  return (
    <div className="relative z-10">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-[280px] px-4 py-3 bg-gray-700/90 rounded-xl border border-gray-600/50 hover:border-gray-500/70 transition-all duration-200 backdrop-blur-sm"
      >
        {/* Selected Pool Display */}
        <div className="flex items-center space-x-3">
          {/* From Token */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500/20 flex items-center justify-center">
              <Image
                src={selected.loanToken.logo}
                alt={selected.loanToken.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <span className="text-white font-medium text-sm">{selected.loanToken.symbol}</span>
          </div>

          {/* Arrow */}
          <div className="text-gray-400">→</div>

          {/* To Token */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-500/20 flex items-center justify-center">
              <Image
                src={selected.collateralToken.logo}
                alt={selected.collateralToken.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <span className="text-white font-medium text-sm">{selected.collateralToken.symbol}</span>
          </div>
        </div>

        {/* Dropdown Icon */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700/95 backdrop-blur-md rounded-xl border border-gray-600/50 shadow-xl z-50 overflow-hidden">
          {pools.map((pool) => (
            <button
              key={pool.id}
              onClick={() => handleSelect(pool)}
              className="w-full px-4 py-3 hover:bg-gray-600/50 transition-colors duration-150 border-b border-gray-600/30 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                {/* Pool Info */}
                <div className="flex items-center space-x-3">
                  {/* From Token */}
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-blue-500/20 flex items-center justify-center">
                      <Image
                        src={pool.loanToken.logo}
                        alt={pool.loanToken.symbol}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </div>
                    <span className="text-white font-medium text-sm">{pool.loanToken.symbol}</span>
                  </div>

                  {/* Arrow */}
                  <div className="text-gray-400 text-sm">→</div>

                  {/* To Token */}
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-500/20 flex items-center justify-center">
                      <Image
                        src={pool.collateralToken.logo}
                        alt={pool.collateralToken.symbol}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </div>
                    <span className="text-white font-medium text-sm">{pool.collateralToken.symbol}</span>
                  </div>
                </div>

                {/* Pool Stats */}
                <div className="text-right">
                  <div className="text-green-400 text-sm font-medium">{pool.apy}</div>
                  <div className="text-gray-400 text-xs">APY</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
