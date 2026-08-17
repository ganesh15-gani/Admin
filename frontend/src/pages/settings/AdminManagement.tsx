import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, Key, Eye, EyeOff } from 'lucide-react';
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
  const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({ name: '', email: '', roleName: 'Staff', isProcessing: false });

  // Password State
  const [passwordModal, setPasswordModal] = useState<{ 
    isOpen: boolean; adminId: string | null; adminName: string; adminEmail: string;
    newPassword: string; confirmPassword: string; showPassword: boolean; isProcessing: boolean 
  }>({ 
    isOpen: false, adminId: null, adminName: '', adminEmail: '',
    newPassword: '', confirmPassword: '', showPassword: false, isProcessing: false 
  });

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; adminId: string | null; isProcessing: boolean }>({ isOpen: false, adminId: null, isProcessing: false });


  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const adminsData = await adminService.getAdmins();
      setAdmins(adminsData);
    } catch (err: any) {
      error(`Failed to load admins: ${err.message}`);
    }

    try {
      const rolesData = await adminService.getRoles();
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      // Don't toast error for roles to prevent blocking UI
    }
    
    setLoading(false);
  };

  const loadAdmins = async () => {
    try {
      const data = await adminService.getAdmins();
      setAdmins(data);
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    loadData();
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
      await adminService.deleteAdmin(deleteConfirm.adminId);
      success('Admin account permanently removed');
      loadAdmins();
    } catch (err: any) {
      error(err.message || 'Failed to remove admin');
    } finally {
      setDeleteConfirm({ isOpen: false, adminId: null, isProcessing: false });
    }
  };

  const handleSetPassword = async () => {
    if (!passwordModal.adminId || !passwordModal.newPassword) return;
    if (passwordModal.newPassword !== passwordModal.confirmPassword) {
      error('Passwords do not match');
      return;
    }
    setPasswordModal(prev => ({ ...prev, isProcessing: true }));
    try {
      await adminService.setPassword(passwordModal.adminId, passwordModal.newPassword);
      success('Password set successfully');
      setPasswordModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
    } catch (err: any) {
      error(err.message || 'Failed to set password');
      setPasswordModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleCreateAdmin = async () => {
    if (!createData.name || !createData.email) {
      error('Name and Email are required');
      return;
    }
    setCreateData(prev => ({ ...prev, isProcessing: true }));
    try {
      await adminService.createAdmin(createData);
      success('Staff account created successfully');
      setIsCreateOpen(false);
      setCreateData({ name: '', email: '', roleName: 'Staff', isProcessing: false });
      loadAdmins();
    } catch (err: any) {
      error(err.message || 'Failed to create staff account');
      setCreateData(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score < 2) return { score, text: 'Weak', color: 'bg-red-500' };
    if (score < 4) return { score, text: 'Medium', color: 'bg-amber-500' };
    return { score, text: 'Strong', color: 'bg-green-500' };
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
        const variants: any = { 'Super Admin': 'danger', 'Admin': 'success', 'Sales': 'warning', 'Staff': 'info', 'Viewer': 'default' };
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
                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" 
                title="Set Password"
                onClick={() => setPasswordModal({ 
                  isOpen: true, adminId: row.id, adminName: row.name, adminEmail: row.email, 
                  newPassword: '', confirmPassword: '', showPassword: false, isProcessing: false 
                })}
              >
                <Key size={16} />
              </button>
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
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <UserPlus size={16} className="mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={admins} 
        keyExtractor={(item) => item.id}
        isLoading={loading}
      />

      <Modal
        isOpen={isCreateOpen}
        onClose={() => !createData.isProcessing && setIsCreateOpen(false)}
        title="Add New Staff"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. John Doe"
              value={createData.name}
              onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. staff@stayzen.com"
              value={createData.email}
              onChange={(e) => setCreateData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              value={createData.roleName}
              onChange={(e) => setCreateData(prev => ({ ...prev, roleName: e.target.value }))}
            >
              {roles.filter(r => r.name !== 'Super Admin').map(role => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createData.isProcessing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateAdmin} isLoading={createData.isProcessing}>
              Create Account
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={passwordModal.isOpen}
        onClose={() => !passwordModal.isProcessing && setPasswordModal(prev => ({ ...prev, isOpen: false }))}
        title="Set Staff Password"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <p className="text-sm font-medium text-slate-800">{passwordModal.adminName}</p>
            <p className="text-xs text-slate-500">{passwordModal.adminEmail}</p>
          </div>
          
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <input
                type={passwordModal.showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 pr-10"
                placeholder="Enter new password (min 6 characters)"
                value={passwordModal.newPassword}
                onChange={(e) => setPasswordModal(prev => ({ ...prev, newPassword: e.target.value }))}
              />
              <button 
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                onClick={() => setPasswordModal(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              >
                {passwordModal.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordModal.newPassword && (
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                  {[1, 2, 3].map((segment) => {
                    const strength = calculatePasswordStrength(passwordModal.newPassword);
                    const isActive = segment <= (strength.score >= 4 ? 3 : strength.score >= 2 ? 2 : 1);
                    return (
                      <div key={segment} className={`h-full flex-1 ${isActive ? strength.color : 'bg-transparent'} border-r border-white last:border-r-0 transition-colors duration-300`} />
                    );
                  })}
                </div>
                <span className={`text-[10px] font-medium w-12 ${calculatePasswordStrength(passwordModal.newPassword).score >= 4 ? 'text-green-600' : calculatePasswordStrength(passwordModal.newPassword).score >= 2 ? 'text-amber-600' : 'text-red-600'}`}>
                  {calculatePasswordStrength(passwordModal.newPassword).text}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type={passwordModal.showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Re-enter password"
              value={passwordModal.confirmPassword}
              onChange={(e) => setPasswordModal(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            {passwordModal.confirmPassword && passwordModal.confirmPassword !== passwordModal.newPassword && (
              <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
              disabled={passwordModal.isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSetPassword}
              isLoading={passwordModal.isProcessing}
              disabled={
                passwordModal.newPassword.length < 6 || 
                passwordModal.newPassword !== passwordModal.confirmPassword
              }
            >
              Set Password
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => !deleteConfirm.isProcessing && setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        isLoading={deleteConfirm.isProcessing}
        title="Remove Staff Account"
        message="Are you sure you want to permanently remove this staff member? This action cannot be undone."
        confirmText="Remove Account"
        isDestructive={true}
      />
    </div>
  );
}
