import { type AuthUser } from '../services/authService';

export const mockAdmins: AuthUser[] = [
  { id: 'admin-1', name: 'Super Admin', email: 'admin@stayzen.com', role: 'SUPER_ADMIN', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'admin-2', name: 'Sarah Manager', email: 'sarah@stayzen.com', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 'admin-3', name: 'Support Staff 1', email: 'support1@stayzen.com', role: 'STAFF' },
  { id: 'admin-4', name: 'Auditor', email: 'audit@stayzen.com', role: 'VIEWER' },
];
