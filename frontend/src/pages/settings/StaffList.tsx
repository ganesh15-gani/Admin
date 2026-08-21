import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, Edit2, ShieldPlus, Trash2 } from 'lucide-react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastContext';
import { staffService, type StaffMember, type StaffRole } from '../../services/staffService';
import { PermissionManagerModal } from './PermissionManagerModal';
import { CreateRoleModal } from './CreateRoleModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function StaffList() {
  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>('staff');
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Staff Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Role Tab State
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [confirmDeleteRole, setConfirmDeleteRole] = useState<string | null>(null);

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, rolesData] = await Promise.all([
        staffService.getStaff(),
        staffService.getRoles()
      ]);
      setStaff(staffData);
      setRoles(rolesData);
    } catch (err) {
      error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Staff Handlers ---
  const handleEditPermissions = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsPermissionModalOpen(true);
  };

  const handleSavePermissions = async (staffId: string, roleId: string, customPermissions: Record<string, boolean> | null) => {
    try {
      await staffService.updateStaffPermissions(staffId, roleId, customPermissions);
      success('Staff permissions updated successfully');
      setIsPermissionModalOpen(false);
      loadData();
    } catch (err) {
      error('Failed to update permissions');
    }
  };

  // --- Role Handlers ---
  const handleCreateRole = async (name: string, permissions: string[]) => {
    try {
      await staffService.createRole(name, permissions);
      success(`Role "${name}" created successfully`);
      setIsCreateRoleModalOpen(false);
      loadData();
    } catch (err) {
      error('Failed to create role');
    }
  };

  const handleDeleteRole = async () => {
    if (!confirmDeleteRole) return;
    try {
      await staffService.deleteRole(confirmDeleteRole);
      success('Role deleted successfully');
      setConfirmDeleteRole(null);
      loadData();
    } catch (err) {
      error('Failed to delete role');
    }
  };

  const departments = ['All', ...Array.from(new Set(staff.map(s => s.department)))];

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = activeDepartment === 'All' || s.department === activeDepartment;
    return matchesSearch && matchesDept;
  });

  const staffColumns: Column<StaffMember>[] = [
    {
      header: 'Staff Member',
      accessor: (row) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-800">{row.name}</div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Department / Role',
      accessor: (row) => {
        const role = roles.find(r => r.id === row.roleId);
        return (
          <div>
            <div className="font-medium text-slate-700">{row.department}</div>
            <div className="text-xs text-slate-500 flex items-center mt-1">
              <Shield size={12} className="mr-1" />
              {role?.name || 'Unknown Role'}
            </div>
          </div>
        )
      }
    },
    {
      header: 'Permission Status',
      accessor: (row) => {
        if (row.customPermissions && Object.keys(row.customPermissions).length > 0) {
          return <Badge variant="warning">Customized</Badge>;
        }
        return <Badge variant="info">Role Default</Badge>;
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          onClick={() => handleEditPermissions(row)}
        >
          <Edit2 size={14} className="mr-2" /> Edit Permissions
        </Button>
      )
    }
  ];

  const roleColumns: Column<StaffRole>[] = [
    {
      header: 'Role Name',
      accessor: (row) => (
        <div className="font-semibold text-slate-800 flex items-center">
          <Shield className="w-4 h-4 mr-2 text-brand-600" />
          {row.name}
        </div>
      )
    },
    {
      header: 'Access Level',
      accessor: (row) => {
        if (row.permissions.includes('System')) return <Badge variant="success">Full Access</Badge>;
        return <Badge variant="info">{row.permissions.length} Modules</Badge>;
      }
    },
    {
      header: 'Staff Count',
      accessor: (row) => {
        const count = staff.filter(s => s.roleId === row.id).length;
        return <span className="text-slate-600 font-medium">{count} members</span>;
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => setConfirmDeleteRole(row.id)}
          disabled={row.name === 'Super Admin'} // Protect system roles
        >
          <Trash2 size={16} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <Shield className="mr-2 text-brand-600" /> Staff Authorization & Roles
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage dynamic roles and individual window access for all staff members.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'staff' 
              ? 'border-brand-600 text-brand-700' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('staff')}
        >
          <Users className="inline-block w-4 h-4 mr-2" /> Staff Members
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'roles' 
              ? 'border-brand-600 text-brand-700' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('roles')}
        >
          <ShieldPlus className="inline-block w-4 h-4 mr-2" /> Manage Roles
        </button>
      </div>

      {activeTab === 'staff' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setActiveDepartment(dept)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeDepartment === dept
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={staffColumns}
            data={filteredStaff}
            keyExtractor={(row) => row.id}
            isLoading={loading}
            onSearch={setSearchQuery}
            searchPlaceholder="Search staff by name or email..."
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={() => setIsCreateRoleModalOpen(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20 shadow-lg"
            >
              <ShieldPlus size={18} className="mr-2" /> Create New Role
            </Button>
          </div>
          <DataTable
            columns={roleColumns}
            data={roles}
            keyExtractor={(row) => row.id}
            isLoading={loading}
          />
        </div>
      )}

      {selectedStaff && (
        <PermissionManagerModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          staffMember={selectedStaff}
          roles={roles}
          onSave={handleSavePermissions}
        />
      )}

      <CreateRoleModal
        isOpen={isCreateRoleModalOpen}
        onClose={() => setIsCreateRoleModalOpen(false)}
        onSave={handleCreateRole}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteRole}
        title="Delete Role"
        message="Are you sure you want to delete this role? Staff assigned to this role may lose access to modules unless re-assigned."
        confirmText="Delete Role"
        cancelText="Cancel"
        onConfirm={handleDeleteRole}
        onClose={() => setConfirmDeleteRole(null)}
        isDestructive
      />
    </div>
  );
}
