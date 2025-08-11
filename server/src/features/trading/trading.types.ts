export interface TradingSignal {
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  riskRewardRatio: number;
  confidence: number;
  qualityScore?: number;
  qualityReasons?: string[];
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
  expiresAt: Date;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  volatility: number;
  marketCap: number;
  rsi: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgVolatility: number;
}

export interface HistoricalPerformance {
  totalTrades: number;
  winRate: number;
  avgReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export interface MarketOpportunity {
  symbol: string;
  score: number;
  price: number;
  change24h: number;
  volume: number;
  rsi: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  signals: string[];
  setup: {
    type: string;
    direction: string;
    reasoning: string;
    confidence: number;
  };
}

export interface PatternRecognition {
  patterns: Array<{
    pattern: string;
    timeframe: string;
    confidence: number;
    signal: "bullish" | "bearish" | "neutral";
    description: string;
    entry?: number;
    target?: number;
    stopLoss?: number;
  }>;
  overallSignal: "strong_bearish" | "bearish" | "neutral" | "bullish" | "strong_bullish";
  patternCount: {
    bearish: number;
    bullish: number;
    neutral: number;
  };
}

export interface ExecuteTradeParams {
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  orderType?: 'market' | 'limit';
  price?: number;
  reduceOnly?: boolean;
  leverage?: number;
}

export interface ScanSummary {
  totalScanned: number;
  opportunitiesFound: number;
  avgWinRate: number;
  topWinRate: number;
}