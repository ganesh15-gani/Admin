import React, { useEffect, useState } from 'react';
import { Landmark, CheckCircle, XCircle, ExternalLink, ShieldCheck, Clock, Ban, Filter } from 'lucide-react';
import { bankApprovalService, type BankAccount } from '../../services/bankApprovalService';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';
import { DocumentViewModal } from './DocumentViewModal';
import { StatCard } from '../dashboard/components/StatCard';

type FilterType = 'All' | 'Pending' | 'Linked' | 'Rejected';

export default function BankApprovals() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  
  // Dialog states
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    accountId: string | null;
    action: 'approve' | 'reject' | null;
    isProcessing: boolean;
  }>({ isOpen: false, accountId: null, action: null, isProcessing: false });

  const [documentModalState, setDocumentModalState] = useState<{
    isOpen: boolean;
    account: BankAccount | null;
  }>({ isOpen: false, account: null });

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

  const openDocumentModal = (account: BankAccount) => {
    setDocumentModalState({ isOpen: true, account });
  };

  const handleConfirmAction = async (overrideId?: string, overrideAction?: 'approve' | 'reject') => {
    const accountId = overrideId || confirmState.accountId;
    const action = overrideAction || confirmState.action;
    
    if (!accountId || !action) return;

    if (!overrideId) setConfirmState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (action === 'approve') {
        await bankApprovalService.approveAccount(accountId);
        success('Bank account approved and linked successfully');
      } else if (action === 'reject') {
        await bankApprovalService.rejectAccount(accountId);
        success('Bank account rejected');
      }
      
      const newStatus = action === 'approve' ? 'Linked' : 'Rejected';
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: newStatus } : a));
      
      if (documentModalState.isOpen) {
        setDocumentModalState({ isOpen: false, account: null });
      }
    } catch (err) {
      error(`Failed to ${action} bank account`);
    } finally {
      if (!overrideId) setConfirmState({ isOpen: false, accountId: null, action: null, isProcessing: false });
    }
  };

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = 
      a.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.accountHolder.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeFilter === 'All' || a.status === activeFilter;
    
    return matchesSearch && matchesTab;
  });

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
          <div className="font-mono text-sm tracking-widest text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-inner inline-block">
            {row.accountNumber}
          </div>
          <div className="text-xs text-slate-500 mt-1.5 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5"></span>
            {row.accountHolder}
          </div>
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
            onClick={(e) => { e.stopPropagation(); openDocumentModal(row); }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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

  const pendingCount = accounts.filter(a => a.status === 'Pending').length;
  const linkedCount = accounts.filter(a => a.status === 'Linked').length;
  const rejectedCount = accounts.filter(a => a.status === 'Rejected').length;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <Landmark className="mr-2 text-indigo-600" /> Bank Approvals
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve vendor bank accounts for payouts.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Pending Reviews" 
          value={pendingCount.toString()} 
          icon={<Clock size={24} className="text-amber-600" />} 
          trend={-12} 
        />
        <StatCard 
          title="Linked Accounts" 
          value={linkedCount.toString()} 
          icon={<ShieldCheck size={24} className="text-green-600" />} 
          trend={8} 
        />
        <StatCard 
          title="Rejected" 
          value={rejectedCount.toString()} 
          icon={<Ban size={24} className="text-red-600" />} 
          trend={-2} 
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['All', 'Pending', 'Linked', 'Rejected'] as FilterType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === tab 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {tab} {tab !== 'All' && <span className="ml-1.5 text-xs bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-500">
              {tab === 'Pending' ? pendingCount : tab === 'Linked' ? linkedCount : rejectedCount}
            </span>}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredAccounts}
        keyExtractor={(row) => row.id}
        isLoading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by vendor, bank, or account holder..."
        emptyMessage={searchQuery ? "No accounts match your search." : `No ${activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} bank accounts found.`}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => !confirmState.isProcessing && setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => handleConfirmAction()}
        title={confirmState.action === 'approve' ? 'Approve Bank Account' : 'Reject Bank Account'}
        message={
          confirmState.action === 'approve' 
            ? 'Are you sure you want to approve and link this bank account? The vendor will be able to receive payouts.' 
            : 'Are you sure you want to reject this bank account? The vendor will need to submit new details.'
        }
        confirmText={confirmState.action === 'approve' ? 'Approve & Link' : 'Reject Account'}
        isDestructive={confirmState.action === 'reject'}
        isLoading={confirmState.isProcessing}
      />

      <DocumentViewModal
        isOpen={documentModalState.isOpen}
        onClose={() => setDocumentModalState({ isOpen: false, account: null })}
        account={documentModalState.account}
        onApprove={() => handleConfirmAction(documentModalState.account?.id, 'approve')}
        onReject={() => handleConfirmAction(documentModalState.account?.id, 'reject')}
      />
    </div>
  );
}
