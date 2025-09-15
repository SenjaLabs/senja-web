"use client";

import React, { useState, memo, useCallback } from "react";
import { X, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useWithdrawCollateral } from "@/hooks/write/useWithdrawCollateral";
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral";
import { useCurrentChainId } from "@/lib/chain";
import { dialogStyles, inputStyles, spacing, textStyles } from "@/lib/styles/common";
import { PLACEHOLDERS, BUTTON_TEXTS, LOADING_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";

/**
 * Props for the WithdrawCollateralDialog component
 */
interface WithdrawCollateralDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** The selected pool */
  pool: LendingPoolWithTokens | null;
  /** Callback when withdraw is successful */
  onSuccess?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * WithdrawCollateralDialog component for withdrawing collateral from a lending pool
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const WithdrawCollateralDialog = memo(function WithdrawCollateralDialog({
  isOpen,
  onClose,
  pool,
  onSuccess,
  className,
}: WithdrawCollateralDialogProps) {
  const chainId = useCurrentChainId();
  
  // Get decimals from collateral token info
  const decimals = pool?.collateralTokenInfo?.decimals || 18;
  
  // Get user collateral balance for display
  const {
    userCollateralFormatted,
    userCollateralLoading,
    userCollateralError,
  } = useReadUserCollateral(
    pool?.lendingPool as `0x${string}` || "0x0000000000000000000000000000000000000000",
    decimals
  );
  
  const {
    amount,
    setAmount,
    handleWithdrawCollateral,
    isWithdrawing,
    isConfirming,
    isSuccess,
    isError,
    txHash,
    error,
    clearError,
    showSuccessAlert,
    successTxHash,
    handleCloseSuccessAlert,
  } = useWithdrawCollateral(chainId, decimals, onSuccess || (() => {}));

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setAmount("");
    clearError();
    // Reset success alert if it's showing
    if (showSuccessAlert) {
      handleCloseSuccessAlert();
    }
  }, [setAmount, clearError, showSuccessAlert, handleCloseSuccessAlert]);

  // Form validation
  const isValid = amount && parseFloat(amount) > 0;

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !pool) {
      return;
    }

    await handleWithdrawCollateral(pool.lendingPool as `0x${string}`, amount);
  }, [isValid, pool, handleWithdrawCollateral, amount]);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    if (!isWithdrawing && !isConfirming) {
      // Call onSuccess if transaction was successful
      if (isSuccess && onSuccess) {
        onSuccess();
      }
      onClose();
      resetForm();
    }
  }, [isWithdrawing, isConfirming, isSuccess, onSuccess, onClose, resetForm]);

  /**
   * Handle amount input change
   */
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }, [setAmount]);

  if (!pool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${dialogStyles.content} ${className || ''}`}>
        <DialogHeader className={dialogStyles.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
                <ArrowDownCircle className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className={textStyles.heading}>
                Withdraw Collateral
              </DialogTitle>
            </div>
            <Button
              onClick={handleClose}
              disabled={isWithdrawing || isConfirming}
              className="p-2 hover:bg-orange-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className={spacing.form}>
            {/* Pool Information */}
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Collateral Token:</div>
                  <div className="font-semibold text-orange-700">{pool.collateralTokenInfo?.symbol}</div>
                </div>
                <div>
                  <div className="text-gray-500">Pool Address:</div>
                  <div className="font-mono text-xs break-all">{pool.lendingPool}</div>
                </div>
              </div>
              {/* User Balance Display */}
              <div className="mt-4 pt-4 border-t border-orange-200">
                <div className="flex justify-between items-center">
                  <div className="text-gray-500 text-sm">Your Collateral Balance:</div>
                  <div className="font-semibold text-orange-700">
                    {userCollateralLoading ? (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : userCollateralError ? (
                      <span className="text-red-500 text-xs">Error loading</span>
                    ) : (
                      `${userCollateralFormatted} ${pool.collateralTokenInfo?.symbol}`
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className={`${textStyles.label} flex items-center gap-2`}>
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Amount to Withdraw
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={PLACEHOLDERS.AMOUNT_INPUT || "Enter amount"}
                  value={amount}
                  onChange={handleAmountChange}
                  min="0"
                  step="0.000001"
                  className={inputStyles.default}
                  disabled={isWithdrawing || isConfirming}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {pool.collateralTokenInfo?.symbol}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="text-red-700">
                    {error}
                  </div>
                </div>
                <button
                  onClick={clearError}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Loading Display */}
            {(isWithdrawing || isConfirming) && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-blue-700">
                    {isWithdrawing ? "Submitting transaction..." : "Confirming transaction..."}
                  </div>
                </div>
              </div>
            )}

            {/* Success Display */}
            {showSuccessAlert && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="text-green-700">
                    Collateral withdrawn successfully!
                  </div>
                </div>
                {successTxHash && (
                  <div className="mt-2 text-xs text-gray-500 break-all bg-white p-2 rounded border">
                    <span className="font-medium">Transaction Hash:</span>
                    <br />
                    {successTxHash}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValid || isWithdrawing || isConfirming}
              className={`w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
            >
              {isWithdrawing
                ? (LOADING_MESSAGES.WITHDRAWING || "Withdrawing...")
                : isConfirming
                ? (LOADING_MESSAGES.CONFIRMING_TRANSACTION || "Confirming...")
                : (BUTTON_TEXTS.WITHDRAW_COLLATERAL || "Withdraw Collateral")}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
});
