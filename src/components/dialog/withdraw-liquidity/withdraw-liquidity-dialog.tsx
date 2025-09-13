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
// import { useWithdrawLiquidity } from "@/hooks/write/useWithdrawLiquidity";
// import { useCurrentChainId } from "@/lib/chain/use-chain";
import { dialogStyles, buttonStyles, inputStyles, spacing, textStyles } from "@/lib/styles/common";
import { PLACEHOLDERS, BUTTON_TEXTS, LOADING_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";

/**
 * Props for the WithdrawLiquidityDialog component
 */
interface WithdrawLiquidityDialogProps {
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
 * WithdrawLiquidityDialog component for withdrawing liquidity from a lending pool
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const WithdrawLiquidityDialog = memo(function WithdrawLiquidityDialog({
  isOpen,
  onClose,
  pool,
  onSuccess,
  className,
}: WithdrawLiquidityDialogProps) {
  const [shares, setShares] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setShares("");
    setIsWithdrawing(false);
    setIsConfirming(false);
    setIsSuccess(false);
    setIsError(false);
    setTxHash("");
  }, []);

  // Form validation
  const isValid = shares && parseFloat(shares) > 0;

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !pool) {
      return;
    }

    // Simulate transaction process
    setIsWithdrawing(true);
    setTxHash("0x1234567890abcdef1234567890abcdef12345678");
    
    setTimeout(() => {
      setIsWithdrawing(false);
      setIsConfirming(true);
      
      setTimeout(() => {
        setIsConfirming(false);
        setIsSuccess(true);
        onSuccess?.();
        onClose();
        resetForm();
      }, 2000);
    }, 2000);
  }, [shares, isValid, pool, onSuccess, onClose, resetForm]);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    if (!isWithdrawing && !isConfirming) {
      onClose();
      resetForm();
    }
  }, [isWithdrawing, isConfirming, onClose, resetForm]);

  /**
   * Handle shares input change
   */
  const handleSharesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setShares(e.target.value);
  }, []);

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
                Withdraw Liquidity
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
            <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Borrow Token:</div>
                  <div className="font-semibold text-red-700">{pool.borrowTokenInfo?.symbol}</div>
                </div>
                <div>
                  <div className="text-gray-500">Pool Address:</div>
                  <div className="font-mono text-xs break-all">{pool.lendingPool}</div>
                </div>
              </div>
            </Card>

            {/* Shares Input */}
            <div className="space-y-3">
              <label className={`${textStyles.label} flex items-center gap-2`}>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Shares to Withdraw
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={PLACEHOLDERS.SHARES_INPUT || "Enter shares amount"}
                  value={shares}
                  onChange={handleSharesChange}
                  min="0"
                  step="0.000001"
                  className={inputStyles.default}
                  disabled={isWithdrawing || isConfirming}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  Shares
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Enter the number of liquidity shares you want to withdraw
              </div>
            </div>

            {/* Transaction Status */}
            {(isWithdrawing || isConfirming || isSuccess || isError) && (
              <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                <div className="space-y-3">
                  {isWithdrawing && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold">
                         {LOADING_MESSAGES.WITHDRAWING || "Withdrawing liquidity..."}
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
                         {SUCCESS_MESSAGES.LIQUIDITY_WITHDRAWN || "Liquidity withdrawn successfully!"}
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
              disabled={!isValid || isWithdrawing || isConfirming}
              className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
            >
              {isWithdrawing
                ? (LOADING_MESSAGES.WITHDRAWING || "Withdrawing...")
                : isConfirming
                ? (LOADING_MESSAGES.CONFIRMING_TRANSACTION || "Confirming...")
                : (BUTTON_TEXTS.WITHDRAW_LIQUIDITY || "Withdraw Liquidity")}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
});
