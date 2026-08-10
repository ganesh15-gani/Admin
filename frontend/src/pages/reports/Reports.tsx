import React, { useState } from 'react';
import { BarChart, Download, FileSpreadsheet, FileText as FilePdf, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastContext';
import { delay } from '../../services/apiClient';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { settingsService } from '../../services/settingsService';

const monthlyRevenue = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 2000, profit: 9800 },
  { name: 'Apr', revenue: 2780, profit: 3908 },
  { name: 'May', revenue: 1890, profit: 4800 },
  { name: 'Jun', revenue: 2390, profit: 3800 },
  { name: 'Jul', revenue: 3490, profit: 4300 },
];

const userGrowth = [
  { name: 'Jan', hosts: 400, guests: 2400 },
  { name: 'Feb', hosts: 300, guests: 1398 },
  { name: 'Mar', hosts: 200, guests: 9800 },
  { name: 'Apr', hosts: 278, guests: 3908 },
  { name: 'May', hosts: 189, guests: 4800 },
  { name: 'Jun', hosts: 239, guests: 3800 },
  { name: 'Jul', hosts: 349, guests: 4300 },
];

const propertyTypes = [
  { name: 'Apartment', value: 400 },
  { name: 'Villa', value: 300 },
  { name: 'Cabin', value: 300 },
  { name: 'Condo', value: 200 },
];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function Reports() {
  const { success } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const currencyCode = settingsService.getCurrencyCode();
  const currencyLocale = settingsService.getCurrencyLocale();
  const exchangeRate = currencyCode === 'INR' ? 83 : currencyCode === 'EUR' ? 0.9 : currencyCode === 'GBP' ? 0.8 : 1;

  const handleExport = async (type: string) => {
    setExporting(type);
    await delay(1500);
    success(`${type} report exported successfully.`);
    setExporting(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currencyLocale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value * exchangeRate);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <BarChart className="mr-2 text-brand-600" /> Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Analyze platform metrics and export detailed data.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('CSV')} isLoading={exporting === 'CSV'}>
            <FileSpreadsheet size={16} className="mr-2 text-green-600" /> Export All (CSV)
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')} isLoading={exporting === 'PDF'}>
            <FilePdf size={16} className="mr-2 text-red-600" /> Executive Summary (PDF)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp size={18} className="mr-2 text-brand-500" /> Revenue vs Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => formatCurrency(val)} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [formatCurrency(value), '']}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Total Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg flex items-center">
              <Users size={18} className="mr-2 text-brand-500" /> User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={userGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="guests" fill="#8b5cf6" name="New Guests" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hosts" fill="#f59e0b" name="New Hosts" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Property Breakdown */}
        <Card className="border-gray-100 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg flex items-center">
              <BarChart size={18} className="mr-2 text-brand-500" /> Property Types Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {propertyTypes.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
