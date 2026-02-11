// //server\user-service\src\server.ts
// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import cookieParser from 'cookie-parser';
// import passport from 'passport';
// import routes from './routes/index.js';
// import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
// import { generalLimiter } from './middlewares/rateLimit.middleware.js';
// import { sanitizeMiddleware } from './middlewares/sanitize.middleware.js';
// import { requestLogger } from './middlewares/requestLogger.middleware.js';
// import { env } from './config/env.js';
// import { logger } from './utils/logger.js';
// import prisma from './utils/prisma.js';
// import './config/passport.js';

// const app = express();
// const PORT = env.PORT;
// const allowedOrigins = env.ALLOWED_ORIGINS;

// // Security middleware
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:"],
//     },
//   },
//   hsts: {
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true
//   }
// }));

// // CORS configuration
// app.use(cors({
//   origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
//     // Allow requests with no origin (mobile apps, Postman, curl)
//     if (!origin) {
//       return callback(null, true);
//     }

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       logger.warn('Blocked CORS request from unauthorized origin', { origin });
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Token']
// }));

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(cookieParser());

// // Security: Remove null bytes and sanitize input
// app.use(sanitizeMiddleware);

// // Rate limiting
// app.use(generalLimiter);

// // Request logging
// app.use(requestLogger);

// // Passport initialization (WITHOUT session support for JWT-based auth)
// app.use(passport.initialize());
// // ✅ REMOVED: app.use(passport.session()); - Not needed for JWT auth

// // API routes
// app.use('/api', routes);

// // Error handling
// app.use(notFoundHandler);
// app.use(errorHandler);

// // Graceful shutdown
// async function gracefulShutdown(signal: string) {
//   logger.info(`${signal} received. Starting graceful shutdown...`);
  
//   try {
//     await prisma.$disconnect();
//     logger.info('Database connection closed');
//     process.exit(0);
//   } catch (error) {
//     logger.error('Error during shutdown:', error);
//     process.exit(1);
//   }
// }

// // FIX: Capture server instance for graceful shutdown
// const server = app.listen(PORT, () => {
//   logger.info(`User service running on port ${PORT}`);
// });

// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// process.on('unhandledRejection', (reason, promise) => {
//   logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });

// process.on('uncaughtException', (error) => {
//   logger.error('Uncaught Exception:', error);
//   gracefulShutdown('UNCAUGHT_EXCEPTION');
// });

// export default app;
// export { server };



//server\user-service\src\server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { sanitizeMiddleware } from './middlewares/sanitize.middleware.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import prisma from './utils/prisma.js';
import './config/passport.js';

const app = express();
const PORT = env.PORT;
const allowedOrigins = env.ALLOWED_ORIGINS;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('Blocked CORS request from unauthorized origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security: Remove null bytes and sanitize input
app.use(sanitizeMiddleware);

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use(requestLogger);

// Passport initialization (WITHOUT session support for JWT-based auth)
app.use(passport.initialize());
// ✅ REMOVED: app.use(passport.session()); - Not needed for JWT auth

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

const server = app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);
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

export default app;
export { server };