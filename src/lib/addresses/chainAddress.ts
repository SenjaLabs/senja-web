import { Chain } from "@/types";

export const chains: Chain[] = [
  {
    id: 8453,
    name: "Base",
    logo: "/chain/base.png",
    contracts: {
      lendingPool: "0x4F4E980f0C0094935c62Fc30B29d4F55DBEb824e",
      factory: "0x67165C24A886AAAf1bFA81934e44a2063c6B608C",
      position: "0x1fEAD2bdAaEbb03C2739949EA3B2145f064378F0",
      blockExplorer: "https://basescan.org",
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
