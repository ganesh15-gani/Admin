import React, { useEffect, useState } from 'react';
import { Home, CheckCircle, XCircle, Ban, Eye, Filter, Users, BedDouble, Bath, MapPin, Phone, Mail, Plus, Trash2 } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { type Property, type PropertyStatus } from '../../types';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/ToastContext';

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    propertyId: string | null;
    action: 'approve' | 'suspend' | 'delete' | null;
    isProcessing: boolean;
  }>({ isOpen: false, propertyId: null, action: null, isProcessing: false });

  // Create modal state
  const [createModal, setCreateModal] = useState({
    isOpen: false,
    isProcessing: false,
    data: {
      title: '', location: '', price: '', type: 'Apartment', bedrooms: 1, bathrooms: 1, maxGuests: 2, description: ''
    }
  });

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    propertyId: string | null;
    reason: string;
    isProcessing: boolean;
  }>({ isOpen: false, propertyId: null, reason: '', isProcessing: false });

  // View modal state
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    property: Property | null;
  }>({ isOpen: false, property: null });

  const { success, error } = useToast();

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getProperties();
      setProperties(data);
    } catch (err) {
      error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const openConfirm = (id: string, action: 'approve' | 'suspend' | 'delete') => {
    setConfirmState({ isOpen: true, propertyId: id, action, isProcessing: false });
  };

  const handleConfirmAction = async () => {
    const { propertyId, action } = confirmState;
    if (!propertyId || !action) return;

    setConfirmState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (action === 'approve') {
        await propertyService.approveProperty(propertyId);
        success('Property approved successfully');
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: 'Approved' } : p));
      } else if (action === 'suspend') {
        await propertyService.suspendProperty(propertyId);
        success('Property suspended successfully');
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: 'Suspended' } : p));
      } else if (action === 'delete') {
        await propertyService.deleteProperty(propertyId);
        success('Property deleted successfully');
        setProperties(prev => prev.filter(p => p.id !== propertyId));
      }
    } catch (err) {
      error(`Failed to ${action} property`);
    } finally {
      setConfirmState({ isOpen: false, propertyId: null, action: null, isProcessing: false });
    }
  };

  const handleCreateProperty = async () => {
    if (!createModal.data.title || !createModal.data.location || !createModal.data.price) {
      error('Please fill in title, location, and price');
      return;
    }
    setCreateModal(prev => ({ ...prev, isProcessing: true }));
    try {
      const newProp = await propertyService.createProperty(createModal.data);
      setProperties(prev => [newProp, ...prev]);
      success('Property created successfully');
      setCreateModal({ isOpen: false, isProcessing: false, data: { title: '', location: '', price: '', type: 'Apartment', bedrooms: 1, bathrooms: 1, maxGuests: 2, description: '' } });
    } catch (err) {
      error('Failed to create property');
      setCreateModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleReject = async () => {
    if (!rejectModal.propertyId || !rejectModal.reason.trim()) {
      error('Please provide a rejection reason');
      return;
    }

    setRejectModal(prev => ({ ...prev, isProcessing: true }));
    try {
      await propertyService.rejectProperty(rejectModal.propertyId, rejectModal.reason);
      success('Property rejected');
      setProperties(prev => prev.map(p => 
        p.id === rejectModal.propertyId ? { ...p, status: 'Rejected' } : p
      ));
      setRejectModal({ isOpen: false, propertyId: null, reason: '', isProcessing: false });
    } catch (err) {
      error('Failed to reject property');
      setRejectModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const columns: Column<Property>[] = [
    {
      header: 'Property',
      accessor: (row) => (
        <div className="flex items-center space-x-4">
          {row.imageUrl ? (
            <img src={row.imageUrl} alt={row.title} className="w-16 h-12 rounded-lg shadow-sm border border-slate-200 object-cover bg-gray-100 flex-shrink-0" />
          ) : (
            <div className="w-16 h-12 rounded-lg shadow-sm border border-slate-200 bg-gray-50 flex flex-shrink-0 items-center justify-center text-gray-400">
              <Home size={20} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 group-hover:text-brand-600 transition-colors">{row.title}</span>
            <span className="text-xs text-slate-500">{row.location}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Owner',
      accessor: 'ownerName',
    },
    {
      header: 'Type',
      accessor: 'type',
    },
    {
      header: 'Price / Night',
      accessor: (row) => <span className="font-medium text-slate-800">{formatCurrency(row.price)}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => {
        const variants: Record<PropertyStatus, any> = {
          Approved: 'success',
          Pending: 'warning',
          Rejected: 'danger',
          Suspended: 'danger',
          Draft: 'default',
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors" 
            title="View Details"
            onClick={() => setViewModal({ isOpen: true, property: row })}
          >
            <Eye size={16} />
          </button>
          
          {row.status === 'Pending' && (
            <>
              <button 
                className="p-1 text-slate-400 hover:text-green-600 transition-colors" 
                title="Approve"
                onClick={() => openConfirm(row.id, 'approve')}
              >
                <CheckCircle size={16} />
              </button>
              <button 
                className="p-1 text-slate-400 hover:text-red-600 transition-colors" 
                title="Reject"
                onClick={() => setRejectModal({ isOpen: true, propertyId: row.id, reason: '', isProcessing: false })}
              >
                <XCircle size={16} />
              </button>
            </>
          )}

          {row.status === 'Approved' && (
            <button 
              className="p-1 text-slate-400 hover:text-yellow-600 transition-colors" 
              title="Suspend"
              onClick={() => openConfirm(row.id, 'suspend')}
            >
              <Ban size={16} />
            </button>
          )}
          <button 
            className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-1" 
            title="Delete"
            onClick={() => openConfirm(row.id, 'delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Properties</h1>
          <p className="text-sm text-slate-500 mt-1">Manage property listings, approvals, and quality control.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Filter size={16} />
            </div>
            <select
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white hover:bg-slate-50 cursor-pointer transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Suspended">Suspended</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setCreateModal(prev => ({ ...prev, isOpen: true }))}>
            <Plus size={16} className="mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredProperties} 
        keyExtractor={(item) => item.id}
        isLoading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by title or owner..."
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => !confirmState.isProcessing && setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={confirmState.isProcessing}
        title={confirmState.action === 'approve' ? 'Approve Property' : confirmState.action === 'suspend' ? 'Suspend Property' : 'Delete Property'}
        message={
          confirmState.action === 'approve' 
            ? 'Are you sure you want to approve this property? It will be visible to users and open for bookings.'
            : confirmState.action === 'suspend'
            ? 'Are you sure you want to suspend this property? It will be hidden from users and new bookings will be prevented.'
            : 'Are you sure you want to completely delete this property? This action cannot be undone.'
        }
        confirmText={confirmState.action === 'approve' ? 'Approve' : confirmState.action === 'suspend' ? 'Suspend' : 'Delete'}
        isDestructive={confirmState.action === 'suspend' || confirmState.action === 'delete'}
      />

      {/* Reject Modal */}
      <Modal 
        isOpen={rejectModal.isOpen} 
        onClose={() => !rejectModal.isProcessing && setRejectModal(prev => ({ ...prev, isOpen: false }))} 
        title="Reject Property"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectModal(prev => ({ ...prev, isOpen: false }))} disabled={rejectModal.isProcessing}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={rejectModal.isProcessing}>
              Reject Property
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Please provide a reason for rejecting this property. The owner will be notified.</p>
          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Rejection Reason</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="E.g., Property images do not meet quality guidelines..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {/* View Property Details Modal */}
      {viewModal.property && (
        <Modal
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, property: null })}
          title="Property Details"
          footer={
            <div className="flex justify-between w-full">
              <div className="flex space-x-2">
                {viewModal.property.status === 'Pending' && (
                  <>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setViewModal({ isOpen: false, property: null }); setRejectModal({ isOpen: true, propertyId: viewModal.property!.id, reason: '', isProcessing: false }); }}>
                      <XCircle size={16} className="mr-2" /> Reject
                    </Button>
                    <Button variant="primary" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setViewModal({ isOpen: false, property: null }); openConfirm(viewModal.property!.id, 'approve'); }}>
                      <CheckCircle size={16} className="mr-2" /> Approve
                    </Button>
                  </>
                )}
              </div>
              <Button variant="outline" onClick={() => setViewModal({ isOpen: false, property: null })}>Close</Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Header / Image */}
            <div className="flex flex-col sm:flex-row gap-5">
              {viewModal.property.imageUrl ? (
                <img src={viewModal.property.imageUrl} alt={viewModal.property.title} className="w-full sm:w-64 h-40 object-cover rounded-xl shadow-sm border border-slate-100" />
              ) : (
                <div className="w-full sm:w-64 h-40 bg-gray-50 rounded-xl border border-slate-100 flex items-center justify-center text-gray-400">
                  <Home size={32} />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">{viewModal.property.title}</h2>
                <p className="flex items-center text-sm text-slate-500 mt-1"><MapPin size={14} className="mr-1" /> {viewModal.property.location}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="info">{viewModal.property.type}</Badge>
                  <Badge variant={viewModal.property.status === 'Approved' ? 'success' : viewModal.property.status === 'Pending' ? 'warning' : 'danger'}>{viewModal.property.status}</Badge>
                  <div className="text-sm font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 ml-auto">
                    {formatCurrency(viewModal.property.price)} / night
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-4">
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                <BedDouble size={20} className="text-slate-400 mb-1" />
                <span className="text-sm font-medium text-slate-700">{viewModal.property.bedrooms || 1} Bedrooms</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                <Bath size={20} className="text-slate-400 mb-1" />
                <span className="text-sm font-medium text-slate-700">{viewModal.property.bathrooms || 1} Baths</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                <Users size={20} className="text-slate-400 mb-1" />
                <span className="text-sm font-medium text-slate-700">Max {viewModal.property.maxGuests || 2} Guests</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {viewModal.property.description || "No detailed description provided by the host."}
              </p>
            </div>

            {/* Amenities & Host Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {viewModal.property.amenities?.map((amenity, idx) => (
                    <span key={idx} className="text-xs text-slate-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                      {amenity}
                    </span>
                  )) || <span className="text-sm text-slate-500">Not specified</span>}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Host Contact</h3>
                <div className="space-y-2 text-sm text-slate-600 bg-white border border-gray-200 p-3 rounded-lg">
                  <p className="font-medium text-slate-800">{viewModal.property.ownerName}</p>
                  <p className="flex items-center"><Mail size={14} className="mr-2 text-slate-400" /> {viewModal.property.hostEmail || 'Not provided'}</p>
                  <p className="flex items-center"><Phone size={14} className="mr-2 text-slate-400" /> {viewModal.property.hostPhone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={createModal.isOpen} 
        onClose={() => !createModal.isProcessing && setCreateModal(prev => ({ ...prev, isOpen: false }))}
        title="Add New Property"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Property Title *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Luxury Villa"
                value={createModal.data.title}
                onChange={(e) => setCreateModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Location *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. New York, USA"
                value={createModal.data.location}
                onChange={(e) => setCreateModal(prev => ({ ...prev, data: { ...prev.data, location: e.target.value } }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Price per night (USD) *</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 150"
                value={createModal.data.price}
                onChange={(e) => setCreateModal(prev => ({ ...prev, data: { ...prev.data, price: e.target.value } }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Property Type</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={createModal.data.type}
                onChange={(e) => setCreateModal(prev => ({ ...prev, data: { ...prev.data, type: e.target.value } }))}
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Cabin">Cabin</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bedrooms</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={createModal.data.bedrooms}
                onChange={(e) => setCreateModal(prev => ({ ...prev, data: { ...prev.data, bedrooms: parseInt(e.target.value) || 1 } }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bathrooms</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={createModal.data.bathrooms}
                onChange={(e) => setCreateModal(prev => ({ ...prev, data: { ...prev.data, bathrooms: parseInt(e.target.value) || 1 } }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Max Guests</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={createModal.data.maxGuests}
                onChange={(e) => setCreateModal(prev => ({ ...prev, data: { ...prev.data, maxGuests: parseInt(e.target.value) || 1 } }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
              placeholder="Enter property description..."
              value={createModal.data.description}
              onChange={(e) => setCreateModal(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }))}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCreateModal(prev => ({ ...prev, isOpen: false }))} disabled={createModal.isProcessing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProperty} isLoading={createModal.isProcessing}>
              Create Property
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
