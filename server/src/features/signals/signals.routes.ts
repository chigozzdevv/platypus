import { Router } from 'express';
import { signalsController } from './signals.controller';
import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { validateBody, validateParams } from '@/shared/middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const createSignalSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase().optional(),
  aiModel: z.enum(['gpt-4o', 'gpt-4o-mini']).default('gpt-4o-mini'),
  accountBalance: z.number().positive().optional(),
});

const improveSignalSchema = z.object({
  improvementType: z.enum(['entry-adjustment', 'stop-loss-adjustment', 'take-profit-adjustment', 'analysis-enhancement']),
  originalValue: z.any(),
  improvedValue: z.any(),
  reasoning: z.string().min(10).max(1000),
});

const updatePerformanceSchema = z.object({
  outcome: z.enum(['win', 'loss', 'breakeven']),
  actualReturn: z.number(),
  executionPrice: z.number().positive().optional(),
  exitPrice: z.number().positive().optional(),
  exitReason: z.enum(['take-profit', 'stop-loss', 'manual', 'expired']).optional(),
});

const signalIdSchema = z.object({
  signalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid signal ID format'),
});

// Public routes
router.get('/public', signalsController.getPublicSignals);
router.get('/improvable', signalsController.getImprovableSignals);
router.get('/search', signalsController.searchSignals);
router.get('/:signalId', validateParams(signalIdSchema), signalsController.getSignal);

// Protected routes
router.use(authMiddleware);

router.post(
  '/',
  validateBody(createSignalSchema),
  signalsController.createSignal
);

router.get(
  '/user/signals',
  signalsController.getUserSignals
);

router.get(
  '/user/stats',
  signalsController.getUserStats
);

router.post(
  '/:signalId/improve',
  validateParams(signalIdSchema),
  validateBody(improveSignalSchema),
  signalsController.improveSignal
);

router.put(
  '/:signalId/performance',
  validateParams(signalIdSchema),
  validateBody(updatePerformanceSchema),
  signalsController.updatePerformance
);

router.post('/expire', signalsController.expireSignals);

export default router;