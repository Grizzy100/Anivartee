//server\user-service\src\utils\logger.ts
import winston from 'winston';
import { env } from '../config/env.js';

// Sensitive fields to redact from logs
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'apiKey',
  'authorization',
];

/**
 * Sanitize sensitive data from objects before logging
 */
function sanitize(obj: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 5) return '[Max Depth Reached]';

  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, depth + 1));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some((field) =>
      lowerKey.includes(field.toLowerCase())
    );

    if (isSensitive) {
      acc[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      acc[key] = sanitize(obj[key], depth + 1);
    } else {
      acc[key] = obj[key];
    }

    return acc;
  }, {} as any);
}

/**
 * Custom format for log messages
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const sanitizedMeta = sanitize(meta);
    const metaStr = Object.keys(sanitizedMeta).length
      ? `\n${JSON.stringify(sanitizedMeta, null, 2)}`
      : '';

    if (stack) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}${metaStr}`;
    }

    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

/**
 * Winston logger instance
 */
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),

    // Error log file (production only)
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

/**
 * Create a child logger with additional context
 */
export function createLogger(context: string) {
  return logger.child({ context });
}

/**
 * Log HTTP requests
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

  logger.log(level, `${method} ${path} ${statusCode} - ${duration}ms`, {
    method,
    path,
    statusCode,
    duration,
    ...(userId && { userId }),
  });
}

export default logger;