import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, Key } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { type AuthUser, type UserRole } from '../../services/authService';
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'STAFF' as UserRole });
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email) return;
    
    setIsCreating(true);
    try {
      await adminService.createAdmin(createForm.name, createForm.email, createForm.role);
      success('Admin account created successfully');
      setIsCreateOpen(false);
      setCreateForm({ name: '', email: '', role: 'STAFF' });
      loadAdmins();
    } catch (err) {
      error('Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.adminId) return;
    setDeleteConfirm(prev => ({ ...prev, isProcessing: true }));
    try {
      await adminService.deleteAdmin(deleteConfirm.adminId);
      success('Admin account revoked');
      setAdmins(prev => prev.filter(a => a.id !== deleteConfirm.adminId));
    } catch (err) {
      error('Failed to delete admin');
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
      header: 'Role & Permissions',
      accessor: (row) => {
        const variants: any = { SUPER_ADMIN: 'danger', ADMIN: 'success', STAFF: 'info', VIEWER: 'default' };
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={variants[row.role]}>{row.role.replace('_', ' ')}</Badge>
            {row.role === 'SUPER_ADMIN' && <ShieldCheck size={14} className="text-red-500" />}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center space-x-2">
          {row.role !== 'SUPER_ADMIN' && (
            <button 
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
              title="Revoke Access"
              onClick={() => setDeleteConfirm({ isOpen: true, adminId: row.id, isProcessing: false })}
            >
              <Trash2 size={16} />
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
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Key className="mr-2 text-brand-600" /> System Access
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage admin roles, staff accounts, and system permissions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <UserPlus size={16} className="mr-2" />
            Add Staff Member
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={admins} 
        keyExtractor={(item) => item.id}
        isLoading={loading}
      />

      <Modal isOpen={isCreateOpen} onClose={() => !isCreating && setIsCreateOpen(false)} title="Add Staff Member">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow bg-white"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
            >
              <option value="ADMIN">Administrator (Full Access except billing)</option>
              <option value="STAFF">Staff (Manage Bookings & Users)</option>
              <option value="VIEWER">Viewer (Read-only access)</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isCreating}>Create Account</Button>
          </div>
        </form>
      </Modal>

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
