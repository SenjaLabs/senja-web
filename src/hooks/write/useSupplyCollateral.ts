"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { lendingPoolAbi } from "@/lib/abis/lendingPoolAbi";
import { mockErc20Abi } from "@/lib/abis/mockErc20Abi";
import { chains } from "@/lib/addresses/chainAddress";
import { useApprove } from "./useApprove";
import { useCurrentChainId } from "@/lib/chain";

export type HexAddress = `0x${string}`;

export const useSupplyCollateral = (chainId: number, onSuccess: () => void) => {
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
    isSuccess: isApproveSuccess,
    isError: isApproveError,
  } = useApprove(currentChainId, (txHash) => {
    setIsApproving(false);
    setIsApproved(true);
    setNeedsApproval(false);
  });

  useEffect(() => {
    if (isSuccess && txHash) {
      setIsSupplying(false);
      setIsSupplySuccess(true);
      setSuccessTxHash(txHash);
      setTxHash(undefined);
      setShowSuccessAlert(true);
      // Don't call onSuccess() automatically - let user close dialog manually
    }
  }, [isSuccess, txHash]);

  // Handle transaction confirmation error
  useEffect(() => {
    if (isError && confirmError) {
      setErrorMessage(
        confirmError.message || "Supply failed to confirm. Please try again."
      );
      setShowFailedAlert(true);
      setIsSupplying(false);
      setTxHash(undefined);
    }
  }, [isError, confirmError]);

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

    setIsApproving(true);
    await handleApprove(tokenAddress, spenderAddress, amountString, decimals);
  };

  const handleSupplyCollateral = async (
    lendingPoolAddress: HexAddress,
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

    if (!isApproved) {
      setErrorMessage("Please approve token first");
      setShowFailedAlert(true);
      return;
    }

    try {
      setIsSupplying(true);
      setTxHash(undefined);

      // Convert amount to BigInt with proper decimal conversion
      const amountBigInt = BigInt(
        Math.floor(parseFloat(amount) * Math.pow(10, decimals))
      );

      const tx = await writeContractAsync({
        address: lendingPoolAddress,
        abi: lendingPoolAbi,
        functionName: "supplyCollateral",
        args: [amountBigInt],
      });

      setTxHash(tx as HexAddress);
    } catch (err) {
      setErrorMessage("Supply failed. Please check your wallet and try again.");
      setShowFailedAlert(true);
      setIsSupplying(false);
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
    setSuccessTxHash(undefined);
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
    handleSupplyCollateral,
    isSupplying: isSupplying || isWritePending,
    isConfirming,
    isSuccess: isSupplySuccess,
    isError,
    txHash: txHash || successTxHash,
    writeError,
    confirmError,
    // Alert states
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
    // Approval states
    needsApproval,
    isApproved,
    isApproving: isApproving || isApprovePending,
    isApproveConfirming,
    isApproveSuccess,
    isApproveError,
    resetApproveStates,
    resetAfterSuccess,
    resetSuccessStates,
  };
};
