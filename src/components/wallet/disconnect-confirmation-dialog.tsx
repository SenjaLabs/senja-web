"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LogOut } from 'lucide-react';

interface DisconnectConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  walletType?: string;
  account?: string;
  isLoading?: boolean;
}

export const DisconnectConfirmationDialog: React.FC<DisconnectConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  walletType,
  account,
  isLoading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getWalletDisplayName = (type?: string) => {
    switch (type) {
      case 'dapp-portal':
        return 'DApps Portal';
      case 'okx':
        return 'OKX Wallet';
      case 'wagmi':
        return 'Wallet';
      default:
        return 'Wallet';
    }
  };

  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border-gray-200/30 w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <LogOut className="w-4 h-4 text-orange-600" />
            </div>
            <span>Disconnect Wallet</span>
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 text-sm mt-2">
            Are you sure you want to disconnect your wallet?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Wallet Info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {getWalletDisplayName(walletType)}
                </div>
                {account && (
                  <div className="text-sm text-gray-500 font-mono">
                    {formatAddress(account)}
                  </div>
                )}
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-700">
                <div className="font-medium mb-1">Important:</div>
                <ul className="space-y-1 text-xs">
                  <li>• You'll need to reconnect to use wallet features</li>
                  <li>• Your transaction history will be cleared</li>
                  <li>• Any pending transactions may be affected</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Disconnecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            You can reconnect anytime by clicking "Connect Wallet"
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisconnectConfirmationDialog;
