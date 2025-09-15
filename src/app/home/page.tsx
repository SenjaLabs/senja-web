"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoolsOverview } from "@/components/table/pools-overview";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import SenjaHeader from "@/components/header/senja-header";

// Import tab components
import { SupplyTab, BorrowTab, RepayTab, WithdrawTab } from "@/components/tabs";

// Custom PoolsOverview wrapper that accepts onPoolClick prop
interface PoolsOverviewWithCustomHandlerProps {
  onPoolClick: (pool: LendingPoolWithTokens) => void;
}

const PoolsOverviewWithCustomHandler = ({
  onPoolClick,
}: PoolsOverviewWithCustomHandlerProps) => {
  return <PoolsOverview onPoolClick={onPoolClick} />;
};

const HomePage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("supply");
  const [selectedPool, setSelectedPool] =
    useState<LendingPoolWithTokens | null>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handlePoolClick = useCallback((pool: LendingPoolWithTokens) => {
    setSelectedPool(pool);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedPool(null);
  }, []);

  return (
    <div className="min-h-screen w-full pb-20 relative overflow-hidden bg-gradient-to-br from-senja-background via-senja-cream/30 to-senja-cream-light/40 flex items-center justify-center">
      {/* Mobile-optimized container */}
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header Section */}
        <SenjaHeader />

        {/* Pool Overview */}
        <div className="relative">
          <PoolsOverviewWithCustomHandler onPoolClick={handlePoolClick} />
        </div>

        {/* Tab Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-senja-orange/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient-sunset text-center">
                {selectedPool
                  ? `${selectedPool.collateralTokenInfo?.symbol} / ${selectedPool.borrowTokenInfo?.symbol}`
                  : "Pool Actions"}
              </DialogTitle>
            </DialogHeader>

            {selectedPool && (
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 bg-orange-50 border-2 border-orange-200 rounded-lg p-1 shadow-lg">
                  <TabsTrigger
                    value="supply"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
                  >
                    Supply
                  </TabsTrigger>
                  <TabsTrigger
                    value="borrow"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
                  >
                    Borrow
                  </TabsTrigger>
                  <TabsTrigger
                    value="repay"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
                  >
                    Repay
                  </TabsTrigger>
                  <TabsTrigger
                    value="withdraw"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md font-semibold m-0 flex items-center justify-center"
                  >
                    Withdraw
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="supply" className="mt-6">
                  <SupplyTab pool={selectedPool} />
                </TabsContent>

                <TabsContent value="borrow" className="mt-6">
                  <BorrowTab pool={selectedPool} />
                </TabsContent>

                <TabsContent value="repay" className="mt-6">
                  <RepayTab pool={selectedPool} />
                </TabsContent>

                <TabsContent value="withdraw" className="mt-6">
                  <WithdrawTab pool={selectedPool} />
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HomePage;
