"use client";

import React from "react";
import Image from "next/image";

const SenjaHeader = () => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      {/* Senja Logo */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <Image
          src="/senja-logo.png"
          alt="Senja Logo"
          width={120}
          height={120}
          className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44"
          priority
        />
      </div>

      {/* Tagline */}
      <div>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-senja-secondary/90">
          <span className="font-bold text-senja-primary">Senja</span>, Crosschain Lending Protocol
        </p>
      </div>
    </div>
  );
};

export default SenjaHeader;