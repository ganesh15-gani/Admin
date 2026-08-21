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
        { id: 'B-1001', propertyName: 'Royal Palace Heritage', guestName: 'John Doe', hostName: 'Luxury Stays', checkIn: '2025-05-10', checkOut: '2025-05-15', amount: 1750, status: 'Confirmed', propertyId: '1', guestId: '1', hostId: '2', createdAt: '2025-02-01' },
        { id: 'B-1002', propertyName: 'Serene Backwaters', guestName: 'Alice Smith', hostName: 'Coastal Retreats', checkIn: '2025-06-01', checkOut: '2025-06-05', amount: 720, status: 'Pending', propertyId: '2', guestId: '2', hostId: '3', createdAt: '2025-02-02' },
        { id: 'B-1003', propertyName: 'Himalayan Panorama', guestName: 'Bob Jones', hostName: 'Alpine Escapes', checkIn: '2025-07-15', checkOut: '2025-07-20', amount: 600, status: 'Cancelled', propertyId: '3', guestId: '3', hostId: '4', createdAt: '2025-02-03' },
        { id: 'B-1004', propertyName: 'Modern Alpine Chalet', guestName: 'Charlie Brown', hostName: 'Luxury Stays', checkIn: '2025-08-10', checkOut: '2025-08-15', amount: 4250, status: 'Refund Requested', propertyId: '4', guestId: '4', hostId: '2', createdAt: '2025-02-04' },
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
