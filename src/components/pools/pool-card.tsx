"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface Token {
  symbol: string;
  name: string;
  logo: string;
  address?: string;
}

interface PoolCardProps {
  loanToken: Token;
  collateralToken: Token;
  ltv: string;
  liquidity: string;
  apy?: string;
  onClick?: () => void;
}

export function PoolCard({ 
  loanToken, 
  collateralToken, 
  ltv, 
  liquidity, 
  apy,
  onClick 
}: PoolCardProps) {
  return (
    <Card 
      className="bg-white/90 backdrop-blur-sm border border-senja-cream-light/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-senja-orange/50"
      onClick={onClick}
    >
      <CardContent className="p-4 md:p-6">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 items-center">
          {/* Loan Token */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-senja-orange to-senja-orange/80 flex items-center justify-center shadow-sm overflow-hidden">
              <Image
                src={loanToken.logo}
                alt={loanToken.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <div>
              <div className="font-semibold text-senja-brown">{loanToken.symbol}</div>
              <div className="text-sm text-senja-brown/60">{loanToken.name}</div>
            </div>
          </div>

          {/* Collateral Token */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-senja-brown to-senja-brown/80 flex items-center justify-center shadow-sm overflow-hidden">
              <Image
                src={collateralToken.logo}
                alt={collateralToken.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <div>
              <div className="font-semibold text-senja-brown">{collateralToken.symbol}</div>
              <div className="text-sm text-senja-brown/60">{collateralToken.name}</div>
            </div>
          </div>

          {/* LTV */}
          <div className="text-center">
            <div className="text-2xl font-bold text-senja-orange">{ltv}</div>
            {apy && (
              <div className="text-sm text-senja-brown/60">APY: {apy}</div>
            )}
          </div>

          {/* Liquidity */}
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{liquidity}</div>
            <div className="text-sm text-senja-brown/60">Available</div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-2">
          {/* Tokens Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-senja-orange to-senja-orange/80 flex items-center justify-center overflow-hidden">
                <Image
                  src={loanToken.logo}
                  alt={loanToken.symbol}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="font-semibold text-senja-brown text-sm">{loanToken.symbol}</div>
                <div className="text-xs text-senja-brown/60">{loanToken.name}</div>
              </div>
            </div>
            <div className="text-senja-brown/40 text-sm">→</div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-senja-brown to-senja-brown/80 flex items-center justify-center overflow-hidden">
                <Image
                  src={collateralToken.logo}
                  alt={collateralToken.symbol}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="font-semibold text-senja-brown text-sm">{collateralToken.symbol}</div>
                <div className="text-xs text-senja-brown/60">{collateralToken.name}</div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-senja-cream-light/50">
            <div className="text-center">
              <div className="text-sm text-senja-brown/60">LTV</div>
              <div className="text-lg font-bold text-senja-orange">{ltv}</div>
            </div>
            {apy && (
              <div className="text-center">
                <div className="text-sm text-senja-brown/60">APY</div>
                <div className="text-lg font-bold text-purple-600">{apy}</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-sm text-senja-brown/60">Liquidity</div>
              <div className="text-lg font-bold text-green-600">{liquidity}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
