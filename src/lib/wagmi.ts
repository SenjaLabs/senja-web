import { createConfig, http } from "wagmi";
import { baseSepolia, kaia, optimism } from "viem/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia, kaia, optimism],
  connectors: [injected(), walletConnect({ projectId: "YOUR_PROJECT_ID" })],
  transports: {
    [baseSepolia.id]: http(),
    [kaia.id]: http(),
    [optimism.id]: http(),
  },
});
