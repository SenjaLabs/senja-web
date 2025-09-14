"use client";

import React from "react";
import PoolsTable from "@/components/table/pools-table";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full pb-20 relative overflow-hidden bg-gradient-to-br from-senja-background via-senja-cream/30 to-senja-cream-light/40">
      {/* Mobile-optimized container */}
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Pool Overview */}
        <div className="relative">
          <PoolsTable />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
