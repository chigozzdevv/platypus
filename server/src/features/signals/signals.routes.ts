import { Router } from 'express';
import { signalsController } from './signals.controller';
import { authMiddleware, adminMiddleware } from '@/shared/middleware/auth.middleware';
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

const adminNotesSchema = z.object({
  adminNotes: z.string().optional(),
});

const markMintedSchema = z.object({
  tokenId: z.string().min(1),
  transactionHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid transaction hash'),
});

const improvementIndexSchema = z.object({
  signalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid signal ID format'),
  improvementIndex: z.string().regex(/^\d+$/, 'Invalid improvement index'),
});

router.get('/public', signalsController.getPublicSignals);
router.get('/improvable', signalsController.getImprovableSignals);
router.get('/search', signalsController.searchSignals);
router.get('/:signalId', validateParams(signalIdSchema), signalsController.getSignal);

router.use(authMiddleware);

router.post('/', validateBody(createSignalSchema), signalsController.createSignal);
router.get('/user/signals', signalsController.getUserSignals);
router.get('/user/stats', signalsController.getUserStats);

router.post('/:signalId/improve', validateParams(signalIdSchema), validateBody(improveSignalSchema), signalsController.improveSignal);
router.put('/:signalId/performance', validateParams(signalIdSchema), validateBody(updatePerformanceSchema), signalsController.updatePerformance);
router.put('/:signalId/mark-minted', validateParams(signalIdSchema), validateBody(markMintedSchema), signalsController.markSignalMinted);
router.put('/:signalId/improvements/:improvementIndex/mark-minted', validateParams(improvementIndexSchema), validateBody(markMintedSchema), signalsController.markImprovementMinted);

router.use(adminMiddleware);

router.post('/admin/generate-platform', validateBody(z.object({ count: z.number().min(1).max(100).default(25) })), signalsController.generatePlatformSignals);
router.get('/admin/pending', signalsController.getSignalsForReview);
router.get('/admin/approved', signalsController.getApprovedForMinting);
router.put('/admin/:signalId/approve', validateParams(signalIdSchema), validateBody(adminNotesSchema), signalsController.approveSignal);
router.put('/admin/:signalId/reject', validateParams(signalIdSchema), validateBody(adminNotesSchema), signalsController.rejectSignal);
router.post('/expire', signalsController.expireSignals);

export default router;
