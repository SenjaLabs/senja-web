"use client";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/lib/addresses/tokenAddress";

export type HexAddress = `0x${string}`;

export const useReadMaxBorrow = (
  lendingPoolAddress: HexAddress,
  decimal: number
) => {
  const { address } = useAccount();
  const {
    data: maxBorrow,
    isLoading: maxBorrowLoading,
    error: maxBorrowError,
    refetch: refetchMaxBorrow,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getMaxBorrowAmount",
    args: [lendingPoolAddress, address as HexAddress],
  });

  // Format max borrow with dynamic decimal places
  const formatMaxBorrow = (rawMaxBorrowData: unknown): string => {
    if (!rawMaxBorrowData || rawMaxBorrowData === undefined)
      return "0.00000";

    try {
      // getMaxBorrowAmount returns bigint
      const maxBorrowBigInt = rawMaxBorrowData as bigint;


      // Convert from raw bigint to decimal number
      const maxBorrowNumber =
        Number(maxBorrowBigInt) / Math.pow(10, decimal);
      
      
      // Use dynamic decimal places based on token decimals
      const decimalPlaces = Math.min(decimal, 6); // Cap at 6 decimal places for display
      const result = maxBorrowNumber.toFixed(decimalPlaces);
      
      return result;
    } catch (error) {
      console.error("Error formatting max borrow:", error);
      return "0.00000";
    }
  };

  const maxBorrowFormatted = formatMaxBorrow(maxBorrow);

  return {
    maxBorrow: maxBorrow as bigint | undefined,
    maxBorrowFormatted,
    maxBorrowLoading: maxBorrowLoading,
    maxBorrowError: maxBorrowError,
    refetchMaxBorrow,
  };
};
