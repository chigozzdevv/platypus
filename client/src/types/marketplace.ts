import type { Signal } from './signals';

export interface MarketplaceSignal {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  confidence: number;
  description: string;
  creator: {
    username: string;
    reputation: number;
  };
  improvement: {
    type: string;
    creator: {
      username: string;
      reputation: number;
    };
    qualityScore: number;
    ipTokenId?: string;
    reasoning: string;
  };
  originalTokenId: string;
  totalUsage: number;
  createdAt: string;
  accessPrice: string;
  fullSignal: Signal;
}

export interface MarketplaceResponse {
  signals: MarketplaceSignal[];
  total: number;
}
