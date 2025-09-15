"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { useApprove } from "./useApprove";
import { useCurrentChainId } from "@/lib/chain";

export type HexAddress = `0x${string}`;

export const useSupplyLiquidity = (chainId: number, onSuccess: () => void) => {
  const { address } = useAccount();
  const currentChainId = useCurrentChainId();
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isSupplying, setIsSupplying] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailedAlert, setShowFailedAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isSupplySuccess, setIsSupplySuccess] = useState(false);
  const [showApproveSuccessAlert, setShowApproveSuccessAlert] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<HexAddress | undefined>();
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);

  const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // Use approve hook
  const {
    handleApprove,
    isApproving: isApprovePending,
    isConfirming: isApproveConfirming,
    isError: isApproveError,
  } = useApprove(currentChainId, (txHash) => {
    setIsApproving(false);
    setIsApproved(true);
    setNeedsApproval(false);
    setApproveTxHash(txHash);
    setShowApproveSuccessAlert(true);
    setShowApproveSuccess(true);
  });

  useEffect(() => {
    if (isSuccess && txHash) {
      setIsSupplying(false);
      setIsSupplySuccess(true);
      setSuccessTxHash(txHash);
      setTxHash(undefined);
      setShowSuccessAlert(true);
      onSuccess();
    }
  }, [isSuccess, txHash, onSuccess]);

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
        setErrorMessage("");
        setShowFailedAlert(false);
        setIsSupplying(false);
        setTxHash(undefined);
      } else {
        setErrorMessage(`Supply failed: ${writeError.message || "Please check your wallet and try again."}`);
        setShowFailedAlert(true);
        setIsSupplying(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setErrorMessage(confirmError.message || "Supply failed to confirm. Please try again.");
      setShowFailedAlert(true);
      setIsSupplying(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  const handleApproveToken = async (tokenAddress: HexAddress, spenderAddress: HexAddress, amount: string, decimals: number) => {
    if (!address) {
      setErrorMessage("Please connect your wallet");
      setShowFailedAlert(true);
      return;
    }

    const chain = chains.find((c) => c.id === chainId);
    if (!chain) {
      setErrorMessage("Unsupported chain");
      setShowFailedAlert(true);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      setShowFailedAlert(true);
      return;
    }

    // Add 10% buffer to the amount for approval
    const amountWithBuffer = parseFloat(amount) * 1.1;
    const amountString = amountWithBuffer.toString();

    setIsApproving(true);
    await handleApprove(tokenAddress, spenderAddress, amountString, decimals);
  };

  const handleSupplyLiquidity = async (lendingPoolAddress: HexAddress, amount: string, decimals: number) => {
    if (!address) {
      setErrorMessage("Please connect your wallet");
      setShowFailedAlert(true);
      return;
    }

    const chain = chains.find((c) => c.id === chainId);
    if (!chain) {
      setErrorMessage("Unsupported chain");
      setShowFailedAlert(true);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      setShowFailedAlert(true);
      return;
    }

    if (!isApproved) {
      setErrorMessage("Please approve token first");
      setShowFailedAlert(true);
      return;
    }

    try {
      setIsSupplying(true);
      setTxHash(undefined);

      // Convert amount to BigInt with proper decimal conversion
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));

      console.log("Supply attempt:", {
        lendingPoolAddress,
        amount,
        amountBigInt: amountBigInt.toString(),
        decimals,
        isApproved,
        address
      });

      const tx = await writeContractAsync({
        address: lendingPoolAddress,
        abi: lendingPoolAbi,
        functionName: "supplyLiquidity",
        args: [address, amountBigInt],
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      console.error("Supply error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Check if it's a user rejection first
      const isUserRejection = errorMessage.includes('User rejected') || 
                             errorMessage.includes('User denied') ||
                             errorMessage.includes('cancelled') ||
                             errorMessage.includes('rejected') ||
                             errorMessage.includes('user rejected') ||
                             errorMessage.includes('User rejected the request');
      
      if (isUserRejection) {
        // Don't show error for user rejection, just reset state
        setErrorMessage("");
        setShowFailedAlert(false);
        setIsSupplying(false);
        setTxHash(undefined);
      } else {
        // Provide more specific error messages for other errors
        if (errorMessage.includes("insufficient")) {
          setErrorMessage("Insufficient balance. Please check your token balance.");
        } else if (errorMessage.includes("allowance")) {
          setErrorMessage("Insufficient allowance. Please approve more tokens.");
        } else if (errorMessage.includes("network")) {
          setErrorMessage("Network error. Please check your connection.");
        } else {
          setErrorMessage(`Supply failed: ${errorMessage}`);
        }
        setShowFailedAlert(true);
        setIsSupplying(false);
        setTxHash(undefined);
      }
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
  };

  const handleCloseApproveSuccessAlert = () => {
    setShowApproveSuccessAlert(false);
    setApproveTxHash(undefined);
  };

  const handleCloseApproveSuccess = () => {
    setShowApproveSuccess(false);
  };

  const handleCloseFailedAlert = () => {
    setShowFailedAlert(false);
    setErrorMessage("");
  };

  const resetApproveStates = () => {
    setIsApproving(false);
    setIsApproved(false);
    setNeedsApproval(true);
    setIsSupplySuccess(false);
    setShowApproveSuccessAlert(false);
    setApproveTxHash(undefined);
    setShowApproveSuccess(false);
  };

  const resetAfterSuccess = () => {
    setIsApproving(false);
    setIsApproved(false);
    setNeedsApproval(true);
    setIsSupplying(false);
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
    // Keep isSupplySuccess true to show success notification
  };

  const resetSuccessStates = () => {
    setIsSupplySuccess(false);
  };


  return {
    handleApproveToken,
    handleSupplyLiquidity,
    isSupplying: isSupplying || isWritePending,
    isConfirming,
    isSuccess: isSupplySuccess,
    isError,
    txHash: successTxHash, // Only return supply tx hash, not approve tx hash
    writeError,
    confirmError,
    // Alert states
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
    // Approval alert states
    showApproveSuccessAlert,
    approveTxHash,
    handleCloseApproveSuccessAlert,
    // Approval states
    needsApproval,
    isApproved,
    isApproving: isApproving || isApprovePending,
    isApproveConfirming,
    isApproveSuccess: showApproveSuccess,
    isApproveError,
    handleCloseApproveSuccess,
    resetApproveStates,
    resetAfterSuccess,
    resetSuccessStates,
  };
};