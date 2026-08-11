import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, Key } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { type AuthUser } from '../../services/authService';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; adminId: string | null; isProcessing: boolean }>({ isOpen: false, adminId: null, isProcessing: false });

  const { success, error } = useToast();

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdmins();
      setAdmins(data);
    } catch (err) {
      error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminService.updateStatus(id, 'Active', true);
      success('Admin account approved and activated');
      loadAdmins();
    } catch (err) {
      error('Failed to approve admin');
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await adminService.updateStatus(id, 'Suspended', true);
      success('Admin account suspended');
      loadAdmins();
    } catch (err) {
      error('Failed to suspend admin');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.adminId) return;
    setDeleteConfirm(prev => ({ ...prev, isProcessing: true }));
    try {
      await adminService.updateStatus(deleteConfirm.adminId, 'Rejected', false);
      success('Admin account access revoked (rejected)');
      loadAdmins();
    } catch (err) {
      error('Failed to revoke admin access');
    } finally {
      setDeleteConfirm({ isOpen: false, adminId: null, isProcessing: false });
    }
  };

  const columns: Column<AuthUser>[] = [
    {
      header: 'Admin Staff',
      accessor: (row) => (
        <div className="flex items-center space-x-3">
          {row.avatar ? (
            <img src={row.avatar} alt={row.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-brand-200">
              {row.name.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-slate-800">{row.name}</span>
            <span className="text-xs text-slate-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role & Status',
      accessor: (row: any) => {
        const variants: any = { 'Super Admin': 'danger', 'Admin': 'success', 'Viewer': 'default' };
        return (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant={variants[row.role?.name || row.role] || 'info'}>{row.role?.name || row.role}</Badge>
              {row.role?.name === 'Super Admin' && <ShieldCheck size={14} className="text-red-500" />}
            </div>
            <div className="text-xs">
              <span className={`font-medium ${row.status === 'Active' ? 'text-green-600' : row.status === 'Pending' ? 'text-amber-500' : 'text-red-600'}`}>
                {row.status} {row.isApproved ? '(Approved)' : '(Pending)'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center space-x-2">
          {row.role?.name !== 'Super Admin' && (
            <>
              {!row.isApproved && (
                <button 
                  className="p-1.5 text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 rounded transition-colors"
                  onClick={() => handleApprove(row.id)}
                >
                  Approve
                </button>
              )}
              {row.isApproved && row.status === 'Active' && (
                <button 
                  className="p-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition-colors"
                  onClick={() => handleSuspend(row.id)}
                >
                  Suspend
                </button>
              )}
              {row.status === 'Suspended' && (
                <button 
                  className="p-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                  onClick={() => handleApprove(row.id)}
                >
                  Reactivate
                </button>
              )}
              <button 
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                title="Revoke Access"
                onClick={() => setDeleteConfirm({ isOpen: true, adminId: row.id, isProcessing: false })}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Key className="mr-2 text-brand-600" /> System Access
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage admin roles, staff accounts, and system permissions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="primary" size="sm" onClick={() => {
            error('New admins must self-register first and wait for approval.');
          }}>
            <UserPlus size={16} className="mr-2" />
            Invite Staff
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={admins} 
        keyExtractor={(item) => item.id}
        isLoading={loading}
      />



      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => !deleteConfirm.isProcessing && setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        isLoading={deleteConfirm.isProcessing}
        title="Revoke Admin Access"
        message="Are you sure you want to revoke access for this staff member? They will be immediately logged out and unable to access the dashboard."
        confirmText="Revoke Access"
        isDestructive={true}
      />
    </div>
  );
}
