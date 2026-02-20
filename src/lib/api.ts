import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginDto, AuthResponseDto, CreateDeliveryDto, CompleteWorkOrderDto } from '@/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  /** Login do motorista (CPF + senha) */
  login: async (data: LoginDto): Promise<AuthResponseDto> => {
    const response = await api.post('/auth/driver/login', {
      cpf: data.cpf.replace(/\D/g, ''),
      password: data.password,
    });
    return response.data;
  },
};

export const dumpstersApi = {
  getAll: () => api.get('/dumpsters'),
  getById: (id: string) => api.get(`/dumpsters/${id}`),
};

export const deliveriesApi = {
  getAll: () => api.get('/deliveries'),
  create: (data: CreateDeliveryDto) => api.post('/deliveries', data),
};

export const workOrdersApi = {
  getMyOrders: () => api.get('/work-orders/driver'),
  getById: (id: string) => api.get(`/work-orders/driver/${id}`),
  start: (id: string) => api.post(`/work-orders/driver/${id}/start`),
  complete: (id: string, formData: FormData) =>
    api.post(`/work-orders/driver/${id}/complete`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export const jobSitesApi = {
  getAll: () => api.get('/job-sites'),
  getById: (id: string) => api.get(`/job-sites/${id}`),
};

export default api;
