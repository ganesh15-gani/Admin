import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, Shield, Edit2 } from 'lucide-react';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastContext';
import { staffService, type StaffMember, type StaffRole } from '../../services/staffService';
import { PermissionManagerModal } from './PermissionManagerModal';

export default function StaffList() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

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
      error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditPermissions = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleSavePermissions = async (staffId: string, roleId: string, customPermissions: Record<string, boolean> | null) => {
    try {
      await staffService.updateStaffPermissions(staffId, roleId, customPermissions);
      success('Staff permissions updated successfully');
      setIsModalOpen(false);
      loadData(); // Reload to reflect changes
    } catch (err) {
      error('Failed to update permissions');
    }
  };

  const departments = ['All', ...Array.from(new Set(staff.map(s => s.department)))];

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = activeDepartment === 'All' || s.department === activeDepartment;
    return matchesSearch && matchesDept;
  });

  const columns: Column<StaffMember>[] = [
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
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      )
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

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <Shield className="mr-2 text-brand-600" /> Staff Authorization & Permissions
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage role-based and individual window access for all staff members.</p>
      </div>

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
        columns={columns}
        data={filteredStaff}
        keyExtractor={(row) => row.id}
        isLoading={loading}
        onSearch={setSearchQuery}
        searchPlaceholder="Search staff by name or email..."
      />

      {selectedStaff && (
        <PermissionManagerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          staffMember={selectedStaff}
          roles={roles}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  );
}
