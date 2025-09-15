"use client";

import React, { useState, memo, useCallback } from "react";
import { X, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useSupplyLiquidity } from "@/hooks/write/useSupplyLiquidity";
import { useCurrentChainId } from "@/lib/chain";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { BalanceInputForm } from "@/components/dialog/shared/balance-input-form";
import {
  dialogStyles,
  spacing,
  textStyles,
} from "@/lib/styles/common";
import {
  BUTTON_TEXTS,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/lib/constants";

/**
 * Dialog action types
 */
export type DialogActionType =
  | "supply-liquidity"
  | "supply-collateral"
  | "borrow"
  | "repay"
  | "withdraw-liquidity"
  | "withdraw-collateral";

/**
 * Action configuration for dialog actions
 */
const actionConfig = [
  {
    id: "supply-liquidity" as DialogActionType,
    label: "Supply Liquidity",
    description: "Supply liquidity to the pool",
  },
  {
    id: "supply-collateral" as DialogActionType,
    label: "Supply Collateral",
    description: "Supply collateral to earn interest",
  },
  {
    id: "borrow" as DialogActionType,
    label: "Borrow",
    description: "Borrow against your collateral",
  },
  {
    id: "repay" as DialogActionType,
    label: "Repay",
    description: "Repay borrowed amount",
  },
  {
    id: "withdraw-liquidity" as DialogActionType,
    label: "Withdraw Liquidity",
    description: "Withdraw your liquidity",
  },
  {
    id: "withdraw-collateral" as DialogActionType,
    label: "Withdraw Collateral",
    description: "Withdraw your collateral",
  },
];

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
  const [selectedAction, setSelectedAction] = useState<DialogActionType>("supply-liquidity");


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
    // Approval states
    isApproved,
    isApproving,
    isApproveConfirming,
    isApproveSuccess,
    handleCloseApproveSuccess,
    // Approval alert states
    showApproveSuccessAlert,
    approveTxHash,
    handleCloseApproveSuccessAlert,
  } = useSupplyLiquidity(currentChainId, () => {
    onSuccess?.();
    // Don't auto close - let user close manually
    resetForm();
  });

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setAmount("");
    // Reset success alerts if they're showing
    if (showSuccessAlert) {
      handleCloseSuccessAlert();
    }
    if (showApproveSuccessAlert) {
      handleCloseApproveSuccessAlert();
    }
    // Reset failed alerts if they're showing
    if (showFailedAlert) {
      handleCloseFailedAlert();
    }
  }, [setAmount, showSuccessAlert, handleCloseSuccessAlert, showApproveSuccessAlert, handleCloseApproveSuccessAlert, showFailedAlert, handleCloseFailedAlert]);

  /**
   * Handle action selection
   */
  const handleActionSelect = useCallback((action: DialogActionType) => {
    setSelectedAction(action);
    resetForm(); // Reset all form states when switching actions
  }, [resetForm]);

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

    await handleSupplyLiquidity(
      pool.lendingPool as `0x${string}`,
      amount,
      pool.borrowTokenInfo?.decimals || 18
    );
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
  const handleAmountChange = useCallback((amount: string) => {
    setAmount(amount);
  }, []);

  if (!pool) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={`${dialogStyles.content} ${className || ""}`}>
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
              {/* Action Selection Dropdown */}
              <div className="mb-6">
                <Select value={selectedAction} onValueChange={handleActionSelect}>
                  <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-colors bg-white [&[data-state=open]]:border-orange-400 [&[data-state=open]]:ring-0 [&[data-state=open]]:outline-none">
                    <SelectValue placeholder="Choose an action">
                      {actionConfig.find(action => action.id === selectedAction) && (
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-orange-600">
                            {actionConfig.find(action => action.id === selectedAction)?.label}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-lg focus:outline-none focus-visible:ring-0 focus-visible:outline-none [&[data-state=open]]:border-gray-200 [&[data-state=open]]:ring-0 [&[data-state=open]]:outline-none">
                    {actionConfig.map((action) => (
                      <SelectItem
                        key={action.id}
                        value={action.id}
                        className="hover:bg-orange-50 focus:bg-orange-50 focus:outline-none focus-visible:ring-0 focus-visible:outline-none cursor-pointer"
                      >
                        <div className="flex items-center gap-3 py-2">
                          <div>
                            <div className="font-medium text-orange-600">
                              {action.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pool Information */}
              <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <div className="text-gray-500">Supply Token:</div>
                     <div className="font-semibold text-orange-700">
                       {pool.borrowTokenInfo?.symbol}
                     </div>
                   </div>
                  <div>
                    <div className="text-gray-500">Pool Address:</div>
                    <div className="font-mono text-xs break-all text-orange-700">
                      {pool.lendingPool}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Amount Input */}
              <BalanceInputForm
                pool={pool}
                amount={amount}
                onAmountChange={handleAmountChange}
                tokenType="borrow"
                disabled={isSupplying || isConfirming || isApproving}
              />

              {/* Transaction Status */}
              {(isApproving ||
                isApproveConfirming ||
                isSupplying ||
                isConfirming ||
                isSuccess ||
                isError) && (
                <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl">
                  <div className="space-y-3">
                    {isApproving && (
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
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
                      <div className="flex items-center justify-between gap-3 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold">
                            Token approved successfully!
                          </span>
                        </div>
                        <button
                          onClick={handleCloseApproveSuccess}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {isSupplying && (
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">
                          {LOADING_MESSAGES.SUPPLYING ||
                            "Supplying liquidity..."}
                        </span>
                      </div>
                    )}

                    {isConfirming && (
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold">
                          {LOADING_MESSAGES.CONFIRMING_TRANSACTION ||
                            "Confirming transaction..."}
                        </span>
                      </div>
                    )}

                    {isSuccess && (
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-sm font-semibold">
                          {SUCCESS_MESSAGES.LIQUIDITY_SUPPLIED ||
                            "Liquidity supplied successfully!"}
                        </span>
                      </div>
                    )}

                    {isError && (
                      <div className="flex items-center gap-3 text-red-600">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-sm font-semibold">
                          {ERROR_MESSAGES.TRANSACTION_FAILED ||
                            "Transaction failed"}
                        </span>
                      </div>
                    )}

                    {txHash && (
                      <div className="text-xs text-gray-500 break-all bg-white p-2 rounded border border-orange-200">
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
                    className={`w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white`}
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
                    className={`w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white`}
                  >
                    {isSupplying
                      ? LOADING_MESSAGES.SUPPLYING || "Supplying..."
                      : isConfirming
                      ? LOADING_MESSAGES.CONFIRMING_TRANSACTION ||
                        "Confirming..."
                      : BUTTON_TEXTS.SUPPLY_LIQUIDITY || "Supply Liquidity"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supply Success Alert */}
      <SuccessAlert
        isOpen={showSuccessAlert}
        onClose={handleCloseSuccessAlert}
        title="Transaction Success"
        description="Liquidity supplied successfully!"
        buttonText="Close"
        txHash={successTxHash}
        chainId={currentChainId}
      />

      {/* Approval Success Alert */}
      <SuccessAlert
        isOpen={showApproveSuccessAlert}
        onClose={handleCloseApproveSuccessAlert}
        title="Approval Success"
        description="Token approved successfully! You can now supply liquidity."
        buttonText="Continue"
        txHash={approveTxHash}
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
