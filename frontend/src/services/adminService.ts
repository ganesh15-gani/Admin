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
  
  // Note: Roles should also be updatable, but for simplicity we will just focus on approve/suspend status for now,
  // or a more complete RBAC role assignment later.
};
