import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "block w-full rounded-lg border text-sm transition-colors",
              "focus:outline-none focus:ring-2",
              error 
                ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 placeholder-gray-400 focus:ring-brand-500 focus:border-brand-500",
              icon ? "pl-10" : "pl-3",
              "pr-3 py-2",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
