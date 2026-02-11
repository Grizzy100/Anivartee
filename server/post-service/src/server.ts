//server\post-service\src\server.ts
// src/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import prisma from './utils/prisma.js';
import { startClaimExpiryJob, stopClaimExpiryJob } from './jobs/claimExpiry.job.js';

const app = express();
const PORT = parseInt(env.PORT, 10);

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(generalLimiter);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    stopClaimExpiryJob();
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

app.listen(PORT, () => {
  logger.info(`Post service running on port ${PORT}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);

  // Start background jobs
  startClaimExpiryJob();
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});