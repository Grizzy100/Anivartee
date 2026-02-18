import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AuthenticationError } from '../utils/errors.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    // Handle JWT-specific errors with proper codes for client-side retry
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid access token',
        code: 'INVALID_TOKEN'
      });
    }

    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: error.message,
        code: 'AUTHENTICATION_FAILED'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTHENTICATION_FAILED'
    });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (_) {
    // Invalid token on optional auth — continue unauthenticated
    next();
  }
}
