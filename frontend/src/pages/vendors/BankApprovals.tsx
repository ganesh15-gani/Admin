import React, { useState } from 'react';
import { Landmark, CheckCircle, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { delay } from '../../services/apiClient';

interface BankRequest {
  id: string;
  vendorName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  status: 'Pending' | 'Linked' | 'Rejected';
}

const initialRequests: BankRequest[] = [
  {
    id: 'req-1',
    vendorName: 'Global Stays LLC',
    bankName: 'HDFC Bank',
    accountType: 'Current Account',
    accountNumber: '**** **** 4592',
    accountHolder: 'Robert Johnson',
    status: 'Pending'
  },
  {
    id: 'req-2',
    vendorName: 'City Escapes',
    bankName: 'ICICI Bank',
    accountType: 'Savings Account',
    accountNumber: '**** **** 1103',
    accountHolder: 'Alice Smith',
    status: 'Pending'
  }
];

export default function BankApprovals() {
  const [requests, setRequests] = useState<BankRequest[]>(initialRequests);
  
  // Dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    requestId: string | null;
    action: 'approve' | 'reject' | null;
    isProcessing: boolean;
  }>({ isOpen: false, requestId: null, action: null, isProcessing: false });

  const { success, error } = useToast();

  const openConfirm = (id: string, action: 'approve' | 'reject') => {
    setConfirmState({ isOpen: true, requestId: id, action, isProcessing: false });
  };

  const handleConfirmAction = async () => {
    const { requestId, action } = confirmState;
    if (!requestId || !action) return;

    setConfirmState(prev => ({ ...prev, isProcessing: true }));

    try {
      await delay(1200); // Simulate network/Razorpay API call
      
      if (action === 'approve') {
        setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'Linked' } : req));
        success('Bank account successfully linked to Razorpay Payouts!');
      } else {
        setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'Rejected' } : req));
        success('Bank linking request rejected.');
      }
    } catch (err) {
      error(`Failed to ${action} request`);
    } finally {
      setConfirmState({ isOpen: false, requestId: null, action: null, isProcessing: false });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Landmark className="mr-2 text-brand-600" /> Bank Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review vendor bank details to link with Razorpay payouts.</p>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
          <CardTitle>Account Linking Requests</CardTitle>
          <Badge variant="info">{requests.filter(r => r.status === 'Pending').length} Pending</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {requests.map((request) => (
              <div key={request.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-slate-800 text-lg">{request.vendorName}</h3>
                    <Badge 
                      variant={request.status === 'Linked' ? 'success' : request.status === 'Rejected' ? 'danger' : 'warning'}
                    >
                      {request.status === 'Pending' ? 'Action Required' : request.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div className="flex text-slate-600">
                      <span className="w-24 text-slate-400">Bank:</span>
                      <span className="font-medium text-slate-700">{request.bankName}</span>
                    </div>
                    <div className="flex text-slate-600">
                      <span className="w-24 text-slate-400">Type:</span>
                      <span className="font-medium text-slate-700">{request.accountType}</span>
                    </div>
                    <div className="flex text-slate-600">
                      <span className="w-24 text-slate-400">Account:</span>
                      <span className="font-medium text-slate-700 font-mono tracking-wider">{request.accountNumber}</span>
                    </div>
                    <div className="flex text-slate-600">
                      <span className="w-24 text-slate-400">Holder:</span>
                      <span className="font-medium text-slate-700">{request.accountHolder}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 self-start md:self-center shrink-0">
                  {request.status === 'Pending' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 hover:border-red-200"
                        onClick={() => openConfirm(request.id, 'reject')}
                      >
                        <XCircle size={14} className="mr-1" /> Reject
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="bg-brand-600 hover:bg-brand-700 text-white"
                        onClick={() => openConfirm(request.id, 'approve')}
                      >
                        <ExternalLink size={14} className="mr-1" /> Link to Razorpay
                      </Button>
                    </>
                  ) : request.status === 'Linked' ? (
                    <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg font-medium text-sm border border-green-100">
                      <ShieldCheck size={18} className="mr-2" />
                      Razorpay Active
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => !confirmState.isProcessing && setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={confirmState.isProcessing}
        title={confirmState.action === 'approve' ? 'Link Bank Account' : 'Reject Request'}
        message={
          confirmState.action === 'approve' 
            ? 'This will initiate a secure connection to Razorpay to link this vendor\'s bank account. They will be authorized to receive payouts. Proceed?' 
            : 'Are you sure you want to reject this linking request? The vendor will need to submit new details.'
        }
        confirmText={confirmState.action === 'approve' ? 'Confirm & Link' : 'Reject Request'}
        isDestructive={confirmState.action === 'reject'}
      />
    </div>
  );
}
