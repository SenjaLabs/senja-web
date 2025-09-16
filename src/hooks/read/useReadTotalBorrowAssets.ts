import { useReadContract } from "wagmi";

import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import { useReadRouterAddress } from "./useReadRouter";

export type HexAddress = `0x${string}`;

export const useReadTotalBorrowAssets = (lendingPoolAddress: HexAddress) => {
  const { routerAddress } = useReadRouterAddress(lendingPoolAddress);
  const {
    data: totalBorrowAssets,
    isLoading: totalBorrowAssetsLoading,
    error: totalBorrowAssetsError,
    refetch: refetchTotalBorrowAssets,
  } = useReadContract({
    address: routerAddress,
    abi: lendingPoolRouterAbi,
    functionName: "totalBorrowAssets",
    args: [],
  });
  console.log("useReadTotalBorrowAssets:", {
    lendingPoolAddress,
    routerAddress,
    totalBorrowAssets,
    totalBorrowAssetsLoading,
    totalBorrowAssetsError,
  });

  return {
    totalBorrowAssets: totalBorrowAssets,
    totalBorrowAssetsLoading: totalBorrowAssetsLoading,
    totalBorrowAssetsError: totalBorrowAssetsError,
    refetchTotalBorrowAssets,
  };
};
