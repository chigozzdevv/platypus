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
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/signals/admin/pending?${searchParams.toString()}`);
  },

  async approveSignal(signalId: string, adminNotes?: string) {
    return api.put(`/signals/admin/${signalId}/approve`, { adminNotes });
  },

  async rejectSignal(signalId: string, adminNotes: string) {
    return api.put(`/signals/admin/${signalId}/reject`, { adminNotes });
  },

  // Generate platform signals
  async generatePlatformSignals(count: number = 25): Promise<{
    signals: Signal[];
    generated: number;
    message: string;
  }> {
    return api.post('/signals/admin/generate-platform', { count });
  },

  async mintSignalAsParent(signalId: string): Promise<{ tokenId: string; transactionHash: string }> {
    const { signal } = await signalsService.getSignal(signalId);
    const result = await campService.mintSignalAsParent(signal);
    
    if (!result) {
      throw new Error('Failed to mint signal as parent');
    }
    
    const tokenId = typeof result === 'string' ? result : (result as any).tokenId || result;
    const transactionHash = typeof result === 'object' ? (result as any).transactionHash : undefined;

    await api.put(`/signals/${signalId}/mark-minted`, {
      tokenId,
      transactionHash: transactionHash || `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`
    });

    return { tokenId, transactionHash: transactionHash || '' };
  },

  async batchMintSignals(signalIds: string[]): Promise<Array<{
    signalId: string;
    success: boolean;
    tokenId?: string;
    error?: string;
  }>> {
    const results = [];
    
    for (const signalId of signalIds) {
      try {
        const result = await this.mintSignalAsParent(signalId);
        results.push({
          signalId,
          success: true,
          tokenId: result.tokenId
        });
      } catch (error: any) {
        results.push({
          signalId,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  },

  // Platform analytics for admin
  async getPlatformAnalytics(): Promise<{
    totalSignals: number;
    totalImprovements: number;
    totalRevenue: number;
    activeUsers: number;
    topPerformers: Array<{
      username: string;
      improvements: number;
      revenue: number;
    }>;
  }> {
    return api.get('/admin/analytics');
  },
};