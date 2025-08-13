import type { Signal } from '@/types/signals';

export interface ExecuteTradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  orderType: 'market' | 'limit';
  price?: number;
  signal?: Signal;
  riskPercentage?: number;
  maxLeverage?: number;
}

export interface PositionCalculation {
  positionSize: number;
  riskAmount: number;
  leverage: number;
  marginRequired: number;
  estimatedPnl: {
    profit: number;
    loss: number;
  };
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  marginUsed: number;
  createdAt: string;
}

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

export interface OpportunitiesResponse {
  opportunities: TradingOpportunity[];
  scanSummary: {
    totalScanned: number;
    opportunitiesFound: number;
    avgWinRate: number;
  };
}

export interface AccountInfo {
  marginSummary: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
  };
  assetPositions: Position[];
}
