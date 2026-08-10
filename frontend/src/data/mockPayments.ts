import { type Payment } from '../types';

export const mockPayments: Payment[] = [
  {
    id: 'TXN-83921',
    referenceId: 'SZ10294',
    description: 'Booking by Sarah Jenkins',
    amount: 1200,
    type: 'Booking',
    method: 'Credit Card',
    status: 'Completed',
    date: '2024-04-15'
  },
  {
    id: 'TXN-83922',
    referenceId: 'SZ10295',
    description: 'Booking by Michael Chen',
    amount: 450,
    type: 'Booking',
    method: 'PayPal',
    status: 'Pending',
    date: '2024-05-01'
  }
];
