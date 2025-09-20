import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a token address is a native token
 * Native tokens use the address 0x0000000000000000000000000000000000000001
 */
export function isNativeToken(tokenAddress: string): boolean {
  return tokenAddress.toLowerCase() === "0x0000000000000000000000000000000000000001"
}
