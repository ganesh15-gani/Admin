import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle, FileText, Filter } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { type Payment } from '../../types';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';

export default function PaymentList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    paymentId: string | null;
    action: 'refund' | 'retry' | 'payout' | null;
    isProcessing: boolean;
  }>({ isOpen: false, paymentId: null, action: null, isProcessing: false });

  const { success, error } = useToast();

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (err) {
      error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const openConfirm = (id: string, action: 'refund' | 'retry' | 'payout') => {
    setConfirmState({ isOpen: true, paymentId: id, action, isProcessing: false });
  };

  const handleConfirmAction = async () => {
    const { paymentId, action } = confirmState;
    if (!paymentId || !action) return;

    setConfirmState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (action === 'refund') {
        await paymentService.processRefund(paymentId);
        success('Refund processed successfully');
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Refunded' as any } : p));
      } else if (action === 'retry') {
        await paymentService.retryPayment(paymentId);
        success('Payment retry successful');
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Completed' as any } : p));
      } else if (action === 'payout') {
        await paymentService.approvePayout(paymentId);
        success('Vendor payout approved');
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Completed' as any } : p));
      }
    } catch (err) {
      error(`Failed to ${action} payment`);
    } finally {
      setConfirmState({ isOpen: false, paymentId: null, action: null, isProcessing: false });
    }
  };

  const filteredPayments = payments.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const columns: Column<Payment>[] = [
    {
      header: 'Transaction ID',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-brand-600">{row.id}</span>
          <span className="text-xs text-slate-500">{new Date(row.date).toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{row.description}</span>
          <span className="text-xs text-slate-500">Ref: {row.referenceId}</span>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className={`font-semibold ${row.type === 'Payout' || row.type === 'Refund' ? 'text-red-600' : 'text-green-600'}`}>
          {row.type === 'Payout' || row.type === 'Refund' ? '-' : '+'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => {
        const icons: any = { Booking: <ArrowDownRight size={14} className="mr-1" />, Payout: <ArrowUpRight size={14} className="mr-1" />, Refund: <RefreshCw size={14} className="mr-1" />, Fee: <DollarSign size={14} className="mr-1" /> };
        const colors: any = { Booking: 'text-green-600 bg-green-50', Payout: 'text-orange-600 bg-orange-50', Refund: 'text-blue-600 bg-blue-50', Fee: 'text-purple-600 bg-purple-50' };
        return (
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors[row.type]}`}>
            {icons[row.type]}
            {row.type}
          </div>
        );
      },
    },
    {
      header: 'Method',
      accessor: (row) => (
        <div className="flex items-center text-sm text-slate-600">
          <CreditCard size={14} className="mr-1.5 text-slate-400" />
          {row.method}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => {
        const variants: any = { Completed: 'success', Pending: 'warning', Failed: 'danger', Refunded: 'default' };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center space-x-2">
          <button className="p-1 text-slate-400 hover:text-brand-600 transition-colors" title="View Receipt">
            <FileText size={16} />
          </button>
          
          {row.status === 'Completed' && row.type === 'Booking' && (
            <button 
              className="p-1 text-slate-400 hover:text-red-600 transition-colors" 
              title="Issue Refund"
              onClick={() => openConfirm(row.id, 'refund')}
            >
              <RefreshCw size={16} />
            </button>
          )}

          {row.status === 'Failed' && (
            <button 
              className="p-1 text-slate-400 hover:text-brand-600 transition-colors" 
              title="Retry Payment"
              onClick={() => openConfirm(row.id, 'retry')}
            >
              <RefreshCw size={16} />
            </button>
          )}

          {row.type === 'Payout' && row.status === 'Pending' && (
            <button 
              className="p-1 text-slate-400 hover:text-green-600 transition-colors" 
              title="Approve Payout"
              onClick={() => openConfirm(row.id, 'payout')}
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments & Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage bookings revenue, vendor payouts, and refunds.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredPayments} 
        keyExtractor={(item) => item.id}
        isLoading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by ID, ref, or description..."
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => !confirmState.isProcessing && setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={confirmState.isProcessing}
        title={
          confirmState.action === 'refund' ? 'Process Refund' : 
          confirmState.action === 'retry' ? 'Retry Payment' : 'Approve Payout'
        }
        message={
          confirmState.action === 'refund' ? 'Are you sure you want to issue a refund for this transaction?' :
          confirmState.action === 'retry' ? 'Are you sure you want to retry this failed payment?' :
          'Are you sure you want to approve this vendor payout? Funds will be transferred to their bank account.'
        }
        confirmText={
          confirmState.action === 'refund' ? 'Refund' : 
          confirmState.action === 'retry' ? 'Retry' : 'Approve Payout'
        }
        isDestructive={confirmState.action === 'refund'}
      />
    </div>
  );
}
