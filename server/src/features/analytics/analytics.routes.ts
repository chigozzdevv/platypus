import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { z } from 'zod';
import { validateQuery } from '@/shared/middleware/validation.middleware';

const router = Router();

const timeframeSchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d', '90d', '1y']).optional()
});

const topPerformersSchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d', '90d', '1y']).optional(),
  type: z.enum(['topTraders', 'topCreators', 'bestPerformingSymbols', 'mostPopularAssets', 'all']).default('all')
});

router.use(authMiddleware);

router.get(
  '/overview',
  analyticsController.getPlatformOverview
);

router.get(
  '/signals',
  validateQuery(timeframeSchema),
  analyticsController.getSignalAnalytics
);

router.get(
  '/trading',
  validateQuery(timeframeSchema),
  analyticsController.getTradingAnalytics
);

router.get(
  '/users',
  validateQuery(timeframeSchema),
  analyticsController.getUserAnalytics
);

router.get(
  '/ip',
  validateQuery(timeframeSchema),
  analyticsController.getIPAnalytics
);

router.get(
  '/detailed',
  validateQuery(timeframeSchema),
  analyticsController.getDetailedAnalytics
);

router.get(
  '/performance',
  validateQuery(timeframeSchema),
  analyticsController.getPerformanceMetrics
);

router.get(
  '/top-performers',
  validateQuery(topPerformersSchema),
  analyticsController.getTopPerformers
);

router.get(
  '/revenue',
  validateQuery(timeframeSchema),
  analyticsController.getRevenueAnalytics
);

router.get(
  '/market',
  validateQuery(timeframeSchema),
  analyticsController.getMarketAnalytics
);

export default router;