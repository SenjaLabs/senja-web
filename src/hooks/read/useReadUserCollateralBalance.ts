"use client";

import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { useReadUserPosition } from "./usereadUserPosition";

export type HexAddress = `0x${string}`;

export const useReadUserCollateralBalance = (
  lendingPoolAddress: HexAddress,
  tokenAddress: HexAddress,
  decimal: number
) => {
  const { userPosition, userPositionLoading, userPositionError } = useReadUserPosition(lendingPoolAddress);
  const {
    data: userCollateralBalance,
    isLoading: userCollateralBalanceLoading,
    error: userCollateralBalanceError,
    refetch: refetchUserCollateralBalance,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userPosition as `0x${string}`],
    query: {
      enabled: !!userPosition && !userPositionLoading && !userPositionError,
    },
  });

  // Parse balance with decimal
  const parsedBalance = userCollateralBalance 
    ? Number(userCollateralBalance) / Math.pow(10, decimal)
    : 0;

  return {
    userCollateralBalance: userCollateralBalance,
    parsedUserCollateralBalance: parsedBalance,
    userCollateralBalanceLoading: userCollateralBalanceLoading || userPositionLoading,
    userCollateralBalanceError: userCollateralBalanceError || userPositionError,
    refetchUserCollateralBalance,
  };
};
