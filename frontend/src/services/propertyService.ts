import { type Property } from '../types';
import { fetchApi } from './apiClient';

export const propertyService = {
  getProperties: async (): Promise<Property[]> => {
    return fetchApi('/properties');
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
