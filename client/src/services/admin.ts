import api from './api';
import { campService } from './camp';
import { signalsService } from './signals';
import type { Signal } from '@/types/signals';

export const adminService = {
  async getSignalsForReview(params?: {
    minConfidence?: number;
    maxAge?: number;
    symbol?: string;
    aiModel?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<{ signals: Signal[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => v !== undefined && searchParams.append(k, String(v)));
    }
    return api.get(`/signals/admin/pending?${searchParams.toString()}`);
  },

  async getApprovedForMinting(params?: {
    symbol?: string;
    aiModel?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<{ signals: Signal[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => v !== undefined && searchParams.append(k, String(v)));
    }
    return api.get(`/signals/admin/approved?${searchParams.toString()}`);
  },

  async approveSignal(signalId: string, adminNotes?: string): Promise<{ signal: Signal; message: string }> {
    return api.put(`/signals/admin/${signalId}/approve`, { adminNotes });
  },

  async rejectSignal(signalId: string, adminNotes: string): Promise<{ signal: Signal; message: string }> {
    return api.put(`/signals/admin/${signalId}/reject`, { adminNotes });
  },

  async generatePlatformSignals(count: number = 25): Promise<{ signals: Signal[]; generated: number; message: string }> {
    return api.post('/signals/admin/generate-platform', { count });
  },

  async mintSignalAsParent(signalId: string): Promise<{ tokenId: string; transactionHash: string }> {
    const { signal } = await signalsService.getSignal(signalId);
    const result = await campService.mintSignalAsParent(signal);
    if (!result) throw new Error('Failed to mint signal as parent');

    const tokenId = typeof result === 'string' ? result : (result as any).tokenId || result;
    const transactionHash = typeof result === 'object' ? (result as any).transactionHash : undefined;

    await api.put(`/signals/${signalId}/mark-minted`, {
      tokenId,
      transactionHash: transactionHash || `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
    });

    return { tokenId, transactionHash: transactionHash || '' };
  },

  async batchMintSignals(signalIds: string[]): Promise<Array<{ signalId: string; success: boolean; tokenId?: string; error?: string }>> {
    const results: Array<{ signalId: string; success: boolean; tokenId?: string; error?: string }> = [];
    for (const signalId of signalIds) {
      try {
        const minted = await this.mintSignalAsParent(signalId);
        results.push({ signalId, success: true, tokenId: minted.tokenId });
      } catch (e: any) {
        results.push({ signalId, success: false, error: e?.message || 'Mint failed' });
      }
    }
    return results;
  },

  async getPlatformAnalytics(): Promise<{
    totalSignals: number;
    totalImprovements: number;
    totalRevenue: number;
    activeUsers: number;
    topPerformers: Array<{ username: string; improvements: number; revenue: number }>;
  }> {
    return api.get('/admin/analytics');
  },
};
