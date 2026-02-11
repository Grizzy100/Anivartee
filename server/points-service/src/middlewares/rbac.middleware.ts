import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import { AuthorizationError } from '../utils/errors.js';

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Requires one of: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
}

export const requireAdmin = requireRole(['ADMIN']);
