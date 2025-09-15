"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PoolInfoCard } from "./shared/pool-info-card";
import { ChainSelector } from "./shared/chain-selector";
import { AmountInput } from "./shared/amount-input";
import { useRefetch } from "@/hooks/useRefetch";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { useUserWalletBalance } from "@/hooks/read/useReadUserBalance";
import { useCurrentChainId } from "@/lib/chain/use-chain";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";

interface BorrowTabProps {
  pool?: LendingPoolWithTokens;
}

const BorrowTab = ({ pool }: BorrowTabProps) => {
  const [chainFrom] = useState("8217"); // Default to Kaia
  const [chainTo, setChainTo] = useState("8217"); // Default to Kaia for on-chain borrowing
  const [amount, setAmount] = useState("");

  const currentChainId = useCurrentChainId();

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

  // Get user balance for the borrow token
  const {
    userWalletBalanceFormatted,
    userWalletBalanceParsed,
    walletBalanceLoading,
    refetchWalletBalance,
  } = useUserWalletBalance(
    (pool?.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`) ||
      "0xCEb5c8903060197e46Ab5ea5087b9F99CBc8da49",
    pool?.borrowTokenInfo?.decimals || 18
  );

  // Add refetch functions
  useEffect(() => {
    addRefetchFunction(refetchApy);
    addRefetchFunction(refetchWalletBalance);

    return () => {
      removeRefetchFunction(refetchApy);
      removeRefetchFunction(refetchWalletBalance);
    };
  }, [
    addRefetchFunction,
    removeRefetchFunction,
    refetchApy,
    refetchWalletBalance,
  ]);

  const handleSetMax = useCallback(() => {
    if (userWalletBalanceParsed > 0) {
      setAmount(userWalletBalanceFormatted);
    }
  }, [userWalletBalanceFormatted, userWalletBalanceParsed]);

  const handleBorrow = useCallback(() => {
    console.log("Borrow:", {
      chainFrom,
      chainTo,
      amount,
      pool: pool?.lendingPool,
    });
  }, [chainFrom, chainTo, amount, pool]);

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
      <PoolInfoCard
        collateralToken={{
          symbol: pool.collateralTokenInfo?.symbol || "Token",
          logo: pool.collateralTokenInfo?.logo || "/token/kaia-logo.svg",
        }}
        borrowToken={{
          symbol: pool.borrowTokenInfo?.symbol || "Token",
          logo: pool.borrowTokenInfo?.logo || "/token/usdt.png",
        }}
        apy={apyLoading ? "Loading..." : borrowAPY}
        ltv={(Number(pool.ltv) / 1e16).toFixed(1)}
        apyLabel="Interest Rate"
      />

      <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
        <div className="space-y-4">
          {/* Chain Selection */}
          <ChainSelector
            chainFrom={chainFrom}
            chainTo={chainTo}
            onChainToChange={setChainTo}
          />

          {/* Amount Input */}
          <AmountInput
            label="Borrow Amount"
            placeholder="Enter amount to borrow"
            value={amount}
            onChange={setAmount}
            onMaxClick={handleSetMax}
            tokenSymbol={pool.borrowTokenInfo?.symbol || "Token"}
            balance={`Balance: ${
              walletBalanceLoading
                ? "Loading..."
                : userWalletBalanceFormatted || "0.00"
            } ${pool.borrowTokenInfo?.symbol || "Token"}`}
            maxDisabled={userWalletBalanceParsed <= 0}
          />
        </div>
      </Card>

      <Button
        onClick={handleBorrow}
        className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        disabled={!amount || !chainTo}
      >
        Borrow {pool.borrowTokenInfo?.symbol || "Token"}
      </Button>
    </div>
  );
};

export default BorrowTab;
