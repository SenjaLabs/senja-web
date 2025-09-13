"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { mockErc20Abi } from "@/lib/abis/mockErc20Abi";
import { chains } from "@/lib/addresses/chainAddress";

export type HexAddress = `0x${string}`;

export const useApprove = (chainId: number, onSuccess?: (txHash?: HexAddress) => void) => {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isApproving, setIsApproving] = useState(false);
  const [isApproveSuccess, setIsApproveSuccess] = useState(false);

  const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && txHash) {
      setIsApproving(false);
      setIsApproveSuccess(true);
      setSuccessTxHash(txHash);
      if (onSuccess) {
        onSuccess(txHash);
      }
      setTxHash(undefined);
    }
  }, [isSuccess, onSuccess, txHash]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setIsApproving(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  const handleApprove = async (tokenAddress: HexAddress, spenderAddress: HexAddress, amount: string, decimals: number) => {
    if (!address) {
      return;
    }

    const chain = chains.find((c) => c.id === chainId);
    if (!chain) {
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      setIsApproving(true);
      setTxHash(undefined);

      // Convert amount to BigInt with proper decimal conversion
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));

      const tx = await writeContractAsync({
        address: tokenAddress,
        abi: mockErc20Abi,
        functionName: "approve",
        args: [spenderAddress, amountBigInt],
      });

      setTxHash(tx as HexAddress);
    } catch (err) {
      setIsApproving(false);
    }
  };

  return {
    handleApprove,
    isApproving: isApproving || isWritePending,
    isConfirming,
    isSuccess: isApproveSuccess,
    isError,
    txHash: txHash || successTxHash,
    writeError,
    confirmError,
  };
};