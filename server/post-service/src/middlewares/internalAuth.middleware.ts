//server\post-service\src\middlewares\internalAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function verifyInternalToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = Array.isArray(req.headers['x-service-token'])
      ? req.headers['x-service-token'][0]
      : req.headers['x-service-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Missing service token',
        code: 'INTERNAL_AUTH_REQUIRED'
      });
    }

    if (token !== env.INTERNAL_SERVICE_TOKEN) {
      return res.status(403).json({
        success: false,
        error: 'Invalid service token',
        code: 'INTERNAL_AUTH_FAILED'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal authentication failed',
      code: 'INTERNAL_AUTH_ERROR'
    });
  }
}