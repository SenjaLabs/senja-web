"use client";

import React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "../ui/card";

const SenjaHeader = () => {
  return (
    <Card className="max-w-xl mx-auto p-1 bg-gradient-to-r rounded-t-none from-[#FFF3E0] to-[#FFE0B2] border-t border-[#FFE0B2]/50 shadow-lg backdrop-blur-lg">
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-t-3xl"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 justify-between">
          <Image
            src="/senja-logo.png"
            alt="Senja Logo"
            width={40}
            height={40}
            className="border-1 border-senja-cream rounded-full"
          />
          <span className="text-2xl font-bold">Senja</span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default SenjaHeader;
