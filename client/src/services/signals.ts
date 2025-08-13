import api from './api';
import { campService } from './camp';
import type { Signal, CreateSignalRequest, ImproveSignalRequest, SignalImprovement, SignalsResponse} from '@/types/signals';



export const signalsService = {
  async getPublicSignals(params?: {
    symbol?: string;
    minConfidence?: number;
    sortBy?: string;
    hasImprovements?: boolean;
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

  async improveSignal(signalId: string, data: ImproveSignalRequest): Promise<{
    improvement: SignalImprovement;
    qualityScore: number;
    canMint: boolean;
  }> {
    return api.post(`/signals/${signalId}/improve`, data);
  },

  async checkImprovementQuality(signalId: string, improvementData: ImproveSignalRequest): Promise<{
    qualityScore: number;
    canMint: boolean;
    feedback: string[];
  }> {
    return api.post(`/signals/${signalId}/check-improvement`, improvementData);
  },

  async mintImprovement(signalId: string, improvementIndex: number): Promise<{ tokenId: string; transactionHash: string }> {
    const { signal } = await this.getSignal(signalId);
    const improvement = signal.improvements?.[improvementIndex];
    
    if (!improvement) {
      throw new Error('Improvement not found');
    }

    const result = await campService.mintImprovement(signal, improvement);
    
    if (!result) {
      throw new Error('Failed to mint improvement');
    }
    
    const tokenId = typeof result === 'string' ? result : (result as any).tokenId || result;
    const transactionHash = typeof result === 'object' ? (result as any).transactionHash : undefined;

    await api.put(`/signals/${signalId}/improvements/${improvementIndex}/mark-minted`, {
      tokenId,
      transactionHash: transactionHash || `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`
    });

    return { tokenId, transactionHash: transactionHash || '' };
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

  async searchSignals(query: string, params?: {
    symbol?: string;
    minConfidence?: number;
    limit?: number;
    offset?: number;
  }): Promise<SignalsResponse> {
    const searchParams = new URLSearchParams({ q: query });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/signals/search?${searchParams.toString()}`);
  },

  // Check if signal has expired (30 days)
  isSignalExpired(signal: Signal): boolean {
    return new Date() > new Date(signal.expiresAt);
  },

  async hasSignalAccess(signal: Signal): Promise<boolean> {
    if (!signal.registeredAsIP || !signal.ipTokenId) {
      return true;
    }
    return await campService.checkAccess(signal.ipTokenId);
  },
};