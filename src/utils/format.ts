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