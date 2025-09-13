"use client";

import React, { useState, memo, useCallback, useEffect } from "react";
import { X, ArrowUpCircle } from "lucide-react";
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
import { useSupplyCollateral } from "@/hooks/write/useSupplyCollateral";
import { useCurrentChainId } from "@/lib/chain";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { dialogStyles, buttonStyles, inputStyles, spacing, textStyles } from "@/lib/styles/common";
import { PLACEHOLDERS, BUTTON_TEXTS, LOADING_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";

/**
 * Props for the SupplyCollateralDialog component
 */
interface SupplyCollateralDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** The selected pool */
  pool: LendingPoolWithTokens | null;
  /** Callback when supply is successful */
  onSuccess?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * SupplyCollateralDialog component for supplying collateral to a lending pool
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const SupplyCollateralDialog = memo(function SupplyCollateralDialog({
  isOpen,
  onClose,
  pool,
  onSuccess,
  className,
}: SupplyCollateralDialogProps) {
  const [amount, setAmount] = useState("");
  const currentChainId = useCurrentChainId();
  
  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setAmount("");
  }, []);

  // Use the supply collateral hook
  const {
    handleApproveToken,
    handleSupplyCollateral,
    isSupplying,
    isConfirming,
    isSuccess,
    isError,
    txHash,
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
    isApproving,
    isApproveConfirming,
    isApproveSuccess,
    isApproveError,
    resetApproveStates,
    resetAfterSuccess,
    resetSuccessStates,
  } = useSupplyCollateral(currentChainId, () => {
    onSuccess?.();
    onClose();
    resetForm();
  });

  // Form validation
  const isValid = amount && parseFloat(amount) > 0;

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error("Write error:", writeError);
    }
  }, [writeError]);

  // Handle confirm errors
  useEffect(() => {
    if (confirmError) {
      console.error("Confirm error:", confirmError);
    }
  }, [confirmError]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !pool) {
      return;
    }

    if (needsApproval && !isApproved) {
      // Handle approval first
      await handleApproveToken(
        pool.collateralTokenInfo?.addresses as `0x${string}`,
        pool.lendingPool as `0x${string}`,
        amount,
        pool.collateralTokenInfo?.decimals || 18
      );
    } else if (isApproved) {
      // Handle supply collateral
      await handleSupplyCollateral(
        pool.lendingPool as `0x${string}`,
        amount,
        pool.collateralTokenInfo?.decimals || 18
      );
    }
  }, [amount, isValid, pool, needsApproval, isApproved, handleApproveToken, handleSupplyCollateral]);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    if (!isSupplying && !isConfirming && !isApproving && !isApproveConfirming) {
      onClose();
      resetForm();
      resetApproveStates();
    }
  }, [isSupplying, isConfirming, isApproving, isApproveConfirming, onClose, resetForm, resetApproveStates]);

  /**
   * Handle amount input change
   */
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }, []);

  if (!pool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${dialogStyles.content} ${className || ''}`}>
        <DialogHeader className={dialogStyles.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
                <ArrowUpCircle className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className={textStyles.heading}>
                Supply Collateral
              </DialogTitle>
            </div>
            <Button
              onClick={handleClose}
              disabled={isSupplying || isConfirming || isApproving || isApproveConfirming}
              className="p-2 hover:bg-orange-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className={spacing.form}>
            {/* Pool Information */}
            <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Collateral Token:</div>
                  <div className="font-semibold text-green-700">{pool.collateralTokenInfo?.symbol}</div>
                </div>
                <div>
                  <div className="text-gray-500">Pool Address:</div>
                  <div className="font-mono text-xs break-all">{pool.lendingPool}</div>
                </div>
              </div>
            </Card>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className={`${textStyles.label} flex items-center gap-2`}>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Amount to Supply
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
                  disabled={isSupplying || isConfirming || isApproving || isApproveConfirming}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {pool.collateralTokenInfo?.symbol}
                </div>
              </div>
            </div>

            {/* Approval Status */}
            {(isApproving || isApproveConfirming || isApproveSuccess || isApproveError) && (
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl mb-4">
                <div className="space-y-3">
                  {isApproving && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold">
                        Approving token...
                      </span>
                    </div>
                  )}

                  {isApproveConfirming && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold">
                        Confirming approval...
                      </span>
                    </div>
                  )}

                  {isApproveSuccess && (
                    <div className="flex items-center gap-3 text-green-600">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-semibold">
                        Token approved successfully!
                      </span>
                    </div>
                  )}

                  {isApproveError && (
                    <div className="flex items-center gap-3 text-red-600">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-semibold">
                        Approval failed
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Transaction Status */}
            {(isSupplying || isConfirming || isSuccess || isError) && (
              <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                <div className="space-y-3">
                  {isSupplying && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold">
                         {LOADING_MESSAGES.SUPPLYING || "Supplying collateral..."}
                       </span>
                    </div>
                  )}

                  {isConfirming && (
                    <div className="flex items-center gap-3 text-orange-600">
                      <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold">
                         {LOADING_MESSAGES.CONFIRMING_TRANSACTION || "Confirming transaction..."}
                       </span>
                    </div>
                  )}

                  {isSuccess && (
                    <div className="flex items-center gap-3 text-green-600">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold">
                         {SUCCESS_MESSAGES.COLLATERAL_SUPPLIED || "Collateral supplied successfully!"}
                       </span>
                    </div>
                  )}

                  {isError && (
                    <div className="flex items-center gap-3 text-red-600">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold">
                         {ERROR_MESSAGES.TRANSACTION_FAILED || "Transaction failed"}
                       </span>
                    </div>
                  )}

                  {txHash && (
                    <div className="text-xs text-gray-500 break-all bg-white p-2 rounded border">
                      <span className="font-medium">Transaction Hash:</span>
                      <br />
                      {txHash}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValid || isSupplying || isConfirming || isApproving || isApproveConfirming}
              className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
            >
              {isApproving
                ? "Approving..."
                : isApproveConfirming
                ? "Confirming Approval..."
                : isSupplying
                ? (LOADING_MESSAGES.SUPPLYING || "Supplying...")
                : isConfirming
                ? (LOADING_MESSAGES.CONFIRMING_TRANSACTION || "Confirming...")
                : needsApproval && !isApproved
                ? "Approve Token"
                : (BUTTON_TEXTS.SUPPLY_COLLATERAL || "Supply Collateral")}
            </Button>
          </form>
        </div>
      </DialogContent>

      {/* Success Alert */}
      {showSuccessAlert && (
        <SuccessAlert
          isOpen={showSuccessAlert}
          onClose={handleCloseSuccessAlert}
          txHash={successTxHash}
          title="Collateral Supplied Successfully!"
          description="Your collateral has been successfully supplied to the pool."
          onButtonClick={() => {
            handleCloseSuccessAlert();
            onSuccess?.();
            onClose();
            resetForm();
          }}
        />
      )}

      {/* Failed Alert */}
      {showFailedAlert && (
        <FailedAlert
          isOpen={showFailedAlert}
          onClose={handleCloseFailedAlert}
          title="Transaction Failed"
          description={errorMessage || "Something went wrong. Please try again."}
          onButtonClick={handleCloseFailedAlert}
        />
      )}
    </Dialog>
  );
});
