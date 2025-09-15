import { graphClient } from "./client";
import { queryLendingPool } from "./lendingpool-data.query";
import { tokens } from "../addresses/tokenAddress";
import { Token } from "@/types";

export type LendingPoolCreated = {
  id: string;
  lendingPool: `0x${string}`;
  borrowToken: `0x${string}`;
  collateralToken: `0x${string}`;
  ltv: string;
};

export type LendingPoolWithTokens = LendingPoolCreated & {
  borrowTokenInfo: Token | null;
  collateralTokenInfo: Token | null;
};

// Helper function to find token by address
function findTokenByAddress(address: string, chainId: number = 84532): Token | null {
  // Ensure address is a string before calling toLowerCase
  if (!address || typeof address !== 'string') {
    return null;
  }
  
  const normalizedAddress = address.toLowerCase();
  
  return tokens.find(token => {
    const tokenAddress = token.addresses[chainId]?.toLowerCase();
    return tokenAddress === normalizedAddress;
  }) || null;
}

// Function to pair lending pools with token metadata
export function pairLendingPoolsWithTokens(pools: LendingPoolCreated[], chainId: number = 84532): LendingPoolWithTokens[] {
  return pools.map(pool => ({
    ...pool,
    borrowTokenInfo: findTokenByAddress(pool.borrowToken, chainId),
    collateralTokenInfo: findTokenByAddress(pool.collateralToken, chainId),
  }));
}

export async function fetchLendingPools(): Promise<LendingPoolCreated[]> {
  try {
    const query = queryLendingPool();
    const data = await graphClient.request<{ lendingPoolCreateds: { items: LendingPoolCreated[] } }>(query);
    
    if (!data?.lendingPoolCreateds?.items) {
      return [];
    }
    
    const pools = data.lendingPoolCreateds.items;

    if (!Array.isArray(pools)) {
      return [];
    }

    // Filter out invalid pools
    const validPools = pools.filter(pool => 
      pool.lendingPool && 
      pool.borrowToken && 
      pool.collateralToken
    );
    
    return validPools;
  } catch {
    return [];
  }
}