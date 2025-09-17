import { createConfig, http } from "wagmi";
import { baseSepolia, kaia, optimism } from "viem/chains";

export const config = createConfig({
  chains: [baseSepolia, kaia, optimism],
  transports: {
    [kaia.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: http(),
  },
});
