import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
}

export function StatCard({ title, value, icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 w-full">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
              <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4"></div>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline space-x-3">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h2>
          {trend !== undefined && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
                trend >= 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
              )}
            >
              {trend >= 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
