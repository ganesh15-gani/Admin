import { fetchApi, delay } from './apiClient';

export interface DashboardMetrics {
  totalUsers: number;
  totalProperties: number;
  activeBookings: number;
  totalRevenue: number;
  activeVendors: number;
  pendingApprovals: number;
  supportTickets: number;
  cancellationRate: number;
  trends: {
    users: number;
    properties: number;
    bookings: number;
    revenue: number;
  }
}

export type TimeFilter = 'Today' | '7 Days' | '30 Days' | 'This Year';

export const dashboardService = {
  getMetrics: async (filter: TimeFilter = 'This Year'): Promise<DashboardMetrics> => {
    try {
      return await fetchApi(`/dashboard/metrics?filter=${encodeURIComponent(filter)}`);
    } catch (error) {
      console.warn('Dashboard API failed (likely backend not deployed yet), falling back to mock data', error);
      
      let multiplier = 1;
      if (filter === 'Today') multiplier = 0.01;
      if (filter === '7 Days') multiplier = 0.08;
      if (filter === '30 Days') multiplier = 0.25;
  
      return {
        totalUsers: Math.floor(12450 * multiplier),
        totalProperties: Math.floor(840 * multiplier) || 12,
        activeBookings: Math.floor(320 * multiplier) || 5,
        totalRevenue: Math.floor(1450000 * multiplier),
        activeVendors: Math.floor(145 * multiplier) || 8,
        pendingApprovals: Math.floor(24 * multiplier),
        supportTickets: Math.floor(18 * multiplier),
        cancellationRate: filter === 'This Year' ? 2.4 : filter === 'Today' ? 0 : 1.2,
        trends: {
          users: filter === 'Today' ? 1.5 : filter === '7 Days' ? 4.2 : 12.5,
          properties: filter === 'Today' ? 0 : filter === '7 Days' ? 1.2 : 5.2,
          bookings: filter === 'Today' ? -0.5 : filter === '7 Days' ? 1.4 : -2.4,
          revenue: filter === 'Today' ? 2.1 : filter === '7 Days' ? 8.5 : 18.2
        }
      };
    }
  },
  
  getRevenueData: async (filter: TimeFilter = 'This Year') => {
    await delay(600);
    
    if (filter === 'Today') {
      return [
        { name: '8 AM', revenue: 400, bookings: 2 },
        { name: '10 AM', revenue: 300, bookings: 1 },
        { name: '12 PM', revenue: 900, bookings: 4 },
        { name: '2 PM', revenue: 200, bookings: 1 },
        { name: '4 PM', revenue: 600, bookings: 3 },
      ];
    }
    
    if (filter === '7 Days') {
      return [
        { name: 'Mon', revenue: 4000, bookings: 24 },
        { name: 'Tue', revenue: 3000, bookings: 13 },
        { name: 'Wed', revenue: 2000, bookings: 9 },
        { name: 'Thu', revenue: 2780, bookings: 39 },
        { name: 'Fri', revenue: 5890, bookings: 48 },
        { name: 'Sat', revenue: 8390, bookings: 68 },
        { name: 'Sun', revenue: 7490, bookings: 53 },
      ];
    }
    
    if (filter === '30 Days') {
      return [
        { name: 'Week 1', revenue: 24000, bookings: 124 },
        { name: 'Week 2', revenue: 13000, bookings: 83 },
        { name: 'Week 3', revenue: 32000, bookings: 198 },
        { name: 'Week 4', revenue: 27800, bookings: 139 },
      ];
    }

    // Default 'This Year'
    return [
      { name: 'Jan', revenue: 40000, bookings: 240 },
      { name: 'Feb', revenue: 30000, bookings: 139 },
      { name: 'Mar', revenue: 20000, bookings: 980 },
      { name: 'Apr', revenue: 27800, bookings: 390 },
      { name: 'May', revenue: 18900, bookings: 480 },
      { name: 'Jun', revenue: 23900, bookings: 380 },
      { name: 'Jul', revenue: 34900, bookings: 430 },
    ];
  }
};
