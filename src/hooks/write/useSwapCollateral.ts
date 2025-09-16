"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { positionAbi } from "@/lib/abis/positionAbi";
import { chains } from "@/lib/addresses/chainAddress";
import { useApprove } from "./useApprove";
import { useCurrentChainId } from "@/lib/chain";

export type HexAddress = `0x${string}`;

export const useSwapCollateral = (
  chainId: number,
  onSuccess: () => void
) => {
  const { address } = useAccount();
  const currentChainId = useCurrentChainId();
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const [successTxHash, setSuccessTxHash] = useState<HexAddress | undefined>();
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailedAlert, setShowFailedAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [isSwapSuccess, setIsSwapSuccess] = useState(false);
  const [showApproveSuccessAlert, setShowApproveSuccessAlert] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<HexAddress | undefined>();
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);

  const {
    writeContractAsync,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

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
    setIsApproved(true);
    setNeedsApproval(false);
    setApproveTxHash(txHash);
    setShowApproveSuccessAlert(true);
    setShowApproveSuccess(true);
  });

  useEffect(() => {
    if (isSuccess && txHash) {
      setIsSwapping(false);
      setIsSwapSuccess(true);
      setSuccessTxHash(txHash);
      setTxHash(undefined);
      setShowSuccessAlert(true);
      // Don't call onSuccess() automatically - let user close dialog manually
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
        setErrorMessage("");
        setShowFailedAlert(false);
        setIsSwapping(false);
        setTxHash(undefined);
      } else {
        setErrorMessage(`Swap failed: ${writeError.message || "Please check your wallet and try again."}`);
        setShowFailedAlert(true);
        setIsSwapping(false);
        setTxHash(undefined);
      }
    }
  }, [writeError]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setErrorMessage(`Transaction failed: ${confirmError.message || "Please try again."}`);
      setShowFailedAlert(true);
      setIsSwapping(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

  const resetApproveStates = () => {
    setIsApproved(false);
    setNeedsApproval(true);
    setShowApproveSuccessAlert(false);
    setApproveTxHash(undefined);
    setShowApproveSuccess(false);
  };

  const resetAfterSuccess = () => {
    setIsSwapSuccess(false);
    setSuccessTxHash(undefined);
    setShowSuccessAlert(false);
    resetApproveStates();
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    onSuccess();
  };

  const handleCloseFailedAlert = () => {
    setShowFailedAlert(false);
    setErrorMessage("");
  };

  const handleApproveToken = async (
    tokenAddress: HexAddress,
    spenderAddress: HexAddress,
    amount: string,
    decimals: number
  ) => {
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

    await handleApprove(tokenAddress, spenderAddress, amountString, decimals);
  };

  const handleSwapCollateral = async (
    positionAddress: HexAddress,
    tokenInAddress: HexAddress,
    tokenOutAddress: HexAddress,
    amount: string,
    decimals: number,
    slippageTolerance: number = 300 // 3% default slippage in basis points
  ) => {
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
      setIsSwapping(true);
      setTxHash(undefined);
      setErrorMessage("");
      setShowFailedAlert(false);

      // Convert amount to BigInt with proper decimal conversion
      const amountBigInt = BigInt(
        Math.floor(parseFloat(amount) * Math.pow(10, decimals))
      );

      // Convert slippage tolerance to BigInt (in basis points)
      const slippageBigInt = BigInt(slippageTolerance);

      console.log("Swapping collateral:", {
        positionAddress,
        tokenInAddress,
        tokenOutAddress,
        amount: amountBigInt.toString(),
        slippageTolerance: slippageBigInt.toString(),
        user: address,
        chainId,
      });

      const tx = await writeContractAsync({
        address: positionAddress,
        abi: positionAbi,
        functionName: "swapTokenByPosition",
        args: [
          tokenInAddress,
          tokenOutAddress,
          amountBigInt,
          slippageBigInt,
        ],
      });

      setTxHash(tx as HexAddress);
    } catch (error) {
      console.error("Swap collateral failed:", error);
      
      // Check if it's a user rejection
      const errorMessage = error instanceof Error ? error.message : "Please check your wallet and try again.";
      const isUserRejection = errorMessage.includes('User rejected') || 
                             errorMessage.includes('User denied') ||
                             errorMessage.includes('cancelled') ||
                             errorMessage.includes('rejected');
      
      if (isUserRejection) {
        // Silent handling for user rejection
        setIsSwapping(false);
        setTxHash(undefined);
      } else {
        setErrorMessage(`Swap failed: ${errorMessage}`);
        setShowFailedAlert(true);
        setIsSwapping(false);
        setTxHash(undefined);
      }
    }
  };

  return {
    // Token approval functions
    handleApproveToken,
    isApproving: isApprovePending,
    isApproveConfirming,
    isApproveError,
    isApproved,
    needsApproval,
    showApproveSuccessAlert,
    approveTxHash,
    showApproveSuccess,
    resetApproveStates,

    // Swap functions
    handleSwapCollateral,
    isSwapping: isSwapping || isWritePending,
    isConfirming,
    isSuccess: isSwapSuccess,
    isError,
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    resetAfterSuccess,

    // Alert handlers
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
  };
};
