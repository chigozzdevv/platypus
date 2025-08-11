import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { validateBody, validateParams } from '@/shared/middleware/validation.middleware';
import { connectWalletSchema } from '@/shared/middleware/auth.validation';
import { z } from 'zod';
import { walletAddressSchema } from '@/shared/utils/validators';

const router = Router();

// Validation schemas
const generateNonceSchema = z.object({
  walletAddress: walletAddressSchema,
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  specialties: z.array(
    z.enum(['scalping', 'swing', 'options', 'futures', 'defi', 'nft', 'macro', 'technical-analysis'])
  ).optional(),
});

const connectExchangeSchema = z.object({
  exchange: z.literal('hyperliquid'),
  privateKey: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid private key format'),
  walletAddress: walletAddressSchema,
});

const exchangeParamsSchema = z.object({
  exchange: z.literal('hyperliquid'),
});

// Public routes (no auth required)
router.post(
  '/generate-nonce',
  validateBody(generateNonceSchema),
  authController.generateNonce
);

router.post(
  '/connect',
  validateBody(connectWalletSchema),
  authController.connect
);

// Protected routes (auth required)
router.use(authMiddleware);

router.get('/profile', authController.getProfile);

router.put(
  '/profile',
  validateBody(updateProfileSchema),
  authController.updateProfile
);

router.post('/disconnect', authController.disconnect);

// Exchange integration routes
router.post(
  '/exchange/connect',
  validateBody(connectExchangeSchema),
  authController.connectExchange
);

router.get(
  '/exchange/:exchange/status',
  validateParams(exchangeParamsSchema),
  authController.getExchangeStatus
);

router.post(
  '/exchange/:exchange/test',
  validateParams(exchangeParamsSchema),
  authController.testExchangeConnection
);

router.delete(
  '/exchange/:exchange',
  validateParams(exchangeParamsSchema),
  authController.disconnectExchange
);

export default router;