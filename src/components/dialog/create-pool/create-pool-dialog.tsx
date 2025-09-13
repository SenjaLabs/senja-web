"use client";

import React, { useState, memo, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TokenSelector } from "@/components/select/token";
import { useCreatePool } from "@/hooks/write/useCreatePool";
import { SuccessAlert } from "@/components/alert";
import { useCurrentChainId } from "@/lib/chain";
import { Token, BaseComponentProps } from "@/types";
import { dialogStyles, buttonStyles, inputStyles, spacing, textStyles } from "@/lib/styles/common";
import { PLACEHOLDERS, BUTTON_TEXTS, LOADING_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES, DEFAULT_CHAIN_ID, VALIDATION } from "@/lib/constants";

/**
 * Props for the CreatePoolDialog component
 */
interface CreatePoolDialogProps extends BaseComponentProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when pool creation is successful */
  onSuccess?: () => void;
}

/**
 * CreatePoolDialog component for creating new lending pools
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const CreatePoolDialog = memo(function CreatePoolDialog({
  isOpen,
  onClose,
  onSuccess,
  className,
}: CreatePoolDialogProps) {
  const [collateralToken, setCollateralToken] = useState<Token | undefined>();
  const [borrowToken, setBorrowToken] = useState<Token | undefined>();
  const [ltv, setLtv] = useState("");
  const currentChainId = useCurrentChainId();

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setCollateralToken(undefined);
    setBorrowToken(undefined);
    setLtv("");
  }, []);

  // Form validation
  const isValid =
    collateralToken &&
    borrowToken &&
    ltv &&
    parseFloat(ltv) >= VALIDATION.LTV_MIN &&
    parseFloat(ltv) <= VALIDATION.LTV_MAX;

  const { 
    handleCreate, 
    isCreating, 
    isConfirming, 
    isSuccess, 
    isError, 
    txHash, 
    showSuccessAlert, 
    successTxHash, 
    handleCloseSuccessAlert 
  } = useCreatePool(() => {
    onSuccess?.();
    onClose();
    resetForm();
  });

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    const currentChainId = DEFAULT_CHAIN_ID;
    const collateralAddress = collateralToken!.addresses[currentChainId];
    const borrowAddress = borrowToken!.addresses[currentChainId];

    if (!collateralAddress || !borrowAddress) {
      return;
    }

    await handleCreate(collateralAddress, borrowAddress, ltv);
  }, [collateralToken, borrowToken, ltv, handleCreate, isValid]);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    if (!isCreating && !isConfirming) {
      onClose();
      resetForm();
    }
  }, [isCreating, isConfirming, onClose, resetForm]);

  /**
   * Handle LTV input change
   */
  const handleLtvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLtv(e.target.value);
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={`${dialogStyles.content} ${className || ''}`}>
          <DialogHeader className={dialogStyles.header}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+</span>
                </div>
                <DialogTitle className={textStyles.heading}>
                  {BUTTON_TEXTS.CREATE_POOL}
                </DialogTitle>
              </div>
              <Button
                onClick={handleClose}
                disabled={isCreating || isConfirming}
                className="p-2 hover:bg-orange-200 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-600 hover:text-gray-800" />
              </Button>
            </div>
          </DialogHeader>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className={spacing.form}>
            <div className="flex justify-between  mx-auto">
              <div className="space-y-3 flex w-[45%] flex-col text-left">
                <label className={textStyles.label}>
                  Collateral Token
                </label>
                <TokenSelector
                  selectedToken={collateralToken}
                  onTokenSelect={setCollateralToken}
                  otherToken={borrowToken}
                  label="Select collateral token"
                />
              </div>

              {/* Borrow Token */}
              <div className="space-y-3 flex w-[45%] flex-col text-right">
                <label className={textStyles.label}>
                  Borrow Token
                </label>
                <TokenSelector
                  selectedToken={borrowToken}
                  onTokenSelect={setBorrowToken}
                  otherToken={collateralToken}
                  label="Select borrow token"
                />
              </div>
            </div>

            {/* LTV */}
            <div className="space-y-3">
              <label className={`${textStyles.label} flex items-center gap-2`}>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Loan-to-Value (LTV) %
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={PLACEHOLDERS.LTV_INPUT}
                  value={ltv}
                  onChange={handleLtvChange}
                  min={VALIDATION.LTV_MIN.toString()}
                  max={VALIDATION.LTV_MAX.toString()}
                  step="0.1"
                  className={inputStyles.default}
                />
              </div>
            </div>

            {/* Transaction Status */}
            {(isCreating || isConfirming || isSuccess || isError) && (
              <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                <div className="space-y-3">
                  {isCreating && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold">
                         {LOADING_MESSAGES.CREATING_POOL}
                       </span>
                    </div>
                  )}

                  {isConfirming && (
                    <div className="flex items-center gap-3 text-orange-600">
                      <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-semibold">
                         {LOADING_MESSAGES.CONFIRMING_TRANSACTION}
                       </span>
                    </div>
                  )}

                  {isSuccess && (
                    <div className="flex items-center gap-3 text-green-600">
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold">
                         {SUCCESS_MESSAGES.POOL_CREATED}
                       </span>
                    </div>
                  )}

                  {isError && (
                    <div className="flex items-center gap-3 text-red-600">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                       <span className="text-sm font-semibold">
                         {ERROR_MESSAGES.TRANSACTION_FAILED}
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
              disabled={!isValid || isCreating || isConfirming}
              className={`w-full h-14 text-lg font-bold ${buttonStyles.primary} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl`}
            >
              {isCreating
                ? LOADING_MESSAGES.CREATING_POOL
                : isConfirming
                ? LOADING_MESSAGES.CONFIRMING_TRANSACTION
                : BUTTON_TEXTS.CREATE_POOL}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Success Alert */}
    <SuccessAlert
      isOpen={showSuccessAlert}
      onClose={handleCloseSuccessAlert}
      title="Transaction success"
      description="tx hash:"
      buttonText="Close"
      txHash={successTxHash}
      chainId={currentChainId}
    />
  </>
  );
});
