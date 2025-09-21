import { createConfig, http } from "wagmi";
import { baseSepolia, kaia } from "viem/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  okxWallet,
  metaMaskWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [okxWallet, metaMaskWallet, walletConnectWallet, injectedWallet],
    },
  ],
  {
    appName: "Senja Labs",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "fbb62ab01e30aae7dbf1243b5ec6c69a",
  }
);

export const config = createConfig({
  chains: [baseSepolia, kaia],
  connectors,
  transports: {
    [kaia.id]: http(),
    [baseSepolia.id]: http(),
  },
});
