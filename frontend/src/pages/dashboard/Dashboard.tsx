import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Users, Home, Calendar, DollarSign, Store, Clock, LifeBuoy, AlertTriangle } from 'lucide-react';
import { dashboardService, type DashboardMetrics, type TimeFilter } from '../../services/dashboardService';
import { authService } from '../../services/authService';
import { settingsService } from '../../services/settingsService';
import { StatCard } from './components/StatCard';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('This Year');
  const [currencySettings, setCurrencySettings] = useState({
    code: settingsService.getCurrencyCode(),
    locale: settingsService.getCurrencyLocale()
  });
  
  const { success, error } = useToast();
  const user = authService.getCurrentUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = async (filter: TimeFilter = timeFilter) => {
    try {
      setLoading(true);
      const [metricsData, revenueData] = await Promise.all([
        dashboardService.getMetrics(filter),
        dashboardService.getRevenueData(filter)
      ]);
      setMetrics(metricsData);
      setChartData(revenueData);
    } catch (err) {
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Listen for setting changes
    const handleSettingsUpdate = () => {
      setCurrencySettings({
        code: settingsService.getCurrencyCode(),
        locale: settingsService.getCurrencyLocale()
      });
    };
    window.addEventListener('settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings_updated', handleSettingsUpdate);
  }, [timeFilter]);

  const handleRefresh = () => {
    loadData();
    success('Dashboard refreshed successfully');
  };

  const formatCurrency = (value: number) => {
    // Basic exchange rate simulation for visual consistency (1 USD = 83 INR, etc)
    let exchangeRate = 1;
    if (currencySettings.code === 'INR') exchangeRate = 83;
    if (currencySettings.code === 'EUR') exchangeRate = 0.9;
    if (currencySettings.code === 'GBP') exchangeRate = 0.8;

    return new Intl.NumberFormat(currencySettings.locale, {
      style: 'currency',
      currency: currencySettings.code,
      maximumFractionDigits: 0,
    }).format(value * exchangeRate);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {getGreeting()}, {user?.name.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening across StayZen today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
          >
            <option value="Today">Today</option>
            <option value="7 Days">7 Days</option>
            <option value="30 Days">30 Days</option>
            <option value="This Year">This Year</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => success('Export started')}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm" onClick={handleRefresh} isLoading={loading}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Users" 
          value={metrics ? metrics.totalUsers.toLocaleString() : '0'} 
          trend={metrics?.trends.users}
          icon={<Users size={20} />} 
          loading={loading}
        />
        <StatCard 
          title="Total Properties" 
          value={metrics ? metrics.totalProperties.toLocaleString() : '0'} 
          trend={metrics?.trends.properties}
          icon={<Home size={20} />} 
          loading={loading}
        />
        <StatCard 
          title="Active Bookings" 
          value={metrics ? metrics.activeBookings.toLocaleString() : '0'} 
          trend={metrics?.trends.bookings}
          icon={<Calendar size={20} />} 
          loading={loading}
        />
        <StatCard 
          title="Total Revenue" 
          value={metrics ? formatCurrency(metrics.totalRevenue) : '$0'} 
          trend={metrics?.trends.revenue}
          icon={<DollarSign size={20} />} 
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors border-gray-100 shadow-sm rounded-xl">
          <Home size={20} className="text-brand-500" />
          <span className="text-xs font-medium">Add Property</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors border-gray-100 shadow-sm rounded-xl">
          <Users size={20} className="text-blue-500" />
          <span className="text-xs font-medium">Manage Users</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors border-gray-100 shadow-sm rounded-xl">
          <Calendar size={20} className="text-orange-500" />
          <span className="text-xs font-medium">View Bookings</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col justify-center items-center gap-1 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors border-gray-100 shadow-sm rounded-xl">
          <DollarSign size={20} className="text-purple-500" />
          <span className="text-xs font-medium">Process Payouts</span>
        </Button>
      </div>

      {/* Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-500 mr-1"></div> {timeFilter}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[320px] w-full">
              {loading ? (
                <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm h-full flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="divide-y divide-gray-50 h-[320px] overflow-y-auto">
                <div className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-brand-500 ring-4 ring-brand-50 group-hover:ring-brand-100 transition-all"></div></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">New Booking Confirmed</p>
                    <p className="text-xs text-slate-500 mt-0.5">Luxury Villa with Pool - $1,200</p>
                    <p className="text-xs text-slate-400 mt-1">10 minutes ago</p>
                  </div>
                </div>
                <div className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all"></div></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">New User Registered</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sarah Jenkins created a host account</p>
                    <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                  </div>
                </div>
                <div className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-orange-500 ring-4 ring-orange-50 group-hover:ring-orange-100 transition-all"></div></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Property Needs Review</p>
                    <p className="text-xs text-slate-500 mt-0.5">Downtown Studio Apartment uploaded</p>
                    <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-50 group-hover:ring-red-100 transition-all"></div></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Refund Processed</p>
                    <p className="text-xs text-slate-500 mt-0.5">Booking #SZ10294 refunded ($450)</p>
                    <p className="text-xs text-slate-400 mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
