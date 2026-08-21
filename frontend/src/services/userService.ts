import { type User } from '../types';
import { fetchApi } from './apiClient';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    try {
      const fetchPromise = fetchApi('/users');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      const res = await Promise.race([fetchPromise, timeoutPromise]) as any;
      if (!res || !Array.isArray(res) || res.length === 0) throw new Error('EMPTY_DB');
      return res as User[];
    } catch (e) {
      console.warn('User API failed, falling back to mock data');
      const stored = localStorage.getItem('stayzen_mock_users');
      if (stored) {
        try {
          return JSON.parse(stored) as User[];
        } catch (parseError) {
          localStorage.removeItem('stayzen_mock_users');
        }
      }
      
      const mockUsers = [
        { id: '1', name: 'Alice Smith', email: 'alice@example.com', role: 'Host', status: 'Active', joinDate: '2025-01-10' },
        { id: '2', name: 'Bob Jones', email: 'bob@example.com', role: 'Guest', status: 'Pending', joinDate: '2025-02-15' },
      ];
      return mockUsers as any; // Type coercion for basic mockup
    }
  },
  
  suspendUser: async (id: string): Promise<void> => {
    // We would add backend route, but just mocking for now since we only added basic GET
    // Or we could do a PUT /api/users/:id/status
    console.log(`Suspend user ${id}`);
  },
  
  activateUser: async (id: string): Promise<void> => {
    console.log(`Activate user ${id}`);
  },
  
  deleteUser: async (id: string): Promise<void> => {
    console.log(`Delete user ${id}`);
  },

  addUser: (user: User): void => {
    console.log('Add user', user);
  }
};
