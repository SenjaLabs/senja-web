import { Token } from "@/types";

export const tokens: Token[] = [
  {
    name: "WETH",
    symbol: "WETH",
    logo: "/token/weth.png",
    decimals: 18,
    addresses: {
      8453: "0xC327486Db1417644f201d84414bbeA6C8A948bef",
      8217: "0x487b1e0177B3ac1ACA7e8c353ed0Df133593a8EB",
      10: "0x487b1e0177B3ac1ACA7e8c353ed0Df133593a8EB",
    },
  },
  {
    name: "WBTC",
    symbol: "WBTC",
    logo: "/token/wbtc.png",
    decimals: 8,
    addresses: {
      8453: "0x5C368bd6cE77b2ca47B4ba791fCC1f1645591c84",
      8217: "0x2879d0A7AD718c096Ed35E338C23e4C79E3601d8",
      10: "0x2879d0A7AD718c096Ed35E338C23e4C79E3601d8",
    },
  },
  {
    name: "USDC",
    symbol: "USDC",
    logo: "/token/usdc.png",
    decimals: 6,
    addresses: {
      8453: "0x04C37dc1b538E00b31e6bc883E16d97cD7937a10",
      8217: "0xAE1b8d3B428d6A8F62df2f623081EAC8734168fe",
      10: "0xAE1b8d3B428d6A8F62df2f623081EAC8734168fe",
    },
  },
  {
    name: "USDT",
    symbol: "USDT",
    logo: "/token/usdt.png",
    decimals: 6,
    addresses: {
      8453: "0x4Ba8D8083e7F3652CCB084C32652e68566E9Ef23",
      8217: "0x6Ab9c1AAf4f8172138086AA72be2AB8aA6579dbd",
      10: "0x6Ab9c1AAf4f8172138086AA72be2AB8aA6579dbd",
    },
  },
  {
    name: "KAIA",
    symbol: "KAIA",
    logo: "/token/kaia-logo.svg",
    decimals: 6,
    addresses: {
      8453: "0x4Ba8D8083e7F3652CCB084C32652e68566E9Ef23",
      8217: "0x6Ab9c1AAf4f8172138086AA72be2AB8aA6579dbd",
      10: "0x6Ab9c1AAf4f8172138086AA72be2AB8aA6579dbd",
    },
  },
];

export const helperAddress = "0x1e68394DBd41F77Adf0644CE47b25D1023D664B1";
