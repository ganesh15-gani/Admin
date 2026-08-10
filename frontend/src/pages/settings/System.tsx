import React from 'react';
import { Server, Activity, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function System() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Server className="mr-2 text-brand-600" /> System Status
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor server health and API logs.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          All Systems Operational
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={20} /></div>
              <span className="text-sm font-medium text-slate-500">API Response</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">42ms</h2>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <CheckCircle size={12} className="mr-1" /> Excellent
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><Server size={20} /></div>
              <span className="text-sm font-medium text-slate-500">CPU Usage</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">18%</h2>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <CheckCircle size={12} className="mr-1" /> Normal Load
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Database size={20} /></div>
              <span className="text-sm font-medium text-slate-500">Uptime</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">99.9%</h2>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <CheckCircle size={12} className="mr-1" /> Last 30 Days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-sm bg-slate-900 border-none">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-slate-200 font-mono text-sm">Server Logs // live_tail</CardTitle>
        </CardHeader>
        <CardContent className="p-6 font-mono text-xs space-y-2 h-[300px] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>
          <p className="text-green-400">[OK] 2024-10-27 14:02:11 GET /api/v1/properties 200 45ms</p>
          <p className="text-green-400">[OK] 2024-10-27 14:02:13 POST /api/v1/auth/login 200 120ms</p>
          <p className="text-yellow-400">[WARN] 2024-10-27 14:02:14 Rate limit approaching for IP 192.168.1.1</p>
          <p className="text-green-400">[OK] 2024-10-27 14:02:15 GET /api/v1/users 200 65ms</p>
          <p className="text-green-400">[OK] 2024-10-27 14:02:18 POST /api/v1/bookings 201 210ms</p>
          <p className="text-slate-400">[INFO] 2024-10-27 14:02:20 CRON Worker executed successfully</p>
        </CardContent>
      </Card>
    </div>
  );
}
