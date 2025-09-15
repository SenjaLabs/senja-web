import { Card } from "@/components/ui/card";
import Image from "next/image";

interface PoolInfoCardProps {
  collateralToken: {
    symbol: string;
    logo: string;
  };
  borrowToken: {
    symbol: string;
    logo: string;
  };
  apy: string;
  ltv: string;
}

export const PoolInfoCard = ({ 
  collateralToken, 
  borrowToken, 
  apy, 
  ltv 
}: PoolInfoCardProps) => {
  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-amber-600 mb-1">Collateral Token:</p>
          <div className="flex items-center space-x-2">
            <Image
              src={collateralToken.logo}
              alt={collateralToken.symbol}
              width={20}
              height={20}
              className="rounded-full"
            />
            <p className="font-semibold text-amber-800">{collateralToken.symbol}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-amber-600 mb-1">Borrow Token:</p>
          <div className="flex items-center space-x-2">
            <Image
              src={borrowToken.logo}
              alt={borrowToken.symbol}
              width={20}
              height={20}
              className="rounded-full"
            />
            <p className="font-semibold text-amber-800">{borrowToken.symbol}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-amber-600 mb-1">APY:</p>
          <p className="font-semibold text-amber-800">{apy}%</p>
        </div>
        <div>
          <p className="text-sm text-amber-600 mb-1">LTV:</p>
          <p className="font-semibold text-amber-800">{ltv}%</p>
        </div>
      </div>
    </Card>
  );
};
