import app, { initializeApp } from './app';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/utils/logger';

const startServer = async (): Promise<void> => {
  try {

    await initializeApp();
    
    const server = app.listen(env.PORT, () => {
      logger.info(`<>Platypus Trading Server started successfully`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Server URLs:`);
      logger.info(`   - Health Check: http://localhost:${env.PORT}/health`);
      logger.info(`   - API Base: http://localhost:${env.PORT}/api`);
      logger.info(`   - Analytics: http://localhost:${env.PORT}/api/analytics`);
      logger.info(`   - Signals: http://localhost:${env.PORT}/api/signals`);
      logger.info(`   - Trading: http://localhost:${env.PORT}/api/trading`);
      logger.info(`   - IP Assets: http://localhost:${env.PORT}/api/ip`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${env.PORT} is already in use. Please use a different port.`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        logger.info('Server closed successfully');
        process.exit(0);
      });
      
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  logger.error('Fatal error during server startup:', error);
  process.exit(1);
});