"use client";

import { useReadContract } from "wagmi";
import { useReadUserPosition } from "./usereadUserPosition";
import { helperAddress } from "@/lib/addresses/tokenAddress";
import { helperAbi } from "@/lib/abis/helperAbi";

export type HexAddress = `0x${string}`;

export const useReadExchangeRate = (
  lendingPoolAddress: HexAddress,
  fromTokenAddress: HexAddress,
  toTokenAddress: HexAddress,
  amountIn: number,
  fromTokenDecimals: number,
  toTokenDecimals: number
) => {
  const { userPosition, userPositionLoading, userPositionError } =
    useReadUserPosition(lendingPoolAddress);
  const {
    data: exchangeRate,
    isLoading: exchangeRateLoading,
    error: exchangeRateError,
    refetch: refetchExchangeRate,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getExchangeRate",
    args: [
      fromTokenAddress,
      toTokenAddress,
      BigInt(amountIn),
      userPosition as `0x${string}`,
    ],
    query: {
      enabled: !!userPosition && !userPositionLoading && !userPositionError && !!fromTokenAddress && !!toTokenAddress,
    },
  });

  // Parse exchange rate - the contract returns amount out in token out decimals
  // We need to convert it to human readable format by dividing by toTokenDecimals
  const parsedExchangeRate = exchangeRate
    ? Number(exchangeRate) / Math.pow(10, toTokenDecimals)
    : 0;

  return {
    exchangeRate: exchangeRate,
    exchangeRateLoading: exchangeRateLoading || userPositionLoading,
    parsedExchangeRate: parsedExchangeRate,
    exchangeRateError: exchangeRateError || userPositionError,
    refetchExchangeRate,
  };
};
