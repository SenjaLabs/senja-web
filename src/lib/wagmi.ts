import { createConfig, http } from "wagmi";
import { base, kaia, optimism } from "viem/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [base, kaia, optimism],
  connectors: [injected(), walletConnect({ projectId: "YOUR_PROJECT_ID" })],
  transports: {
    [base.id]: http(),
    [kaia.id]: http(),
    [optimism.id]: http(),
  },
});
