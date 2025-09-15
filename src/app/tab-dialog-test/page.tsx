"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import tab components
import { SupplyTab, BorrowTab, RepayTab, WithdrawTab } from "@/components/tabs";

const TabDialogTestPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("supply");
  const router = useRouter();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gradient-senja-cream p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-senja-orange/20 shadow-lg">
          <h1 className="text-3xl font-bold text-gradient-sunset mb-6 text-center">
            Tab Dialog System Test
          </h1>
          
          <div className="space-y-6">
            <p className="text-senja-brown text-center">
              Pilih jenis implementasi tab dialog system
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-white/50 border-senja-orange/20 hover:border-senja-orange/40 transition-all duration-300 cursor-pointer" onClick={() => setIsDialogOpen(true)}>
                <h3 className="text-lg font-semibold text-senja-brown mb-2">Basic Dialog</h3>
                <p className="text-sm text-senja-brown/70 mb-4">
                  Dialog dengan tab system tanpa URL routing
                </p>
                <Button className="w-full bg-gradient-sunset hover:bg-gradient-twilight text-white">
                  Buka Basic Dialog
                </Button>
              </Card>

              <Card className="p-4 bg-white/50 border-senja-orange/20 hover:border-senja-orange/40 transition-all duration-300 cursor-pointer" onClick={() => router.push('/tab-dialog-test/supply')}>
                <h3 className="text-lg font-semibold text-senja-brown mb-2">URL Routing</h3>
                <p className="text-sm text-senja-brown/70 mb-4">
                  Dialog dengan tab system dan URL routing menggunakan useParams
                </p>
                <Button className="w-full bg-gradient-purple-violet hover:bg-gradient-twilight text-white">
                  Buka dengan URL Routing
                </Button>
              </Card>
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
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

export default TabDialogTestPage;
