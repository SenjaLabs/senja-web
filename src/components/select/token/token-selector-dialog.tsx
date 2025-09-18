"use client";

import React, { useCallback, memo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TokenSearch } from "./token-search";
import { Token } from "@/types";

interface TokenSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSelect: (token: Token) => void;
  otherToken?: Token;
  title?: string;
  showPopularTokens?: boolean;
  selectedPoolAddress?: string;
  showBalance?: boolean;
  isCollateralBalance?: boolean;
}

export const TokenSelectorDialog = memo(function TokenSelectorDialog({
  isOpen,
  onClose,
  onTokenSelect,
  otherToken,
  title = "Select token",
  showPopularTokens = true,
  selectedPoolAddress,
  showBalance = false,
  isCollateralBalance = false,
}: TokenSelectorDialogProps) {
  const handleTokenSelect = useCallback((token: Token) => {
    onTokenSelect(token);
    onClose();
  }, [onTokenSelect, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] p-0 bg-white/95 backdrop-blur-sm border border-orange-200 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader className="p-6 pb-4 relative">
          <DialogTitle className="text-center">{title}</DialogTitle>
          <Button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-orange-100 rounded-full transition-colors duration-200"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-orange-600" />
          </Button>
        </DialogHeader>

        <div className="px-6 pb-6">
          <TokenSearch
            onTokenSelect={handleTokenSelect}
            otherToken={otherToken}
            showPopularTokens={showPopularTokens}
            selectedPoolAddress={selectedPoolAddress}
            showBalance={showBalance}
            isCollateralBalance={isCollateralBalance}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});
