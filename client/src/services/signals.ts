import api from './api';
import type { Signal, CreateSignalRequest, ImproveSignalRequest } from '@/types/signals';

interface SignalsResponse {
  signals: Signal[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const signalsService = {
  async getPublicSignals(params?: {
    symbol?: string;
    minConfidence?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<SignalsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/signals/public?${searchParams.toString()}`);
  },

  async getImprovableSignals(params?: {
    symbol?: string;
    minConfidence?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<SignalsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/signals/improvable?${searchParams.toString()}`);
  },

  async getSignal(signalId: string): Promise<{ signal: Signal }> {
    return api.get(`/signals/${signalId}`);
  },

  async createSignal(data: CreateSignalRequest): Promise<{ signal: Signal; message: string }> {
    return api.post('/signals', data);
  },

  async improveSignal(signalId: string, data: ImproveSignalRequest): Promise<void> {
    return api.post(`/signals/${signalId}/improve`, data);
  },

  async getUserSignals(params?: {
    status?: string;
    symbol?: string;
    outcome?: string;
    limit?: number;
    offset?: number;
  }): Promise<SignalsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/signals/user/signals?${searchParams.toString()}`);
  },
};