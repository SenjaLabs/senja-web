"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReadPoolApy } from "@/hooks/read/useReadPoolApy";
import { useReadUserBorrowShares } from "@/hooks/read/useReadUserBorrowShares";
import { useRefetch } from "@/hooks/useRefetch";
import { useRepay } from "@/hooks/write/useRepay";
import { useCurrentChainId } from "@/lib/chain";
import { LendingPoolWithTokens } from "@/lib/graphql/lendingpool-list.fetch";
import { SuccessAlert, FailedAlert } from "@/components/alert";
import { InlineSpinner } from "@/components/ui/spinner";
import { BearyTabGuard } from "@/components/wallet/beary-tab-guard";
import Image from "next/image";

interface RepayTabProps {
  pool?: LendingPoolWithTokens;
}

const RepayTab = ({ pool }: RepayTabProps) => {
  const [amount, setAmount] = useState("");
  const [repayType] = useState("partial");

  const currentChainId = useCurrentChainId();

  // Refetch functionality
  const { addRefetchFunction, removeRefetchFunction } = useRefetch({
    refetchInterval: 0, // Disable auto-refetch, we'll trigger manually
    enabled: false,
  });

  // Get APY for the pool
  const {
    borrowAPY,
    loading: apyLoading,
    refetch: refetchApy,
  } = useReadPoolApy(pool?.lendingPool);

  // Get user borrow shares for the pool
  const {
    userBorrowSharesFormatted,
    userBorrowShares: userBorrowSharesRaw,
    userBorrowSharesLoading,
    userBorrowSharesError,
    refetchUserBorrowShares,
  } = useReadUserBorrowShares(
    (pool?.lendingPool as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    pool?.borrowTokenInfo?.decimals || 18
  );


  // Parse the raw borrow shares for max button functionality
  const borrowSharesParsed = userBorrowSharesRaw
    ? Number(userBorrowSharesRaw) /
      Math.pow(10, pool?.borrowTokenInfo?.decimals || 18)
    : 0;

  // Repay hook with integrated approval
  const {
    handleApproveToken,
    handleRepayLoan,
    isRepaying,
    isConfirming,
    isSuccess: isRepaySuccess,
    isError: isRepayError,
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
    resetSuccessStates,
    // Data states
    // totalBorrowAssets,
    // totalBorrowShares,
    // Refetch functions
    refetchTotalBorrowAssets,
    refetchTotalBorrowShares,
  } = useRepay(
    currentChainId,
    (pool?.lendingPool as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    (pool?.borrowTokenInfo?.addresses?.[currentChainId] as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    () => {
      setAmount("");
    },
    refetchUserBorrowShares
  );

  // Add refetch functions
  useEffect(() => {
    addRefetchFunction(refetchApy);
    addRefetchFunction(refetchUserBorrowShares);
    addRefetchFunction(refetchTotalBorrowAssets);
    addRefetchFunction(refetchTotalBorrowShares);

    return () => {
      removeRefetchFunction(refetchApy);
      removeRefetchFunction(refetchUserBorrowShares);
      removeRefetchFunction(refetchTotalBorrowAssets);
      removeRefetchFunction(refetchTotalBorrowShares);
    };
  }, [
    addRefetchFunction,
    removeRefetchFunction,
    refetchApy,
    refetchUserBorrowShares,
    refetchTotalBorrowAssets,
    refetchTotalBorrowShares,
  ]);

  const handleSetMax = useCallback(() => {
    if (borrowSharesParsed > 0) {
      setAmount(userBorrowSharesFormatted);
    }
  }, [userBorrowSharesFormatted, borrowSharesParsed]);

  const handleApprove = async () => {
    
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    resetSuccessStates();
    const decimals = pool.borrowTokenInfo?.decimals || 18;
    const tokenAddress = pool.borrowTokenInfo?.addresses[currentChainId] as `0x${string}`;
    const spenderAddress = pool.lendingPool as `0x${string}`;
    
    await handleApproveToken(tokenAddress, spenderAddress, amount, decimals);
  };

  const handleRepay = async () => {
    if (!pool || !amount || parseFloat(amount) <= 0) {
      return;
    }

    const decimals = pool.borrowTokenInfo?.decimals || 18;
    
    // Prepare repay data

    await handleRepayLoan(amount, decimals);
  };

  if (!pool) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <p className="text-amber-600">No pool selected</p>
        </Card>
      </div>
    );
  }

  return (
    <BearyTabGuard
      showGuard={true}
      tabName="Repay"
      title="Connect Wallet to Repay Loans"
      message="Connect your wallet to repay your borrowed assets!"
    >
      <div className="space-y-6">
      {/* Pool Information Card */}
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-amber-600 mb-1">Collateral Token:</p>
            <div className="flex items-center space-x-2">
              <Image
                src={pool.collateralTokenInfo?.logo || "/token/kaia-logo.svg"}
                alt={pool.collateralTokenInfo?.symbol || "Token"}
                width={20}
                height={20}
                className="rounded-full"
              />
              <p className="font-semibold text-amber-800">
                {pool.collateralTokenInfo?.symbol}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">Borrow Token:</p>
            <div className="flex items-center space-x-2">
              <Image
                src={pool.borrowTokenInfo?.logo || "/token/usdt.png"}
                alt={pool.borrowTokenInfo?.symbol || "Token"}
                width={20}
                height={20}
                className="rounded-full"
              />
              <p className="font-semibold text-amber-800">
                {pool.borrowTokenInfo?.symbol}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">Interest Rate:</p>
            <p className="font-semibold text-amber-800">
              {apyLoading ? <InlineSpinner size="sm" /> : `${borrowAPY}%`}
            </p>
          </div>
          <div>
            <p className="text-sm text-amber-600 mb-1">LTV:</p>
            <p className="font-semibold text-amber-800">
              {(Number(pool.ltv) / 1e16).toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
        <div className="space-y-4">
          {/* User Position Info */}
          <div className="p-3 bg-white/50 rounded-lg border border-orange-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Your Borrowed Amount:
              </span>
              <span className="text-md font-bold text-orange-700">
                {userBorrowSharesLoading ? (
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                ) : userBorrowSharesError ? (
                  <span className="text-red-500 text-xs">Error</span>
                ) : (
                  `${userBorrowSharesFormatted || "0.00"} ${
                    pool.borrowTokenInfo?.symbol || "Token"
                  }`
                )}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <label className="text-sm font-medium text-amber-800">
                  Repay Amount
                </label>
              </div>
            </div>

            <div className="relative">
              <Input
                type="number"
                placeholder="Enter amount to repay"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSetMax}
                  disabled={borrowSharesParsed <= 0}
                >
                  {repayType === "full"
                    ? "Full"
                    : repayType === "interest"
                    ? "Interest"
                    : "Max"}
                </button>
                <span className="text-sm font-medium text-amber-800">
                  {pool.borrowTokenInfo?.symbol || "Token"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Transaction Status */}
      {((isApproving || isApproveConfirming || isApproveSuccess || isRepaying || isConfirming || isRepaySuccess || isRepayError)) && (
        <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
          <div className="space-y-3">
            {/* Approve Status */}
            {isApproving && (
              <div className="flex items-center gap-3 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">Approving token...</span>
              </div>
            )}

            {isApproveConfirming && (
              <div className="flex items-center gap-3 text-orange-600">
                <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">Confirming approval...</span>
              </div>
            )}

            {isApproveSuccess && (
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-semibold">Token approved successfully!</span>
              </div>
            )}

            {/* Repay Status */}
            {isRepaying && (
              <div className="flex items-center gap-3 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">Repaying loan...</span>
              </div>
            )}

            {isConfirming && (
              <div className="flex items-center gap-3 text-orange-600">
                <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">Confirming transaction...</span>
              </div>
            )}

            {isRepaySuccess && (
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-semibold">Loan repaid successfully!</span>
              </div>
            )}

            {/* Error Status */}
            {isRepayError && (
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-semibold">Transaction failed</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {needsApproval && !isApproved ? (
          <Button
            onClick={handleApprove}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              borrowSharesParsed <= 0 ||
              isApproving ||
              isApproveConfirming
            }
          >
            {isApproving
              ? "Approving..."
              : isApproveConfirming
              ? "Confirming Approval..."
              : `Approve ${pool.borrowTokenInfo?.symbol || "Token"}`}
          </Button>
        ) : (
          <Button
            onClick={handleRepay}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              borrowSharesParsed <= 0 ||
              isRepaying ||
              isConfirming ||
              !isApproved
            }
          >
            {isRepaying
              ? "Repaying..."
              : isConfirming
              ? "Confirming..."
              : `Repay ${pool.borrowTokenInfo?.symbol || "Token"}`}
          </Button>
        )}
      </div>

      {/* Repay Success Alert */}
      {showSuccessAlert && (
        <SuccessAlert
          isOpen={showSuccessAlert}
          onClose={handleCloseSuccessAlert}
          title="Transaction Success"
          description="Loan repaid successfully!"
          buttonText="Close"
          txHash={successTxHash}
          chainId={currentChainId}
        />
      )}

      {/* Failed Alert */}
      {showFailedAlert && (
        <FailedAlert
          isOpen={showFailedAlert}
          onClose={handleCloseFailedAlert}
          title="Transaction Failed"
          description={errorMessage}
          buttonText="Close"
        />
      )}
      </div>
    </BearyTabGuard>
  );
};

export default RepayTab;
