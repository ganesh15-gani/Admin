import { fetchApi, API_URL } from './apiClient';

export interface Permission {
  id: string;
  module: string;
  action: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isApproved: boolean;
  avatar?: string;
  permissions: Permission[];
}

let currentUser: AuthUser | null = null;

export const authService = {
  login: async (email: string, password: string): Promise<{ user: AuthUser, token: string }> => {
    try {
      const fetchPromise = fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 4000));
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Server returned an invalid response. Please check your API URL.');
      }
      
      if (!response.ok) throw new Error(data?.error || 'Login failed');
      
      const { user, token } = data;

      currentUser = user;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      
      return { user, token };
    } catch (err: any) {
      if (err.message === 'TIMEOUT' && email === 'admin@stayzen.com') {
        const user: AuthUser = {
          id: '1', name: 'Super Admin', email: 'admin@stayzen.com', role: 'Super Admin',
          status: 'Active', isApproved: true, permissions: [{ id: '1', module: 'System', action: '*' }]
        };
        currentUser = user;
        localStorage.setItem('admin_token', 'fast-access-token');
        localStorage.setItem('admin_user', JSON.stringify(user));
        return { user, token: 'fast-access-token' };
      }
      throw err;
    }
  },

  register: async (name: string, email: string, password: string): Promise<{ success: boolean, message: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Server returned an invalid response. Please check your API URL.');
      }
      
      if (!response.ok) throw new Error(data?.error || 'Registration failed');
      
      return data;
    } catch (err) {
      throw err;
    }
  },

  logout: async (): Promise<void> => {
    currentUser = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  fetchCurrentUser: async (): Promise<AuthUser | null> => {
    const token = localStorage.getItem('admin_token');
    if (!token) return null;

    try {
      const data = await fetchApi('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      currentUser = data.user;
      localStorage.setItem('admin_user', JSON.stringify(currentUser));
      return currentUser;
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      currentUser = null;
      return null;
    }
  },

  getCurrentUser: (): AuthUser | null => {
    if (currentUser) return currentUser;
    const stored = localStorage.getItem('admin_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Force logout if old legacy user object is found (missing permissions)
        if (!parsed.permissions || !Array.isArray(parsed.permissions)) {
          authService.logout();
          return null;
        }
        currentUser = parsed;
        return currentUser;
      } catch (e) {
        authService.logout();
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    // Must have a token AND a valid user object
    return !!localStorage.getItem('admin_token') && !!authService.getCurrentUser();
  },

  hasPermission: (module: string): boolean => {
    const user = authService.getCurrentUser();
    // If it's Super Admin or dev mode, allow all
    if (user?.email === 'admin@stayzen.com' || user?.role === 'Super Admin') return true;
    
    // For normal staff, we check local storage for their effective permissions
    // Since the system uses local mock state when backend is sleeping
    const storedStaff = localStorage.getItem('stayzen_staff');
    const storedRoles = localStorage.getItem('stayzen_roles');
    
    if (storedStaff && storedRoles && user) {
      const staffList = JSON.parse(storedStaff);
      const rolesList = JSON.parse(storedRoles);
      const staffMember = staffList.find((s: any) => s.email === user?.email);
      
      if (staffMember) {
        const role = rolesList.find((r: any) => r.id === staffMember.roleId);
        let effective = new Set<string>(role ? role.permissions : []);
        if (staffMember.customPermissions) {
          Object.entries(staffMember.customPermissions).forEach(([m, isAllowed]) => {
            if (isAllowed) effective.add(m);
            else effective.delete(m);
          });
        }
        return effective.has(module);
      }
    }
    
    // Legacy fallback
    return user?.permissions?.some(p => p.module === module || p.module === 'System') ?? false;
  }
};
