"use client";
import { helperAbi } from "@/lib/abis/helperAbi";
import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import { positionAbi } from "@/lib/abis/positionAbi";
import { helperAddress } from "@/lib/addresses/tokenAddress";
import React from "react";
import { useReadContract, useWriteContract } from "wagmi";

const Page = () => {
  const { writeContractAsync } = useWriteContract();

  const handleSwap = async () => {
    try {
      await writeContractAsync({
        address: "0x9d28ab6a129a2253761015A9aBCd1D38C5Ed3AF5",
        abi: positionAbi,
        functionName: "swapTokenByPosition",
        args: [
          "0x684a2aAF3d98bC8eD2c07988E8da9023026aD511",
          "0xCEb5c8903060197e46Ab5ea5087b9F99CBc8da49",
          BigInt("10000000000000000000"),
          BigInt("9999"),
        ],
      });
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const { data: matrix } = useReadContract({
    address: helperAddress,
    abi: helperAbi,
    functionName: "getLendingPoolMetrics",
    args: ["0xc4a40e5c52ad84e0796367282a6cfcac36ffcda9"],
  });
  const { data: totalBorrowShares } = useReadContract({
    address: "0x3881F4B841160956B4e14aBfdc5e7c3403BA315F",
    abi: lendingPoolRouterAbi,
    functionName: "totalBorrowShares",
  });
  const { data: totalBorrowAssets } = useReadContract({
    address: "0x3881F4B841160956B4e14aBfdc5e7c3403BA315F",
    abi: lendingPoolRouterAbi,
    functionName: "totalBorrowAssets",
  });

  console.log("matrix ", matrix);
  console.log("totalBorrowShares ", totalBorrowShares);
  console.log("totalBorrowAssets ", totalBorrowAssets);
  return (
    <div>
      <button onClick={handleSwap}>Execute Swap</button>
    </div>
  );
};

export default Page;

// 9999
// 0x3881F4B841160956B4e14aBfdc5e7c3403BA315F router
// 0x9d28ab6a129a2253761015A9aBCd1D38C5Ed3AF5 user position
