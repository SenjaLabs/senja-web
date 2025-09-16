import { useReadContract } from "wagmi";

import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import { useReadRouterAddress } from "./useReadRouter";

export type HexAddress = `0x${string}`;

export const useReadTotalBorrowShares = (lendingPoolAddress: HexAddress) => {
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: totalBorrowShares,
    isLoading: totalBorrowSharesLoading,
    error: totalBorrowSharesError,
    refetch: refetchTotalBorrowShares,
  } = useReadContract({
    address: routerAddress,
    abi: lendingPoolRouterAbi,
    functionName: "totalBorrowShares",
    args: [],
  });
  console.log("useReadTotalBorrowShares:", {
    lendingPoolAddress,
    routerAddress,
    totalBorrowShares,
    totalBorrowSharesLoading,
    totalBorrowSharesError,
  });

  return {
    totalBorrowShares: totalBorrowShares,
    totalBorrowSharesLoading: totalBorrowSharesLoading,
    totalBorrowSharesError: totalBorrowSharesError,
    refetchTotalBorrowShares,
  };
};
