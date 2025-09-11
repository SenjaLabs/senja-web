
"use client";

import { memo } from "react";

const HistoryPage = memo(function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Transaction History</h1>
        <p className="text-gray-600">Your transaction history will appear here.</p>
      </div>
    </div>
  );
});

export default HistoryPage;