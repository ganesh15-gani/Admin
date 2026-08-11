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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      const { user, token } = data;

      currentUser = user;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      
      return { user, token };
    } catch (err) {
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
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      
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
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_token');
  },

  hasPermission: (module: string, action: string = 'View'): boolean => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    
    // Check system full access
    if (user.permissions.some(p => p.module === 'System' && p.action === '*')) {
      return true;
    }
    
    // Check specific permission
    return user.permissions.some(p => p.module === module && (p.action === action || p.action === '*'));
  }
};
