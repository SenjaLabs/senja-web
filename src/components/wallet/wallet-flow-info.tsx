"use client";

import React from 'react';
import { Card } from '@/components/ui/card';

/**
 * Component to display the correct wallet connection flow
 */
export const WalletFlowInfo: React.FC = () => {
  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        🔄 Correct Wallet Connection Flow
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          <div>
            <p className="font-medium text-blue-900">User clicks "Connect Wallet"</p>
            <p className="text-sm text-blue-700">Modal wallet selection opens</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            2
          </div>
          <div>
            <p className="font-medium text-blue-900">User selects "DApps Portal"</p>
            <p className="text-sm text-blue-700">DApps Portal SDK modal opens with wallet options</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            3
          </div>
          <div>
            <p className="font-medium text-blue-900">User selects "OKX Wallet" from DApps Portal</p>
            <p className="text-sm text-blue-700">OKX connection modal appears (as shown in image)</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            ✓
          </div>
          <div>
            <p className="font-medium text-green-900">Connection successful</p>
            <p className="text-sm text-green-700">Wallet connected and ready to use</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> DApps Portal SDK should always be the first choice, 
          then user can select OKX or other wallets from within the DApps Portal interface.
        </p>
      </div>
    </Card>
  );
};

export default WalletFlowInfo;
