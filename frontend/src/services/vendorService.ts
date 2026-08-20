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

      // Load from localStorage if available to persist between page loads
      const stored = localStorage.getItem('stayzen_mock_vendors');
      if (stored) {
        try {
          return JSON.parse(stored) as Vendor[];
        } catch (parseError) {
          localStorage.removeItem('stayzen_mock_vendors');
        }
      }

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
      localStorage.setItem('stayzen_mock_vendors', JSON.stringify(mockVendors));
      return mockVendors as Vendor[];
    }
  },
  
  approveVendor: async (id: string): Promise<void> => {
    try {
      await fetchApi(`/vendors/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Active' })
      });
    } catch (e) {
      // Fallback
      const stored = localStorage.getItem('stayzen_mock_vendors');
      if (stored) {
        const vendors = JSON.parse(stored) as Vendor[];
        const updated = vendors.map(v => v.id === id ? { ...v, status: 'Active' } : v);
        localStorage.setItem('stayzen_mock_vendors', JSON.stringify(updated));
      }
    }
  },
  
  suspendVendor: async (id: string): Promise<void> => {
    try {
      await fetchApi(`/vendors/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Suspended' })
      });
    } catch (e) {
      // Fallback
      const stored = localStorage.getItem('stayzen_mock_vendors');
      if (stored) {
        const vendors = JSON.parse(stored) as Vendor[];
        const updated = vendors.map(v => v.id === id ? { ...v, status: 'Suspended' } : v);
        localStorage.setItem('stayzen_mock_vendors', JSON.stringify(updated));
      }
    }
  },

  deleteVendor: async (id: string): Promise<void> => {
    try {
      await fetchApi(`/vendors/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      // Fallback
      const stored = localStorage.getItem('stayzen_mock_vendors');
      if (stored) {
        const vendors = JSON.parse(stored) as Vendor[];
        const updated = vendors.filter(v => v.id !== id);
        localStorage.setItem('stayzen_mock_vendors', JSON.stringify(updated));
      }
    }
  },

  createVendor: async (data: Partial<Vendor>): Promise<Vendor> => {
    try {
      const fetchPromise = fetchApi('/vendors', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      return await Promise.race([fetchPromise, timeoutPromise]) as Vendor;
    } catch (e) {
      // Fallback
      const newVendor = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        status: 'Pending',
        propertiesCount: 0,
        rating: 0,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        kycStatus: 'Pending'
      } as Vendor;
      
      const stored = localStorage.getItem('stayzen_mock_vendors');
      const vendors = stored ? JSON.parse(stored) : [];
      localStorage.setItem('stayzen_mock_vendors', JSON.stringify([newVendor, ...vendors]));
      
      // Auto-create a pending bank account for this new vendor so it shows in Bank Approvals
      const storedBanks = localStorage.getItem('stayzen_mock_banks');
      const banks = storedBanks ? JSON.parse(storedBanks) : [];
      const newBank = {
        id: Math.random().toString(36).substr(2, 9),
        vendorId: newVendor.id,
        vendorName: newVendor.name,
        bankName: 'Pending Setup',
        accountType: 'Checking',
        accountNumber: '**** **** **** ****',
        accountHolder: newVendor.name,
        status: 'Pending'
      };
      localStorage.setItem('stayzen_mock_banks', JSON.stringify([newBank, ...banks]));
      
      return newVendor;
    }
  }
};
