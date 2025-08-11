
import { Router } from 'express';
import { tradingController } from './trading.controller';
import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { validateBody, validateQuery } from '@/shared/middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// All trading routes are protected
router.use(authMiddleware);

const opportunitiesQuerySchema = z.object({
  maxSymbols: z.preprocess(Number, z.number().int().min(5).max(50).optional()),
  minVolume: z.preprocess(Number, z.number().int().min(100000).optional()),
  topCount: z.preprocess(Number, z.number().int().min(1).max(10).optional()),
});

const executeTradeSchema = z.object({
  symbol: z.string(),
  side: z.enum(['buy', 'sell']),
  size: z.number().positive(),
  orderType: z.enum(['market', 'limit']).default('limit'),
  price: z.number().optional(),
  reduceOnly: z.boolean().default(false),
  leverage: z.number().min(1).max(20).optional(),
});

const positionSizeSchema = z.object({
    entryPrice: z.number(),
    stopLoss: z.number(),
    leverage: z.number().min(1).max(20),
    symbol: z.string(),
    winRate: z.number().optional(),
});

router.get(
  '/opportunities',
  validateQuery(opportunitiesQuerySchema),
  tradingController.findOpportunities
);

router.post(
  '/execute',
  validateBody(executeTradeSchema),
  tradingController.executeTrade
);

router.post(
  '/calculate-size',
  validateBody(positionSizeSchema),
  tradingController.calculatePositionSize
);

router.get('/positions', tradingController.getPositions);
router.get('/account-info', tradingController.getAccountInfo);

export default router;
