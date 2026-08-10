import { type Booking } from '../types';

export const mockBookings: Booking[] = [
  { id: 'SZ10294', customerName: 'John Doe', propertyTitle: 'Luxury Villa with Pool', vendorName: 'Global Stays', checkIn: '2026-08-10', checkOut: '2026-08-15', amount: 2250, paymentStatus: 'Paid', status: 'Upcoming' as any },
  { id: 'SZ10295', customerName: 'Alice Smith', propertyTitle: 'Downtown Studio Apartment', vendorName: 'CityStays LLC', checkIn: '2026-08-01', checkOut: '2026-08-05', amount: 600, paymentStatus: 'Paid', status: 'Completed' },
];
