import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden', className)} {...props}>
    {children}
  </div>
));
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 py-4 border-b border-gray-100 flex items-center justify-between', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-semibold text-slate-800', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
