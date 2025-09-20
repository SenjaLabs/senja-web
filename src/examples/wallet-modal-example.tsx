"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWalletSelectionModal } from '@/hooks/useWalletSelectionModal';
import WalletSelectionModal from '@/components/wallet/wallet-selection-modal';
import WalletFlowInfo from '@/components/wallet/wallet-flow-info';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';

/**
 * Example component demonstrating the wallet selection modal
 */
export const WalletModalExample: React.FC = () => {
  const { isModalOpen, openModal, closeModal, handleWalletConnect } = useWalletSelectionModal();
  const { isConnected, account, walletType } = useUnifiedWallet();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Wallet Selection Modal Example
        </h1>
        <p className="text-gray-600">
          Demonstrates the correct DApps Portal SDK wallet selection flow
        </p>
      </div>

      {/* Flow Information */}
      <WalletFlowInfo />

      {/* Current Wallet Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Wallet Status</h2>
        <div className="space-y-2">
          <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
          <p><strong>Account:</strong> {account || 'Not connected'}</p>
          <p><strong>Wallet Type:</strong> {walletType || 'None'}</p>
        </div>
      </Card>

      {/* Modal Trigger */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Open Wallet Selection Modal</h2>
        <p className="text-gray-600 mb-4">
          Click the button below to open the wallet selection modal. This will show
          all available wallet options including DApps Portal SDK and OKX Wallet.
        </p>
        <Button 
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
        >
          Open Wallet Selection Modal
        </Button>
      </Card>

      {/* Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Modal Features</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>DApps Portal SDK integration</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>OKX Wallet detection and connection</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Multiple wallet options (Google, LINE, Apple, etc.)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Used wallet indicators</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Loading states and error handling</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Responsive design</span>
          </div>
        </div>
      </Card>

      {/* Usage Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        <div className="space-y-3 text-sm">
          <div>
            <strong>1. DApps Portal SDK:</strong> Primary wallet connection method for desktop users
          </div>
          <div>
            <strong>2. OKX Wallet:</strong> Automatically detected if OKX extension is installed
          </div>
          <div>
            <strong>3. Other Wallets:</strong> Currently disabled but UI is ready for future integration
          </div>
          <div>
            <strong>4. Used Indicator:</strong> Shows "used" badge for previously connected wallets
          </div>
          <div>
            <strong>5. Error Handling:</strong> Displays connection errors with retry options
          </div>
        </div>
      </Card>

      {/* Modal Component */}
      <WalletSelectionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onWalletConnected={handleWalletConnect}
      />
    </div>
  );
};

export default WalletModalExample;
