import mongoose from 'mongoose';
import { env, isDevelopment } from './env';
import { logger } from '@/shared/utils/logger';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      const connectionOptions: mongoose.ConnectOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      };

      if (isDevelopment) {
        mongoose.set('debug', true);
      }

      await mongoose.connect(env.MONGODB_URI, connectionOptions);
      
      this.isConnected = true;
      logger.info(' Database connected successfully');

      mongoose.connection.on('error', (error) => {
        logger.error('Database connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Database disconnected');
        this.isConnected = false;
      });

      process.on('SIGINT', this.gracefulDisconnect);
      process.on('SIGTERM', this.gracefulDisconnect);

    } catch (error) {
      logger.error('L Database connection failed:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  }

  private gracefulDisconnect = async (): Promise<void> => {
    logger.info('Closing database connection...');
    await this.disconnect();
    process.exit(0);
  };

  public isConnectionReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const database = DatabaseConnection.getInstance();

export const connectDB = () => database.connect();
export const disconnectDB = () => database.disconnect();
export const isDBReady = () => database.isConnectionReady();