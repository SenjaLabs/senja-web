"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RepayTab = () => {
  const [selectedToken] = useState("");
  const [amount, setAmount] = useState("");
  const [repayType] = useState("partial");

  // Borrow tokens from lending pool (based on borrowable tokens)
  const borrowedTokens = [
    {
      symbol: "USDC",
      name: "USD Coin",
      borrowed: "1,500.00",
      interest: "25.50",
      total: "1,525.50",
      rate: "8.5%",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      borrowed: "800.00",
      interest: "12.30",
      total: "812.30",
      rate: "9.2%",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      borrowed: "2.5",
      interest: "0.08",
      total: "2.58",
      rate: "7.8%",
    },
  ];

  const handleRepay = () => {
    console.log("Repay:", {
      token: selectedToken,
      amount,
      type: repayType,
    });
    // Handler akan diimplementasikan nanti
  };

  const selectedTokenData = borrowedTokens.find(
    (t) => t.symbol === selectedToken
  );

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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <label className="text-sm font-medium text-amber-800">
                  Repay Amount
                </label>
              </div>
              <span className="text-sm text-amber-600">
                {repayType === "full" && selectedTokenData
                  ? `Total: ${selectedTokenData.total}`
                  : repayType === "interest" && selectedTokenData
                  ? `Interest: ${selectedTokenData.interest}`
                  : selectedTokenData
                  ? `Borrowed: ${selectedTokenData.borrowed}`
                  : "0.00"}
              </span>
            </div>
            
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter amount to repay"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  onClick={() => {
                    if (repayType === "full" && selectedTokenData) {
                      setAmount(selectedTokenData.total);
                    } else if (repayType === "interest" && selectedTokenData) {
                      setAmount(selectedTokenData.interest);
                    } else if (selectedTokenData) {
                      setAmount(selectedTokenData.borrowed);
                    }
                  }}
                >
                  {repayType === "full"
                    ? "Full"
                    : repayType === "interest"
                    ? "Interest"
                    : "Max"}
                </button>
                <span className="text-sm font-medium text-amber-800">USDT</span>
              </div>
            </div>
          </div>

          {/* Token Info Display */}
          {selectedTokenData && (
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg border-2 border-orange-200 shadow-md">
              <h4 className="font-medium text-amber-800 mb-2">
                Current Position
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-amber-600">Borrowed:</span>
                  <span className="ml-2 font-medium">
                    {selectedTokenData.borrowed} {selectedTokenData.symbol}
                  </span>
                </div>
                <div>
                  <span className="text-amber-600">Interest:</span>
                  <span className="ml-2 font-medium text-orange-600">
                    {selectedTokenData.interest} {selectedTokenData.symbol}
                  </span>
                </div>
                <div>
                  <span className="text-amber-600">Rate:</span>
                  <span className="ml-2 font-medium">
                    {selectedTokenData.rate}
                  </span>
                </div>
                <div>
                  <span className="text-amber-600">Total:</span>
                  <span className="ml-2 font-medium">
                    {selectedTokenData.total} {selectedTokenData.symbol}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Button
        onClick={handleRepay}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        disabled={!amount || !selectedToken}
      >
        Repay {selectedToken || "Token"}
      </Button>
    </div>
  );
};

export default RepayTab;
