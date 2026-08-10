import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((message: string) => addToast('success', message), [addToast]);
  const error = useCallback((message: string) => addToast('error', message), [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle className="text-green-500" size={20} />,
            error: <XCircle className="text-red-500" size={20} />,
            warning: <AlertCircle className="text-yellow-500" size={20} />,
            info: <Info className="text-blue-500" size={20} />,
          };
          
          const bgs = {
            success: 'bg-white border-green-200',
            error: 'bg-white border-red-200',
            warning: 'bg-white border-yellow-200',
            info: 'bg-white border-blue-200',
          };

          return (
            <div 
              key={toast.id}
              className={cn(
                "flex items-start p-4 rounded-lg shadow-lg border w-80 pointer-events-auto transform transition-all duration-300",
                bgs[toast.type]
              )}
            >
              <div className="flex-shrink-0 mr-3">{icons[toast.type]}</div>
              <div className="flex-1 text-sm text-slate-700 font-medium">{toast.message}</div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
