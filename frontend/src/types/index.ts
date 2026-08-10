export type UserStatus = 'Active' | 'Suspended' | 'Pending';
export type VerificationStatus = 'Verified' | 'Unverified' | 'Pending';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  verification: VerificationStatus;
  joinedDate: string;
  lastLogin: string;
  bookingsCount: number;
}

export type PropertyStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended' | 'Draft';

export interface Property {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  type: string;
  location: string;
  price: number;
  rating: number;
  status: PropertyStatus;
  imageUrl?: string;
  // Added details
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  amenities?: string[];
  hostEmail?: string;
  hostPhone?: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' | 'Refund Requested';

export interface Booking {
  id: string;
  customerName: string;
  propertyTitle: string;
  vendorName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  status: BookingStatus;
}

export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';
export type PaymentType = 'Booking' | 'Payout' | 'Refund' | 'Fee';

export interface Payment {
  id: string;
  date: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  method: string;
  referenceId: string; // Booking ID or Vendor ID
  description: string;
}
