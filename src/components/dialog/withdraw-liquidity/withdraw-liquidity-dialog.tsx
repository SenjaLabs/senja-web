"use client";

import React, { memo, useCallback, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { useWithdrawLiquidity } from "@/hooks/write/useWithdrawLiquidity";
import { useCurrentChainId } from "@/lib/chain";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { dialogStyles, buttonStyles, inputStyles, spacing, textStyles } from "@/lib/styles/common";
import { PLACEHOLDERS, BUTTON_TEXTS, LOADING_MESSAGES } from "@/lib/constants";

/**
 * Withdraw action types
 */
export type WithdrawActionType = "withdraw-liquidity" | "withdraw-collateral";

/**
 * Action configuration for withdraw actions
 */
const withdrawActionConfig = [
  {
    id: "withdraw-liquidity" as WithdrawActionType,
    label: "Withdraw Liquidity",
    description: "Withdraw liquidity shares from the pool",
  },
  {
    id: "withdraw-collateral" as WithdrawActionType,
    label: "Withdraw Collateral",
    description: "Withdraw collateral from the pool",
  },
];

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
  const chainId = useCurrentChainId();
  const [selectedAction, setSelectedAction] = useState<WithdrawActionType>("withdraw-liquidity");
  
  console.log("WithdrawLiquidityDialog Debug:", {
    chainId,
    pool: pool ? {
      lendingPool: pool.lendingPool,
      borrowTokenSymbol: pool.borrowTokenInfo?.symbol,
      collateralTokenSymbol: pool.collateralTokenInfo?.symbol
    } : null
  });
  
  // Get decimals from token info (use borrow token decimals as primary, fallback to collateral token, then 18)
  const decimals = pool?.borrowTokenInfo?.decimals || pool?.collateralTokenInfo?.decimals || 18;
  
  const {
    shares,
    setShares,
    handleWithdrawLiquidity,
    isWithdrawing,
    isConfirming,
    isSuccess,
    error,
    clearError,
    showSuccessAlert,
    successTxHash,
    handleCloseSuccessAlert,
  } = useWithdrawLiquidity(chainId, decimals, onSuccess);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setShares("");
    clearError();
    // Reset success alert if it's showing
    if (showSuccessAlert) {
      handleCloseSuccessAlert();
    }
  }, [setShares, clearError, showSuccessAlert, handleCloseSuccessAlert]);

  /**
   * Handle action selection
   */
  const handleActionSelect = useCallback((action: WithdrawActionType) => {
    setSelectedAction(action);
    resetForm(); // Reset all form states when switching actions
  }, [resetForm]);

  /**
   * Handle close success alert and reset form
   */
  const handleCloseSuccessAlertAndReset = useCallback(() => {
    handleCloseSuccessAlert();
    resetForm();
  }, [handleCloseSuccessAlert, resetForm]);

  // Form validation
  const isValid = shares && parseFloat(shares) > 0;

  // Get current action configuration
  const currentAction = withdrawActionConfig.find(action => action.id === selectedAction);

  // Dynamic content based on selected action
  const getHeaderTitle = () => {
    return currentAction?.label || "Withdraw Liquidity";
  };

  const getAmountLabel = () => {
    switch (selectedAction) {
      case "withdraw-liquidity":
        return "Shares to Withdraw";
      case "withdraw-collateral":
        return "Amount to Withdraw";
      default:
        return "Shares to Withdraw";
    }
  };

  const getTokenInfo = () => {
    if (selectedAction === "withdraw-collateral") {
      return pool?.collateralTokenInfo;
    }
    return pool?.borrowTokenInfo;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !pool) {
      return;
    }

    await handleWithdrawLiquidity(pool.lendingPool as `0x${string}`);
  }, [isValid, pool, handleWithdrawLiquidity]);

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
                {getHeaderTitle()}
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
            {/* Action Selection Dropdown */}
            <div className="mb-6">
              <Select value={selectedAction} onValueChange={handleActionSelect}>
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-colors bg-white [&[data-state=open]]:border-orange-400 [&[data-state=open]]:ring-0 [&[data-state=open]]:outline-none">
                  <SelectValue placeholder="Choose an action">
                    {withdrawActionConfig.find(action => action.id === selectedAction) && (
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-orange-600">
                          {withdrawActionConfig.find(action => action.id === selectedAction)?.label}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {withdrawActionConfig.map((action) => (
                    <SelectItem key={action.id} value={action.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{action.label}</span>
                        <span className="text-sm text-gray-500">{action.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pool Information */}
            <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">
                    {selectedAction === "withdraw-collateral" ? "Collateral Token:" : "Borrow Token:"}
                  </div>
                  <div className="font-semibold text-red-700">
                    {getTokenInfo()?.symbol}
                  </div>
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
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {getAmountLabel()}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={
                    selectedAction === "withdraw-collateral" 
                      ? "Enter amount" 
                      : (PLACEHOLDERS.SHARES_INPUT || "Enter shares amount")
                  }
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  min="0"
                  step="0.000001"
                  className={inputStyles.default}
                  disabled={isWithdrawing || isConfirming}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {selectedAction === "withdraw-collateral" ? getTokenInfo()?.symbol : "Shares"}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {selectedAction === "withdraw-collateral" 
                  ? `Enter the amount of ${getTokenInfo()?.symbol} you want to withdraw`
                  : "Enter the number of liquidity shares you want to withdraw"
                }
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4">
                <FailedAlert
                  isOpen={true}
                  title="Transaction Failed"
                  description={error}
                  onClose={clearError}
                />
              </div>
            )}

            {/* Success Display */}
            <SuccessAlert
              isOpen={showSuccessAlert}
              title="Success!"
              description="Liquidity withdrawn successfully!"
              onClose={handleCloseSuccessAlertAndReset}
              txHash={successTxHash}
              chainId={chainId}
            />

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
                : (selectedAction === "withdraw-collateral" 
                    ? (BUTTON_TEXTS.WITHDRAW_COLLATERAL || "Withdraw Collateral")
                    : (BUTTON_TEXTS.WITHDRAW_LIQUIDITY || "Withdraw Liquidity"))}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
});
