"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WithdrawTab = () => {
  const [withdrawType, setWithdrawType] = useState("liquidity");
  const [selectedToken] = useState("");
  const [amount, setAmount] = useState("");

  // Liquidity tokens (based on borrow tokens from lending pool)
  const liquidityTokens = [
    {
      symbol: "USDC",
      name: "USD Coin",
      supplied: "2,000.00",
      earned: "45.20",
      total: "2,045.20",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      supplied: "1,500.00",
      earned: "32.10",
      total: "1,532.10",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      supplied: "5.0",
      earned: "0.15",
      total: "5.15",
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      supplied: "0.2",
      earned: "0.005",
      total: "0.205",
    },
  ];

  // Collateral tokens (based on collateral tokens from lending pool)
  const collateralTokens = [
    {
      symbol: "USDC",
      name: "USD Coin",
      supplied: "1,000.00",
      used: "750.00",
      available: "250.00",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      supplied: "3.0",
      used: "2.0",
      available: "1.0",
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      supplied: "0.1",
      used: "0.05",
      available: "0.05",
    },
  ];

  const handleWithdraw = () => {
    console.log(`Withdraw ${withdrawType}:`, { token: selectedToken, amount });
    // Handler akan diimplementasikan nanti
  };

  const getSelectedLiquidityToken = () => {
    return liquidityTokens.find((t) => t.symbol === selectedToken);
  };

  const getSelectedCollateralToken = () => {
    return collateralTokens.find((t) => t.symbol === selectedToken);
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

      <Tabs
        value={withdrawType}
        onValueChange={setWithdrawType}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-orange-50 border-2 border-orange-200 rounded-lg p-1 shadow-lg">
          <TabsTrigger
            value="liquidity"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
          >
            Withdraw Liquidity
          </TabsTrigger>
          <TabsTrigger
            value="collateral"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
          >
            Withdraw Collateral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liquidity" className="mt-4">
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <label className="text-sm font-medium text-amber-800">
                      Amount to Withdraw
                    </label>
                  </div>
                  <span className="text-sm text-amber-600">
                    Available: {getSelectedLiquidityToken()?.total || "0.00"}
                  </span>
                </div>
                
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      onClick={() =>
                        setAmount(getSelectedLiquidityToken()?.total || "0")
                      }
                    >
                      Max
                    </button>
                    <span className="text-sm font-medium text-amber-800">USDT</span>
                  </div>
                </div>
              </div>

              {/* Token Info Display */}
              {getSelectedLiquidityToken() && (
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg border-2 border-orange-200 shadow-md">
                  <h4 className="font-medium text-amber-800 mb-2">
                    Liquidity Position
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-amber-600">Supplied:</span>
                      <span className="ml-2 font-medium">
                        {getSelectedLiquidityToken()?.supplied}{" "}
                        {getSelectedLiquidityToken()?.symbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-amber-600">Earned:</span>
                      <span className="ml-2 font-medium text-orange-600">
                        {getSelectedLiquidityToken()?.earned}{" "}
                        {getSelectedLiquidityToken()?.symbol}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-amber-600">Total Available:</span>
                      <span className="ml-2 font-medium">
                        {getSelectedLiquidityToken()?.total}{" "}
                        {getSelectedLiquidityToken()?.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="collateral" className="mt-4">
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <label className="text-sm font-medium text-amber-800">
                      Amount to Withdraw
                    </label>
                  </div>
                  <span className="text-sm text-amber-600">
                    Available:{" "}
                    {getSelectedCollateralToken()?.available || "0.00"}
                  </span>
                </div>
                
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      onClick={() =>
                        setAmount(getSelectedCollateralToken()?.available || "0")
                      }
                    >
                      Max
                    </button>
                    <span className="text-sm font-medium text-amber-800">WKAIA</span>
                  </div>
                </div>
              </div>

              {/* Token Info Display */}
              {getSelectedCollateralToken() && (
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-lg border-2 border-orange-200 shadow-md">
                  <h4 className="font-medium text-amber-800 mb-2">
                    Collateral Position
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-amber-600">Supplied:</span>
                      <span className="ml-2 font-medium">
                        {getSelectedCollateralToken()?.supplied}{" "}
                        {getSelectedCollateralToken()?.symbol}
                      </span>
                    </div>
                    <div>
                      <span className="text-amber-600">Used:</span>
                      <span className="ml-2 font-medium text-orange-600">
                        {getSelectedCollateralToken()?.used}{" "}
                        {getSelectedCollateralToken()?.symbol}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-amber-600">Available:</span>
                      <span className="ml-2 font-medium">
                        {getSelectedCollateralToken()?.available}{" "}
                        {getSelectedCollateralToken()?.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      <Button
        onClick={handleWithdraw}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        disabled={!amount || !selectedToken}
      >
        Withdraw {withdrawType === "liquidity" ? "Liquidity" : "Collateral"}
      </Button>
    </div>
  );
};

export default WithdrawTab;
