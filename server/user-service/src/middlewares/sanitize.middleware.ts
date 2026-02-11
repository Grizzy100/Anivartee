import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to sanitize request data
 * Removes null bytes and other potentially harmful characters
 */
export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  // Sanitize body (body is writable in Express 5)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params in-place (req.query is a read-only getter in Express 5)
  if (req.query && typeof req.query === 'object') {
    sanitizeInPlace(req.query);
  }

  // Sanitize URL params in-place (req.params is a read-only getter in Express 5)
  if (req.params && typeof req.params === 'object') {
    sanitizeInPlace(req.params);
  }

  next();
}

/**
 * Sanitize values in-place on a read-only object (e.g. req.query, req.params in Express 5)
 * Mutates string values on the existing object without reassigning the object itself.
 */
function sanitizeInPlace(obj: any): void {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      obj[key] = sanitizeString(val);
    } else if (Array.isArray(val)) {
      obj[key] = val.map((item: any) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (typeof val === 'object' && val !== null) {
      sanitizeInPlace(val);
    }
  }
}

/**
 * Recursively sanitize an object (returns a new copy — safe for writable properties like req.body)
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
}

/**
 * Sanitize a string by removing null bytes and normalizing
 */
function sanitizeString(str: string): string {
  return str
    .replace(/\0/g, '') // Remove null bytes
    .replace(/\r\n/g, '\n') // Normalize line endings
    .trim();
}