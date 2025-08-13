import { Router } from 'express';
import { ipController } from './ip.controller';
import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { validateBody, validateParams } from '@/shared/middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerIPSchema = z.object({
  signalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid signal ID format'),
  improvementIndex: z.number().optional(),
});

const purchaseAccessSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  periods: z.number().min(1).max(365).default(1), // Max 1 year subscription
});

const tokenIdParamsSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
});

// Public routes
router.get('/marketplace', ipController.getMarketplace);
router.get('/assets/:tokenId/data', validateParams(tokenIdParamsSchema), ipController.getAssetData);

// Protected routes
router.use(authMiddleware);

// Register signal or improvement as IP NFT
router.post(
  '/register',
  validateBody(registerIPSchema),
  ipController.registerSignalAsIP
);

// Purchase access to an IP asset
router.post(
  '/purchase',
  validateBody(purchaseAccessSchema),
  ipController.purchaseAccess
);

// Check access to an IP asset
router.get(
  '/access/:tokenId',
  validateParams(tokenIdParamsSchema),
  ipController.checkAccess
);

// Get user's IP assets
router.get('/user/assets', ipController.getUserAssets);

export default router;