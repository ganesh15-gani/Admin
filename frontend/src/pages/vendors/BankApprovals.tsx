import React, { useEffect, useState } from 'react';
import { Landmark, CheckCircle, XCircle, ExternalLink, ShieldCheck, Clock, Ban } from 'lucide-react';
import { bankApprovalService, type BankAccount } from '../../services/bankApprovalService';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';

export default function BankApprovals() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    accountId: string | null;
    action: 'approve' | 'reject' | null;
    isProcessing: boolean;
  }>({ isOpen: false, accountId: null, action: null, isProcessing: false });

  const { success, error } = useToast();

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await bankApprovalService.getBankAccounts();
      setAccounts(data);
    } catch (err) {
      error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const openConfirm = (id: string, action: 'approve' | 'reject') => {
    setConfirmState({ isOpen: true, accountId: id, action, isProcessing: false });
  };

  const handleConfirmAction = async () => {
    const { accountId, action } = confirmState;
    if (!accountId || !action) return;

    setConfirmState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (action === 'approve') {
        await bankApprovalService.approveAccount(accountId);
        success('Bank account approved and linked successfully');
      } else if (action === 'reject') {
        await bankApprovalService.rejectAccount(accountId);
        success('Bank account rejected');
      }
      
      // Update local state without reloading everything for better UX
      const newStatus = action === 'approve' ? 'Linked' : 'Rejected';
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: newStatus } : a));
    } catch (err) {
      error(`Failed to ${action} bank account`);
    } finally {
      setConfirmState({ isOpen: false, accountId: null, action: null, isProcessing: false });
    }
  };

  const filteredAccounts = accounts.filter(a => 
    a.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.accountHolder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<BankAccount>[] = [
    {
      header: 'Vendor',
      accessor: (row) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 shadow-sm border border-indigo-100">
            <Landmark size={20} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{row.vendorName}</div>
            <div className="text-xs text-slate-500">ID: {row.id.substring(0, 8)}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Bank Details',
      accessor: (row) => (
        <div>
          <div className="font-medium text-slate-800">{row.bankName}</div>
          <div className="text-xs text-slate-500">{row.accountType}</div>
        </div>
      )
    },
    {
      header: 'Account Info',
      accessor: (row) => (
        <div>
          <div className="font-mono text-sm text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
            {row.accountNumber}
          </div>
          <div className="text-xs text-slate-500 mt-1">{row.accountHolder}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => {
        if (row.status === 'Linked') return <Badge variant="success">Linked</Badge>;
        if (row.status === 'Rejected') return <Badge variant="danger">Rejected</Badge>;
        return <Badge variant="warning">Pending Review</Badge>;
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex justify-end space-x-2">
          <button 
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="View Document"
          >
            <ExternalLink size={18} />
          </button>
          {row.status === 'Pending' && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); openConfirm(row.id, 'approve'); }}
                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Approve Account"
              >
                <CheckCircle size={18} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); openConfirm(row.id, 'reject'); }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject Account"
              >
                <XCircle size={18} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  // Calculate pending count for header
  const pendingCount = accounts.filter(a => a.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Landmark className="mr-2 text-indigo-600" /> Bank Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review and approve vendor bank accounts for payouts.</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg flex items-center text-sm font-medium">
            <Clock size={16} className="mr-2 text-amber-500" />
            {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredAccounts}
        keyExtractor={(row) => row.id}
        isLoading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by vendor, bank, or account holder..."
        emptyMessage={searchQuery ? "No accounts match your search." : "No bank accounts found."}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => !confirmState.isProcessing && setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={
          confirmState.action === 'approve' ? 'Approve Bank Account' : 'Reject Bank Account'
        }
        message={
          confirmState.action === 'approve' 
            ? 'Are you sure you want to approve and link this bank account? The vendor will be able to receive payouts.' 
            : 'Are you sure you want to reject this bank account? The vendor will need to submit new details.'
        }
        confirmText={
          confirmState.action === 'approve' ? 'Approve & Link' : 'Reject Account'
        }
        isDestructive={confirmState.action === 'reject'}
        isLoading={confirmState.isProcessing}
      />
    </div>
  );
}
