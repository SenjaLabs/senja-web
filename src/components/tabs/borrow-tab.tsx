"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chains } from "@/lib/addresses/chainAddress";
import Image from "next/image";

const BorrowTab = () => {
  const [chainFrom, setChainFrom] = useState("8217"); // Default to Kaia
  const [chainTo, setChainTo] = useState("");
  const [selectedToken] = useState("");
  const [amount, setAmount] = useState("");
  const [collateralRatio] = useState("150");

  const borrowableTokens = [
    { symbol: "USDC", name: "USD Coin", maxBorrow: "5,000.00", rate: "8.5%" },
    { symbol: "USDT", name: "Tether USD", maxBorrow: "2,500.00", rate: "9.2%" },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      maxBorrow: "10.0",
      rate: "7.8%",
    },
    { symbol: "WBTC", name: "Wrapped Bitcoin", maxBorrow: "0.5", rate: "6.5%" },
  ];

  const handleBorrow = () => {
    console.log("Borrow:", {
      chainFrom,
      chainTo,
      token: selectedToken,
      amount,
      collateralRatio,
    });
    // Handler akan diimplementasikan nanti
  };

  return (
    <div className="space-y-6">
      {/* Pool Information Card */}
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-amber-600 mb-1">Collateral Token:</p>
            <p className="font-semibold text-amber-800">WKAIA</p>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">Borrow Token:</p>
            <p className="font-semibold text-amber-800">USDT</p>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">APY:</p>
            <p className="font-semibold text-amber-800">0.00000%</p>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">LTV:</p>
            <p className="font-semibold text-amber-800">85.0%</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
        <div className="space-y-4">
          {/* Chain Selection - Side by Side */}
          <div className="flex gap-4">
            <div className="flex flex-col w-1/2">
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Chain From (Locked)
              </label>
              <Select value={chainFrom} onValueChange={setChainFrom} disabled>
                <SelectTrigger className="bg-orange-50 border-2 border-orange-300 cursor-not-allowed rounded-lg shadow-md h-12 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <img
                          src={chain.logo}
                          alt={chain.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{chain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-amber-600 mt-1">Kaia (Locked)</p>
            </div>

            <div className="flex flex-col w-1/2">
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Chain To
              </label>
              <Select value={chainTo} onValueChange={setChainTo}>
                <SelectTrigger className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md h-12 w-full">
                  <SelectValue placeholder="Choose destination chain" />
                </SelectTrigger>
                <SelectContent className="bg-white border-0">
                  {chains
                    .filter((chain) => chain.id.toString() !== chainFrom)
                    .map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()} className="hover:bg-orange-50">
                        <div className="flex items-center space-x-2">
                          <Image
                            src={chain.logo}
                            alt={chain.name}
                            className="rounded-full"
                            width={20}
                            height={20}
                          />
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <label className="text-sm font-medium text-amber-800">
                  Borrow Amount
                </label>
              </div>
              <span className="text-sm text-amber-600">
                Max:{" "}
                {selectedToken
                  ? borrowableTokens.find((t) => t.symbol === selectedToken)
                      ?.maxBorrow
                  : "0.00"}
              </span>
            </div>
            
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter amount to borrow"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  onClick={() =>
                    setAmount(
                      borrowableTokens.find((t) => t.symbol === selectedToken)
                        ?.maxBorrow || "0"
                    )
                  }
                >
                  Max
                </button>
                <span className="text-sm font-medium text-amber-800">USDT</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button
        onClick={handleBorrow}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        disabled={!amount || !selectedToken || !chainTo}
      >
        Borrow {selectedToken || "Token"}
      </Button>
    </div>
  );
};

export default BorrowTab;
