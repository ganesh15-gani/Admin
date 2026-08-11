import { fetchApi } from './apiClient';
import { type AuthUser } from './authService';

export const adminService = {
  getAdmins: async (): Promise<AuthUser[]> => {
    return await fetchApi('/admins');
  },
  
  updateStatus: async (id: string, status: string, isApproved: boolean): Promise<void> => {
    await fetchApi(`/admins/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, isApproved })
    });
  },

  setPassword: async (id: string, newPassword: string): Promise<void> => {
    await fetchApi(`/admins/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword })
    });
  },

  createAdmin: async (data: { name: string; email: string; roleName: string }): Promise<AuthUser> => {
    return await fetchApi('/admins', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await fetchApi(`/admins/${id}`, {
      method: 'DELETE'
    });
  }
};
