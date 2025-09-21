import { Token } from "@/types";

export const tokens: Token[] = [
  {
    name: "KAIA",
    symbol: "KAIA",
    logo: "/token/kaia-logo.svg",
    decimals: 18,
    addresses: {
      8217: "0x0000000000000000000000000000000000000001",
    },
  },
  {
    name: "WKAIA",
    symbol: "WKAIA",
    logo: "/token/kaia-logo.svg",
    decimals: 18,
    oftAddress:"0x15858A57854BBf0DF60A737811d50e1Ee785f9bc",
    addresses: {
      8217: "0x684a2aAF3d98bC8eD2c07988E8da9023026aD511",
      8453: "0x3703a1DA99a2BDf2d8ce57802aaCb20fb546Ff12",
    },
  },
  {
    name: "WETH",
    symbol: "WETH",
    logo: "/token/weth.png",
    decimals: 18,
    oftAddress:"0x007F735Fd070DeD4B0B58D430c392Ff0190eC20F",
    addresses: {
      8217: "0x98A8345bB9D3DDa9D808Ca1c9142a28F6b0430E1",
      8453: "0xec32CC0267002618c339274C18AD48D2Bf2A9c7e",
    },
  },
  {
    name: "WBTC",
    symbol: "WBTC",
    logo: "/token/wbtc.png",
    decimals: 8,
    oftAddress:"0x4Ba8D8083e7F3652CCB084C32652e68566E9Ef23",
    addresses: {
      8217: "0x981846bE8d2d697f4dfeF6689a161A25FfbAb8F9",
      8453: "0x394239573079a46e438ea6D118Fd96d37A61f270",
    },
  },
  {
    name: "USDT",
    symbol: "USDT",
    logo: "/token/usdt.png",
    decimals: 6,
    oftAddress:"0xdF05e9AbF64dA281B3cBd8aC3581022eC4841FB2",
    addresses: {
      8217: "0xd077A400968890Eacc75cdc901F0356c943e4fDb",
      8453: "0xc3be8ab4CA0cefE3119A765b324bBDF54a16A65b",
    },
  },
  {
    name: "USDT Stargate",
    symbol: "USDT Stargate",
    logo: "/token/usdtstargate.png",
    decimals: 6,
    addresses: {
      8217: "0x9025095263d1E548dc890A7589A4C78038aC40ab",
    },
  },
];

export const helperAddress = "0x03e7669B2e85CB7C61Af39307D79390B79c3aB7B";
