import { tokens } from "@/lib/addresses/tokenAddress";
import { TokenInfo } from "./types";

export function getTokenByAddress(address: string, chainId: number = 8217): TokenInfo | null {
  const token = tokens.find(token => 
    token.addresses[chainId as keyof typeof token.addresses]?.toLowerCase() === address.toLowerCase()
  );

  if (!token) {
    return null;
  }

  return {
    name: token.name,
    symbol: token.symbol,
    logo: token.logo,
    decimals: token.decimals,
  };
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart.toString()}.${trimmedFractional}`;
}

export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'supply_liquidity':
      return 'Supply Liquidity';
    case 'withdraw_liquidity':
      return 'Withdraw Liquidity';
    case 'borrow_debt_crosschain':
      return 'Borrow Crosschain';
    case 'supply_collateral':
      return 'Supply Collateral';
    default:
      return 'Unknown';
  }
}
