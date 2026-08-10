export const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api' 
  : 'https://stayzen-admin-api.onrender.com/api';

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
