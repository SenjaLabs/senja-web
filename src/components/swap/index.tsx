"use client";

import { useLiff } from "@/app/LiffProvider";
import { SwapInterface } from "@/components/swap/SwapInterface";

interface Token {
  symbol: string;
  name: string;
  logo: string;
  balance?: string;
}

export default function SwapPage() {
  const { liff, liffError } = useLiff();

  const handleSwap = async (fromToken: Token, toToken: Token, amount: string) => {
    console.log('Swapping:', { fromToken, toToken, amount });

    if (liff) {
      try {
        const result = confirm(`Swap ${amount} ${fromToken.symbol} for ${toToken.symbol}?`);
        if (result) {
          alert('Swap initiated successfully!');
          // In a real implementation, you would call your swap API here
        }
      } catch (error) {
        console.error('Swap error:', error);
        alert('Swap failed. Please try again.');
      }
    }
  };

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
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
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
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-sunset-purple rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sunset-pink rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-sunset-violet rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <SwapInterface onSwap={handleSwap} />
        </div>
      </div>
    </div>
  );
}