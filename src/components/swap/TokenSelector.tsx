"use client";

import React, { useState } from 'react';
import { ChevronDownIcon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Token {
  symbol: string;
  name: string;
  logo: string;
  balance?: string;
}

interface TokenSelectorProps {
  selectedToken?: Token;
  onTokenSelect: (token: Token) => void;
  otherToken?: Token;
  label: string;
}

const POPULAR_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logo: '⟠',
    balance: '0.0324'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: '💵',
    balance: '1,240.50'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    logo: '💰',
    balance: '856.20'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: '₿',
    balance: '0.00245'
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    logo: '🦄',
    balance: '12.45'
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    logo: '🔗',
    balance: '45.2'
  }
];

export function TokenSelector({ selectedToken, onTokenSelect, otherToken, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableTokens = POPULAR_TOKENS.filter(token => 
    (!otherToken || token.symbol !== otherToken.symbol) &&
    (token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
     token.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`h-12 px-4 font-medium rounded-xl transition-all duration-300 border-orange-200 hover:border-orange-300 bg-white/80 hover:bg-white/90 hover:shadow-md ${
          !selectedToken ? "text-gray-700" : "text-gray-900"
        }`}
      >
        {selectedToken ? (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-twilight flex items-center justify-center text-white text-xs font-semibold">
              {selectedToken.logo}
            </div>
            <span className="text-gray-900 font-semibold">{selectedToken.symbol}</span>
          </div>
        ) : (
          <span className="text-gray-600">Select token</span>
        )}
        <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-500" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[80vh] p-0 bg-white/95 backdrop-blur-sm border border-orange-200">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center justify-between">
              {label}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Popular Tokens */}
          {searchQuery === '' && (
            <div className="px-6 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Popular tokens</h3>
              <div className="flex flex-wrap gap-2">
                {['ETH', 'USDC', 'USDT', 'BTC'].map((symbol) => {
                  const token = POPULAR_TOKENS.find(t => t.symbol === symbol);
                  if (!token || (otherToken && token.symbol === otherToken.symbol)) return null;
                  
                  return (
                    <Button
                      key={symbol}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTokenSelect(token)}
                      className="h-8 px-3 bg-sunset-purple-light hover:bg-sunset-pink-light border-sunset-purple/20 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-sunset flex items-center justify-center text-white text-xs font-semibold">
                          {token.logo}
                        </div>
                        <span className="text-xs text-sunset-purple">{symbol}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Token List */}
          <div className="flex-1 overflow-y-auto max-h-96">
            <div className="space-y-1 px-6 pb-6">
              {availableTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tokens found</p>
                  <p className="text-sm">Try searching for a different token</p>
                </div>
              ) : (
                availableTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-sunset-purple-light rounded-lg transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-twilight flex items-center justify-center text-white font-semibold">
                        {token.logo}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 group-hover:text-sunset-purple transition-colors">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-gray-500">{token.name}</div>
                      </div>
                    </div>
                    {token.balance && (
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{token.balance}</div>
                        <div className="text-sm text-gray-500">Balance</div>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
