import { fetchApi } from './apiClient';

export interface BankAccount {
  id: string;
  vendorId: string;
  vendorName: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  status: string; // Pending, Linked, Rejected
  swiftCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const bankApprovalService = {
  getBankAccounts: async (): Promise<BankAccount[]> => {
    try {
      const fetchPromise = fetchApi('/bank-accounts');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000));
      return await Promise.race([fetchPromise, timeoutPromise]) as BankAccount[];
    } catch (e) {
      console.warn('Bank Account API failed, falling back to mock data');
      const baseAccounts = [
        { vendorName: 'Global Stays LLC', bankName: 'HDFC Bank', accountType: 'Current Account', accountNumber: '**** **** 4592', accountHolder: 'Robert Johnson', status: 'Pending', swiftCode: 'HDFC000123' },
        { vendorName: 'City Escapes', bankName: 'ICICI Bank', accountType: 'Savings Account', accountNumber: '**** **** 1103', accountHolder: 'Alice Smith', status: 'Linked', swiftCode: 'ICICI000456' },
        { vendorName: 'Mountain Lodges', bankName: 'State Bank of India', accountType: 'Current Account', accountNumber: '**** **** 7731', accountHolder: 'Mountain Lodges Pvt Ltd', status: 'Pending', swiftCode: 'SBIN000789' },
        { vendorName: 'Tropical Villas', bankName: 'Axis Bank', accountType: 'Checking', accountNumber: '**** **** 9920', accountHolder: 'Tropical Villas Inc', status: 'Rejected', swiftCode: 'AXIS000999' },
        { vendorName: 'Urban Retreats', bankName: 'Kotak Mahindra', accountType: 'Savings Account', accountNumber: '**** **** 2244', accountHolder: 'David Chen', status: 'Linked', swiftCode: 'KKBK000111' },
      ];

      // Load from localStorage if available to persist between page loads
      const stored = localStorage.getItem('stayzen_mock_banks');
      if (stored) {
        return JSON.parse(stored) as BankAccount[];
      }

      const mockAccounts = [];
      const statuses = ['Pending', 'Pending', 'Linked', 'Linked', 'Rejected'];
      
      for (let i = 0; i < 42; i++) {
        const base = baseAccounts[i % baseAccounts.length];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        mockAccounts.push({
          ...base,
          id: (i + 1).toString(),
          vendorId: `vendor-${i+1}`,
          vendorName: `${base.vendorName} ${i > 4 ? `(Branch ${Math.ceil(i/5)})` : ''}`,
          accountNumber: `**** **** ${1000 + i}`,
          status: randomStatus
        });
      }
      localStorage.setItem('stayzen_mock_banks', JSON.stringify(mockAccounts));
      return mockAccounts as BankAccount[];
    }
  },
  
  approveAccount: async (id: string): Promise<void> => {
    try {
      await fetchApi(`/bank-accounts/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Linked' })
      });
    } catch (e) {
      // Fallback
      const stored = localStorage.getItem('stayzen_mock_banks');
      if (stored) {
        const banks = JSON.parse(stored) as BankAccount[];
        const updated = banks.map(b => b.id === id ? { ...b, status: 'Linked' } : b);
        localStorage.setItem('stayzen_mock_banks', JSON.stringify(updated));
      }
    }
  },
  
  rejectAccount: async (id: string): Promise<void> => {
    try {
      await fetchApi(`/bank-accounts/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Rejected' })
      });
    } catch (e) {
      // Fallback
      const stored = localStorage.getItem('stayzen_mock_banks');
      if (stored) {
        const banks = JSON.parse(stored) as BankAccount[];
        const updated = banks.map(b => b.id === id ? { ...b, status: 'Rejected' } : b);
        localStorage.setItem('stayzen_mock_banks', JSON.stringify(updated));
      }
    }
  }
};
