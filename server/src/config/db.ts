import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Connect to MongoDB with connection pool and timeout settings.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    });
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed', { error });
    process.exit(1);
  }
};

// Enable mongoose debug logging in development
if (env.NODE_ENV === 'development') {
  mongoose.set('debug', (collectionName: string, method: string, query: unknown) => {
    logger.debug(`Mongoose ${collectionName}.${method}`, { query });
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed via SIGTERM');
  process.exit(0);
});
