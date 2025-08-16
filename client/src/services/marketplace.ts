import { signalsService } from './signals';
import { campService } from './camp';
import type { Signal, SignalImprovement } from '@/types/signals';
import type { MarketplaceSignal, MarketplaceResponse } from '@/types/marketplace';

function pickLatestMintedImprovement(imps: SignalImprovement[]): SignalImprovement | undefined {
  if (!Array.isArray(imps) || imps.length === 0) return undefined;
  const minted = imps.filter((i) => i.registeredAsIP && i.ipTokenId);
  if (minted.length === 0) return undefined;
  const sorted = [...minted].sort((a, b) => {
    const at = new Date(a.createdAt || 0).getTime();
    const bt = new Date(b.createdAt || 0).getTime();
    return bt - at;
  });
  return sorted[0];
}

function displayNameFrom(latest: any, fallback?: string) {
  const uname =
    latest?.creator?.username ||
    latest?.user?.username ||
    latest?.creatorUsername ||
    latest?.username ||
    '';
  if (uname) return uname;
  const addr =
    latest?.creator?.walletAddress ||
    latest?.walletAddress ||
    latest?.ownerAddress ||
    '';
  if (addr && typeof addr === 'string' && addr.startsWith('0x')) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }
  if (fallback) return `${String(fallback).slice(0, 6)}…`;
  return 'Unknown';
}

export const marketplaceService = {
  async getMarketplace(params?: {
    symbol?: string;
    minConfidence?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
    hideOwned?: boolean;
  }): Promise<MarketplaceResponse> {
    const response = await signalsService.getMarketplaceImprovements({
      symbol: params?.symbol,
      minConfidence: params?.minConfidence,
      sortBy: (params?.sortBy as any) || 'newest',
      limit: params?.limit,
      offset: params?.offset,
    });

    const mapped: MarketplaceSignal[] = response.signals
      .filter((s: Signal) => Array.isArray(s.improvements) && s.improvements.length > 0)
      .map((signal: Signal) => {
        const latest = pickLatestMintedImprovement(signal.improvements || []);
        if (!latest) return null as unknown as MarketplaceSignal;
        const creatorName = displayNameFrom(latest, signal.creator?.id);
        return {
          id: signal.id,
          symbol: signal.symbol,
          side: signal.side,
          confidence: signal.confidence,
          description: `Improved ${signal.symbol} signal. ${String(latest?.reasoning || '').slice(0, 150)}…`,
          creator: {
            id: signal.creator?.id,
            username: signal.creator?.username,
            reputation: signal.creator?.reputation,
          },
          improvement: {
            type: latest.improvementType ?? 'analysis-enhancement',
            creator: {
              id: (latest as any)?.creator?._id || (latest as any)?.creator || (latest as any)?.user || '',
              username: creatorName,
              reputation: (latest as any)?.creator?.reputation || 0,
            },
            qualityScore: latest?.qualityScore ?? 0,
            ipTokenId: latest?.ipTokenId,
            ipTransactionHash: latest?.ipTransactionHash,
            reasoning: latest?.reasoning || '',
          },
          originalTokenId: signal.ipTokenId,
          totalUsage: signal.totalUsage ?? 0,
          accessPrice: '1 CAMP',
          createdAt: latest?.createdAt || signal.createdAt,
          fullSignal: signal,
        };
      })
      .filter(Boolean) as MarketplaceSignal[];

    let final = mapped;
    if (params?.hideOwned) {
      const accessFlags = await Promise.all(
        mapped.map(async (s) => {
          if (!s.improvement.ipTokenId) return false;
          try {
            return await campService.checkAccess(s.improvement.ipTokenId);
          } catch {
            return false;
          }
        })
      );
      final = mapped.filter((_, i) => !accessFlags[i]);
    }

    return {
      signals: final,
      total: final.length,
    };
  },

  async purchaseImprovementAccess(improvementTokenId: string): Promise<{ success: boolean; transactionHash?: string }> {
    const result = await campService.buyAccess(improvementTokenId, 1);
    return {
      success: true,
      transactionHash: result?.transactionHash || undefined,
    };
  },

  async checkImprovementAccess(improvementTokenId: string): Promise<{ hasAccess: boolean }> {
    const hasAccess = await campService.checkAccess(improvementTokenId);
    return { hasAccess };
  },

  async getSignalDetails(signalId: string) {
    const { signal } = await signalsService.getSignal(signalId);
    return signal;
  },

  async getUserAssets(): Promise<{ assets: any[]; total: number }> {
    const userSignals = await signalsService.getUserSignals();
    const assets = userSignals.signals
      .filter((s: Signal) => s.registeredAsIP)
      .map((s: Signal) => ({
        tokenId: s.ipTokenId,
        name: `${s.symbol} Trading Signal`,
        type: 'signal',
        revenue: 0,
        totalSales: 0,
        createdAt: s.createdAt,
      }));
    return { assets, total: assets.length };
  },
};