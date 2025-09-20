"use client";

import React, { memo } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, ArrowRight } from 'lucide-react';

interface BearyWalletGuardProps {
  /** Whether the guard should be shown */
  showGuard: boolean;
  /** Children to render when wallet is connected */
  children: React.ReactNode;
  /** Custom message to display */
  message?: string;
  /** Custom title */
  title?: string;
  /** Whether to show as overlay or replace content */
  asOverlay?: boolean;
}

export const BearyWalletGuard = memo(function BearyWalletGuard({
  showGuard,
  children,
  message = "Connect your wallet to start using this feature!",
  title = "Wallet Connection Required",
  asOverlay = false,
}: BearyWalletGuardProps) {
  const router = useRouter();
  const { isConnected } = useAccount();

  const handleConnectWallet = () => {
    router.push('/profile');
  };

  // If wallet is connected, show children
  if (isConnected) {
    return <>{children}</>;
  }

  // If guard is not active, show children
  if (!showGuard) {
    return <>{children}</>;
  }

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {/* Beary Wallet Image */}
      <div className="mb-6 relative">
        <div className="w-32 h-32 mx-auto relative">
          <img
            src="/beary/beary-wallet.png"
            alt="Beary with wallet"
            className="w-full h-full object-contain animate-bounce"
          />
        </div>
        {/* Sparkle effect */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
          <span className="text-white text-sm">✨</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
        {title}
      </h3>

      {/* Message */}
      <p className="text-gray-600 mb-6 max-w-sm leading-relaxed">
        {message}
      </p>

      {/* Connect Wallet Button */}
      <Button
        onClick={handleConnectWallet}
        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5" />
          Connect Wallet
          <ArrowRight className="h-4 w-4" />
        </div>
      </Button>

      {/* Fun message */}
      <p className="text-sm text-gray-500 mt-4">
        Beary is waiting for you! 🐻
      </p>
    </div>
  );

  if (asOverlay) {
    return (
      <div className="relative">
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg">
          <Card className="h-full border-0 bg-transparent">
            {content}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-orange-50/80 via-pink-50/60 to-yellow-50/70 backdrop-blur-sm ring-1 ring-orange-200/30 hover:shadow-2xl transition-all duration-500">
      {content}
    </Card>
  );
});

BearyWalletGuard.displayName = 'BearyWalletGuard';
