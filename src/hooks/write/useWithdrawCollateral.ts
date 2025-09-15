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

  const handleWithdrawCollateral = async (lendingPoolAddress: HexAddress) => {
    if (!address) {
      return;
    }

    const chain = chains.find((c: Chain) => c.id === chainId);
    if (!chain) {
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      setIsWithdrawing(true);
      setTxHash(undefined);

      // Convert amount to BigInt with proper decimal conversion
      const parsedAmount = parseFloat(amount);
      const decimalMultiplier = Math.pow(10, decimals);
      const amountBigInt = BigInt(Math.floor(parsedAmount * decimalMultiplier));

      const tx = await writeContractAsync({
        address: lendingPoolAddress,
        abi: lendingPoolAbi,
        functionName: "withdrawCollateral",
        args: [amountBigInt],
      });

      setTxHash(tx as HexAddress);
    } catch {
      setIsWithdrawing(false);
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