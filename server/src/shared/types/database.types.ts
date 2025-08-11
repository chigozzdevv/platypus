import { Document } from 'mongoose';

export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends BaseDocument {
  walletAddress: string;
  username: string;
  bio?: string;
  avatar?: string;
  specialties: string[];
  signalsCreated: number;
  totalEarnings: number;
  avgPerformance: number;
  reputation: number;
  followingCount: number;
  followerCount: number;
  connectedExchanges: {
    hyperliquid?: {
      connected: boolean;
      apiKey?: string;
      secretKey?: string;
      walletAddress?: string;
    };
  };
}


export interface SignalDocument extends BaseDocument {
  creator: string;
  aiModel: 'gpt-4o' | 'gpt-4o-mini';
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  riskRewardRatio: number;
  confidence: number;
  qualityScore?: number;
  analysis: {
    technicalAnalysis: string;
    marketAnalysis: string;
    sentimentAnalysis: string;
    riskAssessment: string;
  };
  marketConditions: {
    fearGreedIndex?: number;
    volatility: number;
    volume24h: number;
    priceChange24h: number;
  };
  aiInsights: {
    keyLevels: number[];
    patternRecognition: string;
    volumeProfile: string;
    momentumIndicators: string;
  };
  performance: {
    outcome: 'pending' | 'win' | 'loss' | 'breakeven';
    actualReturn: number;
    executionPrice?: number;
    exitPrice?: number;
    exitReason?: 'take-profit' | 'stop-loss' | 'manual' | 'expired';
    executedAt?: Date;
    closedAt?: Date;
  };
  status: 'active' | 'expired' | 'executed' | 'cancelled';
  expiresAt: Date;
  registeredAsIP: boolean;
  ipTokenId?: string;
  ipTransactionHash?: string;
  totalUsage: number;
  totalRevenue: number;
  improvements: Array<{
    user: string;
    improvementType: 'entry-adjustment' | 'stop-loss-adjustment' | 'take-profit-adjustment' | 'analysis-enhancement';
    originalValue: any;
    improvedValue: any;
    reasoning: string;
    qualityScore?: number;
    revenueShare?: number;
    performance: {
      outcome: 'pending' | 'better' | 'worse' | 'same';
      returnImprovement: number;
    };
    registeredAsIP: boolean;
    ipTokenId?: string;
    ipTransactionHash?: string;
    createdAt: Date;
  }>;
  tags: string[];
  isPublic: boolean;
}

export interface TradeDocument extends BaseDocument {
  userId: string;
  signalId: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  exitPrice?: number;
  currentPrice?: number;
  unrealizedPnl: number;
  realizedPnl?: number;
  pnlPercentage: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed' | 'pending' | 'cancelled';
  openedAt: Date;
  closedAt?: Date;
  exchangeOrderId?: string;
  exchangeFees: number;
  signalCreator: string;
  originalAiSignal: string;
  maxDrawdown: number;
  maxProfit: number;
  duration?: number;
}