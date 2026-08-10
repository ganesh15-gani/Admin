import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Globe, Lock, CreditCard, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastContext';
import { delay } from '../../services/apiClient';
import { settingsService, type AppSettings } from '../../services/settingsService';

type Tab = 'General' | 'Security' | 'Billing';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());

  // General Form State
  const [generalForm, setGeneralForm] = useState({
    platformName: settings.platformName,
    supportEmail: settings.supportEmail,
    currency: settings.currency,
    timezone: settings.timezone
  });

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    requireMFA: settings.requireMFA,
    sessionTimeout: settings.sessionTimeout
  });

  // Billing Form State
  const [billingForm, setBillingForm] = useState({
    commissionRate: settings.commissionRate,
    payoutSchedule: settings.payoutSchedule
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await delay(800); // Simulate API save
      
      let toSave = {};
      if (activeTab === 'General') toSave = generalForm;
      if (activeTab === 'Security') toSave = securityForm;
      if (activeTab === 'Billing') toSave = billingForm;

      settingsService.saveSettings(toSave);
      setSettings(settingsService.getSettings()); // update local state
      
      success(`${activeTab} settings saved successfully!`);
    } catch (err) {
      error(`Failed to save ${activeTab.toLowerCase()} settings.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <SettingsIcon className="mr-2 text-brand-600" /> Platform Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure global platform preferences.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
          <Save size={16} className="mr-2" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1">
          <button 
            onClick={() => setActiveTab('General')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'General' ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-50 text-slate-600'
            }`}
          >
            <Globe size={18} /> <span>General</span>
          </button>
          <button 
            onClick={() => setActiveTab('Security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'Security' ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-50 text-slate-600'
            }`}
          >
            <Lock size={18} /> <span>Security</span>
          </button>
          <button 
            onClick={() => setActiveTab('Billing')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'Billing' ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-50 text-slate-600'
            }`}
          >
            <CreditCard size={18} /> <span>Billing Config</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card className="border-gray-100 shadow-sm animate-fade-in" key={activeTab}>
            <CardHeader className="border-b border-gray-50">
              <CardTitle>{activeTab} Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* General Tab */}
              {activeTab === 'General' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Platform Name</label>
                      <input 
                        type="text" 
                        value={generalForm.platformName}
                        onChange={(e) => setGeneralForm({...generalForm, platformName: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Support Email</label>
                      <input 
                        type="email" 
                        value={generalForm.supportEmail}
                        onChange={(e) => setGeneralForm({...generalForm, supportEmail: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Default Currency</label>
                      <select 
                        value={generalForm.currency}
                        onChange={(e) => setGeneralForm({...generalForm, currency: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-shadow cursor-pointer"
                      >
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                        <option value="INR (₹)">INR (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Timezone</label>
                      <select 
                        value={generalForm.timezone}
                        onChange={(e) => setGeneralForm({...generalForm, timezone: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-shadow cursor-pointer"
                      >
                        <option>UTC (Coordinated Universal Time)</option>
                        <option>EST (Eastern Standard Time)</option>
                        <option>PST (Pacific Standard Time)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Security Tab */}
              {activeTab === 'Security' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-brand-50 rounded-xl border border-brand-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-900">Multi-Factor Authentication (MFA)</h4>
                        <p className="text-xs text-brand-700 mt-0.5">Require all admin staff to use two-factor authentication.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={securityForm.requireMFA}
                        onChange={(e) => setSecurityForm({...securityForm, requireMFA: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                  </div>

                  <div className="space-y-1.5 max-w-sm">
                    <label className="text-sm font-medium text-slate-700">Admin Session Timeout (Minutes)</label>
                    <select 
                      value={securityForm.sessionTimeout}
                      onChange={(e) => setSecurityForm({...securityForm, sessionTimeout: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-shadow cursor-pointer"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'Billing' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Platform Commission Rate (%)</label>
                    <input 
                      type="number" 
                      value={billingForm.commissionRate}
                      onChange={(e) => setBillingForm({...billingForm, commissionRate: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" 
                    />
                    <p className="text-xs text-slate-500">Percentage taken from every successful booking.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Host Payout Schedule</label>
                    <select 
                      value={billingForm.payoutSchedule}
                      onChange={(e) => setBillingForm({...billingForm, payoutSchedule: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-shadow cursor-pointer"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Bi-Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
