"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { Chain } from "@/types";

export type HexAddress = `0x${string}`;

export const useWithdrawCollateral = (chainId: number, decimals: number, onSuccess: () => void) => {
  const { address } = useAccount();

  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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
      setIsWithdrawing(false);
      setSuccessTxHash(txHash);
      setShowSuccessAlert(true);
      setTxHash(undefined);
      // Don't call onSuccess automatically - let user close dialog manually
    }
  }, [isSuccess, txHash]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      // Check if it's a user rejection
      const isUserRejection = writeError.message?.includes('User rejected') || 
                             writeError.message?.includes('User denied') ||
                             writeError.message?.includes('cancelled') ||
                             writeError.message?.includes('rejected');
      
      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setIsWithdrawing(false);
        setTxHash(undefined);
      } else {
        // For other errors, you might want to show an error message
        setIsWithdrawing(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setIsWithdrawing(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError, txHash]);

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    onSuccess(); // Call onSuccess when user closes the alert
  };

  const handleWithdrawCollateral = async (lendingPoolAddress: HexAddress, amountParam?: string) => {
    if (!address) {
      return;
    }

    const chain = chains.find((c: Chain) => c.id === chainId);
    if (!chain) {
      return;
    }

    const amountToUse = amountParam || amount;
    if (!amountToUse || parseFloat(amountToUse) <= 0) {
      return;
    }

    try {
      setIsWithdrawing(true);
      setTxHash(undefined);

      // Convert amount to BigInt with proper decimal conversion
      const parsedAmount = parseFloat(amountToUse);
      const decimalMultiplier = Math.pow(10, decimals);
      const amountBigInt = BigInt(Math.floor(parsedAmount * decimalMultiplier));

      const tx = await writeContractAsync({
        address: lendingPoolAddress,
        abi: lendingPoolAbi,
        functionName: "withdrawCollateral",
        args: [amountBigInt],
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      console.error("Transaction failed:", error);
      
      // Check if it's a user rejection
      const errorMessage = error instanceof Error ? error.message : "Please check your wallet and try again.";
      const isUserRejection = errorMessage.includes('User rejected') || 
                             errorMessage.includes('User denied') ||
                             errorMessage.includes('cancelled') ||
                             errorMessage.includes('rejected') ||
                             errorMessage.includes('User rejected the request');
      
      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setIsWithdrawing(false);
        setTxHash(undefined);
      } else {
        // For other errors, you might want to show an error message
        setIsWithdrawing(false);
        setTxHash(undefined);
      }
    }
  };

  return {
    setAmount,
    handleWithdrawCollateral,
    isWithdrawing: isWithdrawing || isWritePending,
    isConfirming,
    isSuccess,
    isError,
    txHash: txHash || successTxHash,
    writeError,
    confirmError,
    showSuccessAlert,
    successTxHash,
    handleCloseSuccessAlert,
  };
};