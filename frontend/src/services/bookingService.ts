import { type Booking } from '../types';
import { fetchApi } from './apiClient';

export const bookingService = {
  getBookings: async (): Promise<Booking[]> => {
    return fetchApi('/bookings');
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
