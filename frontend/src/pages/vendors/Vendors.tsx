import React, { useEffect, useState } from 'react';
import { Store, ShieldAlert, CheckCircle, Ban, Trash2, Edit, UserPlus, Eye, Building2 } from 'lucide-react';
import { vendorService, type Vendor } from '../../services/vendorService';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';
import { AddVendorModal } from './AddVendorModal';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    vendorId: string | null;
    action: 'suspend' | 'activate' | 'delete' | null;
    isProcessing: boolean;
  }>({ isOpen: false, vendorId: null, action: null, isProcessing: false });

  const { success, error } = useToast();

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendors();
      setVendors(data);
    } catch (err) {
      error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const openConfirm = (id: string, action: 'suspend' | 'activate' | 'delete') => {
    setConfirmState({ isOpen: true, vendorId: id, action, isProcessing: false });
  };

  const handleConfirmAction = async () => {
    const { vendorId, action } = confirmState;
    if (!vendorId || !action) return;

    setConfirmState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (action === 'suspend') {
        await vendorService.suspendVendor(vendorId);
        success('Vendor suspended successfully');
      } else if (action === 'activate') {
        await vendorService.approveVendor(vendorId);
        success('Vendor activated successfully');
      } else if (action === 'delete') {
        await vendorService.deleteVendor(vendorId);
        success('Vendor deleted successfully');
      }
      
      // Update local state without reloading everything for better UX
      if (action === 'delete') {
        setVendors(prev => prev.filter(v => v.id !== vendorId));
      } else {
        const newStatus = action === 'activate' ? 'Active' : 'Suspended';
        setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: newStatus } : v));
      }
    } catch (err) {
      error(`Failed to ${action} vendor`);
    } finally {
      setConfirmState({ isOpen: false, vendorId: null, action: null, isProcessing: false });
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.companyName && v.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns: Column<Vendor>[] = [
    {
      header: 'Vendor Details',
      accessor: (row) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-600 font-bold shadow-inner">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{row.name}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Company',
      accessor: (row) => (
        <div className="flex items-center text-slate-600">
          <Building2 size={16} className="mr-2 text-slate-400" />
          {row.companyName || 'Individual'}
        </div>
      )
    },
    {
      header: 'Properties',
      accessor: (row) => (
        <div className="font-medium text-slate-700">
          {row.propertiesCount} {row.propertiesCount === 1 ? 'Unit' : 'Units'}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={
          row.status === 'Active' ? 'success' : 
          row.status === 'Suspended' ? 'danger' : 'warning'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          {row.status === 'Active' ? (
            <button 
              onClick={(e) => { e.stopPropagation(); openConfirm(row.id, 'suspend'); }}
              className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Suspend Vendor"
            >
              <Ban size={18} />
            </button>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); openConfirm(row.id, 'activate'); }}
              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Activate Vendor"
            >
              <CheckCircle size={18} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); openConfirm(row.id, 'delete'); }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Vendor"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Store className="mr-2 text-brand-600" /> Vendor Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage property owners, agencies, and individual hosts.</p>
        </div>
        <Button className="shadow-md shadow-brand-500/20" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={18} className="mr-2" />
          Add Vendor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredVendors}
        keyExtractor={(row) => row.id}
        isLoading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search vendors by name, email, or company..."
        emptyMessage={searchQuery ? "No vendors match your search." : "No vendors found."}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => !confirmState.isProcessing && setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={
          confirmState.action === 'delete' ? 'Delete Vendor' :
          confirmState.action === 'suspend' ? 'Suspend Vendor' : 'Activate Vendor'
        }
        message={
          confirmState.action === 'delete' ? 'Are you sure you want to permanently delete this vendor? This will also affect their properties.' :
          confirmState.action === 'suspend' ? 'Are you sure you want to suspend this vendor? Their properties will be hidden from guests.' :
          'Are you sure you want to activate this vendor? Their properties will become bookable.'
        }
        confirmText={
          confirmState.action === 'delete' ? 'Delete Vendor' :
          confirmState.action === 'suspend' ? 'Suspend Vendor' : 'Activate Vendor'
        }
        isDestructive={confirmState.action === 'delete' || confirmState.action === 'suspend'}
        isLoading={confirmState.isProcessing}
      />

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newVendor) => {
          setVendors(prev => [newVendor, ...prev]);
        }}
      />
    </div>
  );
}
