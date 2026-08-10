import { delay } from './apiClient';
import { authService, type AuthUser, type UserRole } from './authService';
import { mockAdmins } from '../data/mockAdmins';

let admins = [...mockAdmins];

export const adminService = {
  getAdmins: async (): Promise<AuthUser[]> => {
    await delay(600);
    // Sync the current user's profile changes (Name & Avatar) with the admin list
    const currentUser = authService.getCurrentUser();
    
    return admins.map(admin => {
      if (currentUser && admin.id === currentUser.id) {
        return { ...admin, name: currentUser.name, avatar: currentUser.avatar };
      }
      return admin;
    });
  },
  
  createAdmin: async (name: string, email: string, role: UserRole): Promise<void> => {
    await delay(800);
    const newAdmin: AuthUser = {
      id: `admin-${Date.now()}`,
      name,
      email,
      role
    };
    admins.push(newAdmin);
  },
  
  deleteAdmin: async (id: string): Promise<void> => {
    await delay(600);
    admins = admins.filter(a => a.id !== id);
  }
};
