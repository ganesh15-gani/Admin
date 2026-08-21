import { type Payment } from '../types';
import { fetchApi } from './apiClient';

export const paymentService = {
  getPayments: async (): Promise<Payment[]> => {
    try {
      const fetchPromise = fetchApi('/payments');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      const res = await Promise.race([fetchPromise, timeoutPromise]) as any;
      if (!res || !Array.isArray(res) || res.length === 0) throw new Error('EMPTY_DB');
      return res as Payment[];
    } catch (e) {
      console.warn('Payment API failed, falling back to mock data');
      const stored = localStorage.getItem('stayzen_mock_payments');
      if (stored) {
        try {
          return JSON.parse(stored) as Payment[];
        } catch (parseError) {
          localStorage.removeItem('stayzen_mock_payments');
        }
      }
      
      const mockPayments: Payment[] = [
        { id: 'PAY-8821', amount: 1750, status: 'Completed', type: 'Booking', method: 'Credit Card', date: '2025-02-01', referenceId: 'B-1001', description: 'Booking payment for Royal Palace' },
        { id: 'PAY-8822', amount: 720, status: 'Pending', type: 'Booking', method: 'PayPal', date: '2025-02-02', referenceId: 'B-1002', description: 'Booking payment for Serene Backwaters' },
        { id: 'PAY-8823', amount: 600, status: 'Refunded', type: 'Refund', method: 'Bank Transfer', date: '2025-02-03', referenceId: 'B-1003', description: 'Refund for Himalayan Panorama' },
        { id: 'PAY-8824', amount: 4250, status: 'Failed', type: 'Booking', method: 'Credit Card', date: '2025-02-04', referenceId: 'B-1004', description: 'Booking payment for Alpine Chalet' },
      ];
      return mockPayments;
    }
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
