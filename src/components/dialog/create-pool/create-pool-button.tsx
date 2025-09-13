"use client";

import React, { useState, memo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePoolDialog } from './create-pool-dialog';

interface CreatePoolButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const CreatePoolButton = memo(function CreatePoolButton({
  onSuccess,
  className = "",
}: CreatePoolButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className={`flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      >
        <Plus className="h-4 w-4" />
        Create Pool
      </Button>

      <CreatePoolDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
});
