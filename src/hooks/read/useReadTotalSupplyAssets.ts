import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { useReadContract } from "wagmi";
import { useEffect } from "react";
import { useCurrentChainId, useCurrentChain } from "@/lib/chain";

export type HexAddress = `0x${string}`;

export const useReadTotalSupplyAssets = (lendingPoolAddress?: HexAddress, decimals: number = 18) => {
  const currentChainId = useCurrentChainId();
  const currentChain = useCurrentChain();
  
  // Use provided address or fallback to chain's lending pool address
  const contractAddress = lendingPoolAddress || currentChain.contracts.lendingPool as HexAddress;
  
  const {
    data: totalSupplyAssets,
    isLoading: totalSupplyAssetsLoading,
    error: totalSupplyAssetsError,
    refetch: refetchTotalSupplyAssets,
  } = useReadContract({
    address: contractAddress,
    abi: lendingPoolAbi,
    functionName: "totalSupplyAssets",
    chainId: currentChainId,
  });


  // Auto-refetch every 3 seconds to keep data fresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTotalSupplyAssets();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchTotalSupplyAssets]);


  return {
    totalSupplyAssets,
    totalSupplyAssetsLoading,
    totalSupplyAssetsError,
    refetchTotalSupplyAssets,
  };
};