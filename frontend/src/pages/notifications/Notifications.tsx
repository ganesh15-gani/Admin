import React, { useState } from 'react';
import { Bell, Send, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastContext';
import { delay } from '../../services/apiClient';

export default function Notifications() {
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const { success, error } = useToast();

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      error('Please enter both title and body for the notification.');
      return;
    }
    
    setIsSending(true);
    try {
      await delay(1200);
      success('Broadcast notification sent successfully!');
      setTitle('');
      setBody('');
    } catch (err) {
      error('Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Bell className="mr-2 text-brand-600" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage system alerts and push notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-gray-100 shadow-sm h-full">
            <CardHeader className="border-b border-gray-50">
              <CardTitle>Recent System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                <div className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                  <div className="mt-1 text-yellow-500"><AlertTriangle size={20} /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">High Server Load</h4>
                    <p className="text-xs text-slate-500 mt-1">Server CPU usage exceeded 85% for 5 minutes.</p>
                    <p className="text-xs text-slate-400 mt-1">10 mins ago</p>
                  </div>
                </div>
                <div className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                  <div className="mt-1 text-blue-500"><Info size={20} /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Database Backup Complete</h4>
                    <p className="text-xs text-slate-500 mt-1">Automated daily backup completed successfully.</p>
                    <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                  <div className="mt-1 text-green-500"><CheckCircle size={20} /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">System Update Applied</h4>
                    <p className="text-xs text-slate-500 mt-1">Version 2.4.1 was deployed successfully.</p>
                    <p className="text-xs text-slate-400 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50 bg-brand-50/50">
              <CardTitle className="text-brand-800 text-sm">Send Push Notification</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Audience</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all">
                    <option>All Users</option>
                    <option>Hosts Only</option>
                    <option>Guests Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Message Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                    placeholder="e.g. Summer Sale!" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Message Body</label>
                  <textarea 
                    rows={3} 
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all" 
                    placeholder="Enter notification content..."
                  ></textarea>
                </div>
                <Button 
                  variant="primary" 
                  className="w-full flex justify-center items-center"
                  onClick={handleSend}
                  isLoading={isSending}
                >
                  <Send size={16} className="mr-2" /> Send Broadcast
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
