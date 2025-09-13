"use client";

import React, { useState, memo, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useSupplyCollateral } from "@/hooks/write/useSupplyCollateral";
import { useCurrentChainId } from "@/lib/chain";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import {
  dialogStyles,
  buttonStyles,
  inputStyles,
  spacing,
  textStyles,
} from "@/lib/styles/common";
import { PLACEHOLDERS, BUTTON_TEXTS, LOADING_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";
import Image from "next/image";

// Utility function to format LTV percentage
const formatLTV = (ltv: bigint | number | string): string => {
  const ltvNumber = typeof ltv === "bigint" ? Number(ltv) : Number(ltv);
  const percentage = ltvNumber / 1e16;
  return percentage.toFixed(1);
};

/**
 * Pool action types
 */
export type PoolActionType =
  | "supply-collateral"
  | "supply-liquidity"
  | "borrow"
  | "repay"
  | "repay-by-collateral"
  | "withdraw-collateral"
  | "withdraw-liquidity";

/**
 * Props for the PoolActionsDialog component
 */
interface PoolActionsDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** The selected pool */
  pool: LendingPoolWithTokens | null;
  /** Callback when action is selected */
  onActionSelect?: (action: PoolActionType) => void;
  /** Custom className */
  className?: string;
}

/**
 * Action configuration for pool actions
 */
const actionConfig = [
  {
    id: "supply-collateral" as PoolActionType,
    label: "Supply Collateral",
    description: "Supply collateral to earn interest",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "supply-liquidity" as PoolActionType,
    label: "Supply Liquidity",
    description: "Supply liquidity to the pool",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "borrow" as PoolActionType,
    label: "Borrow",
    description: "Borrow against your collateral",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "repay" as PoolActionType,
    label: "Repay",
    description: "Repay borrowed amount",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    id: "repay-by-collateral" as PoolActionType,
    label: "Repay by Collateral",
    description: "Repay using collateral",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  {
    id: "withdraw-collateral" as PoolActionType,
    label: "Withdraw Collateral",
    description: "Withdraw your collateral",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    id: "withdraw-liquidity" as PoolActionType,
    label: "Withdraw Liquidity",
    description: "Withdraw your liquidity",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

/**
 * PoolActionsDialog component for managing pool actions
 *
 * @param props - Component props
 * @returns JSX element
 */
export const PoolActionsDialog = memo(function PoolActionsDialog({
  isOpen,
  onClose,
  pool,
  onActionSelect,
  className,
}: PoolActionsDialogProps) {
  const [selectedAction, setSelectedAction] =
    useState<PoolActionType>("supply-liquidity");
  const [amount, setAmount] = useState("");
  const currentChainId = useCurrentChainId();

  // Supply Liquidity Hook
  const {
    handleApproveToken: handleApproveTokenLiquidity,
    handleSupplyLiquidity,
    isSupplying: isSupplyingLiquidity,
    isConfirming: isConfirmingLiquidity,
    isSuccess: isSuccessLiquidity,
    isError: isErrorLiquidity,
    txHash: txHashLiquidity,
    writeError: writeErrorLiquidity,
    confirmError: confirmErrorLiquidity,
    showSuccessAlert: showSuccessAlertLiquidity,
    showFailedAlert: showFailedAlertLiquidity,
    errorMessage: errorMessageLiquidity,
    successTxHash: successTxHashLiquidity,
    handleCloseSuccessAlert: handleCloseSuccessAlertLiquidity,
    handleCloseFailedAlert: handleCloseFailedAlertLiquidity,
    needsApproval: needsApprovalLiquidity,
    isApproved: isApprovedLiquidity,
    isApproving: isApprovingLiquidity,
    isApproveConfirming: isApproveConfirmingLiquidity,
    isApproveSuccess: isApproveSuccessLiquidity,
    isApproveError: isApproveErrorLiquidity,
    resetApproveStates: resetApproveStatesLiquidity,
    resetAfterSuccess: resetAfterSuccessLiquidity,
    resetSuccessStates: resetSuccessStatesLiquidity,
  } = useSupplyLiquidity(currentChainId, () => {
    onClose();
    resetForm();
  });

  // Supply Collateral Hook
  const {
    handleApproveToken: handleApproveTokenCollateral,
    handleSupplyCollateral,
    isSupplying: isSupplyingCollateral,
    isConfirming: isConfirmingCollateral,
    isSuccess: isSuccessCollateral,
    isError: isErrorCollateral,
    txHash: txHashCollateral,
    writeError: writeErrorCollateral,
    confirmError: confirmErrorCollateral,
    showSuccessAlert: showSuccessAlertCollateral,
    showFailedAlert: showFailedAlertCollateral,
    errorMessage: errorMessageCollateral,
    successTxHash: successTxHashCollateral,
    handleCloseSuccessAlert: handleCloseSuccessAlertCollateral,
    handleCloseFailedAlert: handleCloseFailedAlertCollateral,
    needsApproval: needsApprovalCollateral,
    isApproved: isApprovedCollateral,
    isApproving: isApprovingCollateral,
    isApproveConfirming: isApproveConfirmingCollateral,
    isApproveSuccess: isApproveSuccessCollateral,
    isApproveError: isApproveErrorCollateral,
    resetApproveStates: resetApproveStatesCollateral,
    resetAfterSuccess: resetAfterSuccessCollateral,
    resetSuccessStates: resetSuccessStatesCollateral,
  } = useSupplyCollateral(currentChainId, () => {
    onClose();
    resetForm();
  });

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setAmount("");
    resetApproveStatesLiquidity();
    resetSuccessStatesLiquidity();
    resetApproveStatesCollateral();
    resetSuccessStatesCollateral();
  }, [resetApproveStatesLiquidity, resetSuccessStatesLiquidity, resetApproveStatesCollateral, resetSuccessStatesCollateral]);

  const handleCloseSuccessAlertAndReset = useCallback(() => {
    if (selectedAction === "supply-liquidity") {
      handleCloseSuccessAlertLiquidity();
      resetAfterSuccessLiquidity();
    } else if (selectedAction === "supply-collateral") {
      handleCloseSuccessAlertCollateral();
      resetAfterSuccessCollateral();
    }
    setAmount("");
  }, [selectedAction, handleCloseSuccessAlertLiquidity, resetAfterSuccessLiquidity, handleCloseSuccessAlertCollateral, resetAfterSuccessCollateral]);

  /**
   * Handle action selection
   */
  const handleActionSelect = useCallback(
    (action: PoolActionType) => {
      setSelectedAction(action);
      onActionSelect?.(action);
    },
    [onActionSelect]
  );

  /**
   * Handle approve token
   */
  const handleApprove = useCallback(async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (selectedAction === "supply-liquidity") {
      // Reset success states when starting new approve
      resetSuccessStatesLiquidity();

      const decimals = pool.borrowTokenInfo?.decimals || 18;

      await handleApproveTokenLiquidity(
        pool.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`, 
        pool.lendingPool as `0x${string}`, 
        amount,
        decimals
      );
    } else if (selectedAction === "supply-collateral") {
      // Reset success states when starting new approve
      resetSuccessStatesCollateral();

      const decimals = pool.collateralTokenInfo?.decimals || 18;

      await handleApproveTokenCollateral(
        pool.collateralTokenInfo?.addresses[currentChainId] as `0x${string}`, 
        pool.lendingPool as `0x${string}`, 
        amount,
        decimals
      );
    }
  }, [amount, pool, selectedAction, handleApproveTokenLiquidity, handleApproveTokenCollateral, currentChainId, resetSuccessStatesLiquidity, resetSuccessStatesCollateral]);

  /**
   * Handle supply (liquidity or collateral)
   */
  const handleSupply = useCallback(async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (selectedAction === "supply-liquidity") {
      const decimals = pool.borrowTokenInfo?.decimals || 18;
      await handleSupplyLiquidity(pool.lendingPool as `0x${string}`, amount, decimals);
    } else if (selectedAction === "supply-collateral") {
      const decimals = pool.collateralTokenInfo?.decimals || 18;
      await handleSupplyCollateral(pool.lendingPool as `0x${string}`, amount, decimals);
    }
  }, [amount, pool, selectedAction, handleSupplyLiquidity, handleSupplyCollateral]);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    // Don't close dialog if transactions are in progress
    const isAnyTransactionInProgress = 
      isSupplyingLiquidity || isConfirmingLiquidity || isApprovingLiquidity || isApproveConfirmingLiquidity ||
      isSupplyingCollateral || isConfirmingCollateral || isApprovingCollateral || isApproveConfirmingCollateral;
    
    if (isAnyTransactionInProgress) {
      return;
    }
    onClose();
    setSelectedAction("supply-liquidity"); // Reset to default
    resetForm();
  }, [onClose, isSupplyingLiquidity, isConfirmingLiquidity, isApprovingLiquidity, isApproveConfirmingLiquidity, isSupplyingCollateral, isConfirmingCollateral, isApprovingCollateral, isApproveConfirmingCollateral, resetForm]);

  /**
   * Get current action config
   */
  const currentAction = actionConfig.find(
    (action) => action.id === selectedAction
  );

  if (!pool) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className={`${dialogStyles.content} max-w-2xl ${className || ""}`}
        >
        <DialogHeader className={dialogStyles.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-sm text-gray-600 mt-1 flex items-center">
                  <Image
                    src={pool.collateralTokenInfo?.logo || ""}
                    alt={pool.collateralTokenInfo?.symbol || ""}
                    width={24}
                    height={24}
                  />
                  <Image
                    src={pool.borrowTokenInfo?.logo || ""}
                    alt={pool.borrowTokenInfo?.symbol || ""}
                    width={24}
                    height={24}
                  />
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {pool.collateralTokenInfo?.symbol} /{" "}
                  {pool.borrowTokenInfo?.symbol}
                </DialogDescription>
              </div>
            </div>
            <Button
              onClick={handleClose}
              disabled={isSupplyingLiquidity || isConfirmingLiquidity || isApprovingLiquidity || isApproveConfirmingLiquidity || isSupplyingCollateral || isConfirmingCollateral || isApprovingCollateral || isApproveConfirmingCollateral}
              className="p-2 hover:bg-orange-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          {/* Action Selection Dropdown */}
          <div className="mb-6">
            <Select value={selectedAction} onValueChange={handleActionSelect}>
              <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-orange-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-colors bg-white [&[data-state=open]]:border-orange-400 [&[data-state=open]]:ring-0 [&[data-state=open]]:outline-none">
                <SelectValue placeholder="Choose an action">
                  {currentAction && (
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{currentAction.label}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-lg focus:outline-none focus-visible:ring-0 focus-visible:outline-none [&[data-state=open]]:border-gray-200 [&[data-state=open]]:ring-0 [&[data-state=open]]:outline-none">
                {actionConfig.map((action) => (
                  <SelectItem
                    key={action.id}
                    value={action.id}
                    className="hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:ring-0 focus-visible:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3 py-2">
                      <div>
                        <div className={`font-medium ${action.color}`}>
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

          {/* Action Content - Render form based on selection */}
          <Card
            className={`p-6 ${currentAction?.bgColor} ${currentAction?.borderColor} border-2`}
          >
            <div className="flex items-center gap-3 mb-4">
              {currentAction && (
                <div>
                  <h3 className={`font-bold text-lg ${currentAction.color}`}>
                    {currentAction.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentAction.description}
                  </p>
                </div>
              )}
            </div>

            {/* Pool Information */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 font-medium">
                    Collateral Token:
                  </div>
                  <div className="font-semibold text-gray-900">
                    {pool.collateralTokenInfo?.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">
                    Borrow Token:
                  </div>
                  <div className="font-semibold text-gray-900">
                    {pool.borrowTokenInfo?.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">APY:</div>
                  <div className="font-semibold text-gray-900">5%</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium">LTV:</div>
                  <div className="font-semibold text-gray-900">
                    {formatLTV(pool.ltv)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Action-specific form */}
            <div className="space-y-4">
              <div className="space-y-3">
                <label
                  className={`${textStyles.label} flex items-center gap-2`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${currentAction?.color
                      .replace("text-", "bg-")
                      .replace("-600", "-500")}`}
                  ></span>
                  {selectedAction === "withdraw-liquidity"
                    ? "Shares to Withdraw"
                    : "Amount to Supply"}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={
                      selectedAction === "withdraw-liquidity"
                        ? "Enter shares amount"
                        : "Enter amount"
                    }
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.000001"
                    className="w-full h-12 px-4 pr-16 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:border-orange-400 bg-white text-gray-900 placeholder-gray-500"
                    disabled={isSupplyingLiquidity || isConfirmingLiquidity || isApprovingLiquidity || isSupplyingCollateral || isConfirmingCollateral || isApprovingCollateral}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                    {selectedAction === "withdraw-liquidity"
                      ? "Shares"
                      : selectedAction === "supply-collateral" ||
                        selectedAction === "withdraw-collateral" ||
                        selectedAction === "repay-by-collateral"
                      ? pool.collateralTokenInfo?.symbol
                      : pool.borrowTokenInfo?.symbol}
                  </div>
                </div>
              </div>

              {/* Transaction Status */}
              {((selectedAction === "supply-liquidity" && (isApprovingLiquidity || isApproveConfirmingLiquidity || isApproveSuccessLiquidity || isSupplyingLiquidity || isConfirmingLiquidity || isSuccessLiquidity || isErrorLiquidity)) ||
                (selectedAction === "supply-collateral" && (isApprovingCollateral || isApproveConfirmingCollateral || isApproveSuccessCollateral || isSupplyingCollateral || isConfirmingCollateral || isSuccessCollateral || isErrorCollateral))) && (
                <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                  <div className="space-y-3">
                    {((selectedAction === "supply-liquidity" && isApprovingLiquidity) || (selectedAction === "supply-collateral" && isApprovingCollateral)) && (
                      <div className="flex items-center gap-3 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-sm font-semibold">
                           Approving token...
                         </span>
                      </div>
                    )}

                    {((selectedAction === "supply-liquidity" && isApproveConfirmingLiquidity) || (selectedAction === "supply-collateral" && isApproveConfirmingCollateral)) && (
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-sm font-semibold">
                           Confirming approval...
                         </span>
                      </div>
                    )}

                    {((selectedAction === "supply-liquidity" && isApproveSuccessLiquidity) || (selectedAction === "supply-collateral" && isApproveSuccessCollateral)) && (
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                         <span className="text-sm font-semibold">
                           Token approved successfully!
                         </span>
                      </div>
                    )}

                    {((selectedAction === "supply-liquidity" && isSupplyingLiquidity) || (selectedAction === "supply-collateral" && isSupplyingCollateral)) && (
                      <div className="flex items-center gap-3 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-sm font-semibold">
                           {selectedAction === "supply-liquidity" ? "Supplying liquidity..." : "Supplying collateral..."}
                         </span>
                      </div>
                    )}

                    {((selectedAction === "supply-liquidity" && isConfirmingLiquidity) || (selectedAction === "supply-collateral" && isConfirmingCollateral)) && (
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-sm font-semibold">
                           Confirming transaction...
                         </span>
                      </div>
                    )}

                    {((selectedAction === "supply-liquidity" && isSuccessLiquidity) || (selectedAction === "supply-collateral" && isSuccessCollateral)) && (
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                         <span className="text-sm font-semibold">
                           {selectedAction === "supply-liquidity" ? "Liquidity supplied successfully!" : "Collateral supplied successfully!"}
                         </span>
                      </div>
                    )}

                    {((selectedAction === "supply-liquidity" && isErrorLiquidity) || (selectedAction === "supply-collateral" && isErrorCollateral)) && (
                      <div className="flex items-center gap-3 text-red-600">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                         <span className="text-sm font-semibold">
                           Transaction failed
                         </span>
                      </div>
                    )}

                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              {(selectedAction === "supply-liquidity" || selectedAction === "supply-collateral") ? (
                <div className="space-y-3">
                  {/* Approve Button */}
                  {((selectedAction === "supply-liquidity" && !isApprovedLiquidity) || (selectedAction === "supply-collateral" && !isApprovedCollateral)) && (
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={!amount || parseFloat(amount) <= 0 || 
                        (selectedAction === "supply-liquidity" && (isApprovingLiquidity || isApproveConfirmingLiquidity)) ||
                        (selectedAction === "supply-collateral" && (isApprovingCollateral || isApproveConfirmingCollateral))}
                      className={`w-full h-14 text-lg font-bold bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
                    >
                      {((selectedAction === "supply-liquidity" && isApprovingLiquidity) || (selectedAction === "supply-collateral" && isApprovingCollateral))
                        ? "Approving..."
                        : ((selectedAction === "supply-liquidity" && isApproveConfirmingLiquidity) || (selectedAction === "supply-collateral" && isApproveConfirmingCollateral))
                        ? "Confirming Approval..."
                        : "Approve Token"}
                    </Button>
                  )}

                  {/* Supply Button */}
                  {((selectedAction === "supply-liquidity" && isApprovedLiquidity) || (selectedAction === "supply-collateral" && isApprovedCollateral)) && (
                    <Button
                      type="button"
                      onClick={handleSupply}
                      disabled={!amount || parseFloat(amount) <= 0 || 
                        (selectedAction === "supply-liquidity" && (isSupplyingLiquidity || isConfirmingLiquidity)) ||
                        (selectedAction === "supply-collateral" && (isSupplyingCollateral || isConfirmingCollateral))}
                      className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
                    >
                      {((selectedAction === "supply-liquidity" && isSupplyingLiquidity) || (selectedAction === "supply-collateral" && isSupplyingCollateral))
                        ? "Supplying..."
                        : ((selectedAction === "supply-liquidity" && isConfirmingLiquidity) || (selectedAction === "supply-collateral" && isConfirmingCollateral))
                        ? "Confirming..."
                        : selectedAction === "supply-liquidity" ? "Supply Liquidity" : "Supply Collateral"}
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} rounded-xl`}
                  onClick={() => {
                    onActionSelect?.(selectedAction);
                  }}
                >
                  Execute {currentAction?.label}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>

    {/* Supply Liquidity Success Alert */}
    {showSuccessAlertLiquidity && (
      <SuccessAlert
        isOpen={showSuccessAlertLiquidity}
        onClose={handleCloseSuccessAlertAndReset}
        title="Transaction Success"
        description="Liquidity supplied successfully!"
        buttonText="Close"
        txHash={successTxHashLiquidity}
        chainId={currentChainId}
      />
    )}

    {/* Supply Collateral Success Alert */}
    {showSuccessAlertCollateral && (
      <SuccessAlert
        isOpen={showSuccessAlertCollateral}
        onClose={handleCloseSuccessAlertAndReset}
        title="Transaction Success"
        description="Collateral supplied successfully!"
        buttonText="Close"
        txHash={successTxHashCollateral}
        chainId={currentChainId}
      />
    )}

    {/* Failed Alert */}
    {(showFailedAlertLiquidity || showFailedAlertCollateral) && (
      <FailedAlert
        isOpen={showFailedAlertLiquidity || showFailedAlertCollateral}
        onClose={() => {
          if (showFailedAlertLiquidity) handleCloseFailedAlertLiquidity();
          if (showFailedAlertCollateral) handleCloseFailedAlertCollateral();
        }}
        title="Transaction Failed"
        description={errorMessageLiquidity || errorMessageCollateral}
        buttonText="Close"
      />
    )}
  </>
  );
});
