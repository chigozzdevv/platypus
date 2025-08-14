import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware, adminMiddleware } from '@/shared/middleware/auth.middleware';
import { z } from 'zod';
import { validateQuery } from '@/shared/middleware/validation.middleware';

const timeframeSchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d', '90d', '1y']).optional(),
});

const topPerformersSchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d', '90d', '1y']).optional(),
  type: z.enum(['topTraders', 'topCreators', 'bestPerformingSymbols', 'mostPopularAssets', 'all']).default('all'),
});

/** /api/analytics (auth required) */
const analyticsRouter = Router();
analyticsRouter.use(authMiddleware);

analyticsRouter.get('/overview', analyticsController.getPlatformOverview);
analyticsRouter.get('/signals', validateQuery(timeframeSchema), analyticsController.getSignalAnalytics);
analyticsRouter.get('/trading', validateQuery(timeframeSchema), analyticsController.getTradingAnalytics);
analyticsRouter.get('/users',   validateQuery(timeframeSchema), analyticsController.getUserAnalytics);
analyticsRouter.get('/ip',      validateQuery(timeframeSchema), analyticsController.getIPAnalytics);
analyticsRouter.get('/detailed', validateQuery(timeframeSchema), analyticsController.getDetailedAnalytics);
analyticsRouter.get('/performance', validateQuery(timeframeSchema), analyticsController.getPerformanceMetrics);
analyticsRouter.get('/top-performers', validateQuery(topPerformersSchema), analyticsController.getTopPerformers);
analyticsRouter.get('/revenue', validateQuery(timeframeSchema), analyticsController.getRevenueAnalytics);
analyticsRouter.get('/market',  validateQuery(timeframeSchema), analyticsController.getMarketAnalytics);

/** /api/admin/analytics (admin only) */
const adminAnalyticsRouter = Router();
adminAnalyticsRouter.use(authMiddleware);
adminAnalyticsRouter.use(adminMiddleware);

adminAnalyticsRouter.get('/overview', analyticsController.getPlatformOverview);
adminAnalyticsRouter.get('/signals', validateQuery(timeframeSchema), analyticsController.getSignalAnalytics);
adminAnalyticsRouter.get('/trading', validateQuery(timeframeSchema), analyticsController.getTradingAnalytics);
adminAnalyticsRouter.get('/users',   validateQuery(timeframeSchema), analyticsController.getUserAnalytics);
adminAnalyticsRouter.get('/ip',      validateQuery(timeframeSchema), analyticsController.getIPAnalytics);
adminAnalyticsRouter.get('/detailed', validateQuery(timeframeSchema), analyticsController.getDetailedAnalytics);
adminAnalyticsRouter.get('/performance', validateQuery(timeframeSchema), analyticsController.getPerformanceMetrics);
adminAnalyticsRouter.get('/top-performers', validateQuery(topPerformersSchema), analyticsController.getTopPerformers);
adminAnalyticsRouter.get('/revenue', validateQuery(timeframeSchema), analyticsController.getRevenueAnalytics);
adminAnalyticsRouter.get('/market',  validateQuery(timeframeSchema), analyticsController.getMarketAnalytics);

export default analyticsRouter;
export { adminAnalyticsRouter };
