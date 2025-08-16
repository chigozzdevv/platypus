import api from './api';
import { campService } from './camp';
import type {
  Signal,
  CreateSignalRequest,
  ImproveSignalRequest,
  SignalImprovement,
  SignalsResponse,
} from '@/types/signals';

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
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return api.get(`/signals/public?${searchParams.toString()}`);
  },

  async getMarketplaceImprovements(params?: {
    symbol?: string;
    minConfidence?: number;
    sortBy?: 'newest' | 'confidence';
    limit?: number;
    offset?: number;
  }): Promise<SignalsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return api.get(`/signals/marketplace?${searchParams.toString()}`);
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
        if (value !== undefined) searchParams.append(key, String(value));
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

  async improveSignal(
    signalId: string,
    data: ImproveSignalRequest
  ): Promise<{ improvement: SignalImprovement; qualityScore: number; canMint: boolean }> {
    return api.post(`/signals/${signalId}/improve`, data);
  },

  async checkImprovementQuality(
    signalId: string,
    improvementData: ImproveSignalRequest
  ): Promise<{ qualityScore: number; canMint: boolean; feedback: string[] }> {
    return api.post(`/signals/${signalId}/check-improvement`, improvementData);
  },

  async mintImprovement(
    signalId: string,
    improvementIndex: number
  ): Promise<{ tokenId: string; transactionHash?: string }> {
    const { signal } = await this.getSignal(signalId);
    const improvement = signal.improvements?.[improvementIndex] as any;
    if (!improvement) throw new Error('Improvement not found');
    const res = await campService.mintImprovement(signal as any, improvement as any);
    const tokenId = (res as any)?.tokenId ?? String(res);
    const transactionHash = (res as any)?.transactionHash || undefined;
    const body: Record<string, any> = { tokenId: String(tokenId) };
    if (transactionHash) body.transactionHash = transactionHash;
    await api.put(`/signals/${signalId}/improvements/${improvementIndex}/mark-minted`, body);
    return { tokenId: String(tokenId), transactionHash };
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
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return api.get(`/signals/user/signals?${searchParams.toString()}`);
  },

  async searchSignals(
    query: string,
    params?: { symbol?: string; minConfidence?: number; limit?: number; offset?: number }
  ): Promise<SignalsResponse> {
    const searchParams = new URLSearchParams({ q: query });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return api.get(`/signals/search?${searchParams.toString()}`);
  },

  isSignalExpired(signal: Signal): boolean {
    return new Date() > new Date(signal.expiresAt);
  },

  async hasSignalAccess(signal: Signal): Promise<boolean> {
    if (!signal.registeredAsIP || !signal.ipTokenId) return true;
    return await campService.checkAccess(signal.ipTokenId);
  },
};