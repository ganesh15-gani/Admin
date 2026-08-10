import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div 
        className={cn(
          "bg-white rounded-xl shadow-xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]",
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto flex-1 text-slate-600">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-3 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
