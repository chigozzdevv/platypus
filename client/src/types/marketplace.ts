export interface IPAsset {
  tokenId: string;
  name: string;
  description: string;
  type: 'base' | 'improvement';
  price: number;
  currency: string;
  creator: {
    username: string;
    reputation: number;
  };
  symbol: string;
  side: 'long' | 'short';
  confidence: number;
  totalSales: number;
  previewOnly: boolean;
  signal?: {
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    leverage?: number;
  };
}

export interface PurchaseRequest {
  tokenId: string;
  periods: number;
}

export interface UserAsset {
  tokenId: string;
  name: string;
  type: 'base' | 'improvement';
  revenue: number;
  totalSales: number;
  createdAt: string;
}