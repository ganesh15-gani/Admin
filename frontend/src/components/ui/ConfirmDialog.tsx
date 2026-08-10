import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center pb-2 pt-4">
        <div className={`p-3 rounded-full mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
          <AlertTriangle size={24} />
        </div>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        
        <div className="flex w-full space-x-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={isDestructive ? 'danger' : 'primary'} 
            className="flex-1" 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
