import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ActionButtons } from './ActionButtons';

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Delete Template?",
  description = "Once deleted, this template will be permanently removed. Do you wish to continue?",
  confirmLabel = "Delete",
  cancelLabel = "Exit",
  loading = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[350px] max-w-[90vw] p-0 border-[#EFEFF4] rounded-xl">
        <div className="flex flex-col gap-2 p-6 sm:p-4">
          <DialogTitle className="text-xl sm:text-lg font-semibold text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-xs text-center text-gray-500">
            {description}
          </DialogDescription>
        </div>
        
        <ActionButtons
          onDelete={onConfirm}
          onCancel={onClose}
          deleteText={confirmLabel}
          cancelText={cancelLabel}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}; 