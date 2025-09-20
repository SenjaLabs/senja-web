import { createConfig, http, createStorage, cookieStorage } from "wagmi";
import { baseSepolia, kaia, optimism } from "viem/chains";

export const config = createConfig({
  chains: [baseSepolia, kaia, optimism],
  transports: {
    [kaia.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: http(),
  },
  // Enable session persistence
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
    key: 'wagmi.store',
  }),
  // Allow reconnection on page reload
  ssr: true,
});
