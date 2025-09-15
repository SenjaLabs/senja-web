export const hexToDecimal = (hex: string, decimals: number): string => {
    const clean = hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
    if (clean === "") return "0";

    const wei: bigint = BigInt("0x" + clean);
    const divisor = BigInt(10) ** BigInt(decimals);

    const whole = wei / divisor;
    const rem = wei % divisor;

    if (rem === BigInt(0)) {
        return whole.toString();
    }

    // build fractional part with leading zeros to match decimals
    const fracRaw = rem.toString().padStart(decimals, "0");
    // trim trailing zeros
    const fracTrimmed = fracRaw.replace(/0+$/g, "");
    return `${whole.toString()}.${fracTrimmed}`;
};

export const keiHexToKaiaDecimal: (hex:string) => string = (hex:string) => {
    return hexToDecimal(hex, 18);
};

export const microUSDTHexToUSDTDecimal = (hex:string) => {
    return hexToDecimal(hex, 6);
};

/**
 * Get appropriate display decimal places based on token decimals
 * @param decimals - Token decimals
 * @returns Number of decimal places to display
 */
export const getDisplayDecimals = (decimals: number): number => {
    if (decimals >= 18) {
        return 6; // For tokens like ETH, WETH, etc.
    } else if (decimals === 8) {
        return 4; // For tokens like WBTC
    } else if (decimals === 6) {
        return 2; // For tokens like USDC, USDT
    } else if (decimals <= 2) {
        return decimals; // For tokens with very few decimals
    } else {
        return 2; // Default fallback
    }
};

/**
 * Format token amount with appropriate decimal places
 * @param amount - Raw amount as string or number
 * @param decimals - Token decimals
 * @returns Formatted amount string
 */
export const formatTokenAmount = (amount: string | number, decimals: number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const displayDecimals = getDisplayDecimals(decimals);
    return numAmount.toFixed(displayDecimals);
};