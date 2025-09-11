"use client";

import React from 'react';
import { PoolOverview } from '@/components/pools';

const HomePage = () => {
  const handleCreatePool = () => {
    console.log('Create pool clicked');
    // Navigate to create pool page or open modal
  };

  const handlePoolClick = (pool: any) => {
    console.log('Pool clicked:', pool);
    // Navigate to pool details or open interaction modal
  };

  const handlePoolSelect = (pool: any) => {
    console.log('Pool selected from dropdown:', pool);
    // Handle pool selection from dropdown
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto pb-20 relative overflow-hidden bg-gradient-to-br from-senja-background via-senja-cream/30 to-senja-cream-light/40">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-senja-cream-light/30 to-senja-orange/10 rounded-full opacity-40 animate-pulse"></div>
      <div
        className="absolute top-32 left-8 w-8 h-8 bg-gradient-to-br from-senja-orange/20 to-senja-cream/30 rounded-full opacity-50 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-48 right-20 w-12 h-12 bg-gradient-to-br from-senja-cream/40 to-senja-cream-light/30 rounded-full opacity-30 animate-pulse"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute bottom-32 left-16 w-6 h-6 bg-gradient-to-br from-senja-orange/15 to-senja-cream-light/25 rounded-full opacity-40 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-48 right-8 w-14 h-14 bg-gradient-to-br from-senja-cream/20 to-senja-orange/10 rounded-full opacity-35 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Header */}
      <div className="px-6 pt-8 pb-6 relative ">

      </div>

      {/* Pool Overview */}
      <div className="px-6 relative ">
        <PoolOverview 
          onCreatePool={handleCreatePool}
          onPoolClick={handlePoolClick}
          onPoolSelect={handlePoolSelect}
        />
      </div>
    </div>
  );
};

export default HomePage;