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
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

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
        liff
          .init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
          .then(() => {
            setLiffObject(liff);
          })
          .catch((error: Error) => {
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
          <RainbowKitProvider
            modalSize="compact"
            initialChain={8217}
            theme={lightTheme({
              accentColor: '#f97316',
              accentColorForeground: 'white',
              borderRadius: 'large',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </LiffContext.Provider>
    </WagmiProvider>
  );
}
