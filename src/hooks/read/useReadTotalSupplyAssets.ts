import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { useReadContract } from "wagmi";
import { useCurrentChainId, useCurrentChain } from "@/lib/chain";
import { formatUnits } from "viem";
import { useState, useEffect } from "react";

export type HexAddress = `0x${string}`;

export const useReadTotalSupplyAssets = (lendingPoolAddress?: HexAddress, decimals: number = 18) => {
  const currentChainId = useCurrentChainId();
  const currentChain = useCurrentChain();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Use provided address or fallback to chain's lending pool address
  const contractAddress = lendingPoolAddress || currentChain.contracts.lendingPool as HexAddress;
  
  // Check if we have a valid contract address
  const hasValidAddress = contractAddress && 
    contractAddress !== "0x0000000000000000000000000000000000000000" &&
    contractAddress.length > 2;
  
  
  const {
    data: totalSupplyAssets,
    isLoading: totalSupplyAssetsLoading,
    error: totalSupplyAssetsError,
    refetch: refetchTotalSupplyAssets,
  } = useReadContract({
    address: hasValidAddress ? contractAddress : undefined,
    abi: lendingPoolAbi,
    functionName: "totalSupplyAssets",
    chainId: currentChainId,
    query: {
      enabled: hasValidAddress, // Only run query if we have a valid address
    }
  });

  // Timeout mechanism - stop loading after 3 seconds
  useEffect(() => {
    if (!hasValidAddress) {
      setTimeoutReached(false);
      return;
    }

    const timer = window.setTimeout(() => {
      if (totalSupplyAssetsLoading) {
        setTimeoutReached(true);
      }
    }, 3000); // 3 seconds timeout

    return () => window.clearTimeout(timer);
  }, [hasValidAddress, totalSupplyAssetsLoading]);

  // Reset timeout when data is received
  useEffect(() => {
    if (totalSupplyAssets !== undefined) {
      setTimeoutReached(false);
    }
  }, [totalSupplyAssets]);




  // Parse total supply assets with dynamic decimals
  const totalSupplyAssetsParsed = totalSupplyAssets 
    ? Number(formatUnits(totalSupplyAssets, decimals))
    : 0;

  // Determine final values based on timeout and loading state
  const finalLoading = hasValidAddress && totalSupplyAssetsLoading && !timeoutReached;
  const finalData = timeoutReached ? BigInt(0) : (hasValidAddress ? totalSupplyAssets : BigInt(0));
  const finalParsed = timeoutReached ? 0 : (hasValidAddress ? totalSupplyAssetsParsed : 0);

  return {
    totalSupplyAssets: finalData,
    totalSupplyAssetsParsed: finalParsed,
    totalSupplyAssetsLoading: finalLoading,
    totalSupplyAssetsError: hasValidAddress ? totalSupplyAssetsError : null,
    refetchTotalSupplyAssets,
  };
};