//server\user-service\src\utils\crypto.ts
import crypto from 'crypto';

export function generateToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
