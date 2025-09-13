"use client";

import { useLiff } from "@/app/LiffProvider";
import { SwapInterface } from "@/components/swap/swap-interface";
import { memo, useCallback } from "react";
import { Token } from "@/types";

export default memo(function SwapPage() {
  const { liff, liffError } = useLiff();

  const handleSwap = useCallback(async (
    fromToken: Token,
    toToken: Token,
    amount: string
  ) => {
    if (liff) {
      try {
        const result = confirm(
          `Swap ${amount} ${fromToken.symbol} for ${toToken.symbol}?`
        );
        if (result) {
          // In a real implementation, you would call your swap API here
          // TODO: Implement proper success notification
        }
      } catch (error) {
        // TODO: Implement proper error notification
      }
    }
  }, [liff]);

  if (liffError) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-red-600">LIFF Error</h1>
          <p className="text-red-500">{liffError}</p>
        </div>
      </div>
    );
  }

  if (!liff) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <p>Please wait while we initialize the LINE Front-end Framework.</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-7xl mx-auto">
          <SwapInterface onSwap={handleSwap} />
        </div>
      </div>
    </div>
  );
});
