"use client";
import { useReadApy } from "@/hooks/read/useReadApy";
import { helperAbi } from "@/lib/abis/helperAbi";
import { lendingPoolRouterAbi } from "@/lib/abis/lendingPoolRouterAbi";
import React from "react";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";

const Page = () => {
  const { address } = useAccount();
  const { data: totalSupplyAssets } = useReadContract({
    address: "0x3De8C22F6b84C575429c1B9cbf5bdDd49cf129fC",
    abi: helperAbi,
    functionName: "getTotalLiquidity",
    args: ["0xc4a40e5c52ad84e0796367282a6cfcac36ffcda9"],
  });
  const { data: router } = useReadContract({
    address: "0x3De8C22F6b84C575429c1B9cbf5bdDd49cf129fC",
    abi: helperAbi,
    functionName: "getTotalLiquidity",
    args: ["0xc4a40e5c52ad84e0796367282a6cfcac36ffcda9"],
  });
  const { data: userSupplyShares } = useReadContract({
    address: "",
    abi: lendingPoolRouterAbi,
    functionName: "userSupplyShares",
    args: [address as `0x${string}`],
  });

  const { apyFormatted } = useReadApy("0x3De8C22F6b84C575429c1B9cbf5bdDd49cf129fC");
  return (
    <div>
      <div>{totalSupplyAssets?.toString() || "0"}</div>
      <div>{userSupplyShares?.toString() || "0"}</div>
      <div>{apyFormatted || "kontol"}</div>
    </div>
  );
};

export default Page;
