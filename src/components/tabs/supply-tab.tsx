"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SupplyTab = () => {
  const [supplyType, setSupplyType] = useState("liquidity");
  const [amount, setAmount] = useState("");

  const handleSupply = () => {
    console.log(`Supply ${supplyType}:`, { amount });
  };

  return (
    <div className="space-y-6">
      <Tabs value={supplyType} onValueChange={setSupplyType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-orange-50 border-2 border-orange-200 rounded-lg p-1 shadow-lg">
          <TabsTrigger 
            value="liquidity" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
          >
            Supply Liquidity
          </TabsTrigger>
          <TabsTrigger 
            value="collateral" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
          >
            Supply Collateral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liquidity" className="mt-4">
          <div className="space-y-4">
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

            {/* Amount Input Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <label className="text-sm font-medium text-amber-800">
                    Amount to Supply
                  </label>
                </div>
                <span className="text-sm text-amber-600">
                  Balance: 99986.30 USDT
                </span>
              </div>
              
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Enter amount to supply"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    onClick={() => setAmount("99986.30")}
                  >
                    Max
                  </button>
                  <span className="text-sm font-medium text-amber-800">USDT</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collateral" className="mt-4">
          <div className="space-y-4">
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

            {/* Amount Input Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <label className="text-sm font-medium text-amber-800">
                    Amount to Supply
                  </label>
                </div>
                <span className="text-sm text-amber-600">
                  Balance: 50000.00 WKAIA
                </span>
              </div>
              
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Enter amount to supply"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    onClick={() => setAmount("50000.00")}
                  >
                    Max
                  </button>
                  <span className="text-sm font-medium text-amber-800">WKAIA</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleSupply}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        disabled={!amount}
      >
        Supply {supplyType === "liquidity" ? "Liquidity" : "Collateral"}
      </Button>
    </div>
  );
};

export default SupplyTab;
