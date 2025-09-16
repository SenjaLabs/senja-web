import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { useMemo } from "react";
import { helperAbi } from "@/lib/abis/helperAbi";
import { helperAddress } from "@/lib/addresses/tokenAddress";
import { parseAmountToBigIntSafe } from "@/utils/format";

export type HexAddress = `0x${string}`;

export const useReadFee = (
  oftAddress: HexAddress,
  destinationEndpoint: number,
  amount: string | bigint,
  decimal: number
) => {
  const { address } = useAccount();

  // Parse amount to bigint with proper decimal handling
  const parsedAmount = useMemo(() => {
    if (typeof amount === "bigint") {
      return amount;
    }
    return parseAmountToBigIntSafe(amount, decimal);
  }, [amount, decimal]);

  const {
    data: fee,
    isLoading: feeLoading,
    error: feeError,
    refetch: refetchFee,
  } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getFee",
    args: [
      oftAddress,
      destinationEndpoint,
      address as HexAddress,
      parsedAmount,
    ],
    query: {
      enabled: !!address && !!oftAddress && parsedAmount > BigInt(0),
    },
  });

  return {
    fee: fee,
    feeLoading: feeLoading,
    feeError: feeError,
    refetchFee,
    parsedAmount,
  };
};
