import { Signal } from '../signals/signals.model';
import { Trade } from '../trading/trading.model';
import { User } from '../auth/auth.model';
import { IPAsset } from '../ip-redacted-2-client/ip.model';
import { AnalyticsSnapshot } from './analytics.model';
import { logger } from '@/shared/utils/logger';
import { CustomError } from '@/shared/middleware/error.middleware';

export interface PlatformOverview {
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
  winRate: number;
  avgReturn: number;
  avgConfidence: number;
  bestPerformingSymbol: string;
  signalsByStatus: Record<string, number>;
  signalsBySymbol: Array<{ symbol: string; count: number; winRate: number }>;
  signalsByTimeframe: Array<{ date: string; count: number }>;
  confidenceDistribution: Array<{ range: string; count: number }>;
  performanceByModel: Array<{ model: string; count: number; winRate: number; avgReturn: number }>;
}

export interface TradingAnalytics {
  totalTrades: number;
  totalVolume: number;
  avgROI: number;
  totalPnL: number;
  winningTrades: number;
  losingTrades: number;
  avgHoldingPeriod: number;
  tradesBySymbol: Array<{ symbol: string; count: number; totalPnL: number }>;
  tradesByTimeframe: Array<{ date: string; count: number; volume: number }>;
  leverageDistribution: Array<{ leverage: number; count: number; avgROI: number }>;
  topTraders: Array<{ userId: string; username: string; totalPnL: number; winRate: number }>;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  avgSignalsPerUser: number;
  avgEarnings: number;
  topCreators: Array<{ userId: string; username: string; signalsCount: number; avgPerformance: number }>;
  userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
  reputationDistribution: Array<{ range: string; count: number }>;
}

export interface IPAnalytics {
  totalIPAssets: number;
  totalRevenue: number;
  avgPrice: number;
  totalSales: number;
  mostPopularAssets: Array<{ name: string; sales: number; revenue: number }>;
  revenueByType: Array<{ type: string; revenue: number; sales: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; sales: number }>;
}

export interface DetailedAnalytics {
  platform: PlatformOverview;
  signals: SignalAnalytics;
  trading: TradingAnalytics;
  users: UserAnalytics;
  ip: IPAnalytics;
  generatedAt: Date;
}

class AnalyticsService {
  /** Admin-only mini overview for dashboard cards (cached 5m). */
  async getAdminOverview(): Promise<{
    totalSignals: number;
    totalImprovements: number;
    totalRevenue: number;
    activeUsers: number;
  }> {
    return this.getOrComputeAnalytics('admin', 'all', async () => {
      const [totalSignals, totalRevenueAgg, activeUsers, improvementsAgg] = await Promise.all([
        Signal.countDocuments({}),
        IPAsset.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalRevenue' } } }]),
        // Distinct creators (exclude 'platform' sentinel)
        Signal.distinct('creator', { creator: { $ne: 'platform' } }).then(ids => ids.length),
        Signal.aggregate([
          { $project: { improvements: 1 } },
          { $unwind: '$improvements' },
          { $count: 'count' },
        ]),
      ]);

      const totalRevenue = totalRevenueAgg?.[0]?.totalRevenue ?? 0;
      const totalImprovements = improvementsAgg?.[0]?.count ?? 0;

      return {
        totalSignals,
        totalImprovements,
        totalRevenue,
        activeUsers,
      };
    }, 300);
  }

  async getPlatformOverview(): Promise<PlatformOverview> {
    return this.getOrComputeAnalytics('overview', 'all', async () => {
      const [
        totalSignals,
        totalTrades,
        totalUsers,
        totalIPAssets,
        volumeResult,
        revenueResult,
        signalStats,
        topSymbol,
        topUser,
      ] = await Promise.all([
        Signal.countDocuments(),
        Trade.countDocuments(),
        User.countDocuments(),
        IPAsset.countDocuments(),
        this.getTotalVolume(),
        this.getTotalRevenue(),
        this.getSignalAccuracy(),
        this.getMostTradedSymbol(),
        this.getTopPerformer(),
      ]);

      return {
        totalSignals,
        totalTrades,
        totalUsers,
        totalIPAssets,
        totalVolume: volumeResult,
        totalRevenue: revenueResult,
        avgSignalAccuracy: signalStats,
        mostTradedSymbol: topSymbol,
        topPerformer: topUser,
      };
    }, 600);
  }

  async getSignalAnalytics(timeframe?: string): Promise<SignalAnalytics> {
    return this.getOrComputeAnalytics('signals', timeframe, async () => {
      const timeFilter = this.getTimeFilter(timeframe);

      const [
        totalSignals,
        signalStats,
        signalsByStatus,
        signalsBySymbol,
        signalsByTimeframe,
        confidenceDistribution,
        performanceByModel,
      ] = await Promise.all([
        Signal.countDocuments(timeFilter),
        this.getSignalPerformanceStats(timeFilter),
        this.getSignalsByStatus(timeFilter),
        this.getSignalsBySymbol(timeFilter),
        this.getSignalsByTimeframe(timeFilter),
        this.getConfidenceDistribution(timeFilter),
        this.getPerformanceByModel(timeFilter),
      ]);

      return {
        totalSignals,
        winRate: signalStats.winRate,
        avgReturn: signalStats.avgReturn,
        avgConfidence: signalStats.avgConfidence,
        bestPerformingSymbol: signalStats.bestSymbol,
        signalsByStatus,
        signalsBySymbol,
        signalsByTimeframe,
        confidenceDistribution,
        performanceByModel,
      };
    }, 300);
  }

  async getTradingAnalytics(timeframe?: string): Promise<TradingAnalytics> {
    try {
      const timeFilter = this.getTimeFilter(timeframe);

      const [totalTrades, tradeStats, tradesBySymbol, tradesByTimeframe, leverageDistribution, topTraders] =
        await Promise.all([
          Trade.countDocuments(timeFilter),
          this.getTradingStats(timeFilter),
          this.getTradesBySymbol(timeFilter),
          this.getTradesByTimeframe(timeFilter),
          this.getLeverageDistribution(timeFilter),
          this.getTopTraders(timeFilter),
        ]);

      return {
        totalTrades,
        totalVolume: tradeStats.totalVolume,
        avgROI: tradeStats.avgROI,
        totalPnL: tradeStats.totalPnL,
        winningTrades: tradeStats.winningTrades,
        losingTrades: tradeStats.losingTrades,
        avgHoldingPeriod: tradeStats.avgHoldingPeriod,
        tradesBySymbol,
        tradesByTimeframe,
        leverageDistribution,
        topTraders,
      };
    } catch (error) {
      logger.error('Failed to get trading analytics', { error });
      throw new CustomError('ANALYTICS_ERROR', 500, 'Failed to generate trading analytics');
    }
  }

  async getUserAnalytics(timeframe?: string): Promise<UserAnalytics> {
    try {
      const timeFilter = this.getTimeFilter(timeframe);

      const [totalUsers, activeUsers, userStats, topCreators, userGrowth, reputationDistribution] =
        await Promise.all([
          User.countDocuments(timeFilter),
          this.getActiveUsersCount(timeFilter),
          this.getUserStats(timeFilter),
          this.getTopCreators(timeFilter),
          this.getUserGrowth(timeFilter),
          this.getReputationDistribution(timeFilter),
        ]);

      return {
        totalUsers,
        activeUsers,
        avgSignalsPerUser: userStats.avgSignalsPerUser,
        avgEarnings: userStats.avgEarnings,
        topCreators,
        userGrowth,
        reputationDistribution,
      };
    } catch (error) {
      logger.error('Failed to get user analytics', { error });
      throw new CustomError('ANALYTICS_ERROR', 500, 'Failed to generate user analytics');
    }
  }

  async getIPAnalytics(timeframe?: string): Promise<IPAnalytics> {
    try {
      const timeFilter = this.getTimeFilter(timeframe);

      const [totalIPAssets, ipStats, mostPopularAssets, revenueByType, monthlyRevenue] = await Promise.all([
        IPAsset.countDocuments(timeFilter),
        this.getIPStats(timeFilter),
        this.getMostPopularAssets(timeFilter),
        this.getRevenueByType(timeFilter),
        this.getMonthlyIPRevenue(timeFilter),
      ]);

      return {
        totalIPAssets,
        totalRevenue: ipStats.totalRevenue,
        avgPrice: ipStats.avgPrice,
        totalSales: ipStats.totalSales,
        mostPopularAssets,
        revenueByType,
        monthlyRevenue,
      };
    } catch (error) {
      logger.error('Failed to get IP analytics', { error });
      throw new CustomError('ANALYTICS_ERROR', 500, 'Failed to generate IP analytics');
    }
  }

  async getDetailedAnalytics(timeframe?: string): Promise<DetailedAnalytics> {
    try {
      const [platform, signals, trading, users, ip] = await Promise.all([
        this.getPlatformOverview(),
        this.getSignalAnalytics(timeframe),
        this.getTradingAnalytics(timeframe),
        this.getUserAnalytics(timeframe),
        this.getIPAnalytics(timeframe),
      ]);

      return {
        platform,
        signals,
        trading,
        users,
        ip,
        generatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get detailed analytics', { error });
      throw new CustomError('ANALYTICS_ERROR', 500, 'Failed to generate detailed analytics');
    }
  }

  // ===== helpers =====

  private getTimeFilter(timeframe?: string): any {
    if (!timeframe) return {};

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return {};
    }

    return { createdAt: { $gte: startDate } };
  }

  private async getTotalVolume(): Promise<number> {
    const result = await Trade.aggregate([
      { $match: { status: { $in: ['closed', 'open'] } } },
      { $group: { _id: null, totalVolume: { $sum: { $multiply: ['$size', '$entryPrice'] } } } },
    ]);
    return result[0]?.totalVolume || 0;
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await IPAsset.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalRevenue' } } }]);
    return result[0]?.totalRevenue || 0;
  }

  private async getSignalAccuracy(): Promise<number> {
    const result = await Signal.aggregate([
      { $match: { 'performance.outcome': { $in: ['win', 'loss'] } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$performance.outcome', 'win'] }, 1, 0] } },
        },
      },
    ]);
    const stats = result[0];
    return stats ? (stats.wins / stats.total) * 100 : 0;
  }

  private async getMostTradedSymbol(): Promise<string> {
    const result = await Trade.aggregate([
      { $group: { _id: '$symbol', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    return result[0]?._id || 'N/A';
  }

  private async getTopPerformer(): Promise<string> {
    const result = await User.aggregate([{ $sort: { avgPerformance: -1 } }, { $limit: 1 }, { $project: { username: 1 } }]);
    return result[0]?.username || 'N/A';
  }

  private async getSignalPerformanceStats(timeFilter: any): Promise<any> {
    const results = await Signal.aggregate([
      { $match: { ...timeFilter, 'performance.outcome': { $in: ['win', 'loss', 'breakeven'] } } },
      {
        $group: {
          _id: null,
          totalSignals: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$performance.outcome', 'win'] }, 1, 0] } },
          avgReturn: { $avg: '$performance.actualReturn' },
          avgConfidence: { $avg: '$confidence' },
        },
      },
    ]);

    const symbolResults = await Signal.aggregate([
      { $match: { ...timeFilter, 'performance.outcome': 'win' } },
      { $group: { _id: '$symbol', wins: { $sum: 1 } } },
      { $sort: { wins: -1 } },
      { $limit: 1 },
    ]);

    const stats = results[0] || {};
    return {
      winRate: stats.totalSignals ? (stats.wins / stats.totalSignals) * 100 : 0,
      avgReturn: stats.avgReturn || 0,
      avgConfidence: stats.avgConfidence || 0,
      bestSymbol: symbolResults[0]?._id || 'N/A',
    };
  }

  private async getSignalsByStatus(timeFilter: any): Promise<Record<string, number>> {
    const results = await Signal.aggregate([{ $match: timeFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
    return results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {} as Record<string, number>);
  }

  private async getSignalsBySymbol(timeFilter: any): Promise<Array<{ symbol: string; count: number; winRate: number }>> {
    const results = await Signal.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: '$symbol',
          count: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$performance.outcome', 'win'] }, 1, 0] } },
        },
      },
      {
        $project: {
          symbol: '$_id',
          count: 1,
          winRate: { $multiply: [{ $divide: ['$wins', '$count'] }, 100] },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    return results.map(({ symbol, count, winRate }) => ({ symbol, count, winRate: winRate || 0 }));
  }

  private async getSignalsByTimeframe(timeFilter: any): Promise<Array<{ date: string; count: number }>> {
    const results = await Signal.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return results.map(({ _id, count }) => ({ date: _id, count }));
  }

  private async getConfidenceDistribution(timeFilter: any): Promise<Array<{ range: string; count: number }>> {
    const results = await Signal.aggregate([
      { $match: timeFilter },
      {
        $bucket: {
          groupBy: '$confidence',
          boundaries: [0, 60, 70, 80, 90, 100],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);
    return results.map(({ _id, count }) => ({
      range: _id === 'other' ? '100+' : `${_id}-${_id + 10}`,
      count,
    }));
  }

  private async getPerformanceByModel(timeFilter: any): Promise<
    Array<{ model: string; count: number; winRate: number; avgReturn: number }>
  > {
    const results = await Signal.aggregate([
      { $match: { ...timeFilter, 'performance.outcome': { $in: ['win', 'loss', 'breakeven'] } } },
      {
        $group: {
          _id: '$aiModel',
          count: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$performance.outcome', 'win'] }, 1, 0] } },
          avgReturn: { $avg: '$performance.actualReturn' },
        },
      },
      {
        $project: {
          model: '$_id',
          count: 1,
          winRate: { $multiply: [{ $divide: ['$wins', '$count'] }, 100] },
          avgReturn: 1,
        },
      },
    ]);
    return results.map(({ model, count, winRate, avgReturn }) => ({
      model,
      count,
      winRate: winRate || 0,
      avgReturn: avgReturn || 0,
    }));
  }

  private async getTradingStats(timeFilter: any): Promise<any> {
    const results = await Trade.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: { $multiply: ['$size', '$entryPrice'] } },
          avgROI: { $avg: '$performance.roi' },
          totalPnL: { $sum: '$realizedPnl' },
          winningTrades: { $sum: { $cond: [{ $gt: ['$realizedPnl', 0] }, 1, 0] } },
          losingTrades: { $sum: { $cond: [{ $lt: ['$realizedPnl', 0] }, 1, 0] } },
          avgHoldingPeriod: { $avg: '$performance.holdingPeriod' },
        },
      },
    ]);
    return results[0] || {};
  }

  private async getTradesBySymbol(timeFilter: any): Promise<Array<{ symbol: string; count: number; totalPnL: number }>> {
    const results = await Trade.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: '$symbol',
          count: { $sum: 1 },
          totalPnL: { $sum: '$realizedPnl' },
        },
      },
      { $project: { symbol: '$_id', count: 1, totalPnL: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    return results.map(({ symbol, count, totalPnL }) => ({ symbol, count, totalPnL: totalPnL || 0 }));
  }

  private async getTradesByTimeframe(timeFilter: any): Promise<Array<{ date: string; count: number; volume: number }>> {
    const results = await Trade.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          volume: { $sum: { $multiply: ['$size', '$entryPrice'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return results.map(({ _id, count, volume }) => ({ date: _id, count, volume }));
  }

  private async getLeverageDistribution(timeFilter: any): Promise<Array<{ leverage: number; count: number; avgROI: number }>> {
    const results = await Trade.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: '$leverage',
          count: { $sum: 1 },
          avgROI: { $avg: '$performance.roi' },
        },
      },
      { $project: { leverage: '$_id', count: 1, avgROI: 1 } },
      { $sort: { leverage: 1 } },
    ]);
    return results.map(({ leverage, count, avgROI }) => ({ leverage, count, avgROI: avgROI || 0 }));
  }

  private async getTopTraders(timeFilter: any): Promise<
    Array<{ userId: string; username: string; totalPnL: number; winRate: number }>
  > {
    const results = await Trade.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: '$userId',
          totalPnL: { $sum: '$realizedPnl' },
          totalTrades: { $sum: 1 },
          winningTrades: { $sum: { $cond: [{ $gt: ['$realizedPnl', 0] }, 1, 0] } },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          totalPnL: 1,
          winRate: { $multiply: [{ $divide: ['$winningTrades', '$totalTrades'] }, 100] },
        },
      },
      { $sort: { totalPnL: -1 } },
      { $limit: 10 },
    ]);
    return results.map(({ userId, username, totalPnL, winRate }) => ({
      userId,
      username,
      totalPnL,
      winRate: winRate || 0,
    }));
  }

  private async getActiveUsersCount(timeFilter: any): Promise<number> {
    // Distinct creators of signals in timeframe; exclude platform sentinel if present
    const cond = { ...timeFilter, creator: { $ne: 'platform' } };
    return Signal.distinct('creator', cond).then(users => users.length);
  }

  private async getUserStats(timeFilter: any): Promise<any> {
    const results = await User.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: null,
          avgSignalsPerUser: { $avg: '$signalsCreated' },
          avgEarnings: { $avg: '$totalEarnings' },
        },
      },
    ]);
    return results[0] || {};
  }

  private async getTopCreators(timeFilter: any): Promise<
    Array<{ userId: string; username: string; signalsCount: number; avgPerformance: number }>
  > {
    const results = await User.aggregate([
      { $match: timeFilter },
      {
        $project: {
          userId: '$_id',
          username: 1,
          signalsCount: '$signalsCreated',
          avgPerformance: 1,
        },
      },
      { $sort: { signalsCount: -1 } },
      { $limit: 10 },
    ]);
    return results.map(({ userId, username, signalsCount, avgPerformance }) => ({
      userId,
      username,
      signalsCount,
      avgPerformance,
    }));
  }

  private async getUserGrowth(timeFilter: any): Promise<Array<{ date: string; newUsers: number; totalUsers: number }>> {
    const results = await User.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let totalUsers = 0;
    return results.map(({ _id, newUsers }) => {
      totalUsers += newUsers;
      return { date: _id, newUsers, totalUsers };
    });
  }

  private async getReputationDistribution(timeFilter: any): Promise<Array<{ range: string; count: number }>> {
    const results = await User.aggregate([
      { $match: timeFilter },
      {
        $bucket: {
          groupBy: '$reputation',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);
    return results.map(({ _id, count }) => ({
      range: _id === 'other' ? '100+' : `${_id}-${_id + 20}`,
      count,
    }));
  }

  private async getIPStats(timeFilter: any): Promise<any> {
    const results = await IPAsset.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          avgPrice: { $avg: '$price' },
          totalSales: { $sum: '$totalSales' },
        },
      },
    ]);
    return results[0] || {};
  }

  private async getMostPopularAssets(timeFilter: any): Promise<Array<{ name: string; sales: number; revenue: number }>> {
    const results = await IPAsset.aggregate([
      { $match: timeFilter },
      { $project: { name: 1, sales: '$totalSales', revenue: '$totalRevenue' } },
      { $sort: { sales: -1 } },
      { $limit: 10 },
    ]);
    return results;
  }

  private async getRevenueByType(timeFilter: any): Promise<Array<{ type: string; revenue: number; sales: number }>> {
    const results = await IPAsset.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: '$type',
          revenue: { $sum: '$totalRevenue' },
          sales: { $sum: '$totalSales' },
        },
      },
      { $project: { type: '$_id', revenue: 1, sales: 1 } },
    ]);
    return results;
  }

  private async getMonthlyIPRevenue(timeFilter: any): Promise<Array<{ month: string; revenue: number; sales: number }>> {
    const results = await IPAsset.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalRevenue' },
          sales: { $sum: '$totalSales' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return results.map(({ _id, revenue, sales }) => ({ month: _id, revenue, sales }));
  }

  private async getOrComputeAnalytics<T>(
    type: 'overview' | 'signals' | 'trading' | 'users' | 'ip' | 'detailed' | 'admin',
    timeframe: string = 'all',
    computeFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    try {
      const normalizedTimeframe = timeframe || 'all';
      const cached = await AnalyticsSnapshot.findOne({
        type,
        timeframe: normalizedTimeframe,
        validUntil: { $gt: new Date() },
      });

      if (cached) {
        logger.debug('Analytics cache hit', { type, timeframe: normalizedTimeframe });
        return cached.data as T;
      }

      logger.debug('Analytics cache miss - computing', { type, timeframe: normalizedTimeframe });
      const data = await computeFn();

      const validUntil = new Date(Date.now() + ttlSeconds * 1000);
      await AnalyticsSnapshot.findOneAndUpdate(
        { type, timeframe: normalizedTimeframe },
        {
          type,
          timeframe: normalizedTimeframe,
          data,
          computedAt: new Date(),
          validUntil,
        },
        { upsert: true, new: true }
      );

      return data;
    } catch (error) {
      logger.error('Failed to get or compute analytics', { error, type, timeframe });
      throw new CustomError('ANALYTICS_ERROR', 500, `Failed to generate ${type} analytics`);
    }
  }
}

export const analyticsService = new AnalyticsService();
