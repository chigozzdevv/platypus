import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CAMP_CLIENT_ID: z.string(),
  ORIGIN_CLIENT_ID: z.string().optional(),
  ORIGIN_API_URL: z.string().optional(),
  SIWE_DOMAIN: z
    .string()
    .default('localhost:5173')
    .refine(
      (v) =>
        !!v &&
        !v.startsWith('http://') &&
        !v.startsWith('https://') &&
        !v.includes('/') &&
        !v.includes(' '),
      { message: 'SIWE_DOMAIN must be a host[:port] without protocol' }
    ),
  PLATFORM_WALLET_PRIVATE_KEY: z.string(),
  PLATFORM_WALLET_ADDRESS: z.string(),
  HYPERLIQUID_PRIVATE_KEY: z.string().optional(),
  HYPERLIQUID_WALLET_ADDRESS: z.string().optional(),
  HYPERLIQUID_TESTNET: z.string().transform(Boolean).default('true'),
  OPENAI_API_KEY: z.string(),
  BASECAMP_RPC_URL: z.string().default('https://rpc.basecamp.t.raas.gelato.cloud'),
  CHAIN_ID: z.string().transform(Number).default('123420001114'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('L Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

export const env = parseEnv();

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
