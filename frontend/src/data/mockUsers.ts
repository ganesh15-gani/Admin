import { type User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u-101',
    name: 'Emily Watson',
    email: 'emily.w@stayzen.com',
    phone: '+44 20 7123 4567',
    status: 'Active',
    verification: 'Verified',
    joinedDate: '2024-03-12',
    lastLogin: '10 mins ago',
    bookingsCount: 5
  },
  {
    id: 'u-102',
    name: 'James Harrison',
    email: 'james.harrison@example.com',
    phone: '+1 (415) 555-0198',
    status: 'Active',
    verification: 'Verified',
    joinedDate: '2024-01-20',
    lastLogin: '3 days ago',
    bookingsCount: 14
  },
  {
    id: 'u-103',
    name: 'Sophia Patel',
    email: 'sophia.patel@gmail.com',
    phone: '+91 98765 43210',
    status: 'Pending',
    verification: 'Unverified',
    joinedDate: '2024-05-01',
    lastLogin: 'Never',
    bookingsCount: 0
  },
  {
    id: 'u-104',
    name: 'Marcus Thorne',
    email: 'marcus.t@outlook.com',
    phone: '+61 412 345 678',
    status: 'Suspended',
    verification: 'Verified',
    joinedDate: '2023-11-05',
    lastLogin: '2 weeks ago',
    bookingsCount: 2
  }
];
