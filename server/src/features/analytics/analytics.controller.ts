import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess, sendError } from '@/shared/utils/responses';
import { logger } from '@/shared/utils/logger';
import { asyncHandler } from '@/shared/middleware/error.middleware';

export class AnalyticsController {
  getPlatformOverview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const overview = await analyticsService.getPlatformOverview();
    
    sendSuccess(res, {
      overview,
      message: 'Platform overview retrieved successfully'
    });

    logger.info('Platform overview requested');
  });

  getSignalAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe } = req.query;
    
    const analytics = await analyticsService.getSignalAnalytics(timeframe as string);
    
    sendSuccess(res, {
      analytics,
      timeframe: timeframe || 'all',
      message: 'Signal analytics retrieved successfully'
    });

    logger.info('Signal analytics requested', { timeframe });
  });

  getTradingAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe } = req.query;
    
    const analytics = await analyticsService.getTradingAnalytics(timeframe as string);
    
    sendSuccess(res, {
      analytics,
      timeframe: timeframe || 'all',
      message: 'Trading analytics retrieved successfully'
    });

    logger.info('Trading analytics requested', { timeframe });
  });

  getUserAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe } = req.query;
    
    const analytics = await analyticsService.getUserAnalytics(timeframe as string);
    
    sendSuccess(res, {
      analytics,
      timeframe: timeframe || 'all',
      message: 'User analytics retrieved successfully'
    });

    logger.info('User analytics requested', { timeframe });
  });

  getIPAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe } = req.query;
    
    const analytics = await analyticsService.getIPAnalytics(timeframe as string);
    
    sendSuccess(res, {
      analytics,
      timeframe: timeframe || 'all',
      message: 'IP analytics retrieved successfully'
    });

    logger.info('IP analytics requested', { timeframe });
  });

  getDetailedAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe } = req.query;
    
    const analytics = await analyticsService.getDetailedAnalytics(timeframe as string);
    
    sendSuccess(res, {
      analytics,
      timeframe: timeframe || 'all',
      message: 'Detailed analytics retrieved successfully'
    });

    logger.info('Detailed analytics requested', { timeframe });
  });

  getPerformanceMetrics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe } = req.query;
    
    const [signalAnalytics, tradingAnalytics] = await Promise.all([
      analyticsService.getSignalAnalytics(timeframe as string),
      analyticsService.getTradingAnalytics(timeframe as string)
    ]);

    const performanceMetrics = {
      signals: {
        winRate: signalAnalytics.winRate,
        avgReturn: signalAnalytics.avgReturn,
        avgConfidence: signalAnalytics.avgConfidence,
        totalSignals: signalAnalytics.totalSignals
      },
      trading: {
        avgROI: tradingAnalytics.avgROI,
        totalPnL: tradingAnalytics.totalPnL,
        winningTrades: tradingAnalytics.winningTrades,
        losingTrades: tradingAnalytics.losingTrades,
        totalVolume: tradingAnalytics.totalVolume
      }
    };
    
    sendSuccess(res, {
      metrics: performanceMetrics,
      timeframe: timeframe || 'all',
      message: 'Performance metrics retrieved successfully'
    });

    logger.info('Performance metrics requested', { timeframe });
  });

  getTopPerformers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe, type = 'all' } = req.query;
    
    const analytics = await analyticsService.getDetailedAnalytics(timeframe as string);
    
    const topPerformers = {
      topTraders: analytics.trading.topTraders,
      topCreators: analytics.users.topCreators,
      bestPerformingSymbols: analytics.signals.signalsBySymbol.slice(0, 5),
      mostPopularAssets: analytics.ip.mostPopularAssets.slice(0, 5)
    };

    let filteredData = topPerformers;
    if (type !== 'all') {
      filteredData = { [type as string]: topPerformers[type as keyof typeof topPerformers] } as any;
    }
    
    sendSuccess(res, {
      topPerformers: filteredData,
      timeframe: timeframe || 'all',
      message: 'Top performers retrieved successfully'
    });

    logger.info('Top performers requested', { timeframe, type });
  });

  getRevenueAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe } = req.query;
    
    const [platformOverview, ipAnalytics] = await Promise.all([
      analyticsService.getPlatformOverview(),
      analyticsService.getIPAnalytics(timeframe as string)
    ]);

    const revenueAnalytics = {
      totalRevenue: platformOverview.totalRevenue,
      ipRevenue: ipAnalytics.totalRevenue,
      avgIPPrice: ipAnalytics.avgPrice,
      totalIPSales: ipAnalytics.totalSales,
      revenueByType: ipAnalytics.revenueByType,
      monthlyRevenue: ipAnalytics.monthlyRevenue
    };
    
    sendSuccess(res, {
      revenue: revenueAnalytics,
      timeframe: timeframe || 'all',
      message: 'Revenue analytics retrieved successfully'
    });

    logger.info('Revenue analytics requested', { timeframe });
  });

  getMarketAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { timeframe } = req.query;
    
    const [signalAnalytics, tradingAnalytics] = await Promise.all([
      analyticsService.getSignalAnalytics(timeframe as string),
      analyticsService.getTradingAnalytics(timeframe as string)
    ]);

    const marketAnalytics = {
      mostTradedSymbols: tradingAnalytics.tradesBySymbol,
      signalsBySymbol: signalAnalytics.signalsBySymbol,
      leverageDistribution: tradingAnalytics.leverageDistribution,
      confidenceDistribution: signalAnalytics.confidenceDistribution,
      performanceByModel: signalAnalytics.performanceByModel
    };
    
    sendSuccess(res, {
      market: marketAnalytics,
      timeframe: timeframe || 'all',
      message: 'Market analytics retrieved successfully'
    });

    logger.info('Market analytics requested', { timeframe });
  });
}

export const analyticsController = new AnalyticsController();