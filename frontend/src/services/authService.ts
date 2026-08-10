import { delay } from './apiClient';
import { userService } from './userService';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'VIEWER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Mock initial state
let currentUser: AuthUser | null = null;
const MOCK_TOKEN = 'mock-jwt-token-stayzen-admin-xyz';

export const authService = {
  login: async (email: string, password: string):Promise<{ user: AuthUser, token: string }> => {
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Invalid credentials');
      
      const { user, token } = await response.json();

      currentUser = user;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      
      return { user, token };
    } catch (err) {
      throw err;
    }
  },

  register: async (name: string, email: string, password: string):Promise<{ user: AuthUser, token: string }> => {
    await delay(1200);
    
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    const newId = `admin-${Date.now()}`;
    const user: AuthUser = {
      id: newId,
      name: name,
      email: email,
      role: 'ADMIN',
    };

    // Inject into the User table to make it "Live"
    userService.addUser({
      id: newId,
      name: name,
      email: email,
      phone: '+1 (555) 000-0000',
      status: 'Active',
      verification: 'Verified',
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now',
      bookingsCount: 0
    });

    currentUser = user;
    localStorage.setItem('admin_token', MOCK_TOKEN);
    localStorage.setItem('admin_user', JSON.stringify(user));
    
    return { user, token: MOCK_TOKEN };
  },

  logout: async (): Promise<void> => {
    await delay(400);
    currentUser = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  updateProfile: async (name: string, avatarBase64?: string): Promise<AuthUser> => {
    await delay(800);
    if (!currentUser) throw new Error('Not authenticated');

    const updatedUser = {
      ...currentUser,
      name: name,
      ...(avatarBase64 && { avatar: avatarBase64 })
    };

    currentUser = updatedUser;
    localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    
    return updatedUser;
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
  }
};
