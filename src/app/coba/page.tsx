"use client";
import { useReadTotalSupplyAssets } from "@/hooks/read/useReadTotalSupplyAssets";
import React from "react";

const Page = () => {
  const { totalSupplyAssets, totalSupplyAssetsLoading, totalSupplyAssetsError } =
    useReadTotalSupplyAssets();

  if (totalSupplyAssetsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (totalSupplyAssetsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
          <p className="text-gray-600">{totalSupplyAssetsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Total Supply Assets Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raw Value
              </label>
              <p className="text-lg font-mono bg-gray-100 p-3 rounded-md">
                {totalSupplyAssets?.toString() || "N/A"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loading
                </label>
                <p className={`text-lg font-semibold ${
                  totalSupplyAssetsLoading ? "text-orange-600" : "text-green-600"
                }`}>
                  {totalSupplyAssetsLoading ? "Yes" : "No"}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error
                </label>
                <p className={`text-lg font-semibold ${
                  totalSupplyAssetsError ? "text-red-600" : "text-green-600"
                }`}>
                  {totalSupplyAssetsError ? "Yes" : "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
