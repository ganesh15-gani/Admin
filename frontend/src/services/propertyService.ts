import { type Property } from '../types';
import { fetchApi } from './apiClient';

export const propertyService = {
  getProperties: async (): Promise<Property[]> => {
    try {
      const fetchPromise = fetchApi('/properties');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      return await Promise.race([fetchPromise, timeoutPromise]) as Property[];
    } catch (e) {
      console.warn('Property API failed, falling back to mock data');
      return [
        { id: '1', title: 'Royal Palace Heritage Hotel', ownerId: '1', ownerName: 'Super Admin', type: 'Villa', location: 'Jaipur, Rajasthan, India', price: 350, rating: 4.9, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'Experience royal luxury in this authentic heritage palace...', bedrooms: 6, bathrooms: 8, maxGuests: 12, amenities: ['WiFi', 'Private Pool', 'Spa'], hostEmail: 'royal@jaipurheritage.in', hostPhone: '+91 98765 43210' },
        { id: '2', title: 'Serene Backwaters Retreat', ownerId: '1', ownerName: 'Super Admin', type: 'House', location: 'Alleppey, Kerala, India', price: 180, rating: 4.8, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'A beautiful traditional houseboat anchored in the tranquil backwaters...', bedrooms: 3, bathrooms: 3, maxGuests: 6, amenities: ['WiFi', 'AC', 'Private Deck'], hostEmail: 'bookings@keralaretreats.in', hostPhone: '+91 98765 43211' },
        { id: '3', title: 'Himalayan Panorama Cabin', ownerId: '1', ownerName: 'Super Admin', type: 'Cabin', location: 'Manali, Himachal Pradesh, India', price: 120, rating: 4.7, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1629807469720-31f13b194098?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'A cozy wooden cabin perched on a hillside with breathtaking views...', bedrooms: 2, bathrooms: 1, maxGuests: 4, amenities: ['Fireplace', 'Mountain View', 'Kitchen'], hostEmail: 'host@himalayancabins.in', hostPhone: '+91 98765 43212' },
        { id: '4', title: 'Modern Alpine Chalet', ownerId: '1', ownerName: 'Super Admin', type: 'Villa', location: 'Zermatt, Switzerland', price: 850, rating: 5.0, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'An ultra-luxurious, modern chalet with floor-to-ceiling windows...', bedrooms: 5, bathrooms: 6, maxGuests: 10, amenities: ['Ski-in/Ski-out', 'Hot Tub', 'Sauna'], hostEmail: 'chalet@zermattluxury.ch', hostPhone: '+41 44 123 4567' },
        { id: '5', title: 'Overwater Bungalow Oasis', ownerId: '1', ownerName: 'Super Admin', type: 'House', location: 'Bora Bora, French Polynesia', price: 1200, rating: 4.9, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'Experience paradise in this exclusive overwater bungalow...', bedrooms: 1, bathrooms: 2, maxGuests: 2, amenities: ['Ocean View', 'Private Plunge Pool', 'Snorkeling Gear'], hostEmail: 'reservations@boraboraoasis.pf', hostPhone: '+689 40 12 34 56' },
        { id: '6', title: 'Santorini Cliffside Villa', ownerId: '1', ownerName: 'Super Admin', type: 'Villa', location: 'Oia, Santorini, Greece', price: 600, rating: 4.9, status: 'Approved', imageUrl: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80', description: 'A stunning white-washed cave villa carved into the caldera cliff...', bedrooms: 2, bathrooms: 2, maxGuests: 4, amenities: ['Infinity Pool', 'Ocean View', 'WiFi'], hostEmail: 'hello@santorinivillas.gr', hostPhone: '+30 210 123 4567' }
      ] as Property[];
    }
  },
  
  approveProperty: async (id: string): Promise<void> => {
    await fetchApi(`/properties/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Approved' })
    });
  },
  
  rejectProperty: async (id: string, reason: string): Promise<void> => {
    await fetchApi(`/properties/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Rejected' })
    });
  },
  
  suspendProperty: async (id: string): Promise<void> => {
    await fetchApi(`/properties/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Suspended' })
    });
  },

  createProperty: async (data: Partial<Property>): Promise<Property> => {
    return await fetchApi('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  deleteProperty: async (id: string): Promise<void> => {
    await fetchApi(`/properties/${id}`, {
      method: 'DELETE'
    });
  }
};
