"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chains } from "@/lib/addresses/chainAddress";
import Image from "next/image";

interface ChainSelectorProps {
  chainFrom: string;
  chainTo: string;
  onChainToChange: (value: string) => void;
  disabled?: boolean;
}

export const ChainSelector = ({
  chainFrom,
  chainTo,
  onChainToChange,
  disabled = false,
}: ChainSelectorProps) => {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col w-1/2">
        <label className="text-sm font-medium text-amber-800 mb-2">From</label>
        <Select value={chainFrom} onValueChange={() => {}} disabled>
          <SelectTrigger className="bg-orange-50 border-2 border-orange-300 cursor-not-allowed rounded-lg shadow-md h-12 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {chains.map((chain) => (
              <SelectItem key={chain.id} value={chain.id.toString()}>
                <div className="flex items-center space-x-2">
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    className="rounded-full"
                    width={20}
                    height={20}
                  />
                  <span>{chain.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col w-1/2">
        <label className="block text-sm font-medium text-amber-800 mb-2">
          To
        </label>
        <Select
          value={chainTo}
          onValueChange={onChainToChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white border-2 border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 rounded-lg shadow-md h-12 w-full">
            <SelectValue placeholder="Choose destination chain" />
          </SelectTrigger>
          <SelectContent className="bg-white border-0">
            {chains.map((chain) => (
              <SelectItem
                key={chain.id}
                value={chain.id.toString()}
                className={`hover:bg-orange-50 ${
                  chain.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={chain.disabled}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={chain.logo}
                      alt={chain.name}
                      className="rounded-full"
                      width={20}
                      height={20}
                    />
                    <span className={chain.disabled ? 'text-gray-400' : ''}>{chain.name}</span>
                  </div>
                  {chain.comingSoon && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
