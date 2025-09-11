"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { Liff } from "@line/liff";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";

interface LiffContextType {
  liff: Liff | null;
  liffError: string | null;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffError: null,
});

export const useLiff = () => useContext(LiffContext);

interface LiffProviderProps {
  children: ReactNode;
}

export default function LiffProvider({ children }: LiffProviderProps) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    import("@line/liff")
      .then((liff) => liff.default)
      .then((liff) => {
        console.log("LIFF init...");
        liff
          .init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
          .then(() => {
            console.log("LIFF init succeeded.");
            setLiffObject(liff);
          })
          .catch((error: Error) => {
            console.log("LIFF init failed.");
            setLiffError(error.toString());
          });
      });
  }, []);

  const value = {
    liff: liffObject,
    liffError: liffError,
  };
  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={config}>
      <LiffContext.Provider value={value}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </LiffContext.Provider>
    </WagmiProvider>
  );
}
