import { Chain } from "@/types";

export const chains: Chain[] = [
  {
    id: 8217,
    destinationEndpoint: 30150,
    name: "Kaia",
    logo: "/chain/kaia-logo.svg",
    contracts: {
      lendingPool: "",
      factory: "0xa971CD2714fbCc9A942b09BC391a724Df9338206",
      position: "",
      blockExplorer: "https://kaiascan.io/",
    },
  },
  {
    id: 8453,
    destinationEndpoint: 30184,
    name: "Base",
    logo: "/chain/base.png",
    contracts: {
      lendingPool: "0x76091aC74058d69e32CdbCc487bF0bCA09cb59D7",
      factory: "0x31c3850D2cBDC5B084D632d1c61d54161790bFF8",
      position: "0x7C1A494ED22eAFC04e314c79Fc81AD11386f63a1",
      blockExplorer: "https://basescan.org",
    },
  },

  {
    id: 10,
    destinationEndpoint: 30111,
    name: "Optimism",
    logo: "/chain/optimism-logo.svg",
    disabled: true,
    comingSoon: true,
    contracts: {
      lendingPool: "",
      factory: "",
      position: "",
      blockExplorer: "https://optimism.etherscan.io",
    },
  },
  {
    id: 999,
    destinationEndpoint: 30111,
    name: "Hyperliquid EVM",
    logo: "/chain/hyper-evm.png",
    disabled: true,
    comingSoon: true,
    contracts: {
      lendingPool: "",
      factory: "",
      position: "",
      blockExplorer: "https://hyperevmscan.io",
    },
  },
];
