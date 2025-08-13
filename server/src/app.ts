import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { connectDB } from '@/shared/config/database';
import { env, isDevelopment } from '@/shared/config/env';
import { logger } from '@/shared/utils/logger';
import { errorHandler } from '@/shared/middleware/error.middleware';
import routes from '@/routes';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  },
});

app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());

if (isDevelopment) {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      query: req.query,
    });
    next();
  });
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

let dbConnected = false;
let cronStarted = false;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const retryAsync = async (fn: () => Promise<void>, retries: number, delayMs: number) => {
  let lastErr: any;
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) await sleep(delayMs);
    }
  }
  throw lastErr;
};

export const initializeApp = async (): Promise<void> => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  try {
    const { campService } = await import('@/features/ip-redacted-2-client/camp.service');
    await retryAsync(async () => {
      await campService.ensurePlatformReady();
      logger.info('Camp platform wallet ready');
    }, 3, 2000);
  } catch (error) {
    logger.error('Camp platform wallet init failed', { error });
  }

  if (!cronStarted) {
    const { signalsService } = await import('@/features/signals/signals.service');

    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('⏰ Starting platform signal generation...');
        const signals = await signalsService.generatePlatformSignals(50);
        logger.info('✅ Platform signals generated successfully', {
          count: signals.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('❌ Failed to generate platform signals', { error });
      }
    });

    cronStarted = true;
    logger.info('🕐 Platform signal generation cron job started (runs every hour)');

    if (isDevelopment) {
      logger.info('🚀 Running initial signal generation for development testing...');
      try {
        const signals = await signalsService.generatePlatformSignals(50);
        logger.info('✅ Initial signal generation completed', {
          count: signals.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('❌ Initial signal generation failed', { error });
      }
    }
  }
};

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

export default app;