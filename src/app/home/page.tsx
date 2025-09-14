"use client";

import React from "react";
import PoolsTable from "@/components/table/pools-table";
import SenjaHeader from "@/components/header/senja-header";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full pb-20 relative overflow-hidden bg-gradient-to-br from-senja-background via-senja-cream/30 to-senja-cream-light/40 flex items-center justify-center">
      {/* Mobile-optimized container */}
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header Section */}
        <SenjaHeader />

        {/* Pool Overview */}
        <div className="relative">
          <PoolsTable />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
