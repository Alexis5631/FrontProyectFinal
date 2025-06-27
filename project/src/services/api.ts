import axios from 'axios';
import { AuthResponse, User, Client, Vehicle, ServiceOrder, Part, Invoice, AuditLog, PaginatedResponse } from '../types';
import { mockApi } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // Default to true for demo

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Real API functions (for when backend is available)
const realApi = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<AuthResponse>('/auth/login', { email, password }),
    getCurrentUser: () =>
      apiClient.get<User>('/auth/me'),
  },

  // Users endpoints
  users: {
    getAll: (params?: any) =>
      apiClient.get<PaginatedResponse<User>>('/users', { params }),
    getById: (id: string) =>
      apiClient.get<User>(`/users/${id}`),
    create: (data: Partial<User>) =>
      apiClient.post<User>('/users', data),
    update: (id: string, data: Partial<User>) =>
      apiClient.put<User>(`/users/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/users/${id}`),
  },

  // Clients endpoints
  clients: {
    getAll: (params?: any) =>
      apiClient.get<PaginatedResponse<Client>>('/clients', { params }),
    getById: (id: string) =>
      apiClient.get<Client>(`/clients/${id}`),
    create: (data: Partial<Client>) =>
      apiClient.post<Client>('/clients', data),
    update: (id: string, data: Partial<Client>) =>
      apiClient.put<Client>(`/clients/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/clients/${id}`),
  },

  // Vehicles endpoints
  vehicles: {
    getAll: (params?: any) =>
      apiClient.get<PaginatedResponse<Vehicle>>('/vehicles', { params }),
    getById: (id: string) =>
      apiClient.get<Vehicle>(`/vehicles/${id}`),
    create: (data: Partial<Vehicle>) =>
      apiClient.post<Vehicle>('/vehicles', data),
    update: (id: string, data: Partial<Vehicle>) =>
      apiClient.put<Vehicle>(`/vehicles/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/vehicles/${id}`),
    getByClient: (clientId: string) =>
      apiClient.get<Vehicle[]>(`/vehicles/client/${clientId}`),
  },

  // Service Orders endpoints
  serviceOrders: {
    getAll: (params?: any) =>
      apiClient.get<PaginatedResponse<ServiceOrder>>('/service-orders', { params }),
    getById: (id: string) =>
      apiClient.get<ServiceOrder>(`/service-orders/${id}`),
    create: (data: Partial<ServiceOrder>) =>
      apiClient.post<ServiceOrder>('/service-orders', data),
    update: (id: string, data: Partial<ServiceOrder>) =>
      apiClient.put<ServiceOrder>(`/service-orders/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/service-orders/${id}`),
    updateStatus: (id: string, status: ServiceOrder['status']) =>
      apiClient.patch<ServiceOrder>(`/service-orders/${id}/status`, { status }),
  },

  // Parts endpoints
  parts: {
    getAll: (params?: any) =>
      apiClient.get<PaginatedResponse<Part>>('/parts', { params }),
    getById: (id: string) =>
      apiClient.get<Part>(`/parts/${id}`),
    create: (data: Partial<Part>) =>
      apiClient.post<Part>('/parts', data),
    update: (id: string, data: Partial<Part>) =>
      apiClient.put<Part>(`/parts/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/parts/${id}`),
    getLowStock: () =>
      apiClient.get<Part[]>('/parts/low-stock'),
  },

  // Invoices endpoints
  invoices: {
    getAll: (params?: any) =>
      apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params }),
    getById: (id: string) =>
      apiClient.get<Invoice>(`/invoices/${id}`),
    create: (data: Partial<Invoice>) =>
      apiClient.post<Invoice>('/invoices', data),
    update: (id: string, data: Partial<Invoice>) =>
      apiClient.put<Invoice>(`/invoices/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/invoices/${id}`),
    generatePdf: (id: string) =>
      apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  },

  // Audit logs endpoints
  auditLogs: {
    getAll: (params?: any) =>
      apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { params }),
  },
};

// Export the appropriate API based on environment
export const api = USE_MOCK_API ? mockApi : realApi;

export default apiClient;