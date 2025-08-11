import { z } from 'zod';
import { walletAddressSchema } from '@/shared/utils/validators';

export const connectWalletSchema = z.object({
  walletAddress: walletAddressSchema,
  signature: z.string().min(1),
  message: z.string().min(1),
});

export const authHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer .+/, 'Invalid authorization header format'),
});