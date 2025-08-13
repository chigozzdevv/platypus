import api from './api';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';

export const authService = {
  async connect(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/connect', loginData);
    api.setToken(response.token);
    return response;
  },

  async getProfile(): Promise<User> {
    return api.get('/auth/profile');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return api.put('/auth/profile', data);
  },

  async connectExchange(exchangeData: {
    exchange: string;
    privateKey: string;
    walletAddress: string;
  }): Promise<void> {
    return api.post('/auth/exchange/connect', exchangeData);
  },

  async getExchangeStatus(exchange: string): Promise<{
    connected: boolean;
    walletAddress: string;
    lastSync: string;
    balance: number;
  }> {
    return api.get(`/auth/exchange/${exchange}/status`);
  },

  async logout(): Promise<void> {
    api.setToken(null);
  },
};
