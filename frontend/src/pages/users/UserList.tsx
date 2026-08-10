import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, CheckCircle, Ban, Trash2, Edit, UserPlus, FileDown, Eye } from 'lucide-react';
import { userService } from '../../services/userService';
import { type User } from '../../types';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContext';
import { UserPreviewModal } from './UserPreviewModal';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Preview State
  const [previewUser, setPreviewUser] = useState<User | null>(null);

  // Dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    userId: string | null;
    action: 'suspend' | 'activate' | 'delete' | null;
    isProcessing: boolean;
  }>({ isOpen: false, userId: null, action: null, isProcessing: false });

  const { success, error } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openConfirm = (id: string, action: 'suspend' | 'activate' | 'delete') => {
    setConfirmState({ isOpen: true, userId: id, action, isProcessing: false });
  };

  const handleConfirmAction = async () => {
    const { userId, action } = confirmState;
    if (!userId || !action) return;

    setConfirmState(prev => ({ ...prev, isProcessing: true }));

    try {
      if (action === 'suspend') {
        await userService.suspendUser(userId);
        success('User suspended successfully');
      } else if (action === 'activate') {
        await userService.activateUser(userId);
        success('User activated successfully');
      } else if (action === 'delete') {
        await userService.deleteUser(userId);
        success('User deleted successfully');
      }
      
      // Refresh local list rather than full network reload to feel snappy
      setUsers(prev => {
        if (action === 'delete') return prev.filter(u => u.id !== userId);
        return prev.map(u => u.id === userId ? { ...u, status: action === 'suspend' ? 'Suspended' : 'Active' } : u);
      });
      
    } catch (err) {
      error(`Failed to ${action} user`);
    } finally {
      setConfirmState({ isOpen: false, userId: null, action: null, isProcessing: false });
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      header: 'User',
      accessor: (row) => (
        <button 
          onClick={() => setPreviewUser(row)}
          className="flex items-center space-x-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors text-left"
        >
          <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-800">{row.name}</span>
            <span className="text-xs text-slate-500">{row.email}</span>
          </div>
        </button>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Suspended' ? 'danger' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Verification',
      accessor: (row) => (
        <div className="flex items-center space-x-1">
          {row.verification === 'Verified' ? (
            <Shield size={14} className="text-brand-500" />
          ) : (
            <ShieldAlert size={14} className="text-yellow-500" />
          )}
          <span className={`text-xs ${row.verification === 'Verified' ? 'text-brand-600' : 'text-slate-500'}`}>
            {row.verification}
          </span>
        </div>
      ),
    },
    {
      header: 'Joined',
      accessor: 'joinedDate',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors" 
            title="Preview User"
            onClick={() => setPreviewUser(row)}
          >
            <Eye size={16} />
          </button>
          
          <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
            <Edit size={16} />
          </button>
          
          {row.status === 'Active' ? (
            <button 
              className="p-1 text-slate-400 hover:text-yellow-600 transition-colors" 
              title="Suspend"
              onClick={() => openConfirm(row.id, 'suspend')}
            >
              <Ban size={16} />
            </button>
          ) : (
            <button 
              className="p-1 text-slate-400 hover:text-brand-600 transition-colors" 
              title="Activate"
              onClick={() => openConfirm(row.id, 'activate')}
            >
              <CheckCircle size={16} />
            </button>
          )}
          
          <button 
            className="p-1 text-slate-400 hover:text-red-600 transition-colors" 
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage registered users, verification and account activity.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <FileDown size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="primary" size="sm">
            <UserPlus size={16} className="mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredUsers} 
        keyExtractor={(item) => item.id}
        isLoading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search by name or email..."
      />

      <UserPreviewModal
        isOpen={!!previewUser}
        onClose={() => setPreviewUser(null)}
        user={previewUser}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => !confirmState.isProcessing && setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={confirmState.isProcessing}
        title={
          confirmState.action === 'suspend' ? 'Suspend User' :
          confirmState.action === 'activate' ? 'Activate User' : 'Delete User'
        }
        message={
          confirmState.action === 'suspend' ? 'Are you sure you want to suspend this user? They will not be able to log in or make bookings.' :
          confirmState.action === 'activate' ? 'Are you sure you want to activate this user? Their account will be fully restored.' : 
          'Are you sure you want to permanently delete this user? This action cannot be undone and will remove all their data.'
        }
        confirmText={
          confirmState.action === 'suspend' ? 'Suspend' :
          confirmState.action === 'activate' ? 'Activate' : 'Delete'
        }
        isDestructive={confirmState.action === 'suspend' || confirmState.action === 'delete'}
      />
    </div>
  );
}
