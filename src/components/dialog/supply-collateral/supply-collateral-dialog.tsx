"use client";

import React, { useState, memo, useCallback, useEffect } from "react";
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
import { useSupplyCollateral } from "@/hooks/write/useSupplyCollateral";
import { useSupplyLiquidity } from "@/hooks/write/useSupplyLiquidity";
import { useCurrentChainId } from "@/lib/chain";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { BalanceInputForm } from "@/components/dialog/shared/balance-input-form";
import { dialogStyles, buttonStyles, spacing, textStyles } from "@/lib/styles/common";
import { BUTTON_TEXTS, LOADING_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";

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
  const [selectedAction, setSelectedAction] = useState<DialogActionType>("supply-liquidity");
  const currentChainId = useCurrentChainId();

  // Use both hooks and select based on action
  const supplyCollateralHook = useSupplyCollateral(currentChainId, () => {
    onSuccess?.();
    onClose();
    resetForm();
  });

  const supplyLiquidityHook = useSupplyLiquidity(currentChainId, () => {
    onSuccess?.();
    onClose();
    resetForm();
  });

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setAmount("");
    // Reset success alerts if they're showing
    if (supplyCollateralHook.showSuccessAlert) {
      supplyCollateralHook.handleCloseSuccessAlert();
    }
    if (supplyLiquidityHook.showSuccessAlert) {
      supplyLiquidityHook.handleCloseSuccessAlert();
    }
    if (supplyCollateralHook.showApproveSuccessAlert) {
      supplyCollateralHook.handleCloseApproveSuccessAlert();
    }
    if (supplyLiquidityHook.showApproveSuccessAlert) {
      supplyLiquidityHook.handleCloseApproveSuccessAlert();
    }
    // Reset failed alerts if they're showing
    if (supplyCollateralHook.showFailedAlert) {
      supplyCollateralHook.handleCloseFailedAlert();
    }
    if (supplyLiquidityHook.showFailedAlert) {
      supplyLiquidityHook.handleCloseFailedAlert();
    }
  }, [supplyCollateralHook, supplyLiquidityHook]);

  /**
   * Handle action selection
   */
  const handleActionSelect = useCallback((action: DialogActionType) => {
    setSelectedAction(action);
    resetForm(); // Reset all form states when switching actions
  }, [resetForm]);

  // Select the appropriate hook based on selected action
  const getCurrentHook = () => {
    switch (selectedAction) {
      case "supply-liquidity":
        return supplyLiquidityHook;
      case "supply-collateral":
        return supplyCollateralHook;
      default:
        return supplyLiquidityHook; // Default to supply liquidity
    }
  };

  const currentHook = getCurrentHook();

  // Form validation
  const isValid = amount && parseFloat(amount) > 0;

  // Get current action configuration
  const currentAction = actionConfig.find(action => action.id === selectedAction);

  // Dynamic content based on selected action
  const getHeaderTitle = () => {
    return currentAction?.label || "Supply Liquidity";
  };


  const getTokenType = () => {
    if (selectedAction === "supply-collateral" || selectedAction === "withdraw-collateral") {
      return "collateral";
    }
    return "borrow";
  };

  const getTokenInfo = useCallback(() => {
    if (selectedAction === "supply-collateral" || selectedAction === "withdraw-collateral") {
      return pool?.collateralTokenInfo;
    }
    return pool?.borrowTokenInfo;
  }, [selectedAction, pool]);

  const getTokenLabel = () => {
    if (selectedAction === "supply-collateral" || selectedAction === "withdraw-collateral") {
      return "Collateral Token:";
    }
    return "Supply Token:";
  };

  const getAmountLabel = () => {
    switch (selectedAction) {
      case "withdraw-liquidity":
        return "Shares to Withdraw";
      case "withdraw-collateral":
        return "Amount to Withdraw";
      case "borrow":
        return "Amount to Borrow";
      case "repay":
        return "Amount to Repay";
      default:
        return "Amount to Supply";
    }
  };

  const getCardColors = () => {
    switch (selectedAction) {
      case "supply-liquidity":
        return {
          bgColor: "from-orange-50 to-orange-100",
          borderColor: "border-orange-200",
          textColor: "text-orange-700"
        };
      case "supply-collateral":
        return {
          bgColor: "from-green-50 to-green-100",
          borderColor: "border-green-200",
          textColor: "text-green-700"
        };
      case "borrow":
        return {
          bgColor: "from-purple-50 to-purple-100",
          borderColor: "border-purple-200",
          textColor: "text-purple-700"
        };
      case "repay":
        return {
          bgColor: "from-indigo-50 to-indigo-100",
          borderColor: "border-indigo-200",
          textColor: "text-indigo-700"
        };
      case "withdraw-liquidity":
        return {
          bgColor: "from-red-50 to-red-100",
          borderColor: "border-red-200",
          textColor: "text-red-700"
        };
      case "withdraw-collateral":
        return {
          bgColor: "from-orange-50 to-orange-100",
          borderColor: "border-orange-200",
          textColor: "text-orange-700"
        };
      default:
        return {
          bgColor: "from-orange-50 to-orange-100",
          borderColor: "border-orange-200",
          textColor: "text-orange-700"
        };
    }
  };

  const getButtonText = () => {
    if (currentHook.isApproving) return "Approving...";
    if (currentHook.isApproveConfirming) return "Confirming Approval...";
    if (currentHook.isSupplying) return LOADING_MESSAGES.SUPPLYING || "Supplying...";
    if (currentHook.isConfirming) return LOADING_MESSAGES.CONFIRMING_TRANSACTION || "Confirming...";
    
    if (currentHook.needsApproval && !currentHook.isApproved) {
      return "Approve Token";
    }
    
    switch (selectedAction) {
      case "supply-liquidity":
        return BUTTON_TEXTS.SUPPLY_LIQUIDITY || "Supply Liquidity";
      case "supply-collateral":
        return BUTTON_TEXTS.SUPPLY_COLLATERAL || "Supply Collateral";
      case "borrow":
        return "Borrow";
      case "repay":
        return "Repay";
      case "withdraw-liquidity":
        return "Withdraw Liquidity";
      case "withdraw-collateral":
        return "Withdraw Collateral";
      default:
        return "Execute Action";
    }
  };

  // Handle write errors
  useEffect(() => {
    if (currentHook.writeError) {
      console.error("Write error:", currentHook.writeError);
    }
  }, [currentHook.writeError]);

  // Handle confirm errors
  useEffect(() => {
    if (currentHook.confirmError) {
      console.error("Confirm error:", currentHook.confirmError);
    }
  }, [currentHook.confirmError]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !pool) {
      return;
    }

    const tokenInfo = getTokenInfo();
    const tokenAddress = tokenInfo?.addresses[currentChainId] as `0x${string}`;
    const tokenDecimals = tokenInfo?.decimals || 18;

    if (currentHook.needsApproval && !currentHook.isApproved) {
      // Handle approval first
      await currentHook.handleApproveToken(
        tokenAddress,
        pool.lendingPool as `0x${string}`,
        amount,
        tokenDecimals
      );
    } else if (currentHook.isApproved) {
      // Handle the specific action based on selection
      if (selectedAction === "supply-collateral" && "handleSupplyCollateral" in currentHook) {
        await currentHook.handleSupplyCollateral(
          pool.lendingPool as `0x${string}`,
          amount,
          tokenDecimals
        );
      } else if (selectedAction === "supply-liquidity" && "handleSupplyLiquidity" in currentHook) {
        await currentHook.handleSupplyLiquidity(
          pool.lendingPool as `0x${string}`,
          amount,
          tokenDecimals
        );
      }
    }
  }, [amount, isValid, pool, currentHook, selectedAction, currentChainId, getTokenInfo]);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    if (!currentHook.isSupplying && !currentHook.isConfirming && !currentHook.isApproving && !currentHook.isApproveConfirming) {
      onClose();
      resetForm();
      if (currentHook.resetApproveStates) {
        currentHook.resetApproveStates();
      }
    }
  }, [currentHook, onClose, resetForm]);

  /**
   * Handle amount input change
   */
  const handleAmountChange = useCallback((amount: string) => {
    setAmount(amount);
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
                {getHeaderTitle()}
              </DialogTitle>
            </div>
            <Button
              onClick={handleClose}
              disabled={currentHook.isSupplying || currentHook.isConfirming || currentHook.isApproving || currentHook.isApproveConfirming}
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
            <Card className={`p-4 bg-gradient-to-r ${getCardColors().bgColor} border ${getCardColors().borderColor} rounded-xl mb-6`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">{getTokenLabel()}</div>
                  <div className={`font-semibold ${getCardColors().textColor}`}>
                    {getTokenInfo()?.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Pool Address:</div>
                  <div className={`font-mono text-xs break-all ${getCardColors().textColor}`}>
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
              tokenType={getTokenType() as "borrow" | "collateral"}
              disabled={currentHook.isSupplying || currentHook.isConfirming || currentHook.isApproving || currentHook.isApproveConfirming}
              customLabel={getAmountLabel()}
            />

            {/* Approval Status */}
            {(currentHook.isApproving || currentHook.isApproveConfirming || currentHook.isApproveSuccess || currentHook.isApproveError) && (
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl mb-4">
                <div className="space-y-3">
                  {currentHook.isApproving && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold">
                        Approving token...
                      </span>
                    </div>
                  )}

                  {currentHook.isApproveConfirming && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-semibold">
                        Confirming approval...
                      </span>
                    </div>
                  )}

                  {currentHook.isApproveSuccess && (
                    <div className="flex items-center gap-3 text-green-600">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-semibold">
                        Token approved successfully!
                      </span>
                    </div>
                  )}

                  {currentHook.isApproveError && (
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
            {(currentHook.isSupplying || currentHook.isConfirming || currentHook.isSuccess || currentHook.isError) && (
              <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                <div className="space-y-3">
                  {currentHook.isSupplying && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold">
                         {LOADING_MESSAGES.SUPPLYING || "Supplying..."}
                       </span>
                    </div>
                  )}

                  {currentHook.isConfirming && (
                    <div className="flex items-center gap-3 text-orange-600">
                      <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold">
                         {LOADING_MESSAGES.CONFIRMING_TRANSACTION || "Confirming transaction..."}
                       </span>
                    </div>
                  )}

                  {currentHook.isSuccess && (
                    <div className="flex items-center gap-3 text-green-600">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold">
                         {SUCCESS_MESSAGES.COLLATERAL_SUPPLIED || "Transaction successful!"}
                       </span>
                    </div>
                  )}

                  {currentHook.isError && (
                    <div className="flex items-center gap-3 text-red-600">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold">
                         {ERROR_MESSAGES.TRANSACTION_FAILED || "Transaction failed"}
                       </span>
                    </div>
                  )}

                  {currentHook.txHash && (
                    <div className="text-xs text-gray-500 break-all bg-white p-2 rounded border">
                      <span className="font-medium">Transaction Hash:</span>
                      <br />
                      {currentHook.txHash}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValid || currentHook.isSupplying || currentHook.isConfirming || currentHook.isApproving || currentHook.isApproveConfirming}
              className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
            >
              {getButtonText()}
            </Button>
          </form>
        </div>
      </DialogContent>

      {/* Success Alert */}
      {currentHook.showSuccessAlert && (
        <SuccessAlert
          isOpen={currentHook.showSuccessAlert}
          onClose={currentHook.handleCloseSuccessAlert}
          txHash={currentHook.successTxHash}
          title="Transaction Success!"
          description="Your transaction has been successfully completed."
          onButtonClick={() => {
            currentHook.handleCloseSuccessAlert();
            onSuccess?.();
            onClose();
            resetForm();
          }}
        />
      )}

      {/* Approval Success Alert */}
      {currentHook.showApproveSuccessAlert && (
        <SuccessAlert
          isOpen={currentHook.showApproveSuccessAlert}
          onClose={currentHook.handleCloseApproveSuccessAlert}
          title="Approval Success"
          description="Token approved successfully! You can now proceed with your transaction."
          buttonText="Continue"
          txHash={currentHook.approveTxHash}
          chainId={currentChainId}
        />
      )}

      {/* Failed Alert */}
      {currentHook.showFailedAlert && (
        <FailedAlert
          isOpen={currentHook.showFailedAlert}
          onClose={currentHook.handleCloseFailedAlert}
          title="Transaction Failed"
          description={currentHook.errorMessage || "Something went wrong. Please try again."}
          onButtonClick={currentHook.handleCloseFailedAlert}
        />
      )}
    </Dialog>
  );
});
