import React from 'react';
import { Store } from 'lucide-react';

export default function Vendors() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <Store className="mr-2 text-brand-600" /> Vendor Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage property owners and host accounts.</p>
      </div>
      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-slate-400">
        Vendor module coming soon...
      </div>
    </div>
  );
}
