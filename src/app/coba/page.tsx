"use client";
import { helperAbi } from "@/lib/abis/helperAbi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import React from "react";
import { useWriteContract, useReadContract } from "wagmi";

export type HexAddress = `0x${string}`;
const Page = () => {
  const { writeContractAsync } = useWriteContract();
  const { data: collateralBalance } = useReadContract({
    address: "0x3De8C22F6b84C575429c1B9cbf5bdDd49cf129fC" as HexAddress,
    abi: helperAbi,
    functionName: "getCollateralBalance",
    args: [
      "0xc4a40e5c52ad84e0796367282a6cfcac36ffcda9" as HexAddress,
      "0x6d9dae901fba6d51a37c57b1619dff67a6e39eb3" as HexAddress,
    ],
  });

  const { data: feeTransaction } = useReadContract({
    address: "0x3De8C22F6b84C575429c1B9cbf5bdDd49cf129fC" as HexAddress,
    abi: helperAbi,
    functionName: "getFee",
    args: [
      "0xcdEc0D768e43090a9eeC47d87d8165E9FA78B204" as HexAddress,
      Number(30184),
      "0x6d9dae901fba6d51a37c57b1619dff67a6e39eb3" as HexAddress,
      BigInt(10000),
    ],
  });
  const handleBorrow = async () => {
    try {
      const result = await writeContractAsync({
        address: "0xc4a40e5c52ad84e0796367282a6cfcac36ffcda9" as HexAddress,
        abi: lendingPoolAbi,
        functionName: "borrowDebt",
        args: [BigInt(10000), BigInt(8453), Number(30184), BigInt(65000)],
        value: BigInt("362619960044527024"),
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={handleBorrow}>Borrow</button>
      <div>
        Collateral Balance: {Number(collateralBalance) / 10 ** 18} WKAIA{" "}
      </div>
      <div>Fee Transaction: {feeTransaction} </div>
    </div>
  );
};

export default Page;
