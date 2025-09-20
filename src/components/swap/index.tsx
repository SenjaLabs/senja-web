"use client";

import { useLiff } from "@/app/LiffProvider";
import { SwapInterface } from "@/components/swap/swap-interface";
import { memo, useCallback } from "react";
import { Token } from "@/types";
import { useSwapCollateral } from "@/hooks/write/useSwapCollateral";
import { useCurrentChainId } from "@/lib/chain";

export default memo(function SwapPage() {
  const { liff, liffError } = useLiff();
  const currentChainId = useCurrentChainId();

  const {
    handleSwapCollateral,
    isSwapping,
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
  } = useSwapCollateral(currentChainId, () => {
    // Swap completed successfully
  });

  const handleSwap = useCallback(async (
    fromToken: Token,
    toToken: Token,
    amount: string,
    selectedPoolAddress?: string,
    userPositionAddress?: string
  ) => {
    if (liff && selectedPoolAddress && userPositionAddress) {
      try {
        // Execute the swap directly
        await handleSwapCollateral(
          userPositionAddress as `0x${string}`,
          fromToken.addresses[currentChainId] as `0x${string}`,
          toToken.addresses[currentChainId] as `0x${string}`,
          amount,
          fromToken.decimals || 18
        );
      } catch (error) {
        console.error("Swap failed:", error);
      }
    }
  }, [liff, handleSwapCollateral, currentChainId]);

  if (liffError) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full">
          <h1 className="text-2xl font-bold mb-4 text-red-600">LIFF Error</h1>
          <p className="text-red-500">{liffError}</p>
        </div>
      </div>
    );
  }

  if (!liff) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full">
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
      <div className="relative z-10 flex justify-center pt-8 pb-4 px-3">
        <div className="w-full max-w-xl mx-auto">
          <SwapInterface 
            onSwap={handleSwap}
            isSwapping={isSwapping}
            showSuccessAlert={showSuccessAlert}
            showFailedAlert={showFailedAlert}
            errorMessage={errorMessage}
            successTxHash={successTxHash}
            onCloseSuccessAlert={handleCloseSuccessAlert}
            onCloseFailedAlert={handleCloseFailedAlert}
          />
        </div>
      </div>
    </div>
  );
});
