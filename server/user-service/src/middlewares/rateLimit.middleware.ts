import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { CONSTANTS } from '../config/constants.js';
import { redis } from '../utils/redis.js';

export const generalLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new (RedisStore as any)({
    // @ts-expect-error - Expected sendCommand to be defined
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  passOnStoreError: true,
  keyGenerator: (req) => `user-service:rl:general:${ipKeyGenerator(req.ip ?? '')}`,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: new (RedisStore as any)({
    // @ts-expect-error - Expected sendCommand to be defined
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  passOnStoreError: true,
  keyGenerator: (req) => `user-service:rl:auth:${ipKeyGenerator(req.ip ?? '')}`,
});
