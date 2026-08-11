export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://stayzen-admin-api.onrender.com';
export const API_URL = `${API_BASE_URL}/api`;

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers
      }
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized - please log in again');
      if (res.status === 403) throw new Error('Forbidden - you lack permission for this action');
      if (res.status === 404) throw new Error('Not Found - the requested resource does not exist');
      if (res.status >= 500) throw new Error('Server Error - the backend is experiencing issues');
      throw new Error(`API Error: ${res.status}`);
    }
    
    return await res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Network Error - The Render backend might be waking up from a cold-start, or you are offline. Please try again in 30 seconds.');
    }
    throw err;
  }
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
