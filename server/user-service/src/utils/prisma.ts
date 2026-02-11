//server\user-service\src\utils\prisma.ts
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from './logger.js';
import { CONSTANTS } from '../config/constants.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

/**
 * Create PostgreSQL adapter with connection pooling
 * Matches Prisma v6 behavior for connection pool
 */
const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: CONSTANTS.DB_POOL_MAX,
  connectionTimeoutMillis: CONSTANTS.DB_CONNECTION_TIMEOUT_MS,
  idleTimeoutMillis: CONSTANTS.DB_IDLE_TIMEOUT_MS,
});

/**
 * Prisma Client instance with Prisma v7 adapter
 */
const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    logger.debug('Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Log errors
prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma error:', e);
});

// Log warnings
prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma warning:', e);
});

/**
 * Connect to database with retry logic
 */
async function connectWithRetry(
  maxRetries = 3,
  retryDelay = 1000
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      logger.info('✓ Database connected successfully');
      return;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt} failed:`, error);

      if (attempt >= maxRetries) {
        logger.error('Failed to connect to database after maximum retries');
        throw error;
      }

      logger.info(
        `Retrying in ${retryDelay * attempt}ms... (${attempt}/${maxRetries})`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * attempt)
      );
    }
  }
}

/**
 * Graceful shutdown
 */
async function disconnect(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
}

// Initialize connection
connectWithRetry().catch((error) => {
  logger.error('Fatal: Could not connect to database', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await disconnect();
});

process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnect();
  process.exit(0);
});

export default prisma;
export { prisma, connectWithRetry, disconnect };








