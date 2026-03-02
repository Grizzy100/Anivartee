import Redis from 'ioredis';
import { logger } from './logger.js';
import { env } from '../config/env.js';

export const redis = new Redis({
    host: env.REDIS_HOST || 'localhost',
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD,
    keyPrefix: 'user-service:',
    lazyConnect: true,
    enableOfflineQueue: false, // Don't queue commands if Redis is down (fail-fast)
    maxRetriesPerRequest: 1,   // Fail fast
});

redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

redis.on('connect', () => {
    logger.info('Connected to Redis');
});
