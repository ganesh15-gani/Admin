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
  { id: 'staff-1', name: 'Alice Admin', email: 'alice@stayzen.com', department: 'Management', roleId: 'role-1', status: 'Active', customPermissions: null },
  { id: 'staff-2', name: 'Bob Sales', email: 'bob@stayzen.com', department: 'Sales', roleId: 'role-2', status: 'Active', customPermissions: null },
  { id: 'staff-3', name: 'Charlie Support', email: 'charlie@stayzen.com', department: 'Support', roleId: 'role-3', status: 'Active', customPermissions: { 'Properties': true } },
  { id: 'staff-4', name: 'Dave Dev', email: 'dave@stayzen.com', department: 'Development', roleId: 'role-4', status: 'Active', customPermissions: { 'Sales': false } },
];

export const staffService = {
  getRoles: async (): Promise<StaffRole[]> => {
    try {
      const fetchPromise = fetchApi('/roles');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      return await Promise.race([fetchPromise, timeoutPromise]) as StaffRole[];
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
      return await Promise.race([fetchPromise, timeoutPromise]) as StaffMember[];
    } catch (e) {
      const stored = localStorage.getItem('stayzen_staff');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('stayzen_staff', JSON.stringify(mockStaff));
      return mockStaff;
    }
  },

  updateStaffPermissions: async (staffId: string, roleId: string, customPermissions: Record<string, boolean> | null): Promise<void> => {
    try {
      await fetchApi(`/staff/${staffId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ roleId, customPermissions })
      });
    } catch (e) {
      const stored = localStorage.getItem('stayzen_staff');
      if (stored) {
        const staff = JSON.parse(stored) as StaffMember[];
        const updated = staff.map(s => s.id === staffId ? { ...s, roleId, customPermissions } : s);
        localStorage.setItem('stayzen_staff', JSON.stringify(updated));
      }
    }
  },

  createRole: async (name: string, permissions: string[]): Promise<StaffRole> => {
    try {
      const fetchPromise = fetchApi('/roles', {
        method: 'POST',
        body: JSON.stringify({ name, permissions })
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      return await Promise.race([fetchPromise, timeoutPromise]) as StaffRole;
    } catch (e) {
      const stored = localStorage.getItem('stayzen_roles_v2');
      const roles = stored ? JSON.parse(stored) : [...mockRoles];
      const newRole: StaffRole = {
        id: `role-${Date.now()}`,
        name,
        permissions
      };
      roles.push(newRole);
      localStorage.setItem('stayzen_roles_v2', JSON.stringify(roles));
      return newRole;
    }
  },

  deleteRole: async (roleId: string): Promise<void> => {
    try {
      await fetchApi(`/roles/${roleId}`, { method: 'DELETE' });
    } catch (e) {
      const stored = localStorage.getItem('stayzen_roles_v2');
      if (stored) {
        const roles = JSON.parse(stored) as StaffRole[];
        const updated = roles.filter(r => r.id !== roleId);
        localStorage.setItem('stayzen_roles_v2', JSON.stringify(updated));
      }
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
