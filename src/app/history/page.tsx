
"use client";

import { memo, useMemo, useState } from "react";
import { TransactionTable } from "./_components/TransactionTable";
import { TransactionFilter } from "./_components/TransactionFilter";
import { useTransactions } from "./_components/api";
import { useWagmiWallet } from "@/hooks/useWagmiWallet";

const HistoryPage = memo(function HistoryPage() {
  const [selectedType, setSelectedType] = useState("all");

  const { isConnected, account } = useWagmiWallet();
  const { transactions, loading, error } = useTransactions(
    isConnected && account ? account : undefined
  );

  const filteredTransactions = useMemo(() => {
    if (selectedType === "all") return transactions;
    return transactions.filter((tx) => tx.type === selectedType);
  }, [transactions, selectedType]);

  return (
    <div className="min-h-screen relative z-10 px-4 pt-20 pb-24 sm:px-6 sm:pt-24 lg:px-8 lg:pt-32">
      <div className="max-w-6xl mx-auto">

        <TransactionFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

        {!isConnected ? (
          <div className="text-center text-white/80 py-10">
            Please connect your wallet to view transaction history
          </div>
        ) : loading ? (
          <div className="text-center text-white/80 py-10">Loading transactions...</div>
        ) : error ? (
          <div className="text-center text-red-300 py-10">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-white/80 py-10">No transactions found</div>
        ) : (
          <TransactionTable transactions={filteredTransactions} />
        )}
      </div>
    </div>
  );
});

export default HistoryPage;