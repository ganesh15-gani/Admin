import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, FileText, Ban, Filter, ArrowRightLeft } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { type Booking } from '../../types';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';
import { cn } from '../../utils/cn';

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    action: 'approve' | 'cancel' | 'refund' | null;
    isProcessing: boolean;
  }>({ isOpen: false, bookingId: null, action: null, isProcessing: false });

  const { success, error } = useToast();

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const openConfirm = (id: string, action: 'approve' | 'cancel' | 'refund') => {
    setConfirmState({ isOpen: true, bookingId: id, action, isProcessing: false });
  };

  const handleConfirmAction = async () => {
    const { bookingId, action } = confirmState;
    if (!bookingId || !action) return;

    setConfirmState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (action === 'approve') {
        await bookingService.approveBooking(bookingId);
        success('Booking approved successfully');
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Confirmed' as any } : b));
      } else if (action === 'cancel') {
        await bookingService.cancelBooking(bookingId);
        success('Booking cancelled');
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' as any, paymentStatus: 'Refunded' as any } : b));
      } else if (action === 'refund') {
        await bookingService.refundBooking(bookingId);
        success('Refund processed');
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' as any, paymentStatus: 'Refunded' as any } : b));
      }
    } catch (err) {
      error(`Failed to ${action} booking`);
    } finally {
      setConfirmState({ isOpen: false, bookingId: null, action: null, isProcessing: false });
    }
  };

  const tabs = ['All', 'Pending', 'Confirmed', 'Upcoming', 'Active', 'Completed', 'Cancelled', 'Refund Requested'];

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || b.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const columns: Column<Booking>[] = [
    {
      header: 'Booking ID',
      accessor: (row) => <span className="font-semibold text-brand-600">{row.id}</span>,
    },
    {
      header: 'Customer',
      accessor: 'customerName',
    },
    {
      header: 'Property & Vendor',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{row.propertyTitle}</span>
          <span className="text-xs text-slate-500">{row.vendorName}</span>
        </div>
      ),
    },
    {
      header: 'Dates',
      accessor: (row) => (
        <div className="flex flex-col text-xs text-slate-600">
          <span>In: {row.checkIn}</span>
          <span>Out: {row.checkOut}</span>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => <span className="font-medium text-slate-800">{formatCurrency(row.amount)}</span>,
    },
    {
      header: 'Payment',
      accessor: (row) => {
        const variants: any = { Paid: 'success', Pending: 'warning', Failed: 'danger', Refunded: 'default' };
        return <Badge variant={variants[row.paymentStatus]}>{row.paymentStatus}</Badge>;
      },
    },
    {
      header: 'Status',
      accessor: (row) => {
        const variants: any = { 
          Pending: 'warning', Confirmed: 'info', Upcoming: 'info', 
          Active: 'success', Completed: 'default', Cancelled: 'danger', 'Refund Requested': 'warning'
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center space-x-2">
          <button className="p-1 text-slate-400 hover:text-brand-600 transition-colors" title="View Details">
            <FileText size={16} />
          </button>
          
          {row.status === 'Pending' && (
            <button 
              className="p-1 text-slate-400 hover:text-green-600 transition-colors" 
              title="Approve"
              onClick={() => openConfirm(row.id, 'approve')}
            >
              <CheckCircle size={16} />
            </button>
          )}

          {(row.status === 'Pending' || row.status === 'Confirmed') && (
            <button 
              className="p-1 text-slate-400 hover:text-red-600 transition-colors" 
              title="Cancel Booking"
              onClick={() => openConfirm(row.id, 'cancel')}
            >
              <Ban size={16} />
            </button>
          )}

          {row.status === 'Refund Requested' && (
            <button 
              className="p-1 text-slate-400 hover:text-orange-600 transition-colors" 
              title="Process Refund"
              onClick={() => openConfirm(row.id, 'refund')}
            >
              <ArrowRightLeft size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage reservations, cancellations, and refunds.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab 
                ? "border-brand-600 text-brand-600" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable 
        columns={columns} 
        data={filteredBookings} 
        keyExtractor={(item) => item.id}
        isLoading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by ID or Customer..."
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => !confirmState.isProcessing && setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={confirmState.isProcessing}
        title={
          confirmState.action === 'approve' ? 'Approve Booking' : 
          confirmState.action === 'cancel' ? 'Cancel Booking' : 'Process Refund'
        }
        message={
          confirmState.action === 'approve' ? 'Are you sure you want to confirm this booking?' :
          confirmState.action === 'cancel' ? 'Are you sure you want to cancel this booking? A refund may be automatically issued depending on the policy.' :
          'Are you sure you want to approve this refund request? Funds will be returned to the customer.'
        }
        confirmText={
          confirmState.action === 'approve' ? 'Approve' : 
          confirmState.action === 'cancel' ? 'Cancel Booking' : 'Process Refund'
        }
        isDestructive={confirmState.action === 'cancel' || confirmState.action === 'refund'}
      />
    </div>
  );
}
