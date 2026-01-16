import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { AuthorizationError } from '../utils/errors.js';

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error: any) {
      if (error instanceof AuthorizationError) {
        return res.status(403).json({
          success: false,
          error: error.message,
          code: 'FORBIDDEN'
        });
      }

      res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'FORBIDDEN'
      });
    }
  };
}

export const requireAdmin = requireRole(['ADMIN']);
export const requireFactChecker = requireRole(['FACT_CHECKER', 'ADMIN']);
