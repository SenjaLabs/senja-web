import { Chain } from "@/types";

export const chains: Chain[] = [
  {
    id: 84532,
    name: "Base Sepolia",
    logo: "/chain/base.png",
    contracts: {
      lendingPool: "0x76091aC74058d69e32CdbCc487bF0bCA09cb59D7",
      factory: "0x31c3850D2cBDC5B084D632d1c61d54161790bFF8",
      position: "0x7C1A494ED22eAFC04e314c79Fc81AD11386f63a1",
      blockExplorer: "https://sepolia.basescan.org",
    },
  },

  {
    id: 8217,
    name: "Kaia",
    logo: "/chain/kaia-logo.svg",
    contracts: {
      lendingPool: "",
      factory: "",
      position: "",
      blockExplorer: "https://kaiascan.io/",
    },
  },

  {
    id: 10,
    name: "Optimism",
    logo: "/chain/optimism-logo.svg",
    contracts: {
      lendingPool: "",
      factory: "",
      position: "",
      blockExplorer: "https://optimism.etherscan.io",
    },
  },
];
