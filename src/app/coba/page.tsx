"use client";
import { positionAbi } from "@/lib/abis/positionAbi";
import React from "react";
import { useWriteContract } from "wagmi";

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
