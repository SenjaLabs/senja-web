"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { useReadUserBorrowShares } from "@/hooks/read/useReadUserBorrowShares";
import { useRefetch } from "@/hooks/useRefetch";
import Image from "next/image";

interface RepayTabProps {
  pool?: {
    lendingPool: string;
    collateralTokenInfo: {
      symbol: string;
      logo: string;
      addresses: Record<string, string>;
      decimals: number;
    };
    borrowTokenInfo: {
      symbol: string;
      logo: string;
      addresses: Record<string, string>;
      decimals: number;
    };
    ltv: string;
  };
}

const RepayTab = ({ pool }: RepayTabProps) => {
  const [amount, setAmount] = useState("");
  const [repayType] = useState("partial");

  // Refetch functionality
  const { addRefetchFunction, removeRefetchFunction } = useRefetch({
    refetchInterval: 0, // Disable auto-refetch, we'll trigger manually
    enabled: false,
  });

  // Get APY for the pool
  const {
    borrowAPY,
    loading: apyLoading,
    refetch: refetchApy,
  } = useReadPoolApy(pool?.lendingPool);

  // Get user borrow shares for the pool
  const {
    userBorrowSharesFormatted,
    userBorrowShares: userBorrowSharesRaw,
    userBorrowSharesLoading,
    userBorrowSharesError,
    refetchUserBorrowShares,
  } = useReadUserBorrowShares(
    (pool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    pool?.borrowTokenInfo?.decimals || 18
  );

  // Parse the raw borrow shares for max button functionality
  const borrowSharesParsed = userBorrowSharesRaw
    ? Number(userBorrowSharesRaw) /
      Math.pow(10, pool?.borrowTokenInfo?.decimals || 18)
    : 0;

  // Add refetch functions
  useEffect(() => {
    addRefetchFunction(refetchApy);
    addRefetchFunction(refetchUserBorrowShares);

    return () => {
      removeRefetchFunction(refetchApy);
      removeRefetchFunction(refetchUserBorrowShares);
    };
  }, [
    addRefetchFunction,
    removeRefetchFunction,
    refetchApy,
    refetchUserBorrowShares,
  ]);

  const handleSetMax = useCallback(() => {
    if (borrowSharesParsed > 0) {
      setAmount(userBorrowSharesFormatted);
    }
  }, [userBorrowSharesFormatted, borrowSharesParsed]);

  const handleRepay = () => {
    console.log("Repay:", {
      amount,
      type: repayType,
      pool: pool?.lendingPool,
    });
    // Handler akan diimplementasikan nanti
  };

  if (!pool) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-amber-600">No pool selected</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pool Information Card */}
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-amber-600 mb-1">Collateral Token:</p>
            <div className="flex items-center space-x-2">
              <Image
                src={pool.collateralTokenInfo?.logo || "/token/kaia-logo.svg"}
                alt={pool.collateralTokenInfo?.symbol || "Token"}
                width={20}
                height={20}
                className="rounded-full"
              />
              <p className="font-semibold text-amber-800">
                {pool.collateralTokenInfo?.symbol}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">Borrow Token:</p>
            <div className="flex items-center space-x-2">
              <Image
                src={pool.borrowTokenInfo?.logo || "/token/usdt.png"}
                alt={pool.borrowTokenInfo?.symbol || "Token"}
                width={20}
                height={20}
                className="rounded-full"
              />
              <p className="font-semibold text-amber-800">
                {pool.borrowTokenInfo?.symbol}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">Interest Rate:</p>
            <p className="font-semibold text-amber-800">
              {apyLoading ? "Loading..." : borrowAPY}%
            </p>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">LTV:</p>
            <p className="font-semibold text-amber-800">
              {(Number(pool.ltv) / 1e16).toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
        <div className="space-y-4">
          {/* User Position Info */}
          <div className="p-3 bg-white/50 rounded-lg border border-orange-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Your Borrowed Amount:
              </span>
              <span className="text-md font-bold text-orange-700">
                {userBorrowSharesLoading ? (
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                ) : userBorrowSharesError ? (
                  <span className="text-red-500 text-xs">Error</span>
                ) : (
                  `${userBorrowSharesFormatted || "0.00"} ${
                    pool.borrowTokenInfo.symbol
                  }`
                )}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <label className="text-sm font-medium text-amber-800">
                  Repay Amount
                </label>
              </div>
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
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSetMax}
                  disabled={borrowSharesParsed <= 0}
                >
                  {repayType === "full"
                    ? "Full"
                    : repayType === "interest"
                    ? "Interest"
                    : "Max"}
                </button>
                <span className="text-sm font-medium text-amber-800">
                  {pool.borrowTokenInfo.symbol}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Button
        onClick={handleRepay}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!amount || parseFloat(amount) <= 0 || borrowSharesParsed <= 0}
      >
        Repay {pool.borrowTokenInfo.symbol}
      </Button>
    </div>
  );
};

export default RepayTab;
