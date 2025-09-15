"use client";

import { memo, useMemo, useState } from "react";
import { TransactionTable } from "./TransactionTable";
import { TransactionFilter } from "./TransactionFilter";
import { useTransactions } from "./api";
import { useWagmiWallet } from "@/hooks/useWagmiWallet";


const PAGE_SIZE = 8;

const HistoryClient = memo(function HistoryClient() {
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(0);

  const { isConnected, account } = useWagmiWallet();
  const { transactions, loading, error } = useTransactions(
    isConnected && account ? account : undefined
  );

  const filteredTransactions = useMemo(() => {
    if (selectedType === "all") return transactions;
    return transactions.filter((tx) => tx.type === selectedType);
  }, [transactions, selectedType]);

  // Reset page to 0 if filter changes or data berubah
  // (agar tidak stuck di page > 0 saat filter berubah)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { setPage(0); }, [selectedType, transactions.length]);

  const pagedTransactions = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, page]);

  const hasNext = (page + 1) * PAGE_SIZE < filteredTransactions.length;
  const hasPrev = page > 0;

  return (
    <div className="min-h-screen pt-8 relative z-10 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-28 xl:pb-32">
      <div className="max-w-6xl mx-auto">
        <TransactionFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        {!isConnected ? (
          <div className="text-center text-white/80 py-10">
            Please connect your wallet to view transaction history
          </div>
        ) : (
          <>
            <TransactionTable 
              transactions={pagedTransactions} 
              loading={loading}
            />
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={loading || !hasPrev}
              >
                Prev
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || !hasNext}
              >
                Next
              </button>
            </div>
          </>
        )}
        {error && (
          <div className="text-center text-red-300 py-4 mt-4">{error}</div>
        )}
      </div>
    </div>
  );
});

export { HistoryClient };
