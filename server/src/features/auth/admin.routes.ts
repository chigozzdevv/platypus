import{Router}from'express';
import{z}from'zod';
import{authMiddleware,adminMiddleware}from'@/shared/middleware/auth.middleware';
import{validateBody,validateParams}from'@/shared/middleware/validation.middleware';
import{signalsController}from'@/features/signals/signals.controller';
import{analyticsController}from'@/features/analytics/analytics.controller';

const router=Router();
router.use(authMiddleware,adminMiddleware);

const signalIdSchema=z.object({signalId:z.string().regex(/^[0-9a-fA-F]{24}$/,'Invalid signal ID format')});
const adminNotesSchema=z.object({adminNotes:z.string().optional()});
const genSchema=z.object({count:z.number().min(1).max(100).default(25)});

router.get('/signals/pending',signalsController.getSignalsForReview);
router.get('/signals/approved',signalsController.getApprovedForMinting);
router.post('/signals/generate-platform',validateBody(genSchema),signalsController.generatePlatformSignals);
router.put('/signals/:signalId/approve',validateParams(signalIdSchema),validateBody(adminNotesSchema),signalsController.approveSignal);
router.put('/signals/:signalId/reject',validateParams(signalIdSchema),validateBody(adminNotesSchema),signalsController.rejectSignal);

router.get('/analytics/overview',analyticsController.getPlatformOverview);
router.get('/analytics/detailed',analyticsController.getDetailedAnalytics);

export default router;