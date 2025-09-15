import { createConfig, http } from "wagmi";
import { baseSepolia, kaia, optimism } from "viem/chains";

export const config = createConfig({
  chains: [baseSepolia, kaia, optimism],
  transports: {
    [baseSepolia.id]: http(),
    [kaia.id]: http(),
    [optimism.id]: http(),
  },
});
