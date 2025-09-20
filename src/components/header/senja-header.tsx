"use client";

import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "../ui/card";

const SenjaHeader = () => {
  return (
    <Card className="max-w-xl mx-auto p-1 bg-gradient-to-r rounded-t-none from-[#FFF3E0] to-[#FFE0B2] border-t border-[#FFE0B2]/50 shadow-lg backdrop-blur-lg mb-2">
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-t-3xl"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 justify-between">
          <Image
            src="/senja-logo.png"
            alt="Senja Logo"
            width={50}
            height={50}
            className="border-1 mt-1 border-senja-cream rounded-full"
          />
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default SenjaHeader;
