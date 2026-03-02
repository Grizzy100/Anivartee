import Redis from 'ioredis';
import { logger } from './logger.js';
import { env } from '../config/env.js';

export const redis = new Redis({
    host: env.REDIS_HOST || 'localhost',
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD,
    keyPrefix: 'post-service:',
    lazyConnect: true,
    enableOfflineQueue: false, // Fail fast if Redis is down
    maxRetriesPerRequest: 1,
});

redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

redis.on('connect', () => {
    logger.info('Connected to Redis');
});
