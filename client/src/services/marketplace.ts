import { signalsService } from './signals';
import { campService } from './camp';
import type { Signal } from '@/types/signals';
import type { MarketplaceResponse } from '@/types/marketplace';

export const marketplaceService = {
  async getMarketplace(params?: {
    symbol?: string;
    minConfidence?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceResponse> {
    // Get all public signals that have improvements
    const response = await signalsService.getPublicSignals({
      ...params,
      hasImprovements: true,
    });

    const improvedSignals = response.signals
      .filter((signal: Signal) => signal.improvements && signal.improvements.length > 0)
      .map((signal: Signal) => {
        const improvement = signal.improvements![0];
        return {
          id: signal.id,
          symbol: signal.symbol,
          side: signal.side,
          confidence: signal.confidence,
          description: `Improved ${signal.symbol} trading signal. ${improvement.reasoning.slice(0, 150)}...`,
          creator: signal.creator,
          improvement: {
            type: improvement.improvementType,
            creator: improvement.creator,
            qualityScore: improvement.qualityScore,
            ipTokenId: improvement.ipTokenId,
            reasoning: improvement.reasoning,
          },
          originalTokenId: signal.ipTokenId!,
          totalUsage: 0,
          createdAt: improvement.createdAt,
          accessPrice: '1 CAMP',
          fullSignal: signal,
        };
      });

    return {
      signals: improvedSignals,
      total: improvedSignals.length
    };
  },

  async purchaseImprovementAccess(improvementTokenId: string): Promise<{ success: boolean; transactionHash: string }> {
    const result = await campService.purchaseAccess(improvementTokenId, 1);
    
    return {
      success: true,
      transactionHash: result.transactionHash || ''
    };
  },

  async checkImprovementAccess(improvementTokenId: string): Promise<{ hasAccess: boolean }> {
    const hasAccess = await campService.checkAccess(improvementTokenId);
    return { hasAccess };
  },

  async getSignalDetails(signalId: string): Promise<Signal> {
    const { signal } = await signalsService.getSignal(signalId);
    return signal;
  },

  async getUserAssets(): Promise<{ assets: any[]; total: number }> {
    const userSignals = await signalsService.getUserSignals();
    
    const assets = userSignals.signals
      .filter((signal: Signal) => signal.registeredAsIP)
      .map((signal: Signal) => ({
        tokenId: signal.ipTokenId,
        name: `${signal.symbol} Trading Signal`,
        type: 'signal',
        revenue: 0,
        totalSales: 0,
        createdAt: signal.createdAt
      }));

    return { assets, total: assets.length };
  },
};