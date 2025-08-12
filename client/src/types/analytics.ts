export interface PlatformAnalytics {
  totalSignals: number;
  totalTrades: number;
  totalUsers: number;
  totalIPAssets: number;
  totalVolume: number;
  totalRevenue: number;
  avgSignalAccuracy: number;
  mostTradedSymbol: string;
  topPerformer: string;
}

export interface SignalAnalytics {
  totalSignals: number;
  accuracyRate: number;
  averageConfidence: number;
  topSymbols: string[];
}

export interface RevenueData {
  totalRevenue: number;
  ipRevenue: number;
  royaltyRevenue: number;
  monthlyBreakdown: MonthlyRevenue[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  sales: number;
}