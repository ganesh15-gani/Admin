import { type Payment } from '../types';
import { fetchApi } from './apiClient';

export const paymentService = {
  getPayments: async (): Promise<Payment[]> => {
    return fetchApi('/payments');
  },
  
  processRefund: async (id: string): Promise<void> => {
    // We haven't implemented this endpoint in Express, but we'll mock it for now
    console.log(`Process refund for payment ${id}`);
  },

  retryPayment: async (id: string): Promise<void> => {
    console.log(`Retry payment ${id}`);
  },

  approvePayout: async (id: string): Promise<void> => {
    console.log(`Approve payout ${id}`);
  }
};
