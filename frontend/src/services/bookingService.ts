import { type Booking } from '../types';
import { fetchApi } from './apiClient';

export const bookingService = {
  getBookings: async (): Promise<Booking[]> => {
    try {
      const fetchPromise = fetchApi('/bookings');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      const res = await Promise.race([fetchPromise, timeoutPromise]) as any;
      if (!res || !Array.isArray(res) || res.length === 0) throw new Error('EMPTY_DB');
      return res as Booking[];
    } catch (e) {
      console.warn('Booking API failed, falling back to mock data');
      const stored = localStorage.getItem('stayzen_mock_bookings');
      if (stored) {
        try {
          return JSON.parse(stored) as Booking[];
        } catch (parseError) {
          localStorage.removeItem('stayzen_mock_bookings');
        }
      }
      
      const mockBookings: Booking[] = [
        { id: 'B-1001', propertyTitle: 'Royal Palace Heritage', customerName: 'John Doe', vendorName: 'Luxury Stays', checkIn: '2025-05-10', checkOut: '2025-05-15', amount: 1750, status: 'Confirmed', paymentStatus: 'Paid' },
        { id: 'B-1002', propertyTitle: 'Serene Backwaters', customerName: 'Alice Smith', vendorName: 'Coastal Retreats', checkIn: '2025-06-01', checkOut: '2025-06-05', amount: 720, status: 'Pending', paymentStatus: 'Pending' },
        { id: 'B-1003', propertyTitle: 'Himalayan Panorama', customerName: 'Bob Jones', vendorName: 'Alpine Escapes', checkIn: '2025-07-15', checkOut: '2025-07-20', amount: 600, status: 'Cancelled', paymentStatus: 'Refunded' },
        { id: 'B-1004', propertyTitle: 'Modern Alpine Chalet', customerName: 'Charlie Brown', vendorName: 'Luxury Stays', checkIn: '2025-08-10', checkOut: '2025-08-15', amount: 4250, status: 'Refund Requested', paymentStatus: 'Paid' },
      ];
      return mockBookings;
    }
  },
  
  cancelBooking: async (id: string): Promise<void> => {
    await fetchApi(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Cancelled' })
    });
  },
  
  approveBooking: async (id: string): Promise<void> => {
    await fetchApi(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Approved' })
    });
  },
  
  refundBooking: async (id: string): Promise<void> => {
    await fetchApi(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Refund Requested' })
    });
  }
};
