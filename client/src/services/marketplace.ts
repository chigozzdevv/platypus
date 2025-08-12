import api from './api';
import type { IPAsset, PurchaseRequest, UserAsset } from '@/types/marketplace';

interface MarketplaceResponse {
  assets: IPAsset[];
  total: number;
}

export const marketplaceService = {
  async getMarketplace(params?: {
    type?: string;
    symbol?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/ip/marketplace?${searchParams.toString()}`);
  },

  async registerIP(data: {
    signalId: string;
    improvementIndex?: number;
  }): Promise<void> {
    return api.post('/ip/register', data);
  },

  async purchaseAccess(data: PurchaseRequest): Promise<void> {
    return api.post('/ip/purchase', data);
  },

  async getUserAssets(): Promise<{ assets: UserAsset[]; total: number }> {
    return api.get('/ip/user/assets');
  },
};