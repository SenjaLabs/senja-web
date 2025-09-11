"use client";

import React, { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PoolCard } from './PoolCard';
import { PoolSelector } from './PoolSelector';
import { tokens } from '@/lib/addresses/tokenAddress';
import { Token } from '@/types';
import { useCurrentChainId } from '@/lib/chain';

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

interface PoolOverviewProps {
  pools?: Pool[];
  onCreatePool?: () => void;
  onPoolClick?: (pool: Pool) => void;
  onPoolSelect?: (pool: Pool) => void;
}

// Helper function to convert Token to PoolToken
const tokenToPoolToken = (token: Token, chainId: number): PoolToken => ({
  symbol: token.symbol,
  name: token.name,
  logo: token.logo,
  address: token.addresses[chainId]
});

// Get tokens from the address library
const [weth, wbtc, usdc, usdt, kaia] = tokens;

// Create default pools with dynamic chain ID
const createDefaultPools = (chainId: number): Pool[] => [
  {
    id: '1',
    loanToken: tokenToPoolToken(usdc, chainId),
    collateralToken: tokenToPoolToken(weth, chainId),
    ltv: '80.00%',
    liquidity: '48,810',
    apy: '12.5%'
  },
  {
    id: '2',
    loanToken: tokenToPoolToken(usdt, chainId),
    collateralToken: tokenToPoolToken(wbtc, chainId),
    ltv: '75.00%',
    liquidity: '32,450',
    apy: '15.2%'
  },
  {
    id: '3',
    loanToken: tokenToPoolToken(usdc, chainId),
    collateralToken: tokenToPoolToken(kaia, chainId),
    ltv: '70.00%',
    liquidity: '18,920',
    apy: '18.7%'
  },
  {
    id: '4',
    loanToken: tokenToPoolToken(usdt, chainId),
    collateralToken: tokenToPoolToken(weth, chainId),
    ltv: '65.00%',
    liquidity: '25,380',
    apy: '14.3%'
  }
];

export const PoolOverview = memo(function PoolOverview({ 
  pools, 
  onCreatePool, 
  onPoolClick,
  onPoolSelect
}: PoolOverviewProps) {
  const currentChainId = useCurrentChainId();
  const defaultPools = createDefaultPools(currentChainId);
  const poolsToUse = pools || defaultPools;
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-senja-cream/80 to-senja-cream-light/60 backdrop-blur-sm border border-senja-cream-light/70 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex justify-center md:justify-start">
              <PoolSelector 
                pools={poolsToUse}
                onPoolSelect={onPoolSelect}
              />
            </div>
            <Button 
              onClick={onCreatePool}
              className="bg-senja-orange hover:bg-senja-orange/90 text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Pool
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Table Header - Desktop Only */}
      <Card className="hidden md:block bg-white/60 backdrop-blur-sm border border-senja-cream-light/50 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-6 text-sm font-semibold text-senja-brown/80">
            <div>Loan Token</div>
            <div>Collateral Token</div>
            <div className="text-center">LTV</div>
            <div className="text-right">Liquidity</div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Cards */}
      <div className="space-y-3">
        {poolsToUse.map((pool) => (
          <PoolCard
            key={pool.id}
            loanToken={pool.loanToken}
            collateralToken={pool.collateralToken}
            ltv={pool.ltv}
            liquidity={pool.liquidity}
            apy={pool.apy}
            onClick={() => onPoolClick?.(pool)}
          />
        ))}
      </div>

      {/* Empty State */}
      {poolsToUse.length === 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border border-senja-cream-light/50 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="text-senja-brown/60">
              <div className="w-16 h-16 mx-auto mb-4 bg-senja-cream rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-senja-brown/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-senja-brown">No pools available</h3>
              <p className="mb-6">Create your first lending pool to get started</p>
              <Button 
                onClick={onCreatePool}
                className="bg-senja-orange hover:bg-senja-orange/90 text-white"
              >
                Create Pool
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
})
