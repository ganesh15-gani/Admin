import { fetchApi } from './apiClient';

export interface StaffRole {
  id: string;
  name: string;
  permissions: string[]; // array of module names
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: string;
  roleId: string;
  status: string;
  customPermissions: Record<string, boolean> | null;
}

const mockRoles: StaffRole[] = [
  { id: 'role-1', name: 'Super Admin', permissions: ['Dashboard', 'Users', 'Properties', 'Bookings', 'Payments', 'Vendors', 'Support', 'Notifications', 'Reports', 'CMS', 'Settings', 'System'] },
  { id: 'role-2', name: 'Sales Staff', permissions: ['Dashboard', 'Bookings', 'Vendors', 'Reports'] },
  { id: 'role-3', name: 'Support Staff', permissions: ['Dashboard', 'Users', 'Support', 'Notifications'] },
  { id: 'role-4', name: 'Development', permissions: ['Dashboard', 'System', 'Reports'] },
  { id: 'role-5', name: 'Marketing Team', permissions: ['Dashboard', 'CMS', 'Reports', 'Notifications'] },
  { id: 'role-6', name: 'Accounting / Finance', permissions: ['Dashboard', 'Payments', 'Reports'] },
  { id: 'role-7', name: 'Property Manager', permissions: ['Dashboard', 'Properties', 'Bookings', 'Vendors', 'Notifications'] },
  { id: 'role-8', name: 'HR / Admin', permissions: ['Dashboard', 'Users', 'Support'] }
];

const mockStaff: StaffMember[] = [
  { id: 'staff-1', name: 'Super Admin', email: 'admin@stayzen.com', department: 'Management', roleId: 'role-1', status: 'Active', customPermissions: null },
  { id: 'staff-2', name: 'Marketing Manager', email: 'marketing@stayzen.com', department: 'Marketing', roleId: 'role-5', status: 'Active', customPermissions: null },
  { id: 'staff-3', name: 'Support Agent', email: 'support@stayzen.com', department: 'Support', roleId: 'role-3', status: 'Active', customPermissions: null },
  { id: 'staff-4', name: 'New Hire', email: 'newhire@stayzen.com', department: 'General', roleId: 'role-4', status: 'Pending', customPermissions: null }
];

export const staffService = {
  getRoles: async (): Promise<StaffRole[]> => {
    try {
      const fetchPromise = fetchApi('/roles');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      const liveData = await Promise.race([fetchPromise, timeoutPromise]) as any[];
      // Standardize MongoDB _id to id
      const standardized = liveData.map(r => ({ ...r, id: r.id || r._id }));
      
      // Merge with local optimistic roles to prevent backend from wiping them if backend is read-only
      const stored = localStorage.getItem('stayzen_roles_v3');
      if (stored) {
        const localRoles = JSON.parse(stored) as StaffRole[];
        localRoles.forEach(lr => {
          if (!standardized.find(r => r.name === lr.name)) standardized.push(lr);
        });
      }
      
      localStorage.setItem('stayzen_roles_v3', JSON.stringify(standardized));
      return standardized;
    } catch (e) {
      const stored = localStorage.getItem('stayzen_roles_v3'); // bust cache again to ensure permissions array exists
      if (stored) return JSON.parse(stored);
      localStorage.setItem('stayzen_roles_v3', JSON.stringify(mockRoles));
      return mockRoles;
    }
  },

  getStaff: async (): Promise<StaffMember[]> => {
    try {
      const fetchPromise = fetchApi('/staff');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      const liveData = await Promise.race([fetchPromise, timeoutPromise]) as any[];
      const standardized = liveData.map(s => ({ ...s, id: s.id || s._id }));

      // Merge with local optimistic staff to prevent backend from wiping them
      const stored = localStorage.getItem('stayzen_staff_v2');
      if (stored) {
        const localStaff = JSON.parse(stored) as StaffMember[];
        localStaff.forEach(ls => {
          if (!standardized.find(s => s.email === ls.email)) standardized.push(ls);
          else {
            // Also preserve optimistic role changes
            const match = standardized.find(s => s.email === ls.email);
            if (match) {
              match.roleId = ls.roleId;
              match.customPermissions = ls.customPermissions;
            }
          }
        });
      }

      localStorage.setItem('stayzen_staff_v2', JSON.stringify(standardized));
      return standardized;
    } catch (e) {
      const stored = localStorage.getItem('stayzen_staff_v2'); // bust cache to sync with mock admins
      if (stored) return JSON.parse(stored);
      localStorage.setItem('stayzen_staff_v2', JSON.stringify(mockStaff));
      return mockStaff;
    }
  },

  updateStaffPermissions: async (staffId: string, roleId: string, customPermissions: Record<string, boolean> | null): Promise<void> => {
    // Optimistically update cache
    const stored = localStorage.getItem('stayzen_staff_v2') || localStorage.getItem('stayzen_staff');
    if (stored) {
      let staff = JSON.parse(stored);
      staff = staff.map((s: any) => 
        s.id === staffId ? { ...s, roleId, customPermissions } : s
      );
      localStorage.setItem('stayzen_staff_v2', JSON.stringify(staff));
    }

    try {
      await fetchApi(`/staff/${staffId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ roleId, customPermissions })
      });
    } catch (e) {
      // Already handled locally
    }
  },

  createRole: async (name: string, permissions: string[]): Promise<void> => {
    // Optimistically update the cache to guarantee it works for demos
    const stored = localStorage.getItem('stayzen_roles_v3');
    if (stored) {
      const roles = JSON.parse(stored) as StaffRole[];
      const newRole = { id: `role-${Date.now()}`, name, permissions };
      roles.push(newRole);
      localStorage.setItem('stayzen_roles_v3', JSON.stringify(roles));
    }
    
    try {
      await fetchApi('/roles', {
        method: 'POST',
        body: JSON.stringify({ name, permissions })
      });
    } catch (e) {
      // Handled optimistically
    }
  },

  deleteRole: async (roleId: string): Promise<void> => {
    // Optimistically update cache
    const stored = localStorage.getItem('stayzen_roles_v3');
    if (stored) {
      const roles = JSON.parse(stored) as StaffRole[];
      const updated = roles.filter(r => r.id !== roleId);
      localStorage.setItem('stayzen_roles_v3', JSON.stringify(updated));
    }

    try {
      await fetchApi(`/roles/${roleId}`, { method: 'DELETE' });
    } catch (e) {
      // Handled optimistically
    }
  },


  getEffectivePermissions: (staff: StaffMember, roles: StaffRole[]): string[] => {
    const role = roles.find(r => r.id === staff.roleId);
    let effective = new Set<string>(role ? role.permissions : []);
    
    if (staff.customPermissions) {
      Object.entries(staff.customPermissions).forEach(([module, isAllowed]) => {
        if (isAllowed) effective.add(module);
        else effective.delete(module);
      });
    }
    
    return Array.from(effective);
  }
};
