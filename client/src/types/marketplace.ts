import type { Signal } from '@/types/signals';

export interface MarketplaceSignal {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  confidence: number;
  description: string;
  creator: {
    id?: string;
    username: string;
    reputation: number;
    avatar?: string;
  };
  improvement: {
    type: string;
    creator: {
      id?: string;
      username: string;
      wallet?: string;
      reputation: number;
      avatar?: string;
    };
    qualityScore: number;
    ipTokenId?: string;
    ipTransactionHash?: string;
    reasoning: string;
  };
  originalTokenId?: string;
  totalUsage: number;
  createdAt: string;
  accessPrice: string;
  fullSignal?: Signal;
}

export interface MarketplaceResponse {
  signals: MarketplaceSignal[];
  total: number;
}