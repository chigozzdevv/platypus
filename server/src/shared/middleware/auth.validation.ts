import { z } from 'zod';
import { walletAddressSchema } from '@/shared/utils/validators';

export const connectWalletSchema = z.object({
  walletAddress: walletAddressSchema,
  signature: z.string().optional(),
  message: z.string().optional(),
  originJWT: z.string().min(1, 'Camp Network JWT required'),
});

export const authHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer .+/, 'Invalid authorization header format'),
});