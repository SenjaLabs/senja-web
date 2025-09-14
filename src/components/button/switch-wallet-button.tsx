"use client";

import { useSwitchChain, useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDownIcon, CheckIcon, X } from "lucide-react";
import Image from "next/image";
import { useCurrentChain, useAllChains, useChainActions } from "@/lib/chain";
import { chains } from "@/lib/addresses/chainAddress";

interface SwitchChainButtonProps {
  className?: string;
}

export default function SwitchChainButton({
  className,
}: SwitchChainButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  
  // Use dynamic chain system
  const currentChain = useCurrentChain();
  const allChains = useAllChains();
  const { setChain } = useChainActions();

  const handleSwitchChain = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId as number });
      setChain(targetChainId); // Update our chain context
      setIsOpen(false);
    } catch  {
      // Silent error handling for production
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className={`p-4 px-4 font-medium rounded-lg transition-all duration-300 border-1 border-orange-200 hover:border-orange-400 bg-gradient-to-r from-white to-orange-50/30 hover:from-orange-50 hover:to-pink-50/50 hover:shadow-lg hover:shadow-orange-200/30 ${className}`}
      >
        {currentChain ? (
          <div className="flex items-center space-x-3">
            <div className="relative">
                      <Image
                        width={8}
                        height={8}
                        src={
                          chains.find((c) => c.id === currentChain.id)?.logo ||
                          ""
                        }
                        alt={currentChain.name}
                        className="w-4 rounded-full ring-2 ring-white shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-left">
              <div className="text-gray-900 font-semibold text-sm">
                {currentChain.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">🌐</span>
            </div>
            <span className="text-gray-700 font-medium">Select Network</span>
          </div>
        )}
        <ChevronDownIcon className="ml-2 h-4 w-4 text-orange-500" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-orange-50 backdrop-blur-sm border border-orange-200/50 max-w-md shadow-2xl w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader className="text-center pb-4 relative">
            <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Select Network
            </DialogTitle>
            <Button
              onClick={() => setIsOpen(false)}
              className="absolute top-0 right-0 p-2 hover:bg-orange-100 rounded-full transition-colors duration-200"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 text-orange-600" />
            </Button>
          </DialogHeader>

          <div className="pb-4 sm:pb-6">
            <div className="space-y-2 sm:space-y-3">
              {allChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => handleSwitchChain(chain.id)}
                  disabled={isPending}
                  className={`group w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    chainId === chain.id
                      ? "border-orange-400 bg-gradient-to-r from-orange-50 to-pink-50 shadow-lg shadow-orange-200/50"
                      : "border-orange-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 hover:shadow-md"
                  } ${
                    isPending
                      ? "opacity-50 cursor-not-allowed scale-95"
                      : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative">
                      <Image
                        width={40}
                        height={40}
                        src={chain.logo}
                        alt={chain.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-white shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {chainId === chain.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-base sm:text-lg truncate">
                        {chain.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                        <span className="truncate">Chain ID: {chain.id}</span>
                      </div>
                    </div>
                  </div>

                  {chainId === chain.id && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-md text-xs sm:text-sm">
                        Active
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {isPending && (
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-orange-100 rounded-lg border border-orange-200">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-orange-500 border-t-transparent"></div>
                  <span className="text-xs sm:text-sm text-orange-700 font-medium">
                    Switching network...
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
