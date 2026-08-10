import { type User } from '../types';
import { fetchApi } from './apiClient';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    return fetchApi('/users');
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
