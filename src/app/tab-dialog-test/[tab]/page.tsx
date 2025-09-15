"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import tab components
import { SupplyTab, BorrowTab, RepayTab, WithdrawTab } from "@/components/tabs";

const TabDialogWithParamsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get active tab from URL params
  const activeTab = (params.tab as string) || "supply";

  const handleTabChange = (value: string) => {
    // Update URL with new tab
    router.push(`/tab-dialog-test/${value}`);
  };

  // Open dialog when component mounts
  useEffect(() => {
    setIsDialogOpen(true);
  }, []);

  const validTabs = ["supply", "borrow", "repay", "withdraw"];
  const currentTab = validTabs.includes(activeTab) ? activeTab : "supply";

  return (
    <div className="min-h-screen bg-gradient-senja-cream p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-senja-orange/20 shadow-lg">
          <h1 className="text-3xl font-bold text-gradient-sunset mb-6 text-center">
            Tab Dialog with URL Params
          </h1>
          
          <div className="space-y-4">
            <p className="text-senja-brown text-center">
              Current tab: <span className="font-semibold text-sunset-orange">{currentTab}</span>
            </p>
            
            <div className="flex justify-center space-x-4">
              {validTabs.map((tab) => (
                <Button
                  key={tab}
                  onClick={() => router.push(`/tab-dialog-test/${tab}`)}
                  variant={currentTab === tab ? "default" : "outline"}
                  className={`capitalize ${
                    currentTab === tab 
                      ? "bg-gradient-sunset text-white" 
                      : "border-senja-orange text-senja-brown hover:bg-senja-cream"
                  }`}
                >
                  {tab}
                </Button>
              ))}
            </div>

            <div className="text-center">
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-sunset hover:bg-gradient-twilight text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Open Dialog
              </Button>
            </div>
          </div>
        </Card>

        {/* Tab Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-senja-orange/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient-sunset text-center">
                Pool Actions
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
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
                <SupplyTab />
              </TabsContent>

              <TabsContent value="borrow" className="mt-6">
                <BorrowTab />
              </TabsContent>

              <TabsContent value="repay" className="mt-6">
                <RepayTab />
              </TabsContent>

              <TabsContent value="withdraw" className="mt-6">
                <WithdrawTab />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TabDialogWithParamsPage;
