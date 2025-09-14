import { Token } from "@/types";

export const tokens: Token[] = [
  {
    name: "KAIA",
    symbol: "KAIA",
    logo: "/token/kaia-logo.svg",
    decimals: 18,
    addresses: {
      8217: "0x0000000000000000000000000000000000000000",
    },
  },
  {
    name: "WKAIA",
    symbol: "WKAIA",
    logo: "/token/kaia-logo.svg",
    decimals: 18,
    addresses: {
      8217: "0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432",
    },
  },
  {
    name: "WETH",
    symbol: "WETH",
    logo: "/token/weth.png",
    decimals: 18,
    addresses: {
      84532: "0xB5155367af0Fab41d1279B059571715068dE263C",
      8217: "0x98A8345bB9D3DDa9D808Ca1c9142a28F6b0430E1",
      10: "0x487b1e0177B3ac1ACA7e8c353ed0Df133593a8EB",
    },
  },
  {
    name: "WBTC",
    symbol: "WBTC",
    logo: "/token/wbtc.png",
    decimals: 8,
    addresses: {
      84532: "0x7CC19AdfCB73A81A6769dC1A9f7f9d429b27f000",
      8217: "0x981846bE8d2d697f4dfeF6689a161A25FfbAb8F9",
      10: "0x2879d0A7AD718c096Ed35E338C23e4C79E3601d8",
    },
  },
  {
    name: "USDT",
    symbol: "USDT",
    logo: "/token/usdt.png",
    decimals: 6,
    addresses: {
      84532: "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
      8217: "0x6Ab9c1AAf4f8172138086AA72be2AB8aA6579dbd",
      10: "0x6Ab9c1AAf4f8172138086AA72be2AB8aA6579dbd",
    },
  },
  {
    name: "USDC",
    symbol: "USDC",
    logo: "/token/usdc.png",
    decimals: 6,
    addresses: {
      84532: "0xDa11C806176678e4228C904ec27014267e128fb5",
      8217: "0xAE1b8d3B428d6A8F62df2f623081EAC8734168fe",
      10: "0xAE1b8d3B428d6A8F62df2f623081EAC8734168fe",
    },
  },
];

export const helperAddress = "0x1e68394DBd41F77Adf0644CE47b25D1023D664B1";
