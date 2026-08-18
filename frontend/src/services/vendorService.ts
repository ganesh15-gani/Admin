import { fetchApi } from './apiClient';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  status: string; // Active, Pending, Suspended
  propertiesCount: number;
  rating: number;
  joinedDate: string;
  kycStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

export const vendorService = {
  getVendors: async (): Promise<Vendor[]> => {
    try {
      const fetchPromise = fetchApi('/vendors');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      return await Promise.race([fetchPromise, timeoutPromise]) as Vendor[];
    } catch (e) {
      console.warn('Vendor API failed, falling back to mock data');
      const baseVendors = [
        { name: 'Luxury Stays Group', email: 'contact@luxurystays.com', phone: '+1 212 555 0199', companyName: 'Luxury Stays LLC', status: 'Active', propertiesCount: 12, rating: 4.8, joinedDate: 'Jan 2025', kycStatus: 'Verified' },
        { name: 'Coastal Retreats', email: 'hello@coastalretreats.io', phone: '+1 415 555 0188', companyName: 'Coastal Property Mgmt', status: 'Active', propertiesCount: 8, rating: 4.9, joinedDate: 'Feb 2025', kycStatus: 'Verified' },
        { name: 'Urban Zen Homes', email: 'partners@urbanzen.net', phone: '+1 312 555 0177', companyName: 'Urban Zen Inc', status: 'Pending', propertiesCount: 3, rating: 4.5, joinedDate: 'Mar 2025', kycStatus: 'Pending' },
        { name: 'Alpine Escapes', email: 'host@alpineescapes.ch', phone: '+41 44 555 0166', companyName: 'Alpine Escapes AG', status: 'Suspended', propertiesCount: 5, rating: 3.9, joinedDate: 'Dec 2024', kycStatus: 'Rejected' },
        { name: 'Tropical Paradise', email: 'aloha@tropicalparadise.com', phone: '+1 808 555 0155', companyName: 'Tropical Paradise LLC', status: 'Active', propertiesCount: 15, rating: 5.0, joinedDate: 'Nov 2024', kycStatus: 'Verified' },
      ];

      const mockVendors = [];
      const statuses = ['Active', 'Active', 'Pending', 'Suspended'];
      
      for (let i = 0; i < 28; i++) {
        const base = baseVendors[i % baseVendors.length];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        mockVendors.push({
          ...base,
          id: (i + 1).toString(),
          name: `${base.name} ${i > 4 ? `(Region ${Math.ceil(i/5)})` : ''}`,
          email: `vendor${i+1}@example.com`,
          status: randomStatus,
          kycStatus: randomStatus === 'Active' ? 'Verified' : randomStatus === 'Pending' ? 'Pending' : 'Rejected'
        });
      }
      return mockVendors as Vendor[];
    }
  },
  
  approveVendor: async (id: string): Promise<void> => {
    await fetchApi(`/vendors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Active' })
    });
  },
  
  suspendVendor: async (id: string): Promise<void> => {
    await fetchApi(`/vendors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Suspended' })
    });
  },

  deleteVendor: async (id: string): Promise<void> => {
    await fetchApi(`/vendors/${id}`, {
      method: 'DELETE'
    });
  }
};
