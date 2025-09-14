"use client";

import React, { useState, memo, useCallback } from "react";
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
import { useSupplyLiquidity } from "@/hooks/write/useSupplyLiquidity";
import { useCurrentChainId } from "@/lib/chain";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { dialogStyles, buttonStyles, inputStyles, spacing, textStyles } from "@/lib/styles/common";
import { PLACEHOLDERS, BUTTON_TEXTS, LOADING_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";

/**
 * Props for the SupplyLiquidityDialog component
 */
interface SupplyLiquidityDialogProps {
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
 * SupplyLiquidityDialog component for supplying liquidity to a lending pool
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const SupplyLiquidityDialog = memo(function SupplyLiquidityDialog({
  isOpen,
  onClose,
  pool,
  onSuccess,
  className,
}: SupplyLiquidityDialogProps) {
  const currentChainId = useCurrentChainId();
  
  const [amount, setAmount] = useState("");

  const {
    handleApproveToken,
    handleSupplyLiquidity,
    isSupplying,
    isConfirming,
    isSuccess,
    isError,
    txHash,
    showSuccessAlert,
    showFailedAlert,
    errorMessage,
    successTxHash,
    handleCloseSuccessAlert,
    handleCloseFailedAlert,
    isApproved,
    isApproving,
    isApproveConfirming,
    isApproveSuccess,
  } = useSupplyLiquidity(currentChainId, () => {
    onSuccess?.();
    onClose();
    resetForm();
  }); 

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setAmount("");
  }, [setAmount]);

  // Form validation
  const isValid = amount && parseFloat(amount) > 0;

  /**
   * Handle approve token
   */
  const handleApprove = useCallback(async () => {
    if (!isValid || !pool) {
      return;
    }

    await handleApproveToken(
      pool.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`, 
      pool.lendingPool as `0x${string}`, 
      amount,
      pool.borrowTokenInfo?.decimals || 18
    );
  }, [amount, isValid, pool, handleApproveToken, currentChainId]);

  /**
   * Handle supply liquidity
   */
  const handleSupply = useCallback(async () => {
    if (!isValid || !pool) {
      return;
    }

    await handleSupplyLiquidity(pool.lendingPool as `0x${string}`, amount, pool.borrowTokenInfo?.decimals || 18);
  }, [amount, isValid, pool, handleSupplyLiquidity]);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    if (!isSupplying && !isConfirming && !isApproving) {
      onClose();
      resetForm();
    }
  }, [isSupplying, isConfirming, isApproving, onClose, resetForm]);

  /**
   * Handle amount input change
   */
  // eslint-disable-next-line no-undef
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }, []);

  if (!pool) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={`${dialogStyles.content} ${className || ''}`}>
        <DialogHeader className={dialogStyles.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
                <ArrowUpCircle className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className={textStyles.heading}>
                Supply Liquidity
              </DialogTitle>
            </div>
            <Button
              onClick={handleClose}
              disabled={isSupplying || isConfirming || isApproving}
              className="p-2 hover:bg-orange-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          <div className={spacing.form}>
            {/* Pool Information */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Borrow Token:</div>
                  <div className="font-semibold text-blue-700">{pool.borrowTokenInfo?.symbol}</div>
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
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
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
                  disabled={isSupplying || isConfirming || isApproving}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {pool.borrowTokenInfo?.symbol}
                </div>
              </div>
            </div>

            {/* Transaction Status */}
            {(isApproving || isApproveConfirming || isSupplying || isConfirming || isSuccess || isError) && (
              <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
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
                    <div className="flex items-center gap-3 text-orange-600">
                      <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
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

                  {isSupplying && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold">
                         {LOADING_MESSAGES.SUPPLYING || "Supplying liquidity..."}
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
                         {SUCCESS_MESSAGES.LIQUIDITY_SUPPLIED || "Liquidity supplied successfully!"}
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

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Approve Button */}
              {!isApproved && (
                <Button
                  type="button"
                  onClick={handleApprove}
                  disabled={!isValid || isApproving || isApproveConfirming}
                  className={`w-full h-14 text-lg font-bold bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
                >
                  {isApproving
                    ? "Approving..."
                    : isApproveConfirming
                    ? "Confirming Approval..."
                    : "Approve Token"}
                </Button>
              )}

              {/* Supply Button */}
              {isApproved && (
                <Button
                  type="button"
                  onClick={handleSupply}
                  disabled={!isValid || isSupplying || isConfirming}
                  className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
                >
                  {isSupplying
                    ? (LOADING_MESSAGES.SUPPLYING || "Supplying...")
                    : isConfirming
                    ? (LOADING_MESSAGES.CONFIRMING_TRANSACTION || "Confirming...")
                    : (BUTTON_TEXTS.SUPPLY_LIQUIDITY || "Supply Liquidity")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Success Alert */}
    <SuccessAlert
      isOpen={showSuccessAlert}
      onClose={handleCloseSuccessAlert}
      title="Transaction Success"
      description="Liquidity supplied successfully!"
      buttonText="Close"
      txHash={successTxHash}
      chainId={currentChainId}
    />

    {/* Failed Alert */}
    <FailedAlert
      isOpen={showFailedAlert}
      onClose={handleCloseFailedAlert}
      title="Transaction Failed"
      description={errorMessage}
      buttonText="Close"
    />
  </>
  );
});
