"use client";

import React, { useState, memo } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Token } from "@/types";
import { TokenSelectorDialog } from "./token-selector-dialog";
import Image from "next/image";
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral";

interface TokenSelectorProps {
  selectedToken?: Token;
  onTokenSelect: (token: Token) => void;
  otherToken?: Token;
  label: string;
  selectedPoolAddress?: string;
  showBalance?: boolean;
}

export const TokenSelector = memo(function TokenSelector({
  selectedToken,
  onTokenSelect,
  otherToken,
  label,
  selectedPoolAddress,
  showBalance = false,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get user collateral balance for the selected token
  const { userCollateralFormatted } = useReadUserCollateral(
    selectedPoolAddress as `0x${string}` || "0x0000000000000000000000000000000000000000",
    selectedToken?.decimals || 18
  );

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        className={`h-12 px-4 font-medium rounded-xl transition-all duration-300 border-orange-200 hover:border-orange-300 bg-white/80 hover:bg-white/90 hover:shadow-md ${
          !selectedToken ? "text-gray-700" : "text-gray-900"
        }`}
      >
        {selectedToken ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={selectedToken.logo}
                  alt={selectedToken.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget
                      // eslint-disable-next-line no-undef
                      .nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.classList.remove("hidden");
                      fallback.classList.add("flex");
                    }
                  }}
                />
                <div className="w-full h-full bg-gradient-twilight items-center justify-center text-white text-xs font-semibold hidden">
                  {selectedToken.symbol.charAt(0)}
                </div>
              </div>
              <span className="text-gray-900 font-semibold">
                {selectedToken.symbol}
              </span>
            </div>
            {selectedPoolAddress && showBalance && (
              <div className="text-right mr-2">
                <div className="text-sm text-gray-600">
                  {userCollateralFormatted || "0.00000"}
                </div>
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-600">Select token</span>
        )}
        <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-500" />
      </Button>

      <TokenSelectorDialog
        isOpen={isOpen}
        onClose={handleClose}
        onTokenSelect={handleTokenSelect}
        otherToken={otherToken}
        title={label}
        selectedPoolAddress={selectedPoolAddress}
        showBalance={showBalance}
      />
    </>
  );
});

// Export all token selector components
export { TokenSearch } from "./token-search";
export { TokenSelectorDialog } from "./token-selector-dialog";
export { TokenSearchOnly } from "./token-search-only";
