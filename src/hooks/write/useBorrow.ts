"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { Chain } from "@/types";

export type HexAddress = `0x${string}`;

export const useBorrow = (chainId: number, decimals: number, onSuccess: () => void) => {
  const { address } = useAccount();