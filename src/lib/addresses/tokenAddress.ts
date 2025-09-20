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
    addresses: {
      8217: "0x684a2aAF3d98bC8eD2c07988E8da9023026aD511",
    },
  },
  {
    name: "WETH",
    symbol: "WETH",
    logo: "/token/weth.png",
    decimals: 18,
    addresses: {
      84532: "0xB5155367af0Fab41d1279B059571715068dE263C",
      8217: "0x649eF2a788732900B82237C126a121be3282997c", //0x98A8345bB9D3DDa9D808Ca1c9142a28F6b0430E1
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
      8217: "0x8Bf79e425B54ecD75907B4Eda00DCED8C1a97DB0",// 0x981846bE8d2d697f4dfeF6689a161A25FfbAb8F9
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
      8217: "0xCEb5c8903060197e46Ab5ea5087b9F99CBc8da49",
      10: "0x6Ab9c1AAf4f8172138086AA72be2AB8aA6579dbd",
    },
  },
];

export const helperAddress = "0x03e7669B2e85CB7C61Af39307D79390B79c3aB7B";
