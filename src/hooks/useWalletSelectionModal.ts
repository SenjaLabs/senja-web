"use client";

import { useState, useCallback } from 'react';
import { useUnifiedWallet } from './useUnifiedWallet';

interface UseWalletSelectionModalReturn {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  handleWalletConnect: () => void;
}

export const useWalletSelectionModal = (): UseWalletSelectionModalReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected } = useUnifiedWallet();

  const openModal = useCallback(() => {
    // Only open modal if wallet is not connected
    if (!isConnected) {
      setIsModalOpen(true);
    }
  }, [isConnected]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleWalletConnect = useCallback(() => {
    // This will be called when wallet is successfully connected
    closeModal();
  }, [closeModal]);

  return {
    isModalOpen,
    openModal,
    closeModal,
    handleWalletConnect,
  };
};
