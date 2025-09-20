"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { isOKXConnected, getOKXAddress } from '@/utils/okx-session-reader';
import '@/utils/wallet-connection-debug'; // Auto-load debug utility

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  isUsed?: boolean;
  onClick: () => void;
}

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected?: () => void;
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected
}) => {
  const { connect, isLoading, error, walletType } = useUnifiedWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check OKX wallet status
  const [okxConnected, setOkxConnected] = useState(false);
  const [okxAddress, setOkxAddress] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const connected = isOKXConnected();
      const address = getOKXAddress();
      setOkxConnected(connected);
      setOkxAddress(address);
    }
  }, [isOpen]);

  const handleWalletSelect = async (walletId: string) => {
    console.log('🎯 Wallet selection started:', { walletId, type: typeof walletId });
    setSelectedWallet(walletId);
    setIsConnecting(true);

    try {
      if (walletId === 'dapp-portal') {
        // For DApps Portal, we need to trigger the DApps Portal SDK modal
        // This will show the DApps Portal wallet selection UI
        console.log('🔧 Triggering DApps Portal SDK wallet selection...');
        await connect('dapp-portal');
      } else if (walletId === 'okx') {
        // For OKX, we can connect directly
        console.log('🦊 Connecting to OKX Wallet...');
        await connect('okx');
      } else {
        // For other wallets, show not available message
        console.log('⚠️ Wallet not available:', walletId);
        throw new Error(`${walletId} wallet is not yet available`);
      }
      
      console.log('✅ Wallet connection successful:', walletId);
      
      // Call onWalletConnected if provided
      if (onWalletConnected) {
        onWalletConnected();
      }
      
      // Close modal after successful connection
      onClose();
    } catch (error) {
      console.error('❌ Wallet connection failed:', {
        walletId,
        error: error instanceof Error ? error.message : error,
        errorType: typeof error
      });
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  const walletOptions: WalletOption[] = [
    {
      id: 'dapp-portal',
      name: 'DApps Portal (Recommended)',
      icon: '🟢', // Green circle for DApps Portal
      description: 'Primary wallet connection - Connect with DApps Portal SDK',
      isAvailable: true,
      onClick: () => handleWalletSelect('dapp-portal')
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: '⚫', // Black and white checkered pattern
      description: 'Connect with OKX Wallet',
      isAvailable: true,
      isUsed: okxConnected,
      onClick: () => handleWalletSelect('okx')
    },
    {
      id: 'google',
      name: 'Google',
      icon: '🔵', // Google colors
      description: 'Connect with Google',
      isAvailable: false,
      onClick: () => {}
    },
    {
      id: 'line',
      name: 'LINE',
      icon: '🟢', // LINE green
      description: 'Connect with LINE',
      isAvailable: false,
      onClick: () => {}
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: '⚫', // Apple black
      description: 'Connect with Apple',
      isAvailable: false,
      onClick: () => {}
    },
    {
      id: 'naver',
      name: 'Naver',
      icon: '🟢', // Naver green
      description: 'Connect with Naver',
      isAvailable: false,
      onClick: () => {}
    },
    {
      id: 'kakao',
      name: 'Kakao',
      icon: '🟡', // Kakao yellow
      description: 'Connect with Kakao',
      isAvailable: false,
      onClick: () => {}
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-gray-200/30 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span>Mini Dapp</span>
          </DialogTitle>
          <p className="text-center text-gray-600 text-sm mt-2">Connect your wallet</p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className={`w-full h-14 flex items-center justify-between p-4 border-2 transition-all duration-200 ${
                wallet.isAvailable
                  ? 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              } ${
                selectedWallet === wallet.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
              onClick={wallet.isAvailable ? wallet.onClick : undefined}
              disabled={!wallet.isAvailable || isConnecting}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-lg">
                  {wallet.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    Connect with {wallet.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {wallet.description}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {wallet.isUsed && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    used
                  </Badge>
                )}
                {wallet.isAvailable && (
                  <div className="w-4 h-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                {!wallet.isAvailable && (
                  <div className="w-4 h-4 text-gray-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isConnecting && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-blue-700 font-medium">
                Connecting to {selectedWallet === 'dapp-portal' ? 'DApps Portal' : 'OKX Wallet'}...
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-700 font-medium">
                Connection failed: {error}
              </span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            DApps Portal SDK provides secure wallet connection with multiple options
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectionModal;
