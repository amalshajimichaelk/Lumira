import axios from 'axios';
import { useAuthStore } from '../store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Services
export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials).then(res => ({
    user: res.data.data.user,
    token: res.data.data.accessToken
  })),
  me: () => api.get('/auth/me').then(res => res.data.data),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary').then(res => {
    const data = res.data.data;
    return {
      patientsToday: { value: data.patientsToday || 0, trend: '+0%', isPositive: true },
      topDept: { name: data.topDepartment?.name || 'N/A', value: data.topDepartment?.count || 0 },
      avgWaitTime: { value: data.avgWaitTimeMin || 0, trend: '-0 min', isPositive: true },
      revenueMtd: { value: `$${(data.revenueToday || 0).toLocaleString()}`, trend: '+0%', isPositive: true },
    };
  }),
};

export const dataService = {
  // Doctors
  getAllDoctors: () => api.get('/doctors').then(res => res.data.data),
  getDoctors: () => api.get('/doctors/workload').then(res => res.data.data),
  
  // Patients
  getPatients: (params?: any) => api.get('/patients/visits', { params }).then(res => res.data),
  
  // Departments
  getDepartmentPerformance: (params?: any) => api.get('/departments/performance', { params }).then(res => res.data.data),
  
  // Revenue
  getRevenue: (params?: any) => api.get('/revenue', { params }).then(res => res.data.data),
  getRevenueBreakdown: () => api.get('/revenue/breakdown').then(res => res.data.data),
  
  // Appointments
  getAppointments: (params?: any) => api.get('/appointments', { params }).then(res => res.data),
  getCalendar: (month: string) => api.get('/appointments/calendar', { params: { month } }).then(res => res.data.data),
};

export default api;
