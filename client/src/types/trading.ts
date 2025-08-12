export interface TradingOpportunity {
  symbol: string;
  score: number;
  price: number;
  change24h: number;
  volume: number;
  winRate: number;
  setup: {
    type: string;
    direction: 'LONG' | 'SHORT';
    confidence: number;
  };
}

export interface ExecuteTradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  orderType: 'market' | 'limit';
  price?: number;
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  unrealizedPnl: number;
  createdAt: string;
}

export interface OpportunitiesResponse {
  opportunities: TradingOpportunity[];
  scanSummary: {
    totalScanned: number;
    opportunitiesFound: number;
    avgWinRate: number;
  };
}