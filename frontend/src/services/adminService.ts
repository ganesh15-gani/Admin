import { fetchApi } from './apiClient';
import { type AuthUser } from './authService';

export const adminService = {
  getAdmins: async (): Promise<AuthUser[]> => {
    try {
      const fetchPromise = fetchApi('/admins');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      const res = await Promise.race([fetchPromise, timeoutPromise]) as any;
      if (!res || !Array.isArray(res)) throw new Error('EMPTY_DB');
      return res as AuthUser[];
    } catch (e) {
      console.warn('Admins API failed, falling back to mock data');
      const stored = localStorage.getItem('stayzen_mock_admins');
      if (stored) {
        try { return JSON.parse(stored) as AuthUser[]; } catch (e) {}
      }
      return [
        { id: '1', name: 'Super Admin', email: 'admin@stayzen.com', role: 'Super Admin', status: 'Active', isApproved: true, permissions: [] },
        { id: '2', name: 'Marketing Manager', email: 'marketing@stayzen.com', role: 'Marketing Team', status: 'Active', isApproved: true, permissions: [] },
        { id: '3', name: 'Support Agent', email: 'support@stayzen.com', role: 'Support', status: 'Active', isApproved: true, permissions: [] },
        { id: '4', name: 'New Hire', email: 'newhire@stayzen.com', role: 'Staff', status: 'Pending', isApproved: false, permissions: [] }
      ];
    }
  },
  
  getRoles: async (): Promise<{ id: string, name: string, description: string }[]> => {
    try {
      const fetchPromise = fetchApi('/roles');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      const res = await Promise.race([fetchPromise, timeoutPromise]) as any;
      if (!res || !Array.isArray(res)) throw new Error('EMPTY_DB');
      return res;
    } catch (e) {
      return [
        { id: 'r1', name: 'Super Admin', description: 'Full system access' },
        { id: 'r2', name: 'Marketing Team', description: 'Access to growth and campaigns' },
        { id: 'r3', name: 'Support', description: 'Access to users and bookings' },
        { id: 'r4', name: 'Staff', description: 'Basic dashboard access' }
      ];
    }
  },

  updateStatus: async (id: string, status: string, isApproved: boolean): Promise<void> => {
    try {
      await fetchApi(`/admins/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, isApproved }) });
    } catch (e) {
      console.warn('Mocking updateStatus');
      const stored = localStorage.getItem('stayzen_mock_admins');
      if (stored) {
        try {
          let parsed = JSON.parse(stored);
          parsed = parsed.map((a: any) => a.id === id ? { ...a, status, isApproved } : a);
          localStorage.setItem('stayzen_mock_admins', JSON.stringify(parsed));
        } catch (err) {}
      }
    }
  },

  setPassword: async (id: string, newPassword: string): Promise<void> => {
    try {
      await fetchApi(`/admins/${id}/password`, { method: 'PUT', body: JSON.stringify({ newPassword }) });
    } catch (e) {
      console.warn('Mocking setPassword');
    }
  },

  createAdmin: async (data: { name: string; email: string; roleName: string }): Promise<AuthUser> => {
    try {
      return await fetchApi('/admins', { method: 'POST', body: JSON.stringify(data) });
    } catch (e) {
      console.warn('Mocking createAdmin');
      return { id: Date.now().toString(), name: data.name, email: data.email, role: data.roleName, status: 'Pending', isApproved: false, permissions: [] };
    }
  },

  deleteAdmin: async (id: string): Promise<void> => {
    try {
      await fetchApi(`/admins/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Mocking deleteAdmin');
    }
  }
};
